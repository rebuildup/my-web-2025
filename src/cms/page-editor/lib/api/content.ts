import type { ContentIndexItem } from "@/cms/types/content";
import { apiRequest } from "./client";

export async function fetchContentList(): Promise<ContentIndexItem[]> {
	return apiRequest<ContentIndexItem[]>("/api/cms/contents");
}

export async function fetchContent(
	id: string,
): Promise<ContentIndexItem | null> {
	return apiRequest<ContentIndexItem | null>("/api/cms/contents", {
		query: { id },
	});
}
