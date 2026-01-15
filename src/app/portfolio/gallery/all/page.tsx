/**
 * All Portfolio Gallery Page
 */

import { Suspense } from "react";
import { getAllFromIndex } from "@/cms/lib/content-db-manager";
import HomeBackground from "@/components/HomeBackground";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import { AllGalleryClient } from "./components/AllGalleryClient";

/**
 * All Gallery Page with proper SEO and structured data
 */
export default async function AllGalleryPage() {
	try {
		// 管理ページと同じインデックスDBから取得し、published + 指定タグのみ
		const rows = getAllFromIndex();
		const filtered = rows
			.filter((r: any) => r.status === "published")
			.filter(
				(r: any) =>
					Array.isArray(r?.tags) &&
					(r.tags.includes("develop") ||
						r.tags.includes("video") ||
						r.tags.includes("design") ||
						r.tags.includes("video&design")),
			)
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
			})
			.sort(
				(a: any, b: any) =>
					new Date(b.publishedAt || b.updatedAt || b.createdAt).getTime() -
					new Date(a.publishedAt || a.updatedAt || a.createdAt).getTime(),
			);
		const searchFilters = await portfolioDataManager.getSearchFilters();

		if (process.env.NODE_ENV !== "production") {
			const withTags = rows.filter((r: any) => Array.isArray(r?.tags));
			const sample = withTags.slice(0, 5).map((r: any) => r.tags);
			console.log(
				"[AllGallery] total:",
				rows.length,
				"tagged:",
				withTags.length,
				"filtered:",
				filtered.length,
				"sampleTags:",
				sample,
			);
		}

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
				<HomeBackground />
				{structuredData && (
					<script type="application/ld+json">
						{JSON.stringify(structuredData)}
					</script>
				)}
				<div className="min-h-screen relative z-10 text-main scrollbar-auto-stable">
					<main className="py-4">
						<div className="container-system mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
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
										{filtered.length > 0 ? (
											<AllGalleryClient
												initialItems={filtered}
												searchFilters={searchFilters}
											/>
										) : (
											<div className="bg-red-100 p-4 rounded">
												<p className="text-red-800">
													No portfolio items found.
												</p>
												{process.env.NODE_ENV !== "production" && (
													<div className="mt-2 text-xs text-red-900/80 space-y-1">
														<p>Diagnostics:</p>
														<ul className="list-disc pl-5 space-y-0.5">
															<li>Loaded items (all): {rows.length}</li>
															<li>
																Items with tags:{" "}
																{
																	rows.filter((r: any) =>
																		Array.isArray(r?.tags),
																	).length
																}
															</li>
															<li>
																Filtered (develop/video/design):{" "}
																{filtered.length}
															</li>
														</ul>
													</div>
												)}
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
			<div className="min-h-screen bg-base text-main scrollbar-auto-stable">
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
