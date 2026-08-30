import "server-only";

import {
	getAllFromIndex,
	getAllMarkdownPagesFromLocal,
	getFromIndex,
} from "@/cms/lib/content-db-manager";
import { getMarkdownPageCanonicalSlug } from "@/cms/lib/markdown-slug";
import type { MarkdownPage } from "@/cms/types/markdown";
import { resolveMediaUrl, shouldUseRustCmsApi } from "./config";
import { cmsApiFetch } from "./server-client";

export type CmsContentIndexEntry = {
	id: string;
	title: string;
	summary?: string;
	lang?: string;
	status?: string;
	visibility?: string;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string | null;
	tags: string[];
	thumbnail?: string;
	thumbnails?: Record<string, unknown>;
};

export type CmsContentDetail = CmsContentIndexEntry & {
	path?: string;
	depth?: number;
	order?: number;
	parentId?: string;
	ext?: Record<string, unknown>;
	assets?: Array<Record<string, unknown>>;
	links?: Array<Record<string, unknown>>;
	thumbnails?: Record<string, unknown>;
};

type RustEntryListItem = {
	id: string;
	entry_type: string;
	status: string;
	visibility: string;
	title: string;
	summary?: string | null;
	lang: string;
	published_at?: string | null;
	created_at: string;
	updated_at: string;
	slug?: string | null;
	thumbnail?: string | null;
	tags?: string | null;
};

type RustEntryDetail = {
	id: string;
	entry_type: string;
	status: string;
	visibility: string;
	title: string;
	summary?: string | null;
	lang: string;
	path?: string | null;
	depth: number;
	order: number;
	parent_id?: string | null;
	published_at?: string | null;
	created_at: string;
	updated_at: string;
	slug?: string | null;
};

function parseTags(tags?: string | null): string[] {
	return tags
		? tags
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean)
		: [];
}

// Rewrite every URL-shaped field in a `thumbnails` object so any
// 127.0.0.1/localhost URL stored from a local CMS upload gets replaced with
// the build-time public host before the row reaches the static export.
// Covers `image.src`, `gif.src`, and `webm.{src,poster}` — newer CMS uploads
// via `useContentFormMedia.ts` write to all three.
type RawThumbnails = {
	image?: { src?: string };
	gif?: { src?: string };
	webm?: { src?: string; poster?: string };
};

function rewriteThumbnails(
	thumbnails: RawThumbnails | undefined,
): RawThumbnails | undefined {
	if (!thumbnails) return undefined;
	const rewriteSrc = (value: string | undefined) =>
		value ? (resolveMediaUrl(value) ?? value) : value;
	return {
		...thumbnails,
		image: thumbnails.image
			? { src: rewriteSrc(thumbnails.image.src) as string }
			: thumbnails.image,
		gif: thumbnails.gif
			? { src: rewriteSrc(thumbnails.gif.src) as string }
			: thumbnails.gif,
		webm: thumbnails.webm
			? {
					...thumbnails.webm,
					src: rewriteSrc(thumbnails.webm.src) as string,
					poster: rewriteSrc(thumbnails.webm.poster) as string,
				}
			: thumbnails.webm,
	};
}

function mapRustEntryListItem(item: RustEntryListItem): CmsContentIndexEntry {
	return {
		id: item.id,
		title: item.title,
		summary: item.summary ?? undefined,
		lang: item.lang,
		status: item.status,
		visibility: item.visibility,
		createdAt: item.created_at,
		updatedAt: item.updated_at,
		publishedAt: item.published_at ?? null,
		tags: parseTags(item.tags),
		thumbnail: resolveMediaUrl(item.thumbnail ?? undefined),
		thumbnails: item.thumbnail
			? { image: { src: resolveMediaUrl(item.thumbnail) ?? item.thumbnail } }
			: undefined,
	};
}

export async function fetchCmsContentIndex(): Promise<CmsContentIndexEntry[]> {
	if (!shouldUseRustCmsApi()) {
		const rows = getAllFromIndex();
		return rows.map((row) => {
			const rewritten = rewriteThumbnails(
				row.thumbnails as RawThumbnails | undefined,
			);
			const storedThumb = rewritten?.image?.src;
			return {
				id: row.id,
				title: row.title,
				summary: row.summary || undefined,
				lang: row.lang,
				status: row.status,
				visibility: row.visibility,
				createdAt: row.createdAt,
				updatedAt: row.updatedAt,
				publishedAt: row.publishedAt ?? null,
				tags: row.tags ?? [],
				thumbnail: storedThumb,
				thumbnails: rewritten,
			};
		});
	}

	try {
		// Use the canonical `/api/entries` alias. The Rust CMS API also
		// mounts `/entries`, but the Cloudflare Worker router only proxies
		// `/api/*` to the Container (`workers/router/src/index.ts:122-131`).
		// Bare `/entries` falls into the static-API collision branch and
		// returns a 500 (Cloudflare 1101) on POST. Going through `/api/`
		// works for both the Worker URL and a direct Rust API at port 3001.
		const entries = await cmsApiFetch<RustEntryListItem[]>("/api/entries");
		return entries.map(mapRustEntryListItem);
	} catch (error) {
		console.warn(
			"[CMS] Rust CMS API unavailable; returning empty index",
			error,
		);
		return [];
	}
}

export async function fetchCmsContentById(
	id: string,
): Promise<CmsContentDetail | null> {
	if (!shouldUseRustCmsApi()) {
		const row = getFromIndex(id);
		if (!row) return null;
		const rewritten = rewriteThumbnails(
			row.thumbnails as RawThumbnails | undefined,
		);
		const storedThumb = rewritten?.image?.src;
		return {
			id: row.id,
			title: row.title,
			summary: row.summary || undefined,
			lang: row.lang,
			status: row.status,
			visibility: row.visibility,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt,
			publishedAt: row.publishedAt ?? null,
			tags: row.tags ?? [],
			thumbnail: storedThumb,
			thumbnails: rewritten,
		};
	}

	try {
		const [detail, index] = await Promise.all([
			cmsApiFetch<RustEntryDetail>(`/api/entries/${encodeURIComponent(id)}`),
			fetchCmsContentIndex(),
		]);
		const indexEntry = index.find((item) => item.id === id);
		return {
			...indexEntry,
			id: detail.id,
			title: detail.title,
			summary: detail.summary ?? indexEntry?.summary,
			lang: detail.lang,
			status: detail.status,
			visibility: detail.visibility,
			createdAt: detail.created_at,
			updatedAt: detail.updated_at,
			publishedAt: detail.published_at ?? null,
			path: detail.path ?? undefined,
			depth: detail.depth,
			order: detail.order,
			parentId: detail.parent_id ?? undefined,
			ext: {
				type: detail.entry_type,
				slug: detail.slug ?? undefined,
			},
			tags: indexEntry?.tags ?? [],
			thumbnail: resolveMediaUrl(indexEntry?.thumbnail),
			thumbnails: indexEntry?.thumbnails ?? undefined,
		};
	} catch (error) {
		console.warn(
			`[CMS] Rust CMS API unavailable for content ${id}; returning null`,
			error,
		);
		return null;
	}
}

export async function fetchCmsContentTags(
	contentId: string,
): Promise<string[]> {
	const entries = await getCmsContentIndexCached();
	return entries.find((item) => item.id === contentId)?.tags ?? [];
}

// Module-level memoization for the entries index. Without this, each call
// re-reads every per-content SQLite DB on disk (213 files in this
// project), which dominated the SSG build time on workshop blog pages.
// Within one `next build` worker process the index resolves exactly once;
// different worker processes compute their own copy, which is acceptable
// because the index is identical and read-only during build.
let indexPromise: Promise<CmsContentIndexEntry[]> | null = null;
export function getCmsContentIndexCached(): Promise<CmsContentIndexEntry[]> {
	if (!indexPromise) {
		indexPromise = fetchCmsContentIndex().catch((err) => {
			// Reset on failure so a later call can retry.
			indexPromise = null;
			throw err;
		});
	}
	return indexPromise;
}

export async function fetchMarkdownPages(options?: {
	contentId?: string;
}): Promise<MarkdownPage[]> {
	const params = new URLSearchParams();
	if (options?.contentId) {
		params.set("contentId", options.contentId);
	}
	if (!shouldUseRustCmsApi()) {
		return getAllMarkdownPagesFromLocal(
			options?.contentId ? { contentId: options.contentId } : undefined,
		);
	}
	try {
		return await cmsApiFetch<MarkdownPage[]>(
			`/api/markdown${params.size > 0 ? `?${params.toString()}` : ""}`,
		);
	} catch (error) {
		console.error(
			"[CMS] fetchMarkdownPages Rust CMS unreachable; falling back to local SQLite",
			error,
		);
		return getAllMarkdownPagesFromLocal(
			options?.contentId ? { contentId: options.contentId } : undefined,
		);
	}
}

export async function fetchMarkdownPageBySlug(
	slug: string,
	options?: { contentId?: string },
): Promise<MarkdownPage | null> {
	const localFallback = () => {
		const pages = getAllMarkdownPagesFromLocal(
			options?.contentId ? { contentId: options.contentId } : undefined,
		);
		return (
			pages.find((p) => {
				if (p.slug === slug) return true;
				if (p.contentId === slug) return true;
				return getMarkdownPageCanonicalSlug(p) === slug;
			}) ?? null
		);
	};

	if (!shouldUseRustCmsApi()) {
		return localFallback();
	}

	const params = new URLSearchParams({ slug });
	if (options?.contentId) {
		params.set("contentId", options.contentId);
	}

	try {
		return await cmsApiFetch<MarkdownPage>(
			`/api/markdown?${params.toString()}`,
		);
	} catch (error) {
		console.error(
			"[CMS] fetchMarkdownPageBySlug Rust CMS unreachable; falling back to local SQLite",
			error,
		);
		return localFallback();
	}
}
