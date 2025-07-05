// Search functionality using Fuse.js
import Fuse from 'fuse.js';
import { ContentItem, ContentType, SearchIndex, SearchResult } from '@/types/content';
import { AppErrorHandler } from '@/lib/utils/error-handling';

// Load search index from public data
export const loadSearchIndex = async (): Promise<SearchIndex[]> => {
  try {
    const response = await fetch('/data/cache/search-index.json');
    if (!response.ok) {
      throw new Error(`Failed to load search index: ${response.status}`);
    }
    
    const data = await response.json();
    return data.index || [];
  } catch (error) {
    console.error('Failed to load search index:', error);
    return [];
  }
};

// Generate URL for content item
export const generateContentUrl = (item: SearchIndex | ContentItem): string => {
  switch (item.type) {
    case 'portfolio':
      return `/portfolio/detail/${item.id}`;
    case 'tool':
      return `/tools/${item.id}`;
    case 'blog':
      return `/workshop/blog/${item.id}`;
    case 'plugin':
      return `/workshop/plugins/${item.id}`;
    case 'profile':
      return `/about/profile/${item.id}`;
    case 'page':
      return `/${item.id}`;
    default:
      return `/${item.type}/${item.id}`;
  }
};

// Build search index from content data
export const buildSearchIndex = async (): Promise<SearchIndex[]> => {
  try {
    const contentTypes: ContentType[] = ['portfolio', 'blog', 'plugin', 'tool', 'profile'];
    const searchIndex: SearchIndex[] = [];

    for (const type of contentTypes) {
      try {
        const response = await fetch(`/data/content/${type}.json`);
        if (!response.ok) continue;

        const data = await response.json();
        const items: ContentItem[] = Array.isArray(data) ? data : data.items || [];

        items.forEach((item) => {
          if (item.status === 'published') {
            const searchableContent = [
              item.title,
              item.description,
              item.content || '',
              ...(item.tags || []),
              item.category || '',
            ].join(' ').toLowerCase();

            searchIndex.push({
              id: item.id,
              type: item.type,
              title: item.title,
              description: item.description,
              content: item.content || '',
              tags: item.tags || [],
              category: item.category || '',
              searchableContent,
            });
          }
        });
      } catch (error) {
        console.warn(`Failed to load ${type} content for search index:`, error);
      }
    }

    return searchIndex;
  } catch (error) {
    console.error('Failed to build search index:', error);
    return [];
  }
};

// Main search function
export const searchContent = async (
  query: string,
  options: {
    type?: ContentType;
    category?: string;
    limit?: number;
    threshold?: number;
    includeContent?: boolean;
  } = {}
): Promise<SearchResult[]> => {
  const {
    type,
    category,
    limit = 10,
    threshold = 0.3,
    includeContent = false,
  } = options;

  if (!query.trim()) {
    return [];
  }

  try {
    // Load search index
    const searchIndex = await loadSearchIndex();
    if (searchIndex.length === 0) {
      return [];
    }

    // Filter by type and category
    let filteredIndex = searchIndex;
    
    if (type) {
      filteredIndex = filteredIndex.filter((item) => item.type === type);
    }
    
    if (category) {
      filteredIndex = filteredIndex.filter((item) => item.category === category);
    }

    // Configure Fuse.js search options
    const fuseOptions: Fuse.IFuseOptions<SearchIndex> = {
      keys: [
        { name: 'title', weight: 0.4 },
        { name: 'description', weight: 0.3 },
        { name: 'tags', weight: 0.2 },
        { name: 'category', weight: 0.1 },
      ],
      threshold,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      findAllMatches: true,
    };

    // Add content to search if requested
    if (includeContent) {
      fuseOptions.keys?.push({ name: 'content', weight: 0.1 });
    }

    // Create Fuse instance and perform search
    const fuse = new Fuse(filteredIndex, fuseOptions);
    const results = fuse.search(query);

    // Transform results
    const searchResults: SearchResult[] = results
      .slice(0, limit)
      .map((result) => ({
        id: result.item.id,
        type: result.item.type,
        title: result.item.title,
        description: result.item.description,
        url: generateContentUrl(result.item),
        score: result.score || 0,
        highlights: result.matches?.map((match) => match.value || '') || [],
      }));

    return searchResults;
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Search Content');
    return [];
  }
};

// Advanced search with multiple criteria
export const advancedSearch = async (
  criteria: {
    query?: string;
    type?: ContentType[];
    category?: string[];
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }
): Promise<SearchResult[]> => {
  try {
    const searchIndex = await loadSearchIndex();
    let filteredIndex = searchIndex;

    // Filter by multiple types
    if (criteria.type && criteria.type.length > 0) {
      filteredIndex = filteredIndex.filter((item) =>
        criteria.type!.includes(item.type)
      );
    }

    // Filter by multiple categories
    if (criteria.category && criteria.category.length > 0) {
      filteredIndex = filteredIndex.filter((item) =>
        criteria.category!.includes(item.category)
      );
    }

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      filteredIndex = filteredIndex.filter((item) =>
        criteria.tags!.some((tag) => item.tags.includes(tag))
      );
    }

    // If no query, return filtered results
    if (!criteria.query) {
      return filteredIndex
        .slice(0, criteria.limit || 10)
        .map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          url: generateContentUrl(item),
          score: 0,
          highlights: [],
        }));
    }

    // Perform text search on filtered results
    const fuse = new Fuse(filteredIndex, {
      keys: ['title', 'description', 'tags', 'category'],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
    });

    const results = fuse.search(criteria.query);

    return results
      .slice(0, criteria.limit || 10)
      .map((result) => ({
        id: result.item.id,
        type: result.item.type,
        title: result.item.title,
        description: result.item.description,
        url: generateContentUrl(result.item),
        score: result.score || 0,
        highlights: result.matches?.map((match) => match.value || '') || [],
      }));
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Advanced Search');
    return [];
  }
};

// Get search suggestions
export const getSearchSuggestions = async (
  query: string,
  limit: number = 5
): Promise<string[]> => {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  try {
    const searchIndex = await loadSearchIndex();
    const suggestions = new Set<string>();

    // Extract title words
    searchIndex.forEach((item) => {
      const words = item.title.toLowerCase().split(/\s+/);
      words.forEach((word) => {
        if (word.includes(query.toLowerCase()) && word.length > 2) {
          suggestions.add(word);
        }
      });

      // Add tags that match
      item.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  } catch (error) {
    console.error('Failed to get search suggestions:', error);
    return [];
  }
};

// Get popular search terms
export const getPopularSearchTerms = async (limit: number = 10): Promise<string[]> => {
  try {
    const response = await fetch('/data/stats/search-stats.json');
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const terms = Object.entries(data)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, limit)
      .map(([term]) => term);

    return terms;
  } catch (error) {
    console.error('Failed to get popular search terms:', error);
    return [];
  }
};

// Update search statistics
export const updateSearchStats = async (query: string): Promise<void> => {
  if (!query.trim()) return;

  try {
    await fetch('/api/stats/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: query.toLowerCase() }),
    });
  } catch (error) {
    console.error('Failed to update search stats:', error);
  }
};

// Clear search cache
export const clearSearchCache = (): void => {
  if (typeof window !== 'undefined') {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('search_'));
    keys.forEach(key => localStorage.removeItem(key));
  }
};

// Export search cache
export const exportSearchData = async (): Promise<{ index: SearchIndex[], stats: any }> => {
  try {
    const [index, statsResponse] = await Promise.all([
      loadSearchIndex(),
      fetch('/data/stats/search-stats.json').then(r => r.json()).catch(() => ({}))
    ]);

    return { index, stats: statsResponse };
  } catch (error) {
    console.error('Failed to export search data:', error);
    return { index: [], stats: {} };
  }
};