import { type NextRequest, NextResponse } from "next/server";
import { queryContentByType } from "@/app/api/content/utils";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const limit = parseInt(searchParams.get("limit") || "", 10);

		const result = await queryContentByType("plugin", {
			status,
			limit: Number.isNaN(limit) ? undefined : limit,
		});

		return NextResponse.json({
			success: true,
			data: result.items,
			total: result.total,
		});
	} catch (error) {
		console.error("Plugin API error:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 },
		);
	}
}
