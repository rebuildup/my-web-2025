import { NextRequest, NextResponse } from "next/server";
import {
  updateDownloadStats,
  getDownloadStats,
  getMostDownloadedContent,
} from "@/lib/stats";

// Rate limiting storage (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 downloads per hour per IP
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
    const { id, fileName, fileType } = body;

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
        {
          error:
            "Download rate limit exceeded. Please wait before downloading again.",
          retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000 / 60), // minutes
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
    const limit = parseInt(searchParams.get("limit") || "10");

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
