import type { Content } from "@/cms/types/content";
import type { ContentIndexItem } from "@/cms/types/content";
import { getAllFromIndex, getFromIndex, getContentDb, deleteContentDb } from "@/cms/lib/content-db-manager";
import { saveFullContent } from "@/cms/lib/content-mapper";
import { getCmsApiBaseUrl, shouldUseRustCmsApi } from "@/lib/cms-api/config";
import { cmsApiFetch } from "@/lib/cms-api/server-client";
import { requireAdminRequest } from "@/lib/server/admin-auth";

export const runtime = "nodejs";

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

type RustEntryWritePayload = {
	id: string;
	entry_type: string;
	slug?: string;
	status?: Content["status"];
	visibility?: Content["visibility"];
	title: string;
	summary?: string;
	lang?: string;
	path?: string;
	depth?: number;
	order?: number;
	parent_id?: string;
	published_at?: string | null;
	tags?: string[];
	thumbnail?: string;
	public_url?: string;
	thumbnails?: Content["thumbnails"];
	assets?: Content["assets"];
	links?: Content["links"];
	searchable?: Content["searchable"];
	seo?: Content["seo"];
	relations?: Content["relations"];
	ext?: Record<string, unknown>;
};

function deriveThumbnail(content: Partial<Content>): string | undefined {
	const image = content.thumbnails?.image?.src;
	if (typeof image === "string" && image) return image;
	const gif = content.thumbnails?.gif?.src;
	if (typeof gif === "string" && gif) return gif;
	const webmPoster = content.thumbnails?.webm?.poster;
	if (typeof webmPoster === "string" && webmPoster) return webmPoster;
	const firstAsset = content.assets?.find(
		(asset) => typeof asset.src === "string" && asset.src,
	);
	return firstAsset?.src;
}

function toRustEntryWritePayload(content: Partial<Content>): RustEntryWritePayload {
	return {
		id: content.id ?? "",
		entry_type:
			typeof content.ext?.type === "string" ? content.ext.type : "portfolio",
		slug:
			typeof content.ext?.slug === "string" ? content.ext.slug : content.id,
		status: content.status,
		visibility: content.visibility,
		title: content.title ?? "",
		summary: content.summary,
		lang: content.lang,
		path: content.path,
		depth: content.depth,
		order: content.order,
		parent_id: content.parentId,
		published_at: Object.hasOwn(content, "publishedAt")
			? (content.publishedAt ?? null)
			: undefined,
		tags: content.tags,
		thumbnail: deriveThumbnail(content),
		public_url: content.publicUrl,
		thumbnails: content.thumbnails,
		assets: content.assets,
		links: content.links,
		searchable: content.searchable,
		seo: content.seo,
		relations: content.relations,
		ext: content.ext,
	};
}

async function writeRustEntry(
	method: "POST" | "PATCH",
	payload: RustEntryWritePayload,
	targetId?: string,
): Promise<void> {
	const path =
		method === "POST"
			? "/entries"
			: `/entries/${encodeURIComponent(targetId || payload.id)}`;
	const response = await fetch(`${getCmsApiBaseUrl()}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		throw new Error(await response.text());
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

function mapRustListItemToContentIndexItem(
	item: RustEntryListItem,
): ContentIndexItem & Pick<Content, "thumbnails"> {
	return {
		id: item.id,
		title: item.title,
		summary: item.summary ?? undefined,
		lang: item.lang,
		status: item.status as ContentIndexItem["status"],
		visibility: item.visibility as ContentIndexItem["visibility"],
		createdAt: item.created_at,
		updatedAt: item.updated_at,
		publishedAt: item.published_at ?? null,
		tags: item.tags
			? item.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
			: [],
		thumbnails: item.thumbnail ? { image: { src: item.thumbnail } } : undefined,
	};
}

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

function mapRustDetailToContentWithIndex(
	detail: RustEntryDetail,
	indexItem?: RustEntryListItem,
): Content {
	const content = mapRustDetailToContent(detail);
	const indexThumbnail = indexItem?.thumbnail
		? { image: { src: indexItem.thumbnail } }
		: undefined;

	return {
		...content,
		tags: indexItem?.tags
			? indexItem.tags
					.split(",")
					.map((tag) => tag.trim())
					.filter(Boolean)
			: content.tags,
		thumbnails: content.thumbnails ?? indexThumbnail,
	};
}

export async function OPTIONS() {
	return new Response(null, {
		status: 200,
		headers: {
			"Access-Control-Allow-Origin": "http://localhost:3000",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
}

function mapDbIndexToContentIndexItem(
	row: ReturnType<typeof getAllFromIndex>[number],
): ContentIndexItem & Pick<Content, "thumbnails"> {
	return {
		id: row.id,
		title: row.title,
		summary: row.summary || undefined,
		lang: row.lang,
		status: row.status as ContentIndexItem["status"],
		visibility: row.visibility as ContentIndexItem["visibility"],
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		publishedAt: row.publishedAt ?? null,
		tags: row.tags ?? [],
		thumbnails: row.thumbnails,
	};
}

function mapDbRowToContent(row: ReturnType<typeof getFromIndex> & {}): Content {
	return {
		id: row.id,
		title: row.title,
		summary: row.summary || undefined,
		lang: row.lang,
		status: row.status as Content["status"],
		visibility: row.visibility as Content["visibility"],
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		publishedAt: row.publishedAt ?? undefined,
		thumbnails: row.thumbnails as Content["thumbnails"],
		assets: [],
		links: [],
		ext: row.seo ?? {},
	};
}

export async function GET(req: Request) {
	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");

		if (!shouldUseRustCmsApi()) {
			if (id) {
				const row = getFromIndex(id);
				if (!row) {
					return Response.json({ error: "Not found" }, { status: 404 });
				}
				return Response.json(mapDbRowToContent(row));
			}

			const entries = getAllFromIndex();
			return Response.json(entries.map(mapDbIndexToContentIndexItem));
		}

		if (id) {
			const [detail, entries] = await Promise.all([
				cmsApiFetch<RustEntryDetail>(`/entries/${encodeURIComponent(id)}`),
				cmsApiFetch<RustEntryListItem[]>("/entries"),
			]);
			return Response.json(
				mapRustDetailToContentWithIndex(
					detail,
					entries.find((entry) => entry.id === id),
				),
			);
		}

		const entries = await cmsApiFetch<RustEntryListItem[]>("/entries");
		return Response.json(entries.map(mapRustListItemToContentIndexItem));
	} catch (error) {
		console.error("GET /api/cms/contents error:", error);
		return Response.json(
			{ error: "Failed to fetch contents" },
			{ status: 500 },
		);
	}
}

export async function POST(req: Request) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	try {
		const data = await req.json();
		if (!data.id || !data.title) {
			return Response.json(
				{ error: "ID and title are required" },
				{ status: 400 },
			);
		}

		const now = new Date().toISOString();
		const content: Partial<Content> = {
			...data,
			id: data.id,
			title: data.title,
			lang: data.lang || "ja",
			status: data.status || "draft",
			visibility: data.visibility || "draft",
			createdAt: data.createdAt || now,
			updatedAt: now,
		};

		if (!shouldUseRustCmsApi()) {
			const db = getContentDb(content.id!);
			try {
				saveFullContent(db, content);
			} finally {
				db.close();
			}
			return Response.json({ ok: true, id: content.id });
		}

		await writeRustEntry("POST", toRustEntryWritePayload(content));
		return Response.json({ ok: true, id: content.id });
	} catch (error) {
		console.error("POST /api/cms/contents error:", error);
		return Response.json(
			{ error: "Failed to create content" },
			{ status: 500 },
		);
	}
}

export async function PUT(req: Request) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	try {
		const data = await req.json();
		if (!data.id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

		const oldId = (data as { oldId?: string }).oldId;
		const newId = data.id;
		const now = new Date().toISOString();
		const content: Partial<Content> = {
			...data,
			id: newId,
			title: data.title ?? "",
			lang: data.lang || "ja",
			status: data.status || "draft",
			visibility: data.visibility || "draft",
			createdAt: data.createdAt || now,
			updatedAt: now,
		};

		if (!shouldUseRustCmsApi()) {
			const db = getContentDb(content.id!);
			try {
				saveFullContent(db, content);
			} finally {
				db.close();
			}
			return Response.json({ ok: true });
		}

		if (oldId && oldId !== newId) {
			await deleteRustEntry(oldId);
			await writeRustEntry("POST", toRustEntryWritePayload(content));
		} else {
			await writeRustEntry("PATCH", toRustEntryWritePayload(content), newId);
		}

		return Response.json({ ok: true });
	} catch (error) {
		console.error("PUT /api/cms/contents error:", error);
		return Response.json(
			{ error: "Failed to update content" },
			{ status: 500 },
		);
	}
}

export async function DELETE(req: Request) {
	const guard = requireAdminRequest(req);
	if (!guard.ok) return guard.response;

	try {
		const { searchParams } = new URL(req.url);
		const id = searchParams.get("id");
		if (!id) {
			return Response.json({ error: "ID is required" }, { status: 400 });
		}

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
		console.error("DELETE /api/cms/contents error:", error);
		return Response.json(
			{ error: "Failed to delete content" },
			{ status: 500 },
		);
	}
}
