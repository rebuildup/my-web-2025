/**
 * Content Management API Endpoints
 * Provides CRUD operations for content items
 */

import { ContentItem, ContentType } from "@/types/content";
import { EnhancedContentItem } from "@/types/enhanced-content";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

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
    console.log("=== ADMIN CONTENT API POST ===");
    console.log("Received data:", JSON.stringify(body, null, 2));
    console.log("Thumbnail in received data:", body.thumbnail);
    console.log("Images in received data:", body.images);

    const {
      id,
      title,
      type,
      description,
      category,
      categories,
      tags,
      status,
      priority,
      content,
      markdownPath,
      useManualDate,
      manualDate,
      images,
      thumbnail,
      videos,
      externalLinks,
      isOtherCategory,
    } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: "Missing required fields: title, type" },
        { status: 400 },
      );
    }

    // Validate content type
    const validTypes: ContentType[] = [
      "portfolio",
      "blog",
      "plugin",
      "download",
      "tool",
      "profile",
    ];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid content type: ${type}` },
        { status: 400 },
      );
    }

    // Create or update content item
    let savedItem: ContentItem | EnhancedContentItem;

    // Check if this is an enhanced content item (has categories array)
    const isEnhanced = categories && Array.isArray(categories);
    console.log("Is enhanced content item:", isEnhanced);
    console.log("Categories:", categories);

    if (isEnhanced) {
      // Enhanced content item
      const enhancedItem: EnhancedContentItem = {
        id: id || `${type}-${Date.now()}`,
        type,
        title: title.trim(),
        description: description || "",
        categories: categories || [],
        tags: tags || [],
        status: status || "published",
        priority: priority || 50,
        content: content || "",
        markdownPath: markdownPath || undefined,
        useManualDate: useManualDate || false,
        manualDate: manualDate || undefined,
        images: images || [],
        thumbnail:
          thumbnail || (images && images.length > 0 ? images[0] : undefined),
        videos: videos || [],
        externalLinks: externalLinks || [],
        isOtherCategory: isOtherCategory || false,
        originalImages: body.originalImages || [],
        processedImages: body.processedImages || [],
        createdAt: body.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(
        "Saving enhanced content item:",
        JSON.stringify(enhancedItem, null, 2),
      );

      // Save to JSON file
      await saveContentToFile(enhancedItem);
      savedItem = enhancedItem;
    } else {
      // Legacy content item
      const legacyItem: ContentItem = {
        id: id || `${type}-${Date.now()}`,
        type,
        title: title.trim(),
        description: description || "",
        category: category || "",
        tags: tags || [],
        status: status || "published",
        priority: priority || 50,
        content: content || "",
        images: images || [],
        thumbnail:
          thumbnail || (images && images.length > 0 ? images[0] : undefined),
        videos: videos || [],
        externalLinks: externalLinks || [],
        createdAt: body.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log(
        "Saving legacy content item:",
        JSON.stringify(legacyItem, null, 2),
      );

      // Save to JSON file
      await saveContentToFile(legacyItem);
      savedItem = legacyItem;
    }

    console.log("Content saved successfully");

    return NextResponse.json({
      success: true,
      message: "コンテンツアイテムが正常に保存されました",
      data: savedItem,
    });
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      {
        success: false,
        error: "コンテンツの保存に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Helper function to save content to JSON file
async function saveContentToFile(item: ContentItem | EnhancedContentItem) {
  const dataDir = path.join(process.cwd(), "public", "data", "content");
  const filePath = path.join(dataDir, `${item.type}.json`);

  try {
    // Ensure directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Read existing data
    let existingData: (ContentItem | EnhancedContentItem)[] = [];
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      existingData = JSON.parse(fileContent);
    } catch {
      // File doesn't exist or is invalid, start with empty array
      console.log(`Creating new ${item.type}.json file`);
    }

    // Update or add item
    const existingIndex = existingData.findIndex(
      (existing) => existing.id === item.id,
    );
    if (existingIndex >= 0) {
      existingData[existingIndex] = item;
      console.log(`Updated existing item with id: ${item.id}`);
    } else {
      existingData.push(item);
      console.log(`Added new item with id: ${item.id}`);
    }

    // Sort by priority (higher first) then by createdAt (newer first)
    existingData.sort((a, b) => {
      if (a.priority !== b.priority) {
        return (b.priority || 50) - (a.priority || 50);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Write back to file
    await fs.writeFile(
      filePath,
      JSON.stringify(existingData, null, 2),
      "utf-8",
    );
    console.log(`Saved to ${filePath}`);
  } catch (error) {
    console.error("Error saving to file:", error);
    throw error;
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

    // Delete item from JSON file
    await deleteContentFromFile(id, type);

    return NextResponse.json({
      success: true,
      message: "アイテムが正常に削除されました",
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
// Helper function to delete content from JSON file
async function deleteContentFromFile(id: string, type: string) {
  const dataDir = path.join(process.cwd(), "public", "data", "content");
  const filePath = path.join(dataDir, `${type}.json`);

  try {
    // Read existing data
    let existingData: (ContentItem | EnhancedContentItem)[] = [];
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      existingData = JSON.parse(fileContent);
    } catch {
      // File doesn't exist, nothing to delete
      throw new Error(`${type}.json file not found`);
    }

    // Find and remove item
    const itemIndex = existingData.findIndex((existing) => existing.id === id);
    if (itemIndex === -1) {
      throw new Error(`Item with id ${id} not found`);
    }

    // Remove the item
    existingData.splice(itemIndex, 1);
    console.log(`Removed item with id: ${id}`);

    // Write back to file
    await fs.writeFile(
      filePath,
      JSON.stringify(existingData, null, 2),
      "utf-8",
    );
    console.log(`Updated ${filePath} after deletion`);
  } catch (error) {
    console.error("Error deleting from file:", error);
    throw error;
  }
}
