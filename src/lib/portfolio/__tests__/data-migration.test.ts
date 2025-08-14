/**
 * Data Migration System Tests
 * Task 1.2: データ移行システムのテスト
 */

import {
  ContentItem,
  EnhancedCategoryType,
  EnhancedContentItem,
  MigrationError,
} from "@/types";
import { promises as fs } from "fs";
import {
  ContentItemMigrator,
  MigrationErrorHandler,
  MixedDataFormatProcessor,
} from "../data-migration";

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    writeFile: jest.fn(),
    readFile: jest.fn(),
    mkdir: jest.fn(),
    access: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("ContentItemMigrator", () => {
  let migrator: ContentItemMigrator;

  beforeEach(() => {
    migrator = new ContentItemMigrator();
    jest.clearAllMocks();
  });

  describe("migrateContentItem", () => {
    it("should migrate single category to multiple categories", () => {
      const oldItem: ContentItem = {
        id: "test-1",
        type: "portfolio",
        title: "Test Project",
        description: "Test description",
        category: "develop",
        tags: ["React", "TypeScript"],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.categories).toEqual(["develop"]);
      expect(migrated.isOtherCategory).toBe(false);
      expect(migrated.category).toBe("develop"); // Backward compatibility
    });

    it("should handle Other category migration", () => {
      const oldItem: ContentItem = {
        id: "test-2",
        type: "portfolio",
        title: "Other Project",
        description: "Other description",
        category: "other",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.categories).toEqual(["other"]);
      expect(migrated.isOtherCategory).toBe(true);
    });

    it("should migrate date fields correctly", () => {
      const oldItem: ContentItem = {
        id: "test-3",
        type: "portfolio",
        title: "Date Test",
        description: "Date test description",
        category: "design",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.manualDate).toBe("2024-01-01T00:00:00.000Z");
      expect(migrated.useManualDate).toBe(false);
      expect(migrated.effectiveDate).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should migrate image fields correctly", () => {
      const oldItem: ContentItem = {
        id: "test-4",
        type: "portfolio",
        title: "Image Test",
        description: "Image test description",
        category: "video",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
        images: ["image1.jpg", "image2.jpg"],
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.originalImages).toEqual([]);
      expect(migrated.processedImages).toEqual(["image1.jpg", "image2.jpg"]);
    });

    it("should migrate content to markdown fields", () => {
      const oldItem: ContentItem = {
        id: "test-5",
        type: "portfolio",
        title: "Content Test",
        description: "Content test description",
        category: "develop",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
        content: "# Test Content\n\nThis is test content.",
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.markdownPath).toBe(
        "public/data/content/markdown/portfolio/test-5.md",
      );
      expect(migrated.markdownContent).toBe(
        "# Test Content\n\nThis is test content.",
      );
    });

    it("should handle items without content", () => {
      const oldItem: ContentItem = {
        id: "test-6",
        type: "portfolio",
        title: "No Content Test",
        description: "No content test description",
        category: "design",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.markdownPath).toBeUndefined();
      expect(migrated.markdownContent).toBeUndefined();
    });

    it("should handle unknown categories", () => {
      const oldItem: ContentItem = {
        id: "test-7",
        type: "portfolio",
        title: "Unknown Category Test",
        description: "Unknown category test description",
        category: "unknown-category",
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
      };

      const migrated = migrator.migrateContentItem(oldItem);

      expect(migrated.categories).toEqual(["other"]);
      expect(migrated.isOtherCategory).toBe(true);
    });
  });

  describe("validateMigratedData", () => {
    it("should validate valid enhanced content item", () => {
      const validItem: EnhancedContentItem = {
        id: "test-1",
        type: "portfolio",
        title: "Valid Test",
        description: "Valid test description",
        categories: ["develop"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
        isOtherCategory: false,
        useManualDate: false,
        effectiveDate: "2024-01-01T00:00:00.000Z",
        originalImages: [],
        processedImages: [],
      };

      const result = migrator.validateMigratedData(validItem);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing required fields", () => {
      const invalidItem = {
        type: "portfolio",
        description: "Missing ID and title",
        categories: ["develop"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
      } as EnhancedContentItem;

      const result = migrator.validateMigratedData(invalidItem);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].code).toBe("MISSING_ID");
      expect(result.errors[1].code).toBe("MISSING_TITLE");
    });

    it("should detect invalid categories", () => {
      const invalidItem: EnhancedContentItem = {
        id: "test-1",
        type: "portfolio",
        title: "Invalid Category Test",
        description: "Invalid category test description",
        categories: ["invalid-category" as EnhancedCategoryType],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "2024-01-01T00:00:00.000Z",
        isOtherCategory: false,
        useManualDate: false,
        effectiveDate: "2024-01-01T00:00:00.000Z",
        originalImages: [],
        processedImages: [],
      };

      const result = migrator.validateMigratedData(invalidItem);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("INVALID_CATEGORIES");
    });

    it("should detect invalid dates", () => {
      const invalidItem: EnhancedContentItem = {
        id: "test-1",
        type: "portfolio",
        title: "Invalid Date Test",
        description: "Invalid date test description",
        categories: ["develop"],
        tags: [],
        status: "published",
        priority: 50,
        createdAt: "invalid-date",
        manualDate: "also-invalid",
        isOtherCategory: false,
        useManualDate: true,
        effectiveDate: "2024-01-01T00:00:00.000Z",
        originalImages: [],
        processedImages: [],
      };

      const result = migrator.validateMigratedData(invalidItem);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.some((e) => e.code === "INVALID_MANUAL_DATE")).toBe(
        true,
      );
      expect(result.errors.some((e) => e.code === "INVALID_CREATED_DATE")).toBe(
        true,
      );
    });
  });

  describe("createBackup", () => {
    it("should create backup file successfully", async () => {
      const items: ContentItem[] = [
        {
          id: "test-1",
          type: "portfolio",
          title: "Test Item",
          description: "Test description",
          category: "develop",
          tags: [],
          status: "published",
          priority: 50,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ];

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const backupPath = await migrator.createBackup(items);

      expect(backupPath).toMatch(/portfolio-backup-.*\.json$/);
      expect(mockFs.mkdir).toHaveBeenCalledWith("public/data/backups", {
        recursive: true,
      });
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it("should handle backup creation errors", async () => {
      const items: ContentItem[] = [];
      mockFs.mkdir.mockRejectedValue(new Error("Permission denied"));

      await expect(migrator.createBackup(items)).rejects.toThrow(
        "Failed to create backup",
      );
    });
  });

  describe("rollbackMigration", () => {
    it("should rollback migration successfully", async () => {
      const backupData = {
        timestamp: "2024-01-01T00:00:00.000Z",
        version: "1.0",
        itemCount: 1,
        items: [
          {
            id: "test-1",
            title: "Test Item",
            category: "develop",
          },
        ],
      };

      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue(JSON.stringify(backupData));

      await expect(
        migrator.rollbackMigration("test-backup.json"),
      ).resolves.not.toThrow();
    });

    it("should handle missing backup file", async () => {
      mockFs.access.mockRejectedValue(new Error("File not found"));

      await expect(
        migrator.rollbackMigration("missing-backup.json"),
      ).rejects.toThrow("Backup file not found");
    });

    it("should handle invalid backup format", async () => {
      mockFs.access.mockResolvedValue(undefined);
      mockFs.readFile.mockResolvedValue("invalid json");

      await expect(
        migrator.rollbackMigration("invalid-backup.json"),
      ).rejects.toThrow("Failed to rollback migration");
    });
  });

  describe("createMarkdownFile", () => {
    it("should create markdown file successfully", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);

      const filePath = await migrator.createMarkdownFile(
        "test-item",
        "# Test Content",
      );

      expect(filePath).toBe(
        "public/data/content/markdown/portfolio/test-item.md",
      );
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        "public/data/content/markdown/portfolio",
        {
          recursive: true,
        },
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        filePath,
        "# Test Content",
        "utf-8",
      );
    });

    it("should handle file creation errors", async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockRejectedValue(new Error("Disk full"));

      await expect(
        migrator.createMarkdownFile("test-item", "content"),
      ).rejects.toMatchObject({
        type: "file_creation",
        itemId: "test-item",
        message: expect.stringContaining("Failed to create markdown file"),
      });
    });
  });
});

describe("MigrationErrorHandler", () => {
  let errorHandler: MigrationErrorHandler;

  beforeEach(() => {
    errorHandler = new MigrationErrorHandler();
    jest.clearAllMocks();
  });

  describe("handleMigrationError", () => {
    it("should handle validation errors", () => {
      const error: MigrationError = {
        type: "validation",
        itemId: "test-1",
        message: "Validation failed",
        originalData: {},
        suggestedFix: "Fix validation issues",
      };

      expect(() => errorHandler.handleMigrationError(error)).not.toThrow();
    });

    it("should handle file creation errors", () => {
      const error: MigrationError = {
        type: "file_creation",
        itemId: "test-1",
        message: "File creation failed",
        originalData: {},
      };

      expect(() => errorHandler.handleMigrationError(error)).not.toThrow();
    });

    it("should handle data corruption errors", () => {
      const error: MigrationError = {
        type: "data_corruption",
        itemId: "test-1",
        message: "Data is corrupted",
        originalData: { corrupted: true },
      };

      expect(() => errorHandler.handleMigrationError(error)).not.toThrow();
    });
  });

  describe("retryOperation", () => {
    it("should succeed on first attempt", async () => {
      const operation = jest.fn().mockResolvedValue("success");

      const result = await errorHandler.retryOperation(
        operation,
        "test operation",
      );

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and eventually succeed", async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockRejectedValueOnce(new Error("Second failure"))
        .mockResolvedValue("success");

      const result = await errorHandler.retryOperation(
        operation,
        "test operation",
      );

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(3);
    }, 15000); // 15秒のタイムアウトを設定

    it("should fail after max attempts", async () => {
      const operation = jest
        .fn()
        .mockRejectedValue(new Error("Persistent failure"));

      await expect(
        errorHandler.retryOperation(operation, "test operation", 2),
      ).rejects.toThrow("test operation failed after 2 attempts");

      expect(operation).toHaveBeenCalledTimes(2);
    }, 15000); // 15秒のタイムアウトを設定
  });
});

describe("MixedDataFormatProcessor", () => {
  let processor: MixedDataFormatProcessor;

  beforeEach(() => {
    processor = new MixedDataFormatProcessor();
    jest.clearAllMocks();
  });

  describe("processMixedData", () => {
    it("should handle mixed old and new data formats", async () => {
      const mixedData = [
        // Old format
        {
          id: "old-1",
          type: "portfolio",
          title: "Old Format Item",
          description: "Old format description",
          category: "develop",
          tags: [],
          status: "published",
          priority: 50,
          createdAt: "2024-01-01T00:00:00.000Z",
        } as ContentItem,
        // New format
        {
          id: "new-1",
          type: "portfolio",
          title: "New Format Item",
          description: "New format description",
          categories: ["design"],
          tags: [],
          status: "published",
          priority: 50,
          createdAt: "2024-01-01T00:00:00.000Z",
          isOtherCategory: false,
          useManualDate: false,
          effectiveDate: "2024-01-01T00:00:00.000Z",
          originalImages: [],
          processedImages: [],
        } as EnhancedContentItem,
      ];

      const result = await processor.processMixedData(mixedData);

      expect(result).toHaveLength(2);
      expect(result[0].categories).toEqual(["develop"]);
      expect(result[1].categories).toEqual(["design"]);
    });

    it("should handle validation errors gracefully", async () => {
      const mixedData = [
        // Valid old format
        {
          id: "valid-1",
          type: "portfolio",
          title: "Valid Item",
          description: "Valid description",
          category: "develop",
          tags: [],
          status: "published",
          priority: 50,
          createdAt: "2024-01-01T00:00:00.000Z",
        } as ContentItem,
        // Invalid old format (missing required fields)
        {
          type: "portfolio",
          category: "develop",
          tags: [],
          status: "published",
          priority: 50,
          createdAt: "2024-01-01T00:00:00.000Z",
        } as ContentItem,
      ];

      const result = await processor.processMixedData(mixedData);

      // Should process both items (validation errors are now warnings, not failures)
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("valid-1");
    });

    it("should handle empty data array", async () => {
      const result = await processor.processMixedData([]);

      expect(result).toHaveLength(0);
    });
  });
});

describe("Integration Tests", () => {
  it("should perform complete migration workflow", async () => {
    const migrator = new ContentItemMigrator();
    const processor = new MixedDataFormatProcessor();

    // Mock file operations
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.writeFile.mockResolvedValue(undefined);

    const originalItems: ContentItem[] = [
      {
        id: "integration-1",
        type: "portfolio",
        title: "Integration Test Item",
        description: "Integration test description",
        category: "develop",
        tags: ["React", "TypeScript"],
        status: "published",
        priority: 75,
        createdAt: "2024-01-01T00:00:00.000Z",
        content: "# Integration Test\n\nThis is integration test content.",
        images: ["test1.jpg", "test2.jpg"],
      },
    ];

    // Create backup
    const backupPath = await migrator.createBackup(originalItems);
    expect(backupPath).toBeDefined();

    // Process mixed data (in this case, all old format)
    const processedItems = await processor.processMixedData(originalItems);

    expect(processedItems).toHaveLength(1);
    const processedItem = processedItems[0];

    // Verify migration results
    expect(processedItem.categories).toEqual(["develop"]);
    expect(processedItem.isOtherCategory).toBe(false);
    expect(processedItem.processedImages).toEqual(["test1.jpg", "test2.jpg"]);
    expect(processedItem.originalImages).toEqual([]);
    expect(processedItem.markdownContent).toBe(
      "# Integration Test\n\nThis is integration test content.",
    );
    expect(processedItem.markdownPath).toBe(
      "public/data/content/markdown/portfolio/integration-1.md",
    );

    // Verify validation
    const validation = migrator.validateMigratedData(processedItem);
    expect(validation.isValid).toBe(true);
  });
});
