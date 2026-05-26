/**
 * Tag Management System backed by CMS API content data.
 */

import { loadContentByType } from "@/lib/data";
import type { ContentItem } from "@/types/content";
import type { TagInfo, TagManagementSystem } from "@/types/enhanced-content";

interface TagAggregate {
	count: number;
	firstUsed: string | null;
	lastUsed: string | null;
}

type TagCatalogEntry = {
	name: string;
	createdAt: string;
	lastUsed: string;
};

const runtimeTagCatalog = new Map<string, TagCatalogEntry>();

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
		if (!Array.isArray(item.tags)) continue;
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
			if (!current.firstUsed || new Date(timestamp) < new Date(current.firstUsed)) {
				current.firstUsed = timestamp;
			}
			if (!current.lastUsed || new Date(timestamp) > new Date(current.lastUsed)) {
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
	return {
		name,
		count: usage?.count ?? 0,
		createdAt: entry?.createdAt || usage?.firstUsed || nowIso,
		lastUsed: usage?.lastUsed || entry?.lastUsed || usage?.firstUsed || nowIso,
	};
}

export class PortfolioTagManager implements TagManagementSystem {
	async getAllTags(): Promise<TagInfo[]> {
		const items = await loadContentByType("portfolio");
		const usageMap = aggregateContentTags(items);
		const tagMap = new Map<string, TagInfo>();

		for (const [name, entry] of runtimeTagCatalog.entries()) {
			tagMap.set(name, mergeTagInfo(name, usageMap.get(name), entry));
		}
		for (const [name, usage] of usageMap.entries()) {
			if (!tagMap.has(name)) {
				tagMap.set(name, mergeTagInfo(name, usage, undefined));
			}
		}

		return Array.from(tagMap.values()).sort((a, b) =>
			b.count !== a.count
				? b.count - a.count
				: new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
		);
	}

	async createTag(name: string): Promise<TagInfo> {
		const normalizedName = normalizeTagName(name);
		if (!normalizedName) {
			throw new Error("Tag name must contain alphanumeric characters.");
		}
		const now = new Date().toISOString();
		runtimeTagCatalog.set(normalizedName, {
			name: normalizedName,
			createdAt: now,
			lastUsed: now,
		});
		const items = await loadContentByType("portfolio");
		const usage = aggregateContentTags(items).get(normalizedName);
		return mergeTagInfo(normalizedName, usage, runtimeTagCatalog.get(normalizedName));
	}

	async updateTagUsage(name: string): Promise<void> {
		const normalizedName = normalizeTagName(name);
		if (!normalizedName) return;
		const current = runtimeTagCatalog.get(normalizedName);
		const now = new Date().toISOString();
		runtimeTagCatalog.set(normalizedName, {
			name: normalizedName,
			createdAt: current?.createdAt || now,
			lastUsed: now,
		});
	}

	async deleteTag(name: string): Promise<boolean> {
		const normalizedName = normalizeTagName(name);
		if (!normalizedName) return false;
		const items = await loadContentByType("portfolio");
		const usage = aggregateContentTags(items).get(normalizedName);
		if (usage && usage.count > 0) return false;
		return runtimeTagCatalog.delete(normalizedName);
	}

	async searchTags(query: string): Promise<TagInfo[]> {
		if (!query) return [];
		const normalizedQuery = query.trim().toLowerCase();
		const all = await this.getAllTags();
		return all
			.filter((tag) => tag.name.toLowerCase().includes(normalizedQuery))
			.sort((a, b) => b.count - a.count);
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
			.slice(0, 10);
		return {
			totalTags: tags.length,
			totalUsage,
			mostUsedTag,
			recentlyCreated,
		};
	}

	async bulkUpdateTagUsage(tagNames: string[]): Promise<void> {
		const now = new Date().toISOString();
		for (const name of tagNames) {
			const normalized = normalizeTagName(name);
			if (!normalized) continue;
			const current = runtimeTagCatalog.get(normalized);
			runtimeTagCatalog.set(normalized, {
				name: normalized,
				createdAt: current?.createdAt || now,
				lastUsed: now,
			});
		}
	}

	async cleanupUnusedTags(): Promise<number> {
		const items = await loadContentByType("portfolio");
		const usageMap = aggregateContentTags(items);
		let deleted = 0;
		for (const name of Array.from(runtimeTagCatalog.keys())) {
			if (!usageMap.has(name) && runtimeTagCatalog.delete(name)) {
				deleted += 1;
			}
		}
		return deleted;
	}
}

export function createTagManager(): PortfolioTagManager {
	return new PortfolioTagManager();
}

export const portfolioTagManager = new PortfolioTagManager();
