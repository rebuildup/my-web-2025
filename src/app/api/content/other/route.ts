import { type NextRequest, NextResponse } from "next/server";
import { loadContentByType } from "@/lib/data";
import type { ContentItem, EnhancedContentItem } from "@/types";
import {
	hasOtherCategory,
	isEnhancedContentItem,
	migrateCategoryToCategories,
} from "@/types";

/**
 * Enhanced API endpoint specifically for "Other" category content
 * Handles items that should only appear in the "All" gallery
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);

		// Parse query parameters
		const tags = searchParams.get("tags")?.split(",").filter(Boolean);
		const status = searchParams.get("status") || "published";
		const limit = parseInt(searchParams.get("limit") || "50", 10);
		const offset = parseInt(searchParams.get("offset") || "0", 10);
		const sortBy = searchParams.get("sortBy") || "createdAt";
		const sortOrder = searchParams.get("sortOrder") || "desc";

		const content = (await loadContentByType("portfolio")) as Array<
			ContentItem | EnhancedContentItem
		>;

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
		const enhancedContent: EnhancedContentItem[] = content.map((item) => {
			if (isEnhancedContentItem(item)) {
				return item;
			} else {
				return migrateLegacyItem(item);
			}
		});

		// Filter for Other category items only
		const otherCategoryContent = enhancedContent.filter((item) => {
			// Must be Other category
			if (!hasOtherCategory(item)) return false;

			// Filter by status
			if (status && item.status !== status) return false;

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
		const sortedContent = [...otherCategoryContent].sort((a, b) => {
			let aValue: unknown = a[sortBy as keyof EnhancedContentItem];
			let bValue: unknown = b[sortBy as keyof EnhancedContentItem];

			// Handle date sorting
			if (
				sortBy === "createdAt" ||
				sortBy === "updatedAt" ||
				sortBy === "publishedAt" ||
				sortBy === "effectiveDate"
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
				type: "other",
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
					sortBy,
					sortOrder,
				},
				stats: {
					totalItems: enhancedContent.length,
					otherCategoryItems: otherCategoryContent.length,
					paginatedItems: paginatedContent.length,
				},
			},
			{ headers },
		);
	} catch (error) {
		console.error(`Other category API error:`, error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
