import { Metadata } from "next";
import Link from "next/link";
import { Filter, Calendar, Tag, Code, Video, Palette } from "lucide-react";
import { ContentItem } from "@/types/content";

export const metadata: Metadata = {
  title: "All Projects - Portfolio | samuido 全作品ギャラリー",
  description:
    "samuidoの全作品を時系列・カテゴリ・技術で絞り込み表示。Web開発、ゲーム開発、映像制作、デザインの全プロジェクトを一覧できます。",
  keywords: [
    "全作品",
    "ギャラリー",
    "フィルタリング",
    "時系列",
    "カテゴリ",
    "技術スタック",
    "ポートフォリオ",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yusuke-kim.com/portfolio/gallery/all",
  },
  openGraph: {
    title: "All Projects - Portfolio | samuido 全作品ギャラリー",
    description:
      "samuidoの全作品を時系列・カテゴリ・技術で絞り込み表示。Web開発、ゲーム開発、映像制作、デザインの全プロジェクトを一覧できます。",
    type: "website",
    url: "https://yusuke-kim.com/portfolio/gallery/all",
    images: [
      {
        url: "https://yusuke-kim.com/portfolio/gallery-all-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "All Projects - Portfolio",
      },
    ],
    siteName: "samuido",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Projects - Portfolio | samuido 全作品ギャラリー",
    description:
      "samuidoの全作品を時系列・カテゴリ・技術で絞り込み表示。Web開発、ゲーム開発、映像制作、デザインの全プロジェクトを一覧できます。",
    images: ["https://yusuke-kim.com/portfolio/gallery-all-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "samuido All Projects Gallery",
  description: "全作品を時系列・カテゴリ・技術で絞り込み表示するギャラリー",
  url: "https://yusuke-kim.com/portfolio/gallery/all",
  mainEntity: {
    "@type": "ItemList",
    name: "Portfolio Projects",
    numberOfItems: 24,
  },
};

// データ取得関数
async function getPortfolioData(): Promise<ContentItem[]> {
  try {
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

export default async function AllProjectsPage() {
  // 実際のデータを取得
  const portfolioItems = await getPortfolioData();

  // 実際のデータからフィルタリングオプションを生成
  const filterOptions = {
    categories: [
      { id: "all", label: "All", count: portfolioItems.length },
      {
        id: "develop",
        label: "Development",
        count: portfolioItems.filter((item: ContentItem) =>
          item.category?.toLowerCase().includes("develop"),
        ).length,
      },
      {
        id: "video",
        label: "Video",
        count: portfolioItems.filter(
          (item: ContentItem) =>
            item.category?.toLowerCase().includes("video") ||
            item.category?.toLowerCase().includes("aftereffects"),
        ).length,
      },
      {
        id: "design",
        label: "Design",
        count: portfolioItems.filter((item: ContentItem) =>
          item.category?.toLowerCase().includes("design"),
        ).length,
      },
    ],
    technologies: [
      ...new Set(
        portfolioItems.flatMap((item: ContentItem) => item.tags || []),
      ),
    ],
    years: [
      ...new Set(
        portfolioItems.map((item: ContentItem) =>
          new Date(item.createdAt).getFullYear().toString(),
        ),
      ),
    ]
      .sort()
      .reverse(),
  };

  // 実際のデータをプロジェクト形式に変換
  const projects = portfolioItems.map((item: ContentItem) => ({
    id: item.id,
    title: item.title,
    category: item.category || "other",
    description: item.description,
    technologies: item.tags || [],
    date: new Date(item.updatedAt || item.createdAt).toLocaleDateString(
      "ja-JP",
      { year: "numeric", month: "2-digit" },
    ),
    year: new Date(item.createdAt).getFullYear().toString(),
    thumbnail:
      item.thumbnail ||
      item.images?.[0] ||
      "/images/portfolio/default-thumb.jpg",
    featured: (item.priority || 0) > 70, // 優先度70以上をfeaturedとする
  }));
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "develop":
        return Code;
      case "video":
        return Video;
      case "design":
        return Palette;
      default:
        return Code;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "develop":
        return "accent";
      case "video":
        return "primary";
      case "design":
        return "accent";
      default:
        return "foreground";
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        <main className="flex items-center py-10">
          <div className="container-system">
            <div className="space-y-10">
              {/* Header */}
              <header className="space-y-12">
                <nav className="mb-6">
                  <Link
                    href="/portfolio"
                    className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    ← Portfolio に戻る
                  </Link>
                </nav>
                <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                  All Projects
                </h1>
                <p className="noto-sans-jp-light text-sm max-w leading-loose">
                  全ての作品を時系列・カテゴリ・技術で絞り込み表示できます.
                  <br />
                  フィルタリング機能を使って目的の作品を見つけてください.
                </p>
              </header>

              {/* Filter Controls */}
              <section>
                <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                  Filter & Search
                </h2>
                <div className="bg-base border border-foreground p-4 space-y-6">
                  {/* Category Filter */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Filter className="w-5 h-5 text-accent mr-2" />
                      <h3 className="zen-kaku-gothic-new text-base text-primary">
                        Category
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.categories.map(
                        (category: {
                          id: string;
                          label: string;
                          count: number;
                        }) => (
                          <button
                            key={category.id}
                            className="noto-sans-jp-light text-sm text-foreground border border-foreground px-3 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                          >
                            {category.label} ({category.count})
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Technology Filter */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Tag className="w-5 h-5 text-accent mr-2" />
                      <h3 className="zen-kaku-gothic-new text-base text-primary">
                        Technology
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.technologies.map((tech: string) => (
                        <button
                          key={tech}
                          className="noto-sans-jp-light text-xs text-accent border border-accent px-2 py-1 hover:bg-accent hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                        >
                          {tech}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Year Filter */}
                  <div>
                    <div className="flex items-center mb-4">
                      <Calendar className="w-5 h-5 text-accent mr-2" />
                      <h3 className="zen-kaku-gothic-new text-base text-primary">
                        Year
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filterOptions.years.map((year: string) => (
                        <button
                          key={year}
                          className="noto-sans-jp-light text-sm text-foreground border border-foreground px-3 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Projects Grid */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                    Projects ({projects.length})
                  </h2>
                  <div className="flex items-center gap-4">
                    <select className="noto-sans-jp-light text-sm text-foreground bg-background border border-foreground px-3 py-2 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background">
                      <option
                        value="date-desc"
                        className="bg-background text-foreground"
                      >
                        最新順
                      </option>
                      <option
                        value="date-asc"
                        className="bg-background text-foreground"
                      >
                        古い順
                      </option>
                      <option
                        value="title-asc"
                        className="bg-background text-foreground"
                      >
                        タイトル順
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-3 gap-6">
                  {projects.map(
                    (project: {
                      id: string;
                      title: string;
                      category: string;
                      description: string;
                      technologies: string[];
                      date: string;
                      year: string;
                      thumbnail: string;
                      featured: boolean;
                    }) => {
                      const CategoryIcon = getCategoryIcon(project.category);
                      const categoryColor = getCategoryColor(project.category);

                      return (
                        <Link
                          key={project.id}
                          href={`/portfolio/${project.id}`}
                          className="bg-base border border-foreground p-4 space-y-4 block hover:border-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                        >
                          {/* Thumbnail */}
                          <div className="aspect-video bg-background border border-foreground flex items-center justify-center relative">
                            <span className="noto-sans-jp-light text-xs text-foreground">
                              {project.title}
                            </span>
                            {project.featured && (
                              <div className="absolute top-2 right-2 bg-accent text-background px-2 py-1 text-xs noto-sans-jp-light">
                                Featured
                              </div>
                            )}
                          </div>

                          {/* Project Info */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <CategoryIcon
                                  className={`w-4 h-4 text-${categoryColor} mr-2`}
                                />
                                <span className="noto-sans-jp-light text-xs text-accent">
                                  {project.category}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 text-foreground mr-1" />
                                <span className="noto-sans-jp-light text-xs text-foreground">
                                  {project.date}
                                </span>
                              </div>
                            </div>

                            <h3 className="zen-kaku-gothic-new text-base text-primary">
                              {project.title}
                            </h3>

                            <p className="noto-sans-jp-light text-sm text-foreground">
                              {project.description}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {project.technologies
                                .slice(0, 3)
                                .map((tech: string) => (
                                  <span
                                    key={tech}
                                    className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                                  >
                                    {tech}
                                  </span>
                                ))}
                              {project.technologies.length > 3 && (
                                <span className="noto-sans-jp-light text-xs text-accent px-2 py-1">
                                  +{project.technologies.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    },
                  )}
                </div>
              </section>

              {/* Load More */}
              <section className="text-center">
                <button className="border border-foreground px-6 py-3 noto-sans-jp-regular text-base hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background">
                  Load More Projects
                </button>
              </section>

              {/* Global Functions */}
              <nav aria-label="Gallery functions">
                <h3 className="sr-only">Gallery機能</h3>
                <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                  <Link
                    href="/portfolio/gallery/develop"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Development</span>
                  </Link>

                  <Link
                    href="/portfolio/gallery/video"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Video</span>
                  </Link>

                  <Link
                    href="/search?type=portfolio"
                    className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span className={Global_title}>Search</span>
                  </Link>
                </div>
              </nav>

              {/* Footer */}
              <footer className="pt-4 border-t border-foreground">
                <div className="text-center">
                  <p className="shippori-antique-b1-regular text-sm inline-block">
                    © 2025 samuido - All Projects Gallery
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
