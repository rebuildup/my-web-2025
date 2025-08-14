import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function POST(_request: NextRequest) {
  try {
    console.log("=== Thumbnail Fix API Called ===");

    // Read current portfolio data
    const portfolioPath = path.join(
      process.cwd(),
      "public/data/content/portfolio.json",
    );
    const fileContent = await fs.readFile(portfolioPath, "utf-8");
    const portfolioData = JSON.parse(fileContent);

    if (!Array.isArray(portfolioData)) {
      return NextResponse.json(
        { error: "Invalid portfolio data format" },
        { status: 400 },
      );
    }

    let fixedCount = 0;
    const fixedItems: string[] = [];

    // Fix items without thumbnails
    const updatedData = portfolioData.map(
      (item: {
        id: string;
        thumbnail?: string;
        images?: string[];
        [key: string]: unknown;
      }) => {
        // Check if item needs thumbnail fix
        if (
          !item.thumbnail &&
          item.images &&
          Array.isArray(item.images) &&
          item.images.length > 0
        ) {
          console.log(`Fixing thumbnail for item: ${item.id}`);
          fixedCount++;
          fixedItems.push(item.id);

          return {
            ...item,
            thumbnail: item.images[0], // Set first image as thumbnail
            updatedAt: new Date().toISOString(),
          };
        }

        return item;
      },
    );

    // Write updated data back to file
    if (fixedCount > 0) {
      await fs.writeFile(
        portfolioPath,
        JSON.stringify(updatedData, null, 2),
        "utf-8",
      );
      console.log(`Fixed ${fixedCount} items:`, fixedItems);
    }

    return NextResponse.json({
      success: true,
      message: `Fixed ${fixedCount} items`,
      fixedItems,
      totalItems: portfolioData.length,
    });
  } catch (error) {
    console.error("Error fixing thumbnails:", error);
    return NextResponse.json(
      {
        error: "Failed to fix thumbnails",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
