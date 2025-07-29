/**
 * All Portfolio Gallery Page
 */

import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { AllGalleryClient } from "./components/AllGalleryClient";

/**
 * All Gallery Page with proper SEO and structured data
 */
export default async function AllGalleryPage() {
  console.log("=== AllGalleryPage EXECUTED ===");
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Timestamp:", new Date().toISOString());

  try {
    // Get portfolio data with minimal error handling
    console.log("Fetching portfolio data...");
    const items = await portfolioDataManager.getPortfolioData(true);
    const searchFilters = await portfolioDataManager.getSearchFilters();

    console.log("Data fetched successfully:", {
      itemsCount: items.length,
      filtersCount: searchFilters.length,
    });

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
          <main className="py-10">
            <div className="container mx-auto px-4">
              <p className="text-foreground mb-4">
                Found {items.length} portfolio items and {searchFilters.length}{" "}
                filters.
              </p>

              {items.length > 0 ? (
                <AllGalleryClient
                  initialItems={items}
                  searchFilters={searchFilters}
                />
              ) : (
                <div className="bg-red-100 p-4 rounded">
                  <p className="text-red-800">No portfolio items found.</p>
                </div>
              )}
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
