//! Admin authentication middleware.
//!
//! All write endpoints (POST/PATCH/PUT/DELETE) require a valid HS256 JWT
//! signed with `CMS_API_ADMIN_JWT_SECRET`, presented as
//! `Authorization: Bearer <token>`.
//!
//! Read endpoints (GET/HEAD/OPTIONS) are served unauthenticated EXCEPT when
//! the request path is under `/api/preview/` or `/preview/` — preview
//! surfaces unpublished drafts to admins and must never be reachable
//! anonymously.
//!
//! Other read endpoints (`GET /api/entries/:id`, `/api/markdown`,
//! `/api/cms/og/:id`, `/api/cms/media`) are still served unauthenticated
//! here, but each handler now applies its own
//! `status = 'published' AND visibility IN ('public', 'unlisted')` filter
//! in the SQL `WHERE` clause (or via a `contents` lookup before serving).
//! Anonymous callers therefore receive 404 for draft / private rows instead
//! of the row's full payload. This matches the boundary the `list_index`
//! view enforces on the list endpoints; the per-row endpoints no longer
//! fall through to the base DB.
//!
//! Failure modes:
//! - Missing Authorization header → 401 `{ "error": "unauthorized" }`
//! - Malformed `Bearer …` value → 401
//! - Signature / expiry failure → 401
//! - Safe methods on non-preview paths: skipped (no header required)
//!
//! The secret is read from the `CMS_API_ADMIN_JWT_SECRET` env var on every
//! request — the Container is restarted when the secret rotates, so an
//! in-process cache is unnecessary and would be a foot-gun.

use axum::extract::Request;
use axum::http::{header, Method, StatusCode};
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use axum::Json;
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[allow(dead_code)]
pub struct AdminClaims {
    /// Subject (user id). Optional — only present for human admins.
    #[serde(default)]
    pub sub: Option<String>,
    /// Issued-at (seconds since epoch). Used for token age verification.
    #[serde(default)]
    pub iat: Option<u64>,
    /// Expiry (seconds since epoch). Required for HS256 long-lived tokens.
    pub exp: u64,
}

/// Extension attached to the request when an admin token validates. Handlers
/// that need to attribute writes can extract this via `Extension<AdminUser>`.
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct AdminUser {
    pub claims: AdminClaims,
}

/// Axum middleware function. Apply with `.route_layer(middleware::from_fn(
/// require_admin))` to a sub-router that exposes both reads and writes.
///
/// The skip-rule for safe methods (GET / HEAD / OPTIONS) lives here rather
/// than at the route level so that handlers can be split freely between
/// `Router::new().route("/", get(...).post(...))` and separate sub-routers
/// without re-thinking auth.
pub async fn require_admin(req: Request, next: Next) -> Response {
    let method = req.method().clone();
    let path = req.uri().path();
    let is_safe = matches!(method, Method::GET | Method::HEAD | Method::OPTIONS);
    let is_preview = is_preview_path(path);

    // Safe methods skip auth UNLESS the path is under /preview/, which is
    // admin-only by contract (preview surfaces unpublished drafts).
    if is_safe && !is_preview {
        return next.run(req).await;
    }

    let secret = match std::env::var("CMS_API_ADMIN_JWT_SECRET") {
        Ok(s) if !s.is_empty() => s,
        _ => {
            tracing::error!("CMS_API_ADMIN_JWT_SECRET is not set; rejecting write request");
            return unauthorized();
        }
    };

    let token = match req
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|h| h.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
    {
        Some(t) if !t.is_empty() => t.to_string(),
        _ => return unauthorized(),
    };

    let key = DecodingKey::from_secret(secret.as_bytes());
    let mut validation = Validation::new(Algorithm::HS256);
    validation.set_required_spec_claims(&["exp"]);
    // Default jsonwebtoken leeway is 60s — too generous for admin tokens.
    // We want a hard expiry, so any `exp` in the past is rejected.
    validation.leeway = 0;
    let token_data = match decode::<AdminClaims>(&token, &key, &validation) {
        Ok(td) => td,
        Err(e) => {
            tracing::warn!(error = %e, "admin JWT validation failed");
            return unauthorized();
        }
    };

    tracing::info!(sub = ?token_data.claims.sub, "admin write authorized");

    // Stash the admin user so handlers can attribute writes if they want.
    let mut req = req;
    req.extensions_mut().insert(AdminUser {
        claims: token_data.claims,
    });

    next.run(req).await
}

fn unauthorized() -> Response {
    (
        StatusCode::UNAUTHORIZED,
        [(header::WWW_AUTHENTICATE, "Bearer")],
        Json(json!({ "error": "unauthorized" })),
    )
        .into_response()
}

/// Returns true when the request path targets a preview-only endpoint.
/// Preview surfaces are admin-only by contract and must not be reachable
/// anonymously regardless of HTTP method.
fn is_preview_path(path: &str) -> bool {
    let normalized = path.trim_start_matches('/');
    let lower = normalized.to_ascii_lowercase();
    lower.starts_with("api/preview/") || lower.starts_with("preview/")
}

/// Extract the validated admin user from a request. Used by write handlers
/// that want to record `created_by` / `updated_by` columns.
#[allow(dead_code)]
pub fn admin_user(req: &Request) -> Option<&AdminUser> {
    req.extensions().get::<AdminUser>()
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request as HttpRequest, StatusCode as AxStatus};
    use axum::middleware::from_fn;
    use axum::routing::get;
    use axum::Router;
    use jsonwebtoken::{encode, EncodingKey, Header};
    use tower::ServiceExt;

    const TEST_SECRET: &str = "test-secret-do-not-use-in-prod";

    fn mint_token(exp_offset_secs: i64) -> String {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let claims = AdminClaims {
            sub: Some("test-admin".into()),
            iat: Some(now as u64),
            exp: (now + exp_offset_secs) as u64,
        };
        encode(
            &Header::new(Algorithm::HS256),
            &claims,
            &EncodingKey::from_secret(TEST_SECRET.as_bytes()),
        )
        .unwrap()
    }

    fn test_router() -> Router {
        Router::new()
            .route(
                "/ping",
                get(|| async { "pong" }).post(|| async { "pong-post" }),
            )
            .route("/api/preview/x", get(|| async { "preview-pong" }))
            .route("/preview/x", get(|| async { "top-preview-pong" }))
            .route_layer(from_fn(require_admin))
    }

    #[tokio::test]
    async fn get_passes_without_token() {
        std::env::set_var("CMS_API_ADMIN_JWT_SECRET", TEST_SECRET);
        let resp = test_router()
            .oneshot(HttpRequest::get("/ping").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(resp.status(), AxStatus::OK);
    }

    #[tokio::test]
    async fn post_without_token_returns_401() {
        std::env::set_var("CMS_API_ADMIN_JWT_SECRET", TEST_SECRET);
        let resp = test_router()
            .oneshot(HttpRequest::post("/ping").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(resp.status(), AxStatus::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn post_with_valid_token_passes() {
        std::env::set_var("CMS_API_ADMIN_JWT_SECRET", TEST_SECRET);
        let token = mint_token(60);
        let resp = test_router()
            .oneshot(
                HttpRequest::post("/ping")
                    .header(header::AUTHORIZATION, format!("Bearer {token}"))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), AxStatus::OK);
    }

    #[tokio::test]
    async fn post_with_expired_token_returns_401() {
        std::env::set_var("CMS_API_ADMIN_JWT_SECRET", TEST_SECRET);
        let token = mint_token(-60); // expired 60s ago
        let resp = test_router()
            .oneshot(
                HttpRequest::post("/ping")
                    .header(header::AUTHORIZATION, format!("Bearer {token}"))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), AxStatus::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn post_with_wrong_secret_returns_401() {
        std::env::set_var("CMS_API_ADMIN_JWT_SECRET", TEST_SECRET);
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let claims = AdminClaims {
            sub: None,
            iat: Some(now),
            exp: now + 60,
        };
        let bad_token = encode(
            &Header::new(Algorithm::HS256),
            &claims,
            &EncodingKey::from_secret(b"different-secret"),
        )
        .unwrap();
        let resp = test_router()
            .oneshot(
                HttpRequest::post("/ping")
                    .header(header::AUTHORIZATION, format!("Bearer {bad_token}"))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), AxStatus::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn post_without_secret_returns_401() {
        std::env::remove_var("CMS_API_ADMIN_JWT_SECRET");
        let resp = test_router()
            .oneshot(HttpRequest::post("/ping").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(resp.status(), AxStatus::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn preview_get_requires_jwt() {
        std::env::set_var("CMS_API_ADMIN_JWT_SECRET", TEST_SECRET);
        let resp = test_router()
            .oneshot(
                HttpRequest::get("/api/preview/x")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), AxStatus::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn preview_get_with_jwt_passes() {
        std::env::set_var("CMS_API_ADMIN_JWT_SECRET", TEST_SECRET);
        let token = mint_token(60);
        let resp = test_router()
            .oneshot(
                HttpRequest::get("/api/preview/x")
                    .header(header::AUTHORIZATION, format!("Bearer {token}"))
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(resp.status(), AxStatus::OK);
    }

    #[tokio::test]
    async fn preview_top_level_path_also_requires_jwt() {
        std::env::set_var("CMS_API_ADMIN_JWT_SECRET", TEST_SECRET);
        // /preview/x (no /api prefix) must also require auth — the carve-out
        // applies regardless of whether /api is present in the path.
        let resp = test_router()
            .oneshot(HttpRequest::get("/preview/x").body(Body::empty()).unwrap())
            .await
            .unwrap();
        assert_eq!(resp.status(), AxStatus::UNAUTHORIZED);
    }
}
