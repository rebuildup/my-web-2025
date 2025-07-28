import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ContentItem, ContentType } from "@/types/content";

// Development environment check
function isDevelopment() {
  return process.env.NODE_ENV === "development";
}

// Get content file path
function getContentFilePath(type: ContentType): string {
  return path.join(process.cwd(), "public", "data", "content", `${type}.json`);
}

// Read content from file
async function readContentFile(type: ContentType): Promise<ContentItem[]> {
  try {
    const filePath = getContentFilePath(type);
    const fileContent = await fs.readFile(filePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${type} content:`, error);
    return [];
  }
}

// Write content to file
async function writeContentFile(
  type: ContentType,
  content: ContentItem[],
): Promise<void> {
  try {
    const filePath = getContentFilePath(type);
    console.log(`Writing to file: ${filePath}`);
    console.log(`Content to write:`, JSON.stringify(content, null, 2));

    // Check directory permissions
    const dirPath = path.dirname(filePath);
    console.log(`Checking directory: ${dirPath}`);

    try {
      await fs.access(dirPath, fs.constants.W_OK);
      console.log(`Directory is writable: ${dirPath}`);
    } catch (permError) {
      console.error(`Directory is not writable: ${dirPath}`, permError);
      // Try to create directory if it doesn't exist
      try {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      } catch (mkdirError) {
        console.error(`Failed to create directory: ${dirPath}`, mkdirError);
        throw new Error(`Directory is not accessible: ${dirPath}`);
      }
    }

    // Write the file
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");
    console.log(`Successfully wrote ${content.length} items to ${filePath}`);

    // Verify the write was successful
    try {
      const verification = await fs.readFile(filePath, "utf-8");
      const verifiedContent = JSON.parse(verification);
      console.log(
        `Verification: ${verifiedContent.length} items written successfully`,
      );
    } catch (verifyError) {
      console.error(`Failed to verify file write:`, verifyError);
      throw new Error(`File write verification failed`);
    }
  } catch (error) {
    console.error(`Error writing ${type} content:`, error);
    throw error;
  }
}

// Create or update content item
export async function POST(request: NextRequest) {
  console.log("=== POST request received at /api/admin/content ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log(
    "Request headers:",
    Object.fromEntries(request.headers.entries()),
  );

  // Only allow access in development environment
  if (!isDevelopment()) {
    console.log("Access denied - not in development environment");
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const item: ContentItem = await request.json();
    console.log("Received item for saving:", JSON.stringify(item, null, 2));

    // Validate required fields
    if (!item.id || !item.type || !item.title) {
      console.error("Missing required fields:", {
        id: item.id,
        type: item.type,
        title: item.title,
      });
      return NextResponse.json(
        { error: "Missing required fields: id, type, title" },
        { status: 400 },
      );
    }

    // Read existing content
    const existingContent = await readContentFile(item.type);
    console.log(
      `Found ${existingContent.length} existing items of type ${item.type}`,
    );

    // Find existing item or create new one
    const existingIndex = existingContent.findIndex(
      (existing) => existing.id === item.id,
    );

    if (existingIndex >= 0) {
      // Update existing item
      console.log(`Updating existing item at index ${existingIndex}`);
      existingContent[existingIndex] = {
        ...item,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new item
      console.log("Adding new item");
      existingContent.push({
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Sort by priority (higher first) and then by creation date (newer first)
    existingContent.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    console.log(`Writing ${existingContent.length} items to file`);
    // Write back to file
    await writeContentFile(item.type, existingContent);
    console.log("File write completed");

    // Update search index
    console.log("Updating search index...");
    await updateSearchIndex();
    console.log("Search index updated");

    // Invalidate portfolio data manager cache if this is a portfolio item
    if (item.type === "portfolio") {
      console.log("Invalidating portfolio data manager cache...");
      try {
        // Import and invalidate the portfolio data manager cache
        const { portfolioDataManager } = await import(
          "@/lib/portfolio/data-manager"
        );
        portfolioDataManager.invalidateCache();
        console.log("Portfolio data manager cache invalidated");
      } catch (cacheError) {
        console.error("Error invalidating portfolio cache:", cacheError);
        // Don't fail the request if cache invalidation fails
      }
    }

    return NextResponse.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Error saving content item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save content item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Delete content item
export async function DELETE(request: NextRequest) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const type = url.searchParams.get("type") as ContentType;

    if (!id || !type) {
      return NextResponse.json(
        { error: "Missing required parameters: id, type" },
        { status: 400 },
      );
    }

    // Read existing content
    const existingContent = await readContentFile(type);

    // Filter out the item to delete
    const filteredContent = existingContent.filter((item) => item.id !== id);

    if (filteredContent.length === existingContent.length) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Write back to file
    await writeContentFile(type, filteredContent);

    // Update search index
    await updateSearchIndex();

    // Invalidate portfolio data manager cache if this is a portfolio item
    if (type === "portfolio") {
      try {
        const { portfolioDataManager } = await import(
          "@/lib/portfolio/data-manager"
        );
        portfolioDataManager.invalidateCache();
        console.log("Portfolio data manager cache invalidated after deletion");
      } catch (cacheError) {
        console.error("Error invalidating portfolio cache:", cacheError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting content item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete content item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Update search index after content changes
async function updateSearchIndex(): Promise<void> {
  try {
    const searchIndexPath = path.join(
      process.cwd(),
      "public",
      "data",
      "cache",
      "search-index.json",
    );

    // Read all content types
    const contentTypes: ContentType[] = [
      "portfolio",
      "blog",
      "plugin",
      "download",
      "tool",
      "profile",
    ];
    const allContent: ContentItem[] = [];

    for (const type of contentTypes) {
      const content = await readContentFile(type);
      allContent.push(...content.filter((item) => item.status === "published"));
    }

    // Create search index
    const searchIndex = allContent.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      content: item.content || "",
      tags: item.tags,
      category: item.category,
      searchableContent: [
        item.title,
        item.description,
        item.content || "",
        ...item.tags,
        item.category,
      ]
        .join(" ")
        .toLowerCase(),
    }));

    // Write search index
    await fs.writeFile(
      searchIndexPath,
      JSON.stringify(searchIndex, null, 2),
      "utf-8",
    );
  } catch (error) {
    console.error("Error updating search index:", error);
  }
}

// Batch operations
export async function PATCH(request: NextRequest) {
  // Only allow access in development environment
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Admin API is only available in development environment" },
      { status: 403 },
    );
  }

  try {
    const { operation, items } = await request.json();

    if (!operation || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Invalid batch operation format" },
        { status: 400 },
      );
    }

    const results = [];

    switch (operation) {
      case "bulk_update_status":
        for (const { id, type, status } of items) {
          const content = await readContentFile(type);
          const itemIndex = content.findIndex((item) => item.id === id);

          if (itemIndex >= 0) {
            content[itemIndex].status = status;
            content[itemIndex].updatedAt = new Date().toISOString();
            await writeContentFile(type, content);
            results.push({ id, success: true });
          } else {
            results.push({ id, success: false, error: "Item not found" });
          }
        }
        break;

      case "bulk_delete":
        for (const { id, type } of items) {
          const content = await readContentFile(type);
          const filteredContent = content.filter((item) => item.id !== id);

          if (filteredContent.length < content.length) {
            await writeContentFile(type, filteredContent);
            results.push({ id, success: true });
          } else {
            results.push({ id, success: false, error: "Item not found" });
          }
        }
        break;

      default:
        return NextResponse.json(
          { error: "Unknown batch operation" },
          { status: 400 },
        );
    }

    // Update search index after batch operations
    await updateSearchIndex();

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error performing batch operation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform batch operation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
