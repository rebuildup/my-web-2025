/**
 * Client-Side Markdown Service
 * Provides markdown operations for client components via API calls
 */

import type { ContentType } from "@/types/content";

export class ClientMarkdownService {
	private baseUrl = "/api/markdown";

	/**
	 * Generate file path for a content item
	 */
	async generateFilePath(
		contentId: string,
		contentType: ContentType,
	): Promise<string> {
		const response = await fetch(this.baseUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				action: "generateFilePath",
				contentId,
				contentType,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to generate file path: ${response.statusText}`);
		}

		const { filePath } = await response.json();
		return filePath;
	}

	/**
	 * Create a new markdown file
	 */
	async createMarkdownFile(
		contentId: string,
		contentType: ContentType,
		content: string,
	): Promise<string> {
		const response = await fetch(this.baseUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				action: "createMarkdownFile",
				contentId,
				contentType,
				content,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to create markdown file: ${response.statusText}`);
		}

		const { filePath } = await response.json();
		return filePath;
	}

	/**
	 * Update existing markdown file
	 */
	async updateMarkdownFile(filePath: string, content: string): Promise<void> {
		const response = await fetch(this.baseUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				action: "updateMarkdownFile",
				filePath,
				content,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to update markdown file: ${response.statusText}`);
		}
	}

	/**
	 * Check if markdown file exists
	 */
	async fileExists(filePath: string): Promise<boolean> {
		const response = await fetch(
			`${this.baseUrl}?action=fileExists&filePath=${encodeURIComponent(filePath)}`,
		);

		if (!response.ok) {
			throw new Error(`Failed to check file existence: ${response.statusText}`);
		}

		const { exists } = await response.json();
		return exists;
	}

	/**
	 * Get markdown file content
	 */
	async getMarkdownContent(filePath: string): Promise<string> {
		const response = await fetch(
			`${this.baseUrl}?action=getMarkdownContent&filePath=${encodeURIComponent(filePath)}`,
		);

		if (!response.ok) {
			throw new Error(`Failed to get markdown content: ${response.statusText}`);
		}

		const { content } = await response.json();
		return content;
	}

	/**
	 * Delete markdown file
	 */
	async deleteMarkdownFile(filePath: string): Promise<void> {
		const response = await fetch(this.baseUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				action: "deleteMarkdownFile",
				filePath,
			}),
		});

		if (!response.ok) {
			throw new Error(`Failed to delete markdown file: ${response.statusText}`);
		}
	}

	/**
	 * Get relative path from absolute path (for storing in JSON)
	 */
	getRelativePath(absolutePath: string): string {
		// Simple client-side path normalization
		const relativePath = absolutePath.replace(/\\/g, "/");
		return relativePath.startsWith("./") ? relativePath : `./${relativePath}`;
	}

	/**
	 * Validate file path format
	 */
	validateFilePath(filePath: string): boolean {
		// Basic client-side validation
		return filePath.includes("markdown") && filePath.endsWith(".md");
	}
}

// Default instance
export const clientMarkdownService = new ClientMarkdownService();

// Utility functions for common operations
export const generateFilePath = (contentId: string, contentType: ContentType) =>
	clientMarkdownService.generateFilePath(contentId, contentType);

export const createMarkdownFile = (
	contentId: string,
	contentType: ContentType,
	content: string,
) => clientMarkdownService.createMarkdownFile(contentId, contentType, content);

export const updateMarkdownFile = (filePath: string, content: string) =>
	clientMarkdownService.updateMarkdownFile(filePath, content);

export const fileExists = (filePath: string) =>
	clientMarkdownService.fileExists(filePath);

export const getMarkdownContent = (filePath: string) =>
	clientMarkdownService.getMarkdownContent(filePath);

export const deleteMarkdownFile = (filePath: string) =>
	clientMarkdownService.deleteMarkdownFile(filePath);
