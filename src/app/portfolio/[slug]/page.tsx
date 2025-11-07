/**
 * Portfolio Detail Page with Dynamic SEO Metadata
 * Server-side rendered with optimized metadata generation
 */

import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { BlockContentRenderer } from "@/components/portfolio/BlockContentRenderer";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { portfolioDataManager } from "@/lib/portfolio/data-manager";
import { PortfolioSEOMetadataGenerator } from "@/lib/portfolio/seo-metadata-generator";
import type { MarkdownContentItem } from "@/types/content";
import type { PortfolioContentItem } from "@/types/portfolio";

// Type guard to check if content item has enhanced markdown features
const isEnhancedContentItem = (
	item: PortfolioContentItem,
): item is PortfolioContentItem & MarkdownContentItem => {
	return !!(item as MarkdownContentItem).markdownPath;
};

// Helper function to get markdown file path for client-side rendering
function getMarkdownFilePath(markdownPath: string): string {
	return `/data/content/markdown/${markdownPath}`;
}

interface PortfolioDetailPageProps {
	params: Promise<{
		slug: string;
	}>;
}

/**
 * Generate dynamic metadata for portfolio detail pages
 */
export async function generateMetadata({
	params,
}: PortfolioDetailPageProps): Promise<Metadata> {
	try {
		const { slug } = await params;
		const baseSlug = slug.endsWith(".md") ? slug.slice(0, -3) : slug;

		// Get portfolio item (primary: data manager; fallback: CMS API)
		let item = await portfolioDataManager.getItemById(baseSlug);
		if (!item) {
			try {
				const res = await fetch(
					`/api/cms/contents?id=${encodeURIComponent(baseSlug)}`,
					{ cache: "no-store" },
				);
				if (res.ok) {
					const full = await res.json();
					const thumbs = full?.thumbnails || {};
					const pickThumb = () => {
						if (thumbs?.image?.src) return thumbs.image.src as string;
						if (thumbs?.gif?.src) return thumbs.gif.src as string;
						if (thumbs?.webm?.poster) return thumbs.webm.poster as string;
						return undefined;
					};
					item = {
						id: full.id,
						title: full.title,
						description: full.summary ?? "",
						category:
							Array.isArray(full.tags) && full.tags.length > 0
								? full.tags[0]
								: "portfolio",
						tags: Array.isArray(full.tags) ? (full.tags as string[]) : [],
						status: full.status ?? "draft",
						priority: 0,
						createdAt: full.createdAt ?? new Date().toISOString(),
						updatedAt:
							full.updatedAt ?? full.createdAt ?? new Date().toISOString(),
						publishedAt: full.publishedAt ?? undefined,
						thumbnail: pickThumb(),
						images: Array.isArray(full.assets)
							? (full.assets
									.map((a: any) =>
										typeof a?.src === "string" ? a.src : undefined,
									)
									.filter(Boolean) as string[])
							: undefined,
						externalLinks: Array.isArray(full.links)
							? full.links.map((l: any) => ({
									type: (typeof l?.rel === "string" ? l.rel : "other") as any,
									url: l?.href,
									title: l?.label ?? l?.href,
									description: l?.description ?? undefined,
								}))
							: undefined,
					} as unknown as PortfolioContentItem;
				}
			} catch {
				// ignore
			}
		}

		if (!item) {
			return {
				title: "Portfolio Item Not Found | samuido",
				description: "The requested portfolio item was not found.",
				robots: "noindex, nofollow",
			};
		}

		// Generate metadata using SEO metadata generator
		const seoGenerator = new PortfolioSEOMetadataGenerator(
			portfolioDataManager,
		);
		const { metadata } = await seoGenerator.generateDetailMetadata(item);

		return metadata;
	} catch (error) {
		console.error(`Error generating detail metadata for ${params}:`, error);

		// Fallback metadata
		return {
			title: "Portfolio Detail | samuido",
			description: "Portfolio project details and information",
			robots: "index, follow",
		};
	}
}

/**
 * Content Section Component
 * Handles markdown and fallback content display with robust error handling
 */
function ContentSection({
	item,
	detail,
}: {
	item: PortfolioContentItem;
	detail?: { title?: string; summary?: string; body?: string } | null;
}) {
	// Check if there's meaningful content to display
	const hasMarkdownPath = isEnhancedContentItem(item) && item.markdownPath;
	const hasContent = item.content && item.content.trim().length > 0;
	const hasDescription = item.description && item.description.trim().length > 0;
	const hasMarkdownBody = detail?.body && detail.body.trim().length > 0;

	// Always show content section - never return null to avoid blank pages
	const fallbackContent =
		item.content || item.description || "詳細な説明は準備中です。";

	return (
		<section className="space-y-8 sm:space-y-12">
			{hasMarkdownBody ? (
				<div className="block-content-container">
					<BlockContentRenderer
						markdown={detail.body || ""}
						contentId={item.id}
					/>
				</div>
			) : hasMarkdownPath ? (
				<div className="markdown-container">
					{(() => {
						const mdPath = (item as MarkdownContentItem).markdownPath as string;
						return (
							<MarkdownRenderer
								filePath={getMarkdownFilePath(mdPath)}
								mediaData={{
									images: item.images || [],
									videos: item.videos || [],
									externalLinks: item.externalLinks || [],
								}}
								className="markdown-content-detail"
								fallbackContent={fallbackContent}
								enableSanitization={true}
								enableValidation={true}
								showRetryButton={false} // Disable retry button in production
								showEmptyState={true}
							/>
						);
					})()}
				</div>
			) : detail ? (
				<div className="space-y-3">
					{detail.title && (
						<h2 className="zen-kaku-gothic-new text-lg sm:text-xl text-main">
							{detail.title}
						</h2>
					)}
					{detail.summary && (
						<p className="noto-sans-jp-light text-sm sm:text-base text-main/80 leading-relaxed">
							{detail.summary}
						</p>
					)}
				</div>
			) : hasContent ? (
				<div
					className="noto-sans-jp-light text-sm sm:text-base leading-loose whitespace-pre-wrap space-y-4 text-main"
					dangerouslySetInnerHTML={{ __html: item.content || "" }}
				/>
			) : hasDescription ? (
				<div className="noto-sans-jp-light text-sm sm:text-base leading-loose space-y-4 text-main">
					{item.description}
				</div>
			) : (
				// Always show something, even if minimal
				<div className="noto-sans-jp-light text-sm sm:text-base leading-loose space-y-4 text-main/60">
					{fallbackContent}
				</div>
			)}

			{/* Show basic item information as additional context */}
			{(item.images?.length ||
				item.videos?.length ||
				item.externalLinks?.length) && (
				<div className="pt-6 sm:pt-8 border-t border-main/10">
					<div className="space-y-6 sm:space-y-8">
						{/* Images */}
						{item.images && item.images.length > 0 && (
							<div>
								<h3 className="text-sm sm:text-base font-medium text-main mb-3 sm:mb-4">
									関連画像
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
									{item.images.slice(0, 4).map((image, index) => (
										<div
											key={`${item.id}-image-${image}-${index}`}
											className="relative aspect-video bg-main/5 rounded-lg overflow-hidden"
										>
											<Image
												src={image}
												alt={`${item.title} - 画像 ${index + 1}`}
												fill
												className="object-cover transition-opacity duration-300"
												sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw"
												priority={index === 0}
											/>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Videos */}
						{item.videos && item.videos.length > 0 && (
							<div>
								<h3 className="text-sm sm:text-base font-medium text-main mb-3 sm:mb-4">
									関連動画
								</h3>
								<div className="space-y-3">
									{item.videos.slice(0, 2).map((video, index) => (
										<div
											key={`${item.id}-video-${video.url ?? index}`}
											className="border border-main/10 rounded-lg p-3 sm:p-4"
										>
											<div className="flex items-center space-x-3">
												<div className="text-lg flex-shrink-0">🎥</div>
												<div className="min-w-0 flex-1">
													<div className="font-medium text-sm sm:text-base text-main">
														{video.title || `動画 ${index + 1}`}
													</div>
													{video.description && (
														<div className="text-xs sm:text-sm text-main/60 mt-1">
															{video.description}
														</div>
													)}
													<a
														href={video.url}
														target="_blank"
														rel="noopener noreferrer"
														className="text-xs sm:text-sm text-accent hover:underline mt-1 inline-block"
													>
														動画を見る →
													</a>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* External Links */}
						{item.externalLinks && item.externalLinks.length > 0 && (
							<div>
								<h3 className="text-sm sm:text-base font-medium text-main mb-3 sm:mb-4">
									関連リンク
								</h3>
								<div className="space-y-2 sm:space-y-3">
									{item.externalLinks.map((link, index) => (
										<a
											key={`${item.id}-link-${link.url ?? index}`}
											href={link.url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center space-x-3 p-3 sm:p-4 border border-main/10 rounded-lg hover:bg-main/5 transition-colors text-main"
										>
											<div className="text-lg flex-shrink-0">🔗</div>
											<div className="min-w-0 flex-1">
												<div className="font-medium text-sm sm:text-base">
													{link.title}
												</div>
												{link.description && (
													<div className="text-xs sm:text-sm text-main/60 mt-1">
														{link.description}
													</div>
												)}
											</div>
										</a>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</section>
	);
}

/**
 * Portfolio detail page component with dynamic structured data
 */
export default async function PortfolioDetailPage({
	params,
}: PortfolioDetailPageProps) {
	const { slug } = await params;
	const baseSlug = slug.endsWith(".md") ? slug.slice(0, -3) : slug;

	try {
		// .md リクエストはmiddlewareで別ルートにrewriteされる想定（ここでは処理しない）

		// Try to fetch markdown page (legacy detail) whose slug === id
		let detailFromMarkdown: {
			title?: string;
			summary?: string;
			body?: string;
		} | null = null;
		try {
			const dbModule = await import("@/cms/lib/db");
			const db = dbModule.default;
			try {
				const row = db
					.prepare(
						`SELECT frontmatter, body FROM markdown_pages WHERE slug = @slug LIMIT 1`,
					)
					.get({ slug: baseSlug }) as
					| { frontmatter: string; body: string }
					| undefined;
				if (row?.frontmatter) {
					const fm = JSON.parse(row.frontmatter);
					detailFromMarkdown = {
						title: fm.title,
						summary: fm.summary ?? fm.description,
						body: row.body,
					};
				}
			} finally {
				// global db is shared; do not close here
			}
		} catch {}

		// Get portfolio item
		let item = await portfolioDataManager.getItemById(baseSlug);

		if (!item) {
			// Fallback: build minimal item from markdown if exists
			if (detailFromMarkdown) {
				const now = new Date().toISOString();
				item = {
					id: slug,
					title: detailFromMarkdown.title || slug,
					description: detailFromMarkdown.summary || "",
					category: "portfolio",
					tags: [],
					status: "draft",
					priority: 0,
					createdAt: now,
					updatedAt: now,
					thumbnail: undefined,
					images: [],
					externalLinks: [],
					content: detailFromMarkdown.body || "",
				} as unknown as PortfolioContentItem;
			} else {
				try {
					redirect("/404");
				} catch {
					notFound();
				}
			}
		}

		// Enrich item with publishedAt from CMS if missing
		if (item && !(item as any).publishedAt) {
			try {
				const res = await fetch(
					`http://localhost:3010/api/cms/contents?id=${encodeURIComponent(baseSlug)}`,
					{ cache: "no-store" },
				);
				if (res.ok) {
					const full = await res.json();
					if (full?.publishedAt) {
						(item as any).publishedAt = full.publishedAt;
					}
				}
			} catch {}
		}

		// Markdown content will be loaded client-side by MarkdownRenderer

		// Generate structured data
		const seoGenerator = new PortfolioSEOMetadataGenerator(
			portfolioDataManager,
		);
		const { structuredData } = await seoGenerator.generateDetailMetadata(item);

		return (
			<>
				<script type="application/ld+json">
					{JSON.stringify(structuredData)}
				</script>

				<div className="min-h-screen bg-base text-main">
					<main id="main-content" className="flex items-center py-6 sm:py-10">
						<div className="container-system mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
							<div className="space-y-8 sm:space-y-10">
								{/* Breadcrumbs */}
								<Breadcrumbs
									items={[
										{ label: "Home", href: "/" },
										{ label: "Portfolio", href: "/portfolio" },
										{ label: item.title, isCurrent: true },
									]}
									className="pt-4"
								/>

								{/* Content */}
								<ContentSection item={item} detail={detailFromMarkdown} />
							</div>
						</div>
					</main>
				</div>
			</>
		);
	} catch (error) {
		console.error(`Error rendering portfolio detail page for ${slug}:`, error);

		return (
			<div className="min-h-screen bg-base text-main flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl text-main mb-4">Portfolio Error</h1>
					<p className="text-main">
						Sorry, there was an error loading this portfolio item.
					</p>
				</div>
			</div>
		);
	}
}
