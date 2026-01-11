"use client";

/**
 * Develop Gallery Client Component
 * Development projects gallery with filtering and sorting
 * Task 4.2: Gallery performance optimization - never load markdown files
 *
 * Gallery Performance Rules:
 * - NEVER load markdown files for gallery display
 * - Only display essential information (title, description, thumbnail, category, tags)
 * - Use enhanced gallery filter with caching for performance
 * - Maintain consistent performance with large datasets
 */

import { Calendar, Code, ExternalLink, Github } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import GlowCard from "@/components/ui/GlowCard";
import { SafeImage } from "@/components/ui/SafeImage";
import type { PortfolioContentItem } from "@/lib/portfolio/data-processor";
import type { SearchFilter } from "@/lib/portfolio/search-index";
import type { EnhancedContentItem } from "@/types";
import { DetailModal } from "../../all/components/DetailModal";
import { Pagination } from "../../all/components/Pagination";

export interface FilterOptions {
	category?: string;
	technologies?: string[];
	year?: string;
	tags?: string[];
	search?: string;
}

export interface SortOptions {
	sortBy: "createdAt" | "updatedAt" | "title" | "priority" | "effectiveDate";
	sortOrder: "asc" | "desc";
}

interface DevelopGalleryClientProps {
	initialItems: PortfolioContentItem[];
	searchFilters?: SearchFilter[];
}

const ITEMS_PER_PAGE = 12;

export function DevelopGalleryClient({
	initialItems,
}: DevelopGalleryClientProps) {
	// State management
	const [selectedItem, setSelectedItem] = useState<PortfolioContentItem | null>(
		null,
	);
	const [currentPage, setCurrentPage] = useState(1);

	// Filter and sort items - only show develop category items（空のときフォールバック）
	const filteredAndSortedItems = useMemo(() => {
		// 1) 簡易フォールバック（tags/category/categories）
		let items = initialItems.filter((it: any) => {
			const hasTags = Array.isArray(it?.tags) && it.tags.includes("develop");
			const hasCategory =
				typeof it?.category === "string" && it.category === "develop";
			const hasCategories =
				Array.isArray(it?.categories) && it.categories.includes("develop");
			return hasTags || hasCategory || hasCategories;
		}) as unknown as EnhancedContentItem[];

		// 2) ソート（publishedAt最優先の降順.フォールバックはupdatedAt→createdAt）
		items = [...items].sort((a: any, b: any) => {
			const aTime = new Date(
				a.publishedAt || a.updatedAt || a.createdAt,
			).getTime();
			const bTime = new Date(
				b.publishedAt || b.updatedAt || b.createdAt,
			).getTime();
			return bTime - aTime;
		});
		if (process.env.NODE_ENV !== "production") {
			// 先頭数件のpublishedAtを確認
			// eslint-disable-next-line no-console
			console.log(
				"[DevelopGalleryClient] top5 by publishedAt:",
				items.slice(0, 5).map((i: any) => ({
					id: i.id,
					publishedAt: i.publishedAt,
					updatedAt: i.updatedAt,
					createdAt: i.createdAt,
				})),
			);
		}

		return items;
	}, [initialItems]);

	// Pagination
	const totalPages = Math.ceil(filteredAndSortedItems.length / ITEMS_PER_PAGE);
	const paginatedItems = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredAndSortedItems.slice(
			startIndex,
			startIndex + ITEMS_PER_PAGE,
		);
	}, [filteredAndSortedItems, currentPage]);

	// Event handlers
	const handlePageChange = useCallback((page: number) => {
		setCurrentPage(page);
		// Scroll to top of gallery
		const element = document.getElementById("gallery-content");
		if (element && typeof element.scrollIntoView === "function") {
			element.scrollIntoView({
				behavior: "smooth",
			});
		}
	}, []);

	const handleModalClose = useCallback(() => {
		setSelectedItem(null);
	}, []);

	// Transform portfolio item to development project format
	const transformToDevelopProject = useCallback(
		(item: PortfolioContentItem | EnhancedContentItem) => {
			// Extract technologies from tags or use default
			const technologies =
				(item as unknown as PortfolioContentItem).technologies &&
				(item as unknown as PortfolioContentItem).technologies.length > 0
					? (item as unknown as PortfolioContentItem).technologies
					: item.tags.length > 0
						? item.tags
						: ["Web Development"];

			// Get GitHub repository link
			const githubUrl = item.externalLinks?.find(
				(link) => link.type === "github" || link.url.includes("github.com"),
			)?.url;

			// Get live demo link
			const liveUrl = item.externalLinks?.find(
				(link) => link.type === "demo" || link.type === "website",
			)?.url;

			// Format date (publishedAt優先)
			const date = new Date(
				(item as any).publishedAt || item.updatedAt || item.createdAt,
			).toLocaleDateString("ja-JP", {
				year: "numeric",
				month: "2-digit",
			});

			// Determine status
			const status = item.status === "published" ? "completed" : "ongoing";

			// Get the best available thumbnail
			const thumbnail =
				item.thumbnail ||
				(item.images && item.images.length > 0 ? item.images[0] : null) ||
				(item.videos && item.videos.length > 0 && item.videos[0].thumbnail
					? item.videos[0].thumbnail
					: null) ||
				"/images/default-project.png";

			return {
				id: item.id,
				title: item.title,
				description: item.description || "Development project",
				technologies,
				githubUrl,
				liveUrl,
				date,
				status,
				featured: item.priority >= 50,
				thumbnail,
				hasVideo: item.videos && item.videos.length > 0,
				videoUrl: item.videos?.[0]?.url,
			};
		},
		[],
	);

	// Transform paginated items to development project format
	const developProjects = useMemo(() => {
		return paginatedItems.map(transformToDevelopProject);
	}, [paginatedItems, transformToDevelopProject]);

	return (
		<div className="space-y-10">
			{/* Header */}
			<header className="space-y-8">
				<div className="space-y-4">
					<h1 className="neue-haas-grotesk-display text-6xl text-main">
						Development Projects
					</h1>
					<p className="noto-sans-jp-light text-sm max-w leading-loose">
						開発系プロジェクトをまとめたギャラリーです
					</p>
				</div>
			</header>

			{/* Gallery Content - Alternating Layout */}
			<section id="gallery-content" className="mt-2 md:mt-4">
				{initialItems.length === 0 ? (
					<div className="text-center py-16">
						<p className="noto-sans-jp-light text-sm text-main">
							開発プロジェクトデータを読み込めませんでした.
						</p>
						<p className="noto-sans-jp-light text-xs text-main/60 mt-2">
							初期アイテム数: {initialItems.length}
						</p>
						<button
							type="button"
							onClick={() => window.location.reload()}
							className="mt-4 text-accent hover:text-main transition-colors"
						>
							ページを再読み込み
						</button>
					</div>
				) : developProjects.length > 0 ? (
					<div className="space-y-8">
						{/* All Projects - Single Row Alternating Layout */}
						<div className="space-y-12">
							{developProjects.map((project, index) => (
								<div
									key={project.id}
									className="flex flex-col lg:flex-row lg:items-center gap-8"
								>
									{/* Project Thumbnail - Left on even, Right on odd */}
									<div
										className={`lg:w-1/2 ${index % 2 === 1 ? "lg:order-2" : "lg:order-1"}`}
									>
										<Link href={`/portfolio/${project.id}`}>
											<GlowCard className="group cursor-pointer text-left block bg-base/30 backdrop-blur overflow-hidden">
												<div className="aspect-video bg-base overflow-hidden relative">
													{project.thumbnail &&
													project.thumbnail !==
														"/images/default-project.png" ? (
														<SafeImage
															src={project.thumbnail}
															alt={project.title}
															fill
															className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
															style={{
																objectPosition: "center center",
																transformOrigin: "center center",
															}}
															sizes="(max-width: 768px) 100vw, 50vw"
															showDebug={false}
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center bg-base">
															<div className="text-center">
																<Code className="w-12 h-12 text-accent mx-auto mb-2" />
																<span className="noto-sans-jp-light text-sm text-main">
																	{project.title}
																</span>
															</div>
														</div>
													)}
												</div>
											</GlowCard>
										</Link>
									</div>

									{/* Project Info - Right on even, Left on odd */}
									<div
										className={`lg:w-1/2 space-y-4 ${index % 2 === 1 ? "lg:order-1" : "lg:order-2"}`}
									>
										{/* Title row with dev icon and date */}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<Code className="w-5 h-5 text-accent" />
												<Link href={`/portfolio/${project.id}`}>
													<h3 className="zen-kaku-gothic-new text-2xl text-main hover:text-accent transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
														{project.title}
													</h3>
												</Link>
											</div>
											<div className="flex items-center">
												<Calendar className="w-4 h-4 text-main/70 mr-2" />
												<span className="noto-sans-jp-light text-sm text-main/70 whitespace-nowrap">
													{project.date}
												</span>
											</div>
										</div>

										{/* Description - fixed 3 lines */}
										<div className="h-[72px] overflow-hidden">
											<p
												className="noto-sans-jp-light text-base text-main leading-6"
												style={{
													display: "-webkit-box",
													WebkitLineClamp: 3,
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
												}}
											>
												{project.description}
											</p>
										</div>

										{/* Technologies (no heading) */}
										<div className="space-y-2">
											<div className="flex flex-wrap gap-1.5">
												{project.technologies.map((tech: string) => (
													<span
														key={tech}
														className="noto-sans-jp-light text-xs text-main/90 px-3 py-1 bg-main/10 rounded-full"
													>
														{tech}
													</span>
												))}
											</div>
										</div>

										{/* Repository and Live Links */}
										<div className="flex items-center gap-3 pt-2">
											{project.githubUrl && (
												<a
													href={project.githubUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center px-3 py-1.5 rounded-[8px] bg-base/30 hover:bg-base/50 transition-colors ring-1 ring-main/20"
												>
													<Github className="w-5 h-5 mr-2" />
													<span className="noto-sans-jp-light text-sm">
														Repository
													</span>
												</a>
											)}
											{project.liveUrl && (
												<a
													href={project.liveUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center px-3 py-1.5 rounded-[8px] bg-base/30 hover:bg-base/50 transition-colors ring-1 ring-main/20"
												>
													<ExternalLink className="w-5 h-5 mr-2" />
													<span className="noto-sans-jp-light text-sm">
														Live Demo
													</span>
												</a>
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={handlePageChange}
							/>
						)}
					</div>
				) : (
					<div className="text-center py-16">
						<p className="noto-sans-jp-light text-sm text-main">
							フィルター条件に一致する開発プロジェクトが見つかりませんでした.
						</p>
						<p className="noto-sans-jp-light text-xs text-main/60 mt-2">
							開発プロジェクト数: {filteredAndSortedItems.length}
						</p>
					</div>
				)}
			</section>

			{/* Navigation Links */}
			<nav aria-label="Development gallery functions">
				<h3 className="sr-only">Development Gallery機能</h3>
				<div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-6">
					<Link
						href="/portfolio/gallery/all"
						className="bg-base/30 backdrop-blur text-center p-4 flex items-center justify-center hover:bg-base/50 transition-colors rounded-[20px]"
					>
						<span className="noto-sans-jp-regular text-base leading-snug">
							All Projects
						</span>
					</Link>

					<Link
						href="/portfolio/gallery/video"
						className="bg-base/30 backdrop-blur text-center p-4 flex items-center justify-center hover:bg-base/50 transition-colors rounded-[20px]"
					>
						<span className="noto-sans-jp-regular text-base leading-snug">
							Video Projects
						</span>
					</Link>

					<Link
						href="/about/commission/develop"
						className="bg-base/30 backdrop-blur text-center p-4 flex items-center justify-center hover:bg-base/50 transition-colors rounded-[20px]"
					>
						<span className="noto-sans-jp-regular text-base leading-snug">
							Commission
						</span>
					</Link>
				</div>
			</nav>

			{/* Detail Modal */}
			{selectedItem && (
				<DetailModal item={selectedItem} onClose={handleModalClose} />
			)}
		</div>
	);
}
