import { NextRequest, NextResponse } from "next/server";
import { getViewStats, getDownloadStats } from "@/lib/stats";
import { loadContentByType } from "@/lib/data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // const period = searchParams.get("period") || "all"; // TODO: implement period filtering
    const detailed = searchParams.get("detailed") === "true";

    // Get workshop content
    const [blogContent, pluginContent, downloadContent] = await Promise.all([
      loadContentByType("blog"),
      loadContentByType("plugin"),
      loadContentByType("download"),
    ]);

    const allWorkshopContent = [
      ...blogContent,
      ...pluginContent,
      ...downloadContent,
    ].filter((item) => item.status === "published");

    // Get statistics
    const [viewStats, downloadStats] = await Promise.all([
      getViewStats() as Promise<Record<string, number>>,
      getDownloadStats() as Promise<Record<string, number>>,
    ]);

    // Calculate workshop-specific metrics
    const workshopIds = allWorkshopContent.map((item) => item.id);
    const workshopViews = Object.entries(viewStats)
      .filter(([id]) => workshopIds.includes(id))
      .reduce((sum, [, views]) => sum + views, 0);

    const workshopDownloads = Object.entries(downloadStats)
      .filter(([id]) => workshopIds.includes(id))
      .reduce((sum, [, downloads]) => sum + downloads, 0);

    // Get top performing workshop content
    const topWorkshopContent = Object.entries(viewStats)
      .filter(([id]) => workshopIds.includes(id))
      .map(([id, views]) => {
        const content = allWorkshopContent.find((item) => item.id === id);
        return {
          id,
          title: content?.title || "Unknown",
          type: content?.type || "unknown",
          category: content?.category || "uncategorized",
          views,
          downloads: downloadStats[id] || 0,
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Calculate engagement metrics
    const totalWorkshopContent = allWorkshopContent.length;
    const averageViewsPerContent =
      totalWorkshopContent > 0
        ? Math.round((workshopViews / totalWorkshopContent) * 100) / 100
        : 0;
    const averageDownloadsPerContent =
      totalWorkshopContent > 0
        ? Math.round((workshopDownloads / totalWorkshopContent) * 100) / 100
        : 0;

    // Content type breakdown
    const contentByType = allWorkshopContent.reduce(
      (acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Category breakdown
    const contentByCategory = allWorkshopContent.reduce(
      (acc, item) => {
        const category = item.category || "uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Popular tags
    const tagCounts = allWorkshopContent.reduce(
      (acc, item) => {
        item.tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));

    const workshopAnalytics = {
      overview: {
        totalContent: totalWorkshopContent,
        totalViews: workshopViews,
        totalDownloads: workshopDownloads,
        averageViewsPerContent,
        averageDownloadsPerContent,
        lastUpdated: new Date().toISOString(),
      },
      content: {
        byType: contentByType,
        byCategory: contentByCategory,
        topPerforming: topWorkshopContent,
      },
      engagement: {
        popularTags,
        viewToDownloadRatio:
          workshopDownloads > 0
            ? Math.round((workshopViews / workshopDownloads) * 100) / 100
            : 0,
      },
    };

    if (detailed) {
      // Add more detailed analytics for workshop
      const detailedAnalytics = {
        ...workshopAnalytics,
        trends: {
          // In a real implementation, this would calculate trends over time
          contentGrowth: "stable", // up, down, stable
          engagementTrend: "stable",
          popularityTrend: "stable",
        },
        performance: {
          mostViewedType:
            Object.entries(contentByType).reduce((a, b) =>
              contentByType[a[0]] > contentByType[b[0]] ? a : b,
            )?.[0] || "blog",
          mostDownloadedCategory:
            Object.entries(contentByCategory).reduce((a, b) =>
              contentByCategory[a[0]] > contentByCategory[b[0]] ? a : b,
            )?.[0] || "uncategorized",
          engagementScore:
            Math.round(
              (averageViewsPerContent + averageDownloadsPerContent) * 10,
            ) / 10,
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

    return NextResponse.json(workshopAnalytics, { headers });
  } catch (error) {
    console.error("Workshop analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
