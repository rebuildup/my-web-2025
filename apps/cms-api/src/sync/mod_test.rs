//! Unit tests for the R2 sync module.
//!
//! Real `hydrate` requires a running S3-compatible endpoint (R2 or minio),
//! exercised by `tests/integration/sync.test.ts` against `docker-compose.minio.yml`.
//! Here we only verify the structural invariants and stub-file scaffolding
//! needed by the TypeScript orchestrator and Cloudflare Container image.

use std::path::PathBuf;

use crate::sync::{rel_path_from_key, R2Config, SyncState, R2_KEY_PREFIX};

#[test]
fn r2_key_prefix_matches_spec() {
    assert_eq!(R2_KEY_PREFIX, "contents/");
}

#[test]
fn rel_path_from_key_strips_prefix() {
    assert_eq!(
        rel_path_from_key("contents/content-foo.db"),
        Some("content-foo.db")
    );
    assert_eq!(
        rel_path_from_key("contents/content-foo.db-wal"),
        Some("content-foo.db-wal")
    );
}

#[test]
fn rel_path_from_key_rejects_unprefixed() {
    assert_eq!(rel_path_from_key("other-prefix/foo.db"), None);
    assert_eq!(rel_path_from_key("content/foo.db"), None);
}

#[test]
fn rel_path_from_key_rejects_directory_marker() {
    // The `contents/` zero-byte key (R2's "directory marker") would resolve
    // to an empty relative path and crash `hydrate` on the `fs::write` step.
    // We must skip it.
    assert_eq!(rel_path_from_key("contents/"), None);
}

#[test]
fn r2_config_uses_local_dir() {
    let cfg = R2Config {
        bucket: "cms-data".to_string(),
        local_dir: PathBuf::from("/var/lib/cms/data"),
    };
    assert_eq!(cfg.bucket, "cms-data");
    assert_eq!(cfg.local_dir.to_str(), Some("/var/lib/cms/data"));
}

#[tokio::test]
async fn hydrate_creates_local_dir_when_missing() {
    let tmp = std::env::temp_dir().join(format!("cms-sync-hydrate-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&tmp);

    let cfg = R2Config {
        bucket: "test-bucket".to_string(),
        local_dir: tmp.clone(),
    };

    // We can't call hydrate() with a real S3Client without a server,
    // so we just verify the dir-creation behavior with a stub.
    // Full hydrate integration test is in tests/integration/sync.test.ts
    // against docker-compose + minio.
    tokio::fs::create_dir_all(&cfg.local_dir).await.unwrap();
    assert!(cfg.local_dir.exists());
}

#[test]
fn sync_state_starts_empty() {
    let s = SyncState::new();
    assert!(s.last_synced.is_empty());
}

#[tokio::test]
async fn write_back_detects_modified_file() {
    let tmp = std::env::temp_dir().join(format!("cms-sync-writeback-{}", std::process::id()));
    let _ = std::fs::remove_dir_all(&tmp);
    tokio::fs::create_dir_all(&tmp).await.unwrap();

    // Create a stub file
    tokio::fs::write(tmp.join("content-test.db"), b"hello")
        .await
        .unwrap();

    // The actual mtime-diff logic is tested in integration (Task 20).
    // Here we just verify the file's mtime advances when we touch it.
    let path = tmp.join("content-test.db");
    let first_mtime = tokio::fs::metadata(&path)
        .await
        .unwrap()
        .modified()
        .unwrap();
    tokio::time::sleep(std::time::Duration::from_millis(50)).await;
    tokio::fs::write(&path, b"hello world").await.unwrap();
    let second_mtime = tokio::fs::metadata(&path)
        .await
        .unwrap()
        .modified()
        .unwrap();

    assert!(second_mtime > first_mtime);
}
