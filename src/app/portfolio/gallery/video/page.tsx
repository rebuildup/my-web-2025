import type { Metadata } from "next";
import Link from "next/link";
import { type ContentItem, getEffectiveDate } from "@/types";

export const metadata: Metadata = {
	title: "Video Projects - Portfolio | samuido 映像制作作品集",
	description:
		"samuidoの映像制作作品集。MV制作、モーショングラフィックス、アニメーション作品をYouTube・Vimeo埋め込みと制作プロセスと共に紹介。",
	keywords: [
		"映像制作",
		"MV制作",
		"モーショングラフィックス",
		"アニメーション",
		"After Effects",
		"Premiere Pro",
		"YouTube",
		"Vimeo",
	],
	robots: "index, follow",
	alternates: {
		canonical: "https://yusuke-kim.com/portfolio/gallery/video",
	},
	openGraph: {
		title: "Video Projects - Portfolio | samuido 映像制作作品集",
		description:
			"samuidoの映像制作作品集。MV制作、モーショングラフィックス、アニメーション作品をYouTube・Vimeo埋め込みと制作プロセスと共に紹介。",
		type: "website",
		url: "https://yusuke-kim.com/portfolio/gallery/video",
		images: [
			{
				url: "https://yusuke-kim.com/portfolio/gallery-video-og-image.png",
				width: 1200,
				height: 630,
				alt: "Video Projects - Portfolio",
			},
		],
		siteName: "samuido",
		locale: "ja_JP",
	},
	twitter: {
		card: "summary_large_image",
		title: "Video Projects - Portfolio | samuido 映像制作作品集",
		description:
			"samuidoの映像制作作品集。MV制作、モーショングラフィックス、アニメーション作品をYouTube・Vimeo埋め込みと制作プロセスと共に紹介。",
		images: [
			"https://yusuke-kim.com/portfolio/gallery-video-twitter-image.jpg",
		],
		creator: "@361do_design",
	},
};

// Fetch video portfolio data using data manager (consistent with other pages)
async function getVideoPortfolioData(): Promise<ContentItem[]> {
	try {
		const { portfolioDataManager } = await import(
			"@/lib/portfolio/data-manager"
		);

		// Get all portfolio data and filter for video category
		const allItems = await portfolioDataManager.getPortfolioData(false);
		const videoItems = allItems.filter((item) => item.category === "video");

		console.log(
			`Data manager: Found ${videoItems.length} video items out of ${allItems.length} total items`,
		);

		// Sort by effective date (manual date if set, otherwise createdAt) in descending order
		const sortedItems = videoItems.sort((a, b) => {
			const dateA = getEffectiveDate(a);
			const dateB = getEffectiveDate(b);
			return dateB.getTime() - dateA.getTime();
		});

		return sortedItems;
	} catch (error) {
		console.error("Error fetching video portfolio data:", error);
		return [];
	}
}

import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import VideoGallery from "./components/VideoGallery";

export default async function VideoProjectsPage() {
	const videoItems = await getVideoPortfolioData();

	// Debug information for development
	if (process.env.NODE_ENV === "development") {
		console.log("Video page debug:", {
			totalVideoItems: videoItems.length,
			videoCategories: videoItems.map((item) => item.category),
			videoTitles: videoItems.map((item) => item.title).slice(0, 5),
		});
	}

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: "samuido Video Projects",
		description: "MV制作、モーショングラフィックス、アニメーション作品集",
		url: "https://yusuke-kim.com/portfolio/gallery/video",
		mainEntity: {
			"@type": "ItemList",
			name: "Video Projects",
			numberOfItems: videoItems.length,
		},
	};
	const Global_title = "noto-sans-jp-regular text-base leading-snug";

	return (
		<>
			<script type="application/ld+json">
				{JSON.stringify(structuredData)}
			</script>

			<div className="min-h-screen bg-base text-main scrollbar-auto-stable">
				<main className="flex items-center py-4">
					<div className="container-system">
						<div className="space-y-10">
							{/* Breadcrumbs */}
							<Breadcrumbs
								items={[
									{ label: "Home", href: "/" },
									{ label: "Portfolio", href: "/portfolio" },
									{ label: "Gallery", href: "/portfolio/gallery/all" },
									{ label: "Video", isCurrent: true },
								]}
								className="pt-4"
							/>

							{/* Header */}
							<header className="space-y-12">
								<h1 className="neue-haas-grotesk-display text-6xl text-main">
									Video Projects
								</h1>
								<p className="noto-sans-jp-light text-sm max-w leading-loose">
									映像制作・モーショングラフィックス・アニメーション作品集です.
									<br />
									YouTube・Vimeo埋め込みと制作プロセスを含めて紹介しています.
								</p>
							</header>

							{/* Video Gallery */}
							<section>
								<h2 className="neue-haas-grotesk-display text-3xl text-main mb-8">
									Video Projects ({videoItems.length})
								</h2>
								{/* Debug banner removed in production */}
								<VideoGallery items={videoItems} />
							</section>

							{/* Global Functions */}
							<nav aria-label="Video gallery functions">
								<h3 className="sr-only">Video Gallery機能</h3>
								<div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
									<Link
										href="/portfolio/gallery/all"
										className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
									>
										<span className={Global_title}>All Projects</span>
									</Link>

									<Link
										href="/portfolio/gallery/develop"
										className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
									>
										<span className={Global_title}>Development</span>
									</Link>

									<Link
										href="/about/commission/video"
										className="border border-main text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-main focus:ring-offset-2 focus:ring-offset-base"
									>
										<span className={Global_title}>Commission</span>
									</Link>
								</div>
							</nav>

							{/* Footer */}
							<footer className="pt-4 border-t border-main">
								<div className="text-center">
									<p className="shippori-antique-b1-regular text-sm inline-block">
										© 2025 samuido - Video Projects
									</p>
								</div>
							</footer>
						</div>
					</div>
				</main>
			</div>
		</>
	);
}
