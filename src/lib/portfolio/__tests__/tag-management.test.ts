/**
 * Unit tests for Tag Management System
 */

import type { TagInfo } from "@/types/enhanced-content";
import { promises as fs } from "fs";
import { PortfolioTagManager, createTagManager } from "../tag-management";

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("PortfolioTagManager", () => {
  let tagManager: PortfolioTagManager;
  const testDataPath = "/test/tags.json";

  beforeEach(() => {
    jest.clearAllMocks();
    tagManager = createTagManager(testDataPath);
    tagManager.resetCache();
  });

  describe("createTag", () => {
    beforeEach(() => {
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should create a new tag successfully", async () => {
      const tagName = "React";
      const result = await tagManager.createTag(tagName);

      expect(result).toEqual({
        name: "react",
        count: 0,
        createdAt: expect.any(String),
        lastUsed: expect.any(String),
      });

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.stringContaining('"name": "react"'),
        "utf-8",
      );
    });

    it("should normalize tag names", async () => {
      const result = await tagManager.createTag("  React.js  ");
      expect(result.name).toBe("reactjs");
    });

    it("should return existing tag if already exists", async () => {
      const existingTag: TagInfo = {
        name: "react",
        count: 5,
        createdAt: "2023-01-01T00:00:00.000Z",
        lastUsed: "2023-01-02T00:00:00.000Z",
      };

      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          tags: [existingTag],
          lastUpdated: "2023-01-01T00:00:00.000Z",
        }),
      );

      const result = await tagManager.createTag("React");
      expect(result).toEqual(existingTag);
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });

    it("should throw error for invalid tag names", async () => {
      await expect(tagManager.createTag("")).rejects.toThrow(
        "Tag name must be a non-empty string",
      );
      await expect(tagManager.createTag("   ")).rejects.toThrow(
        "Tag name cannot be empty after normalization",
      );
    });
  });

  describe("getAllTags", () => {
    it("should return empty array when no tags exist", async () => {
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });

      const result = await tagManager.getAllTags();
      expect(result).toEqual([]);
    });

    it("should return tags sorted by usage count then creation date", async () => {
      const tags: TagInfo[] = [
        {
          name: "react",
          count: 3,
          createdAt: "2023-01-02T00:00:00.000Z",
          lastUsed: "2023-01-03T00:00:00.000Z",
        },
        {
          name: "vue",
          count: 5,
          createdAt: "2023-01-01T00:00:00.000Z",
          lastUsed: "2023-01-04T00:00:00.000Z",
        },
        {
          name: "angular",
          count: 3,
          createdAt: "2023-01-01T00:00:00.000Z",
          lastUsed: "2023-01-05T00:00:00.000Z",
        },
      ];

      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          tags,
          lastUpdated: "2023-01-01T00:00:00.000Z",
        }),
      );

      const result = await tagManager.getAllTags();

      // Should be sorted by count (desc), then by createdAt (asc)
      expect(result).toEqual([
        tags[1], // vue (count: 5)
        tags[2], // angular (count: 3, earlier createdAt)
        tags[0], // react (count: 3, later createdAt)
      ]);
    });
  });

  describe("updateTagUsage", () => {
    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should update existing tag usage", async () => {
      const existingTag: TagInfo = {
        name: "react",
        count: 5,
        createdAt: "2023-01-01T00:00:00.000Z",
        lastUsed: "2023-01-02T00:00:00.000Z",
      };

      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          tags: [existingTag],
          lastUpdated: "2023-01-01T00:00:00.000Z",
        }),
      );

      await tagManager.updateTagUsage("React");

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.stringContaining('"count": 6'),
        "utf-8",
      );
    });

    it("should create new tag if it doesn't exist", async () => {
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });

      await tagManager.updateTagUsage("NewTag");

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.stringContaining('"name": "newtag"'),
        "utf-8",
      );
    });

    it("should handle invalid tag names gracefully", async () => {
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });

      await tagManager.updateTagUsage("");
      await tagManager.updateTagUsage(null as never);

      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe("deleteTag", () => {
    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should delete existing tag", async () => {
      const existingTag: TagInfo = {
        name: "react",
        count: 5,
        createdAt: "2023-01-01T00:00:00.000Z",
        lastUsed: "2023-01-02T00:00:00.000Z",
      };

      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          tags: [existingTag],
          lastUpdated: "2023-01-01T00:00:00.000Z",
        }),
      );

      const result = await tagManager.deleteTag("React");
      expect(result).toBe(true);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.stringContaining('"tags": []'),
        "utf-8",
      );
    });

    it("should return false for non-existent tag", async () => {
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });

      const result = await tagManager.deleteTag("NonExistent");
      expect(result).toBe(false);
    });
  });

  describe("searchTags", () => {
    beforeEach(() => {
      const tags: TagInfo[] = [
        {
          name: "react",
          count: 10,
          createdAt: "2023-01-01T00:00:00.000Z",
          lastUsed: "2023-01-03T00:00:00.000Z",
        },
        {
          name: "react-native",
          count: 5,
          createdAt: "2023-01-02T00:00:00.000Z",
          lastUsed: "2023-01-04T00:00:00.000Z",
        },
        {
          name: "vue",
          count: 8,
          createdAt: "2023-01-03T00:00:00.000Z",
          lastUsed: "2023-01-05T00:00:00.000Z",
        },
      ];

      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          tags,
          lastUpdated: "2023-01-01T00:00:00.000Z",
        }),
      );
    });

    it("should find tags by partial match", async () => {
      const result = await tagManager.searchTags("react");

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("react"); // Exact match first
      expect(result[1].name).toBe("react-native"); // Partial match second
    });

    it("should return empty array for empty query", async () => {
      const result = await tagManager.searchTags("");
      expect(result).toEqual([]);
    });

    it("should be case insensitive", async () => {
      const result = await tagManager.searchTags("REACT");
      expect(result).toHaveLength(2);
    });
  });

  describe("bulkUpdateTagUsage", () => {
    beforeEach(() => {
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should update multiple tags at once", async () => {
      await tagManager.bulkUpdateTagUsage(["React", "Vue", "Angular"]);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.stringContaining('"name": "react"'),
        "utf-8",
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.stringContaining('"name": "vue"'),
        "utf-8",
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.stringContaining('"name": "angular"'),
        "utf-8",
      );
    });

    it("should handle invalid input gracefully", async () => {
      await tagManager.bulkUpdateTagUsage(null as never);
      await tagManager.bulkUpdateTagUsage(["", null, undefined] as never);

      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe("getTagStats", () => {
    beforeEach(() => {
      const tags: TagInfo[] = [
        {
          name: "react",
          count: 10,
          createdAt: "2023-01-01T00:00:00.000Z",
          lastUsed: "2023-01-03T00:00:00.000Z",
        },
        {
          name: "vue",
          count: 5,
          createdAt: new Date(
            Date.now() - 10 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 10 days ago
          lastUsed: "2023-01-04T00:00:00.000Z",
        },
      ];

      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          tags,
          lastUpdated: "2023-01-01T00:00:00.000Z",
        }),
      );
    });

    it("should return correct statistics", async () => {
      const stats = await tagManager.getTagStats();

      expect(stats.totalTags).toBe(2);
      expect(stats.totalUsage).toBe(15);
      expect(stats.mostUsedTag?.name).toBe("react");
      expect(stats.recentlyCreated).toHaveLength(1);
      expect(stats.recentlyCreated[0].name).toBe("vue");
    });
  });

  describe("cleanupUnusedTags", () => {
    beforeEach(() => {
      const ninetyOneDaysAgo = new Date();
      ninetyOneDaysAgo.setDate(ninetyOneDaysAgo.getDate() - 91);

      const tags: TagInfo[] = [
        {
          name: "active-tag",
          count: 5,
          createdAt: "2023-01-01T00:00:00.000Z",
          lastUsed: new Date().toISOString(),
        },
        {
          name: "unused-old-tag",
          count: 0,
          createdAt: "2023-01-01T00:00:00.000Z",
          lastUsed: ninetyOneDaysAgo.toISOString(),
        },
        {
          name: "unused-recent-tag",
          count: 0,
          createdAt: "2023-01-01T00:00:00.000Z",
          lastUsed: new Date().toISOString(),
        },
      ];

      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          tags,
          lastUpdated: "2023-01-01T00:00:00.000Z",
        }),
      );
      mockFs.writeFile.mockResolvedValue(undefined);
    });

    it("should remove unused old tags", async () => {
      const deletedCount = await tagManager.cleanupUnusedTags();

      expect(deletedCount).toBe(1);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        testDataPath,
        expect.not.stringContaining('"name": "unused-old-tag"'),
        "utf-8",
      );
    });
  });

  describe("caching", () => {
    it("should use cache when available", async () => {
      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          tags: [],
          lastUpdated: "2023-01-01T00:00:00.000Z",
        }),
      );

      // First call should read from file
      await tagManager.getAllTags();
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await tagManager.getAllTags();
      expect(mockFs.readFile).toHaveBeenCalledTimes(1);
    });

    it("should provide cache utilities", () => {
      expect(tagManager.getCacheSize()).toBe(0);

      tagManager.resetCache();
      expect(tagManager.getCacheSize()).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should handle file read errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("Permission denied"));

      const result = await tagManager.getAllTags();
      expect(result).toEqual([]);
    });

    it("should handle file write errors", async () => {
      mockFs.readFile.mockRejectedValue({ code: "ENOENT" });
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockRejectedValue(new Error("Disk full"));

      await expect(tagManager.createTag("test")).rejects.toThrow(
        "Failed to save tags data",
      );
    });

    it("should handle invalid JSON data", async () => {
      mockFs.readFile.mockResolvedValue("invalid json");

      const result = await tagManager.getAllTags();
      expect(result).toEqual([]);
    });

    it("should validate tag data structure", async () => {
      mockFs.readFile.mockResolvedValue(
        JSON.stringify({
          tags: [
            {
              name: "valid",
              count: 1,
              createdAt: "2023-01-01T00:00:00.000Z",
              lastUsed: "2023-01-01T00:00:00.000Z",
            },
            { name: "", count: 1 }, // Invalid: empty name, missing dates
            { count: 1 }, // Invalid: missing name
            null, // Invalid: null
          ],
          lastUpdated: "2023-01-01T00:00:00.000Z",
        }),
      );

      const result = await tagManager.getAllTags();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("valid");
    });
  });
});
