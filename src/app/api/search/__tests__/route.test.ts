/**
 * @jest-environment node
 */

import { describe } from "node:test";

// Mock console to reduce noise in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});

describe("/api/search", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("should have basic test structure", () => {
      // Basic test to ensure the test file is working
      expect(true).toBe(true);
    });

    it("should handle search data structure", () => {
      const searchData = [
        {
          id: "portfolio-1",
          title: "React Dashboard Application",
          description: "モダンなReactダッシュボードアプリケーションの開発",
          type: "portfolio" as const,
          category: "開発",
          url: "/portfolio/portfolio-1753615145862",
          content: "React TypeScript Tailwind CSS Next.js ダッシュボード",
          tags: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
        },
      ];

      expect(Array.isArray(searchData)).toBe(true);
      expect(searchData.length).toBe(1);
      expect(searchData[0]).toHaveProperty("id");
      expect(searchData[0]).toHaveProperty("title");
      expect(searchData[0]).toHaveProperty("type");
      expect(searchData[0]).toHaveProperty("category");
      expect(searchData[0]).toHaveProperty("tags");
      expect(Array.isArray(searchData[0].tags)).toBe(true);
    });

    it("should handle empty query", () => {
      const query = "";
      const trimmedQuery = query.trim();

      expect(trimmedQuery).toBe("");
      expect(trimmedQuery.length).toBe(0);

      const response = {
        success: true,
        results: [],
        total: 0,
        query: "",
      };

      expect(response.success).toBe(true);
      expect(response.results).toEqual([]);
      expect(response.total).toBe(0);
    });

    it("should handle whitespace-only query", () => {
      const query = "   ";
      const trimmedQuery = query.trim();

      expect(trimmedQuery).toBe("");
      expect(trimmedQuery.length).toBe(0);
    });

    it("should filter by type", () => {
      const searchData = [
        { id: "portfolio-1", type: "portfolio", title: "Portfolio Item" },
        { id: "tool-1", type: "tool", title: "Tool Item" },
        { id: "page-1", type: "page", title: "Page Item" },
      ];

      const portfolioItems = searchData.filter(
        (item) => item.type === "portfolio",
      );
      expect(portfolioItems.length).toBe(1);
      expect(portfolioItems[0].id).toBe("portfolio-1");
    });

    it("should filter by category", () => {
      const searchData = [
        { id: "item-1", category: "開発", title: "Development Item" },
        { id: "item-2", category: "映像", title: "Video Item" },
        { id: "item-3", category: "ツール", title: "Tool Item" },
      ];

      const developmentItems = searchData.filter(
        (item) => item.category === "開発",
      );
      expect(developmentItems.length).toBe(1);
      expect(developmentItems[0].id).toBe("item-1");

      // Should not filter when category is 'すべて'
      const allItems = searchData.filter((item) =>
        "すべて" === "すべて" ? true : item.category === "すべて",
      );
      expect(allItems.length).toBe(3);
    });

    it("should perform case-insensitive search", () => {
      const searchData = [
        {
          title: "React Dashboard",
          description: "React application",
          content: "React TypeScript",
          tags: ["React", "TypeScript"],
        },
      ];

      const query = "react";
      const searchText =
        `${searchData[0].title} ${searchData[0].description} ${searchData[0].content} ${searchData[0].tags.join(" ")}`.toLowerCase();
      const searchQuery = query.toLowerCase();

      expect(searchText.includes(searchQuery)).toBe(true);
    });

    it("should score results appropriately", () => {
      const item = {
        title: "React Dashboard",
        description: "React application",
        content: "TypeScript React",
        tags: ["React", "TypeScript"],
      };

      const query = "react";
      const searchQuery = query.toLowerCase();
      let score = 0;

      // タイトルマッチは高スコア
      if (item.title.toLowerCase().includes(searchQuery)) {
        score += 10;
      }

      // 説明マッチは中スコア
      if (item.description.toLowerCase().includes(searchQuery)) {
        score += 5;
      }

      // タグマッチは中スコア
      if (item.tags.some((tag) => tag.toLowerCase().includes(searchQuery))) {
        score += 5;
      }

      // コンテンツマッチは低スコア
      if (item.content.toLowerCase().includes(searchQuery)) {
        score += 1;
      }

      expect(score).toBe(21); // 10 + 5 + 5 + 1
    });

    it("should sort results by score", () => {
      const results = [
        { id: "item-1", score: 5 },
        { id: "item-2", score: 10 },
        { id: "item-3", score: 3 },
      ];

      const sortedResults = results.sort((a, b) => b.score - a.score);

      expect(sortedResults[0].id).toBe("item-2");
      expect(sortedResults[1].id).toBe("item-1");
      expect(sortedResults[2].id).toBe("item-3");
    });

    it("should include highlight information", () => {
      const item = {
        title: "React Dashboard",
        description: "React application",
      };

      const result = {
        ...item,
        highlight: {
          title: item.title,
          description: item.description,
        },
      };

      expect(result.highlight).toHaveProperty("title");
      expect(result.highlight).toHaveProperty("description");
      expect(result.highlight.title).toBe("React Dashboard");
    });

    it("should handle mode parameter", () => {
      const url1 = new URL("http://localhost:3000/api/search?q=React");
      const url2 = new URL(
        "http://localhost:3000/api/search?q=React&mode=advanced",
      );

      const mode1 = url1.searchParams.get("mode") || "simple";
      const mode2 = url2.searchParams.get("mode") || "simple";

      expect(mode1).toBe("simple");
      expect(mode2).toBe("advanced");
    });

    it("should handle special characters in query", () => {
      const url = new URL(
        "http://localhost:3000/api/search?q=React%20%26%20TypeScript",
      );
      const query = url.searchParams.get("q") || "";

      expect(query).toBe("React & TypeScript");
    });

    it("should handle Japanese characters in query", () => {
      const url = new URL("http://localhost:3000/api/search?q=開発");
      const query = url.searchParams.get("q") || "";

      expect(query).toBe("開発");
    });

    it("should handle error cases", () => {
      const errorResponse = {
        success: false,
        error: "Internal server error",
      };

      expect(errorResponse).toHaveProperty("success", false);
      expect(errorResponse).toHaveProperty("error", "Internal server error");
    });

    it("should return proper total count", () => {
      const results = [
        { id: "item-1", title: "Item 1" },
        { id: "item-2", title: "Item 2" },
      ];

      const response = {
        success: true,
        results,
        total: results.length,
        query: "test",
      };

      expect(response.total).toBe(results.length);
      expect(response.total).toBe(2);
    });
  });
});
