/**
 * Transformation utilities for Video & Design gallery items.
 * Pure helpers for filtering, deduplication, sorting, and category-to-enhanced
 * conversion extracted from VideoDesignGallery useMemo callbacks.
 */

import { enhancedGalleryFilter } from "@/lib/portfolio/enhanced-gallery-filter";
import type {
	EnhancedCategoryType,
	EnhancedContentItem,
} from "@/types/enhanced-content";
import type { PortfolioContentItem } from "@/types/portfolio";
import type { GalleryItem } from "./validation.utils";
import { isEnhancedItem } from "./validation.utils";

export interface CategoryFilterOptions {
	showVideoItems: boolean;
	showDesignItems: boolean;
	showVideoDesignItems: boolean;
}

const RELEVANT_CATEGORIES: readonly EnhancedCategoryType[] = [
	"video",
	"design",
	"video&design",
];

/**
 * Check whether the given (single) category string is in the
 * video/design/video&design set we want to display.
 */
export function isRelevantCategory(
	category: string | EnhancedCategoryType,
): boolean {
	return RELEVANT_CATEGORIES.includes(category as EnhancedCategoryType);
}

/**
 * Apply the per-category display options and the implicit "exclude other" rule.
 * Used by both the production and test filtering paths.
 */
export function filterByCategoryDisplay(
	items: GalleryItem[],
	options: CategoryFilterOptions,
): GalleryItem[] {
	return items.filter((item) => {
		if (isEnhancedItem(item)) {
			const relevant = item.categories.filter((cat) => isRelevantCategory(cat));
			const hasVideo = relevant.includes("video");
			const hasDesign = relevant.includes("design");
			const hasVideoDesign = relevant.includes("video&design");

			const shouldShow =
				(options.showVideoItems && hasVideo) ||
				(options.showDesignItems && hasDesign) ||
				(options.showVideoDesignItems && hasVideoDesign);

			return shouldShow;
		}

		const legacyItem = item as PortfolioContentItem;
		const category = legacyItem.category;
		return (
			(options.showVideoItems && category === "video") ||
			(options.showDesignItems && category === "design") ||
			(options.showVideoDesignItems && category === "video&design")
		);
	});
}

/**
 * Drop items in the "other" category — not part of the video&design gallery.
 */
export function filterOutOtherCategory(items: GalleryItem[]): GalleryItem[] {
	return items.filter((item) => {
		if (isEnhancedItem(item)) {
			return !item.categories.includes("other");
		}
		return (item as PortfolioContentItem).category !== "other";
	});
}

/**
 * Drop items in the video/design/video&design set when no display flags
 * match. Inverse of filterByCategoryDisplay, used in test environment
 * where we want only the relevant categories.
 */
export function filterToRelevantCategories(
	items: GalleryItem[],
): GalleryItem[] {
	return items.filter((item) => {
		if (isEnhancedItem(item)) {
			return item.categories.some((cat) => isRelevantCategory(cat));
		}
		const legacyItem = item as PortfolioContentItem;
		return isRelevantCategory(legacyItem.category);
	});
}

/**
 * Remove duplicate items by id. Caller passes the current dedup setting.
 */
export function deduplicateItems(items: GalleryItem[]): GalleryItem[] {
	const seen = new Set<string>();
	return items.filter((item) => {
		if (seen.has(item.id)) {
			console.log(`VideoDesignGallery: Removing duplicate item ${item.id}`);
			return false;
		}
		seen.add(item.id);
		return true;
	});
}

/**
 * Convert any GalleryItem into an EnhancedContentItem, normalizing
 * legacy PortfolioContentItem shape into the enhanced model.
 */
export function toEnhancedItem(item: GalleryItem): EnhancedContentItem {
	if (isEnhancedItem(item)) {
		return item;
	}
	const legacyItem = item as PortfolioContentItem;
	return {
		...legacyItem,
		categories: [legacyItem.category || "other"] as EnhancedCategoryType[],
		isOtherCategory: legacyItem.category === "other",
		useManualDate: false,
		originalImages: [],
		processedImages: legacyItem.images || [],
	} as EnhancedContentItem;
}

/**
 * Sort enhanced items by effective date (publishedAt → updatedAt → createdAt),
 * descending. Mirrors the behavior previously inlined in the test filter branch.
 */
export function sortByPublishedDate(
	items: EnhancedContentItem[],
): EnhancedContentItem[] {
	return [...items].sort((a: any, b: any) => {
		const aTime = new Date(
			a.publishedAt || a.updatedAt || a.createdAt,
		).getTime();
		const bTime = new Date(
			b.publishedAt || b.updatedAt || b.createdAt,
		).getTime();
		return bTime - aTime;
	});
}

/**
 * Sort using the shared enhanced gallery filter (effectiveDate desc).
 */
export function sortEnhancedItems(
	items: EnhancedContentItem[],
): EnhancedContentItem[] {
	return enhancedGalleryFilter.sortItems(items, {
		sortBy: "effectiveDate",
		sortOrder: "desc",
	});
}
