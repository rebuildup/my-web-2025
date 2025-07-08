// API route for statistics by type
import { NextRequest } from 'next/server';
import { AppErrorHandler } from '@/lib/utils/error-handling';
import fs from 'fs/promises';
import path from 'path';

const VALID_STAT_TYPES = ['download', 'view', 'search'] as const;
type StatType = (typeof VALID_STAT_TYPES)[number];

async function loadStats(filePath: string): Promise<Record<string, number>> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // File doesn't exist or is invalid, return empty stats
    console.warn(`Failed to load stats from ${filePath}:`, error);
    return {};
  }
}

async function saveStats(filePath: string, stats: Record<string, number>): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Save stats with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(stats, null, 2));
  } catch (error) {
    throw new Error(`Failed to save stats: ${error}`);
  }
}

function getStatsFilePath(type: StatType): string {
  return path.join(process.cwd(), 'public', 'data', 'stats', `${type}-stats.json`);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
): Promise<Response> {
  try {
    const { type } = await params;

    // Validate stat type
    if (!VALID_STAT_TYPES.includes(type as StatType)) {
      return Response.json(
        {
          success: false,
          error: `Invalid stat type: ${type}`,
          validTypes: VALID_STAT_TYPES,
        },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    const statsPath = getStatsFilePath(type as StatType);
    const stats = await loadStats(statsPath);

    if (id) {
      // Return specific stat
      const count = stats[id] || 0;
      return Response.json({
        success: true,
        data: count,
        id,
        type,
      });
    } else {
      // Return all stats
      return Response.json({
        success: true,
        data: stats,
        type,
        total: Object.values(stats).reduce((sum, count) => sum + count, 0),
        itemCount: Object.keys(stats).length,
      });
    }
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, `Stats GET API - ${(await params).type}`);

    return Response.json(
      {
        success: false,
        error: 'Failed to get statistics',
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
  try {
    const { type } = await params;

    // Validate stat type
    if (!VALID_STAT_TYPES.includes(type as StatType)) {
      return Response.json(
        {
          success: false,
          error: `Invalid stat type: ${type}`,
          validTypes: VALID_STAT_TYPES,
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { id } = body;

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return Response.json(
        { success: false, error: 'ID is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const cleanId = id.trim();
    const statsPath = getStatsFilePath(type as StatType);

    // Load current stats
    const stats = await loadStats(statsPath);

    // Increment count
    stats[cleanId] = (stats[cleanId] || 0) + 1;

    // Save updated stats
    await saveStats(statsPath, stats);

    return Response.json({
      success: true,
      data: {
        id: cleanId,
        count: stats[cleanId],
        type,
      },
      message: `${type} stat updated successfully`,
    });
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, `Stats POST API - ${(await params).type}`);

    return Response.json(
      {
        success: false,
        error: 'Failed to update statistics',
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
  // Only allow deletion in development
  if (process.env.NODE_ENV !== 'development') {
    return Response.json(
      { success: false, error: 'Stat deletion is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    const { type } = await params;

    if (!VALID_STAT_TYPES.includes(type as StatType)) {
      return Response.json(
        { success: false, error: `Invalid stat type: ${type}` },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    const statsPath = getStatsFilePath(type as StatType);
    const stats = await loadStats(statsPath);

    if (id) {
      // Delete specific stat
      if (stats[id]) {
        delete stats[id];
        await saveStats(statsPath, stats);

        return Response.json({
          success: true,
          message: `Stat for ${id} deleted successfully`,
        });
      } else {
        return Response.json(
          { success: false, error: `Stat for ${id} not found` },
          { status: 404 }
        );
      }
    } else {
      // Clear all stats
      await saveStats(statsPath, {});

      return Response.json({
        success: true,
        message: `All ${type} stats cleared successfully`,
      });
    }
  } catch (error) {
    const appError = AppErrorHandler.handleApiError(error);
    AppErrorHandler.logError(appError, `Stats DELETE API - ${(await params).type}`);

    return Response.json(
      {
        success: false,
        error: 'Failed to delete statistics',
        code: appError.code,
      },
      { status: 500 }
    );
  }
}
