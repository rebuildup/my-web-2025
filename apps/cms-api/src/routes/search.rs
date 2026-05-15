use axum::{
    extract::{Query, State},
    routing::get,
    Json, Router,
};
use serde::Deserialize;
use serde::Serialize;
use sqlx::SqlitePool;
use thiserror::Error;

use crate::db::DbPool;

#[derive(Error, Debug, Serialize)]
pub enum SearchError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("Query parameter 'q' is required")]
    MissingQuery,
}

impl axum::response::IntoResponse for SearchError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            SearchError::MissingQuery => axum::http::StatusCode::BAD_REQUEST,
            SearchError::Database(_) => axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        };
        (status, Json(serde_json::json!({"error": self.to_string()}))).into_response()
    }
}

// ============ Types ============

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub q: String,
}

#[derive(Debug, Serialize)]
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

async fn search(pool: State<DbPool>, Query(query): Query<SearchQuery>) -> Result<Json<Vec<SearchResult>>, SearchError> {
    if query.q.trim().is_empty() {
        return Err(SearchError::MissingQuery);
    }

    // Escape FTS5 special characters and prepare query
    let search_term = query.q.split_whitespace().collect::<Vec<_>>().join(" OR ");

    let results = sqlx::query_as::<_, SearchResult>(
        r#"
        SELECT e.id, e.title, e.summary, e.type, e.status, e.thumbnail, e.tags
        FROM search_index s
        JOIN list_index e ON s.id = e.id
        WHERE search_index MATCH ?
        ORDER BY rank
        LIMIT 50
        "#,
    )
    .bind(&search_term)
    .fetch_all(&*pool)
    .await?;

    Ok(Json(results))
}

async fn suggestions(pool: State<DbPool>, Query(query): Query<SearchQuery>) -> Result<Json<SuggestionResult>, SearchError> {
    if query.q.trim().is_empty() {
        return Ok(Json(SuggestionResult { suggestions: vec![] }));
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