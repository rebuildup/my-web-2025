import { NextRequest, NextResponse } from "next/server";

// テスト用のポートフォリオデータ
const portfolioData = [
  {
    id: "portfolio-1753615145862",
    type: "portfolio",
    title: "React Dashboard Application",
    description: "モダンなReactダッシュボードアプリケーションの開発",
    category: "develop",
    tags: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
    thumbnail: "/images/portfolio/--1753614822051-3k30ay-optimized.jpg",
    images: ["/images/portfolio/--1753614822051-3k30ay-optimized.jpg"],
    status: "published",
    priority: 80,
    createdAt: "2024-12-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    publishedAt: "2024-12-01T00:00:00Z",
    content: "詳細なプロジェクト説明...",
  },
  {
    id: "portfolio-1753615145863",
    type: "portfolio",
    title: "Unity Game Development",
    description: "3Dアクションゲームの開発とリリース",
    category: "develop",
    tags: ["Unity", "C#", "3D", "Game Development"],
    thumbnail: "/images/portfolio/blob-1753614822486-vqggc8-optimized.jpg",
    images: ["/images/portfolio/blob-1753614822486-vqggc8-optimized.jpg"],
    status: "published",
    priority: 75,
    createdAt: "2024-11-15T00:00:00Z",
    updatedAt: "2024-11-15T00:00:00Z",
    publishedAt: "2024-11-15T00:00:00Z",
    content: "詳細なプロジェクト説明...",
  },
  {
    id: "portfolio-1753615145864",
    type: "portfolio",
    title: "Motion Graphics Video",
    description: "企業プロモーション用モーショングラフィックス",
    category: "video",
    tags: ["After Effects", "Motion Graphics", "Animation"],
    thumbnail: "/images/portfolio/--1753614822051-3k30ay-optimized.jpg",
    images: ["/images/portfolio/--1753614822051-3k30ay-optimized.jpg"],
    status: "published",
    priority: 70,
    createdAt: "2024-10-20T00:00:00Z",
    updatedAt: "2024-10-20T00:00:00Z",
    publishedAt: "2024-10-20T00:00:00Z",
    content: "詳細なプロジェクト説明...",
  },
  {
    id: "portfolio-1753615145865",
    type: "portfolio",
    title: "Brand Identity Design",
    description: "スタートアップ企業のブランドアイデンティティデザイン",
    category: "design",
    tags: ["Branding", "Logo Design", "Visual Identity"],
    thumbnail: "/images/portfolio/blob-1753614822486-vqggc8-optimized.jpg",
    images: ["/images/portfolio/blob-1753614822486-vqggc8-optimized.jpg"],
    status: "published",
    priority: 65,
    createdAt: "2024-09-10T00:00:00Z",
    updatedAt: "2024-09-10T00:00:00Z",
    publishedAt: "2024-09-10T00:00:00Z",
    content: "詳細なプロジェクト説明...",
  },
  {
    id: "portfolio-1753615145866",
    type: "portfolio",
    title: "E-commerce Platform",
    description: "フルスタックECサイトの開発",
    category: "develop",
    tags: ["Next.js", "Node.js", "PostgreSQL", "Stripe"],
    thumbnail: "/images/portfolio/--1753614822051-3k30ay-optimized.jpg",
    images: ["/images/portfolio/--1753614822051-3k30ay-optimized.jpg"],
    status: "published",
    priority: 85,
    createdAt: "2024-08-05T00:00:00Z",
    updatedAt: "2024-08-05T00:00:00Z",
    publishedAt: "2024-08-05T00:00:00Z",
    content: "詳細なプロジェクト説明...",
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const id = searchParams.get("id");

    let filteredData = [...portfolioData];

    // IDで特定のアイテムを取得
    if (id) {
      const item = filteredData.find((item) => item.id === id);
      if (item) {
        return NextResponse.json({
          success: true,
          data: item,
        });
      } else {
        return NextResponse.json(
          { success: false, error: "Portfolio item not found" },
          { status: 404 },
        );
      }
    }

    // ステータスフィルター
    if (status) {
      filteredData = filteredData.filter((item) => item.status === status);
    }

    // カテゴリフィルター
    if (category && category !== "all") {
      filteredData = filteredData.filter((item) => item.category === category);
    }

    // 日付順でソート（新しい順）
    filteredData.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    // リミット適用
    if (limit > 0) {
      filteredData = filteredData.slice(0, limit);
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
    });
  } catch (error) {
    console.error("Portfolio API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
