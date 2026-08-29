#!/usr/bin/env bun
/**
 * Pre-build CMS index dumper.
 *
 * Reads data/contents/*.db via bun:sqlite (Bun runtime only) and writes two
 * JSON files that the SSG build can consume without needing SQLite at runtime:
 *
 *   node_modules/.cache/cms-build/cms-index.json       — CmsContentIndexEntry[]
 *   node_modules/.cache/cms-build/markdown-pages.json  — MarkdownPageRecord[]
 *
 * `next build` runs under Node 22 in Cloudflare Pages' build env, where
 * `bun:sqlite` cannot load. The dump step bridges that gap by materialising
 * the DB contents into JSON *before* `next build` is invoked. The JSON is
 * consumed by `getAllFromIndex()` / `getAllMarkdownPagesFromLocal()` when
 * `CMS_INDEX_JSON` / `CMS_MARKDOWN_JSON` env vars are set.
 *
 * Output lives under `node_modules/.cache/cms-build/` (NOT `.next/`)
 * because Next.js wipes `.next/` at the start of `next build`. `node_modules`
 * is gitignored, so no extra ignore rule is needed.
 *
 * Local dev / Container runtime are unaffected — those paths still hit
 * bun:sqlite directly via the SQLite fast-path.
 *
 * Must be invoked via `bun scripts/dump-cms-index.ts` so bun:sqlite is available.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
	getAllFromIndex,
	getAllMarkdownPagesFromLocal,
} from "../src/cms/lib/content-db-manager";

const OUTPUT_DIR =
	process.env.CMS_INDEX_OUTPUT_DIR ??
	join(process.cwd(), "node_modules", ".cache", "cms-build");

if (!existsSync(OUTPUT_DIR)) {
	mkdirSync(OUTPUT_DIR, { recursive: true });
}

const contentIndex = getAllFromIndex();
writeFileSync(join(OUTPUT_DIR, "cms-index.json"), JSON.stringify(contentIndex));
console.log(
	`[dump-cms-index] wrote ${contentIndex.length} index entries → ${OUTPUT_DIR}/cms-index.json`,
);

const markdownPages = getAllMarkdownPagesFromLocal();
writeFileSync(
	join(OUTPUT_DIR, "markdown-pages.json"),
	JSON.stringify(markdownPages),
);
console.log(
	`[dump-cms-index] wrote ${markdownPages.length} markdown pages → ${OUTPUT_DIR}/markdown-pages.json`,
);
