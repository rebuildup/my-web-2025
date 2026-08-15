use axum::{
    body::Body,
    extract::{DefaultBodyLimit, Query, State},
    http::{header, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Json, Router,
};
use base64::{engine::general_purpose::STANDARD, Engine as _};
use serde::{Deserialize, Serialize};
use sqlx::{
    sqlite::{SqliteConnectOptions, SqliteJournalMode, SqliteSynchronous},
    SqlitePool,
};
use std::{
    path::{Path, PathBuf},
    str::FromStr,
    sync::Arc,
};
use thiserror::Error;
use tracing::warn;
use uuid::Uuid;

#[derive(Error, Debug, Serialize)]
pub enum MediaError {
    #[error("Database error")]
    Database,
    #[error("Media not found")]
    NotFound,
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

impl axum::response::IntoResponse for MediaError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            MediaError::NotFound => StatusCode::NOT_FOUND,
            MediaError::InvalidInput(_) => StatusCode::BAD_REQUEST,
            MediaError::Database => StatusCode::INTERNAL_SERVER_ERROR,
        };

        (
            status,
            Json(serde_json::json!({ "error": self.to_string() })),
        )
            .into_response()
    }
}

impl From<sqlx::Error> for MediaError {
    fn from(_: sqlx::Error) -> Self {
        MediaError::Database
    }
}

#[derive(Debug, Deserialize)]
pub struct MediaQuery {
    #[serde(rename = "contentId")]
    pub content_id: String,
    #[serde(rename = "id")]
    pub media_id: Option<String>,
    pub raw: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateMediaRequest {
    pub id: Option<String>,
    #[serde(rename = "contentId")]
    pub content_id: String,
    pub filename: String,
    #[serde(rename = "mimeType")]
    pub mime_type: String,
    #[serde(rename = "base64Data")]
    pub base64_data: String,
    pub alt: Option<String>,
    pub description: Option<String>,
    pub tags: Option<Vec<String>>,
    pub width: Option<i64>,
    pub height: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct DeleteMediaQuery {
    #[serde(rename = "contentId")]
    pub content_id: String,
    #[serde(rename = "id")]
    pub media_id: String,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct MediaListItem {
    pub id: String,
    pub content_id: String,
    pub filename: String,
    pub mime_type: String,
    pub size: i64,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub alt: Option<String>,
    pub description: Option<String>,
    /// Raw JSON-array string from `media.tags` in the per-content DB. Held
    /// only so we can deserialize it; not exposed in the response JSON.
    #[serde(skip_serializing)]
    #[sqlx(rename = "tags")]
    pub tags_text: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    /// Parsed `tags_text`, emitted to the browser as the `tags` key.
    #[serde(skip_serializing_if = "Option::is_none")]
    #[sqlx(skip)]
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, sqlx::FromRow)]
struct MediaBlobRow {
    pub id: String,
    pub content_id: String,
    pub filename: String,
    pub mime_type: String,
    pub size: i64,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub alt: Option<String>,
    pub description: Option<String>,
    /// Raw JSON-array string from `media.tags` in the per-content DB.
    #[sqlx(rename = "tags")]
    pub tags_text: Option<String>,
    pub data: Vec<u8>,
    pub created_at: String,
    pub updated_at: String,
}

impl MediaListItem {
    fn normalize(mut self) -> Self {
        self.tags = self
            .tags_text
            .as_deref()
            .and_then(|value| serde_json::from_str(value).ok());
        self
    }
}

/// State carried by the media router.
///
/// `content_data_dir` is the per-content SQLite directory (`data/contents/`).
/// Both reads and writes go directly to per-content DBs so the served bytes
/// always reflect the latest edit, independent of any sync script. This
/// matches the 1-item-1-DB architecture declared in
/// `docs/adr/0004-distributed-sqlite-cms.md`.
#[derive(Clone)]
struct MediaState {
    content_data_dir: Arc<PathBuf>,
}

pub fn router(content_data_dir: PathBuf) -> Router {
    Router::new()
        .route(
            "/",
            get(get_media_or_list)
                .post(create_media)
                .delete(delete_media),
        )
        .layer(DefaultBodyLimit::max(64 * 1024 * 1024))
        .with_state(MediaState {
            content_data_dir: Arc::new(content_data_dir),
        })
}

/// Validate a content id and return a sanitized version safe for use in
/// `content-{sanitized}.db` filenames. Mirrors `getContentDbPath` in
/// `src/cms/lib/content-db-manager.ts`. Rejects traversal attempts and
/// embedded separators so `..` can never escape `content_data_dir`.
fn validate_content_id(id: &str) -> Option<String> {
    let trimmed = id.trim();
    if trimmed.is_empty() || trimmed.contains(['/', '\\', '\0']) {
        return None;
    }
    if trimmed.starts_with('.') || trimmed.contains("..") {
        return None;
    }
    let sanitized: String = trimmed
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '_' || c == '-' {
                c
            } else {
                '_'
            }
        })
        .collect();
    Some(sanitized)
}

/// Resolve the per-content DB path for **reads**. Returns None if the file
/// does not exist (callers surface `MediaError::NotFound`).
fn resolve_content_db_path(dir: &Path, id: &str) -> Option<PathBuf> {
    let sanitized = validate_content_id(id)?;
    let path = dir.join(format!("content-{sanitized}.db"));
    if path.is_file() {
        Some(path)
    } else {
        None
    }
}

/// Resolve the per-content DB path for **writes**. Always returns Some when
/// validation passes; the file may not exist yet (the writable pool will
/// create it).
fn resolve_content_db_path_for_write(dir: &Path, id: &str) -> Option<PathBuf> {
    validate_content_id(id).map(|sanitized| dir.join(format!("content-{sanitized}.db")))
}

async fn open_content_db(path: &Path) -> Result<SqlitePool, sqlx::Error> {
    let url = format!("sqlite://{}?mode=ro", path.display());
    let options = SqliteConnectOptions::from_str(&url)?
        .create_if_missing(false)
        .journal_mode(SqliteJournalMode::Wal)
        .read_only(true)
        .synchronous(SqliteSynchronous::Normal)
        .busy_timeout(std::time::Duration::from_secs(5));
    let pool = SqlitePool::connect_with(options).await?;
    sqlx::query("PRAGMA query_only = ON")
        .execute(&pool)
        .await
        .ok();
    Ok(pool)
}

/// Open (or create) a per-content DB in read-write mode for inserts and
/// deletes. Mirrors Bun's `getContentDb` settings: WAL journal mode, normal
/// synchronous, 5s busy_timeout. Does NOT set `read_only` or `query_only` so
/// writes are permitted.
async fn open_content_db_writable(path: &Path) -> Result<SqlitePool, sqlx::Error> {
    let url = format!("sqlite://{}?mode=rwc", path.display());
    let options = SqliteConnectOptions::from_str(&url)?
        .create_if_missing(true)
        .journal_mode(SqliteJournalMode::Wal)
        .synchronous(SqliteSynchronous::Normal)
        .busy_timeout(std::time::Duration::from_secs(5));
    let pool = SqlitePool::connect_with(options).await?;
    Ok(pool)
}

/// Idempotently install the per-content schema into a freshly-opened writable
/// DB. Statements come from `per_content_schema.sql` which mirrors Bun's
/// `initializeContentDbSchema` + `ensureManualDatesTable` + `ensureMediaTable`
/// byte-for-byte. We use `sqlx::raw_sql` so `CREATE TRIGGER ... BEGIN ... END;`
/// blocks survive execution (a naive `split(';')` would split inside trigger
/// bodies and corrupt them).
async fn ensure_content_db_schema(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    const SCHEMA_SQL: &str = include_str!("../db/per_content_schema.sql");
    sqlx::raw_sql(SCHEMA_SQL).execute(pool).await?;
    Ok(())
}

/// Ensure a `contents` row exists for the given id. Mirrors `ensureContentRow`
/// in `src/cms/lib/media-manager.ts`. The stub row satisfies the FK on
/// `media.content_id REFERENCES contents(id) ON DELETE CASCADE` and is later
/// overwritten by Bun's `saveFullContent` with the real content payload.
async fn ensure_content_row(pool: &SqlitePool, content_id: &str) -> Result<(), sqlx::Error> {
    let exists: Option<(i64,)> = sqlx::query_as("SELECT 1 FROM contents WHERE id = ?")
        .bind(content_id)
        .fetch_optional(pool)
        .await?;
    if exists.is_some() {
        return Ok(());
    }
    let now = chrono::Utc::now().to_rfc3339();
    sqlx::query(
        "INSERT INTO contents (id, title, summary, lang, visibility, status, published_at, created_at, updated_at) VALUES (?, ?, NULL, 'ja', 'draft', 'draft', NULL, ?, ?)",
    )
    .bind(content_id)
    .bind(content_id)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await?;
    Ok(())
}

async fn get_media_or_list(
    State(state): State<MediaState>,
    Query(query): Query<MediaQuery>,
) -> Result<Response, MediaError> {
    if query.content_id.trim().is_empty() {
        return Err(MediaError::InvalidInput(
            "contentId is required".to_string(),
        ));
    }

    let db_path = resolve_content_db_path(&state.content_data_dir, query.content_id.trim())
        .ok_or(MediaError::NotFound)?;
    let pool = open_content_db(&db_path).await.map_err(|err| {
        warn!(content_db = %db_path.display(), error = %err, "failed to open per-content DB");
        MediaError::Database
    })?;

    if let Some(media_id) = query.media_id.as_ref() {
        let row = sqlx::query_as::<_, MediaBlobRow>(
            r#"
            SELECT id, content_id, filename, mime_type, size, width, height, alt, description, tags, data, created_at, updated_at
            FROM media
            WHERE id = ?
            LIMIT 1
            "#,
        )
        .bind(media_id)
        .fetch_optional(&pool)
        .await?
        .ok_or(MediaError::NotFound)?;

        let tags: Option<Vec<String>> = row
            .tags_text
            .as_deref()
            .and_then(|value| serde_json::from_str(value).ok());

        let raw = matches!(query.raw.as_deref(), Some("1" | "true"));
        if raw {
            return Response::builder()
                .status(StatusCode::OK)
                .header(
                    header::CONTENT_TYPE,
                    HeaderValue::from_str(&row.mime_type)
                        .unwrap_or(HeaderValue::from_static("application/octet-stream")),
                )
                .header(header::CACHE_CONTROL, "public, max-age=31536000, immutable")
                .body(Body::from(row.data))
                .map_err(|_| MediaError::Database);
        }

        let payload = serde_json::json!({
            "id": row.id,
            "contentId": row.content_id,
            "filename": row.filename,
            "mimeType": row.mime_type,
            "size": row.size,
            "width": row.width,
            "height": row.height,
            "alt": row.alt,
            "description": row.description,
            "tags": tags,
            "createdAt": row.created_at,
            "updatedAt": row.updated_at,
            "base64": STANDARD.encode(row.data),
        });

        return Ok(Json(payload).into_response());
    }

    let items = sqlx::query_as::<_, MediaListItem>(
        r#"
        SELECT id, content_id, filename, mime_type, size, width, height, alt, description, tags, created_at, updated_at
        FROM media
        ORDER BY created_at DESC
        "#,
    )
    .fetch_all(&pool)
    .await?
    .into_iter()
    .map(MediaListItem::normalize)
    .collect::<Vec<_>>();

    Ok(Json(serde_json::to_value(items).map_err(|_| MediaError::Database)?).into_response())
}

/// Shared write-path implementation. Extracted so tests can call it without
/// constructing an axum extractor.
async fn create_media_impl(
    state: &MediaState,
    payload: CreateMediaRequest,
) -> Result<Json<serde_json::Value>, MediaError> {
    if payload.content_id.trim().is_empty() {
        return Err(MediaError::InvalidInput(
            "contentId is required".to_string(),
        ));
    }
    if payload.filename.trim().is_empty() {
        return Err(MediaError::InvalidInput("filename is required".to_string()));
    }
    if payload.mime_type.trim().is_empty() {
        return Err(MediaError::InvalidInput("mimeType is required".to_string()));
    }

    let data = STANDARD
        .decode(payload.base64_data.as_bytes())
        .map_err(|_| MediaError::InvalidInput("Invalid base64 data".to_string()))?;
    let media_id = payload.id.clone().unwrap_or_else(|| {
        format!(
            "media_{}_{}",
            chrono::Utc::now().timestamp_millis(),
            Uuid::new_v4().simple()
        )
    });
    let tags_json = payload
        .tags
        .as_ref()
        .map(serde_json::to_string)
        .transpose()
        .map_err(|_| MediaError::Database)?;

    let db_path =
        resolve_content_db_path_for_write(&state.content_data_dir, payload.content_id.trim())
            .ok_or_else(|| MediaError::InvalidInput("invalid contentId".to_string()))?;
    let pool = open_content_db_writable(&db_path).await.map_err(|err| {
        warn!(content_db = %db_path.display(), error = %err, "failed to open per-content DB for write");
        MediaError::Database
    })?;
    ensure_content_db_schema(&pool).await?;
    ensure_content_row(&pool, &payload.content_id).await?;

    sqlx::query(
        r#"
        INSERT OR REPLACE INTO media (id, content_id, filename, mime_type, size, width, height, alt, description, tags, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&media_id)
    .bind(&payload.content_id)
    .bind(&payload.filename)
    .bind(&payload.mime_type)
    .bind(data.len() as i64)
    .bind(payload.width)
    .bind(payload.height)
    .bind(&payload.alt)
    .bind(&payload.description)
    .bind(tags_json)
    .bind(data)
    .bind(chrono::Utc::now().to_rfc3339())
    .bind(chrono::Utc::now().to_rfc3339())
    .execute(&pool)
    .await?;

    Ok(Json(serde_json::json!({ "ok": true, "id": media_id })))
}

async fn create_media(
    State(state): State<MediaState>,
    Json(payload): Json<CreateMediaRequest>,
) -> Result<Json<serde_json::Value>, MediaError> {
    create_media_impl(&state, payload).await
}

/// Shared delete-path implementation. Extracted so tests can call it without
/// constructing an axum extractor.
async fn delete_media_impl(
    state: &MediaState,
    query: DeleteMediaQuery,
) -> Result<Json<serde_json::Value>, MediaError> {
    if query.content_id.trim().is_empty() {
        return Err(MediaError::InvalidInput(
            "contentId is required".to_string(),
        ));
    }
    if query.media_id.trim().is_empty() {
        return Err(MediaError::InvalidInput("id is required".to_string()));
    }

    let db_path =
        resolve_content_db_path_for_write(&state.content_data_dir, query.content_id.trim())
            .ok_or_else(|| MediaError::InvalidInput("invalid contentId".to_string()))?;
    let pool = open_content_db_writable(&db_path).await.map_err(|err| {
        warn!(content_db = %db_path.display(), error = %err, "failed to open per-content DB for delete");
        MediaError::Database
    })?;
    ensure_content_db_schema(&pool).await?;

    let result = sqlx::query("DELETE FROM media WHERE id = ? AND content_id = ?")
        .bind(&query.media_id)
        .bind(&query.content_id)
        .execute(&pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(MediaError::NotFound);
    }

    Ok(Json(serde_json::json!({ "ok": true })))
}

async fn delete_media(
    State(state): State<MediaState>,
    Query(query): Query<DeleteMediaQuery>,
) -> Result<Json<serde_json::Value>, MediaError> {
    delete_media_impl(&state, query).await
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn tmp_dir() -> PathBuf {
        std::env::temp_dir().join(format!("cms-api-media-test-{}", Uuid::new_v4().simple()))
    }

    fn make_state(dir: &Path) -> MediaState {
        MediaState {
            content_data_dir: Arc::new(dir.to_path_buf()),
        }
    }

    fn tiny_png_base64() -> &'static str {
        // 1x1 black PNG, 67 bytes decoded.
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }

    fn base_payload(content_id: &str) -> CreateMediaRequest {
        CreateMediaRequest {
            id: None,
            content_id: content_id.to_string(),
            filename: "pixel.png".to_string(),
            mime_type: "image/png".to_string(),
            base64_data: tiny_png_base64().to_string(),
            alt: Some("alt".to_string()),
            description: None,
            tags: None,
            width: Some(1),
            height: Some(1),
        }
    }

    #[test]
    fn resolve_content_db_path_rejects_traversal() {
        let dir = tmp_dir();
        std::fs::create_dir_all(&dir).unwrap();

        assert!(resolve_content_db_path(&dir, "../etc/passwd").is_none());
        assert!(resolve_content_db_path(&dir, "sub/dir").is_none());
        assert!(resolve_content_db_path(&dir, "").is_none());
        assert!(resolve_content_db_path(&dir, "ok").is_none()); // file doesn't exist

        let target = dir.join("content-real.db");
        std::fs::write(&target, b"").unwrap();
        let resolved = resolve_content_db_path(&dir, "real").unwrap();
        // canonicalize() adds a `\\?\` UNC prefix on Windows; compare the
        // suffix instead of the verbatim path.
        assert!(
            resolved.ends_with("content-real.db"),
            "expected suffix content-real.db, got {}",
            resolved.display()
        );

        std::fs::remove_dir_all(&dir).ok();
    }

    #[tokio::test]
    async fn create_media_bootstraps_missing_per_content_db() {
        let dir = tmp_dir();
        std::fs::create_dir_all(&dir).unwrap();
        let state = make_state(&dir);

        let res = create_media_impl(&state, base_payload("icon-tegaki-anime")).await;
        let json = res.expect("create_media should succeed").0;
        assert_eq!(json["ok"], serde_json::Value::Bool(true));
        let media_id = json["id"].as_str().expect("id present").to_string();
        assert!(media_id.starts_with("media_"));

        // DB now exists with the canonical per-content schema.
        let db_path = dir.join("content-icon-tegaki-anime.db");
        assert!(db_path.is_file(), "per-content DB should be created");

        let read_pool = open_content_db(&db_path).await.expect("read pool");
        let table_count: (i64,) =
            sqlx::query_as("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
                .fetch_one(&read_pool)
                .await
                .unwrap();
        assert!(
            table_count.0 >= 5,
            "expected at least 5 tables, got {}",
            table_count.0
        );

        let stub: (String, String) = sqlx::query_as("SELECT id, status FROM contents WHERE id = ?")
            .bind("icon-tegaki-anime")
            .fetch_one(&read_pool)
            .await
            .unwrap();
        assert_eq!(stub.0, "icon-tegaki-anime");
        assert_eq!(stub.1, "draft");

        std::fs::remove_dir_all(&dir).ok();
    }

    #[tokio::test]
    async fn create_media_writes_to_existing_per_content_db() {
        let dir = tmp_dir();
        std::fs::create_dir_all(&dir).unwrap();
        // Pre-create the DB so we exercise the "already exists" path.
        std::fs::write(dir.join("content-kakumei.db"), b"").unwrap();
        let state = make_state(&dir);

        let json = create_media_impl(&state, base_payload("kakumei"))
            .await
            .expect("create_media should succeed")
            .0;
        let media_id = json["id"].as_str().unwrap().to_string();

        let read_pool = open_content_db(&dir.join("content-kakumei.db"))
            .await
            .expect("read pool");
        let row: (String, String, Option<String>, Option<i64>, Option<i64>) = sqlx::query_as(
            "SELECT id, content_id, filename, width, height FROM media WHERE id = ?",
        )
        .bind(&media_id)
        .fetch_one(&read_pool)
        .await
        .unwrap();
        assert_eq!(row.0, media_id);
        assert_eq!(row.1, "kakumei");
        assert_eq!(row.2.as_deref(), Some("pixel.png"));
        assert_eq!(row.3, Some(1));
        assert_eq!(row.4, Some(1));

        std::fs::remove_dir_all(&dir).ok();
    }

    #[tokio::test]
    async fn create_media_persists_tags_as_json_string() {
        let dir = tmp_dir();
        std::fs::create_dir_all(&dir).unwrap();
        let state = make_state(&dir);

        let mut payload = base_payload("tag-test");
        payload.tags = Some(vec!["alpha".into(), "beta".into()]);
        let json = create_media_impl(&state, payload).await.unwrap().0;
        let media_id = json["id"].as_str().unwrap().to_string();

        let read_pool = open_content_db(&dir.join("content-tag-test.db"))
            .await
            .expect("read pool");
        let tags_text: Option<String> = sqlx::query_scalar("SELECT tags FROM media WHERE id = ?")
            .bind(&media_id)
            .fetch_one(&read_pool)
            .await
            .unwrap();
        let tags_text = tags_text.expect("tags column populated");
        let parsed: Vec<String> = serde_json::from_str(&tags_text).unwrap();
        assert_eq!(parsed, vec!["alpha", "beta"]);

        std::fs::remove_dir_all(&dir).ok();
    }

    #[tokio::test]
    async fn delete_media_removes_only_target_row() {
        let dir = tmp_dir();
        std::fs::create_dir_all(&dir).unwrap();
        let state = make_state(&dir);

        let a = create_media_impl(&state, base_payload("multi"))
            .await
            .unwrap()
            .0;
        let b = create_media_impl(&state, base_payload("multi"))
            .await
            .unwrap()
            .0;
        let id_a = a["id"].as_str().unwrap().to_string();
        let id_b = b["id"].as_str().unwrap().to_string();
        assert_ne!(id_a, id_b);

        let del = delete_media_impl(
            &state,
            DeleteMediaQuery {
                content_id: "multi".to_string(),
                media_id: id_a.clone(),
            },
        )
        .await
        .expect("delete should succeed");
        assert_eq!(del.0["ok"], serde_json::Value::Bool(true));

        let read_pool = open_content_db(&dir.join("content-multi.db"))
            .await
            .expect("read pool");
        let survivors: Vec<(String,)> =
            sqlx::query_as("SELECT id FROM media WHERE content_id = ? ORDER BY id")
                .bind("multi")
                .fetch_all(&read_pool)
                .await
                .unwrap();
        assert_eq!(survivors.len(), 1);
        assert_eq!(survivors[0].0, id_b);

        std::fs::remove_dir_all(&dir).ok();
    }

    #[tokio::test]
    async fn delete_media_returns_not_found_for_missing_row() {
        let dir = tmp_dir();
        std::fs::create_dir_all(&dir).unwrap();
        let state = make_state(&dir);
        // Pre-create the DB so delete_media doesn't create one as a side effect.
        std::fs::write(dir.join("content-missing.db"), b"").unwrap();

        let res = delete_media_impl(
            &state,
            DeleteMediaQuery {
                content_id: "missing".to_string(),
                media_id: "media_does_not_exist".to_string(),
            },
        )
        .await;
        assert!(matches!(res, Err(MediaError::NotFound)));

        std::fs::remove_dir_all(&dir).ok();
    }

    #[tokio::test]
    async fn per_content_schema_matches_bun_construction() {
        // Drift detector: open a fresh writable per-content DB through Rust
        // and verify the resulting `sqlite_master` lists the expected tables
        // + columns. If Bun's `initializeContentDbSchema` ever changes, this
        // test must be updated in lockstep.
        let dir = tmp_dir();
        std::fs::create_dir_all(&dir).unwrap();
        let db_path = dir.join("content-drift-test.db");
        let pool = open_content_db_writable(&db_path).await.unwrap();
        ensure_content_db_schema(&pool).await.unwrap();

        let table_names: Vec<String> =
            sqlx::query_scalar("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
                .fetch_all(&pool)
                .await
                .unwrap();
        for required in [
            "contents",
            "content_tags",
            "content_relations",
            "content_assets",
            "content_links",
            "markdown_pages",
            "manual_dates",
            "media",
        ] {
            assert!(
                table_names.contains(&required.to_string()),
                "missing table {required}, got {table_names:?}"
            );
        }

        let media_columns: Vec<String> =
            sqlx::query_scalar("SELECT name FROM pragma_table_info('media') ORDER BY cid")
                .fetch_all(&pool)
                .await
                .unwrap();
        assert_eq!(
            media_columns,
            vec![
                "id".to_string(),
                "content_id".to_string(),
                "filename".to_string(),
                "mime_type".to_string(),
                "size".to_string(),
                "width".to_string(),
                "height".to_string(),
                "alt".to_string(),
                "description".to_string(),
                "tags".to_string(),
                "data".to_string(),
                "created_at".to_string(),
                "updated_at".to_string(),
            ],
            "media schema drift"
        );

        std::fs::remove_dir_all(&dir).ok();
    }
}
