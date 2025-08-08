/**
 * @jest-environment node
 */

import type { SearchResult } from "@/types";
import { promises as fs } from "fs";
import {
  cacheSearchResults,
  clearSearchResultCache,
  getCachedSearchResults,
  getSearchCacheStats,
  loadPersistedSearchCache,
  persistSearchCache,
  preloadPopularSearches,
} from "../cache";

// Mock fs promises
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("Search Cache System", () => {
  const mockSearchResults: SearchResult[] = [
    {
      id: "1",
      type: "blog",
      title: "Test Result",
      description: "Test description",
      url: "/test/1",
      score: 0.8,
      highlights: ["test highlight"],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    clearSearchResultCache();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearSearchResultCache();
  });

  describe("cacheSearchResults", () => {
    it("should cache search results with default TTL", () => {
      const query = "test query";
      const options = { type: "blog" as const, limit: 10 };

      cacheSearchResults(query, options, mockSearchResults);

      const cached = getCachedSearchResults(query, options);
      expect(cached).toEqual(mockSearchResults);
    });

    it("should cache search results with custom TTL", () => {
      const query = "test query";
      const options = { type: "blog" as const };
      const customTTL = 10000;

      cacheSearchResults(query, options, mockSearchResults, customTTL);

      const cached = getCachedSearchResults(query, options);
      expect(cached).toEqual(mockSearchResults);
    });

    it("should implement LRU eviction when cache is full", () => {
      // Fill cache to maximum capacity
      for (let i = 0; i < 100; i++) {
        cacheSearchResults(`query${i}`, {}, mockSearchResults);
      }

      // Add one more item to trigger eviction
      cacheSearchResults("new query", {}, mockSearchResults);

      // First item should be evicted
      const firstCached = getCachedSearchResults("query0", {});
      expect(firstCached).toBeNull();

      // New item should be cached
      const newCached = getCachedSearchResults("new query", {});
      expect(newCached).toEqual(mockSearchResults);
    });

    it("should handle different search options", () => {
      const options1 = { type: "blog" as const, category: "tech", limit: 5 };
      const options2 = { type: "portfolio" as const, includeContent: true };

      cacheSearchResults("same query", options1, mockSearchResults);
      cacheSearchResults("same query", options2, mockSearchResults);

      const cached1 = getCachedSearchResults("same query", options1);
      const cached2 = getCachedSearchResults("same query", options2);

      expect(cached1).toEqual(mockSearchResults);
      expect(cached2).toEqual(mockSearchResults);
    });
  });

  describe("getCachedSearchResults", () => {
    it("should return null for non-existent cache entry", () => {
      const cached = getCachedSearchResults("non-existent", {});
      expect(cached).toBeNull();
    });

    it("should return null for expired cache entry", (done) => {
      const query = "test query";
      const options = {};
      const shortTTL = 10; // 10ms

      cacheSearchResults(query, options, mockSearchResults, shortTTL);

      setTimeout(() => {
        const cached = getCachedSearchResults(query, options);
        expect(cached).toBeNull();
        done();
      }, 20);
    });

    it("should return cached results for valid entry", () => {
      const query = "test query";
      const options = { type: "blog" as const };

      cacheSearchResults(query, options, mockSearchResults);
      const cached = getCachedSearchResults(query, options);

      expect(cached).toEqual(mockSearchResults);
    });

    it("should be case insensitive for queries", () => {
      cacheSearchResults("Test Query", {}, mockSearchResults);

      const cached = getCachedSearchResults("test query", {});
      expect(cached).toEqual(mockSearchResults);
    });

    it("should handle query trimming", () => {
      cacheSearchResults("  test query  ", {}, mockSearchResults);

      const cached = getCachedSearchResults("test query", {});
      expect(cached).toEqual(mockSearchResults);
    });
  });

  describe("clearSearchResultCache", () => {
    it("should clear all cached results", () => {
      cacheSearchResults("query1", {}, mockSearchResults);
      cacheSearchResults("query2", {}, mockSearchResults);

      clearSearchResultCache();

      expect(getCachedSearchResults("query1", {})).toBeNull();
      expect(getCachedSearchResults("query2", {})).toBeNull();
    });
  });

  describe("getSearchCacheStats", () => {
    it("should return cache statistics", () => {
      cacheSearchResults("query1", {}, mockSearchResults);
      cacheSearchResults(
        "query2",
        { type: "blog" as const },
        mockSearchResults,
      );

      const stats = getSearchCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.maxSize).toBe(100);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0]).toMatchObject({
        key: expect.any(String),
        timestamp: expect.any(Number),
        ttl: expect.any(Number),
        resultCount: 1,
      });
    });

    it("should return empty stats for empty cache", () => {
      const stats = getSearchCacheStats();

      expect(stats.size).toBe(0);
      expect(stats.maxSize).toBe(100);
      expect(stats.entries).toEqual([]);
    });

    it("should show only query part in key", () => {
      cacheSearchResults(
        "test query",
        { type: "blog" as const },
        mockSearchResults,
      );

      const stats = getSearchCacheStats();

      expect(stats.entries[0].key).toBe("test query");
    });
  });

  describe("persistSearchCache", () => {
    it("should persist cache to disk", async () => {
      cacheSearchResults("query1", {}, mockSearchResults);
      cacheSearchResults(
        "query2",
        { type: "blog" as const },
        mockSearchResults,
      );
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await persistSearchCache();

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("search-results.json"),
        expect.stringContaining("query1"),
      );
    });

    it("should handle write errors", async () => {
      cacheSearchResults("query1", {}, mockSearchResults);
      mockFs.writeFile.mockRejectedValue(new Error("Write failed"));

      const result = await persistSearchCache();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to persist search cache:",
        expect.any(Error),
      );
    });

    it("should persist empty cache", async () => {
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await persistSearchCache();

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("search-results.json"),
        "[]",
      );
    });
  });

  describe("loadPersistedSearchCache", () => {
    it("should load cache from disk", async () => {
      const cacheData = [
        {
          key: "test query:eyJ0eXBlIjoiIiwiY2F0ZWdvcnkiOiIiLCJsaW1pdCI6MTAsImluY2x1ZGVDb250ZW50IjpmYWxzZSwidGhyZXNob2xkIjowLjN9",
          results: mockSearchResults,
          timestamp: Date.now() - 1000, // 1 second ago
          ttl: 300000, // 5 minutes
        },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));

      const result = await loadPersistedSearchCache();

      expect(result).toBe(true);

      const cached = getCachedSearchResults("test query", {});
      expect(cached).toEqual(mockSearchResults);
    });

    it("should skip expired entries when loading", async () => {
      const cacheData = [
        {
          key: "expired query:eyJ0eXBlIjoiIiwiY2F0ZWdvcnkiOiIiLCJsaW1pdCI6MTAsImluY2x1ZGVDb250ZW50IjpmYWxzZSwidGhyZXNob2xkIjowLjN9",
          results: mockSearchResults,
          timestamp: Date.now() - 400000, // 6.67 minutes ago
          ttl: 300000, // 5 minutes TTL
        },
        {
          key: "valid query:eyJ0eXBlIjoiIiwiY2F0ZWdvcnkiOiIiLCJsaW1pdCI6MTAsImluY2x1ZGVDb250ZW50IjpmYWxzZSwidGhyZXNob2xkIjowLjN9",
          results: mockSearchResults,
          timestamp: Date.now() - 1000, // 1 second ago
          ttl: 300000, // 5 minutes TTL
        },
      ];

      mockFs.readFile.mockResolvedValue(JSON.stringify(cacheData));

      const result = await loadPersistedSearchCache();

      expect(result).toBe(true);

      const expiredCached = getCachedSearchResults("expired query", {});
      const validCached = getCachedSearchResults("valid query", {});

      expect(expiredCached).toBeNull();
      expect(validCached).toEqual(mockSearchResults);
    });

    it("should handle missing cache file", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await loadPersistedSearchCache();

      expect(result).toBe(false);
    });

    it("should handle corrupted cache file", async () => {
      mockFs.readFile.mockResolvedValue("invalid json");

      const result = await loadPersistedSearchCache();

      expect(result).toBe(false);
    });

    it("should handle empty cache file", async () => {
      mockFs.readFile.mockResolvedValue("[]");

      const result = await loadPersistedSearchCache();

      expect(result).toBe(true);
    });
  });

  describe("preloadPopularSearches", () => {
    it("should preload popular searches from stats", async () => {
      const searchStats = {
        react: 100,
        vue: 80,
        javascript: 60,
        typescript: 40,
        css: 20,
      };

      mockFs.readFile.mockResolvedValue(JSON.stringify(searchStats));

      await preloadPopularSearches();

      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining("search-stats.json"),
        "utf-8",
      );
      expect(console.log).toHaveBeenCalledWith(
        "Preloading 5 popular searches...",
      );
      expect(console.log).toHaveBeenCalledWith('Should preload: "react"');
      expect(console.log).toHaveBeenCalledWith('Should preload: "vue"');
    });

    it("should handle missing stats file", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      await preloadPopularSearches();

      expect(console.error).toHaveBeenCalledWith(
        "Failed to preload popular searches:",
        expect.any(Error),
      );
    });

    it("should handle corrupted stats file", async () => {
      mockFs.readFile.mockResolvedValue("invalid json");

      await preloadPopularSearches();

      expect(console.error).toHaveBeenCalledWith(
        "Failed to preload popular searches:",
        expect.any(Error),
      );
    });

    it("should limit to top 10 queries", async () => {
      const searchStats = {};
      for (let i = 1; i <= 15; i++) {
        searchStats[`query${i}`] = i;
      }

      mockFs.readFile.mockResolvedValue(JSON.stringify(searchStats));

      await preloadPopularSearches();

      expect(console.log).toHaveBeenCalledWith(
        "Preloading 10 popular searches...",
      );
    });
  });

  describe("cache key generation", () => {
    it("should generate different keys for different options", () => {
      const options1 = { type: "blog" as const, limit: 5 };
      const options2 = { type: "portfolio" as const, limit: 10 };

      cacheSearchResults("same query", options1, mockSearchResults);
      cacheSearchResults("same query", options2, mockSearchResults);

      const cached1 = getCachedSearchResults("same query", options1);
      const cached2 = getCachedSearchResults("same query", options2);

      expect(cached1).toEqual(mockSearchResults);
      expect(cached2).toEqual(mockSearchResults);
    });

    it("should generate same key for equivalent options", () => {
      const options1 = {
        type: "blog" as const,
        limit: 10,
        includeContent: false,
      };
      const options2 = { type: "blog" as const, limit: 10 };

      cacheSearchResults("test query", options1, mockSearchResults);

      const cached = getCachedSearchResults("test query", options2);
      expect(cached).toEqual(mockSearchResults);
    });

    it("should handle undefined/null options", () => {
      cacheSearchResults("test query", {}, mockSearchResults);

      const cached = getCachedSearchResults("test query", {});
      expect(cached).toEqual(mockSearchResults);
    });
  });

  describe("edge cases", () => {
    it("should handle very long queries", () => {
      const longQuery = "a".repeat(1000);

      cacheSearchResults(longQuery, {}, mockSearchResults);

      const cached = getCachedSearchResults(longQuery, {});
      expect(cached).toEqual(mockSearchResults);
    });

    it("should handle special characters in queries", () => {
      const specialQuery = "test@#$%^&*()query";

      cacheSearchResults(specialQuery, {}, mockSearchResults);

      const cached = getCachedSearchResults(specialQuery, {});
      expect(cached).toEqual(mockSearchResults);
    });

    it("should handle unicode characters", () => {
      const unicodeQuery = "テスト検索クエリ";

      cacheSearchResults(unicodeQuery, {}, mockSearchResults);

      const cached = getCachedSearchResults(unicodeQuery, {});
      expect(cached).toEqual(mockSearchResults);
    });

    it("should handle empty results", () => {
      const emptyResults: SearchResult[] = [];

      cacheSearchResults("empty query", {}, emptyResults);

      const cached = getCachedSearchResults("empty query", {});
      expect(cached).toEqual(emptyResults);
    });

    it("should handle large result sets", () => {
      const largeResults: SearchResult[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `result${i}`,
          type: "blog",
          title: `Result ${i}`,
          description: `Description ${i}`,
          url: `/result/${i}`,
          score: 0.5,
          highlights: [],
        }),
      );

      cacheSearchResults("large query", {}, largeResults);

      const cached = getCachedSearchResults("large query", {});
      expect(cached).toEqual(largeResults);
    });
  });
});
