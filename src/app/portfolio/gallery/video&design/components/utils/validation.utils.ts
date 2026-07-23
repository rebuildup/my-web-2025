/**
 * Validation utilities for Video & Design gallery items.
 * Pure functions extracted from VideoDesignGallery useMemo callbacks.
 */

import type { EnhancedContentItem } from "@/types/enhanced-content";
import type { PortfolioContentItem } from "@/types/portfolio";

export type GalleryItem = PortfolioContentItem | EnhancedContentItem;

export function isEnhancedItem(item: GalleryItem): item is EnhancedContentItem {
	return (
		"categories" in item &&
		Array.isArray((item as EnhancedContentItem).categories)
	);
}

/**
 * Validate a single gallery item. Returns true if the item passes
 * all required-field checks. Logs warnings (not errors) for items
 * missing optional fields so the original input is never mutated.
 */
export function validateGalleryItem(item: GalleryItem): boolean {
	if (!item || typeof item !== "object") {
		console.warn(
			"VideoDesignGallery: Invalid item object found, skipping:",
			item,
		);
		return false;
	}

	if (!item.id || typeof item.id !== "string" || item.id.trim() === "") {
		console.warn("VideoDesignGallery: Item missing valid id, skipping:", item);
		return false;
	}

	if (
		!item.title ||
		typeof item.title !== "string" ||
		item.title.trim() === ""
	) {
		console.warn(
			"VideoDesignGallery: Item missing valid title, skipping:",
			item,
		);
		return false;
	}

	// Validate priority (should be a number) — warn but don't reject.
	if (typeof item.priority !== "number" || Number.isNaN(item.priority)) {
		console.warn(
			"VideoDesignGallery: Item has invalid priority (immutable input), using default in render:",
			item,
		);
	}

	// Validate createdAt (should be a valid date string) — warn but don't reject.
	if (!item.createdAt || Number.isNaN(new Date(item.createdAt).getTime())) {
		console.warn(
			"VideoDesignGallery: Item has invalid createdAt (immutable input), using fallback in render:",
			item,
		);
	}

	if (isEnhancedItem(item)) {
		if (!Array.isArray(item.categories)) {
			console.warn(
				"VideoDesignGallery: Enhanced item has invalid categories array, skipping:",
				item,
			);
			return false;
		}
	} else {
		const legacyItem = item as PortfolioContentItem;
		if (!legacyItem.category || typeof legacyItem.category !== "string") {
			console.warn(
				"VideoDesignGallery: Legacy item missing valid category, skipping:",
				item,
			);
			return false;
		}
	}

	return true;
}

/**
 * Strict validation: items array must be present and an array.
 * Returns true if the items payload is structurally valid for further processing.
 */
export function validateItemsArray(items: unknown): items is GalleryItem[] {
	if (!items) {
		console.error("VideoDesignGallery: Items is not an array:", items);
		return false;
	}
	if (!Array.isArray(items)) {
		console.error("VideoDesignGallery: Items is not an array:", items);
		return false;
	}
	if (items.length === 0) {
		console.warn("VideoDesignGallery: Empty items array provided");
		return true;
	}
	return true;
}
