import {
	fetchCmsContentById,
	fetchCmsContentIndex,
} from "@/lib/cms-api/server-data";
import type { ContentItem, ContentType } from "@/types";

function inferContentType(tags: string[]): ContentType {
	const normalized = tags.map((tag) => tag.toLowerCase());
	if (
		normalized.includes("develop") ||
		normalized.includes("video") ||
		normalized.includes("design") ||
		normalized.includes("video&design")
	) {
		return "portfolio";
	}
	return "other";
}

function pickCategory(tags: string[], type: ContentType): string {
	const normalized = tags.map((tag) => tag.toLowerCase());
	if (type === "portfolio") {
		if (normalized.includes("develop")) return "develop";
		if (normalized.includes("video")) return "video";
		if (normalized.includes("design")) return "design";
	}
	return tags[0] || type;
}

function mapContentToContentItem(content: {
	id: string;
	title: string;
	summary?: string;
	tags: string[];
	status?: string;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string | null;
	thumbnail?: string;
	ext?: Record<string, unknown>;
}): ContentItem {
	const type =
		typeof content.ext?.type === "string"
			? (content.ext.type as ContentType)
			: inferContentType(content.tags);

	return {
		id: content.id,
		type,
		title: content.title,
		description: content.summary || "",
		category: pickCategory(content.tags, type),
		tags: content.tags,
		status:
			content.status === "published" ||
			content.status === "archived" ||
			content.status === "scheduled"
				? content.status
				: "draft",
		priority: 0,
		createdAt: content.createdAt || new Date().toISOString(),
		updatedAt: content.updatedAt,
		publishedAt: content.publishedAt ?? undefined,
		thumbnail: content.thumbnail,
	};
}

export async function loadContentByType(
	type: ContentType,
): Promise<ContentItem[]> {
	const entries = await fetchCmsContentIndex();
	return entries
		.map(mapContentToContentItem)
		.filter((item) => item.type === type);
}

export async function saveContentByType(
	_type?: ContentType,
	_items?: ContentItem[],
): Promise<boolean> {
	console.warn("[CMS] saveContentByType is not supported from Next.js.");
	return false;
}

export async function getContentById(
	type: ContentType,
	id: string,
): Promise<ContentItem | null> {
	const content = await fetchCmsContentById(id);
	if (!content) {
		return null;
	}
	const item = mapContentToContentItem(content);
	return item.type === type ? item : null;
}

export async function addContentItem(
	_type?: ContentType,
	_item?: ContentItem,
): Promise<boolean> {
	console.warn("[CMS] addContentItem is not supported from Next.js.");
	return false;
}

export async function updateContentItem(
	_type?: ContentType,
	_item?: ContentItem,
): Promise<boolean> {
	console.warn("[CMS] updateContentItem is not supported from Next.js.");
	return false;
}

export async function deleteContentItem(
	_type?: ContentType,
	_id?: string,
): Promise<boolean> {
	console.warn("[CMS] deleteContentItem is not supported from Next.js.");
	return false;
}

export async function loadAllContent(): Promise<Record<ContentType, ContentItem[]>> {
	const entries = await fetchCmsContentIndex();
	return entries.reduce(
		(acc, entry) => {
			const item = mapContentToContentItem(entry);
			acc[item.type] = [...(acc[item.type] || []), item];
			return acc;
		},
		{} as Record<ContentType, ContentItem[]>,
	);
}

export async function searchContent(
	query: string,
	options: {
		type?: ContentType;
		category?: string;
		limit?: number;
		status?: "published" | "draft" | "archived" | "scheduled";
	} = {},
): Promise<ContentItem[]> {
	const { type, category, limit = 50, status = "published" } = options;
	const allContent = type
		? await loadContentByType(type)
		: Object.values(await loadAllContent()).flat();

	return allContent
		.filter((item) => item.status === status)
		.filter((item) => !category || item.category === category)
		.filter((item) =>
			`${item.title} ${item.description} ${item.tags.join(" ")}`
				.toLowerCase()
				.includes(query.toLowerCase()),
		)
		.slice(0, limit);
}

export async function getContentStatistics(): Promise<{
	totalItems: number;
	itemsByType: Record<ContentType, number>;
	itemsByStatus: Record<string, number>;
}> {
	const allContent = await loadAllContent();
	const flatContent = Object.values(allContent).flat();
	const itemsByType = Object.entries(allContent).reduce(
		(acc, [type, items]) => {
			acc[type as ContentType] = items.length;
			return acc;
		},
		{} as Record<ContentType, number>,
	);
	const itemsByStatus = flatContent.reduce(
		(acc, item) => {
			acc[item.status] = (acc[item.status] || 0) + 1;
			return acc;
		},
		{} as Record<string, number>,
	);

	return {
		totalItems: flatContent.length,
		itemsByType,
		itemsByStatus,
	};
}

export function validateContentItem(item: unknown): item is ContentItem {
	return (
		typeof item === "object" &&
		item !== null &&
		typeof (item as ContentItem).id === "string" &&
		typeof (item as ContentItem).type === "string" &&
		typeof (item as ContentItem).title === "string"
	);
}

export function generateContentId(type: ContentType): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	return `${type}_${timestamp}_${random}`;
}

export async function ensureDataDirectories(): Promise<void> {
	return;
}
