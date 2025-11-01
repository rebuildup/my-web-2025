import {
	loadAllContentItems,
	loadContentById as loadCmsContentById,
	loadContentItemsByType,
	mapContentToContentItem,
} from "@/cms/server/content-service";
import type { Content } from "@/cms/types/content";
import type { ContentItem, ContentType } from "@/types";

function toContentItem(content: Content | null): ContentItem | null {
	if (!content) {
		return null;
	}
	const item = mapContentToContentItem(content);
	return item;
}

export async function loadContentByType(
	type: ContentType,
): Promise<ContentItem[]> {
	return loadContentItemsByType(type);
}

/**
 * Save content by type
 */
export async function saveContentByType(
	type: ContentType,
	content: ContentItem[],
): Promise<boolean> {
	console.warn(
		"[CMS] saveContentByType is no longer supported with the SQLite backend.",
		type,
		content,
	);
	return false;
}

/**
 * Get content by ID
 */
export async function getContentById(
	type: ContentType,
	id: string,
): Promise<ContentItem | null> {
	const content = toContentItem(loadCmsContentById(id));
	if (!content || content.type !== type) {
		return null;
	}
	return content;
}

/**
 * Add new content item
 */
export async function addContentItem(
	type: ContentType,
	item: ContentItem,
): Promise<boolean> {
	console.warn(
		"[CMS] addContentItem is no longer supported with the SQLite backend.",
		type,
		item,
	);
	return false;
}

/**
 * Update content item
 */
export async function updateContentItem(
	type: ContentType,
	id: string,
	updates: Partial<ContentItem>,
): Promise<boolean> {
	console.warn(
		"[CMS] updateContentItem is no longer supported with the SQLite backend.",
		type,
		id,
		updates,
	);
	return false;
}

/**
 * Delete content item
 */
export async function deleteContentItem(
	type: ContentType,
	id: string,
): Promise<boolean> {
	console.warn(
		"[CMS] deleteContentItem is no longer supported with the SQLite backend.",
		type,
		id,
	);
	return false;
}

/**
 * Load all content types
 */
export async function loadAllContent(): Promise<
	Record<ContentType, ContentItem[]>
> {
	const result = loadAllContentItems();
	return result;
}

/**
 * Search content across all types
 */
export async function searchContent(
	query: string,
	options: {
		type?: ContentType;
		category?: string;
		limit?: number;
		status?: "published" | "draft" | "archived" | "scheduled";
	} = {},
): Promise<ContentItem[]> {
	try {
		const { type, category, limit = 50, status = "published" } = options;

		let allContent: ContentItem[] = [];

		if (type) {
			allContent = await loadContentByType(type);
		} else {
			const contentByType = await loadAllContent();
			allContent = Object.values(contentByType).flat();
		}

		// Filter by status
		let filteredContent = allContent.filter((item) => item.status === status);

		// Filter by category
		if (category) {
			filteredContent = filteredContent.filter(
				(item) => item.category === category,
			);
		}

		// Search in title, description, and tags
		const searchResults = filteredContent.filter((item) => {
			const searchText =
				`${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
			return searchText.includes(query.toLowerCase());
		});

		// Sort by priority and creation date
		searchResults.sort((a, b) => {
			if (a.priority !== b.priority) {
				return b.priority - a.priority;
			}
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});

		return searchResults.slice(0, limit);
	} catch (error) {
		console.error("Failed to search content:", error);
		return [];
	}
}

/**
 * Get content statistics
 */
export async function getContentStatistics(): Promise<{
	totalItems: number;
	itemsByType: Record<ContentType, number>;
	itemsByStatus: Record<string, number>;
}> {
	try {
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
	} catch (error) {
		console.error("Failed to get content statistics:", error);
		return {
			totalItems: 0,
			itemsByType: {} as Record<ContentType, number>,
			itemsByStatus: {},
		};
	}
}

/**
 * Validate content item structure
 */
export function validateContentItem(item: unknown): item is ContentItem {
	return (
		typeof item === "object" &&
		item !== null &&
		typeof (item as ContentItem).id === "string" &&
		typeof (item as ContentItem).type === "string" &&
		typeof (item as ContentItem).title === "string" &&
		typeof (item as ContentItem).description === "string" &&
		typeof (item as ContentItem).category === "string" &&
		Array.isArray((item as ContentItem).tags) &&
		["published", "draft", "archived", "scheduled"].includes(
			(item as ContentItem).status,
		) &&
		typeof (item as ContentItem).priority === "number" &&
		typeof (item as ContentItem).createdAt === "string"
	);
}

/**
 * Generate unique ID for content items
 */
export function generateContentId(type: ContentType): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	return `${type}_${timestamp}_${random}`;
}

/**
 * Ensure data directories exist
 */
export async function ensureDataDirectories(): Promise<void> {
	// No-op: data directories are managed by the SQLite backend
}
