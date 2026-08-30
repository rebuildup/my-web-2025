use std::{env, fs, path::PathBuf};
use tower_http::cors::{Any, CorsLayer};
use tracing::info;
use tracing_subscriber::fmt::format::FmtSpan;

mod db;
mod routes;
mod sync;

use anyhow::{Context, Result};
use db::create_pool;
use routes::{content_compat, entries, markdown, media as media_route, og, preview, search, tags};

/// Build an S3 client targeting Cloudflare R2 from the standard secret env
/// vars (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`). The
/// endpoint defaults to the placeholder pattern documented in `.env.example`;
/// production must set the real account-specific URL.
async fn build_r2_client() -> Result<aws_sdk_s3::Client> {
    use aws_config::BehaviorVersion;
    let access_key = env::var("R2_ACCESS_KEY_ID").context("R2_ACCESS_KEY_ID must be set")?;
    let secret_key =
        env::var("R2_SECRET_ACCESS_KEY").context("R2_SECRET_ACCESS_KEY must be set")?;
    let endpoint = env::var("R2_ENDPOINT")
        .unwrap_or_else(|_| "https://<account>.r2.cloudflarestorage.com".to_string());
    let creds =
        aws_credential_types::Credentials::new(access_key, secret_key, None, None, "r2-static");
    let cfg = aws_config::defaults(BehaviorVersion::latest())
        .endpoint_url(&endpoint)
        .region("auto")
        .credentials_provider(creds)
        .load()
        .await;
    Ok(aws_sdk_s3::Client::new(&cfg))
}

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

// Per-content SQLite databases live in `data/contents/content-{id}.db` (legacy
// Bun SQLite CMS layout) or `data/db/content-{id}.db` (Cloudflare Container
// R2-hydrated layout — see `sync::hydrate`, which strips the `contents/`
// prefix from R2 keys and writes into `cms_api_data_dir()`). The OG image
// route reads directly from them so the rendered title/summary always
// reflects the latest edit, even if `bun run sync:cms-entries` hasn't been
// run yet.
//
// The Container image sets `CMS_API_DATA_DIR=/var/lib/cms/data` (see
// `apps/cms-api/Dockerfile`), so the hydrator populates
// `/var/lib/cms/data/content-{id}.db` — NOT `./data/db/`. The previous
// candidate list only probed cwd-relative paths and missed the Container's
// data dir entirely. Probing `CMS_API_DATA_DIR` directly closes that gap so
// `/api/cms/media` and `/api/cms/og` can read the hydrated DBs without a
// second env knob. See Task #83 / #86 for the failure history.
fn cms_api_content_data_dir() -> PathBuf {
    if let Ok(dir) = env::var("CMS_API_CONTENT_DATA_DIR") {
        return PathBuf::from(dir);
    }

    let cwd = std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."));
    let mut candidates: Vec<PathBuf> = Vec::new();

    // Mirror `cms_api_data_dir()`'s env-var precedence. The Container
    // hydrator writes here, so the media route must look here too.
    if let Ok(dir) = env::var("CMS_API_DATA_DIR") {
        let p = PathBuf::from(&dir);
        candidates.push(p.clone());
        // Hydrator puts per-content DBs in the same dir as `cms-api-dev.db`,
        // so the `parent()` fallback below would be wrong; include the dir
        // itself explicitly.
        candidates.push(p.join("contents"));
    }

    candidates.extend([
        cwd.join("data").join("contents"),
        cwd.join("..").join("data").join("contents"),
        PathBuf::from("./data/contents"),
        // Cloudflare Container fallback (only meaningful when the env var
        // above is unset, e.g. local dev or `bun run cms-api`).
        cwd.join("data").join("db"),
        PathBuf::from("./data/db"),
    ]);

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

    // Build the R2 (S3-compatible) client and hydrate the per-content SQLite
    // directory from the bucket before serving any traffic. The boot fails
    // hard if hydration errors — Cloudflare Containers restart on crash, so a
    // transient R2 outage will retry hydrate without serving stale state.
    let r2 = build_r2_client().await.expect("build R2 client");
    let sync_cfg = sync::R2Config {
        bucket: env::var("R2_BUCKET").unwrap_or_else(|_| "cms-data".to_string()),
        local_dir: cms_api_data_dir(),
    };

    if let Err(e) = sync::hydrate(&r2, &sync_cfg).await {
        tracing::error!(error = %e, "R2 hydrate failed; exiting");
        std::process::exit(1);
    }

    // Periodic write-back (30s). The lite Container sleeps after 5 min of idle;
    // `max_instances = 1` guarantees no concurrent writers, so a fresh
    // `SyncState` per tick is safe — shutdown() captures the final flush.
    let r2_bg = r2.clone();
    let cfg_bg = sync_cfg.clone();
    tokio::spawn(async move {
        let mut ticker = tokio::time::interval(std::time::Duration::from_secs(30));
        ticker.set_missed_tick_behavior(tokio::time::MissedTickBehavior::Delay);
        loop {
            ticker.tick().await;
            let mut state = sync::SyncState::new();
            if let Err(e) = sync::write_back(&r2_bg, &cfg_bg, &mut state).await {
                tracing::warn!(error = %e, "R2 write-back tick failed");
            }
        }
    });

    // Graceful shutdown: flush write-back on SIGTERM (Linux Container) or
    // Ctrl+C (Windows dev). On Linux Container, `Container.max_instances = 1`
    // means SIGTERM is the only signal we get during a rolling deploy.
    let r2_shutdown = r2.clone();
    let cfg_shutdown = sync_cfg.clone();
    tokio::spawn(async move {
        #[cfg(unix)]
        {
            use tokio::signal::unix::{signal, SignalKind};
            let mut sigterm = signal(SignalKind::terminate()).expect("install SIGTERM");
            tokio::select! {
                _ = sigterm.recv() => tracing::info!("SIGTERM received"),
                _ = tokio::signal::ctrl_c() => tracing::info!("SIGINT received"),
            }
        }
        #[cfg(not(unix))]
        {
            let _ = tokio::signal::ctrl_c().await;
            tracing::info!("Ctrl+C received");
        }
        if let Err(e) =
            sync::shutdown(&r2_shutdown, &cfg_shutdown, &mut sync::SyncState::new()).await
        {
            tracing::error!(error = %e, "shutdown write-back failed");
        }
        std::process::exit(0);
    });

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
        // Browser-facing `/api/*` aliases for the canonical CMS routes.
        // Cloudflare Workers Router (`workers/router/src/index.ts`) proxies
        // `/api/*` to this Container in production. The nginx + GCP path also
        // forwards `/api/*` to the Rust API directly. Both paths land here.
        .nest("/api/entries", entries::router(pool.clone()))
        .nest("/api/markdown", markdown::router(pool.clone()))
        .nest(
            "/api/media",
            media_route::router(cms_api_content_data_dir()),
        )
        .nest("/api/tags", tags::router(pool.clone()))
        .nest("/api/search", search::router(pool.clone()))
        .nest("/api/preview", preview::router(pool.clone()))
        .route("/api/health", axum::routing::get(health))
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
    "OK-v4"
}

async fn dummy_json() -> axum::Json<serde_json::Value> {
    axum::Json(serde_json::json!({
        "status": "ok",
        "data": [],
        "message": "Rust API dummy response"
    }))
}
