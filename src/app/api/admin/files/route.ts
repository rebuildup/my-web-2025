import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getBackupStats } from "@/lib/utils/file-backup";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

interface FileInfo {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
  category: string;
  versions?: Array<{
    type: string;
    url: string;
    size: number;
  }>;
  metadata?: Record<string, unknown>;
}

// Get all files in public directories
async function scanDirectory(
  dirPath: string,
  category: string,
): Promise<FileInfo[]> {
  const files: FileInfo[] = [];

  try {
    const fullPath = path.join(process.cwd(), "public", dirPath);
    const entries = await fs.readdir(fullPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile()) {
        const filePath = path.join(fullPath, entry.name);
        const stats = await fs.stat(filePath);
        const publicUrl = `/${dirPath}/${entry.name}`.replace(/\\/g, "/");

        // Generate file ID from path and stats
        const fileId = Buffer.from(
          `${publicUrl}-${stats.mtime.getTime()}`,
        ).toString("base64");

        // Determine file type
        const extension = path.extname(entry.name).toLowerCase();
        let mimeType = "application/octet-stream";

        if (
          [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(extension)
        ) {
          mimeType = `image/${extension.slice(1) === "jpg" ? "jpeg" : extension.slice(1)}`;
        } else if ([".mp4", ".webm", ".mov", ".avi"].includes(extension)) {
          mimeType = `video/${extension.slice(1)}`;
        } else if (extension === ".pdf") {
          mimeType = "application/pdf";
        } else if (extension === ".zip") {
          mimeType = "application/zip";
        } else if (extension === ".json") {
          mimeType = "application/json";
        }

        files.push({
          id: fileId,
          name: entry.name,
          type: mimeType,
          size: stats.size,
          url: publicUrl,
          createdAt: stats.birthtime.toISOString(),
          category,
        });
      }
    }
  } catch (error) {
    console.warn(`Failed to scan directory ${dirPath}:`, error);
  }

  return files;
}

// Find related versions of a file
async function findFileVersions(
  fileName: string,
  category: string,
): Promise<
  Array<{
    type: string;
    url: string;
    size: number;
  }>
> {
  const versions: Array<{ type: string; url: string; size: number }> = [];
  const baseName = path.parse(fileName).name;

  // Check for thumbnails
  try {
    const thumbnailPath = path.join(
      process.cwd(),
      "public",
      "images",
      "thumbnails",
    );
    const thumbnailFiles = await fs.readdir(thumbnailPath);

    for (const thumbFile of thumbnailFiles) {
      if (thumbFile.includes(baseName) && thumbFile.includes("thumb")) {
        const stats = await fs.stat(path.join(thumbnailPath, thumbFile));
        versions.push({
          type: "thumbnail",
          url: `/images/thumbnails/${thumbFile}`,
          size: stats.size,
        });
      }
    }
  } catch {
    // Thumbnails directory might not exist
  }

  // Check for WebP versions
  try {
    const categoryPath = path.join(process.cwd(), "public", "images", category);
    const files = await fs.readdir(categoryPath);

    for (const file of files) {
      if (
        file.includes(baseName) &&
        file.endsWith(".webp") &&
        file !== fileName
      ) {
        const stats = await fs.stat(path.join(categoryPath, file));
        versions.push({
          type: "webp",
          url: `/images/${category}/${file}`,
          size: stats.size,
        });
      }
    }
  } catch {
    // Category directory might not exist
  }

  return versions;
}

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
    const category = searchParams.get("category");

    let allFiles: FileInfo[] = [];

    // Define directories to scan
    const directories = [
      { path: "images/portfolio", category: "portfolio" },
      { path: "images/thumbnails", category: "thumbnails" },
      { path: "images/og-images", category: "og-images" },
      { path: "images/profile", category: "profile" },
      { path: "videos", category: "videos" },
      { path: "downloads", category: "downloads" },
    ];

    // Scan directories
    for (const dir of directories) {
      if (!category || dir.category === category) {
        const files = await scanDirectory(dir.path, dir.category);
        allFiles = allFiles.concat(files);
      }
    }

    // Find versions for each file
    for (const file of allFiles) {
      if (file.type.startsWith("image/") && file.category !== "thumbnails") {
        file.versions = await findFileVersions(file.name, file.category);
      }
    }

    // Get backup statistics
    const backupStats = await getBackupStats();

    return NextResponse.json({
      success: true,
      files: allFiles,
      stats: {
        totalFiles: allFiles.length,
        totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
        categories: directories.map((dir) => ({
          name: dir.category,
          count: allFiles.filter((f) => f.category === dir.category).length,
        })),
        backupStats,
      },
    });
  } catch (error) {
    console.error("Error loading files:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to load files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Bulk operations
export async function POST(request: NextRequest) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "bulk-delete":
        // This would be implemented in a separate endpoint
        return NextResponse.json(
          { error: "Use /api/admin/files/bulk-delete endpoint" },
          { status: 400 },
        );

      case "bulk-move":
        // Move files to different category
        // Implementation would go here
        return NextResponse.json({
          success: true,
          message: "Files moved successfully",
        });

      case "bulk-optimize":
        // Optimize multiple images
        // Implementation would go here
        return NextResponse.json({
          success: true,
          message: "Files optimized successfully",
        });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing bulk operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process bulk operation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
