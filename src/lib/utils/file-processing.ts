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
    return ffmpegInstance;
  }

  ffmpegInstance = new FFmpeg();

  // Load FFmpeg with CDN URLs
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

  await ffmpegInstance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  isFFmpegLoaded = true;
  return ffmpegInstance;
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
  const ffmpeg = await initializeFFmpeg();
  const inputName = `input.${file.name.split(".").pop()}`;

  // Write input file to FFmpeg filesystem
  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

  const results: {
    original: File;
    thumbnail?: Blob;
    optimized?: Blob;
    webp?: Blob;
  } = { original: file };

  try {
    // Generate thumbnail if requested
    if (options.generateThumbnail) {
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
      results.thumbnail = new Blob([thumbnailData], { type: "image/jpeg" });
    }

    // Generate optimized version if requested
    if (options.optimizeImage) {
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
      results.optimized = new Blob([optimizedData], { type: "image/jpeg" });
    }

    // Convert to WebP if requested
    if (options.convertToWebP) {
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
      results.webp = new Blob([webpData], { type: "image/webp" });
    }
  } catch (error) {
    console.error("FFmpeg processing error:", error);
    throw new Error("Failed to process image with FFmpeg");
  }

  return results;
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
 * Compress file if it exceeds size limit
 */
export async function compressFileIfNeeded(
  file: File,
  maxSize: number = 5 * 1024 * 1024, // 5MB default
): Promise<File> {
  if (file.size <= maxSize) {
    return file;
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File too large and cannot be compressed");
  }

  // Use FFmpeg to compress the image
  const ffmpeg = await initializeFFmpeg();
  const inputName = `input.${file.name.split(".").pop()}`;

  await ffmpeg.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));

  // Calculate compression ratio needed
  const compressionRatio = maxSize / file.size;
  const quality = Math.max(20, Math.floor(compressionRatio * 100));

  await ffmpeg.exec([
    "-i",
    inputName,
    "-q:v",
    quality.toString(),
    "compressed.jpg",
  ]);

  const compressedData = await ffmpeg.readFile("compressed.jpg");
  const compressedBlob = new Blob([compressedData], { type: "image/jpeg" });

  return new File([compressedBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
    type: "image/jpeg",
  });
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
    hash: await calculateFileHash(file),
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
