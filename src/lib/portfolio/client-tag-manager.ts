/**
 * Client-side Tag Manager
 * Uses API endpoints instead of direct file system access
 */

import type { TagInfo, TagManagementSystem } from "@/types/enhanced-content";

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
	if (!response.ok) return null;
	return (await response.json()) as T;
}

interface TagApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
}

export class ClientTagManager implements TagManagementSystem {
	async getAllTags(): Promise<TagInfo[]> {
		try {
			const response = await fetch("/api/admin/tags");
			const data = await parseJsonResponse<TagApiResponse<TagInfo[]>>(response);
			return data?.success && data.data ? data.data : [];
		} catch (error) {
			console.error("Failed to fetch tags:", error);
			return [];
		}
	}

	async createTag(name: string): Promise<TagInfo> {
		const response = await fetch("/api/admin/tags", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name }),
		});
		const data = await parseJsonResponse<TagApiResponse<TagInfo>>(response);
		if (!data || !data.success || !data.data) {
			throw new Error(data?.message || "Failed to create tag");
		}
		return data.data;
	}

	async updateTagUsage(name: string): Promise<void> {
		const response = await fetch(
			`/api/admin/tags/${encodeURIComponent(name)}`,
			{
				method: "PUT",
			},
		);
		const data = await parseJsonResponse<TagApiResponse<unknown>>(response);
		if (!data || !data.success) {
			throw new Error(data?.message || "Failed to update tag usage");
		}
	}

	async deleteTag(name: string): Promise<boolean> {
		try {
			const response = await fetch(
				`/api/admin/tags/${encodeURIComponent(name)}`,
				{
					method: "DELETE",
				},
			);
			const data = await parseJsonResponse<TagApiResponse<unknown>>(response);
			return Boolean(data?.success);
		} catch (error) {
			console.error("Failed to delete tag:", error);
			return false;
		}
	}

	async searchTags(query: string): Promise<TagInfo[]> {
		try {
			const response = await fetch(
				`/api/admin/tags?q=${encodeURIComponent(query)}`,
			);
			const data = await parseJsonResponse<TagApiResponse<TagInfo[]>>(response);
			return data?.success && data.data ? data.data : [];
		} catch (error) {
			console.error("Failed to search tags:", error);
			return [];
		}
	}
}

// Export singleton instance
export const clientTagManager = new ClientTagManager();
