export const dynamic = "force-static";

import { promises as fs } from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import {
	createFileBackup,
	getFileVersions,
	restoreFileFromBackup,
} from "@/lib/utils/file-backup";

export async function generateStaticParams() {
	return [{ fileId: "placeholder" }];
}

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
		"data",
		"content",
		filePath,
	);
	try {
		const stats = await fs.stat(fullPath);
		return {
			exists: true,
			size: stats.size,
			modified: stats.mtime.toISOString(),
			fullPath,
		};
	} catch {
		return { exists: false, size: 0, modified: null, fullPath };
	}
}

/**
 * GET /api/admin/files/[fileId] - Get file info and versions
 */
export async function GET(
	_request: NextRequest,
	{ params }: { params: { fileId: string } },
) {
	if (!isDevelopment()) {
		return NextResponse.json(
			{ error: "Access denied. Admin endpoints are development-only." },
			{ status: 403 },
		);
	}

	try {
		const filePath = decodeFileId(params.fileId);
		if (!filePath) {
			return NextResponse.json(
				{ error: "Invalid file ID format" },
				{ status: 400 },
			);
		}

		const info = await getFileInfo(filePath);
		if (!info.exists) {
			return NextResponse.json(
				{ error: "File not found" },
				{ status: 404 },
			);
		}

		const versions = await getFileVersions(filePath);

		return NextResponse.json({
			success: true,
			data: {
				fileId: params.fileId,
				filePath,
				size: info.size,
				modified: info.modified,
				versions,
			},
		});
	} catch (error) {
		console.error("Error getting file info:", error);
		return NextResponse.json(
			{
				error: "Failed to get file info",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

/**
 * POST /api/admin/files/[fileId] - Backup or restore file
 */
export async function POST(
	request: NextRequest,
	{ params }: { params: { fileId: string } },
) {
	if (!isDevelopment()) {
		return NextResponse.json(
			{ error: "Access denied. Admin endpoints are development-only." },
			{ status: 403 },
		);
	}

	try {
		const filePath = decodeFileId(params.fileId);
		if (!filePath) {
			return NextResponse.json(
				{ error: "Invalid file ID format" },
				{ status: 400 },
			);
		}

		const body = await request.json();
		const { action, versionId } = body;

		if (action === "backup") {
			const version = await createFileBackup(filePath);
			return NextResponse.json({
				success: true,
				message: "Backup created successfully",
				data: { backupPath: version.backupPath, versionId: version.id },
			});
		}

		if (action === "restore") {
			if (!versionId) {
				return NextResponse.json(
					{ error: "Version ID is required for restore action" },
					{ status: 400 },
				);
			}

			await restoreFileFromBackup(versionId, filePath);
			return NextResponse.json({
				success: true,
				message: "File restored successfully",
			});
		}

		return NextResponse.json(
			{ error: "Invalid action. Supported actions: backup, restore" },
			{ status: 400 },
		);
	} catch (error) {
		console.error("Error in file backup/restore:", error);
		return NextResponse.json(
			{
				error: "Failed to process request",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
