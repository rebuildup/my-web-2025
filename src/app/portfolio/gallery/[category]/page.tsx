/**
 * Portfolio Gallery Pages with Dynamic SEO Metadata
 * Generates optimized metadata for each gallery category
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { PORTFOLIO_CATEGORIES } from "@/types/content";

interface GalleryPageProps {
  params: Promise<{
    category: string;
  }>;
}

// Valid gallery categories
const validCategories = [
  "all",
  PORTFOLIO_CATEGORIES.DEVELOP,
  PORTFOLIO_CATEGORIES.VIDEO,
  PORTFOLIO_CATEGORIES.DESIGN,
];

/**
 * Generate dynamic metadata for gallery pages
 */
export async function generateMetadata({
  params,
}: GalleryPageProps): Promise<Metadata> {
  try {
    const { category } = await params;

    // Validate category
    if (!validCategories.includes(category)) {
      return {
        title: "Gallery Not Found | Portfolio | samuido",
        description: "The requested gallery category was not found.",
        robots: "noindex, nofollow",
      };
    }

    // Generate metadata using SEO metadata generator
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { metadata } = await seoGenerator.generateGalleryMetadata(category);

    return metadata;
  } catch (error) {
    console.error(`Error generating gallery metadata for ${params}:`, error);

    // Fallback metadata
    return {
      title: "Portfolio Gallery | samuido",
      description: "Browse portfolio gallery by category",
      robots: "index, follow",
    };
  }
}

/**
 * Generate static params for all gallery categories
 */
export async function generateStaticParams() {
  return validCategories.map((category) => ({
    category,
  }));
}

/**
 * Gallery page component with dynamic structured data
 */
export default async function GalleryPage({ params }: GalleryPageProps) {
  const { category } = await params;

  // Validate category
  if (!validCategories.includes(category)) {
    notFound();
  }

  try {
    // Get gallery data
    const items = await portfolioDataManager.getItemsByCategory(category);

    // Generate structured data
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { structuredData } =
      await seoGenerator.generateGalleryMetadata(category);

    // Get category info for display
    const categoryInfo = getCategoryDisplayInfo(category);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <div className="min-h-screen bg-background text-foreground">
          <main
            id="main-content"
            role="main"
            className="flex items-center py-10"
          >
            <div className="container-system">
              <div className="space-y-10">
                {/* Header */}
                <header className="space-y-8">
                  <nav aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm">
                      <li>
                        <Link
                          href="/"
                          className="text-foreground hover:text-accent"
                        >
                          Home
                        </Link>
                      </li>
                      <li className="text-foreground">/</li>
                      <li>
                        <Link
                          href="/portfolio"
                          className="text-foreground hover:text-accent"
                        >
                          Portfolio
                        </Link>
                      </li>
                      <li className="text-foreground">/</li>
                      <li className="text-accent">{categoryInfo.title}</li>
                    </ol>
                  </nav>

                  <div className="space-y-4">
                    <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                      {categoryInfo.title}
                    </h1>
                    <p className="noto-sans-jp-light text-sm max-w leading-loose">
                      {categoryInfo.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-accent">
                        {items.length} projects
                      </span>
                      <span className="text-foreground">
                        Updated {new Date().toLocaleDateString("ja-JP")}
                      </span>
                    </div>
                  </div>
                </header>

                {/* Gallery Content */}
                <section>
                  <div className="grid-system grid-1 xs:grid-2 sm:grid-3 md:grid-4 gap-6">
                    {items.map((item) => (
                      <article
                        key={item.id}
                        className="bg-base border border-foreground p-4 space-y-4"
                      >
                        <div className="aspect-video bg-background border border-foreground flex items-center justify-center">
                          <span className="noto-sans-jp-light text-xs text-foreground">
                            {item.title}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <h2 className="zen-kaku-gothic-new text-base text-primary">
                            {item.title}
                          </h2>
                          <p className="noto-sans-jp-light text-sm text-foreground line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(item.technologies || item.tags || [])
                              .slice(0, 3)
                              .map((tech) => (
                                <span
                                  key={tech}
                                  className="noto-sans-jp-light text-xs text-foreground border border-foreground px-2 py-1"
                                >
                                  {tech}
                                </span>
                              ))}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {items.length === 0 && (
                    <div className="text-center py-16">
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        このカテゴリにはまだ作品がありません。
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  } catch (error) {
    console.error(`Error rendering gallery page for ${category}:`, error);

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-primary mb-4">Gallery Error</h1>
          <p className="text-foreground">
            Sorry, there was an error loading the gallery.
          </p>
        </div>
      </div>
    );
  }
}

/**
 * Get category display information
 */
function getCategoryDisplayInfo(category: string) {
  const categoryMap: Record<string, { title: string; description: string }> = {
    all: {
      title: "All Projects",
      description: "全ての作品を時系列・カテゴリ・技術で絞り込み表示",
    },
    develop: {
      title: "Development",
      description: "Web開発・ゲーム開発・技術実装に重点を置いた作品",
    },
    video: {
      title: "Video Production",
      description: "映像制作・モーショングラフィックス・アニメーション作品",
    },
    "video&design": {
      title: "Video & Design",
      description: "デザインコンセプトと映像表現を融合した作品",
    },
  };

  return categoryMap[category] || categoryMap["all"];
}
