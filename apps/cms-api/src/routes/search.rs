use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use serde::Serialize;
use thiserror::Error;

use crate::db::DbPool;

#[derive(Error, Debug, Serialize)]
pub enum SearchError {
    #[error("Database error")]
    Database,
    #[error("Query parameter 'q' is required")]
    MissingQuery,
}

impl axum::response::IntoResponse for SearchError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            SearchError::MissingQuery => axum::http::StatusCode::BAD_REQUEST,
            SearchError::Database => axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        };
        (status, Json(serde_json::json!({"error": self.to_string()}))).into_response()
    }
}

impl From<sqlx::Error> for SearchError {
    fn from(_: sqlx::Error) -> Self {
        SearchError::Database
    }
}

// ============ Types ============

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: String,
    pub entry_type: Option<String>,
    pub status: Option<String>,
    pub limit: Option<i64>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct SearchResult {
    pub id: String,
    pub title: String,
    pub summary: Option<String>,
    pub entry_type: String,
    pub status: String,
    pub thumbnail: Option<String>,
    pub tags: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct SuggestionResult {
    pub suggestions: Vec<String>,
}

// ============ Routes ============

pub fn router(pool: DbPool) -> Router {
    Router::new()
        .route("/", get(search))
        .route("/suggestions", get(suggestions))
        .with_state(pool)
}

async fn search(
    pool: State<DbPool>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Vec<SearchResult>>, SearchError> {
    if query.q.trim().is_empty() {
        return Err(SearchError::MissingQuery);
    }

    let like_query = format!("%{}%", query.q.trim());
    let entry_type = query.entry_type.as_deref();
    let status = query.status.as_deref().unwrap_or("published");
    let limit = query.limit.unwrap_or(50).clamp(1, 100);

    let results = sqlx::query_as::<_, SearchResult>(
        r#"
        SELECT id, title, summary, type AS entry_type, status, thumbnail, tags
        FROM list_index
        WHERE status = ?
          AND (? IS NULL OR type = ?)
          AND (
            title LIKE ?
            OR summary LIKE ?
            OR tags LIKE ?
          )
        ORDER BY COALESCE(published_at, updated_at, created_at) DESC
        LIMIT ?
        "#,
    )
    .bind(status)
    .bind(entry_type)
    .bind(entry_type)
    .bind(&like_query)
    .bind(&like_query)
    .bind(&like_query)
    .bind(limit)
    .fetch_all(&*pool)
    .await?;

    Ok(Json(results))
}

async fn suggestions(
    pool: State<DbPool>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<SuggestionResult>, SearchError> {
    if query.q.trim().is_empty() {
        return Ok(Json(SuggestionResult {
            suggestions: vec![],
        }));
    }

    // Get title matches as suggestions
    let suggestions = sqlx::query_scalar::<_, String>(
        r#"
        SELECT title FROM list_index
        WHERE title LIKE ? AND status = 'published'
        ORDER BY published_at DESC
        LIMIT 10
        "#,
    )
    .bind(format!("%{}%", query.q))
    .fetch_all(&*pool)
    .await?;

    Ok(Json(SuggestionResult { suggestions }))
}
