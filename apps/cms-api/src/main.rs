use std::{env, fs, path::PathBuf};
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber::fmt::format::FmtSpan;

mod db;
mod routes;

use db::create_pool;
use routes::{content_compat, entries, markdown, media as media_route, og, preview, search, tags};

fn cms_api_host() -> String {
    env::var("CMS_API_HOST").unwrap_or_else(|_| "127.0.0.1".to_string())
}

fn cms_api_port() -> u16 {
    env::var("CMS_API_PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(3001)
}

fn cms_api_data_dir() -> PathBuf {
    env::var("CMS_API_DATA_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("./data/db"))
}

// Per-content SQLite databases live in `data/contents/content-{id}.db` and are
// managed by the Bun SQLite CMS. The OG image route reads directly from them
// so the rendered title/summary always reflects the latest edit, even if
// `bun run sync:cms-entries` hasn't been run yet.
fn cms_api_content_data_dir() -> PathBuf {
    if let Ok(dir) = env::var("CMS_API_CONTENT_DATA_DIR") {
        return PathBuf::from(dir);
    }

    let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    let candidates = [
        cwd.join("data").join("contents"),
        cwd.join("..").join("data").join("contents"),
        PathBuf::from("./data/contents"),
    ];

    candidates
        .into_iter()
        .find(|p| p.is_dir())
        .unwrap_or_else(|| PathBuf::from("./data/contents"))
}

fn cms_api_database_url() -> String {
    if let Ok(database_url) = env::var("CMS_API_DATABASE_URL") {
        return database_url;
    }

    let data_dir = cms_api_data_dir();
    if let Err(error) = fs::create_dir_all(&data_dir) {
        panic!(
            "Failed to create CMS API data directory {}: {}",
            data_dir.display(),
            error
        );
    }

    let database_path = data_dir.join("cms-api-dev.db");
    format!("sqlite:{}?mode=rwc", database_path.display())
}

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_span_events(FmtSpan::CLOSE)
        .init();

    let database_url = cms_api_database_url();
    let host = cms_api_host();
    let port = cms_api_port();
    let bind_address = format!("{}:{}", host, port);

    let pool = create_pool(&database_url)
        .await
        .expect("Failed to create database pool");

    // Build CORS layer (permissive for dev)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router with all routes
    let app = axum::Router::new()
        .nest("/entries", entries::router(pool.clone()))
        .nest("/markdown", markdown::router(pool.clone()))
        // Reads AND writes go straight to per-content DBs so the served bytes
        // always reflect the latest edit, independent of any sync script.
        // This matches the 1-item-1-DB architecture declared in
        // `docs/adr/0004-distributed-sqlite-cms.md`.
        .nest("/media", media_route::router(cms_api_content_data_dir()))
        // Alias for browser-facing `/api/cms/media` so static-exported pages
        // can request media through the Rust CMS API without a Node route.
        .nest(
            "/api/cms/media",
            media_route::router(cms_api_content_data_dir()),
        )
        .nest("/tags", tags::router(pool.clone()))
        .nest("/search", search::router(pool.clone()))
        .nest("/preview", preview::router(pool.clone()))
        // Dynamically rendered OG (1200x630) PNGs served by the Rust API.
        // Mounted under both the canonical prefix and the `/api/cms/og` alias
        // so the static-exported portfolio can link to it without a Node route.
        .nest("/api/cms/og", og::router(cms_api_content_data_dir()))
        // Next.js static export has no Node API routes; keep browser-facing
        // `/api/content/*` working through the Rust backend.
        .nest("/api/content", content_compat::router(pool.clone()))
        .route("/health", axum::routing::get(health))
        .route("/api/github/activity", axum::routing::get(dummy_json))
        .route("/api/youtube/activity", axum::routing::get(dummy_json))
        .route(
            "/api/stats/*path",
            axum::routing::get(dummy_json).post(dummy_json),
        )
        .route(
            "/api/monitoring/*path",
            axum::routing::get(dummy_json).post(dummy_json),
        )
        .route(
            "/api/admin/*path",
            axum::routing::get(dummy_json).post(dummy_json),
        )
        .layer(cors);

    // Start server
    let listener = tokio::net::TcpListener::bind(&bind_address).await.unwrap();

    info!(
        "CMS API server running on {} using {}",
        bind_address, database_url
    );

    axum::serve(listener, app).await.unwrap();
}

async fn health() -> &'static str {
    "OK"
}

async fn dummy_json() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "ok",
        "data": [],
        "message": "Rust API dummy response"
    }))
}
