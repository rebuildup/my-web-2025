//! R2 (S3-compatible) hydration and write-back for per-content SQLite databases.
//!
//! Container boot pulls `contents/*.db*` from R2 into a local directory.
//! While running, every 30 seconds the module diff-uploads modified files
//! back to R2. Graceful shutdown performs a final flush.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

use anyhow::{Context, Result};
use aws_sdk_s3::Client as S3Client;
use tokio::fs;
use tracing::{info, warn};

pub const R2_KEY_PREFIX: &str = "contents/";

/// Strip the configured R2 key prefix and return the relative path under
/// `R2Config.local_dir`. Returns `None` for keys that don't have the prefix,
/// resolve to an empty relative path (e.g. R2's `contents/` zero-byte
/// "directory marker" object, which would otherwise make `hydrate` try to
/// write 0 bytes onto `local_dir` itself and fail), or contain a traversal
/// segment (`..`, `.`), an absolute path, or a backslash. The traversal /
/// absolute-path check is the path-traversal guard for `hydrate`: without
/// it, an R2 key like `contents/../../etc/passwd` would resolve to a path
/// outside `local_dir` and overwrite arbitrary files on the host.
pub(crate) fn rel_path_from_key(key: &str) -> Option<&str> {
    let rel = key.strip_prefix(R2_KEY_PREFIX)?;
    if rel.is_empty() {
        return None;
    }
    if rel.starts_with('/') || rel.starts_with('\\') {
        return None;
    }
    for seg in rel.split(['/', '\\']) {
        if seg.is_empty() || seg == "." || seg == ".." {
            return None;
        }
    }
    Some(rel)
}

/// Resolve `key` to an absolute path under `config.local_dir` after the same
/// traversal / absolute-path guard as [`rel_path_from_key`]. This is the
/// single chokepoint `hydrate` uses to turn an attacker-controlled R2 key
/// into a filesystem write target — every other call site that takes an
/// R2 key as input should funnel through this helper.
pub(crate) fn safe_local_path(root: &Path, key: &str) -> Option<PathBuf> {
    let rel = rel_path_from_key(key)?;
    Some(root.join(rel))
}

#[derive(Debug, Clone)]
pub struct R2Config {
    pub bucket: String,
    pub local_dir: PathBuf,
}

#[derive(Debug, Default)]
pub struct SyncState {
    pub last_synced: HashMap<String, SystemTime>,
}

impl SyncState {
    pub fn new() -> Self {
        Self::default()
    }
}

pub async fn hydrate(client: &S3Client, config: &R2Config) -> Result<()> {
    fs::create_dir_all(&config.local_dir)
        .await
        .with_context(|| format!("create local dir {:?}", config.local_dir))?;
    info!(
        bucket = %config.bucket,
        local_dir = ?config.local_dir,
        "R2 hydrate start"
    );

    let mut continuation: Option<String> = None;
    loop {
        let mut req = client
            .list_objects_v2()
            .bucket(&config.bucket)
            .prefix(R2_KEY_PREFIX);
        if let Some(token) = continuation.as_ref() {
            req = req.continuation_token(token);
        }
        let resp = req.send().await.context("list R2 contents/")?;

        for obj in resp.contents() {
            let key = match obj.key() {
                Some(k) => k,
                None => continue,
            };
            let local_path = match safe_local_path(&config.local_dir, key) {
                Some(p) => p,
                None => {
                    warn!(key, "R2 hydrate: refusing suspicious key");
                    continue;
                }
            };
            if let Some(parent) = local_path.parent() {
                fs::create_dir_all(parent).await?;
            }
            // Belt-and-braces: even after the prefix + traversal guard above,
            // resolve symlinks / canonicalise the target and confirm it stays
            // under local_dir. Catches the case where an attacker plants a
            // symlink inside local_dir pointing at an arbitrary directory.
            let canon_root = match fs::canonicalize(&config.local_dir).await {
                Ok(p) => p,
                Err(e) => {
                    warn!(?e, "R2 hydrate: canonicalize local_dir failed");
                    continue;
                }
            };
            match fs::canonicalize(&local_path).await {
                Ok(canon) if canon.starts_with(&canon_root) => {}
                Ok(canon) => {
                    warn!(
                        ?canon,
                        ?canon_root,
                        "R2 hydrate: resolved path escaped local_dir"
                    );
                    continue;
                }
                Err(_) => {
                    // canonicalize fails for not-yet-existing paths. Try the
                    // parent which we just created above; if that resolves
                    // and still starts under canon_root, the missing file
                    // will be created inside local_dir and is safe to write.
                    let parent = local_path.parent().unwrap_or(&config.local_dir);
                    match fs::canonicalize(parent).await {
                        Ok(p) if p.starts_with(&canon_root) => {}
                        _ => {
                            warn!(?local_path, "R2 hydrate: parent canonicalize rejected");
                            continue;
                        }
                    }
                }
            }
            let body = client
                .get_object()
                .bucket(&config.bucket)
                .key(key)
                .send()
                .await
                .with_context(|| format!("get_object {key}"))?
                .body
                .collect()
                .await
                .context("collect body")?;
            fs::write(&local_path, body.into_bytes())
                .await
                .with_context(|| format!("write {local_path:?}"))?;
        }

        continuation = resp.next_continuation_token().map(|s| s.to_string());
        if continuation.is_none() {
            break;
        }
    }
    info!("R2 hydrate complete");
    Ok(())
}

pub async fn write_back(client: &S3Client, config: &R2Config, state: &mut SyncState) -> Result<()> {
    let mut entries = walk_dir(&config.local_dir).await?;
    let mut uploaded = 0usize;
    for entry in entries.drain(..) {
        let rel = entry
            .strip_prefix(&config.local_dir)
            .unwrap_or(&entry)
            .to_string_lossy()
            .replace('\\', "/");
        let key = format!("{R2_KEY_PREFIX}{rel}");

        let local_mtime = fs::metadata(&entry)
            .await
            .ok()
            .and_then(|m| m.modified().ok());
        let needs_upload = match (local_mtime, state.last_synced.get(&key)) {
            (Some(mt), Some(prev)) => mt > *prev,
            (Some(_), None) => true,
            _ => false,
        };
        if !needs_upload {
            continue;
        }

        let bytes = fs::read(&entry)
            .await
            .with_context(|| format!("read local {entry:?} for upload"))?;
        client
            .put_object()
            .bucket(&config.bucket)
            .key(&key)
            .body(bytes.into())
            .send()
            .await
            .with_context(|| format!("put_object {key}"))?;

        if let Some(mt) = local_mtime {
            state.last_synced.insert(key, mt);
        }
        uploaded += 1;
    }
    if uploaded > 0 {
        info!(uploaded, "R2 write-back complete");
    }
    Ok(())
}

pub async fn shutdown(client: &S3Client, config: &R2Config, state: &mut SyncState) -> Result<()> {
    warn!("R2 sync: graceful shutdown, flushing");
    write_back(client, config, state).await
}

/// Recursively collect regular files under `dir`. Used by `write_back` to
/// detect which local files need uploading.
pub(crate) async fn walk_dir(dir: &Path) -> Result<Vec<PathBuf>> {
    let mut out = Vec::new();
    let mut stack = vec![dir.to_path_buf()];
    while let Some(p) = stack.pop() {
        let mut rd = fs::read_dir(&p).await?;
        while let Some(ent) = rd.next_entry().await? {
            let path = ent.path();
            let ft = ent.file_type().await?;
            if ft.is_dir() {
                stack.push(path);
            } else if ft.is_file() {
                out.push(path);
            }
        }
    }
    Ok(out)
}

#[cfg(test)]
#[path = "mod_test.rs"]
mod tests;
