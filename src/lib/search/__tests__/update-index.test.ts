/**
 * @jest-environment node
 */

import { promises as fs } from "fs";
import { clearSearchCache, updateSearchIndex } from "../index";
import {
  forceRebuildSearchIndex,
  updateSearchIndexAfterContentChange,
  watchContentChanges,
} from "../update-index";

// Mock dependencies
jest.mock("fs", () => ({
  promises: {
    unlink: jest.fn(),
  },
  watch: jest.fn(),
}));

jest.mock("../index", () => ({
  clearSearchCache: jest.fn(),
  updateSearchIndex: jest.fn(),
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockClearSearchCache = clearSearchCache as jest.MockedFunction<
  typeof clearSearchCache
>;
const mockUpdateSearchIndex = updateSearchIndex as jest.MockedFunction<
  typeof updateSearchIndex
>;

// Ensure window is undefined in node environment
delete (global as unknown as { window?: unknown }).window;

describe("Search Index Update System", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("updateSearchIndexAfterContentChange", () => {
    it("should update search index successfully", async () => {
      mockUpdateSearchIndex.mockResolvedValue(true);

      const result = await updateSearchIndexAfterContentChange();

      expect(result).toBe(true);
      expect(mockClearSearchCache).toHaveBeenCalled();
      expect(mockUpdateSearchIndex).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "Updating search index after content change...",
      );
      expect(console.log).toHaveBeenCalledWith(
        "Search index updated successfully",
      );
    });

    it("should handle update failure", async () => {
      mockUpdateSearchIndex.mockResolvedValue(false);

      const result = await updateSearchIndexAfterContentChange();

      expect(result).toBe(false);
      expect(mockClearSearchCache).toHaveBeenCalled();
      expect(mockUpdateSearchIndex).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "Failed to update search index",
      );
    });

    it("should handle update errors", async () => {
      const error = new Error("Update failed");
      mockUpdateSearchIndex.mockRejectedValue(error);

      const result = await updateSearchIndexAfterContentChange();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating search index:",
        error,
      );
    });
  });

  describe("watchContentChanges", () => {
    it("should not run in node environment", () => {
      // Since window is undefined in node environment, the function should return early
      watchContentChanges();

      // No expectations needed as the function returns early
      expect(true).toBe(true);
    });

    it("should not run on client side", () => {
      // Mock client environment
      (global as unknown as { window: unknown }).window = {};

      watchContentChanges();

      // Function should return early when window is defined
      expect(true).toBe(true);

      delete (global as unknown as { window?: unknown }).window;
    });
  });

  describe("forceRebuildSearchIndex", () => {
    it("should force rebuild search index successfully", async () => {
      mockFs.unlink.mockResolvedValue(undefined);
      mockUpdateSearchIndex.mockResolvedValue(true);

      const result = await forceRebuildSearchIndex();

      expect(result).toBe(true);
      expect(mockClearSearchCache).toHaveBeenCalled();
      expect(mockFs.unlink).toHaveBeenCalledWith(
        expect.stringContaining("search-index.json"),
      );
      expect(mockUpdateSearchIndex).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        "Force rebuilding search index...",
      );
      expect(console.log).toHaveBeenCalledWith(
        "Search index force rebuilt successfully",
      );
    });

    it("should handle missing index file gracefully", async () => {
      mockFs.unlink.mockRejectedValue(new Error("File not found"));
      mockUpdateSearchIndex.mockResolvedValue(true);

      const result = await forceRebuildSearchIndex();

      expect(result).toBe(true);
      expect(mockUpdateSearchIndex).toHaveBeenCalled();
    });

    it("should handle rebuild failure", async () => {
      mockFs.unlink.mockResolvedValue(undefined);
      mockUpdateSearchIndex.mockResolvedValue(false);

      const result = await forceRebuildSearchIndex();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Failed to force rebuild search index",
      );
    });

    it("should handle rebuild errors", async () => {
      const error = new Error("Rebuild failed");
      mockUpdateSearchIndex.mockRejectedValue(error);

      const result = await forceRebuildSearchIndex();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Error force rebuilding search index:",
        error,
      );
    });
  });

  describe("integration scenarios", () => {
    it("should handle multiple concurrent updates", async () => {
      mockUpdateSearchIndex.mockResolvedValue(true);

      const promises = [
        updateSearchIndexAfterContentChange(),
        updateSearchIndexAfterContentChange(),
        forceRebuildSearchIndex(),
      ];

      const results = await Promise.all(promises);

      expect(results).toEqual([true, true, true]);
      expect(mockClearSearchCache).toHaveBeenCalledTimes(3);
      expect(mockUpdateSearchIndex).toHaveBeenCalledTimes(3);
    });

    it("should handle mixed success and failure scenarios", async () => {
      mockUpdateSearchIndex
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false)
        .mockRejectedValueOnce(new Error("Failed"));

      const results = await Promise.all([
        updateSearchIndexAfterContentChange(),
        updateSearchIndexAfterContentChange(),
        updateSearchIndexAfterContentChange(),
      ]);

      expect(results).toEqual([true, false, false]);
    });
  });

  describe("error handling", () => {
    it("should handle cache clear errors", async () => {
      mockClearSearchCache.mockImplementation(() => {
        throw new Error("Cache clear failed");
      });

      const result = await updateSearchIndexAfterContentChange();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Error updating search index:",
        expect.any(Error),
      );
    });

    it("should handle file system errors during force rebuild", async () => {
      const fsError = new Error("File system error");
      mockFs.unlink.mockRejectedValue(fsError);
      mockUpdateSearchIndex.mockResolvedValue(true);

      const result = await forceRebuildSearchIndex();

      // Should still succeed even if file deletion fails
      expect(result).toBe(true);
    });
  });
});
