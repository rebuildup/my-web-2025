/**
 * Date Statistics API Endpoint
 * Provides analytics and statistics for portfolio item dates
 */

import { portfolioDateManager } from "@/lib/portfolio/date-management";
import { NextResponse } from "next/server";

// GET /api/admin/dates/stats - Get date statistics
export async function GET() {
  try {
    const stats = await portfolioDateManager.getDateStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching date statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch date statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
