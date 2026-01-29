import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentDb } from "@/cms/lib/content-db-manager";
import { findMarkdownPage } from "@/cms/server/markdown-service";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { getContentById } from "@/lib/data";
import type { ContentItem, MarkdownContentItem } from "@/types/content";
import { isEnhancedContentItem } from "@/types/content";
import { ArticleSidePanel } from "../../components/ArticleSidePanel";
import { RelatedArticles } from "../../components/RelatedArticles";

export const runtime = "nodejs";
export const revalidate = 300;
export const dynamic = "force-dynamic";

interface BlogPageProps {
	params: Promise<{ slug: string }>;
}

interface MarkdownDetail {
	title?: string;
	summary?: string;
	body?: string;
}

// Get tags from database for a content item
function getTagsFromDb(contentId: string): string[] {
	try {
		const db = getContentDb(contentId);
		try {
			const rows = db
				.prepare("SELECT tag FROM content_tags WHERE content_id = ?")
				.all(contentId) as Array<{ tag: string }>;
			return rows.map((r) => r.tag);
		} finally {
			db.close();
		}
	} catch {
		return [];
	}
}

// Normalize URLs in markdown content
function normalizeMarkdownUrls(content: string): string {
	if (!content) return content;
	return content
		.replace(/https?:\/\/localhost:3010(\/api\/cms\/media[^\s"')]*)/g, "$1")
		.replace(
			/(<img[^>]*src=["'])https?:\/\/localhost:3010(\/api\/cms\/media[^"']*)(["'])/gi,
			"$1$2$3",
		);
}

// Load markdown detail
async function loadMarkdownDetail(
	slug: string,
): Promise<MarkdownDetail | null> {
	try {
		const match = findMarkdownPage(slug);
		if (!match) {
			return null;
		}
		const fm = match.page.frontmatter ?? {};
		const body = normalizeMarkdownUrls(match.page.body ?? "");
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

		const pageMatch = findMarkdownPage(slug);
		const contentId = pageMatch?.page.contentId;
		const content = contentId ? await getContentById("blog", contentId) : null;

		const title = content?.title || detailFromMarkdown?.title || slug;
		const description =
			content?.description ||
			detailFromMarkdown?.summary ||
			"Blog article details and information";

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
						enableSanitization={true}
						enableValidation={true}
						showRetryButton={false}
						showEmptyState={true}
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
								enableSanitization={true}
								enableValidation={true}
								showRetryButton={false}
								showEmptyState={true}
							/>
						);
					})()}
				</div>
			) : detail ? (
				<div className="space-y-3">
					{detail.title && (
						<h2 className="text-lg text-[#f2f2f2]">{detail.title}</h2>
					)}
					{detail.summary && (
						<p className="text-sm text-[#aaaaaa] leading-relaxed">
							{detail.summary}
						</p>
					)}
				</div>
			) : hasContent ? (
				<div
					className="text-sm leading-loose whitespace-pre-wrap space-y-4 text-[#f2f2f2]"
					dangerouslySetInnerHTML={{ __html: item?.content || "" }}
				/>
			) : hasDescription ? (
				<div className="text-sm leading-loose space-y-4 text-[#f2f2f2]">
					{item?.description}
				</div>
			) : (
				<div className="text-sm leading-loose space-y-4 text-[#888888]">
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

	const pageMatch = findMarkdownPage(slug);
	const contentId = pageMatch?.page.contentId;
	const content = contentId ? await getContentById("blog", contentId) : null;

	// Get tags for this article
	const articleTags = contentId ? getTagsFromDb(contentId) : [];

	const title = content?.title || detailFromMarkdown.title || slug;

	return (
		<div className="min-h-screen">
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
							<RelatedArticles articleSlug={slug} tags={articleTags} />
						</article>

						{/* Side panel */}
						<ArticleSidePanel articleSlug={slug} tags={articleTags} />
					</div>
				</div>
			</main>
		</div>
	);
}
