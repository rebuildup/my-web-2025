/**
 * Markdown URL normalization for static export.
 *
 * Markdown bodies can contain absolute URLs that point to a local CMS API
 * (e.g. `http://127.0.0.1:3001/media?contentId=…` or
 * `http://localhost:3010/api/cms/media?contentId=…`) when the post was
 * authored with a dev server. Those hosts are unreachable from visitors'
 * browsers in production, so we rewrite every dev-host URL to a relative
 * `/api/cms/media?…` path that Nginx proxies to the Rust CMS API.
 *
 * We handle three host variations (`127.0.0.1`, `localhost`, `0.0.0.0`),
 * any port, and three path shapes:
 *   * legacy `/media`            — needs `/api/cms` prefix added
 *   * canonical `/api/cms/media` — Nginx/Worker routes to Rust API
 *   * worker-routed `/api/media` — newer alias; also rewritten to `/api/cms/media`
 *
 * Any non-`/api/cms/media` capture is rewritten to `/api/cms/media`, so the
 * result is always rooted and the browser resolves it against the current
 * HTTPS origin (no Mixed Content for IP-host URLs).
 */

const DEV_HOST_PATTERN =
	/https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?((?:\/api(?:\/cms)?)?\/media[^\s"'<>]*)/g;

export function normalizeMarkdownUrls(content: string): string {
	if (!content) return content;
	return content.replace(DEV_HOST_PATTERN, (_match, path: string) =>
		path.startsWith("/api/cms/media")
			? path
			: `/api/cms/media${path.replace(/^\/api\/media/, "").replace(/^\/media/, "")}`,
	);
}
