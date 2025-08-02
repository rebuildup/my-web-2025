/**
 * Data Migration and Conversion Tests
 * Comprehensive tests for data migration from legacy to enhanced format
 */

import type { ContentItem, EnhancedContentItem } from "@/types";
import { EnhancedDataProcessingPipeline } from "../enhanced-data-pipeline";

// Mock file system operations
jest.mock("fs", () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    stat: jest.fn(),
    access: jest.fn(),
    mkdir: jest.fn(),
  },
}));

jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
}));

describe("Data Migration and Conversion", () => {
  let pipeline: EnhancedDataProcessingPipeline;
  // const _mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(() => {
    pipeline = new EnhancedDataProcessingPipeline({
      enableLogging: false,
      enableMonitoring: true,
      enableCaching: false,
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("Legacy to Enhanced Format Migration", () => {
    it("should migrate single category to multiple categories", async () => {
      const legacyItem: ContentItem = {
        id: "test-1",
        title: "Test Portfolio Item",
        description: "Test description",
        content: "Test content",
        type: "portfolio",
        category: "develop",
        status: "published",
        priority: 50,
        tags: ["react", "typescript"],
        images: ["image1.jpg", "image2.jpg"],
        videos: [],
        externalLinks: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        downloadUrl: "",
        fileSize: "",
        fileFormat: "",
        seoTitle: "Test SEO Title",
        seoDescription: "Test SEO Description",
        seoKeywords: "test, portfolio",
      };

      const result = await pipeline.processContentData([legacyItem], {
        enableMigration: true,
        enableMarkdownLoading: false,
        enableTagUpdates: false,
        enableDateCalculation: false,
        enableValidation: false,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);

      const migratedItem = result.data[0];
      expect(migratedItem.categories).toEqual(["develop"]);
      expect(migratedItem.isOtherCategory).toBe(false);
      expect(migratedItem.useManualDate).toBe(false);
      expect(migratedItem.processedImages).toEqual([
        "image1.jpg",
        "image2.jpg",
      ]);
      expect(migratedItem.originalImages).toEqual([]);
    });

    it("should migrate Other category correctly", async () => {
      const legacyItem: ContentItem = {
        id: "test-2",
        title: "Other Category Item",
        description: "Test description",
        content: "Test content",
        type: "portfolio",
        category: "other",
        status: "published",
        priority: 50,
        tags: ["misc"],
        images: [],
        videos: [],
        externalLinks: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        downloadUrl: "",
        fileSize: "",
        fileFormat: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      };

      const result = await pipeline.processContentData([legacyItem], {
        enableMigration: true,
        enableMarkdownLoading: false,
        enableTagUpdates: false,
        enableDateCalculation: false,
        enableValidation: false,
      });

      expect(result.success).toBe(true);
      const migratedItem = result.data[0];
      expect(migratedItem.categories).toEqual(["other"]);
      expect(migratedItem.isOtherCategory).toBe(true);
    });

    it("should handle items without category", async () => {
      const legacyItem: Partial<ContentItem> = {
        id: "test-3",
        title: "No Category Item",
        description: "Test description",
        content: "Test content",
        type: "portfolio",
        // category is missing
        status: "published",
        priority: 50,
        tags: [],
        images: [],
        videos: [],
        externalLinks: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        downloadUrl: "",
        fileSize: "",
        fileFormat: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      };

      const result = await pipeline.processContentData(
        [legacyItem as ContentItem],
        {
          enableMigration: true,
          enableMarkdownLoading: false,
          enableTagUpdates: false,
          enableDateCalculation: false,
          enableValidation: false,
        },
      );

      expect(result.success).toBe(true);
      const migratedItem = result.data[0];
      expect(migratedItem.categories).toEqual(["other"]);
    });

    it("should preserve enhanced items unchanged", async () => {
      const enhancedItem: EnhancedContentItem = {
        id: "test-4",
        title: "Enhanced Item",
        description: "Test description",
        content: "Test content",
        type: "portfolio",
        categories: ["develop", "design"],
        isOtherCategory: false,
        status: "published",
        priority: 50,
        tags: ["react", "design"],
        images: [],
        processedImages: ["processed1.jpg"],
        originalImages: ["original1.jpg"],
        videos: [],
        externalLinks: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        useManualDate: true,
        manualDate: "2024-01-15T00:00:00.000Z",
        downloadUrl: "",
        fileSize: "",
        fileFormat: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      };

      const result = await pipeline.processContentData([enhancedItem], {
        enableMigration: true,
        enableMarkdownLoading: false,
        enableTagUpdates: false,
        enableDateCalculation: false,
        enableValidation: false,
      });

      expect(result.success).toBe(true);
      const processedItem = result.data[0];
      expect(processedItem.categories).toEqual(["develop", "design"]);
      expect(processedItem.isOtherCategory).toBe(false);
      expect(processedItem.useManualDate).toBe(true);
      expect(processedItem.manualDate).toBe("2024-01-15T00:00:00.000Z");
      expect(processedItem.processedImages).toEqual(["processed1.jpg"]);
      expect(processedItem.originalImages).toEqual(["original1.jpg"]);
    });
  });

  describe("Mixed Data Format Handling", () => {
    it("should handle mixed legacy and enhanced items", async () => {
      const legacyItem: ContentItem = {
        id: "legacy-1",
        title: "Legacy Item",
        description: "Legacy description",
        content: "Legacy content",
        type: "portfolio",
        category: "video",
        status: "published",
        priority: 50,
        tags: ["video"],
        images: ["legacy.jpg"],
        videos: [],
        externalLinks: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        downloadUrl: "",
        fileSize: "",
        fileFormat: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      };

      const enhancedItem: EnhancedContentItem = {
        id: "enhanced-1",
        title: "Enhanced Item",
        description: "Enhanced description",
        content: "Enhanced content",
        type: "portfolio",
        categories: ["design", "video&design"],
        isOtherCategory: false,
        status: "published",
        priority: 50,
        tags: ["design", "video"],
        images: [],
        processedImages: ["enhanced.jpg"],
        originalImages: [],
        videos: [],
        externalLinks: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        useManualDate: false,
        downloadUrl: "",
        fileSize: "",
        fileFormat: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      };

      const result = await pipeline.processContentData(
        [legacyItem, enhancedItem],
        {
          enableMigration: true,
          enableMarkdownLoading: false,
          enableTagUpdates: false,
          enableDateCalculation: false,
          enableValidation: false,
        },
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);

      // Check legacy item was migrated
      const migratedLegacy = result.data.find((item) => item.id === "legacy-1");
      expect(migratedLegacy?.categories).toEqual(["video"]);
      expect(migratedLegacy?.processedImages).toEqual(["legacy.jpg"]);

      // Check enhanced item was preserved
      const preservedEnhanced = result.data.find(
        (item) => item.id === "enhanced-1",
      );
      expect(preservedEnhanced?.categories).toEqual(["design", "video&design"]);
      expect(preservedEnhanced?.processedImages).toEqual(["enhanced.jpg"]);
    });
  });

  describe("Data Integrity Tests", () => {
    it("should maintain data integrity during migration", async () => {
      const legacyItems: ContentItem[] = [
        {
          id: "integrity-1",
          title: "Integrity Test 1",
          description: "Description 1",
          content: "Content 1",
          type: "portfolio",
          category: "develop",
          status: "published",
          priority: 100,
          tags: ["tag1", "tag2"],
          images: ["img1.jpg"],
          videos: ["video1.mp4"],
          externalLinks: [{ title: "Link 1", url: "https://example.com" }],
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-02T00:00:00.000Z",
          downloadUrl: "https://download.example.com",
          fileSize: "1MB",
          fileFormat: "ZIP",
          seoTitle: "SEO Title 1",
          seoDescription: "SEO Description 1",
          seoKeywords: "seo, keywords",
        },
        {
          id: "integrity-2",
          title: "Integrity Test 2",
          description: "Description 2",
          content: "Content 2",
          type: "portfolio",
          category: "design",
          status: "draft",
          priority: 25,
          tags: ["design", "ui"],
          images: [],
          videos: [],
          externalLinks: [],
          createdAt: "2024-01-03T00:00:00.000Z",
          updatedAt: "2024-01-04T00:00:00.000Z",
          downloadUrl: "",
          fileSize: "",
          fileFormat: "",
          seoTitle: "",
          seoDescription: "",
          seoKeywords: "",
        },
      ];

      const result = await pipeline.processContentData(legacyItems, {
        enableMigration: true,
        enableMarkdownLoading: false,
        enableTagUpdates: false,
        enableDateCalculation: false,
        enableValidation: true,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);

      // Check first item integrity
      const item1 = result.data.find((item) => item.id === "integrity-1");
      expect(item1?.title).toBe("Integrity Test 1");
      expect(item1?.description).toBe("Description 1");
      expect(item1?.content).toBe("Content 1");
      expect(item1?.categories).toEqual(["develop"]);
      expect(item1?.status).toBe("published");
      expect(item1?.priority).toBe(100);
      expect(item1?.tags).toEqual(["tag1", "tag2"]);
      expect(item1?.processedImages).toEqual(["img1.jpg"]);
      expect(item1?.videos).toEqual(["video1.mp4"]);
      expect(item1?.externalLinks).toEqual([
        { title: "Link 1", url: "https://example.com" },
      ]);
      expect(item1?.downloadUrl).toBe("https://download.example.com");
      expect(item1?.fileSize).toBe("1MB");
      expect(item1?.fileFormat).toBe("ZIP");
      expect(item1?.seoTitle).toBe("SEO Title 1");
      expect(item1?.seoDescription).toBe("SEO Description 1");
      expect(item1?.seoKeywords).toBe("seo, keywords");

      // Check second item integrity
      const item2 = result.data.find((item) => item.id === "integrity-2");
      expect(item2?.title).toBe("Integrity Test 2");
      expect(item2?.categories).toEqual(["design"]);
      expect(item2?.status).toBe("draft");
      expect(item2?.priority).toBe(25);
      expect(item2?.tags).toEqual(["design", "ui"]);
    });

    it("should handle corrupted data gracefully", async () => {
      const corruptedItems = [
        // Missing required fields
        {
          id: "corrupt-1",
          // title is missing
          description: "Description",
          type: "portfolio",
          category: "develop",
        },
        // Invalid data types
        {
          id: "corrupt-2",
          title: "Valid Title",
          description: "Description",
          type: "portfolio",
          category: "develop",
          tags: "invalid-tags-should-be-array", // Should be array
          priority: "invalid-priority", // Should be number
        },
        // Null values
        {
          id: "corrupt-3",
          title: null,
          description: "Description",
          type: "portfolio",
          category: "develop",
        },
      ] as ContentItem[];

      const result = await pipeline.processContentData(corruptedItems, {
        enableMigration: true,
        enableMarkdownLoading: false,
        enableTagUpdates: false,
        enableDateCalculation: false,
        enableValidation: true,
      });

      // Should still process the data
      expect(result.data.length).toBeGreaterThan(0);

      // May have warnings about data quality issues
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);

      // Check that corrupted data was handled (e.g., missing titles filled with defaults)
      const processedItems = result.data;
      expect(processedItems.every((item) => item.id)).toBe(true);
      expect(
        processedItems.every((item) => Array.isArray(item.categories)),
      ).toBe(true);
    });
  });

  describe("Error Handling Tests", () => {
    it("should handle migration errors gracefully", async () => {
      const problematicItem = {
        id: "error-test",
        title: "Error Test",
        description: "Test description",
        type: "portfolio",
        category: "invalid-category", // Invalid category
        // Missing other required fields
      } as ContentItem;

      const result = await pipeline.processContentData([problematicItem], {
        enableMigration: true,
        enableValidation: true,
      });

      // Should not fail completely
      expect(result.success).toBeDefined();
      expect(result.data.length).toBe(1);

      // Invalid category should be migrated to "other"
      expect(result.data[0].categories).toEqual(["other"]);

      // May have warnings about the invalid category
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });

    it("should provide detailed error information", async () => {
      const invalidItem = {
        id: "detailed-error-test",
        // Missing required fields
      } as ContentItem;

      const result = await pipeline.processContentData([invalidItem], {
        enableMigration: true,
        enableValidation: true,
      });

      if (result.errors.length > 0) {
        const error = result.errors[0];
        expect(error).toHaveProperty("type");
        expect(error).toHaveProperty("itemId");
        expect(error).toHaveProperty("message");
        expect(error).toHaveProperty("originalData");
      }
    });
  });

  describe("Performance Tests", () => {
    it("should handle large datasets efficiently", async () => {
      // Generate large dataset
      const largeDataset: ContentItem[] = Array.from(
        { length: 1000 },
        (_, index) => ({
          id: `perf-test-${index}`,
          title: `Performance Test Item ${index}`,
          description: `Description for item ${index}`,
          content: `Content for item ${index}`,
          type: "portfolio",
          category: index % 2 === 0 ? "develop" : "design",
          status: "published",
          priority: Math.floor(Math.random() * 100),
          tags: [`tag${index}`, `category${index % 5}`],
          images: [`image${index}.jpg`],
          videos: [],
          externalLinks: [],
          createdAt: new Date(2024, 0, 1 + (index % 365)).toISOString(),
          updatedAt: new Date(2024, 0, 1 + (index % 365)).toISOString(),
          downloadUrl: "",
          fileSize: "",
          fileFormat: "",
          seoTitle: `SEO Title ${index}`,
          seoDescription: `SEO Description ${index}`,
          seoKeywords: `keyword${index}`,
        }),
      );

      const startTime = Date.now();
      const result = await pipeline.processContentData(largeDataset, {
        enableMigration: true,
        enableMarkdownLoading: false,
        enableTagUpdates: false,
        enableDateCalculation: false,
        enableValidation: false,
      });
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds

      // Check performance metrics
      expect(result.metrics.duration).toBeDefined();
      expect(result.metrics.itemsProcessed).toBe(1000);
      expect(result.metrics.errorsCount).toBe(0);
    });

    it("should handle memory usage efficiently", async () => {
      const memoryIntensiveDataset: ContentItem[] = Array.from(
        { length: 100 },
        (_, index) => ({
          id: `memory-test-${index}`,
          title: `Memory Test Item ${index}`,
          description: "A".repeat(10000), // Large description
          content: "B".repeat(50000), // Large content
          type: "portfolio",
          category: "develop",
          status: "published",
          priority: 50,
          tags: Array.from({ length: 50 }, (_, i) => `tag${i}`), // Many tags
          images: Array.from({ length: 20 }, (_, i) => `image${i}.jpg`), // Many images
          videos: [],
          externalLinks: [],
          createdAt: "2024-01-01T00:00:00.000Z",
          updatedAt: "2024-01-01T00:00:00.000Z",
          downloadUrl: "",
          fileSize: "",
          fileFormat: "",
          seoTitle: "",
          seoDescription: "",
          seoKeywords: "",
        }),
      );

      const result = await pipeline.processContentData(memoryIntensiveDataset, {
        enableMigration: true,
        enableMarkdownLoading: false,
        enableTagUpdates: false,
        enableDateCalculation: false,
        enableValidation: false,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(100);

      // Check memory usage metrics if available
      if (result.metrics.memoryUsage) {
        expect(result.metrics.memoryUsage.heapUsed).toBeGreaterThan(0);
        expect(result.metrics.memoryUsage.heapTotal).toBeGreaterThan(0);
      }
    });
  });

  describe("Validation Tests", () => {
    it("should validate required fields", async () => {
      const itemsWithMissingFields = [
        {
          id: "validation-1",
          // title missing
          description: "Description",
          type: "portfolio",
          category: "develop",
        },
        {
          id: "validation-2",
          title: "Title",
          // description missing
          type: "portfolio",
          category: "develop",
        },
        {
          id: "validation-3",
          title: "Title",
          description: "Description",
          type: "portfolio",
          // category missing
        },
      ] as ContentItem[];

      const result = await pipeline.processContentData(itemsWithMissingFields, {
        enableMigration: true,
        enableValidation: true,
      });

      expect(result.warnings.length).toBeGreaterThan(0);

      // Check for specific validation warnings
      const warnings = result.warnings.join(" ");
      expect(warnings).toContain("missing required fields");
    });

    it("should validate category values", async () => {
      const itemWithInvalidCategory = {
        id: "category-validation",
        title: "Category Validation Test",
        description: "Description",
        type: "portfolio",
        category: "invalid-category",
        status: "published",
        priority: 50,
        tags: [],
        images: [],
        videos: [],
        externalLinks: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        downloadUrl: "",
        fileSize: "",
        fileFormat: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      } as ContentItem;

      const result = await pipeline.processContentData(
        [itemWithInvalidCategory],
        {
          enableMigration: true,
          enableValidation: true,
        },
      );

      // Should migrate invalid category to "other"
      expect(result.data[0].categories).toEqual(["other"]);
    });

    it("should validate date formats", async () => {
      const itemWithInvalidDate: EnhancedContentItem = {
        id: "date-validation",
        title: "Date Validation Test",
        description: "Description",
        content: "Content",
        type: "portfolio",
        categories: ["develop"],
        isOtherCategory: false,
        status: "published",
        priority: 50,
        tags: [],
        images: [],
        processedImages: [],
        originalImages: [],
        videos: [],
        externalLinks: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        useManualDate: true,
        manualDate: "invalid-date-format", // Invalid date
        downloadUrl: "",
        fileSize: "",
        fileFormat: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      };

      const result = await pipeline.processContentData([itemWithInvalidDate], {
        enableMigration: false,
        enableValidation: true,
      });

      expect(result.warnings.length).toBeGreaterThan(0);
      const warnings = result.warnings.join(" ");
      expect(warnings).toContain("invalid manual date");
    });
  });

  describe("Markdown Path Validation", () => {
    it("should validate markdown file paths", async () => {
      const itemWithInvalidMarkdownPath: EnhancedContentItem = {
        id: "markdown-validation",
        title: "Markdown Validation Test",
        description: "Description",
        content: "Content",
        type: "portfolio",
        categories: ["develop"],
        isOtherCategory: false,
        status: "published",
        priority: 50,
        tags: [],
        images: [],
        processedImages: [],
        originalImages: [],
        videos: [],
        externalLinks: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        useManualDate: false,
        markdownPath: "invalid-path.txt", // Should end with .md
        downloadUrl: "",
        fileSize: "",
        fileFormat: "",
        seoTitle: "",
        seoDescription: "",
        seoKeywords: "",
      };

      const result = await pipeline.processContentData(
        [itemWithInvalidMarkdownPath],
        {
          enableMigration: false,
          enableValidation: true,
        },
      );

      expect(result.warnings.length).toBeGreaterThan(0);
      const warnings = result.warnings.join(" ");
      expect(warnings).toContain("invalid markdown path");
    });
  });
});
