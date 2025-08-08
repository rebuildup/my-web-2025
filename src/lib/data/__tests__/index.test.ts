import type { ContentItem, ContentType } from "@/types";
import { generateContentId, validateContentItem } from "../index";

describe("Data Management System", () => {
  const mockContentItem: ContentItem = {
    id: "test_123",
    type: "portfolio",
    title: "Test Portfolio",
    description: "Test description",
    category: "web",
    tags: ["react", "typescript"],
    status: "published",
    priority: 1,
    createdAt: "2023-01-01T00:00:00.000Z",
    updatedAt: "2023-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validateContentItem", () => {
    it("should validate correct content item", () => {
      expect(validateContentItem(mockContentItem)).toBe(true);
    });

    it("should reject null or undefined", () => {
      expect(validateContentItem(null)).toBe(false);
      expect(validateContentItem(undefined)).toBe(false);
    });

    it("should reject non-object values", () => {
      expect(validateContentItem("string")).toBe(false);
      expect(validateContentItem(123)).toBe(false);
      expect(validateContentItem([])).toBe(false);
    });

    it("should reject items missing required fields", () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...withoutId } = mockContentItem;
      expect(validateContentItem(withoutId)).toBe(false);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { type: _type, ...withoutType } = mockContentItem;
      expect(validateContentItem(withoutType)).toBe(false);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { title: _title, ...withoutTitle } = mockContentItem;
      expect(validateContentItem(withoutTitle)).toBe(false);
    });

    it("should reject items with wrong field types", () => {
      expect(validateContentItem({ ...mockContentItem, id: 123 })).toBe(false);
      expect(
        validateContentItem({ ...mockContentItem, tags: "not-array" }),
      ).toBe(false);
      expect(
        validateContentItem({ ...mockContentItem, priority: "not-number" }),
      ).toBe(false);
    });

    it("should reject items with invalid status", () => {
      expect(
        validateContentItem({ ...mockContentItem, status: "invalid" }),
      ).toBe(false);
    });

    it("should accept all valid statuses", () => {
      expect(
        validateContentItem({ ...mockContentItem, status: "published" }),
      ).toBe(true);
      expect(validateContentItem({ ...mockContentItem, status: "draft" })).toBe(
        true,
      );
      expect(
        validateContentItem({ ...mockContentItem, status: "archived" }),
      ).toBe(true);
      expect(
        validateContentItem({ ...mockContentItem, status: "scheduled" }),
      ).toBe(true);
    });

    it("should validate required string fields", () => {
      expect(validateContentItem({ ...mockContentItem, description: "" })).toBe(
        true,
      );
      expect(validateContentItem({ ...mockContentItem, category: "" })).toBe(
        true,
      );
    });

    it("should validate tags array", () => {
      expect(validateContentItem({ ...mockContentItem, tags: [] })).toBe(true);
      expect(
        validateContentItem({ ...mockContentItem, tags: ["tag1", "tag2"] }),
      ).toBe(true);
    });

    it("should validate priority number", () => {
      expect(validateContentItem({ ...mockContentItem, priority: 0 })).toBe(
        true,
      );
      expect(validateContentItem({ ...mockContentItem, priority: -1 })).toBe(
        true,
      );
      expect(validateContentItem({ ...mockContentItem, priority: 100 })).toBe(
        true,
      );
    });

    it("should validate date strings", () => {
      expect(
        validateContentItem({
          ...mockContentItem,
          createdAt: "2023-01-01T00:00:00.000Z",
        }),
      ).toBe(true);
      expect(
        validateContentItem({
          ...mockContentItem,
          updatedAt: "2023-01-01T00:00:00.000Z",
        }),
      ).toBe(true);
    });
  });

  describe("generateContentId", () => {
    it("should generate unique IDs", () => {
      const id1 = generateContentId("portfolio");
      const id2 = generateContentId("portfolio");

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^portfolio_\d+_[a-z0-9]{6}$/);
      expect(id2).toMatch(/^portfolio_\d+_[a-z0-9]{6}$/);
    });

    it("should include content type in ID", () => {
      const portfolioId = generateContentId("portfolio");
      const blogId = generateContentId("blog");

      expect(portfolioId).toMatch(/^portfolio_/);
      expect(blogId).toMatch(/^blog_/);
    });

    it("should generate IDs with timestamp", () => {
      const mockTimestamp = 1640995200000; // 2022-01-01T00:00:00.000Z
      jest.spyOn(Date, "now").mockReturnValue(mockTimestamp);

      const id = generateContentId("portfolio");

      expect(id).toMatch(/^portfolio_1640995200000_/);
    });

    it("should work with all content types", () => {
      const contentTypes: ContentType[] = [
        "portfolio",
        "blog",
        "plugin",
        "download",
        "tool",
        "profile",
      ];

      contentTypes.forEach((type) => {
        const id = generateContentId(type);
        expect(id).toMatch(new RegExp(`^${type}_\\d+_[a-z0-9]{6}$`));
      });
    });

    it("should generate random suffix", () => {
      const ids = Array.from({ length: 10 }, () =>
        generateContentId("test" as ContentType),
      );
      const suffixes = ids.map((id) => id.split("_")[2]);

      // All suffixes should be different (very high probability)
      const uniqueSuffixes = new Set(suffixes);
      expect(uniqueSuffixes.size).toBe(10);
    });

    it("should handle edge cases", () => {
      // Test with empty string (though not a valid ContentType)
      const id = generateContentId("" as ContentType);
      expect(id).toMatch(/^_\d+_[a-z0-9]{6}$/);
    });
  });

  describe("Content validation edge cases", () => {
    it("should handle objects with extra properties", () => {
      const itemWithExtra = {
        ...mockContentItem,
        extraProperty: "should be ignored",
      };
      expect(validateContentItem(itemWithExtra)).toBe(true);
    });

    it("should validate nested object structure", () => {
      const invalidNested = {
        ...mockContentItem,
        tags: [123, "valid"], // Mixed types in array
      };
      // This should still pass as we only check if tags is an array
      expect(validateContentItem(invalidNested)).toBe(true);
    });

    it("should handle boolean and number edge cases", () => {
      expect(validateContentItem({ ...mockContentItem, priority: 0 })).toBe(
        true,
      );
      expect(validateContentItem({ ...mockContentItem, priority: -1 })).toBe(
        true,
      );
      expect(
        validateContentItem({ ...mockContentItem, priority: Infinity }),
      ).toBe(true);
      expect(validateContentItem({ ...mockContentItem, priority: NaN })).toBe(
        true,
      );
    });

    it("should validate all status values", () => {
      const validStatuses = ["published", "draft", "archived", "scheduled"];
      validStatuses.forEach((status) => {
        expect(
          validateContentItem({
            ...mockContentItem,
            status: status as ContentItem["status"],
          }),
        ).toBe(true);
      });
    });

    it("should reject invalid status values", () => {
      const invalidStatuses = ["pending", "review", "deleted", ""];
      invalidStatuses.forEach((status) => {
        expect(
          validateContentItem({
            ...mockContentItem,
            status: status as ContentItem["status"],
          }),
        ).toBe(false);
      });
    });
  });

  describe("ID generation patterns", () => {
    it("should maintain consistent format across multiple calls", () => {
      const ids = Array.from({ length: 100 }, () =>
        generateContentId("portfolio"),
      );

      ids.forEach((id) => {
        expect(id).toMatch(/^portfolio_\d+_[a-z0-9]{6}$/);
        const parts = id.split("_");
        expect(parts).toHaveLength(3);
        expect(parts[0]).toBe("portfolio");
        expect(parts[1]).toMatch(/^\d+$/);
        expect(parts[2]).toMatch(/^[a-z0-9]{6}$/);
      });
    });

    it("should use current timestamp", () => {
      const beforeTime = Date.now();
      const id = generateContentId("portfolio");
      const afterTime = Date.now();

      const timestamp = parseInt(id.split("_")[1]);
      expect(timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(timestamp).toBeLessThanOrEqual(afterTime);
    });

    it("should generate different IDs even in rapid succession", () => {
      const ids = [];
      for (let i = 0; i < 10; i++) {
        ids.push(generateContentId("portfolio"));
      }

      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });
  });
});
