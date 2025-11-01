import { type NextRequest, NextResponse } from "next/server";
import {
	getPopularSearchQueries,
	getSearchStats,
	getStatsSummary,
	updateSearchStats,
} from "@/lib/stats";

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // 30 search queries per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const userLimit = rateLimitMap.get(ip);

	if (!userLimit || now > userLimit.resetTime) {
		rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return true;
	}

	if (userLimit.count >= RATE_LIMIT) {
		return false;
	}

	userLimit.count++;
	return true;
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { query, resultCount, searchTime } = body;

		if (!query || typeof query !== "string") {
			return NextResponse.json(
				{ error: "Search query is required" },
				{ status: 400 },
			);
		}

		// Get client IP for rate limiting
		const ip =
			request.headers.get("x-forwarded-for")?.split(",")[0] ||
			request.headers.get("x-real-ip") ||
			"unknown";

		// Check rate limit
		if (!checkRateLimit(ip)) {
			return NextResponse.json(
				{ error: "Search rate limit exceeded. Please slow down." },
				{ status: 429 },
			);
		}

		// Update search statistics
		const success = await updateSearchStats(query);

		if (!success) {
			return NextResponse.json(
				{ error: "Failed to update search statistics" },
				{ status: 500 },
			);
		}

		// Log search analytics (optional)
		console.log(
			`Search tracked: "${query}" - Results: ${resultCount || "unknown"} - Time: ${searchTime || "unknown"}ms`,
		);

		return NextResponse.json({
			success: true,
			query,
			resultCount,
			searchTime,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Search analytics API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "10", 10);
		const summary = searchParams.get("summary") === "true";

		if (summary) {
			// Get comprehensive statistics summary
			const statsSummary = await getStatsSummary();
			return NextResponse.json(statsSummary);
		} else {
			// Get popular search queries
			const popularQueries = await getPopularSearchQueries(limit);
			const allStats = await getSearchStats();
			const totalSearches = Object.values(allStats).reduce(
				(sum, count) => sum + count,
				0,
			);

			return NextResponse.json({
				popularQueries,
				totalSearches,
				uniqueQueries: Object.keys(allStats).length,
			});
		}
	} catch (error) {
		console.error("Search stats API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
