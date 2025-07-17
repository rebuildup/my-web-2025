// Search API route
import { NextRequest } from 'next/server';
import { ContentType } from '@/types/content';
import { search, SearchOptions } from '@/lib/search/search-engine';
import { AppErrorHandler } from '@/lib/utils/error-handling';
import fs from 'fs/promises';
import path from 'path';

// Track search queries for analytics
async function trackSearchQuery(query: string): Promise<void> {
  try {
    const statsPath = path.join(process.cwd(), 'public', 'data', 'stats', 'search-stats.json');
    let stats: Record<string, number> = {};

    try {
      // Try to read existing stats
      const data = await fs.readFile(statsPath, 'utf-8');
      stats = JSON.parse(data);
    } catch {
      // File doesn't exist or is invalid, start with empty stats
    }

    // Update stats
    stats[query] = (stats[query] || 0) + 1;

    // Ensure directory exists
    await fs.mkdir(path.dirname(statsPath), { recursive: true });

    // Write updated stats
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error tracking search query:', error);
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const contentTypes = url.searchParams.getAll('type') as ContentType[];
    const categories = url.searchParams.getAll('category');
    const tags = url.searchParams.getAll('tag');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const fuzzy = url.searchParams.get('fuzzy') !== 'false';
    const highlightMatches = url.searchParams.get('highlight') !== 'false';

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return Response.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return Response.json(
        { success: false, error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Perform search
    const searchOptions: SearchOptions = {
      query,
      contentTypes: contentTypes.length > 0 ? contentTypes : undefined,
      categories: categories.length > 0 ? categories : undefined,
      tags: tags.length > 0 ? tags : undefined,
      limit,
      offset,
      fuzzy,
      highlightMatches,
    };

    const results = await search(searchOptions);

    // Track search query (non-blocking)
    if (query.trim()) {
      trackSearchQuery(query).catch(console.error);
    }

    // Return results
    return Response.json({
      success: true,
      data: results.results,
      pagination: {
        limit: results.limit,
        offset: results.offset,
        total: results.total,
        hasMore: results.hasMore,
      },
      query: results.query,
      executionTimeMs: results.executionTimeMs,
      suggestedQueries: results.suggestedQueries,
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Search API');

    return Response.json(
      {
        success: false,
        error: 'Failed to perform search',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json();
    const {
      query,
      contentTypes,
      categories,
      tags,
      limit = 10,
      offset = 0,
      fuzzy = true,
      highlightMatches = true,
    } = body;

    // Validate required fields
    if (!query) {
      return Response.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return Response.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return Response.json(
        { success: false, error: 'Offset must be non-negative' },
        { status: 400 }
      );
    }

    // Perform search
    const searchOptions: SearchOptions = {
      query,
      contentTypes,
      categories,
      tags,
      limit,
      offset,
      fuzzy,
      highlightMatches,
    };

    const results = await search(searchOptions);

    // Track search query (non-blocking)
    if (query.trim()) {
      trackSearchQuery(query).catch(console.error);
    }

    // Return results
    return Response.json({
      success: true,
      data: results.results,
      pagination: {
        limit: results.limit,
        offset: results.offset,
        total: results.total,
        hasMore: results.hasMore,
      },
      query: results.query,
      executionTimeMs: results.executionTimeMs,
      suggestedQueries: results.suggestedQueries,
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Search API');

    return Response.json(
      {
        success: false,
        error: 'Failed to perform search',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}
