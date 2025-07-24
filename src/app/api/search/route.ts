import { NextRequest, NextResponse } from "next/server";
import { simpleSearch, detailedSearch } from "@/lib/search";
import type { ContentType } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const mode = searchParams.get("mode") || "simple";
    const type = searchParams.get("type") as ContentType | null;
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const searchOptions = {
      type: type || undefined,
      category: category || undefined,
      limit,
    };

    let results;
    if (mode === "detailed") {
      results = await detailedSearch(query, searchOptions);
    } else {
      results = await simpleSearch(query, searchOptions);
    }

    return NextResponse.json({
      query,
      mode,
      results,
      total: results.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
