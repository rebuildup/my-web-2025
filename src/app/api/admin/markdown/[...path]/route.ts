/**
 * Dynamic API endpoints for individual markdown file operations
 * Handles read, update, and delete operations for specific markdown files
 */

import { markdownFileManager } from "@/lib/portfolio/markdown-file-manager";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

// Extract file path from URL parameters
function getFilePathFromParams(params: { path: string[] }): string {
  const baseDir = join(
    process.cwd(),
    "public",
    "data",
    "content",
    "markdown",
    "portfolio",
  );
  const relativePath = params.path.join("/");

  // Ensure .md extension
  const filePath = relativePath.endsWith(".md")
    ? join(baseDir, relativePath)
    : join(baseDir, `${relativePath}.md`);

  return filePath;
}

/**
 * GET /api/admin/markdown/[...path] - Read markdown file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const filePath = getFilePathFromParams(params);

    // Validate file path
    if (!markdownFileManager.validateMarkdownPath(filePath)) {
      return NextResponse.json(
        { error: "Invalid markdown file path" },
        { status: 400 },
      );
    }

    // Read markdown file
    const content = await markdownFileManager.readMarkdownFile(filePath);
    const metadata =
      await markdownFileManager.getMarkdownFileMetadata(filePath);

    return NextResponse.json({
      success: true,
      content,
      metadata: {
        filePath: metadata.filePath,
        size: metadata.size,
        created: metadata.created,
        modified: metadata.modified,
        hash: metadata.hash,
      },
    });
  } catch (error) {
    console.error("Error reading markdown file:", error);

    // Handle specific error types
    if (error && typeof error === "object" && "type" in error) {
      const markdownError = error as { type: string; message: string };
      switch (markdownError.type) {
        case "file_not_found":
          return NextResponse.json(
            {
              success: false,
              error: "Markdown file not found",
              details: markdownError.message,
            },
            { status: 404 },
          );
        case "validation":
          return NextResponse.json(
            {
              success: false,
              error: "Invalid file path",
              details: markdownError.message,
            },
            { status: 400 },
          );
        default:
          return NextResponse.json(
            {
              success: false,
              error: "Failed to read markdown file",
              details: markdownError.message,
            },
            { status: 500 },
          );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to read markdown file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/markdown/[...path] - Update markdown file
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const filePath = getFilePathFromParams(params);
    const body = await request.json();
    const { content } = body;

    // Validate required fields
    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required and must be a string" },
        { status: 400 },
      );
    }

    // Validate file path
    if (!markdownFileManager.validateMarkdownPath(filePath)) {
      return NextResponse.json(
        { error: "Invalid markdown file path" },
        { status: 400 },
      );
    }

    // Update markdown file
    await markdownFileManager.updateMarkdownFile(filePath, content);
    const metadata =
      await markdownFileManager.getMarkdownFileMetadata(filePath);

    return NextResponse.json({
      success: true,
      filePath,
      message: "Markdown file updated successfully",
      metadata: {
        size: metadata.size,
        modified: metadata.modified,
        hash: metadata.hash,
      },
    });
  } catch (error) {
    console.error("Error updating markdown file:", error);

    // Handle specific error types
    if (error && typeof error === "object" && "type" in error) {
      const markdownError = error as { type: string; message: string };
      switch (markdownError.type) {
        case "file_not_found":
          return NextResponse.json(
            {
              success: false,
              error: "Markdown file not found",
              details: markdownError.message,
            },
            { status: 404 },
          );
        case "validation":
          return NextResponse.json(
            {
              success: false,
              error: "Invalid content or file path",
              details: markdownError.message,
            },
            { status: 400 },
          );
        default:
          return NextResponse.json(
            {
              success: false,
              error: "Failed to update markdown file",
              details: markdownError.message,
            },
            { status: 500 },
          );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update markdown file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/markdown/[...path] - Delete markdown file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const filePath = getFilePathFromParams(params);

    // Validate file path
    if (!markdownFileManager.validateMarkdownPath(filePath)) {
      return NextResponse.json(
        { error: "Invalid markdown file path" },
        { status: 400 },
      );
    }

    // Delete markdown file
    await markdownFileManager.deleteMarkdownFile(filePath);

    return NextResponse.json({
      success: true,
      filePath,
      message: "Markdown file deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting markdown file:", error);

    // Handle specific error types
    if (error && typeof error === "object" && "type" in error) {
      const markdownError = error as { type: string; message: string };
      switch (markdownError.type) {
        case "file_not_found":
          return NextResponse.json(
            {
              success: false,
              error: "Markdown file not found",
              details: markdownError.message,
            },
            { status: 404 },
          );
        case "validation":
          return NextResponse.json(
            {
              success: false,
              error: "Invalid file path",
              details: markdownError.message,
            },
            { status: 400 },
          );
        default:
          return NextResponse.json(
            {
              success: false,
              error: "Failed to delete markdown file",
              details: markdownError.message,
            },
            { status: 500 },
          );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete markdown file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
