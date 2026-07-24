export const dynamic = "force-static";
import { getContentDbStats } from "@/cms/lib/content-db-manager";
import { shouldUseRustCmsApi } from "@/lib/cms-api/config";
import { cmsApiFetch } from "@/lib/cms-api/server-client";

export const runtime = "nodejs";

type RustEntryListItem = {
	id: string;
	title: string;
};

export async function GET() {
	try {
		if (!shouldUseRustCmsApi()) {
			const stats = getContentDbStats();
			return Response.json(stats);
		}

		const entries = await cmsApiFetch<RustEntryListItem[]>("/entries");
		return Response.json({
			totalContents: entries.length,
			totalDbFiles: entries.length,
			totalSize: 0,
			contentsList: entries.map((entry) => ({
				id: entry.id,
				title: entry.title,
				dbFile: "cms-api-dev.db",
				size: 0,
			})),
		});
	} catch (error) {
		console.error("GET /api/cms/contents/stats error:", error);
		return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
	}
}
