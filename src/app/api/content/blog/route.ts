import { NextRequest, NextResponse } from "next/server";

// テスト用のブログデータ
const blogData = [
  {
    id: "blog-1",
    title: "React開発のベストプラクティス",
    description: "モダンなReact開発で知っておくべきベストプラクティス",
    content: "React開発における効率的な開発手法について解説します...",
    status: "published",
    category: "development",
    tags: ["React", "JavaScript", "Frontend"],
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    publishedAt: "2024-12-01T00:00:00Z",
  },
  {
    id: "blog-2",
    title: "TypeScriptの型システム入門",
    description: "TypeScriptの型システムを理解して安全なコードを書く",
    content: "TypeScriptの型システムについて基礎から応用まで解説...",
    status: "published",
    category: "development",
    tags: ["TypeScript", "JavaScript", "Types"],
    createdAt: "2024-11-15T00:00:00Z",
    updatedAt: "2024-11-15T00:00:00Z",
    publishedAt: "2024-11-15T00:00:00Z",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");

    let filteredData = [...blogData];

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
    console.error("Blog API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
