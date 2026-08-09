//! Compatibility routes for the pre-static-export Next.js `/api/content/*` surface.
//!
//! Static export no longer serves Next.js route handlers, but browser code still
//! requests these paths. Nginx proxies `/api/` to this process, so these handlers
//! keep the public site working without a Node server.

use axum::{
    extract::{Path, Query, State},
    routing::get,
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::db::DbPool;

#[derive(Debug, Serialize, sqlx::FromRow)]
struct IndexRow {
    id: String,
    #[sqlx(rename = "type")]
    entry_type: String,
    status: String,
    visibility: String,
    title: String,
    summary: Option<String>,
    lang: String,
    published_at: Option<String>,
    created_at: String,
    updated_at: String,
    slug: Option<String>,
    thumbnail: Option<String>,
    tags: Option<String>,
}

#[derive(Debug, Deserialize)]
struct ListQuery {
    limit: Option<i64>,
    id: Option<String>,
    status: Option<String>,
    category: Option<String>,
}

#[derive(Debug, Deserialize)]
struct SearchQuery {
    q: Option<String>,
    #[serde(rename = "type")]
    entry_type: Option<String>,
    category: Option<String>,
    limit: Option<i64>,
}

fn parse_tags(tags: &Option<String>) -> Vec<String> {
    tags.as_deref()
        .unwrap_or("")
        .split(',')
        .map(str::trim)
        .filter(|tag| !tag.is_empty())
        .map(str::to_string)
        .collect()
}

fn portfolio_category(tags: &[String]) -> String {
    tags.iter()
        .find(|tag| {
            matches!(
                tag.as_str(),
                "develop" | "video" | "design" | "video&design"
            )
        })
        .cloned()
        .unwrap_or_else(|| "all".to_string())
}

fn is_portfolio_item(row: &IndexRow) -> bool {
    if row.status != "published" {
        return false;
    }
    let tags = parse_tags(&row.tags);
    tags.iter().any(|tag| {
        matches!(
            tag.as_str(),
            "develop" | "video" | "design" | "video&design"
        )
    }) || row.entry_type == "portfolio"
}

fn map_portfolio_item(row: &IndexRow) -> Value {
    let tags = parse_tags(&row.tags);
    json!({
        "id": row.id,
        "title": row.title,
        "description": row.summary.clone().unwrap_or_default(),
        "thumbnail": row.thumbnail,
        "tags": tags,
        "technologies": [],
        "category": portfolio_category(&tags),
        "createdAt": row.created_at,
        "updatedAt": row.updated_at,
        "publishedAt": row.published_at,
    })
}

fn map_content_item(row: &IndexRow, content_type: &str) -> Value {
    let tags = parse_tags(&row.tags);
    let categories: Vec<String> = tags
        .iter()
        .filter(|tag| {
            matches!(
                tag.as_str(),
                "develop" | "video" | "design" | "video&design" | "other"
            )
        })
        .cloned()
        .collect();

    if content_type == "portfolio" {
        json!({
            "id": row.id,
            "type": content_type,
            "title": row.title,
            "description": row.summary.clone().unwrap_or_default(),
            "tags": tags,
            "status": row.status,
            "priority": 50,
            "createdAt": row.created_at,
            "updatedAt": row.updated_at,
            "publishedAt": row.published_at,
            "thumbnail": row.thumbnail,
            "categories": if categories.is_empty() {
                vec!["other".to_string()]
            } else {
                categories
            },
            "content": "",
            "images": [],
            "videos": [],
            "externalLinks": [],
        })
    } else {
        json!({
            "id": row.id,
            "type": content_type,
            "title": row.title,
            "description": row.summary.clone().unwrap_or_default(),
            "tags": tags,
            "status": row.status,
            "priority": 50,
            "createdAt": row.created_at,
            "updatedAt": row.updated_at,
            "publishedAt": row.published_at,
            "thumbnail": row.thumbnail,
            "category": tags.first().cloned().unwrap_or_default(),
            "content": "",
            "images": [],
            "videos": [],
            "externalLinks": [],
        })
    }
}

fn apply_limit(items: Vec<Value>, limit: Option<i64>) -> Vec<Value> {
    match limit {
        Some(n) if n > 0 => items.into_iter().take(n as usize).collect(),
        _ => items,
    }
}

async fn load_index(pool: &DbPool) -> Result<Vec<IndexRow>, sqlx::Error> {
    sqlx::query_as::<_, IndexRow>(
        r#"
        SELECT id, type, status, visibility, title, summary, lang,
               published_at, created_at, updated_at, slug, thumbnail, tags
        FROM list_index
        ORDER BY COALESCE(published_at, updated_at, created_at) DESC
        "#,
    )
    .fetch_all(pool)
    .await
}

pub fn router(pool: DbPool) -> Router {
    Router::new()
        .route("/portfolio", get(portfolio_entries))
        .route("/by-type/:entry_type", get(content_by_type))
        .route("/search", get(content_search))
        .route("/:entry_type", get(content_by_type_path))
        .with_state(pool)
}

async fn portfolio_entries(
    State(pool): State<DbPool>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Value>, (axum::http::StatusCode, Json<Value>)> {
    let rows = load_index(&pool).await.map_err(|_| {
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "success": false, "error": "Database error" })),
        )
    })?;

    let mut items: Vec<Value> = rows
        .iter()
        .filter(|row| is_portfolio_item(row))
        .map(map_portfolio_item)
        .collect();

    if let Some(id) = query.id.as_deref() {
        let item = items.into_iter().find(|item| {
            item.get("id")
                .and_then(|value| value.as_str())
                .is_some_and(|value| value == id)
        });
        return match item {
            Some(value) => Ok(Json(json!({ "success": true, "data": value }))),
            None => Err((
                axum::http::StatusCode::NOT_FOUND,
                Json(json!({ "success": false, "error": "Portfolio item not found" })),
            )),
        };
    }

    let total = items.len();
    items = apply_limit(items, query.limit);

    Ok(Json(json!({
        "success": true,
        "data": items,
        "total": total,
    })))
}

async fn content_by_type(
    State(pool): State<DbPool>,
    Path(entry_type): Path<String>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Value>, (axum::http::StatusCode, Json<Value>)> {
    list_by_type(pool, entry_type, query).await
}

async fn content_by_type_path(
    State(pool): State<DbPool>,
    Path(entry_type): Path<String>,
    Query(query): Query<ListQuery>,
) -> Result<Json<Value>, (axum::http::StatusCode, Json<Value>)> {
    // Reserved paths handled by more specific routes above.
    if matches!(entry_type.as_str(), "portfolio" | "search" | "by-type") {
        return Err((
            axum::http::StatusCode::NOT_FOUND,
            Json(json!({ "success": false, "error": "Not found" })),
        ));
    }
    list_by_type(pool, entry_type, query).await
}

async fn list_by_type(
    pool: DbPool,
    entry_type: String,
    query: ListQuery,
) -> Result<Json<Value>, (axum::http::StatusCode, Json<Value>)> {
    let rows = load_index(&pool).await.map_err(|_| {
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "success": false, "error": "Database error" })),
        )
    })?;

    let status_filter = query.status.as_deref().unwrap_or("published");

    let mut items: Vec<Value> = rows
        .iter()
        .filter(|row| {
            let type_ok = row.entry_type == entry_type
                || (entry_type == "portfolio" && is_portfolio_item(row));
            if !type_ok {
                return false;
            }
            if status_filter == "all" {
                return true;
            }
            row.status == status_filter
        })
        .filter(|row| {
            if let Some(category) = query.category.as_deref() {
                if category != "all" {
                    let tags = parse_tags(&row.tags);
                    return tags.iter().any(|tag| tag == category)
                        || row.slug.as_deref().is_some_and(|slug| slug == category);
                }
            }
            true
        })
        .map(|row| map_content_item(row, &entry_type))
        .collect();

    let total = items.len();
    items = apply_limit(items, query.limit.or(Some(100)));

    Ok(Json(json!({
        "success": true,
        "data": items,
        "total": total,
    })))
}

async fn content_search(
    State(pool): State<DbPool>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Value>, (axum::http::StatusCode, Json<Value>)> {
    let q = query.q.unwrap_or_default();
    if q.trim().is_empty() {
        return Ok(Json(json!({ "results": [] })));
    }

    let like_query = format!("%{}%", q.trim());
    let entry_type = query.entry_type.as_deref();
    let category = query.category.as_deref();
    let limit = query.limit.unwrap_or(50).clamp(1, 100);

    let rows = sqlx::query_as::<_, IndexRow>(
        r#"
        SELECT id, type, status, visibility, title, summary, lang,
               published_at, created_at, updated_at, slug, thumbnail, tags
        FROM list_index
        WHERE status = 'published'
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
    .bind(entry_type)
    .bind(entry_type)
    .bind(&like_query)
    .bind(&like_query)
    .bind(&like_query)
    .bind(limit)
    .fetch_all(&pool)
    .await
    .map_err(|_| {
        (
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "success": false, "error": "Database error" })),
        )
    })?;

    let results: Vec<Value> = rows
        .into_iter()
        .filter(|row| {
            if let Some(category) = category {
                if category != "すべて" && category != "all" {
                    let tags = parse_tags(&row.tags);
                    return tags.iter().any(|tag| tag == category);
                }
            }
            true
        })
        .map(|row| {
            let tags = parse_tags(&row.tags);
            json!({
                "id": row.id,
                "title": row.title,
                "description": row.summary.clone().unwrap_or_default(),
                "type": row.entry_type,
                "category": portfolio_category(&tags),
                "tags": tags,
                "thumbnail": row.thumbnail,
                "url": format!("/portfolio/{}/", row.id),
                "score": 1.0,
            })
        })
        .collect();

    Ok(Json(json!({ "results": results })))
}
