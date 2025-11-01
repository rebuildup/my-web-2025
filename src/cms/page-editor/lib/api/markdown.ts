import type { MarkdownPage } from "@/cms/types/markdown";
import { apiRequest } from "./client";

export interface MarkdownPagePayload
	extends Partial<Omit<MarkdownPage, "createdAt" | "updatedAt">> {
	createdAt?: string;
	updatedAt?: string;
}

export async function fetchMarkdownPages(
	contentId?: string,
): Promise<MarkdownPage[]> {
	return apiRequest<MarkdownPage[]>("/api/cms/markdown", {
		query: contentId ? { contentId } : undefined,
	});
}

export async function fetchMarkdownPage(
	idOrSlug: string,
): Promise<MarkdownPage> {
	return apiRequest<MarkdownPage>("/api/cms/markdown", {
		query: { id: idOrSlug },
	});
}

export async function createMarkdownPage(payload: MarkdownPagePayload) {
	return apiRequest<{
		ok: boolean;
		id: string;
		slug: string;
		page?: MarkdownPage;
	}>("/api/cms/markdown", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function updateMarkdownPage(payload: MarkdownPagePayload) {
	return apiRequest<{
		ok: boolean;
		id?: string;
		slug?: string;
		page?: MarkdownPage;
	}>("/api/cms/markdown", {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

export async function deleteMarkdownPage(idOrSlug: string) {
	return apiRequest<{ ok: boolean; id?: string }>("/api/cms/markdown", {
		method: "DELETE",
		query: { id: idOrSlug },
	});
}
