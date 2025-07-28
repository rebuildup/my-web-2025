/**
 * All Portfolio Gallery Page
 * Task 3.1: 全作品ギャラリー(/portfolio/gallery/all)の実装
 */

import { Metadata } from "next";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { AllGalleryClient } from "./components/AllGalleryClient";

// Force dynamic rendering to ensure fresh data
export const dynamic = "force-dynamic";
export const revalidate = 3600; // Revalidate every hour

/**
 * Generate metadata for all gallery page
 */
export async function generateMetadata(): Promise<Metadata> {
  try {
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { metadata } = await seoGenerator.generateGalleryMetadata("all");
    return metadata;
  } catch (error) {
    console.error("Error generating all gallery metadata:", error);
    return {
      title: "All Projects | Portfolio | samuido",
      description:
        "Browse all portfolio projects with advanced filtering and sorting",
      robots: "index, follow",
    };
  }
}

/**
 * All Gallery Page Component
 */
export default async function AllGalleryPage() {
  try {
    console.log("AllGalleryPage: Starting data fetch...");

    // Get all portfolio data
    const items = await portfolioDataManager.getPortfolioData(true); // Force refresh
    const searchFilters = await portfolioDataManager.getSearchFilters();

    console.log("AllGalleryPage: Data fetched successfully", {
      itemsCount: items.length,
      filtersCount: searchFilters.length,
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        thumbnail: item.thumbnail,
      })),
    });

    // Generate structured data
    const seoGenerator = new PortfolioSEOMetadataGenerator(
      portfolioDataManager,
    );
    const { structuredData } =
      await seoGenerator.generateGalleryMetadata("all");

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />

        <AllGalleryClient initialItems={items} searchFilters={searchFilters} />
      </>
    );
  } catch (error) {
    console.error("Error rendering all gallery page:", error);

    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-primary mb-4">Gallery Error</h1>
          <p className="text-foreground">
            Sorry, there was an error loading the gallery.
          </p>
          <p className="text-sm text-foreground/60 mt-2">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </div>
    );
  }
}
