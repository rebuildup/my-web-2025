/**
 * All Portfolio Gallery Page
 * Task 3.1: 全作品ギャラリー(/portfolio/gallery/all)の実装
 */

import type { Metadata } from "next";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import type { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import type { SearchFilter } from "@/lib/portfolio/search-index";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { AllGalleryClient } from "./components/AllGalleryClient";

// Force dynamic rendering to ensure data is available
export const dynamic = "force-dynamic";
export const revalidate = false;

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

		// Force cache invalidation in development only
		if (process.env.NODE_ENV === "development") {
			portfolioDataManager.invalidateCache();
		}

		// Get all portfolio data with error handling
		let items: PortfolioContentItem[] = [];
		let searchFilters: SearchFilter[] = [];

		try {
			// Always force refresh for dynamic pages to ensure fresh data
			items = await portfolioDataManager.getPortfolioData(true);
			searchFilters = await portfolioDataManager.getSearchFilters();

			console.log("Data fetch successful:", {
				itemsLength: items.length,
				filtersLength: searchFilters.length,
			});
		} catch (dataError) {
			console.error("Error fetching portfolio data:", dataError);

			// Try fallback to file system directly
			try {
				console.log("Attempting fallback data fetch...");
				const fallbackData =
					await portfolioDataManager.getAllPortfolioData(true);
				items = fallbackData.filter((item) => item.status === "published");
				searchFilters = await portfolioDataManager.getSearchFilters();
				console.log("Fallback successful:", items.length, "items");
			} catch (fallbackError) {
				console.error("Fallback also failed:", fallbackError);
				items = [];
				searchFilters = [];
			}
		}

		console.log("AllGalleryPage: Data fetched successfully", {
			itemsCount: items.length,
			filtersCount: searchFilters.length,
			items: items.map((item) => ({
				id: item.id,
				title: item.title,
				status: item.status,
				thumbnail: item.thumbnail,
			})),
		});

		// Debug: Show data in all environments for troubleshooting
		console.log("=== DEBUG: Portfolio Gallery Data ===");
		console.log("Environment:", process.env.NODE_ENV);
		console.log("Items count:", items.length);
		console.log("Search filters count:", searchFilters.length);
		console.log(
			"Items:",
			items.slice(0, 5).map((item) => ({
				id: item.id,
				title: item.title,
				status: item.status,
				category: item.category,
			})),
		);
		console.log("=====================================");

		// Generate structured data
		const seoGenerator = new PortfolioSEOMetadataGenerator(
			portfolioDataManager,
		);
		const { structuredData } =
			await seoGenerator.generateGalleryMetadata("all");

		// Ensure we always return the component, even with empty data
		console.log("Rendering AllGalleryClient with:", {
			itemsCount: items.length,
			filtersCount: searchFilters.length,
			hasItems: items.length > 0,
			hasFilters: searchFilters.length > 0,
		});

		return (
			<>
				<script type="application/ld+json">
					{JSON.stringify(structuredData)}
				</script>

				<AllGalleryClient initialItems={items} searchFilters={searchFilters} />
			</>
		);
	} catch (error) {
		console.error("Error rendering all gallery page:", error);

		return (
			<div className="min-h-screen bg-base text-main flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl text-main mb-4">Gallery Error</h1>
					<p className="text-main">
						Sorry, there was an error loading the gallery.
					</p>
					<p className="text-sm text-main/60 mt-2">
						Error: {error instanceof Error ? error.message : "Unknown error"}
					</p>
				</div>
			</div>
		);
	}
}
