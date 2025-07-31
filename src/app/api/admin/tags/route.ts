/**
 * Tag Management API Endpoints
 * Provides CRUD operations for portfolio tags
 */

import { portfolioTagManager } from "@/lib/portfolio/tag-management";
import type { TagInfo } from "@/types/enhanced-content";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/tags - Get all tags with optional search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const sortBy = searchParams.get("sortBy") || "usage"; // usage, name, date
    const limit = parseInt(searchParams.get("limit") || "100");

    let tags: TagInfo[];

    if (query) {
      // Search tags
      tags = await portfolioTagManager.searchTags(query);
    } else {
      // Get all tags
      tags = await portfolioTagManager.getAllTags();
    }

    // Apply sorting
    if (sortBy === "name") {
      tags.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "date") {
      tags.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    // Default sorting by usage is already applied in getAllTags()

    // Apply limit
    if (limit > 0) {
      tags = tags.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: tags,
      total: tags.length,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tags",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/admin/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid tag name",
          message: "Tag name must be a non-empty string",
        },
        { status: 400 },
      );
    }

    const tag = await portfolioTagManager.createTag(name);

    return NextResponse.json({
      success: true,
      data: tag,
      message: "Tag created successfully",
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create tag",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/tags - Delete multiple tags or all unused tags
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cleanup = searchParams.get("cleanup") === "true";

    if (cleanup) {
      // Clean up unused tags
      const deletedCount = await portfolioTagManager.cleanupUnusedTags();

      return NextResponse.json({
        success: true,
        message: `Cleaned up ${deletedCount} unused tags`,
        deletedCount,
      });
    } else {
      // Delete specific tags
      const body = await request.json();
      const { tags } = body;

      if (!Array.isArray(tags)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid request",
            message: "Tags must be an array of tag names",
          },
          { status: 400 },
        );
      }

      const results = await Promise.allSettled(
        tags.map((tagName) => portfolioTagManager.deleteTag(tagName)),
      );

      const successful = results.filter(
        (result) => result.status === "fulfilled" && result.value === true,
      ).length;

      return NextResponse.json({
        success: true,
        message: `Deleted ${successful} out of ${tags.length} tags`,
        deletedCount: successful,
        totalRequested: tags.length,
      });
    }
  } catch (error) {
    console.error("Error deleting tags:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete tags",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
