"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Download,
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  Activity,
  Target,
} from "lucide-react";

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

interface PortfolioAnalyticsDashboardProps {
  className?: string;
  detailed?: boolean;
}

export default function PortfolioAnalyticsDashboard({
  className = "",
  detailed = false,
}: PortfolioAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/stats/analytics?detailed=${detailed}`,
          {
            headers: {
              "Cache-Control": "no-cache",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();

    // Refresh analytics every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [detailed]);

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="noto-sans-jp-light text-xs text-foreground">
          分析データを読み込み中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="noto-sans-jp-regular text-sm text-accent mb-2">
          分析データの読み込みに失敗しました
        </div>
        <div className="noto-sans-jp-light text-xs text-foreground">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const portfolioContent = analytics.engagement.topContent.filter((item) =>
    item.id.startsWith("portfolio-"),
  );

  const portfolioDownloads = analytics.engagement.topDownloads.filter((item) =>
    item.id.startsWith("portfolio-"),
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Cards */}
      <div className="grid-system grid-1 xs:grid-2 sm:grid-4 md:grid-4 gap-4">
        <div className="bg-base border border-foreground p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="noto-sans-jp-regular text-sm text-foreground">
                総閲覧数
              </p>
              <p className="neue-haas-grotesk-display text-2xl text-primary">
                {analytics.overview.totalViews.toLocaleString()}
              </p>
            </div>
            <Eye className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="bg-base border border-foreground p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="noto-sans-jp-regular text-sm text-foreground">
                ダウンロード数
              </p>
              <p className="neue-haas-grotesk-display text-2xl text-primary">
                {analytics.overview.totalDownloads.toLocaleString()}
              </p>
            </div>
            <Download className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="bg-base border border-foreground p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="noto-sans-jp-regular text-sm text-foreground">
                ポートフォリオ項目
              </p>
              <p className="neue-haas-grotesk-display text-2xl text-primary">
                {analytics.content.byType.portfolio || 0}
              </p>
            </div>
            <Target className="w-8 h-8 text-accent" />
          </div>
        </div>

        <div className="bg-base border border-foreground p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="noto-sans-jp-regular text-sm text-foreground">
                検索数
              </p>
              <p className="neue-haas-grotesk-display text-2xl text-primary">
                {analytics.overview.totalSearches.toLocaleString()}
              </p>
            </div>
            <Activity className="w-8 h-8 text-accent" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {detailed && analytics.performance && (
        <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-4">
          <div className="bg-base border border-foreground p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-accent" />
              <span className="noto-sans-jp-regular text-sm text-foreground">
                平均閲覧数/項目
              </span>
            </div>
            <div className="neue-haas-grotesk-display text-xl text-primary">
              {analytics.performance.averageViewsPerContent.toFixed(1)}
            </div>
          </div>

          <div className="bg-base border border-foreground p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-accent" />
              <span className="noto-sans-jp-regular text-sm text-foreground">
                平均DL数/項目
              </span>
            </div>
            <div className="neue-haas-grotesk-display text-xl text-primary">
              {analytics.performance.averageDownloadsPerContent.toFixed(1)}
            </div>
          </div>

          <div className="bg-base border border-foreground p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="noto-sans-jp-regular text-sm text-foreground">
                検索/閲覧比率
              </span>
            </div>
            <div className="neue-haas-grotesk-display text-xl text-primary">
              {(analytics.performance.searchToViewRatio * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Top Content and Downloads */}
      <div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-6">
        {/* Most Viewed Portfolio */}
        <div className="bg-base border border-foreground p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="zen-kaku-gothic-new text-lg text-primary">
              人気作品 (閲覧数)
            </h3>
          </div>
          <div className="space-y-3">
            {portfolioContent.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-base border border-accent flex items-center justify-center">
                    <span className="noto-sans-jp-regular text-xs text-accent">
                      {index + 1}
                    </span>
                  </div>
                  <span className="noto-sans-jp-light text-sm text-foreground truncate">
                    {item.id.replace("portfolio-", "").replace(/-/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-accent" />
                  <span className="noto-sans-jp-light text-xs text-accent">
                    {item.views.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {portfolioContent.length === 0 && (
              <div className="text-center py-4">
                <span className="noto-sans-jp-light text-xs text-foreground">
                  まだ閲覧データがありません
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Most Downloaded Portfolio */}
        <div className="bg-base border border-foreground p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h3 className="zen-kaku-gothic-new text-lg text-primary">
              人気作品 (ダウンロード数)
            </h3>
          </div>
          <div className="space-y-3">
            {portfolioDownloads.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-base border border-accent flex items-center justify-center">
                    <span className="noto-sans-jp-regular text-xs text-accent">
                      {index + 1}
                    </span>
                  </div>
                  <span className="noto-sans-jp-light text-sm text-foreground truncate">
                    {item.id.replace("portfolio-", "").replace(/-/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-3 h-3 text-accent" />
                  <span className="noto-sans-jp-light text-xs text-accent">
                    {item.downloads.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
            {portfolioDownloads.length === 0 && (
              <div className="text-center py-4">
                <span className="noto-sans-jp-light text-xs text-foreground">
                  まだダウンロードデータがありません
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popular Search Queries */}
      {analytics.engagement.topQueries.length > 0 && (
        <div className="bg-base border border-foreground p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-accent" />
            <h3 className="zen-kaku-gothic-new text-lg text-primary">
              人気検索キーワード
            </h3>
          </div>
          <div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-3">
            {analytics.engagement.topQueries.slice(0, 6).map((query) => (
              <div
                key={query.query}
                className="flex items-center justify-between bg-background border border-foreground p-3"
              >
                <span className="noto-sans-jp-light text-sm text-foreground truncate">
                  {query.query}
                </span>
                <span className="noto-sans-jp-regular text-xs text-accent ml-2">
                  {query.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center border-t border-foreground pt-4">
        <div className="flex items-center justify-center gap-1">
          <Calendar className="w-3 h-3 text-accent" />
          <span className="noto-sans-jp-light text-xs text-foreground">
            最終更新:{" "}
            {new Date(analytics.overview.lastUpdated).toLocaleString("ja-JP")}
          </span>
        </div>
      </div>
    </div>
  );
}
