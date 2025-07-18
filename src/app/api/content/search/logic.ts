// src/app/api/content/search/logic.ts
import { ContentType, SearchResult } from '@/types/content';
import { searchContent, advancedSearch, updateSearchStats } from '@/lib/search';

interface SearchDependencies {
  searchContent: typeof searchContent;
  advancedSearch: typeof advancedSearch;
  updateSearchStats: typeof updateSearchStats;
}

export async function handlePostSearch(
  request: Request,
  deps: SearchDependencies
): Promise<Response> {
  try {
    const body = await request.json();
    const {
      query,
      type,
      category,
      tags,
      limit = 10,
      threshold = 0.3,
      includeContent = false,
      advanced = false,
    } = body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    if (limit && (typeof limit !== 'number' || limit < 1 || limit > 50)) {
      return Response.json(
        { success: false, error: 'Limit must be a number between 1 and 50' },
        { status: 400 }
      );
    }
    if (threshold && (typeof threshold !== 'number' || threshold < 0 || threshold > 1)) {
      return Response.json(
        { success: false, error: 'Threshold must be a number between 0 and 1' },
        { status: 400 }
      );
    }

    let results: SearchResult[] = [];
    try {
      if (advanced) {
        results = await deps.advancedSearch({
          query: query.trim(),
          type: type ? (Array.isArray(type) ? type : [type]) : undefined,
          category: category ? (Array.isArray(category) ? category : [category]) : undefined,
          tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
          limit,
        });
      } else {
        results = await deps.searchContent(query.trim(), {
          type: type as ContentType,
          category,
          limit,
          threshold,
          includeContent,
        });
      }
    } catch (searchError) {
      console.warn('Search operation failed:', searchError);
      results = [];
    }

    deps
      .updateSearchStats(query.trim())
      .catch(error => console.warn('Failed to update search stats:', error));

    return Response.json({
      success: true,
      data: results,
      query: query.trim(),
      resultCount: results.length,
      filters: {
        type: type || null,
        category: category || null,
        tags: tags || null,
        limit,
        threshold,
        includeContent,
        advanced,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search API POST error:', error);
    return Response.json({ success: false, error: 'Search operation failed' }, { status: 500 });
  }
}

export async function handleGetSearch(
  request: Request,
  deps: SearchDependencies
): Promise<Response> {
  try {
    const urlObj = new URL(request.url);
    const query = urlObj.searchParams.get('q');
    const type = urlObj.searchParams.get('type');
    const category = urlObj.searchParams.get('category');
    const limit = parseInt(urlObj.searchParams.get('limit') || '10');

    if (!query) {
      return Response.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    let results: SearchResult[] = [];
    try {
      results = await deps.searchContent(query, {
        type: type as ContentType,
        category: category || undefined,
        limit,
      });
    } catch (searchError) {
      console.warn('Search operation failed:', searchError);
      results = [];
    }

    deps
      .updateSearchStats(query)
      .catch(error => console.warn('Failed to update search stats:', error));

    return Response.json({
      success: true,
      data: results,
      query,
      resultCount: results.length,
      filters: {
        type: type || null,
        category: category || null,
        limit,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Search API GET error:', error);
    return Response.json({ success: false, error: 'Search operation failed' }, { status: 500 });
  }
}
