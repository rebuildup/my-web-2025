/**
 * Development Projects Gallery Page
 */

import { getAllFromIndex } from "@/cms/lib/content-db-manager";
import HomeBackground from "@/components/HomeBackground";
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
		// 管理ページと同じデータ取得経路（インデックスDB）を使用
		const indexRows = getAllFromIndex();
		const items = indexRows
			.filter((r: any) => r.status === "published")
			.map((r: any) => {
				const thumbs = r.thumbnails || {};
				const pickThumb = () => {
					if (thumbs?.image?.src) return thumbs.image.src;
					if (thumbs?.gif?.src) return thumbs.gif.src;
					if (thumbs?.webm?.poster) return thumbs.webm.poster;
					return undefined;
				};
				return {
					id: r.id,
					title: r.title,
					description: r.summary ?? "",
					tags: Array.isArray(r.tags) ? r.tags : [],
					status: r.status,
					publishedAt: r.publishedAt,
					createdAt: r.createdAt,
					updatedAt: r.updatedAt,
					thumbnail: pickThumb(),
				} as any;
			});
		// タグのみで develop を抽出
		const tagItems = items
			.filter(
				(it: any) => Array.isArray(it?.tags) && it.tags.includes("develop"),
			)
			.sort(
				(a: any, b: any) =>
					new Date(b.publishedAt || b.updatedAt || b.createdAt).getTime() -
					new Date(a.publishedAt || a.updatedAt || a.createdAt).getTime(),
			);
		const searchFilters = await portfolioDataManager.getSearchFilters();

		// Debug logging/non-prod panel data
		if (process.env.NODE_ENV !== "production") {
			const total = items.length;
			const totalAll = indexRows.length;
			const withTags = items.filter((it: any) => Array.isArray(it?.tags));
			const sampleTags = withTags.slice(0, 5).map((it: any) => it.tags);
			console.log(
				"[DevelopGallery] total:",
				total,
				"totalAll:",
				totalAll,
				"tagged:",
				withTags.length,
				"developFiltered:",
				tagItems.length,
				"sampleTags:",
				sampleTags,
			);
		}

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
				<HomeBackground />
				{structuredData && (
					<script type="application/ld+json">
						{JSON.stringify(structuredData)}
					</script>
				)}
				<div className="min-h-screen bg-base text-main scrollbar-auto-stable">
					<main className="py-4">
						<div className="container-system mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
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

								{tagItems.length > 0 ? (
									<DevelopGalleryClient
										initialItems={tagItems}
										searchFilters={searchFilters}
									/>
								) : (
									<div className="bg-red-100 p-4 rounded">
										<p className="text-red-800">
											No development projects found.
										</p>
										{process.env.NODE_ENV !== "production" && (
											<div className="mt-2 text-xs text-red-900/80 space-y-1">
												<p>Diagnostics:</p>
												<ul className="list-disc pl-5 space-y-0.5">
													<li>Loaded items (published): {items.length}</li>
													<li>Loaded items (all): {indexRows.length}</li>
													<li>
														Items with tags:{" "}
														{
															items.filter((it: any) => Array.isArray(it?.tags))
																.length
														}
													</li>
													<li>Filtered (develop): {tagItems.length}</li>
												</ul>
											</div>
										)}
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
