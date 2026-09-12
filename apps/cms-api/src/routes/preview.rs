use axum::{
    extract::{Path, State},
    routing::get,
    Json, Router,
};
use serde::Serialize;
use thiserror::Error;

use crate::db::DbPool;

#[derive(Error, Debug, Serialize)]
pub enum PreviewError {
    #[error("Database error")]
    Database,
    #[error("Entry not found")]
    NotFound,
}

impl axum::response::IntoResponse for PreviewError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            PreviewError::NotFound => axum::http::StatusCode::NOT_FOUND,
            PreviewError::Database => axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        };
        (status, Json(serde_json::json!({"error": self.to_string()}))).into_response()
    }
}

impl From<sqlx::Error> for PreviewError {
    fn from(_: sqlx::Error) -> Self {
        PreviewError::Database
    }
}

// ============ Types ============

#[derive(Debug, Serialize)]
pub struct RoutePreview {
    pub path: String,
    pub entries: Vec<PreviewEntry>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct PreviewEntry {
    pub id: String,
    pub title: String,
    pub entry_type: String,
    pub status: String,
    pub slug: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct EntryPreview {
    pub id: String,
    pub title: String,
    pub entry_type: String,
    pub status: String,
    pub visibility: String,
    pub body_json: Option<String>,
}

// ============ Routes ============

// Preview surfaces unpublished drafts to admins only. The Sprint 2.2.0
// `f0f6aae2` commit added an `is_preview_path` carve-out inside
// `require_admin`, but the carve-out was never reached because this router
// was mounted without `require_admin` in `main.rs`. PR #433 review caught
// that gap; the middleware is now applied here so every preview GET (and
// any future preview write) demands a valid JWT.
pub fn router(pool: DbPool) -> Router {
    Router::new()
        .route("/routes/:path", get(preview_route))
        .route("/entries/:id", get(preview_entry))
        .route_layer(axum::middleware::from_fn(
            crate::routes::auth::require_admin,
        ))
        .with_state(pool)
}

/// Preview content at a specific route path
async fn preview_route(
    pool: State<DbPool>,
    Path(path): Path<String>,
) -> Result<Json<RoutePreview>, PreviewError> {
    // Find entries at this path
    let entries = sqlx::query_as::<_, PreviewEntry>(
        r#"
        SELECT id, title, type, status, slug
        FROM entries
        WHERE path = ? AND deleted_at IS NULL
        ORDER BY "order", created_at
        "#,
    )
    .bind(&path)
    .fetch_all(&*pool)
    .await?;

    Ok(Json(RoutePreview { path, entries }))
}

/// Preview a single entry with full body content
async fn preview_entry(
    pool: State<DbPool>,
    Path(id): Path<String>,
) -> Result<Json<EntryPreview>, PreviewError> {
    // Get latest revision
    let entry = sqlx::query_as::<_, (String, String, String, String, String, Option<String>)>(
        r#"
        SELECT e.id, e.title, e.type, e.status, e.visibility,
               (
                   SELECT er.body_json FROM entry_revisions er
                   WHERE er.entry_id = e.id
                   ORDER BY er.version DESC LIMIT 1
               ) as body_json
        FROM entries e
        WHERE e.id = ? AND e.deleted_at IS NULL
        "#,
    )
    .bind(&id)
    .fetch_optional(&*pool)
    .await?
    .ok_or(PreviewError::NotFound)?;

    let (id, title, entry_type, status, visibility, body_json) = entry;

    Ok(Json(EntryPreview {
        id,
        title,
        entry_type,
        status,
        visibility,
        body_json,
    }))
}
