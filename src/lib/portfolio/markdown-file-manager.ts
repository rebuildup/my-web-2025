/**
 * Markdown File Manager for Portfolio Content Data Enhancement
 * Handles .md file creation, reading, updating, and deletion with security measures
 */

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import { dirname, extname, join, normalize } from "node:path";

/**
 * Interface for markdown file management operations
 */
export interface MarkdownFileManager {
	createMarkdownFile(itemId: string, content: string): Promise<string>;
	updateMarkdownFile(filePath: string, content: string): Promise<void>;
	readMarkdownFile(filePath: string): Promise<string>;
	deleteMarkdownFile(filePath: string): Promise<void>;
	getMarkdownFilePath(itemId: string): string;
	validateMarkdownPath(path: string): boolean;
}

/**
 * Error types for markdown file operations
 */
export interface MarkdownFileError {
	type:
		| "validation"
		| "file_not_found"
		| "permission_denied"
		| "invalid_content"
		| "file_creation"
		| "file_update"
		| "file_read"
		| "file_delete"
		| "directory_read";
	filePath: string;
	message: string;
	originalError?: Error;
}

/**
 * Markdown file metadata
 */
export interface MarkdownFileMetadata {
	filePath: string;
	size: number;
	created: Date;
	modified: Date;
	hash: string;
}

/**
 * Implementation of markdown file management system
 */
export class MarkdownFileManagerImpl implements MarkdownFileManager {
	private readonly baseMarkdownDir: string;
	private readonly maxFileSize: number = 10 * 1024 * 1024; // 10MB
	private readonly allowedBasePath: string;
	private readonly cache = new Map<
		string,
		{ content: string; lastModified: number; hash: string }
	>();

	constructor(baseDir?: string) {
		this.baseMarkdownDir =
			baseDir ||
			join(process.cwd(), "public", "data", "content", "markdown", "portfolio");
		this.allowedBasePath = normalize(this.baseMarkdownDir);
	}

	/**
	 * Create a new markdown file for a portfolio item
	 */
	async createMarkdownFile(itemId: string, content: string): Promise<string> {
		try {
			// Validate input
			this.validateItemId(itemId);
			this.validateContent(content);

			// Generate file path
			const filePath = this.getMarkdownFilePath(itemId);

			// Ensure directory exists
			await this.ensureDirectoryExists(dirname(filePath));

			// Check if file already exists
			const fileExists = await this.fileExists(filePath);
			if (fileExists) {
				throw new Error(`Markdown file already exists for item ${itemId}`);
			}

			// Write file
			await fs.writeFile(filePath, content, "utf-8");

			// Update cache
			const stats = await fs.stat(filePath);
			const hash = this.calculateContentHash(content);
			this.cache.set(filePath, {
				content,
				lastModified: stats.mtimeMs,
				hash,
			});

			return filePath;
		} catch (error) {
			throw this.createMarkdownFileError("file_creation", "", error as Error);
		}
	}

	/**
	 * Update an existing markdown file
	 */
	async updateMarkdownFile(filePath: string, content: string): Promise<void> {
		try {
			// Validate path and content
			if (!this.validateMarkdownPath(filePath)) {
				throw new Error(`Invalid markdown file path: ${filePath}`);
			}
			this.validateContent(content);

			// Check if file exists
			const fileExists = await this.fileExists(filePath);
			if (!fileExists) {
				throw new Error(`Markdown file not found: ${filePath}`);
			}

			// Write updated content
			await fs.writeFile(filePath, content, "utf-8");

			// Update cache
			const stats = await fs.stat(filePath);
			const hash = this.calculateContentHash(content);
			this.cache.set(filePath, {
				content,
				lastModified: stats.mtimeMs,
				hash,
			});
		} catch (error) {
			throw this.createMarkdownFileError(
				"file_update",
				filePath,
				error as Error,
			);
		}
	}

	/**
	 * Read markdown file content with caching
	 */
	async readMarkdownFile(filePath: string): Promise<string> {
		try {
			// Validate path
			if (!this.validateMarkdownPath(filePath)) {
				throw new Error(`Invalid markdown file path: ${filePath}`);
			}

			// Check cache first
			const cached = this.cache.get(filePath);
			if (cached) {
				const stats = await fs.stat(filePath).catch(() => null);
				if (stats && cached.lastModified >= stats.mtimeMs) {
					return cached.content;
				}
			}

			// Read from file
			const content = await fs.readFile(filePath, "utf-8");

			// Update cache
			const stats = await fs.stat(filePath);
			const hash = this.calculateContentHash(content);
			this.cache.set(filePath, {
				content,
				lastModified: stats.mtimeMs,
				hash,
			});

			return content;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				throw this.createMarkdownFileError(
					"file_not_found",
					filePath,
					error as Error,
				);
			}
			throw this.createMarkdownFileError("file_read", filePath, error as Error);
		}
	}

	/**
	 * Delete a markdown file
	 */
	async deleteMarkdownFile(filePath: string): Promise<void> {
		try {
			// Validate path
			if (!this.validateMarkdownPath(filePath)) {
				throw new Error(`Invalid markdown file path: ${filePath}`);
			}

			// Check if file exists
			const fileExists = await this.fileExists(filePath);
			if (!fileExists) {
				throw new Error(`Markdown file not found: ${filePath}`);
			}

			// Delete file
			await fs.unlink(filePath);

			// Remove from cache
			this.cache.delete(filePath);
		} catch (error) {
			throw this.createMarkdownFileError(
				"file_delete",
				filePath,
				error as Error,
			);
		}
	}

	/**
	 * Generate markdown file path for a portfolio item
	 */
	getMarkdownFilePath(itemId: string): string {
		this.validateItemId(itemId);
		const sanitizedId = this.sanitizeFileName(itemId);
		return join(this.baseMarkdownDir, `${sanitizedId}.md`);
	}

	/**
	 * Validate markdown file path for security
	 */
	validateMarkdownPath(path: string): boolean {
		try {
			// Normalize path to prevent path traversal
			const normalizedPath = normalize(path);

			// Check if path is within allowed base directory
			if (!normalizedPath.startsWith(this.allowedBasePath)) {
				return false;
			}

			// Check if path contains path traversal attempts
			if (normalizedPath.includes("..")) {
				return false;
			}

			// Check if file has .md extension
			if (extname(normalizedPath) !== ".md") {
				return false;
			}

			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Get markdown file metadata
	 */
	async getMarkdownFileMetadata(
		filePath: string,
	): Promise<MarkdownFileMetadata> {
		if (!this.validateMarkdownPath(filePath)) {
			throw new Error(`Invalid markdown file path: ${filePath}`);
		}

		const stats = await fs.stat(filePath);
		const content = await this.readMarkdownFile(filePath);
		const hash = this.calculateContentHash(content);

		return {
			filePath,
			size: stats.size,
			created: stats.birthtime,
			modified: stats.mtime,
			hash,
		};
	}

	/**
	 * List all markdown files in the portfolio directory
	 */
	async listMarkdownFiles(): Promise<string[]> {
		try {
			await this.ensureDirectoryExists(this.baseMarkdownDir);
			const files = await fs.readdir(this.baseMarkdownDir);
			return files
				.filter((file) => extname(file) === ".md")
				.map((file) => join(this.baseMarkdownDir, file));
		} catch (error) {
			throw this.createMarkdownFileError(
				"directory_read",
				this.baseMarkdownDir,
				error as Error,
			);
		}
	}

	/**
	 * Clear cache for a specific file or all files
	 */
	clearCache(filePath?: string): void {
		if (filePath) {
			this.cache.delete(filePath);
		} else {
			this.cache.clear();
		}
	}

	/**
	 * Private helper methods
	 */

	private validateItemId(itemId: string): void {
		if (!itemId || typeof itemId !== "string") {
			throw new Error("Item ID must be a non-empty string");
		}

		if (itemId.length > 100) {
			throw new Error("Item ID must be less than 100 characters");
		}

		// Check for dangerous characters
		if (!/^[a-zA-Z0-9_-]+$/.test(itemId)) {
			throw new Error("Item ID contains invalid characters");
		}
	}

	private validateContent(content: string): void {
		if (typeof content !== "string") {
			throw new Error("Content must be a string");
		}

		if (content.length > this.maxFileSize) {
			throw new Error(
				`Content exceeds maximum size of ${this.maxFileSize} bytes`,
			);
		}

		// Basic content validation - check for potentially dangerous content
		const dangerousPatterns = [
			/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
			/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
			/javascript:/gi,
			/data:text\/html/gi,
		];

		for (const pattern of dangerousPatterns) {
			if (pattern.test(content)) {
				throw new Error("Content contains potentially dangerous elements");
			}
		}
	}

	private sanitizeFileName(fileName: string): string {
		return fileName
			.replace(/[^a-zA-Z0-9_-]/g, "_")
			.replace(/_+/g, "_")
			.substring(0, 50);
	}

	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			await fs.access(dirPath);
		} catch {
			await fs.mkdir(dirPath, { recursive: true });
		}
	}

	private async fileExists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	private calculateContentHash(content: string): string {
		return createHash("sha256").update(content, "utf-8").digest("hex");
	}

	private createMarkdownFileError(
		type: MarkdownFileError["type"],
		filePath: string,
		originalError: Error,
	): MarkdownFileError {
		return {
			type,
			filePath,
			message: originalError.message,
			originalError,
		};
	}
}

/**
 * Default instance of markdown file manager
 */
export const markdownFileManager = new MarkdownFileManagerImpl();
