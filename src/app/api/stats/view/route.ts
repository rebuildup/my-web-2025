import { type NextRequest, NextResponse } from "next/server";
import {
	getMostViewedContent,
	getViewStats,
	updateViewStats,
} from "@/lib/stats";

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

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
		const { id } = body;

		if (!id || typeof id !== "string") {
			return NextResponse.json(
				{ error: "Content ID is required" },
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
