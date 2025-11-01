import { type NextRequest, NextResponse } from "next/server";
import { queryContentByType } from "@/app/api/content/utils";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const limit = parseInt(searchParams.get("limit") || "", 10);

		const result = await queryContentByType("portfolio", {
			status,
			category: "design",
			limit: Number.isNaN(limit) ? undefined : limit,
		});

		return NextResponse.json({
			success: true,
			data: result.items,
			category: "design",
			total: result.total,
		});
	} catch (error) {
		console.error("Design content API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch design content",
			},
			{ status: 500 },
		);
	}
}
