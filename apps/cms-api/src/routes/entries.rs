use axum::{
    extract::{Path, State},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
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

impl From<sqlx::Error> for EntryError {
    fn from(_: sqlx::Error) -> Self {
        EntryError::Database
    }
}

// ============ Request/Response Types ============

#[derive(Debug, Deserialize)]
pub struct CreateEntryRequest {
    pub id: Option<String>,
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
    pub tags: Option<Vec<String>>,
    pub thumbnail: Option<String>,
    pub public_url: Option<String>,
    pub thumbnails: Option<Value>,
    pub assets: Option<Value>,
    pub links: Option<Value>,
    pub searchable: Option<Value>,
    pub seo: Option<Value>,
    pub relations: Option<Value>,
    pub ext: Option<Value>,
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
    pub tags: Option<Vec<String>>,
    pub thumbnail: Option<String>,
    pub public_url: Option<String>,
    pub thumbnails: Option<Value>,
    pub assets: Option<Value>,
    pub links: Option<Value>,
    pub searchable: Option<Value>,
    pub seo: Option<Value>,
    pub relations: Option<Value>,
    pub ext: Option<Value>,
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

#[derive(Debug, Serialize)]
pub struct EntryDetail {
    pub id: String,
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
    pub public_url: Option<String>,
    pub thumbnails: Option<Value>,
    pub assets: Option<Value>,
    pub links: Option<Value>,
    pub searchable: Option<Value>,
    pub seo: Option<Value>,
    pub relations: Option<Value>,
    pub ext: Option<Value>,
}

#[derive(Debug, sqlx::FromRow)]
struct EntryDetailRow {
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

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
struct EntryMetadata {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub public_url: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thumbnails: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub assets: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub links: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub searchable: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seo: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relations: Option<Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ext: Option<Value>,
}

fn merge_metadata_from_request(
    current: EntryMetadata,
    payload: &UpdateEntryRequest,
) -> EntryMetadata {
    EntryMetadata {
        public_url: payload.public_url.clone().or(current.public_url),
        thumbnails: payload.thumbnails.clone().or(current.thumbnails),
        assets: payload.assets.clone().or(current.assets),
        links: payload.links.clone().or(current.links),
        searchable: payload.searchable.clone().or(current.searchable),
        seo: payload.seo.clone().or(current.seo),
        relations: payload.relations.clone().or(current.relations),
        ext: payload.ext.clone().or(current.ext),
    }
}

fn metadata_from_create_request(payload: &CreateEntryRequest) -> Option<EntryMetadata> {
    let metadata = EntryMetadata {
        public_url: payload.public_url.clone(),
        thumbnails: payload.thumbnails.clone(),
        assets: payload.assets.clone(),
        links: payload.links.clone(),
        searchable: payload.searchable.clone(),
        seo: payload.seo.clone(),
        relations: payload.relations.clone(),
        ext: payload.ext.clone(),
    };

    if metadata.public_url.is_none()
        && metadata.thumbnails.is_none()
        && metadata.assets.is_none()
        && metadata.links.is_none()
        && metadata.searchable.is_none()
        && metadata.seo.is_none()
        && metadata.relations.is_none()
        && metadata.ext.is_none()
    {
        None
    } else {
        Some(metadata)
    }
}

async fn load_entry_metadata(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    entry_id: &str,
) -> Result<EntryMetadata, sqlx::Error> {
    let metadata_json = sqlx::query_scalar::<_, String>(
        r#"
        SELECT metadata_json
        FROM entry_revisions
        WHERE entry_id = ?
        ORDER BY version DESC, created_at DESC
        LIMIT 1
        "#,
    )
    .bind(entry_id)
    .fetch_optional(&mut **tx)
    .await?;

    Ok(metadata_json
        .as_deref()
        .and_then(|value| serde_json::from_str::<EntryMetadata>(value).ok())
        .unwrap_or_default())
}

async fn save_entry_metadata(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    entry_id: &str,
    metadata: &EntryMetadata,
) -> Result<(), sqlx::Error> {
    let version = sqlx::query_scalar::<_, i64>(
        "SELECT COALESCE(MAX(version), 0) + 1 FROM entry_revisions WHERE entry_id = ?",
    )
    .bind(entry_id)
    .fetch_one(&mut **tx)
    .await?;

    sqlx::query(
        r#"
        INSERT INTO entry_revisions (id, entry_id, version, body_json, metadata_json, created_at)
        VALUES (?, ?, ?, '{}', ?, datetime('now'))
        "#,
    )
    .bind(Uuid::new_v4().to_string())
    .bind(entry_id)
    .bind(version)
    .bind(
        serde_json::to_string(metadata).unwrap_or_else(|_| "{}".to_string()),
    )
    .execute(&mut **tx)
    .await?;

    Ok(())
}

fn build_entry_detail_with_metadata(
    base: EntryDetailRow,
    metadata: EntryMetadata,
) -> EntryDetail {
    EntryDetail {
        id: base.id,
        entry_type: base.entry_type,
        status: base.status,
        visibility: base.visibility,
        title: base.title,
        summary: base.summary,
        lang: base.lang,
        path: base.path,
        depth: base.depth,
        order: base.order,
        parent_id: base.parent_id,
        published_at: base.published_at,
        created_at: base.created_at,
        updated_at: base.updated_at,
        slug: base.slug,
        public_url: metadata.public_url,
        thumbnails: metadata.thumbnails,
        assets: metadata.assets,
        links: metadata.links,
        searchable: metadata.searchable,
        seo: metadata.seo,
        relations: metadata.relations,
        ext: metadata.ext,
    }
}

// ============ Routes ============

pub fn router(pool: DbPool) -> Router {
    Router::new()
        .route("/", get(list_entries).post(create_entry))
        .route("/:id", get(get_entry).patch(update_entry).delete(delete_entry))
        .with_state(pool)
}

async fn replace_tags(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    entry_id: &str,
    tags: &[String],
) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM entry_tags WHERE entry_id = ?")
        .bind(entry_id)
        .execute(&mut **tx)
        .await?;

    for tag_name in tags.iter().map(|tag| tag.trim()).filter(|tag| !tag.is_empty()) {
        let tag_slug = tag_name.to_lowercase();
        let existing_tag_id = sqlx::query_scalar::<_, String>(
            "SELECT id FROM tags WHERE slug = ? LIMIT 1",
        )
        .bind(&tag_slug)
        .fetch_optional(&mut **tx)
        .await?;

        let tag_id = existing_tag_id.unwrap_or_else(|| Uuid::new_v4().to_string());

        sqlx::query(
            "INSERT OR IGNORE INTO tags (id, name, slug) VALUES (?, ?, ?)",
        )
        .bind(&tag_id)
        .bind(tag_name)
        .bind(&tag_slug)
        .execute(&mut **tx)
        .await?;

        sqlx::query(
            "INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)",
        )
        .bind(entry_id)
        .bind(&tag_id)
        .execute(&mut **tx)
        .await?;
    }

    Ok(())
}

async fn replace_thumbnail(
    tx: &mut sqlx::Transaction<'_, sqlx::Sqlite>,
    entry_id: &str,
    thumbnail: Option<&str>,
) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM assets WHERE entry_id = ? AND \"order\" = 0")
        .bind(entry_id)
        .execute(&mut **tx)
        .await?;

    if let Some(src) = thumbnail.filter(|value| !value.trim().is_empty()) {
        sqlx::query(
            r#"
            INSERT INTO assets (id, entry_id, src, type, "order")
            VALUES (?, ?, ?, 'thumbnail', 0)
            "#,
        )
        .bind(Uuid::new_v4().to_string())
        .bind(entry_id)
        .bind(src)
        .execute(&mut **tx)
        .await?;
    }

    Ok(())
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
    let id = payload.id.clone().unwrap_or_else(|| Uuid::new_v4().to_string());
    let mut tx = pool.begin().await?;

    sqlx::query(
        r#"
        INSERT OR REPLACE INTO entries (id, type, slug, status, visibility, title, summary, lang, path, depth, "order", parent_id, published_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    .bind(chrono::Utc::now().to_rfc3339())
    .execute(&mut *tx)
    .await?;

    if let Some(tags) = &payload.tags {
        replace_tags(&mut tx, &id, tags).await?;
    }

    if payload.thumbnail.is_some() {
        replace_thumbnail(&mut tx, &id, payload.thumbnail.as_deref()).await?;
    }

    if let Some(metadata) = metadata_from_create_request(&payload) {
        save_entry_metadata(&mut tx, &id, &metadata).await?;
    }

    tx.commit().await?;

    get_entry(pool, Path(id)).await
}

async fn get_entry(pool: State<DbPool>, Path(id): Path<String>) -> Result<Json<EntryDetail>, EntryError> {
    let entry = sqlx::query_as::<_, EntryDetailRow>(
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

    let metadata = sqlx::query_scalar::<_, String>(
        r#"
        SELECT metadata_json
        FROM entry_revisions
        WHERE entry_id = ?
        ORDER BY version DESC, created_at DESC
        LIMIT 1
        "#,
    )
    .bind(&id)
    .fetch_optional(&*pool)
    .await?
    .as_deref()
    .and_then(|value| serde_json::from_str::<EntryMetadata>(value).ok())
    .unwrap_or_default();

    Ok(Json(build_entry_detail_with_metadata(entry, metadata)))
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

    let mut tx = pool.begin().await?;

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

    q.execute(&mut *tx).await?;

    if let Some(tags) = &payload.tags {
        replace_tags(&mut tx, &id, tags).await?;
    }

    if payload.thumbnail.is_some() {
        replace_thumbnail(&mut tx, &id, payload.thumbnail.as_deref()).await?;
    }

    if payload.public_url.is_some()
        || payload.thumbnails.is_some()
        || payload.assets.is_some()
        || payload.links.is_some()
        || payload.searchable.is_some()
        || payload.seo.is_some()
        || payload.relations.is_some()
        || payload.ext.is_some()
    {
        let current_metadata = load_entry_metadata(&mut tx, &id).await?;
        let next_metadata = merge_metadata_from_request(current_metadata, &payload);
        save_entry_metadata(&mut tx, &id, &next_metadata).await?;
    }

    tx.commit().await?;

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
