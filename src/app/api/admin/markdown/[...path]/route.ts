export const dynamic = "force-static";

import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { markdownFileManager } from "@/lib/portfolio/markdown-file-manager";

export async function generateStaticParams() {
	return [{ path: ["placeholder"] }];
}

// Development environment check
function isDevelopment() {
	return process.env.NODE_ENV === "development";
}

// Extract file path from URL parameters
function getFilePathFromParams(path: string[]): string {
	const baseDir = join(
		process.cwd(),
		"public",
		"data",
		"content",
		"markdown",
		"portfolio",
	);
	const relativePath = path.join("/");

	// Ensure .md extension
	const filePath = relativePath.endsWith(".md")
		? join(baseDir, relativePath)
		: join(baseDir, `${relativePath}.md`);

	return filePath;
}

/**
 * GET /api/admin/markdown/[...path] - Read markdown file
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	if (!isDevelopment()) {
		return NextResponse.json(
			{ error: "Access denied. Admin endpoints are development-only." },
			{ status: 403 },
		);
	}

	try {
		const { path } = await params;
		const filePath = getFilePathFromParams(path);

		// Read markdown file
		const content = await markdownFileManager.readMarkdownFile(filePath);

		if (content === null) {
			return NextResponse.json(
				{ error: "Markdown file not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: {
				path: path.join("/"),
				content,
			},
		});
	} catch (error) {
		console.error("Error reading markdown file:", error);
		return NextResponse.json(
			{
				error: "Failed to read markdown file",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

/**
 * PUT /api/admin/markdown/[...path] - Update markdown file
 */
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	if (!isDevelopment()) {
		return NextResponse.json(
			{ error: "Access denied. Admin endpoints are development-only." },
			{ status: 403 },
		);
	}

	try {
		const { path } = await params;
		const body = await request.json();
		const { content } = body;

		if (typeof content !== "string") {
			return NextResponse.json(
				{ error: "Invalid content format. Content must be a string." },
				{ status: 400 },
			);
		}

		const filePath = getFilePathFromParams(path);

		// Save markdown file
		await markdownFileManager.updateMarkdownFile(
			filePath,
			content,
		);

		return NextResponse.json({
			success: true,
			message: "Markdown file updated successfully",
			data: {
				path: path.join("/"),
			},
		});
	} catch (error) {
		console.error("Error updating markdown file:", error);
		return NextResponse.json(
			{
				error: "Failed to update markdown file",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

/**
 * DELETE /api/admin/markdown/[...path] - Delete markdown file
 */
export async function DELETE(
	_request: NextRequest,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	if (!isDevelopment()) {
		return NextResponse.json(
			{ error: "Access denied. Admin endpoints are development-only." },
			{ status: 403 },
		);
	}

	try {
		const { path } = await params;
		const filePath = getFilePathFromParams(path);

		// Delete markdown file
		await markdownFileManager.deleteMarkdownFile(filePath);

		return NextResponse.json({
			success: true,
			message: "Markdown file deleted successfully",
			data: {
				path: path.join("/"),
			},
		});
	} catch (error) {
		console.error("Error deleting markdown file:", error);
		return NextResponse.json(
			{
				error: "Failed to delete markdown file",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
