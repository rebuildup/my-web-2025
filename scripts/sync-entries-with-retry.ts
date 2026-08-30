import { getAllFromIndex, getContentDb } from "@/cms/lib/content-db-manager";
import { getFullContent } from "@/cms/lib/content-mapper";
import type { Content } from "@/cms/types/content";

const cmsApiBaseUrl = (
	process.env.CMS_API_BASE_URL || "http://127.0.0.1:3001"
).replace(/\/+$/, "");

type RustEntryPayload = {
	id: string;
	entry_type: string;
	slug?: string;
	status?: string;
	visibility?: string;
	title: string;
	summary?: string;
	lang?: string;
	path?: string;
	depth?: number;
	order?: number;
	parent_id?: string;
	published_at?: string;
	tags?: string[];
	thumbnail?: string;
};

function deriveEntryType(content: Content): string {
	const extType = content.ext?.type;
	if (typeof extType === "string" && extType.trim()) {
		return extType;
	}
	return "portfolio";
}

function deriveSlug(content: Content): string | undefined {
	const extSlug = content.ext?.slug;
	if (typeof extSlug === "string" && extSlug.trim()) {
		return extSlug;
	}
	return content.id;
}

function deriveThumbnail(content: Content): string | undefined {
	const variants = content.thumbnails;
	if (variants?.image?.src) return variants.image.src;
	if (variants?.gif?.src) return variants.gif.src;
	if (variants?.webm?.poster) return variants.webm.poster;

	if (Array.isArray(content.assets) && content.assets.length > 0) {
		const firstAsset = content.assets.find(
			(asset) => typeof asset.src === "string",
		);
		if (firstAsset?.src) {
			return firstAsset.src;
		}
	}

	return undefined;
}

function toRustEntryPayload(content: Content): RustEntryPayload {
	return {
		id: content.id,
		entry_type: deriveEntryType(content),
		slug: deriveSlug(content),
		status: content.status,
		visibility: content.visibility,
		title: content.title,
		summary: content.summary,
		lang: content.lang,
		path: content.path,
		depth: content.depth,
		order: content.order,
		parent_id: content.parentId,
		published_at: content.publishedAt,
		tags: content.tags,
		thumbnail: deriveThumbnail(content),
	};
}

async function fetchWithRetry(
	url: string,
	init: RequestInit,
	maxRetries = 5,
): Promise<Response> {
	let lastErr: unknown = null;
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const r = await fetch(url, init);
			if (r.ok) return r;
			if (r.status >= 500 && r.status < 600) {
				// retry on 5xx
				const backoffMs = 1000 * 2 ** attempt;
				console.warn(
					`[retry] ${url} → ${r.status}, attempt ${attempt + 1}/${maxRetries}, sleeping ${backoffMs}ms`,
				);
				await new Promise((res) => setTimeout(res, backoffMs));
				continue;
			}
			return r;
		} catch (e) {
			lastErr = e;
			const backoffMs = 1000 * 2 ** attempt;
			console.warn(
				`[retry-exception] ${url} attempt ${attempt + 1}/${maxRetries}: ${String(e).slice(0, 200)}, sleeping ${backoffMs}ms`,
			);
			await new Promise((res) => setTimeout(res, backoffMs));
		}
	}
	throw lastErr ?? new Error(`fetch ${url} failed after ${maxRetries} retries`);
}

async function upsertEntry(payload: RustEntryPayload): Promise<void> {
	// Skip the GET existence check: the Rust API uses `INSERT OR REPLACE` in
	// `create_entry`, so POSTing the canonical payload always converges to the
	// correct state regardless of whether the entry already exists. Skipping
	// the GET also avoids 500s on the very first request after Container
	// cold-start (the GET route is a separate handler and races with hydrate).
	//
	// Use the `/api/entries` alias (not bare `/entries`): the Worker router
	// only proxies `/api/*` to the Container. `/entries` falls through to
	// the static-API collision branch which tries the static asset first and
	// returns the Cloudflare 1101 error when the static asset fetch rejects
	// the POST body — see `workers/router/src/index.ts:122-131`.
	const init: RequestInit = {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	};

	const targetUrl = `${cmsApiBaseUrl}/api/entries`;
	const response = await fetchWithRetry(targetUrl, init);
	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to sync entry ${payload.id}: ${response.status} ${errorBody.slice(0, 200)}`,
		);
	}
}

function readFullContent(contentId: string): Content | null {
	const db = getContentDb(contentId);
	try {
		return getFullContent(db, contentId);
	} finally {
		db.close();
	}
}

async function main() {
	const indexEntries = getAllFromIndex();
	let synced = 0;
	let failed = 0;

	for (const [_i, indexEntry] of indexEntries.entries()) {
		const content = readFullContent(indexEntry.id);
		if (!content) {
			console.warn(
				`[sync-entries-with-retry] Skipping missing content: ${indexEntry.id}`,
			);
			continue;
		}

		try {
			await upsertEntry(toRustEntryPayload(content));
			synced += 1;
			if (synced % 10 === 0) {
				console.log(
					`[sync-entries-with-retry] progress: ${synced}/${indexEntries.length}`,
				);
			}
		} catch (e) {
			failed += 1;
			console.error(
				`[sync-entries-with-retry] FAILED ${indexEntry.id}: ${String(e).slice(0, 200)}`,
			);
		}
	}

	console.log(
		`[sync-entries-with-retry] Synced ${synced} content entries to ${cmsApiBaseUrl} (failed=${failed})`,
	);
	if (failed > 0) {
		process.exit(2);
	}
}

main().catch((error) => {
	console.error("[sync-entries-with-retry] Sync failed");
	console.error(error);
	process.exit(1);
});
