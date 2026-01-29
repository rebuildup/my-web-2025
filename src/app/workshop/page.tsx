import Image from "next/image";
import Link from "next/link";
import { getContentTags } from "@/cms/lib/content-db-manager";
import { listMarkdownPages } from "@/cms/server/markdown-service";
import type { MarkdownPage } from "@/cms/types/markdown";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ArticleCard } from "./components/ArticleCard";
import { ArticleGrid } from "./components/ArticleGrid";
import { SearchBar } from "./components/SearchBar";
import { TagBar } from "./components/TagBar";
import type { ArticleData } from "./types";

export const revalidate = 300;
export const runtime = "nodejs";

async function fetchContentFromCMS(id: string) {
	const baseUrl =
		process.env.NODE_ENV === "development"
			? "http://localhost:3010"
			: process.env.NEXT_PUBLIC_SITE_URL ||
				process.env.NEXT_PUBLIC_BASE_URL ||
				"https://yusuke-kim.com";

	try {
		const res = await fetch(
			`${baseUrl}/api/cms/contents?id=${encodeURIComponent(id)}`,
			{
				cache: "no-store",
			},
		);

		if (!res.ok) {
			return null;
		}

		return await res.json();
	} catch (error) {
		console.error(`[Workshop] Error fetching content ${id}:`, error);
		return null;
	}
}

function extractFirstImageFromMarkdown(markdown: string): string | undefined {
	const markdownImgRegex = /!\[([^\]]*)\]\(([^\)\s]+)(?:\s+"[^"]*")?\)/;
	const markdownMatch = markdown.match(markdownImgRegex);
	if (markdownMatch?.[2]) {
		return markdownMatch[2];
	}

	const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
	const htmlMatch = markdown.match(htmlImgRegex);
	if (htmlMatch?.[1]) {
		return htmlMatch[1];
	}

	return undefined;
}

function formatDate(isoDate: string | undefined) {
	if (!isoDate) return "2025-01-01";
	const date = new Date(isoDate);
	return Number.isNaN(date.getTime())
		? "2025-01-01"
		: new Intl.DateTimeFormat("ja-JP", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			}).format(date);
}

function getDisplayDate(page: MarkdownPage) {
	return (
		page.publishedAt ||
		page.frontmatter?.date ||
		page.frontmatter?.updated ||
		page.createdAt ||
		page.updatedAt
	);
}

async function getThumbnail(
	page: MarkdownPage,
	cmsContent: any,
): Promise<string | null> {
	const frontmatter = page.frontmatter ?? {};

	if (cmsContent?.thumbnails) {
		const thumbs = cmsContent.thumbnails;
		if (thumbs?.image?.src) {
			return thumbs.image.src;
		}
		if (thumbs?.gif?.src) {
			return thumbs.gif.src;
		}
		if (thumbs?.webm?.poster) {
			return thumbs.webm.poster;
		}
	}

	const candidates: Array<string | undefined> = [
		typeof frontmatter.thumbnail === "string"
			? frontmatter.thumbnail
			: undefined,
		typeof frontmatter.image === "string" ? frontmatter.image : undefined,
		typeof frontmatter.coverImage === "string"
			? frontmatter.coverImage
			: undefined,
		typeof frontmatter.heroImage === "string"
			? frontmatter.heroImage
			: undefined,
		typeof frontmatter.hero_image === "string"
			? frontmatter.hero_image
			: undefined,
	];

	for (const candidate of candidates) {
		if (typeof candidate === "string" && candidate.trim().length > 0) {
			return candidate;
		}
	}

	const firstImage = extractFirstImageFromMarkdown(page.body);
	if (firstImage) {
		return firstImage;
	}

	return null;
}

function getPageHref(page: MarkdownPage) {
	const fm = page.frontmatter ?? {};
	const possible: Array<string | undefined> = [
		fm.permalink as string | undefined,
		fm.url as string | undefined,
		fm.slug as string | undefined,
		page.slug,
	];
	const target = possible.find(
		(value): value is string =>
			typeof value === "string" && value.trim().length > 0,
	);
	if (!target) {
		return "#";
	}
	if (/^https?:\/\//i.test(target)) {
		return target;
	}
	if (target.startsWith("/")) {
		return target;
	}
	return `/workshop/blog/${target}`;
}

function getAllTags(
	pages: Array<{ tags: string[] }>,
): Array<{ tag: string; count: number }> {
	const tagMap = new Map<string, number>();
	for (const page of pages) {
		for (const tag of page.tags) {
			tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
		}
	}
	return Array.from(tagMap.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);
}

function isNewArticle(page: MarkdownPage): boolean {
	const date = getDisplayDate(page);
	if (!date) return false;
	const articleDate = new Date(date);
	const weekAgo = new Date();
	weekAgo.setDate(weekAgo.getDate() - 7);
	return articleDate > weekAgo;
}

interface WorkshopPageProps {
	searchParams: Promise<{
		q?: string;
		tag?: string;
		sort?: string;
		mode?: string;
	}>;
}

export default async function WorkshopPage({
	searchParams,
}: WorkshopPageProps) {
	const params = await searchParams;
	const keyword = params.q ?? null;
	const tag = params.tag ?? null;
	const sort = params.sort ?? "newest";
	const mode = params.mode ?? "normal";

	// Fetch search results if filtering
	let filteredSlugs: string[] | null = null;
	if (keyword || tag || sort !== "newest") {
		const searchUrl = new URL(
			`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3010"}/api/workshop/search`,
		);
		if (keyword) searchUrl.searchParams.set("q", keyword);
		if (tag) searchUrl.searchParams.set("tag", tag);
		if (sort) searchUrl.searchParams.set("sort", sort);
		searchUrl.searchParams.set("mode", mode);

		try {
			const searchRes = await fetch(searchUrl.toString(), {
				cache: "no-store",
			});
			if (searchRes.ok) {
				const searchData = await searchRes.json();
				filteredSlugs = searchData.slugs;
			}
		} catch (error) {
			console.error("[Workshop] Search API error:", error);
		}
	}

	// Get all markdown pages
	const markdownPages = await Promise.resolve(listMarkdownPages());
	const publishedContent = markdownPages.filter(
		(page) => (page.status ?? "draft") === "published",
	);

	// Filter by search results if available
	let pagesToDisplay = publishedContent;
	if (filteredSlugs) {
		pagesToDisplay = publishedContent.filter((page) =>
			filteredSlugs?.includes(page.slug),
		);
	}

	// Sort by date
	const sortedContent = pagesToDisplay.sort((a, b) => {
		const dateA = getDisplayDate(a)
			? new Date(getDisplayDate(a)!).getTime()
			: 0;
		const dateB = getDisplayDate(b)
			? new Date(getDisplayDate(b)!).getTime()
			: 0;
		return dateB - dateA;
	});

	// Build content tags map BEFORE building displayPagesWithCMS
	const contentTagsMap = new Map<string, string[]>();
	for (const page of sortedContent) {
		const contentId = page.contentId || page.slug;
		const tags = getContentTags(contentId);
		contentTagsMap.set(contentId, tags);
	}

	// Build article data
	const displayPagesWithCMS: ArticleData[] = await Promise.all(
		sortedContent.map(async (page) => {
			const cmsContent = await fetchContentFromCMS(page.contentId || page.slug);
			const thumbnail = await getThumbnail(page, cmsContent);
			const title = page.frontmatter?.title || page.slug;
			const description =
				cmsContent?.summary ||
				cmsContent?.description ||
				page.frontmatter?.description;
			const date = formatDate(getDisplayDate(page));
			const contentId = page.contentId || page.slug;
			const tags = contentTagsMap.get(contentId) || [];
			const href = getPageHref(page);
			const isExternal = /^https?:\/\//i.test(href);
			const isNew = isNewArticle(page);

			return {
				page,
				title,
				description,
				tags,
				thumbnail,
				date,
				href,
				isExternal,
				isNew,
			};
		}),
	);

	// Get trending tags and popular articles from full dataset
	const allTags = getAllTags(
		publishedContent.map((page) => ({
			tags: contentTagsMap.get(page.contentId || page.slug) || [],
		})),
	);
	const popularArticles = displayPagesWithCMS.slice(0, 5);

	// Get latest article for HERO section
	const latestArticle = displayPagesWithCMS[0] || null;

	// Calculate stats
	const totalArticles = displayPagesWithCMS.length;
	const totalTags = allTags.length;
	const totalViews = publishedContent.reduce((sum, page) => {
		const views = (page.frontmatter as Record<string, unknown> | undefined)
			?.views as number | undefined;
		return sum + (typeof views === "number" ? views : 0);
	}, 0);

	// Group articles by tag for default view (no search/filter)
	const articlesByTag = new Map<string, ArticleData[]>();
	for (const article of displayPagesWithCMS) {
		for (const tag of article.tags) {
			if (!articlesByTag.has(tag)) {
				articlesByTag.set(tag, []);
			}
			articlesByTag.get(tag)!.push(article);
		}
	}

	// Sort tags by count and get top tags
	const topTags = allTags.slice(0, 15);

	// Check if we should show grouped view or filtered view
	const showGroupedView = !keyword && !tag;

	return (
		<div className="min-h-screen">
			<header className="w-full h-14 border-b border-[#333333]">
				<div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-6">
					<Link
						href="/workshop"
						className="text-xl font-semibold text-white hover:underline"
					>
						Workshop
					</Link>
					<SearchBar keyword={keyword} mode={mode} />
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 py-10 relative z-10">
				<Breadcrumbs
					items={[
						{ label: "Home", href: "/" },
						{ label: "Workshop", isCurrent: true },
					]}
				/>
				{/* HERO Section - show only in grouped view */}
				{showGroupedView && latestArticle && (
					<section className="mb-16">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
							{/* Hero Content */}
							<div className="space-y-6">
								<div>
									<span className="inline-block px-3 py-1 text-xs font-semibold bg-[#2b57ff] text-white rounded mb-4">
										LATEST
									</span>
									<h1 className="text-3xl font-bold text-white leading-tight">
										{latestArticle.title}
									</h1>
									{latestArticle.description && (
										<p className="text-sm text-[#aaaaaa] line-clamp-3 leading-relaxed">
											{latestArticle.description}
										</p>
									)}
								</div>

								{/* Navigation Links */}
								<div className="flex gap-3">
									<Link
										href="/workshop/plugins"
										className="px-4 py-2 text-sm font-medium text-[#f2f2f2] bg-[#1a1a1f] border border-[#333333] rounded hover:bg-[#2a2a2f] hover:border-[#444444] transition-colors"
									>
										Plugins
									</Link>
									<Link
										href="/workshop/downloads"
										className="px-4 py-2 text-sm font-medium text-[#f2f2f2] bg-[#1a1a1f] border border-[#333333] rounded hover:bg-[#2a2a2f] hover:border-[#444444] transition-colors"
									>
										Downloads
									</Link>
								</div>

								{/* Stats */}
								<div className="grid grid-cols-3 gap-4">
									<div>
										<div className="text-2xl font-bold text-white">
											{totalArticles}
										</div>
										<div className="text-sm text-[#888888]">記事</div>
									</div>
									<div>
										<div className="text-2xl font-bold text-white">
											{totalTags}
										</div>
										<div className="text-sm text-[#888888]">タグ</div>
									</div>
									<div>
										<div className="text-2xl font-bold text-white">
											{totalViews.toLocaleString()}
										</div>
										<div className="text-sm text-[#888888]">ビュー</div>
									</div>
								</div>
							</div>

							{/* Featured Article */}
							<div className="relative group cursor-pointer">
								<Link
									href={latestArticle.href}
									target={latestArticle.isExternal ? "_blank" : undefined}
									rel={
										latestArticle.isExternal ? "noopener noreferrer" : undefined
									}
									className="block"
								>
									<div className="relative aspect-video overflow-hidden bg-[#1a1a1f] rounded-lg">
										{latestArticle.thumbnail ? (
											<Image
												src={latestArticle.thumbnail}
												alt={latestArticle.title}
												fill
												className="object-cover transition-transform duration-300 group-hover:scale-105"
												sizes="(max-width: 768px) 100vw, 50vw"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center bg-[#2a2a2f]">
												<svg
													className="w-24 h-24 text-[#444444]"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={1}
														d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
													/>
												</svg>
											</div>
										)}
										{/* Overlay on hover */}
										<div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
									</div>
								</Link>
							</div>
						</div>
					</section>
				)}

				{/* All Tags Section - show only in grouped view */}
				{showGroupedView && (
					<section className="mb-16">
						<div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide-scroll">
							{allTags.map((tagInfo) => (
								<Link
									key={tagInfo.tag}
									href={`?mode=${mode}&tag=${encodeURIComponent(tagInfo.tag)}`}
									className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#f2f2f2] bg-[#1a1a1f] border border-[#333333] rounded hover:bg-[#2a2a2f] hover:border-[#444444] hover:text-[#2b57ff] transition-all snap-start"
								>
									<span>#{tagInfo.tag} </span>
									<span className="text-xs text-[#888888]">
										{tagInfo.count}
									</span>
								</Link>
							))}
						</div>
					</section>
				)}

				{/* Filter view - show when keyword or tag is selected */}
				{!showGroupedView && (
					<>
						<div className="mb-8">
							<div className="flex flex-col gap-4">
								<div className="flex items-center justify-between">
									<h1 className="text-2xl font-bold text-white">
										Articles
										<span className="ml-2 text-sm font-normal text-[#888888]">
											({displayPagesWithCMS.length}記事)
										</span>
									</h1>
									<div className="flex items-center gap-2">
										<span className="text-sm text-[#888888]">ソート:</span>
										<div className="flex bg-[#1a1a1f] border border-[#333333] rounded">
											<Link
												href={`?mode=${mode}&q=${keyword || ""}&tag=${tag || ""}&sort=newest`}
												className={`px-3 py-1.5 text-sm rounded-l ${
													sort === "newest"
														? "bg-[#2b57ff] text-white"
														: "text-[#f2f2f2] hover:bg-[#2a2a2f]"
												}`}
											>
												新着
											</Link>
											<Link
												href={`?mode=${mode}&q=${keyword || ""}&tag=${tag || ""}&sort=popular`}
												className={`px-3 py-1.5 text-sm ${
													sort === "popular"
														? "bg-[#2b57ff] text-white"
														: "text-[#f2f2f2] hover:bg-[#2a2a2f]"
												}`}
											>
												人気
											</Link>
											<Link
												href={`?mode=${mode}&q=${keyword || ""}&tag=${tag || ""}&sort=alphabetical`}
												className={`px-3 py-1.5 text-sm rounded-r ${
													sort === "alphabetical"
														? "bg-[#2b57ff] text-white"
														: "text-[#f2f2f2] hover:bg-[#2a2a2f]"
												}`}
											>
												名前順
											</Link>
										</div>
									</div>
								</div>
								<TagBar tags={allTags.slice(0, 15)} selectedTag={tag} />
							</div>
						</div>

						<div className="flex gap-8">
							<section className="flex-1">
								<ArticleGrid articles={displayPagesWithCMS} />
							</section>

							<aside className="w-80 space-y-5 hidden lg:block">
								<div className="p-4 bg-[#1a1a1f] border border-[#333333] rounded">
									<h2 className="text-base font-semibold text-[#f2f2f2] mb-4">
										Trending Tags
									</h2>
									<div className="space-y-3">
										{allTags.slice(0, 10).map((item, index) => {
											const tagArticles = articlesByTag.get(item.tag);
											const firstArticle = tagArticles?.[0];
											return (
												<Link
													key={item.tag}
													href={`?mode=${mode}&tag=${encodeURIComponent(item.tag)}`}
													className="flex items-center gap-3 hover:bg-[#2a2a2f] p-2 rounded transition-colors group"
												>
													{/* Tag info */}
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<span
																className={`text-sm font-semibold ${
																	index === 0
																		? "text-[#2b57ff]"
																		: "text-[#f2f2f2]"
																}`}
															>
																#{item.tag}
															</span>
														</div>
														<span className="text-xs text-[#888888]">
															{item.count}記事
														</span>
													</div>
													{/* Thumbnail */}
													<div className="relative w-12 h-12 shrink-0 bg-[#2a2a2f] rounded overflow-hidden">
														{firstArticle?.thumbnail ? (
															<Image
																src={firstArticle.thumbnail}
																alt={item.tag}
																fill
																className="object-cover transition-transform duration-300 group-hover:scale-105"
																sizes="48px"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center">
																<svg
																	className="w-6 h-6 text-[#444444]"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={1}
																		d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
																	/>
																</svg>
															</div>
														)}
													</div>
												</Link>
											);
										})}
									</div>
								</div>

								<div className="p-4 bg-[#1a1a1f] border border-[#333333] rounded">
									<h2 className="text-base font-semibold text-[#f2f2f2] mb-4">
										Popular Articles
									</h2>
									<div className="space-y-3">
										{popularArticles.map((item, index) => (
											<Link
												key={item.page.slug}
												href={item.href}
												className="flex items-center gap-3 hover:bg-[#2a2a2f] p-2 rounded transition-colors group"
											>
												{/* Title */}
												<div className="flex-1 min-w-0">
													<p className="text-sm text-[#2b57ff] line-clamp-2 group-hover:underline">
														{item.title}
													</p>
												</div>
												{/* Thumbnail */}
												<div className="relative w-12 h-12 shrink-0 bg-[#2a2a2f] rounded overflow-hidden">
													{item.thumbnail ? (
														<Image
															src={item.thumbnail}
															alt={item.title}
															fill
															className="object-cover transition-transform duration-300 group-hover:scale-105"
															sizes="48px"
														/>
													) : (
														<div className="w-full h-full flex items-center justify-center">
															<svg
																className="w-6 h-6 text-[#444444]"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={1}
																	d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
																/>
															</svg>
														</div>
													)}
												</div>
											</Link>
										))}
									</div>
								</div>
							</aside>
						</div>
					</>
				)}

				{/* Grouped view - show by default */}
				{showGroupedView && (
					<>
						<div className="space-y-12">
							{topTags.map((tagInfo) => {
								const tagArticles = articlesByTag.get(tagInfo.tag);
								if (!tagArticles || tagArticles.length === 0) return null;

								return (
									<section key={tagInfo.tag} className="space-y-4">
										<div className="flex items-center gap-3">
											<Link
												href={`?mode=${mode}&tag=${encodeURIComponent(tagInfo.tag)}`}
												className="text-xl font-bold text-white hover:text-[#2b57ff] transition-colors"
											>
												#{tagInfo.tag}
											</Link>
											<span className="text-sm text-[#888888]">
												{tagArticles.length}記事
											</span>
										</div>
										<div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide-scroll">
											{tagArticles.map((article) => (
												<div className="shrink-0 w-[320px] snap-start">
													<ArticleCard
														key={article.page.slug}
														title={article.title}
														description={article.description}
														tags={article.tags}
														thumbnail={article.thumbnail}
														date={article.date}
														href={article.href}
														isExternal={article.isExternal}
														isNew={article.isNew}
													/>
												</div>
											))}
										</div>
									</section>
								);
							})}
						</div>
					</>
				)}
			</main>
		</div>
	);
}
