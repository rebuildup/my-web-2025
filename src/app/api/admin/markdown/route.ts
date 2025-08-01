/**
 * API endpoints for markdown file management
 * Handles CRUD operations for markdown files
 */

import { markdownFileManager } from "@/lib/portfolio/markdown-file-manager";
import { NextRequest, NextResponse } from "next/server";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

// Validate request body for markdown operations
interface CreateMarkdownRequest {
  itemId: string;
  content: string;
}

// interface UpdateMarkdownRequest {
//   content: string;
// }

/**
 * POST /api/admin/markdown - Create new markdown file
 */
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
    const { itemId, content } = body as CreateMarkdownRequest;

    // Validate required fields
    if (!itemId || !content) {
      return NextResponse.json(
        { error: "itemId and content are required" },
        { status: 400 },
      );
    }

    // Create markdown file
    const filePath = await markdownFileManager.createMarkdownFile(
      itemId,
      content,
    );

    return NextResponse.json({
      success: true,
      filePath,
      message: "Markdown file created successfully",
    });
  } catch (error) {
    console.error("Error creating markdown file:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode = errorMessage.includes("already exists") ? 409 : 500;

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create markdown file",
        details: errorMessage,
      },
      { status: statusCode },
    );
  }
}

/**
 * GET /api/admin/markdown - List all markdown files
 */
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

    switch (operation) {
      case "list":
        // List all markdown files
        const files = await markdownFileManager.listMarkdownFiles();
        const fileList = await Promise.all(
          files.map(async (filePath) => {
            try {
              const metadata =
                await markdownFileManager.getMarkdownFileMetadata(filePath);
              return {
                filePath,
                size: metadata.size,
                created: metadata.created,
                modified: metadata.modified,
                hash: metadata.hash,
              };
            } catch (error) {
              console.warn(`Failed to get metadata for ${filePath}:`, error);
              return {
                filePath,
                error: "Failed to get metadata",
              };
            }
          }),
        );

        return NextResponse.json({
          success: true,
          files: fileList,
        });

      case "validate":
        // Validate markdown file path
        const path = searchParams.get("path");
        if (!path) {
          return NextResponse.json(
            { error: "path parameter is required for validation" },
            { status: 400 },
          );
        }

        const isValid = markdownFileManager.validateMarkdownPath(path);
        return NextResponse.json({
          success: true,
          valid: isValid,
          path,
        });

      default:
        return NextResponse.json(
          { error: "Invalid operation. Supported operations: list, validate" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error in markdown GET operation:", error);
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

/**
 * DELETE /api/admin/markdown - Clear cache
 */
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
    const operation = searchParams.get("operation");

    if (operation === "clear-cache") {
      const filePath = searchParams.get("path");
      markdownFileManager.clearCache(filePath || undefined);

      return NextResponse.json({
        success: true,
        message: filePath
          ? `Cache cleared for ${filePath}`
          : "All cache cleared",
      });
    }

    return NextResponse.json(
      { error: "Invalid operation. Supported operations: clear-cache" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error clearing markdown cache:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to clear cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
