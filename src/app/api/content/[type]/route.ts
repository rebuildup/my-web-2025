import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { ContentItem, ContentType } from "@/types";

const VALID_CONTENT_TYPES: ContentType[] = [
  "portfolio",
  "blog",
  "plugin",
  "download",
  "tool",
  "profile",
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> },
) {
  try {
    const { type } = await context.params;
    const { searchParams } = new URL(request.url);

    // Validate content type
    if (!VALID_CONTENT_TYPES.includes(type as ContentType)) {
      return NextResponse.json(
        { error: `Invalid content type: ${type}` },
        { status: 400 },
      );
    }

    // Parse query parameters
    const category = searchParams.get("category");
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const status = searchParams.get("status"); // デフォルトなしで全てのステータスを許可
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Read content file
    const contentPath = path.join(
      process.cwd(),
      "public",
      "data",
      "content",
      `${type}.json`,
    );

    let content: ContentItem[] = [];
    try {
      const fileContent = await fs.readFile(contentPath, "utf-8");
      content = JSON.parse(fileContent);
      console.log(
        `Successfully loaded ${content.length} ${type} items from ${contentPath}`,
      );
    } catch (error) {
      // If file doesn't exist or is empty, return empty array
      console.warn(`Content file not found or invalid: ${contentPath}`, error);

      // Try alternative paths for different deployment environments
      const alternativePaths = [
        path.join(process.cwd(), "public", "data", "content", `${type}.json`),
        path.join(
          __dirname,
          "../../../../../public/data/content",
          `${type}.json`,
        ),
        path.join("/var/task/public/data/content", `${type}.json`),
      ];

      for (const altPath of alternativePaths) {
        try {
          const altContent = await fs.readFile(altPath, "utf-8");
          content = JSON.parse(altContent);
          console.log(
            `Successfully loaded ${content.length} ${type} items from alternative path: ${altPath}`,
          );
          break;
        } catch (altError) {
          console.log(`Alternative path failed: ${altPath}`, altError);
          continue;
        }
      }
    }

    // Filter content
    const filteredContent = content.filter((item) => {
      // Filter by status (only if status is specified)
      if (status && item.status !== status) return false;

      // Filter by category
      if (category && item.category !== category) return false;

      // Filter by tags
      if (tags && tags.length > 0) {
        const hasMatchingTag = tags.some((tag) =>
          item.tags.some((itemTag) =>
            itemTag.toLowerCase().includes(tag.toLowerCase()),
          ),
        );
        if (!hasMatchingTag) return false;
      }

      return true;
    });

    // Sort content
    const sortedContent = [...filteredContent].sort((a, b) => {
      let aValue: unknown = a[sortBy as keyof ContentItem];
      let bValue: unknown = b[sortBy as keyof ContentItem];

      // Handle date sorting
      if (
        sortBy === "createdAt" ||
        sortBy === "updatedAt" ||
        sortBy === "publishedAt"
      ) {
        aValue = new Date((aValue as string) || 0).getTime();
        bValue = new Date((bValue as string) || 0).getTime();
      }

      // Handle numeric sorting
      if (sortBy === "priority") {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (sortOrder === "desc") {
        return (bValue as number) > (aValue as number) ? 1 : -1;
      } else {
        return (aValue as number) > (bValue as number) ? 1 : -1;
      }
    });

    // Apply pagination
    const total = sortedContent.length;
    const paginatedContent = sortedContent.slice(offset, offset + limit);

    // Set cache headers
    const headers = new Headers();
    headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=86400",
    );

    return NextResponse.json(
      {
        type,
        data: paginatedContent,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        filters: {
          category,
          tags,
          status,
          sortBy,
          sortOrder,
        },
      },
      { headers },
    );
  } catch (error) {
    console.error(`Content API error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
