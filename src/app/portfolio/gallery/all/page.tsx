/**
 * All Portfolio Gallery Page
 */

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { Suspense } from "react";
import { AllGalleryClient } from "./components/AllGalleryClient";

/**
 * All Gallery Page with proper SEO and structured data
 */
export default async function AllGalleryPage() {
  try {
    // Get portfolio data with minimal error handling
    const items = await portfolioDataManager.getPortfolioData(true);
    const searchFilters = await portfolioDataManager.getSearchFilters();

    // Generate SEO metadata and structured data
    let structuredData = null;
    try {
      const seoGenerator = new PortfolioSEOMetadataGenerator(
        portfolioDataManager,
      );
      const seoData = await seoGenerator.generateGalleryMetadata("all");
      structuredData = seoData.structuredData;
    } catch (seoError) {
      console.error("SEO generation error:", seoError);
    }

    return (
      <>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData),
            }}
          />
        )}
        <div className="min-h-screen bg-background text-foreground">
          <main className="py-4">
            <div className="container-system">
              <div className="space-y-10">
                {/* Breadcrumbs */}
                <Breadcrumbs
                  items={[
                    { label: "Home", href: "/" },
                    { label: "Portfolio", href: "/portfolio" },
                    { label: "Gallery", href: "/portfolio/gallery/all" },
                    { label: "All", isCurrent: true },
                  ]}
                  className="pt-4"
                />

                <div className="space-y-10">
                  <Suspense
                    fallback={
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="bg-gray-200 h-64 rounded"
                            ></div>
                          ))}
                        </div>
                      </div>
                    }
                  >
                    {items.length > 0 ? (
                      <AllGalleryClient
                        initialItems={items}
                        searchFilters={searchFilters}
                      />
                    ) : (
                      <div className="bg-red-100 p-4 rounded">
                        <p className="text-red-800">
                          No portfolio items found.
                        </p>
                      </div>
                    )}
                  </Suspense>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error in AllGalleryPage:", error);

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="py-10">
          <div className="container mx-auto px-4">
            <div className="bg-red-100 p-4 rounded">
              <p className="text-red-800">
                Error loading portfolio:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
