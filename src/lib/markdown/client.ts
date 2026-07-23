/**
 * Client-Safe Markdown System Exports
 * Only exports functionality that can be used in client components
 */

// Client-side markdown service
export {
	ClientMarkdownService,
	clientMarkdownService,
	createMarkdownFile,
	deleteMarkdownFile,
	fileExists,
	generateFilePath,
	getMarkdownContent,
	updateMarkdownFile,
} from "./client-service";

// Content parser (client-safe)
export { type ContentParser, createContentParser } from "./content-parser";
export type { DirectoryStructure } from "./directory-utils";
// Client-safe error handling and validation
export {
	EmbedValidator,
	type ErrorHandlingOptions,
	embedValidator,
	handleFileError,
	MarkdownError,
	MarkdownErrorHandler,
	MarkdownErrorType,
	markdownErrorHandler,
	validateEmbeds,
} from "./error-handling-client";
// Types only (no runtime dependencies)
export type {
	FileManagementOptions,
	MarkdownFileMetadata,
} from "./file-management";
export type {
	MigrationOptions,
	MigrationResult,
	MigrationSummary,
} from "./migration";

export type { GeneratedPath, PathGenerationOptions } from "./path-utils";

// Common types and constants (client-safe)
export interface MarkdownSystemConfig {
	basePath: string;
	autoCreateDirectories: boolean;
	validatePaths: boolean;
	maxFileSize: number; // in bytes
	backupOnUpdate: boolean;
}

const DEFAULT_MARKDOWN_CONFIG: MarkdownSystemConfig = {
	basePath: "public/data/content/markdown",
	autoCreateDirectories: true,
	validatePaths: true,
	maxFileSize: 1024 * 1024, // 1MB
	backupOnUpdate: false,
};

// Client-safe error types
class MarkdownFileError extends Error {
	constructor(
		message: string,
		public code: string,
		public filePath?: string,
	) {
		super(message);
		this.name = "MarkdownFileError";
	}
}

class MarkdownDirectoryError extends Error {
	constructor(
		message: string,
		public code: string,
		public directoryPath?: string,
	) {
		super(message);
		this.name = "MarkdownDirectoryError";
	}
}

class MarkdownPathError extends Error {
	constructor(
		message: string,
		public code: string,
		public path?: string,
	) {
		super(message);
		this.name = "MarkdownPathError";
	}
}
