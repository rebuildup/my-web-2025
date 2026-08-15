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
 * any port, and both the canonical `/api/cms/media` form and the legacy
 * `/media` form. The legacy form has to gain the `/api/cms` prefix;
 * Nginx only proxies `/api/` to the Rust API, so a bare `/media?…` would
 * hit the static export and 404.
 */

const DEV_HOST_PATTERN =
	/https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?((?:\/api\/cms)?\/media[^\s"'<>]*)/g;

export function normalizeMarkdownUrls(content: string): string {
	if (!content) return content;
	return content.replace(DEV_HOST_PATTERN, (_match, path: string) =>
		path.startsWith("/api/cms/media") ? path : `/api/cms${path}`,
	);
}
