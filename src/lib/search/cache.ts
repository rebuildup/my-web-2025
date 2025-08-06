/**
 * Search Result Caching System
 * Implements in-memory and persistent caching for search results
 */

import type { ContentType, SearchResult } from "@/types";
import { promises as fs } from "fs";
import path from "path";

// In-memory cache for search results
const searchResultCache = new Map<
  string,
  {
    results: SearchResult[];
    timestamp: number;
    ttl: number;
  }
>();

const CACHE_DIR = path.join(process.cwd(), "public/data/cache");
const SEARCH_CACHE_PATH = path.join(CACHE_DIR, "search-results.json");
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached queries

/**
 * Generate cache key for search parameters
 */
function generateCacheKey(
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
    includeContent?: boolean;
    threshold?: number;
  },
): string {
  const normalizedQuery = query.toLowerCase().trim();
  const optionsStr = JSON.stringify({
    type: options.type || "",
    category: options.category || "",
    limit: options.limit || 10,
    includeContent: options.includeContent || false,
    threshold: options.threshold || 0.3,
  });

  return `${normalizedQuery}:${Buffer.from(optionsStr).toString("base64")}`;
}

/**
 * Get cached search results
 */
export function getCachedSearchResults(
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
    includeContent?: boolean;
    threshold?: number;
  },
): SearchResult[] | null {
  const cacheKey = generateCacheKey(query, options);
  const cached = searchResultCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  const now = Date.now();
  if (now - cached.timestamp > cached.ttl) {
    // Cache expired
    searchResultCache.delete(cacheKey);
    return null;
  }

  return cached.results;
}

/**
 * Cache search results
 */
export function cacheSearchResults(
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
    includeContent?: boolean;
    threshold?: number;
  },
  results: SearchResult[],
  ttl: number = DEFAULT_TTL,
): void {
  const cacheKey = generateCacheKey(query, options);

  // Implement LRU eviction if cache is full
  if (searchResultCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = searchResultCache.keys().next().value;
    if (oldestKey) {
      searchResultCache.delete(oldestKey);
    }
  }

  searchResultCache.set(cacheKey, {
    results,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Clear search result cache
 */
export function clearSearchResultCache(): void {
  searchResultCache.clear();
}

/**
 * Get cache statistics
 */
export function getSearchCacheStats(): {
  size: number;
  maxSize: number;
  hitRate: number;
  entries: Array<{
    key: string;
    timestamp: number;
    ttl: number;
    resultCount: number;
  }>;
} {
  const entries = Array.from(searchResultCache.entries()).map(
    ([key, value]) => ({
      key: key.split(":")[0], // Only show the query part
      timestamp: value.timestamp,
      ttl: value.ttl,
      resultCount: value.results.length,
    }),
  );

  return {
    size: searchResultCache.size,
    maxSize: MAX_CACHE_SIZE,
    hitRate: 0, // Would need to track hits/misses for accurate calculation
    entries,
  };
}

/**
 * Persist cache to disk (for server restarts)
 */
export async function persistSearchCache(): Promise<boolean> {
  try {
    const cacheData = Array.from(searchResultCache.entries()).map(
      ([key, value]) => ({
        key,
        results: value.results,
        timestamp: value.timestamp,
        ttl: value.ttl,
      }),
    );

    await fs.writeFile(SEARCH_CACHE_PATH, JSON.stringify(cacheData, null, 2));
    return true;
  } catch (error) {
    console.error("Failed to persist search cache:", error);
    return false;
  }
}

/**
 * Load cache from disk
 */
export async function loadPersistedSearchCache(): Promise<boolean> {
  try {
    const data = await fs.readFile(SEARCH_CACHE_PATH, "utf-8");
    const cacheData = JSON.parse(data);

    const now = Date.now();

    for (const item of cacheData) {
      // Only load non-expired entries
      if (now - item.timestamp < item.ttl) {
        searchResultCache.set(item.key, {
          results: item.results,
          timestamp: item.timestamp,
          ttl: item.ttl,
        });
      }
    }

    return true;
  } catch {
    // Cache file doesn't exist or is corrupted, that's okay
    return false;
  }
}

/**
 * Preload popular searches
 */
export async function preloadPopularSearches(): Promise<void> {
  try {
    // Load search stats to find popular queries
    const statsPath = path.join(
      process.cwd(),
      "public/data/stats/search-stats.json",
    );
    const statsData = await fs.readFile(statsPath, "utf-8");
    const stats = JSON.parse(statsData);

    // Get top 10 most popular queries
    const popularQueries = Object.entries(stats)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([query]) => query);

    console.log(`Preloading ${popularQueries.length} popular searches...`);

    // This would need to be implemented with the actual search function
    // For now, just log the queries that should be preloaded
    for (const query of popularQueries) {
      console.log(`Should preload: "${query}"`);
    }
  } catch (error) {
    console.error("Failed to preload popular searches:", error);
  }
}
