import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import {
	upsertManualDateEntry,
	upsertTagCatalogEntry,
} from "@/cms/lib/content-db-manager";

const DATA_DIR = path.join(process.cwd(), "data");
const INDEX_DB_PATH = path.join(DATA_DIR, "index.db");

function safeParse(value: string | null | undefined): unknown {
	if (!value) return null;
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

function migrate(): void {
	if (!fs.existsSync(INDEX_DB_PATH)) {
		console.log("[migrate-index] data/index.db not found, nothing to migrate");
		return;
	}

	const db = new Database(INDEX_DB_PATH, { readonly: true });
	let manualCount = 0;
	let tagCount = 0;

	try {
		const manualRows = db
			.prepare<[], { content_id: string; date: string }>(
				"SELECT content_id, date FROM manual_dates",
			)
			.all();

		for (const row of manualRows) {
			if (!row.content_id || !row.date) continue;
			upsertManualDateEntry(row.content_id, row.date);
			manualCount += 1;
		}

		const tagRows = db
			.prepare<
				[],
				{
					name: string;
					created_at?: string;
					last_used?: string;
					metadata?: string | null;
				}
			>("SELECT name, created_at, last_used, metadata FROM tag_catalog")
			.all();

		for (const row of tagRows) {
			if (!row.name) continue;
			upsertTagCatalogEntry({
				name: row.name,
				createdAt: row.created_at,
				lastUsed: row.last_used ?? null,
				metadata: safeParse(row.metadata ?? null) ?? undefined,
			});
			tagCount += 1;
		}
	} finally {
		db.close();
	}

	const backupPath = `${INDEX_DB_PATH}.bak`;
	fs.renameSync(INDEX_DB_PATH, backupPath);
	const walPath = `${INDEX_DB_PATH}-wal`;
	const shmPath = `${INDEX_DB_PATH}-shm`;
	if (fs.existsSync(walPath)) {
		fs.renameSync(walPath, `${walPath}.bak`);
	}
	if (fs.existsSync(shmPath)) {
		fs.renameSync(shmPath, `${shmPath}.bak`);
	}

	console.log(
		`[migrate-index] Migrated ${manualCount} manual dates and ${tagCount} tag catalog entries. Original index.db renamed to ${path.basename(backupPath)}.`,
	);
}

migrate();
