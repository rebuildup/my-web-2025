/**
 * Server-side helpers for the workshop sidebar / related articles.
 *
 * Replaces `/api/workshop/random` and `/api/workshop/related`, which used
 * to be fetched at runtime by client components. With Next.js
 * `output: 'export'` the API routes never run (nginx returns 404 for
 * anything outside `/api/cms/…`), so the data is pre-computed at SSG
 * time and passed as props to the client components instead.
 */

import { getMarkdownPageCanonicalSlug } from "@/cms/lib/markdown-slug";
import {
	fetchCmsContentIndex,
	fetchMarkdownPages,
} from "@/lib/cms-api/server-data";

export type ArticleRecommendation = {
	slug: string;
	title: string;
	href: string;
	thumbnail: string | null;
	tags: string[];
};

function getThumbnail(
	page: {
		frontmatter?: Record<string, unknown>;
	},
	cmsContent: { thumbnails?: Record<string, unknown> } | undefined,
): string | null {
	if (cmsContent?.thumbnails) {
		const thumbs = cmsContent.thumbnails;
		const image = thumbs.image as { src?: unknown } | undefined;
		const gif = thumbs.gif as { src?: unknown } | undefined;
		const webm = thumbs.webm as { poster?: unknown } | undefined;
		if (image && typeof image.src === "string") return image.src;
		if (gif && typeof gif.src === "string") return gif.src;
		if (webm && typeof webm.poster === "string") return webm.poster;
	}

	const frontmatter = page.frontmatter ?? {};
	const candidates: Array<unknown> = [
		frontmatter.thumbnail,
		frontmatter.image,
		frontmatter.coverImage,
		frontmatter.heroImage,
	];
	for (const candidate of candidates) {
		if (typeof candidate === "string" && candidate.trim().length > 0) {
			return candidate;
		}
	}
	return null;
}

function getPageHref(page: {
	frontmatter?: Record<string, unknown>;
	slug?: string;
}): string {
	const fm = page.frontmatter ?? {};
	const possible: Array<unknown> = [fm.permalink, fm.url, fm.slug, page.slug];
	const target = possible.find(
		(value): value is string =>
			typeof value === "string" && value.trim().length > 0,
	);
	if (!target) return "#";
	if (/^https?:\/\//i.test(target)) return target;
	if (target.startsWith("/")) return target;
	return `/workshop/blog/${target}`;
}

type ArticleSummary = {
	slug: string;
	title: string;
	href: string;
	thumbnail: string | null;
	tags: string[];
};

// Module-level memoization: `loadArticleSummaries` is called by every blog
// page at SSG time. Without caching, each page would re-read the entire
// markdown-pages table plus the entries index, which blows past Next's
// 60s-per-page budget once the workshop grows past ~30 posts.
//
// Within a single `next build` worker process this promise resolves exactly
// once; subsequent calls (including parallel page renders) get the cached
// value. Different worker processes each compute their own copy, which is
// acceptable — the result is deterministic per process.
let summariesPromise: Promise<ArticleSummary[]> | null = null;

async function loadArticleSummaries(): Promise<ArticleSummary[]> {
	if (summariesPromise) return summariesPromise;
	summariesPromise = (async () => {
		const [markdownPages, allIndex] = await Promise.all([
			fetchMarkdownPages(),
			fetchCmsContentIndex(),
		]);
		const indexMap = new Map(allIndex.map((item) => [item.id, item]));

		const summaries: ArticleSummary[] = [];
		for (const page of markdownPages) {
			if ((page.status ?? "draft") !== "published") continue;
			const canonicalSlug = getMarkdownPageCanonicalSlug(page);
			if (typeof canonicalSlug !== "string" || canonicalSlug.length === 0)
				continue;

			const contentId = page.contentId || canonicalSlug;
			const cmsContent = indexMap.get(contentId);
			// Tags are already in the index entry — no need to round-trip
			// through `fetchCmsContentTags` (which would re-fetch the entire
			// index per call and turn this loop into O(N²)).
			const tags = cmsContent?.tags ?? [];
			summaries.push({
				slug: canonicalSlug,
				title:
					typeof page.frontmatter?.title === "string"
						? page.frontmatter.title
						: canonicalSlug,
				href: getPageHref(page),
				thumbnail: getThumbnail(page, cmsContent),
				tags,
			});
		}
		return summaries;
	})();
	return summariesPromise;
}

export async function getRandomArticles({
	excludeSlug,
	limit = 3,
}: {
	excludeSlug: string;
	limit?: number;
}): Promise<ArticleRecommendation[]> {
	const summaries = await loadArticleSummaries();
	const filtered = summaries.filter((a) => a.slug !== excludeSlug);
	// `Math.random()` is not stable across builds, so for static export we
	// shuffle deterministically by sorting on the slug. This means a rebuild
	// will not shuffle the recommendations, but it keeps them stable across
	// visitors, which is the trade-off we accept for `output: 'export'`.
	const shuffled = [...filtered].sort((a, b) =>
		a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0,
	);
	return shuffled.slice(0, Math.min(limit, shuffled.length));
}

export async function getRelatedArticles({
	slug,
	tags,
	limit = 6,
}: {
	slug: string;
	tags: string[];
	limit?: number;
}): Promise<ArticleRecommendation[]> {
	if (tags.length === 0) return [];
	const targetTags = tags.slice(0, 2);
	const summaries = await loadArticleSummaries();
	const related = summaries
		.filter((a) => a.slug !== slug)
		.filter((a) => targetTags.some((t) => a.tags.includes(t)));
	// Deterministic shuffle (see note in getRandomArticles).
	const shuffled = [...related].sort((a, b) =>
		a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0,
	);
	return shuffled.slice(0, Math.min(limit, shuffled.length));
}
