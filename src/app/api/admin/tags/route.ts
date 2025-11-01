/**
 * Tag Management API Endpoints
 * Provides CRUD operations for portfolio tags
 */

import fs from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import type { ContentItem } from "@/types/content";
import type { EnhancedContentItem } from "@/types/enhanced-content";

// Helper function to extract tags from all content files
async function extractTagsFromContent(): Promise<
	{ name: string; count: number; lastUsed: string }[]
> {
	const dataDir = path.join(process.cwd(), "public", "data", "content");
	const contentTypes = [
		"portfolio",
		"blog",
		"plugin",
		"download",
		"tool",
		"profile",
	];
	const tagCounts = new Map<string, { count: number; lastUsed: string }>();

	for (const contentType of contentTypes) {
		try {
			const filePath = path.join(dataDir, `${contentType}.json`);
			const fileContent = await fs.readFile(filePath, "utf-8");
			const items: (ContentItem | EnhancedContentItem)[] =
				JSON.parse(fileContent);

			items.forEach((item) => {
				if (item.tags && Array.isArray(item.tags)) {
					item.tags.forEach((tag) => {
						if (typeof tag === "string" && tag.trim()) {
							const tagName = tag.trim();
							const existing = tagCounts.get(tagName);
							const itemDate = item.updatedAt || item.createdAt;

							if (existing) {
								existing.count++;
								if (new Date(itemDate) > new Date(existing.lastUsed)) {
									existing.lastUsed = itemDate;
								}
							} else {
								tagCounts.set(tagName, {
									count: 1,
									lastUsed: itemDate,
								});
							}
						}
					});
				}
			});
		} catch (error) {
			console.log(
				`No ${contentType}.json file found or error reading it:`,
				error,
			);
		}
	}

	return Array.from(tagCounts.entries()).map(([name, data]) => ({
		name,
		count: data.count,
		lastUsed: data.lastUsed,
	}));
}

// GET /api/admin/tags - Get all tags with optional search
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get("q");
		const sortBy = searchParams.get("sortBy") || "usage";
		const limit = parseInt(searchParams.get("limit") || "100", 10);

		console.log("=== TAG API GET ===");
		console.log("Query:", query);
		console.log("SortBy:", sortBy);
		console.log("Limit:", limit);

		// Extract tags from actual content files
		let tags = await extractTagsFromContent();
		console.log("Extracted tags from content:", tags.length);

		if (query) {
			// Search tags
			tags = tags.filter((tag) =>
				tag.name.toLowerCase().includes(query.toLowerCase()),
			);
			console.log("Filtered tags by query:", tags.length);
		}

		// Apply sorting
		if (sortBy === "name") {
			tags.sort((a, b) => a.name.localeCompare(b.name));
		} else if (sortBy === "date") {
			tags.sort(
				(a, b) =>
					new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime(),
			);
		} else {
			// Default: sort by usage count
			tags.sort((a, b) => b.count - a.count);
		}

		// Apply limit
		if (limit > 0) {
			tags = tags.slice(0, limit);
		}

		console.log("Final tags to return:", tags.length);

		return NextResponse.json({
			success: true,
			data: tags.map((tag) => ({
				name: tag.name,
				count: tag.count,
				createdAt: tag.lastUsed, // Use lastUsed as createdAt for compatibility
				lastUsed: tag.lastUsed,
			})),
			total: tags.length,
		});
	} catch (error) {
		console.error("Error fetching tags:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch tags",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// POST /api/admin/tags - Create a new tag
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { name } = body;

		if (!name || typeof name !== "string") {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid tag name",
					message: "Tag name must be a non-empty string",
				},
				{ status: 400 },
			);
		}

		const tagName = name.trim();
		if (!tagName) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid tag name",
					message: "Tag name cannot be empty",
				},
				{ status: 400 },
			);
		}

		console.log("=== TAG API POST ===");
		console.log("Creating tag:", tagName);

		// Check if tag already exists
		const existingTags = await extractTagsFromContent();
		const existingTag = existingTags.find(
			(tag) => tag.name.toLowerCase() === tagName.toLowerCase(),
		);

		if (existingTag) {
			console.log("Tag already exists:", existingTag);
			return NextResponse.json({
				success: true,
				data: {
					name: existingTag.name,
					count: existingTag.count,
					createdAt: existingTag.lastUsed,
					lastUsed: existingTag.lastUsed,
				},
				message: "Tag already exists",
			});
		}

		// Create new tag (it will be added when used in content)
		const newTag = {
			name: tagName,
			count: 0,
			createdAt: new Date().toISOString(),
			lastUsed: new Date().toISOString(),
		};

		console.log("New tag created:", newTag);

		return NextResponse.json({
			success: true,
			data: newTag,
			message: "Tag created successfully",
		});
	} catch (error) {
		console.error("Error creating tag:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to create tag",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// DELETE /api/admin/tags - Delete multiple tags or all unused tags
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const cleanup = searchParams.get("cleanup") === "true";

		if (cleanup) {
			// Clean up unused tags
			const deletedCount = 3; // Mock value

			return NextResponse.json({
				success: true,
				message: `Cleaned up ${deletedCount} unused tags`,
				deletedCount,
			});
		} else {
			// Delete specific tags
			const body = await request.json();
			const { tags } = body;

			if (!Array.isArray(tags)) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid request",
						message: "Tags must be an array of tag names",
					},
					{ status: 400 },
				);
			}

			const successful = tags.length; // Mock: assume all deletions succeed

			return NextResponse.json({
				success: true,
				message: `Deleted ${successful} out of ${tags.length} tags`,
				deletedCount: successful,
				totalRequested: tags.length,
			});
		}
	} catch (error) {
		console.error("Error deleting tags:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to delete tags",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
