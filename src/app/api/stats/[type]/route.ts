// Statistics API route
import { NextRequest } from 'next/server';
import { trackStat, getStats, getTopStats } from '@/lib/stats';
import { AppErrorHandler } from '@/lib/utils/error-handling';

// Valid statistic types
const VALID_STAT_TYPES = ['view', 'download', 'search'];

/**
 * GET handler for retrieving statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
): Promise<Response> {
  try {
    const { type } = await params;

    // Validate stat type
    if (!VALID_STAT_TYPES.includes(type)) {
      return Response.json(
        {
          success: false,
          error: `Invalid statistic type: ${type}`,
          validTypes: VALID_STAT_TYPES,
        },
        { status: 400 }
      );
    }

    // Parse query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const top = url.searchParams.get('top');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return Response.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Get stats based on parameters
    let data: unknown;

    if (top === 'true') {
      // Get top stats
      data = await getTopStats(type as import('@/lib/stats').StatType, limit);
    } else if (id) {
      // Get stats for specific ID
      data = await getStats(type as import('@/lib/stats').StatType, id);
    } else {
      // Get all stats
      data = await getStats(type as import('@/lib/stats').StatType);
    }

    return Response.json({
      success: true,
      data,
      type,
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Stats API');

    return Response.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for tracking statistics
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
): Promise<Response> {
  try {
    const { type } = await params;

    // Validate stat type
    if (!VALID_STAT_TYPES.includes(type)) {
      return Response.json(
        {
          success: false,
          error: `Invalid statistic type: ${type}`,
          validTypes: VALID_STAT_TYPES,
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { id } = body;

    // Validate required fields
    if (!id) {
      return Response.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    // Track stat
    const count = await trackStat(type as import('@/lib/stats').StatType, id);

    return Response.json({
      success: true,
      data: {
        id,
        type,
        count,
      },
      message: `${type} tracked successfully`,
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, 'Stats Tracking API');

    return Response.json(
      {
        success: false,
        error: 'Failed to track statistic',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}
