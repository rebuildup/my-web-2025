/**
 * @jest-environment node
 */

import { promises as fs } from "fs";
import path from "path";
import {
  getDownloadStats,
  getMostDownloadedContent,
  getMostViewedContent,
  getPopularSearchQueries,
  getSearchStats,
  getStatsSummary,
  getViewStats,
  updateDownloadStats,
  updateSearchStats,
  updateViewStats,
} from "../index";

// Mock fs promises
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("Stats Management System", () => {
  const STATS_DIR = path.join(process.cwd(), "public/data/stats");

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("updateDownloadStats", () => {
    it("should update download stats for new item", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await updateDownloadStats("item1");

      expect(result).toBe(true);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "download-stats.json"),
        "utf-8",
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "download-stats.json"),
        JSON.stringify({ item1: 1 }, null, 2),
        "utf-8",
      );
    });

    it("should increment existing download stats", async () => {
      const existingStats = { item1: 5, item2: 3 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingStats));
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await updateDownloadStats("item1");

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "download-stats.json"),
        JSON.stringify({ item1: 6, item2: 3 }, null, 2),
        "utf-8",
      );
    });

    it("should handle write errors", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockRejectedValue(new Error("Write failed"));

      const result = await updateDownloadStats("item1");

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to save stats:",
        expect.any(Error),
      );
    });

    it("should handle read errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("Permission denied"));
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await updateDownloadStats("item1");

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "download-stats.json"),
        JSON.stringify({ item1: 1 }, null, 2),
        "utf-8",
      );
    });
  });

  describe("updateViewStats", () => {
    it("should update view stats for new item", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await updateViewStats("page1");

      expect(result).toBe(true);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "view-stats.json"),
        "utf-8",
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "view-stats.json"),
        JSON.stringify({ page1: 1 }, null, 2),
        "utf-8",
      );
    });

    it("should increment existing view stats", async () => {
      const existingStats = { page1: 10, page2: 5 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingStats));
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await updateViewStats("page1");

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "view-stats.json"),
        JSON.stringify({ page1: 11, page2: 5 }, null, 2),
        "utf-8",
      );
    });

    it("should handle errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockRejectedValue(new Error("Write failed"));

      const result = await updateViewStats("page1");

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to save stats:",
        expect.any(Error),
      );
    });
  });

  describe("updateSearchStats", () => {
    it("should update search stats with normalized query", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await updateSearchStats("  React Components  ");

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "search-stats.json"),
        JSON.stringify({ "react components": 1 }, null, 2),
        "utf-8",
      );
    });

    it("should increment existing search stats", async () => {
      const existingStats = { react: 5, vue: 3 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(existingStats));
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await updateSearchStats("React");

      expect(result).toBe(true);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "search-stats.json"),
        JSON.stringify({ react: 6, vue: 3 }, null, 2),
        "utf-8",
      );
    });

    it("should handle errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));
      mockFs.writeFile.mockRejectedValue(new Error("Write failed"));

      const result = await updateSearchStats("test query");

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to save stats:",
        expect.any(Error),
      );
    });
  });

  describe("getDownloadStats", () => {
    it("should return specific item stats", async () => {
      const stats = { item1: 10, item2: 5 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getDownloadStats("item1");

      expect(result).toBe(10);
      expect(mockFs.readFile).toHaveBeenCalledWith(
        path.join(STATS_DIR, "download-stats.json"),
        "utf-8",
      );
    });

    it("should return 0 for non-existent item", async () => {
      const stats = { item1: 10, item2: 5 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getDownloadStats("item3");

      expect(result).toBe(0);
    });

    it("should return all stats when no id provided", async () => {
      const stats = { item1: 10, item2: 5 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getDownloadStats();

      expect(result).toEqual(stats);
    });

    it("should handle file read errors", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await getDownloadStats("item1");

      expect(result).toBe(0);
      // loadStats catches all errors and returns empty object, so no error is logged
    });

    it("should return empty object for all stats on error", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await getDownloadStats();

      expect(result).toEqual({});
    });
  });

  describe("getViewStats", () => {
    it("should return specific item view stats", async () => {
      const stats = { page1: 100, page2: 50 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getViewStats("page1");

      expect(result).toBe(100);
    });

    it("should return all view stats", async () => {
      const stats = { page1: 100, page2: 50 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getViewStats();

      expect(result).toEqual(stats);
    });

    it("should handle errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await getViewStats("page1");

      expect(result).toBe(0);
    });
  });

  describe("getSearchStats", () => {
    it("should return search stats", async () => {
      const stats = { react: 10, vue: 5 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getSearchStats();

      expect(result).toEqual(stats);
    });

    it("should handle errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await getSearchStats();

      expect(result).toEqual({});
    });
  });

  describe("getPopularSearchQueries", () => {
    it("should return popular queries sorted by count", async () => {
      const stats = { react: 10, vue: 15, angular: 5, svelte: 20 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getPopularSearchQueries(3);

      expect(result).toEqual([
        { query: "svelte", count: 20 },
        { query: "vue", count: 15 },
        { query: "react", count: 10 },
      ]);
    });

    it("should use default limit of 10", async () => {
      const stats = {};
      for (let i = 1; i <= 15; i++) {
        stats[`query${i}`] = i;
      }
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getPopularSearchQueries();

      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({ query: "query15", count: 15 });
    });

    it("should handle errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await getPopularSearchQueries();

      expect(result).toEqual([]);
    });
  });

  describe("getMostViewedContent", () => {
    it("should return most viewed content sorted by views", async () => {
      const stats = { page1: 100, page2: 200, page3: 50 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getMostViewedContent(2);

      expect(result).toEqual([
        { id: "page2", views: 200 },
        { id: "page1", views: 100 },
      ]);
    });

    it("should use default limit of 10", async () => {
      const stats = {};
      for (let i = 1; i <= 15; i++) {
        stats[`page${i}`] = i * 10;
      }
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getMostViewedContent();

      expect(result).toHaveLength(10);
      expect(result[0]).toEqual({ id: "page15", views: 150 });
    });

    it("should handle errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await getMostViewedContent();

      expect(result).toEqual([]);
    });
  });

  describe("getMostDownloadedContent", () => {
    it("should return most downloaded content sorted by downloads", async () => {
      const stats = { item1: 50, item2: 100, item3: 25 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getMostDownloadedContent(2);

      expect(result).toEqual([
        { id: "item2", downloads: 100 },
        { id: "item1", downloads: 50 },
      ]);
    });

    it("should handle errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await getMostDownloadedContent();

      expect(result).toEqual([]);
    });
  });

  describe("getStatsSummary", () => {
    it("should return comprehensive stats summary", async () => {
      const viewStats = { page1: 100, page2: 200 };
      const downloadStats = { item1: 50, item2: 75 };
      const searchStats = { react: 10, vue: 15 };

      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(viewStats))
        .mockResolvedValueOnce(JSON.stringify(downloadStats))
        .mockResolvedValueOnce(JSON.stringify(searchStats))
        .mockResolvedValueOnce(JSON.stringify(searchStats))
        .mockResolvedValueOnce(JSON.stringify(viewStats))
        .mockResolvedValueOnce(JSON.stringify(downloadStats));

      const result = await getStatsSummary();

      expect(result).toEqual({
        totalViews: 300,
        totalDownloads: 125,
        totalSearches: 25,
        topQueries: [
          { query: "vue", count: 15 },
          { query: "react", count: 10 },
        ],
        topContent: [
          { id: "page2", views: 200 },
          { id: "page1", views: 100 },
        ],
        topDownloads: [
          { id: "item2", downloads: 75 },
          { id: "item1", downloads: 50 },
        ],
      });
    });

    it("should handle errors gracefully", async () => {
      mockFs.readFile.mockRejectedValue(new Error("File not found"));

      const result = await getStatsSummary();

      expect(result).toEqual({
        totalViews: 0,
        totalDownloads: 0,
        totalSearches: 0,
        topQueries: [],
        topContent: [],
        topDownloads: [],
      });
    });

    it("should handle partial errors", async () => {
      const viewStats = { page1: 100 };
      mockFs.readFile
        .mockResolvedValueOnce(JSON.stringify(viewStats))
        .mockRejectedValueOnce(new Error("Download stats not found"))
        .mockRejectedValueOnce(new Error("Search stats not found"))
        .mockRejectedValueOnce(new Error("Search stats not found"))
        .mockResolvedValueOnce(JSON.stringify(viewStats))
        .mockRejectedValueOnce(new Error("Download stats not found"));

      const result = await getStatsSummary();

      expect(result.totalViews).toBe(100);
      expect(result.totalDownloads).toBe(0);
      expect(result.totalSearches).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("should handle malformed JSON files", async () => {
      mockFs.readFile.mockResolvedValue("invalid json");

      const result = await getDownloadStats();

      expect(result).toEqual({});
    });

    it("should handle empty stats files", async () => {
      mockFs.readFile.mockResolvedValue("{}");

      const result = await getPopularSearchQueries();

      expect(result).toEqual([]);
    });

    it("should handle null/undefined values in stats", async () => {
      const stats = { item1: null, item2: undefined, item3: 5 };
      mockFs.readFile.mockResolvedValue(JSON.stringify(stats));

      const result = await getMostDownloadedContent();

      // JSON.stringify removes undefined values, so only null and valid values remain
      expect(result).toEqual([
        { id: "item3", downloads: 5 },
        { id: "item1", downloads: null },
      ]);
    });
  });
});
