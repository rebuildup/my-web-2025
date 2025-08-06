import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

const SEARCH_STATS_PATH = path.join(
  process.cwd(),
  "public/data/stats/search-stats.json",
);

interface SearchStats {
  [query: string]: number;
}

/**
 * GET /api/search/analytics - Get search analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const data = await fs.readFile(SEARCH_STATS_PATH, "utf-8");
    const stats: SearchStats = JSON.parse(data);

    // Sort by frequency and limit results
    const sortedStats = Object.entries(stats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));

    return NextResponse.json({
      popularQueries: sortedStats,
      totalQueries: Object.keys(stats).length,
      totalSearches: Object.values(stats).reduce(
        (sum, count) => sum + count,
        0,
      ),
    });
  } catch (error) {
    console.error("Search analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/search/analytics - Track search query
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required in request body" },
        { status: 400 },
      );
    }

    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return NextResponse.json(
        { error: "Query cannot be empty" },
        { status: 400 },
      );
    }

    // Load existing stats
    let stats: SearchStats = {};
    try {
      const data = await fs.readFile(SEARCH_STATS_PATH, "utf-8");
      stats = JSON.parse(data);
    } catch {
      // File doesn't exist, start with empty stats
      stats = {};
    }

    // Update query count
    stats[normalizedQuery] = (stats[normalizedQuery] || 0) + 1;

    // Save updated stats
    await fs.writeFile(SEARCH_STATS_PATH, JSON.stringify(stats, null, 2));

    return NextResponse.json({
      success: true,
      query: normalizedQuery,
      count: stats[normalizedQuery],
    });
  } catch (error) {
    console.error("Search analytics tracking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
