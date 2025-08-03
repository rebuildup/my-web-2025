/**
 * Markdown File Management System
 * Core infrastructure for managing markdown files organized by content type
 */

// File Management
export {
  MarkdownFileManager,
  createMarkdownFile,
  deleteMarkdownFile,
  generateFilePath,
  getMarkdownContent,
  markdownFileManager,
  updateMarkdownFile,
  type FileManagementOptions,
  type MarkdownFileMetadata,
} from "./file-management";

// Directory Management
export {
  DEFAULT_DIRECTORY_STRUCTURE,
  DirectoryManager,
  directoryManager,
  getContentTypeDirectory,
  getDirectoryStats,
  initializeDirectoryStructure,
  validateDirectoryStructure,
  type DirectoryStructure,
} from "./directory-utils";

// Path Generation
export {
  PathGenerator,
  generatePath,
  generateUniquePath,
  parsePath,
  pathGenerator,
  toAbsolutePath,
  toRelativePath,
  validatePath,
  type GeneratedPath,
  type PathGenerationOptions,
} from "./path-utils";

// Common types and constants
export interface MarkdownSystemConfig {
  basePath: string;
  autoCreateDirectories: boolean;
  validatePaths: boolean;
  maxFileSize: number; // in bytes
  backupOnUpdate: boolean;
}

export const DEFAULT_MARKDOWN_CONFIG: MarkdownSystemConfig = {
  basePath: "public/data/content/markdown",
  autoCreateDirectories: true,
  validatePaths: true,
  maxFileSize: 1024 * 1024, // 1MB
  backupOnUpdate: false,
};

// Error types
export class MarkdownFileError extends Error {
  constructor(
    message: string,
    public code: string,
    public filePath?: string,
  ) {
    super(message);
    this.name = "MarkdownFileError";
  }
}

export class MarkdownDirectoryError extends Error {
  constructor(
    message: string,
    public code: string,
    public directoryPath?: string,
  ) {
    super(message);
    this.name = "MarkdownDirectoryError";
  }
}

export class MarkdownPathError extends Error {
  constructor(
    message: string,
    public code: string,
    public path?: string,
  ) {
    super(message);
    this.name = "MarkdownPathError";
  }
}
