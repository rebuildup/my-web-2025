import type Database from "better-sqlite3";
import { getContentDb, getFromIndex } from "@/cms/lib/content-db-manager";
import {
	getMarkdownPage,
	importMarkdownFile,
	saveMarkdownPage,
} from "@/cms/lib/markdown-mapper";
import type {
	MarkdownFile,
	MarkdownFrontmatter,
	MarkdownPage,
} from "@/cms/types/markdown";
import {
	deleteMarkdownPage as deleteMarkdownEntry,
	findMarkdownPage,
	listMarkdownPages,
	slugExists,
} from "@/cms/server/markdown-service";

export const runtime = "nodejs";

function normalizeFrontmatter(input: unknown): MarkdownFrontmatter {
	if (!input) return {};
	if (typeof input === "string") {
		try {
			return JSON.parse(input) as MarkdownFrontmatter;
		} catch (error) {
			console.warn("Failed to parse frontmatter string:", error);
			return {};
		}
	}
	if (typeof input === "object") {
		return input as MarkdownFrontmatter;
	}
	return {};
}

function ensureContentRecord(
	db: Database.Database,
	contentId: string | undefined,
	fallback?: {
		title?: string;
		summary?: string;
		lang?: string;
		visibility?: string;
		status?: string;
		publishedAt?: string;
	},
): void {
	if (!contentId) return;

	const existing = db
		.prepare("SELECT id FROM contents WHERE id = ?")
		.get(contentId) as { id: string } | undefined;
	if (existing) return;

	const indexData = getFromIndex(contentId);
	const now = new Date().toISOString();
	const payload = {
		id: contentId,
		title: indexData?.title || fallback?.title || contentId,
		summary: indexData?.summary || fallback?.summary || null,
		lang: indexData?.lang || fallback?.lang || "ja",
		visibility: indexData?.visibility || fallback?.visibility || "draft",
		status: indexData?.status || fallback?.status || "draft",
		published_at: indexData?.publishedAt || fallback?.publishedAt || null,
		created_at: indexData?.createdAt || now,
		updated_at: indexData?.updatedAt || now,
	};

	db.prepare(
		`INSERT INTO contents (
      id, title, summary, lang, visibility, status, published_at, created_at, updated_at
    ) VALUES (
      @id, @title, @summary, @lang, @visibility, @status, @published_at, @created_at, @updated_at
    )`,
	).run(payload);
}

function persistMarkdownPage(
	contentId: string,
	page: Partial<MarkdownPage>,
	fallback?: {
		title?: string;
		summary?: string;
		lang?: string;
		visibility?: string;
		status?: string;
		publishedAt?: string;
	},
): MarkdownPage {
	const db = getContentDb(contentId);
	try {
		ensureContentRecord(db, contentId, fallback);
		saveMarkdownPage(db, { ...page, contentId });
		const identifier = page.id || page.slug || contentId;
		const saved = identifier ? getMarkdownPage(db, identifier) : null;
		if (saved) {
			return saved;
		}
		return {
			...(page as MarkdownPage),
			contentId,
		};
	} finally {
		db.close();
	}
}

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

// ========== OPTIONS: CORS preflight ==========
export async function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

// ========== GET: Markdown�y�[�W�ꗗ�܂��͌ʎ擾 ==========
export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id")?.trim();
		const slug = searchParams.get("slug")?.trim();
		const contentId = searchParams.get("contentId")?.trim();

		if (id || slug) {
			const match = findMarkdownPage(id || slug || "", {
				contentId: contentId || undefined,
			});
			if (!match) {
				return Response.json({ error: "Page not found" }, { status: 404 });
			}
			return Response.json(match.page, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization",
				},
			});
		}

		const pages = listMarkdownPages({
			contentId: contentId || undefined,
		});

		return Response.json(pages, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
			},
		});
	} catch (error) {
		console.error("GET /api/markdown error:", error);
		return Response.json(
			{ error: "Failed to fetch markdown pages" },
			{ status: 500 },
		);
	}
}

// ========== POST: Markdownページ作成 ========== 
export async function POST(req: Request) {
	try {
		const data = await req.json();

		if (data.file) {
			const file: MarkdownFile = data.file;
			const page = importMarkdownFile(file);
			const requestedContentId =
				typeof data.contentId === "string" ? data.contentId.trim() : undefined;
			const resolvedContentId = requestedContentId || page.contentId || page.slug;

			if (!page.slug) {
				return Response.json({ error: "Slug is required" }, { status: 400 });
			}

			if (!resolvedContentId) {
				return Response.json(
					{ error: "contentId is required" },
					{ status: 400 },
				);
			}

			page.contentId = resolvedContentId;
			page.status = normalizeStatus(page.status);
			page.lang = page.lang || "ja";

			if (slugExists(page.slug)) {
				return Response.json({ error: "Slug already exists" }, { status: 400 });
			}

			const saved = persistMarkdownPage(resolvedContentId, page, {
				title: page.frontmatter.title,
				summary: page.frontmatter.description,
			});

			return Response.json({
				ok: true,
				id: saved.id,
				slug: saved.slug,
				page: saved,
			});
		}

		const slug = typeof data.slug === "string" ? data.slug.trim() : "";
		if (!slug) {
			return Response.json({ error: "Slug is required" }, { status: 400 });
		}

		const requestedContentId =
			typeof data.contentId === "string" ? data.contentId.trim() : undefined;
		const resolvedContentId = requestedContentId || slug;
		const frontmatter = normalizeFrontmatter(data.frontmatter);
		const now = new Date().toISOString();

		const page: Partial<MarkdownPage> = {
			id: typeof data.id === "string" ? data.id.trim() : undefined,
			contentId: resolvedContentId,
			slug,
			frontmatter,
			body: typeof data.body === "string" ? data.body : "",
			path: typeof data.path === "string" ? data.path : undefined,
			lang: typeof data.lang === "string" ? data.lang : "ja",
			status: normalizeStatus(data.status),
			createdAt: now,
			updatedAt: now,
		};

		if (slugExists(slug)) {
			return Response.json({ error: "Slug already exists" }, { status: 400 });
		}

		const savedPage = persistMarkdownPage(resolvedContentId, page, {
			title: frontmatter.title || slug,
			summary: frontmatter.description,
			lang: page.lang,
			visibility: data.visibility,
			status: page.status,
			publishedAt: frontmatter.date,
		});

		return Response.json({
			ok: true,
			id: savedPage.id || page.id || "",
			slug: savedPage.slug,
			page: savedPage,
		});
	} catch (error) {
		console.error("POST /api/markdown error:", error);
		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		return Response.json(
			{ error: "Failed to create markdown page", details: errorMessage },
			{ status: 500 },
		);
	}
}// ========== PUT: Markdownページ更新 ========== 
export async function PUT(req: Request) {
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

		const match = findMarkdownPage(identifier);
		if (!match) {
			return Response.json({ error: "Page not found" }, { status: 404 });
		}

		const existing = match.page;
		const nextSlug =
			typeof data.slug === "string"
				? data.slug.trim() || existing.slug
				: existing.slug;

		if (nextSlug !== existing.slug && slugExists(nextSlug, existing.id)) {
			return Response.json({ error: "Slug already exists" }, { status: 400 });
		}

		const requestedContentId =
			(typeof data.contentId === "string" && data.contentId.trim()) ||
			existing.contentId;

		if (!requestedContentId) {
			return Response.json(
				{ error: "contentId is required" },
				{ status: 400 },
			);
		}

		const frontmatter =
			data.frontmatter !== undefined
				? normalizeFrontmatter(data.frontmatter)
				: existing.frontmatter;

		const status = normalizeStatus(data.status ?? existing.status);

		const page: Partial<MarkdownPage> = {
			...existing,
			...data,
			id: existing.id,
			slug: nextSlug,
			contentId: requestedContentId,
			frontmatter,
			body: typeof data.body === "string" ? data.body : existing.body,
			status,
			updatedAt: new Date().toISOString(),
			version: (existing.version || 1) + 1,
		};

		const savedPage = persistMarkdownPage(requestedContentId, page, {
			title: frontmatter.title || nextSlug,
			summary: frontmatter.description,
			lang: page.lang,
			visibility: page.visibility,
			status,
			publishedAt: frontmatter.date,
		});

		if (existing.contentId && existing.contentId !== requestedContentId) {
			deleteMarkdownEntry(existing.id, { contentId: existing.contentId });
		}

		return Response.json({
			ok: true,
			id: existing.id,
			slug: savedPage.slug,
			page: savedPage,
		});
	} catch (error) {
		console.error("PUT /api/markdown error:", error);
		return Response.json(
			{ error: "Failed to update markdown page" },
			{ status: 500 },
		);
	}
}// ========== DELETE: Markdownページ削除 ========== 
export async function DELETE(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id")?.trim();
		const slug = searchParams.get("slug")?.trim();

		if (!id && !slug) {
			return Response.json(
				{ error: "ID or slug is required" },
				{ status: 400 },
			);
		}

		const targetId = id || slug;
		if (!targetId) {
			return Response.json(
				{ error: "ID or slug is required" },
				{ status: 400 },
			);
		}

		const match = findMarkdownPage(targetId);
		if (!match) {
			return Response.json({ error: "Page not found" }, { status: 404 });
		}

		const deleted = deleteMarkdownEntry(targetId, {
			contentId: match.page.contentId,
		});

		if (!deleted) {
			return Response.json({ error: "Failed to delete page" }, { status: 500 });
		}

		return Response.json({ ok: true, id: targetId });
	} catch (error) {
		console.error("DELETE /api/markdown error:", error);
		return Response.json(
			{ error: "Failed to delete markdown page" },
			{ status: 500 },
		);
	}
}


