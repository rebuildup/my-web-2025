/**
 * Development Projects Gallery Page
 */

import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { DevelopGalleryClient } from "./components/DevelopGalleryClient";

/**
 * Development Gallery Page with proper SEO and structured data
 */

export default async function DevelopGalleryPage() {
  console.log("=== DevelopGalleryPage EXECUTED ===");
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
      const seoData = await seoGenerator.generateGalleryMetadata("develop");
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
                Found{" "}
                {items.filter((item) => item.category === "develop").length}{" "}
                development projects and {searchFilters.length} filters.
              </p>

              {items.length > 0 ? (
                <DevelopGalleryClient
                  initialItems={items}
                  searchFilters={searchFilters}
                />
              ) : (
                <div className="bg-red-100 p-4 rounded">
                  <p className="text-red-800">No development projects found.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error in DevelopGalleryPage:", error);

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
