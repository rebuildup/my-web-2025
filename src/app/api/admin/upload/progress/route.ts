/**
 * Upload Progress API
 * Provides real-time upload progress tracking
 */

import { type NextRequest, NextResponse } from "next/server";
import { UploadProgressManager } from "@/lib/portfolio/upload-progress-manager";

// Development environment check
function isDevelopment() {
	return process.env.NODE_ENV === "development";
}

// GET method for retrieving upload progress
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
		const operation = searchParams.get("operation");
		const uploadId = searchParams.get("id");

		const progressManager = UploadProgressManager.getInstance();

		switch (operation) {
			case "get": {
				if (!uploadId) {
					return NextResponse.json(
						{ error: "Upload ID is required for get operation" },
						{ status: 400 },
					);
				}

				const progress = progressManager.getProgress(uploadId);
				if (!progress) {
					return NextResponse.json(
						{ error: "Upload progress not found" },
						{ status: 404 },
					);
				}

				return NextResponse.json({
					success: true,
					progress: {
						...progress,
						uploadSpeed: progressManager.getUploadSpeed(uploadId),
						estimatedTimeRemaining:
							progressManager.getEstimatedTimeRemaining(uploadId),
					},
				});
			}

			case "list": {
				const allProgress = progressManager.getAllProgress();
				return NextResponse.json({
					success: true,
					uploads: allProgress.map((progress) => ({
						...progress,
						uploadSpeed: progressManager.getUploadSpeed(progress.id),
						estimatedTimeRemaining: progressManager.getEstimatedTimeRemaining(
							progress.id,
						),
					})),
				});
			}

			case "active": {
				const activeUploads = progressManager.getActiveUploads();
				return NextResponse.json({
					success: true,
					uploads: activeUploads.map((progress) => ({
						...progress,
						uploadSpeed: progressManager.getUploadSpeed(progress.id),
						estimatedTimeRemaining: progressManager.getEstimatedTimeRemaining(
							progress.id,
						),
					})),
				});
			}

			case "stats": {
				const statistics = progressManager.getStatistics();
				return NextResponse.json({
					success: true,
					statistics,
				});
			}

			default:
				return NextResponse.json(
					{ error: "Unsupported operation" },
					{ status: 400 },
				);
		}
	} catch (error) {
		console.error("Error in upload progress API:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to retrieve upload progress",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// DELETE method for cleaning up progress entries
export async function DELETE(request: NextRequest) {
	// Only allow access in development environment
	if (!isDevelopment()) {
		return NextResponse.json(
			{ error: "Admin API is only available in development environment" },
			{ status: 403 },
		);
	}

	try {
		const { searchParams } = new URL(request.url);
		const uploadId = searchParams.get("id");
		const operation = searchParams.get("operation");

		const progressManager = UploadProgressManager.getInstance();

		if (operation === "clear") {
			progressManager.clearAll();
			return NextResponse.json({
				success: true,
				message: "All upload progress cleared",
			});
		}

		if (!uploadId) {
			return NextResponse.json(
				{ error: "Upload ID is required" },
				{ status: 400 },
			);
		}

		const removed = progressManager.removeProgress(uploadId);
		if (!removed) {
			return NextResponse.json(
				{ error: "Upload progress not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Upload progress removed",
		});
	} catch (error) {
		console.error("Error removing upload progress:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to remove upload progress",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
