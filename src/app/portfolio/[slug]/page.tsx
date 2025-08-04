/**
 * Portfolio Detail Page with Dynamic SEO Metadata
 * Server-side rendered with optimized metadata generation
 */

import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { MarkdownContentItem } from "@/types/content";
import { PortfolioContentItem } from "@/types/portfolio";
import { Calendar, Tag } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

// Type guard to check if content item has enhanced markdown features
const isEnhancedContentItem = (
  item: PortfolioContentItem,
): item is PortfolioContentItem & MarkdownContentItem => {
  return !!(item as MarkdownContentItem).markdownPath;
};

// Helper function to get markdown file path for client-side rendering
function getMarkdownFilePath(markdownPath: string): string {
  return `/data/content/markdown/${markdownPath}`;
}

interface PortfolioDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Generate dynamic metadata for portfolio detail pages
 */
export async function generateMetadata({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;

    // Get portfolio item
    const item = await portfolioDataManager.getItemById(slug);

    if (!item) {
      return {
        title: "Portfolio Item Not Found | samuido",
        description: "The requested portfolio item was not found.",
        robots: "noindex, nofollow",
      };
    }

    // Generate metadata using SEO metadata generator
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { metadata } = await seoGenerator.generateDetailMetadata(item);

    return metadata;
  } catch (error) {
    console.error(`Error generating detail metadata for ${params}:`, error);

    // Fallback metadata
    return {
      title: "Portfolio Detail | samuido",
      description: "Portfolio project details and information",
      robots: "index, follow",
    };
  }
}

/**
 * Content Section Component
 * Handles markdown and fallback content display with robust error handling
 */
function ContentSection({ item }: { item: PortfolioContentItem }) {
  // Check if there's meaningful content to display
  const hasMarkdownPath = isEnhancedContentItem(item) && item.markdownPath;
  const hasContent = item.content && item.content.trim().length > 0;
  const hasDescription = item.description && item.description.trim().length > 0;

  // Always show content section - never return null to avoid blank pages
  const fallbackContent =
    item.content || item.description || "詳細な説明は準備中です。";

  return (
    <section className="space-y-12">
      {hasMarkdownPath ? (
        <div className="markdown-container">
          <MarkdownRenderer
            filePath={getMarkdownFilePath(item.markdownPath!)}
            mediaData={{
              images: item.images || [],
              videos: item.videos || [],
              externalLinks: item.externalLinks || [],
            }}
            className="markdown-content-detail"
            fallbackContent={fallbackContent}
            enableSanitization={true}
            enableValidation={true}
            showRetryButton={false} // Disable retry button in production
            showEmptyState={true}
            onError={(error) => {
              console.warn(`[Portfolio] Markdown error for ${item.id}:`, error);
            }}
          />
        </div>
      ) : hasContent ? (
        <div
          className="noto-sans-jp-light text-sm leading-loose whitespace-pre-wrap space-y-4"
          dangerouslySetInnerHTML={{ __html: item.content || "" }}
        />
      ) : hasDescription ? (
        <div className="noto-sans-jp-light text-sm leading-loose space-y-4">
          {item.description}
        </div>
      ) : (
        // Always show something, even if minimal
        <div className="noto-sans-jp-light text-sm leading-loose space-y-4 text-foreground/60">
          {fallbackContent}
        </div>
      )}

      {/* Show basic item information as additional context */}
      {(item.images?.length ||
        item.videos?.length ||
        item.externalLinks?.length) && (
        <div className="pt-8 border-t border-foreground/10">
          <div className="space-y-6">
            {/* Images */}
            {item.images && item.images.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  関連画像
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {item.images.slice(0, 4).map((image, index) => (
                    <div
                      key={index}
                      className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={image}
                        alt={`${item.title} - 画像 ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {item.videos && item.videos.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  関連動画
                </h3>
                <div className="space-y-3">
                  {item.videos.slice(0, 2).map((video, index) => (
                    <div
                      key={index}
                      className="border border-foreground/10 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">🎥</div>
                        <div>
                          <div className="font-medium text-sm">
                            {video.title || `動画 ${index + 1}`}
                          </div>
                          {video.description && (
                            <div className="text-xs text-foreground/60 mt-1">
                              {video.description}
                            </div>
                          )}
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                          >
                            動画を見る →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {item.externalLinks && item.externalLinks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  関連リンク
                </h3>
                <div className="space-y-2">
                  {item.externalLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 border border-foreground/10 rounded-lg hover:bg-foreground/5 transition-colors"
                    >
                      <div className="text-lg">🔗</div>
                      <div>
                        <div className="font-medium text-sm">{link.title}</div>
                        {link.description && (
                          <div className="text-xs text-foreground/60 mt-1">
                            {link.description}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Portfolio detail page component with dynamic structured data
 */
export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { slug } = await params;

  try {
    console.log(`Attempting to load portfolio item with slug: ${slug}`);

    // Get portfolio item
    const item = await portfolioDataManager.getItemById(slug);
    console.log(
      `Portfolio item found:`,
      item ? `${item.id} - ${item.title}` : "null",
    );

    if (!item) {
      console.log(`Portfolio item not found for slug: ${slug}`);
      notFound();
    }

    // Markdown content will be loaded client-side by MarkdownRenderer

    // Generate structured data
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { structuredData } = await seoGenerator.generateDetailMetadata(item);

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
                {/* Breadcrumb */}
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
                    <li className="text-accent">{item.title}</li>
                  </ol>
                </nav>

                {/* Header */}
                <header className="space-y-12">
                  <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                    {item.title}
                  </h1>

                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span className="noto-sans-jp-light text-foreground">
                          {new Date(
                            item.updatedAt || item.createdAt,
                          ).toLocaleDateString("ja-JP", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      {item.category && (
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-accent" />
                          <span className="noto-sans-jp-light text-foreground capitalize">
                            {item.category}
                          </span>
                        </div>
                      )}

                      {item.status && (
                        <span
                          className={`px-2 py-1 text-xs border noto-sans-jp-light ${
                            item.status === "published"
                              ? "text-accent border-accent"
                              : "text-foreground border-foreground"
                          }`}
                        >
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>
                </header>

                {/* Content */}
                <ContentSection item={item} />

                {/* Navigation */}
                <nav className="pt-8 border-t border-foreground">
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center space-x-2 text-accent hover:underline noto-sans-jp-regular"
                  >
                    <span>← Back to Portfolio</span>
                  </Link>
                </nav>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  } catch (error) {
    console.error(`Error rendering portfolio detail page for ${slug}:`, error);

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-primary mb-4">Portfolio Error</h1>
          <p className="text-foreground">
            Sorry, there was an error loading this portfolio item.
          </p>
        </div>
      </div>
    );
  }
}
