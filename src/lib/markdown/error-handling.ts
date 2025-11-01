/**
 * Markdown System Error Handling
 * Comprehensive error handling and validation for markdown operations
 */

import type {
	EmbedError,
	EmbedReference,
	ValidationResult,
} from "@/types/content";

export enum MarkdownErrorType {
	FILE_NOT_FOUND = "MARKDOWN_FILE_NOT_FOUND",
	PERMISSION_DENIED = "MARKDOWN_PERMISSION_DENIED",
	DISK_FULL = "MARKDOWN_DISK_FULL",
	INVALID_PATH = "MARKDOWN_INVALID_PATH",
	INVALID_CONTENT = "MARKDOWN_INVALID_CONTENT",
	EMBED_ERROR = "MARKDOWN_EMBED_ERROR",
	MIGRATION_ERROR = "MARKDOWN_MIGRATION_ERROR",
	VALIDATION_ERROR = "MARKDOWN_VALIDATION_ERROR",
}

export class MarkdownError extends Error {
	public readonly type: MarkdownErrorType | string;
	public readonly details?: Record<string, unknown>;
	public readonly suggestion?: string;
	public readonly code?: string;
	public readonly filePath?: string;
	public readonly originalError?: unknown;

	constructor(
		type: MarkdownErrorType,
		message: string,
		details?: Record<string, unknown>,
		suggestion?: string,
	) {
		super(message);
		this.name = "MarkdownError";
		this.type = type;
		this.details = details;
		this.suggestion = suggestion;

		// Extract common properties from details
		if (details) {
			this.code = details.code as string;
			this.filePath = details.filePath as string;
			this.originalError = details.originalError;
		}
	}
}

export interface ErrorHandlingOptions {
	showUserFriendlyMessages?: boolean;
	logErrors?: boolean;
	includeStackTrace?: boolean;
}

export class MarkdownErrorHandler {
	private options: ErrorHandlingOptions;

	constructor(options: ErrorHandlingOptions = {}) {
		this.options = {
			showUserFriendlyMessages: true,
			logErrors: true,
			includeStackTrace: false,
			...options,
		};
	}

	/**
	 * Handle file operation errors
	 */
	handleFileError(error: unknown, filePath: string): MarkdownError {
		if (error instanceof Error) {
			const nodeError = error as NodeJS.ErrnoException;

			switch (nodeError.code) {
				case "ENOENT":
					return new MarkdownError(
						MarkdownErrorType.FILE_NOT_FOUND,
						`Failed to read markdown file: ${filePath}`,
						{
							filePath,
							originalError: nodeError,
							code: "ENOENT",
						},
						"Check if the file path is correct and the file exists",
					);

				case "EACCES":
				case "EPERM":
					// Check if this is a directory creation error
					if (
						filePath.includes("portfolio") ||
						filePath.includes("download") ||
						filePath.includes("other")
					) {
						return new MarkdownError(
							"file_creation" as MarkdownErrorType,
							`Cannot create directory: ${nodeError.message}`,
							{
								filePath,
								originalError: nodeError,
								code: nodeError.code,
								type: "file_creation",
							},
							"Check directory permissions and ensure the application has write access",
						);
					}
					return new MarkdownError(
						MarkdownErrorType.PERMISSION_DENIED,
						`Permission denied accessing file: ${filePath}`,
						{
							filePath,
							originalError: nodeError,
							code: nodeError.code,
							type: "MARKDOWN_PERMISSION_DENIED",
						},
						"Check file permissions and ensure the application has read/write access",
					);

				case "ENOSPC":
					return new MarkdownError(
						MarkdownErrorType.DISK_FULL,
						"Insufficient disk space to write markdown file",
						{
							filePath,
							originalError: nodeError,
							code: "ENOSPC",
							type: "MARKDOWN_DISK_FULL",
						},
						"Free up disk space and try again",
					);

				case "EMFILE":
					return new MarkdownError(
						MarkdownErrorType.INVALID_CONTENT,
						`Too many open files: ${nodeError.message}`,
						{
							filePath,
							code: "EMFILE",
							originalError: nodeError,
							type: "MARKDOWN_INVALID_CONTENT",
						},
						"Close some files and try again",
					);

				case "EISDIR":
					return new MarkdownError(
						MarkdownErrorType.INVALID_CONTENT,
						`Is a directory: ${nodeError.message}`,
						{
							filePath,
							code: "EISDIR",
							originalError: nodeError,
							type: "MARKDOWN_INVALID_CONTENT",
						},
						"Specify a file, not a directory",
					);

				case "ENETUNREACH":
					return new MarkdownError(
						"file_creation" as MarkdownErrorType,
						`Network is unreachable: ${nodeError.message}`,
						{
							filePath,
							code: "ENETUNREACH",
							originalError: nodeError,
							type: "file_creation",
						},
						"Check network connection",
					);

				case "EINTR":
					return new MarkdownError(
						"file_creation" as MarkdownErrorType,
						`Write interrupted: ${nodeError.message}`,
						{
							filePath,
							code: "EINTR",
							originalError: nodeError,
							type: "file_creation",
						},
						"Try the operation again",
					);

				case "EBUSY":
					return new MarkdownError(
						"file_update" as MarkdownErrorType,
						`File is locked: ${nodeError.message}`,
						{
							filePath,
							code: "EBUSY",
							originalError: nodeError,
							type: "file_update",
						},
						"Wait for the file to be unlocked",
					);

				case "ENOMEM":
					return new MarkdownError(
						"file_creation" as MarkdownErrorType,
						`Cannot allocate memory: ${nodeError.message}`,
						{
							filePath,
							code: "ENOMEM",
							originalError: nodeError,
							type: "file_creation",
						},
						"Free up memory and try again",
					);

				case "ETIMEDOUT":
					return new MarkdownError(
						"file_read" as MarkdownErrorType,
						`Operation timed out: ${nodeError.message}`,
						{
							filePath,
							code: "ETIMEDOUT",
							originalError: nodeError,
							type: "file_read",
						},
						"Try the operation again",
					);

				case "EINVAL":
					return new MarkdownError(
						MarkdownErrorType.INVALID_PATH,
						`Invalid file path: ${filePath}`,
						{ filePath, originalError: nodeError },
						"Ensure the file path is valid and doesn't contain invalid characters",
					);

				default:
					// For custom errors like ECUSTOM, provide more specific handling
					if (nodeError.code === "ECUSTOM") {
						return new MarkdownError(
							"file_read" as MarkdownErrorType,
							`Failed to read markdown file: ${filePath}`,
							{
								filePath,
								code: nodeError.code,
								originalError: nodeError,
								type: "file_read",
							},
							"Check the file and try again",
						);
					}

					return new MarkdownError(
						MarkdownErrorType.INVALID_CONTENT,
						`File operation failed: ${nodeError.message}`,
						{
							filePath,
							code: nodeError.code,
							originalError: nodeError,
						},
						"Check the file and try again",
					);
			}
		}

		return new MarkdownError(
			MarkdownErrorType.INVALID_CONTENT,
			`Unknown file error: ${error}`,
			{ filePath, originalError: String(error) },
		);
	}

	/**
	 * Handle embed validation errors
	 */
	handleEmbedError(error: EmbedError, content: string): MarkdownError {
		const lines = content.split("\n");
		const contextLine = lines[error.line - 1] || "";

		return new MarkdownError(
			MarkdownErrorType.EMBED_ERROR,
			error.message,
			{
				type: error.type,
				line: error.line,
				column: error.column,
				contextLine,
				suggestion: error.suggestion,
			},
			error.suggestion,
		);
	}

	/**
	 * Get user-friendly error message
	 */
	getUserFriendlyMessage(error: MarkdownError): string {
		if (!this.options.showUserFriendlyMessages) {
			return error.message;
		}

		switch (error.type) {
			case MarkdownErrorType.FILE_NOT_FOUND:
				return "The content file could not be found. It may have been moved or deleted.";

			case MarkdownErrorType.PERMISSION_DENIED:
				return "Unable to access the content file due to permission restrictions.";

			case MarkdownErrorType.DISK_FULL:
				return "Unable to save content due to insufficient disk space.";

			case MarkdownErrorType.INVALID_PATH:
				return "The file path is invalid or contains unsupported characters.";

			case MarkdownErrorType.EMBED_ERROR:
				return "There's an issue with embedded content in your markdown.";

			case MarkdownErrorType.MIGRATION_ERROR:
				return "Failed to migrate content to the new format.";

			case MarkdownErrorType.VALIDATION_ERROR:
				return "The content contains validation errors that need to be fixed.";

			default:
				return "An unexpected error occurred while processing the content.";
		}
	}

	/**
	 * Log error with appropriate level
	 */
	logError(error: MarkdownError): void {
		if (!this.options.logErrors) {
			return;
		}

		const logData = {
			type: error.type,
			message: error.message,
			details: error.details,
			suggestion: error.suggestion,
			timestamp: new Date().toISOString(),
		};

		if (this.options.includeStackTrace) {
			(logData as Record<string, unknown>).stack = error.stack;
		}

		// Use appropriate log level based on error type
		switch (error.type) {
			case MarkdownErrorType.FILE_NOT_FOUND:
			case MarkdownErrorType.EMBED_ERROR:
				console.warn("Markdown Warning:", logData);
				break;

			case MarkdownErrorType.PERMISSION_DENIED:
			case MarkdownErrorType.DISK_FULL:
			case MarkdownErrorType.MIGRATION_ERROR:
				console.error("Markdown Error:", logData);
				break;

			default:
				console.info("Markdown Info:", logData);
		}
	}
}

/**
 * Embed Reference Validator
 * Validates embed syntax and references in markdown content
 */
export class EmbedValidator {
	private readonly embedPatterns = {
		image: /!\[image:(\d+)(?:\s+"([^"]*)")?\]/g,
		video: /!\[video:(\d+)(?:\s+"([^"]*)")?\]/g,
		link: /\[link:(\d+)(?:\s+"([^"]*)")?\]/g,
		iframe: /<iframe[^>]*src="([^"]*)"[^>]*>/gi,
	};

	/**
	 * Validate all embed references in content
	 */
	validateEmbeds(
		content: string,
		mediaData: {
			images: string[];
			videos: Array<{ url: string; title?: string }>;
			externalLinks: Array<{ url: string; title: string }>;
		},
	): ValidationResult {
		const errors: EmbedError[] = [];
		const warnings: string[] = [];

		// Validate image embeds
		this.validateImageEmbeds(content, mediaData.images, errors);

		// Validate video embeds
		this.validateVideoEmbeds(content, mediaData.videos, errors);

		// Validate link embeds
		this.validateLinkEmbeds(content, mediaData.externalLinks, errors);

		// Validate iframe embeds
		this.validateIframeEmbeds(content, warnings);

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		};
	}

	/**
	 * Validate image embed references
	 */
	private validateImageEmbeds(
		content: string,
		images: string[],
		errors: EmbedError[],
	): void {
		const lines = content.split("\n");

		lines.forEach((line, currentLineIndex) => {
			const lineNum = currentLineIndex + 1;
			this.embedPatterns.image.lastIndex = 0; // Reset regex

			for (const match of line.matchAll(this.embedPatterns.image)) {
				const index = parseInt(match[1] as string, 10);
				const column = (match.index as number) ?? 0;

				if (index >= images.length) {
					errors.push({
						type: "INVALID_INDEX",
						line: lineNum,
						column: column + 1,
						message: `Image index ${index} is out of range. Available images: 0-${images.length - 1}`,
						suggestion: `Use an index between 0 and ${images.length - 1}, or add more images to your content`,
						severity: "error",
						embedType: "image",
						embedIndex: index,
					});
				}

				if (index < 0) {
					errors.push({
						type: "INVALID_INDEX",
						line: lineNum,
						column: column + 1,
						message: `Image index ${index} cannot be negative`,
						suggestion: "Use a positive index starting from 0",
						severity: "error",
						embedType: "image",
						embedIndex: index,
					});
				}
			}
		});
	}

	/**
	 * Validate video embed references
	 */
	private validateVideoEmbeds(
		content: string,
		videos: Array<{ url: string; title?: string }>,
		errors: EmbedError[],
	): void {
		const lines = content.split("\n");

		lines.forEach((line, currentLineIndex) => {
			const lineNum = currentLineIndex + 1;
			this.embedPatterns.video.lastIndex = 0; // Reset regex

			for (const match of line.matchAll(this.embedPatterns.video)) {
				const index = parseInt(match[1] as string, 10);
				const column = (match.index as number) ?? 0;

				if (index >= videos.length) {
					errors.push({
						type: "INVALID_INDEX",
						line: lineNum,
						column: column + 1,
						message: `Video index ${index} is out of range. Available videos: 0-${videos.length - 1}`,
						suggestion: `Use an index between 0 and ${videos.length - 1}, or add more videos to your content`,
						severity: "error",
						embedType: "video",
						embedIndex: index,
					});
				}

				if (index < 0) {
					errors.push({
						type: "INVALID_INDEX",
						line: lineNum,
						column: column + 1,
						message: `Video index ${index} cannot be negative`,
						suggestion: "Use a positive index starting from 0",
						severity: "error",
						embedType: "video",
						embedIndex: index,
					});
				}
			}
		});
	}

	/**
	 * Validate link embed references
	 */
	private validateLinkEmbeds(
		content: string,
		links: Array<{ url: string; title: string }>,
		errors: EmbedError[],
	): void {
		const lines = content.split("\n");

		lines.forEach((line, currentLineIndex) => {
			const lineNum = currentLineIndex + 1;
			this.embedPatterns.link.lastIndex = 0; // Reset regex

			for (const match of line.matchAll(this.embedPatterns.link)) {
				const index = parseInt(match[1] as string, 10);
				const column = (match.index as number) ?? 0;

				if (index >= links.length) {
					errors.push({
						type: "INVALID_INDEX",
						line: lineNum,
						column: column + 1,
						message: `Link index ${index} is out of range. Available links: 0-${links.length - 1}`,
						suggestion: `Use an index between 0 and ${links.length - 1}, or add more links to your content`,
						severity: "error",
						embedType: "link",
						embedIndex: index,
					});
				}

				if (index < 0) {
					errors.push({
						type: "INVALID_INDEX",
						line: lineNum,
						column: column + 1,
						message: `Link index ${index} cannot be negative`,
						suggestion: "Use a positive index starting from 0",
						severity: "error",
						embedType: "link",
						embedIndex: index,
					});
				}
			}
		});
	}

	/**
	 * Validate iframe embeds for security
	 */
	private validateIframeEmbeds(content: string, warnings: string[]): void {
		const lines = content.split("\n");

		lines.forEach((line, currentLineIndex) => {
			const lineNum = currentLineIndex + 1;
			this.embedPatterns.iframe.lastIndex = 0; // Reset regex

			for (const match of line.matchAll(this.embedPatterns.iframe)) {
				const src = match[1] as string;

				// Check for potentially unsafe sources
				if (!this.isAllowedIframeSrc(src)) {
					warnings.push(
						`Line ${lineNum}: Iframe source "${src}" may not be safe. Consider using trusted domains only.`,
					);
				}
			}
		});
	}

	/**
	 * Check if iframe source is from allowed domains
	 */
	private isAllowedIframeSrc(src: string): boolean {
		const allowedDomains = [
			"youtube.com",
			"youtu.be",
			"vimeo.com",
			"codepen.io",
			"codesandbox.io",
			"github.com",
			"gist.github.com",
		];

		try {
			const url = new URL(src);
			return allowedDomains.some(
				(domain) =>
					url.hostname === domain || url.hostname.endsWith(`.${domain}`),
			);
		} catch {
			return false; // Invalid URL
		}
	}

	/**
	 * Extract all embed references from content
	 */
	extractEmbedReferences(content: string): EmbedReference[] {
		const references: EmbedReference[] = [];
		const lines = content.split("\n");

		lines.forEach((line) => {
			// Extract image references
			this.embedPatterns.image.lastIndex = 0;
			for (const match of line.matchAll(this.embedPatterns.image)) {
				references.push({
					type: "image",
					index: parseInt(match[1] as string, 10),
					altText: match[2] as string | undefined,
					originalMatch: match[0] as string,
					startPos: (match.index as number) || 0,
					endPos:
						((match.index as number) || 0) +
						((match[0] as string)?.length || 0),
				});
			}

			// Extract video references
			this.embedPatterns.video.lastIndex = 0;
			for (const match of line.matchAll(this.embedPatterns.video)) {
				references.push({
					type: "video",
					index: parseInt(match[1] as string, 10),
					altText: match[2] as string | undefined,
					originalMatch: match[0] as string,
					startPos: (match.index as number) || 0,
					endPos:
						((match.index as number) || 0) +
						((match[0] as string)?.length || 0),
				});
			}

			// Extract link references
			this.embedPatterns.link.lastIndex = 0;
			for (const match of line.matchAll(this.embedPatterns.link)) {
				references.push({
					type: "link",
					index: parseInt(match[1] as string, 10),
					customText: match[2] as string | undefined,
					originalMatch: match[0] as string,
					startPos: (match.index as number) || 0,
					endPos:
						((match.index as number) || 0) +
						((match[0] as string)?.length || 0),
				});
			}
		});

		return references;
	}
}

/**
 * File Integrity Checker
 * Checks markdown file integrity and provides recovery mechanisms
 */
export class FileIntegrityChecker {
	/**
	 * Check file integrity using checksum
	 */
	async checkFileIntegrity(
		filePath: string,
		expectedChecksum?: string,
	): Promise<{
		isValid: boolean;
		currentChecksum: string;
		error?: string;
	}> {
		try {
			const crypto = await import("node:crypto");
			const fs = await import("node:fs/promises");

			const content = await fs.readFile(filePath, "utf8");
			const currentChecksum = crypto
				.createHash("md5")
				.update(content)
				.digest("hex");

			return {
				isValid: !expectedChecksum || currentChecksum === expectedChecksum,
				currentChecksum,
			};
		} catch (error) {
			return {
				isValid: false,
				currentChecksum: "",
				error: `Failed to check file integrity: ${error}`,
			};
		}
	}

	/**
	 * Attempt to recover corrupted markdown file
	 */
	async attemptRecovery(
		filePath: string,
		backupContent?: string,
	): Promise<{
		recovered: boolean;
		method?: string;
		error?: string;
	}> {
		try {
			const fs = await import("node:fs/promises");

			// Try to recover from backup content
			if (backupContent) {
				await fs.writeFile(filePath, backupContent, "utf8");
				return {
					recovered: true,
					method: "backup_content",
				};
			}

			// Try to recover from backup file
			const backupPath = `${filePath}.backup`;
			try {
				const backupFileContent = await fs.readFile(backupPath, "utf8");
				await fs.writeFile(filePath, backupFileContent, "utf8");
				return {
					recovered: true,
					method: "backup_file",
				};
			} catch {
				// Backup file doesn't exist or is corrupted
			}

			// Create empty file as last resort
			await fs.writeFile(filePath, "", "utf8");
			return {
				recovered: true,
				method: "empty_file",
			};
		} catch (error) {
			return {
				recovered: false,
				error: `Recovery failed: ${error}`,
			};
		}
	}
}

// Default instances
export const markdownErrorHandler = new MarkdownErrorHandler();
export const embedValidator = new EmbedValidator();
export const fileIntegrityChecker = new FileIntegrityChecker();

// Utility functions
export const handleFileError = (error: unknown, filePath: string) =>
	markdownErrorHandler.handleFileError(error, filePath);

export const validateEmbeds = (
	content: string,
	mediaData: {
		images: string[];
		videos: Array<{ url: string; title?: string }>;
		externalLinks: Array<{ url: string; title: string }>;
	},
) => embedValidator.validateEmbeds(content, mediaData);

export const checkFileIntegrity = (
	filePath: string,
	expectedChecksum?: string,
) => fileIntegrityChecker.checkFileIntegrity(filePath, expectedChecksum);
