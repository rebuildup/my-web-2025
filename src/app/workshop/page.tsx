import Link from "next/link";
import { listMarkdownPages } from "@/cms/server/markdown-service";
import type { MarkdownPage } from "@/cms/types/markdown";
import HomeBackground from "@/components/HomeBackground";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const revalidate = 300;
export const runtime = "nodejs";

const CARD_SURFACE =
	"group relative flex h-full flex-col overflow-hidden rounded-2xl bg-base/75 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5";

async function fetchContentFromCMS(id: string) {
	// ローカル開発環境ではローカルURLを使用
	const baseUrl =
		process.env.NODE_ENV === "development"
			? "http://localhost:3010"
			: process.env.NEXT_PUBLIC_SITE_URL ||
				process.env.NEXT_PUBLIC_BASE_URL ||
				"https://yusuke-kim.com";

	try {
		console.log(
			`[Workshop] Fetching content from CMS API: ${baseUrl}/api/cms/contents?id=${id}`,
		);
		const res = await fetch(
			`${baseUrl}/api/cms/contents?id=${encodeURIComponent(id)}`,
			{
				cache: "no-store",
			},
		);

		if (!res.ok) {
			console.log(
				`[Workshop] CMS API response not OK: ${res.status} ${res.statusText}`,
			);
			return null;
		}

		const full = await res.json();
		console.log(`[Workshop] CMS API response for ${id}:`, {
			id: full.id,
			title: full.title,
			thumbnails: full.thumbnails,
			frontmatter: full.frontmatter,
		});

		return full;
	} catch (error) {
		console.error(`[Workshop] Error fetching content ${id}:`, error);
		return null;
	}
}

function extractFirstImageFromMarkdown(markdown: string): string | undefined {
	// 1. 標準的なMarkdown画像シンタックス: ![alt](url)
	const markdownImgRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
	const markdownMatch = markdown.match(markdownImgRegex);
	if (markdownMatch?.[2]) {
		return markdownMatch[2];
	}

	// 2. HTMLのimgタグ: <img src="url" />
	const htmlImgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/i;
	const htmlMatch = markdown.match(htmlImgRegex);
	if (htmlMatch?.[1]) {
		return htmlMatch[1];
	}

	// 3. Next.js/Imageコンポーネント: <Image src="url" /> (大文字小文字の両方に対応)
	const nextImageRegex = /<(?:image|Image)[^>]+src=["']([^"']+)["'][^>]*>/i;
	const nextImageMatch = markdown.match(nextImageRegex);
	if (nextImageMatch?.[1]) {
		return nextImageMatch[1];
	}

	return undefined;
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

async function getThumbnail(
	page: MarkdownPage,
	cmsContent: any,
): Promise<string | null> {
	const frontmatter = page.frontmatter ?? {};

	console.log(`[Workshop] Getting thumbnail for page: ${page.slug}`);
	console.log(`[Workshop] CMS Content:`, cmsContent);

	// 1. CMS APIのサムネイルを使用
	if (cmsContent?.thumbnails) {
		const thumbs = cmsContent.thumbnails;
		console.log(`[Workshop] Thumbnails from CMS:`, thumbs);

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

	// 2. Frontmatterのサムネイルを使用
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

	console.log(`[Workshop] Frontmatter candidates:`, candidates);

	for (const candidate of candidates) {
		if (typeof candidate === "string" && candidate.trim().length > 0) {
			return candidate;
		}
	}

	// 3. 本文から画像を抽出
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

export default async function WorkshopPage() {
	console.log("[Workshop] =========================================");
	console.log("[Workshop] WorkshopPage initialization started");
	console.log("[Workshop] Current working directory:", process.cwd());
	console.log("[Workshop] NODE_ENV:", process.env.NODE_ENV);
	console.log("[Workshop] =========================================");

	console.log("[Workshop] Loading content from multiple sources...");

	const markdownPages = await Promise.resolve(listMarkdownPages());

	console.log("[Workshop] Data loading completed");
	console.log("[Workshop]  - Markdown pages:", markdownPages.length);
	console.log("[Workshop] -----------------------------------------");

	// 公開済みのコンテンツのみをフィルタリング
	const publishedContent = markdownPages.filter(
		(page) => (page.status ?? "draft") === "published",
	);

	console.log("[Workshop] Published content count:", publishedContent.length);

	// 公開済みのコンテンツを日付順で並び替え（新しい順）
	const sortedContent = publishedContent.sort((a, b) => {
		const dateA = getDisplayDate(a)
			? new Date(getDisplayDate(a)!).getTime()
			: 0;
		const dateB = getDisplayDate(b)
			? new Date(getDisplayDate(b)!).getTime()
			: 0;
		return dateB - dateA;
	});

	const displayPagesWithCMS = await Promise.all(
		sortedContent.map(async (page) => {
			const cmsContent = await fetchContentFromCMS(page.contentId || page.slug);
			const thumbnail = await getThumbnail(page, cmsContent);
			const title = page.frontmatter?.title || page.slug;
			// CMS APIから取得したdescription/summaryを優先し、なければfrontmatter.descriptionを使用
			const description =
				cmsContent?.summary ||
				cmsContent?.description ||
				page.frontmatter?.description;
			const date = getDisplayDate(page);
			const tags = getPageTags(page);
			const href = getPageHref(page);
			const isExternal = /^https?:\/\//i.test(href);

			return {
				page,
				title,
				description,
				tags,
				thumbnail,
				date,
				href,
				isExternal,
			};
		}),
	);

	// コンテンツがない場合のメッセージを決定
	const hasContent = displayPagesWithCMS.length > 0;

	console.log("[Workshop] Has content:", hasContent);
	console.log("[Workshop] Final pages count:", displayPagesWithCMS.length);
	console.log("[Workshop] =========================================");

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
							{hasContent ? (
								<div className="space-y-6">
									{displayPagesWithCMS.map(
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
													key={page.slug}
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
													href={href}
													target="_blank"
													rel="noopener noreferrer"
													className="block focus:outline-none"
												>
													{card}
												</a>
											) : (
												<Link href={href} className="block focus:outline-none">
													{card}
												</Link>
											);
										},
									)}
								</div>
							) : (
								<div className="rounded-2xl bg-base/80 backdrop-blur-md shadow-[0_18px_48px_rgba(0,0,0,0.3)] p-8 text-center">
									<p className="noto-sans-jp-light text-sm text-main/70">
										現在、公開済みまたは下書きのコンテンツが登録されていません。
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
