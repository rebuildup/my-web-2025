import { type NextRequest, NextResponse } from "next/server";
import { queryContentByType } from "@/app/api/content/utils";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const limit = parseInt(searchParams.get("limit") || "", 10);
		const category = searchParams.get("category");
		const id = searchParams.get("id");

		const result = await queryContentByType("portfolio", {
			status,
			category,
			limit: Number.isNaN(limit) ? undefined : limit,
			id,
		});

		if (id) {
			if (!result.item) {
				return NextResponse.json(
					{ success: false, error: "Portfolio item not found" },
					{ status: 404 },
				);
			}
			return NextResponse.json({ success: true, data: result.item });
		}

		return NextResponse.json({
			success: true,
			data: result.items,
			total: result.total,
		});
	} catch (error) {
		console.error("Portfolio API error:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to load portfolio content" },
			{ status: 500 },
		);
	}
}
