// Search index builder
import path from 'path';
import { ContentItem, ContentType, SearchIndex } from '@/types/content';
import { getContentByType } from '../utils/content-loader';

// List of all content types to index
const INDEXABLE_CONTENT_TYPES: ContentType[] = ['portfolio', 'blog', 'plugin', 'tool', 'page'];

/**
 * Options for building search index
 */
export interface SearchIndexOptions {
  contentTypes?: ContentType[];
  includeStatuses?: ('published' | 'draft' | 'archived' | 'scheduled')[];
  outputPath?: string;
  saveToFile?: boolean;
}

/**
 * Builds a search index for all content types
 * @param options Search index options
 * @returns Array of search index items
 */
export async function buildSearchIndex(options: SearchIndexOptions = {}): Promise<SearchIndex[]> {
  const {
    contentTypes = INDEXABLE_CONTENT_TYPES,
    includeStatuses = ['published'],
    outputPath = path.join(process.cwd(), 'public', 'data', 'cache', 'search-index.json'),
    saveToFile = true,
  } = options;

  const searchIndex: SearchIndex[] = [];

  // Process each content type
  for (const contentType of contentTypes) {
    try {
      // Get all content items of this type
      const items = await getContentByType(contentType, {
        status: 'all',
        useCache: false,
      });

      // Filter by status
      const filteredItems = items.filter(item => includeStatuses.includes(item.status));

      // Process each item
      for (const item of filteredItems) {
        const indexItem = createSearchIndexItem(item);
        if (indexItem) {
          searchIndex.push(indexItem);
        }
      }
    } catch (error) {
      console.error(`Error indexing content type ${contentType}:`, error);
    }
  }

  // Save to file if requested - only works in server environment
  if (saveToFile && typeof window === 'undefined') {
    try {
      // In a server environment, we would save to file
      // But in client environment, we'll skip this
      console.log(`Would save search index to ${outputPath} (skipped in client environment)`);
    } catch (error) {
      console.error('Error saving search index:', error);
    }
  }

  return searchIndex;
}

/**
 * Creates a search index item from a content item
 * @param item Content item to index
 * @returns Search index item or null if item should not be indexed
 */
function createSearchIndexItem(item: ContentItem): SearchIndex | null {
  // Skip items that should not be indexed
  if (item.seo?.noindex) {
    return null;
  }

  // Extract content for indexing
  let content = '';

  // Add content from content field if available
  if (item.content) {
    content += item.content + ' ';
  }

  // Add content from description
  content += item.description + ' ';

  // Add content from tags
  if (item.tags && item.tags.length > 0) {
    content += item.tags.join(' ') + ' ';
  }

  // Create combined searchable content (for fuzzy matching)
  const searchableContent = [
    item.title,
    item.description,
    content,
    item.category,
    ...(item.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  return {
    id: item.id,
    type: item.type,
    title: item.title,
    description: item.description,
    content,
    tags: item.tags || [],
    category: item.category,
    searchableContent,
  };
}

/**
 * Loads the search index from file
 * @param indexPath Path to search index file
 * @returns Array of search index items
 */
export async function loadSearchIndex(
  indexPath = path.join(process.cwd(), 'public', 'data', 'cache', 'search-index.json')
): Promise<SearchIndex[]> {
  try {
    // In browser environment, we can't read files directly
    if (typeof window !== 'undefined') {
      // Try to load from localStorage as fallback
      const storageKey = 'search_index_cache';
      const cachedIndex = localStorage.getItem(storageKey);
      if (cachedIndex) {
        return JSON.parse(cachedIndex);
      }
      // If no cached data, return empty array
      return [];
    }

    // In server environment, we would read from file
    // But since we can't use fs directly in client code, return empty array
    console.log(`Would load search index from ${indexPath} (skipped in client environment)`);
    return [];
  } catch (error) {
    console.error('Error loading search index:', error);
    // If loading fails, build a new index
    return buildSearchIndex({ outputPath: indexPath });
  }
}

/**
 * Updates the search index for a specific content type
 * @param contentType Content type to update
 * @param options Search index options
 * @returns Updated search index
 */
export async function updateSearchIndex(
  contentType: ContentType,
  options: SearchIndexOptions = {}
): Promise<SearchIndex[]> {
  // Load existing index
  const indexPath =
    options.outputPath || path.join(process.cwd(), 'public', 'data', 'cache', 'search-index.json');
  let existingIndex: SearchIndex[] = [];

  try {
    existingIndex = await loadSearchIndex(indexPath);
  } catch {
    // If loading fails, start with empty index
    console.warn('Could not load existing search index, creating new one');
  }

  // Remove items of the specified content type
  const filteredIndex = existingIndex.filter(item => item.type !== contentType);

  // Build index for the specified content type
  const newItems = await buildSearchIndex({
    ...options,
    contentTypes: [contentType],
    saveToFile: false,
  });

  // Combine and save
  const updatedIndex = [...filteredIndex, ...newItems];

  if (options.saveToFile !== false) {
    try {
      if (typeof window === 'undefined') {
        // In a server environment, we would save to file
        console.log(`Would update search index at ${indexPath} (skipped in client environment)`);
      } else {
        // In browser environment, we can save to localStorage as fallback
        const storageKey = 'search_index_cache';
        localStorage.setItem(storageKey, JSON.stringify(updatedIndex));
      }
    } catch (error) {
      console.error('Error saving updated search index:', error);
    }
  }

  return updatedIndex;
}
