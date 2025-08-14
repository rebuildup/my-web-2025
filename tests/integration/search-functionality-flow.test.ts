/**
 * 検索機能統合テスト（インデックス作成〜検索結果表示）
 * Search Functionality Integration Test (Index Creation to Search Results Display)
 */

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { NextRequest } from "next/server";

// Mock Next.js modules
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      ok: options?.status ? options.status < 400 : true,
    })),
    redirect: jest.fn(),
  },
}));

// Mock file system operations
jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  unlink: jest.fn(),
}));

// Mock search index operations
jest.mock("@/lib/search/index-manager", () => ({
  createIndex: jest.fn(),
  updateIndex: jest.fn(),
  deleteFromIndex: jest.fn(),
  searchIndex: jest.fn(),
  rebuildIndex: jest.fn(),
}));

describe("Search Functionality Integration Test", () => {
  let testContentItems: Array<{
    id: string;
    title: string;
    categories: string[];
    tags: string[];
  }> = [];
  // let searchIndexId: string;

  beforeAll(() => {
    // Setup test environment
    searchIndexId = `search-index-${Date.now()}`;

    // Create test content items
    testContentItems = [
      {
        id: `test-item-1-${Date.now()}`,
        title: "React TypeScript Portfolio",
        description: "Modern web development with React and TypeScript",
        content:
          "# React Portfolio\n\nBuilding modern applications with React, TypeScript, and Next.js",
        tags: ["React", "TypeScript", "Next.js", "Web Development"],
        categories: ["develop"],
        status: "published",
      },
      {
        id: `test-item-2-${Date.now()}`,
        title: "UI/UX Design System",
        description: "Comprehensive design system for modern applications",
        content:
          "# Design System\n\nCreating consistent and accessible user interfaces",
        tags: ["Design", "UI/UX", "Figma", "Accessibility"],
        categories: ["design"],
        status: "published",
      },
      {
        id: `test-item-3-${Date.now()}`,
        title: "WebGL 3D Experiments",
        description: "Interactive 3D graphics and animations",
        content:
          "# WebGL Experiments\n\nExploring 3D graphics with WebGL and Three.js",
        tags: ["WebGL", "Three.js", "3D", "Graphics"],
        categories: ["develop", "design"],
        status: "published",
      },
    ];
  });

  afterAll(() => {
    // Cleanup test data
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Step 1: Search Index Creation and Management", () => {
    it("should create search index for new content", async () => {
      const { POST } = await import("@/app/api/search/index/route");

      for (const item of testContentItems) {
        const indexData = {
          action: "create",
          itemId: item.id,
          title: item.title,
          description: item.description,
          content: item.content,
          tags: item.tags,
          categories: item.categories,
          searchableText: `${item.title} ${item.description} ${item.content} ${item.tags.join(" ")}`,
        };

        const mockRequest = new NextRequest(
          "http://localhost:3000/api/search/index",
          {
            method: "POST",
            body: JSON.stringify(indexData),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(mockRequest);
        const result = await response.json();

        expect(response.status).toBe(201);
        expect(result.success).toBe(true);
        expect(result.data.indexed).toBe(true);
        expect(result.data.itemId).toBe(item.id);
      }
    });

    it("should update search index when content changes", async () => {
      const { PUT } = await import("@/app/api/search/index/route");

      const updatedItem = {
        ...testContentItems[0],
        title: "Updated React TypeScript Portfolio",
        description:
          "Enhanced modern web development with React and TypeScript",
        tags: [...testContentItems[0].tags, "Updated", "Enhanced"],
      };

      const updateData = {
        action: "update",
        itemId: updatedItem.id,
        title: updatedItem.title,
        description: updatedItem.description,
        content: updatedItem.content,
        tags: updatedItem.tags,
        categories: updatedItem.categories,
        searchableText: `${updatedItem.title} ${updatedItem.description} ${updatedItem.content} ${updatedItem.tags.join(" ")}`,
      };

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/search/index",
        {
          method: "PUT",
          body: JSON.stringify(updateData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PUT(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.updated).toBe(true);
      expect(result.data.itemId).toBe(updatedItem.id);
    });

    it("should handle bulk index operations", async () => {
      const { POST: bulkIndex } = await import(
        "@/app/api/search/index/bulk/route"
      );

      const bulkData = {
        action: "bulk_create",
        items: testContentItems.map((item) => ({
          itemId: item.id,
          title: item.title,
          description: item.description,
          content: item.content,
          tags: item.tags,
          categories: item.categories,
          searchableText: `${item.title} ${item.description} ${item.content} ${item.tags.join(" ")}`,
        })),
      };

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/search/index/bulk",
        {
          method: "POST",
          body: JSON.stringify(bulkData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await bulkIndex(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.indexed).toBe(testContentItems.length);
    });
  });

  describe("Step 2: Search Query Processing", () => {
    it("should perform basic text search", async () => {
      const { GET } = await import("@/app/api/search/route");

      const searchQueries = [
        "React TypeScript",
        "Design System",
        "WebGL 3D",
        "modern web development",
      ];

      for (const query of searchQueries) {
        const searchRequest = new NextRequest(
          `http://localhost:3000/api/search?q=${encodeURIComponent(query)}&limit=10`,
        );
        const response = await GET(searchRequest);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(Array.isArray(result.data.results)).toBe(true);
        expect(result.data.query).toBe(query);
        expect(result.data.total).toBeGreaterThanOrEqual(0);

        // Verify search results contain relevant items
        if (result.data.results.length > 0) {
          const firstResult = result.data.results[0];
          expect(firstResult).toHaveProperty("id");
          expect(firstResult).toHaveProperty("title");
          expect(firstResult).toHaveProperty("description");
          expect(firstResult).toHaveProperty("score");
          expect(firstResult.score).toBeGreaterThan(0);
        }
      }
    });

    it("should handle advanced search with filters", async () => {
      const { GET } = await import("@/app/api/search/route");

      const advancedSearches = [
        {
          query: "React",
          categories: ["develop"],
          tags: ["TypeScript"],
        },
        {
          query: "Design",
          categories: ["design"],
          tags: ["UI/UX"],
        },
        {
          query: "WebGL",
          categories: ["develop", "design"],
          tags: ["3D"],
        },
      ];

      for (const search of advancedSearches) {
        const params = new URLSearchParams({
          q: search.query,
          categories: search.categories.join(","),
          tags: search.tags.join(","),
          limit: "10",
        });

        const searchRequest = new NextRequest(
          `http://localhost:3000/api/search?${params.toString()}`,
        );
        const response = await GET(searchRequest);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(Array.isArray(result.data.results)).toBe(true);

        // Verify filters are applied
        result.data.results.forEach((item: { categories: string[] }) => {
          const hasMatchingCategory = search.categories.some((cat) =>
            item.categories.includes(cat),
          );
          const hasMatchingTag = search.tags.some((tag) =>
            item.tags.includes(tag),
          );

          expect(hasMatchingCategory || hasMatchingTag).toBe(true);
        });
      }
    });

    it("should provide search suggestions and autocomplete", async () => {
      const { GET } = await import("@/app/api/search/suggestions/route");

      const partialQueries = ["Rea", "Des", "Web", "Type"];

      for (const partial of partialQueries) {
        const suggestionRequest = new NextRequest(
          `http://localhost:3000/api/search/suggestions?q=${partial}&limit=5`,
        );
        const response = await GET(suggestionRequest);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(Array.isArray(result.data.suggestions)).toBe(true);
        expect(result.data.suggestions.length).toBeLessThanOrEqual(5);

        // Verify suggestions are relevant
        result.data.suggestions.forEach(
          (suggestion: { text: string; score: number }) => {
            expect(suggestion).toHaveProperty("text");
            expect(suggestion).toHaveProperty("score");
            expect(suggestion.text.toLowerCase()).toContain(
              partial.toLowerCase(),
            );
          },
        );
      }
    });
  });

  describe("Step 3: Search Results Display and Ranking", () => {
    it("should return properly ranked search results", async () => {
      const { GET } = await import("@/app/api/search/route");

      const searchRequest = new NextRequest(
        "http://localhost:3000/api/search?q=React TypeScript&limit=10&sort=relevance",
      );
      const response = await GET(searchRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data.results)).toBe(true);

      // Verify results are sorted by relevance (score descending)
      if (result.data.results.length > 1) {
        for (let i = 0; i < result.data.results.length - 1; i++) {
          expect(result.data.results[i].score).toBeGreaterThanOrEqual(
            result.data.results[i + 1].score,
          );
        }
      }

      // Verify result structure
      result.data.results.forEach((item: { id: string; title: string }) => {
        expect(item).toHaveProperty("id");
        expect(item).toHaveProperty("title");
        expect(item).toHaveProperty("description");
        expect(item).toHaveProperty("categories");
        expect(item).toHaveProperty("tags");
        expect(item).toHaveProperty("score");
        expect(item).toHaveProperty("highlights");
        expect(Array.isArray(item.categories)).toBe(true);
        expect(Array.isArray(item.tags)).toBe(true);
        expect(Array.isArray(item.highlights)).toBe(true);
      });
    });

    it("should handle different sorting options", async () => {
      const { GET } = await import("@/app/api/search/route");

      const sortOptions = ["relevance", "date", "title", "popularity"];

      for (const sortBy of sortOptions) {
        const searchRequest = new NextRequest(
          `http://localhost:3000/api/search?q=development&sort=${sortBy}&limit=5`,
        );
        const response = await GET(searchRequest);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data.sort).toBe(sortBy);

        if (result.data.results.length > 1) {
          // Verify sorting is applied
          switch (sortBy) {
            case "relevance":
              for (let i = 0; i < result.data.results.length - 1; i++) {
                expect(result.data.results[i].score).toBeGreaterThanOrEqual(
                  result.data.results[i + 1].score,
                );
              }
              break;
            case "title":
              for (let i = 0; i < result.data.results.length - 1; i++) {
                expect(
                  result.data.results[i].title.localeCompare(
                    result.data.results[i + 1].title,
                  ),
                ).toBeLessThanOrEqual(0);
              }
              break;
          }
        }
      }
    });

    it("should provide search result pagination", async () => {
      const { GET } = await import("@/app/api/search/route");

      // Test pagination
      const page1Request = new NextRequest(
        "http://localhost:3000/api/search?q=test&page=1&limit=2",
      );
      const page1Response = await GET(page1Request);
      const page1Result = await page1Response.json();

      expect(page1Response.status).toBe(200);
      expect(page1Result.success).toBe(true);
      expect(page1Result.data.pagination).toHaveProperty("page", 1);
      expect(page1Result.data.pagination).toHaveProperty("limit", 2);
      expect(page1Result.data.pagination).toHaveProperty("total");
      expect(page1Result.data.pagination).toHaveProperty("totalPages");

      // Test second page if there are enough results
      if (page1Result.data.pagination.totalPages > 1) {
        const page2Request = new NextRequest(
          "http://localhost:3000/api/search?q=test&page=2&limit=2",
        );
        const page2Response = await GET(page2Request);
        const page2Result = await page2Response.json();

        expect(page2Response.status).toBe(200);
        expect(page2Result.success).toBe(true);
        expect(page2Result.data.pagination.page).toBe(2);

        // Verify different results on different pages
        if (
          page1Result.data.results.length > 0 &&
          page2Result.data.results.length > 0
        ) {
          expect(page1Result.data.results[0].id).not.toBe(
            page2Result.data.results[0].id,
          );
        }
      }
    });
  });

  describe("Step 4: Related Content and Recommendations", () => {
    it("should provide related content suggestions", async () => {
      const { GET } = await import("@/app/api/search/related/route");

      for (const item of testContentItems) {
        const relatedRequest = new NextRequest(
          `http://localhost:3000/api/search/related?itemId=${item.id}&limit=3`,
        );
        const response = await GET(relatedRequest);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(Array.isArray(result.data.related)).toBe(true);
        expect(result.data.related.length).toBeLessThanOrEqual(3);

        // Verify related items don't include the original item
        result.data.related.forEach(
          (relatedItem: { id: string; title: string }) => {
            expect(relatedItem.id).not.toBe(item.id);
            expect(relatedItem).toHaveProperty("title");
            expect(relatedItem).toHaveProperty("description");
            expect(relatedItem).toHaveProperty("similarity");
            expect(relatedItem.similarity).toBeGreaterThan(0);
          },
        );
      }
    });

    it("should handle tag-based content discovery", async () => {
      const { GET } = await import("@/app/api/search/route");

      const uniqueTags = [
        ...new Set(testContentItems.flatMap((item) => item.tags)),
      ];

      for (const tag of uniqueTags.slice(0, 3)) {
        // Test first 3 tags
        const tagSearchRequest = new NextRequest(
          `http://localhost:3000/api/search?tags=${encodeURIComponent(tag)}&limit=5`,
        );
        const response = await GET(tagSearchRequest);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(Array.isArray(result.data.results)).toBe(true);

        // Verify all results contain the searched tag
        result.data.results.forEach((item: { tags: string[] }) => {
          expect(item.tags).toContain(tag);
        });
      }
    });
  });

  describe("Step 5: Search Analytics and Monitoring", () => {
    it("should track search queries and results", async () => {
      const { POST } = await import("@/app/api/search/analytics/route");

      const searchAnalytics = [
        {
          query: "React TypeScript",
          resultsCount: 5,
          clickedResult: testContentItems[0].id,
          timestamp: new Date().toISOString(),
          userAgent: "Integration Test",
        },
        {
          query: "Design System",
          resultsCount: 3,
          clickedResult: testContentItems[1].id,
          timestamp: new Date().toISOString(),
          userAgent: "Integration Test",
        },
      ];

      for (const analytics of searchAnalytics) {
        const analyticsRequest = new NextRequest(
          "http://localhost:3000/api/search/analytics",
          {
            method: "POST",
            body: JSON.stringify(analytics),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await POST(analyticsRequest);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.success).toBe(true);
        expect(result.data.tracked).toBe(true);
      }
    });

    it("should generate search performance metrics", async () => {
      const { GET } = await import("@/app/api/search/analytics/route");

      const metricsRequest = new NextRequest(
        "http://localhost:3000/api/search/analytics?type=performance&period=24h",
      );
      const response = await GET(metricsRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("totalSearches");
      expect(result.data).toHaveProperty("averageResponseTime");
      expect(result.data).toHaveProperty("popularQueries");
      expect(result.data).toHaveProperty("clickThroughRate");
      expect(Array.isArray(result.data.popularQueries)).toBe(true);
    });
  });

  describe("Step 6: Search Index Maintenance", () => {
    it("should handle index rebuilding", async () => {
      const { POST } = await import("@/app/api/search/index/rebuild/route");

      const rebuildRequest = new NextRequest(
        "http://localhost:3000/api/search/index/rebuild",
        {
          method: "POST",
          body: JSON.stringify({
            force: true,
            includeUnpublished: false,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(rebuildRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.rebuilt).toBe(true);
      expect(result.data.indexedItems).toBeGreaterThanOrEqual(0);
    });

    it("should handle index optimization", async () => {
      const { POST } = await import("@/app/api/search/index/optimize/route");

      const optimizeRequest = new NextRequest(
        "http://localhost:3000/api/search/index/optimize",
        {
          method: "POST",
          body: JSON.stringify({
            removeOrphaned: true,
            compactIndex: true,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(optimizeRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.optimized).toBe(true);
      expect(result.data).toHaveProperty("removedOrphaned");
      expect(result.data).toHaveProperty("compacted");
    });

    it("should validate search index integrity", async () => {
      const { GET } = await import("@/app/api/search/index/status/route");

      const statusRequest = new NextRequest(
        "http://localhost:3000/api/search/index/status",
      );
      const response = await GET(statusRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("indexSize");
      expect(result.data).toHaveProperty("lastUpdated");
      expect(result.data).toHaveProperty("health");
      expect(result.data).toHaveProperty("statistics");
      expect(result.data.health).toBe("healthy");
    });
  });

  describe("Step 7: Error Handling and Edge Cases", () => {
    it("should handle empty search queries gracefully", async () => {
      const { GET } = await import("@/app/api/search/route");

      const emptySearchRequest = new NextRequest(
        "http://localhost:3000/api/search?q=",
      );
      const response = await GET(emptySearchRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain("query");
    });

    it("should handle invalid search parameters", async () => {
      const { GET } = await import("@/app/api/search/route");

      const invalidRequests = [
        "http://localhost:3000/api/search?limit=invalid",
        "http://localhost:3000/api/search?page=0",
        "http://localhost:3000/api/search?sort=invalid_sort",
      ];

      for (const url of invalidRequests) {
        const invalidRequest = new NextRequest(url);
        const response = await GET(invalidRequest);
        const result = await response.json();

        expect(response.status).toBe(400);
        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
      }
    });

    it("should handle search index corruption gracefully", async () => {
      const { GET } = await import("@/app/api/search/route");

      // Mock index corruption scenario
      const mockIndexManager = await import("@/lib/search/index-manager");
      mockIndexManager.searchIndex.mockRejectedValueOnce(
        new Error("Index corrupted"),
      );

      const searchRequest = new NextRequest(
        "http://localhost:3000/api/search?q=test",
      );
      const response = await GET(searchRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toContain("search");
    });
  });

  describe("Step 8: Complete Search Flow Validation", () => {
    it("should validate the complete search lifecycle", async () => {
      // Test the complete flow: Index -> Search -> Results -> Analytics
      const testQuery = "Complete Flow Test";

      // 1. Create content and index it
      const { POST: createIndex } = await import(
        "@/app/api/search/index/route"
      );
      const indexData = {
        action: "create",
        itemId: "flow-test-item",
        title: testQuery,
        description: "Testing complete search flow",
        content: "This is a complete flow test item",
        tags: ["test", "flow", "complete"],
        categories: ["develop"],
        searchableText: `${testQuery} Testing complete search flow This is a complete flow test item test flow complete`,
      };

      const indexRequest = new NextRequest(
        "http://localhost:3000/api/search/index",
        {
          method: "POST",
          body: JSON.stringify(indexData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const indexResponse = await createIndex(indexRequest);
      expect(indexResponse.status).toBe(201);

      // 2. Search for the content
      const { GET: search } = await import("@/app/api/search/route");
      const searchRequest = new NextRequest(
        `http://localhost:3000/api/search?q=${encodeURIComponent(testQuery)}`,
      );
      const searchResponse = await search(searchRequest);
      const searchResult = await searchResponse.json();

      expect(searchResponse.status).toBe(200);
      expect(searchResult.success).toBe(true);
      expect(searchResult.data.results.length).toBeGreaterThan(0);

      // 3. Track search analytics
      const { POST: trackAnalytics } = await import(
        "@/app/api/search/analytics/route"
      );
      const analyticsData = {
        query: testQuery,
        resultsCount: searchResult.data.results.length,
        clickedResult: "flow-test-item",
        timestamp: new Date().toISOString(),
      };

      const analyticsRequest = new NextRequest(
        "http://localhost:3000/api/search/analytics",
        {
          method: "POST",
          body: JSON.stringify(analyticsData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const analyticsResponse = await trackAnalytics(analyticsRequest);
      expect(analyticsResponse.status).toBe(200);

      // 4. Verify the complete flow worked
      const foundItem = searchResult.data.results.find(
        (item: { id: string }) => item.id === "flow-test-item",
      );
      expect(foundItem).toBeDefined();
      expect(foundItem.title).toBe(testQuery);
    });
  });
});
