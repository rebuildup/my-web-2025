/**
 * Search System
 * Based on documents/01_global.md specifications
 */

import { promises as fs } from "fs";
import path from "path";
import type { ContentType, SearchIndex, SearchResult } from "@/types";
import { loadAllContent } from "@/lib/data";

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
      "utf-8"
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
 * Search content with fuzzy matching
 */
export async function searchContent(
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
    includeContent?: boolean;
    threshold?: number;
  } = {}
): Promise<SearchResult[]> {
  try {
    const { type, category, limit = 10, includeContent = false } = options;

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
        (item) => item.category === category
      );
    }

    // Simple fuzzy search implementation
    const results: Array<
      SearchIndex & { score: number; highlights: string[] }
    > = [];

    for (const item of filteredIndex) {
      const searchText = includeContent
        ? item.searchableContent
        : `${item.title} ${item.description} ${item.tags.join(" ")} ${item.category}`.toLowerCase();

      // Calculate relevance score
      let score = 0;
      const highlights: string[] = [];

      // Exact match in title (highest priority)
      if (item.title.toLowerCase().includes(normalizedQuery)) {
        score += 10;
        highlights.push(item.title);
      }

      // Exact match in description
      if (item.description.toLowerCase().includes(normalizedQuery)) {
        score += 5;
        highlights.push(item.description);
      }

      // Match in tags
      for (const tag of item.tags) {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          score += 3;
          highlights.push(tag);
        }
      }

      // Match in category
      if (item.category.toLowerCase().includes(normalizedQuery)) {
        score += 2;
        highlights.push(item.category);
      }

      // Match in content (if includeContent is true)
      if (
        includeContent &&
        item.content.toLowerCase().includes(normalizedQuery)
      ) {
        score += 1;
      }

      // Fuzzy matching for partial matches
      const words = normalizedQuery.split(" ");
      for (const word of words) {
        if (word.length > 2 && searchText.includes(word)) {
          score += 0.5;
        }
      }

      if (score > 0) {
        results.push({ ...item, score, highlights });
      }
    }

    // Sort by score (descending) and limit results
    const sortedResults = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Convert to SearchResult format
    return sortedResults.map((result) => ({
      id: result.id,
      type: result.type,
      title: result.title,
      description: result.description,
      url: generateContentUrl(result),
      score: result.score,
      highlights: result.highlights,
    }));
  } catch (error) {
    console.error("Search failed:", error);
    return [];
  }
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
  };

  const baseUrl = baseUrls[item.type] || "";
  return `${baseUrl}/${item.id}`;
}

/**
 * Get search suggestions based on popular queries and content
 */
export async function getSearchSuggestions(
  query: string,
  limit: number = 5
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
  limit: number = 5
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
        targetItem.tags.includes(tag)
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
