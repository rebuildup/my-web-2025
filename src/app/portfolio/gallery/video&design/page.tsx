import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getAllFromIndex } from "@/cms/lib/content-db-manager";
import Plasma from "@/components/Plasma";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { enhancedGalleryFilter } from "@/lib/portfolio/enhanced-gallery-filter";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import type { PortfolioContentItem } from "@/types/portfolio";
import { VideoDesignGallery } from "./components/VideoDesignGallery";

export const metadata: Metadata = {
	title: "Video & Design Projects - Portfolio | samuido 映像×デザイン作品集",
	description:
		"samuidoの映像とデザインを融合した作品集。デザインコンセプトと映像表現を組み合わせた創造的なプロジェクトを紹介。",
	keywords: [
		"映像デザイン",
		"デザインコンセプト",
		"映像表現",
		"クリエイティブ",
		"ビジュアルデザイン",
		"コンセプトアート",
		"映像制作",
	],
	robots: "index, follow",
	alternates: {
		canonical: "https://yusuke-kim.com/portfolio/gallery/video&design",
	},
	openGraph: {
		title: "Video & Design Projects - Portfolio | samuido 映像×デザイン作品集",
		description:
			"samuidoの映像とデザインを融合した作品集。デザインコンセプトと映像表現を組み合わせた創造的なプロジェクトを紹介。",
		type: "website",
		url: "https://yusuke-kim.com/portfolio/gallery/video&design",
		images: [
			{
				url: "https://yusuke-kim.com/portfolio/gallery-video-design-og-image.png",
				width: 1200,
				height: 630,
				alt: "Video & Design Projects - Portfolio",
			},
		],
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Video & Design Projects - Portfolio | samuido 映像×デザイン作品集",
		description:
			"samuidoの映像とデザインを融合した作品集。デザインコンセプトと映像表現を組み合わせた創造的なプロジェクトを紹介。",
		images: [
			"https://yusuke-kim.com/portfolio/gallery-video-design-twitter-image.jpg",
		],
		creator: "@361do_design",
	},
};

export default async function VideoDesignProjectsPage() {
	if (process.env.NODE_ENV !== "production") {
		console.log("=== VideoDesignProjectsPage EXECUTED ===");
		console.log("Environment:", process.env.NODE_ENV);
		console.log("Timestamp:", new Date().toISOString());
	}

	try {
		// Get portfolio data with minimal error handling
		if (process.env.NODE_ENV !== "production") {
			console.log("Fetching portfolio data...");
		}
		// 管理ページと同じ経路（インデックスDB）から取得
		const rows = getAllFromIndex();
		// タグのみで design or video を含むもの（video&designの要件: video または design）
		const videoDesignItems = rows
			.filter((r: any) => r.status === "published")
			.filter((r: any) => {
				const tags = Array.isArray(r?.tags) ? r.tags : [];
				return (
					tags.includes("video") ||
					tags.includes("design") ||
					tags.includes("video&design")
				);
			})
			.map((r: any) => {
				const thumbs = r.thumbnails || {};
				const pickThumb = () => {
					if (thumbs?.image?.src) return thumbs.image.src;
					if (thumbs?.gif?.src) return thumbs.gif.src;
					if (thumbs?.webm?.poster) return thumbs.webm.poster;
					return undefined;
				};
				const tags: string[] = Array.isArray(r.tags) ? r.tags : [];
				const hasVideo = tags.includes("video");
				const hasDesign = tags.includes("design");
				const category =
					hasVideo && hasDesign
						? "video&design"
						: hasVideo
							? "video"
							: hasDesign
								? "design"
								: "design";
				return {
					id: r.id,
					title: r.title,
					description: r.summary ?? "",
					tags,
					category,
					priority: 50,
					status: r.status,
					publishedAt: r.publishedAt,
					createdAt: r.createdAt || r.updatedAt || new Date().toISOString(),
					updatedAt: r.updatedAt || r.createdAt || new Date().toISOString(),
					thumbnail: pickThumb(),
				} as any;
			})
			.sort(
				(a: any, b: any) =>
					new Date(b.publishedAt || b.updatedAt || b.createdAt).getTime() -
					new Date(a.publishedAt || a.updatedAt || a.createdAt).getTime(),
			);

		if (process.env.NODE_ENV !== "production") {
			const withTags = rows.filter((r: any) => Array.isArray(r?.tags));
			const sample = withTags.slice(0, 5).map((r: any) => r.tags);
			console.log(
				"[VideoDesignGallery] total:",
				rows.length,
				"tagged:",
				withTags.length,
				"filtered:",
				videoDesignItems.length,
				"sampleTags:",
				sample,
			);
		}

		if (process.env.NODE_ENV !== "production") {
			console.log("Video&Design page debug:", {
				totalItems: rows.length,
				videoDesignItems: videoDesignItems.length,
				categories: videoDesignItems.map((item) => {
					// Handle both enhanced and legacy items
					if ("categories" in item && Array.isArray(item.categories)) {
						return item.categories.join(", ");
					}
					return (item as unknown as PortfolioContentItem).category;
				}),
				itemsWithVideos: videoDesignItems.filter((item) => {
					const portfolioItem = item as unknown as PortfolioContentItem;
					return portfolioItem.videos && portfolioItem.videos.length > 0;
				}).length,
				enhancedItems: videoDesignItems.filter((item) => "categories" in item)
					.length,
				legacyItems: videoDesignItems.filter((item) => !("categories" in item))
					.length,
			});
		}

		// Generate SEO metadata and structured data
		let structuredData = null;
		try {
			const seoGenerator = new PortfolioSEOMetadataGenerator(
				portfolioDataManager,
			);
			const seoData =
				await seoGenerator.generateGalleryMetadata("video&design");
			structuredData = seoData.structuredData;
		} catch (seoError) {
			console.error("SEO generation error:", seoError);
		}

		const Global_title = "noto-sans-jp-regular text-base leading-snug";

		return (
			<>
				<div className="fixed inset-0 -z-10">
					<Plasma
						color="#0f1f4d"
						speed={1}
						direction="forward"
						scale={1.0}
						opacity={0.85}
						mouseInteractive={false}
					/>
				</div>
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
										{ label: "Video&Design", isCurrent: true },
									]}
									className="pt-4"
								/>

								{/* Header */}
								<header className="space-y-4">
									<h1 className="neue-haas-grotesk-display text-6xl text-main">
										Video & Design
									</h1>
									<p className="noto-sans-jp-light text-sm max-w leading-loose">
										制作した映像作品とデザイン作品をまとめたギャラリーです
									</p>
								</header>

								{/* Main Gallery */}
								<section>
									{videoDesignItems.length > 0 ? (
										<VideoDesignGallery
											items={videoDesignItems}
											showVideoItems={true}
											showDesignItems={true}
											showVideoDesignItems={true}
											deduplication={true}
											enableCaching={true}
										/>
									) : (
										<div className="bg-base border border-main p-8 text-center">
											<Eye className="w-12 h-12 text-accent mx-auto mb-4" />
											<h3 className="zen-kaku-gothic-new text-xl text-main mb-2">
												No video & design projects found
											</h3>
											<p className="noto-sans-jp-light text-sm text-main">
												Video and design projects will appear here once they are
												published.
											</p>
											{process.env.NODE_ENV !== "production" && (
												<div className="mt-2 text-xs text-main/70 space-y-1">
													<p>Diagnostics:</p>
													<ul className="list-disc pl-5 space-y-0.5">
														<li>Loaded items: {rows.length}</li>
														<li>
															Items with tags:{" "}
															{
																rows.filter((it: any) =>
																	Array.isArray(it?.tags),
																).length
															}
														</li>
														<li>
															Filtered (video/design): {videoDesignItems.length}
														</li>
													</ul>
												</div>
											)}
										</div>
									)}
								</section>

								{/* Global Functions */}
								<nav aria-label="Video & Design gallery functions">
									<h3 className="sr-only">Video & Design Gallery機能</h3>
									<div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-6">
										<Link
											href="/portfolio/gallery/all"
											className="bg-base/30 backdrop-blur text-center p-4 flex items-center justify-center hover:bg-base/50 transition-colors rounded-[20px]"
										>
											<span className={Global_title}>All Projects</span>
										</Link>

										<Link
											href="/portfolio/gallery/video"
											className="bg-base/30 backdrop-blur text-center p-4 flex items-center justify-center hover:bg-base/50 transition-colors rounded-[20px]"
										>
											<span className={Global_title}>Video Only</span>
										</Link>

										<Link
											href="/about/commission/video"
											className="bg-base/30 backdrop-blur text-center p-4 flex items-center justify-center hover:bg-base/50 transition-colors rounded-[20px]"
										>
											<span className={Global_title}>Commission</span>
										</Link>
									</div>
								</nav>

								{/* Footer */}
								<footer className="pt-4">
									<div className="text-center">
										<p className="shippori-antique-b1-regular text-sm inline-block">
											© 2025 samuido - Video & Design Projects
										</p>
									</div>
								</footer>
							</div>
						</div>
					</main>
				</div>
			</>
		);
	} catch (error) {
		console.error("Error in VideoDesignProjectsPage:", error);

		return (
			<div className="min-h-screen bg-base text-main scrollbar-auto-stable">
				<main className="py-10">
					<div className="container-system">
						<div className="bg-red-100 p-4 rounded">
							<p className="text-red-800">
								Error loading video & design gallery:{" "}
								{error instanceof Error ? error.message : "Unknown error"}
							</p>
						</div>
					</div>
				</main>
			</div>
		);
	}
}
