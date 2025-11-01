/**
 * Enhanced File Upload Manager for Portfolio Content Data Enhancement
 * Provides advanced file upload functionality with optimization and metadata management
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join } from "node:path";
import sharp from "sharp";
import type {
	EnhancedFileUploadOptions,
	FileMetadata,
	FileUploadResult,
} from "@/types";

/**
 * Enhanced File Upload Manager Class
 * Handles file uploads with advanced options including skip processing,
 * original file preservation, and multiple variant generation
 */
export class EnhancedFileUploadManager {
	private readonly baseUploadDir: string;
	private readonly allowedImageTypes = [
		"image/jpeg",
		"image/jpg",
		"image/png",
		"image/gif",
		"image/webp",
		"image/svg+xml",
	];
	private readonly allowedDownloadTypes = [
		...this.allowedImageTypes,
		"application/pdf",
		"application/zip",
		"application/x-zip-compressed",
		"text/plain",
		"application/json",
	];
	private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
	private readonly maxImageSize = 10 * 1024 * 1024; // 10MB for images

	constructor(baseUploadDir?: string) {
		this.baseUploadDir = baseUploadDir || join(process.cwd(), "public");
	}

	/**
	 * Upload file with enhanced options
	 */
	async uploadFile(
		file: File,
		options: EnhancedFileUploadOptions = {},
		uploadType?: string,
	): Promise<FileUploadResult> {
		// Validate file
		const validation = this.validateFile(file, uploadType);
		if (!validation.valid) {
			throw new Error(validation.error);
		}

		// Convert file to buffer
		const buffer = await this.fileToBuffer(file);

		// Get upload directory
		const uploadDir = this.getUploadDirectory(uploadType);
		await this.ensureDirectoryExists(uploadDir);

		// Check for duplicates if not skipping processing
		if (!options.skipProcessing) {
			const existingFileUrl = await this.checkForDuplicate(buffer, uploadDir);
			if (existingFileUrl) {
				return {
					metadata: await this.createFileMetadata(file, buffer),
					originalUrl: existingFileUrl,
					isDuplicate: true,
				};
			}
		}

		// Generate unique filename
		const uniqueFilename = this.generateUniqueFilename(file.name);
		const filePath = join(uploadDir, uniqueFilename);

		// Save file to disk
		await writeFile(filePath, buffer);

		// Record file hash for duplicate detection
		if (!options.skipProcessing) {
			const publicUrl = this.getPublicUrl(filePath);
			await this.recordFileHash(buffer, uploadDir, publicUrl);
		}

		// Process file with enhanced options
		return await this.processFileWithOptions(buffer, filePath, file, options);
	}

	/**
	 * Process multiple files
	 */
	async uploadFiles(
		files: File[],
		options: EnhancedFileUploadOptions = {},
		uploadType?: string,
	): Promise<FileUploadResult[]> {
		const results: FileUploadResult[] = [];

		for (const file of files) {
			try {
				const result = await this.uploadFile(file, options, uploadType);
				results.push(result);
			} catch (error) {
				console.error(`Failed to upload file ${file.name}:`, error);
				results.push({
					metadata: await this.createFileMetadata(file, Buffer.from([])),
					error: error instanceof Error ? error.message : "Upload failed",
				});
			}
		}

		return results;
	}

	/**
	 * Delete uploaded file
	 */
	async deleteFile(fileUrl: string): Promise<boolean> {
		try {
			const filePath = join(this.baseUploadDir, fileUrl);
			await unlink(filePath);

			// Also try to delete related files (thumbnail, variants)
			await this.deleteRelatedFiles(filePath);

			return true;
		} catch (error) {
			console.error("Failed to delete file:", error);
			return false;
		}
	}

	/**
	 * Get upload directory based on file type
	 */
	private getUploadDirectory(type?: string): string {
		switch (type) {
			case "download":
				return join(this.baseUploadDir, "downloads");
			case "video":
				return join(this.baseUploadDir, "videos");
			case "thumbnail":
				return join(this.baseUploadDir, "images", "thumbnails");
			case "og-image":
				return join(this.baseUploadDir, "images", "og-images");
			case "profile":
				return join(this.baseUploadDir, "images", "profile");
			default:
				return join(this.baseUploadDir, "images", "portfolio");
		}
	}

	/**
	 * Generate unique filename with enhanced sanitization
	 */
	private generateUniqueFilename(originalName: string): string {
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2, 8);
		const extension = extname(originalName);
		const baseName = basename(originalName, extension);

		// Enhanced sanitization
		const sanitizedBaseName = this.sanitizeFileName(baseName)
			.replace(/[^a-zA-Z0-9\-_]/g, "-")
			.replace(/-+/g, "-")
			.substring(0, 50);

		return `${sanitizedBaseName}-${timestamp}-${random}${extension}`;
	}

	/**
	 * Sanitize file name for security
	 */
	private sanitizeFileName(fileName: string): string {
		// Remove path traversal attempts
		const baseName = basename(fileName);

		// Replace dangerous characters
		return baseName
			.replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
			.replace(/^\.+/, "") // Remove leading dots
			.replace(/\.+$/, "") // Remove trailing dots
			.replace(/-+/g, "-") // Collapse multiple dashes
			.substring(0, 100); // Limit length
	}

	/**
	 * Enhanced file validation with security checks
	 */
	private validateFile(
		file: File,
		type?: string,
	): { valid: boolean; error?: string } {
		const maxSize = type === "download" ? this.maxFileSize : this.maxImageSize;

		// File size validation
		if (file.size > maxSize) {
			return {
				valid: false,
				error: `File size exceeds limit (${maxSize / 1024 / 1024}MB)`,
			};
		}

		// Minimum file size check (prevent empty files)
		if (file.size < 10) {
			return {
				valid: false,
				error: "File is too small or empty",
			};
		}

		// File name validation
		const fileName = file.name;
		if (!fileName || fileName.length > 255) {
			return {
				valid: false,
				error: "Invalid file name",
			};
		}

		// Check for dangerous file extensions
		const dangerousExtensions = [
			".exe",
			".bat",
			".cmd",
			".com",
			".pif",
			".scr",
			".vbs",
			".js",
			".jar",
			".php",
			".asp",
			".aspx",
			".jsp",
			".py",
			".rb",
			".pl",
			".sh",
		];

		const extension = extname(fileName).toLowerCase();
		if (dangerousExtensions.includes(extension)) {
			return {
				valid: false,
				error: "File type not allowed for security reasons",
			};
		}

		// MIME type validation
		const allowedTypes =
			type === "download" ? this.allowedDownloadTypes : this.allowedImageTypes;
		if (!allowedTypes.includes(file.type)) {
			return {
				valid: false,
				error: `File type not allowed for ${type || "image"} uploads`,
			};
		}

		return { valid: true };
	}

	/**
	 * Process file with enhanced options
	 */
	private async processFileWithOptions(
		buffer: Buffer,
		filePath: string,
		file: File,
		options: EnhancedFileUploadOptions = {},
	): Promise<FileUploadResult> {
		const publicUrl = this.getPublicUrl(filePath);
		const metadata = await this.createFileMetadata(file, buffer);

		const result: FileUploadResult = { metadata };

		// Handle skipProcessing option
		if (options.skipProcessing) {
			result.originalUrl = publicUrl;
			return result;
		}

		// Handle preserveOriginal option
		if (options.preserveOriginal) {
			result.originalUrl = publicUrl;
		}

		// Process image if it's an image file
		if (file.type.startsWith("image/")) {
			const processedResult = await this.processImageWithEnhancedOptions(
				buffer,
				filePath,
				options,
			);

			if (processedResult.processedUrl) {
				result.processedUrl = processedResult.processedUrl;
			}

			if (processedResult.thumbnailUrl) {
				result.thumbnailUrl = processedResult.thumbnailUrl;
			}

			if (processedResult.variants) {
				result.variants = processedResult.variants;
			}
		}

		// If no processed version was created, use original as processed
		if (!result.processedUrl && !options.skipProcessing) {
			result.processedUrl = publicUrl;
		}

		return result;
	}

	/**
	 * Enhanced image processing with custom options
	 */
	private async processImageWithEnhancedOptions(
		buffer: Buffer,
		originalPath: string,
		options: EnhancedFileUploadOptions,
	): Promise<{
		processedUrl?: string;
		thumbnailUrl?: string;
		variants?: { [key: string]: string };
	}> {
		const results: {
			processedUrl?: string;
			thumbnailUrl?: string;
			variants?: { [key: string]: string };
		} = {};

		const baseName = basename(originalPath, extname(originalPath));
		const baseDir = dirname(originalPath);

		try {
			// Generate thumbnail (always generate unless skipProcessing is true)
			if (!options.skipProcessing) {
				const thumbnailPath = join(
					baseDir,
					"..",
					"thumbnails",
					`${baseName}-thumb.jpg`,
				);
				await this.ensureDirectoryExists(dirname(thumbnailPath));
				await this.generateThumbnailFromBuffer(buffer, thumbnailPath, 300);
				results.thumbnailUrl = this.getPublicUrl(thumbnailPath);
			}

			// Handle custom processing options
			if (options.customProcessing) {
				const { resize, format, watermark } = options.customProcessing;

				// Create processed version with custom options
				const processedPath = join(
					baseDir,
					`${baseName}-processed.${format || "jpg"}`,
				);
				await this.processImageWithCustomOptions(buffer, processedPath, {
					resize,
					format: format || "jpeg",
					watermark,
					quality: 85,
				});

				results.processedUrl = this.getPublicUrl(processedPath);
			}

			// Generate variants if requested
			if (options.generateVariants) {
				const variants: { [key: string]: string } = {};
				const variantSizes = [
					{ name: "small", width: 400, height: 300 },
					{ name: "medium", width: 800, height: 600 },
					{ name: "large", width: 1200, height: 900 },
				];

				for (const size of variantSizes) {
					const variantPath = join(baseDir, `${baseName}-${size.name}.jpg`);
					await this.processImageWithCustomOptions(buffer, variantPath, {
						resize: { width: size.width, height: size.height },
						format: "jpeg",
						quality: 80,
					});

					variants[size.name] = this.getPublicUrl(variantPath);
				}

				results.variants = variants;
			}
		} catch (error) {
			console.error("Enhanced image processing failed:", error);
		}

		return results;
	}

	/**
	 * Generate thumbnail from buffer
	 */
	private async generateThumbnailFromBuffer(
		buffer: Buffer,
		outputPath: string,
		size: number = 300,
	): Promise<void> {
		try {
			await sharp(buffer)
				.resize(size, size, {
					fit: "inside",
					withoutEnlargement: true,
				})
				.jpeg({ quality: 80 })
				.toFile(outputPath);
		} catch (error) {
			console.error("Thumbnail generation from buffer failed:", error);
			throw error;
		}
	}

	/**
	 * Process image with custom options
	 */
	private async processImageWithCustomOptions(
		buffer: Buffer,
		outputPath: string,
		options: {
			resize?: { width: number; height: number };
			format?: "jpeg" | "png" | "webp";
			quality?: number;
			watermark?: boolean;
		},
	): Promise<void> {
		try {
			let pipeline = sharp(buffer);

			// Apply resize if specified
			if (options.resize) {
				pipeline = pipeline.resize(
					options.resize.width,
					options.resize.height,
					{
						fit: "inside",
						withoutEnlargement: true,
					},
				);
			}

			// Apply watermark if requested (placeholder implementation)
			if (options.watermark) {
				// TODO: Implement watermark functionality
				console.log("Watermark requested but not implemented yet");
			}

			// Apply format and quality
			switch (options.format) {
				case "jpeg":
					pipeline = pipeline.jpeg({ quality: options.quality || 85 });
					break;
				case "png":
					pipeline = pipeline.png({ quality: options.quality || 85 });
					break;
				case "webp":
					pipeline = pipeline.webp({ quality: options.quality || 85 });
					break;
			}

			await pipeline.toFile(outputPath);
		} catch (error) {
			console.error("Custom image processing failed:", error);
			throw error;
		}
	}

	/**
	 * Calculate file hash for duplicate detection
	 */
	private async calculateFileHash(buffer: Buffer): Promise<string> {
		return createHash("sha256").update(buffer).digest("hex");
	}

	/**
	 * Check for duplicate files
	 */
	private async checkForDuplicate(
		buffer: Buffer,
		uploadDir: string,
	): Promise<string | null> {
		const fileHash = await this.calculateFileHash(buffer);
		const hashFilePath = join(uploadDir, ".file-hashes.json");

		try {
			const hashData = await readFile(hashFilePath, "utf-8");
			const hashes = JSON.parse(hashData);

			if (hashes[fileHash]) {
				// Check if the file still exists
				const existingFilePath = join(this.baseUploadDir, hashes[fileHash]);
				try {
					await stat(existingFilePath);
					return hashes[fileHash]; // Return existing file URL
				} catch {
					// File doesn't exist anymore, remove from hash record
					delete hashes[fileHash];
					await writeFile(hashFilePath, JSON.stringify(hashes, null, 2));
				}
			}
		} catch {
			// Hash file doesn't exist, create empty one
			await writeFile(hashFilePath, "{}");
		}

		return null;
	}

	/**
	 * Record file hash
	 */
	private async recordFileHash(
		buffer: Buffer,
		uploadDir: string,
		publicUrl: string,
	): Promise<void> {
		const fileHash = await this.calculateFileHash(buffer);
		const hashFilePath = join(uploadDir, ".file-hashes.json");

		try {
			const hashData = await readFile(hashFilePath, "utf-8");
			const hashes = JSON.parse(hashData);
			hashes[fileHash] = publicUrl;
			await writeFile(hashFilePath, JSON.stringify(hashes, null, 2));
		} catch {
			const hashes = { [fileHash]: publicUrl };
			await writeFile(hashFilePath, JSON.stringify(hashes, null, 2));
		}
	}

	/**
	 * Create file metadata
	 */
	private async createFileMetadata(
		file: File,
		buffer: Buffer,
	): Promise<FileMetadata> {
		const metadata: FileMetadata = {
			fileName: file.name,
			fileSize: file.size,
			mimeType: file.type,
			uploadedAt: new Date().toISOString(),
		};

		// Get image dimensions if it's an image
		if (file.type.startsWith("image/") && buffer.length > 0) {
			try {
				const imageInfo = await sharp(buffer).metadata();
				metadata.width = imageInfo.width;
				metadata.height = imageInfo.height;
			} catch (error) {
				console.warn("Failed to get image metadata:", error);
			}
		}

		return metadata;
	}

	/**
	 * Convert File to Buffer
	 */
	private async fileToBuffer(file: File): Promise<Buffer> {
		const arrayBuffer = await file.arrayBuffer();
		return Buffer.from(arrayBuffer);
	}

	/**
	 * Get public URL from file path
	 */
	private getPublicUrl(filePath: string): string {
		const relativePath = filePath
			.replace(this.baseUploadDir, "")
			.replace(/\\/g, "/");
		return relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
	}

	/**
	 * Ensure directory exists
	 */
	private async ensureDirectoryExists(dirPath: string): Promise<void> {
		try {
			await stat(dirPath);
		} catch {
			await mkdir(dirPath, { recursive: true });
		}
	}

	/**
	 * Delete related files (thumbnails, variants)
	 */
	private async deleteRelatedFiles(originalPath: string): Promise<void> {
		const baseName = basename(originalPath, extname(originalPath));
		const baseDir = dirname(originalPath);

		// Try to delete thumbnail
		const thumbnailPath = join(
			baseDir,
			"..",
			"thumbnails",
			`${baseName}-thumb.jpg`,
		);
		try {
			await unlink(thumbnailPath);
		} catch {
			// Thumbnail doesn't exist, that's fine
		}

		// Try to delete variants
		const variantSizes = ["small", "medium", "large"];
		for (const size of variantSizes) {
			const variantPath = join(baseDir, `${baseName}-${size}.jpg`);
			try {
				await unlink(variantPath);
			} catch {
				// Variant doesn't exist, that's fine
			}
		}

		// Try to delete processed version
		const processedPath = join(baseDir, `${baseName}-processed.jpg`);
		try {
			await unlink(processedPath);
		} catch {
			// Processed version doesn't exist, that's fine
		}
	}
}
