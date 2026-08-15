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
    sqlite::{SqliteConnectOptions, SqliteJournalMode},
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

use crate::db::DbPool;

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
/// `content_data_dir` is the per-content SQLite directory (`data/contents/`)
/// used for **reads** so the served bytes always reflect the latest edit, even
/// if `bun run sync:cms-media` hasn't been run since the upload. `pool` still
/// points at the consolidated dev DB and is kept for the legacy write paths
/// (create/delete) so `scripts/sync-legacy-media-to-rust.ts` can keep using
/// the sync API until the consolidated DB is fully retired.
#[derive(Clone)]
struct MediaState {
    content_data_dir: Arc<PathBuf>,
    pool: DbPool,
}

pub fn router(content_data_dir: PathBuf, pool: DbPool) -> Router {
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
            pool,
        })
}

fn resolve_content_db_path(dir: &Path, id: &str) -> Option<PathBuf> {
    if id.is_empty() || id.contains(['/', '\\', '\0']) {
        return None;
    }
    let path = dir.join(format!("content-{id}.db"));
    if path.is_file() {
        Some(path)
    } else {
        None
    }
}

async fn open_content_db(path: &Path) -> Result<SqlitePool, sqlx::Error> {
    let url = format!("sqlite://{}?mode=ro", path.display());
    let options = SqliteConnectOptions::from_str(&url)?
        .create_if_missing(false)
        .journal_mode(SqliteJournalMode::Wal)
        .read_only(true)
        .synchronous(sqlx::sqlite::SqliteSynchronous::Normal)
        .busy_timeout(std::time::Duration::from_secs(5));
    let pool = SqlitePool::connect_with(options).await?;
    sqlx::query("PRAGMA query_only = ON")
        .execute(&pool)
        .await
        .ok();
    Ok(pool)
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

async fn create_media(
    State(state): State<MediaState>,
    Json(payload): Json<CreateMediaRequest>,
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

    sqlx::query(
        r#"
        INSERT OR REPLACE INTO media (id, entry_id, filename, mime_type, size, width, height, alt, description, tags_json, data, created_at, updated_at)
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
    .bind(payload.alt)
    .bind(payload.description)
    .bind(tags_json)
    .bind(data)
    .bind(chrono::Utc::now().to_rfc3339())
    .bind(chrono::Utc::now().to_rfc3339())
    .execute(&state.pool)
    .await?;

    Ok(Json(serde_json::json!({ "ok": true, "id": media_id })))
}

async fn delete_media(
    State(state): State<MediaState>,
    Query(query): Query<DeleteMediaQuery>,
) -> Result<Json<serde_json::Value>, MediaError> {
    let result = sqlx::query("DELETE FROM media WHERE entry_id = ? AND id = ?")
        .bind(&query.content_id)
        .bind(&query.media_id)
        .execute(&state.pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(MediaError::NotFound);
    }

    Ok(Json(serde_json::json!({ "ok": true })))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn tmp_dir() -> PathBuf {
        std::env::temp_dir().join(format!("cms-api-media-test-{}", Uuid::new_v4().simple()))
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
}
