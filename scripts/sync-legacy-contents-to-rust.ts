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

async function upsertEntry(payload: RustEntryPayload): Promise<void> {
	const detailUrl = `${cmsApiBaseUrl}/entries/${encodeURIComponent(payload.id)}`;
	const detailResponse = await fetch(detailUrl);

	const init: RequestInit = {
		method: detailResponse.ok ? "PATCH" : "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	};

	const targetUrl = detailResponse.ok ? detailUrl : `${cmsApiBaseUrl}/entries`;
	const response = await fetch(targetUrl, init);

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to sync entry ${payload.id}: ${response.status} ${errorBody}`,
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

	for (const indexEntry of indexEntries) {
		const content = readFullContent(indexEntry.id);
		if (!content) {
			console.warn(
				`[sync-legacy-contents-to-rust] Skipping missing content: ${indexEntry.id}`,
			);
			continue;
		}

		await upsertEntry(toRustEntryPayload(content));
		synced += 1;
	}

	console.log(
		`[sync-legacy-contents-to-rust] Synced ${synced} content entries to ${cmsApiBaseUrl}`,
	);
}

main().catch((error) => {
	console.error("[sync-legacy-contents-to-rust] Sync failed");
	console.error(error);
	process.exit(1);
});
