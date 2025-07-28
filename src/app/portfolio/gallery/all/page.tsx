/**
 * All Portfolio Gallery Page
 * Task 3.1: 全作品ギャラリー(/portfolio/gallery/all)の実装
 */

import { Metadata } from "next";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { AllGalleryClient } from "./components/AllGalleryClient";

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
    // Get all portfolio data
    const items = await portfolioDataManager.getPortfolioData();
    const searchFilters = await portfolioDataManager.getSearchFilters();

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
        </div>
      </div>
    );
  }
}
