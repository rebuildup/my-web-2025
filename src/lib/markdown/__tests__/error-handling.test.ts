/**
 * Error Handling Tests for Markdown System
 * Tests for various error scenarios and edge cases
 */

import { promises as fs } from "fs";
import { join } from "path";
import type { MediaData } from "../../../types/content";
import { ContentParser } from "../content-parser";
import { MarkdownFileManager } from "../file-management";

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
    access: jest.fn((filePath: string) => {
      if (fileContents.has(filePath)) {
        return Promise.resolve();
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

describe("Markdown System Error Handling", () => {
  let fileManager: MarkdownFileManager;
  let contentParser: ContentParser;
  const testBasePath = "/test/markdown";

  beforeEach(() => {
    fileManager = new MarkdownFileManager(testBasePath);
    contentParser = new ContentParser();
    jest.clearAllMocks();
    fileContents.clear();

    // Reset mocks to default behavior
    mockFs.access.mockImplementation((filePath: string) => {
      if (fileContents.has(filePath)) {
        return Promise.resolve();
      }
      const error = new Error("File not found") as NodeJS.ErrnoException;
      error.code = "ENOENT";
      return Promise.reject(error);
    });
  });

  describe("File System Error Scenarios", () => {
    it("should handle ENOSPC (disk full) errors gracefully", async () => {
      const error = new Error(
        "No space left on device",
      ) as NodeJS.ErrnoException;
      error.code = "ENOSPC";

      // Mock file doesn't exist, so createMarkdownFile will try to write
      mockFs.access.mockRejectedValueOnce(
        Object.assign(new Error("File not found"), { code: "ENOENT" }),
      );
      // Mock disk full error on writeFile
      mockFs.writeFile.mockRejectedValueOnce(error);

      await expect(
        fileManager.createMarkdownFile("test-item", "portfolio", "# Test"),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Insufficient disk space"),
        type: "MARKDOWN_DISK_FULL",
      });
    });

    it("should handle EACCES (permission denied) errors", async () => {
      const error = new Error("Permission denied") as NodeJS.ErrnoException;
      error.code = "EACCES";

      mockFs.readFile.mockRejectedValueOnce(error);

      await expect(
        fileManager.getMarkdownContent("/test/restricted.md"),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Permission denied"),
        type: "MARKDOWN_PERMISSION_DENIED",
      });
    });

    it("should handle EMFILE (too many open files) errors", async () => {
      const error = new Error("Too many open files") as NodeJS.ErrnoException;
      error.code = "EMFILE";

      mockFs.readFile.mockRejectedValueOnce(error);

      await expect(
        fileManager.getMarkdownContent("/test/file.md"),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Too many open files"),
        code: "EMFILE",
        type: "MARKDOWN_INVALID_CONTENT",
      });
    });

    it("should handle EISDIR (is a directory) errors", async () => {
      const error = new Error("Is a directory") as NodeJS.ErrnoException;
      error.code = "EISDIR";

      mockFs.readFile.mockRejectedValueOnce(error);

      await expect(
        fileManager.getMarkdownContent("/test/directory.md"),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Is a directory"),
        code: "EISDIR",
        type: "MARKDOWN_INVALID_CONTENT",
      });
    });

    it("should handle network drive disconnection errors", async () => {
      const error = new Error(
        "Network is unreachable",
      ) as NodeJS.ErrnoException;
      error.code = "ENETUNREACH";

      // Mock file doesn't exist, so createMarkdownFile will try to write
      mockFs.access.mockRejectedValueOnce(
        Object.assign(new Error("File not found"), { code: "ENOENT" }),
      );
      // Mock network error on writeFile
      mockFs.writeFile.mockRejectedValueOnce(error);

      await expect(
        fileManager.createMarkdownFile("test-item", "portfolio", "# Test"),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Network is unreachable"),
        code: "ENETUNREACH",
        type: "file_creation",
      });
    });

    it("should handle file corruption scenarios", async () => {
      const corruptedContent = Buffer.from([0xff, 0xfe, 0x00, 0x00]).toString();
      mockFs.readFile.mockResolvedValueOnce(corruptedContent);

      const result = await fileManager.getMarkdownContent("/test/corrupted.md");

      // Should return the content as-is, letting the parser handle it
      expect(result).toBe(corruptedContent);
    });

    it("should handle concurrent file access conflicts", async () => {
      const filePath = "/test/concurrent.md";
      const content1 = "# Content 1";
      const content2 = "# Content 2";

      // Mock file exists for both operations
      mockFs.access.mockResolvedValue(undefined);

      // First write succeeds
      mockFs.writeFile.mockResolvedValueOnce(undefined);

      // Second write fails with EBUSY (resource busy)
      const busyError = new Error("Resource busy") as NodeJS.ErrnoException;
      busyError.code = "EBUSY";
      mockFs.writeFile.mockRejectedValueOnce(busyError);

      // First operation should succeed
      await expect(
        fileManager.updateMarkdownFile(filePath, content1),
      ).resolves.toBeUndefined();

      // Second operation should fail gracefully
      await expect(
        fileManager.updateMarkdownFile(filePath, content2),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Resource busy"),
        code: "EBUSY",
        type: "file_update",
      });
    });
  });

  describe("Content Validation Error Scenarios", () => {
    it("should handle extremely large content", async () => {
      const hugeContent = "a".repeat(100 * 1024 * 1024); // 100MB

      await expect(
        fileManager.createMarkdownFile("huge-item", "portfolio", hugeContent),
      ).rejects.toThrow("Content exceeds maximum size");
    });

    it("should handle content with null bytes", async () => {
      const contentWithNulls = "# Title\n\x00\nContent with null bytes";

      await expect(
        fileManager.createMarkdownFile(
          "null-item",
          "portfolio",
          contentWithNulls,
        ),
      ).rejects.toThrow("Content contains potentially dangerous elements");
    });

    it("should handle content with control characters", async () => {
      const contentWithControls =
        "# Title\n\x01\x02\x03\nContent with control chars";

      await expect(
        fileManager.createMarkdownFile(
          "control-item",
          "portfolio",
          contentWithControls,
        ),
      ).rejects.toThrow("Content contains potentially dangerous elements");
    });

    it("should handle malformed UTF-8 sequences", async () => {
      // Create invalid UTF-8 sequence
      const invalidUtf8 = Buffer.from([0xc0, 0x80]).toString("binary");
      const contentWithInvalidUtf8 = `# Title\n${invalidUtf8}\nContent`;

      // Clear any existing file contents
      fileContents.clear();

      await fileManager.createMarkdownFile(
        "utf8-item",
        "portfolio",
        contentWithInvalidUtf8,
      );
    });

    it("should handle extremely long lines", async () => {
      const longLine = "a".repeat(1024 * 1024); // 1MB single line
      const contentWithLongLine = `# Title\n${longLine}\nEnd`;

      // Clear any existing file contents
      fileContents.clear();

      await fileManager.createMarkdownFile(
        "long-line-item",
        "portfolio",
        contentWithLongLine,
      );
    });
  });

  describe("Content Parser Error Scenarios", () => {
    const mockMediaData: MediaData = {
      images: ["/image1.jpg"],
      videos: [
        {
          type: "youtube",
          url: "https://youtu.be/dQw4w9WgXcQ",
          title: "Test Video",
        },
      ],
      externalLinks: [
        {
          type: "github",
          url: "https://github.com/test/repo",
          title: "GitHub Repo",
        },
      ],
    };

    it("should handle malformed embed syntax gracefully", async () => {
      const malformedContent = `
# Test Content

![image:] - Missing index
![image:abc] - Non-numeric index
![image:0 - Missing closing bracket
![video:999] - Out of range index
[link:] - Missing index
[link:xyz] - Non-numeric index
[link:0 - Missing closing bracket
      `.trim();

      const result = await contentParser.parseMarkdown(
        malformedContent,
        mockMediaData,
      );

      // Should not throw, but should handle errors gracefully
      expect(result).toContain("Test Content");
      expect(result).toContain("Missing index");
      expect(result).toContain("Non-numeric index");
    });

    it("should handle circular embed references", async () => {
      // This is more of a theoretical case since our syntax doesn't support it
      const content = "![image:0] references ![image:0]";

      const result = await contentParser.parseMarkdown(content, mockMediaData);

      expect(result).toContain("references");
      // Should resolve both references independently
      expect(result).toContain("![Image 0](/image1.jpg)");
    });

    it("should handle empty media data arrays", async () => {
      const emptyMediaData: MediaData = {
        images: [],
        videos: [],
        externalLinks: [],
      };

      const content = "![image:0] ![video:0] [link:0]";

      const result = await contentParser.parseMarkdown(content, emptyMediaData);

      expect(result).toContain("Image not found");
      expect(result).toContain("動画が見つかりません");
      expect(result).toContain("Link not found");
    });

    it("should handle malformed video URLs", async () => {
      const malformedMediaData: MediaData = {
        images: [],
        videos: [
          {
            type: "youtube",
            url: "not-a-valid-url",
            title: "Malformed Video",
          },
          {
            type: "unknown",
            url: "https://example.com/video",
            title: "Unknown Type",
          } as fs.Stats,
        ],
        externalLinks: [],
      };

      const content = "![video:0] ![video:1]";

      const result = await contentParser.parseMarkdown(
        content,
        malformedMediaData,
      );

      // Should fallback with helpful error messages
      expect(result).toContain("Video embed failed");
      expect(result).toContain("Unsupported video type");
    });

    it("should handle extremely nested embed patterns", async () => {
      const nestedContent = "![image:0] inside ![video:0] inside [link:0]";

      const result = await contentParser.parseMarkdown(
        nestedContent,
        mockMediaData,
      );

      // Should resolve all embeds independently
      expect(result).toContain("![Image 0](/image1.jpg)");
      expect(result).toContain("iframe");
      expect(result).toContain("[GitHub Repo](https://github.com/test/repo)");
    });

    it("should handle validation with null or undefined media data", () => {
      const content = "![image:0]";

      // Should not throw with null media data
      const result1 = contentParser.validateEmbedSyntax(
        content,
        null as unknown as MediaData,
      );
      expect(result1.isValid).toBe(true);
      expect(result1.errors).toHaveLength(0);

      // Should not throw with undefined media data
      const result2 = contentParser.validateEmbedSyntax(
        content,
        undefined as unknown as MediaData,
      );
      expect(result2.isValid).toBe(true);
      expect(result2.errors).toHaveLength(0);
    });
  });

  describe("Path Validation Edge Cases", () => {
    it("should handle Windows-style paths on Unix systems", () => {
      const windowsPath = "C:\\Users\\test\\file.md";

      expect(fileManager.validatePath(windowsPath)).toBe(false);
    });

    it("should handle Unix-style paths with Windows separators", () => {
      const mixedPath = "/test/path\\file.md";

      expect(fileManager.validatePath(mixedPath)).toBe(false);
    });

    it("should handle paths with Unicode characters", () => {
      const unicodePath = join(testBasePath, "portfolio", "测试文件.md");

      expect(fileManager.validatePath(unicodePath)).toBe(true);
    });

    it("should handle paths with special characters", () => {
      const specialPaths = [
        join(testBasePath, "portfolio", "file with spaces.md"),
        join(testBasePath, "portfolio", "file-with-dashes.md"),
        join(testBasePath, "portfolio", "file_with_underscores.md"),
        join(testBasePath, "portfolio", "file.with.dots.md"),
      ];

      for (const path of specialPaths) {
        expect(fileManager.validatePath(path)).toBe(true);
      }
    });

    it("should handle extremely long file paths", () => {
      const longFileName = "a".repeat(229) + ".md";
      const longPath = join(testBasePath, "portfolio", longFileName);

      // Should handle long paths (up to system limits)
      expect(fileManager.validatePath(longPath)).toBe(true);

      // But reject extremely long paths
      const extremelyLongFileName = "a".repeat(1000) + ".md";
      const extremelyLongPath = join(
        testBasePath,
        "portfolio",
        extremelyLongFileName,
      );
      expect(fileManager.validatePath(extremelyLongPath)).toBe(false);
    });

    it("should handle case sensitivity issues", () => {
      const lowerPath = join(testBasePath, "portfolio", "file.md");
      const upperPath = join(testBasePath, "PORTFOLIO", "FILE.MD");

      expect(fileManager.validatePath(lowerPath)).toBe(true);
      // Upper case should be rejected as it doesn't match expected structure
      expect(fileManager.validatePath(upperPath)).toBe(false);
    });
  });

  describe("Recovery and Fallback Scenarios", () => {
    it("should provide meaningful error messages for debugging", async () => {
      const error = new Error(
        "Custom file system error",
      ) as NodeJS.ErrnoException;
      error.code = "ECUSTOM";
      error.errno = -999;
      error.path = "/test/path.md";

      mockFs.readFile.mockRejectedValueOnce(error);

      try {
        await fileManager.getMarkdownContent("/test/path.md");
      } catch (caught: unknown) {
        const caughtError = caught as Error & {
          code?: string;
          originalError?: Error;
          type?: string;
        };
        expect(caughtError.message).toContain("Failed to read markdown file");
        expect(caughtError.message).toContain("/test/path.md");
        expect(caughtError.code).toBe("ECUSTOM");
        expect(caughtError.originalError).toBe(error);
        expect(caughtError.type).toBe("file_read");
      }
    });

    it("should handle partial file writes", async () => {
      const content = "# Large Content\n" + "a".repeat(1024 * 1024);

      // Mock partial write error
      const writeError = new Error(
        "Write interrupted",
      ) as NodeJS.ErrnoException;
      writeError.code = "EINTR";

      // Reset the mock to override default behavior
      mockFs.access.mockReset();
      mockFs.writeFile.mockReset();

      // Mock directory exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file doesn't exist, so createMarkdownFile will try to write
      mockFs.access.mockRejectedValueOnce(
        Object.assign(new Error("File not found"), { code: "ENOENT" }),
      );
      // Mock writeFile failure
      mockFs.writeFile.mockRejectedValueOnce(writeError);

      await expect(
        fileManager.createMarkdownFile(
          "large-item-unique",
          "portfolio",
          content,
        ),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Write interrupted"),
        code: "EINTR",
        type: "file_creation",
      });
    });

    it("should handle directory creation failures", async () => {
      const error = new Error(
        "Cannot create directory",
      ) as NodeJS.ErrnoException;
      error.code = "EACCES";

      // Reset mocks to override default behavior
      mockFs.access.mockReset();
      mockFs.mkdir.mockReset();

      // Mock directory doesn't exist (for ensureDirectory)
      mockFs.access.mockRejectedValueOnce(
        Object.assign(new Error("Directory not found"), { code: "ENOENT" }),
      );
      // Mock mkdir failure
      mockFs.mkdir.mockRejectedValueOnce(error);

      await expect(
        fileManager.createMarkdownFile("test-item", "portfolio", "# Test"),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Cannot create directory"),
        code: "EACCES",
        type: "file_creation",
      });
    });

    it("should handle file locking scenarios", async () => {
      const error = new Error("File is locked") as NodeJS.ErrnoException;
      error.code = "EBUSY";

      // Reset mocks to override default behavior
      mockFs.access.mockReset();
      mockFs.writeFile.mockReset();

      // Mock file exists (for access check in updateMarkdownFile)
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock locked file (for writeFile)
      mockFs.writeFile.mockRejectedValueOnce(error);

      await expect(
        fileManager.updateMarkdownFile(
          "/test/markdown/portfolio/locked.md",
          "# Updated",
        ),
      ).rejects.toMatchObject({
        message: expect.stringContaining("File is locked"),
        code: "EBUSY",
        type: "file_update",
      });
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should handle memory pressure during large file operations", async () => {
      const largeContent = "a".repeat(5 * 1024 * 1024); // 5MB

      // Reset mocks to override default behavior
      mockFs.access.mockReset();
      mockFs.writeFile.mockReset();

      // Mock directory exists
      mockFs.access.mockResolvedValueOnce(undefined);
      // Mock file doesn't exist
      const fileNotFoundError = new Error(
        "File not found",
      ) as NodeJS.ErrnoException;
      fileNotFoundError.code = "ENOENT";
      mockFs.access.mockRejectedValueOnce(fileNotFoundError);

      // Mock memory error
      const error = new Error(
        "Cannot allocate memory",
      ) as NodeJS.ErrnoException;
      error.code = "ENOMEM";
      mockFs.writeFile.mockRejectedValueOnce(error);

      await expect(
        fileManager.createMarkdownFile(
          `memory-test-${Math.random().toString(36).substring(2, 11)}`,
          "portfolio",
          largeContent,
        ),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Cannot allocate memory"),
        code: "ENOMEM",
        type: "file_creation",
      });
    });

    it("should handle timeout scenarios for slow file operations", async () => {
      // Mock immediate timeout error
      const timeoutError = new Error(
        "Operation timed out",
      ) as NodeJS.ErrnoException;
      timeoutError.code = "ETIMEDOUT";
      mockFs.readFile.mockRejectedValueOnce(timeoutError);

      await expect(
        fileManager.getMarkdownContent("/test/slow.md"),
      ).rejects.toMatchObject({
        message: expect.stringContaining("Operation timed out"),
        code: "ETIMEDOUT",
        type: "file_read",
      });
    }, 1000); // 1秒のタイムアウトを設定
  });
});
