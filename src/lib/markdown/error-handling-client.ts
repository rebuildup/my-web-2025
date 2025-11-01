/**
 * Client-Safe Markdown Error Handling
 * Error handling functionality that can be used in client components
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
	public readonly type: MarkdownErrorType;
	public readonly details?: Record<string, unknown>;
	public readonly suggestion?: string;

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
	 * Handle file operation errors (client-safe version)
	 */
	handleFileError(error: unknown, filePath: string): MarkdownError {
		if (error instanceof Error) {
			// Handle fetch errors (common in client-side)
			if (
				error.message.includes("404") ||
				error.message.includes("Not Found")
			) {
				return new MarkdownError(
					MarkdownErrorType.FILE_NOT_FOUND,
					`Markdown file not found: ${filePath}`,
					{ filePath, originalError: error.message },
					"Check if the file path is correct and the file exists",
				);
			}

			if (
				error.message.includes("403") ||
				error.message.includes("Forbidden")
			) {
				return new MarkdownError(
					MarkdownErrorType.PERMISSION_DENIED,
					`Permission denied accessing file: ${filePath}`,
					{ filePath, originalError: error.message },
					"Check file permissions and server configuration",
				);
			}

			return new MarkdownError(
				MarkdownErrorType.INVALID_CONTENT,
				`File operation failed: ${error.message}`,
				{ filePath, originalError: error.message },
				"Check the file and try again",
			);
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
 * Embed Reference Validator (Client-Safe)
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

// Default instances
export const markdownErrorHandler = new MarkdownErrorHandler();
export const embedValidator = new EmbedValidator();

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
