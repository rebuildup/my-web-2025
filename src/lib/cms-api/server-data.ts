import "server-only";

import { getAllFromIndex, getFromIndex } from "@/cms/lib/content-db-manager";
import type { MarkdownPage } from "@/cms/types/markdown";
import { shouldUseRustCmsApi } from "./config";
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
		thumbnail: item.thumbnail ?? undefined,
		thumbnails: item.thumbnail ? { image: { src: item.thumbnail } } : undefined,
	};
}

export async function fetchCmsContentIndex(): Promise<CmsContentIndexEntry[]> {
	if (!shouldUseRustCmsApi()) {
		const rows = getAllFromIndex();
		return rows.map((row) => ({
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
			thumbnail: row.thumbnails?.image
				? (row.thumbnails.image as { src?: string })?.src
				: undefined,
			thumbnails: row.thumbnails,
		}));
	}

	const entries = await cmsApiFetch<RustEntryListItem[]>("/entries");
	return entries.map(mapRustEntryListItem);
}

export async function fetchCmsContentById(
	id: string,
): Promise<CmsContentDetail | null> {
	if (!shouldUseRustCmsApi()) {
		const row = getFromIndex(id);
		if (!row) return null;
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
			thumbnail: row.thumbnails?.image
				? (row.thumbnails.image as { src?: string })?.src
				: undefined,
			thumbnails: row.thumbnails,
		};
	}

	const [detail, index] = await Promise.all([
		cmsApiFetch<RustEntryDetail>(`/entries/${encodeURIComponent(id)}`),
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
		thumbnail: indexEntry?.thumbnail,
		thumbnails: indexEntry?.thumbnail
			? { image: { src: indexEntry.thumbnail } }
			: undefined,
	};
}

export async function fetchCmsContentTags(
	contentId: string,
): Promise<string[]> {
	const entries = await fetchCmsContentIndex();
	return entries.find((item) => item.id === contentId)?.tags ?? [];
}

export async function fetchMarkdownPages(options?: {
	contentId?: string;
}): Promise<MarkdownPage[]> {
	const params = new URLSearchParams();
	if (options?.contentId) {
		params.set("contentId", options.contentId);
	}
	return await cmsApiFetch<MarkdownPage[]>(
		`/markdown${params.size > 0 ? `?${params.toString()}` : ""}`,
	);
}

export async function fetchMarkdownPageBySlug(
	slug: string,
	options?: { contentId?: string },
): Promise<MarkdownPage | null> {
	const params = new URLSearchParams({ slug });
	if (options?.contentId) {
		params.set("contentId", options.contentId);
	}

	try {
		return await cmsApiFetch<MarkdownPage>(`/markdown?${params.toString()}`);
	} catch {
		return null;
	}
}
