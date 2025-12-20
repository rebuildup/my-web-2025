/**
 * Portfolio Top Page
 * 4つのカテゴリ別ギャラリーへの導線を提供し、作品の全体像を把握できるハブページ
 */

import { ArrowRight, Code, Film, Palette } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioCard } from "@/app/portfolio/gallery/all/components/PortfolioCard";
import { getAllFromIndex } from "@/cms/lib/content-db-manager";
import AboutBackground from "@/components/AboutBackground";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import GlowCard from "@/components/ui/GlowCard";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import type { PortfolioContentItem } from "@/types/portfolio";
import { LatestWorksSection } from "./components/LatestWorksSection";
import { StatsOverview } from "./components/StatsOverview";

type ContentIndexEntry = ReturnType<typeof getAllFromIndex>[number];
type PortfolioItemWithEnhancedFields = PortfolioContentItem & {
	categories?: string[];
	effectiveDate?: string;
};

/**
 * Generate metadata for portfolio top page
 */
export async function generateMetadata(): Promise<Metadata> {
	// Simplified metadata to avoid data fetching loops
	return {
		title: "Portfolio | samuido",
		description:
			"作品集・開発・映像・デザイン。4つのカテゴリ別ギャラリーへの導線を提供し、作品の全体像を把握できるハブページです。",
		robots: "index, follow",
	};
}

/**
 * Category card component
 */
function CategoryCard({
	href,
	title,
	description,
	count,
	icon: Icon,
}: {
	href: string;
	title: string;
	description: string;
	count: number;
	icon: React.ComponentType<{ className?: string }>;
}) {
	return (
		<Link href={href} className="block">
			<GlowCard className="p-6 bg-base/30 backdrop-blur">
				<div className="flex items-start justify-between">
					<div className="space-y-2 flex-1">
						<div className="flex items-center gap-3">
							<Icon className="w-6 h-6 text-accent" />
							<h3 className="zen-kaku-gothic-new text-xl text-main">{title}</h3>
						</div>
						<p className="noto-sans-jp-light text-sm text-main/70 leading-relaxed">
							{description}
						</p>
					</div>
					<ArrowRight className="w-5 h-5 text-main/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
				</div>
			</GlowCard>
		</Link>
	);
}

/**
 * Portfolio top page component
 */
export default async function PortfolioPage() {
	try {
		// Fetch processed portfolio data (published items only)
		let items: PortfolioItemWithEnhancedFields[] = [];
		try {
			items =
				(await portfolioDataManager.getPortfolioData()) as PortfolioItemWithEnhancedFields[];
		} catch (error) {
			console.error("[PortfolioPage] Failed to load processed data:", error);
		}

		if (!items || items.length === 0) {
			const rows = getAllFromIndex();
			items = rows
				.filter((row) => row.status === "published")
				.map((row: ContentIndexEntry) => {
					type ThumbnailVariant =
						| string
						| {
								src?: string;
								poster?: string;
						  }
						| undefined;
					type NormalizedThumbnails = {
						image?: ThumbnailVariant;
						gif?: ThumbnailVariant;
						webm?: ThumbnailVariant;
						[key: string]: ThumbnailVariant;
					};

					const thumbs = row.thumbnails as NormalizedThumbnails | undefined;
					const extractSrc = (
						variant: ThumbnailVariant,
						key: "src" | "poster",
					) => {
						if (!variant) return undefined;
						if (typeof variant === "string") return variant;
						if (key === "src" && typeof variant.src === "string")
							return variant.src;
						if (key === "poster" && typeof variant.poster === "string")
							return variant.poster;
						return undefined;
					};
					const pickThumb = () => {
						const prioritized =
							extractSrc(thumbs?.image, "src") ||
							extractSrc(thumbs?.gif, "src") ||
							extractSrc(thumbs?.webm, "poster");
						return prioritized;
					};

					const tags: string[] = Array.isArray(row.tags)
						? row.tags.filter((tag): tag is string => typeof tag === "string")
						: [];
					const normalizedTags = tags.map((tag) => tag.toLowerCase());
					const hasVideo = normalizedTags.includes("video");
					const hasDesign = normalizedTags.includes("design");
					const hasDevelop = normalizedTags.includes("develop");
					const categories = Array.from(
						new Set(
							[
								hasDevelop ? "develop" : undefined,
								hasVideo ? "video" : undefined,
								hasDesign ? "design" : undefined,
								hasVideo && hasDesign ? "video&design" : undefined,
							].filter((cat): cat is string => Boolean(cat)),
						),
					);
					const primaryCategory = categories[0] || "all";
					const fallbackDate =
						row.publishedAt ||
						row.updatedAt ||
						row.createdAt ||
						new Date().toISOString();
					const thumbnail =
						pickThumb() ?? "/images/portfolio/default-thumb.jpg";
					const description =
						typeof row.summary === "string" && row.summary.length > 0
							? row.summary
							: `${row.title}の作品詳細`;
					const rowPriority =
						typeof (row as { priority?: unknown }).priority === "number"
							? ((row as { priority?: number }).priority as number)
							: 0;

					const fallbackItem: PortfolioItemWithEnhancedFields = {
						id: row.id,
						type: "portfolio",
						title: row.title,
						description,
						category: primaryCategory,
						tags,
						status: row.status as PortfolioContentItem["status"],
						priority: rowPriority,
						createdAt: row.createdAt ?? fallbackDate,
						updatedAt: row.updatedAt ?? fallbackDate,
						publishedAt: row.publishedAt ?? fallbackDate,
						thumbnail,
						images: [],
						technologies: [],
						seo: {
							title: row.title,
							description,
							keywords: tags,
							ogImage: thumbnail,
							twitterImage: thumbnail,
							canonical: `https://yusuke-kim.com/portfolio/${row.id}`,
							structuredData: {},
						},
					};

					fallbackItem.categories =
						categories.length > 0 ? categories : [primaryCategory];
					fallbackItem.effectiveDate = fallbackDate;
					return fallbackItem;
				});
			console.warn(
				"[PortfolioPage] Falling back to index data. Processed items unavailable.",
			);
		}

		// Generate structured data (simplified to avoid loops)
		let structuredData = null;
		try {
			const seoGenerator = new PortfolioSEOMetadataGenerator(
				portfolioDataManager,
			);
			// Use minimal data to generate structured data
			const seoData = await seoGenerator.generatePortfolioTopMetadata();
			structuredData = seoData.structuredData;
		} catch (seoError) {
			console.error("SEO generation error:", seoError);
			// Continue without structured data
		}

		// Calculate category counts (supports multi-category items + video&design union)
		const categoryCounts: Record<string, number> = {};
		const getItemCategories = (item: PortfolioContentItem): string[] => {
			const enhancedCategories = (
				item as {
					categories?: string[];
				}
			).categories;
			if (Array.isArray(enhancedCategories) && enhancedCategories.length > 0) {
				return enhancedCategories
					.filter(
						(category): category is string => typeof category === "string",
					)
					.map((category) => category.toLowerCase());
			}
			return item.category ? [item.category.toLowerCase()] : [];
		};
		const incrementCategory = (category: string) => {
			categoryCounts[category] = (categoryCounts[category] || 0) + 1;
		};
		const videoDesignEligibleIds = new Set<string>();

		items.forEach((item) => {
			const categories = getItemCategories(item);
			if (categories.length === 0) {
				return;
			}

			categories.forEach((category) => incrementCategory(category));

			const normalizedTags = Array.isArray(item.tags)
				? item.tags
						.filter((tag): tag is string => typeof tag === "string")
						.map((tag) => tag.toLowerCase())
				: [];
			const matchesVideoDesign =
				categories.some((category) =>
					["video", "design", "video&design"].includes(category),
				) ||
				normalizedTags.some((tag) =>
					["video", "design", "video&design"].includes(tag),
				);
			if (matchesVideoDesign) {
				videoDesignEligibleIds.add(item.id);
			}
		});

		categoryCounts["video&design"] = videoDesignEligibleIds.size;
		["develop", "video", "design", "video&design"].forEach((key) => {
			if (typeof categoryCounts[key] !== "number") {
				categoryCounts[key] = 0;
			}
		});

		// Time window counts
		const now = Date.now();
		const msDay = 24 * 60 * 60 * 1000;
		const getEffectiveDateString = (item: PortfolioContentItem) => {
			const enhancedItem = item as PortfolioContentItem & {
				effectiveDate?: string;
			};
			return (
				enhancedItem.effectiveDate ||
				item.publishedAt ||
				item.updatedAt ||
				item.createdAt
			);
		};
		const withinDays = (item: PortfolioContentItem, days: number) => {
			const dateString = getEffectiveDateString(item);
			if (!dateString) return false;
			const t = new Date(dateString).getTime();
			if (Number.isNaN(t)) return false;
			return now - t <= days * msDay;
		};
		const count7d = items.filter((it) => withinDays(it, 7)).length;
		const count30d = items.filter((it) => withinDays(it, 30)).length;
		const count365d = items.filter((it) => withinDays(it, 365)).length;

		// Category information
		const categories = [
			{
				key: "all",
				href: "/portfolio/gallery/all",
				title: "All Projects",
				description: "バラエティを重視した全作品の一覧",
				count: items.length,
				icon: Palette,
			},
			{
				key: "develop",
				href: "/portfolio/gallery/develop",
				title: "Develop",
				description: "プログラミング関連の制作（プラグイン、ゲーム、Webなど）",
				count: categoryCounts.develop || 0,
				icon: Code,
			},
			{
				key: "video",
				href: "/portfolio/gallery/video",
				title: "Video",
				description: "映像作品の一覧",
				count: categoryCounts.video || 0,
				icon: Film,
			},
			{
				key: "video&design",
				href: "/portfolio/gallery/video&design",
				title: "Video & Design",
				description: "映像・デザイン作品の一覧",
				count: categoryCounts["video&design"] || 0,
				icon: Palette,
			},
		];

		// Helper: sort by effective date desc and take top N
		const topN = (list: PortfolioContentItem[], n: number) =>
			[...list]
				.sort(
					(a, b) =>
						new Date(b.updatedAt || b.createdAt).getTime() -
						new Date(a.updatedAt || a.createdAt).getTime(),
				)
				.slice(0, n);

		return (
			<>
				{structuredData && (
					<script type="application/ld+json">
						{JSON.stringify(structuredData)}
					</script>
				)}
				<div className="min-h-screen relative">
					<AboutBackground />

					<main
						id="main-content"
						className="relative z-10 min-h-screen py-10"
						tabIndex={-1}
					>
						<div className="container-system">
							<div className="space-y-16 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
								{/* Breadcrumbs */}
								<Breadcrumbs
									items={[
										{ label: "Home", href: "/" },
										{ label: "Portfolio", isCurrent: true },
									]}
									className="pt-4"
								/>

								{/* Hero Header */}
								<header className="space-y-8">
									<div className="space-y-4">
										<h1 className="neue-haas-grotesk-display text-6xl text-main">
											Portfolio
										</h1>
										<p className="noto-sans-jp-light text-sm max-w-2xl leading-loose">
											これまでに制作した作品/プロジェクトをまとめたポートフォリオページです。
										</p>
									</div>
								</header>

								{/* Overview (combined stats + highlights) */}
								<StatsOverview
									total={items.length}
									develop={categoryCounts.develop || 0}
									video={categoryCounts.video || 0}
									videoDesign={categoryCounts["video&design"] || 0}
									count7d={count7d}
									count30d={count30d}
									count365d={count365d}
									items={items.map((it) => ({
										id: it.id,
										title: it.title,
										thumbnail: it.thumbnail,
										publishedAt: it.publishedAt,
										updatedAt: it.updatedAt,
										createdAt: it.createdAt,
									}))}
								/>

								{/* Gallery Cards */}
								<section className="space-y-6">
									<h2 className="neue-haas-grotesk-display text-3xl text-main">
										Gallery
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										{categories.map((category) => (
											<CategoryCard
												key={category.key}
												href={category.href}
												title={category.title}
												description={category.description}
												count={category.count}
												icon={category.icon}
											/>
										))}
									</div>
								</section>

								{/* Highlights are integrated into Overview */}

								{/* Playground CTA */}
								<section className="space-y-6">
									<h2 className="neue-haas-grotesk-display text-3xl text-main">
										Playground
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<Link href="/portfolio/playground/WebGL" className="block">
											<GlowCard className="p-6 bg-base/30 backdrop-blur">
												<div className="space-y-2">
													<h3 className="zen-kaku-gothic-new text-xl text-main">
														WebGL Dome Gallery
													</h3>
													<p className="noto-sans-jp-light text-sm text-main/70">
														react-bits の Dome Gallery で遊ぶサンドボックス。
													</p>
												</div>
											</GlowCard>
										</Link>
									</div>
								</section>

								{/* Latest Works */}
								<LatestWorksSection items={items} />

								{/* Tag galleries */}
								<section className="space-y-6">
									<h2 className="neue-haas-grotesk-display text-3xl text-main">
										Develop
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{topN(
											items.filter(
												(it) =>
													Array.isArray(it.tags) && it.tags.includes("develop"),
											),
											3,
										).map((item) => (
											<Link
												href={`/portfolio/${item.id}`}
												target="_blank"
												rel="noopener noreferrer"
												key={item.id}
											>
												<PortfolioCard
													item={item}
													showMarkdownIndicator={true}
													variant="glow"
												/>
											</Link>
										))}
									</div>
								</section>

								<section className="space-y-6">
									<h2 className="neue-haas-grotesk-display text-3xl text-main">
										Video
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{topN(
											items.filter(
												(it) =>
													Array.isArray(it.tags) && it.tags.includes("video"),
											),
											3,
										).map((item) => (
											<Link
												href={`/portfolio/${item.id}`}
												target="_blank"
												rel="noopener noreferrer"
												key={item.id}
											>
												<PortfolioCard
													item={item}
													showMarkdownIndicator={true}
													variant="glow"
												/>
											</Link>
										))}
									</div>
								</section>

								<section className="space-y-6">
									<h2 className="neue-haas-grotesk-display text-3xl text-main">
										Design
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
										{topN(
											items.filter(
												(it) =>
													Array.isArray(it.tags) && it.tags.includes("design"),
											),
											3,
										).map((item) => (
											<Link
												href={`/portfolio/${item.id}`}
												target="_blank"
												rel="noopener noreferrer"
												key={item.id}
											>
												<PortfolioCard
													item={item}
													showMarkdownIndicator={true}
													variant="glow"
												/>
											</Link>
										))}
									</div>
								</section>
							</div>
						</div>
					</main>

					<footer className="fixed bottom-2 left-0 right-0 z-10 flex items-center justify-center gap-4 py-3 backdrop-blur-sm">
						<span className="text-xs text-main">© 2025 361do_sleep</span>
						<Link
							href="/privacy-policy"
							className="text-xs transition underline underline-offset-4 text-main"
						>
							Privacy Policy
						</Link>
					</footer>
				</div>
			</>
		);
	} catch (error) {
		console.error("Error in PortfolioPage:", error);

		return (
			<div className="min-h-screen relative">
				<AboutBackground />

				<main
					id="main-content"
					className="relative z-10 flex min-h-screen items-center justify-center"
					tabIndex={-1}
				>
					<div className="container mx-auto px-4">
						<div className="max-w-3xl mx-auto text-center">
							<h1 className="text-4xl sm:text-4xl font-bold italic tracking-tight text-main">
								Error
							</h1>
							<p className="mt-4 text-xs sm:text-xs text-main/70">
								ポートフォリオデータの読み込みに失敗しました。
							</p>
							<div className="mt-8">
								<Link
									href="/"
									className="text-xs sm:text-sm text-main/70 hover:text-main transition-colors underline underline-offset-4"
								>
									ホームに戻る
								</Link>
							</div>
						</div>
					</div>
				</main>
			</div>
		);
	}
}
