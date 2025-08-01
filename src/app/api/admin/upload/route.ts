import {
  EnhancedFileUploadOptions,
  FileMetadata,
  FileUploadResult,
} from "@/types";
import crypto from "crypto";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import sharp from "sharp";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

// Get upload directory based on file type
function getUploadDirectory(type?: string): string {
  const baseDir = path.join(process.cwd(), "public");

  switch (type) {
    case "download":
      return path.join(baseDir, "downloads");
    case "video":
      return path.join(baseDir, "videos");
    case "thumbnail":
      return path.join(baseDir, "images", "thumbnails");
    case "og-image":
      return path.join(baseDir, "images", "og-images");
    case "profile":
      return path.join(baseDir, "images", "profile");
    default:
      return path.join(baseDir, "images", "portfolio");
  }
}

// Generate unique filename with enhanced sanitization
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);

  // Enhanced sanitization
  const sanitizedBaseName = sanitizeFileName(baseName)
    .replace(/[^a-zA-Z0-9\-_]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);

  return `${sanitizedBaseName}-${timestamp}-${random}${extension}`;
}

// Process file with enhanced options
async function processFileWithOptions(
  buffer: Buffer,
  filePath: string,
  file: File,
  options: EnhancedFileUploadOptions = {},
): Promise<FileUploadResult> {
  const publicPath = path
    .relative(path.join(process.cwd(), "public"), filePath)
    .replace(/\\/g, "/");
  const publicUrl = `/${publicPath}`;

  // Create file metadata
  const metadata: FileMetadata = {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
  };

  // Get image dimensions if it's an image
  if (file.type.startsWith("image/") && !options.skipProcessing) {
    try {
      const imageInfo = await sharp(buffer).metadata();
      metadata.width = imageInfo.width;
      metadata.height = imageInfo.height;
    } catch (error) {
      console.warn("Failed to get image metadata:", error);
    }
  }

  const result: FileUploadResult = {
    metadata,
  };

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
    const processedResult = await processImageWithEnhancedOptions(
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

// Calculate file hash for duplicate detection
async function calculateFileHash(buffer: Buffer): Promise<string> {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// Check for duplicate files
async function checkForDuplicate(
  buffer: Buffer,
  uploadDir: string,
): Promise<string | null> {
  const fileHash = await calculateFileHash(buffer);
  const hashFilePath = path.join(uploadDir, ".file-hashes.json");

  try {
    const hashData = await fs.readFile(hashFilePath, "utf-8");
    const hashes = JSON.parse(hashData);

    if (hashes[fileHash]) {
      // Check if the file still exists
      const existingFilePath = path.join(
        process.cwd(),
        "public",
        hashes[fileHash],
      );
      try {
        await fs.access(existingFilePath);
        return hashes[fileHash]; // Return existing file URL
      } catch {
        // File doesn't exist anymore, remove from hash record
        delete hashes[fileHash];
        await fs.writeFile(hashFilePath, JSON.stringify(hashes, null, 2));
      }
    }
  } catch {
    // Hash file doesn't exist, create empty one
    await fs.writeFile(hashFilePath, "{}");
  }

  return null;
}

// Record file hash
async function recordFileHash(
  buffer: Buffer,
  uploadDir: string,
  publicUrl: string,
): Promise<void> {
  const fileHash = await calculateFileHash(buffer);
  const hashFilePath = path.join(uploadDir, ".file-hashes.json");

  try {
    const hashData = await fs.readFile(hashFilePath, "utf-8");
    const hashes = JSON.parse(hashData);
    hashes[fileHash] = publicUrl;
    await fs.writeFile(hashFilePath, JSON.stringify(hashes, null, 2));
  } catch {
    const hashes = { [fileHash]: publicUrl };
    await fs.writeFile(hashFilePath, JSON.stringify(hashes, null, 2));
  }
}

// Enhanced file validation with security checks
function validateFile(
  file: File,
  type?: string,
  options?: EnhancedFileUploadOptions,
): { valid: boolean; error?: string } {
  const maxSize = type === "download" ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for downloads, 10MB for others

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

  const extension = path.extname(fileName).toLowerCase();
  if (dangerousExtensions.includes(extension)) {
    return {
      valid: false,
      error: "File type not allowed for security reasons",
    };
  }

  // MIME type validation
  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  const allowedDownloadTypes = [
    ...allowedImageTypes,
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "text/plain",
    "application/json",
  ];

  if (type === "download") {
    if (!allowedDownloadTypes.includes(file.type)) {
      return {
        valid: false,
        error: "File type not allowed for downloads",
      };
    }
  } else {
    if (!allowedImageTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Only image files are allowed for this upload type",
      };
    }
  }

  return { valid: true };
}

// Sanitize file name for security
function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  const baseName = path.basename(fileName);

  // Replace dangerous characters
  return baseName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
    .replace(/^\.+/, "") // Remove leading dots
    .replace(/\.+$/, "") // Remove trailing dots
    .replace(/-+/g, "-") // Collapse multiple dashes
    .substring(0, 100); // Limit length
}

// Ensure directory exists
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Convert File to Buffer (for Node.js environment)
async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(request: NextRequest) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const singleFile = formData.get("file") as File;
    const uploadType = formData.get("type") as string;
    const metadataStr = formData.get("metadata") as string;
    const processingOptionsStr = formData.get("processingOptions") as string;

    const filesToProcess = singleFile ? [singleFile] : files;

    // Parse enhanced processing options
    let enhancedOptions: EnhancedFileUploadOptions = {};
    if (processingOptionsStr) {
      try {
        enhancedOptions = JSON.parse(
          processingOptionsStr,
        ) as EnhancedFileUploadOptions;
      } catch (error) {
        console.warn("Failed to parse enhanced processing options:", error);
      }
    }

    if (!filesToProcess.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = getUploadDirectory(uploadType);
    await ensureDirectoryExists(uploadDir);

    const uploadedFiles = [];

    for (const file of filesToProcess) {
      // Enhanced file validation
      const validation = validateFile(file, uploadType, enhancedOptions);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Convert file to buffer
      const buffer = await fileToBuffer(file);

      // Check for duplicate files if not skipping processing
      let existingFileUrl: string | null = null;
      if (!enhancedOptions.skipProcessing) {
        existingFileUrl = await checkForDuplicate(buffer, uploadDir);
        if (existingFileUrl) {
          console.log(
            "Duplicate file found, returning existing URL:",
            existingFileUrl,
          );
          uploadedFiles.push({
            originalName: file.name,
            filename: path.basename(existingFileUrl),
            url: existingFileUrl,
            size: file.size,
            type: file.type,
            isDuplicate: true,
          });
          continue;
        }
      }

      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(file.name);
      const filePath = path.join(uploadDir, uniqueFilename);

      // Save file to disk
      await fs.writeFile(filePath, buffer);

      // Record file hash for duplicate detection
      if (!enhancedOptions.skipProcessing) {
        const publicPath = path
          .relative(path.join(process.cwd(), "public"), filePath)
          .replace(/\\/g, "/");
        const publicUrl = `/${publicPath}`;
        await recordFileHash(buffer, uploadDir, publicUrl);
      }

      // Process file with enhanced options
      const processResult = await processFileWithOptions(
        buffer,
        filePath,
        file,
        enhancedOptions,
      );

      // Create file info response
      const fileInfo = {
        originalName: file.name,
        filename: uniqueFilename,
        url:
          processResult.originalUrl ||
          processResult.processedUrl ||
          `/${path
            .relative(path.join(process.cwd(), "public"), filePath)
            .replace(/\\/g, "/")}`,
        size: file.size,
        type: file.type,
        metadata: processResult.metadata,
        ...(processResult.originalUrl && {
          originalUrl: processResult.originalUrl,
        }),
        ...(processResult.processedUrl && {
          processedUrl: processResult.processedUrl,
        }),
        ...(processResult.thumbnailUrl && {
          thumbnailUrl: processResult.thumbnailUrl,
        }),
        ...(processResult.variants && { variants: processResult.variants }),
      };

      // Add custom metadata if provided
      if (metadataStr) {
        try {
          const customMetadata = JSON.parse(metadataStr);
          fileInfo.metadata = { ...fileInfo.metadata, ...customMetadata };
        } catch (error) {
          console.warn("Failed to parse custom metadata:", error);
        }
      }

      uploadedFiles.push(fileInfo);
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      urls: uploadedFiles.map((f) => f.url), // For backward compatibility
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Generate thumbnail using Sharp
async function generateThumbnail(
  inputPath: string,
  outputPath: string,
  size: number = 300,
): Promise<void> {
  try {
    console.log(`Generating thumbnail: ${inputPath} -> ${outputPath}`);

    // Check if input file exists
    await fs.access(inputPath);

    await sharp(inputPath)
      .resize(size, size, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    console.log(`Thumbnail generated successfully: ${outputPath}`);
  } catch (error) {
    console.error("Thumbnail generation failed:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      inputPath,
      outputPath,
      size,
    });
    throw error;
  }
}

// Optimize image using Sharp
async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    format?: "jpeg" | "png" | "webp";
  } = {},
): Promise<void> {
  try {
    const {
      quality = 85,
      maxWidth = 1920,
      maxHeight = 1080,
      format = "jpeg",
    } = options;

    let pipeline = sharp(inputPath);

    // Resize if dimensions are specified
    if (maxWidth || maxHeight) {
      pipeline = pipeline.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Apply format and quality
    switch (format) {
      case "jpeg":
        pipeline = pipeline.jpeg({ quality });
        break;
      case "png":
        pipeline = pipeline.png({ quality });
        break;
      case "webp":
        pipeline = pipeline.webp({ quality });
        break;
    }

    await pipeline.toFile(outputPath);
    console.log(`Image optimized successfully: ${outputPath}`);
  } catch (error) {
    console.error("Image optimization failed:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      inputPath,
      outputPath,
      options,
    });
    throw error;
  }
}

// Create multiple versions of an image
async function createImageVersions(
  inputPath: string,
  baseOutputPath: string,
  options: {
    generateThumbnail?: boolean;
    optimizeImage?: boolean;
    convertToWebP?: boolean;
    quality?: number;
    thumbnailSize?: number;
  } = {},
): Promise<{
  thumbnail?: string;
  optimized?: string;
  webp?: string;
}> {
  const results: {
    thumbnail?: string;
    optimized?: string;
    webp?: string;
  } = {};
  const baseName = path.parse(baseOutputPath).name;
  const baseDir = path.dirname(baseOutputPath);

  try {
    // Generate thumbnail
    if (options.generateThumbnail) {
      const thumbnailPath = path.join(
        baseDir,
        "..",
        "thumbnails",
        `${baseName}-thumb.jpg`,
      );
      await ensureDirectoryExists(path.dirname(thumbnailPath));
      await generateThumbnail(inputPath, thumbnailPath, options.thumbnailSize);
      results.thumbnail = path
        .relative(path.join(process.cwd(), "public"), thumbnailPath)
        .replace(/\\/g, "/");
    }

    // Generate optimized version
    if (options.optimizeImage) {
      const optimizedPath = path.join(baseDir, `${baseName}-optimized.jpg`);
      await optimizeImage(inputPath, optimizedPath, {
        quality: options.quality,
        format: "jpeg",
      });
      results.optimized = path
        .relative(path.join(process.cwd(), "public"), optimizedPath)
        .replace(/\\/g, "/");
    }

    // Generate WebP version
    if (options.convertToWebP) {
      const webpPath = path.join(baseDir, `${baseName}.webp`);
      await optimizeImage(inputPath, webpPath, {
        quality: options.quality,
        format: "webp",
      });
      results.webp = path
        .relative(path.join(process.cwd(), "public"), webpPath)
        .replace(/\\/g, "/");
    }
  } catch (error) {
    console.error("Some image versions failed to generate:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      inputPath,
      baseOutputPath,
      options,
    });
  }

  return results;
}

// Delete uploaded file
export async function DELETE(request: NextRequest) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const fileUrl = searchParams.get("url");

    if (!fileUrl) {
      return NextResponse.json(
        { error: "File URL is required" },
        { status: 400 },
      );
    }

    // Convert public URL to file path
    const filePath = path.join(process.cwd(), "public", fileUrl);

    // Check if file exists and delete it
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);

      // Also try to delete thumbnail if it exists
      const thumbnailPath = path.join(
        process.cwd(),
        "public",
        "images",
        "thumbnails",
        path.basename(fileUrl),
      );

      try {
        await fs.access(thumbnailPath);
        await fs.unlink(thumbnailPath);
      } catch {
        // Thumbnail doesn't exist, that's fine
      }

      return NextResponse.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
// Enhanced image processing with custom options
async function processImageWithEnhancedOptions(
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

  const baseName = path.parse(originalPath).name;
  const baseDir = path.dirname(originalPath);
  const variants: { [key: string]: string } = {};

  try {
    // Generate thumbnail (always generate unless skipProcessing is true)
    if (!options.skipProcessing) {
      const thumbnailPath = path.join(
        baseDir,
        "..",
        "thumbnails",
        `${baseName}-thumb.jpg`,
      );
      await ensureDirectoryExists(path.dirname(thumbnailPath));
      await generateThumbnailFromBuffer(buffer, thumbnailPath, 300);
      results.thumbnailUrl = `/${path
        .relative(path.join(process.cwd(), "public"), thumbnailPath)
        .replace(/\\/g, "/")}`;
    }

    // Handle custom processing options
    if (options.customProcessing) {
      const { resize, format, watermark } = options.customProcessing;

      // Create processed version with custom options
      const processedPath = path.join(
        baseDir,
        `${baseName}-processed.${format || "jpg"}`,
      );
      await processImageWithCustomOptions(buffer, processedPath, {
        resize,
        format: format || "jpeg",
        watermark,
        quality: 85,
      });

      results.processedUrl = `/${path
        .relative(path.join(process.cwd(), "public"), processedPath)
        .replace(/\\/g, "/")}`;
    }

    // Generate variants if requested
    if (options.generateVariants) {
      const variantSizes = [
        { name: "small", width: 400, height: 300 },
        { name: "medium", width: 800, height: 600 },
        { name: "large", width: 1200, height: 900 },
      ];

      for (const size of variantSizes) {
        const variantPath = path.join(baseDir, `${baseName}-${size.name}.jpg`);
        await processImageWithCustomOptions(buffer, variantPath, {
          resize: { width: size.width, height: size.height },
          format: "jpeg",
          quality: 80,
        });

        variants[size.name] = `/${path
          .relative(path.join(process.cwd(), "public"), variantPath)
          .replace(/\\/g, "/")}`;
      }

      results.variants = variants;
    }
  } catch (error) {
    console.error("Enhanced image processing failed:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      originalPath,
      options,
    });
  }

  return results;
}

// Generate thumbnail from buffer
async function generateThumbnailFromBuffer(
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

// Process image with custom options
async function processImageWithCustomOptions(
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
      pipeline = pipeline.resize(options.resize.width, options.resize.height, {
        fit: "inside",
        withoutEnlargement: true,
      });
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
