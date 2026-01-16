import Link from "next/link";
import { listMarkdownPages } from "@/cms/server/markdown-service";
import type { MarkdownPage } from "@/cms/types/markdown";
import HomeBackground from "@/components/HomeBackground";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export const revalidate = 300;
export const runtime = "nodejs";

const CARD_SURFACE =
	"group relative flex h-full flex-col overflow-hidden rounded-2xl bg-base/75 backdrop-blur-md shadow-[0_24px_60px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5";

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

	const displayPages = sortedContent.map((page) => {
		const title = page.frontmatter?.title || page.slug;
		const description = page.frontmatter?.description;
		const date = getDisplayDate(page);
		const tags = getPageTags(page);
		const thumbnail = getThumbnail(page);
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
	});

	// コンテンツがない場合のメッセージを決定
	const hasContent = displayPages.length > 0;
	const noContentMessage = !hasContent
		? ""
		: "現在、公開済みまたは下書きのコンテンツが登録されていません。";

	console.log("[Workshop] Has content:", hasContent);
	console.log("[Workshop] Final pages count:", displayPages.length);
	console.log("[Workshop] No content message:", noContentMessage);
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
