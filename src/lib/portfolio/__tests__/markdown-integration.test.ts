/**
 * Tests for Markdown Integration Service
 */

import { ContentItem } from "@/types";
import { MarkdownFileManagerImpl } from "../markdown-file-manager";
import {
  EnhancedContentItemWithMarkdown,
  MarkdownIntegrationService,
} from "../markdown-integration";

// Mock the markdown file manager
const mockMarkdownManager = {
  createMarkdownFile: jest.fn(),
  readMarkdownFile: jest.fn(),
  updateMarkdownFile: jest.fn(),
  deleteMarkdownFile: jest.fn(),
  validateMarkdownPath: jest.fn(),
  listMarkdownFiles: jest.fn(),
  getMarkdownFileMetadata: jest.fn(),
} as jest.Mocked<MarkdownFileManagerImpl>;

describe("MarkdownIntegrationService", () => {
  let service: MarkdownIntegrationService;

  beforeEach(() => {
    service = new MarkdownIntegrationService(mockMarkdownManager);
    jest.clearAllMocks();
  });

  describe("convertToExternalMarkdown", () => {
    it("should convert inline content to external markdown file", async () => {
      const item: ContentItem = {
        id: "test-item-1",
        title: "Test Item",
        content: "# Test Content\n\nThis is test markdown content.",
        category: "develop",
        tags: ["test"],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const mockFilePath = "/test/markdown/test-item-1.md";
      mockMarkdownManager.createMarkdownFile.mockResolvedValueOnce(
        mockFilePath,
      );

      const result = await service.convertToExternalMarkdown(item);

      expect(result).toEqual({
        ...item,
        content: undefined,
        markdownPath: mockFilePath,
        markdownContent: item.content,
        useExternalMarkdown: true,
      });
      expect(mockMarkdownManager.createMarkdownFile).toHaveBeenCalledWith(
        item.id,
        item.content,
      );
    });

    it("should handle items with no content", async () => {
      const item: ContentItem = {
        id: "empty-item",
        title: "Empty Item",
        content: "",
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const result = await service.convertToExternalMarkdown(item);

      expect(result).toEqual({
        ...item,
        useExternalMarkdown: false,
      });
      expect(mockMarkdownManager.createMarkdownFile).not.toHaveBeenCalled();
    });

    it("should fallback to inline content on file creation error", async () => {
      const item: ContentItem = {
        id: "error-item",
        title: "Error Item",
        content: "# Error Content",
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      mockMarkdownManager.createMarkdownFile.mockRejectedValueOnce(
        new Error("File creation failed"),
      );

      const result = await service.convertToExternalMarkdown(item);

      expect(result).toEqual({
        ...item,
        useExternalMarkdown: false,
      });
    });
  });

  describe("convertToInlineContent", () => {
    it("should convert external markdown back to inline content", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "test-item-1",
        title: "Test Item",
        markdownPath: "/test/markdown/test-item-1.md",
        markdownContent: "# Cached Content",
        useExternalMarkdown: true,
        category: "develop",
        tags: ["test"],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const fileContent = "# Updated Content\n\nThis is updated content.";
      mockMarkdownManager.readMarkdownFile.mockResolvedValueOnce(fileContent);

      const result = await service.convertToInlineContent(item);

      expect(result).toEqual({
        id: item.id,
        title: item.title,
        content: fileContent,
        category: item.category,
        tags: item.tags,
        images: item.images,
        thumbnail: item.thumbnail,
        createdAt: item.createdAt,
        status: item.status,
      });
      expect(mockMarkdownManager.readMarkdownFile).toHaveBeenCalledWith(
        item.markdownPath,
      );
    });

    it("should handle items without external markdown", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "inline-item",
        title: "Inline Item",
        content: "# Inline Content",
        useExternalMarkdown: false,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const result = await service.convertToInlineContent(item);

      expect(result.content).toBe(item.content);
      expect(mockMarkdownManager.readMarkdownFile).not.toHaveBeenCalled();
    });

    it("should fallback to cached content on file read error", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "error-item",
        title: "Error Item",
        markdownPath: "/test/markdown/error-item.md",
        markdownContent: "# Cached Content",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      mockMarkdownManager.readMarkdownFile.mockRejectedValueOnce(
        new Error("File read failed"),
      );

      const result = await service.convertToInlineContent(item);

      expect(result.content).toBe(item.markdownContent);
    });
  });

  describe("getEffectiveContent", () => {
    it("should return content from external markdown file", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "test-item",
        title: "Test Item",
        markdownPath: "/test/markdown/test-item.md",
        markdownContent: "# Cached Content",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const fileContent = "# File Content";
      mockMarkdownManager.readMarkdownFile.mockResolvedValueOnce(fileContent);

      const result = await service.getEffectiveContent(item);

      expect(result).toBe(fileContent);
      expect(mockMarkdownManager.readMarkdownFile).toHaveBeenCalledWith(
        item.markdownPath,
      );
    });

    it("should return inline content for non-external items", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "inline-item",
        title: "Inline Item",
        content: "# Inline Content",
        useExternalMarkdown: false,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const result = await service.getEffectiveContent(item);

      expect(result).toBe(item.content);
      expect(mockMarkdownManager.readMarkdownFile).not.toHaveBeenCalled();
    });

    it("should fallback to cached content on file read error", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "error-item",
        title: "Error Item",
        markdownPath: "/test/markdown/error-item.md",
        markdownContent: "# Cached Content",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      mockMarkdownManager.readMarkdownFile.mockRejectedValueOnce(
        new Error("File read failed"),
      );

      const result = await service.getEffectiveContent(item);

      expect(result).toBe(item.markdownContent);
    });
  });

  describe("updateContent", () => {
    it("should update external markdown file", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "test-item",
        title: "Test Item",
        markdownPath: "/test/markdown/test-item.md",
        markdownContent: "# Old Content",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const newContent = "# New Content";
      mockMarkdownManager.updateMarkdownFile.mockResolvedValueOnce(undefined);

      const result = await service.updateContent(item, newContent);

      expect(result).toEqual({
        ...item,
        markdownContent: newContent,
      });
      expect(mockMarkdownManager.updateMarkdownFile).toHaveBeenCalledWith(
        item.markdownPath,
        newContent,
      );
    });

    it("should update inline content for non-external items", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "inline-item",
        title: "Inline Item",
        content: "# Old Content",
        useExternalMarkdown: false,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const newContent = "# New Content";

      const result = await service.updateContent(item, newContent);

      expect(result).toEqual({
        ...item,
        content: newContent,
        markdownContent: newContent,
      });
      expect(mockMarkdownManager.updateMarkdownFile).not.toHaveBeenCalled();
    });

    it("should fallback to inline content on file update error", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "error-item",
        title: "Error Item",
        markdownPath: "/test/markdown/error-item.md",
        markdownContent: "# Old Content",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const newContent = "# New Content";
      mockMarkdownManager.updateMarkdownFile.mockRejectedValueOnce(
        new Error("File update failed"),
      );

      const result = await service.updateContent(item, newContent);

      expect(result).toEqual({
        ...item,
        content: newContent,
        useExternalMarkdown: false,
        markdownPath: undefined,
        markdownContent: undefined,
      });
    });
  });

  describe("deleteMarkdownFile", () => {
    it("should delete markdown file for external items", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "test-item",
        title: "Test Item",
        markdownPath: "/test/markdown/test-item.md",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      mockMarkdownManager.deleteMarkdownFile.mockResolvedValueOnce(undefined);

      await service.deleteMarkdownFile(item);

      expect(mockMarkdownManager.deleteMarkdownFile).toHaveBeenCalledWith(
        item.markdownPath,
      );
    });

    it("should not delete file for non-external items", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "inline-item",
        title: "Inline Item",
        content: "# Inline Content",
        useExternalMarkdown: false,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      await service.deleteMarkdownFile(item);

      expect(mockMarkdownManager.deleteMarkdownFile).not.toHaveBeenCalled();
    });

    it("should handle deletion errors gracefully", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "error-item",
        title: "Error Item",
        markdownPath: "/test/markdown/error-item.md",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      mockMarkdownManager.deleteMarkdownFile.mockRejectedValueOnce(
        new Error("Deletion failed"),
      );

      // Should not throw error
      await expect(service.deleteMarkdownFile(item)).resolves.toBeUndefined();
    });
  });

  describe("migrateBatchToExternalMarkdown", () => {
    it("should migrate multiple items successfully", async () => {
      const items: ContentItem[] = [
        {
          id: "item-1",
          title: "Item 1",
          content: "# Content 1",
          category: "develop",
          tags: [],
          images: [],
          thumbnail: "",
          createdAt: "2023-01-01T00:00:00Z",
          status: "published",
        },
        {
          id: "item-2",
          title: "Item 2",
          content: "# Content 2",
          category: "design",
          tags: [],
          images: [],
          thumbnail: "",
          createdAt: "2023-01-01T00:00:00Z",
          status: "published",
        },
      ];

      mockMarkdownManager.createMarkdownFile
        .mockResolvedValueOnce("/test/item-1.md")
        .mockResolvedValueOnce("/test/item-2.md");

      const result = await service.migrateBatchToExternalMarkdown(items);

      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(result.successful[0].markdownPath).toBe("/test/item-1.md");
      expect(result.successful[1].markdownPath).toBe("/test/item-2.md");
    });

    it("should handle partial failures", async () => {
      const items: ContentItem[] = [
        {
          id: "item-1",
          title: "Item 1",
          content: "# Content 1",
          category: "develop",
          tags: [],
          images: [],
          thumbnail: "",
          createdAt: "2023-01-01T00:00:00Z",
          status: "published",
        },
        {
          id: "item-2",
          title: "Item 2",
          content: "# Content 2",
          category: "design",
          tags: [],
          images: [],
          thumbnail: "",
          createdAt: "2023-01-01T00:00:00Z",
          status: "published",
        },
      ];

      mockMarkdownManager.createMarkdownFile
        .mockResolvedValueOnce("/test/item-1.md")
        .mockRejectedValueOnce(new Error("Creation failed"));

      const result = await service.migrateBatchToExternalMarkdown(items);

      // Both items should be successful since convertToExternalMarkdown falls back on error
      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(result.successful[0].id).toBe("item-1");
      expect(result.successful[0].useExternalMarkdown).toBe(true);
      expect(result.successful[1].id).toBe("item-2");
      expect(result.successful[1].useExternalMarkdown).toBe(false); // Fallback to inline
    });
  });

  describe("validateMarkdownIntegrity", () => {
    it("should validate external markdown item successfully", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "valid-item",
        title: "Valid Item",
        markdownPath: "/test/markdown/valid-item.md",
        markdownContent: "# Valid Content",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      mockMarkdownManager.validateMarkdownPath.mockReturnValueOnce(true);
      mockMarkdownManager.readMarkdownFile.mockResolvedValueOnce(
        "# Valid Content",
      );

      const result = await service.validateMarkdownIntegrity(item);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.suggestions).toHaveLength(0);
    });

    it("should detect missing markdown path", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "invalid-item",
        title: "Invalid Item",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      const result = await service.validateMarkdownIntegrity(item);

      expect(result.valid).toBe(false);
      expect(result.issues).toContain(
        "Item is marked to use external markdown but no path is specified",
      );
      expect(result.suggestions).toContain(
        "Set markdownPath or disable useExternalMarkdown",
      );
    });

    it("should detect invalid markdown path", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "invalid-path-item",
        title: "Invalid Path Item",
        markdownPath: "/invalid/path.md",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      mockMarkdownManager.validateMarkdownPath.mockReturnValueOnce(false);

      const result = await service.validateMarkdownIntegrity(item);

      expect(result.valid).toBe(false);
      expect(result.issues).toContain("Invalid markdown file path");
      expect(result.suggestions).toContain(
        "Update markdownPath to a valid path within the allowed directory",
      );
    });

    it("should detect unreadable markdown file", async () => {
      const item: EnhancedContentItemWithMarkdown = {
        id: "unreadable-item",
        title: "Unreadable Item",
        markdownPath: "/test/markdown/unreadable-item.md",
        useExternalMarkdown: true,
        category: "develop",
        tags: [],
        images: [],
        thumbnail: "",
        createdAt: "2023-01-01T00:00:00Z",
        status: "published",
      };

      mockMarkdownManager.validateMarkdownPath.mockReturnValueOnce(true);
      mockMarkdownManager.readMarkdownFile.mockRejectedValueOnce(
        new Error("File not found"),
      );

      const result = await service.validateMarkdownIntegrity(item);

      expect(result.valid).toBe(false);
      expect(result.issues).toContain("Markdown file cannot be read");
      expect(result.suggestions).toContain(
        "Check if file exists and has correct permissions",
      );
    });
  });

  describe("getMarkdownStatistics", () => {
    it("should return statistics for markdown files", async () => {
      const mockFiles = ["/test/file1.md", "/test/file2.md"];
      const mockMetadata1 = {
        filePath: "/test/file1.md",
        size: 100,
        created: new Date("2023-01-01"),
        modified: new Date("2023-01-02"),
        hash: "hash1",
      };
      const mockMetadata2 = {
        filePath: "/test/file2.md",
        size: 200,
        created: new Date("2023-01-03"),
        modified: new Date("2023-01-04"),
        hash: "hash2",
      };

      mockMarkdownManager.listMarkdownFiles.mockResolvedValueOnce(mockFiles);
      mockMarkdownManager.getMarkdownFileMetadata
        .mockResolvedValueOnce(mockMetadata1)
        .mockResolvedValueOnce(mockMetadata2);

      const result = await service.getMarkdownStatistics();

      expect(result).toEqual({
        totalFiles: 2,
        totalSize: 300,
        averageSize: 150,
        oldestFile: { path: "/test/file1.md", created: new Date("2023-01-01") },
        newestFile: { path: "/test/file2.md", created: new Date("2023-01-03") },
      });
    });

    it("should handle empty file list", async () => {
      mockMarkdownManager.listMarkdownFiles.mockResolvedValueOnce([]);

      const result = await service.getMarkdownStatistics();

      expect(result).toEqual({
        totalFiles: 0,
        totalSize: 0,
        averageSize: 0,
        oldestFile: null,
        newestFile: null,
      });
    });

    it("should handle metadata errors gracefully", async () => {
      const mockFiles = ["/test/file1.md", "/test/file2.md"];
      mockMarkdownManager.listMarkdownFiles.mockResolvedValueOnce(mockFiles);
      mockMarkdownManager.getMarkdownFileMetadata
        .mockResolvedValueOnce({
          filePath: "/test/file1.md",
          size: 100,
          created: new Date("2023-01-01"),
          modified: new Date("2023-01-02"),
          hash: "hash1",
        })
        .mockRejectedValueOnce(new Error("Metadata error"));

      const result = await service.getMarkdownStatistics();

      expect(result.totalFiles).toBe(2);
      expect(result.totalSize).toBe(100); // Only successful file counted
      expect(result.averageSize).toBe(50); // 100 / 2 files
    });
  });
});
