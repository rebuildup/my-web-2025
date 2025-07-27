/**
 * Content Processing Pipeline
 * Handles automatic Markdown generation, JSON updates, and search index regeneration
 * Task 9.3.1 - Create content processing pipeline
 */

import { promises as fs } from "fs";
import path from "path";
import type { ContentItem, ContentType } from "@/types";
import {
  saveContentByType,
  loadContentByType,
  validateContentItem,
  generateContentId,
} from "@/lib/data";
import { updateSearchIndex as updateSearchIndexFn } from "@/lib/search";
import { adminUtils, AdminError, ADMIN_CONSTANTS } from "./utils";

// Content processing configuration
const CONTENT_CONFIG = {
  MARKDOWN_DIR: path.join(process.cwd(), "public/content/markdown"),
  OGP_IMAGES_DIR: path.join(
    process.cwd(),
    ADMIN_CONSTANTS.DIRECTORIES.OG_IMAGES,
  ),
  FAVICONS_DIR: path.join(process.cwd(), ADMIN_CONSTANTS.DIRECTORIES.FAVICONS),
  BACKUP_DIR: path.join(process.cwd(), "public/data/backups"),
} as const;

export interface ContentProcessingOptions {
  generateMarkdown?: boolean;
  updateSearchIndex?: boolean;
  createBackup?: boolean;
  validateContent?: boolean;
  processImages?: boolean;
}

export interface ProcessingResult {
  success: boolean;
  contentId: string;
  markdownPath?: string;
  backupPath?: string;
  errors: string[];
  warnings: string[];
}

/**
 * Content Processing Pipeline
 */
export class ContentProcessor {
  private static instance: ContentProcessor;

  private constructor() {}

  public static getInstance(): ContentProcessor {
    if (!ContentProcessor.instance) {
      ContentProcessor.instance = new ContentProcessor();
    }
    return ContentProcessor.instance;
  }

  /**
   * Process content item through the complete pipeline
   */
  async processContent(
    type: ContentType,
    content: ContentItem,
    options: ContentProcessingOptions = {},
  ): Promise<ProcessingResult> {
    const {
      generateMarkdown = true,
      updateSearchIndex = true,
      createBackup = true,
      validateContent = true,
      processImages = true,
    } = options;

    const result: ProcessingResult = {
      success: false,
      contentId: content.id,
      errors: [],
      warnings: [],
    };

    try {
      // Validate admin access
      const validation = adminUtils.validateAdminRequest();
      if (!validation.valid) {
        throw new AdminError(
          validation.error || "Admin access denied",
          "ACCESS_DENIED",
          403,
        );
      }

      // Validate content structure
      if (validateContent && !validateContentItem(content)) {
        throw new AdminError(
          "Invalid content item structure",
          "VALIDATION_ERROR",
          400,
        );
      }

      // Ensure required directories exist
      await this.ensureDirectories();

      // Create backup if requested
      if (createBackup) {
        try {
          result.backupPath = await this.createContentBackup(type, content);
        } catch (error) {
          result.warnings.push(`Backup creation failed: ${error}`);
        }
      }

      // Generate Markdown file
      if (generateMarkdown && content.content) {
        try {
          result.markdownPath = await this.generateMarkdownFile(content);
        } catch (error) {
          result.errors.push(`Markdown generation failed: ${error}`);
        }
      }

      // Update JSON data structure
      await this.updateContentData(type, content);

      // Process images if needed
      if (processImages) {
        try {
          await this.processContentImages(content);
        } catch (error) {
          result.warnings.push(`Image processing failed: ${error}`);
        }
      }

      // Update search index
      if (updateSearchIndex) {
        try {
          await updateSearchIndexFn();
        } catch (error) {
          result.warnings.push(`Search index update failed: ${error}`);
        }
      }

      result.success = true;
      adminUtils.logAdminAction("Content processed", {
        type,
        contentId: content.id,
        options,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(errorMessage);
      adminUtils.logAdminAction("Content processing failed", {
        type,
        contentId: content.id,
        error: errorMessage,
      });
    }

    return result;
  }

  /**
   * Generate Markdown file from content
   */
  private async generateMarkdownFile(content: ContentItem): Promise<string> {
    const markdownContent = this.generateMarkdownContent(content);
    const fileName = `${content.type}_${content.id}.md`;
    const filePath = path.join(CONTENT_CONFIG.MARKDOWN_DIR, fileName);

    await fs.writeFile(filePath, markdownContent, "utf-8");

    // Update content item with markdown path
    content.contentPath = `content/markdown/${fileName}`;

    return filePath;
  }

  /**
   * Generate Markdown content from ContentItem
   */
  private generateMarkdownContent(content: ContentItem): string {
    const frontMatter = this.generateFrontMatter(content);
    const body = content.content || "";

    return `---
${frontMatter}
---

${body}
`;
  }

  /**
   * Generate YAML front matter for Markdown
   */
  private generateFrontMatter(content: ContentItem): string {
    const frontMatter = {
      id: content.id,
      type: content.type,
      title: content.title,
      description: content.description,
      category: content.category,
      tags: content.tags,
      status: content.status,
      priority: content.priority,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt || new Date().toISOString(),
      publishedAt: content.publishedAt,
      thumbnail: content.thumbnail,
      images: content.images,
      videos: content.videos,
      externalLinks: content.externalLinks,
      downloadInfo: content.downloadInfo,
      seo: content.seo,
    };

    // Remove undefined values
    const cleanedFrontMatter = Object.fromEntries(
      Object.entries(frontMatter).filter(([, value]) => value !== undefined),
    );

    return Object.entries(cleanedFrontMatter)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}:\n${value.map((item) => `  - ${JSON.stringify(item)}`).join("\n")}`;
        } else if (typeof value === "object" && value !== null) {
          return `${key}: ${JSON.stringify(value)}`;
        } else if (typeof value === "string") {
          return `${key}: "${value}"`;
        } else {
          return `${key}: ${value}`;
        }
      })
      .join("\n");
  }

  /**
   * Update JSON data structure
   */
  private async updateContentData(
    type: ContentType,
    content: ContentItem,
  ): Promise<void> {
    const existingContent = await loadContentByType(type);
    const existingIndex = existingContent.findIndex(
      (item) => item.id === content.id,
    );

    // Update timestamp
    content.updatedAt = new Date().toISOString();

    if (existingIndex >= 0) {
      // Update existing content
      existingContent[existingIndex] = content;
    } else {
      // Add new content
      if (!content.id) {
        content.id = generateContentId(type);
      }
      existingContent.push(content);
    }

    // Sort by priority and creation date
    existingContent.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    await saveContentByType(type, existingContent);
  }

  /**
   * Process content images (placeholder for future image processing)
   */
  private async processContentImages(content: ContentItem): Promise<void> {
    // This is a placeholder for future image processing functionality
    // Could include thumbnail generation, image optimization, etc.
    if (content.images && content.images.length > 0) {
      adminUtils.logAdminAction("Image processing", {
        contentId: content.id,
        imageCount: content.images.length,
      });
    }
  }

  /**
   * Create content backup
   */
  private async createContentBackup(
    type: ContentType,
    content: ContentItem,
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFileName = `${type}_${content.id}_${timestamp}.json`;
    const backupPath = path.join(CONTENT_CONFIG.BACKUP_DIR, backupFileName);

    await fs.writeFile(backupPath, JSON.stringify(content, null, 2), "utf-8");
    return backupPath;
  }

  /**
   * Ensure required directories exist
   */
  private async ensureDirectories(): Promise<void> {
    const directories = [
      CONTENT_CONFIG.MARKDOWN_DIR,
      CONTENT_CONFIG.OGP_IMAGES_DIR,
      CONTENT_CONFIG.FAVICONS_DIR,
      CONTENT_CONFIG.BACKUP_DIR,
    ];

    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * Batch process multiple content items
   */
  async batchProcessContent(
    type: ContentType,
    contentItems: ContentItem[],
    options: ContentProcessingOptions = {},
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (const content of contentItems) {
      const result = await this.processContent(type, content, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Delete content and cleanup associated files
   */
  async deleteContent(
    type: ContentType,
    contentId: string,
  ): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: false,
      contentId,
      errors: [],
      warnings: [],
    };

    try {
      // Validate admin access
      const validation = adminUtils.validateAdminRequest();
      if (!validation.valid) {
        throw new AdminError(
          validation.error || "Admin access denied",
          "ACCESS_DENIED",
          403,
        );
      }

      // Load existing content
      const existingContent = await loadContentByType(type);
      const contentIndex = existingContent.findIndex(
        (item) => item.id === contentId,
      );

      if (contentIndex === -1) {
        throw new AdminError("Content not found", "NOT_FOUND", 404);
      }

      const content = existingContent[contentIndex];

      // Create backup before deletion
      try {
        result.backupPath = await this.createContentBackup(type, content);
      } catch (error) {
        result.warnings.push(`Backup creation failed: ${error}`);
      }

      // Remove from JSON data
      existingContent.splice(contentIndex, 1);
      await saveContentByType(type, existingContent);

      // Remove Markdown file if exists
      if (content.contentPath) {
        try {
          const markdownPath = path.join(
            process.cwd(),
            "public",
            content.contentPath,
          );
          await fs.unlink(markdownPath);
        } catch (error) {
          result.warnings.push(`Markdown file deletion failed: ${error}`);
        }
      }

      // Update search index
      try {
        await updateSearchIndexFn();
      } catch (error) {
        result.warnings.push(`Search index update failed: ${error}`);
      }

      result.success = true;
      adminUtils.logAdminAction("Content deleted", { type, contentId });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      result.errors.push(errorMessage);
      adminUtils.logAdminAction("Content deletion failed", {
        type,
        contentId,
        error: errorMessage,
      });
    }

    return result;
  }
}

// Export singleton instance
export const contentProcessor = ContentProcessor.getInstance();
