/**
 * Integration utilities for markdown file management with portfolio data
 * Handles conversion between inline content and external markdown files
 */

import type { ContentItem } from "@/types";
import {
	type MarkdownFileManagerImpl,
	markdownFileManager,
} from "./markdown-file-manager";

/**
 * Enhanced ContentItem with markdown file support
 */
export interface EnhancedContentItemWithMarkdown
	extends Omit<ContentItem, "content"> {
	content?: string; // Inline content (for backward compatibility)
	markdownPath?: string; // Path to external markdown file
	markdownContent?: string; // Cached markdown content
	useExternalMarkdown?: boolean; // Flag to indicate if external markdown should be used
}

/**
 * Markdown integration service
 */
export class MarkdownIntegrationService {
	constructor(
		private markdownManager: MarkdownFileManagerImpl = markdownFileManager,
	) {}

	/**
	 * Convert inline content to external markdown file
	 */
	async convertToExternalMarkdown(
		item: ContentItem,
	): Promise<EnhancedContentItemWithMarkdown> {
		if (!item.content || item.content.trim().length === 0) {
			return {
				...item,
				useExternalMarkdown: false,
			};
		}

		try {
			// Create markdown file
			const markdownPath = await this.markdownManager.createMarkdownFile(
				item.id,
				item.content,
			);

			return {
				...item,
				content: undefined, // Remove inline content
				markdownPath,
				markdownContent: item.content, // Cache the content
				useExternalMarkdown: true,
			};
		} catch (error) {
			console.warn(
				`Failed to convert content to markdown file for item ${item.id}:`,
				error,
			);

			// Fallback to inline content
			return {
				...item,
				useExternalMarkdown: false,
			};
		}
	}

	/**
	 * Convert external markdown file back to inline content
	 */
	async convertToInlineContent(
		item: EnhancedContentItemWithMarkdown,
	): Promise<ContentItem> {
		if (!item.markdownPath || !item.useExternalMarkdown) {
			return {
				...item,
				content: item.content || item.markdownContent || "",
			};
		}

		try {
			// Read markdown content
			const content = await this.markdownManager.readMarkdownFile(
				item.markdownPath,
			);

			return {
				...item,
				content,
				// Remove markdown-specific fields
				markdownPath: undefined,
				markdownContent: undefined,
				useExternalMarkdown: undefined,
			} as ContentItem;
		} catch (error) {
			console.warn(`Failed to read markdown file for item ${item.id}:`, error);

			// Fallback to cached content or empty string
			return {
				...item,
				content: item.markdownContent || "",
				markdownPath: undefined,
				markdownContent: undefined,
				useExternalMarkdown: undefined,
			} as ContentItem;
		}
	}

	/**
	 * Get effective content for an item (from markdown file or inline)
	 */
	async getEffectiveContent(
		item: EnhancedContentItemWithMarkdown,
	): Promise<string> {
		if (item.useExternalMarkdown && item.markdownPath) {
			try {
				return await this.markdownManager.readMarkdownFile(item.markdownPath);
			} catch (error) {
				console.warn(
					`Failed to read markdown file for item ${item.id}:`,
					error,
				);
				// Fallback to cached content
				return item.markdownContent || item.content || "";
			}
		}

		return item.content || item.markdownContent || "";
	}

	/**
	 * Update content for an item (either inline or external markdown)
	 */
	async updateContent(
		item: EnhancedContentItemWithMarkdown,
		newContent: string,
	): Promise<EnhancedContentItemWithMarkdown> {
		if (item.useExternalMarkdown && item.markdownPath) {
			try {
				// Update external markdown file
				await this.markdownManager.updateMarkdownFile(
					item.markdownPath,
					newContent,
				);

				return {
					...item,
					markdownContent: newContent, // Update cache
				};
			} catch (error) {
				console.warn(
					`Failed to update markdown file for item ${item.id}:`,
					error,
				);

				// Fallback to inline content
				return {
					...item,
					content: newContent,
					useExternalMarkdown: false,
					markdownPath: undefined,
					markdownContent: undefined,
				};
			}
		} else {
			// Update inline content
			return {
				...item,
				content: newContent,
				markdownContent: newContent, // Keep cache in sync
			};
		}
	}

	/**
	 * Delete markdown file for an item
	 */
	async deleteMarkdownFile(
		item: EnhancedContentItemWithMarkdown,
	): Promise<void> {
		if (item.markdownPath && item.useExternalMarkdown) {
			try {
				await this.markdownManager.deleteMarkdownFile(item.markdownPath);
			} catch (error) {
				console.warn(
					`Failed to delete markdown file for item ${item.id}:`,
					error,
				);
				// Don't throw error, as the item can still exist without the markdown file
			}
		}
	}

	/**
	 * Migrate a batch of items to use external markdown files
	 */
	async migrateBatchToExternalMarkdown(items: ContentItem[]): Promise<{
		successful: EnhancedContentItemWithMarkdown[];
		failed: { item: ContentItem; error: string }[];
	}> {
		const successful: EnhancedContentItemWithMarkdown[] = [];
		const failed: { item: ContentItem; error: string }[] = [];

		for (const item of items) {
			try {
				const converted = await this.convertToExternalMarkdown(item);
				successful.push(converted);
			} catch (error) {
				failed.push({
					item,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		return { successful, failed };
	}

	/**
	 * Validate markdown file integrity for an item
	 */
	async validateMarkdownIntegrity(
		item: EnhancedContentItemWithMarkdown,
	): Promise<{
		valid: boolean;
		issues: string[];
		suggestions: string[];
	}> {
		const issues: string[] = [];
		const suggestions: string[] = [];

		if (item.useExternalMarkdown) {
			if (!item.markdownPath) {
				issues.push(
					"Item is marked to use external markdown but no path is specified",
				);
				suggestions.push("Set markdownPath or disable useExternalMarkdown");
			} else {
				// Validate path
				if (!this.markdownManager.validateMarkdownPath(item.markdownPath)) {
					issues.push("Invalid markdown file path");
					suggestions.push(
						"Update markdownPath to a valid path within the allowed directory",
					);
				} else {
					// Check if file exists and is readable
					try {
						await this.markdownManager.readMarkdownFile(item.markdownPath);
					} catch {
						issues.push("Markdown file cannot be read");
						suggestions.push(
							"Check if file exists and has correct permissions",
						);
					}
				}
			}

			// Check for content consistency
			if (
				item.content &&
				item.markdownContent &&
				item.content !== item.markdownContent
			) {
				issues.push(
					"Inline content and cached markdown content are inconsistent",
				);
				suggestions.push("Update cached content or remove inline content");
			}
		} else {
			// For inline content items
			if (item.markdownPath) {
				issues.push(
					"Item has markdown path but is not marked to use external markdown",
				);
				suggestions.push("Enable useExternalMarkdown or remove markdownPath");
			}

			if (!item.content && !item.markdownContent) {
				issues.push("Item has no content");
				suggestions.push("Add content or convert to external markdown");
			}
		}

		return {
			valid: issues.length === 0,
			issues,
			suggestions,
		};
	}

	/**
	 * Get markdown file statistics
	 */
	async getMarkdownStatistics(): Promise<{
		totalFiles: number;
		totalSize: number;
		averageSize: number;
		oldestFile: { path: string; created: Date } | null;
		newestFile: { path: string; created: Date } | null;
	}> {
		try {
			const files = await this.markdownManager.listMarkdownFiles();

			if (files.length === 0) {
				return {
					totalFiles: 0,
					totalSize: 0,
					averageSize: 0,
					oldestFile: null,
					newestFile: null,
				};
			}

			let totalSize = 0;
			let oldestFile: { path: string; created: Date } | null = null;
			let newestFile: { path: string; created: Date } | null = null;

			for (const filePath of files) {
				try {
					const metadata =
						await this.markdownManager.getMarkdownFileMetadata(filePath);
					totalSize += metadata.size;

					if (!oldestFile || metadata.created < oldestFile.created) {
						oldestFile = { path: filePath, created: metadata.created };
					}

					if (!newestFile || metadata.created > newestFile.created) {
						newestFile = { path: filePath, created: metadata.created };
					}
				} catch {
					console.warn(`Failed to get metadata for ${filePath}`);
				}
			}

			return {
				totalFiles: files.length,
				totalSize,
				averageSize: Math.round(totalSize / files.length),
				oldestFile,
				newestFile,
			};
		} catch (error) {
			console.error("Failed to get markdown statistics:", error);
			return {
				totalFiles: 0,
				totalSize: 0,
				averageSize: 0,
				oldestFile: null,
				newestFile: null,
			};
		}
	}
}

/**
 * Default instance of markdown integration service
 */
export const markdownIntegrationService = new MarkdownIntegrationService();
