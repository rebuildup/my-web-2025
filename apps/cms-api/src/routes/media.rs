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
use thiserror::Error;
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

        (status, Json(serde_json::json!({ "error": self.to_string() }))).into_response()
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
    #[sqlx(rename = "entry_id")]
    pub content_id: String,
    pub filename: String,
    pub mime_type: String,
    pub size: i64,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub alt: Option<String>,
    pub description: Option<String>,
    #[serde(skip_serializing)]
    pub tags_json: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[sqlx(skip)]
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, sqlx::FromRow)]
struct MediaBlobRow {
    pub id: String,
    #[sqlx(rename = "entry_id")]
    pub content_id: String,
    pub filename: String,
    pub mime_type: String,
    pub size: i64,
    pub width: Option<i64>,
    pub height: Option<i64>,
    pub alt: Option<String>,
    pub description: Option<String>,
    pub tags_json: Option<String>,
    pub data: Vec<u8>,
    pub created_at: String,
    pub updated_at: String,
}

impl MediaListItem {
    fn normalize(mut self) -> Self {
        self.tags = self
            .tags_json
            .as_deref()
            .and_then(|value| serde_json::from_str(value).ok());
        self
    }
}

pub fn router(pool: DbPool) -> Router {
    Router::new()
        .route("/", get(get_media_or_list).post(create_media).delete(delete_media))
        .layer(DefaultBodyLimit::max(64 * 1024 * 1024))
        .with_state(pool)
}

async fn get_media_or_list(
    pool: State<DbPool>,
    Query(query): Query<MediaQuery>,
) -> Result<Response, MediaError> {
    if query.content_id.trim().is_empty() {
        return Err(MediaError::InvalidInput("contentId is required".to_string()));
    }

    if let Some(media_id) = query.media_id.as_ref() {
        let row = sqlx::query_as::<_, MediaBlobRow>(
            r#"
            SELECT id, entry_id, filename, mime_type, size, width, height, alt, description, tags_json, data, created_at, updated_at
            FROM media
            WHERE entry_id = ? AND id = ?
            LIMIT 1
            "#,
        )
        .bind(&query.content_id)
        .bind(media_id)
        .fetch_optional(&*pool)
        .await?
        .ok_or(MediaError::NotFound)?;

        let tags: Option<Vec<String>> = row
            .tags_json
            .as_deref()
            .and_then(|value| serde_json::from_str(value).ok());

        let raw = matches!(query.raw.as_deref(), Some("1" | "true"));
        if raw {
            return Ok(Response::builder()
                .status(StatusCode::OK)
                .header(
                    header::CONTENT_TYPE,
                    HeaderValue::from_str(&row.mime_type)
                        .unwrap_or(HeaderValue::from_static("application/octet-stream")),
                )
                .header(header::CACHE_CONTROL, "public, max-age=31536000, immutable")
                .body(Body::from(row.data))
                .map_err(|_| MediaError::Database)?);
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
        SELECT id, entry_id, filename, mime_type, size, width, height, alt, description, tags_json, created_at, updated_at
        FROM media
        WHERE entry_id = ?
        ORDER BY created_at DESC
        "#,
    )
    .bind(&query.content_id)
    .fetch_all(&*pool)
    .await?
    .into_iter()
    .map(MediaListItem::normalize)
    .collect::<Vec<_>>();

    Ok(Json(serde_json::to_value(items).map_err(|_| MediaError::Database)?).into_response())
}

async fn create_media(
    pool: State<DbPool>,
    Json(payload): Json<CreateMediaRequest>,
) -> Result<Json<serde_json::Value>, MediaError> {
    if payload.content_id.trim().is_empty() {
        return Err(MediaError::InvalidInput("contentId is required".to_string()));
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
    let media_id = payload
        .id
        .clone()
        .unwrap_or_else(|| format!("media_{}_{}", chrono::Utc::now().timestamp_millis(), Uuid::new_v4().simple()));
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
    .execute(&*pool)
    .await?;

    Ok(Json(serde_json::json!({ "ok": true, "id": media_id })))
}

async fn delete_media(
    pool: State<DbPool>,
    Query(query): Query<DeleteMediaQuery>,
) -> Result<Json<serde_json::Value>, MediaError> {
    let result = sqlx::query("DELETE FROM media WHERE entry_id = ? AND id = ?")
        .bind(&query.content_id)
        .bind(&query.media_id)
        .execute(&*pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(MediaError::NotFound);
    }

    Ok(Json(serde_json::json!({ "ok": true })))
}
