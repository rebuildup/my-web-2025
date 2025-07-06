// API route for content by type
import { NextRequest } from 'next/server';
import { ContentItem, ContentType } from '@/types/content';
import { AppErrorHandler } from '@/lib/utils/error-handling';
import fs from 'fs/promises';
import path from 'path';

const VALID_CONTENT_TYPES: ContentType[] = [
  'portfolio',
  'blog',
  'plugin',
  'tool',
  'profile',
  'page',
  'asset',
  'download',
];

async function getContentByType(
  type: string,
  options: {
    category?: string;
    limit?: number;
    offset?: number;
    status?: string;
  } = {}
): Promise<ContentItem[]> {
  try {
    const contentPath = path.join(process.cwd(), 'public', 'data', 'content', `${type}.json`);
    const fileContent = await fs.readFile(contentPath, 'utf-8');
    let items: ContentItem[] = JSON.parse(fileContent);

    // Filter by status (default to published only)
    const status = options.status || 'published';
    if (status !== 'all') {
      items = items.filter(item => item.status === status);
    }

    // Filter by category if specified
    if (options.category && options.category !== 'all') {
      items = items.filter(item => item.category === options.category);
    }

    // Sort by priority (highest first), then by publication date (newest first)
    items.sort((a, b) => {
      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;

      const dateA = new Date(a.publishedAt || a.createdAt);
      const dateB = new Date(b.publishedAt || b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || items.length;

    return items.slice(offset, offset + limit);
  } catch (error) {
    console.error(`Failed to load ${type} content:`, error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
): Promise<Response> {
  try {
    const { type } = params;

    // Validate content type
    if (!VALID_CONTENT_TYPES.includes(type as ContentType)) {
      return Response.json(
        {
          success: false,
          error: `Invalid content type: ${type}`,
          validTypes: VALID_CONTENT_TYPES,
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status') || 'published';

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

    // Get content
    const items = await getContentByType(type, {
      category,
      limit,
      offset,
      status,
    });

    // Get total count for pagination (without limit/offset)
    const totalItems = await getContentByType(type, { category, status });
    const total = totalItems.length;

    return Response.json({
      success: true,
      data: items,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
      filters: {
        type,
        category: category || 'all',
        status,
      },
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Content API');

    return Response.json(
      {
        success: false,
        error: 'Failed to fetch content',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
): Promise<Response> {
  // Only allow content creation in development
  if (process.env.NODE_ENV !== 'development') {
    return Response.json(
      { success: false, error: 'Content creation is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const { type } = params;

    if (!VALID_CONTENT_TYPES.includes(type as ContentType)) {
      return Response.json(
        { success: false, error: `Invalid content type: ${type}` },
        { status: 400 }
      );
    }

    const contentData = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'description', 'category'];
    for (const field of requiredFields) {
      if (!contentData[field]) {
        return Response.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Set defaults
    const newItem: ContentItem = {
      id: contentData.id || `${type}-${Date.now()}`,
      type: type as ContentType,
      title: contentData.title,
      description: contentData.description,
      category: contentData.category,
      tags: contentData.tags || [],
      status: contentData.status || 'draft',
      priority: contentData.priority || 50,
      createdAt: new Date().toISOString(),
      ...contentData,
    };

    // Load existing content
    const contentPath = path.join(process.cwd(), 'public', 'data', 'content', `${type}.json`);
    let existingItems: ContentItem[] = [];

    try {
      const fileContent = await fs.readFile(contentPath, 'utf-8');
      existingItems = JSON.parse(fileContent);
    } catch {
      // File doesn't exist, start with empty array
    }

    // Check for duplicate ID
    if (existingItems.some(item => item.id === newItem.id)) {
      return Response.json(
        { success: false, error: 'Item with this ID already exists' },
        { status: 409 }
      );
    }

    // Add new item
    existingItems.push(newItem);

    // Save to file
    await fs.writeFile(contentPath, JSON.stringify(existingItems, null, 2));

    return Response.json({
      success: true,
      data: newItem,
      message: 'Content created successfully',
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Content Creation API');

    return Response.json(
      {
        success: false,
        error: 'Failed to create content',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}
