import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/lib/search";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const suggestions = await getSearchSuggestions(query, limit);

    return NextResponse.json({
      query,
      suggestions,
    });
  } catch (error) {
    console.error("Search suggestions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
