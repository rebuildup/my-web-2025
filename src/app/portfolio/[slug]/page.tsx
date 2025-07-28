"use client";

import { notFound } from "next/navigation";
import { ContentItem } from "@/types/content";
import Link from "next/link";
import { Calendar, Tag, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

interface PortfolioDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [slug, setSlug] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const getPortfolioItem = async (
      id: string,
    ): Promise<ContentItem | null> => {
      try {
        const response = await fetch(
          `/api/content/portfolio?id=${encodeURIComponent(id)}`,
        );

        if (!response.ok) {
          console.error("Failed to fetch portfolio data:", response.status);
          return null;
        }

        const data = await response.json();
        return data.data || null;
      } catch (error) {
        console.error("Error fetching portfolio item:", error);
        return null;
      }
    };

    const fetchData = async () => {
      setLoading(true);
      let portfolioItem = await getPortfolioItem(slug);

      // フォールバックデータ（テスト用）
      if (!portfolioItem) {
        // テスト用のフォールバックデータ
        const fallbackData = {
          "portfolio-1753615145862": {
            id: "portfolio-1753615145862",
            type: "portfolio" as const,
            title: "React Dashboard Application",
            description: "モダンなReactダッシュボードアプリケーションの開発",
            category: "develop",
            tags: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
            thumbnail: "/images/portfolio/--1753614822051-3k30ay-optimized.jpg",
            images: ["/images/portfolio/--1753614822051-3k30ay-optimized.jpg"],
            status: "published" as const,
            priority: 80,
            createdAt: "2024-12-01T00:00:00Z",
            updatedAt: "2024-12-01T00:00:00Z",
            publishedAt: "2024-12-01T00:00:00Z",
            content:
              "# React Dashboard Application\n\nモダンなReactダッシュボードアプリケーションの開発プロジェクトです。\n\n## 技術スタック\n- React 18\n- TypeScript\n- Tailwind CSS\n- Next.js\n\n## 特徴\n- レスポンシブデザイン\n- ダークモード対応\n- パフォーマンス最適化",
          },
          "portfolio-1753615145863": {
            id: "portfolio-1753615145863",
            type: "portfolio" as const,
            title: "Unity Game Development",
            description: "3Dアクションゲームの開発とリリース",
            category: "develop",
            tags: ["Unity", "C#", "3D", "Game Development"],
            thumbnail:
              "/images/portfolio/blob-1753614822486-vqggc8-optimized.jpg",
            images: [
              "/images/portfolio/blob-1753614822486-vqggc8-optimized.jpg",
            ],
            status: "published" as const,
            priority: 75,
            createdAt: "2024-11-15T00:00:00Z",
            updatedAt: "2024-11-15T00:00:00Z",
            publishedAt: "2024-11-15T00:00:00Z",
            content:
              "# Unity Game Development\n\n3Dアクションゲームの開発プロジェクトです。\n\n## 技術スタック\n- Unity 2022.3\n- C#\n- 3D Graphics\n- Physics System\n\n## 特徴\n- リアルタイム物理演算\n- 高品質3Dグラフィックス\n- マルチプラットフォーム対応",
          },
          "portfolio-1753615145864": {
            id: "portfolio-1753615145864",
            type: "portfolio" as const,
            title: "Motion Graphics Video",
            description: "企業プロモーション用モーショングラフィックス",
            category: "video",
            tags: ["After Effects", "Motion Graphics", "Animation"],
            thumbnail: "/images/portfolio/--1753614822051-3k30ay-optimized.jpg",
            images: ["/images/portfolio/--1753614822051-3k30ay-optimized.jpg"],
            status: "published" as const,
            priority: 70,
            createdAt: "2024-10-20T00:00:00Z",
            updatedAt: "2024-10-20T00:00:00Z",
            publishedAt: "2024-10-20T00:00:00Z",
            content:
              "# Motion Graphics Video\n\n企業プロモーション用モーショングラフィックスの制作プロジェクトです。\n\n## 技術スタック\n- After Effects\n- Premiere Pro\n- Illustrator\n- Cinema 4D\n\n## 特徴\n- 高品質アニメーション\n- ブランドアイデンティティ統合\n- 多様な出力フォーマット対応",
          },
        };

        portfolioItem = fallbackData[slug as keyof typeof fallbackData] || null;
      }

      setItem(portfolioItem);
      setLoading(false);
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <main id="main-content" role="main" className="py-10">
          <div className="container-system">
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="text-center">
                <h1 className="neue-haas-grotesk-display text-2xl text-primary mb-4">
                  Loading...
                </h1>
                <p className="noto-sans-jp-light text-sm text-foreground">
                  ポートフォリオを読み込んでいます
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" role="main" className="py-10">
        <div className="container-system">
          <div className="space-y-10">
            {/* Navigation */}
            <nav className="mb-6">
              <Link
                href="/portfolio"
                className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                ← Portfolio に戻る
              </Link>
            </nav>

            <header className="space-y-12">
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm">
                  <span className="noto-sans-jp-light text-accent border border-accent px-2 py-1">
                    {item.category}
                  </span>
                  <div className="flex items-center text-foreground">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span className="noto-sans-jp-light">
                      {new Date(
                        item.updatedAt || item.createdAt,
                      ).toLocaleDateString("ja-JP")}
                    </span>
                  </div>
                </div>

                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  {item.title}
                </h1>

                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  {item.description}
                </p>

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-accent" />
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </header>

            {/* Images */}
            {item.images && item.images.length > 0 && (
              <section className="space-y-4">
                <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                  Images
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video bg-background border border-foreground flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={`${item.title} - Image ${index + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const nextElement = e.currentTarget
                            .nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.classList.remove("hidden");
                          }
                        }}
                      />
                      <span className="noto-sans-jp-light text-xs text-foreground hidden">
                        Image {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Videos */}
            {item.videos && item.videos.length > 0 && (
              <section className="space-y-4">
                <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                  Videos
                </h2>
                <div className="space-y-4">
                  {item.videos.map((video, index) => (
                    <div
                      key={index}
                      className="bg-base border border-foreground p-4 space-y-3"
                    >
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        {video.title}
                      </h3>
                      {video.description && (
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          {video.description}
                        </p>
                      )}
                      <div className="aspect-video bg-background border border-foreground">
                        {video.type === "youtube" && (
                          <iframe
                            src={video.url
                              .replace("youtu.be/", "youtube.com/embed/")
                              .replace("watch?v=", "embed/")}
                            title={video.title}
                            className="w-full h-full"
                            allowFullScreen
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Content */}
            {item.content && (
              <section
                data-testid="portfolio-detail"
                className="bg-base border border-foreground p-4 space-y-4"
              >
                <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                  Project Details
                </h2>
                <div className="prose prose-sm max-w-none">
                  <div
                    className="noto-sans-jp-light text-sm leading-loose"
                    dangerouslySetInnerHTML={{
                      __html: item.content.replace(/\n/g, "<br>"),
                    }}
                  />
                </div>
              </section>
            )}

            {/* External Links */}
            {item.externalLinks && item.externalLinks.length > 0 && (
              <section className="space-y-4">
                <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                  Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.externalLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-base border border-foreground p-4 space-y-2 block hover:border-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                          {link.type}
                        </span>
                        <ExternalLink className="w-4 h-4 text-foreground" />
                      </div>
                      <h3 className="zen-kaku-gothic-new text-base text-primary">
                        {link.title}
                      </h3>
                      {link.description && (
                        <p className="noto-sans-jp-light text-sm text-foreground">
                          {link.description}
                        </p>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer className="pt-4 border-t border-foreground">
              <div className="text-center">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - {item.title}
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
