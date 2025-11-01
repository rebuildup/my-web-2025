/**
 * Individual Tag Management API Endpoints
 * Provides operations for specific tags
 */

import { type NextRequest, NextResponse } from "next/server";
import { portfolioTagManager } from "@/lib/portfolio/tag-management";

interface RouteParams {
	params: {
		name: string;
	};
}

// PUT /api/admin/tags/[name] - Update tag usage
export async function PUT(_request: NextRequest, { params }: RouteParams) {
	try {
		const resolvedParams = await params;
		const tagName = decodeURIComponent(resolvedParams.name);

		if (!tagName || typeof tagName !== "string") {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid tag name",
					message: "Tag name must be a non-empty string",
				},
				{ status: 400 },
			);
		}

		await portfolioTagManager.updateTagUsage(tagName);

		// Get updated tag info
		const tags = await portfolioTagManager.searchTags(tagName);
		const updatedTag = tags.find(
			(tag) => tag.name.toLowerCase() === tagName.toLowerCase(),
		);

		return NextResponse.json({
			success: true,
			data: updatedTag,
			message: "Tag usage updated successfully",
		});
	} catch (error) {
		console.error("Error updating tag usage:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to update tag usage",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// DELETE /api/admin/tags/[name] - Delete specific tag
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
	try {
		const resolvedParams = await params;
		const tagName = decodeURIComponent(resolvedParams.name);

		if (!tagName || typeof tagName !== "string") {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid tag name",
					message: "Tag name must be a non-empty string",
				},
				{ status: 400 },
			);
		}

		const deleted = await portfolioTagManager.deleteTag(tagName);

		if (deleted) {
			return NextResponse.json({
				success: true,
				message: `Tag "${tagName}" deleted successfully`,
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					error: "Tag not found",
					message: `Tag "${tagName}" does not exist`,
				},
				{ status: 404 },
			);
		}
	} catch (error) {
		console.error("Error deleting tag:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to delete tag",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
