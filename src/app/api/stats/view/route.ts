import { type NextRequest, NextResponse } from "next/server";
import {
	getMostViewedContent,
	getViewStats,
	updateViewStats,
} from "@/lib/stats";
import {
	checkRateLimit,
	normalizeIp,
	type RateLimitOptions,
} from "@/lib/server/rate-limit";

const RATE_LIMIT_OPTIONS: RateLimitOptions = {
	windowMs: 60 * 1000,
	maxRequests: 30,
	maxKeys: 10000,
};

const MAX_CONTENT_ID_LENGTH = 128;
const CONTENT_ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function validateContentId(id: string): boolean {
	return (
		typeof id === "string" &&
		id.length <= MAX_CONTENT_ID_LENGTH &&
		CONTENT_ID_REGEX.test(id)
	);
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { id } = body;

		if (!id || typeof id !== "string") {
			return NextResponse.json(
				{ error: "Content ID is required" },
				{ status: 400 },
			);
		}

		// Validate content ID format
		if (!validateContentId(id)) {
			return NextResponse.json(
				{ error: "Invalid content ID format" },
				{ status: 400 },
			);
		}

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

		// Update view statistics
		const success = await updateViewStats(id);

		if (!success) {
			return NextResponse.json(
				{ error: "Failed to update view statistics" },
				{ status: 500 },
			);
		}

		// Get updated count
		const viewCount = (await getViewStats(id)) as number;

		return NextResponse.json({
			success: true,
			id,
			viewCount,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("View tracking API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");
		const limit = parseInt(searchParams.get("limit") || "10", 10);

		if (id) {
			// Get view count for specific content
			const viewCount = (await getViewStats(id)) as number;
			return NextResponse.json({
				id,
				viewCount,
			});
		} else {
			// Get most viewed content
			const mostViewed = await getMostViewedContent(limit);
			const allStats = (await getViewStats()) as Record<string, number>;
			const totalViews = Object.values(allStats).reduce(
				(sum, count) => sum + count,
				0,
			);

			return NextResponse.json({
				mostViewed,
				totalViews,
				totalItems: Object.keys(allStats).length,
			});
		}
	} catch (error) {
		console.error("View stats API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
