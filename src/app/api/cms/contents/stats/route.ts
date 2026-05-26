import { promises as fs } from "node:fs";
import path from "node:path";
import { fetchCmsContentIndex } from "@/lib/cms-api/server-data";

export const runtime = "nodejs";

function getDataDir(): string {
	return process.env.CMS_API_DATA_DIR
		? path.resolve(process.env.CMS_API_DATA_DIR)
		: path.resolve(process.cwd(), "data/db");
}

export async function GET() {
	try {
		const entries = await fetchCmsContentIndex();
		const contentsList = entries.map((entry) => ({
			id: entry.id,
			title: entry.title,
			dbFile: "cms-api-dev.db",
			size: 0,
		}));
		let totalSize = 0;
		try {
			const files = await fs.readdir(getDataDir(), { withFileTypes: true });
			for (const file of files) {
				if (!file.isFile() || !file.name.endsWith(".db")) continue;
				const stat = await fs.stat(path.join(getDataDir(), file.name));
				totalSize += stat.size;
			}
		} catch {
			totalSize = 0;
		}
		return Response.json({
			totalContents: entries.length,
			totalDbFiles: entries.length,
			totalSize,
			totalSizeBytes: totalSize,
			totalSizeMb: totalSize / (1024 * 1024),
			contentsList,
			summaries: contentsList,
		});
	} catch (error) {
		console.error("GET /api/cms/contents/stats error:", error);
		return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
	}
}
