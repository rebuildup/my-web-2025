export const dynamic = "force-static";
import { type NextRequest, NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cms-api/server-client";
import { detailedSearch, searchContent, simpleSearch } from "@/lib/search";
import type { ContentType } from "@/types";

type RustSearchResult = {
	id: string;
	title: string;
	summary?: string | null;
	entry_type: ContentType;
	status: string;
	thumbnail?: string | null;
	tags?: string | null;
};

function contentUrl(type: ContentType, id: string): string {
	const baseUrls: Record<ContentType, string> = {
		portfolio: "/portfolio",
		blog: "/workshop/blog",
		plugin: "/workshop/plugins",
		download: "/workshop/downloads",
		tool: "/tools",
		profile: "/about/profile",
		page: "",
		asset: "",
		other: "",
	};

	const baseUrl = baseUrls[type] || "";
	return `${baseUrl}/${id}`;
}

async function searchWithRustApi(
	query: string,
	options: {
		type?: ContentType;
		limit: number;
	},
) {
	const params = new URLSearchParams({
		q: query,
		status: "published",
		limit: String(options.limit),
	});
	if (options.type) {
		params.set("entry_type", options.type);
	}

	const rows = await cmsApiFetch<RustSearchResult[]>(
		`/search?${params.toString()}`,
	);

	return rows.map((row, index) => ({
		id: row.id,
		type: row.entry_type,
		title: row.title,
		description: row.summary ?? "",
		url: contentUrl(row.entry_type, row.id),
		score: 1 - index / Math.max(rows.length, 1),
		highlights: [row.title, row.summary ?? ""].filter(Boolean),
	}));
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");
		const mode = searchParams.get("mode") || "simple";
		const type = searchParams.get("type") as ContentType | null;
		const category = searchParams.get("category");
		const limit = parseInt(searchParams.get("limit") || "10", 10);
		const includeContent = searchParams.get("includeContent") === "true";

		if (!query) {
			return NextResponse.json(
				{ error: "Query parameter 'q' is required" },
				{ status: 400 },
			);
		}

		const searchOptions = {
			type: type || undefined,
			category: category || undefined,
			limit,
			includeContent,
		};

		let results;
		try {
			results = await searchWithRustApi(query, {
				type: type || undefined,
				limit,
			});
		} catch (error) {
			console.warn("Rust content search failed; falling back to Next search:", error);
			if (mode === "detailed") {
				results = await detailedSearch(query, searchOptions);
			} else if (mode === "simple") {
				results = await simpleSearch(query, searchOptions);
			} else {
				results = await searchContent(query, searchOptions);
			}
		}

		// Set cache headers for performance
		const headers = new Headers();
		headers.set(
			"Cache-Control",
			"public, max-age=300, stale-while-revalidate=600",
		);

		return NextResponse.json(
			{
				query,
				mode,
				results,
				total: results.length,
				filters: {
					type,
					category,
					includeContent,
				},
				performance: {
					searchTime: Date.now(), // This would be calculated properly in production
				},
			},
			{ headers },
		);
	} catch (error) {
		console.error("Content search API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { query, options = {} } = body;

		if (!query) {
			return NextResponse.json(
				{ error: "Query is required in request body" },
				{ status: 400 },
			);
		}

		// Support for batch search or advanced search options
		let results;
		try {
			results = await searchWithRustApi(query, {
				type: options.type,
				limit: options.limit || 10,
			});
		} catch (error) {
			console.warn("Rust content search failed; falling back to Next search:", error);
			results = await searchContent(query, {
				type: options.type,
				category: options.category,
				limit: options.limit || 10,
				includeContent: options.includeContent || false,
				threshold: options.threshold || 0.3,
			});
		}

		return NextResponse.json({
			query,
			results,
			total: results.length,
			options,
		});
	} catch (error) {
		console.error("Content search POST API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
