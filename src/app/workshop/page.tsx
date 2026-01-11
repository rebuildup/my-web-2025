import Link from "next/link";
import { getAllFromIndex } from "@/cms/lib/content-db-manager";
import { listMarkdownPages } from "@/cms/server/markdown-service";
import type { MarkdownPage } from "@/cms/types/markdown";
import HomeBackground from "@/components/HomeBackground";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { loadContentByType } from "@/lib/data";
import type { ContentItem } from "@/types/content";

export const revalidate = 300;
export const runtime = "nodejs";

const CARD_SURFACE =
	"group relative flex h-full flex-col overflow-hidden rounded-2xl bg-base/75 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5";

type ContentIndexEntry = ReturnType<typeof getAllFromIndex>[number];

function isLikelyMediaUrl(url: string): boolean {
	if (typeof url !== "string") return false;
	const trimmed = url.trim();
	if (trimmed.length === 0) return false;
	if (!/^https?:\/\//i.test(trimmed))
		return /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(trimmed);
	if (
		trimmed.includes("youtube.com") ||
		trimmed.includes("youtu.be") ||
		trimmed.includes("vimeo.com")
	) {
		return false;
	}
	return (
		/\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(trimmed) ||
		trimmed.includes("/media/") ||
		trimmed.includes("/images/")
	);
}

function _findImageUrl(value: unknown, depth = 0): string | undefined {
	if (depth > 3 || value == null) return undefined;
	if (typeof value === "string") {
		const trimmed = value.trim();
		if (trimmed.length === 0) return undefined;
		if (isLikelyMediaUrl(trimmed)) {
			return trimmed;
		}
	}
	if (Array.isArray(value)) {
		for (const item of value) {
			const found = _findImageUrl(item, depth + 1);
			if (found) return found;
		}
		return undefined;
	}
	if (typeof value === "object") {
		for (const key of Object.keys(value as Record<string, unknown>)) {
			const found = _findImageUrl(
				(value as Record<string, unknown>)[key],
				depth + 1,
			);
			if (found) return found;
		}
	}
	return undefined;
}

function pickIndexThumbnail(
	thumbnails: ContentIndexEntry["thumbnails"],
): string | undefined {
	if (!thumbnails || typeof thumbnails !== "object") {
		return undefined;
	}
	const variants = thumbnails as Record<string, unknown> & {
		prefer?: string[];
	};
	const prefer = Array.isArray(variants.prefer)
		? variants.prefer
		: ["image", "gif", "webm"];
	for (const key of prefer) {
		const variant = variants[key];
		if (!variant) continue;
		if (typeof variant === "string" && variant.trim().length > 0) {
			return variant;
		}
		if (
			typeof (variant as { src?: unknown }).src === "string" &&
			(variant as { src: string }).src.trim().length > 0
		) {
			return (variant as { src: string }).src;
		}
		if (
			typeof (variant as { poster?: unknown }).poster === "string" &&
			(variant as { poster: string }).poster.trim().length > 0
		) {
			return (variant as { poster: string }).poster;
		}
	}
	for (const value of Object.values(variants)) {
		if (typeof value === "string" && value.trim().length > 0) {
			return value;
		}
		if (
			value &&
			typeof value === "object" &&
			typeof (value as { src?: unknown }).src === "string"
		) {
			const src = (value as { src: string }).src.trim();
			if (src.length > 0) {
				return src;
			}
		}
	}
	return undefined;
}

function resolveContentThumbnail(
	content: ContentItem | undefined,
): string | undefined {
	if (!content) return undefined;
	if (
		typeof content.thumbnail === "string" &&
		content.thumbnail.trim().length > 0
	) {
		return content.thumbnail;
	}
	if (Array.isArray(content.images)) {
		const fromImages = content.images.find(
			(img) => typeof img === "string" && img.trim().length > 0,
		);
		if (fromImages) return fromImages;
	}
	if (Array.isArray(content.videos) && content.videos.length > 0) {
		const fromVideo = content.videos.find(
			(video) => !!video?.thumbnail,
		)?.thumbnail;
		if (typeof fromVideo === "string" && fromVideo.trim().length > 0) {
			return fromVideo;
		}
	}
	if (content.customFields && typeof content.customFields === "object") {
		const cf = content.customFields as Record<string, unknown>;
		const cfThumb = cf.thumbnail ?? cf.coverImage ?? cf.image;
		if (typeof cfThumb === "string" && cfThumb.trim().length > 0) {
			return cfThumb;
		}
	}
	if (Array.isArray(content.externalLinks)) {
		const mediaLink = content.externalLinks.find(
			(link) => typeof link?.url === "string",
		);
		if (mediaLink?.url && mediaLink.url.trim().length > 0) {
			return mediaLink.url;
		}
	}
	return undefined;
}

function extractFirstImageFromMarkdown(markdown: string): string | undefined {
	const imageRegex = /!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
	const match = markdown.match(imageRegex);
	if (match?.[1]) {
		return match[1];
	}
	const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
	const htmlMatch = markdown.match(htmlImgRegex);
	if (htmlMatch?.[1]) {
		return htmlMatch[1];
	}
	const customImageRegex = /<Image[^>]+src=["']([^"']+)["'][^>]*>/i;
	const customMatch = markdown.match(customImageRegex);
	return customMatch?.[1];
}

function resolveImageSrc(src: string | undefined | null): string | undefined {
	if (!src) return undefined;
	const trimmed = src.trim();
	if (trimmed.length === 0) return undefined;
	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}
	if (trimmed.startsWith("//")) {
		return `https:${trimmed}`;
	}
	if (trimmed.startsWith("/")) {
		return trimmed;
	}
	const sanitized = trimmed.replace(/^\.\/+/, "");
	return `/${sanitized}`;
}

function formatDate(isoDate: string | undefined) {
	if (!isoDate) return "公開日未設定";
	const date = new Date(isoDate);
	return Number.isNaN(date.getTime())
		? "公開日未設定"
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

function getPageTags(page: MarkdownPage): string[] {
	const tags = page.frontmatter?.tags;
	if (Array.isArray(tags)) {
		return tags.map((tag) => String(tag));
	}
	const fallback = (page.frontmatter as Record<string, unknown> | undefined)
		?.tags;
	if (typeof fallback === "string") {
		return fallback
			.split(",")
			.map((tag) => tag.trim())
			.filter(Boolean);
	}
	return [];
}

function getThumbnail(page: MarkdownPage): string | null {
	const frontmatter = page.frontmatter ?? {};
	const candidates: Array<string | undefined> = [
		typeof frontmatter.coverImage === "string"
			? frontmatter.coverImage
			: undefined,
		typeof frontmatter.cover_image === "string"
			? frontmatter.cover_image
			: undefined,
		typeof frontmatter.image === "string" ? frontmatter.image : undefined,
		typeof frontmatter.thumbnail === "string"
			? frontmatter.thumbnail
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
	return firstImage ?? null;
}

function getPageHref(page: MarkdownPage): string {
	const fm = page.frontmatter ?? {};
	const possible: Array<string | undefined> = [
		fm.permalink as string | undefined,
		fm.url as string | undefined,
		fm.slug as string | undefined,
		page.slug,
		page.contentId,
	];
	const target = possible.find(
		(value): value is string =>
			typeof value === "string" && value.trim().length > 0,
	);
	if (!target) {
		return "#";
	}
	if (/^https?:\/\//.test(target)) {
		return target;
	}
	if (target.startsWith("/")) {
		return target;
	}
	return `/workshop/blog/${target}`;
}

function getContentHref(item: ContentItem) {
	switch (item.type) {
		case "blog":
			return `/workshop/blog/${item.id}`;
		case "plugin":
			return `/workshop/plugins/${item.id}`;
		case "download":
			return `/workshop/downloads/${item.id}`;
		default:
			return "#";
	}
}

export default async function WorkshopPage() {
	const [markdownPages, blogContentItems] = await Promise.all([
		Promise.resolve(listMarkdownPages()),
		loadContentByType("blog"),
	]);

	// デバッグ: データ読み込み結果をログに出力
	console.log("[Workshop] Markdown pages loaded:", markdownPages.length);
	console.log("[Workshop] Blog content items loaded:", blogContentItems.length);

	const contentIndexEntries = getAllFromIndex();
	const contentIndexMap = new Map<string, ContentIndexEntry>(
		contentIndexEntries.map((entry) => [entry.id, entry]),
	);

	const contentMap = new Map(blogContentItems.map((item) => [item.id, item]));

	const publishedMarkdown = markdownPages.filter(
		(page) => (page.status ?? "draft") === "published",
	);
	console.log("[Workshop] Published markdown pages:", publishedMarkdown.length);

	const pagesForDisplay =
		publishedMarkdown.length > 0 ? publishedMarkdown : markdownPages;

	const displayPages = pagesForDisplay.map((page) => {
		const content = page.contentId ? contentMap.get(page.contentId) : undefined;
		const title = content?.title || page.frontmatter?.title || page.slug;
		const indexEntryId = page.contentId ?? content?.id ?? page.slug;
		const indexEntry = indexEntryId
			? contentIndexMap.get(indexEntryId)
			: undefined;
		const sanitizeDescription = (value: string | undefined) =>
			value
				? value
						.replace(/<[^>]*>/g, "")
						.replace(/\s+/g, " ")
						.trim()
				: "";
		const descriptionSource =
			(typeof content?.description === "string" &&
			content.description.length > 0
				? content.description
				: undefined) ??
			(typeof indexEntry?.summary === "string" && indexEntry.summary.length > 0
				? indexEntry.summary
				: undefined) ??
			(typeof page.frontmatter?.description === "string" &&
			page.frontmatter.description.length > 0
				? page.frontmatter.description
				: undefined);
		const description = sanitizeDescription(descriptionSource);
		const tags: string[] =
			content?.tags && content.tags.length > 0
				? content.tags
				: getPageTags(page);
		const indexThumbnail = indexEntry
			? pickIndexThumbnail(indexEntry.thumbnails)
			: undefined;
		const resolvedFromContent = resolveContentThumbnail(content);
		const resolvedFromMarkdown = getThumbnail(page);
		const thumbnail =
			resolveImageSrc(indexThumbnail) ||
			resolveImageSrc(resolvedFromContent) ||
			resolveImageSrc(resolvedFromMarkdown) ||
			null;
		const date =
			indexEntry?.publishedAt ||
			content?.publishedAt ||
			page.publishedAt ||
			content?.updatedAt ||
			getDisplayDate(page);
		const href = content ? getContentHref(content) : getPageHref(page);

		return {
			page,
			title,
			description,
			tags,
			thumbnail,
			date,
			href,
			isExternal: /^https?:\/\//.test(href),
		};
	});

	return (
		<div className="relative min-h-screen bg-base text-main">
			<HomeBackground />
			<main
				id="main-content"
				className="relative z-10 min-h-screen py-10"
				tabIndex={-1}
			>
				<div className="container-system">
					<div className="mx-auto w-full max-w-6xl space-y-16 px-4 sm:px-6 lg:px-8">
						<Breadcrumbs
							items={[
								{ label: "Home", href: "/" },
								{ label: "Workshop", isCurrent: true },
							]}
							className="pt-4"
						/>

						<header className="space-y-6">
							<h1 className="neue-haas-grotesk-display text-4xl text-main sm:text-5xl lg:text-6xl">
								Workshop
							</h1>
						</header>

						<section className="space-y-6">
							{displayPages.length > 0 ? (
								<div className="space-y-6">
									{displayPages.map(
										({
											page,
											title,
											description,
											tags,
											thumbnail,
											date,
											href,
											isExternal,
										}) => {
											const card = (
												<article
													className={`${CARD_SURFACE} focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-2 focus:ring-offset-base`}
												>
													<div className="flex gap-4 p-4 sm:gap-5">
														<div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-main/5 sm:h-28 sm:w-28">
															{thumbnail ? (
																<img
																	src={thumbnail}
																	alt={title}
																	className="h-full w-full object-cover"
																	loading="lazy"
																/>
															) : (
																<span className="flex h-full w-full items-center justify-center text-xs text-main/60">
																	No Thumbnail
																</span>
															)}
														</div>
														<div className="flex flex-1 flex-col gap-3">
															<time className="text-xs text-main/60">
																{formatDate(date)}
															</time>
															<h3 className="neue-haas-grotesk-display text-lg leading-snug text-main sm:text-xl">
																{title}
															</h3>
															{description && (
																<p
																	className="noto-sans-jp-light text-sm leading-relaxed text-main/80"
																	style={{
																		display: "-webkit-box",
																		WebkitLineClamp: 2,
																		WebkitBoxOrient: "vertical",
																		overflow: "hidden",
																	}}
																>
																	{description}
																</p>
															)}
															{tags.length > 0 && (
																<ul className="flex flex-wrap gap-2">
																	{tags.slice(0, 6).map((tag: string) => (
																		<li
																			key={tag}
																			className="noto-sans-jp-light rounded-full bg-main/10 px-3 py-1 text-[0.75rem] text-main"
																		>
																			{tag}
																		</li>
																	))}
																	{tags.length > 6 && (
																		<li className="text-[0.75rem] text-accent">
																			+{tags.length - 6}
																		</li>
																	)}
																</ul>
															)}
														</div>
													</div>
												</article>
											);
											return isExternal ? (
												<a
													key={page.id}
													href={href}
													target="_blank"
													rel="noopener noreferrer"
													className="block focus:outline-none"
												>
													{card}
												</a>
											) : (
												<Link
													key={page.id}
													href={href}
													className="block focus:outline-none"
												>
													{card}
												</Link>
											);
										},
									)}
								</div>
							) : (
								<div className="rounded-2xl bg-base/80 backdrop-blur-md shadow-[0_18px_48px_rgba(0,0,0,0.3)] p-8 text-center">
									<p className="noto-sans-jp-light text-sm text-main/70">
										公開済みのブログ記事はまだ登録されていません.
									</p>
								</div>
							)}
						</section>
					</div>
				</div>
			</main>
			<footer className="border-t border-main/30 bg-base/80 py-6 text-center text-xs text-main/70">
				<div className="container-system flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
					<span>© 2025 361do_sleep</span>
					<Link
						href="/privacy-policy"
						className="underline underline-offset-4 transition hover:text-accent"
					>
						Privacy Policy
					</Link>
				</div>
			</footer>
		</div>
	);
}
