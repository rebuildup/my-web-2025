use std::{env, fs, path::PathBuf};
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber::fmt::format::FmtSpan;

mod db;
mod routes;

use db::create_pool;
use routes::{entries, markdown, media, preview, search, tags};

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
        .nest("/media", media::router(pool.clone()))
        .nest("/tags", tags::router(pool.clone()))
        .nest("/search", search::router(pool.clone()))
        .nest("/preview", preview::router(pool.clone()))
        .route("/health", axum::routing::get(health))
        .layer(cors);

    // Start server
    let listener = tokio::net::TcpListener::bind(&bind_address)
        .await
        .unwrap();

    info!(
        "CMS API server running on {} using {}",
        bind_address, database_url
    );

    axum::serve(listener, app)
        .await
        .unwrap();
}

async fn health() -> &'static str {
    "OK"
}
