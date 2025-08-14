"use client";

import { ContentItem } from "@/types/content";
import Link from "next/link";
import { useEffect, useState } from "react";

interface RecommendationProps {
  currentContentId?: string;
  contentType?: string;
  category?: string;
  tags?: string[];
  limit?: number;
}

interface RecommendedContent {
  id: string;
  title: string;
  type: string;
  description: string;
  category: string;
  tags: string[];
  views: number;
  downloads: number;
  score: number; // Recommendation score
}

export default function ContentRecommendations({
  currentContentId,
  contentType,
  category,
  tags = [],
  limit = 5,
}: RecommendationProps) {
  const [recommendations, setRecommendations] = useState<RecommendedContent[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Design system classes following root page patterns
  const CardStyle =
    "bg-base border border-foreground block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";
  const Card_description = "noto-sans-jp-light text-xs pb-2";
  const Section_title = "neue-haas-grotesk-display text-2xl text-primary mb-6";

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all workshop content
        const [
          blogResponse,
          pluginResponse,
          downloadResponse,
          analyticsResponse,
        ] = await Promise.all([
          fetch("/api/content/by-type/blog"),
          fetch("/api/content/by-type/plugin"),
          fetch("/api/content/by-type/download"),
          fetch("/api/stats/analytics"),
        ]);

        const [blogData, pluginData, downloadData, analyticsData] =
          await Promise.all([
            blogResponse.ok ? blogResponse.json() : { data: [] },
            pluginResponse.ok ? pluginResponse.json() : { data: [] },
            downloadResponse.ok ? downloadResponse.json() : { data: [] },
            analyticsResponse.ok
              ? analyticsResponse.json()
              : { engagement: { topContent: [], topDownloads: [] } },
          ]);

        // Combine all content
        const allContent: ContentItem[] = [
          ...(blogData.data || []),
          ...(pluginData.data || []),
          ...(downloadData.data || []),
        ].filter(
          (item) => item.status === "published" && item.id !== currentContentId,
        );

        // Get view and download stats
        const viewStats = analyticsData.engagement?.topContent || [];
        const downloadStats = analyticsData.engagement?.topDownloads || [];

        // Calculate recommendation scores
        const scoredContent = allContent.map((content) => {
          let score = 0;

          // Base popularity score (views + downloads)
          const viewData = viewStats.find(
            (v: { id: string; views: number }) => v.id === content.id,
          );
          const downloadData = downloadStats.find(
            (d: { id: string; downloads: number }) => d.id === content.id,
          );
          const views = viewData?.views || 0;
          const downloads = downloadData?.downloads || 0;
          score += Math.log(views + 1) * 0.3 + Math.log(downloads + 1) * 0.4;

          // Content type similarity
          if (contentType && content.type === contentType) {
            score += 2;
          }

          // Category similarity
          if (category && content.category === category) {
            score += 1.5;
          }

          // Tag similarity
          if (tags.length > 0) {
            const commonTags = content.tags.filter((tag) => tags.includes(tag));
            score += commonTags.length * 0.5;
          }

          // Recency bonus (newer content gets slight boost)
          const contentDate = new Date(
            content.publishedAt || content.createdAt,
          );
          const daysSincePublished =
            (Date.now() - contentDate.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSincePublished < 30) {
            score += 0.5;
          }

          return {
            id: content.id,
            title: content.title,
            type: content.type,
            description: content.description,
            category: content.category,
            tags: content.tags,
            views: views,
            downloads: downloads,
            score,
          };
        });

        // Sort by score and take top recommendations
        const topRecommendations = scoredContent
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);

        setRecommendations(topRecommendations);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load recommendations",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [currentContentId, contentType, category, tags, limit]);

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className={Section_title}>Recommended Content</h2>
        <div className="bg-base border border-foreground p-6">
          <p className="noto-sans-jp-light text-sm text-center">
            おすすめコンテンツを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className={Section_title}>Recommended Content</h2>
        <div className="bg-base border border-foreground p-6">
          <p className="noto-sans-jp-light text-sm text-center">
            {error || "現在おすすめできるコンテンツがありません"}
          </p>
        </div>
      </div>
    );
  }

  const getContentUrl = (content: RecommendedContent) => {
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
    <section aria-labelledby="recommendations-heading">
      <h2 id="recommendations-heading" className={Section_title}>
        Recommended Content
      </h2>
      <div className="grid-system grid-1 gap-4">
        {recommendations.map((content) => (
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
                {content.views > 0 && (
                  <span className="text-xs text-accent">
                    {content.views} views
                  </span>
                )}
                {content.downloads > 0 && (
                  <span className="text-xs text-accent">
                    {content.downloads} downloads
                  </span>
                )}
              </div>
            </div>
            <p className={Card_description}>{content.description}</p>
            {content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {content.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-background border border-foreground px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
                {content.tags.length > 3 && (
                  <span className="text-xs text-accent">
                    +{content.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
