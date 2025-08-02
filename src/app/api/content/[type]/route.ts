import {
  getEffectiveDate,
  hasOtherCategory,
  type ContentItem,
  type ContentType,
  type EnhancedCategoryType,
  type EnhancedContentItem,
} from "@/types";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

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
    const categories = searchParams
      .get("categories")
      ?.split(",")
      .filter(Boolean) as EnhancedCategoryType[];
    const tags = searchParams.get("tags")?.split(",").filter(Boolean);
    const status = searchParams.get("status"); // デフォルトなしで全てのステータスを許可
    const includeOther = searchParams.get("includeOther") === "true";
    const excludeOther = searchParams.get("excludeOther") === "true";
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const deduplication = searchParams.get("deduplication") === "true";

    // Read content file
    const contentPath = path.join(
      process.cwd(),
      "public",
      "data",
      "content",
      `${type}.json`,
    );

    let content: (ContentItem | EnhancedContentItem)[] = [];
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

    // Helper functions for enhanced content processing
    /*
    const _migrateLegacyItem = (item: ContentItem): EnhancedContentItem => {
      return {
        ...item,
        categories: item.category
          ? migrateCategoryToCategories(item.category as EnhancedCategoryType)
          : ["other"],
        isOtherCategory: item.category === "other",
        useManualDate: false,
        effectiveDate: item.createdAt,
        processedImages: item.images || [],
        originalImages: [],
      };
    };
    */

    // Use enhanced data processing pipeline
    const { EnhancedDataProcessingPipeline } = await import(
      "@/lib/portfolio/enhanced-data-pipeline"
    );
    const { pipelineMonitor } = await import(
      "@/lib/monitoring/pipeline-monitor"
    );

    const pipeline = new EnhancedDataProcessingPipeline({
      enableLogging: process.env.NODE_ENV === "development",
      enableMonitoring: true,
      maxConcurrentOperations: 5,
    });

    const pipelineResult = await pipeline.processContentData(content, {
      enableMigration: true,
      enableMarkdownLoading: true,
      enableTagUpdates: false, // Skip tag updates in API calls for performance
      enableDateCalculation: true,
      enableValidation: true,
    });

    // Record pipeline execution for monitoring
    pipelineMonitor.recordPipelineExecution(pipelineResult);

    // Use processed data
    const enhancedContent = pipelineResult.data;

    // Filter enhanced content
    const filteredContent = enhancedContent.filter((item) => {
      // Filter by status (only if status is specified)
      if (status && item.status !== status) return false;

      // Filter by legacy single category (for backward compatibility)
      if (category) {
        if (!item.categories.includes(category as EnhancedCategoryType))
          return false;
      }

      // Filter by multiple categories (enhanced feature)
      if (categories && categories.length > 0) {
        const hasMatchingCategory = categories.some((cat) =>
          item.categories.includes(cat),
        );
        if (!hasMatchingCategory) return false;
      }

      // Filter by Other category inclusion/exclusion
      if (excludeOther && hasOtherCategory(item)) return false;
      if (includeOther === false && hasOtherCategory(item)) return false;

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

    // Apply deduplication if requested
    const deduplicatedContent = deduplication
      ? filteredContent.filter(
          (item, index, array) =>
            array.findIndex((i) => i.id === item.id) === index,
        )
      : filteredContent;

    // Sort content
    const sortedContent = [...deduplicatedContent].sort((a, b) => {
      let aValue: unknown = a[sortBy as keyof ContentItem];
      let bValue: unknown = b[sortBy as keyof ContentItem];

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
          categories,
          tags,
          status,
          includeOther,
          excludeOther,
          sortBy,
          sortOrder,
          deduplication,
        },
        stats: {
          totalItems: enhancedContent.length,
          filteredItems: filteredContent.length,
          deduplicatedItems: deduplicatedContent.length,
          paginatedItems: paginatedContent.length,
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
