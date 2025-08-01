import { EnhancedFileUploadManager } from "@/lib/portfolio/enhanced-file-upload-manager";
import { EnhancedFileUploadOptions } from "@/types";
import console from "console";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
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

    // Initialize enhanced file upload manager
    const uploadManager = new EnhancedFileUploadManager();
    const uploadedFiles: Array<{
      originalName: string;
      filename: string;
      url: string;
      size: number;
      type: string;
      metadata?: Record<string, unknown>;
      originalUrl?: string;
      processedUrl?: string;
      thumbnailUrl?: string;
      variants?: { [key: string]: string };
      isDuplicate?: boolean;
      error?: string;
    }> = [];

    // Process files using enhanced manager
    for (const file of filesToProcess) {
      try {
        // Use enhanced file upload manager
        const result = await uploadManager.uploadFile(
          file,
          enhancedOptions,
          uploadType,
        );

        // Create file info response
        const fileInfo = {
          originalName: file.name,
          filename: result.metadata.fileName,
          url: result.processedUrl || result.originalUrl || "",
          size: result.metadata.fileSize,
          type: result.metadata.mimeType,
          metadata: result.metadata as unknown as Record<string, unknown>,
          ...(result.originalUrl && { originalUrl: result.originalUrl }),
          ...(result.processedUrl && { processedUrl: result.processedUrl }),
          ...(result.thumbnailUrl && { thumbnailUrl: result.thumbnailUrl }),
          ...(result.variants && { variants: result.variants }),
          ...(result.isDuplicate && { isDuplicate: result.isDuplicate }),
          ...(result.error && { error: result.error }),
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
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        uploadedFiles.push({
          originalName: file.name,
          filename: file.name,
          url: "",
          size: file.size,
          type: file.type,
          error: error instanceof Error ? error.message : "Upload failed",
        });
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
    const fileUrls = searchParams.get("urls"); // Support bulk delete

    if (!fileUrl && !fileUrls) {
      return NextResponse.json(
        { error: "File URL or URLs are required" },
        { status: 400 },
      );
    }

    const uploadManager = new EnhancedFileUploadManager();
    const urlsToDelete = fileUrls ? JSON.parse(fileUrls) : [fileUrl];
    const results: { url: string; success: boolean; error?: string }[] = [];

    for (const url of urlsToDelete) {
      try {
        const success = await uploadManager.deleteFile(url);
        results.push({ url, success });
      } catch (error) {
        results.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const allSuccessful = results.every((result) => result.success);
    const successCount = results.filter((result) => result.success).length;

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful
        ? "All files deleted successfully"
        : `${successCount}/${results.length} files deleted successfully`,
      results,
    });
  } catch (error) {
    console.error("Error deleting files:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// PUT method for file management operations (move, rename, etc.)
export async function PUT(request: NextRequest) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { operation, fileUrl, newPath, newName } = body;

    if (!operation || !fileUrl) {
      return NextResponse.json(
        { error: "Operation and file URL are required" },
        { status: 400 },
      );
    }

    const currentFilePath = path.join(process.cwd(), "public", fileUrl);

    switch (operation) {
      case "move":
        if (!newPath) {
          return NextResponse.json(
            { error: "New path is required for move operation" },
            { status: 400 },
          );
        }

        const newFilePath = path.join(process.cwd(), "public", newPath);
        const newDir = path.dirname(newFilePath);

        // Ensure target directory exists
        await ensureDirectoryExists(newDir);

        // Move the file
        await fs.rename(currentFilePath, newFilePath);

        return NextResponse.json({
          success: true,
          message: "File moved successfully",
          newUrl: newPath,
        });

      case "rename":
        if (!newName) {
          return NextResponse.json(
            { error: "New name is required for rename operation" },
            { status: 400 },
          );
        }

        const currentDir = path.dirname(currentFilePath);
        const extension = path.extname(fileUrl);
        const sanitizedName = sanitizeFileName(newName);
        const renamedFilePath = path.join(
          currentDir,
          `${sanitizedName}${extension}`,
        );

        // Rename the file
        await fs.rename(currentFilePath, renamedFilePath);

        const newUrl = path
          .relative(path.join(process.cwd(), "public"), renamedFilePath)
          .replace(/\\/g, "/");

        return NextResponse.json({
          success: true,
          message: "File renamed successfully",
          newUrl: `/${newUrl}`,
        });

      default:
        return NextResponse.json(
          { error: "Unsupported operation" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error in file operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "File operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET method for file information and progress tracking
export async function GET(request: NextRequest) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get("operation");
    const fileUrl = searchParams.get("url");

    switch (operation) {
      case "info":
        if (!fileUrl) {
          return NextResponse.json(
            { error: "File URL is required for info operation" },
            { status: 400 },
          );
        }

        const filePath = path.join(process.cwd(), "public", fileUrl);

        try {
          const stats = await fs.stat(filePath);
          const fileInfo = {
            url: fileUrl,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
          };

          return NextResponse.json({
            success: true,
            fileInfo,
          });
        } catch {
          return NextResponse.json(
            { error: "File not found" },
            { status: 404 },
          );
        }

      case "list":
        const directory = searchParams.get("directory") || "images/portfolio";
        const dirPath = path.join(process.cwd(), "public", directory);

        try {
          const files = await fs.readdir(dirPath, { withFileTypes: true });
          const fileList = await Promise.all(
            files.map(async (file) => {
              const filePath = path.join(dirPath, file.name);
              const stats = await fs.stat(filePath);
              const relativePath = path
                .relative(path.join(process.cwd(), "public"), filePath)
                .replace(/\\/g, "/");

              return {
                name: file.name,
                url: `/${relativePath}`,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isFile: file.isFile(),
                isDirectory: file.isDirectory(),
              };
            }),
          );

          return NextResponse.json({
            success: true,
            directory,
            files: fileList,
          });
        } catch {
          return NextResponse.json(
            { error: "Failed to list directory" },
            { status: 500 },
          );
        }

      default:
        return NextResponse.json(
          { error: "Unsupported operation" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error in GET operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Operation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
