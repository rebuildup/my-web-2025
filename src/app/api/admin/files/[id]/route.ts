import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import {
  createFileBackup,
  getFileVersions,
  restoreFileFromBackup,
} from "@/lib/utils/file-backup";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

// Decode file ID to get file path
function decodeFileId(fileId: string): string | null {
  try {
    const decoded = Buffer.from(fileId, "base64").toString("utf-8");
    const [filePath] = decoded.split("-");
    return filePath;
  } catch {
    return null;
  }
}

// Get file info from path
async function getFileInfo(filePath: string) {
  const fullPath = path.join(
    process.cwd(),
    "public",
    filePath.startsWith("/") ? filePath.slice(1) : filePath,
  );

  try {
    const stats = await fs.stat(fullPath);
    return {
      exists: true,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      fullPath,
    };
  } catch {
    return { exists: false, fullPath };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const resolvedParams = await params;
    const fileId = resolvedParams.id;
    const filePath = decodeFileId(fileId);

    if (!filePath) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const fileInfo = await getFileInfo(filePath);

    if (!fileInfo.exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get file versions/backups
    const versions = await getFileVersions(fileInfo.fullPath);

    return NextResponse.json({
      success: true,
      file: {
        id: fileId,
        path: filePath,
        size: fileInfo.size,
        createdAt: fileInfo.createdAt,
        modifiedAt: fileInfo.modifiedAt,
        versions: versions.map((v) => ({
          id: v.id,
          timestamp: v.timestamp,
          size: v.size,
          hash: v.hash,
          metadata: v.metadata,
        })),
      },
    });
  } catch (error) {
    console.error("Error getting file info:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get file info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const resolvedParams = await params;
    const fileId = resolvedParams.id;
    const filePath = decodeFileId(fileId);

    if (!filePath) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const fileInfo = await getFileInfo(filePath);

    if (!fileInfo.exists) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Create backup before deletion
    await createFileBackup(fileInfo.fullPath, {
      action: "delete",
      timestamp: new Date().toISOString(),
    });

    // Delete the file
    await fs.unlink(fileInfo.fullPath);

    // Try to delete related files (thumbnails, WebP versions, etc.)
    const fileName = path.basename(filePath);
    const baseName = path.parse(fileName).name;

    // Delete thumbnail if exists
    const thumbnailPath = path.join(
      process.cwd(),
      "public",
      "images",
      "thumbnails",
      `${baseName}-thumb.jpg`,
    );
    try {
      await fs.unlink(thumbnailPath);
    } catch {
      // Thumbnail might not exist
    }

    // Delete WebP version if exists
    const webpPath = path.join(
      path.dirname(fileInfo.fullPath),
      `${baseName}.webp`,
    );
    try {
      await fs.unlink(webpPath);
    } catch {
      // WebP version might not exist
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const resolvedParams = await params;
    const fileId = resolvedParams.id;
    const filePath = decodeFileId(fileId);
    const body = await request.json();
    const { action, versionId, newPath } = body;

    if (!filePath) {
      return NextResponse.json({ error: "Invalid file ID" }, { status: 400 });
    }

    const fileInfo = await getFileInfo(filePath);

    switch (action) {
      case "restore":
        if (!versionId) {
          return NextResponse.json(
            { error: "Version ID required for restore" },
            { status: 400 },
          );
        }

        await restoreFileFromBackup(versionId, fileInfo.fullPath);

        return NextResponse.json({
          success: true,
          message: "File restored successfully",
        });

      case "move":
        if (!newPath) {
          return NextResponse.json(
            { error: "New path required for move" },
            { status: 400 },
          );
        }

        const newFullPath = path.join(
          process.cwd(),
          "public",
          newPath.startsWith("/") ? newPath.slice(1) : newPath,
        );

        // Create backup before moving
        await createFileBackup(fileInfo.fullPath, {
          action: "move",
          originalPath: filePath,
          newPath: newPath,
          timestamp: new Date().toISOString(),
        });

        // Ensure target directory exists
        await fs.mkdir(path.dirname(newFullPath), { recursive: true });

        // Move the file
        await fs.rename(fileInfo.fullPath, newFullPath);

        return NextResponse.json({
          success: true,
          message: "File moved successfully",
          newPath: newPath,
        });

      case "backup":
        const version = await createFileBackup(fileInfo.fullPath, {
          action: "manual_backup",
          timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
          success: true,
          message: "Backup created successfully",
          version: {
            id: version.id,
            timestamp: version.timestamp,
            size: version.size,
          },
        });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
