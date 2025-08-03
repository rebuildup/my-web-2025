/**
 * Content Migration System
 * Migrates existing string-based content to markdown files
 */

import { ContentItem, ContentType, MarkdownContentItem } from "@/types/content";
import { promises as fs } from "fs";
import path from "path";
import { markdownFileManager } from "./file-management";

export interface MigrationResult {
  success: boolean;
  itemId: string;
  filePath?: string;
  error?: string;
}

export interface MigrationSummary {
  totalItems: number;
  successCount: number;
  failureCount: number;
  results: MigrationResult[];
  errors: string[];
}

export interface MigrationOptions {
  dryRun?: boolean; // Preview migration without making changes
  backupOriginal?: boolean; // Create backup of original JSON files
  overwriteExisting?: boolean; // Overwrite existing markdown files
  batchSize?: number; // Process items in batches
}

export class ContentMigrationService {
  private readonly dataPath = "public/data/content";
  private readonly backupPath = "public/data/content/backup";

  /**
   * Migrate all content files to markdown system
   */
  async migrateAllContent(
    options: MigrationOptions = {},
  ): Promise<MigrationSummary> {
    const { dryRun = false, backupOriginal = true } = options;

    console.log(`Starting content migration (dry run: ${dryRun})`);

    const summary: MigrationSummary = {
      totalItems: 0,
      successCount: 0,
      failureCount: 0,
      results: [],
      errors: [],
    };

    try {
      // Create backup if requested
      if (backupOriginal && !dryRun) {
        await this.createBackup();
      }

      // Get all content files
      const contentFiles = await this.getContentFiles();

      for (const contentFile of contentFiles) {
        try {
          const fileSummary = await this.migrateContentFile(contentFile, {
            ...options,
            dryRun,
          });

          summary.totalItems += fileSummary.totalItems;
          summary.successCount += fileSummary.successCount;
          summary.failureCount += fileSummary.failureCount;
          summary.results.push(...fileSummary.results);
          summary.errors.push(...fileSummary.errors);
        } catch (error) {
          const errorMsg = `Failed to migrate ${contentFile}: ${error}`;
          summary.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }

      console.log(
        `Migration completed. Success: ${summary.successCount}, Failures: ${summary.failureCount}`,
      );
      return summary;
    } catch (error) {
      const errorMsg = `Migration failed: ${error}`;
      summary.errors.push(errorMsg);
      console.error(errorMsg);
      return summary;
    }
  }

  /**
   * Migrate a specific content file
   */
  async migrateContentFile(
    fileName: string,
    options: MigrationOptions = {},
  ): Promise<MigrationSummary> {
    const { dryRun = false, overwriteExisting = false } = options;

    const summary: MigrationSummary = {
      totalItems: 0,
      successCount: 0,
      failureCount: 0,
      results: [],
      errors: [],
    };

    try {
      const filePath = path.join(this.dataPath, fileName);
      const content = await fs.readFile(filePath, "utf8");
      const items: ContentItem[] = JSON.parse(content);

      summary.totalItems = items.length;
      console.log(`Migrating ${items.length} items from ${fileName}`);

      // Process items in batches
      const batchSize = options.batchSize || 10;
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);

        for (const item of batch) {
          const result = await this.migrateContentItem(item, {
            dryRun,
            overwriteExisting,
          });

          summary.results.push(result);
          if (result.success) {
            summary.successCount++;
          } else {
            summary.failureCount++;
            if (result.error) {
              summary.errors.push(`${item.id}: ${result.error}`);
            }
          }
        }

        // Small delay between batches to avoid overwhelming the file system
        if (i + batchSize < items.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Update JSON file with markdown references if not dry run
      if (!dryRun && summary.successCount > 0) {
        await this.updateJsonWithMarkdownPaths(
          fileName,
          items,
          summary.results,
        );
      }

      return summary;
    } catch (error) {
      const errorMsg = `Failed to migrate content file ${fileName}: ${error}`;
      summary.errors.push(errorMsg);
      console.error(errorMsg);
      return summary;
    }
  }

  /**
   * Migrate a single content item
   */
  private async migrateContentItem(
    item: ContentItem,
    options: { dryRun?: boolean; overwriteExisting?: boolean } = {},
  ): Promise<MigrationResult> {
    const { dryRun = false, overwriteExisting = false } = options;

    try {
      // Skip if already migrated
      if ((item as MarkdownContentItem).markdownMigrated) {
        return {
          success: true,
          itemId: item.id,
          error: "Already migrated",
        };
      }

      // Skip if no content to migrate
      if (!item.content || item.content.trim() === "") {
        return {
          success: true,
          itemId: item.id,
          error: "No content to migrate",
        };
      }

      const contentType = item.type as ContentType;
      const filePath = markdownFileManager.generateFilePath(
        item.id,
        contentType,
      );

      // Check if markdown file already exists
      const fileExists = await markdownFileManager.fileExists(filePath);
      if (fileExists && !overwriteExisting) {
        return {
          success: false,
          itemId: item.id,
          error: "Markdown file already exists",
        };
      }

      if (dryRun) {
        return {
          success: true,
          itemId: item.id,
          filePath: markdownFileManager.getRelativePath(filePath),
        };
      }

      // Create or update markdown file
      if (fileExists && overwriteExisting) {
        await markdownFileManager.updateMarkdownFile(filePath, item.content);
      } else {
        await markdownFileManager.createMarkdownFile(
          item.id,
          contentType,
          item.content,
        );
      }

      return {
        success: true,
        itemId: item.id,
        filePath: markdownFileManager.getRelativePath(filePath),
      };
    } catch (error) {
      return {
        success: false,
        itemId: item.id,
        error: `Migration failed: ${error}`,
      };
    }
  }

  /**
   * Update JSON file with markdown file paths
   */
  private async updateJsonWithMarkdownPaths(
    fileName: string,
    items: ContentItem[],
    results: MigrationResult[],
  ): Promise<void> {
    try {
      const successfulMigrations = new Map(
        results
          .filter((r) => r.success && r.filePath)
          .map((r) => [r.itemId, r.filePath!]),
      );

      const updatedItems = items.map((item) => {
        const markdownPath = successfulMigrations.get(item.id);
        if (markdownPath) {
          const updatedItem = { ...item } as MarkdownContentItem;
          updatedItem.markdownPath = markdownPath;
          updatedItem.markdownMigrated = true;
          // Keep original content for backward compatibility
          return updatedItem;
        }
        return item;
      });

      const filePath = path.join(this.dataPath, fileName);
      await fs.writeFile(
        filePath,
        JSON.stringify(updatedItems, null, 2),
        "utf8",
      );

      console.log(
        `Updated ${fileName} with ${successfulMigrations.size} markdown references`,
      );
    } catch (error) {
      throw new Error(`Failed to update JSON file ${fileName}: ${error}`);
    }
  }

  /**
   * Create backup of original content files
   */
  private async createBackup(): Promise<void> {
    try {
      // Ensure backup directory exists
      await fs.mkdir(this.backupPath, { recursive: true });

      const contentFiles = await this.getContentFiles();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      for (const fileName of contentFiles) {
        const sourcePath = path.join(this.dataPath, fileName);
        const backupFileName = `${timestamp}-${fileName}`;
        const backupFilePath = path.join(this.backupPath, backupFileName);

        await fs.copyFile(sourcePath, backupFilePath);
      }

      console.log(
        `Created backup of ${contentFiles.length} files in ${this.backupPath}`,
      );
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  /**
   * Get list of content files to migrate
   */
  private async getContentFiles(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.dataPath);
      return files.filter(
        (file) =>
          file.endsWith(".json") &&
          !file.startsWith("backup-") &&
          file !== "tags.json", // Skip non-content files
      );
    } catch (error) {
      throw new Error(`Failed to read content directory: ${error}`);
    }
  }

  /**
   * Get migration status for all content
   */
  async getMigrationStatus(): Promise<{
    totalFiles: number;
    totalItems: number;
    migratedItems: number;
    pendingItems: number;
    fileStatus: Array<{
      fileName: string;
      totalItems: number;
      migratedItems: number;
      pendingItems: number;
    }>;
  }> {
    const status = {
      totalFiles: 0,
      totalItems: 0,
      migratedItems: 0,
      pendingItems: 0,
      fileStatus: [] as Array<{
        fileName: string;
        totalItems: number;
        migratedItems: number;
        pendingItems: number;
      }>,
    };

    try {
      const contentFiles = await this.getContentFiles();
      status.totalFiles = contentFiles.length;

      for (const fileName of contentFiles) {
        const filePath = path.join(this.dataPath, fileName);
        const content = await fs.readFile(filePath, "utf8");
        const items: MarkdownContentItem[] = JSON.parse(content);

        const migratedCount = items.filter(
          (item) => item.markdownMigrated,
        ).length;
        const pendingCount = items.length - migratedCount;

        status.totalItems += items.length;
        status.migratedItems += migratedCount;
        status.pendingItems += pendingCount;

        status.fileStatus.push({
          fileName,
          totalItems: items.length,
          migratedItems: migratedCount,
          pendingItems: pendingCount,
        });
      }

      return status;
    } catch (error) {
      console.error("Failed to get migration status:", error);
      return status;
    }
  }

  /**
   * Rollback migration for specific items
   */
  async rollbackMigration(itemIds: string[]): Promise<MigrationSummary> {
    const summary: MigrationSummary = {
      totalItems: itemIds.length,
      successCount: 0,
      failureCount: 0,
      results: [],
      errors: [],
    };

    try {
      const contentFiles = await this.getContentFiles();

      for (const fileName of contentFiles) {
        const filePath = path.join(this.dataPath, fileName);
        const content = await fs.readFile(filePath, "utf8");
        const items: MarkdownContentItem[] = JSON.parse(content);

        let hasChanges = false;

        for (const item of items) {
          if (
            itemIds.includes(item.id) &&
            item.markdownMigrated &&
            item.markdownPath
          ) {
            try {
              // Delete markdown file
              const absolutePath = markdownFileManager.getAbsolutePath(
                item.markdownPath,
              );
              await markdownFileManager.deleteMarkdownFile(absolutePath);

              // Remove markdown references
              delete item.markdownPath;
              delete item.markdownMigrated;
              hasChanges = true;

              summary.results.push({
                success: true,
                itemId: item.id,
              });
              summary.successCount++;
            } catch (error) {
              const errorMsg = `Failed to rollback ${item.id}: ${error}`;
              summary.results.push({
                success: false,
                itemId: item.id,
                error: errorMsg,
              });
              summary.errors.push(errorMsg);
              summary.failureCount++;
            }
          }
        }

        // Update JSON file if there were changes
        if (hasChanges) {
          await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf8");
        }
      }

      return summary;
    } catch (error) {
      const errorMsg = `Rollback failed: ${error}`;
      summary.errors.push(errorMsg);
      console.error(errorMsg);
      return summary;
    }
  }
}

// Default instance
export const contentMigrationService = new ContentMigrationService();

// Utility functions
export const migrateAllContent = (options?: MigrationOptions) =>
  contentMigrationService.migrateAllContent(options);

export const migrateContentFile = (
  fileName: string,
  options?: MigrationOptions,
) => contentMigrationService.migrateContentFile(fileName, options);

export const getMigrationStatus = () =>
  contentMigrationService.getMigrationStatus();

export const rollbackMigration = (itemIds: string[]) =>
  contentMigrationService.rollbackMigration(itemIds);
