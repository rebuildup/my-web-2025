import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { ContentItem } from "@/types/content";

// Read portfolio data from file
async function readPortfolioData(): Promise<ContentItem[]> {
  try {
    // Try multiple possible paths for different deployment environments
    const possiblePaths = [
      path.join(process.cwd(), "public", "data", "content", "portfolio.json"),
      path.join(process.cwd(), "public/data/content/portfolio.json"),
      path.join(__dirname, "../../../../../public/data/content/portfolio.json"),
      path.join(
        __dirname,
        "../../../../../../public/data/content/portfolio.json",
      ),
      // Standalone build paths
      path.join(
        process.cwd(),
        ".next/standalone/public/data/content/portfolio.json",
      ),
      path.join(__dirname, "../../public/data/content/portfolio.json"),
      path.join(__dirname, "../../../public/data/content/portfolio.json"),
      // Vercel deployment paths
      path.join("/var/task/public/data/content/portfolio.json"),
      path.join("/tmp/public/data/content/portfolio.json"),
    ];

    let fileContent = "";
    let usedPath = "";

    for (const filePath of possiblePaths) {
      try {
        fileContent = await fs.readFile(filePath, "utf-8");
        usedPath = filePath;
        break;
      } catch (pathError) {
        console.log(
          "API: Failed to load from:",
          filePath,
          pathError instanceof Error ? pathError.message : String(pathError),
        );
        continue;
      }
    }

    if (!fileContent) {
      throw new Error("Could not find portfolio.json in any expected location");
    }

    const data = JSON.parse(fileContent);
    console.log(
      `Loaded ${data.length} portfolio items from file (${usedPath})`,
    );
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

    console.log("Portfolio API called with params:", {
      status,
      limit,
      category,
      id,
    });

    // Read data from file
    const portfolioData = await readPortfolioData();
    console.log("Raw portfolio data loaded:", portfolioData.length, "items");
    console.log(
      "Status distribution:",
      portfolioData.reduce(
        (acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    );

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
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          );
          response.headers.set("Pragma", "no-cache");
          response.headers.set("Expires", "0");
          response.headers.set("Surrogate-Control", "no-store");
        } else {
          response.headers.set(
            "Cache-Control",
            "public, max-age=300, s-maxage=300",
          );
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
    if (status && status !== "all") {
      filteredData = filteredData.filter((item) => item.status === status);
      console.log(
        `Filtered by status '${status}':`,
        filteredData.length,
        "items",
      );
    } else if (!status) {
      // デフォルトでは published のみを表示（ギャラリー用）
      filteredData = filteredData.filter((item) => item.status === "published");
      console.log("Filtered for published only:", filteredData.length, "items");
    }
    // status=all の場合は全てのデータを返す（データマネージャー用）

    // カテゴリフィルター
    if (category && category !== "all") {
      filteredData = filteredData.filter((item) => item.category === category);
      console.log(
        `Filtered by category '${category}':`,
        filteredData.length,
        "items",
      );
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
      console.log("Applied limit:", filteredData.length, "items");
    }

    console.log("Final filtered data:", filteredData.length, "items");

    const response = NextResponse.json({
      success: true,
      data: filteredData,
      total: filteredData.length,
    });

    // キャッシュ制御ヘッダーを追加（開発環境では無効化）
    if (process.env.NODE_ENV === "development") {
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      response.headers.set("Surrogate-Control", "no-store");
    } else {
      // 本番環境では短いキャッシュ時間を設定
      response.headers.set(
        "Cache-Control",
        "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
      );
      response.headers.set("Content-Type", "application/json");
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
