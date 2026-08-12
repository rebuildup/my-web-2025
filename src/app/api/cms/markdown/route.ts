export const dynamic = "force-static";
export const runtime = "nodejs";
import fs from "node:fs";
import path from "node:path";
import { type NextRequest } from "next/server";
import {
	getAllMarkdownPagesFromLocal,
	getContentDb,
	getDataDirectory,
} from "@/cms/lib/content-db-manager";
import {
	getMarkdownPage,
	saveMarkdownPage,
} from "@/cms/lib/markdown-mapper";
import type { MarkdownFile, MarkdownPage } from "@/cms/types/markdown";
import { requireAdminRequest } from "@/lib/server/admin-auth";

type MarkdownStatus = "draft" | "published" | "archived";
const MARKDOWN_STATUS_SET = new Set<MarkdownStatus>([
	"draft",
	"published",
	"archived",
]);

function normalizeStatus(status: unknown): MarkdownStatus {
	if (typeof status === "string") {
		const normalized = status.trim().toLowerCase();
		if (MARKDOWN_STATUS_SET.has(normalized as MarkdownStatus)) {
			return normalized as MarkdownStatus;
		}
	}
	return "draft";
}

function normalizeFrontmatter(input: unknown): Record<string, unknown> {
	if (!input) return {};
	if (typeof input === "string") {
		try {
			return JSON.parse(input) as Record<string, unknown>;
		} catch {
			return {};
		}
	}
	if (typeof input === "object") {
		return input as Record<string, unknown>;
	}
	return {};
}

function convertMarkdownFile(
	file: MarkdownFile,
	contentId?: string,
): Partial<MarkdownPage> {
	const slug = file.filename.replace(/\.md$/i, "");
	const frontmatter = file.parsed?.frontmatter || {};
	const body = file.parsed?.body || file.content || "";
	return {
		contentId: contentId || slug,
		slug,
		frontmatter,
		body,
		path: file.filename,
		lang: "ja",
		status: normalizeStatus(frontmatter.status),
		createdAt: undefined,
		updatedAt: undefined,
		publishedAt:
			typeof frontmatter.date === "string" ? frontmatter.date : undefined,
	};
}

function findMarkdownPage(
	identifier: string,
	contentId: string | undefined,
): { db: ReturnType<typeof getContentDb>; page: MarkdownPage } | null {
	const contentsDir = path.join(getDataDirectory(), "contents");
	const candidateFiles = contentId
		? [`content-${contentId.replace(/[^a-zA-Z0-9_-]/g, "_")}.db`]
		: fs
				.readdirSync(contentsDir)
				.filter((file) => file.startsWith("content-") && file.endsWith(".db"));

	for (const file of candidateFiles) {
		const derivedId = file.slice("content-".length, -".db".length);
		const dbPath = path.join(contentsDir, file);
		if (!fs.existsSync(dbPath)) continue;
		const db = getContentDb(derivedId);
		try {
			const page = getMarkdownPage(db, identifier);
			if (page) {
				return { db, page };
			}
		} finally {
			db.close();
		}
	}

	return null;
}

export async function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

export async function GET(_req: NextRequest) {
	try {
		// NOTE: force-static + output:export drops query strings, so we cannot
		// filter at the route level. Return all pages and let the client
		// (fetchMarkdownPages) filter by contentId / slug. This matches the
		// pattern used by /api/cms/contents.
		const pages = getAllMarkdownPagesFromLocal();
		return Response.json(pages, {
			headers: {
				"Access-Control-Allow-Origin": "*",
			},
		});
	} catch (error) {
		console.error("GET /api/cms/markdown error:", error);
		return Response.json(
			{ error: "Failed to fetch markdown pages" },
			{ status: 500 },
		);
	}
}

export async function POST(req: NextRequest) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	try {
		const data = await req.json();
		const now = new Date().toISOString();

		const page =
			data.file && typeof data.file === "object"
				? convertMarkdownFile(
						data.file as MarkdownFile,
						typeof data.contentId === "string" ? data.contentId.trim() : undefined,
				  )
				: {
						...data,
						contentId:
							typeof data.contentId === "string" ? data.contentId.trim() : "",
						slug: typeof data.slug === "string" ? data.slug.trim() : "",
						frontmatter: normalizeFrontmatter(data.frontmatter),
						body: typeof data.body === "string" ? data.body : "",
						lang: typeof data.lang === "string" ? data.lang : "ja",
						status: normalizeStatus(data.status),
						createdAt: data.createdAt || now,
						updatedAt: now,
				  };

		if (!page.slug || !page.contentId) {
			return Response.json(
				{ error: "Slug and contentId are required" },
				{ status: 400 },
			);
		}

		const db = getContentDb(page.contentId);
		try {
			saveMarkdownPage(db, page);
		} finally {
			db.close();
		}

		// Re-read to get the canonical row (with timestamps applied)
		const db2 = getContentDb(page.contentId);
		try {
			const stored = getMarkdownPage(db2, page.slug);
			return Response.json({
				ok: true,
				id: stored?.id ?? page.id,
				slug: stored?.slug ?? page.slug,
				page: stored,
			});
		} finally {
			db2.close();
		}
	} catch (error) {
		console.error("POST /api/cms/markdown error:", error);
		return Response.json(
			{ error: "Failed to create markdown page" },
			{ status: 500 },
		);
	}
}

export async function PUT(req: NextRequest) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	try {
		const data = await req.json();
		const identifier =
			(typeof data.id === "string" && data.id.trim()) ||
			(typeof data.slug === "string" && data.slug.trim());

		if (!identifier) {
			return Response.json(
				{ error: "ID or slug is required" },
				{ status: 400 },
			);
		}

		const contentIdHint =
			typeof data.contentId === "string" && data.contentId.trim()
				? data.contentId.trim()
				: undefined;

		const found = findMarkdownPage(identifier, contentIdHint);
		if (!found) {
			return Response.json(
				{ error: "Markdown page not found" },
				{ status: 404 },
			);
		}

		const existing = found.page;
		const merged: Partial<MarkdownPage> = {
			id: existing.id,
			contentId: existing.contentId ?? contentIdHint,
			slug: typeof data.slug === "string" && data.slug.trim() ? data.slug.trim() : existing.slug,
			frontmatter:
				data.frontmatter !== undefined
					? normalizeFrontmatter(data.frontmatter)
					: existing.frontmatter,
			body: typeof data.body === "string" ? data.body : existing.body,
			path: typeof data.path === "string" ? data.path : existing.path,
			lang: typeof data.lang === "string" ? data.lang : existing.lang,
			status: normalizeStatus(data.status ?? existing.status),
			visibility: data.visibility ?? existing.visibility,
			version:
				typeof data.version === "number"
					? data.version
					: (existing.version ?? 1),
			publishedAt:
				typeof data.publishedAt === "string"
					? data.publishedAt
					: existing.publishedAt,
			createdAt: existing.createdAt,
			updatedAt:
				typeof data.updatedAt === "string" ? data.updatedAt : new Date().toISOString(),
			htmlCache:
				typeof data.htmlCache === "string" ? data.htmlCache : existing.htmlCache,
		};

		const targetContentId = merged.contentId ?? contentIdHint;
		if (!targetContentId) {
			return Response.json(
				{ error: "contentId is required" },
				{ status: 400 },
			);
		}

		const db = getContentDb(targetContentId);
		try {
			saveMarkdownPage(db, merged);
		} finally {
			db.close();
		}

		const db2 = getContentDb(targetContentId);
		try {
			const stored = getMarkdownPage(db2, merged.slug ?? identifier);
			return Response.json({ ok: true, id: stored?.id, slug: stored?.slug, page: stored });
		} finally {
			db2.close();
		}
	} catch (error) {
		console.error("PUT /api/cms/markdown error:", error);
		return Response.json(
			{ error: "Failed to update markdown page" },
			{ status: 500 },
		);
	}
}

export async function DELETE(_req: NextRequest) {
	// DELETE is path-based: see /api/cms/markdown/[id]/route.ts
	return Response.json(
		{ error: "Use DELETE /api/cms/markdown/[id] instead" },
		{ status: 405 },
	);
}
