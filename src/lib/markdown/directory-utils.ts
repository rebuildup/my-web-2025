/**
 * Directory Structure Utilities
 * Handles creation and management of markdown file directory structure
 */

import { ContentType } from "@/types/content";
import { promises as fs } from "fs";
import path from "path";

export interface DirectoryStructure {
  basePath: string;
  contentTypes: Record<ContentType, string>;
}

export const DEFAULT_DIRECTORY_STRUCTURE: DirectoryStructure = {
  basePath: "public/data/content/markdown",
  contentTypes: {
    portfolio: "portfolio",
    plugin: "plugin",
    blog: "blog",
    profile: "profile",
    page: "page",
    tool: "tool",
    asset: "asset",
    download: "download",
  },
};

export class DirectoryManager {
  private structure: DirectoryStructure;

  constructor(structure: DirectoryStructure = DEFAULT_DIRECTORY_STRUCTURE) {
    this.structure = structure;
  }

  /**
   * Initialize the complete directory structure
   */
  async initializeDirectoryStructure(): Promise<void> {
    // Create base directory
    await this.ensureDirectory(this.structure.basePath);

    // Create all content type directories
    for (const [, dirName] of Object.entries(this.structure.contentTypes)) {
      const fullPath = path.join(this.structure.basePath, dirName);
      await this.ensureDirectory(fullPath);
    }
  }

  /**
   * Ensure a directory exists, create if it doesn't
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * Get directory path for a content type
   */
  getContentTypeDirectory(contentType: ContentType): string {
    const dirName = this.structure.contentTypes[contentType];
    if (!dirName) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }
    return path.join(this.structure.basePath, dirName);
  }

  /**
   * Check if directory structure is properly initialized
   */
  async validateDirectoryStructure(): Promise<{
    isValid: boolean;
    missingDirectories: string[];
  }> {
    const missingDirectories: string[] = [];

    // Check base directory
    try {
      await fs.access(this.structure.basePath);
    } catch {
      missingDirectories.push(this.structure.basePath);
    }

    // Check content type directories
    for (const [, dirName] of Object.entries(this.structure.contentTypes)) {
      const fullPath = path.join(this.structure.basePath, dirName);
      try {
        await fs.access(fullPath);
      } catch {
        missingDirectories.push(fullPath);
      }
    }

    return {
      isValid: missingDirectories.length === 0,
      missingDirectories,
    };
  }

  /**
   * Get directory statistics
   */
  async getDirectoryStats(): Promise<
    Record<
      ContentType,
      {
        path: string;
        fileCount: number;
        totalSize: number;
        lastModified?: string;
      }
    >
  > {
    const stats: Record<
      string,
      {
        path: string;
        fileCount: number;
        totalSize: number;
        lastModified?: string;
      }
    > = {};

    for (const [contentType, dirName] of Object.entries(
      this.structure.contentTypes,
    )) {
      const fullPath = path.join(this.structure.basePath, dirName);

      try {
        const files = await fs.readdir(fullPath);
        const markdownFiles = files.filter((file) => file.endsWith(".md"));

        let totalSize = 0;
        let lastModified: Date | undefined;

        for (const file of markdownFiles) {
          const filePath = path.join(fullPath, file);
          try {
            const stat = await fs.stat(filePath);
            totalSize += stat.size;

            if (!lastModified || stat.mtime > lastModified) {
              lastModified = stat.mtime;
            }
          } catch {
            // Skip files that can't be read
          }
        }

        stats[contentType] = {
          path: fullPath,
          fileCount: markdownFiles.length,
          totalSize,
          lastModified: lastModified?.toISOString(),
        };
      } catch {
        // Directory doesn't exist or can't be read
        stats[contentType] = {
          path: fullPath,
          fileCount: 0,
          totalSize: 0,
        };
      }
    }

    return stats as Record<
      ContentType,
      {
        path: string;
        fileCount: number;
        totalSize: number;
        lastModified?: string;
      }
    >;
  }

  /**
   * Clean up empty directories
   */
  async cleanupEmptyDirectories(): Promise<string[]> {
    const removedDirectories: string[] = [];

    for (const [, dirName] of Object.entries(this.structure.contentTypes)) {
      const fullPath = path.join(this.structure.basePath, dirName);

      try {
        const files = await fs.readdir(fullPath);
        if (files.length === 0) {
          await fs.rmdir(fullPath);
          removedDirectories.push(fullPath);
        }
      } catch {
        // Directory doesn't exist or can't be accessed
      }
    }

    return removedDirectories;
  }

  /**
   * Create backup of directory structure
   */
  async createBackup(backupPath: string): Promise<void> {
    const backupDir = path.join(backupPath, `markdown-backup-${Date.now()}`);
    await fs.mkdir(backupDir, { recursive: true });

    // Copy all markdown files
    for (const [, dirName] of Object.entries(this.structure.contentTypes)) {
      const sourcePath = path.join(this.structure.basePath, dirName);
      const targetPath = path.join(backupDir, dirName);

      try {
        const files = await fs.readdir(sourcePath);
        const markdownFiles = files.filter((file) => file.endsWith(".md"));

        if (markdownFiles.length > 0) {
          await fs.mkdir(targetPath, { recursive: true });

          for (const file of markdownFiles) {
            const sourceFile = path.join(sourcePath, file);
            const targetFile = path.join(targetPath, file);
            await fs.copyFile(sourceFile, targetFile);
          }
        }
      } catch {
        // Skip directories that don't exist
      }
    }
  }
}

// Default instance
export const directoryManager = new DirectoryManager();

// Utility functions
export const initializeDirectoryStructure = () =>
  directoryManager.initializeDirectoryStructure();

export const validateDirectoryStructure = () =>
  directoryManager.validateDirectoryStructure();

export const getDirectoryStats = () => directoryManager.getDirectoryStats();

export const getContentTypeDirectory = (contentType: ContentType) =>
  directoryManager.getContentTypeDirectory(contentType);
