/**
 * Enhanced Gallery Filter
 * Task 6.2: 複数カテゴリー対応フィルタリングロジックの拡張
 * Task 4.2: Gallery performance optimization - NEVER load markdown files
 *
 * Based on portfolio-content-data-enhancement design specifications
 *
 * Gallery Performance Rules:
 * - NEVER load markdown files during filtering or searching
 * - Use caching to improve performance with large datasets
 * - Only use item metadata (title, description, tags, category) for filtering
 * - Maintain consistent performance regardless of markdown content existence
 */

import type { ContentItem } from "@/types/content";
import type {
  EnhancedCategoryType,
  EnhancedContentItem,
} from "@/types/enhanced-content";

export interface EnhancedFilterOptions {
  categories?: EnhancedCategoryType[];
  tags?: string[];
  year?: number;
  search?: string;
  includeOther?: boolean;
  status?: "published" | "draft" | "archived" | "scheduled" | "all";
}

export interface EnhancedSortOptions {
  sortBy: "createdAt" | "updatedAt" | "title" | "priority" | "effectiveDate";
  sortOrder: "asc" | "desc";
}

export type GalleryType =
  | "all"
  | "develop"
  | "video"
  | "design"
  | "video&design"
  | "other";

/**
 * Enhanced Gallery Filter Class
 * Handles filtering logic for multiple categories and enhanced content items
 */
export class EnhancedGalleryFilter {
  private performanceCache = new Map<string, EnhancedContentItem[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private cacheTimestamps = new Map<string, number>();

  /**
   * Filter items for specific gallery type with multiple category support
   */
  filterItemsForGallery(
    items: (ContentItem | EnhancedContentItem)[],
    galleryType: GalleryType,
    options: EnhancedFilterOptions = {},
  ): EnhancedContentItem[] {
    try {
      // Input validation
      if (!items || !Array.isArray(items)) {
        console.warn("filterItemsForGallery: Invalid items array");
        return [];
      }

      // Generate cache key
      const cacheKey = this.generateCacheKey(galleryType, options);

      // Check cache first
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        return cached;
      }

      // Convert all items to enhanced format
      const enhancedItems = this.ensureEnhancedItems(items);

      // Apply gallery-specific filtering
      let filteredItems = this.applyGalleryTypeFilter(
        enhancedItems,
        galleryType,
      );

      // Apply additional filters
      filteredItems = this.applyAdditionalFilters(filteredItems, options);

      // Remove duplicates (important for multiple category items)
      filteredItems = this.deduplicateItems(filteredItems);

      // Ensure we return a valid array
      if (!filteredItems || !Array.isArray(filteredItems)) {
        console.warn("filterItemsForGallery: Invalid filtered items result");
        return [];
      }

      // Cache the result
      this.setCachedResult(cacheKey, filteredItems);

      return filteredItems;
    } catch (error) {
      console.error("Error in filterItemsForGallery:", error);
      return [];
    }
  }

  /**
   * Apply gallery type specific filtering
   */
  private applyGalleryTypeFilter(
    items: EnhancedContentItem[],
    galleryType: GalleryType,
  ): EnhancedContentItem[] {
    try {
      if (!items || !Array.isArray(items)) {
        console.warn("applyGalleryTypeFilter: Invalid items array");
        return [];
      }

      // Don't filter by status here - let applyAdditionalFilters handle it
      const filtered = items;

      switch (galleryType) {
        case "all":
          // Show all items including Other category
          return filtered;

        case "other":
          // Show only Other category items
          return filtered.filter((item) => this.hasOtherCategory(item));

        case "video&design":
          // Show items that have video, design, or video&design categories
          // Exclude Other category items
          // Remove duplicates for items that have multiple relevant categories
          const videoDesignFiltered = filtered.filter(
            (item) =>
              !this.hasOtherCategory(item) &&
              this.hasAnyCategory(item, ["video", "design", "video&design"]),
          );

          // Ensure proper deduplication for multi-category items
          return this.deduplicateItems(videoDesignFiltered);

        case "develop":
        case "video":
        case "design":
          // Show items that have the specific category
          // Exclude Other category items
          return filtered.filter(
            (item) =>
              !this.hasOtherCategory(item) &&
              this.hasCategory(item, galleryType),
          );

        default:
          return filtered;
      }
    } catch (error) {
      console.error("Error in applyGalleryTypeFilter:", error);
      return [];
    }
  }

  /**
   * Apply additional filtering options
   */
  private applyAdditionalFilters(
    items: EnhancedContentItem[],
    options: EnhancedFilterOptions,
  ): EnhancedContentItem[] {
    let filtered = [...items];

    // Status filter (default to published only)
    if (options.status && options.status !== "all") {
      filtered = filtered.filter((item) => item.status === options.status);
    } else if (!options.status) {
      // Default: only show published items
      filtered = filtered.filter((item) => item.status === "published");
    }
    // If status is "all", don't filter by status

    // Category filter (for multiple category selection)
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter((item) =>
        options.categories!.some((category) =>
          this.hasCategory(item, category),
        ),
      );
    }

    // Tags filter
    if (options.tags && options.tags.length > 0) {
      filtered = filtered.filter((item) =>
        options.tags!.some((tag) =>
          item.tags.some((itemTag) =>
            itemTag.toLowerCase().includes(tag.toLowerCase()),
          ),
        ),
      );
    }

    // Year filter
    if (options.year) {
      filtered = filtered.filter((item) => {
        const effectiveDate = this.getEffectiveDate(item);
        return effectiveDate.getFullYear() === options.year;
      });
    }

    // Search filter - NEVER load markdown files for gallery performance (Requirement 6.4, 6.5)
    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          // Only search legacy content field if it exists, never load markdown files
          (item.content || "").toLowerCase().includes(searchTerm) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    return filtered;
  }

  /**
   * Sort enhanced content items
   */
  sortItems(
    items: EnhancedContentItem[],
    sortOptions: EnhancedSortOptions,
  ): EnhancedContentItem[] {
    const sorted = [...items];

    sorted.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortOptions.sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "priority":
          aValue = a.priority || 0;
          bValue = b.priority || 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "effectiveDate":
          aValue = this.getEffectiveDate(a).getTime();
          bValue = this.getEffectiveDate(b).getTime();
          break;
        case "updatedAt":
        default:
          aValue = new Date(a.updatedAt || a.createdAt).getTime();
          bValue = new Date(b.updatedAt || b.createdAt).getTime();
          break;
      }

      if (sortOptions.sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    return sorted;
  }

  /**
   * Remove duplicate items (important for multiple category items)
   * Enhanced deduplication with priority handling
   */
  deduplicateItems(items: EnhancedContentItem[]): EnhancedContentItem[] {
    try {
      if (!items || !Array.isArray(items)) {
        console.warn("deduplicateItems: Invalid items array");
        return [];
      }

      const seen = new Map<string, EnhancedContentItem>();

      items.forEach((item) => {
        if (!item || !item.id) {
          console.warn("deduplicateItems: Invalid item found");
          return;
        }

        const existingItem = seen.get(item.id);

        if (!existingItem) {
          // First occurrence, add to map
          seen.set(item.id, item);
        } else {
          // Duplicate found, keep the one with higher priority or more categories
          const shouldReplace =
            (item.priority || 0) > (existingItem.priority || 0) ||
            ((item.priority || 0) === (existingItem.priority || 0) &&
              (item.categories?.length || 0) >
                (existingItem.categories?.length || 0));

          if (shouldReplace) {
            seen.set(item.id, item);
          }
        }
      });

      return Array.from(seen.values());
    } catch (error) {
      console.error("Error in deduplicateItems:", error);
      return [];
    }
  }

  /**
   * Get statistics for filtered items
   */
  getFilteredStats(items: EnhancedContentItem[]): {
    total: number;
    byCategory: Record<string, number>;
    byYear: Record<number, number>;
    byStatus: Record<string, number>;
  } {
    const stats = {
      total: items.length,
      byCategory: {} as Record<string, number>,
      byYear: {} as Record<number, number>,
      byStatus: {} as Record<string, number>,
    };

    items.forEach((item) => {
      // Count by categories (multiple categories per item)
      const categories = this.getItemCategories(item);
      categories.forEach((category) => {
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });

      // Count by year
      const year = this.getEffectiveDate(item).getFullYear();
      stats.byYear[year] = (stats.byYear[year] || 0) + 1;

      // Count by status
      stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;
    });

    return stats;
  }

  /**
   * Performance optimization: batch filter multiple gallery types
   */
  batchFilterForGalleries(
    items: (ContentItem | EnhancedContentItem)[],
    galleryTypes: GalleryType[],
    options: EnhancedFilterOptions = {},
  ): Record<GalleryType, EnhancedContentItem[]> {
    const results: Record<string, EnhancedContentItem[]> = {};

    // Convert items once
    const enhancedItems = this.ensureEnhancedItems(items);

    // Filter for each gallery type
    galleryTypes.forEach((galleryType) => {
      results[galleryType] = this.filterItemsForGallery(
        enhancedItems,
        galleryType,
        options,
      );
    });

    return results as Record<GalleryType, EnhancedContentItem[]>;
  }

  /**
   * Clear performance cache
   */
  clearCache(): void {
    this.performanceCache.clear();
    this.cacheTimestamps.clear();
  }

  // Private helper methods

  /**
   * Ensure all items are in enhanced format
   */
  private ensureEnhancedItems(
    items: (ContentItem | EnhancedContentItem)[],
  ): EnhancedContentItem[] {
    try {
      if (!items || !Array.isArray(items)) {
        console.warn("ensureEnhancedItems: Invalid items array");
        return [];
      }

      return items
        .map((item) => {
          if (!item) {
            console.warn("ensureEnhancedItems: Null item found");
            return null;
          }

          if (this.isEnhancedContentItem(item)) {
            return item as EnhancedContentItem;
          } else {
            // Convert legacy item to enhanced format
            return this.migrateToEnhancedItem(item as ContentItem);
          }
        })
        .filter(Boolean) as EnhancedContentItem[];
    } catch (error) {
      console.error("Error in ensureEnhancedItems:", error);
      return [];
    }
  }

  /**
   * Check if item is already in enhanced format
   */
  private isEnhancedContentItem(
    item: ContentItem | EnhancedContentItem,
  ): boolean {
    return (
      "categories" in item &&
      Array.isArray((item as EnhancedContentItem).categories)
    );
  }

  /**
   * Migrate legacy ContentItem to EnhancedContentItem
   */
  private migrateToEnhancedItem(item: ContentItem): EnhancedContentItem {
    const categories: EnhancedCategoryType[] = [];

    // Convert single category to array
    if (item.category) {
      if (this.isValidEnhancedCategory(item.category)) {
        categories.push(item.category as EnhancedCategoryType);
      } else {
        categories.push("other");
      }
    }

    // Ensure thumbnail is set - use existing thumbnail or first image as fallback
    const thumbnail =
      item.thumbnail ||
      (item.images && item.images.length > 0 ? item.images[0] : undefined);

    return {
      ...item,
      categories,
      isOtherCategory: categories.includes("other"),
      useManualDate: false,
      originalImages: [],
      processedImages: item.images || [],
      // Ensure thumbnail is properly set
      thumbnail,
      // Keep legacy category for backward compatibility
      category: item.category,
    };
  }

  /**
   * Check if category is valid enhanced category
   */
  private isValidEnhancedCategory(category: string): boolean {
    const validCategories: EnhancedCategoryType[] = [
      "develop",
      "video",
      "design",
      "video&design",
      "other",
    ];
    return validCategories.includes(category as EnhancedCategoryType);
  }

  /**
   * Check if item has Other category
   */
  private hasOtherCategory(item: EnhancedContentItem): boolean {
    return (
      item.isOtherCategory === true ||
      (item.categories && item.categories.includes("other"))
    );
  }

  /**
   * Check if item has specific category
   */
  private hasCategory(
    item: EnhancedContentItem,
    category: EnhancedCategoryType,
  ): boolean {
    if (item.categories && item.categories.length > 0) {
      return item.categories.includes(category);
    }
    // Fallback to legacy category
    return item.category === category;
  }

  /**
   * Check if item has any of the specified categories
   */
  private hasAnyCategory(
    item: EnhancedContentItem,
    categories: EnhancedCategoryType[],
  ): boolean {
    return categories.some((category) => this.hasCategory(item, category));
  }

  /**
   * Get all categories for an item
   */
  private getItemCategories(item: EnhancedContentItem): EnhancedCategoryType[] {
    if (item.categories && item.categories.length > 0) {
      return item.categories;
    }
    // Fallback to legacy category
    if (item.category && this.isValidEnhancedCategory(item.category)) {
      return [item.category as EnhancedCategoryType];
    }
    return ["other"];
  }

  /**
   * Get effective date for item (manual date or created date)
   */
  private getEffectiveDate(item: EnhancedContentItem): Date {
    if (item.useManualDate && item.manualDate) {
      return new Date(item.manualDate);
    }
    return new Date(item.createdAt);
  }

  /**
   * Generate cache key for performance optimization
   */
  private generateCacheKey(
    galleryType: GalleryType,
    options: EnhancedFilterOptions,
  ): string {
    const optionsStr = JSON.stringify(options);
    return `${galleryType}-${optionsStr}`;
  }

  /**
   * Get cached result if valid
   */
  private getCachedResult(cacheKey: string): EnhancedContentItem[] | null {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (timestamp && Date.now() - timestamp < this.cacheTimeout) {
      return this.performanceCache.get(cacheKey) || null;
    }
    return null;
  }

  /**
   * Set cached result
   */
  private setCachedResult(
    cacheKey: string,
    items: EnhancedContentItem[],
  ): void {
    this.performanceCache.set(cacheKey, items);
    this.cacheTimestamps.set(cacheKey, Date.now());
  }
}

// Export singleton instance
export const enhancedGalleryFilter = new EnhancedGalleryFilter();
