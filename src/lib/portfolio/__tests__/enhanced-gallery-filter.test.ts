/**
 * Enhanced Gallery Filter Tests
 * Task 6.2: カテゴリーフィルタリングロジックの拡張テスト
 */

import type { ContentItem } from "@/types/content";
import type { EnhancedContentItem } from "@/types/enhanced-content";
import { EnhancedGalleryFilter } from "../enhanced-gallery-filter";

describe("EnhancedGalleryFilter", () => {
  let filter: EnhancedGalleryFilter;
  let testItems: (ContentItem | EnhancedContentItem)[];

  beforeEach(() => {
    filter = new EnhancedGalleryFilter();

    // Create test data with mixed legacy and enhanced items
    testItems = [
      // Enhanced items
      {
        id: "enhanced-1",
        type: "portfolio",
        title: "Multi-category Project",
        description: "A project with multiple categories",
        categories: ["develop", "design"],
        tags: ["react", "typescript"],
        status: "published",
        priority: 80,
        createdAt: "2024-01-15T00:00:00Z",
        isOtherCategory: false,
        useManualDate: false,
        originalImages: [],
        processedImages: [],
      } as EnhancedContentItem,

      {
        id: "enhanced-2",
        type: "portfolio",
        title: "Video Design Project",
        description: "A video and design project",
        categories: ["video", "video&design"],
        tags: ["motion", "graphics"],
        status: "published",
        priority: 70,
        createdAt: "2024-02-10T00:00:00Z",
        isOtherCategory: false,
        useManualDate: true,
        manualDate: "2024-01-20T00:00:00Z",
        originalImages: [],
        processedImages: [],
      } as EnhancedContentItem,

      {
        id: "enhanced-3",
        type: "portfolio",
        title: "Other Category Project",
        description: "A project in other category",
        categories: ["other"],
        tags: ["experimental"],
        status: "published",
        priority: 60,
        createdAt: "2024-03-05T00:00:00Z",
        isOtherCategory: true,
        useManualDate: false,
        originalImages: [],
        processedImages: [],
      } as EnhancedContentItem,

      // Legacy items
      {
        id: "legacy-1",
        type: "portfolio",
        title: "Legacy Develop Project",
        description: "A legacy development project",
        category: "develop",
        tags: ["javascript"],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00Z",
      } as ContentItem,

      {
        id: "legacy-2",
        type: "portfolio",
        title: "Legacy Video Project",
        description: "A legacy video project",
        category: "video",
        tags: ["editing"],
        status: "published",
        priority: 40,
        createdAt: "2024-02-01T00:00:00Z",
      } as ContentItem,

      // Draft item (should be filtered out by default)
      {
        id: "draft-1",
        type: "portfolio",
        title: "Draft Project",
        description: "A draft project",
        categories: ["develop"],
        tags: ["draft"],
        status: "draft",
        priority: 30,
        createdAt: "2024-03-01T00:00:00Z",
        isOtherCategory: false,
        useManualDate: false,
        originalImages: [],
        processedImages: [],
      } as EnhancedContentItem,
    ];
  });

  afterEach(() => {
    filter.clearCache();
  });

  describe("filterItemsForGallery", () => {
    it("should filter items for 'all' gallery including Other category", () => {
      const result = filter.filterItemsForGallery(testItems, "all");

      expect(result).toHaveLength(5); // All published items
      expect(result.some((item) => item.id === "enhanced-3")).toBe(true); // Other category included
      expect(result.some((item) => item.status === "draft")).toBe(false); // Draft excluded
    });

    it("should filter items for 'develop' gallery excluding Other category", () => {
      const result = filter.filterItemsForGallery(testItems, "develop");

      expect(result).toHaveLength(2); // enhanced-1 and legacy-1
      expect(result.every((item) => !item.isOtherCategory)).toBe(true);
      expect(result.some((item) => item.id === "enhanced-1")).toBe(true);
      expect(result.some((item) => item.id === "legacy-1")).toBe(true);
    });

    it("should filter items for 'video&design' gallery correctly", () => {
      const result = filter.filterItemsForGallery(testItems, "video&design");

      // Should include items with video, design, or video&design categories
      expect(result).toHaveLength(3); // enhanced-1 (design), enhanced-2 (video, video&design), legacy-2 (video)
      expect(result.some((item) => item.id === "enhanced-1")).toBe(true); // Has design
      expect(result.some((item) => item.id === "enhanced-2")).toBe(true); // Has video&design
      expect(result.some((item) => item.id === "legacy-2")).toBe(true); // Has video
      expect(result.some((item) => item.id === "enhanced-3")).toBe(false); // Other category excluded
    });

    it("should filter items for 'other' gallery", () => {
      const result = filter.filterItemsForGallery(testItems, "other");

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("enhanced-3");
    });

    it("should handle additional filter options", () => {
      const result = filter.filterItemsForGallery(testItems, "all", {
        tags: ["react"],
        year: 2024,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("enhanced-1");
    });

    it("should handle search filter", () => {
      const result = filter.filterItemsForGallery(testItems, "all", {
        search: "video",
      });

      expect(result).toHaveLength(2); // enhanced-2 and legacy-2
    });

    it("should handle status filter", () => {
      const result = filter.filterItemsForGallery(testItems, "all", {
        status: "all",
      });

      expect(result).toHaveLength(6); // Including draft
      expect(result.some((item) => item.status === "draft")).toBe(true);
    });
  });

  describe("sortItems", () => {
    it("should sort by title ascending", () => {
      const items = filter.filterItemsForGallery(testItems, "all");
      const sorted = filter.sortItems(items, {
        sortBy: "title",
        sortOrder: "asc",
      });

      expect(sorted[0].title).toBe("Legacy Develop Project");
      expect(sorted[sorted.length - 1].title).toBe("Video Design Project");
    });

    it("should sort by priority descending", () => {
      const items = filter.filterItemsForGallery(testItems, "all");
      const sorted = filter.sortItems(items, {
        sortBy: "priority",
        sortOrder: "desc",
      });

      expect(sorted[0].priority).toBe(80);
      expect(sorted[sorted.length - 1].priority).toBe(40);
    });

    it("should sort by effective date", () => {
      const items = filter.filterItemsForGallery(testItems, "all");
      const sorted = filter.sortItems(items, {
        sortBy: "effectiveDate",
        sortOrder: "desc",
      });

      // enhanced-2 has manual date of 2024-01-20, should be considered
      const enhanced2Index = sorted.findIndex(
        (item) => item.id === "enhanced-2",
      );
      expect(enhanced2Index).toBeGreaterThan(-1);
    });
  });

  describe("deduplicateItems", () => {
    it("should remove duplicate items", () => {
      const duplicatedItems = [
        testItems[0],
        testItems[1],
        testItems[0], // Duplicate
      ] as EnhancedContentItem[];

      const deduplicated = filter.deduplicateItems(duplicatedItems);

      expect(deduplicated).toHaveLength(2);
      expect(deduplicated.map((item) => item.id)).toEqual([
        "enhanced-1",
        "enhanced-2",
      ]);
    });
  });

  describe("getFilteredStats", () => {
    it("should return correct statistics", () => {
      const items = filter.filterItemsForGallery(testItems, "all");
      const stats = filter.getFilteredStats(items);

      expect(stats.total).toBe(5);
      expect(stats.byCategory.develop).toBe(2); // enhanced-1 and legacy-1
      expect(stats.byCategory.design).toBe(1); // enhanced-1
      expect(stats.byCategory.video).toBe(2); // enhanced-2 and legacy-2
      expect(stats.byCategory.other).toBe(1); // enhanced-3
      expect(stats.byStatus.published).toBe(5);
    });
  });

  describe("batchFilterForGalleries", () => {
    it("should filter for multiple gallery types efficiently", () => {
      const results = filter.batchFilterForGalleries(testItems, [
        "all",
        "develop",
        "video",
        "other",
      ]);

      expect(results.all).toHaveLength(5);
      expect(results.develop).toHaveLength(2);
      expect(results.video).toHaveLength(2);
      expect(results.other).toHaveLength(1);
    });
  });

  describe("performance and caching", () => {
    it("should cache results for performance", () => {
      const spy = jest.spyOn(
        filter as unknown as { applyGalleryTypeFilter: jest.Mock },
        "applyGalleryTypeFilter",
      );

      // First call
      filter.filterItemsForGallery(testItems, "all");
      expect(spy).toHaveBeenCalledTimes(1);

      // Second call with same parameters should use cache
      filter.filterItemsForGallery(testItems, "all");
      expect(spy).toHaveBeenCalledTimes(1); // No additional call

      spy.mockRestore();
    });

    it("should clear cache when requested", () => {
      filter.filterItemsForGallery(testItems, "all");
      filter.clearCache();

      const spy = jest.spyOn(
        filter as unknown as { applyGalleryTypeFilter: jest.Mock },
        "applyGalleryTypeFilter",
      );
      filter.filterItemsForGallery(testItems, "all");
      expect(spy).toHaveBeenCalledTimes(1);

      spy.mockRestore();
    });
  });

  describe("legacy item migration", () => {
    it("should correctly migrate legacy items to enhanced format", () => {
      const legacyItem: ContentItem = {
        id: "legacy-test",
        type: "portfolio",
        title: "Legacy Test",
        description: "Test legacy item",
        category: "develop",
        tags: ["test"],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00Z",
      };

      const result = filter.filterItemsForGallery([legacyItem], "develop");

      expect(result).toHaveLength(1);
      expect(result[0].categories).toEqual(["develop"]);
      expect(result[0].isOtherCategory).toBe(false);
      expect(result[0].useManualDate).toBe(false);
    });

    it("should migrate invalid categories to 'other'", () => {
      const invalidItem: ContentItem = {
        id: "invalid-test",
        type: "portfolio",
        title: "Invalid Category Test",
        description: "Test invalid category",
        category: "invalid-category",
        tags: ["test"],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00Z",
      };

      const result = filter.filterItemsForGallery([invalidItem], "other");

      expect(result).toHaveLength(1);
      expect(result[0].categories).toEqual(["other"]);
      expect(result[0].isOtherCategory).toBe(true);
    });
  });
});
