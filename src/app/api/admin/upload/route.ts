import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

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

    const filesToProcess = singleFile ? [singleFile] : files;

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

      uploadedFiles.push({
        originalName: file.name,
        filename: uniqueFilename,
        url: publicUrl,
        size: file.size,
        type: file.type,
      });
    }

    // If processing images, generate thumbnails
    if (uploadType !== "download") {
      for (const uploadedFile of uploadedFiles) {
        try {
          await generateThumbnail(uploadedFile.url);
        } catch (error) {
          console.warn("Failed to generate thumbnail:", error);
          // Continue without thumbnail - not critical
        }
      }
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

// Generate thumbnail (placeholder implementation)
async function generateThumbnail(imageUrl: string): Promise<void> {
  // This is a placeholder for thumbnail generation
  // In a real implementation, you would use a library like sharp or ffmpeg.wasm
  // For now, we'll just log that thumbnail generation was requested
  console.log(`Thumbnail generation requested for: ${imageUrl}`);

  // TODO: Implement actual thumbnail generation with sharp or ffmpeg.wasm
  // const sharp = require('sharp');
  // const inputPath = path.join(process.cwd(), 'public', imageUrl);
  // const thumbnailPath = path.join(process.cwd(), 'public', 'images', 'thumbnails', path.basename(imageUrl));
  // await sharp(inputPath).resize(300, 300).jpeg({ quality: 80 }).toFile(thumbnailPath);
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
