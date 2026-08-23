export const dynamic = "force-static";
import { type NextRequest, NextResponse } from "next/server";
import { getCmsApiBaseUrl } from "@/lib/cms-api/config";
import { fetchCmsContentIndex } from "@/lib/cms-api/server-data";

const PORTFOLIO_TAGS: ReadonlySet<string> = new Set([
	"develop",
	"video",
	"design",
	"video&design",
]);

function pickCategory(tags: unknown): string {
	if (Array.isArray(tags)) {
		for (const t of tags) {
			if (typeof t === "string" && PORTFOLIO_TAGS.has(t)) return t;
		}
	}
	return "all";
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "", 10);
		const id = searchParams.get("id");

		console.log("[Portfolio API] Request received:", { limit, id });

		// Get all content from index (same as portfolio page)
		const rows = await fetchCmsContentIndex();
		console.log("[Portfolio API] Found rows:", rows.length);

		const filtered: any[] = [];
		for (const r of rows as any[]) {
			if (r.status !== "published") continue;
			if (
				!Array.isArray(r?.tags) ||
				!r.tags.some((t: string) => PORTFOLIO_TAGS.has(t))
			)
				continue;

			const thumbs = r.thumbnails || {};
			const getMediaUrl = (mediaId?: string) => {
				if (!mediaId) return undefined;
				if (
					mediaId.startsWith("http://") ||
					mediaId.startsWith("https://") ||
					mediaId.startsWith("/")
				) {
					return mediaId;
				}
				return `${getCmsApiBaseUrl()}/media?contentId=${r.id}&id=${mediaId}&raw=1`;
			};

			let thumbnail: string | undefined;
			if (thumbs?.image?.src) thumbnail = getMediaUrl(thumbs.image.src as string);
			else if (thumbs?.gif?.src) thumbnail = getMediaUrl(thumbs.gif.src as string);
			else if (thumbs?.webm?.poster)
				thumbnail = getMediaUrl(thumbs.webm.poster as string);

			filtered.push({
				id: r.id,
				title: r.title,
				description: r.summary ?? "",
				thumbnail,
				tags: Array.isArray(r.tags) ? r.tags : [],
				technologies: [],
				category: pickCategory(r.tags),
				createdAt: r.createdAt,
				updatedAt: r.updatedAt,
				publishedAt: r.publishedAt,
			});
		}

		filtered.sort(
			(a: any, b: any) =>
				new Date(b.publishedAt || b.updatedAt || b.createdAt).getTime() -
				new Date(a.publishedAt || a.updatedAt || a.createdAt).getTime(),
		);

		// Handle single item request by id
		if (id) {
			const item = filtered.find((item: any) => item.id === id);
			if (!item) {
				return NextResponse.json(
					{ success: false, error: "Portfolio item not found" },
					{ status: 404 },
				);
			}
			return NextResponse.json({ success: true, data: item });
		}

		const limited =
			Number.isFinite(limit) && limit > 0 ? filtered.slice(0, limit) : filtered;

		return NextResponse.json(
			{
				success: true,
				data: limited,
				total: filtered.length,
			},
			{
				headers: {
					"Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
				},
			},
		);
	} catch (error) {
		console.error("Portfolio API error:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to load portfolio content" },
			{ status: 500 },
		);
	}
}
