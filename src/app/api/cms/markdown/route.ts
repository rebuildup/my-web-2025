import type { MarkdownFile, MarkdownPage } from "@/cms/types/markdown";
import { getCmsApiBaseUrl } from "@/lib/cms-api/config";
import { cmsApiFetch } from "@/lib/cms-api/server-client";
import { requireAdminRequest } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

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

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id")?.trim();
		const slug = searchParams.get("slug")?.trim();
		const contentId = searchParams.get("contentId")?.trim();

		const rustParams = new URLSearchParams();
		if (id) rustParams.set("id", id);
		if (slug) rustParams.set("slug", slug);
		if (contentId) rustParams.set("contentId", contentId);

		const rustResponse = await cmsApiFetch<MarkdownPage | MarkdownPage[]>(
			`/markdown${rustParams.size > 0 ? `?${rustParams.toString()}` : ""}`,
		);

		return Response.json(rustResponse, {
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
				"Access-Control-Allow-Headers": "Content-Type, Authorization",
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

export async function POST(req: Request) {
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

		const response = await fetch(`${getCmsApiBaseUrl()}/markdown`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(page),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			return Response.json(
				{ error: "Failed to create markdown page", details: errorBody },
				{ status: response.status },
			);
		}

		const createdPage = await response.json();
		return Response.json({
			ok: true,
			id: createdPage.id,
			slug: createdPage.slug,
			page: createdPage,
		});
	} catch (error) {
		console.error("POST /api/cms/markdown error:", error);
		return Response.json(
			{ error: "Failed to create markdown page" },
			{ status: 500 },
		);
	}
}

export async function PUT(req: Request) {
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

		const response = await fetch(
			`${getCmsApiBaseUrl()}/markdown/${encodeURIComponent(identifier)}`,
			{
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify({
					...data,
					frontmatter:
						data.frontmatter !== undefined
							? normalizeFrontmatter(data.frontmatter)
							: undefined,
				}),
			},
		);

		if (!response.ok) {
			const errorBody = await response.text();
			return Response.json(
				{ error: "Failed to update markdown page", details: errorBody },
				{ status: response.status },
			);
		}

		const page = await response.json();
		return Response.json({ ok: true, id: page.id, slug: page.slug, page });
	} catch (error) {
		console.error("PUT /api/cms/markdown error:", error);
		return Response.json(
			{ error: "Failed to update markdown page" },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: Request) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id")?.trim();
		const slug = searchParams.get("slug")?.trim();
		const targetId = id || slug;

		if (!targetId) {
			return Response.json(
				{ error: "ID or slug is required" },
				{ status: 400 },
			);
		}

		const response = await fetch(
			`${getCmsApiBaseUrl()}/markdown/${encodeURIComponent(targetId)}`,
			{
				method: "DELETE",
				headers: { Accept: "application/json" },
			},
		);

		if (!response.ok) {
			const errorBody = await response.text();
			return Response.json(
				{ error: "Failed to delete markdown page", details: errorBody },
				{ status: response.status },
			);
		}

		return Response.json({ ok: true, id: targetId });
	} catch (error) {
		console.error("DELETE /api/cms/markdown error:", error);
		return Response.json(
			{ error: "Failed to delete markdown page" },
			{ status: 500 },
		);
	}
}
