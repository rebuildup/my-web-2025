/**
 * File Path Generation Utilities
 * Handles proper naming conventions and path generation for markdown files
 */

import { ContentType } from "@/types/content";
import path from "path";

export interface PathGenerationOptions {
  basePath?: string;
  useTimestamp?: boolean;
  sanitizeNames?: boolean;
  maxLength?: number;
}

export interface GeneratedPath {
  absolutePath: string;
  relativePath: string;
  fileName: string;
  directory: string;
}

export class PathGenerator {
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
    other: "other",
  };

  constructor(basePath: string = "public/data/content/markdown") {
    this.basePath = basePath;
  }

  /**
   * Generate file path for content item
   */
  generatePath(
    contentId: string,
    contentType: ContentType,
    options: PathGenerationOptions = {},
  ): GeneratedPath {
    const {
      useTimestamp = false,
      sanitizeNames = true,
      maxLength = 255,
    } = options;

    // Validate content type
    const directory = this.contentTypeDirectories[contentType];
    if (!directory) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    // Sanitize content ID if needed
    let fileName = sanitizeNames ? this.sanitizeFileName(contentId) : contentId;

    // Add timestamp if requested
    if (useTimestamp) {
      const timestamp = Date.now();
      fileName = `${fileName}-${timestamp}`;
    }

    // Ensure .md extension
    if (!fileName.endsWith(".md")) {
      fileName = `${fileName}.md`;
    }

    // Truncate if too long
    if (fileName.length > maxLength) {
      const extension = ".md";
      const maxNameLength = maxLength - extension.length;
      fileName = fileName.substring(0, maxNameLength) + extension;
    }

    // Build paths
    const directoryPath = path.join(this.basePath, directory);
    const absolutePath = path.join(directoryPath, fileName);
    const relativePath = path.relative(process.cwd(), absolutePath);

    return {
      absolutePath,
      relativePath: relativePath.replace(/\\/g, "/"), // Normalize separators
      fileName,
      directory: directoryPath,
    };
  }

  /**
   * Generate unique file path (adds suffix if file exists)
   */
  generateUniquePath(
    contentId: string,
    contentType: ContentType,
    existingPaths: string[] = [],
    options: PathGenerationOptions = {},
  ): GeneratedPath {
    const basePath = this.generatePath(contentId, contentType, options);

    if (!existingPaths.includes(basePath.absolutePath)) {
      return basePath;
    }

    // Generate unique suffix
    let counter = 1;
    let uniquePath: GeneratedPath;

    do {
      const uniqueId = `${contentId}-${counter}`;
      uniquePath = this.generatePath(uniqueId, contentType, options);
      counter++;
    } while (existingPaths.includes(uniquePath.absolutePath) && counter < 1000);

    if (counter >= 1000) {
      throw new Error("Could not generate unique path after 1000 attempts");
    }

    return uniquePath;
  }

  /**
   * Parse file path to extract information
   */
  parsePath(filePath: string): {
    contentId: string;
    contentType: ContentType | null;
    fileName: string;
    isValid: boolean;
  } {
    const normalizedPath = path.normalize(filePath);
    const relativePath = path.relative(this.basePath, normalizedPath);
    const pathParts = relativePath.split(path.sep);

    if (pathParts.length < 2) {
      return {
        contentId: "",
        contentType: null,
        fileName: "",
        isValid: false,
      };
    }

    const [contentTypeDir, fileName] = pathParts;

    // Find content type by directory name
    const contentType = Object.entries(this.contentTypeDirectories).find(
      ([, dir]) => dir === contentTypeDir,
    )?.[0] as ContentType | undefined;

    if (!contentType || !fileName.endsWith(".md")) {
      return {
        contentId: "",
        contentType: null,
        fileName,
        isValid: false,
      };
    }

    const contentId = fileName.replace(".md", "");

    return {
      contentId,
      contentType,
      fileName,
      isValid: true,
    };
  }

  /**
   * Sanitize file name to be filesystem-safe
   */
  private sanitizeFileName(fileName: string): string {
    return (
      fileName
        // Remove or replace invalid characters
        .replace(/[<>:"/\\|?*]/g, "-")
        // Replace multiple consecutive dashes with single dash
        .replace(/-+/g, "-")
        // Remove leading/trailing dashes
        .replace(/^-+|-+$/g, "") ||
      // Ensure not empty
      "untitled"
    );
  }

  /**
   * Validate file path format
   */
  validatePath(filePath: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    try {
      const normalizedPath = path.normalize(filePath);

      // Check if path is within markdown directory
      if (!normalizedPath.startsWith(path.normalize(this.basePath))) {
        errors.push("Path is outside of markdown directory");
      }

      // Check file extension
      if (!normalizedPath.endsWith(".md")) {
        errors.push("File must have .md extension");
      }

      // Check path structure
      const parsed = this.parsePath(filePath);
      if (!parsed.isValid) {
        errors.push("Invalid path structure");
      }

      // Check for invalid characters in path
      if (/[<>:"|?*]/.test(normalizedPath)) {
        errors.push("Path contains invalid characters");
      }
    } catch (error) {
      errors.push(`Path validation error: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get all possible paths for a content type
   */
  getContentTypePaths(contentType: ContentType): {
    directory: string;
    pattern: string;
  } {
    const directory = this.contentTypeDirectories[contentType];
    if (!directory) {
      throw new Error(`Unsupported content type: ${contentType}`);
    }

    const directoryPath = path.join(this.basePath, directory);
    const pattern = path.join(directoryPath, "*.md");

    return {
      directory: directoryPath,
      pattern,
    };
  }

  /**
   * Convert absolute path to relative path for storage
   */
  toRelativePath(absolutePath: string): string {
    const relativePath = path.relative(process.cwd(), absolutePath);
    return relativePath.replace(/\\/g, "/");
  }

  /**
   * Convert relative path to absolute path
   */
  toAbsolutePath(relativePath: string): string {
    return path.resolve(process.cwd(), relativePath);
  }

  /**
   * Generate backup file path
   */
  generateBackupPath(originalPath: string): string {
    const parsed = path.parse(originalPath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `${parsed.name}.backup.${timestamp}${parsed.ext}`;
    return path.join(parsed.dir, backupName);
  }
}

// Default instance
export const pathGenerator = new PathGenerator();

// Utility functions
export const generatePath = (
  contentId: string,
  contentType: ContentType,
  options?: PathGenerationOptions,
) => pathGenerator.generatePath(contentId, contentType, options);

export const generateUniquePath = (
  contentId: string,
  contentType: ContentType,
  existingPaths?: string[],
  options?: PathGenerationOptions,
) =>
  pathGenerator.generateUniquePath(
    contentId,
    contentType,
    existingPaths,
    options,
  );

export const parsePath = (filePath: string) =>
  pathGenerator.parsePath(filePath);

export const validatePath = (filePath: string) =>
  pathGenerator.validatePath(filePath);

export const toRelativePath = (absolutePath: string) =>
  pathGenerator.toRelativePath(absolutePath);

export const toAbsolutePath = (relativePath: string) =>
  pathGenerator.toAbsolutePath(relativePath);
