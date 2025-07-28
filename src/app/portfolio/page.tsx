import { Metadata } from "next";
import Link from "next/link";
import { Code, Video, Palette, Eye, Calendar } from "lucide-react";
import { PortfolioAnalytics, GoogleAnalytics } from "./components";
import { Suspense } from "react";
import { ContentItem } from "@/types/content";

export const metadata: Metadata = {
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
        url: "https://yusuke-kim.com/portfolio-og-image.jpg",
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

const structuredData = {
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
  genre: ["Web Development", "Game Development", "Video Production", "Design"],
  workExample: [
    {
      "@type": "SoftwareApplication",
      name: "Web開発プロジェクト",
      applicationCategory: "WebApplication",
    },
    {
      "@type": "VideoObject",
      name: "映像制作作品",
      genre: "Motion Graphics",
    },
    {
      "@type": "Game",
      name: "ゲーム開発作品",
      genre: "Interactive",
    },
  ],
};

// データ取得関数
async function getPortfolioData(): Promise<ContentItem[]> {
  try {
    // Skip API calls during build if no base URL is set
    if (
      !process.env.NEXT_PUBLIC_BASE_URL &&
      process.env.NODE_ENV === "production"
    ) {
      return [];
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/content/portfolio?status=published&limit=100`,
      {
        next: { revalidate: 3600 }, // 1時間キャッシュ
      },
    );

    if (!response.ok) {
      console.error("Failed to fetch portfolio data:", response.status);
      return [];
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return [];
  }
}

export default async function PortfolioPage() {
  // 実際のデータを取得
  let portfolioItems = await getPortfolioData();

  // フォールバックデータ（テスト用）
  if (portfolioItems.length === 0) {
    portfolioItems = [
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
    ] as ContentItem[];
  }

  // 実際のデータから統計を計算
  const portfolioStats = {
    totalProjects: portfolioItems.length,
    categories: {
      develop: portfolioItems.filter((item: ContentItem) =>
        item.category?.toLowerCase().includes("develop"),
      ).length,
      video: portfolioItems.filter(
        (item: ContentItem) =>
          item.category?.toLowerCase().includes("video") ||
          item.category?.toLowerCase().includes("aftereffects"),
      ).length,
      design: portfolioItems.filter((item: ContentItem) =>
        item.category?.toLowerCase().includes("design"),
      ).length,
    },
    technologies: [
      ...new Set(
        portfolioItems.flatMap((item: ContentItem) => item.tags || []),
      ),
    ].slice(0, 10),
    latestUpdate:
      portfolioItems.length > 0
        ? new Date(
            portfolioItems[0].updatedAt || portfolioItems[0].createdAt,
          ).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })
        : "データなし",
  };

  // カテゴリ情報
  const categories = [
    {
      id: "all",
      title: "All Projects",
      description: "全ての作品を時系列・カテゴリ・技術で絞り込み表示",
      icon: Eye,
      count: portfolioStats.totalProjects,
      href: "/portfolio/gallery/all",
      color: "primary",
    },
    {
      id: "develop",
      title: "Development",
      description: "Web開発・ゲーム開発・技術実装に重点を置いた作品",
      icon: Code,
      count: portfolioStats.categories.develop,
      href: "/portfolio/gallery/develop",
      color: "accent",
    },
    {
      id: "video",
      title: "Video Production",
      description: "映像制作・モーショングラフィックス・アニメーション作品",
      icon: Video,
      count: portfolioStats.categories.video,
      href: "/portfolio/gallery/video",
      color: "primary",
    },
    {
      id: "video-design",
      title: "Video & Design",
      description: "デザインコンセプトと映像表現を融合した作品",
      icon: Palette,
      count: portfolioStats.categories.design,
      href: "/portfolio/gallery/video&design",
      color: "accent",
    },
  ];

  // 最新作品のハイライト（実際のデータから取得）
  const featuredProjects = portfolioItems
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

              {/* Portfolio Statistics */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Portfolio Overview
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-4 md:grid-4 gap-6">
                    <div className="text-center">
                      <div className="neue-haas-grotesk-display text-3xl text-accent mb-2">
                        {portfolioStats.totalProjects}
                      </div>
                      <div className="noto-sans-jp-light text-sm text-foreground">
                        総プロジェクト数
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="neue-haas-grotesk-display text-3xl text-accent mb-2">
                        {portfolioStats.categories.develop}
                      </div>
                      <div className="noto-sans-jp-light text-sm text-foreground">
                        開発プロジェクト
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="neue-haas-grotesk-display text-3xl text-accent mb-2">
                        {portfolioStats.categories.video}
                      </div>
                      <div className="noto-sans-jp-light text-sm text-foreground">
                        映像作品
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="neue-haas-grotesk-display text-3xl text-accent mb-2">
                        {portfolioStats.technologies.length}+
                      </div>
                      <div className="noto-sans-jp-light text-sm text-foreground">
                        使用技術
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-foreground">
                    <div className="flex flex-wrap gap-2">
                      {portfolioStats.technologies.map((tech: string) => (
                        <span
                          key={tech}
                          className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Analytics */}
                  <div className="pt-4 border-t border-foreground">
                    <Suspense
                      fallback={
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      }
                    >
                      <PortfolioAnalytics showSummary={true} />
                    </Suspense>
                  </div>
                </div>
              </section>

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
                        <span className="noto-sans-jp-light text-xs text-accent">
                          {category.count} projects
                        </span>
                        <span className="noto-sans-jp-light text-xs text-foreground">
                          →
                        </span>
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
                    }) => (
                      <Link
                        key={project.id}
                        href={`/portfolio/${project.id}`}
                        className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors"
                        data-testid="portfolio-item"
                        data-category={project.category}
                      >
                        <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
                          <span className="noto-sans-jp-light text-xs text-foreground">
                            {project.title}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="zen-kaku-gothic-new text-base text-primary">
                              {project.title}
                            </h3>
                            <div className="flex items-center">
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

              {/* Playground Section */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Experimental Playground
                </h2>
                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                  <Link
                    href="/portfolio/playground/design"
                    className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <div className="flex items-center">
                      <Palette className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        Design Experiments
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      インタラクティブデモとデザイン実験
                    </p>
                  </Link>

                  <Link
                    href="/portfolio/playground/WebGL"
                    className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <div className="flex items-center">
                      <Code className="w-6 h-6 text-accent mr-3" />
                      <h3 className="zen-kaku-gothic-new text-lg text-primary">
                        WebGL Experiments
                      </h3>
                    </div>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      Three.js・WebGPU実装とインタラクティブ体験
                    </p>
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

        {/* Google Analytics */}
        <GoogleAnalytics />
      </div>
    </>
  );
}
