/**
 * Round-trip test for the per-content `media` table.
 *
 * Bun-side reads (`getMedia` / `listMedia`) and Rust-side writes
 * (`apps/cms-api/src/routes/media.rs::create_media`) target the same
 * per-content SQLite DB and the same `media` schema. This test pins down
 * that contract: a row inserted via raw SQL (the shape Rust produces) is
 * read back correctly through the public Bun helpers.
 *
 * If `apps/cms-api/src/db/per_content_schema.sql` ever drifts from
 * `src/cms/lib/content-db-manager.ts::initializeContentDbSchema`, this test
 * will fail because the schema bootstrap run by `getContentDb` will reject
 * the row or drop columns.
 *
 * The CMS modules resolve `CONTENT_DATA_DIR` at module load time, so this
 * test relies on `bunfig.toml`'s preload (`scripts/test-preload.ts`) to
 * point that variable at a sandbox temp dir.
 */

import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { getContentDb } from "../content-db-manager";
import { getMedia, listMedia } from "../media-manager";

describe("media-manager round-trip (Rust-write shape)", () => {
	test("inserting the column shape Rust produces is read back via getMedia", () => {
		const TEST_CONTENT_ID = `media-rt-${randomUUID()}`;
		const mediaId = "media_1700000000000_abcdef0123456789abcdef0123456789";
		const now = new Date().toISOString();
		const pngBytes = Buffer.from(
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
			"base64",
		);
		const tagsJson = JSON.stringify(["hero", "thumbnail"]);

		// Simulate what Rust `create_media` writes.
		const db = getContentDb(TEST_CONTENT_ID);
		db.prepare(
			`INSERT INTO contents (id, title, status, visibility, created_at, updated_at)
       VALUES (?, ?, 'draft', 'draft', ?, ?)`,
		).run(TEST_CONTENT_ID, TEST_CONTENT_ID, now, now);
		db.prepare(
			`INSERT INTO media (
         id, content_id, filename, mime_type, size, width, height,
         alt, description, tags, data, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		).run(
			mediaId,
			TEST_CONTENT_ID,
			"hero.png",
			"image/png",
			pngBytes.length,
			1200,
			630,
			"hero alt",
			"hero description",
			tagsJson,
			pngBytes,
			now,
			now,
		);
		db.close();

		const item = getMedia(TEST_CONTENT_ID, mediaId);
		expect(item).not.toBeNull();
		expect(item?.id).toBe(mediaId);
		expect(item?.contentId).toBe(TEST_CONTENT_ID);
		expect(item?.filename).toBe("hero.png");
		expect(item?.mimeType).toBe("image/png");
		expect(item?.size).toBe(pngBytes.length);
		expect(item?.width).toBe(1200);
		expect(item?.height).toBe(630);
		expect(item?.alt).toBe("hero alt");
		expect(item?.description).toBe("hero description");
		expect(item?.tags).toEqual(["hero", "thumbnail"]);
		expect(item?.data?.equals(pngBytes)).toBe(true);
		expect(item?.createdAt).toBe(now);
		expect(item?.updatedAt).toBe(now);
	});

	test("listMedia returns rows in created_at DESC order", () => {
		const TEST_CONTENT_ID = `media-list-${randomUUID()}`;
		const db = getContentDb(TEST_CONTENT_ID);
		db.prepare(
			`INSERT INTO contents (id, title, status, visibility, created_at, updated_at)
       VALUES (?, ?, 'draft', 'draft', ?, ?)`,
		).run(
			TEST_CONTENT_ID,
			TEST_CONTENT_ID,
			"2026-01-01T00:00:00Z",
			"2026-01-01T00:00:00Z",
		);

		const ids: string[] = [];
		for (let i = 0; i < 3; i++) {
			const id = `media_seq_${i}`;
			const createdAt = `2026-01-0${i + 1}T00:00:00Z`;
			db.prepare(
				`INSERT INTO media (
           id, content_id, filename, mime_type, size, data, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			).run(
				id,
				TEST_CONTENT_ID,
				`f${i}.png`,
				"image/png",
				1,
				Buffer.from([0]),
				createdAt,
				createdAt,
			);
			ids.push(id);
		}
		db.close();

		const items = listMedia(TEST_CONTENT_ID);
		expect(items.map((item) => item.id)).toEqual([...ids].reverse());
	});
});
