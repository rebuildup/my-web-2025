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
    // Implementation in Task 11.
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