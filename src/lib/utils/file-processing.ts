/**
 * File Processing Utilities for Admin Panel
 * Handles file validation, processing, and optimization using ffmpeg.wasm and sharp
 */

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

// File type definitions
export interface ProcessedFile {
	originalName: string;
	filename: string;
	url: string;
	size: number;
	type: string;
	width?: number;
	height?: number;
	thumbnailUrl?: string;
	optimizedUrl?: string;
	versions?: FileVersion[];
}

export interface FileVersion {
	type: "thumbnail" | "optimized" | "webp" | "original";
	url: string;
	size: number;
	width?: number;
	height?: number;
}

export interface FileProcessingOptions {
	generateThumbnail?: boolean;
	optimizeImage?: boolean;
	convertToWebP?: boolean;
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	thumbnailSize?: number;
}

// File validation constants
export const FILE_LIMITS = {
	image: {
		maxSize: 10 * 1024 * 1024, // 10MB
		allowedTypes: [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
			"image/svg+xml",
		],
	},
	video: {
		maxSize: 100 * 1024 * 1024, // 100MB
		allowedTypes: ["video/mp4", "video/webm", "video/mov", "video/avi"],
	},
	download: {
		maxSize: 100 * 1024 * 1024, // 100MB
		allowedTypes: [
			"application/zip",
			"application/pdf",
			"application/json",
			"text/plain",
		],
	},
};

// FFmpeg instance management
let ffmpegInstance: FFmpeg | null = null;
let isFFmpegLoaded = false;

/**
 * Initialize FFmpeg instance
 */
export async function initializeFFmpeg(): Promise<FFmpeg> {
	if (ffmpegInstance && isFFmpegLoaded) {
		console.log("FFmpeg already loaded, returning existing instance");
		return ffmpegInstance;
	}

	console.log("Initializing FFmpeg...");
	ffmpegInstance = new FFmpeg();

	// Load FFmpeg with CDN URLs
	const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

	try {
		console.log("Loading FFmpeg core files from CDN...");
		await ffmpegInstance.load({
			coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
			wasmURL: await toBlobURL(
				`${baseURL}/ffmpeg-core.wasm`,
				"application/wasm",
			),
		});

		isFFmpegLoaded = true;
		console.log("FFmpeg loaded successfully");
		return ffmpegInstance;
	} catch (error) {
		console.error("Failed to initialize FFmpeg:", error);
		throw new Error(
			`FFmpeg initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Validate file type and size
 */
export function validateFile(
	file: File,
	category: "image" | "video" | "download" = "image",
): { valid: boolean; error?: string } {
	const limits = FILE_LIMITS[category];

	// Check file size
	if (file.size > limits.maxSize) {
		return {
			valid: false,
			error: `File size exceeds limit (${limits.maxSize / 1024 / 1024}MB)`,
		};
	}

	// Check file type
	if (!limits.allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: `File type ${file.type} is not allowed for ${category} files`,
		};
	}

	return { valid: true };
}

/**
 * Generate unique filename with timestamp and random string
 */
export function generateUniqueFilename(originalName: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 8);
	const extension = originalName.split(".").pop()?.toLowerCase() || "";
	const baseName = originalName.split(".").slice(0, -1).join(".");

	// Sanitize filename
	const sanitizedBaseName = baseName
		.replace(/[^a-zA-Z0-9\-_]/g, "-")
		.replace(/-+/g, "-")
		.substring(0, 50);

	return `${sanitizedBaseName}-${timestamp}-${random}.${extension}`;
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(
	file: File,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({ width: img.width, height: img.height });
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error("Failed to load image"));
		};

		img.src = url;
	});
}

/**
 * Process image file with FFmpeg
 */
export async function processImageWithFFmpeg(
	file: File,
	options: FileProcessingOptions = {},
): Promise<{
	original: Blob;
	thumbnail?: Blob;
	optimized?: Blob;
	webp?: Blob;
}> {
	console.log("Starting FFmpeg image processing for file:", file.name);
	console.log("Processing options:", options);

	try {
		const ffmpeg = await initializeFFmpeg();
		const inputName = `input.${file.name.split(".").pop()}`;

		console.log("Writing file to FFmpeg filesystem:", inputName);
		// Write input file to FFmpeg filesystem
		await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

		const results: {
			original: File;
			thumbnail?: Blob;
			optimized?: Blob;
			webp?: Blob;
		} = { original: file };

		// Generate thumbnail if requested
		if (options.generateThumbnail) {
			console.log("Generating thumbnail...");
			const thumbnailSize = options.thumbnailSize || 300;
			await ffmpeg.exec([
				"-i",
				inputName,
				"-vf",
				`scale=${thumbnailSize}:${thumbnailSize}:force_original_aspect_ratio=decrease`,
				"-q:v",
				"2",
				"thumbnail.jpg",
			]);

			const thumbnailData = await ffmpeg.readFile("thumbnail.jpg");
			const thumbBuffer = (thumbnailData as Uint8Array).slice()
				.buffer as ArrayBuffer;
			results.thumbnail = new Blob([thumbBuffer], { type: "image/jpeg" });
			console.log("Thumbnail generated successfully");
		}

		// Generate optimized version if requested
		if (options.optimizeImage) {
			console.log("Generating optimized version...");
			const quality = options.quality || 85;
			const maxWidth = options.maxWidth || 1920;
			const maxHeight = options.maxHeight || 1080;

			await ffmpeg.exec([
				"-i",
				inputName,
				"-vf",
				`scale='min(${maxWidth},iw)':'min(${maxHeight},ih)':force_original_aspect_ratio=decrease`,
				"-q:v",
				quality.toString(),
				"optimized.jpg",
			]);

			const optimizedData = await ffmpeg.readFile("optimized.jpg");
			const optBuffer = (optimizedData as Uint8Array).slice()
				.buffer as ArrayBuffer;
			results.optimized = new Blob([optBuffer], { type: "image/jpeg" });
			console.log("Optimized version generated successfully");
		}

		// Convert to WebP if requested
		if (options.convertToWebP) {
			console.log("Converting to WebP...");
			const quality = options.quality || 85;

			await ffmpeg.exec([
				"-i",
				inputName,
				"-c:v",
				"libwebp",
				"-quality",
				quality.toString(),
				"output.webp",
			]);

			const webpData = await ffmpeg.readFile("output.webp");
			const webpBuffer = (webpData as Uint8Array).slice().buffer as ArrayBuffer;
			results.webp = new Blob([webpBuffer], { type: "image/webp" });
			console.log("WebP conversion completed successfully");
		}

		console.log("FFmpeg processing completed successfully");
		return results;
	} catch (error) {
		console.error("FFmpeg processing error:", error);
		console.error("Error details:", {
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			fileName: file.name,
			fileSize: file.size,
			fileType: file.type,
		});
		throw new Error(
			`Failed to process image with FFmpeg: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Create file backup with versioning
 */
export function createFileBackup(filename: string): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	const extension = filename.split(".").pop();
	const baseName = filename.split(".").slice(0, -1).join(".");

	return `${baseName}-backup-${timestamp}.${extension}`;
}

/**
 * Organize files into appropriate directories
 */
export function getFileDirectory(type: string, category?: string): string {
	switch (type) {
		case "thumbnail":
			return "images/thumbnails";
		case "og-image":
			return "images/og-images";
		case "profile":
			return "images/profile";
		case "video":
			return "videos";
		case "download":
			return "downloads";
		case "portfolio":
			return "images/portfolio";
		default:
			return category ? `images/${category}` : "images/portfolio";
	}
}

/**
 * Calculate file hash for duplicate detection
 */
export async function calculateFileHash(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Compress file if it exceeds size limit using Canvas API
 */
export async function compressFileIfNeeded(
	file: File,
	maxSize: number = 5 * 1024 * 1024, // 5MB default
): Promise<File> {
	console.log("Checking if file needs compression:", file.size, "vs", maxSize);

	if (file.size <= maxSize) {
		console.log("File size is within limit, no compression needed");
		return file;
	}

	if (!file.type.startsWith("image/")) {
		console.warn("File too large and cannot be compressed (not an image)");
		throw new Error("File too large and cannot be compressed");
	}

	console.log("Compressing image using Canvas API");

	try {
		// Use Canvas API for client-side compression
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();

		return new Promise((resolve, reject) => {
			img.onload = () => {
				// Calculate new dimensions to reduce file size
				const compressionRatio = Math.sqrt(maxSize / file.size);
				const newWidth = Math.floor(img.width * compressionRatio);
				const newHeight = Math.floor(img.height * compressionRatio);

				canvas.width = newWidth;
				canvas.height = newHeight;

				// Draw and compress
				ctx?.drawImage(img, 0, 0, newWidth, newHeight);

				// Calculate quality based on compression needed
				const quality = Math.max(0.3, Math.min(0.9, maxSize / file.size));

				canvas.toBlob(
					(blob) => {
						if (blob) {
							const compressedFile = new File(
								[blob],
								file.name.replace(/\.[^/.]+$/, ".jpg"),
								{
									type: "image/jpeg",
								},
							);
							console.log(
								"Compression successful:",
								file.size,
								"->",
								compressedFile.size,
							);
							resolve(compressedFile);
						} else {
							reject(new Error("Failed to compress image"));
						}
					},
					"image/jpeg",
					quality,
				);
			};

			img.onerror = () => {
				reject(new Error("Failed to load image for compression"));
			};

			img.src = URL.createObjectURL(file);
		});
	} catch (error) {
		console.error("Canvas compression failed:", error);
		throw new Error("Failed to compress image using Canvas API");
	}
}

/**
 * Extract metadata from file
 */
export async function extractFileMetadata(file: File): Promise<{
	name: string;
	size: number;
	type: string;
	lastModified: number;
	dimensions?: { width: number; height: number };
	duration?: number;
	hash: string;
}> {
	console.log("Extracting metadata for file:", file.name);

	// Generate a simple hash based on file properties instead of content
	const simpleHash = `${file.name}-${file.size}-${file.lastModified}`;

	const metadata: {
		name: string;
		size: number;
		type: string;
		lastModified: number;
		dimensions?: { width: number; height: number };
		duration?: number;
		hash: string;
	} = {
		name: file.name,
		size: file.size,
		type: file.type,
		lastModified: file.lastModified,
		hash: simpleHash,
	};

	// Get image dimensions
	if (file.type.startsWith("image/")) {
		try {
			metadata.dimensions = await getImageDimensions(file);
		} catch (error) {
			console.warn("Failed to get image dimensions:", error);
		}
	}

	// Get video duration (placeholder - would need video processing)
	if (file.type.startsWith("video/")) {
		// This would require video processing to get actual duration
		metadata.duration = 0;
	}

	return metadata;
}

/**
 * Clean up temporary files and resources
 */
export function cleanupResources(): void {
	// Clean up FFmpeg instance if needed
	if (ffmpegInstance && isFFmpegLoaded) {
		// FFmpeg cleanup would go here if needed
		console.log("Cleaning up FFmpeg resources");
	}
}
