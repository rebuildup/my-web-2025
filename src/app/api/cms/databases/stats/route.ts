export const dynamic = "force-static";
import { promises as fs } from "node:fs";
import path from "node:path";
import { listCmsDatabases } from "@/lib/cms-api/database-registry";
import { fetchCmsContentIndex, fetchMarkdownPages } from "@/lib/cms-api/server-data";

export const runtime = "nodejs";

function getDataDir(): string {
	return process.env.CMS_API_DATA_DIR
		? path.resolve(process.env.CMS_API_DATA_DIR)
		: path.resolve(process.cwd(), "data/db");
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		if (!id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		const databases = await listCmsDatabases();
		const database = databases.find((item) => item.id === id);
		if (!database) {
			return Response.json({ error: "Database not found" }, { status: 404 });
		}

		let fileSize = database.size;
		try {
			const stat = await fs.stat(path.join(getDataDir(), id));
			fileSize = stat.size;
		} catch {
			fileSize = database.size;
		}

		if (!database.isActive) {
			return Response.json({
				contentsCount: 0,
				markdownPagesCount: 0,
				tagsCount: 0,
				fileSize,
			});
		}

		const [contents, markdownPages] = await Promise.all([
			fetchCmsContentIndex(),
			fetchMarkdownPages(),
		]);
		const tagSet = new Set(contents.flatMap((item) => item.tags ?? []));

		return Response.json({
			contentsCount: contents.length,
			markdownPagesCount: markdownPages.length,
			tagsCount: tagSet.size,
			fileSize,
		});
	} catch (error) {
		console.error("GET /api/cms/databases/stats error:", error);
		return Response.json(
			{ error: "Failed to fetch database stats" },
			{ status: 500 },
		);
	}
}
