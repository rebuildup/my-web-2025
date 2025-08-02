/**
 * Enhanced Cache System Tests
 * Tests for the enhanced cache manager (client-side only)
 */

import { EnhancedDataCache } from "../EnhancedCacheManager";

describe("Enhanced Cache System", () => {
  describe("EnhancedDataCache", () => {
    let cache: EnhancedDataCache;

    beforeEach(() => {
      cache = new EnhancedDataCache();
    });

    afterEach(() => {
      cache.destroy();
    });

    describe("Markdown Content Caching", () => {
      it("should set and retrieve markdown content directly", async () => {
        const filePath = "test/content.md";
        const content = "# Test Content\n\nThis is test content.";

        // Set content directly
        cache.setMarkdownContent(filePath, content);

        // Should retrieve from cache
        const result = await cache.getMarkdownContent(filePath);
        expect(result).toBe(content);
      });

      it("should return null for non-cached content", async () => {
        const filePath = "nonexistent/file.md";

        const result = await cache.getMarkdownContent(filePath);
        expect(result).toBeNull();
      });
    });

    describe("Tag Data Caching", () => {
      it("should cache and retrieve tag list", async () => {
        const tags = [
          { name: "react", count: 5 },
          { name: "typescript", count: 3 },
        ];

        cache.setTagList(tags);
        const result = await cache.getTagList();

        expect(result).toEqual(tags);
      });

      it("should cache tag search results", async () => {
        const query = "react";
        const results = [{ name: "react", count: 5 }];

        cache.setTagSearchResults(query, results);
        const cached = await cache.getTagSearchResults(query);

        expect(cached).toEqual(results);
      });
    });

    describe("Portfolio Items Caching", () => {
      it("should cache portfolio items by category", () => {
        const items = [
          { id: "1", title: "Test Item 1", categories: ["develop"] },
          { id: "2", title: "Test Item 2", categories: ["design"] },
        ];

        cache.setPortfolioItems(items, "develop");
        const cached = cache.getPortfolioItems("develop");

        expect(cached).toEqual(items);
      });

      it("should cache all portfolio items", () => {
        const items = [
          { id: "1", title: "Test Item 1" },
          { id: "2", title: "Test Item 2" },
        ];

        cache.setPortfolioItems(items);
        const cached = cache.getPortfolioItems();

        expect(cached).toEqual(items);
      });
    });

    describe("Cache Invalidation", () => {
      it("should invalidate markdown cache for specific file", async () => {
        const filePath = "test/content.md";
        const content = "# Test Content";

        cache.setMarkdownContent(filePath, content);
        expect(await cache.getMarkdownContent(filePath)).toBe(content);

        cache.invalidateMarkdownCache(filePath);

        // Should return null after invalidation
        expect(await cache.getMarkdownContent(filePath)).toBeNull();
      });

      it("should invalidate all markdown cache", async () => {
        cache.setMarkdownContent("file1.md", "Content 1");
        cache.setMarkdownContent("file2.md", "Content 2");

        cache.invalidateMarkdownCache();

        // Both files should be invalidated
        expect(await cache.getMarkdownContent("file1.md")).toBeNull();
        expect(await cache.getMarkdownContent("file2.md")).toBeNull();
      });

      it("should invalidate portfolio cache", () => {
        const items = [{ id: "1", title: "Test" }];

        cache.setPortfolioItems(items, "develop");
        cache.setPortfolioItems(items, "design");

        cache.invalidatePortfolioCache();

        expect(cache.getPortfolioItems("develop")).toBeNull();
        expect(cache.getPortfolioItems("design")).toBeNull();
      });
    });

    describe("Cache Statistics", () => {
      it("should provide comprehensive cache statistics", () => {
        // Add some data to caches
        cache.setMarkdownContent("test.md", "content");
        cache.setTagList([{ name: "test", count: 1 }]);
        cache.setPortfolioItems([{ id: "1", title: "test" }]);

        const stats = cache.getCacheStats();

        expect(stats).toHaveProperty("markdown");
        expect(stats).toHaveProperty("tags");
        expect(stats).toHaveProperty("images");
        expect(stats).toHaveProperty("content");
        expect(stats).toHaveProperty("total");

        expect(stats.total.size).toBeGreaterThan(0);
      });
    });

    describe("Cache Warming", () => {
      it("should warm cache with provided items", async () => {
        const items = [
          { id: "1", markdownPath: "content1.md", content: "Content 1" },
          { id: "2", markdownPath: "content2.md", content: "Content 2" },
        ];

        await cache.warmCache(items);

        // Files should be cached
        expect(await cache.getMarkdownContent("content1.md")).toBe("Content 1");
        expect(await cache.getMarkdownContent("content2.md")).toBe("Content 2");
      });
    });
  });
});
