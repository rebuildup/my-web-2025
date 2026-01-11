import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findMarkdownPage } from "@/cms/server/markdown-service";
import HomeBackground from "@/components/HomeBackground";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import { getContentById } from "@/lib/data";
import type { ContentItem, MarkdownContentItem } from "@/types/content";
import { isEnhancedContentItem } from "@/types/content";

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

// Normalize URLs in markdown content (replace localhost:3010 with relative paths)
function normalizeMarkdownUrls(content: string): string {
	if (!content) return content;
	// Replace http://localhost:3010 and https://localhost:3010 with relative paths
	// Handle both markdown format and HTML img tags
	return content
		.replace(/https?:\/\/localhost:3010(\/api\/cms\/media[^\s"')]*)/g, "$1")
		.replace(
			/(<img[^>]*src=["'])https?:\/\/localhost:3010(\/api\/cms\/media[^"']*)(["'])/gi,
			"$1$2$3",
		);
}

// portfolio/[slug]と同じ方法でマークダウンを読み込む
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

// Helper function to get markdown file path for client-side rendering
function getMarkdownFilePath(markdownPath: string): string {
	return `/data/content/markdown/${markdownPath}`;
}

/**
 * Generate dynamic metadata for blog detail pages
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
	} catch (error) {
		console.error(`Error generating detail metadata for ${params}:`, error);

		// Fallback metadata
		return {
			title: "Blog Detail | samuido",
			description: "Blog article details and information",
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
	item: ContentItem | null;
	detail?: MarkdownDetail | null;
}) {
	// Check if there's meaningful content to display
	const hasMarkdownPath =
		item && isEnhancedContentItem(item) && item.markdownPath;
	const hasContent = item?.content && item.content.trim().length > 0;
	const hasDescription =
		item?.description && item.description.trim().length > 0;
	const hasMarkdownBody = detail?.body && detail.body.trim().length > 0;

	// Always show content section - never return null to avoid blank pages
	const fallbackContent =
		item?.content ||
		item?.description ||
		detail?.summary ||
		"詳細な説明は準備中です.";

	return (
		<section className="space-y-8 sm:space-y-12">
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
					dangerouslySetInnerHTML={{ __html: item?.content || "" }}
				/>
			) : hasDescription ? (
				<div className="noto-sans-jp-light text-sm sm:text-base leading-loose space-y-4 text-main">
					{item?.description}
				</div>
			) : (
				// Always show something, even if minimal
				<div className="noto-sans-jp-light text-sm sm:text-base leading-loose space-y-4 text-main/60">
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

	// content_idからコンテンツデータを取得（メディアデータ用）
	// まず、markdown_pagesテーブルからcontent_idを取得
	const pageMatch = findMarkdownPage(slug);
	const contentId = pageMatch?.page.contentId;
	const content = contentId ? await getContentById("blog", contentId) : null;

	const title = content?.title || detailFromMarkdown.title || slug;

	return (
		<div className="relative min-h-screen bg-base text-main">
			<HomeBackground />
			<main
				id="main-content"
				className="relative z-10 min-h-screen flex items-center py-6 sm:py-10"
				tabIndex={-1}
			>
				<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
					<div className="space-y-8 sm:space-y-10">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "Workshop", href: "/workshop" },
								{ label: title, isCurrent: true },
							]}
							className="pt-4"
						/>
						<ContentSection item={content} detail={detailFromMarkdown} />
					</div>
				</div>
			</main>
		</div>
	);
}
