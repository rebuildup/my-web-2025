use axum::{
    extract::{Path, Query, State},
    routing::{get, patch},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};
use thiserror::Error;
use uuid::Uuid;

use crate::db::DbPool;

#[derive(Error, Debug, Serialize)]
pub enum MarkdownError {
    #[error("Database error")]
    Database,
    #[error("Markdown page not found")]
    NotFound,
    #[error("Invalid input: {0}")]
    InvalidInput(String),
}

impl axum::response::IntoResponse for MarkdownError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            MarkdownError::NotFound => axum::http::StatusCode::NOT_FOUND,
            MarkdownError::InvalidInput(_) => axum::http::StatusCode::BAD_REQUEST,
            MarkdownError::Database => axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        };

        (status, Json(serde_json::json!({ "error": self.to_string() }))).into_response()
    }
}

impl From<sqlx::Error> for MarkdownError {
    fn from(_: sqlx::Error) -> Self {
        MarkdownError::Database
    }
}

#[derive(Debug, Deserialize)]
pub struct MarkdownQuery {
    pub id: Option<String>,
    pub slug: Option<String>,
    #[serde(rename = "contentId")]
    pub content_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpsertMarkdownRequest {
    pub id: Option<String>,
    #[serde(rename = "contentId")]
    pub content_id: String,
    pub slug: String,
    #[serde(default)]
    pub frontmatter: Value,
    pub body: String,
    #[serde(rename = "htmlCache")]
    pub html_cache: Option<String>,
    pub path: Option<String>,
    pub lang: Option<String>,
    pub status: Option<String>,
    pub visibility: Option<String>,
    pub version: Option<i64>,
    #[serde(rename = "publishedAt")]
    pub published_at: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: Option<String>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
pub struct MarkdownPage {
    pub id: String,
    #[sqlx(rename = "entry_id")]
    pub content_id: String,
    pub slug: String,
    #[sqlx(skip)]
    pub frontmatter: Value,
    #[sqlx(rename = "frontmatter_json")]
    #[serde(skip_serializing)]
    pub frontmatter_json: String,
    pub body: String,
    pub html_cache: Option<String>,
    pub path: Option<String>,
    pub lang: String,
    pub status: String,
    pub visibility: String,
    pub version: i64,
    pub created_at: String,
    pub updated_at: String,
    pub published_at: Option<String>,
}

impl MarkdownPage {
    fn normalize(mut self) -> Self {
        self.frontmatter = parse_frontmatter(&self.frontmatter_json);
        self
    }
}

pub fn router(pool: DbPool) -> Router {
    Router::new()
        .route("/", get(list_or_get_markdown).post(create_markdown))
        .route("/:id", patch(update_markdown).delete(delete_markdown))
        .with_state(pool)
}

fn parse_frontmatter(raw: &str) -> Value {
    serde_json::from_str(raw).unwrap_or_else(|_| Value::Object(Map::new()))
}

fn normalize_frontmatter(value: Value) -> Value {
    match value {
        Value::Object(_) => value,
        Value::Null => Value::Object(Map::new()),
        other => {
            let mut map = Map::new();
            map.insert("value".to_string(), other);
            Value::Object(map)
        }
    }
}

fn normalize_status(value: Option<&str>) -> &str {
    match value.unwrap_or("draft").trim() {
        "published" => "published",
        "archived" => "archived",
        _ => "draft",
    }
}

fn normalize_visibility(value: Option<&str>) -> &str {
    match value.unwrap_or("draft").trim() {
        "public" => "public",
        "unlisted" => "unlisted",
        "private" => "private",
        _ => "draft",
    }
}

async fn list_or_get_markdown(
    pool: State<DbPool>,
    Query(query): Query<MarkdownQuery>,
) -> Result<Json<Value>, MarkdownError> {
    if let Some(identifier) = query.id.as_ref().or(query.slug.as_ref()) {
        let page = sqlx::query_as::<_, MarkdownPage>(
            r#"
            SELECT
                id,
                entry_id,
                slug,
                frontmatter_json,
                body,
                html_cache,
                path,
                lang,
                status,
                visibility,
                version,
                created_at,
                updated_at,
                published_at
            FROM markdown_pages
            WHERE (id = ? OR slug = ?)
              AND (? IS NULL OR entry_id = ?)
            LIMIT 1
            "#,
        )
        .bind(identifier)
        .bind(identifier)
        .bind(query.content_id.as_ref())
        .bind(query.content_id.as_ref())
        .fetch_optional(&*pool)
        .await?
        .ok_or(MarkdownError::NotFound)?
        .normalize();

        return Ok(Json(serde_json::to_value(page).map_err(|_| MarkdownError::Database)?));
    }

    let pages = sqlx::query_as::<_, MarkdownPage>(
        r#"
        SELECT
            id,
            entry_id,
            slug,
            frontmatter_json,
            body,
            html_cache,
            path,
            lang,
            status,
            visibility,
            version,
            created_at,
            updated_at,
            published_at
        FROM markdown_pages
        WHERE (? IS NULL OR entry_id = ?)
        ORDER BY updated_at DESC
        "#,
    )
    .bind(query.content_id.as_ref())
    .bind(query.content_id.as_ref())
    .fetch_all(&*pool)
    .await?
    .into_iter()
    .map(MarkdownPage::normalize)
    .collect::<Vec<_>>();

    Ok(Json(serde_json::to_value(pages).map_err(|_| MarkdownError::Database)?))
}

async fn create_markdown(
    pool: State<DbPool>,
    Json(payload): Json<UpsertMarkdownRequest>,
) -> Result<Json<MarkdownPage>, MarkdownError> {
    let id = payload
        .id
        .clone()
        .unwrap_or_else(|| Uuid::new_v4().to_string());
    upsert_markdown_record(&pool, &id, payload).await?;
    get_markdown_by_id(&pool, &id).await.map(Json)
}

async fn update_markdown(
    pool: State<DbPool>,
    Path(id): Path<String>,
    Json(payload): Json<UpsertMarkdownRequest>,
) -> Result<Json<MarkdownPage>, MarkdownError> {
    let exists = sqlx::query_scalar::<_, String>(
        "SELECT id FROM markdown_pages WHERE id = ? LIMIT 1",
    )
    .bind(&id)
    .fetch_optional(&*pool)
    .await?
    .is_some();

    if !exists {
        return Err(MarkdownError::NotFound);
    }

    upsert_markdown_record(&pool, &id, payload).await?;
    get_markdown_by_id(&pool, &id).await.map(Json)
}

async fn delete_markdown(
    pool: State<DbPool>,
    Path(id): Path<String>,
) -> Result<Json<Value>, MarkdownError> {
    let result = sqlx::query("DELETE FROM markdown_pages WHERE id = ?")
        .bind(&id)
        .execute(&*pool)
        .await?;

    if result.rows_affected() == 0 {
        return Err(MarkdownError::NotFound);
    }

    Ok(Json(serde_json::json!({ "ok": true, "id": id })))
}

async fn upsert_markdown_record(
    pool: &DbPool,
    id: &str,
    payload: UpsertMarkdownRequest,
) -> Result<(), MarkdownError> {
    if payload.content_id.trim().is_empty() {
        return Err(MarkdownError::InvalidInput("contentId is required".to_string()));
    }

    if payload.slug.trim().is_empty() {
        return Err(MarkdownError::InvalidInput("slug is required".to_string()));
    }

    let frontmatter = normalize_frontmatter(payload.frontmatter);
    let frontmatter_json =
        serde_json::to_string(&frontmatter).map_err(|_| MarkdownError::Database)?;

    sqlx::query(
        r#"
        INSERT OR REPLACE INTO markdown_pages (
            id, entry_id, slug, frontmatter_json, body, html_cache, path, lang,
            status, visibility, version, published_at, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(id)
    .bind(&payload.content_id)
    .bind(&payload.slug)
    .bind(frontmatter_json)
    .bind(&payload.body)
    .bind(payload.html_cache)
    .bind(payload.path)
    .bind(payload.lang.unwrap_or_else(|| "ja".to_string()))
    .bind(normalize_status(payload.status.as_deref()))
    .bind(normalize_visibility(payload.visibility.as_deref()))
    .bind(payload.version.unwrap_or(1))
    .bind(payload.published_at)
    .bind(
        payload
            .created_at
            .unwrap_or_else(|| chrono::Utc::now().to_rfc3339()),
    )
    .bind(
        payload
            .updated_at
            .unwrap_or_else(|| chrono::Utc::now().to_rfc3339()),
    )
    .execute(pool)
    .await?;

    Ok(())
}

async fn get_markdown_by_id(pool: &DbPool, id: &str) -> Result<MarkdownPage, MarkdownError> {
    sqlx::query_as::<_, MarkdownPage>(
        r#"
        SELECT
            id,
            entry_id,
            slug,
            frontmatter_json,
            body,
            html_cache,
            path,
            lang,
            status,
            visibility,
            version,
            created_at,
            updated_at,
            published_at
        FROM markdown_pages
        WHERE id = ?
        LIMIT 1
        "#,
    )
    .bind(id)
    .fetch_optional(pool)
    .await?
    .map(MarkdownPage::normalize)
    .ok_or(MarkdownError::NotFound)
}
