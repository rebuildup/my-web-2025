/**
 * Development Projects Gallery Page
 */

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { DevelopGalleryClient } from "./components/DevelopGalleryClient";

/**
 * Development Gallery Page with proper SEO and structured data
 */

export default async function DevelopGalleryPage() {
	if (process.env.NODE_ENV !== "production") {
		console.log("=== DevelopGalleryPage EXECUTED ===");
		console.log("Environment:", process.env.NODE_ENV);
		console.log("Timestamp:", new Date().toISOString());
	}

	try {
		// Get portfolio data with minimal error handling
		if (process.env.NODE_ENV !== "production") {
			console.log("Fetching portfolio data...");
		}
		const items = await portfolioDataManager.getPortfolioData(true);
		const searchFilters = await portfolioDataManager.getSearchFilters();

		if (process.env.NODE_ENV !== "production") {
			console.log("Data fetched successfully:", {
				itemsCount: items.length,
				filtersCount: searchFilters.length,
			});
		}

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
					<script type="application/ld+json">
						{JSON.stringify(structuredData)}
					</script>
				)}
				<div className="min-h-screen bg-base text-main scrollbar-auto-stable">
					<main className="py-4">
						<div className="container-system">
							<div className="space-y-10">
								{/* Breadcrumbs */}
								<Breadcrumbs
									items={[
										{ label: "Home", href: "/" },
										{ label: "Portfolio", href: "/portfolio" },
										{ label: "Gallery", href: "/portfolio/gallery/all" },
										{ label: "Development", isCurrent: true },
									]}
									className="pt-4"
								/>

								{items.length > 0 ? (
									<DevelopGalleryClient
										initialItems={items}
										searchFilters={searchFilters}
									/>
								) : (
									<div className="bg-red-100 p-4 rounded">
										<p className="text-red-800">
											No development projects found.
										</p>
									</div>
								)}
							</div>
						</div>
					</main>
				</div>
			</>
		);
	} catch (error) {
		console.error("Error in DevelopGalleryPage:", error);

		return (
			<div className="min-h-screen bg-base text-main scrollbar-auto-stable">
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
