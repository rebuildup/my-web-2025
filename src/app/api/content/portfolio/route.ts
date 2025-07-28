import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ContentItem } from "@/types/content";

// Read portfolio data from file
async function readPortfolioData(): Promise<ContentItem[]> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "content",
      "portfolio.json",
    );
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    console.log(`Loaded ${data.length} portfolio items from file`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error reading portfolio data:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");
    const id = searchParams.get("id");

    // Read data from file
    const portfolioData = await readPortfolioData();
    let filteredData = [...portfolioData];

    // IDで特定のアイテムを取得
    if (id) {
      const item = filteredData.find((item) => item.id === id);
      if (item) {
        const response = NextResponse.json({
          success: true,
          data: item,
        });

        // キャッシュ制御ヘッダーを追加（開発環境では無効化）
        if (process.env.NODE_ENV === "development") {
          response.headers.set(
            "Cache-Control",
            "no-store, no-cache, must-revalidate",
          );
          response.headers.set("Pragma", "no-cache");
          response.headers.set("Expires", "0");
        }

        return response;
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
    } else {
      // デフォルトでは published のみを表示（ギャラリー用）
      filteredData = filteredData.filter((item) => item.status === "published");
    }

    // カテゴリフィルター
    if (category && category !== "all") {
      filteredData = filteredData.filter((item) => item.category === category);
    }

    // 日付順でソート（新しい順）
    filteredData.sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime(),
    );

    // リミット適用
    if (limit > 0) {
      filteredData = filteredData.slice(0, limit);
    }

    const response = NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
    });

    // キャッシュ制御ヘッダーを追加（開発環境では無効化）
    if (process.env.NODE_ENV === "development") {
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate",
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
    }

    return response;
  } catch (error) {
    console.error("Portfolio API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
