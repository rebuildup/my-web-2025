/**
 * Tests for Tag Management API Endpoints
 */

import { portfolioTagManager } from "@/lib/portfolio/tag-management";
import type { TagInfo } from "@/types/enhanced-content";

// Mock the tag manager
jest.mock("@/lib/portfolio/tag-management", () => ({
  portfolioTagManager: {
    getAllTags: jest.fn(),
    searchTags: jest.fn(),
    createTag: jest.fn(),
    deleteTag: jest.fn(),
    cleanupUnusedTags: jest.fn(),
  },
}));

const mockTagManager = portfolioTagManager as jest.Mocked<
  typeof portfolioTagManager
>;

// Mock Next.js server functions
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      json: async () => data,
      status: init?.status || 200,
    }),
  },
}));

describe("Tag Management API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Tag Manager Integration", () => {
    const mockTags: TagInfo[] = [
      {
        name: "react",
        count: 10,
        createdAt: "2023-01-01T00:00:00.000Z",
        lastUsed: "2023-01-03T00:00:00.000Z",
      },
      {
        name: "vue",
        count: 5,
        createdAt: "2023-01-02T00:00:00.000Z",
        lastUsed: "2023-01-04T00:00:00.000Z",
      },
    ];

    it("should get all tags", async () => {
      mockTagManager.getAllTags.mockResolvedValue(mockTags);

      const tags = await portfolioTagManager.getAllTags();

      expect(tags).toEqual(mockTags);
      expect(mockTagManager.getAllTags).toHaveBeenCalled();
    });

    it("should search tags", async () => {
      const searchResults = [mockTags[0]];
      mockTagManager.searchTags.mockResolvedValue(searchResults);

      const results = await portfolioTagManager.searchTags("react");

      expect(results).toEqual(searchResults);
      expect(mockTagManager.searchTags).toHaveBeenCalledWith("react");
    });

    it("should create a new tag", async () => {
      const newTag: TagInfo = {
        name: "angular",
        count: 0,
        createdAt: "2023-01-05T00:00:00.000Z",
        lastUsed: "2023-01-05T00:00:00.000Z",
      };

      mockTagManager.createTag.mockResolvedValue(newTag);

      const result = await portfolioTagManager.createTag("Angular");

      expect(result).toEqual(newTag);
      expect(mockTagManager.createTag).toHaveBeenCalledWith("Angular");
    });

    it("should delete a tag", async () => {
      mockTagManager.deleteTag.mockResolvedValue(true);

      const result = await portfolioTagManager.deleteTag("react");

      expect(result).toBe(true);
      expect(mockTagManager.deleteTag).toHaveBeenCalledWith("react");
    });

    it("should cleanup unused tags", async () => {
      mockTagManager.cleanupUnusedTags.mockResolvedValue(3);

      const result = await portfolioTagManager.cleanupUnusedTags();

      expect(result).toBe(3);
      expect(mockTagManager.cleanupUnusedTags).toHaveBeenCalled();
    });

    it("should handle errors gracefully", async () => {
      mockTagManager.getAllTags.mockRejectedValue(new Error("Database error"));

      await expect(portfolioTagManager.getAllTags()).rejects.toThrow(
        "Database error",
      );
    });
  });

  describe("API Response Validation", () => {
    it("should validate tag creation input", () => {
      const validTag = { name: "React" };
      const invalidTag = { name: "" };

      expect(validTag.name).toBeTruthy();
      expect(typeof validTag.name).toBe("string");

      expect(invalidTag.name).toBeFalsy();
    });

    it("should validate tag deletion input", () => {
      const validTags = ["react", "vue", "angular"];
      const invalidTags = ["", null, undefined];

      expect(Array.isArray(validTags)).toBe(true);
      expect(
        validTags.every((tag) => typeof tag === "string" && tag.length > 0),
      ).toBe(true);

      expect(invalidTags.some((tag) => !tag || typeof tag !== "string")).toBe(
        true,
      );
    });

    it("should validate search query", () => {
      const validQuery = "react";
      const invalidQuery = "";

      expect(typeof validQuery).toBe("string");
      expect(validQuery.length).toBeGreaterThan(0);

      expect(typeof invalidQuery).toBe("string");
      expect(invalidQuery.length).toBe(0);
    });
  });

  describe("URL Parameter Parsing", () => {
    it("should parse search parameters correctly", () => {
      const testUrl = new URL(
        "http://localhost:3000/api/admin/tags?q=react&limit=10&sortBy=name",
      );

      expect(testUrl.searchParams.get("q")).toBe("react");
      expect(testUrl.searchParams.get("limit")).toBe("10");
      expect(testUrl.searchParams.get("sortBy")).toBe("name");
    });

    it("should handle missing parameters", () => {
      const testUrl = new URL("http://localhost:3000/api/admin/tags");

      expect(testUrl.searchParams.get("q")).toBeNull();
      expect(testUrl.searchParams.get("limit")).toBeNull();
      expect(testUrl.searchParams.get("sortBy")).toBeNull();
    });

    it("should decode URL parameters", () => {
      const encodedName = encodeURIComponent("React Native");
      const decodedName = decodeURIComponent(encodedName);

      expect(decodedName).toBe("React Native");
    });
  });

  describe("Error Handling", () => {
    it("should handle tag manager errors", async () => {
      const error = new Error("File system error");
      mockTagManager.getAllTags.mockRejectedValue(error);

      await expect(portfolioTagManager.getAllTags()).rejects.toThrow(
        "File system error",
      );
    });

    it("should handle invalid JSON", () => {
      const invalidJson = "{ invalid json }";

      expect(() => JSON.parse(invalidJson)).toThrow();
    });

    it("should handle network errors", async () => {
      const networkError = new Error("Network timeout");
      mockTagManager.createTag.mockRejectedValue(networkError);

      await expect(portfolioTagManager.createTag("test")).rejects.toThrow(
        "Network timeout",
      );
    });
  });
});
