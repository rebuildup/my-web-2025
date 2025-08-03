/**
 * File Management Service Tests
 * Tests for markdown file management operations
 */

import { promises as fs } from "fs";
import { join } from "path";
import type { ContentType } from "../../../types/content";
import {
  createMarkdownFile,
  deleteMarkdownFile,
  generateFilePath,
  getMarkdownContent,
  MarkdownFileManager,
  updateMarkdownFile,
} from "../file-management";

// Mock fs module
const fileContents = new Map<string, string>();

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn((filePath: string, content: string) => {
      fileContents.set(filePath, content);
      return Promise.resolve(undefined);
    }),
    readFile: jest.fn((filePath: string) => {
      if (fileContents.has(filePath)) {
        return Promise.resolve(fileContents.get(filePath)!);
      }
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      return Promise.reject(error);
    }),
    unlink: jest.fn((filePath: string) => {
      fileContents.delete(filePath);
      return Promise.resolve(undefined);
    }),
    stat: jest.fn(),
    access: jest.fn((filePath: string) => {
      if (fileContents.has(filePath)) {
        return Promise.resolve(undefined);
      }
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      return Promise.reject(error);
    }),
    mkdir: jest.fn(),
    readdir: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("MarkdownFileManager", () => {
  let manager: MarkdownFileManager;
  const testBasePath = "/test/markdown";

  beforeEach(() => {
    manager = new MarkdownFileManager(testBasePath);
    fileContents.clear(); // Add this line
    jest.clearAllMocks();
  });

  describe("createMarkdownFile", () => {
    it("should create markdown file with correct path structure", async () => {
      const contentId = "test-item-123";
      const contentType = "portfolio";
      const content = "# Test Content\n\nThis is test markdown.";

      // Mock directory exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file doesn't exist
      const fileNotFoundError = new Error(
        "File not found",
      ) as NodeJS.ErrnoException;
      fileNotFoundError.code = "ENOENT";
      mockFs.access.mockRejectedValueOnce(fileNotFoundError);
      // Mock file write
      mockFs.writeFile.mockResolvedValueOnce(undefined);

      const result = await manager.createMarkdownFile(
        contentId,
        contentType,
        content,
      );

      const expectedPath = join(testBasePath, "portfolio", `${contentId}.md`);
      expect(result).toBe(expectedPath);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expectedPath,
        content,
        "utf8",
      );
    });

    it("should create directory structure if it doesn't exist", async () => {
      const contentId = "test-item";
      const contentType = "portfolio";
      const content = "# Test";

      // Mock directory doesn't exist
      const dirNotFoundError = new Error(
        "Directory not found",
      ) as NodeJS.ErrnoException;
      dirNotFoundError.code = "ENOENT";
      mockFs.access.mockRejectedValueOnce(dirNotFoundError);
      // Mock mkdir
      mockFs.mkdir.mockResolvedValueOnce(undefined);
      // Mock file doesn't exist
      const fileNotFoundError = new Error(
        "File not found",
      ) as NodeJS.ErrnoException;
      fileNotFoundError.code = "ENOENT";
      mockFs.access.mockRejectedValueOnce(fileNotFoundError);
      // Mock file write
      mockFs.writeFile.mockResolvedValueOnce(undefined);

      await manager.createMarkdownFile(contentId, contentType, content);

      expect(mockFs.mkdir).toHaveBeenCalledWith(
        join(testBasePath, "portfolio"),
        { recursive: true },
      );
    });

    it("should throw error if file already exists", async () => {
      const contentId = "existing-item";
      const contentType = "portfolio";
      const content = "# Existing";

      // Mock directory exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file exists
      mockFs.access.mockResolvedValueOnce(undefined);

      await expect(
        manager.createMarkdownFile(contentId, contentType, content),
      ).rejects.toThrow("Markdown file already exists");
    });

    it("should validate content ID format", async () => {
      const invalidIds = [
        "",
        "item with spaces",
        "item/with/slashes",
        "item\\with\\backslashes",
        "item<with>brackets",
        "a".repeat(256), // Too long
      ];

      for (const invalidId of invalidIds) {
        await expect(
          manager.createMarkdownFile(invalidId, "portfolio", "content"),
        ).rejects.toThrow();
      }
    });

    it("should validate content type", async () => {
      const contentId = "test-item";
      const invalidTypes = ["invalid", "unknown", ""] as ContentType[];

      for (const invalidType of invalidTypes) {
        await expect(
          manager.createMarkdownFile(contentId, invalidType, "content"),
        ).rejects.toThrow("Invalid content type");
      }
    });

    it("should validate content size", async () => {
      const contentId = "large-content";
      const contentType = "portfolio";
      const largeContent = "a".repeat(11 * 1024 * 1024); // 11MB

      await expect(
        manager.createMarkdownFile(contentId, contentType, largeContent),
      ).rejects.toThrow("Content exceeds maximum size");
    });

    it("should sanitize dangerous content", async () => {
      const contentId = "dangerous-content";
      const contentType = "portfolio";
      const dangerousContent = '<script>alert("xss")</script>';

      await expect(
        manager.createMarkdownFile(contentId, contentType, dangerousContent),
      ).rejects.toThrow("Content contains potentially dangerous elements");
    });
  });

  describe("getMarkdownContent", () => {
    it("should read markdown file successfully", async () => {
      const filePath = join(testBasePath, "portfolio", "test-item.md");
      const content = "# Test Content\n\nThis is test markdown.";

      mockFs.readFile.mockResolvedValueOnce(content);

      const result = await manager.getMarkdownContent(filePath);

      expect(result).toBe(content);
      expect(mockFs.readFile).toHaveBeenCalledWith(filePath, "utf8");
    });

    it("should validate file path", async () => {
      const invalidPaths = [
        "/outside/path.md",
        join(testBasePath, "../outside.md"),
        join(testBasePath, "file.txt"), // Wrong extension
        "relative/path.md",
      ];

      for (const invalidPath of invalidPaths) {
        await expect(manager.getMarkdownContent(invalidPath)).rejects.toThrow(
          "Invalid markdown file path",
        );
      }
    });

    it("should handle file not found error", async () => {
      const filePath = join(testBasePath, "portfolio", "nonexistent.md");
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";

      mockFs.readFile.mockRejectedValueOnce(error);

      await expect(manager.getMarkdownContent(filePath)).rejects.toMatchObject({
        message: expect.stringContaining("Failed to read markdown file"),
        code: "ENOENT",
      });
    });

    it("should handle permission denied error", async () => {
      const filePath = join(testBasePath, "portfolio", "restricted.md");
      const error = new Error("Permission denied") as NodeJS.ErrnoException;
      error.code = "EACCES";

      mockFs.readFile.mockRejectedValueOnce(error);

      await expect(manager.getMarkdownContent(filePath)).rejects.toMatchObject({
        message: expect.stringContaining("Permission denied"),
        code: "EACCES",
      });
    });
  });

  describe("updateMarkdownFile", () => {
    it("should update existing markdown file", async () => {
      const filePath = join(testBasePath, "portfolio", "update-test.md");
      const newContent = "# Updated Content\n\nThis content was updated.";

      // Mock file exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file write
      mockFs.writeFile.mockResolvedValueOnce(undefined);

      await manager.updateMarkdownFile(filePath, newContent);

      expect(mockFs.writeFile).toHaveBeenCalledWith(
        filePath,
        newContent,
        "utf8",
      );
    });

    it("should throw error if file doesn't exist", async () => {
      const filePath = join(testBasePath, "portfolio", "nonexistent.md");
      const content = "# New Content";

      // Mock file doesn't exist
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      mockFs.access.mockRejectedValueOnce(error);

      await expect(
        manager.updateMarkdownFile(filePath, content),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Failed to read markdown file"),
        code: "ENOENT",
        type: "MARKDOWN_FILE_NOT_FOUND",
      });
    });

    it("should validate content before updating", async () => {
      const filePath = join(testBasePath, "portfolio", "test.md");
      const dangerousContent = '<iframe src="javascript:alert(1)"></iframe>';

      await expect(
        manager.updateMarkdownFile(filePath, dangerousContent),
      ).rejects.toThrow("Content contains potentially dangerous elements");
    });

    it("should validate file path", async () => {
      const invalidPath = "/outside/path.md";
      const content = "# Valid Content";

      await expect(
        manager.updateMarkdownFile(invalidPath, content),
      ).rejects.toThrow("Invalid markdown file path");
    });
  });

  describe("deleteMarkdownFile", () => {
    it("should delete markdown file successfully", async () => {
      const filePath = join(testBasePath, "portfolio", "delete-test.md");

      // Mock file exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file deletion
      mockFs.unlink.mockResolvedValueOnce(undefined);

      await manager.deleteMarkdownFile(filePath);

      expect(mockFs.unlink).toHaveBeenCalledWith(filePath);
    });

    it("should throw error if file doesn't exist", async () => {
      const filePath = join(testBasePath, "portfolio", "nonexistent.md");

      // Mock file doesn't exist
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      mockFs.access.mockRejectedValueOnce(error);

      await expect(manager.deleteMarkdownFile(filePath)).rejects.toMatchObject({
        message: expect.stringContaining("Failed to read markdown file"),
        code: "ENOENT",
        type: "MARKDOWN_FILE_NOT_FOUND",
      });
    });

    it("should validate file path", async () => {
      const invalidPath = "/outside/path.md";

      await expect(manager.deleteMarkdownFile(invalidPath)).rejects.toThrow(
        "Invalid markdown file path",
      );
    });

    it("should handle permission errors", async () => {
      const filePath = join(testBasePath, "portfolio", "restricted.md");

      // Mock file exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock permission error
      const error = new Error("Permission denied") as NodeJS.ErrnoException;
      error.code = "EACCES";
      mockFs.unlink.mockRejectedValueOnce(error);

      await expect(manager.deleteMarkdownFile(filePath)).rejects.toMatchObject({
        message: expect.stringContaining("Permission denied"),
        code: "EACCES",
      });
    });
  });

  describe("generateFilePath", () => {
    it("should generate correct file paths for different content types", () => {
      const contentId = "test-item-123";

      const portfolioPath = manager.generateFilePath(contentId, "portfolio");
      expect(portfolioPath).toBe(
        join(testBasePath, "portfolio", `${contentId}.md`),
      );

      const downloadPath = manager.generateFilePath(contentId, "download");
      expect(downloadPath).toBe(
        join(testBasePath, "download", `${contentId}.md`),
      );

      const otherPath = manager.generateFilePath(contentId, "other");
      expect(otherPath).toBe(join(testBasePath, "other", `${contentId}.md`));
    });

    it("should validate content ID", () => {
      const invalidIds = [
        "",
        "item with spaces",
        "item/with/slashes",
        "item<>invalid",
      ];

      for (const invalidId of invalidIds) {
        expect(() =>
          manager.generateFilePath(invalidId, "portfolio"),
        ).toThrow();
      }
    });

    it("should validate content type", () => {
      const contentId = "test-item";
      const invalidTypes = ["invalid", "unknown"] as ContentType[];

      for (const invalidType of invalidTypes) {
        expect(() => manager.generateFilePath(contentId, invalidType)).toThrow(
          "Invalid content type",
        );
      }
    });
  });

  describe("fileExists", () => {
    it("should return true if file exists", async () => {
      const filePath = join(testBasePath, "portfolio", "existing.md");

      mockFs.access.mockResolvedValueOnce(undefined);

      const result = await manager.fileExists(filePath);

      expect(result).toBe(true);
      expect(mockFs.access).toHaveBeenCalledWith(filePath);
    });

    it("should return false if file doesn't exist", async () => {
      const filePath = join(testBasePath, "portfolio", "nonexistent.md");

      mockFs.access.mockRejectedValueOnce(new Error("File not found"));

      const result = await manager.fileExists(filePath);

      expect(result).toBe(false);
    });
  });

  describe("getRelativePath", () => {
    it("should return relative path from base directory", () => {
      const absolutePath = join(testBasePath, "portfolio", "test-item.md");
      const relativePath = manager.getRelativePath(absolutePath);

      expect(relativePath).toBe("portfolio/test-item.md");
    });

    it("should handle paths outside base directory", () => {
      const outsidePath = "/outside/path.md";
      const relativePath = manager.getRelativePath(outsidePath);

      expect(relativePath).toBe(outsidePath); // Returns as-is if outside base
    });
  });

  describe("getAbsolutePath", () => {
    it("should return absolute path from relative path", () => {
      const relativePath = "portfolio/test-item.md";
      const absolutePath = manager.getAbsolutePath(relativePath);

      expect(absolutePath).toBe(join(testBasePath, relativePath));
    });

    it("should handle already absolute paths", () => {
      const absolutePath = join(testBasePath, "portfolio", "test-item.md");
      const result = manager.getAbsolutePath(absolutePath);

      expect(result).toBe(absolutePath);
    });
  });

  describe("validatePath", () => {
    it("should validate correct paths", () => {
      const validPaths = [
        join(testBasePath, "portfolio", "test.md"),
        join(testBasePath, "download", "item.md"),
        join(testBasePath, "other", "content.md"),
      ];

      for (const path of validPaths) {
        expect(manager.validatePath(path)).toBe(true);
      }
    });

    it("should reject invalid paths", () => {
      const invalidPaths = [
        "/outside/path.md",
        join(testBasePath, "../outside.md"),
        join(testBasePath, "test.txt"), // Wrong extension
        "relative/path.md",
        join(testBasePath, "portfolio", "sub", "deep.md"), // Too deep
      ];

      for (const path of invalidPaths) {
        expect(manager.validatePath(path)).toBe(false);
      }
    });

    it("should prevent path traversal attacks", () => {
      const maliciousPaths = [
        join(testBasePath, "..", "..", "etc", "passwd.md"),
        join(testBasePath, "..\\..\\windows\\system32\\config.md"),
        testBasePath + "/../../../etc/passwd.md",
      ];

      for (const path of maliciousPaths) {
        expect(manager.validatePath(path)).toBe(false);
      }
    });
  });

  describe("sanitizeContent", () => {
    it("should allow safe markdown content", () => {
      const safeContent = `
# Heading
This is **bold** and *italic* text.
[Link](https://example.com)
![Image](image.jpg)
\`\`\`javascript
console.log('code');
\`\`\`
      `.trim();

      expect(() => manager.sanitizeContent(safeContent)).not.toThrow();
    });

    it("should reject dangerous script tags", () => {
      const dangerousContent = '<script>alert("xss")</script>';

      expect(() => manager.sanitizeContent(dangerousContent)).toThrow(
        "Content contains potentially dangerous elements",
      );
    });

    it("should reject dangerous iframe sources", () => {
      const dangerousContent = '<iframe src="javascript:alert(1)"></iframe>';

      expect(() => manager.sanitizeContent(dangerousContent)).toThrow(
        "Content contains potentially dangerous elements",
      );
    });

    it("should allow safe iframe sources", () => {
      const safeContent =
        '<iframe src="https://www.youtube.com/embed/abc123"></iframe>';

      expect(() => manager.sanitizeContent(safeContent)).not.toThrow();
    });

    it("should reject dangerous event handlers", () => {
      const dangerousContent = '<div onclick="alert(1)">Click me</div>';

      expect(() => manager.sanitizeContent(dangerousContent)).toThrow(
        "Content contains potentially dangerous elements",
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle disk full errors", async () => {
      const contentId = "test-item";
      const contentType = "portfolio";
      const content = "# Test";

      // Mock directory exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file doesn't exist
      const fileNotFoundError = new Error(
        "File not found",
      ) as NodeJS.ErrnoException;
      fileNotFoundError.code = "ENOENT";
      mockFs.access.mockRejectedValueOnce(fileNotFoundError);
      // Mock disk full error
      const error = new Error(
        "No space left on device",
      ) as NodeJS.ErrnoException;
      error.code = "ENOSPC";
      mockFs.writeFile.mockRejectedValueOnce(error);

      await expect(
        manager.createMarkdownFile(contentId, contentType, content),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Insufficient disk space"),
        code: "ENOSPC",
      });
    });

    it("should handle concurrent file operations", async () => {
      const contentId = "concurrent-test";
      const contentType = "portfolio";
      const content = "# Concurrent Test";

      // Mock directory exists for all operations
      mockFs.access.mockResolvedValue(undefined);

      // Mock file doesn't exist for all operations
      const fileNotFoundError = new Error(
        "File not found",
      ) as NodeJS.ErrnoException;
      fileNotFoundError.code = "ENOENT";
      mockFs.access.mockRejectedValue(fileNotFoundError);

      // Mock successful write for all operations
      mockFs.writeFile.mockResolvedValue(undefined);

      // Start multiple operations with unique IDs
      const operations = Array.from({ length: 3 }, (_, index) =>
        manager.createMarkdownFile(
          `${contentId}-${index}`,
          contentType,
          content,
        ),
      );

      // All should complete without throwing
      await expect(Promise.all(operations)).resolves.toBeDefined();
    });

    it("should provide detailed error information", async () => {
      const filePath = join(testBasePath, "portfolio", "error-test.md");
      const error = new Error("Custom error") as NodeJS.ErrnoException;
      error.code = "CUSTOM";

      mockFs.readFile.mockRejectedValueOnce(error);

      try {
        await manager.getMarkdownContent(filePath);
      } catch (caught) {
        expect(caught).toMatchObject({
          message: expect.stringContaining("File operation failed"),
          code: "CUSTOM",
          filePath,
          originalError: error,
        });
      }
    });
  });
});

describe("Utility Functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createMarkdownFile", () => {
    it("should use default manager instance", async () => {
      const contentId = "test-item-util";
      const contentType = "portfolio";
      const content = "# Test";

      // Mock directory exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file doesn't exist
      const fileNotFoundError = new Error(
        "File not found",
      ) as NodeJS.ErrnoException;
      fileNotFoundError.code = "ENOENT";
      mockFs.access.mockRejectedValueOnce(fileNotFoundError);
      // Mock file write
      mockFs.writeFile.mockResolvedValueOnce(undefined);

      const result = await createMarkdownFile(contentId, contentType, content);

      expect(result).toContain(`${contentId}.md`);
      expect(mockFs.writeFile).toHaveBeenCalled();
    });
  });

  describe("getMarkdownContent", () => {
    it("should use default manager instance", async () => {
      const filePath = "public/data/content/markdown/portfolio/test-item.md";
      const content = "# Test Content";

      mockFs.readFile.mockResolvedValueOnce(content);

      const result = await getMarkdownContent(filePath);

      expect(result).toBe(content);
      expect(mockFs.readFile).toHaveBeenCalledWith(filePath, "utf8");
    });
  });

  describe("updateMarkdownFile", () => {
    it("should use default manager instance", async () => {
      const filePath = "public/data/content/markdown/portfolio/test-item.md";
      const content = "# Updated Content";

      // Mock file exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file write
      mockFs.writeFile.mockResolvedValueOnce(undefined);

      await updateMarkdownFile(filePath, content);

      expect(mockFs.writeFile).toHaveBeenCalledWith(filePath, content, "utf8");
    });
  });

  describe("deleteMarkdownFile", () => {
    it("should use default manager instance", async () => {
      const filePath = "public/data/content/markdown/portfolio/test-item.md";

      // Mock file exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file deletion
      mockFs.unlink.mockResolvedValueOnce(undefined);

      await deleteMarkdownFile(filePath);

      expect(mockFs.unlink).toHaveBeenCalledWith(filePath);
    });
  });

  describe("generateFilePath", () => {
    it("should use default manager instance", () => {
      const contentId = "test-item";
      const contentType = "portfolio";

      const result = generateFilePath(contentId, contentType);

      expect(result).toContain(`${contentId}.md`);
      expect(result).toContain("portfolio");
    });
  });
});
