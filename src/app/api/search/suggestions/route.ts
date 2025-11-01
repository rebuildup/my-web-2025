import { type NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/search";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");
		const limit = parseInt(searchParams.get("limit") || "5", 10);

		if (!query) {
			return NextResponse.json(
				{ error: "Query parameter 'q' is required" },
				{ status: 400 },
			);
		}

		const suggestions = await getSearchSuggestions(query, limit);

		// Set cache headers for performance
		const headers = new Headers();
		headers.set(
			"Cache-Control",
			"public, max-age=300, stale-while-revalidate=600",
		);

		return NextResponse.json(
			{
				query,
				suggestions,
				total: suggestions.length,
			},
			{ headers },
		);
	} catch (error) {
		console.error("Search suggestions API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
