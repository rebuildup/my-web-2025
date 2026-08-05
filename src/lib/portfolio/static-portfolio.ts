import "server-only";

import {
	type CmsContentIndexEntry,
	fetchCmsContentIndex,
} from "@/lib/cms-api/server-data";

export type StaticPortfolioItem = {
	id: string;
	title: string;
	description: string;
	thumbnail?: string;
	tags: string[];
	technologies: string[];
	category: string;
	createdAt?: string;
	updatedAt?: string;
	publishedAt?: string;
};

const PORTFOLIO_TAGS = new Set(["develop", "video", "design", "video&design"]);

function pickThumbnail(entry: CmsContentIndexEntry): string | undefined {
	if (entry.thumbnail) return entry.thumbnail;
	const thumbs = entry.thumbnails as
		| {
				image?: { src?: string };
				gif?: { src?: string };
				webm?: { poster?: string };
		  }
		| undefined;
	if (!thumbs) return undefined;
	return thumbs.image?.src || thumbs.gif?.src || thumbs.webm?.poster;
}

function mapEntry(entry: CmsContentIndexEntry): StaticPortfolioItem {
	const tags = Array.isArray(entry.tags) ? entry.tags : [];
	const category = tags.find((tag) => PORTFOLIO_TAGS.has(tag)) || "all";
	return {
		id: entry.id,
		title: entry.title,
		description: entry.summary || "",
		thumbnail: pickThumbnail(entry),
		tags,
		technologies: [],
		category,
		createdAt: entry.createdAt,
		updatedAt: entry.updatedAt,
		publishedAt: entry.publishedAt || "",
	};
}

/**
 * Build-time portfolio list for static export pages.
 * Prefer embedding this into client components instead of runtime `/api/content/*`.
 */
export async function getStaticPortfolioItems(
	limit = 50,
): Promise<StaticPortfolioItem[]> {
	const rows = await fetchCmsContentIndex();
	const items = rows
		.filter((row) => row.status === "published")
		.filter((row) => {
			const tags = Array.isArray(row.tags) ? row.tags : [];
			return tags.some((tag) => PORTFOLIO_TAGS.has(tag));
		})
		.map(mapEntry)
		.sort((a, b) => {
			const aTime = new Date(
				a.publishedAt || a.updatedAt || a.createdAt || 0,
			).getTime();
			const bTime = new Date(
				b.publishedAt || b.updatedAt || b.createdAt || 0,
			).getTime();
			return bTime - aTime;
		});

	return Number.isFinite(limit) && limit > 0 ? items.slice(0, limit) : items;
}
