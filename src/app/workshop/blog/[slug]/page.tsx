import { notFound } from "next/navigation";
import { getFromIndex } from "@/cms/lib/content-db-manager";
import { convertMarkdownToBlocks } from "@/cms/page-editor/lib/conversion";
import type { MarkdownPage } from "@/cms/types/markdown";
import DarkVeil from "@/components/DarkVeil";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SafeImage } from "@/components/ui/SafeImage";
import { BlogBlockRenderer } from "@/components/workshop/blog/BlogBlockRenderer";
import { getContentById } from "@/lib/data";
import type { ContentItem } from "@/types/content";

export const runtime = "nodejs";
export const revalidate = 300;
export const dynamic = "force-dynamic";

interface BlogPageProps {
	params: Promise<{ slug: string }>;
}

type MarkdownPageRow = {
	id: string;
	content_id?: string | null;
	slug: string;
	frontmatter: string | null;
	body: string;
	html_cache?: string | null;
	path?: string | null;
	lang?: string | null;
	status?: string | null;
	version?: number | null;
	created_at: string;
	updated_at: string;
	published_at?: string | null;
};

async function loadMarkdownPageBySlug(
	slug: string,
): Promise<MarkdownPage | null> {
	const dbModule = await import("@/cms/lib/db");
	const db = dbModule.default as {
		prepare: (sql: string) => {
			get: (...params: unknown[]) => MarkdownPageRow | undefined;
		};
	};
	const row = db
		.prepare(
			"SELECT id, content_id, slug, frontmatter, body, html_cache, path, lang, status, version, created_at, updated_at, published_at FROM markdown_pages WHERE slug = ? LIMIT 1",
		)
		.get(slug);
	if (!row) {
		return null;
	}
	try {
		const frontmatter = row.frontmatter
			? (JSON.parse(row.frontmatter) as MarkdownPage["frontmatter"])
			: {};
		return {
			id: row.id,
			contentId: row.content_id ?? undefined,
			slug: row.slug,
			frontmatter,
			body: row.body,
			htmlCache: row.html_cache ?? undefined,
			path: row.path ?? undefined,
			lang: row.lang ?? undefined,
			status: (row.status as MarkdownPage["status"]) ?? "draft",
			version: row.version ?? undefined,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			publishedAt: row.published_at ?? undefined,
		};
	} catch (error) {
		console.error("Failed to parse markdown frontmatter for", row.slug, error);
		return {
			id: row.id,
			contentId: row.content_id ?? undefined,
			slug: row.slug,
			frontmatter: {},
			body: row.body,
			htmlCache: row.html_cache ?? undefined,
			path: row.path ?? undefined,
			lang: row.lang ?? undefined,
			status: (row.status as MarkdownPage["status"]) ?? "draft",
			version: row.version ?? undefined,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
			publishedAt: row.published_at ?? undefined,
		};
	}
}

function formatDate(isoDate?: string) {
	if (!isoDate) return "公開日未設定";
	const date = new Date(isoDate);
	if (Number.isNaN(date.getTime())) return "公開日未設定";
	return new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(date);
}

function getDisplayDate(page: MarkdownPage, content?: ContentItem | null) {
	return (
		page.frontmatter?.updated ||
		page.frontmatter?.date ||
		content?.publishedAt ||
		content?.updatedAt ||
		page.publishedAt ||
		page.updatedAt ||
		page.createdAt
	);
}

function resolveTags(page: MarkdownPage, content?: ContentItem | null) {
	if (content?.tags && content.tags.length > 0) {
		return content.tags;
	}
	const fmTags = page.frontmatter?.tags;
	if (Array.isArray(fmTags)) {
		return fmTags.map((tag) => String(tag));
	}
	const fmTagsValue = page.frontmatter?.tags as string | string[] | undefined;
	if (typeof fmTagsValue === "string") {
		return fmTagsValue
			.split(",")
			.map((tag: string) => tag.trim())
			.filter(Boolean);
	}
	return [];
}

function pickIndexThumbnail(entry: ReturnType<typeof getFromIndex> | null) {
	const thumbnails = entry?.thumbnails as Record<string, unknown> | undefined;
	if (!thumbnails || typeof thumbnails !== "object") return undefined;
	const prefer = Array.isArray((thumbnails as { prefer?: string[] }).prefer)
		? (thumbnails as { prefer: string[] }).prefer
		: ["image", "gif", "webm"];
	for (const key of prefer) {
		const variant = thumbnails[key];
		if (!variant) continue;
		if (typeof variant === "string" && variant.trim().length > 0) {
			return variant;
		}
		if (
			variant &&
			typeof variant === "object" &&
			typeof (variant as { src?: unknown }).src === "string"
		) {
			const src = ((variant as { src: string }).src || "").trim();
			if (src.length > 0) {
				return src;
			}
		}
		if (
			variant &&
			typeof variant === "object" &&
			typeof (variant as { poster?: unknown }).poster === "string"
		) {
			const poster = ((variant as { poster: string }).poster || "").trim();
			if (poster.length > 0) {
				return poster;
			}
		}
	}
	for (const value of Object.values(thumbnails)) {
		if (typeof value === "string" && value.trim().length > 0) {
			return value;
		}
		if (
			value &&
			typeof value === "object" &&
			typeof (value as { src?: unknown }).src === "string"
		) {
			const src = ((value as { src: string }).src || "").trim();
			if (src.length > 0) {
				return src;
			}
		}
	}
	return undefined;
}

function resolveHeroImage(page: MarkdownPage, content?: ContentItem | null) {
	const indexEntry = content?.id ? getFromIndex(content.id) : null;
	return (
		(indexEntry ? pickIndexThumbnail(indexEntry) : undefined) ||
		(typeof content?.thumbnail === "string" &&
		content.thumbnail.trim().length > 0
			? content.thumbnail
			: undefined) ||
		(typeof page.frontmatter?.coverImage === "string"
			? page.frontmatter.coverImage
			: undefined)
	);
}

function resolveDescription(page: MarkdownPage, content?: ContentItem | null) {
	if (
		typeof content?.description === "string" &&
		content.description.trim().length > 0
	) {
		return content.description.trim();
	}
	if (
		typeof page.frontmatter?.description === "string" &&
		page.frontmatter.description.trim().length > 0
	) {
		return page.frontmatter.description.trim();
	}
	return "";
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
	const { slug } = await params;
	const page = await loadMarkdownPageBySlug(slug);
	if (!page) {
		notFound();
	}

	const content = page.contentId
		? await getContentById("blog", page.contentId)
		: null;
	const title = content?.title || page.frontmatter?.title || page.slug;
	const displayDate = formatDate(getDisplayDate(page, content ?? undefined));
	const description = resolveDescription(page, content ?? undefined);
	const tags = resolveTags(page, content ?? undefined);
	const heroImage = resolveHeroImage(page, content ?? undefined);
	const blocks = convertMarkdownToBlocks(page.body ?? "");

	return (
		<div className="relative min-h-screen bg-base text-main">
			<div className="pointer-events-none absolute inset-0">
				<DarkVeil />
			</div>
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
								{ label: "Workshop", href: "/workshop" },
								{ label: title, isCurrent: true },
							]}
							className="pt-4"
						/>

						<header className="space-y-8">
							<div className="space-y-4">
								<span className="text-xs uppercase tracking-[0.4em] text-accent">
									Blog Article
								</span>
								<h1 className="neue-haas-grotesk-display text-4xl text-main sm:text-5xl lg:text-6xl">
									{title}
								</h1>
							</div>
							<div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em] text-main/60">
								<time>{displayDate}</time>
								{tags.length > 0 && (
									<ul className="flex flex-wrap gap-2 text-[0.7rem]">
										{tags.slice(0, 8).map((tag: string) => (
											<li
												key={tag}
												className="rounded-full bg-main/10 px-3 py-1 text-main/80"
											>
												#{tag}
											</li>
										))}
									</ul>
								)}
							</div>
							{description && (
								<p className="noto-sans-jp-light max-w-3xl text-base leading-relaxed text-main/80">
									{description}
								</p>
							)}
							{heroImage && (
								<div className="overflow-hidden rounded-3xl border border-main/20 bg-main/5 shadow-[0_18px_48px_rgba(0,0,0,0.3)]">
									<SafeImage
										src={heroImage}
										alt={title}
										className="h-auto w-full object-cover"
									/>
								</div>
							)}
						</header>

						<section className="space-y-16">
							<BlogBlockRenderer blocks={blocks} />
						</section>
					</div>
				</div>
			</main>
		</div>
	);
}
