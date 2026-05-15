use axum::{
    extract::State,
    routing::{get, post},
    Json, Router,
};
use serde::Serialize;
use sqlx::SqlitePool;
use thiserror::Error;
use uuid::Uuid;

use crate::db::DbPool;

#[derive(Error, Debug, Serialize)]
pub enum TagError {
    #[error("Database error")]
    Database,
    #[error("Tag not found")]
    NotFound,
    #[error("Tag already exists")]
    AlreadyExists,
}

impl axum::response::IntoResponse for TagError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            TagError::NotFound => axum::http::StatusCode::NOT_FOUND,
            TagError::AlreadyExists => axum::http::StatusCode::CONFLICT,
            TagError::Database => axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        };
        (status, Json(serde_json::json!({"error": self.to_string()}))).into_response()
    }
}

impl From<sqlx::Error> for TagError {
    fn from(_: sqlx::Error) -> Self {
        TagError::Database
    }
}

// ============ Types ============

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub created_at: String,
}

#[derive(Debug, serde::Deserialize)]
pub struct CreateTagRequest {
    pub name: String,
    pub slug: Option<String>,
}

// ============ Routes ============

pub fn router(pool: DbPool) -> Router {
    Router::new()
        .route("/", get(list_tags).post(create_tag))
        .with_state(pool)
}

fn make_slug(name: &str) -> String {
    name.to_lowercase()
        .chars()
        .map(|c| if c.is_alphanumeric() { c } else { '-' })
        .collect::<String>()
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<_>>()
        .join("-")
}

async fn list_tags(pool: State<DbPool>) -> Result<Json<Vec<Tag>>, TagError> {
    let tags = sqlx::query_as::<_, Tag>("SELECT id, name, slug, created_at FROM tags ORDER BY name")
        .fetch_all(&*pool)
        .await?;

    Ok(Json(tags))
}

async fn create_tag(
    pool: State<DbPool>,
    Json(payload): Json<CreateTagRequest>,
) -> Result<Json<Tag>, TagError> {
    let id = Uuid::new_v4().to_string();
    let slug = payload.slug.unwrap_or_else(|| make_slug(&payload.name));

    // Check for duplicate
    let exists = sqlx::query("SELECT id FROM tags WHERE slug = ?")
        .bind(&slug)
        .fetch_optional(&*pool)
        .await?
        .is_some();

    if exists {
        return Err(TagError::AlreadyExists);
    }

    sqlx::query("INSERT INTO tags (id, name, slug) VALUES (?, ?, ?)")
        .bind(&id)
        .bind(&payload.name)
        .bind(&slug)
        .execute(&*pool)
        .await?;

    let tag = sqlx::query_as::<_, Tag>("SELECT id, name, slug, created_at FROM tags WHERE id = ?")
        .bind(&id)
        .fetch_one(&*pool)
        .await?;

    Ok(Json(tag))
}