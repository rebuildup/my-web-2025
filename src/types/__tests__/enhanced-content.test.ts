import type {
  EnhancedCategoryType,
  EnhancedContentItem,
} from "../enhanced-content";

describe("types/enhanced-content", () => {
  describe("EnhancedCategoryType", () => {
    it("should accept valid enhanced category types", () => {
      const categories: EnhancedCategoryType[] = [
        "develop",
        "video",
        "design",
        "video&design",
        "other",
      ];

      categories.forEach((category) => {
        expect(typeof category).toBe("string");
      });
    });
  });

  describe("EnhancedContentItem interface", () => {
    it("should accept valid enhanced content item", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["develop", "video"],
        tags: ["tag1", "tag2"],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
      };

      expect(item.id).toBe("test-id");
      expect(item.categories).toEqual(["develop", "video"]);
      expect(Array.isArray(item.categories)).toBe(true);
    });

    it("should accept item with other category support", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["other"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        isOtherCategory: true,
      };

      expect(item.categories).toEqual(["other"]);
      expect(item.isOtherCategory).toBe(true);
    });

    it("should accept item with manual date management", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["develop"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        manualDate: "2023-06-15T00:00:00Z",
        useManualDate: true,
        effectiveDate: "2023-06-15T00:00:00Z",
      };

      expect(item.manualDate).toBe("2023-06-15T00:00:00Z");
      expect(item.useManualDate).toBe(true);
      expect(item.effectiveDate).toBe("2023-06-15T00:00:00Z");
    });

    it("should accept item with enhanced image management", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["design"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        originalImages: ["/images/original1.jpg", "/images/original2.jpg"],
        processedImages: ["/images/processed1.webp", "/images/processed2.webp"],
      };

      expect(item.originalImages).toEqual([
        "/images/original1.jpg",
        "/images/original2.jpg",
      ]);
      expect(item.processedImages).toEqual([
        "/images/processed1.webp",
        "/images/processed2.webp",
      ]);
    });

    it("should accept item with markdown file management", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["develop"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        markdownPath: "/content/test.md",
        markdownContent: "# Test Content\n\nThis is test markdown content.",
      };

      expect(item.markdownPath).toBe("/content/test.md");
      expect(item.markdownContent).toBe(
        "# Test Content\n\nThis is test markdown content.",
      );
    });

    it("should accept item with download-specific fields", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "download",
        title: "Test Download",
        description: "Test Description",
        categories: ["other"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        downloadUrl: "/downloads/test-file.zip",
        fileSize: "2.5 MB",
        fileFormat: "ZIP",
      };

      expect(item.downloadUrl).toBe("/downloads/test-file.zip");
      expect(item.fileSize).toBe("2.5 MB");
      expect(item.fileFormat).toBe("ZIP");
    });

    it("should accept item with SEO fields", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["develop"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        seoTitle: "SEO Optimized Title",
        seoDescription: "SEO optimized description for search engines",
        seoKeywords: "react, typescript, portfolio",
      };

      expect(item.seoTitle).toBe("SEO Optimized Title");
      expect(item.seoDescription).toBe(
        "SEO optimized description for search engines",
      );
      expect(item.seoKeywords).toBe("react, typescript, portfolio");
    });

    it("should accept item with backward compatibility category", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["develop"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        category: "develop", // Backward compatibility
      };

      expect(item.categories).toEqual(["develop"]);
      expect(item.category).toBe("develop");
    });

    it("should accept item with multiple categories", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["develop", "video", "design"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
      };

      expect(item.categories).toHaveLength(3);
      expect(item.categories).toContain("develop");
      expect(item.categories).toContain("video");
      expect(item.categories).toContain("design");
    });

    it("should accept item with video&design category", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["video&design"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
      };

      expect(item.categories).toEqual(["video&design"]);
    });

    it("should accept item with all optional fields", () => {
      const item: EnhancedContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        categories: ["develop"],
        tags: ["tag1"],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
        publishedAt: "2023-01-03T00:00:00Z",
        isOtherCategory: false,
        manualDate: "2023-06-15T00:00:00Z",
        useManualDate: true,
        effectiveDate: "2023-06-15T00:00:00Z",
        originalImages: ["/images/original.jpg"],
        processedImages: ["/images/processed.webp"],
        markdownPath: "/content/test.md",
        markdownContent: "# Content",
        downloadUrl: "/downloads/file.zip",
        fileSize: "1 MB",
        fileFormat: "ZIP",
        seoTitle: "SEO Title",
        seoDescription: "SEO Description",
        seoKeywords: "keywords",
        category: "develop",
        thumbnail: "/images/thumb.jpg",
        images: ["/images/1.jpg"],
        videos: [],
        externalLinks: [],
        downloadInfo: {
          fileName: "test.zip",
          fileSize: 1024,
          fileType: "application/zip",
          downloadCount: 0,
        },
        stats: {
          views: 0,
        },
        seo: {
          title: "SEO Title",
          description: "SEO Description",
        },
        customFields: {},
        aspectRatio: 1.5,
      };

      expect(item.categories).toEqual(["develop"]);
      expect(item.isOtherCategory).toBe(false);
      expect(item.useManualDate).toBe(true);
      expect(item.originalImages).toHaveLength(1);
      expect(item.processedImages).toHaveLength(1);
      expect(item.markdownPath).toBe("/content/test.md");
      expect(item.downloadUrl).toBe("/downloads/file.zip");
      expect(item.seoTitle).toBe("SEO Title");
      expect(item.category).toBe("develop");
    });
  });
});
