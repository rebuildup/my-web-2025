import { getAllFromIndex } from "@/cms/lib/content-db-manager";
import { getMedia, listMedia } from "@/cms/lib/media-manager";

const cmsApiBaseUrl = (
	process.env.CMS_API_BASE_URL || "http://127.0.0.1:3001"
).replace(/\/+$/, "");

type RustMediaPayload = {
	id: string;
	contentId: string;
	filename: string;
	mimeType: string;
	base64Data: string;
	alt?: string;
	description?: string;
	tags?: string[];
	width?: number;
	height?: number;
};

async function fetchExistingMediaIds(contentId: string): Promise<Set<string>> {
	const response = await fetch(
		`${cmsApiBaseUrl}/media?contentId=${encodeURIComponent(contentId)}`,
	);
	if (!response.ok) {
		throw new Error(
			`Failed to load existing media list for ${contentId}: ${response.status}`,
		);
	}
	const items = (await response.json()) as Array<{ id: string }>;
	return new Set(items.map((item) => item.id));
}

async function uploadMedia(mediaId: string, payload: RustMediaPayload): Promise<void> {
	const response = await fetch(`${cmsApiBaseUrl}/media`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(
			`Failed to sync media ${mediaId}: ${response.status} ${errorBody}`,
		);
	}
}

async function main() {
	const indexEntries = getAllFromIndex();
	let synced = 0;

	for (const entry of indexEntries) {
		const existingIds = await fetchExistingMediaIds(entry.id);
		const mediaItems = listMedia(entry.id);

		for (const media of mediaItems) {
			if (existingIds.has(media.id)) {
				continue;
			}

			const raw = media.data ?? Buffer.from(media.base64 || "", "base64");
			const full = getMedia(entry.id, media.id);
			if (!full?.data) {
				console.warn(
					`[sync-legacy-media-to-rust] Skipping media without binary data: ${entry.id}/${media.id}`,
				);
				continue;
			}
			const payload: RustMediaPayload = {
				id: media.id,
				contentId: entry.id,
				filename: media.filename,
				mimeType: media.mimeType,
				base64Data: Buffer.from(full.data).toString("base64"),
				alt: media.alt,
				description: media.description,
				tags: media.tags,
				width: media.width,
				height: media.height,
			};

			await uploadMedia(media.id, payload);
			synced += 1;
		}
	}

	console.log(
		`[sync-legacy-media-to-rust] Synced ${synced} media items to ${cmsApiBaseUrl}`,
	);
}

main().catch((error) => {
	console.error("[sync-legacy-media-to-rust] Sync failed");
	console.error(error);
	process.exit(1);
});
