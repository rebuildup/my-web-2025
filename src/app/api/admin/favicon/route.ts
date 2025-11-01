/**
 * Favicon Management API Route
 * Handles favicon upload, management, and backup operations
 * Task 9.3.1 - Favicon management API
 */

import type { NextRequest } from "next/server";
import { faviconManager } from "@/lib/admin/favicon-manager";
import { adminErrorHandler, adminUtils } from "@/lib/admin/utils";

/**
 * Upload favicon
 * POST /api/admin/favicon
 */
export async function POST(request: NextRequest): Promise<Response> {
	try {
		// Validate admin access
		const validation = adminUtils.validateAdminRequest(request);
		if (!validation.valid) {
			return adminUtils.createAdminResponse(
				{ error: validation.error },
				403,
			) as Response;
		}

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const format = formData.get("format") as "ico" | "png" | "svg";

		if (!file) {
			return adminUtils.createAdminResponse(
				{ error: "File is required" },
				400,
			) as Response;
		}

		if (!format || !["ico", "png", "svg"].includes(format)) {
			return adminUtils.createAdminResponse(
				{ error: "Valid format (ico, png, svg) is required" },
				400,
			) as Response;
		}

		// Upload favicon
		const result = await faviconManager.uploadFavicon(file, format);

		return adminUtils.createAdminResponse({
			success: result.success,
			faviconInfo: result.faviconInfo,
			errors: result.errors,
			warnings: result.warnings,
		}) as Response;
	} catch (error) {
		const errorResponse = adminErrorHandler.handle(error);
		return adminUtils.createAdminResponse(
			errorResponse,
			errorResponse.statusCode,
		) as Response;
	}
}

/**
 * Get favicon status or manifest
 * GET /api/admin/favicon
 */
export async function GET(request: NextRequest): Promise<Response> {
	try {
		// Validate admin access
		const validation = adminUtils.validateAdminRequest(request);
		if (!validation.valid) {
			return adminUtils.createAdminResponse(
				{ error: validation.error },
				403,
			) as Response;
		}

		const { searchParams } = new URL(request.url);
		const action = searchParams.get("action");

		switch (action) {
			case "status": {
				const status = await faviconManager.getFaviconStatus();
				return adminUtils.createAdminResponse({ status }) as Response;
			}

			case "manifest": {
				const manifest = await faviconManager.generateFaviconManifest();
				return adminUtils.createAdminResponse({ manifest }) as Response;
			}

			case "backups": {
				const backups = await faviconManager.listFaviconBackups();
				return adminUtils.createAdminResponse({ backups }) as Response;
			}

			default: {
				// Default to status
				const defaultStatus = await faviconManager.getFaviconStatus();
				return adminUtils.createAdminResponse({
					status: defaultStatus,
				}) as Response;
			}
		}
	} catch (error) {
		const errorResponse = adminErrorHandler.handle(error);
		return adminUtils.createAdminResponse(
			errorResponse,
			errorResponse.statusCode,
		) as Response;
	}
}

/**
 * Restore favicon from backup
 * PUT /api/admin/favicon
 */
export async function PUT(request: NextRequest): Promise<Response> {
	try {
		// Validate admin access
		const validation = adminUtils.validateAdminRequest(request);
		if (!validation.valid) {
			return adminUtils.createAdminResponse(
				{ error: validation.error },
				403,
			) as Response;
		}

		const body = await request.json();
		const { action, format, backupTimestamp } = body;

		if (action === "restore") {
			if (!format || !backupTimestamp) {
				return adminUtils.createAdminResponse(
					{ error: "Format and backupTimestamp are required for restore" },
					400,
				) as Response;
			}

			const success = await faviconManager.restoreFavicon(
				format,
				backupTimestamp,
			);
			return adminUtils.createAdminResponse({
				success,
				message: success
					? "Favicon restored successfully"
					: "Failed to restore favicon",
			}) as Response;
		}

		if (action === "cleanup") {
			const deletedCount = await faviconManager.cleanOldBackups();
			return adminUtils.createAdminResponse({
				success: true,
				deletedCount,
				message: `Cleaned up ${deletedCount} old backup files`,
			}) as Response;
		}

		return adminUtils.createAdminResponse(
			{ error: "Invalid action. Supported actions: restore, cleanup" },
			400,
		) as Response;
	} catch (error) {
		const errorResponse = adminErrorHandler.handle(error);
		return adminUtils.createAdminResponse(
			errorResponse,
			errorResponse.statusCode,
		) as Response;
	}
}

/**
 * Delete favicon
 * DELETE /api/admin/favicon
 */
export async function DELETE(request: NextRequest): Promise<Response> {
	try {
		// Validate admin access
		const validation = adminUtils.validateAdminRequest(request);
		if (!validation.valid) {
			return adminUtils.createAdminResponse(
				{ error: validation.error },
				403,
			) as Response;
		}

		const { searchParams } = new URL(request.url);
		const format = searchParams.get("format") as "ico" | "png" | "svg";

		if (!format || !["ico", "png", "svg"].includes(format)) {
			return adminUtils.createAdminResponse(
				{ error: "Valid format (ico, png, svg) is required" },
				400,
			) as Response;
		}

		const success = await faviconManager.deleteFavicon(format);

		return adminUtils.createAdminResponse({
			success,
			message: success
				? "Favicon deleted successfully"
				: "Failed to delete favicon",
		}) as Response;
	} catch (error) {
		const errorResponse = adminErrorHandler.handle(error);
		return adminUtils.createAdminResponse(
			errorResponse,
			errorResponse.statusCode,
		) as Response;
	}
}
