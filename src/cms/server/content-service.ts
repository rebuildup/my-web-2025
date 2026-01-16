import "server-only";

import { getAllFromIndex, getContentDb } from "@/cms/lib/content-db-manager";
import { getFullContent } from "@/cms/lib/content-mapper";
import type { Content } from "@/cms/types/content";
import type { ContentItem, ContentType } from "@/types/content";

type ExternalLinkItem = NonNullable<ContentItem["externalLinks"]>[number];

function readContent(id: string): Content | null {
	const db = getContentDb(id);
	try {
		const full = getFullContent(db, id);
		return full;
	} finally {
		db.close();
	}
}

export function loadAllContents(): Content[] {
	const entries = getAllFromIndex();
	const contents: Content[] = [];

	if (process.env.NODE_ENV !== "production") {
		console.log(
			`[ContentService] Loading ${entries.length} contents from index`,
		);
		console.log(
			`[ContentService] Index entries:`,
			entries.map((e) => ({ id: e.id, status: e.status })),
		);
	}

	for (const entry of entries) {
		try {
			const content = readContent(entry.id);
			if (content) {
				contents.push(content);
			} else {
				if (process.env.NODE_ENV !== "production") {
					console.warn(
						`[ContentService] Failed to load content for ID: ${entry.id}`,
					);
				}
			}
		} catch (error) {
			if (process.env.NODE_ENV !== "production") {
				console.error(
					`[ContentService] Error loading content ${entry.id}:`,
					error,
				);
			}
		}
	}

	if (process.env.NODE_ENV !== "production") {
		console.log(
			`[ContentService] Successfully loaded ${contents.length} contents`,
		);
	}
	return contents;
}

export function loadContentById(id: string): Content | null {
	return readContent(id);
}

export function loadContentsByType(type: ContentType): Content[] {
	const allContents = loadAllContents();
	const filtered = allContents.filter((content) => {
		const extType =
			typeof content.ext?.type === "string" ? content.ext.type : undefined;
		// デバッグ: typeフィルタリングをログ出力
		if (process.env.NODE_ENV !== "production") {
			console.log(
				`[ContentService] Filtering content: ${content.id}, type: ${extType}, requested type: ${type}`,
			);
		}
		return extType === type;
	});

	if (process.env.NODE_ENV !== "production") {
		console.log(
			`[ContentService] Total contents: ${allContents.length}, Filtered for type "${type}": ${filtered.length}`,
		);
		console.log(
			`[ContentService] Filtered content IDs:`,
			filtered.map((c) => c.id),
		);
	}
	return filtered;
}

export function mapContentToContentItem(content: Content): ContentItem | null {
	const ext = (content.ext ?? {}) as Record<string, unknown>;
	const type = (ext.type as ContentType | undefined) ?? "portfolio";
	if (!content.title || !content.id) {
		return null;
	}

	const status =
		(ext.status as ContentItem["status"] | undefined) ??
		(content.status === "published"
			? "published"
			: content.status === "archived"
				? "archived"
				: "draft");

	const tags = Array.isArray(content.tags)
		? content.tags.filter((tag): tag is string => typeof tag === "string")
		: [];

	const category =
		typeof ext.category === "string"
			? ext.category
			: Array.isArray(content.tags) && content.tags.length > 0
				? content.tags[0]
				: "";

	const priority =
		typeof ext.priority === "number"
			? ext.priority
			: typeof ext.priority === "string"
				? Number.parseInt(ext.priority, 10) || 0
				: 0;

	const thumbnail = (() => {
		const variants = content.thumbnails;
		if (variants) {
			// choose by prefer order, else fallback to image/gif/webm poster
			const prefer = Array.isArray(variants.prefer)
				? variants.prefer
				: ["webm", "gif", "image"];
			for (const key of prefer) {
				if (key === "image" && variants.image?.src) return variants.image.src;
				if (key === "gif" && variants.gif?.src) return variants.gif.src;
				if (key === "webm" && variants.webm?.poster)
					return variants.webm.poster;
			}
			if (variants.image?.src) return variants.image.src;
			if (variants.gif?.src) return variants.gif.src;
			if (variants.webm?.poster) return variants.webm.poster;
		}
		if (Array.isArray(content.assets) && content.assets.length > 0) {
			return content.assets[0]?.src ?? undefined;
		}
		return undefined;
	})();

	const images =
		Array.isArray(content.assets) && content.assets.length > 0
			? content.assets
					.map((asset) =>
						typeof asset.src === "string" ? asset.src : undefined,
					)
					.filter((src): src is string => Boolean(src))
			: undefined;

	const externalLinks =
		Array.isArray(content.links) && content.links.length > 0
			? content.links
					.map((link) => {
						if (!link.href) {
							return null;
						}
						const type = typeof link.rel === "string" ? link.rel : "other";
						return {
							type: type as ExternalLinkItem["type"],
							url: link.href,
							title: link.label ?? link.href,
							description: link.description ?? undefined,
						} as ExternalLinkItem;
					})
					.filter((link): link is ExternalLinkItem => link !== null)
			: undefined;

	const base: ContentItem = {
		id: content.id,
		type,
		title: content.title,
		description:
			typeof content.summary === "string"
				? content.summary
				: ((ext.description as string | undefined) ?? ""),
		category: category || type,
		tags,
		status,
		priority,
		createdAt: content.createdAt ?? new Date().toISOString(),
		updatedAt: content.updatedAt,
		publishedAt: content.publishedAt ?? undefined,
		thumbnail,
		images,
		externalLinks,
		content: (ext.body as string | undefined) ?? undefined,
		markdownPath:
			typeof ext.markdownPath === "string" ? ext.markdownPath : undefined,
		markdownMigrated:
			typeof ext.markdownMigrated === "boolean"
				? ext.markdownMigrated
				: undefined,
		stats: (ext.stats as ContentItem["stats"]) ?? undefined,
		seo: (content.seo as ContentItem["seo"]) ?? undefined,
		customFields:
			typeof ext.customFields === "object" && ext.customFields !== null
				? (ext.customFields as Record<string, unknown>)
				: undefined,
		aspectRatio:
			typeof ext.aspectRatio === "number"
				? ext.aspectRatio
				: typeof ext.aspectRatio === "string"
					? Number.parseFloat(ext.aspectRatio)
					: undefined,
	};

	if (ext.downloadInfo && typeof ext.downloadInfo === "object") {
		base.downloadInfo = ext.downloadInfo as ContentItem["downloadInfo"];
	}

	return base;
}

export function loadContentItemsByType(type: ContentType): ContentItem[] {
	return loadContentsByType(type)
		.map((content) => mapContentToContentItem(content))
		.filter((item): item is ContentItem => item !== null);
}

export function loadAllContentItems(): Record<ContentType, ContentItem[]> {
	const result = {} as Record<ContentType, ContentItem[]>;
	const all = loadAllContents();
	for (const content of all) {
		const item = mapContentToContentItem(content);
		if (!item) continue;
		const items = result[item.type] ?? [];
		items.push(item);
		result[item.type] = items;
	}
	return result;
}
