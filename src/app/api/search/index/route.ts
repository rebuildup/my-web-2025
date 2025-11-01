import { promises as fs } from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { clearSearchCache, updateSearchIndex } from "@/lib/search";
import { forceRebuildSearchIndex } from "@/lib/search/update-index";

/**
 * GET /api/search/index - Get search index status
 */
export async function GET() {
	try {
		const indexPath = path.join(
			process.cwd(),
			"public/data/cache/search-index.json",
		);

		let indexExists = false;
		let indexSize = 0;
		let lastModified = null;

		try {
			const stats = await fs.stat(indexPath);
			indexExists = true;
			indexSize = stats.size;
			lastModified = stats.mtime.toISOString();
		} catch {
			// Index doesn't exist
		}

		return NextResponse.json({
			indexExists,
			indexSize,
			lastModified,
			status: indexExists ? "ready" : "missing",
		});
	} catch (error) {
		console.error("Search index status error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}

/**
 * POST /api/search/index - Update search index
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { action = "update" } = body;

		let success = false;

		if (action === "rebuild") {
			success = await forceRebuildSearchIndex();
		} else if (action === "clear") {
			clearSearchCache();
			success = true;
		} else {
			success = await updateSearchIndex();
		}

		if (success) {
			return NextResponse.json({
				success: true,
				action,
				message: `Search index ${action} completed successfully`,
				timestamp: new Date().toISOString(),
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					action,
					error: `Failed to ${action} search index`,
				},
				{ status: 500 },
			);
		}
	} catch (error) {
		console.error("Search index update error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
