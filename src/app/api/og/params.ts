import type { NextRequest } from "next/server";

const MAX_TITLE_LENGTH = 100;
const MAX_SUMMARY_LENGTH = 80;
const MAX_DISPLAY_TAGS = 3;
const DEFAULT_TITLE = "Portfolio";
const DEFAULT_CATEGORY = "portfolio";
const DEFAULT_HOST = "yusuke-kim.com";

export interface OgParams {
	title: string;
	category: string;
	tags: string[];
	thumbnail: string | null;
	slug: string;
	displayTags: string[];
	thumbnailSrc: string;
	summary: string;
}

export function parseOgParams(req: NextRequest): OgParams {
	const { searchParams } = new URL(req.url);

	const title = searchParams.get("title")?.slice(0, MAX_TITLE_LENGTH) || DEFAULT_TITLE;
	const category = searchParams.get("category") || DEFAULT_CATEGORY;
	const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
	const thumbnail = searchParams.get("thumbnail");
	const slug = searchParams.get("slug") || "";
	const displayTags = tags.slice(0, MAX_DISPLAY_TAGS);

	const summaryParam = searchParams.get("summary") || "";
	const summary =
		summaryParam.slice(0, MAX_SUMMARY_LENGTH) +
		(summaryParam.length > MAX_SUMMARY_LENGTH ? "..." : "");

	const thumbnailSrc = resolveThumbnailUrl(thumbnail, req);

	return {
		title,
		category,
		tags,
		thumbnail,
		slug,
		displayTags,
		thumbnailSrc,
		summary,
	};
}

function resolveThumbnailUrl(thumbnail: string | null, req: NextRequest): string {
	if (!thumbnail) return "";
	if (thumbnail.startsWith("http")) return thumbnail;
	const host = req.headers.get("host") || DEFAULT_HOST;
	const protocol = host.includes("localhost") ? "http" : "https";
	return `${protocol}://${host}${thumbnail}`;
}
