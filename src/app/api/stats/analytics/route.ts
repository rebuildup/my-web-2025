import { NextRequest, NextResponse } from "next/server";
import { getStatsSummary } from "@/lib/stats";
import { getContentStatistics } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // const period = searchParams.get("period") || "all"; // all, week, month - TODO: implement period filtering
    const detailed = searchParams.get("detailed") === "true";

    // Get comprehensive statistics
    const [statsSummary, contentStats] = await Promise.all([
      getStatsSummary(),
      getContentStatistics(),
    ]);

    const analytics = {
      overview: {
        totalContent: contentStats.totalItems,
        totalViews: statsSummary.totalViews,
        totalDownloads: statsSummary.totalDownloads,
        totalSearches: statsSummary.totalSearches,
        lastUpdated: new Date().toISOString(),
      },
      content: {
        byType: contentStats.itemsByType,
        byStatus: contentStats.itemsByStatus,
      },
      engagement: {
        topContent: statsSummary.topContent,
        topDownloads: statsSummary.topDownloads,
        topQueries: statsSummary.topQueries,
      },
    };

    if (detailed) {
      // Add more detailed analytics
      const detailedAnalytics = {
        ...analytics,
        performance: {
          averageViewsPerContent:
            contentStats.totalItems > 0
              ? Math.round(
                  (statsSummary.totalViews / contentStats.totalItems) * 100,
                ) / 100
              : 0,
          averageDownloadsPerContent:
            contentStats.totalItems > 0
              ? Math.round(
                  (statsSummary.totalDownloads / contentStats.totalItems) * 100,
                ) / 100
              : 0,
          searchToViewRatio:
            statsSummary.totalViews > 0
              ? Math.round(
                  (statsSummary.totalSearches / statsSummary.totalViews) * 100,
                ) / 100
              : 0,
        },
        trends: {
          // In a real implementation, this would calculate trends over time
          viewTrend: "stable", // up, down, stable
          downloadTrend: "stable",
          searchTrend: "stable",
        },
      };

      return NextResponse.json(detailedAnalytics);
    }

    // Set cache headers
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "public, max-age=300, stale-while-revalidate=600",
    );

    return NextResponse.json(analytics, { headers });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
