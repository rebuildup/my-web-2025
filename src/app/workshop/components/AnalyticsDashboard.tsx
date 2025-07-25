"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ContentItem } from "@/types/content";
import EngagementMetrics from "./EngagementMetrics";

interface AnalyticsData {
  overview: {
    totalContent: number;
    totalViews: number;
    totalDownloads: number;
    totalSearches: number;
    lastUpdated: string;
  };
  content: {
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
  engagement: {
    topContent: Array<{ id: string; views: number }>;
    topDownloads: Array<{ id: string; downloads: number }>;
    topQueries: Array<{ query: string; count: number }>;
  };
  performance?: {
    averageViewsPerContent: number;
    averageDownloadsPerContent: number;
    searchToViewRatio: number;
  };
}

interface PopularContent {
  id: string;
  title: string;
  type: string;
  views: number;
  downloads: number;
  description: string;
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [popularContent, setPopularContent] = useState<PopularContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Design system classes following root page patterns
  const CardStyle =
    "bg-base border border-foreground block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";
  const Card_description = "noto-sans-jp-light text-xs pb-2";
  const Stats_number = "neue-haas-grotesk-display text-2xl text-accent";
  const Stats_label = "noto-sans-jp-light text-xs";
  const Section_title = "neue-haas-grotesk-display text-2xl text-primary mb-6";

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        // Fetch analytics data
        const analyticsResponse = await fetch(
          "/api/stats/analytics?detailed=true",
        );
        if (!analyticsResponse.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);

        // Fetch popular content details
        const popularContentIds = [
          ...analyticsData.engagement.topContent.map(
            (item: { id: string; views: number }) => item.id,
          ),
          ...analyticsData.engagement.topDownloads.map(
            (item: { id: string; downloads: number }) => item.id,
          ),
        ];

        if (popularContentIds.length > 0) {
          const contentPromises = popularContentIds.map(async (id: string) => {
            try {
              // Try different content types
              const types = ["blog", "plugin", "download"];
              for (const type of types) {
                const response = await fetch(`/api/content/${type}?id=${id}`);
                if (response.ok) {
                  const data = await response.json();
                  const content = data.data?.find(
                    (item: ContentItem) => item.id === id,
                  );
                  if (content) {
                    const viewData = analyticsData.engagement.topContent.find(
                      (item: { id: string; views: number }) => item.id === id,
                    );
                    const downloadData =
                      analyticsData.engagement.topDownloads.find(
                        (item: { id: string; downloads: number }) =>
                          item.id === id,
                      );

                    return {
                      id: content.id,
                      title: content.title,
                      type: content.type,
                      description: content.description,
                      views: viewData?.views || 0,
                      downloads: downloadData?.downloads || 0,
                    };
                  }
                }
              }
              return null;
            } catch {
              return null;
            }
          });

          const contentDetails = await Promise.all(contentPromises);
          const validContent = contentDetails.filter(
            (item): item is PopularContent => item !== null,
          );
          setPopularContent(validContent);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-base border border-foreground p-6">
          <p className="noto-sans-jp-light text-sm text-center">
            アナリティクスデータを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="space-y-6">
        <div className="bg-base border border-foreground p-6">
          <p className="noto-sans-jp-light text-sm text-center text-accent">
            {error || "アナリティクスデータの読み込みに失敗しました"}
          </p>
        </div>
      </div>
    );
  }

  const getContentUrl = (content: PopularContent) => {
    switch (content.type) {
      case "blog":
        return `/workshop/blog/${content.id}`;
      case "plugin":
        return `/workshop/plugins/${content.id}`;
      case "download":
        return `/workshop/downloads/${content.id}`;
      default:
        return "#";
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "blog":
        return "Blog";
      case "plugin":
        return "Plugin";
      case "download":
        return "Download";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-10">
      {/* Overview Statistics */}
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading" className={Section_title}>
          Overview Statistics
        </h2>
        <div className="grid-system grid-2 xs:grid-2 sm:grid-4 gap-6">
          <div className="bg-base border border-foreground p-4 text-center">
            <div className={Stats_number}>
              {analytics.overview.totalContent}
            </div>
            <div className={Stats_label}>総コンテンツ数</div>
          </div>
          <div className="bg-base border border-foreground p-4 text-center">
            <div className={Stats_number}>{analytics.overview.totalViews}</div>
            <div className={Stats_label}>総閲覧数</div>
          </div>
          <div className="bg-base border border-foreground p-4 text-center">
            <div className={Stats_number}>
              {analytics.overview.totalDownloads}
            </div>
            <div className={Stats_label}>総ダウンロード数</div>
          </div>
          <div className="bg-base border border-foreground p-4 text-center">
            <div className={Stats_number}>
              {analytics.overview.totalSearches}
            </div>
            <div className={Stats_label}>総検索数</div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      {analytics.performance && (
        <section aria-labelledby="performance-heading">
          <h2 id="performance-heading" className={Section_title}>
            Performance Metrics
          </h2>
          <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
            <div className="bg-base border border-foreground p-4 text-center">
              <div className={Stats_number}>
                {analytics.performance.averageViewsPerContent}
              </div>
              <div className={Stats_label}>平均閲覧数/コンテンツ</div>
            </div>
            <div className="bg-base border border-foreground p-4 text-center">
              <div className={Stats_number}>
                {analytics.performance.averageDownloadsPerContent}
              </div>
              <div className={Stats_label}>平均DL数/コンテンツ</div>
            </div>
            <div className="bg-base border border-foreground p-4 text-center">
              <div className={Stats_number}>
                {analytics.performance.searchToViewRatio}
              </div>
              <div className={Stats_label}>検索/閲覧比率</div>
            </div>
          </div>
        </section>
      )}

      {/* Content Type Distribution */}
      <section aria-labelledby="content-types-heading">
        <h2 id="content-types-heading" className={Section_title}>
          Content Distribution
        </h2>
        <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
          {Object.entries(analytics.content.byType).map(([type, count]) => (
            <div
              key={type}
              className="bg-base border border-foreground p-4 text-center"
            >
              <div className={Stats_number}>{count}</div>
              <div className={Stats_label}>{getContentTypeLabel(type)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Content */}
      {popularContent.length > 0 && (
        <section aria-labelledby="popular-content-heading">
          <h2 id="popular-content-heading" className={Section_title}>
            Popular Content
          </h2>
          <div className="grid-system grid-1 gap-4">
            {popularContent.slice(0, 5).map((content) => (
              <Link
                key={content.id}
                href={getContentUrl(content)}
                className={CardStyle}
              >
                <div className="flex justify-between items-start">
                  <h3 className={Card_title}>{content.title}</h3>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs text-accent uppercase">
                      {getContentTypeLabel(content.type)}
                    </span>
                    {content.views && (
                      <span className="text-xs text-accent">
                        {content.views} views
                      </span>
                    )}
                    {content.downloads && (
                      <span className="text-xs text-accent">
                        {content.downloads} downloads
                      </span>
                    )}
                  </div>
                </div>
                <p className={Card_description}>{content.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Search Queries */}
      {analytics.engagement.topQueries.length > 0 && (
        <section aria-labelledby="popular-queries-heading">
          <h2 id="popular-queries-heading" className={Section_title}>
            Popular Search Queries
          </h2>
          <div className="bg-base border border-foreground p-4">
            <div className="space-y-3">
              {analytics.engagement.topQueries.map((query, index) => (
                <div
                  key={query.query}
                  className="flex justify-between items-center"
                >
                  <span className="noto-sans-jp-light text-sm">
                    {index + 1}. {query.query}
                  </span>
                  <span className="text-xs text-accent">
                    {query.count} searches
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* User Engagement Metrics */}
      <EngagementMetrics showDetailed={true} />

      {/* Last Updated */}
      <div className="text-center">
        <p className="noto-sans-jp-light text-xs text-accent">
          Last updated:{" "}
          {new Date(analytics.overview.lastUpdated).toLocaleString("ja-JP")}
        </p>
      </div>
    </div>
  );
}
