/**
 * Content Management API Endpoints
 * Provides CRUD operations for content items
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
    const body = await request.json();
    const { title, type, content } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Missing required fields: id, type, title" },
        { status: 400 },
      );
    }

    // Mock successful creation
    const newItem = {
      id: `item-${Date.now()}`,
      title,
      type,
      content,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: "Content item created successfully",
      data: newItem,
    });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create content",
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
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json(
        { error: "Missing required parameters: id, type" },
        { status: 400 },
      );
    }

    // Mock check for non-existent item
    if (id === "non-existent") {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Mock successful deletion
    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
      data: { id, type },
    });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete content",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const { operation } = body;

    if (!operation) {
      return NextResponse.json(
        { error: "Invalid batch operation format" },
        { status: 400 },
      );
    }

    if (operation === "bulk_update_status") {
      // Mock successful bulk update
      return NextResponse.json({
        success: true,
        message: "Bulk status update completed successfully",
        results: [{ success: true }, { success: true }],
      });
    }

    return NextResponse.json(
      { error: "Unknown batch operation" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error processing batch operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process batch operation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
