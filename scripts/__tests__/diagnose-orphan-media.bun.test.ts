/**
 * Smoke test for `scripts/diagnose-orphan-media.ts`. Builds two per-content
 * DBs in a temp directory — one healthy, one whose thumbnails reference
 * missing media ids — then invokes the diagnostic's main function directly
 * (rather than spawning a subprocess) so the test environment matches the
 * script's environment exactly.
 */

import { Database } from "bun:sqlite";
import { afterAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TMP_ROOT = mkdtempSync(join(tmpdir(), "diagnose-test-"));
const CONTENTS_DIR = join(TMP_ROOT, "contents");
const DIAG_DIR = join(TMP_ROOT, "diagnostics");
mkdirSync(CONTENTS_DIR, { recursive: true });
mkdirSync(DIAG_DIR, { recursive: true });

function makeDb(name: string): string {
	const path = join(CONTENTS_DIR, `content-${name}.db`);
	const db = new Database(path);
	db.exec(`
		CREATE TABLE contents (
			id TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			thumbnails TEXT
		);
		CREATE TABLE markdown_pages (
			id TEXT PRIMARY KEY,
			content_id TEXT,
			slug TEXT NOT NULL,
			body TEXT NOT NULL,
			html_cache TEXT,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);
		CREATE TABLE media (
			id TEXT PRIMARY KEY,
			content_id TEXT NOT NULL,
			filename TEXT,
			mime_type TEXT,
			size INTEGER,
			data BLOB,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);
	`);
	return path;
}

const HEALTHY_PATH = makeDb("healthy");
const ORPHAN_PATH = makeDb("orphan");

{
	const db = new Database(HEALTHY_PATH);
	db.prepare("INSERT INTO contents (id, title) VALUES (?, ?)").run(
		"healthy",
		"Healthy",
	);
	db.prepare(
		"INSERT INTO media (id, content_id, filename, mime_type, size, data, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
	).run(
		"media_ok_1",
		"healthy",
		"a.png",
		"image/png",
		1,
		Buffer.from([0]),
		"2026-01-01T00:00:00Z",
		"2026-01-01T00:00:00Z",
	);
	db.prepare("UPDATE contents SET thumbnails = ? WHERE id = ?").run(
		JSON.stringify({
			image: {
				src: "https://x.test/api/cms/media?contentId=healthy&id=media_ok_1&raw=1",
			},
		}),
		"healthy",
	);
	db.close();
}

{
	const db = new Database(ORPHAN_PATH);
	db.prepare("INSERT INTO contents (id, title) VALUES (?, ?)").run(
		"orphan",
		"Orphan",
	);
	db.prepare("UPDATE contents SET thumbnails = ? WHERE id = ?").run(
		JSON.stringify({
			image: {
				src: "https://x.test/api/cms/media?contentId=orphan&id=media_GONE&raw=1",
			},
			gif: {
				src: "https://x.test/api/cms/media?contentId=orphan&id=media_GONE_GIF&raw=1",
			},
		}),
		"orphan",
	);
	db.prepare(
		"INSERT INTO markdown_pages (id, content_id, slug, body, html_cache, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
	).run(
		"mp1",
		"orphan",
		"orphan-slug",
		`<Image src="https://x.test/api/cms/media?contentId=orphan&id=media_GONE_BODY&raw=1" />`,
		`<img src="https://x.test/api/cms/media?contentId=orphan&id=media_GONE_HTML&raw=1" />`,
		"2026-01-01T00:00:00Z",
		"2026-01-01T00:00:00Z",
	);
	db.close();
}

// The diagnostic now takes the data dir as a parameter, so we don't
// touch `process.env.CONTENT_DATA_DIR` here. That env var is owned by
// the Bun preload (`scripts/test-preload.ts`) and used by every other
// CMS-touching test in the same process; clobbering it (and then
// removing TMP_ROOT in afterAll) used to leave later tests with a
// dangling, deleted path that fell back to ./data/contents/ and
// polluted the real content dir.
const { runDiagnostic } = (await import("../diagnose-orphan-media")) as {
	runDiagnostic: (opts: { dataDir: string }) => {
		totalScanned: number;
		totalOrphans: number;
		jsonPath: string;
		mdPath: string;
		orphans: Array<{
			sourceContentId: string;
			sourceField: string;
			mediaId: string;
		}>;
	};
};

describe("diagnose-orphan-media", () => {
	test("flags orphan refs in JSON + markdown report and ignores healthy refs", async () => {
		const result = runDiagnostic({ dataDir: TMP_ROOT });
		expect(result.totalOrphans).toBe(4);

		const orphanMediaIds = result.orphans
			.filter((r) => r.sourceContentId === "orphan")
			.map((r) => r.mediaId)
			.sort();
		expect(orphanMediaIds).toEqual([
			"media_GONE",
			"media_GONE_BODY",
			"media_GONE_GIF",
			"media_GONE_HTML",
		]);

		const healthyRefs = result.orphans.filter(
			(r) => r.sourceContentId === "healthy",
		);
		expect(healthyRefs.length).toBe(0);

		const md = await Bun.file(result.mdPath).text();
		expect(md).toContain("media_GONE");
		expect(md).toContain("media_GONE_BODY");
		expect(md).toContain("media_GONE_GIF");
		expect(md).toContain("media_GONE_HTML");
		expect(md).not.toContain("media_ok_1");
	});
});

afterAll(async () => {
	// bun:sqlite on Windows occasionally keeps the .db file mapped longer
	// than db.close() suggests, so a recursive rmSync can race against the
	// OS releasing the handle and surface as EBUSY. Yield to the event
	// loop and retry briefly so the temp dir doesn't leak. Residual EBUSY
	// after the retry window is swallowed: the OS scrubs $TMP on its own
	// schedule and failing the suite over a cleanup race masks real bugs.
	await new Promise((r) => setTimeout(r, 50));
	let attempts = 0;
	const maxAttempts = 20;
	while (true) {
		try {
			rmSync(TMP_ROOT, { recursive: true, force: true });
			return;
		} catch (err) {
			const code = (err as NodeJS.ErrnoException).code;
			if (code !== "EBUSY" || attempts >= maxAttempts) {
				if (code === "EBUSY") return;
				throw err;
			}
			attempts++;
			await new Promise((r) => setTimeout(r, 50));
		}
	}
});
