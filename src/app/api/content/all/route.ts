import { NextResponse } from "next/server";
import { loadAllContent } from "@/lib/data";

export async function GET() {
	try {
		const contentByType = await loadAllContent();
		const combined = Object.values(contentByType).flat();

		return NextResponse.json({
			success: true,
			data: combined,
			total: combined.length,
			byType: contentByType,
		});
	} catch (error) {
		console.error("Content all API error:", error);
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch content",
			},
			{ status: 500 },
		);
	}
}
