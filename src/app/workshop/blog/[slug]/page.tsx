import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarkdownPageCanonicalSlug } from "@/cms/lib/markdown-slug";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import {
	fetchCmsContentById,
	fetchCmsContentTags,
	fetchMarkdownPageBySlug,
	fetchMarkdownPages,
} from "@/lib/cms-api/server-data";
import { normalizeMarkdownUrls } from "@/lib/markdown/url-normalizer";
import { contentCache } from "@/lib/server-cache";
import {
	getRandomArticles,
	getRelatedArticles,
} from "@/lib/workshop/article-recommendations";
import type { ContentItem, MarkdownContentItem } from "@/types/content";
import { isEnhancedContentItem } from "@/types/content";
import { ArticleSidePanel } from "../../components/ArticleSidePanel";
import { RelatedArticles } from "../../components/RelatedArticles";

interface BlogPageProps {
	params: Promise<{ slug: string }>;
}

interface MarkdownDetail {
	title?: string;
	summary?: string;
	body?: string;
}

// Cached blog data loader for performance optimization
async function loadBlogDataCached(slug: string) {
	const cacheKey = `blog-detail-${slug}`;

	const cached = contentCache.get(cacheKey) as
		| {
				page: {
					frontmatter: Record<string, unknown>;
					body: string;
					contentId: string;
				};
				contentId: string;
				content: unknown;
		  }
		| undefined;
	if (cached) {
		console.log(`[BlogDetail] Cache hit for: ${cacheKey}`);
		return cached;
	}

	const pageMatch = await fetchMarkdownPageBySlug(slug);
	if (!pageMatch) {
		return null;
	}

	const contentId = pageMatch.contentId;
	let content = null;
	if (contentId) {
		try {
			content = await fetchCmsContentById(contentId);
		} catch {
			content = null;
		}
	}

	const result = {
		page: {
			frontmatter: pageMatch.frontmatter ?? {},
			body: pageMatch.body ?? "",
			contentId: pageMatch.contentId ?? "",
		},
		contentId,
		content,
	};
	contentCache.set(cacheKey, result);
	return result;
}

// Normalize URLs in markdown content.
//
// Markdown bodies can contain absolute URLs that point to a local CMS API
// (e.g. `http://127.0.0.1:3001/media?contentId=…` or
// `http://localhost:3010/api/cms/media?contentId=…`) when the post was
// authored with a dev server. Those hosts are unreachable from visitors'
// browsers in production, so we rewrite every dev-host URL to a relative
// `/api/cms/media?…` path that Nginx proxies to the Rust CMS API.
//
// We handle three host variations (`127.0.0.1`, `localhost`, `0.0.0.0`),
// any port, and both the canonical `/api/cms/media` form and the legacy
// `/media` form (the legacy form has to gain the `/api/cms` prefix;
// Nginx only proxies `/api/` to the Rust API, so a bare `/media?…` would
// hit the static export and 404).

// Load markdown detail with caching
async function loadMarkdownDetail(
	slug: string,
): Promise<MarkdownDetail | null> {
	try {
		const data = await loadBlogDataCached(slug);
		if (!data) {
			return null;
		}
		const fm = data.page.frontmatter;
		const body = normalizeMarkdownUrls(data.page.body);
		return {
			title: fm.title as string | undefined,
			summary:
				(fm.summary as string | undefined) ??
				(fm.description as string | undefined),
			body,
		};
	} catch (error) {
		console.warn("Failed to load markdown detail for", slug, error);
		return null;
	}
}

// Helper function to get markdown file path
function getMarkdownFilePath(markdownPath: string): string {
	return `/data/content/markdown/${markdownPath}`;
}

/**
 * Generate dynamic metadata
 */
export async function generateMetadata({
	params,
}: BlogPageProps): Promise<Metadata> {
	try {
		const { slug } = await params;
		const detailFromMarkdown = await loadMarkdownDetail(slug);

		const data = await loadBlogDataCached(slug);
		const content = data?.content;

		const title = content
			? (content as { title?: string }).title ||
				detailFromMarkdown?.title ||
				slug
			: detailFromMarkdown?.title || slug;
		const description = content
			? (content as { description?: string }).description ||
				detailFromMarkdown?.summary
			: detailFromMarkdown?.summary || "Blog article details and information";

		return {
			title: `${title} | samuido`,
			description,
			robots: "index, follow",
		};
	} catch (_error) {
		return {
			title: "Blog Detail | samuido",
			description: "Blog article details and information",
			robots: "index, follow",
		};
	}
}

/**
 * Content Section Component
 */
function ContentSection({
	item,
	detail,
}: {
	item: ContentItem | null;
	detail?: MarkdownDetail | null;
}) {
	const hasMarkdownPath =
		item && isEnhancedContentItem(item) && item.markdownPath;
	const hasContent = item?.content && item.content.trim().length > 0;
	const hasDescription =
		item?.description && item.description.trim().length > 0;
	const hasMarkdownBody = detail?.body && detail.body.trim().length > 0;

	const fallbackContent =
		item?.content ||
		item?.description ||
		detail?.summary ||
		"詳細な説明は準備中です.";

	return (
		<section className="space-y-8">
			{hasMarkdownBody ? (
				<div className="markdown-container">
					<MarkdownRenderer
						content={detail.body || ""}
						mediaData={{
							images: item?.images || [],
							videos: item?.videos || [],
							externalLinks: item?.externalLinks || [],
						}}
						className="markdown-content-detail"
						fallbackContent={fallbackContent}
						behavior={{
							enableSanitization: true,
							enableValidation: true,
							showRetryButton: false,
							showEmptyState: true,
						}}
						contentId={item?.id}
					/>
				</div>
			) : hasMarkdownPath && item ? (
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
								behavior={{
									enableSanitization: true,
									enableValidation: true,
									showRetryButton: false,
									showEmptyState: true,
								}}
							/>
						);
					})()}
				</div>
			) : detail ? (
				<div className="space-y-3">
					{detail.title && <h2 className="text-lg ">{detail.title}</h2>}
					{detail.summary && (
						<p className="text-sm  leading-relaxed">{detail.summary}</p>
					)}
				</div>
			) : hasContent ? (
				<div
					className="text-sm leading-loose whitespace-pre-wrap space-y-4 "
					dangerouslySetInnerHTML={{ __html: item?.content || "" }}
				/>
			) : hasDescription ? (
				<div className="text-sm leading-loose space-y-4 ">
					{item?.description}
				</div>
			) : (
				<div className="text-sm leading-loose space-y-4 ">
					{fallbackContent}
				</div>
			)}
		</section>
	);
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
	const { slug } = await params;
	const detailFromMarkdown = await loadMarkdownDetail(slug);

	if (!detailFromMarkdown) {
		notFound();
	}

	const data = await loadBlogDataCached(slug);
	const content = data?.content as ContentItem | null;
	const contentId = data?.contentId || "";

	// Get tags for this article
	const articleTags = contentId ? await fetchCmsContentTags(contentId) : [];

	// Pre-compute related + random recommendations at SSG time so the
	// rendered HTML contains the recommendation cards directly. The legacy
	// `/api/workshop/random` and `/api/workshop/related` routes used to be
	// fetched by the client components at runtime, but those routes 404 in
	// `output: 'export'` builds because no Node server is running on the
	// static export. See `@/lib/workshop/article-recommendations`.
	const [relatedArticles, randomArticles] = await Promise.all([
		getRelatedArticles({ slug, tags: articleTags, limit: 6 }),
		getRandomArticles({ excludeSlug: slug, limit: 3 }),
	]);
	const topTags = articleTags.slice(0, 2);

	const title = content?.title || detailFromMarkdown.title || slug;

	return (
		<div className="min-h-dvh">
			<main className="max-w-7xl mx-auto px-4 py-10">
				<div className="space-y-8">
					<Breadcrumbs
						items={[
							{ label: "Home", href: "/" },
							{ label: "Workshop", href: "/workshop" },
							{ label: title, isCurrent: true },
						]}
					/>

					{/* Main content with side panel */}
					<div className="flex gap-8">
						{/* Article content */}
						<article className="flex-1 min-w-0">
							<ContentSection item={content} detail={detailFromMarkdown} />
							{/* Related articles at the bottom */}
							<RelatedArticles articles={relatedArticles} topTags={topTags} />
						</article>

						{/* Side panel */}
						<ArticleSidePanel
							articleSlug={slug}
							tags={articleTags}
							randomArticles={randomArticles}
						/>
					</div>
				</div>
			</main>
		</div>
	);
}

export async function generateStaticParams() {
	try {
		const pages = await fetchMarkdownPages();
		const params = pages
			.map((page) => ({ slug: getMarkdownPageCanonicalSlug(page) }))
			.filter(
				(p): p is { slug: string } =>
					typeof p.slug === "string" && p.slug.length > 0,
			);
		if (params.length === 0) {
			return [{ slug: "placeholder" }];
		}
		return params;
	} catch {
		return [{ slug: "placeholder" }];
	}
}
