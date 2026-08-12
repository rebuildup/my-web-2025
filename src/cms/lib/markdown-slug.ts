/**
 * Canonical markdown-page slug helpers.
 *
 * The CMS keeps two parallel sources of slug-ish identifiers: the
 * `markdown_pages.slug` column in SQLite and the frontmatter
 * `slug` / `permalink` / `url` fields. These can drift (admin edits the
 * free-text slug, frontmatter is rewritten by an external tool, etc.) and
 * Next.js's `output: export` build fails the moment a `<Link href>` derived
 * from one source no longer matches a `generateStaticParams` entry built
 * from the other.
 *
 * `getMarkdownPageCanonicalSlug` is the single source of truth: callers must
 * use it everywhere a URL slug is needed (route params, `<Link href>`,
 * detail-page lookups) so all three converge on the same identifier.
 */

import type { MarkdownFrontmatter, MarkdownPage } from "@/cms/types/markdown";

function readString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim().length > 0
		? value.trim()
		: undefined;
}

function lastPathSegment(value: string): string {
	const trimmed = value.replace(/^\/+/, "").replace(/\/+$/, "");
	if (trimmed.length === 0) return value;
	const segments = trimmed.split("/").filter(Boolean);
	return segments.length > 0 ? segments[segments.length - 1] : trimmed;
}

/**
 * Return the canonical local-route slug for a markdown page, or `null` when
 * no slug can be derived. Priority order:
 *
 *   1. frontmatter `permalink`
 *   2. frontmatter `url`
 *   3. frontmatter `slug`
 *   4. DB column `page.slug`
 *   5. DB column `page.contentId`
 *
 * Absolute paths are reduced to their last segment (e.g.
 * `/workshop/blog/MyArticle` → `MyArticle`). External URLs
 * (`https?://...`) are skipped so the next candidate can win — only when
 * every candidate is empty or external do we return `null`.
 */
export function getMarkdownPageCanonicalSlug(
	page: MarkdownPage,
): string | null {
	const fm = (page.frontmatter ?? {}) as MarkdownFrontmatter &
		Record<string, unknown>;
	const candidates = [
		readString(fm.permalink),
		readString(fm.url),
		readString(fm.slug),
		readString(page.slug),
		readString(page.contentId),
	];

	for (const candidate of candidates) {
		if (!candidate) continue;
		if (/^https?:\/\//i.test(candidate)) continue;
		if (candidate.startsWith("/")) {
			const segment = lastPathSegment(candidate);
			if (segment) return segment;
			continue;
		}
		return candidate;
	}

	return null;
}

/**
 * Return the canonical local-route slug when `page` is a contentId (not a
 * MarkdownPage) — for routes like `/portfolio/[slug]` whose `generateStatic
 * Params` enumerates arbitrary content identifiers.
 */
export function getContentItemCanonicalSlug(item: {
	id: string;
	slug?: string | null;
}): string {
	const fromSlug = readString(item.slug ?? undefined);
	if (fromSlug) {
		if (/^https?:\/\//i.test(fromSlug)) return item.id;
		if (fromSlug.startsWith("/")) {
			const segment = lastPathSegment(fromSlug);
			if (segment) return segment;
		} else {
			return fromSlug;
		}
	}
	return item.id;
}

/**
 * Resolve a `<Link href>`-ready path for a markdown page.
 *
 * - permalink / url that is an absolute URL (`https?://...`) is returned as-is.
 * - permalink / url that is an absolute path (`/foo/bar`) is returned as-is.
 * - otherwise the canonical slug is wrapped in `/workshop/blog/<slug>`.
 * - returns `"#"` when no slug can be derived (matches the previous
 *   `getPageHref` fallback so existing callers can keep rendering placeholders).
 */
export function getMarkdownPageCanonicalHref(page: MarkdownPage): string {
	const fm = (page.frontmatter ?? {}) as MarkdownFrontmatter &
		Record<string, unknown>;
	const permalink = readString(fm.permalink);
	if (permalink) {
		if (/^https?:\/\//i.test(permalink)) return permalink;
		if (permalink.startsWith("/")) return permalink;
	}
	const url = readString(fm.url);
	if (url) {
		if (/^https?:\/\//i.test(url)) return url;
		if (url.startsWith("/")) return url;
	}

	const slug = getMarkdownPageCanonicalSlug(page);
	if (!slug) return "#";
	return `/workshop/blog/${slug}`;
}
