export const dynamic = "force-static";
import fs from "node:fs";
import path from "node:path";
import type { Content } from "@/cms/types/content";
import {
	deleteContentDb,
	getFullContentById,
} from "@/cms/lib/content-db-manager";
import { getCmsApiBaseUrl, shouldUseRustCmsApi } from "@/lib/cms-api/config";
import { cmsApiFetch } from "@/lib/cms-api/server-client";
import { requireAdminRequest } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

function resolveContentDbDir(): string {
	const candidates = [
		process.env.CONTENT_DATA_DIR,
		process.env.NEXT_CONTENT_DATA_DIR,
		process.env.PORTFOLIO_DATA_DIR,
		process.env.NEXT_PUBLIC_CONTENT_DATA_DIR,
		path.join(process.cwd(), "data", "contents"),
		path.join(process.cwd(), "..", "data", "contents"),
	].filter((dir): dir is string => Boolean(dir));
	for (const dir of candidates) {
		try {
			if (fs.existsSync(dir)) return dir;
		} catch {
			// ignore
		}
	}
	return path.join(process.cwd(), "data", "contents");
}

export function generateStaticParams(): Array<{ id: string }> {
	const dir = resolveContentDbDir();
	try {
		if (!fs.existsSync(dir)) return [];
		return fs
			.readdirSync(dir)
			.filter((file) => file.startsWith("content-") && file.endsWith(".db"))
			.map((file) => ({
				id: file.slice("content-".length, -".db".length),
			}));
	} catch {
		return [];
	}
}

async function deleteRustEntry(id: string): Promise<void> {
	const response = await fetch(
		`${getCmsApiBaseUrl()}/entries/${encodeURIComponent(id)}`,
		{
			method: "DELETE",
			headers: { Accept: "application/json" },
		},
	);
	if (!response.ok && response.status !== 404) {
		throw new Error(await response.text());
	}
}

export async function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "http://localhost:3000",
			"Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

type RustEntryListItem = {
	id: string;
	entry_type: string;
	status: string;
	visibility: string;
	title: string;
	summary?: string | null;
	lang: string;
	published_at?: string | null;
	created_at: string;
	updated_at: string;
	slug?: string | null;
	thumbnail?: string | null;
	tags?: string | null;
};

type RustEntryDetail = {
	id: string;
	entry_type: string;
	status: string;
	visibility: string;
	title: string;
	summary?: string | null;
	lang: string;
	path?: string | null;
	depth: number;
	order: number;
	parent_id?: string | null;
	published_at?: string | null;
	created_at: string;
	updated_at: string;
	slug?: string | null;
	public_url?: string | null;
	thumbnails?: Content["thumbnails"];
	assets?: Content["assets"];
	links?: Content["links"];
	searchable?: Content["searchable"];
	seo?: Content["seo"];
	relations?: Content["relations"];
	ext?: Record<string, unknown> | null;
};

function mapRustDetailToContent(detail: RustEntryDetail): Content {
	return {
		id: detail.id,
		title: detail.title,
		summary: detail.summary ?? undefined,
		lang: detail.lang,
		status: detail.status as Content["status"],
		visibility: detail.visibility as Content["visibility"],
		path: detail.path ?? undefined,
		depth: detail.depth,
		order: detail.order,
		parentId: detail.parent_id ?? undefined,
		publishedAt: detail.published_at ?? undefined,
		publicUrl: detail.public_url ?? undefined,
		createdAt: detail.created_at,
		updatedAt: detail.updated_at,
		thumbnails:
			detail.thumbnails ??
			(detail.ext?.thumbnail && typeof detail.ext.thumbnail === "object"
				? (detail.ext.thumbnail as Content["thumbnails"])
				: undefined),
		assets: detail.assets ?? [],
		links: detail.links ?? [],
		searchable: detail.searchable,
		seo: detail.seo,
		relations: detail.relations,
		ext: {
			...(detail.ext ?? {}),
			type:
				typeof detail.ext?.type === "string"
					? detail.ext.type
					: detail.entry_type,
			slug:
				typeof detail.ext?.slug === "string"
					? detail.ext.slug
					: (detail.slug ?? undefined),
		},
	};
}

function enrichWithLocalContent(
	rustContent: Content,
	localContent: Content,
): Content {
	const rustAssets = rustContent.assets ?? [];
	const rustLinks = rustContent.links ?? [];
	const rustThumbs = rustContent.thumbnails;
	const rustSearchable = rustContent.searchable;
	const rustSeo = rustContent.seo;
	const rustRelations = rustContent.relations;
	const rustExt = rustContent.ext ?? {};

	return {
		...rustContent,
		thumbnails:
			rustThumbs && (rustThumbs.image || rustThumbs.gif || rustThumbs.webm)
				? rustThumbs
				: (localContent.thumbnails ?? rustThumbs),
		assets: rustAssets.length > 0 ? rustAssets : (localContent.assets ?? []),
		links: rustLinks.length > 0 ? rustLinks : (localContent.links ?? []),
		searchable: rustSearchable ?? localContent.searchable,
		seo: rustSeo ?? localContent.seo,
		relations: rustRelations ?? localContent.relations,
		ext: {
			...(localContent.ext ?? {}),
			...rustExt,
			type: rustExt.type ?? localContent.ext?.type,
			slug: rustExt.slug ?? localContent.ext?.slug,
		},
	};
}

export async function GET(
	_req: Request,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;
	if (!id) {
		return Response.json({ error: "ID is required" }, { status: 400 });
	}

	try {
		if (!shouldUseRustCmsApi()) {
			const content = getFullContentById(id);
			if (!content) {
				return Response.json({ error: "Not found" }, { status: 404 });
			}
			return Response.json(content);
		}

		const [detail, entries] = await Promise.all([
			cmsApiFetch<RustEntryDetail>(`/entries/${encodeURIComponent(id)}`),
			cmsApiFetch<RustEntryListItem[]>("/entries"),
		]);
		const indexEntry = entries.find((entry) => entry.id === id);
		const rustContent = mapRustDetailToContent(detail);
		if (indexEntry) {
			rustContent.tags = indexEntry.tags
				? indexEntry.tags.split(",").map((t) => t.trim()).filter(Boolean)
				: rustContent.tags;
			if (!rustContent.thumbnails && indexEntry.thumbnail) {
				rustContent.thumbnails = { image: { src: indexEntry.thumbnail } };
			}
		}
		const localContent = getFullContentById(id);
		return Response.json(
			localContent
				? enrichWithLocalContent(rustContent, localContent)
				: rustContent,
		);
	} catch (error) {
		console.error(`GET /api/cms/contents/${id} error:`, error);
		return Response.json(
			{ error: "Failed to fetch content" },
			{ status: 500 },
		);
	}
}

export async function DELETE(
	req: Request,
	context: { params: Promise<{ id: string }> },
) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	const { id } = await context.params;
	if (!id) {
		return Response.json({ error: "ID is required" }, { status: 400 });
	}

	try {
		if (!shouldUseRustCmsApi()) {
			const deleted = deleteContentDb(id);
			if (!deleted) {
				return Response.json(
					{ error: `Content with id ${id} not found` },
					{ status: 404 },
				);
			}
			return Response.json({ ok: true });
		}

		await deleteRustEntry(id);
		return Response.json({ ok: true });
	} catch (error) {
		console.error(`DELETE /api/cms/contents/${id} error:`, error);
		return Response.json(
			{ error: "Failed to delete content" },
			{ status: 500 },
		);
	}
}
