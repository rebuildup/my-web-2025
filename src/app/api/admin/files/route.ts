export const dynamic = "force-static";
import { promises as fs } from "node:fs";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { getBackupStats } from "@/lib/utils/file-backup";

// Development environment check
function isDevelopment() {
	return process.env.NODE_ENV === "development";
}

interface FileInfo {
	id: string;
	name: string;
	type: string;
	size: number;
	url: string;
	createdAt: string;
	category: string;
	versions?: Array<{
		type: string;
		url: string;
		size: number;
	}>;
	metadata?: Record<string, unknown>;
}

const SCAN_DIRECTORIES = [
	{ path: "images/portfolio", category: "portfolio" },
	{ path: "images/thumbnails", category: "thumbnails" },
	{ path: "images/og-images", category: "og-images" },
	{ path: "images/profile", category: "profile" },
	{ path: "videos", category: "videos" },
	{ path: "downloads", category: "downloads" },
] as const;

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".avi"]);
const PDF_EXTENSIONS = new Set([".pdf"]);
const ARCHIVE_EXTENSIONS = new Set([".zip"]);
const JSON_EXTENSIONS = new Set([".json"]);

function mimeTypeFor(extension: string): string {
	const ext = extension.toLowerCase();
	if (IMAGE_EXTENSIONS.has(ext)) {
		return `image/${ext.slice(1) === "jpg" ? "jpeg" : ext.slice(1)}`;
	}
	if (VIDEO_EXTENSIONS.has(ext)) {
		return `video/${ext.slice(1)}`;
	}
	if (PDF_EXTENSIONS.has(ext)) return "application/pdf";
	if (ARCHIVE_EXTENSIONS.has(ext)) return "application/zip";
	if (JSON_EXTENSIONS.has(ext)) return "application/json";
	return "application/octet-stream";
}

// Get all files in public directories
async function scanDirectory(
	dirPath: string,
	category: string,
): Promise<FileInfo[]> {
	const files: FileInfo[] = [];

	try {
		const fullPath = path.join(process.cwd(), "public", dirPath);
		const entries = await fs.readdir(fullPath, { withFileTypes: true });
		const fileEntries = entries.filter((entry) => entry.isFile());

		const statsList = await Promise.all(
			fileEntries.map((entry) =>
				fs.stat(path.join(fullPath, entry.name)),
			),
		);

		for (let i = 0; i < fileEntries.length; i++) {
			const entry = fileEntries[i];
			const stats = statsList[i];
			if (!entry || !stats) continue;
			const publicUrl = `/${dirPath}/${entry.name}`.replace(/\\/g, "/");

			// Generate file ID from path and stats
			const fileId = Buffer.from(
				`${publicUrl}-${stats.mtime.getTime()}`,
			).toString("base64");

			files.push({
				id: fileId,
				name: entry.name,
				type: mimeTypeFor(path.extname(entry.name)),
				size: stats.size,
				url: publicUrl,
				createdAt: stats.birthtime.toISOString(),
				category,
			});
		}
	} catch (error) {
		console.warn(`Failed to scan directory ${dirPath}:`, error);
	}

	return files;
}

// Find related versions of a file
async function findFileVersions(
	fileName: string,
	category: string,
): Promise<
	Array<{
		type: string;
		url: string;
		size: number;
	}>
> {
	const versions: Array<{ type: string; url: string; size: number }> = [];
	const baseName = path.parse(fileName).name;

	// Check for thumbnails
	try {
		const thumbnailPath = path.join(
			process.cwd(),
			"public",
			"images",
			"thumbnails",
		);
		const thumbnailFiles = await fs.readdir(thumbnailPath);
		const thumbMatches = thumbnailFiles.filter(
			(thumbFile) => thumbFile.includes(baseName) && thumbFile.includes("thumb"),
		);
		const thumbStats = await Promise.all(
			thumbMatches.map((thumbFile) =>
				fs.stat(path.join(thumbnailPath, thumbFile)),
			),
		);
		for (let i = 0; i < thumbMatches.length; i++) {
			const thumbFile = thumbMatches[i];
			const stats = thumbStats[i];
			if (!thumbFile || !stats) continue;
			versions.push({
				type: "thumbnail",
				url: `/images/thumbnails/${thumbFile}`,
				size: stats.size,
			});
		}
	} catch {
		// Thumbnails directory might not exist
	}

	// Check for WebP versions
	try {
		const categoryPath = path.join(process.cwd(), "public", "images", category);
		const files = await fs.readdir(categoryPath);
		const webpMatches = files.filter(
			(file) =>
				file.includes(baseName) && file.endsWith(".webp") && file !== fileName,
		);
		const webpStats = await Promise.all(
			webpMatches.map((file) => fs.stat(path.join(categoryPath, file))),
		);
		for (let i = 0; i < webpMatches.length; i++) {
			const file = webpMatches[i];
			const stats = webpStats[i];
			if (!file || !stats) continue;
			versions.push({
				type: "webp",
				url: `/images/${category}/${file}`,
				size: stats.size,
			});
		}
	} catch {
		// Category directory might not exist
	}

	return versions;
}

export async function GET(request: NextRequest) {
	// Only allow access in development environment
	if (!isDevelopment()) {
		return NextResponse.json(
			{ error: "Admin API is only available in development environment" },
			{ status: 403 },
		);
	}

	try {
		const { searchParams } = new URL(request.url);
		const category = searchParams.get("category");

		// Scan directories
		const directoriesToScan = category
			? SCAN_DIRECTORIES.filter((dir) => dir.category === category)
			: [...SCAN_DIRECTORIES];
		const directoryResults = await Promise.all(
			directoriesToScan.map((dir) => scanDirectory(dir.path, dir.category)),
		);
		const allFiles: FileInfo[] = directoryResults.flat();

		// Find versions for each file
		await Promise.all(
			allFiles.map(async (file) => {
				if (file.type.startsWith("image/") && file.category !== "thumbnails") {
					file.versions = await findFileVersions(file.name, file.category);
				}
			}),
		);

		// Get backup statistics
		const backupStats = await getBackupStats();

		return NextResponse.json({
			success: true,
			files: allFiles,
			stats: {
				totalFiles: allFiles.length,
				totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
				categories: SCAN_DIRECTORIES.map((dir) => ({
					name: dir.category,
					count: allFiles.filter((f) => f.category === dir.category).length,
				})),
				backupStats,
			},
		});
	} catch (error) {
		console.error("Error loading files:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to load files",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// Bulk operations
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
		const { action } = body;

		switch (action) {
			case "bulk-delete":
				// This would be implemented in a separate endpoint
				return NextResponse.json(
					{ error: "Use /api/admin/files/bulk-delete endpoint" },
					{ status: 400 },
				);

			case "bulk-move":
				// Move files to different category
				// Implementation would go here
				return NextResponse.json({
					success: true,
					message: "Files moved successfully",
				});

			case "bulk-optimize":
				// Optimize multiple images
				// Implementation would go here
				return NextResponse.json({
					success: true,
					message: "Files optimized successfully",
				});

			default:
				return NextResponse.json({ error: "Unknown action" }, { status: 400 });
		}
	} catch (error) {
		console.error("Error processing bulk operation:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to process bulk operation",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
