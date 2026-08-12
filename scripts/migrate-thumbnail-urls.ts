/**
 * Migrate thumbnail URLs stored in SQLite content databases to the canonical
 * absolute form: `${NEXT_PUBLIC_CMS_API_BASE_URL}/api/cms/media?contentId=...&id=...&raw=1`.
 *
 * Handles both legacy inputs:
 *  - absolute `${anything}/api/cms/media?...`
 *  - relative `/media?...` written by an earlier intermediate migration
 *
 * Run from the project root: `bun scripts/migrate-thumbnail-urls.ts`
 */

import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";

const CONTENTS_DIR = path.join(process.cwd(), "data", "contents");

if (!fs.existsSync(CONTENTS_DIR)) {
	console.warn("[migrate-thumbnail-urls] No contents directory. Skipping.");
	process.exit(0);
}

const dbFiles = fs
	.readdirSync(CONTENTS_DIR)
	.filter((file) => file.endsWith(".db"));

console.log(
	`[migrate-thumbnail-urls] Scanning ${dbFiles.length} databases in ${CONTENTS_DIR}`,
);

const BASE_URL =
	process.env.NEXT_PUBLIC_CMS_API_BASE_URL || "http://127.0.0.1:3001";
const REPLACEMENT = `${BASE_URL}/api/cms/media`;

// Match the entire `http(s)://dev-host[:port]` portion plus either
// `/api/cms/media` or bare `/media?`. Both the dev host prefix and the
// old path must be removed so the canonical `${REPLACEMENT}?…` URL is
// produced in one pass. Matching only `/media` and replacing with
// `${REPLACEMENT}` would leave the dev-host prefix glued to the start
// (e.g. `http://127.0.0.1:3001https://yusuke-kim.com/api/cms/media?…`).
const URL_PATTERN =
	/https?:\/\/(?:127\.0\.0\.1|localhost|0\.0\.0\.0)(?::\d+)?(?:\/api\/cms\/media|\/media)/g;

let migratedRowCount = 0;
let scannedRowCount = 0;

for (const file of dbFiles) {
	const dbPath = path.join(CONTENTS_DIR, file);
	try {
		const db = new Database(dbPath);

		const rows = db
			.query(
				"SELECT id, thumbnails FROM contents WHERE thumbnails LIKE '%/api/cms/media%' OR thumbnails LIKE '%/media?%'",
			)
			.all() as Array<{ id: string; thumbnails: string }>;

		for (const row of rows) {
			scannedRowCount++;
			const next = row.thumbnails.replace(URL_PATTERN, REPLACEMENT);
			if (next === row.thumbnails) continue;
			db.query("UPDATE contents SET thumbnails = ? WHERE id = ?").run(
				next,
				row.id,
			);
			migratedRowCount++;
		}

		db.close();
	} catch (error) {
		console.error(`[migrate-thumbnail-urls] Error processing ${file}:`, error);
	}
}

console.log(
	`[migrate-thumbnail-urls] Scanned ${scannedRowCount} rows, migrated ${migratedRowCount} thumbnail URLs to ${REPLACEMENT}?... form.`,
);
