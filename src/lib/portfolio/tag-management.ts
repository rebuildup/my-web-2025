/**
 * Tag Management System for Portfolio Content Data Enhancement
 * Implements TagManagementSystem interface with persistence and search capabilities
 */

import type { TagInfo, TagManagementSystem } from "@/types/enhanced-content";
import { promises as fs } from "fs";
import path from "path";

interface TagData {
  tags: TagInfo[];
  lastUpdated: string;
}

export class PortfolioTagManager implements TagManagementSystem {
  private readonly dataPath: string;
  private tagCache: Map<string, TagInfo> = new Map();
  private cacheLastUpdated: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(dataPath?: string) {
    this.dataPath =
      dataPath || path.join(process.cwd(), "public/data/tags.json");
  }

  /**
   * Get all tags sorted by usage count (descending) then by creation date (ascending)
   */
  async getAllTags(): Promise<TagInfo[]> {
    await this.loadTagsFromFile();
    await this.syncWithContentData();

    const tags = Array.from(this.tagCache.values());

    // Sort by usage count (descending), then by creation date (ascending)
    return tags.sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count; // Higher count first
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(); // Earlier date first
    });
  }

  /**
   * Create a new tag
   */
  async createTag(name: string): Promise<TagInfo> {
    if (!name || typeof name !== "string") {
      throw new Error("Tag name must be a non-empty string");
    }

    const normalizedName = this.normalizeTagName(name);

    if (normalizedName.length === 0) {
      throw new Error("Tag name cannot be empty after normalization");
    }

    await this.loadTagsFromFile();

    // Check if tag already exists
    if (this.tagCache.has(normalizedName)) {
      return this.tagCache.get(normalizedName)!;
    }

    const now = new Date().toISOString();
    const newTag: TagInfo = {
      name: normalizedName,
      count: 0,
      createdAt: now,
      lastUsed: now,
    };

    this.tagCache.set(normalizedName, newTag);
    await this.saveTagsToFile();

    return newTag;
  }

  /**
   * Update tag usage count and last used timestamp
   */
  async updateTagUsage(name: string): Promise<void> {
    if (!name || typeof name !== "string") {
      return;
    }

    const normalizedName = this.normalizeTagName(name);
    await this.loadTagsFromFile();

    let tag = this.tagCache.get(normalizedName);

    if (!tag) {
      // Create tag if it doesn't exist
      tag = await this.createTag(normalizedName);
    } else {
      // Update existing tag
      tag.count += 1;
      tag.lastUsed = new Date().toISOString();
      this.tagCache.set(normalizedName, tag);
      await this.saveTagsToFile();
    }
  }

  /**
   * Delete a tag
   */
  async deleteTag(name: string): Promise<boolean> {
    if (!name || typeof name !== "string") {
      return false;
    }

    const normalizedName = this.normalizeTagName(name);
    await this.loadTagsFromFile();

    if (!this.tagCache.has(normalizedName)) {
      return false;
    }

    this.tagCache.delete(normalizedName);
    await this.saveTagsToFile();
    return true;
  }

  /**
   * Search tags by name (case-insensitive partial match)
   */
  async searchTags(query: string): Promise<TagInfo[]> {
    if (!query || typeof query !== "string") {
      return [];
    }

    await this.loadTagsFromFile();

    const normalizedQuery = query.toLowerCase().trim();
    const matchingTags = Array.from(this.tagCache.values()).filter((tag) =>
      tag.name.toLowerCase().includes(normalizedQuery),
    );

    // Sort by relevance (exact match first, then by usage count)
    return matchingTags.sort((a, b) => {
      const aExact = a.name.toLowerCase() === normalizedQuery;
      const bExact = b.name.toLowerCase() === normalizedQuery;

      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;

      // If both exact or both partial, sort by usage count
      return b.count - a.count;
    });
  }

  /**
   * Get tag statistics
   */
  async getTagStats(): Promise<{
    totalTags: number;
    totalUsage: number;
    mostUsedTag?: TagInfo;
    recentlyCreated: TagInfo[];
  }> {
    const tags = await this.getAllTags();

    const totalUsage = tags.reduce((sum, tag) => sum + tag.count, 0);
    const mostUsedTag = tags.length > 0 ? tags[0] : undefined;

    // Get recently created tags (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentlyCreated = tags
      .filter((tag) => new Date(tag.createdAt) > thirtyDaysAgo)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);

    return {
      totalTags: tags.length,
      totalUsage,
      mostUsedTag,
      recentlyCreated,
    };
  }

  /**
   * Bulk update tag usage for multiple tags
   */
  async bulkUpdateTagUsage(tagNames: string[]): Promise<void> {
    if (!Array.isArray(tagNames)) {
      return;
    }

    await this.loadTagsFromFile();

    const updates = tagNames
      .filter((name) => name && typeof name === "string")
      .map((name) => this.normalizeTagName(name))
      .filter((name) => name.length > 0); // Filter out empty normalized names

    // Only proceed if there are valid tags to update
    if (updates.length === 0) {
      return;
    }

    for (const tagName of updates) {
      let tag = this.tagCache.get(tagName);

      if (!tag) {
        // Create tag if it doesn't exist
        const now = new Date().toISOString();
        tag = {
          name: tagName,
          count: 1,
          createdAt: now,
          lastUsed: now,
        };
      } else {
        // Update existing tag
        tag.count += 1;
        tag.lastUsed = new Date().toISOString();
      }

      this.tagCache.set(tagName, tag);
    }

    await this.saveTagsToFile();
  }

  /**
   * Clean up unused tags (tags with count 0 and not used in last 90 days)
   */
  async cleanupUnusedTags(): Promise<number> {
    await this.loadTagsFromFile();

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const tagsToDelete: string[] = [];

    for (const [name, tag] of this.tagCache.entries()) {
      if (tag.count === 0 && new Date(tag.lastUsed) < ninetyDaysAgo) {
        tagsToDelete.push(name);
      }
    }

    for (const tagName of tagsToDelete) {
      this.tagCache.delete(tagName);
    }

    if (tagsToDelete.length > 0) {
      await this.saveTagsToFile();
    }

    return tagsToDelete.length;
  }

  /**
   * Load tags from file with caching
   */
  private async loadTagsFromFile(): Promise<void> {
    const now = Date.now();

    // Use cache if it's still valid
    if (
      this.cacheLastUpdated > 0 &&
      now - this.cacheLastUpdated < this.CACHE_TTL
    ) {
      return;
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });

      // Try to read existing file
      const fileContent = await fs.readFile(this.dataPath, "utf-8");
      const data: TagData = JSON.parse(fileContent);

      // Validate data structure
      if (data && Array.isArray(data.tags)) {
        this.tagCache.clear();
        for (const tag of data.tags) {
          if (this.isValidTagInfo(tag)) {
            this.tagCache.set(tag.name, tag);
          }
        }
      }
    } catch (error) {
      // File doesn't exist or is invalid, start with empty cache
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        console.warn("Error loading tags file:", error);
      }
      this.tagCache.clear();
    }

    this.cacheLastUpdated = now;
  }

  /**
   * Save tags to file
   */
  private async saveTagsToFile(): Promise<void> {
    try {
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });

      const data: TagData = {
        tags: Array.from(this.tagCache.values()),
        lastUpdated: new Date().toISOString(),
      };

      await fs.writeFile(this.dataPath, JSON.stringify(data, null, 2), "utf-8");
      this.cacheLastUpdated = Date.now();
    } catch (error) {
      console.error("Error saving tags file:", error);
      throw new Error("Failed to save tags data");
    }
  }

  /**
   * Normalize tag name (trim, lowercase, remove extra spaces)
   */
  private normalizeTagName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
      .trim();
  }

  /**
   * Validate TagInfo object
   */
  private isValidTagInfo(obj: unknown): obj is TagInfo {
    if (!obj || typeof obj !== "object") {
      return false;
    }

    const tag = obj as Partial<TagInfo>;

    return (
      typeof tag.name === "string" &&
      tag.name.length > 0 &&
      typeof tag.count === "number" &&
      tag.count >= 0 &&
      typeof tag.createdAt === "string" &&
      typeof tag.lastUsed === "string" &&
      !isNaN(new Date(tag.createdAt).getTime()) &&
      !isNaN(new Date(tag.lastUsed).getTime())
    );
  }

  /**
   * Reset cache (useful for testing)
   */
  public resetCache(): void {
    this.tagCache.clear();
    this.cacheLastUpdated = 0;
  }

  /**
   * Get cache size (useful for monitoring)
   */
  public getCacheSize(): number {
    return this.tagCache.size;
  }

  /**
   * Sync tags with actual content data
   */
  private async syncWithContentData(): Promise<void> {
    try {
      // Load portfolio content data
      const portfolioPath = path.join(
        process.cwd(),
        "public/data/content/portfolio.json",
      );
      const portfolioContent = await fs.readFile(portfolioPath, "utf-8");
      const portfolioItems = JSON.parse(portfolioContent);

      // Extract all tags from content
      const contentTags = new Map<string, number>();

      if (Array.isArray(portfolioItems)) {
        for (const item of portfolioItems) {
          if (item.tags && Array.isArray(item.tags)) {
            for (const tag of item.tags) {
              if (typeof tag === "string" && tag.trim()) {
                const normalizedTag = this.normalizeTagName(tag);
                if (normalizedTag) {
                  contentTags.set(
                    normalizedTag,
                    (contentTags.get(normalizedTag) || 0) + 1,
                  );
                }
              }
            }
          }
        }
      }

      // Update cache with content tags
      const now = new Date().toISOString();
      let hasChanges = false;

      for (const [tagName, count] of contentTags.entries()) {
        let existingTag = this.tagCache.get(tagName);

        if (!existingTag) {
          // Create new tag from content
          existingTag = {
            name: tagName,
            count: count,
            createdAt: now,
            lastUsed: now,
          };
          this.tagCache.set(tagName, existingTag);
          hasChanges = true;
        } else if (existingTag.count !== count) {
          // Update count if different
          existingTag.count = count;
          existingTag.lastUsed = now;
          hasChanges = true;
        }
      }

      // Remove tags that no longer exist in content (but keep manually created ones)
      for (const [tagName, tag] of this.tagCache.entries()) {
        if (!contentTags.has(tagName) && tag.count > 0) {
          // Reset count for tags not found in content
          tag.count = 0;
          hasChanges = true;
        }
      }

      // Save changes if any
      if (hasChanges) {
        await this.saveTagsToFile();
      }
    } catch (error) {
      console.warn("Error syncing with content data:", error);
      // Continue with existing cache if sync fails
    }
  }
}

// Export singleton instance
export const portfolioTagManager = new PortfolioTagManager();

// Export factory function for custom instances
export const createTagManager = (dataPath?: string): PortfolioTagManager => {
  return new PortfolioTagManager(dataPath);
};
