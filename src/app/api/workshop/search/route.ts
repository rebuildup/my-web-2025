import { NextRequest, NextResponse } from "next/server";
import { listMarkdownPages } from "@/cms/server/markdown-service";
import { getContentTags } from "@/cms/lib/content-db-manager";
import type { MarkdownPage } from "@/cms/types/markdown";
import Fuse from "fuse.js";

// Fetch description from CMS
async function fetchDescriptionFromCMS(id: string): Promise<string | undefined> {
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

		if (res.ok) {
			const cmsContent = await res.json();
			return cmsContent?.summary || cmsContent?.description;
		}
	} catch (error) {
		console.error(`[Search API] Error fetching content ${id}:`, error);
	}

	return undefined;
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ArticleSearchData {
	page: MarkdownPage;
	title: string;
	tags: string[];
	category: string | undefined;
	slug: string;
	body: string;
	description?: string;
}

// Prepare article data for search
async function prepareArticleData(pages: MarkdownPage[]): Promise<ArticleSearchData[]> {
	const articles = await Promise.all(
		pages.map(async (page) => {
			const frontmatter = page.frontmatter ?? ({} as Record<string, unknown>);
			const contentId = page.contentId || page.slug;

			// Get tags from database
			const tags = getContentTags(contentId);

			// Get description from CMS
			const cmsDescription = await fetchDescriptionFromCMS(contentId);
			const description =
				cmsDescription ||
				(frontmatter.description as string | undefined) ||
				(frontmatter.summary as string | undefined);

			return {
				page,
				title: (frontmatter.title as string | undefined) || page.slug,
				tags,
				category: typeof frontmatter.category === "string" ? frontmatter.category : undefined,
				slug: page.slug,
				body: page.body || "",
				description,
			};
		}),
	);

	return articles;
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const keyword = searchParams.get("q")?.trim() ?? "";
	const tag = searchParams.get("tag")?.trim();
	const sort = searchParams.get("sort") ?? "newest";
	const mode = searchParams.get("mode") ?? "normal"; // "normal" or "detailed"

	try {
		// Get all markdown pages
		const markdownPages = await Promise.resolve(listMarkdownPages());
		const publishedPages = markdownPages.filter(
			(page) => (page.status ?? "draft") === "published",
		);

		// Prepare data for search
		const articles = await prepareArticleData(publishedPages);

		let results = articles;

		// Filter by tag if specified
		if (tag) {
			results = results.filter((article) =>
				article.tags.some((t) => t.toLowerCase() === tag.toLowerCase()),
			);
		}

		// Search by keyword if specified
		if (keyword) {
			// Define search keys based on mode
			const searchKeys = mode === "detailed"
				? [
						{ name: "title", weight: 2 },
						{ name: "tags", weight: 1.5 },
						{ name: "category", weight: 1 },
						{ name: "body", weight: 0.8 },
						{ name: "description", weight: 1 },
					]
				: [
						{ name: "title", weight: 2 },
						{ name: "tags", weight: 1.5 },
						{ name: "category", weight: 1 },
						{ name: "description", weight: 1 },
					];

			const fuse = new Fuse(results, {
				keys: searchKeys,
				threshold: 0.3,
				includeScore: true,
			});

			const searchResults = fuse.search(keyword);
			results = searchResults.map((result) => result.item);
		}

		// Sort results
		results = sortArticles(results, sort);

		// Return slugs for client-side processing
		const slugs = results.map((r) => r.slug);

		return NextResponse.json({
			slugs,
			total: slugs.length,
		});
	} catch (error) {
		console.error("[Workshop Search API] Error:", error);
		return NextResponse.json(
			{ error: "Search failed", slugs: [], total: 0 },
			{ status: 500 },
		);
	}
}

function sortArticles(articles: ArticleSearchData[], sort: string): ArticleSearchData[] {
	switch (sort) {
		case "popular":
			// For now, sort by reverse of slug as a proxy for popularity
			// In production, this would use actual LGTM counts
			return [...articles].sort((a, b) => b.slug.localeCompare(a.slug));

		case "alphabetical":
			return [...articles].sort((a, b) => a.title.localeCompare(b.title, "ja"));

		case "newest":
		default:
			return [...articles].sort((a, b) => {
				const aTime = a.page.updatedAt || a.page.createdAt || "";
				const bTime = b.page.updatedAt || b.page.createdAt || "";
				return bTime.localeCompare(aTime);
			});
	}
}
