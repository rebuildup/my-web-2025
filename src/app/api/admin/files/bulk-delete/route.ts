import { promises as fs } from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { createFileBackup } from "@/lib/utils/file-backup";

// Development environment check
function isDevelopment() {
	return process.env.NODE_ENV === "development";
}

// Decode file ID to get file path
function decodeFileId(fileId: string): string | null {
	try {
		const decoded = Buffer.from(fileId, "base64").toString("utf-8");
		const [filePath] = decoded.split("-");
		return filePath;
	} catch {
		return null;
	}
}

// Get file info from path
async function getFileInfo(filePath: string) {
	const fullPath = path.join(
		process.cwd(),
		"public",
		filePath.startsWith("/") ? filePath.slice(1) : filePath,
	);

	try {
		const stats = await fs.stat(fullPath);
		return {
			exists: true,
			size: stats.size,
			fullPath,
		};
	} catch {
		return { exists: false, fullPath };
	}
}

export async function POST(request: NextRequest) {
	// Only allow access in development environment
	if (!isDevelopment()) {
		return NextResponse.json(
			{ error: "Admin API is only available in development environment" },
			{ status: 403 },
		);
	}

	try {
		const body = await request.json();
		const { fileIds } = body;

		if (!Array.isArray(fileIds) || fileIds.length === 0) {
			return NextResponse.json(
				{ error: "File IDs array is required" },
				{ status: 400 },
			);
		}

		const results = {
			deleted: [] as string[],
			failed: [] as { id: string; error: string }[],
			totalSize: 0,
		};

		for (const fileId of fileIds) {
			try {
				const filePath = decodeFileId(fileId);

				if (!filePath) {
					results.failed.push({ id: fileId, error: "Invalid file ID" });
					continue;
				}

				const fileInfo = await getFileInfo(filePath);

				if (!fileInfo.exists) {
					results.failed.push({ id: fileId, error: "File not found" });
					continue;
				}

				// Create backup before deletion
				await createFileBackup(fileInfo.fullPath, {
					action: "bulk_delete",
					timestamp: new Date().toISOString(),
					batchId: `bulk-${Date.now()}`,
				});

				// Delete the file
				await fs.unlink(fileInfo.fullPath);

				// Try to delete related files (thumbnails, WebP versions, etc.)
				const fileName = path.basename(filePath);
				const baseName = path.parse(fileName).name;

				// Delete thumbnail if exists
				const thumbnailPath = path.join(
					process.cwd(),
					"public",
					"images",
					"thumbnails",
					`${baseName}-thumb.jpg`,
				);
				try {
					await fs.unlink(thumbnailPath);
				} catch {
					// Thumbnail might not exist
				}

				// Delete WebP version if exists
				const webpPath = path.join(
					path.dirname(fileInfo.fullPath),
					`${baseName}.webp`,
				);
				try {
					await fs.unlink(webpPath);
				} catch {
					// WebP version might not exist
				}

				results.deleted.push(fileId);
				results.totalSize += fileInfo.size || 0;
			} catch (error) {
				results.failed.push({
					id: fileId,
					error: error instanceof Error ? error.message : "Unknown error",
				});
			}
		}

		return NextResponse.json({
			success: true,
			message: `Successfully deleted ${results.deleted.length} files`,
			results,
		});
	} catch (error) {
		console.error("Error in bulk delete:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to delete files",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
