import { NextRequest, NextResponse } from "next/server";

// テスト用のプラグインデータ
const pluginData = [
  {
    id: "plugin-1",
    title: "After Effects Text Animation Plugin",
    description: "テキストアニメーションを簡単に作成できるプラグイン",
    content: "After Effectsでテキストアニメーションを効率的に作成...",
    status: "published",
    category: "aftereffects",
    tags: ["After Effects", "Plugin", "Animation"],
    createdAt: "2024-10-01T00:00:00Z",
    updatedAt: "2024-10-01T00:00:00Z",
    publishedAt: "2024-10-01T00:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filteredData = [...pluginData];

    if (status) {
      filteredData = filteredData.filter((item) => item.status === status);
    }

    filteredData.sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    if (limit > 0) {
      filteredData = filteredData.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
    });
  } catch (error) {
    console.error("Plugin API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
