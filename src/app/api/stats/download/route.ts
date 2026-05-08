import { type NextRequest, NextResponse } from "next/server";
import {
	getDownloadStats,
	getMostDownloadedContent,
	updateDownloadStats,
} from "@/lib/stats";
import {
	checkRateLimit,
	normalizeIp,
	type RateLimitOptions,
} from "@/lib/server/rate-limit";

const RATE_LIMIT_OPTIONS: RateLimitOptions = {
	windowMs: 60 * 1000,
	maxRequests: 10,
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
		const { id, fileName, fileType } = body;

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
				{
					error:
						"Download rate limit exceeded. Please wait before downloading again.",
					retryAfter: Math.ceil(RATE_LIMIT_OPTIONS.windowMs / 1000 / 60), // minutes
				},
				{ status: 429 },
			);
		}

		// Update download statistics
		const success = await updateDownloadStats(id);

		if (!success) {
			return NextResponse.json(
				{ error: "Failed to update download statistics" },
				{ status: 500 },
			);
		}

		// Get updated count
		const downloadCount = (await getDownloadStats(id)) as number;

		// Log download for analytics (optional)
		console.log(
			`Download tracked: ${id} (${fileName || "unknown"}) - Total: ${downloadCount}`,
		);

		return NextResponse.json({
			success: true,
			id,
			downloadCount,
			fileName,
			fileType,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Download tracking API error:", error);
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
			// Get download count for specific content
			const downloadCount = (await getDownloadStats(id)) as number;
			return NextResponse.json({
				id,
				downloadCount,
			});
		} else {
			// Get most downloaded content
			const mostDownloaded = await getMostDownloadedContent(limit);
			const allStats = (await getDownloadStats()) as Record<string, number>;
			const totalDownloads = Object.values(allStats).reduce(
				(sum, count) => sum + count,
				0,
			);

			return NextResponse.json({
				mostDownloaded,
				totalDownloads,
				totalItems: Object.keys(allStats).length,
			});
		}
	} catch (error) {
		console.error("Download stats API error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
