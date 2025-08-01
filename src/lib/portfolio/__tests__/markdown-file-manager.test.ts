/**
 * Tests for Markdown File Manager
 */

import { promises as fs } from "fs";
import { join } from "path";
import { MarkdownFileManagerImpl } from "../markdown-file-manager";

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    unlink: jest.fn(),
    stat: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
    readdir: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("MarkdownFileManager", () => {
  let manager: MarkdownFileManagerImpl;
  const testBaseDir = "/test/markdown";

  beforeEach(() => {
    manager = new MarkdownFileManagerImpl(testBaseDir);
    jest.clearAllMocks();
  });

  describe("createMarkdownFile", () => {
    it("should create a new markdown file successfully", async () => {
      const itemId = "test-item-1";
      const content = "# Test Content\n\nThis is test markdown content.";
      const expectedPath = join(testBaseDir, "test-item-1.md");

      // Mock directory exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file doesn't exist
      mockFs.access.mockRejectedValueOnce(new Error("File not found"));
      // Mock file write
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      // Mock stat for cache
      mockFs.stat.mockResolvedValueOnce({
        mtimeMs: Date.now(),
        size: content.length,
        birthtime: new Date(),
        mtime: new Date(),
      } as fs.Stats);

      const result = await manager.createMarkdownFile(itemId, content);

      expect(result).toBe(expectedPath);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expectedPath,
        content,
        "utf-8",
      );
    });

    it("should throw error if file already exists", async () => {
      const itemId = "existing-item";
      const content = "# Existing Content";

      // Mock directory exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file exists (second access call for file existence check)
      mockFs.access.mockResolvedValueOnce(undefined);

      await expect(
        manager.createMarkdownFile(itemId, content),
      ).rejects.toMatchObject({
        type: "file_creation",
        message: "Markdown file already exists for item existing-item",
      });
    });

    it("should validate item ID", async () => {
      const invalidIds = [
        "",
        "item with spaces",
        "item/with/slashes",
        "a".repeat(101),
      ];

      for (const invalidId of invalidIds) {
        await expect(
          manager.createMarkdownFile(invalidId, "content"),
        ).rejects.toMatchObject({
          type: "file_creation",
        });
      }
    });

    it("should validate content", async () => {
      const itemId = "test-item";
      const dangerousContent = '<script>alert("xss")</script>';

      await expect(
        manager.createMarkdownFile(itemId, dangerousContent),
      ).rejects.toMatchObject({
        type: "file_creation",
        message: "Content contains potentially dangerous elements",
      });
    });

    it("should create directory if it doesn't exist", async () => {
      const itemId = "test-item";
      const content = "# Test";

      // Mock directory doesn't exist
      mockFs.access.mockRejectedValueOnce(new Error("Directory not found"));
      // Mock mkdir
      mockFs.mkdir.mockResolvedValueOnce(undefined);
      // Mock file doesn't exist
      mockFs.access.mockRejectedValueOnce(new Error("File not found"));
      // Mock file write
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      // Mock stat
      mockFs.stat.mockResolvedValueOnce({
        mtimeMs: Date.now(),
        size: content.length,
      } as Stats);

      await manager.createMarkdownFile(itemId, content);

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining("test"),
        { recursive: true },
      );
    });
  });

  describe("readMarkdownFile", () => {
    it("should read markdown file successfully", async () => {
      const filePath = join(testBaseDir, "test-item.md");
      const content = "# Test Content";

      mockFs.readFile.mockResolvedValueOnce(content);
      mockFs.stat.mockResolvedValueOnce({
        mtimeMs: Date.now(),
        size: content.length,
      } as Stats);

      const result = await manager.readMarkdownFile(filePath);

      expect(result).toBe(content);
      expect(mockFs.readFile).toHaveBeenCalledWith(filePath, "utf-8");
    });

    it("should use cache when file hasn't changed", async () => {
      const filePath = join(testBaseDir, "cached-item.md");
      const content = "# Cached Content";
      const lastModified = Date.now();

      // First read
      mockFs.readFile.mockResolvedValueOnce(content);
      mockFs.stat.mockResolvedValueOnce({
        mtimeMs: lastModified,
        size: content.length,
      } as Stats);

      const result1 = await manager.readMarkdownFile(filePath);

      // Second read - should use cache
      mockFs.stat.mockResolvedValueOnce({
        mtimeMs: lastModified, // Same modification time
        size: content.length,
      } as Stats);

      const result2 = await manager.readMarkdownFile(filePath);

      expect(result1).toBe(content);
      expect(result2).toBe(content);
      expect(mockFs.readFile).toHaveBeenCalledTimes(1); // Only called once
    });

    it("should throw error for invalid path", async () => {
      const invalidPaths = [
        "/invalid/path.md",
        join(testBaseDir, "../outside.md"),
        join(testBaseDir, "file.txt"),
      ];

      for (const invalidPath of invalidPaths) {
        await expect(
          manager.readMarkdownFile(invalidPath),
        ).rejects.toMatchObject({
          type: "file_read",
          message: "Invalid markdown file path: " + invalidPath,
        });
      }
    });

    it("should throw file_not_found error when file doesn't exist", async () => {
      const filePath = join(testBaseDir, "nonexistent.md");
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";

      mockFs.readFile.mockRejectedValueOnce(error);

      await expect(manager.readMarkdownFile(filePath)).rejects.toMatchObject({
        type: "file_not_found",
        filePath,
      });
    });
  });

  describe("updateMarkdownFile", () => {
    it("should update existing markdown file", async () => {
      const filePath = join(testBaseDir, "update-test.md");
      const newContent = "# Updated Content";

      // Mock file exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file write
      mockFs.writeFile.mockResolvedValueOnce(undefined);
      // Mock stat for cache
      mockFs.stat.mockResolvedValueOnce({
        mtimeMs: Date.now(),
        size: newContent.length,
      } as Stats);

      await manager.updateMarkdownFile(filePath, newContent);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        filePath,
        newContent,
        "utf-8",
      );
    });

    it("should throw error if file doesn't exist", async () => {
      const filePath = join(testBaseDir, "nonexistent.md");
      const content = "# New Content";

      // Mock file doesn't exist
      mockFs.access.mockRejectedValueOnce(new Error("File not found"));

      await expect(
        manager.updateMarkdownFile(filePath, content),
      ).rejects.toMatchObject({
        type: "file_update",
        message: "Markdown file not found: " + filePath,
      });
    });

    it("should validate content before updating", async () => {
      const filePath = join(testBaseDir, "test.md");
      const dangerousContent = '<iframe src="javascript:alert(1)"></iframe>';

      await expect(
        manager.updateMarkdownFile(filePath, dangerousContent),
      ).rejects.toMatchObject({
        type: "file_update",
        message: "Content contains potentially dangerous elements",
      });
    });
  });

  describe("deleteMarkdownFile", () => {
    it("should delete markdown file successfully", async () => {
      const filePath = join(testBaseDir, "delete-test.md");

      // Mock file exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file deletion
      mockFs.unlink.mockResolvedValueOnce(undefined);

      await manager.deleteMarkdownFile(filePath);

      expect(mockFs.unlink).toHaveBeenCalledWith(filePath);
    });

    it("should throw error if file doesn't exist", async () => {
      const filePath = join(testBaseDir, "nonexistent.md");

      // Mock file doesn't exist
      mockFs.access.mockRejectedValueOnce(new Error("File not found"));

      await expect(manager.deleteMarkdownFile(filePath)).rejects.toMatchObject({
        type: "file_delete",
        message: "Markdown file not found: " + filePath,
      });
    });

    it("should clear cache after deletion", async () => {
      const filePath = join(testBaseDir, "cache-test.md");
      const content = "# Test Content";

      // First, read the file to populate cache
      mockFs.readFile.mockResolvedValueOnce(content);
      mockFs.stat.mockResolvedValueOnce({
        mtimeMs: Date.now(),
        size: content.length,
      } as Stats);

      await manager.readMarkdownFile(filePath);

      // Then delete the file
      mockFs.access.mockResolvedValueOnce(undefined);
      mockFs.unlink.mockResolvedValueOnce(undefined);

      await manager.deleteMarkdownFile(filePath);

      // Cache should be cleared - verify by trying to read again
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      mockFs.readFile.mockRejectedValueOnce(error);

      await expect(manager.readMarkdownFile(filePath)).rejects.toMatchObject({
        type: "file_not_found",
      });
    });
  });

  describe("getMarkdownFilePath", () => {
    it("should generate correct file path", () => {
      const itemId = "test-item-123";
      const expectedPath = join(testBaseDir, "test-item-123.md");

      const result = manager.getMarkdownFilePath(itemId);

      expect(result).toBe(expectedPath);
    });

    it("should throw error for invalid item ID", () => {
      const itemId = "test item with spaces!@#";

      expect(() => manager.getMarkdownFilePath(itemId)).toThrow(
        "Item ID contains invalid characters",
      );
    });

    it("should generate correct file path for valid ID", () => {
      const itemId = "test-item-123";
      const expectedPath = join(testBaseDir, "test-item-123.md");

      const result = manager.getMarkdownFilePath(itemId);

      expect(result).toBe(expectedPath);
    });
  });

  describe("validateMarkdownPath", () => {
    it("should validate correct paths", () => {
      const validPaths = [
        join(testBaseDir, "test.md"),
        join(testBaseDir, "subfolder", "test.md"),
        join(testBaseDir, "test-item-123.md"),
      ];

      for (const path of validPaths) {
        expect(manager.validateMarkdownPath(path)).toBe(true);
      }
    });

    it("should reject invalid paths", () => {
      const invalidPaths = [
        "/outside/path.md",
        join(testBaseDir, "../outside.md"),
        join(testBaseDir, "test.txt"),
        join(testBaseDir, "test"),
        "relative/path.md",
      ];

      for (const path of invalidPaths) {
        expect(manager.validateMarkdownPath(path)).toBe(false);
      }
    });

    it("should prevent path traversal attacks", () => {
      const maliciousPaths = [
        join(testBaseDir, "..", "..", "etc", "passwd.md"),
        join(testBaseDir, "..\\..\\windows\\system32\\config.md"),
        testBaseDir + "/../../../etc/passwd.md",
      ];

      for (const path of maliciousPaths) {
        expect(manager.validateMarkdownPath(path)).toBe(false);
      }
    });
  });

  describe("listMarkdownFiles", () => {
    it("should list all markdown files", async () => {
      const mockFiles = ["test1.md", "test2.md", "readme.txt", "test3.md"];
      const expectedFiles = [
        join(testBaseDir, "test1.md"),
        join(testBaseDir, "test2.md"),
        join(testBaseDir, "test3.md"),
      ];

      // Mock directory exists
      mockFs.access.mockResolvedValueOnce(undefined);
      mockFs.readdir.mockResolvedValueOnce(mockFiles as fs.Dirent[]);

      const result = await manager.listMarkdownFiles();

      expect(result).toEqual(expectedFiles);
    });

    it("should create directory if it doesn't exist", async () => {
      // Mock directory doesn't exist
      mockFs.access.mockRejectedValueOnce(new Error("Directory not found"));
      mockFs.mkdir.mockResolvedValueOnce(undefined);
      mockFs.readdir.mockResolvedValueOnce([]);

      await manager.listMarkdownFiles();

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining("test"),
        { recursive: true },
      );
    });
  });

  describe("getMarkdownFileMetadata", () => {
    it("should return file metadata", async () => {
      const filePath = join(testBaseDir, "metadata-test.md");
      const content = "# Test Content";
      const mockStats = {
        size: 100,
        birthtime: new Date("2023-01-01"),
        mtime: new Date("2023-01-02"),
        mtimeMs: Date.now(),
      };

      mockFs.stat.mockResolvedValueOnce(mockStats as Stats);
      mockFs.readFile.mockResolvedValueOnce(content);
      // Mock stat again for cache update
      mockFs.stat.mockResolvedValueOnce(mockStats as Stats);

      const result = await manager.getMarkdownFileMetadata(filePath);

      expect(result).toMatchObject({
        filePath,
        size: 100,
        created: mockStats.birthtime,
        modified: mockStats.mtime,
      });
      expect(result.hash).toBeDefined();
      expect(typeof result.hash).toBe("string");
    });
  });

  describe("clearCache", () => {
    it("should clear specific file from cache", async () => {
      const filePath = join(testBaseDir, "cache-test.md");
      const content = "# Test Content";

      // Populate cache
      mockFs.readFile.mockResolvedValueOnce(content);
      mockFs.stat.mockResolvedValueOnce({
        mtimeMs: Date.now(),
        size: content.length,
      } as Stats);

      await manager.readMarkdownFile(filePath);

      // Clear specific file cache
      manager.clearCache(filePath);

      // Next read should hit the file system again
      mockFs.readFile.mockResolvedValueOnce(content);
      mockFs.stat.mockResolvedValueOnce({
        mtimeMs: Date.now(),
        size: content.length,
      } as Stats);

      await manager.readMarkdownFile(filePath);

      expect(mockFs.readFile).toHaveBeenCalledTimes(2);
    });

    it("should clear all cache when no path specified", async () => {
      const filePath1 = join(testBaseDir, "cache-test1.md");
      const filePath2 = join(testBaseDir, "cache-test2.md");
      const content = "# Test Content";

      // Populate cache for both files
      mockFs.readFile.mockResolvedValue(content);
      mockFs.stat.mockResolvedValue({
        mtimeMs: Date.now(),
        size: content.length,
      } as Stats);

      await manager.readMarkdownFile(filePath1);
      await manager.readMarkdownFile(filePath2);

      // Clear all cache
      manager.clearCache();

      // Next reads should hit the file system again
      await manager.readMarkdownFile(filePath1);
      await manager.readMarkdownFile(filePath2);

      expect(mockFs.readFile).toHaveBeenCalledTimes(4); // 2 initial + 2 after cache clear
    });
  });

  describe("error handling", () => {
    it("should handle file system errors gracefully", async () => {
      const filePath = join(testBaseDir, "error-test.md");
      const error = new Error("Permission denied");

      mockFs.readFile.mockRejectedValueOnce(error);

      await expect(manager.readMarkdownFile(filePath)).rejects.toMatchObject({
        type: "file_read",
        filePath,
        originalError: error,
      });
    });

    it("should validate content size", async () => {
      const itemId = "large-content-test";
      const largeContent = "a".repeat(11 * 1024 * 1024); // 11MB, exceeds 10MB limit

      await expect(
        manager.createMarkdownFile(itemId, largeContent),
      ).rejects.toMatchObject({
        type: "file_creation",
        message: "Content exceeds maximum size of 10485760 bytes",
      });
    });
  });
});
