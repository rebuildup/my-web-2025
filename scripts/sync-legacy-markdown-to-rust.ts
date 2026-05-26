import { getAllFromIndex, getContentDb } from "@/cms/lib/content-db-manager";
import {
	type MarkdownPageRow,
	rowToMarkdownPage,
} from "@/cms/lib/markdown-mapper";
import type { MarkdownPage } from "@/cms/types/markdown";

const cmsApiBaseUrl = (
	process.env.CMS_API_BASE_URL || "http://127.0.0.1:3001"
).replace(/\/+$/, "");

type RustMarkdownPayload = {
	id: string;
	contentId: string;
	slug: string;
	frontmatter: MarkdownPage["frontmatter"];
	body: string;
	htmlCache?: string;
	path?: string;
	lang?: string;
	status?: MarkdownPage["status"];
	visibility?: MarkdownPage["visibility"];
	version?: number;
	publishedAt?: string;
	createdAt?: string;
	updatedAt?: string;
};

function readMarkdownPages(contentId: string): MarkdownPage[] {
	const db = getContentDb(contentId);

	try {
		const rows = db
			.prepare(
				`SELECT id, content_id, slug, frontmatter, body, html_cache, path, lang, status, version, created_at, updated_at, published_at
         FROM markdown_pages
         ORDER BY updated_at DESC`,
			)
			.all() as MarkdownPageRow[];

		return rows.map((row) => {
			const page = rowToMarkdownPage(row);
			if (!page.contentId) {
				page.contentId = contentId;
			}
			return page;
		});
	} finally {
		db.close();
	}
}

function toRustMarkdownPayload(page: MarkdownPage): RustMarkdownPayload | null {
	if (!page.contentId) {
		return null;
	}

	return {
		id: page.id,
		contentId: page.contentId,
		slug: page.slug,
		frontmatter: page.frontmatter,
		body: page.body,
		htmlCache: page.htmlCache,
		path: page.path,
		lang: page.lang,
		status: page.status,
		visibility: page.visibility,
		version: page.version,
		publishedAt: page.publishedAt,
		createdAt: page.createdAt,
		updatedAt: page.updatedAt,
	};
}

async function upsertMarkdown(payload: RustMarkdownPayload): Promise<void> {
	const detailUrl = `${cmsApiBaseUrl}/markdown?id=${encodeURIComponent(payload.id)}`;
	const detailResponse = await fetch(detailUrl);

	const init: RequestInit = {
		method: detailResponse.ok ? "PATCH" : "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	};

	const targetUrl = detailResponse.ok
		? `${cmsApiBaseUrl}/markdown/${encodeURIComponent(payload.id)}`
		: `${cmsApiBaseUrl}/markdown`;
	const response = await fetch(targetUrl, init);

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to sync markdown ${payload.id}: ${response.status} ${errorBody}`,
		);
	}
}

async function main() {
	const indexEntries = getAllFromIndex();
	let synced = 0;

	for (const indexEntry of indexEntries) {
		const pages = readMarkdownPages(indexEntry.id);
		for (const page of pages) {
			const payload = toRustMarkdownPayload(page);
			if (!payload) {
				console.warn(
					`[sync-legacy-markdown-to-rust] Skipping markdown without contentId: ${page.id}`,
				);
				continue;
			}

			await upsertMarkdown(payload);
			synced += 1;
		}
	}

	console.log(
		`[sync-legacy-markdown-to-rust] Synced ${synced} markdown pages to ${cmsApiBaseUrl}`,
	);
}

main().catch((error) => {
	console.error("[sync-legacy-markdown-to-rust] Sync failed");
	console.error(error);
	process.exit(1);
});
