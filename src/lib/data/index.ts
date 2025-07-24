/**
 * File-based Data Management System
 * Based on documents/01_global.md specifications
 */

import { promises as fs } from "fs";
import path from "path";
import type { ContentItem, ContentType } from "@/types";

// Data file paths
const DATA_DIR = path.join(process.cwd(), "public/data");
const CONTENT_DIR = path.join(DATA_DIR, "content");
const STATS_DIR = path.join(DATA_DIR, "stats");
const CACHE_DIR = path.join(DATA_DIR, "cache");

/**
 * Load content by type
 */
export async function loadContentByType(
  type: ContentType,
): Promise<ContentItem[]> {
  try {
    const filePath = path.join(CONTENT_DIR, `${type}.json`);
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load ${type} content:`, error);
    return [];
  }
}

/**
 * Save content by type
 */
export async function saveContentByType(
  type: ContentType,
  content: ContentItem[],
): Promise<boolean> {
  try {
    const filePath = path.join(CONTENT_DIR, `${type}.json`);
    await fs.writeFile(filePath, JSON.stringify(content, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error(`Failed to save ${type} content:`, error);
    return false;
  }
}

/**
 * Get content by ID
 */
export async function getContentById(
  type: ContentType,
  id: string,
): Promise<ContentItem | null> {
  try {
    const content = await loadContentByType(type);
    return content.find((item) => item.id === id) || null;
  } catch (error) {
    console.error(`Failed to get content by ID:`, error);
    return null;
  }
}

/**
 * Add new content item
 */
export async function addContentItem(
  type: ContentType,
  item: ContentItem,
): Promise<boolean> {
  try {
    const content = await loadContentByType(type);
    content.push(item);
    return await saveContentByType(type, content);
  } catch (error) {
    console.error(`Failed to add content item:`, error);
    return false;
  }
}

/**
 * Update content item
 */
export async function updateContentItem(
  type: ContentType,
  id: string,
  updates: Partial<ContentItem>,
): Promise<boolean> {
  try {
    const content = await loadContentByType(type);
    const index = content.findIndex((item) => item.id === id);

    if (index === -1) {
      return false;
    }

    content[index] = {
      ...content[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return await saveContentByType(type, content);
  } catch (error) {
    console.error(`Failed to update content item:`, error);
    return false;
  }
}

/**
 * Delete content item
 */
export async function deleteContentItem(
  type: ContentType,
  id: string,
): Promise<boolean> {
  try {
    const content = await loadContentByType(type);
    const filteredContent = content.filter((item) => item.id !== id);

    if (filteredContent.length === content.length) {
      return false; // Item not found
    }

    return await saveContentByType(type, filteredContent);
  } catch (error) {
    console.error(`Failed to delete content item:`, error);
    return false;
  }
}

/**
 * Load all content types
 */
export async function loadAllContent(): Promise<
  Record<ContentType, ContentItem[]>
> {
  const contentTypes: ContentType[] = [
    "portfolio",
    "blog",
    "plugin",
    "download",
    "tool",
    "profile",
  ];

  const result: Record<string, ContentItem[]> = {};

  for (const type of contentTypes) {
    result[type] = await loadContentByType(type);
  }

  return result as Record<ContentType, ContentItem[]>;
}

/**
 * Search content across all types
 */
export async function searchContent(
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
    status?: "published" | "draft" | "archived" | "scheduled";
  } = {},
): Promise<ContentItem[]> {
  try {
    const { type, category, limit = 50, status = "published" } = options;

    let allContent: ContentItem[] = [];

    if (type) {
      allContent = await loadContentByType(type);
    } else {
      const contentByType = await loadAllContent();
      allContent = Object.values(contentByType).flat();
    }

    // Filter by status
    let filteredContent = allContent.filter((item) => item.status === status);

    // Filter by category
    if (category) {
      filteredContent = filteredContent.filter(
        (item) => item.category === category,
      );
    }

    // Search in title, description, and tags
    const searchResults = filteredContent.filter((item) => {
      const searchText =
        `${item.title} ${item.description} ${item.tags.join(" ")}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    // Sort by priority and creation date
    searchResults.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return searchResults.slice(0, limit);
  } catch (error) {
    console.error("Failed to search content:", error);
    return [];
  }
}

/**
 * Get content statistics
 */
export async function getContentStatistics(): Promise<{
  totalItems: number;
  itemsByType: Record<ContentType, number>;
  itemsByStatus: Record<string, number>;
}> {
  try {
    const allContent = await loadAllContent();
    const flatContent = Object.values(allContent).flat();

    const itemsByType = Object.entries(allContent).reduce(
      (acc, [type, items]) => {
        acc[type as ContentType] = items.length;
        return acc;
      },
      {} as Record<ContentType, number>,
    );

    const itemsByStatus = flatContent.reduce(
      (acc, item) => {
        acc[item.status] = (acc[item.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalItems: flatContent.length,
      itemsByType,
      itemsByStatus,
    };
  } catch (error) {
    console.error("Failed to get content statistics:", error);
    return {
      totalItems: 0,
      itemsByType: {} as Record<ContentType, number>,
      itemsByStatus: {},
    };
  }
}

/**
 * Validate content item structure
 */
export function validateContentItem(item: unknown): item is ContentItem {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as ContentItem).id === "string" &&
    typeof (item as ContentItem).type === "string" &&
    typeof (item as ContentItem).title === "string" &&
    typeof (item as ContentItem).description === "string" &&
    typeof (item as ContentItem).category === "string" &&
    Array.isArray((item as ContentItem).tags) &&
    ["published", "draft", "archived", "scheduled"].includes(
      (item as ContentItem).status,
    ) &&
    typeof (item as ContentItem).priority === "number" &&
    typeof (item as ContentItem).createdAt === "string"
  );
}

/**
 * Generate unique ID for content items
 */
export function generateContentId(type: ContentType): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${type}_${timestamp}_${random}`;
}

/**
 * Ensure data directories exist
 */
export async function ensureDataDirectories(): Promise<void> {
  try {
    await fs.mkdir(CONTENT_DIR, { recursive: true });
    await fs.mkdir(STATS_DIR, { recursive: true });
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error("Failed to ensure data directories:", error);
  }
}
