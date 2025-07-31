/**
 * Tag Statistics API Endpoint
 * Provides analytics and statistics for portfolio tags
 */

import { portfolioTagManager } from "@/lib/portfolio/tag-management";
import { NextResponse } from "next/server";

// GET /api/admin/tags/stats - Get tag statistics
export async function GET() {
  try {
    const stats = await portfolioTagManager.getTagStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching tag statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tag statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
