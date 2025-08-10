/**
 * Tag Management API Endpoints
 * Provides CRUD operations for portfolio tags
 */

import { NextRequest, NextResponse } from "next/server";

// Mock data for testing
const mockTags = [
  {
    name: "tag1",
    count: 5,
    createdAt: "2023-01-01T00:00:00.000Z",
    lastUsed: "2023-01-01T00:00:00.000Z",
  },
  {
    name: "tag2",
    count: 3,
    createdAt: "2023-01-02T00:00:00.000Z",
    lastUsed: "2023-01-02T00:00:00.000Z",
  },
];

// GET /api/admin/tags - Get all tags with optional search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const sortBy = searchParams.get("sortBy") || "usage";
    const limit = parseInt(searchParams.get("limit") || "100");

    let tags = [...mockTags];

    if (query) {
      // Search tags
      tags = tags.filter((tag) => tag.name.includes(query));
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

    const newTag = {
      name,
      count: 0,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };

    mockTags.push(newTag);

    return NextResponse.json({
      success: true,
      data: newTag,
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
      const deletedCount = 3; // Mock value

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

      const successful = tags.length; // Mock: assume all deletions succeed

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
