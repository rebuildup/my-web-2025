import { type NextRequest, NextResponse } from "next/server";
import { getRelatedContent } from "@/lib/search";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const contentId = searchParams.get("id");
		const limit = parseInt(searchParams.get("limit") || "5", 10);

		if (!contentId) {
			return NextResponse.json(
				{ error: "Content ID parameter 'id' is required" },
				{ status: 400 },
			);
		}

		const relatedContent = await getRelatedContent(contentId, limit);

		// Set cache headers for performance
		const headers = new Headers();
		headers.set(
			"Cache-Control",
			"public, max-age=600, stale-while-revalidate=1200",
		);

		return NextResponse.json(
			{
				contentId,
				related: relatedContent,
				total: relatedContent.length,
			},
			{ headers },
		);
	} catch (error) {
		console.error("Related content API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
