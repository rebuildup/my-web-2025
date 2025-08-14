import type { ContentItem, MarkdownContentItem } from "../content";
import type { EnhancedContentItem } from "../enhanced-content";
import {
  CONTENT_STATUS_OPTIONS,
  CONTENT_TYPES,
  ENHANCED_PORTFOLIO_CATEGORIES,
  FORM_FIELD_TYPES,
  isContentType,
  isEnhancedCategoryType,
  isEnhancedContentItem,
  isFormFieldType,
  isMarkdownContentItem,
  validateContentItem,
  validateEnhancedContentItem,
  validateMarkdownContentItem,
} from "../index";

describe("types/index", () => {
  describe("isContentType", () => {
    it("should return true for valid content types", () => {
      expect(isContentType("portfolio")).toBe(true);
      expect(isContentType("plugin")).toBe(true);
      expect(isContentType("blog")).toBe(true);
      expect(isContentType("profile")).toBe(true);
      expect(isContentType("page")).toBe(true);
      expect(isContentType("tool")).toBe(true);
      expect(isContentType("asset")).toBe(true);
      expect(isContentType("download")).toBe(true);
      expect(isContentType("other")).toBe(true);
    });

    it("should return false for invalid content types", () => {
      expect(isContentType("invalid")).toBe(false);
      expect(isContentType("")).toBe(false);
      expect(isContentType("PORTFOLIO")).toBe(false);
      expect(isContentType("123")).toBe(false);
    });
  });

  describe("isFormFieldType", () => {
    it("should return true for valid form field types", () => {
      expect(isFormFieldType("text")).toBe(true);
      expect(isFormFieldType("email")).toBe(true);
      expect(isFormFieldType("textarea")).toBe(true);
      expect(isFormFieldType("select")).toBe(true);
      expect(isFormFieldType("checkbox")).toBe(true);
      expect(isFormFieldType("radio")).toBe(true);
      expect(isFormFieldType("file")).toBe(true);
      expect(isFormFieldType("calculator")).toBe(true);
    });

    it("should return false for invalid form field types", () => {
      expect(isFormFieldType("invalid")).toBe(false);
      expect(isFormFieldType("")).toBe(false);
      expect(isFormFieldType("TEXT")).toBe(false);
      expect(isFormFieldType("number")).toBe(false);
    });
  });

  describe("validateContentItem", () => {
    const validContentItem: ContentItem = {
      id: "test-id",
      type: "portfolio",
      title: "Test Title",
      description: "Test Description",
      category: "develop",
      tags: ["tag1", "tag2"],
      status: "published",
      priority: 50,
      createdAt: "2023-01-01T00:00:00Z",
    };

    it("should return true for valid content item", () => {
      expect(validateContentItem(validContentItem)).toBe(true);
    });

    it("should return false for null or undefined", () => {
      expect(validateContentItem(null)).toBe(false);
      expect(validateContentItem(undefined)).toBe(false);
    });

    it("should return false for non-object values", () => {
      expect(validateContentItem("string")).toBe(false);
      expect(validateContentItem(123)).toBe(false);
      expect(validateContentItem([])).toBe(false);
    });

    it("should return false for missing required fields", () => {
      expect(validateContentItem({ ...validContentItem, id: undefined })).toBe(
        false,
      );
      expect(
        validateContentItem({ ...validContentItem, type: undefined }),
      ).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, title: undefined }),
      ).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, description: undefined }),
      ).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, category: undefined }),
      ).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, tags: undefined }),
      ).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, status: undefined }),
      ).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, priority: undefined }),
      ).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, createdAt: undefined }),
      ).toBe(false);
    });

    it("should return false for invalid field types", () => {
      expect(validateContentItem({ ...validContentItem, id: 123 })).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, type: "invalid" }),
      ).toBe(false);
      expect(validateContentItem({ ...validContentItem, title: 123 })).toBe(
        false,
      );
      expect(
        validateContentItem({ ...validContentItem, description: 123 }),
      ).toBe(false);
      expect(validateContentItem({ ...validContentItem, category: 123 })).toBe(
        false,
      );
      expect(
        validateContentItem({ ...validContentItem, tags: "not-array" }),
      ).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, status: "invalid" }),
      ).toBe(false);
      expect(
        validateContentItem({ ...validContentItem, priority: "not-number" }),
      ).toBe(false);
      expect(validateContentItem({ ...validContentItem, createdAt: 123 })).toBe(
        false,
      );
    });

    it("should accept valid status values", () => {
      expect(
        validateContentItem({ ...validContentItem, status: "published" }),
      ).toBe(true);
      expect(
        validateContentItem({ ...validContentItem, status: "draft" }),
      ).toBe(true);
      expect(
        validateContentItem({ ...validContentItem, status: "archived" }),
      ).toBe(true);
      expect(
        validateContentItem({ ...validContentItem, status: "scheduled" }),
      ).toBe(true);
    });
  });

  describe("validateMarkdownContentItem", () => {
    const validMarkdownItem: MarkdownContentItem = {
      id: "test-id",
      type: "portfolio",
      title: "Test Title",
      description: "Test Description",
      category: "develop",
      tags: ["tag1", "tag2"],
      status: "published",
      priority: 50,
      createdAt: "2023-01-01T00:00:00Z",
      markdownPath: "/path/to/markdown.md",
      markdownMigrated: true,
    };

    it("should return true for valid markdown content item", () => {
      expect(validateMarkdownContentItem(validMarkdownItem)).toBe(true);
    });

    it("should return true for content item without markdown fields", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { markdownPath, markdownMigrated, ...basicItem } =
        validMarkdownItem;
      expect(validateMarkdownContentItem(basicItem)).toBe(true);
    });

    it("should return true with undefined markdown fields", () => {
      const itemWithUndefined = {
        ...validMarkdownItem,
        markdownPath: undefined,
        markdownMigrated: undefined,
      };
      expect(validateMarkdownContentItem(itemWithUndefined)).toBe(true);
    });

    it("should return false for invalid markdown field types", () => {
      expect(
        validateMarkdownContentItem({
          ...validMarkdownItem,
          markdownPath: 123,
        }),
      ).toBe(false);
      expect(
        validateMarkdownContentItem({
          ...validMarkdownItem,
          markdownMigrated: "not-boolean",
        }),
      ).toBe(false);
    });

    it("should return false if base content item validation fails", () => {
      expect(
        validateMarkdownContentItem({ ...validMarkdownItem, id: undefined }),
      ).toBe(false);
    });
  });

  describe("isMarkdownContentItem", () => {
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
      } as MarkdownContentItem;

      expect(isMarkdownContentItem(item)).toBe(true);
    });

    it("should return true for items with markdownMigrated", () => {
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
        markdownMigrated: true,
      } as MarkdownContentItem;

      expect(isMarkdownContentItem(item)).toBe(true);
    });

    it("should return false for items without markdown fields", () => {
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

      expect(isMarkdownContentItem(item)).toBe(false);
    });
  });

  describe("isEnhancedCategoryType", () => {
    it("should return true for valid enhanced category types", () => {
      expect(isEnhancedCategoryType("develop")).toBe(true);
      expect(isEnhancedCategoryType("video")).toBe(true);
      expect(isEnhancedCategoryType("design")).toBe(true);
      expect(isEnhancedCategoryType("video&design")).toBe(true);
      expect(isEnhancedCategoryType("other")).toBe(true);
    });

    it("should return false for invalid enhanced category types", () => {
      expect(isEnhancedCategoryType("invalid")).toBe(false);
      expect(isEnhancedCategoryType("")).toBe(false);
      expect(isEnhancedCategoryType("DEVELOP")).toBe(false);
      expect(isEnhancedCategoryType("video-design")).toBe(false);
    });
  });

  describe("validateEnhancedContentItem", () => {
    const validEnhancedItem: EnhancedContentItem = {
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

    it("should return true for valid enhanced content item", () => {
      expect(validateEnhancedContentItem(validEnhancedItem)).toBe(true);
    });

    it("should return false for invalid categories", () => {
      expect(
        validateEnhancedContentItem({
          ...validEnhancedItem,
          categories: ["invalid"],
        }),
      ).toBe(false);
      expect(
        validateEnhancedContentItem({
          ...validEnhancedItem,
          categories: "not-array",
        }),
      ).toBe(false);
    });

    it("should return false for missing required fields", () => {
      expect(
        validateEnhancedContentItem({
          ...validEnhancedItem,
          categories: undefined,
        }),
      ).toBe(false);
    });
  });

  describe("isEnhancedContentItem", () => {
    it("should return true for enhanced content items", () => {
      const enhancedItem = {
        id: "test",
        type: "portfolio" as const,
        title: "Test",
        description: "Test",
        categories: ["develop"],
        tags: [],
        status: "published" as const,
        priority: 50,
        createdAt: "2023-01-01T00:00:00Z",
      } as EnhancedContentItem;

      expect(isEnhancedContentItem(enhancedItem)).toBe(true);
    });

    it("should return false for regular content items", () => {
      const regularItem: ContentItem = {
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

      expect(isEnhancedContentItem(regularItem)).toBe(false);
    });
  });

  describe("constants", () => {
    it("should export correct CONTENT_TYPES", () => {
      expect(CONTENT_TYPES).toEqual([
        "portfolio",
        "plugin",
        "blog",
        "profile",
        "page",
        "tool",
        "asset",
        "download",
      ]);
    });

    it("should export correct FORM_FIELD_TYPES", () => {
      expect(FORM_FIELD_TYPES).toEqual([
        "text",
        "email",
        "textarea",
        "select",
        "checkbox",
        "radio",
        "file",
        "calculator",
      ]);
    });

    it("should export correct CONTENT_STATUS_OPTIONS", () => {
      expect(CONTENT_STATUS_OPTIONS).toEqual([
        "published",
        "draft",
        "archived",
        "scheduled",
      ]);
    });

    it("should export correct ENHANCED_PORTFOLIO_CATEGORIES", () => {
      expect(ENHANCED_PORTFOLIO_CATEGORIES).toEqual([
        "develop",
        "video",
        "design",
        "video&design",
        "other",
      ]);
    });
  });
});
