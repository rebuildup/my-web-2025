import type { ContentItem, EnhancedContentItem } from "@/types";
import {
  getEffectiveDate,
  hasOtherCategory,
  isEnhancedContentItem,
  migrateCategoryToCategories,
} from "@/types";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

/**
 * Enhanced API endpoint specifically for video&design gallery
 * Handles video, design, and video&design categories with deduplication
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const status = searchParams.get("status") || "published";
    const includeVideo = searchParams.get("includeVideo") !== "false";
    const includeDesign = searchParams.get("includeDesign") !== "false";
    const includeVideoDesign =
      searchParams.get("includeVideoDesign") !== "false";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "effectiveDate";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Read portfolio content file
    const contentPath = path.join(
      process.cwd(),
      "public",
      "data",
      "content",
      "portfolio.json",
    );

    let content: (ContentItem | EnhancedContentItem)[] = [];
    try {
      const fileContent = await fs.readFile(contentPath, "utf-8");
      content = JSON.parse(fileContent);
      console.log(
        `Successfully loaded ${content.length} portfolio items for video&design gallery`,
      );
    } catch (error) {
      console.warn(`Portfolio content file not found: ${contentPath}`, error);
      return NextResponse.json(
        {
          type: "video&design",
          data: [],
          pagination: { total: 0, limit, offset, hasMore: false },
          filters: {
            tags,
            status,
            includeVideo,
            includeDesign,
            includeVideoDesign,
            sortBy,
            sortOrder,
          },
          stats: { totalItems: 0, filteredItems: 0, paginatedItems: 0 },
        },
        {
          headers: {
            "Cache-Control":
              "public, max-age=3600, stale-while-revalidate=86400",
          },
        },
      );
    }

    // Helper function to load markdown content
    const loadMarkdownContent = async (
      item: EnhancedContentItem,
    ): Promise<EnhancedContentItem> => {
      if (item.markdownPath && !item.markdownContent) {
        try {
          const markdownPath = path.join(process.cwd(), item.markdownPath);
          const markdownContent = await fs.readFile(markdownPath, "utf-8");
          return { ...item, markdownContent };
        } catch (error) {
          console.warn(`Failed to load markdown for ${item.id}:`, error);
          return item;
        }
      }
      return item;
    };

    // Helper function to migrate legacy items
    const migrateLegacyItem = (item: ContentItem): EnhancedContentItem => {
      return {
        ...item,
        categories: item.category
          ? migrateCategoryToCategories(item.category)
          : ["other"],
        isOtherCategory: item.category === "other",
        useManualDate: false,
        effectiveDate: item.createdAt,
        processedImages: item.images || [],
        originalImages: [],
      };
    };

    // Migrate legacy content items to enhanced format
    const enhancedContent: EnhancedContentItem[] = await Promise.all(
      content.map(async (item) => {
        if (isEnhancedContentItem(item)) {
          return await loadMarkdownContent(item);
        } else {
          return migrateLegacyItem(item);
        }
      }),
    );

    // Filter for video&design gallery items
    const videoDesignContent = enhancedContent.filter((item) => {
      // Exclude Other category items
      if (hasOtherCategory(item)) return false;

      // Filter by status
      if (status && item.status !== status) return false;

      // Check if item matches any of the target categories
      const hasTargetCategory =
        (includeVideo && item.categories.includes("video")) ||
        (includeDesign && item.categories.includes("design")) ||
        (includeVideoDesign && item.categories.includes("video&design"));

      if (!hasTargetCategory) return false;

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

    // Deduplicate items (remove items with same ID)
    const deduplicatedContent = videoDesignContent.filter(
      (item, index, array) =>
        array.findIndex((i) => i.id === item.id) === index,
    );

    // Sort content
    const sortedContent = [...deduplicatedContent].sort((a, b) => {
      let aValue: unknown = a[sortBy as keyof EnhancedContentItem];
      let bValue: unknown = b[sortBy as keyof EnhancedContentItem];

      // Handle date sorting with effective date support
      if (
        sortBy === "createdAt" ||
        sortBy === "updatedAt" ||
        sortBy === "publishedAt" ||
        sortBy === "effectiveDate"
      ) {
        if (sortBy === "effectiveDate") {
          aValue = getEffectiveDate(a).getTime();
          bValue = getEffectiveDate(b).getTime();
        } else {
          aValue = new Date((aValue as string) || 0).getTime();
          bValue = new Date((bValue as string) || 0).getTime();
        }
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
        type: "video&design",
        data: paginatedContent,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        filters: {
          tags,
          status,
          includeVideo,
          includeDesign,
          includeVideoDesign,
          sortBy,
          sortOrder,
        },
        stats: {
          totalItems: enhancedContent.length,
          videoDesignItems: videoDesignContent.length,
          deduplicatedItems: deduplicatedContent.length,
          paginatedItems: paginatedContent.length,
        },
        categories: {
          video: enhancedContent.filter(
            (item) =>
              item.categories.includes("video") && !hasOtherCategory(item),
          ).length,
          design: enhancedContent.filter(
            (item) =>
              item.categories.includes("design") && !hasOtherCategory(item),
          ).length,
          videoDesign: enhancedContent.filter(
            (item) =>
              item.categories.includes("video&design") &&
              !hasOtherCategory(item),
          ).length,
        },
      },
      { headers },
    );
  } catch (error) {
    console.error(`Video&Design gallery API error:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
