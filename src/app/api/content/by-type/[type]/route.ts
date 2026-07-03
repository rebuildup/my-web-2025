import { type NextRequest, NextResponse } from "next/server";
import { fetchCmsContentIndex } from "@/lib/cms-api/server-data";
import type { ContentItem, ContentType } from "@/types/content";
import type { EnhancedContentItem } from "@/types/enhanced-content";

export const runtime = "nodejs";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ type: string }> },
) {
	try {
		const { type } = await params;
		const { searchParams } = new URL(_request.url);
		const limit = parseInt(searchParams.get("limit") || "100", 10);
		const statusFilter = searchParams.get("status") || "all";

		const allEntries = await fetchCmsContentIndex();

		// Filter by type (stored in ext.type or derived from tags)
		const filtered = allEntries.filter((entry) => {
			// CMS stores type in ext.type, but fetchCmsContentIndex may not expose it directly
			// Fall back to checking if the id starts with the type prefix
			const entryType = entry.id.split("-")[0];
			return entryType === type;
		});

		// Filter by status
		const statusFiltered =
			statusFilter === "all"
				? filtered
				: filtered.filter((e) => e.status === statusFilter);

		// Map CMS entries to ContentItem / EnhancedContentItem format
		const items: (ContentItem | EnhancedContentItem)[] = statusFiltered.map(
			(entry) => {
				const thumb = entry.thumbnails as
					| { image?: { src?: string }; gif?: { src?: string }; webm?: { poster?: string } }
					| undefined;
				const thumbnailSrc = thumb?.image?.src || thumb?.gif?.src || thumb?.webm?.poster;

				const base = {
					id: entry.id,
					type: type as ContentType,
					title: entry.title,
					description: entry.summary || "",
					tags: entry.tags || [],
					status: (entry.status || "draft") as ContentItem["status"],
					priority: 50,
					createdAt: entry.createdAt || new Date().toISOString(),
					updatedAt: entry.updatedAt || entry.createdAt,
					publishedAt: entry.publishedAt || undefined,
					thumbnail: thumbnailSrc || undefined,
				};

				// Portfolio items are EnhancedContentItem
				if (type === "portfolio") {
					const categories = (entry.tags || []).filter(
						(t: string) =>
							["develop", "video", "design", "video&design", "other"].includes(t),
					) as EnhancedContentItem["categories"];
					return {
						...base,
						categories: categories.length > 0 ? categories : ["other"],
						content: "",
						images: [],
						videos: [],
						externalLinks: [],
					} as EnhancedContentItem;
				}

				return {
					...base,
					category: entry.tags?.[0] || "",
					content: "",
					images: [],
					videos: [],
					externalLinks: [],
				} as ContentItem;
			},
		);

		const limited = Number.isFinite(limit) ? items.slice(0, limit) : items;

		return NextResponse.json({
			success: true,
			data: limited,
			total: items.length,
		});
	} catch (error) {
		console.error("GET /api/content/by-type error:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to load content by type" },
			{ status: 500 },
		);
	}
}
