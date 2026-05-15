use axum::{
    extract::{Path, Query, State},
    routing::{delete, get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::SqlitePool;
use thiserror::Error;
use uuid::Uuid;

use crate::db::DbPool;

#[derive(Error, Debug, Serialize)]
pub enum EntryError {
    #[error("Database error")]
    Database,
    #[error("Entry not found")]
    NotFound,
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

impl axum::response::IntoResponse for EntryError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            EntryError::NotFound => axum::http::StatusCode::NOT_FOUND,
            EntryError::InvalidInput(_) => axum::http::StatusCode::BAD_REQUEST,
            EntryError::Database => axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        };
        (status, Json(serde_json::json!({"error": self.to_string()}))).into_response()
    }
}

// ============ Request/Response Types ============

#[derive(Debug, Deserialize)]
pub struct CreateEntryRequest {
    #[serde(default = "default_type")]
    pub entry_type: String,
    pub slug: Option<String>,
    pub status: Option<String>,
    pub visibility: Option<String>,
    pub title: Option<String>,
    pub summary: Option<String>,
    pub lang: Option<String>,
    pub path: Option<String>,
    pub depth: Option<i32>,
    pub order: Option<i32>,
    pub parent_id: Option<String>,
    pub published_at: Option<String>,
}

fn default_type() -> String {
    "portfolio".to_string()
}

#[derive(Debug, Deserialize)]
pub struct UpdateEntryRequest {
    pub entry_type: Option<String>,
    pub slug: Option<String>,
    pub status: Option<String>,
    pub visibility: Option<String>,
    pub title: Option<String>,
    pub summary: Option<String>,
    pub lang: Option<String>,
    pub path: Option<String>,
    pub depth: Option<i32>,
    pub order: Option<i32>,
    pub parent_id: Option<String>,
    pub published_at: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct EntryListItem {
    pub id: String,
    #[sqlx(rename = "type")]
    pub entry_type: String,
    pub status: String,
    pub visibility: String,
    pub title: String,
    pub summary: Option<String>,
    pub lang: String,
    pub published_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub slug: Option<String>,
    pub thumbnail: Option<String>,
    pub tags: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct EntryDetail {
    pub id: String,
    #[sqlx(rename = "type")]
    pub entry_type: String,
    pub status: String,
    pub visibility: String,
    pub title: String,
    pub summary: Option<String>,
    pub lang: String,
    pub path: Option<String>,
    pub depth: i32,
    pub order: i32,
    pub parent_id: Option<String>,
    pub published_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub slug: Option<String>,
}

// ============ Routes ============

pub fn router(pool: DbPool) -> Router {
    Router::new()
        .route("/", get(list_entries).post(create_entry))
        .route("/:id", get(get_entry).patch(update_entry).delete(delete_entry))
        .with_state(pool)
}

async fn list_entries(pool: State<DbPool>) -> Result<Json<Vec<EntryListItem>>, EntryError> {
    let entries = sqlx::query_as::<_, EntryListItem>(
        r#"
        SELECT id, type, status, visibility, title, summary, lang,
               published_at, created_at, updated_at, slug, thumbnail, tags
        FROM list_index
        ORDER BY created_at DESC
        "#,
    )
    .fetch_all(&*pool)
    .await?;

    Ok(Json(entries))
}

async fn create_entry(
    pool: State<DbPool>,
    Json(payload): Json<CreateEntryRequest>,
) -> Result<Json<EntryDetail>, EntryError> {
    let id = Uuid::new_v4().to_string();

    sqlx::query(
        r#"
        INSERT INTO entries (id, type, slug, status, visibility, title, summary, lang, path, depth, "order", parent_id, published_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&payload.entry_type)
    .bind(&payload.slug)
    .bind(payload.status.as_deref().unwrap_or("draft"))
    .bind(payload.visibility.as_deref().unwrap_or("draft"))
    .bind(&payload.title.clone().unwrap_or_default())
    .bind(&payload.summary)
    .bind(payload.lang.as_deref().unwrap_or("ja"))
    .bind(&payload.path)
    .bind(payload.depth.unwrap_or(0))
    .bind(payload.order.unwrap_or(0))
    .bind(&payload.parent_id)
    .bind(&payload.published_at)
    .execute(&*pool)
    .await?;

    get_entry(pool, Path(id)).await
}

async fn get_entry(pool: State<DbPool>, Path(id): Path<String>) -> Result<Json<EntryDetail>, EntryError> {
    let entry = sqlx::query_as::<_, EntryDetail>(
        r#"
        SELECT id, type, status, visibility, title, summary, lang, path, depth, "order",
               parent_id, published_at, created_at, updated_at, slug
        FROM entries
        WHERE id = ? AND deleted_at IS NULL
        "#,
    )
    .bind(&id)
    .fetch_optional(&*pool)
    .await?
    .ok_or(EntryError::NotFound)?;

    Ok(Json(entry))
}

async fn update_entry(
    pool: State<DbPool>,
    Path(id): Path<String>,
    Json(payload): Json<UpdateEntryRequest>,
) -> Result<Json<EntryDetail>, EntryError> {
    // Check entry exists
    let exists = sqlx::query("SELECT id FROM entries WHERE id = ? AND deleted_at IS NULL")
        .bind(&id)
        .fetch_optional(&*pool)
        .await?
        .is_some();

    if !exists {
        return Err(EntryError::NotFound);
    }

    // Build dynamic update query
    let mut query = String::from("UPDATE entries SET updated_at = datetime('now')");
    let mut bindings: Vec<String> = Vec::new();

    if let Some(ref v) = payload.entry_type {
        query.push_str(", type = ?");
        bindings.push(v.clone());
    }
    if let Some(ref v) = payload.slug {
        query.push_str(", slug = ?");
        bindings.push(v.clone());
    }
    if let Some(ref v) = payload.status {
        query.push_str(", status = ?");
        bindings.push(v.clone());
    }
    if let Some(ref v) = payload.visibility {
        query.push_str(", visibility = ?");
        bindings.push(v.clone());
    }
    if let Some(ref v) = payload.title {
        query.push_str(", title = ?");
        bindings.push(v.clone());
    }
    if let Some(ref v) = payload.summary {
        query.push_str(", summary = ?");
        bindings.push(v.clone());
    }
    if let Some(ref v) = payload.lang {
        query.push_str(", lang = ?");
        bindings.push(v.clone());
    }
    if let Some(ref v) = payload.path {
        query.push_str(", path = ?");
        bindings.push(v.clone());
    }
    if let Some(ref v) = payload.depth {
        query.push_str(", depth = ?");
        bindings.push(v.to_string());
    }
    if let Some(ref v) = payload.order {
        query.push_str(", \"order\" = ?");
        bindings.push(v.to_string());
    }
    if let Some(ref v) = payload.parent_id {
        query.push_str(", parent_id = ?");
        bindings.push(v.clone());
    }
    if let Some(ref v) = payload.published_at {
        query.push_str(", published_at = ?");
        bindings.push(v.clone());
    }

    query.push_str(" WHERE id = ?");
    bindings.push(id.clone());

    let mut q = sqlx::query(&query);
    for binding in &bindings {
        q = q.bind(binding);
    }

    q.execute(&*pool).await?;

    get_entry(pool, Path(id)).await
}

async fn delete_entry(
    pool: State<DbPool>,
    Path(id): Path<String>,
) -> Result<Json<serde_json::Value>, EntryError> {
    let result = sqlx::query("UPDATE entries SET deleted_at = datetime('now') WHERE id = ? AND deleted_at IS NULL")
        .bind(&id)
        .execute(&*pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(EntryError::NotFound);
    }

    Ok(Json(serde_json::json!({"message": "Entry deleted"})))
}