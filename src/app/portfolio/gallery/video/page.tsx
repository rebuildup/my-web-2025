import type { Metadata } from "next";
import Link from "next/link";
import { getAllFromIndex } from "@/cms/lib/content-db-manager";
import type { ContentItem } from "@/types";

export const metadata: Metadata = {
	title: "Video Projects - Portfolio | samuido 映像制作作品集",
	description:
		"samuidoの映像制作作品集.MV制作、モーショングラフィックス、アニメーション作品をYouTube・Vimeo埋め込みと制作プロセスと共に紹介.",
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
			"samuidoの映像制作作品集.MV制作、モーショングラフィックス、アニメーション作品をYouTube・Vimeo埋め込みと制作プロセスと共に紹介.",
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
			"samuidoの映像制作作品集.MV制作、モーショングラフィックス、アニメーション作品をYouTube・Vimeo埋め込みと制作プロセスと共に紹介.",
		images: [
			"https://yusuke-kim.com/portfolio/gallery-video-twitter-image.jpg",
		],
		creator: "@365do_design",
	},
};

// Fetch video portfolio data via index DB (same path as admin)
async function getVideoPortfolioData(): Promise<ContentItem[]> {
	try {
		const rows = getAllFromIndex();
		const items = rows
			.filter((r: any) => r.status === "published")
			// 厳密: video タグを持つもののみ表示（design単独は除外）
			.filter((r: any) => {
				if (!Array.isArray(r?.tags)) return false;
				// 文字列化＆小文字化で頑健に
				const tags = r.tags
					.map((t: any) => (typeof t === "string" ? t.toLowerCase() : ""))
					.filter(Boolean);
				return tags.includes("video");
			})
			.map((r: any) => {
				const thumbs = r.thumbnails || {};
				const pickThumb = () => {
					// サムネイルURLの変換処理
					const getMediaUrl = (mediaId?: string) => {
						if (!mediaId) return undefined;
						// 既にURL形式の場合はそのまま返す
						if (
							mediaId.startsWith("http://") ||
							mediaId.startsWith("https://") ||
							mediaId.startsWith("/")
						) {
							return mediaId;
						}
						// メディアIDのみの場合はAPIルート形式に変換
						return `/api/cms/media?contentId=${r.id}&id=${mediaId}&raw=1`;
					};

					// 優先順位: image.src > gif.src > webm.poster
					if (thumbs?.image?.src)
						return getMediaUrl(thumbs.image.src as string);
					if (thumbs?.gif?.src) return getMediaUrl(thumbs.gif.src as string);
					if (thumbs?.webm?.poster)
						return getMediaUrl(thumbs.webm.poster as string);
					return undefined;
				};
				return {
					id: r.id,
					type: "portfolio",
					title: r.title,
					description: r.summary ?? "",
					category: "video",
					tags: Array.isArray(r.tags) ? r.tags : [],
					status: r.status,
					priority: 0,
					publishedAt: r.publishedAt,
					createdAt: r.createdAt,
					updatedAt: r.updatedAt,
					thumbnail: pickThumb(),
				} as unknown as ContentItem;
			});

		// Sort by publishedAt desc (fallback to updatedAt/createdAt)
		const sorted = [...items].sort((a: any, b: any) => {
			const aDate = new Date(
				a.publishedAt || a.updatedAt || a.createdAt,
			).getTime();
			const bDate = new Date(
				b.publishedAt || b.updatedAt || b.createdAt,
			).getTime();
			return bDate - aDate;
		});

		return sorted;
	} catch (error) {
		console.error("Error fetching video portfolio data:", error);
		return [];
	}
}

import HomeBackground from "@/components/HomeBackground";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import VideoGallery from "./components/VideoGallery";

export default async function VideoProjectsPage() {
	const videoItems = await getVideoPortfolioData();

	// Debug information for development
	if (process.env.NODE_ENV !== "production") {
		const sampleTags = videoItems
			.slice(0, 5)
			.map((it) => (Array.isArray((it as any)?.tags) ? (it as any).tags : []));
		console.log(
			"[VideoGallery] items:",
			videoItems.length,
			"sampleTags:",
			sampleTags,
		);
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
			<HomeBackground />
			<script type="application/ld+json">
				{JSON.stringify(structuredData)}
			</script>

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
									{ label: "Video", isCurrent: true },
								]}
								className="pt-4"
							/>

							{/* Header */}
							<header className="space-y-4">
								<h1 className="neue-haas-grotesk-display text-6xl text-main">
									Video Projects
								</h1>
								<p className="noto-sans-jp-light text-sm max-w leading-loose">
									制作した映像作品をまとめたギャラリーです
								</p>
							</header>

							{/* Video Gallery */}
							<section>
								<VideoGallery items={videoItems} />

								{process.env.NODE_ENV !== "production" &&
									videoItems.length === 0 && (
										<div className="mt-4 text-xs text-red-900/80 border border-main p-3">
											{(() => {
												try {
													const rows = getAllFromIndex();
													const published = rows.filter(
														(r: any) => r.status === "published",
													);
													const withTags = rows.filter((r: any) =>
														Array.isArray(r?.tags),
													);
													const videoOrDesign = published.filter(
														(r: any) =>
															Array.isArray(r?.tags) &&
															(r.tags.includes("video") ||
																r.tags.includes("design")),
													);
													return (
														<ul className="list-disc pl-5 space-y-0.5">
															<li>Loaded items (all): {rows.length}</li>
															<li>
																Loaded items (published): {published.length}
															</li>
															<li>Items with tags: {withTags.length}</li>
															<li>
																Filtered (video/design): {videoOrDesign.length}
															</li>
														</ul>
													);
												} catch {
													return <span>Failed to compute diagnostics.</span>;
												}
											})()}
										</div>
									)}
							</section>

							{/* Global Functions */}
							<nav aria-label="Video gallery functions">
								<h2 className="sr-only">Video Gallery機能</h2>
								<div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-6">
									<Link
										href="/portfolio/gallery/all"
										className="bg-base/30 backdrop-blur text-center p-4 flex items-center justify-center hover:bg-base/50 transition-colors rounded-[20px]"
									>
										<span className={Global_title}>All Projects</span>
									</Link>

									<Link
										href="/portfolio/gallery/develop"
										className="bg-base/30 backdrop-blur text-center p-4 flex items-center justify-center hover:bg-base/50 transition-colors rounded-[20px]"
									>
										<span className={Global_title}>Development</span>
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
