/**
 * Markdown File Management System
 * Core infrastructure for managing markdown files organized by content type
 */

// Directory Management
export {
	DEFAULT_DIRECTORY_STRUCTURE,
	DirectoryManager,
	type DirectoryStructure,
	directoryManager,
	getContentTypeDirectory,
	getDirectoryStats,
	initializeDirectoryStructure,
	validateDirectoryStructure,
} from "./directory-utils";
// Error Handling and Validation
export {
	checkFileIntegrity,
	EmbedValidator,
	type ErrorHandlingOptions,
	embedValidator,
	FileIntegrityChecker,
	fileIntegrityChecker,
	handleFileError,
	MarkdownError,
	MarkdownErrorHandler,
	MarkdownErrorType,
	markdownErrorHandler,
	validateEmbeds,
} from "./error-handling";
// File Management
export {
	createMarkdownFile,
	deleteMarkdownFile,
	type FileManagementOptions,
	generateFilePath,
	getMarkdownContent,
	MarkdownFileManager,
	type MarkdownFileMetadata,
	markdownFileManager,
	updateMarkdownFile,
} from "./file-management";
// Migration System
export {
	ContentMigrationService,
	contentMigrationService,
	getMigrationStatus,
	type MigrationOptions,
	type MigrationResult,
	type MigrationSummary,
	migrateAllContent,
	migrateContentFile,
	rollbackMigration,
} from "./migration";

// Path Generation
export {
	type GeneratedPath,
	generatePath,
	generateUniquePath,
	type PathGenerationOptions,
	PathGenerator,
	parsePath,
	pathGenerator,
	toAbsolutePath,
	toRelativePath,
	validatePath,
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
