import { type NextRequest, NextResponse } from "next/server";
import { getAllFromIndex } from "@/cms/lib/content-db-manager";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get("limit") || "", 10);
		const id = searchParams.get("id");

		console.log("[Portfolio API] Request received:", { limit, id });

		// Get all content from index (same as portfolio page)
		const rows = getAllFromIndex();
		console.log("[Portfolio API] Found rows:", rows.length);

		// Filter for published portfolio items
		const filtered = rows

		// Filter for published portfolio items
		const filtered = rows
			.filter((r: any) => r.status === "published")
			.filter(
				(r: any) =>
					Array.isArray(r?.tags) &&
					(r.tags.includes("develop") ||
						r.tags.includes("video") ||
						r.tags.includes("design") ||
						r.tags.includes("video&design")),
			)
			.map((r: any) => {
				const thumbs = r.thumbnails || {};
				const pickThumb = () => {
					const getMediaUrl = (mediaId?: string) => {
						if (!mediaId) return undefined;
						if (
							mediaId.startsWith("http://") ||
							mediaId.startsWith("https://") ||
							mediaId.startsWith("/")
						) {
							return mediaId;
						}
						return `/api/cms/media?contentId=${r.id}&id=${mediaId}&raw=1`;
					};

					if (thumbs?.image?.src)
						return getMediaUrl(thumbs.image.src as string);
					if (thumbs?.gif?.src) return getMediaUrl(thumbs.gif.src as string);
					if (thumbs?.webm?.poster)
						return getMediaUrl(thumbs.webm.poster as string);
					return undefined;
				};

				return {
					id: r.id,
					title: r.title,
					description: r.summary ?? "",
					thumbnail: pickThumb(),
					tags: Array.isArray(r.tags) ? r.tags : [],
					technologies: [],
					category: r.tags?.find((t: string) =>
						["develop", "video", "design", "video&design"].includes(t),
					) || "all",
					createdAt: r.createdAt,
					updatedAt: r.updatedAt,
					publishedAt: r.publishedAt,
				};
			})
			.sort(
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

		return NextResponse.json({
			success: true,
			data: limited,
			total: filtered.length,
		});
	} catch (error) {
		console.error("Portfolio API error:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to load portfolio content" },
			{ status: 500 },
		);
	}
}
