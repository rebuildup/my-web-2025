/**
 * Video Projects Detail Page
 * Specialized view for video production projects
 */

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { ContentItem } from "@/types/content";
import Image from "next/image";
import Link from "next/link";

export default async function VideoDetailPage() {
  try {
    // Get all portfolio items and filter for video projects
    const allItems = await portfolioDataManager.getPortfolioData();
    const videoItems = allItems.filter(
      (item) =>
        item.category === "video" ||
        (item.videos && item.videos.length > 0) ||
        item.tags?.some((tag) =>
          [
            "After Effects",
            "Premiere Pro",
            "Motion Graphics",
            "Animation",
            "Video",
          ].includes(tag),
        ),
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
                  { label: "Video", isCurrent: true },
                ]}
                className="pt-4"
              />

              {/* Header */}
              <header className="space-y-12">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Video Projects
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  映像制作・モーショングラフィックス・アニメーション作品の詳細ビューです。
                  <br />
                  制作プロセス、使用ツール、クライアントワークの詳細を紹介しています。
                </p>
              </header>

              {/* Production Overview */}
              <section className="bg-base border border-foreground p-6">
                <h2 className="zen-kaku-gothic-new text-2xl text-primary mb-6">
                  Production Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {videoItems.length}
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      Video Projects
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {
                        videoItems.filter(
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
                        Array.from(
                          new Set(
                            videoItems.flatMap((item) => item.tags || []),
                          ),
                        ).length
                      }
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      Production Tools
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {new Date().getFullYear() - 2019}+
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      Years in Video
                    </div>
                  </div>
                </div>
              </section>

              {/* Projects Grid */}
              <section>
                <h2 className="zen-kaku-gothic-new text-2xl text-primary mb-6">
                  Featured Video Projects
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {videoItems.map((item: ContentItem) => (
                    <div
                      key={item.id}
                      className="bg-base border border-foreground p-6 space-y-6"
                    >
                      {/* Project Video/Image */}
                      <div className="relative aspect-video bg-background border border-foreground overflow-hidden">
                        {item.videos && item.videos.length > 0 ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <div className="text-accent text-lg">▶️</div>
                              <p className="noto-sans-jp-light text-sm text-foreground">
                                Video: {item.videos[0].title}
                              </p>
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
                            <span className="noto-sans-jp-light text-sm text-foreground">
                              {item.title}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Project Info */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="zen-kaku-gothic-new text-xl text-primary mb-2">
                            {item.title}
                          </h3>
                          <p className="noto-sans-jp-light text-sm text-foreground">
                            {item.description}
                          </p>
                        </div>

                        {/* Production Details */}
                        <div>
                          <h4 className="zen-kaku-gothic-new text-sm text-primary mb-2">
                            Production Tools
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {item.tags?.map((tag: string) => (
                              <span
                                key={tag}
                                className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Video Information */}
                        {item.videos && item.videos.length > 0 && (
                          <div>
                            <h4 className="zen-kaku-gothic-new text-sm text-primary mb-2">
                              Video Content
                            </h4>
                            <div className="space-y-2">
                              {item.videos?.map((video, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <span className="noto-sans-jp-light text-sm text-foreground">
                                    {video.title}
                                  </span>
                                  <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1 hover:bg-accent hover:text-background transition-colors"
                                  >
                                    Watch
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Project Links */}
                        <div className="flex space-x-4">
                          <Link
                            href={`/portfolio/${item.id}`}
                            className="noto-sans-jp-light text-sm text-accent border border-accent px-3 py-1 hover:bg-accent hover:text-background transition-colors"
                          >
                            View Details
                          </Link>
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
                              className="noto-sans-jp-light text-sm text-foreground border border-foreground px-3 py-1 hover:border-accent hover:text-accent transition-colors"
                            >
                              Watch Online
                            </a>
                          )}
                        </div>

                        {/* Production Timeline */}
                        <div className="text-xs text-foreground opacity-70">
                          <span>
                            Produced:{" "}
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
              {videoItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="noto-sans-jp-light text-sm text-foreground">
                    No video projects found.
                  </p>
                </div>
              )}

              {/* Production Process */}
              <section className="bg-base border border-foreground p-6">
                <h2 className="zen-kaku-gothic-new text-2xl text-primary mb-6">
                  Production Process
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🎬</div>
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      Pre-Production
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      企画・絵コンテ・スタイルフレーム制作
                    </p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🎨</div>
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      Production
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      アニメーション制作・エフェクト・合成
                    </p>
                  </div>
                  <div className="text-center space-y-4">
                    <div className="text-4xl">🎵</div>
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      Post-Production
                    </h3>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      音響・カラーグレーディング・最終調整
                    </p>
                  </div>
                </div>
              </section>

              {/* Navigation */}
              <nav aria-label="Video detail navigation">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link
                    href="/portfolio/gallery/video"
                    className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                  >
                    <span className="noto-sans-jp-regular text-base">
                      Video Gallery
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
                    href="/about/commission/video"
                    className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                  >
                    <span className="noto-sans-jp-regular text-base">
                      Video Commission
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
    console.error("Error in VideoDetailPage:", error);

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <div className="container mx-auto px-4">
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-800">
                Error loading video projects:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
