import { PortfolioIntegrationManager } from "@/lib/portfolio";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { ContentItem } from "@/types/content";
import {
  Calendar,
  Clock,
  Code,
  Eye,
  Palette,
  Star,
  TrendingUp,
  Video,
} from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

// Generate dynamic metadata using SEO metadata generator
export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { metadata } = await seoGenerator.generatePortfolioTopMetadata();
    return metadata;
  } catch (error) {
    console.error("Error generating portfolio metadata:", error);
    // Fallback metadata
    return {
      title: "Portfolio - samuido | 作品集・開発・映像・デザイン",
      description:
        "samuidoの作品集。Web開発、ゲーム開発、映像制作、デザインなど幅広いクリエイティブ作品を紹介。技術スタックと制作プロセスも掲載。",
      keywords: [
        "ポートフォリオ",
        "作品集",
        "Web開発",
        "ゲーム開発",
        "映像制作",
        "デザイン",
        "React",
        "Unity",
        "AfterEffects",
      ],
      robots: "index, follow",
      alternates: {
        canonical: "https://yusuke-kim.com/portfolio",
      },
      openGraph: {
        title: "Portfolio - samuido | 作品集・開発・映像・デザイン",
        description:
          "samuidoの作品集。Web開発、ゲーム開発、映像制作、デザインなど幅広いクリエイティブ作品を紹介。技術スタックと制作プロセスも掲載。",
        type: "website",
        url: "https://yusuke-kim.com/portfolio",
        images: [
          {
            url: "https://yusuke-kim.com/portfolio-og-image.png",
            width: 1200,
            height: 630,
            alt: "Portfolio - samuido",
          },
        ],
        siteName: "samuido",
        locale: "ja_JP",
      },
      twitter: {
        card: "summary_large_image",
        title: "Portfolio - samuido | 作品集・開発・映像・デザイン",
        description:
          "samuidoの作品集。Web開発、ゲーム開発、映像制作、デザインなど幅広いクリエイティブ作品を紹介。技術スタックと制作プロセスも掲載。",
        images: ["https://yusuke-kim.com/portfolio-twitter-image.jpg"],
        creator: "@361do_sleep",
      },
    };
  }
}

// Enhanced data fetching using portfolio data manager
async function getEnhancedPortfolioData() {
  try {
    // Get data from portfolio data manager with caching and processing
    const portfolioData = await portfolioDataManager.getPortfolioData();
    const portfolioStats = await portfolioDataManager.getPortfolioStats();
    const featuredProjects = await portfolioDataManager.getFeaturedProjects(3);

    // Create integration manager instance for home page data
    const integrationManager = new PortfolioIntegrationManager(
      portfolioDataManager,
    );
    const homePageData = await integrationManager.homePage.getHomePageData();

    // Generate structured data using SEO metadata generator
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { structuredData } =
      await seoGenerator.generatePortfolioTopMetadata();

    return {
      portfolioData,
      portfolioStats,
      featuredProjects,
      homePageData,
      structuredData,
    };
  } catch (error) {
    console.error("Error fetching enhanced portfolio data:", error);

    // Fallback to basic data structure
    return {
      portfolioData: [],
      portfolioStats: {
        totalProjects: 0,
        categoryCounts: {},
        technologyCounts: {},
        lastUpdate: new Date(),
      },
      featuredProjects: [],
      homePageData: {
        featuredProjects: [],
        stats: {
          totalProjects: 0,
          categoryCounts: {},
          technologyCounts: {},
          lastUpdate: new Date(),
        },
        latestUpdates: [],
      },
      structuredData: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: "samuido Portfolio",
        description: "Web開発、ゲーム開発、映像制作、デザインの作品集",
        url: "https://yusuke-kim.com/portfolio",
        creator: {
          "@type": "Person",
          name: "木村友亮",
          alternateName: "samuido",
        },
      },
    };
  }
}

export default async function PortfolioPage() {
  // Enhanced data fetching with integration manager
  const {
    portfolioData: initialPortfolioItems,
    portfolioStats: enhancedStats,
    featuredProjects: managedFeaturedProjects,
    homePageData,
    structuredData,
  } = await getEnhancedPortfolioData();

  // フォールバックデータ（テスト用）
  let portfolioItems = initialPortfolioItems;
  if (portfolioItems.length === 0) {
    // Convert ContentItem to PortfolioContentItem for fallback
    const fallbackItems: ContentItem[] = [
      {
        id: "portfolio-1753615145862",
        type: "portfolio",
        title: "React Dashboard Application",
        description: "モダンなReactダッシュボードアプリケーションの開発",
        category: "develop",
        tags: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
        thumbnail: "/images/portfolio/--1753614822051-3k30ay-optimized.jpg",
        images: ["/images/portfolio/--1753614822051-3k30ay-optimized.jpg"],
        status: "published",
        priority: 80,
        createdAt: "2024-12-01T00:00:00Z",
        updatedAt: "2024-12-01T00:00:00Z",
        publishedAt: "2024-12-01T00:00:00Z",
        content: "詳細なプロジェクト説明...",
      },
      {
        id: "portfolio-1753615145863",
        type: "portfolio",
        title: "Unity Game Development",
        description: "3Dアクションゲームの開発とリリース",
        category: "develop",
        tags: ["Unity", "C#", "3D", "Game Development"],
        thumbnail: "/images/portfolio/blob-1753614822486-vqggc8-optimized.jpg",
        images: ["/images/portfolio/blob-1753614822486-vqggc8-optimized.jpg"],
        status: "published",
        priority: 75,
        createdAt: "2024-11-15T00:00:00Z",
        updatedAt: "2024-11-15T00:00:00Z",
        publishedAt: "2024-11-15T00:00:00Z",
        content: "詳細なプロジェクト説明...",
      },
      {
        id: "portfolio-1753615145864",
        type: "portfolio",
        title: "Motion Graphics Video",
        description: "企業プロモーション用モーショングラフィックス",
        category: "video",
        tags: ["After Effects", "Motion Graphics", "Animation"],
        thumbnail: "/images/portfolio/--1753614822051-3k30ay-optimized.jpg",
        images: ["/images/portfolio/--1753614822051-3k30ay-optimized.jpg"],
        status: "published",
        priority: 70,
        createdAt: "2024-10-20T00:00:00Z",
        updatedAt: "2024-10-20T00:00:00Z",
        publishedAt: "2024-10-20T00:00:00Z",
        content: "詳細なプロジェクト説明...",
      },
    ];

    // Process fallback data through the data manager
    try {
      const processedResult =
        await portfolioDataManager.processPortfolioData(fallbackItems);
      if (processedResult && processedResult.data) {
        portfolioItems = processedResult.data;
      } else {
        portfolioItems = fallbackItems as PortfolioContentItem[];
      }
    } catch (error) {
      console.error("Error processing fallback data:", error);
      portfolioItems = fallbackItems as PortfolioContentItem[];
    }
  }

  // Use enhanced statistics from data manager with fallback
  const portfolioStats = {
    totalProjects: enhancedStats.totalProjects || portfolioItems.length,
    categories: {
      develop:
        enhancedStats.categoryCounts?.develop ||
        portfolioItems.filter((item) =>
          item.category?.toLowerCase().includes("develop"),
        ).length,
      video:
        enhancedStats.categoryCounts?.video ||
        portfolioItems.filter(
          (item) => item.category?.toLowerCase() === "video",
        ).length,
      design:
        enhancedStats.categoryCounts?.design ||
        portfolioItems.filter((item) =>
          item.category?.toLowerCase().includes("design"),
        ).length,
      // Video & Design: video items + design items with video content (matching gallery logic)
      videoDesign: portfolioItems.filter(
        (item) =>
          item.category === "video&design" ||
          item.category === "video" ||
          (item.category === "design" &&
            ((item.videos && item.videos.length > 0) ||
              (item.tags &&
                (item.tags.some((tag) => tag.toLowerCase().includes("video")) ||
                  item.tags.some((tag) =>
                    tag.toLowerCase().includes("motion"),
                  ) ||
                  item.tags.some((tag) =>
                    tag.toLowerCase().includes("animation"),
                  ))))),
      ).length,
    },
    technologies:
      Object.keys(enhancedStats.technologyCounts || {}).slice(0, 10) ||
      [
        ...new Set(
          portfolioItems.flatMap(
            (item) => item.technologies || item.tags || [],
          ),
        ),
      ].slice(0, 10),
    latestUpdate: enhancedStats.lastUpdate
      ? new Date(enhancedStats.lastUpdate).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
        })
      : portfolioItems.length > 0
        ? new Date(
            portfolioItems[0].updatedAt || portfolioItems[0].createdAt,
          ).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })
        : "データなし",
  };

  // Debug information for development
  if (process.env.NODE_ENV === "development") {
    console.log("Portfolio Stats Debug:", {
      totalProjects: portfolioStats.totalProjects,
      develop: portfolioStats.categories.develop,
      video: portfolioStats.categories.video,
      design: portfolioStats.categories.design,
      videoDesign: portfolioStats.categories.videoDesign,
    });
  }

  // Enhanced category information with dynamic data
  const categories = [
    {
      id: "all",
      title: "All Projects",
      description: "全ての作品を時系列・カテゴリ・技術で絞り込み表示",
      icon: Eye,
      count: portfolioStats.totalProjects,
      href: "/portfolio/gallery/all",
      color: "primary",
      badge: "Complete",
      trend: portfolioStats.totalProjects > 0 ? "up" : "stable",
    },
    {
      id: "develop",
      title: "Development",
      description: "Web開発・ゲーム開発・技術実装に重点を置いた作品",
      icon: Code,
      count: portfolioStats.categories.develop,
      href: "/portfolio/gallery/develop",
      color: "accent",
      badge: "Active",
      trend: "up",
    },
    {
      id: "video",
      title: "Video Production",
      description: "映像制作・モーショングラフィックス・アニメーション作品",
      icon: Video,
      count: portfolioStats.categories.video,
      href: "/portfolio/gallery/video",
      color: "primary",
      badge: "Creative",
      trend: "stable",
    },
    {
      id: "video-design",
      title: "Video & Design",
      description: "デザインコンセプトと映像表現を融合した作品",
      icon: Palette,
      count: portfolioStats.categories.videoDesign,
      href: "/portfolio/gallery/video&design",
      color: "accent",
      badge: "Artistic",
      trend: "up",
    },
  ];

  // Enhanced featured projects using managed data with fallback
  const featuredProjects =
    managedFeaturedProjects.length > 0
      ? managedFeaturedProjects.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category || "other",
          description: item.description,
          technologies: item.technologies || item.tags || [],
          thumbnail:
            item.thumbnail ||
            item.images?.[0] ||
            "/images/portfolio/default-thumb.jpg",
          date: new Date(item.updatedAt || item.createdAt).toLocaleDateString(
            "ja-JP",
            { year: "numeric", month: "2-digit" },
          ),
          priority: item.priority || 0,
          status: item.status,
        }))
      : portfolioItems
          .sort(
            (a: ContentItem, b: ContentItem) =>
              new Date(b.updatedAt || b.createdAt).getTime() -
              new Date(a.updatedAt || a.createdAt).getTime(),
          )
          .slice(0, 3)
          .map((item: ContentItem) => ({
            id: item.id,
            title: item.title,
            category: item.category || "other",
            description: item.description,
            technologies: item.tags || [],
            thumbnail:
              item.thumbnail ||
              item.images?.[0] ||
              "/images/portfolio/default-thumb.jpg",
            date: new Date(item.updatedAt || item.createdAt).toLocaleDateString(
              "ja-JP",
              { year: "numeric", month: "2-digit" },
            ),
            priority: item.priority || 0,
            status: item.status,
          }));
  const CardStyle =
    "bg-base border border-foreground block p-4 space-y-4 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
  const Card_title =
    "neue-haas-grotesk-display text-xl text-primary leading-snug";
  const Card_description = "noto-sans-jp-light text-xs pb-2";
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        <main id="main-content" role="main" className="flex items-center py-10">
          <div className="container-system">
            <div className="space-y-10">
              {/* Header */}
              <header className="space-y-12">
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  Portfolio
                </h1>

                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  Web開発・ゲーム開発・映像制作・デザインの作品集です.
                  <br />
                  技術スタックと制作プロセスも含めて紹介しています.
                </p>
              </header>

              {/* Category Navigation */}
              <nav aria-label="Portfolio categories" role="navigation">
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Browse by Category
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-4 gap-8">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={category.href}
                      className={CardStyle}
                      aria-describedby={`${category.id}-description`}
                      data-testid={`filter-${category.id}`}
                    >
                      <div className="flex items-center">
                        <category.icon
                          className={`w-6 h-6 text-${category.color} mr-3`}
                        />
                        <h3 className={Card_title}>{category.title}</h3>
                      </div>
                      <p
                        id={`${category.id}-description`}
                        className={Card_description}
                      >
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="noto-sans-jp-light text-xs text-accent">
                            {category.count} projects
                          </span>
                          {category.badge && (
                            <span className="noto-sans-jp-light text-xs text-primary border border-primary px-2 py-1">
                              {category.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {category.trend === "up" && (
                            <TrendingUp className="w-3 h-3 text-accent" />
                          )}
                          <span className="noto-sans-jp-light text-xs text-foreground">
                            →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Featured Projects */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Featured Projects
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-3 gap-6">
                  {featuredProjects.map(
                    (project: {
                      id: string;
                      title: string;
                      category: string;
                      description: string;
                      technologies: string[];
                      thumbnail: string;
                      date: string;
                      priority?: number;
                      status?: string;
                    }) => (
                      <Link
                        key={project.id}
                        href={`/portfolio/${project.id}`}
                        className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors"
                        data-testid="portfolio-item"
                        data-category={project.category}
                      >
                        <div className="relative aspect-video bg-background border border-foreground overflow-hidden">
                          {project.thumbnail ? (
                            <Image
                              src={project.thumbnail}
                              alt={project.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                {project.title}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <h3 className="zen-kaku-gothic-new text-base text-primary">
                                {project.title}
                              </h3>
                              {project.priority && project.priority >= 80 && (
                                <Star className="w-4 h-4 text-accent" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4 text-accent mr-1" />
                              <span className="noto-sans-jp-light text-xs text-accent">
                                {project.date}
                              </span>
                            </div>
                          </div>

                          <p className="noto-sans-jp-light text-sm text-foreground">
                            {project.description}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {project.technologies.map((tech: string) => (
                              <span
                                key={tech}
                                className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      </Link>
                    ),
                  )}
                </div>
              </section>

              {/* Latest Updates Section */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Latest Updates
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-3 gap-4">
                    {homePageData.latestUpdates
                      .slice(0, 3)
                      .map(
                        (update: {
                          id: string;
                          title: string;
                          category: string;
                          updatedAt: Date;
                        }) => (
                          <Link
                            key={update.id}
                            href={`/portfolio/${update.id}`}
                            className="block p-3 border border-foreground hover:border-accent transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="noto-sans-jp-light text-xs text-accent">
                                {update.category}
                              </span>
                              <span className="noto-sans-jp-light text-xs text-foreground">
                                {new Date(update.updatedAt).toLocaleDateString(
                                  "ja-JP",
                                  {
                                    month: "2-digit",
                                    day: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                            <h3 className="zen-kaku-gothic-new text-sm text-primary line-clamp-2">
                              {update.title}
                            </h3>
                          </Link>
                        ),
                      )}
                  </div>

                  {homePageData.latestUpdates.length === 0 && (
                    <div className="text-center py-8">
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        最新の更新情報を読み込み中...
                      </p>
                    </div>
                  )}
                </div>
              </section>

              {/* Enhanced Playground Section */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Experimental Playground
                </h2>
                <p className="noto-sans-jp-light text-sm text-foreground mb-6">
                  技術実験とクリエイティブな表現の場。インタラクティブなデモンストレーションと最新技術の実装例を体験できます。
                </p>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  <Link
                    href="/portfolio/playground/design"
                    className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Palette className="w-6 h-6 text-accent mr-3" />
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          Design Experiments
                        </h3>
                      </div>
                      <span className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1">
                        Interactive
                      </span>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      インタラクティブデモとデザイン実験。CSS、SVG、Canvas
                      を使った視覚的表現の探求。
                    </p>
                    <div className="flex items-center text-xs text-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>リアルタイム更新</span>
                    </div>
                  </Link>

                  <Link
                    href="/portfolio/playground/WebGL"
                    className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Code className="w-6 h-6 text-accent mr-3" />
                        <h3 className="zen-kaku-gothic-new text-lg text-primary">
                          WebGL Experiments
                        </h3>
                      </div>
                      <span className="noto-sans-jp-light text-xs text-primary border border-primary px-2 py-1">
                        3D
                      </span>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      Three.js・WebGPU実装とインタラクティブ体験。シェーダー、パーティクル、3Dグラフィックス。
                    </p>
                    <div className="flex items-center text-xs text-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>パフォーマンス最適化済み</span>
                    </div>
                  </Link>
                </div>
              </section>

              {/* Global Functions */}
              <nav aria-label="Portfolio functions">
                <h3 className="sr-only">Portfolio機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/all"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>All Projects</span>
                  </Link>

                  <Link
                    href="/search?type=portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Search</span>
                  </Link>

                  <Link
                    href="/about/commission/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Commission</span>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <footer className="pt-4 border-t border-foreground">
                <div className="text-center">
                  <p className="shippori-antique-b1-regular text-sm inline-block">
                    © 2025 samuido - Creative Portfolio
                  </p>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
