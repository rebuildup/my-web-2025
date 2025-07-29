import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
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

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);

  // Sanitize filename
  const sanitizedBaseName = baseName
    .replace(/[^a-zA-Z0-9\-_]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);

  return `${sanitizedBaseName}-${timestamp}-${random}${extension}`;
}

// Validate file type and size
function validateFile(
  file: File,
  type?: string,
): { valid: boolean; error?: string } {
  const maxSize = type === "download" ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for downloads, 10MB for others

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds limit (${maxSize / 1024 / 1024}MB)`,
    };
  }

  // Check file type for images
  if (type !== "download" && !file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Only image files are allowed for this upload type",
    };
  }

  return { valid: true };
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

    // Parse processing options
    let processingOptions = {};
    if (processingOptionsStr) {
      try {
        processingOptions = JSON.parse(processingOptionsStr);
      } catch (error) {
        console.warn("Failed to parse processing options:", error);
      }
    }

    if (!filesToProcess.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadDir = getUploadDirectory(uploadType);
    await ensureDirectoryExists(uploadDir);

    const uploadedFiles = [];

    for (const file of filesToProcess) {
      // Validate file
      const validation = validateFile(file, uploadType);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Generate unique filename
      const uniqueFilename = generateUniqueFilename(file.name);
      const filePath = path.join(uploadDir, uniqueFilename);

      // Convert file to buffer and save
      const buffer = await fileToBuffer(file);
      await fs.writeFile(filePath, buffer);

      // Generate public URL
      const publicPath = path
        .relative(path.join(process.cwd(), "public"), filePath)
        .replace(/\\/g, "/");

      const publicUrl = `/${publicPath}`;

      const fileInfo: {
        originalName: string;
        filename: string;
        url: string;
        size: number;
        type: string;
        metadata?: Record<string, unknown>;
        versions?: Record<string, string>;
      } = {
        originalName: file.name,
        filename: uniqueFilename,
        url: publicUrl,
        size: file.size,
        type: file.type,
      };

      // Add metadata if provided
      if (metadataStr) {
        try {
          const metadata = JSON.parse(metadataStr);
          fileInfo.metadata = metadata;
        } catch (error) {
          console.warn("Failed to parse metadata:", error);
        }
      }

      // Process images if it's an image file and not a download
      if (uploadType !== "download" && file.type.startsWith("image/")) {
        try {
          console.log("Processing image with Sharp:", filePath);

          // Check if Sharp is available and file exists
          await fs.access(filePath);
          console.log("File exists, proceeding with Sharp processing");

          const versions = await createImageVersions(filePath, filePath, {
            generateThumbnail: true,
            optimizeImage: false, // Temporarily disable optimization
            convertToWebP: false, // Temporarily disable WebP conversion
            quality: 85,
            thumbnailSize: 300,
            ...processingOptions,
          });

          console.log("Image versions created:", versions);
          fileInfo.versions = versions;
        } catch (error) {
          console.error("Failed to generate image versions:", error);
          console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            filePath,
            fileType: file.type,
          });
          // Continue without versions - not critical
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
