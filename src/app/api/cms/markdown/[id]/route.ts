export const dynamic = "force-static";
export const runtime = "nodejs";
import fs from "node:fs";
import path from "node:path";
import { getAllMarkdownPagesFromLocal, getContentDb, getDataDirectory } from "@/cms/lib/content-db-manager";
import { requireAdminRequest } from "@/lib/server/admin-auth";

export function generateStaticParams(): Array<{ id: string }> {
	// Pre-generate the full set of known markdown page identifiers (id / slug /
	// contentId) at build time. With force-static + output:export, params not
	// listed here cannot be reached. fetchMarkdownPage calls happen against
	// either an id or a slug, so we cover both.
	const pages = getAllMarkdownPagesFromLocal();
	const ids = new Set<string>();
	for (const page of pages) {
		if (page.id) ids.add(page.id);
		if (page.slug) ids.add(page.slug);
		if (page.contentId) ids.add(page.contentId);
	}
	// Also list all contentIds from the contents dir so even unindexed
	// lookups by contentId resolve to a real page.
	try {
		const dir = path.join(getDataDirectory(), "contents");
		for (const file of fs.readdirSync(dir)) {
			if (file.startsWith("content-") && file.endsWith(".db")) {
				ids.add(file.slice("content-".length, -".db".length));
			}
		}
	} catch {
		// best-effort
	}
	return Array.from(ids).map((id) => ({ id }));
}

export async function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id: identifier } = await params;
		if (!identifier) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}
		// path-based: query strings are dropped under force-static+output:export,
		// so we walk all per-content DBs in-process and look up by id/slug.
		const all = getAllMarkdownPagesFromLocal();
		const found = all.find(
			(page) =>
				page.id === identifier ||
				page.slug === identifier ||
				page.contentId === identifier,
		);
		if (!found) {
			return Response.json({ error: "Not found" }, { status: 404 });
		}
		return Response.json(found, {
			headers: {
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (error) {
		console.error("GET /api/cms/markdown/[id] error:", error);
		return Response.json(
			{ error: "Failed to fetch markdown page" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	try {
		const { id: identifier } = await params;
		if (!identifier) {
			return Response.json(
				{ error: "ID or slug is required" },
				{ status: 400 },
			);
		}
		const all = getAllMarkdownPagesFromLocal();
		const target = all.find(
			(page) =>
				page.id === identifier ||
				page.slug === identifier ||
				page.contentId === identifier,
		);
		if (!target) {
			return Response.json(
				{ error: "Markdown page not found" },
				{ status: 404 },
			);
		}
		const contentId = target.contentId;
		if (!contentId) {
			return Response.json(
				{ error: "contentId is required" },
				{ status: 400 },
			);
		}
		const db = getContentDb(contentId);
		try {
			db.prepare("DELETE FROM markdown_pages WHERE id = ?").run(target.id);
		} finally {
			db.close();
		}
		return Response.json({ ok: true, id: target.id });
	} catch (error) {
		console.error("DELETE /api/cms/markdown/[id] error:", error);
		return Response.json(
			{ error: "Failed to delete markdown page" },
			{ status: 500 },
		);
	}
}
