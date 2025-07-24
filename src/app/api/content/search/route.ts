import { NextRequest, NextResponse } from "next/server";
import { searchContent, simpleSearch, detailedSearch } from "@/lib/search";
import type { ContentType } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const mode = searchParams.get("mode") || "simple";
    const type = searchParams.get("type") as ContentType | null;
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
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

    if (mode === "detailed") {
      results = await detailedSearch(query, searchOptions);
    } else if (mode === "simple") {
      results = await simpleSearch(query, searchOptions);
    } else {
      // Custom search with specific options
      results = await searchContent(query, searchOptions);
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
    const results = await searchContent(query, {
      type: options.type,
      category: options.category,
      limit: options.limit || 10,
      includeContent: options.includeContent || false,
      threshold: options.threshold || 0.3,
    });

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
