//! R2 (S3-compatible) hydration and write-back for per-content SQLite databases.
//!
//! Container boot pulls `contents/*.db*` from R2 into a local directory.
//! While running, every 30 seconds the module diff-uploads modified files
//! back to R2. Graceful shutdown performs a final flush.

// Phase B scaffold: bodies land in Task 11/12, callers in Task 13.
// The `dead_code` allowance is removed once `main.rs` references these symbols.
#![allow(dead_code, unused_variables)]

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

use anyhow::{Context, Result};
use aws_sdk_s3::Client as S3Client;
use tokio::fs;
use tracing::{info, warn};

pub const R2_KEY_PREFIX: &str = "contents/";

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
            let rel = match key.strip_prefix(R2_KEY_PREFIX) {
                Some(r) => r,
                None => continue,
            };
            let local_path = config.local_dir.join(rel);
            if let Some(parent) = local_path.parent() {
                fs::create_dir_all(parent).await?;
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

pub async fn write_back(
    _client: &S3Client,
    _config: &R2Config,
    _state: &mut SyncState,
) -> Result<()> {
    // Implementation in Task 12.
    Ok(())
}

pub async fn shutdown(
    _client: &S3Client,
    _config: &R2Config,
    _state: &mut SyncState,
) -> Result<()> {
    warn!("R2 sync: graceful shutdown, flushing");
    write_back(_client, _config, _state).await
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