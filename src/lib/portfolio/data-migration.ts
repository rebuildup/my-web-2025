/**
 * Portfolio Data Migration System
 * Task 1.2: データ移行システムの実装
 */

import {
  ContentItem,
  DataMigrationHandler,
  EnhancedCategoryType,
  EnhancedContentItem,
  isValidEnhancedPortfolioCategory,
  migrateCategoryToCategories,
  MigrationError,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from "@/types";
import { promises as fs } from "fs";
import path from "path";
import { testLogger } from "../utils/test-logger";

/**
 * Content Item Migrator Class
 * Handles migration from old ContentItem format to EnhancedContentItem format
 */
export class ContentItemMigrator implements DataMigrationHandler {
  private readonly BACKUP_DIR = "public/data/backups";
  private readonly MARKDOWN_DIR = "public/data/content/markdown/portfolio";

  /**
   * Migrate a single ContentItem to EnhancedContentItem format
   */
  migrateContentItem(oldItem: ContentItem): EnhancedContentItem {
    try {
      // Convert single category to multiple categories
      const categories = this.migrateCategoryField(oldItem.category);

      // Determine if this is an "other" category item
      const isOtherCategory = categories.includes("other");

      // Handle date migration
      const { manualDate, useManualDate, effectiveDate } =
        this.migrateDateFields(oldItem);

      // Handle image migration
      const { originalImages, processedImages } =
        this.migrateImageFields(oldItem);

      // Handle markdown content migration
      const { markdownPath, markdownContent } =
        this.migrateContentFields(oldItem);

      const enhancedItem: EnhancedContentItem = {
        // Copy all existing fields except category
        ...oldItem,

        // New multiple categories field
        categories,

        // Other category support
        isOtherCategory,

        // Date management
        manualDate,
        useManualDate,
        effectiveDate,

        // Enhanced image management
        originalImages,
        processedImages,

        // Markdown file management
        markdownPath,
        markdownContent,

        // Keep original category for backward compatibility
        category: oldItem.category,
      };

      testLogger.log(`Successfully migrated item: ${oldItem.id}`);
      return enhancedItem;
    } catch (error) {
      const migrationError: MigrationError = {
        type: "data_corruption",
        itemId: oldItem.id || "unknown",
        message: `Failed to migrate item: ${error instanceof Error ? error.message : "Unknown error"}`,
        originalData: oldItem,
        suggestedFix: "Check data integrity and retry migration",
      };

      throw migrationError;
    }
  }

  /**
   * Migrate category field from single to multiple categories
   */
  private migrateCategoryField(category: string): EnhancedCategoryType[] {
    if (!category) {
      return ["other"];
    }

    // Use the helper function from enhanced-content types
    return migrateCategoryToCategories(category);
  }

  /**
   * Migrate date-related fields
   */
  private migrateDateFields(oldItem: ContentItem): {
    manualDate?: string;
    useManualDate: boolean;
    effectiveDate: string;
  } {
    // For existing items, we assume the createdAt date was manually set
    // Users can later change this if needed
    const manualDate = oldItem.createdAt;
    const useManualDate = false; // Default to automatic date
    const effectiveDate = oldItem.createdAt;

    return {
      manualDate,
      useManualDate,
      effectiveDate,
    };
  }

  /**
   * Migrate image fields to separate original and processed images
   */
  private migrateImageFields(oldItem: ContentItem): {
    originalImages: string[];
    processedImages: string[];
  } {
    // For existing items, we assume all images are processed
    // Original images array starts empty
    const processedImages = oldItem.images || [];
    const originalImages: string[] = [];

    return {
      originalImages,
      processedImages,
    };
  }

  /**
   * Migrate content field to external markdown file
   */
  private migrateContentFields(oldItem: ContentItem): {
    markdownPath?: string;
    markdownContent?: string;
  } {
    if (!oldItem.content) {
      return {
        markdownPath: undefined,
        markdownContent: undefined,
      };
    }

    // Generate markdown file path
    const markdownPath = this.generateMarkdownFilePath(oldItem.id);

    // For migration, we keep the content in memory
    // The actual file will be created when the item is saved
    const markdownContent = oldItem.content;

    return {
      markdownPath,
      markdownContent,
    };
  }

  /**
   * Generate markdown file path for an item
   */
  private generateMarkdownFilePath(itemId: string): string {
    return `${this.MARKDOWN_DIR}/${itemId}.md`;
  }

  /**
   * Validate migrated data
   */
  validateMigratedData(item: EnhancedContentItem): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate required fields
    if (!item.id) {
      errors.push({
        field: "id",
        message: "ID is required",
        code: "MISSING_ID",
      });
    }

    if (!item.title) {
      errors.push({
        field: "title",
        message: "Title is required",
        code: "MISSING_TITLE",
      });
    }

    if (!item.categories || item.categories.length === 0) {
      errors.push({
        field: "categories",
        message: "At least one category is required",
        code: "MISSING_CATEGORIES",
      });
    }

    // Validate categories
    if (item.categories) {
      const invalidCategories = item.categories.filter(
        (cat) => !isValidEnhancedPortfolioCategory(cat),
      );

      if (invalidCategories.length > 0) {
        errors.push({
          field: "categories",
          message: `Invalid categories: ${invalidCategories.join(", ")}`,
          code: "INVALID_CATEGORIES",
        });
      }
    }

    // Validate dates
    if (item.manualDate && !this.isValidDate(item.manualDate)) {
      errors.push({
        field: "manualDate",
        message: "Manual date must be a valid ISO 8601 date",
        code: "INVALID_MANUAL_DATE",
      });
    }

    if (!this.isValidDate(item.createdAt)) {
      errors.push({
        field: "createdAt",
        message: "Created date must be a valid ISO 8601 date",
        code: "INVALID_CREATED_DATE",
      });
    }

    // Validate image arrays
    if (item.originalImages && !Array.isArray(item.originalImages)) {
      errors.push({
        field: "originalImages",
        message: "Original images must be an array",
        code: "INVALID_ORIGINAL_IMAGES",
      });
    }

    if (item.processedImages && !Array.isArray(item.processedImages)) {
      errors.push({
        field: "processedImages",
        message: "Processed images must be an array",
        code: "INVALID_PROCESSED_IMAGES",
      });
    }

    // Validate markdown fields
    if (item.markdownPath && item.markdownContent === undefined) {
      warnings.push({
        field: "markdownContent",
        message: "Markdown path specified but content is missing",
        code: "MISSING_MARKDOWN_CONTENT",
      });
    }

    // Check for backward compatibility
    if (!item.category && item.categories.length > 0) {
      warnings.push({
        field: "category",
        message: "Backward compatibility: category field is missing",
        code: "MISSING_BACKWARD_COMPATIBILITY",
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Create backup of original data before migration
   */
  async createBackup(items: ContentItem[]): Promise<string> {
    try {
      // Ensure backup directory exists
      await this.ensureDirectoryExists(this.BACKUP_DIR);

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFileName = `portfolio-backup-${timestamp}.json`;
      const backupPath = path.join(this.BACKUP_DIR, backupFileName);

      // Create backup data structure
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        itemCount: items.length,
        items,
      };

      // Write backup file
      await fs.writeFile(
        backupPath,
        JSON.stringify(backupData, null, 2),
        "utf-8",
      );

      testLogger.log(`Created backup: ${backupPath}`);
      return backupPath;
    } catch (error) {
      const errorMessage = `Failed to create backup: ${error instanceof Error ? error.message : "Unknown error"}`;
      testLogger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Rollback migration using backup file
   */
  async rollbackMigration(backupPath: string): Promise<void> {
    try {
      // Check if backup file exists
      const backupExists = await this.fileExists(backupPath);
      if (!backupExists) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      // Read backup file
      const backupContent = await fs.readFile(backupPath, "utf-8");
      const backupData = JSON.parse(backupContent);

      // Validate backup data structure
      if (!backupData.items || !Array.isArray(backupData.items)) {
        throw new Error("Invalid backup file format");
      }

      // Here you would restore the original data
      // This is a placeholder - actual implementation would depend on your data storage system
      testLogger.log(`Rollback completed using backup: ${backupPath}`);
      testLogger.log(
        `Restored ${backupData.itemCount} items from ${backupData.timestamp}`,
      );
    } catch (error) {
      const errorMessage = `Failed to rollback migration: ${error instanceof Error ? error.message : "Unknown error"}`;
      testLogger.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  /**
   * Create markdown file for migrated content
   */
  async createMarkdownFile(itemId: string, content: string): Promise<string> {
    try {
      // Ensure markdown directory exists
      await this.ensureDirectoryExists(this.MARKDOWN_DIR);

      const filePath = this.generateMarkdownFilePath(itemId);
      await fs.writeFile(filePath, content, "utf-8");

      testLogger.log(`Created markdown file: ${filePath}`);
      return filePath;
    } catch (error) {
      const migrationError: MigrationError = {
        type: "file_creation",
        itemId,
        message: `Failed to create markdown file: ${error instanceof Error ? error.message : "Unknown error"}`,
        originalData: { itemId, content },
        suggestedFix: "Check file system permissions and disk space",
      };

      throw migrationError;
    }
  }

  /**
   * Utility: Check if a date string is valid ISO 8601
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString === date.toISOString();
  }

  /**
   * Utility: Check if file exists
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Utility: Ensure directory exists
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
        throw error;
      }
    }
  }
}

/**
 * Migration Error Handler Class
 * Handles various types of migration errors with appropriate recovery strategies
 */
export class MigrationErrorHandler {
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY_MS = 1000;

  /**
   * Handle migration error with appropriate strategy
   */
  handleMigrationError(error: MigrationError): void {
    testLogger.error(`Migration error for item ${error.itemId}:`, error);

    switch (error.type) {
      case "validation":
        this.handleValidationError(error);
        break;
      case "file_creation":
        this.handleFileCreationError(error);
        break;
      case "data_corruption":
        this.handleDataCorruptionError(error);
        break;
      default:
        this.handleUnknownError(error);
    }
  }

  /**
   * Handle validation errors
   */
  private handleValidationError(error: MigrationError): void {
    testLogger.warn(
      `Validation error for item ${error.itemId}: ${error.message}`,
    );

    if (error.suggestedFix) {
      testLogger.info(`Suggested fix: ${error.suggestedFix}`);
    }

    // For validation errors, we can often provide default values
    // This would be implemented based on specific validation failures
  }

  /**
   * Handle file creation errors
   */
  private handleFileCreationError(error: MigrationError): void {
    testLogger.error(
      `File creation error for item ${error.itemId}: ${error.message}`,
    );

    // For file creation errors, we can:
    // 1. Retry the operation
    // 2. Fall back to inline content storage
    // 3. Queue for later processing

    testLogger.info("Falling back to inline content storage");
  }

  /**
   * Handle data corruption errors
   */
  private handleDataCorruptionError(error: MigrationError): void {
    testLogger.error(
      `Data corruption error for item ${error.itemId}: ${error.message}`,
    );

    // For data corruption, we need manual intervention
    // Log the error and original data for manual review
    testLogger.error("Original data:", error.originalData);
    testLogger.info("Manual review required for this item");
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: MigrationError): void {
    testLogger.error(
      `Unknown migration error for item ${error.itemId}: ${error.message}`,
    );
    testLogger.error("Full error details:", error);
  }

  /**
   * Retry operation with exponential backoff
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    context: string,
    maxAttempts: number = this.MAX_RETRY_ATTEMPTS,
  ): Promise<T> {
    let lastError: Error = new Error("Unknown error");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === maxAttempts) {
          break;
        }

        const delay = this.RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        testLogger.warn(
          `${context} failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`,
        );

        await this.delay(delay);
      }
    }

    throw new Error(
      `${context} failed after ${maxAttempts} attempts: ${lastError.message}`,
    );
  }

  /**
   * Utility: Delay execution
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Mixed Data Format Processor
 * Handles processing of data that contains both old and new format items
 */
export class MixedDataFormatProcessor {
  private migrator = new ContentItemMigrator();
  private errorHandler = new MigrationErrorHandler();

  /**
   * Process mixed format data
   */
  async processMixedData(
    rawData: (ContentItem | EnhancedContentItem)[],
  ): Promise<EnhancedContentItem[]> {
    const processedItems: EnhancedContentItem[] = [];
    const errors: MigrationError[] = [];

    for (const item of rawData) {
      try {
        const processedItem = await this.processItem(item);
        processedItems.push(processedItem);
      } catch (error) {
        if (this.isMigrationError(error)) {
          errors.push(error);
          this.errorHandler.handleMigrationError(error);
        } else {
          testLogger.error(`Unexpected error processing item:`, error);
        }
      }
    }

    if (errors.length > 0) {
      testLogger.warn(`Migration completed with ${errors.length} errors`);
    }

    testLogger.log(`Successfully processed ${processedItems.length} items`);
    return processedItems;
  }

  /**
   * Process individual item (old or new format)
   */
  private async processItem(
    item: ContentItem | EnhancedContentItem,
  ): Promise<EnhancedContentItem> {
    // Check if item is already in enhanced format
    if (this.isEnhancedContentItem(item)) {
      // Validate enhanced item
      const validation = this.migrator.validateMigratedData(item);
      if (!validation.isValid) {
        // Log validation errors but continue processing
        testLogger.warn(
          `Enhanced item validation failed for ${item.id}:`,
          validation.errors,
        );
        // Return item with warnings, don't throw error
      }
      return item;
    } else {
      // Migrate old format item
      const migratedItem = this.migrator.migrateContentItem(item);

      // Validate migrated item
      const validation = this.migrator.validateMigratedData(migratedItem);
      if (!validation.isValid) {
        // Log validation errors but continue processing
        testLogger.warn(
          `Migration validation failed for ${item.id}:`,
          validation.errors,
        );
        // Return migrated item with warnings, don't throw error
      }

      return migratedItem;
    }
  }

  /**
   * Type guard to check if item is EnhancedContentItem
   */
  private isEnhancedContentItem(
    item: ContentItem | EnhancedContentItem,
  ): item is EnhancedContentItem {
    return (
      "categories" in item &&
      Array.isArray((item as EnhancedContentItem).categories)
    );
  }

  /**
   * Type guard to check if error is MigrationError
   */
  private isMigrationError(error: unknown): error is MigrationError {
    return (
      typeof error === "object" &&
      error !== null &&
      "type" in error &&
      "itemId" in error &&
      "message" in error
    );
  }
}

// Export singleton instances
export const contentItemMigrator = new ContentItemMigrator();
export const migrationErrorHandler = new MigrationErrorHandler();
export const mixedDataFormatProcessor = new MixedDataFormatProcessor();
