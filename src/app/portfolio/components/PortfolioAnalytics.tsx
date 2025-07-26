"use client";

import { useEffect, useState } from "react";
import { Eye, Download, TrendingUp, BarChart3 } from "lucide-react";

interface PortfolioStats {
  totalViews: number;
  totalDownloads: number;
  mostViewed: Array<{ id: string; views: number }>;
  mostDownloaded: Array<{ id: string; downloads: number }>;
}

interface PortfolioAnalyticsProps {
  contentId?: string;
  showSummary?: boolean;
  className?: string;
}

export default function PortfolioAnalytics({
  contentId,
  showSummary = false,
  className = "",
}: PortfolioAnalyticsProps) {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        if (contentId) {
          // Fetch stats for specific portfolio item
          const [viewResponse, downloadResponse] = await Promise.all([
            fetch(`/api/stats/view?id=${contentId}`),
            fetch(`/api/stats/download?id=${contentId}`),
          ]);

          if (!viewResponse.ok || !downloadResponse.ok) {
            throw new Error("Failed to fetch portfolio stats");
          }

          const viewData = await viewResponse.json();
          const downloadData = await downloadResponse.json();

          setStats({
            totalViews: viewData.viewCount || 0,
            totalDownloads: downloadData.downloadCount || 0,
            mostViewed: [],
            mostDownloaded: [],
          });
        } else if (showSummary) {
          // Fetch summary stats for all portfolio items
          const [viewResponse, downloadResponse] = await Promise.all([
            fetch("/api/stats/view"),
            fetch("/api/stats/download"),
          ]);

          if (!viewResponse.ok || !downloadResponse.ok) {
            throw new Error("Failed to fetch portfolio summary stats");
          }

          const viewData = await viewResponse.json();
          const downloadData = await downloadResponse.json();

          // Filter portfolio items only
          const portfolioViewed = viewData.mostViewed.filter(
            (item: { id: string; views: number }) =>
              item.id.startsWith("portfolio-"),
          );
          const portfolioDownloaded = downloadData.mostDownloaded.filter(
            (item: { id: string; downloads: number }) =>
              item.id.startsWith("portfolio-"),
          );

          setStats({
            totalViews: viewData.totalViews,
            totalDownloads: downloadData.totalDownloads,
            mostViewed: portfolioViewed,
            mostDownloaded: portfolioDownloaded,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [contentId, showSummary]);

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="noto-sans-jp-light text-xs text-foreground">
          統計データを読み込み中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <span className="noto-sans-jp-light text-xs text-accent">
          統計データが利用できません
        </span>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  if (contentId) {
    // Single item stats
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4 text-accent" />
          <span className="noto-sans-jp-light text-xs text-foreground">
            {stats.totalViews.toLocaleString()} views
          </span>
        </div>
        {stats.totalDownloads > 0 && (
          <div className="flex items-center gap-1">
            <Download className="w-4 h-4 text-accent" />
            <span className="noto-sans-jp-light text-xs text-foreground">
              {stats.totalDownloads.toLocaleString()} downloads
            </span>
          </div>
        )}
      </div>
    );
  }

  if (showSummary) {
    // Summary stats - using design system colors and typography
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid-system grid-1 xs:grid-2 sm:grid-2 gap-4">
          <div className="bg-base border border-foreground p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-accent" />
              <span className="noto-sans-jp-regular text-sm text-foreground">
                総閲覧数
              </span>
            </div>
            <div className="neue-haas-grotesk-display text-2xl text-primary">
              {stats.totalViews.toLocaleString()}
            </div>
          </div>
          <div className="bg-base border border-foreground p-4">
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-accent" />
              <span className="noto-sans-jp-regular text-sm text-foreground">
                総ダウンロード数
              </span>
            </div>
            <div className="neue-haas-grotesk-display text-2xl text-primary">
              {stats.totalDownloads.toLocaleString()}
            </div>
          </div>
        </div>

        {stats.mostViewed.length > 0 && (
          <div className="bg-base border border-foreground p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="zen-kaku-gothic-new text-base text-primary">
                人気作品 (閲覧数)
              </span>
            </div>
            <div className="space-y-2">
              {stats.mostViewed.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <span className="noto-sans-jp-light text-xs text-foreground">
                    #{index + 1}{" "}
                    {item.id.replace("portfolio-", "").replace(/-/g, " ")}
                  </span>
                  <span className="noto-sans-jp-regular text-xs text-accent">
                    {item.views.toLocaleString()} views
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.mostDownloaded.length > 0 && (
          <div className="bg-base border border-foreground p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-accent" />
              <span className="zen-kaku-gothic-new text-base text-primary">
                人気作品 (ダウンロード数)
              </span>
            </div>
            <div className="space-y-2">
              {stats.mostDownloaded.slice(0, 5).map((item, index) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <span className="noto-sans-jp-light text-xs text-foreground">
                    #{index + 1}{" "}
                    {item.id.replace("portfolio-", "").replace(/-/g, " ")}
                  </span>
                  <span className="noto-sans-jp-regular text-xs text-accent">
                    {item.downloads.toLocaleString()} downloads
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
