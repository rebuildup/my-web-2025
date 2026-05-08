import { promises as fs } from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import {
	checkRateLimit,
	normalizeIp,
	type RateLimitOptions,
} from "@/lib/server/rate-limit";

const SEARCH_STATS_PATH = path.join(
	process.cwd(),
	"public/data/stats/search-stats.json",
);

const RATE_LIMIT_OPTIONS: RateLimitOptions = {
	windowMs: 60 * 1000,
	maxRequests: 30,
	maxKeys: 10000,
};

const MAX_QUERY_LENGTH = 128;
const MAX_UNIQUE_QUERIES = 1000;
const CONTROL_CHAR_REGEX = /[\x00-\x1F\x7F]/;
const WHITESPACE_REGEX = /\s+/g;

function validateQuery(query: string): string | null {
	if (typeof query !== "string") return null;
	if (query.length > MAX_QUERY_LENGTH) return null;
	// Reject control characters
	if (CONTROL_CHAR_REGEX.test(query)) return null;
	// Normalize whitespace
	return query.replace(WHITESPACE_REGEX, " ").trim();
}

interface SearchStats {
	[query: string]: number;
}

/**
 * GET /api/search/analytics - Get search analytics
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "10", 10);

		const data = await fs.readFile(SEARCH_STATS_PATH, "utf-8");
		const stats: SearchStats = JSON.parse(data);

		// Sort by frequency and limit results
		const sortedStats = Object.entries(stats)
			.sort(([, a], [, b]) => b - a)
			.slice(0, limit)
			.map(([query, count]) => ({ query, count }));

		return NextResponse.json({
			popularQueries: sortedStats,
			totalQueries: Object.keys(stats).length,
			totalSearches: Object.values(stats).reduce(
				(sum, count) => sum + count,
				0,
			),
		});
	} catch (error) {
		console.error("Search analytics API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/search/analytics - Track search query
 */
export async function POST(request: NextRequest) {
	try {
		// Get client IP for rate limiting
		const ip =
			request.headers.get("x-forwarded-for") ||
			request.headers.get("x-real-ip") ||
			"unknown";

		// Check rate limit
		if (!checkRateLimit(normalizeIp(ip), RATE_LIMIT_OPTIONS)) {
			return NextResponse.json(
				{ error: "Rate limit exceeded. Try again later." },
				{ status: 429 },
			);
		}

		const body = await request.json();
		const { query } = body;

		if (!query || typeof query !== "string") {
			return NextResponse.json(
				{ error: "Query is required in request body" },
				{ status: 400 },
			);
		}

		const normalizedQuery = validateQuery(query);

		if (normalizedQuery === null) {
			return NextResponse.json(
				{ error: "Invalid query: too long, empty, or contains control characters" },
				{ status: 400 },
			);
		}

		// Load existing stats
		let stats: SearchStats = {};
		try {
			const data = await fs.readFile(SEARCH_STATS_PATH, "utf-8");
			stats = JSON.parse(data);
		} catch {
			// File doesn't exist, start with empty stats
			stats = {};
		}

		// Enforce max unique queries cap
		if (!stats[normalizedQuery] && Object.keys(stats).length >= MAX_UNIQUE_QUERIES) {
			// Aggregate under __other__
			stats["__other__"] = (stats["__other__"] || 0) + 1;
		} else {
			stats[normalizedQuery] = (stats[normalizedQuery] || 0) + 1;
		}

		// Save updated stats
		await fs.writeFile(SEARCH_STATS_PATH, JSON.stringify(stats, null, 2));

		return NextResponse.json({
			success: true,
			query: normalizedQuery,
			count: stats[normalizedQuery] ?? stats["__other__"],
		});
	} catch (error) {
		console.error("Search analytics tracking error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
