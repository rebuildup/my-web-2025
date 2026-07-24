import { NextRequest, NextResponse } from "next/server";
import type { MarkdownPage } from "@/cms/types/markdown";
import {
	fetchCmsContentById,
	fetchCmsContentTags,
	fetchMarkdownPages,
} from "@/lib/cms-api/server-data";
import Fuse from "fuse.js";

export const dynamic = "force-static";

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

			const [tags, cmsContent] = await Promise.all([
				fetchCmsContentTags(contentId),
				fetchCmsContentById(contentId),
			]);
			const description =
				cmsContent?.summary ||
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
	let keyword = "";
	let tag: string | undefined;
	let sort = "newest";
	let mode = "normal";
	try {
		const url = new URL(request?.url || "http://localhost");
		keyword = url.searchParams.get("q")?.trim() ?? "";
		tag = url.searchParams.get("tag")?.trim() ?? undefined;
		sort = url.searchParams.get("sort") ?? "newest";
		mode = url.searchParams.get("mode") ?? "normal";
	} catch {
		// Fallback for static prerendering
	}

	try {
		// Get all markdown pages
		const markdownPages = await fetchMarkdownPages();
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
