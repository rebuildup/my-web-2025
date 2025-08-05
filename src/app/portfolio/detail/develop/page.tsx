/**
 * Development Projects Detail Page
 * Specialized view for development projects
 */

import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { ContentItem } from "@/types/content";
import Image from "next/image";
import Link from "next/link";

export default async function DevelopDetailPage() {
  try {
    // Get all portfolio items and filter for development projects
    const allItems = await portfolioDataManager.getPortfolioData();
    const developItems = allItems.filter(
      (item) =>
        item.category === "develop" ||
        item.tags?.some((tag) =>
          [
            "React",
            "TypeScript",
            "JavaScript",
            "Node.js",
            "Unity",
            "C#",
          ].includes(tag),
        ),
    );

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <div className="container mx-auto px-4">
            <div className="space-y-10">
              {/* Header */}
              <header className="space-y-12">
                <nav className="mb-6">
                  <Link
                    href="/portfolio"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit"
                  >
                    ← Portfolio に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Development Projects
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  Web開発・ゲーム開発・技術実装に重点を置いた作品の詳細ビューです。
                  <br />
                  技術スタック、実装詳細、ソースコードへのリンクを含めて紹介しています。
                </p>
              </header>

              {/* Technical Overview */}
              <section className="bg-base border border-foreground p-6">
                <h2 className="zen-kaku-gothic-new text-2xl text-primary mb-6">
                  Technical Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {developItems.length}
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      Development Projects
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {
                        Array.from(
                          new Set(
                            developItems.flatMap((item) => item.tags || []),
                          ),
                        ).length
                      }
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      Technologies Used
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {new Date().getFullYear() - 2020}+
                    </div>
                    <div className="noto-sans-jp-light text-sm text-foreground">
                      Years of Experience
                    </div>
                  </div>
                </div>
              </section>

              {/* Projects Grid */}
              <section>
                <h2 className="zen-kaku-gothic-new text-2xl text-primary mb-6">
                  Featured Development Projects
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {developItems.map((item: ContentItem) => (
                    <div
                      key={item.id}
                      className="bg-base border border-foreground p-6 space-y-6"
                    >
                      {/* Project Image */}
                      <div className="relative aspect-video bg-background border border-foreground overflow-hidden">
                        {item.thumbnail ? (
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

                        {/* Technical Stack */}
                        <div>
                          <h4 className="zen-kaku-gothic-new text-sm text-primary mb-2">
                            Technical Stack
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

                        {/* Project Links */}
                        <div className="flex space-x-4">
                          <Link
                            href={`/portfolio/${item.id}`}
                            className="noto-sans-jp-light text-sm text-accent border border-accent px-3 py-1 hover:bg-accent hover:text-background transition-colors"
                          >
                            View Details
                          </Link>
                          {Array.isArray(item.externalLinks) &&
                            item.externalLinks.find(
                              (link) => link.type === "github",
                            ) && (
                              <a
                                href={
                                  item.externalLinks.find(
                                    (link) => link.type === "github",
                                  )?.url || "#"
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="noto-sans-jp-light text-sm text-foreground border border-foreground px-3 py-1 hover:border-accent hover:text-accent transition-colors"
                              >
                                Source Code
                              </a>
                            )}
                          {Array.isArray(item.externalLinks) &&
                            item.externalLinks.find(
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
                                Live Demo
                              </a>
                            )}
                        </div>

                        {/* Development Timeline */}
                        <div className="text-xs text-foreground opacity-70">
                          <span>
                            Created:{" "}
                            {new Date(item.createdAt).toLocaleDateString(
                              "ja-JP",
                            )}
                          </span>
                          {item.updatedAt !== item.createdAt && (
                            <span className="ml-4">
                              Updated:{" "}
                              {new Date(
                                item.updatedAt || item.createdAt,
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
              {developItems.length === 0 && (
                <div className="text-center py-12">
                  <p className="noto-sans-jp-light text-sm text-foreground">
                    No development projects found.
                  </p>
                </div>
              )}

              {/* Navigation */}
              <nav aria-label="Development detail navigation">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link
                    href="/portfolio/gallery/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                  >
                    <span className="noto-sans-jp-regular text-base">
                      Development Gallery
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
                    href="/about/commission/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors"
                  >
                    <span className="noto-sans-jp-regular text-base">
                      Development Commission
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
    console.error("Error in DevelopDetailPage:", error);

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <div className="container mx-auto px-4">
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-800">
                Error loading development projects:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
