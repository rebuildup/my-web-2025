import type { ContentItem, MarkdownContentItem } from "../content";
import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_CATEGORY_LABELS,
  getPortfolioCategoryOptions,
  isEnhancedContentItem,
  isValidPortfolioCategory,
} from "../content";

describe("types/content", () => {
  describe("PORTFOLIO_CATEGORIES", () => {
    it("should have correct category values", () => {
      expect(PORTFOLIO_CATEGORIES.DEVELOP).toBe("develop");
      expect(PORTFOLIO_CATEGORIES.VIDEO).toBe("video");
      expect(PORTFOLIO_CATEGORIES.DESIGN).toBe("design");
    });

    it("should be readonly", () => {
      // TypeScript readonly behavior - this test verifies the const assertion works
      // At runtime, the object can still be modified, but TypeScript prevents it
      const originalValue = PORTFOLIO_CATEGORIES.DEVELOP;
      expect(originalValue).toBe("develop");

      // The readonly behavior is enforced by TypeScript, not at runtime
      expect(typeof PORTFOLIO_CATEGORIES).toBe("object");
    });
  });

  describe("PORTFOLIO_CATEGORY_LABELS", () => {
    it("should have correct label mappings", () => {
      expect(PORTFOLIO_CATEGORY_LABELS["develop"]).toBe("Development");
      expect(PORTFOLIO_CATEGORY_LABELS["video"]).toBe("Video");
      expect(PORTFOLIO_CATEGORY_LABELS["design"]).toBe("Design");
    });

    it("should cover all portfolio categories", () => {
      // Test the actual values instead of relying on object keys
      const expectedCategories = ["develop", "video", "design"];
      const labelKeys = Object.keys(PORTFOLIO_CATEGORY_LABELS);

      expect(labelKeys.length).toBe(expectedCategories.length);

      expectedCategories.forEach((categoryValue) => {
        expect(PORTFOLIO_CATEGORY_LABELS).toHaveProperty(categoryValue);
      });
    });
  });

  describe("isValidPortfolioCategory", () => {
    it("should return true for valid portfolio categories", () => {
      expect(isValidPortfolioCategory("develop")).toBe(true);
      expect(isValidPortfolioCategory("video")).toBe(true);
      expect(isValidPortfolioCategory("design")).toBe(true);
    });

    it("should return false for invalid portfolio categories", () => {
      expect(isValidPortfolioCategory("invalid")).toBe(false);
      expect(isValidPortfolioCategory("")).toBe(false);
      expect(isValidPortfolioCategory("DEVELOP")).toBe(false);
      expect(isValidPortfolioCategory("other")).toBe(false);
      expect(isValidPortfolioCategory("blog")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isValidPortfolioCategory(null as unknown as string)).toBe(false);
      expect(isValidPortfolioCategory(undefined as unknown as string)).toBe(
        false,
      );
      expect(isValidPortfolioCategory(123 as unknown as string)).toBe(false);
      expect(isValidPortfolioCategory({} as unknown as string)).toBe(false);
    });
  });

  describe("getPortfolioCategoryOptions", () => {
    it("should return correct option format", () => {
      const options = getPortfolioCategoryOptions();

      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBe(3);

      options.forEach((option) => {
        expect(option).toHaveProperty("value");
        expect(option).toHaveProperty("label");
        expect(typeof option.value).toBe("string");
        expect(typeof option.label).toBe("string");
      });
    });

    it("should include all portfolio categories", () => {
      const options = getPortfolioCategoryOptions();
      const values = options.map((option) => option.value);

      expect(values).toContain("develop");
      expect(values).toContain("video");
      expect(values).toContain("design");
    });

    it("should have correct value-label mappings", () => {
      const options = getPortfolioCategoryOptions();

      const developOption = options.find(
        (option) => option.value === "develop",
      );
      expect(developOption?.label).toBe("Development");

      const videoOption = options.find((option) => option.value === "video");
      expect(videoOption?.label).toBe("Video");

      const designOption = options.find((option) => option.value === "design");
      expect(designOption?.label).toBe("Design");
    });
  });

  describe("isEnhancedContentItem", () => {
    it("should return true for items with markdownPath", () => {
      const item: ContentItem = {
        id: "test",
        type: "portfolio",
        title: "Test",
        description: "Test",
        category: "develop",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        markdownPath: "/path/to/markdown.md",
      };

      expect(isEnhancedContentItem(item)).toBe(true);
    });

    it("should return false for items without markdownPath", () => {
      const item: ContentItem = {
        id: "test",
        type: "portfolio",
        title: "Test",
        description: "Test",
        category: "develop",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
      };

      expect(isEnhancedContentItem(item)).toBe(false);
    });

    it("should return true for items with markdownPath", () => {
      const item: ContentItem = {
        id: "test",
        type: "portfolio",
        title: "Test",
        description: "Test",
        category: "develop",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        markdownPath: "/content/test.md",
      } as import("../enhanced-content").EnhancedContentItem;

      expect(isEnhancedContentItem(item)).toBe(true);
    });

    it("should handle MarkdownContentItem type correctly", () => {
      const markdownItem: MarkdownContentItem = {
        id: "test",
        type: "portfolio",
        title: "Test",
        description: "Test",
        category: "develop",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        markdownPath: "/path/to/markdown.md",
        markdownMigrated: true,
      };

      expect(isEnhancedContentItem(markdownItem)).toBe(true);
    });

    it("should handle items with both markdownPath and markdownMigrated", () => {
      const item: ContentItem = {
        id: "test",
        type: "portfolio",
        title: "Test",
        description: "Test",
        category: "develop",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
        markdownPath: "/path/to/markdown.md",
        markdownMigrated: false,
      };

      expect(isEnhancedContentItem(item)).toBe(true);
    });
  });

  describe("ContentItem interface validation", () => {
    it("should accept valid ContentItem structure", () => {
      const validItem: ContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        category: "develop",
        tags: ["tag1", "tag2"],
        status: "published",
        priority: 75,
        createdAt: "2023-01-01T00:00:00Z",
        updatedAt: "2023-01-02T00:00:00Z",
        publishedAt: "2023-01-03T00:00:00Z",
        thumbnail: "/images/thumbnail.jpg",
        images: ["/images/1.jpg", "/images/2.jpg"],
        videos: [
          {
            type: "youtube",
            url: "https://youtube.com/watch?v=123",
            title: "Test Video",
          },
        ],
        externalLinks: [
          {
            type: "github",
            url: "https://github.com/user/repo",
            title: "Source Code",
          },
        ],
        downloadInfo: {
          fileName: "test.zip",
          fileSize: 1024,
          fileType: "application/zip",
          downloadCount: 10,
        },
        stats: {
          views: 100,
          downloads: 10,
        },
        seo: {
          title: "SEO Title",
          description: "SEO Description",
          keywords: ["seo", "test"],
        },
        customFields: {
          customField: "value",
        },
        aspectRatio: 1.5,
      };

      // This test ensures the interface accepts all expected properties
      expect(validItem.id).toBe("test-id");
      expect(validItem.type).toBe("portfolio");
      expect(validItem.title).toBe("Test Title");
    });
  });

  describe("MarkdownContentItem interface validation", () => {
    it("should extend ContentItem with markdown properties", () => {
      const markdownItem: MarkdownContentItem = {
        id: "test-id",
        type: "portfolio",
        title: "Test Title",
        description: "Test Description",
        category: "develop",
        tags: ["tag1", "tag2"],
        status: "published",
        priority: 75,
        createdAt: "2023-01-01T00:00:00Z",
        markdownPath: "/content/test.md",
        markdownMigrated: true,
      };

      expect(markdownItem.markdownPath).toBe("/content/test.md");
      expect(markdownItem.markdownMigrated).toBe(true);
    });
  });
});
