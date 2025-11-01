import { loadContentByType } from "@/lib/data";
import type { ContentItem, ContentType } from "@/types";

export interface ContentQueryOptions {
	status?: string | null;
	category?: string | null;
	limit?: number;
	id?: string | null;
}

export interface ContentQueryResult {
	items: ContentItem[];
	total: number;
	item?: ContentItem;
}

export async function queryContentByType(
	type: ContentType,
	{
		status = null,
		category = null,
		limit,
		id = null,
	}: ContentQueryOptions = {},
): Promise<ContentQueryResult> {
	const items = await loadContentByType(type);

	if (id) {
		const item = items.find((entry) => entry.id === id) ?? null;
		return {
			items: item ? [item] : [],
			total: item ? 1 : 0,
			item: item ?? undefined,
		};
	}

	let filtered = [...items];

	if (status && status !== "all") {
		filtered = filtered.filter((item) => item.status === status);
	} else if (!status) {
		filtered = filtered.filter((item) => item.status === "published");
	}

	if (category && category !== "all") {
		filtered = filtered.filter((item) => item.category === category);
	}

	filtered.sort(
		(a, b) =>
			new Date(b.updatedAt || b.publishedAt || b.createdAt).getTime() -
			new Date(a.updatedAt || a.publishedAt || a.createdAt).getTime(),
	);

	const limited =
		typeof limit === "number" && Number.isFinite(limit) && limit > 0
			? filtered.slice(0, limit)
			: filtered;

	return {
		items: limited,
		total: filtered.length,
	};
}
