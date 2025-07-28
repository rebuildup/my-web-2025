import { NextRequest, NextResponse } from "next/server";

// テスト用のダウンロードデータ
const downloadData = [
  {
    id: "download-1",
    title: "Motion Graphics Template Pack",
    description: "モーショングラフィックステンプレート集",
    content: "After Effects用のモーショングラフィックステンプレート...",
    status: "published",
    category: "template",
    tags: ["After Effects", "Template", "Motion Graphics"],
    createdAt: "2024-09-01T00:00:00Z",
    updatedAt: "2024-09-01T00:00:00Z",
    publishedAt: "2024-09-01T00:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filteredData = [...downloadData];

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
    console.error("Download API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
