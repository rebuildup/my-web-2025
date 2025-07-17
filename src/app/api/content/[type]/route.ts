// API route for content by type
import { NextRequest } from 'next/server';
import { ContentItem, ContentType } from '@/types/content';
import { AppErrorHandler } from '@/lib/utils/error-handling';
import { getContentByType } from '@/lib/utils/content-loader';
import { validateContentItem } from '@/lib/utils/content-validation';
import { updateSearchIndex } from '@/lib/search/search-index-builder';
import { promises as fs } from 'fs';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
): Promise<Response> {
  try {
    const { type } = await params;

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
    const items = await getContentByType(type as ContentType, {
      category,
      limit,
      offset,
      status,
    });

    // Get total count for pagination (without limit/offset)
    const totalItems = await getContentByType(type as ContentType, { category, status });
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
  { params }: { params: Promise<{ type: string }> }
): Promise<Response> {
  // Only allow content creation in development
  if (process.env.NODE_ENV !== 'development') {
    return Response.json(
      { success: false, error: 'Content creation is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const { type } = await params;

    if (!VALID_CONTENT_TYPES.includes(type as ContentType)) {
      return Response.json(
        { success: false, error: `Invalid content type: ${type}` },
        { status: 400 }
      );
    }

    const contentData = await request.json();

    // Set defaults
    const newItem: ContentItem = {
      id: contentData.id || `${type}-${Date.now()}`,
      type: type as ContentType,
      title: contentData.title || '',
      description: contentData.description || '',
      category: contentData.category || '',
      tags: contentData.tags || [],
      status: contentData.status || 'draft',
      priority: contentData.priority || 50,
      createdAt: new Date().toISOString(),
      ...contentData,
    };

    // Validate the content item
    const validation = validateContentItem(newItem);
    if (!validation.isValid) {
      return Response.json(
        {
          success: false,
          error: 'Content validation failed',
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

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

    // Update search index (non-blocking)
    updateSearchIndex(type as ContentType).catch(err => {
      console.error('Failed to update search index:', err);
    });

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
): Promise<Response> {
  // Only allow content updates in development
  if (process.env.NODE_ENV !== 'development') {
    return Response.json(
      { success: false, error: 'Content updates are only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const { type } = await params;

    if (!VALID_CONTENT_TYPES.includes(type as ContentType)) {
      return Response.json(
        { success: false, error: `Invalid content type: ${type}` },
        { status: 400 }
      );
    }

    const contentData = await request.json();
    const { id } = contentData;

    if (!id) {
      return Response.json(
        { success: false, error: 'ID is required for updates' },
        { status: 400 }
      );
    }

    // Load existing content
    const contentPath = path.join(process.cwd(), 'public', 'data', 'content', `${type}.json`);
    let existingItems: ContentItem[] = [];

    try {
      const fileContent = await fs.readFile(contentPath, 'utf-8');
      existingItems = JSON.parse(fileContent);
    } catch {
      return Response.json(
        { success: false, error: `Content file not found for type: ${type}` },
        { status: 404 }
      );
    }

    // Find the item to update
    const itemIndex = existingItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return Response.json(
        { success: false, error: `Item with ID ${id} not found` },
        { status: 404 }
      );
    }

    // Create updated item
    const updatedItem: ContentItem = {
      ...existingItems[itemIndex],
      ...contentData,
      type: type as ContentType, // Ensure type is not changed
      updatedAt: new Date().toISOString(),
    };

    // Validate the updated item
    const validation = validateContentItem(updatedItem);
    if (!validation.isValid) {
      return Response.json(
        {
          success: false,
          error: 'Content validation failed',
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Update the item
    existingItems[itemIndex] = updatedItem;

    // Save to file
    await fs.writeFile(contentPath, JSON.stringify(existingItems, null, 2));

    // Update search index (non-blocking)
    updateSearchIndex(type as ContentType).catch(err => {
      console.error('Failed to update search index:', err);
    });

    return Response.json({
      success: true,
      data: updatedItem,
      message: 'Content updated successfully',
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Content Update API');

    return Response.json(
      {
        success: false,
        error: 'Failed to update content',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
): Promise<Response> {
  // Only allow content deletion in development
  if (process.env.NODE_ENV !== 'development') {
    return Response.json(
      { success: false, error: 'Content deletion is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const { type } = await params;

    if (!VALID_CONTENT_TYPES.includes(type as ContentType)) {
      return Response.json(
        { success: false, error: `Invalid content type: ${type}` },
        { status: 400 }
      );
    }

    // Get ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return Response.json(
        { success: false, error: 'ID is required for deletion' },
        { status: 400 }
      );
    }

    // Load existing content
    const contentPath = path.join(process.cwd(), 'public', 'data', 'content', `${type}.json`);
    let existingItems: ContentItem[] = [];

    try {
      const fileContent = await fs.readFile(contentPath, 'utf-8');
      existingItems = JSON.parse(fileContent);
    } catch {
      return Response.json(
        { success: false, error: `Content file not found for type: ${type}` },
        { status: 404 }
      );
    }

    // Find the item to delete
    const itemIndex = existingItems.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      return Response.json(
        { success: false, error: `Item with ID ${id} not found` },
        { status: 404 }
      );
    }

    // Store the deleted item for the response
    const deletedItem = existingItems[itemIndex];

    // Remove the item
    existingItems.splice(itemIndex, 1);

    // Save to file
    await fs.writeFile(contentPath, JSON.stringify(existingItems, null, 2));

    // Update search index (non-blocking)
    updateSearchIndex(type as ContentType).catch(err => {
      console.error('Failed to update search index:', err);
    });

    return Response.json({
      success: true,
      data: deletedItem,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Content Deletion API');

    return Response.json(
      {
        success: false,
        error: 'Failed to delete content',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}
