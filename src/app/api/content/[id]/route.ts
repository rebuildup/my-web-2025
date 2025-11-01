/**
 * Content by ID API Route
 * Handles requests for specific content items
 */

import { type NextRequest, NextResponse } from "next/server";
import { loadAllContent } from "@/lib/data";

export async function GET(
	_request: NextRequest,
	{ params }: { params: { id: string } },
) {
	try {
		const { id } = params;
		const contentByType = await loadAllContent();
		const item =
			Object.values(contentByType)
				.flat()
				.find((entry) => entry.id === id) || null;

		if (!item) {
			return NextResponse.json(
				{ success: false, error: "Content not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: item,
		});
	} catch (error) {
		console.error("Content by ID API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch content",
			},
			{ status: 500 },
		);
	}
}

export async function PUT() {
	return NextResponse.json(
		{
			success: false,
			error: "Use /api/cms/contents for content updates",
		},
		{ status: 405 },
	);
}

export async function DELETE() {
	return NextResponse.json(
		{
			success: false,
			error: "Use /api/cms/contents for content deletion",
		},
		{ status: 405 },
	);
}
