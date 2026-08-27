#!/usr/bin/env bun

/**
 * Compare local `data/contents/*.db` against R2 bucket `cms-data/contents/`.
 *
 * Modes:
 *   --snapshot     Write a manifest JSON of local state (upload to R2 later).
 *   --verify       Compare local vs R2, exit 1 if mismatch.
 *
 * Uses AWS CLI for the R2 list call (S3-compatible API). Endpoint is read
 * from the R2_ENDPOINT env var, e.g. https://<account>.r2.cloudflarestorage.com.
 */

import { spawnSync } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const R2_BUCKET = process.env.R2_BUCKET ?? "cms-data";
const LOCAL_DIR = join(process.cwd(), "data", "contents");

interface Entry {
	key: string;
	size: number;
	mtime: string; // ISO
}

interface Manifest {
	snapshot_at: string;
	contents: Entry[];
}

async function snapshotLocal(): Promise<Manifest> {
	const files = await readdir(LOCAL_DIR).catch(() => []);
	const entries: Entry[] = [];
	for (const f of files) {
		if (!f.endsWith(".db")) continue;
		const p = join(LOCAL_DIR, f);
		const s = await stat(p);
		entries.push({
			key: `contents/${f}`,
			size: s.size,
			mtime: s.mtime.toISOString(),
		});
	}
	return {
		snapshot_at: new Date().toISOString(),
		contents: entries,
	};
}

async function listR2(): Promise<string[]> {
	const endpoint = process.env.R2_ENDPOINT;
	if (!endpoint) {
		console.error(
			"R2_ENDPOINT required (e.g. https://<acct>.r2.cloudflarestorage.com)",
		);
		process.exit(2);
	}
	const out = spawnSync(
		"aws",
		[
			"s3api",
			"list-objects-v2",
			"--bucket",
			R2_BUCKET,
			"--prefix",
			"contents/",
			"--endpoint-url",
			endpoint,
			"--query",
			"Contents[].Key",
			"--output",
			"text",
		],
		{ encoding: "utf8" },
	);
	if (out.status !== 0) {
		console.error("aws s3api failed:", out.stderr);
		process.exit(out.status ?? 1);
	}
	return (out.stdout ?? "").split("\n").filter(Boolean);
}

const mode = process.argv.includes("--snapshot")
	? "snapshot"
	: process.argv.includes("--verify")
		? "verify"
		: "snapshot";

if (mode === "snapshot") {
	const manifest = await snapshotLocal();
	process.stdout.write(JSON.stringify(manifest, null, 2));
} else {
	const local = await snapshotLocal();
	const remote = await listR2();
	const localKeys = new Set(local.contents.map((e) => e.key));
	const remoteKeys = new Set(remote);
	const missing = [...localKeys].filter((k) => !remoteKeys.has(k));
	const extra = [...remoteKeys].filter((k) => !localKeys.has(k));
	if (missing.length || extra.length) {
		console.error("R2 ↔ local mismatch:");
		for (const k of missing) console.error("  - missing on R2:", k);
		for (const k of extra) console.error("  + extra on R2:   ", k);
		process.exit(1);
	}
	console.log(`OK: ${localKeys.size} files match between local and R2`);
}
