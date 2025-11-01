/**
 * Date Management API Endpoints
 * Provides CRUD operations for portfolio item manual dates
 */

import { type NextRequest, NextResponse } from "next/server";
import { portfolioDateManager } from "@/lib/portfolio/date-management";

// GET /api/admin/dates - Get all manual dates or specific item date
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const itemId = searchParams.get("itemId");

		if (itemId) {
			// Get manual date for specific item
			const manualDate = await portfolioDateManager.getManualDate(itemId);
			const hasManualDate = await portfolioDateManager.hasManualDate(itemId);

			return NextResponse.json({
				success: true,
				data: {
					itemId,
					manualDate,
					hasManualDate,
				},
			});
		} else {
			// Get all manual dates
			const allDates = await portfolioDateManager.getAllManualDates();
			return NextResponse.json({
				success: true,
				data: allDates,
				total: Object.keys(allDates).length,
			});
		}
	} catch (error) {
		console.error("Error fetching dates:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch dates",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// POST /api/admin/dates - Set manual date for an item
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { itemId, date } = body;

		if (!itemId || typeof itemId !== "string") {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid item ID",
					message: "Item ID must be a non-empty string",
				},
				{ status: 400 },
			);
		}

		if (!date || typeof date !== "string") {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid date",
					message: "Date must be a non-empty string in ISO 8601 format",
				},
				{ status: 400 },
			);
		}

		// Validate date using the date manager
		if (!portfolioDateManager.validateDate(date)) {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid date format",
					message: "Date must be in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
				},
				{ status: 400 },
			);
		}

		await portfolioDateManager.setManualDate(itemId, date);

		return NextResponse.json({
			success: true,
			message: `Manual date set for item ${itemId}`,
			data: {
				itemId,
				date,
			},
		});
	} catch (error) {
		console.error("Error setting manual date:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to set manual date",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// PUT /api/admin/dates - Bulk update manual dates
export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const { dates } = body;

		if (!dates || typeof dates !== "object") {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid dates object",
					message:
						"Dates must be an object with itemId as keys and ISO dates as values",
				},
				{ status: 400 },
			);
		}

		// Validate all dates first
		for (const [itemId, date] of Object.entries(dates)) {
			if (!itemId || typeof itemId !== "string") {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid item ID",
						message: `Item ID "${itemId}" must be a non-empty string`,
					},
					{ status: 400 },
				);
			}

			if (!date || typeof date !== "string") {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid date",
						message: `Date for item "${itemId}" must be a non-empty string`,
					},
					{ status: 400 },
				);
			}

			if (!portfolioDateManager.validateDate(date)) {
				return NextResponse.json(
					{
						success: false,
						error: "Invalid date format",
						message: `Date for item "${itemId}" must be in ISO 8601 format`,
					},
					{ status: 400 },
				);
			}
		}

		// Update all dates using the date manager
		await portfolioDateManager.bulkSetManualDates(dates);

		return NextResponse.json({
			success: true,
			message: `Bulk updated manual dates for ${Object.keys(dates).length} items`,
			data: {
				updatedCount: Object.keys(dates).length,
				items: Object.keys(dates),
			},
		});
	} catch (error) {
		console.error("Error bulk updating manual dates:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to bulk update manual dates",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}

// DELETE /api/admin/dates - Remove manual date for an item
export async function DELETE(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const itemId = searchParams.get("itemId");

		if (!itemId || typeof itemId !== "string") {
			return NextResponse.json(
				{
					success: false,
					error: "Invalid item ID",
					message: "Item ID must be provided as a query parameter",
				},
				{ status: 400 },
			);
		}

		await portfolioDateManager.removeManualDate(itemId);

		return NextResponse.json({
			success: true,
			message: `Manual date removed for item ${itemId}`,
			data: {
				itemId,
			},
		});
	} catch (error) {
		console.error("Error removing manual date:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to remove manual date",
				message: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
