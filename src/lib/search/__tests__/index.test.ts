/**
 * @jest-environment node
 */

import { promises as fs } from "fs";
import Fuse from "fuse.js";
import { cacheSearchResults, getCachedSearchResults } from "../cache";
import {
  clearSearchCache,
  detailedSearch,
  generateSearchIndex,
  getRelatedContent,
  getSearchSuggestions,
  loadSearchIndex,
  saveSearchIndex,
  searchContent,
  simpleSearch,
  updateSearchIndex,
} from "../index";

// Mock dependencies
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock("@/lib/data", () => ({
  loadAllContent: jest.fn(),
}));

jest.mock("../cache", () => ({
  cacheSearchResults: jest.fn(),
  getCachedSearchResults: jest.fn(),
}));

jest.mock("fuse.js");

const mockFs = fs as jest.Mocked<typeof fs>;
const { loadAllContent: mockLoadAllContent } = jest.requireMock("@/lib/data");
const mockCacheSearchResults = cacheSearchResults as jest.MockedFunction<
  typeof cacheSearchResults
>;
const mockGetCachedSearchResults =
  getCachedSearchResults as jest.MockedFunction<typeof getCachedSearchResults>;
const MockFuse = Fuse as jest.MockedClass<typeof Fuse>;

describe("Search Index System", () => {
  const mockContent = {
    portfolio: [
      {
        id: "portfolio1",
        title: "React Portfolio",
        description: "A modern React portfolio website",
        content: "Built with React and TypeScript",
        tags: ["react", "typescript", "portfolio"],
        category: "web",
        status: "published",
        priority: 5,
        createdAt: "2023-01-01",
        stats: { views: 100 },
      },
      {
        id: "portfolio2",
        title: "Vue Dashboard",
        description: "Admin dashboard built with Vue.js",
        content: "Feature-rich dashboard application",
        tags: ["vue", "dashboard", "admin"],
        category: "web",
        status: "draft",
        priority: 3,
        createdAt: "2023-02-01",
      },
    ],
    blog: [
      {
        id: "blog1",
        title: "JavaScript Tips",
        description: "Useful JavaScript tips and tricks",
        content: "Learn advanced JavaScript techniques",
        tags: ["javascript", "tips", "programming"],
        category: "tutorial",
        status: "published",
        priority: 8,
        createdAt: "2023-03-01",
        stats: { views: 200 },
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadAllContent.mockResolvedValue(mockContent);
    mockGetCachedSearchResults.mockReturnValue(null);

    // Mock console methods
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    clearSearchCache();
  });

  describe("generateSearchIndex", () => {
    it("should generate search index from content", async () => {
      const index = await generateSearchIndex();

      expect(index).toHaveLength(2); // Only published items
      expect(index[0]).toMatchObject({
        id: "blog1",
        type: "blog",
        title: "JavaScript Tips",
        description: "Useful JavaScript tips and tricks",
        tags: ["javascript", "tips", "programming"],
        category: "tutorial",
      });
      expect(index[0].searchableContent).toContain("javascript tips");
      expect(index[0].searchScore).toBeGreaterThan(0);
    });

    it("should filter out draft content", async () => {
      const index = await generateSearchIndex();

      const draftItem = index.find((item) => item.id === "portfolio2");
      expect(draftItem).toBeUndefined();
    });

    it("should calculate search scores correctly", async () => {
      const index = await generateSearchIndex();

      const blogItem = index.find((item) => item.id === "blog1");
      const portfolioItem = index.find((item) => item.id === "portfolio1");

      expect(blogItem?.searchScore).toBeGreaterThan(
        portfolioItem?.searchScore || 0,
      );
    });

    it("should handle content loading errors", async () => {
      mockLoadAllContent.mockRejectedValue(new Error("Failed to load content"));

      const index = await generateSearchIndex();

      expect(index).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to generate search index:",
        expect.any(Error),
      );
    });

    it("should clean searchable content properly", async () => {
      const index = await generateSearchIndex();

      expect(index[0].searchableContent).not.toContain("!");
      expect(index[0].searchableContent).not.toContain("@");
      expect(index[0].searchableContent).toMatch(
        /^[a-z0-9\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+$/,
      );
    });
  });

  describe("saveSearchIndex", () => {
    it("should save search index to file", async () => {
      const index = [{ id: "test", type: "blog" as const, title: "Test" }];
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await saveSearchIndex(index);

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining("search-index.json"),
        JSON.stringify(index, null, 2),
        "utf-8",
      );
    });

    it("should handle save errors", async () => {
      const index = [{ id: "test", type: "blog" as const, title: "Test" }];
      mockFs.writeFile.mockRejectedValue(new Error("Write failed"));

      const result = await saveSearchIndex(index);

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to save search index:",
        expect.any(Error),
      );
    });
  });

  describe("loadSearchIndex", () => {
    it("should load search index from cache", async () => {
      const mockIndex = [{ id: "test", type: "blog" as const, title: "Test" }];
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockIndex));

      const index = await loadSearchIndex();

      expect(index).toEqual(mockIndex);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        expect.stringContaining("search-index.json"),
        "utf-8",
      );
    });

    it("should generate new index if cache doesn't exist", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockResolvedValue(undefined);

      const index = await loadSearchIndex();

      expect(index).toHaveLength(2);
      expect(mockFs.writeFile).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "Search index not found, generating new one...",
      );
    });

    it("should use memory cache when available", async () => {
      // First load to populate cache
      mockFs.readFile.mockResolvedValue(JSON.stringify([{ id: "test" }]));
      await loadSearchIndex();

      // Second load should use cache
      mockFs.readFile.mockClear();
      const index = await loadSearchIndex();

      expect(mockFs.readFile).not.toHaveBeenCalled();
      expect(index).toEqual([{ id: "test" }]);
    });

    it("should handle load errors", async () => {
      mockFs.readFile.mockRejectedValue(new Error("Permission denied"));
      mockLoadAllContent.mockRejectedValue(new Error("Content load failed"));

      const index = await loadSearchIndex();

      expect(index).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to generate search index:",
        expect.any(Error),
      );
    });
  });

  describe("updateSearchIndex", () => {
    it("should update search index and clear cache", async () => {
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await updateSearchIndex();

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it("should handle update errors", async () => {
      mockLoadAllContent.mockRejectedValue(new Error("Update failed"));

      const result = await updateSearchIndex();

      expect(result).toBe(true); // Still succeeds because it saves the empty index
    });
  });

  describe("searchContent", () => {
    beforeEach(() => {
      const mockSearchResults = [
        {
          item: {
            id: "blog1",
            type: "blog",
            title: "JavaScript Tips",
            description: "Useful JavaScript tips and tricks",
            tags: ["javascript", "tips"],
            category: "tutorial",
            searchScore: 50,
          },
          score: 0.2,
          matches: [
            {
              value: "JavaScript Tips and tricks for developers",
              indices: [[0, 10]],
            },
          ],
        },
      ];

      MockFuse.mockImplementation(
        () =>
          ({
            search: jest.fn().mockReturnValue(mockSearchResults),
          }) as unknown as Fuse<unknown>,
      );

      mockFs.readFile.mockResolvedValue(
        JSON.stringify([
          {
            id: "blog1",
            type: "blog",
            title: "JavaScript Tips",
            description: "Useful JavaScript tips and tricks",
            tags: ["javascript", "tips"],
            category: "tutorial",
            searchScore: 50,
          },
        ]),
      );
    });

    it("should return empty array for empty query", async () => {
      const results = await searchContent("");

      expect(results).toEqual([]);
    });

    it("should return cached results when available", async () => {
      const cachedResults = [{ id: "cached", title: "Cached Result" }];
      mockGetCachedSearchResults.mockReturnValue(cachedResults as never);

      const results = await searchContent("test");

      expect(results).toEqual(cachedResults);
      expect(MockFuse).not.toHaveBeenCalled();
    });

    it("should perform search and return results", async () => {
      const results = await searchContent("javascript");

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        id: "blog1",
        type: "blog",
        title: "JavaScript Tips",
        description: "Useful JavaScript tips and tricks",
        url: "/workshop/blog/blog1",
      });
      expect(results[0].score).toBeGreaterThan(0);
      expect(results[0].highlights).toBeDefined();
    });

    it("should filter by type", async () => {
      await searchContent("javascript", { type: "blog" });

      expect(MockFuse).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ type: "blog" })]),
        expect.any(Object),
      );
    });

    it("should filter by category", async () => {
      await searchContent("javascript", { category: "tutorial" });

      expect(MockFuse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ category: "tutorial" }),
        ]),
        expect.any(Object),
      );
    });

    it("should limit results", async () => {
      const results = await searchContent("javascript", { limit: 1 });

      expect(results).toHaveLength(1);
    });

    it("should cache search results", async () => {
      await searchContent("javascript");

      expect(mockCacheSearchResults).toHaveBeenCalledWith(
        "javascript",
        expect.any(Object),
        expect.any(Array),
      );
    });

    it("should handle search errors", async () => {
      // Mock Fuse to throw an error
      MockFuse.mockImplementation(() => {
        throw new Error("Search failed");
      });

      const results = await searchContent("javascript");

      expect(results).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Search failed:",
        expect.any(Error),
      );
    });

    it("should include content in search when specified", async () => {
      await searchContent("javascript", { includeContent: true });

      expect(MockFuse).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          keys: expect.arrayContaining([
            expect.objectContaining({ name: "content" }),
          ]),
        }),
      );
    });

    it("should adjust threshold", async () => {
      await searchContent("javascript", { threshold: 0.5 });

      expect(MockFuse).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({ threshold: 0.5 }),
      );
    });
  });

  describe("simpleSearch", () => {
    it("should perform simple search without content", async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      MockFuse.mockImplementation(
        () =>
          ({
            search: jest.fn().mockReturnValue([]),
          }) as unknown as Fuse<unknown>,
      );

      await simpleSearch("test");

      expect(MockFuse).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          threshold: 0.2,
          keys: expect.not.arrayContaining([
            expect.objectContaining({ name: "content" }),
          ]),
        }),
      );
    });
  });

  describe("detailedSearch", () => {
    it("should perform detailed search with content", async () => {
      mockFs.readFile.mockResolvedValue(JSON.stringify([]));
      MockFuse.mockImplementation(
        () =>
          ({
            search: jest.fn().mockReturnValue([]),
          }) as unknown as Fuse<unknown>,
      );

      await detailedSearch("test");

      expect(MockFuse).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          threshold: 0.4,
          keys: expect.arrayContaining([
            expect.objectContaining({ name: "content" }),
          ]),
        }),
      );
    });
  });

  describe("getSearchSuggestions", () => {
    beforeEach(() => {
      const mockIndex = [
        {
          id: "1",
          title: "React Components",
          tags: ["react", "components"],
          category: "tutorial",
        },
        {
          id: "2",
          title: "Vue.js Guide",
          tags: ["vue", "guide"],
          category: "tutorial",
        },
      ];
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockIndex));
    });

    it("should return suggestions based on query", async () => {
      const suggestions = await getSearchSuggestions("react");

      expect(suggestions).toContain("React Components");
      expect(suggestions).toContain("react");
    });

    it("should return empty array for empty query", async () => {
      const suggestions = await getSearchSuggestions("");

      expect(suggestions).toEqual([]);
    });

    it("should limit suggestions", async () => {
      const suggestions = await getSearchSuggestions("t", 2);

      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it("should handle errors gracefully", async () => {
      // Mock loadSearchIndex to throw an error
      mockFs.readFile.mockRejectedValue(new Error("Index load failed"));
      mockLoadAllContent.mockRejectedValue(new Error("Content load failed"));

      const suggestions = await getSearchSuggestions("react");

      expect(suggestions).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to generate search index:",
        expect.any(Error),
      );
    });
  });

  describe("getRelatedContent", () => {
    beforeEach(() => {
      const mockIndex = [
        {
          id: "1",
          type: "blog",
          title: "React Hooks",
          tags: ["react", "hooks"],
          category: "tutorial",
        },
        {
          id: "2",
          type: "blog",
          title: "React Components",
          tags: ["react", "components"],
          category: "tutorial",
        },
        {
          id: "3",
          type: "portfolio",
          title: "Vue Project",
          tags: ["vue", "project"],
          category: "web",
        },
      ];
      mockFs.readFile.mockResolvedValue(JSON.stringify(mockIndex));
    });

    it("should return related content based on tags and category", async () => {
      const related = await getRelatedContent("1");

      expect(related).toHaveLength(1);
      expect(related[0].id).toBe("2");
      expect(related[0].score).toBeGreaterThan(0);
    });

    it("should return empty array for non-existent content", async () => {
      const related = await getRelatedContent("999");

      expect(related).toEqual([]);
    });

    it("should limit results", async () => {
      const related = await getRelatedContent("1", 1);

      expect(related.length).toBeLessThanOrEqual(1);
    });

    it("should handle errors gracefully", async () => {
      // Mock loadSearchIndex to throw an error
      mockFs.readFile.mockRejectedValue(new Error("Index load failed"));
      mockLoadAllContent.mockRejectedValue(new Error("Content load failed"));

      const related = await getRelatedContent("1");

      expect(related).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to generate search index:",
        expect.any(Error),
      );
    });

    it("should score items correctly", async () => {
      const related = await getRelatedContent("1");

      // Item 2 should have higher score (same category + shared tag)
      expect(related[0].score).toBeGreaterThan(0);
    });
  });

  describe("utility functions", () => {
    it("should generate correct URLs for different content types", async () => {
      mockFs.readFile.mockResolvedValue(
        JSON.stringify([
          { id: "1", type: "portfolio", title: "Test" },
          { id: "2", type: "blog", title: "Test" },
          { id: "3", type: "tool", title: "Test" },
        ]),
      );

      MockFuse.mockImplementation(
        () =>
          ({
            search: jest.fn().mockReturnValue([
              {
                item: { id: "1", type: "portfolio", title: "Test" },
                score: 0.1,
              },
              { item: { id: "2", type: "blog", title: "Test" }, score: 0.1 },
              { item: { id: "3", type: "tool", title: "Test" }, score: 0.1 },
            ]),
          }) as unknown as Fuse<unknown>,
      );

      const results = await searchContent("test");

      expect(results[0].url).toBe("/portfolio/1");
      expect(results[1].url).toBe("/workshop/blog/2");
      expect(results[2].url).toBe("/tools/3");
    });

    it("should create search snippets correctly", async () => {
      mockFs.readFile.mockResolvedValue(
        JSON.stringify([
          {
            id: "1",
            type: "blog",
            title: "Test",
            description: "Test description",
          },
        ]),
      );

      MockFuse.mockImplementation(
        () =>
          ({
            search: jest.fn().mockReturnValue([
              {
                item: {
                  id: "1",
                  type: "blog",
                  title: "Test",
                  description: "Test description",
                },
                score: 0.1,
                matches: [
                  {
                    value:
                      "This is a long text with the search term in the middle of it",
                    indices: [[20, 30]],
                  },
                ],
              },
            ]),
          }) as unknown as Fuse<unknown>,
      );

      const results = await searchContent("search term");

      expect(results[0].highlights).toBeDefined();
      expect(results[0].highlights.length).toBeGreaterThan(0);
    });
  });
});
