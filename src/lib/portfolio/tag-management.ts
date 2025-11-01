/**
 * Tag Management System backed by the SQLite content catalog.
 * Replaces legacy JSON persistence while maintaining the TagManagementSystem interface.
 */

import {
	listTagCatalogEntries,
	removeTagCatalogEntry,
	type TagCatalogEntry,
	upsertTagCatalogEntry,
} from "@/cms/lib/content-db-manager";
import { loadContentByType } from "@/lib/data";
import type { ContentItem } from "@/types/content";
import type { TagInfo, TagManagementSystem } from "@/types/enhanced-content";

interface TagAggregate {
	count: number;
	firstUsed: string | null;
	lastUsed: string | null;
}

function normalizeTagName(name: string): string {
	return name
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "")
		.replace(/[^\p{L}\p{N}-]/gu, "")
		.trim();
}

function deriveItemTimestamp(item: ContentItem): string {
	return (
		item.updatedAt ||
		item.publishedAt ||
		item.createdAt ||
		new Date().toISOString()
	);
}

function aggregateContentTags(items: ContentItem[]): Map<string, TagAggregate> {
	const map = new Map<string, TagAggregate>();

	for (const item of items) {
		if (!Array.isArray(item.tags) || item.tags.length === 0) {
			continue;
		}
		const timestamp = deriveItemTimestamp(item);

		for (const rawTag of item.tags) {
			if (typeof rawTag !== "string") continue;
			const tag = normalizeTagName(rawTag);
			if (!tag) continue;

			const current = map.get(tag) ?? {
				count: 0,
				firstUsed: timestamp,
				lastUsed: timestamp,
			};
			current.count += 1;

			if (
				!current.firstUsed ||
				new Date(timestamp) < new Date(current.firstUsed)
			) {
				current.firstUsed = timestamp;
			}
			if (
				!current.lastUsed ||
				new Date(timestamp) > new Date(current.lastUsed)
			) {
				current.lastUsed = timestamp;
			}
			map.set(tag, current);
		}
	}

	return map;
}

function mergeTagInfo(
	name: string,
	usage: TagAggregate | undefined,
	entry: TagCatalogEntry | undefined,
): TagInfo {
	const nowIso = new Date().toISOString();
	const count = usage?.count ?? 0;
	const createdAt = entry?.created_at || usage?.firstUsed || nowIso;
	const lastUsed =
		usage?.lastUsed ||
		entry?.last_used ||
		usage?.firstUsed ||
		createdAt ||
		nowIso;

	return {
		name,
		count,
		createdAt,
		lastUsed,
	};
}

export class PortfolioTagManager implements TagManagementSystem {
	async getAllTags(): Promise<TagInfo[]> {
		const [items, catalog] = await Promise.all([
			loadContentByType("portfolio"),
			Promise.resolve(listTagCatalogEntries()),
		]);

		const usageMap = aggregateContentTags(items);
		const tagMap = new Map<string, TagInfo>();

		for (const entry of catalog) {
			const normalizedName = normalizeTagName(entry.name);
			const info = mergeTagInfo(
				normalizedName,
				usageMap.get(normalizedName),
				entry,
			);
			tagMap.set(normalizedName, info);
		}

		for (const [name, aggregate] of usageMap.entries()) {
			if (!tagMap.has(name)) {
				tagMap.set(name, mergeTagInfo(name, aggregate, undefined));
			}
		}

		return Array.from(tagMap.values()).sort((a, b) => {
			if (a.count !== b.count) {
				return b.count - a.count;
			}
			return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
		});
	}

	async createTag(name: string): Promise<TagInfo> {
		const normalizedName = normalizeTagName(name);
		if (!normalizedName) {
			throw new Error("Tag name must contain alphanumeric characters.");
		}

		const now = new Date().toISOString();
		upsertTagCatalogEntry({
			name: normalizedName,
			createdAt: now,
			lastUsed: now,
		});

		const items = await loadContentByType("portfolio");
		const usage = aggregateContentTags(items).get(normalizedName);

		return mergeTagInfo(normalizedName, usage, {
			name: normalizedName,
			created_at: now,
			last_used: now,
			metadata: null,
		});
	}

	async updateTagUsage(name: string): Promise<void> {
		const normalizedName = normalizeTagName(name);
		if (!normalizedName) {
			return;
		}
		const now = new Date().toISOString();
		upsertTagCatalogEntry({
			name: normalizedName,
			lastUsed: now,
		});
	}

	async deleteTag(name: string): Promise<boolean> {
		const normalizedName = normalizeTagName(name);
		if (!normalizedName) {
			return false;
		}

		const items = await loadContentByType("portfolio");
		const usage = aggregateContentTags(items).get(normalizedName);
		if (usage && usage.count > 0) {
			// Cannot delete a tag that is still used by content
			return false;
		}

		return removeTagCatalogEntry(normalizedName);
	}

	async searchTags(query: string): Promise<TagInfo[]> {
		if (!query) {
			return [];
		}
		const normalizedQuery = query.trim().toLowerCase();
		const all = await this.getAllTags();

		const matches = all.filter((tag) =>
			tag.name.toLowerCase().includes(normalizedQuery),
		);

		return matches.sort((a, b) => {
			const aExact = a.name.toLowerCase() === normalizedQuery;
			const bExact = b.name.toLowerCase() === normalizedQuery;
			if (aExact && !bExact) return -1;
			if (!aExact && bExact) return 1;
			return b.count - a.count;
		});
	}

	async getTagStats(): Promise<{
		totalTags: number;
		totalUsage: number;
		mostUsedTag?: TagInfo;
		recentlyCreated: TagInfo[];
	}> {
		const tags = await this.getAllTags();
		const totalUsage = tags.reduce((sum, tag) => sum + tag.count, 0);
		const mostUsedTag = tags[0];

		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const recentlyCreated = tags
			.filter((tag) => new Date(tag.createdAt) > thirtyDaysAgo)
			.sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			)
			.slice(0, 10);

		return {
			totalTags: tags.length,
			totalUsage,
			mostUsedTag,
			recentlyCreated,
		};
	}

	async bulkUpdateTagUsage(tagNames: string[]): Promise<void> {
		if (!Array.isArray(tagNames) || tagNames.length === 0) {
			return;
		}
		const now = new Date().toISOString();
		for (const name of tagNames) {
			const normalized = normalizeTagName(name);
			if (!normalized) continue;
			upsertTagCatalogEntry({
				name: normalized,
				lastUsed: now,
			});
		}
	}

	async cleanupUnusedTags(): Promise<number> {
		const ninetyDaysAgo = new Date();
		ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

		const [items, catalog] = await Promise.all([
			loadContentByType("portfolio"),
			Promise.resolve(listTagCatalogEntries()),
		]);
		const usageMap = aggregateContentTags(items);

		let removed = 0;
		for (const entry of catalog) {
			const name = normalizeTagName(entry.name);
			const usage = usageMap.get(name);
			const count = usage?.count ?? 0;
			const lastUsed =
				usage?.lastUsed ||
				entry.last_used ||
				usage?.firstUsed ||
				entry.created_at;

			if (
				count === 0 &&
				lastUsed &&
				new Date(lastUsed) < ninetyDaysAgo &&
				removeTagCatalogEntry(name)
			) {
				removed += 1;
			}
		}

		return removed;
	}

	resetCache(): void {
		// No in-memory cache is currently maintained.
	}

	getCacheSize(): number {
		return 0;
	}
}

export const portfolioTagManager = new PortfolioTagManager();

export const createTagManager = (): PortfolioTagManager =>
	new PortfolioTagManager();
