/**
 * Markdown File Management Service
 * Handles CRUD operations for markdown files organized by content type
 */

import { ContentType } from "@/types/content";
import { promises as fs } from "fs";
import path from "path";

export interface MarkdownFileMetadata {
  id: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
  size: number;
  checksum?: string;
}

export interface FileManagementOptions {
  basePath?: string;
  createDirectories?: boolean;
}

export class MarkdownFileManager {
  private basePath: string;
  private readonly contentTypeDirectories: Record<ContentType, string> = {
    portfolio: "portfolio",
    plugin: "plugin",
    blog: "blog",
    profile: "profile",
    page: "page",
    tool: "tool",
    asset: "asset",
    download: "download",
  };

  constructor(options: FileManagementOptions = {}) {
    this.basePath = options.basePath || "public/data/content/markdown";
  }

  /**
   * Generate file path for a content item
   */
  generateFilePath(contentId: string, contentType: ContentType): string {
    const directory = this.contentTypeDirectories[contentType];
    if (!directory) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const fileName = `${contentId}.md`;
    return path.join(this.basePath, directory, fileName);
  }

  /**
   * Ensure directory exists for the given content type
   */
  private async ensureDirectory(contentType: ContentType): Promise<void> {
    const directory = this.contentTypeDirectories[contentType];
    if (!directory) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const fullPath = path.join(this.basePath, directory);

    try {
      await fs.access(fullPath);
    } catch {
      // Directory doesn't exist, create it
      await fs.mkdir(fullPath, { recursive: true });
    }
  }

  /**
   * Create a new markdown file
   */
  async createMarkdownFile(
    contentId: string,
    contentType: ContentType,
    content: string,
  ): Promise<string> {
    await this.ensureDirectory(contentType);

    const filePath = this.generateFilePath(contentId, contentType);

    // Check if file already exists
    try {
      await fs.access(filePath);
      throw new Error(`Markdown file already exists: ${filePath}`);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    await fs.writeFile(filePath, content, "utf8");
    return filePath;
  }

  /**
   * Read markdown file content
   */
  async getMarkdownContent(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, "utf8");
      return content;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`Markdown file not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Update existing markdown file
   */
  async updateMarkdownFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.access(filePath);
      await fs.writeFile(filePath, content, "utf8");
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`Markdown file not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Delete markdown file
   */
  async deleteMarkdownFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`Markdown file not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * Check if markdown file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(filePath: string): Promise<MarkdownFileMetadata> {
    try {
      const stats = await fs.stat(filePath);
      const pathParts = filePath.split(path.sep);
      const fileName = pathParts[pathParts.length - 1];
      const id = fileName.replace(".md", "");

      return {
        id,
        filePath,
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
        size: stats.size,
      };
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(`Markdown file not found: ${filePath}`);
      }
      throw error;
    }
  }

  /**
   * List all markdown files for a content type
   */
  async listMarkdownFiles(
    contentType: ContentType,
  ): Promise<MarkdownFileMetadata[]> {
    const directory = this.contentTypeDirectories[contentType];
    if (!directory) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const fullPath = path.join(this.basePath, directory);

    try {
      const files = await fs.readdir(fullPath);
      const markdownFiles = files.filter((file) => file.endsWith(".md"));

      const metadata: MarkdownFileMetadata[] = [];
      for (const file of markdownFiles) {
        const filePath = path.join(fullPath, file);
        try {
          const meta = await this.getFileMetadata(filePath);
          metadata.push(meta);
        } catch (error) {
          // Skip files that can't be read
          console.warn(`Could not read metadata for ${filePath}:`, error);
        }
      }

      return metadata;
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // Directory doesn't exist, return empty array
        return [];
      }
      throw error;
    }
  }

  /**
   * Get relative path from absolute path (for storing in JSON)
   */
  getRelativePath(absolutePath: string): string {
    const relativePath = path.relative(process.cwd(), absolutePath);
    return relativePath.replace(/\\/g, "/"); // Normalize path separators
  }

  /**
   * Get absolute path from relative path
   */
  getAbsolutePath(relativePath: string): string {
    return path.resolve(process.cwd(), relativePath);
  }

  /**
   * Validate file path format
   */
  validateFilePath(filePath: string): boolean {
    // Check if path is within the markdown directory
    const normalizedPath = path.normalize(filePath);
    const normalizedBasePath = path.normalize(this.basePath);

    return (
      normalizedPath.startsWith(normalizedBasePath) &&
      normalizedPath.endsWith(".md")
    );
  }
}

// Default instance
export const markdownFileManager = new MarkdownFileManager();

// Utility functions for common operations
export const createMarkdownFile = (
  contentId: string,
  contentType: ContentType,
  content: string,
) => markdownFileManager.createMarkdownFile(contentId, contentType, content);

export const getMarkdownContent = (filePath: string) =>
  markdownFileManager.getMarkdownContent(filePath);

export const updateMarkdownFile = (filePath: string, content: string) =>
  markdownFileManager.updateMarkdownFile(filePath, content);

export const deleteMarkdownFile = (filePath: string) =>
  markdownFileManager.deleteMarkdownFile(filePath);

export const generateFilePath = (contentId: string, contentType: ContentType) =>
  markdownFileManager.generateFilePath(contentId, contentType);
