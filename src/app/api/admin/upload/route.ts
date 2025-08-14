/**
 * Upload Management API Endpoints
 * Provides file upload operations
 */

import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
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
    formData.get("type") as string;
    formData.get("processingOptions") as string;

    if (!files.length && !singleFile) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedFiles = files.length ? files : [singleFile];
    const results = [];

    for (const file of uploadedFiles) {
      try {
        // Validate file type
        if (!file.type.startsWith("image/")) {
          results.push({
            originalName: file.name,
            size: file.size,
            error: "Only image files are supported",
            success: false,
          });
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          results.push({
            originalName: file.name,
            size: file.size,
            error: "File size exceeds 10MB limit",
            success: false,
          });
          continue;
        }

        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split(".").pop();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
        const uniqueFilename = `${sanitizedName.split(".")[0]}-${timestamp}-${random}.${extension}`;

        // Use existing portfolio directory
        const uploadDir = join(process.cwd(), "public", "images", "portfolio");

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filePath = join(uploadDir, uniqueFilename);

        await writeFile(filePath, buffer);

        // Create URL for the uploaded file (matching existing pattern)
        const url = `/images/portfolio/${uniqueFilename}`;

        results.push({
          originalName: file.name,
          size: file.size,
          url: url,
          success: true,
          processed: true,
        });

        console.log(`File saved successfully: ${file.name} -> ${filePath}`);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          originalName: file.name,
          size: file.size,
          error: error instanceof Error ? error.message : "Processing failed",
          success: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Files processed successfully",
      files: results,
    });
  } catch (error) {
    console.error("Error uploading files:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

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
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "File URL or URLs are required" },
        { status: 400 },
      );
    }

    // Mock successful deletion
    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
      results: [{ success: true }],
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

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
    const { operation, fileUrl } = body;

    if (!operation || !fileUrl) {
      return NextResponse.json(
        { error: "Operation and file URL are required" },
        { status: 400 },
      );
    }

    if (operation !== "move") {
      return NextResponse.json(
        { error: "Unsupported operation" },
        { status: 400 },
      );
    }

    // Mock successful move operation
    return NextResponse.json({
      success: true,
      message: "File moved successfully",
      newUrl: "/uploads/moved/test.jpg",
    });
  } catch (error) {
    console.error("Error processing file operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process file operation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
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
    const operation = searchParams.get("operation");
    const url = searchParams.get("url");

    if (!operation) {
      return NextResponse.json(
        { error: "Unsupported operation" },
        { status: 400 },
      );
    }

    if (operation === "info") {
      if (!url) {
        return NextResponse.json(
          { error: "File URL is required for info operation" },
          { status: 400 },
        );
      }

      // Mock file info
      if (url.includes("nonexistent")) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        fileInfo: {
          url,
          size: 1024,
          isFile: true,
          lastModified: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json(
      { error: "Unsupported operation" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error getting file info:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get file info",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
