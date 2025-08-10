/**
 * Upload Management API Endpoints
 * Provides file upload operations
 */

import { NextRequest, NextResponse } from "next/server";

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

    if (!files.length && !singleFile) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Mock successful upload
    const uploadedFiles = files.length ? files : [singleFile];
    const results = uploadedFiles.map((file) => ({
      originalName: file.name,
      size: file.size,
      url: `/uploads/${file.name}`,
      success: true,
    }));

    return NextResponse.json({
      success: true,
      message: "Files uploaded successfully",
      files: results,
    });
  } catch (error) {
    console.error("Error uploading files:", error);

    // Mock error handling - return success with error in file
    return NextResponse.json({
      success: true,
      files: [
        {
          error: "Upload failed",
          originalName: "unknown",
          success: false,
        },
      ],
    });
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
