/**
 * Search System
 * Based on documents/01_global.md specifications
 */

import { loadAllContent } from "@/lib/data";
import type { ContentType, SearchIndex, SearchResult } from "@/types";
import { promises as fs } from "fs";
import Fuse, { type IFuseOptions } from "fuse.js";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "public/data/cache");
const SEARCH_INDEX_PATH = path.join(CACHE_DIR, "search-index.json");

/**
 * Generate search index from all content
 */
export async function generateSearchIndex(): Promise<SearchIndex[]> {
  try {
    const allContent = await loadAllContent();
    const searchIndex: SearchIndex[] = [];

    for (const [type, items] of Object.entries(allContent)) {
      for (const item of items) {
        if (item.status === "published") {
          const searchableContent = [
            item.title,
            item.description,
            item.content || "",
            ...item.tags,
            item.category,
          ]
            .join(" ")
            .toLowerCase();

          searchIndex.push({
            id: item.id,
            type: type as ContentType,
            title: item.title,
            description: item.description,
            content: item.content || "",
            tags: item.tags,
            category: item.category,
            searchableContent,
          });
        }
      }
    }

    return searchIndex;
  } catch (error) {
    console.error("Failed to generate search index:", error);
    return [];
  }
}

/**
 * Save search index to cache
 */
export async function saveSearchIndex(index: SearchIndex[]): Promise<boolean> {
  try {
    await fs.writeFile(
      SEARCH_INDEX_PATH,
      JSON.stringify(index, null, 2),
      "utf-8",
    );
    return true;
  } catch (error) {
    console.error("Failed to save search index:", error);
    return false;
  }
}

/**
 * Load search index from cache
 */
export async function loadSearchIndex(): Promise<SearchIndex[]> {
  try {
    const data = await fs.readFile(SEARCH_INDEX_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    // If index doesn't exist, generate it
    console.log("Search index not found, generating new one...");
    const index = await generateSearchIndex();
    await saveSearchIndex(index);
    return index;
  }
}

/**
 * Update search index
 */
export async function updateSearchIndex(): Promise<boolean> {
  try {
    const index = await generateSearchIndex();
    return await saveSearchIndex(index);
  } catch (error) {
    console.error("Failed to update search index:", error);
    return false;
  }
}

/**
 * Search content with Fuse.js fuzzy matching (0.3 threshold)
 */
export async function searchContent(
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
    includeContent?: boolean;
    threshold?: number;
  } = {},
): Promise<SearchResult[]> {
  try {
    const {
      type,
      category,
      limit = 10,
      includeContent = false,
      threshold = 0.3,
    } = options;

    const searchIndex = await loadSearchIndex();
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return [];
    }

    // Filter by type and category
    let filteredIndex = searchIndex;

    if (type) {
      filteredIndex = filteredIndex.filter((item) => item.type === type);
    }

    if (category) {
      filteredIndex = filteredIndex.filter(
        (item) => item.category === category,
      );
    }

    // Configure Fuse.js for fuzzy search
    const fuseOptions: IFuseOptions<SearchIndex> = {
      keys: includeContent
        ? [
            { name: "title", weight: 0.4 },
            { name: "description", weight: 0.3 },
            { name: "tags", weight: 0.2 },
            { name: "category", weight: 0.1 },
            { name: "content", weight: 0.1 },
          ]
        : [
            { name: "title", weight: 0.5 },
            { name: "description", weight: 0.3 },
            { name: "tags", weight: 0.2 },
          ],
      threshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      findAllMatches: true,
    };

    // Create Fuse instance and search
    const fuse = new Fuse(filteredIndex, fuseOptions);
    const fuseResults = fuse.search(normalizedQuery);

    // Convert Fuse results to SearchResult format
    const searchResults: SearchResult[] = fuseResults
      .slice(0, limit)
      .map((result) => {
        const item = result.item;
        const score = 1 - (result.score || 0); // Invert score (Fuse uses 0 = perfect match)

        // Extract highlights from matches
        const highlights: string[] = [];
        if (result.matches) {
          result.matches.forEach((match) => {
            if (match.value) {
              highlights.push(match.value);
            }
          });
        }

        return {
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          url: generateContentUrl(item),
          score,
          highlights: [...new Set(highlights)], // Remove duplicates
        };
      });

    return searchResults;
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
}

/**
 * Simple search mode (title/tag only)
 */
export async function simpleSearch(
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
  } = {},
): Promise<SearchResult[]> {
  return searchContent(query, {
    ...options,
    includeContent: false,
    threshold: 0.2, // More strict for simple search
  });
}

/**
 * Detailed search mode (including content)
 */
export async function detailedSearch(
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
  } = {},
): Promise<SearchResult[]> {
  return searchContent(query, {
    ...options,
    includeContent: true,
    threshold: 0.4, // More lenient for detailed search
  });
}

/**
 * Generate URL for content item
 */
function generateContentUrl(item: SearchIndex): string {
  const baseUrls: Record<ContentType, string> = {
    portfolio: "/portfolio",
    blog: "/workshop/blog",
    plugin: "/workshop/plugins",
    download: "/workshop/downloads",
    tool: "/tools",
    profile: "/about/profile",
    page: "",
    asset: "",
    other: "",
  };

  const baseUrl = baseUrls[item.type] || "";
  return `${baseUrl}/${item.id}`;
}

/**
 * Get search suggestions based on popular queries and content
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5,
): Promise<string[]> {
  try {
    const searchIndex = await loadSearchIndex();
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return [];
    }

    const suggestions = new Set<string>();

    // Add matching titles
    for (const item of searchIndex) {
      if (item.title.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(item.title);
      }

      // Add matching tags
      for (const tag of item.tags) {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          suggestions.add(tag);
        }
      }

      // Add matching categories
      if (item.category.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(item.category);
      }

      if (suggestions.size >= limit) {
        break;
      }
    }

    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    console.error("Failed to get search suggestions:", error);
    return [];
  }
}

/**
 * Get related content based on tags and category
 */
export async function getRelatedContent(
  contentId: string,
  limit: number = 5,
): Promise<SearchResult[]> {
  try {
    const searchIndex = await loadSearchIndex();
    const targetItem = searchIndex.find((item) => item.id === contentId);

    if (!targetItem) {
      return [];
    }

    const relatedItems: Array<SearchIndex & { score: number }> = [];

    for (const item of searchIndex) {
      if (item.id === contentId) continue;

      let score = 0;

      // Same category
      if (item.category === targetItem.category) {
        score += 5;
      }

      // Shared tags
      const sharedTags = item.tags.filter((tag) =>
        targetItem.tags.includes(tag),
      );
      score += sharedTags.length * 2;

      // Same type
      if (item.type === targetItem.type) {
        score += 1;
      }

      if (score > 0) {
        relatedItems.push({ ...item, score });
      }
    }

    // Sort by score and limit
    const sortedItems = relatedItems
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return sortedItems.map((item) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      url: generateContentUrl(item),
      score: item.score,
      highlights: [],
    }));
  } catch (error) {
    console.error("Failed to get related content:", error);
    return [];
  }
}
