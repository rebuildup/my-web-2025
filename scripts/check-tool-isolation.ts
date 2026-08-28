#!/usr/bin/env bun
/**
 * check-tool-isolation — verify Phase 2-N bridges + submodule hygiene.
 *
 * Asserts:
 *   1. No cross-root @/ imports inside any per-tool submodule tree
 *   2. Every per-tool bridge uses canonical shape (next/dynamic ssr:false,
 *      4-dot barrel import, no notFound/metadata/JSON-LD, ≤16 lines)
 *   3. Every per-tool submodule has package.json with name=@rebuildup/tool-<slug>
 *
 * Exit 0 on success, 1 on first violation.
 *
 * Known exceptions (documented Phase 1 carry-overs):
 *   - external/ui/   : shared UI library placeholder, not a tool (name=@rebuildup/my-web-tools-ui)
 *   - external/prototype/ : Phase 1 Vite sub-project, package name "prototype", 5-dot bridge path
 *   - src/app/tools/ProtoType/page.tsx : Phase 1 bridge with loading callback + 5-dot path
 *
 * Usage: bun --bun scripts/check-tool-isolation.ts
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const EXTERNAL = join(ROOT, "external");
const BRIDGES = join(ROOT, "src", "app", "tools");

// Submodules that are NOT per-tool repos (UI placeholder, Phase 1 prototype).
const TOOL_SUBMODULE_EXCEPTIONS = new Set<string>(["ui", "prototype"]);
const BRIDGE_EXCEPTIONS = new Set<string>(["ProtoType"]);

type CheckResult = { ok: boolean; errors: string[] };

function relPath(p: string): string {
	const root = ROOT.replace(/\\/g, "/");
	return p.replace(/\\/g, "/").replace(`${root}/`, "");
}

function listDirs(p: string): string[] {
	try {
		return readdirSync(p).filter((n) => statSync(join(p, n)).isDirectory());
	} catch {
		return [];
	}
}

function walkFiles(p: string, exts: string[]): string[] {
	const out: string[] = [];
	const recurse = (dir: string): void => {
		let entries: string[];
		try {
			entries = readdirSync(dir);
		} catch {
			return;
		}
		for (const name of entries) {
			const full = join(dir, name);
			const st = statSync(full);
			if (st.isDirectory()) recurse(full);
			else if (exts.some((e) => name.endsWith(e))) out.push(full);
		}
	};
	try {
		if (!statSync(p).isDirectory()) return [];
	} catch {
		return [];
	}
	recurse(p);
	return out;
}

/** Check #1 — No cross-root @/ imports inside per-tool submodule src trees. */
function checkNoCrossRootImports(): CheckResult {
	const errors: string[] = [];
	const slugs = listDirs(EXTERNAL).filter(
		(s) => !TOOL_SUBMODULE_EXCEPTIONS.has(s),
	);
	for (const slug of slugs) {
		const src = join(EXTERNAL, slug, "src");
		const files = walkFiles(src, [".ts", ".tsx"]);
		for (const file of files) {
			const text = readFileSync(file, "utf8");
			// Match `from "@/...` import specifiers (cross-root would resolve
			// to parent ./src/, which is forbidden inside a submodule).
			const matches = text.match(/from\s+["']@\//g);
			if (matches) {
				for (let i = 0; i < matches.length; i++) {
					errors.push(
						`cross-root @/ import in ${relPath(file)} (match ${i + 1}/${matches.length})`,
					);
				}
			}
		}
	}
	return { ok: errors.length === 0, errors };
}

/** Check #2 — Every per-tool bridge uses canonical shape. */
function checkBridgeShape(): CheckResult {
	const errors: string[] = [];
	const dirs = listDirs(BRIDGES).filter((d) => !BRIDGE_EXCEPTIONS.has(d));
	for (const dir of dirs) {
		const bridge = join(BRIDGES, dir, "page.tsx");
		try {
			if (!statSync(bridge).isFile()) continue;
		} catch {
			continue;
		}
		const text = readFileSync(bridge, "utf8");
		const rel = relPath(bridge);
		// 2a. Must use next/dynamic
		if (!/dynamic\s*\(/.test(text)) {
			errors.push(`${rel}: missing next/dynamic(...)`);
			continue;
		}
		// 2b. ssr: false required
		if (!/ssr:\s*false/.test(text)) {
			errors.push(`${rel}: missing ssr: false`);
		}
		// 2c. 4-dot barrel import from external/<slug>/src
		if (!/import\(\s*["']\.\.\/\.\.\/\.\.\/\.\.\/external\//.test(text)) {
			errors.push(
				`${rel}: missing 4-dot barrel import from external/<slug>/src`,
			);
		}
		// 2d. Forbidden constructs (canonical bridges must stay minimal)
		if (/notFound\s*\(/.test(text)) {
			errors.push(`${rel}: contains notFound()`);
		}
		if (/application\/ld\+json/.test(text)) {
			errors.push(`${rel}: contains JSON-LD`);
		}
		// 2e. Line count ≤ 16
		const lineCount = text.split("\n").length;
		if (lineCount > 16) {
			errors.push(`${rel}: ${lineCount} lines > 16 (canonical max)`);
		}
	}
	return { ok: errors.length === 0, errors };
}

/** Check #3 — Every per-tool submodule has package.json named @rebuildup/tool-<slug>. */
function checkSubmoduleNaming(): CheckResult {
	const errors: string[] = [];
	const dirs = listDirs(EXTERNAL);
	for (const dir of dirs) {
		if (TOOL_SUBMODULE_EXCEPTIONS.has(dir)) continue;
		const pkg = join(EXTERNAL, dir, "package.json");
		try {
			if (!statSync(pkg).isFile()) {
				errors.push(`external/${dir}/: missing package.json`);
				continue;
			}
		} catch {
			errors.push(`external/${dir}/: missing package.json`);
			continue;
		}
		const json = JSON.parse(readFileSync(pkg, "utf8"));
		const expected = `@rebuildup/tool-${dir}`;
		if (json.name !== expected) {
			errors.push(
				`external/${dir}/package.json: name="${json.name}", expected="${expected}"`,
			);
		}
	}
	return { ok: errors.length === 0, errors };
}

const checks: ReadonlyArray<readonly [string, () => CheckResult]> = [
	[
		"1. No cross-root @/ imports in per-tool submodules",
		checkNoCrossRootImports,
	],
	[
		"2. Canonical bridge shape (dynamic + ssr:false + 4-dot barrel)",
		checkBridgeShape,
	],
	[
		"3. Per-tool submodule package.json naming (@rebuildup/tool-<slug>)",
		checkSubmoduleNaming,
	],
];

let totalErrors = 0;
for (const [name, fn] of checks) {
	const r = fn();
	if (r.ok) {
		console.log(`[OK]   ${name}`);
	} else {
		console.error(`[FAIL] ${name}`);
		for (const e of r.errors) console.error(`       - ${e}`);
		totalErrors += r.errors.length;
	}
}

if (totalErrors > 0) {
	console.error(
		`\n[check-tool-isolation] ${totalErrors} violation(s) — see AGENTS.md §14 for canonical shape`,
	);
	process.exit(1);
}
console.log("\n[check-tool-isolation] all 3 checks passed");
