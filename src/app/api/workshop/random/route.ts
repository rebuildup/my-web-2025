import { NextRequest, NextResponse } from "next/server";
import { listMarkdownPages } from "@/cms/server/markdown-service";
import { getContentDb } from "@/cms/lib/content-db-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ArticleData {
	slug: string;
	title: string;
	href: string;
	thumbnail: string | null;
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
		console.error(`[Random API] Error fetching content ${contentId}:`, error);
	}

	// Check frontmatter
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

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const excludeSlug = searchParams.get("exclude") || "";
	const limit = parseInt(searchParams.get("limit") || "3", 10);

	try {
		// Get all published markdown pages
		const markdownPages = await Promise.resolve(listMarkdownPages());
		const publishedContent = markdownPages.filter(
			(page) => (page.status ?? "draft") === "published" && page.slug !== excludeSlug,
		);

		if (publishedContent.length === 0) {
			return NextResponse.json({ articles: [] });
		}

		// Shuffle and pick random articles
		const shuffled = [...publishedContent].sort(() => Math.random() - 0.5);
		const selectedPages = shuffled.slice(0, Math.min(limit, shuffled.length));

		// Build article data
		const articles: ArticleData[] = await Promise.all(
			selectedPages.map(async (page) => {
				const thumbnail = await getThumbnail(page);
				const title = page.frontmatter?.title || page.slug;
				const href = getPageHref(page);

				return {
					slug: page.slug,
					title,
					href,
					thumbnail,
				};
			}),
		);

		return NextResponse.json({ articles });
	} catch (error) {
		console.error("[Random API] Error:", error);
		return NextResponse.json({ articles: [] }, { status: 500 });
	}
}
