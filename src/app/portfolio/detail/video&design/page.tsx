/**
 * Video & Design Projects Detail Page
 * Specialized view for video and design fusion projects
 */

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { ContentItem } from "@/types/content";
import Image from "next/image";
import Link from "next/link";

export default async function VideoDesignDetailPage() {
  try {
    // Get all portfolio items and filter for video&design projects
    const allItems = await portfolioDataManager.getPortfolioData();
    const videoDesignItems = allItems.filter(
      (item) =>
        item.category === "video&design" ||
        item.category === "design" ||
        (item.category === "video" &&
          item.tags?.some((tag) =>
            [
              "Design",
              "Branding",
              "Identity",
              "UI/UX",
              "Graphic Design",
            ].includes(tag),
          )),
    );

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <div className="container mx-auto px-4">
            <div className="space-y-10">
              {/* Breadcrumbs */}
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Portfolio", href: "/portfolio" },
                  { label: "Detail", href: "/portfolio/detail" },
                  { label: "Video&Design", isCurrent: true },
                ]}
                className="pt-4"
              />

              {/* Header */}
              <header className="space-y-12">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Video & Design Projects
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  デザインコンセプトと映像表現を融合した作品の詳細ビューです。
                  <br />
                  ブランディング、UI/UX、グラフィックデザインと映像制作の統合プロジェクトを紹介しています。
                </p>
              </header>

              {/* Creative Overview */}
              <section className="bg-base border border-foreground p-6">
                <h2 className="zen-kaku-gothic-new text-2xl text-primary mb-6">
                  Creative Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {videoDesignItems.length}
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      Design Projects
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {
                        videoDesignItems.filter(
                          (item) => item.videos && item.videos.length > 0,
                        ).length
                      }
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      With Video Content
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {
                        videoDesignItems.filter((item) =>
                          item.tags?.some((tag) =>
                            ["Branding", "Identity"].includes(tag),
                          ),
                        ).length
                      }
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      Brand Projects
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {
                        Array.from(
                          new Set(
                            videoDesignItems.flatMap((item) => item.tags || []),
                          ),
                        ).length
                      }
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      Design Tools
                    </div>
                  </div>
                </div>
              </section>

              {/* Projects Grid */}
              <section>
                <h2 className="zen-kaku-gothic-new text-2xl text-primary mb-6">
                  Featured Design Projects
                </h2>
                <div className="space-y-12">
                  {videoDesignItems.map((item: ContentItem, index: number) => (
                    <div
                      key={item.id}
                      className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${
                        index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                      }`}
                    >
                      {/* Project Visual */}
                      <div
                        className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}
                      >
                        <div className="relative aspect-[4/3] bg-background border border-foreground overflow-hidden">
                          {item.videos && item.videos.length > 0 ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center space-y-4">
                                <div className="text-accent text-4xl">▶️</div>
                                <div>
                                  <p className="zen-kaku-gothic-new text-lg text-primary mb-2">
                                    {item.videos![0].title}
                                  </p>
                                  <p className="noto-sans-jp-light text-sm text-foreground">
                                    Video Content Available
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : item.thumbnail ? (
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              fill
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              className="object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="noto-sans-jp-light text-lg text-foreground">
                                {item.title}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div
                        className={`space-y-6 ${index % 2 === 1 ? "lg:col-start-1" : ""}`}
                      >
                        <div>
                          <h3 className="zen-kaku-gothic-new text-2xl text-primary mb-4">
                            {item.title}
                          </h3>
                          <p className="noto-sans-jp-light text-base text-foreground leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Design Approach */}
                        <div>
                          <h4 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                            Design Approach
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.tags?.map((tag: string) => (
                              <span
                                key={tag}
                                className="noto-sans-jp-light text-sm text-foreground border border-foreground px-3 py-1"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Project Highlights */}
                        <div>
                          <h4 className="zen-kaku-gothic-new text-lg text-primary mb-3">
                            Project Highlights
                          </h4>
                          <ul className="space-y-2">
                            <li className="noto-sans-jp-light text-sm text-foreground flex items-start">
                              <span className="text-accent mr-2">•</span>
                              <span>統合されたビジュアルアイデンティティ</span>
                            </li>
                            <li className="noto-sans-jp-light text-sm text-foreground flex items-start">
                              <span className="text-accent mr-2">•</span>
                              <span>動的な映像表現との融合</span>
                            </li>
                            <li className="noto-sans-jp-light text-sm text-foreground flex items-start">
                              <span className="text-accent mr-2">•</span>
                              <span>ユーザーエクスペリエンスの最適化</span>
                            </li>
                          </ul>
                        </div>

                        {/* Project Links */}
                        <div className="flex flex-wrap gap-4">
                          <Link
                            href={`/portfolio/${item.id}`}
                            className="noto-sans-jp-light text-sm text-accent border border-accent px-4 py-2 hover:bg-accent hover:text-background transition-colors"
                          >
                            View Full Project
                          </Link>
                          {item.videos && item.videos.length > 0 && (
                            <a
                              href={item.videos![0].url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="noto-sans-jp-light text-sm text-foreground border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors"
                            >
                              Watch Video
                            </a>
                          )}
                          {item.externalLinks?.find(
                            (link) => link.type === "demo",
                          ) && (
                            <a
                              href={
                                item.externalLinks.find(
                                  (link) => link.type === "demo",
                                )?.url || "#"
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="noto-sans-jp-light text-sm text-foreground border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors"
                            >
                              Live Demo
                            </a>
                          )}
                        </div>

                        {/* Project Timeline */}
                        <div className="text-xs text-foreground opacity-70 pt-4 border-t border-foreground">
                          <span>
                            Created:{" "}
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString(
                                  "ja-JP",
                                )
                              : "Unknown"}
                          </span>
                          {item.updatedAt !== item.createdAt && (
                            <span className="ml-4">
                              Updated:{" "}
                              {new Date(
                                item.updatedAt || "",
                              ).toLocaleDateString("ja-JP")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Empty State */}
              {videoDesignItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="noto-sans-jp-light text-sm text-foreground">
                    No video & design projects found.
                  </p>
                </div>
              )}

              {/* Design Philosophy */}
              <section className="bg-base border border-foreground p-6">
                <h2 className="zen-kaku-gothic-new text-2xl text-primary mb-6">
                  Design Philosophy
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🎨</div>
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      Visual Harmony
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      デザインと映像の調和を重視し、一貫したビジュアル体験を創造
                    </p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-4xl">💡</div>
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      Concept First
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      コンセプトを軸とした設計で、意味のあるデザインソリューションを提供
                    </p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🚀</div>
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      Innovation
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      最新技術とクリエイティブな発想で、革新的な表現を追求
                    </p>
                  </div>
                </div>
              </section>

              {/* Navigation */}
              <nav aria-label="Video & design detail navigation">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link
                    href="/portfolio/gallery/video&design"
                    className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                  >
                    <span className="noto-sans-jp-regular text-base">
                      Video & Design Gallery
                    </span>
                  </Link>
                  <Link
                    href="/portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                  >
                    <span className="noto-sans-jp-regular text-base">
                      Portfolio Home
                    </span>
                  </Link>
                  <Link
                    href="/about/commission/design"
                    className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                  >
                    <span className="noto-sans-jp-regular text-base">
                      Design Commission
                    </span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error in VideoDesignDetailPage:", error);

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <div className="container mx-auto px-4">
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-800">
                Error loading video & design projects:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
