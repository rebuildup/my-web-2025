import { NextRequest, NextResponse } from "next/server";

// 検索候補データ
const suggestions = [
  "React",
  "TypeScript",
  "Next.js",
  "Unity",
  "C#",
  "After Effects",
  "Motion Graphics",
  "Animation",
  "Color Palette",
  "Text Counter",
  "Portfolio",
  "Development",
  "Design",
  "Video",
  "Game",
  "Web",
  "Tool",
  "プロフィール",
  "ポートフォリオ",
  "開発",
  "映像",
  "デザイン",
  "ツール",
  "ゲーム",
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({
        success: true,
        suggestions: [],
      });
    }

    const filteredSuggestions = suggestions
      .filter((suggestion) =>
        suggestion.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 5); // 最大5件

    return NextResponse.json({
      success: true,
      suggestions: filteredSuggestions,
    });
  } catch (error) {
    console.error("Search suggestions API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
