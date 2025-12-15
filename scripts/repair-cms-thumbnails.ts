import path from "node:path";
import Database from "better-sqlite3";

type RepairResult = {
	contentId: string;
	dbPath: string;
	changed: boolean;
	message: string;
};

function getDbPath(contentId: string) {
	const sanitizedId = contentId.replace(/[^a-zA-Z0-9_-]/g, "_");
	return path.join(process.cwd(), "data", "contents", `content-${sanitizedId}.db`);
}

function extractMediaIdFromUrl(url: string): string | null {
	try {
		const u = new URL(url, "http://localhost");
		if (!u.pathname.startsWith("/api/cms/media")) return null;
		return u.searchParams.get("id");
	} catch {
		return null;
	}
}

function buildMediaUrl(contentId: string, mediaId: string) {
	return `/api/cms/media?contentId=${encodeURIComponent(contentId)}&id=${encodeURIComponent(mediaId)}&raw=1`;
}

function repairOne(contentId: string): RepairResult {
	const dbPath = getDbPath(contentId);
	const db = new Database(dbPath);
	try {
		db.pragma("foreign_keys = ON");

		const row = db
			.prepare("SELECT thumbnails FROM contents WHERE id = ?")
			.get(contentId) as { thumbnails: string | null } | undefined;
		if (!row) {
			return { contentId, dbPath, changed: false, message: "contents row not found" };
		}

		const latestMedia = db
			.prepare(
				"SELECT id FROM media WHERE content_id = ? ORDER BY created_at DESC LIMIT 1",
			)
			.get(contentId) as { id: string } | undefined;

		const thumbs = row.thumbnails ? (JSON.parse(row.thumbnails) as any) : {};
		const imageSrc: string | undefined =
			typeof thumbs?.image === "string"
				? thumbs.image
				: typeof thumbs?.image?.src === "string"
					? thumbs.image.src
					: undefined;

		if (!imageSrc) {
			if (!latestMedia) {
				return {
					contentId,
					dbPath,
					changed: false,
					message: "no thumbnail image and no media rows",
				};
			}
			thumbs.image = { ...(thumbs.image || {}), src: buildMediaUrl(contentId, latestMedia.id) };
			db.prepare("UPDATE contents SET thumbnails = ?, updated_at = ? WHERE id = ?").run(
				JSON.stringify(thumbs),
				new Date().toISOString(),
				contentId,
			);
			return {
				contentId,
				dbPath,
				changed: true,
				message: `set thumbnails.image.src to latest media (${latestMedia.id})`,
			};
		}

		const mediaId = extractMediaIdFromUrl(imageSrc);
		if (!mediaId) {
			return { contentId, dbPath, changed: false, message: "thumbnail image is not a cms media url" };
		}

		const exists = db.prepare("SELECT 1 AS ok FROM media WHERE id = ?").get(mediaId) as
			| { ok: 1 }
			| undefined;

		if (exists) {
			return { contentId, dbPath, changed: false, message: "thumbnail media exists" };
		}

		if (!latestMedia) {
			return {
				contentId,
				dbPath,
				changed: false,
				message: `thumbnail references missing media (${mediaId}) and no media rows exist`,
			};
		}

		thumbs.image = { ...(thumbs.image || {}), src: buildMediaUrl(contentId, latestMedia.id) };

		db.prepare("UPDATE contents SET thumbnails = ?, updated_at = ? WHERE id = ?").run(
			JSON.stringify(thumbs),
			new Date().toISOString(),
			contentId,
		);

		return {
			contentId,
			dbPath,
			changed: true,
			message: `replaced missing thumbnail media (${mediaId}) -> latest media (${latestMedia.id})`,
		};
	} finally {
		db.close();
	}
}

function main() {
	const contentIds = process.argv.slice(2).filter(Boolean);
	if (contentIds.length === 0) {
		// biome-ignore lint/suspicious/noConsole: CLI output
		console.error("Usage: tsx scripts/repair-cms-thumbnails.ts <contentId...>");
		process.exitCode = 2;
		return;
	}

	const results = contentIds.map(repairOne);
	for (const r of results) {
		// biome-ignore lint/suspicious/noConsole: CLI output
		console.log(
			`${r.changed ? "CHANGED" : "OK"} ${r.contentId}: ${r.message} (${r.dbPath})`,
		);
	}
}

main();

