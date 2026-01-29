import { NextRequest, NextResponse } from "next/server";
import { getContentTags } from "@/cms/lib/content-db-manager";
import { listMarkdownPages } from "@/cms/server/markdown-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RelatedArticle {
	slug: string;
	title: string;
	href: string;
	thumbnail: string | null;
	tags: string[];
}

// Get thumbnail from CMS content
async function getThumbnail(page: any): Promise<string | null> {
	const contentId = page.contentId || page.slug;
	try {
		const baseUrl =
			process.env.NODE_ENV === "development"
				? "http://localhost:3010"
				: process.env.NEXT_PUBLIC_SITE_URL ||
					process.env.NEXT_PUBLIC_BASE_URL ||
					"https://yusuke-kim.com";

		const res = await fetch(
			`${baseUrl}/api/cms/contents?id=${encodeURIComponent(contentId)}`,
			{ cache: "no-store" },
		);

		if (res.ok) {
			const cmsContent = await res.json();
			if (cmsContent?.thumbnails) {
				const thumbs = cmsContent.thumbnails;
				if (thumbs?.image?.src) return thumbs.image.src;
				if (thumbs?.gif?.src) return thumbs.gif.src;
				if (thumbs?.webm?.poster) return thumbs.webm.poster;
			}
		}
	} catch (error) {
		console.error(`[Related API] Error fetching content ${contentId}:`, error);
	}

	const frontmatter = page.frontmatter ?? {};
	const candidates = [
		typeof frontmatter.thumbnail === "string" ? frontmatter.thumbnail : undefined,
		typeof frontmatter.image === "string" ? frontmatter.image : undefined,
		typeof frontmatter.coverImage === "string" ? frontmatter.coverImage : undefined,
		typeof frontmatter.heroImage === "string" ? frontmatter.heroImage : undefined,
	];

	for (const candidate of candidates) {
		if (typeof candidate === "string" && candidate.trim().length > 0) {
			return candidate;
		}
	}

	return null;
}

function getPageHref(page: any): string {
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

/**
 * GET /api/workshop/related?slug=xxx&tags=tag1,tag2&limit=6
 * Returns articles related to the specified tags
 */
export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const slug = searchParams.get("slug") || "";
	const tagsParam = searchParams.get("tags") || "";
	const limit = parseInt(searchParams.get("limit") || "6", 10);

	if (!tagsParam) {
		return NextResponse.json({ articles: [] });
	}

	const targetTags = tagsParam.split(",").map((t) => t.trim()).filter(Boolean);

	try {
		// Get all published markdown pages
		const markdownPages = await Promise.resolve(listMarkdownPages());
		const publishedContent = markdownPages.filter(
			(page) =>
				(page.status ?? "draft") === "published" && page.slug !== slug,
		);

		if (publishedContent.length === 0) {
			return NextResponse.json({ articles: [] });
		}

		// Build tags map for all pages
		const articlesWithTags: Array<{
			page: any;
			tags: string[];
		}> = [];

		for (const page of publishedContent) {
			const contentId = page.contentId || page.slug;
			const tags = getContentTags(contentId);
			articlesWithTags.push({ page, tags });
		}

		// Find articles that match at least one target tag
		const related = articlesWithTags
			.filter(({ tags }) =>
				targetTags.some((targetTag) => tags.includes(targetTag)),
			)
			.map(({ page, tags }) => ({ page, tags }));

		// Shuffle and limit
		const shuffled = related.sort(() => Math.random() - 0.5);
		const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

		// Build article data
		const articles: RelatedArticle[] = await Promise.all(
			selected.map(async ({ page, tags }) => {
				const thumbnail = await getThumbnail(page);
				const title = page.frontmatter?.title || page.slug;
				const href = getPageHref(page);

				return {
					slug: page.slug,
					title,
					href,
					thumbnail,
					tags,
				};
			}),
		);

		return NextResponse.json({ articles });
	} catch (error) {
		console.error("[Related API] Error:", error);
		return NextResponse.json({ articles: [] }, { status: 500 });
	}
}
