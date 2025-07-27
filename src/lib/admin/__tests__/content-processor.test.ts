/**
 * Content Processor Tests
 * Task 9.3.1 - Content processing pipeline tests
 */

import { contentProcessor } from "../content-processor";
import type { ContentItem } from "@/types";
import { adminUtils } from "../utils";

// Mock dependencies
jest.mock("../utils", () => ({
  adminUtils: {
    validateAdminRequest: jest.fn(),
    logAdminAction: jest.fn(),
  },
  AdminError: class AdminError extends Error {
    constructor(
      message: string,
      public code: string,
      public statusCode: number = 500,
    ) {
      super(message);
      this.name = "AdminError";
    }
  },
  ADMIN_CONSTANTS: {
    DIRECTORIES: {
      OG_IMAGES: "public/images/og-images",
      FAVICONS: "public/favicons",
    },
  },
}));

jest.mock("@/lib/data", () => ({
  saveContentByType: jest.fn().mockResolvedValue(true),
  loadContentByType: jest.fn().mockResolvedValue([]),
  validateContentItem: jest.fn().mockReturnValue(true),
  generateContentId: jest.fn().mockReturnValue("generated_id"),
}));

jest.mock("@/lib/search", () => ({
  updateSearchIndex: jest.fn().mockResolvedValue(true),
}));

jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe("ContentProcessor", () => {
  const mockContent: ContentItem = {
    id: "test_123",
    type: "blog",
    title: "Test Content",
    description: "Test description",
    category: "test",
    tags: ["test", "content"],
    status: "published",
    priority: 50,
    createdAt: "2025-01-27T00:00:00.000Z",
    content: "# Test Content\n\nThis is test content.",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (adminUtils.validateAdminRequest as jest.Mock).mockReturnValue({
      valid: true,
    });
  });

  describe("processContent", () => {
    it("should process content successfully with default options", async () => {
      const result = await contentProcessor.processContent("blog", mockContent);

      expect(result.success).toBe(true);
      expect(result.contentId).toBe(mockContent.id);
      expect(result.errors).toHaveLength(0);
      expect(adminUtils.logAdminAction).toHaveBeenCalledWith(
        "Content processed",
        expect.any(Object),
      );
    });

    it("should fail when admin access is denied", async () => {
      (adminUtils.validateAdminRequest as jest.Mock).mockReturnValue({
        valid: false,
        error: "Access denied",
      });

      const result = await contentProcessor.processContent("blog", mockContent);

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Access denied");
    });

    it("should handle markdown generation", async () => {
      const result = await contentProcessor.processContent(
        "blog",
        mockContent,
        {
          generateMarkdown: true,
        },
      );

      expect(result.success).toBe(true);
      expect(result.markdownPath).toBeDefined();
    });

    it("should handle batch processing", async () => {
      const contentItems = [mockContent, { ...mockContent, id: "test_456" }];

      const results = await contentProcessor.batchProcessContent(
        "blog",
        contentItems,
      );

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
    });
  });

  describe("deleteContent", () => {
    it("should delete content successfully", async () => {
      const { loadContentByType, saveContentByType } =
        jest.requireMock("@/lib/data");
      loadContentByType.mockResolvedValue([mockContent]);
      saveContentByType.mockResolvedValue(true);

      const result = await contentProcessor.deleteContent(
        "blog",
        mockContent.id,
      );

      expect(result.success).toBe(true);
      expect(result.contentId).toBe(mockContent.id);
      expect(adminUtils.logAdminAction).toHaveBeenCalledWith(
        "Content deleted",
        expect.any(Object),
      );
    });

    it("should fail when content not found", async () => {
      const { loadContentByType } = jest.requireMock("@/lib/data");
      loadContentByType.mockResolvedValue([]);

      const result = await contentProcessor.deleteContent(
        "blog",
        "nonexistent",
      );

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Content not found");
    });
  });

  describe("markdown generation", () => {
    it("should generate proper markdown with front matter", async () => {
      const fs = jest.requireMock("fs").promises;
      let writtenContent = "";
      fs.writeFile.mockImplementation((path: string, content: string) => {
        writtenContent = content;
        return Promise.resolve();
      });

      await contentProcessor.processContent("blog", mockContent, {
        generateMarkdown: true,
      });

      expect(writtenContent).toContain("---");
      expect(writtenContent).toContain(`id: "${mockContent.id}"`);
      expect(writtenContent).toContain(`title: "${mockContent.title}"`);
      expect(writtenContent).toContain("# Test Content");
    });
  });
});
