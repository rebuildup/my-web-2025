use sqlx::SqlitePool;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber::fmt::format::FmtSpan;

mod db;
mod routes;

use db::create_pool;
use routes::{entries, preview, search, tags};

#[tokio::main]
async fn main() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_span_events(FmtSpan::CLOSE)
        .init();

    // Create database pool (in-memory for dev)
    let pool = create_pool("sqlite::memory:")
        .await
        .expect("Failed to create database pool");

    // Build CORS layer (permissive for dev)
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build router with all routes
    let app = routes::entries::router(pool.clone())
        .merge(tags::router(pool.clone()))
        .merge(search::router(pool.clone()))
        .merge(preview::router(pool.clone()))
        .route("/health", axum::routing::get(health))
        .layer(cors);

    // Start server
    let listener = tokio::net::TcpListener::bind("127.0.0.1:3001")
        .await
        .unwrap();

    info!("CMS API server running on 127.0.0.1:3001");

    axum::serve(listener, app)
        .await
        .unwrap();
}

async fn health() -> &'static str {
    "OK"
}