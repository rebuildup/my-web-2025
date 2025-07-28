/**
 * Portfolio Detail Page with Dynamic SEO Metadata
 * Server-side rendered with optimized metadata generation
 */

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Tag, ExternalLink } from "lucide-react";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { PortfolioContentItem } from "@/types/portfolio";

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
                <header className="space-y-6">
                  <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                    {item.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-accent" />
                      <span className="text-foreground">
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
                        <span className="text-foreground capitalize">
                          {item.category}
                        </span>
                      </div>
                    )}

                    {item.status && (
                      <span
                        className={`px-2 py-1 text-xs border ${
                          item.status === "published"
                            ? "text-accent border-accent"
                            : "text-foreground border-foreground"
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>

                  <p className="noto-sans-jp-light text-sm max-w-3xl leading-loose">
                    {item.description}
                  </p>
                </header>

                {/* Content */}
                <section className="space-y-8">
                  {/* Images */}
                  {item.images && item.images.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                        Images
                      </h2>
                      <div className="grid-system grid-1 xs:grid-2 sm:grid-3 gap-4">
                        {item.images.map((image, index) => (
                          <div
                            key={index}
                            className="aspect-video bg-background border border-foreground flex items-center justify-center"
                          >
                            <span className="noto-sans-jp-light text-xs text-foreground">
                              Image {index + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technologies */}
                  {((item as PortfolioContentItem).technologies ||
                    item.tags) && (
                    <div className="space-y-4">
                      <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                        Technologies
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {(
                          (item as PortfolioContentItem).technologies ||
                          item.tags ||
                          []
                        ).map((tech) => (
                          <span
                            key={tech}
                            className="noto-sans-jp-light text-sm text-foreground border border-foreground px-3 py-1"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Links */}
                  {item.externalLinks && item.externalLinks.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                        Links
                      </h2>
                      <div className="space-y-2">
                        {item.externalLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-accent hover:underline"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>{link.title || link.url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Repository Link for Development Projects */}
                  {(item as PortfolioContentItem).repository && (
                    <div className="space-y-4">
                      <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                        Repository
                      </h2>
                      <a
                        href={(item as PortfolioContentItem).repository!.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-accent hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>
                          {(item as PortfolioContentItem).repository!.title ||
                            "View Repository"}
                        </span>
                      </a>
                    </div>
                  )}

                  {/* Content */}
                  {item.content && (
                    <div className="space-y-4">
                      <h2 className="neue-haas-grotesk-display text-3xl text-primary">
                        Details
                      </h2>
                      <div className="prose prose-sm max-w-none">
                        <div
                          className="noto-sans-jp-light text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.content }}
                        />
                      </div>
                    </div>
                  )}
                </section>

                {/* Navigation */}
                <nav className="pt-8 border-t border-foreground">
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center space-x-2 text-accent hover:underline"
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
