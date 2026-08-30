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
import {
	getCmsApiBaseUrl,
	shouldUseRustCmsApi,
} from "../src/lib/cms-api/config";

// Direct fetch (NOT `cmsApiFetch` from server-client) because the latter
// pulls in `import "server-only"` which throws when loaded outside a
// Next.js Server Component context — `bun scripts/dump-cms-index.ts` is a
// build-time tool, not a server runtime.
async function fetchJson<T>(path: string): Promise<T> {
	const response = await fetch(`${getCmsApiBaseUrl()}${path}`, {
		headers: { Accept: "application/json" },
	});
	if (!response.ok) {
		throw new Error(
			`[dump-cms-index] CMS API ${path} → HTTP ${response.status} ${response.statusText}`,
		);
	}
	return (await response.json()) as T;
}

const OUTPUT_DIR =
	process.env.CMS_INDEX_OUTPUT_DIR ??
	join(process.cwd(), "node_modules", ".cache", "cms-build");

if (!existsSync(OUTPUT_DIR)) {
	mkdirSync(OUTPUT_DIR, { recursive: true });
}

type RustEntryListItem = {
	id: string;
	entry_type: string;
	status: string;
	visibility: string;
	title: string;
	summary?: string | null;
	lang: string;
	published_at?: string | null;
	created_at: string;
	updated_at: string;
	slug?: string | null;
	thumbnail?: string | null;
	tags?: string | null;
};

type RustMarkdownPage = Record<string, unknown>;

// Shape consumed by `getAllFromIndex()` via `readAllFromIndexJson()`.
// Must match `ContentIndexEntry` in src/cms/lib/content-db-manager.ts.
type ContentIndexEntry = {
	id: string;
	dbFile: string;
	title: string;
	summary: string;
	lang: string;
	status: string;
	visibility: string;
	createdAt: string;
	updatedAt: string;
	publishedAt?: string;
	tags?: string[];
	thumbnails?: Record<string, unknown>;
	seo?: Record<string, unknown>;
};

function rustEntryToIndexEntry(item: RustEntryListItem): ContentIndexEntry {
	const tagList = item.tags
		? item.tags
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean)
		: [];
	const thumbnails = item.thumbnail
		? { image: { src: item.thumbnail } }
		: undefined;
	return {
		id: item.id,
		// dbFile is consumed for source attribution in the admin UI; for
		// Rust-sourced entries the canonical dev bucket is `cms-api-dev.db`.
		dbFile: "cms-api-dev.db",
		title: item.title,
		summary: item.summary ?? "",
		lang: item.lang,
		status: item.status,
		visibility: item.visibility,
		createdAt: item.created_at,
		updatedAt: item.updated_at,
		publishedAt: item.published_at ?? undefined,
		tags: tagList,
		thumbnails,
	};
}

let contentIndex: ContentIndexEntry[];
let markdownPages: RustMarkdownPage[];

if (shouldUseRustCmsApi()) {
	// CI / Cloudflare Pages builds have an empty local SQLite (user-owned,
	// gitignored). With `CMS_USE_RUST_API=1` the source of truth is the
	// Container mounted at $CMS_API_BASE_URL; fetch directly here so the
	// JSON cache that `next build` reads has live data baked in.
	console.log(
		`[dump-cms-index] CMS_USE_RUST_API=1 → fetching from ${process.env.CMS_API_BASE_URL ?? "(default)"}`,
	);
	const rustEntries = await fetchJson<RustEntryListItem[]>("/api/entries");
	contentIndex = rustEntries.map(rustEntryToIndexEntry);
	if (contentIndex.length === 0) {
		throw new Error(
			"[dump-cms-index] Container returned 0 entries — abort build so SSG does not bake an empty portfolio page",
		);
	}
	const rustMarkdown = await fetchJson<RustMarkdownPage[]>(
		"/api/markdown?limit=10000",
	);
	markdownPages = rustMarkdown;
} else {
	console.log("[dump-cms-index] CMS_USE_RUST_API=0 → reading local SQLite");
	contentIndex = getAllFromIndex();
	markdownPages =
		getAllMarkdownPagesFromLocal() as unknown as RustMarkdownPage[];
}

writeFileSync(join(OUTPUT_DIR, "cms-index.json"), JSON.stringify(contentIndex));
console.log(
	`[dump-cms-index] wrote ${contentIndex.length} index entries → ${OUTPUT_DIR}/cms-index.json`,
);

writeFileSync(
	join(OUTPUT_DIR, "markdown-pages.json"),
	JSON.stringify(markdownPages),
);
console.log(
	`[dump-cms-index] wrote ${markdownPages.length} markdown pages → ${OUTPUT_DIR}/markdown-pages.json`,
);
