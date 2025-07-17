// Content loading utilities with caching
import fs from 'fs/promises';
import path from 'path';
import { ContentItem, ContentType } from '@/types/content';
import { validateContentItem } from './content-validation';

// In-memory cache for content data
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface ContentCache {
  [key: string]: CacheItem<ContentItem[]>;
}

const contentCache: ContentCache = {};

// Default TTL for cache items (1 hour)
const DEFAULT_TTL = 60 * 60 * 1000;

/**
 * Options for content loading
 */
export interface ContentLoadOptions {
  category?: string;
  tags?: string[];
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'priority' | 'createdAt' | 'publishedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
  useCache?: boolean;
  cacheTTL?: number; // Time to live in milliseconds
}

/**
 * Loads content items by type with filtering, sorting, and pagination
 * @param type Content type to load
 * @param options Loading options
 * @returns Array of content items
 */
export async function getContentByType(
  type: ContentType,
  options: ContentLoadOptions = {}
): Promise<ContentItem[]> {
  const {
    category,
    tags,
    status = 'published',
    limit,
    offset = 0,
    sortBy = 'priority',
    sortOrder = 'desc',
    useCache = true,
    cacheTTL = DEFAULT_TTL,
  } = options;

  // Generate cache key based on parameters
  const cacheKey = generateCacheKey(type, { category, tags, status, sortBy, sortOrder });

  // Check cache if enabled
  if (useCache && contentCache[cacheKey] && !isCacheExpired(contentCache[cacheKey])) {
    const cachedItems = contentCache[cacheKey].data;
    return applyPagination(cachedItems, offset, limit);
  }

  try {
    // Load content from file
    const contentPath = path.join(process.cwd(), 'public', 'data', 'content', `${type}.json`);
    const fileContent = await fs.readFile(contentPath, 'utf-8');
    let items: ContentItem[] = JSON.parse(fileContent);

    // Validate each item
    const validItems: ContentItem[] = [];
    for (const item of items) {
      const validation = validateContentItem(item);
      if (validation.isValid) {
        validItems.push(item);
      } else {
        console.warn(`Invalid content item (${item.id}):`, validation.errors);
      }
    }
    items = validItems;

    // Apply filters
    items = filterItems(items, { category, tags, status });

    // Apply sorting
    items = sortItems(items, sortBy, sortOrder);

    // Update cache if enabled
    if (useCache) {
      contentCache[cacheKey] = {
        data: items,
        timestamp: Date.now(),
        ttl: cacheTTL,
      };
    }

    // Apply pagination and return
    return applyPagination(items, offset, limit);
  } catch (error) {
    console.error(`Failed to load ${type} content:`, error);
    return [];
  }
}

/**
 * Filters content items based on category, tags, and status
 */
function filterItems(
  items: ContentItem[],
  filters: { category?: string; tags?: string[]; status?: string }
): ContentItem[] {
  const { category, tags, status } = filters;
  let filteredItems = [...items];

  // Filter by status
  if (status && status !== 'all') {
    filteredItems = filteredItems.filter(item => item.status === status);
  }

  // Filter by category
  if (category && category !== 'all') {
    filteredItems = filteredItems.filter(item => item.category === category);
  }

  // Filter by tags (items must have ALL specified tags)
  if (tags && tags.length > 0) {
    filteredItems = filteredItems.filter(item => tags.every(tag => item.tags.includes(tag)));
  }

  return filteredItems;
}

/**
 * Sorts content items by the specified field and order
 */
function sortItems(
  items: ContentItem[],
  sortBy: string = 'priority',
  sortOrder: 'asc' | 'desc' = 'desc'
): ContentItem[] {
  return [...items].sort((a, b) => {
    let valueA: unknown;
    let valueB: unknown;

    // Handle special cases for dates
    if (sortBy === 'publishedAt') {
      valueA = a.publishedAt ? new Date(a.publishedAt).getTime() : new Date(a.createdAt).getTime();
      valueB = b.publishedAt ? new Date(b.publishedAt).getTime() : new Date(b.createdAt).getTime();
    } else if (sortBy === 'createdAt') {
      valueA = new Date(a.createdAt).getTime();
      valueB = new Date(b.createdAt).getTime();
    } else {
      // Handle other fields
      valueA = (a as unknown as Record<string, unknown>)[sortBy];
      valueB = (b as unknown as Record<string, unknown>)[sortBy];
    }

    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    }

    // Handle number comparison
    return sortOrder === 'asc'
      ? (valueA as number) - (valueB as number)
      : (valueB as number) - (valueA as number);
  });
}

/**
 * Applies pagination to the items
 */
function applyPagination(items: ContentItem[], offset: number = 0, limit?: number): ContentItem[] {
  if (limit === undefined) {
    return items.slice(offset);
  }
  return items.slice(offset, offset + limit);
}

/**
 * Generates a cache key based on content type and filters
 */
function generateCacheKey(
  type: ContentType,
  filters: {
    category?: string;
    tags?: string[];
    status?: string;
    sortBy?: string;
    sortOrder?: string;
  }
): string {
  const { category, tags, status, sortBy, sortOrder } = filters;
  return `${type}:${category || 'all'}:${tags?.join(',') || 'all'}:${status || 'all'}:${sortBy || 'priority'}:${sortOrder || 'desc'}`;
}

/**
 * Checks if a cache item is expired
 */
function isCacheExpired(cacheItem: CacheItem<ContentItem[]>): boolean {
  return Date.now() - cacheItem.timestamp > cacheItem.ttl;
}

/**
 * Clears the content cache for a specific type or all types
 */
export function clearContentCache(type?: ContentType): void {
  if (type) {
    // Clear cache for specific type
    Object.keys(contentCache).forEach(key => {
      if (key.startsWith(`${type}:`)) {
        delete contentCache[key];
      }
    });
  } else {
    // Clear all cache
    Object.keys(contentCache).forEach(key => {
      delete contentCache[key];
    });
  }
}

/**
 * Gets content cache statistics
 */
export function getContentCacheStats(): { keys: string[]; size: number; itemCount: number } {
  const keys = Object.keys(contentCache);
  const itemCount = keys.reduce((count, key) => count + contentCache[key].data.length, 0);

  // Estimate cache size in bytes (rough approximation)
  const size = keys.reduce((total, key) => {
    const item = contentCache[key];
    // Rough size estimation: JSON.stringify and measure length
    return total + JSON.stringify(item.data).length;
  }, 0);

  return {
    keys,
    size,
    itemCount,
  };
}
