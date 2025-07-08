// API route for content search
import { NextRequest } from 'next/server';
import { ContentType, SearchResult } from '@/types/content';
import { AppErrorHandler } from '@/lib/utils/error-handling';

export async function POST(request: Request): Promise<Response> {
  try {
    const { searchContent, advancedSearch, updateSearchStats } = await import('@/lib/search');
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

    // Validate required fields
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Query is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Validate optional parameters
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
        // Use advanced search for complex queries
        results = await advancedSearch({
          query: query.trim(),
          type: type ? (Array.isArray(type) ? type : [type]) : undefined,
          category: category ? (Array.isArray(category) ? category : [category]) : undefined,
          tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
          limit,
        });
      } else {
        // Use basic search
        results = await searchContent(query.trim(), {
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

    // Update search statistics (async, don't wait for completion)
    updateSearchStats(query.trim()).catch(error => {
      console.warn('Failed to update search stats:', error);
    });

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
    return Response.json(
      {
        success: false,
        error: 'Search operation failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const { searchContent, updateSearchStats } = await import('@/lib/search');
    // Handle GET requests for simple searches via query parameters
    let urlObj;
    if (request.url) {
      urlObj = new URL(request.url);
    } else {
      // テスト環境などでrequest.urlが未定義の場合
      const host = request.headers.get('host') || 'localhost:3000';
      urlObj = new URL(`http://${host}/`);
    }
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
      results = await searchContent(query, {
        type: type as ContentType,
        category: category || undefined,
        limit,
      });
    } catch (searchError) {
      console.warn('Search operation failed:', searchError);
      results = [];
    }

    // Update search statistics (async)
    updateSearchStats(query).catch(error => {
      console.warn('Failed to update search stats:', error);
    });

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
    return Response.json(
      {
        success: false,
        error: 'Search operation failed',
      },
      { status: 500 }
    );
  }
}
