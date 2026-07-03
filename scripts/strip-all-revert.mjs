#!/usr/bin/env bun
/**
 * Strip `all: "revert"` from `style={{ ... }}` JSX literals throughout src/.
 *
 * Patterns handled:
 *   style={{ all: "revert" }}                              → style={{}}
 *   style={{ all: "revert", x: 1, y: 2 }}                  → style={{ x: 1, y: 2 }}
 *   style={{ a: 1, all: "revert", b: 2 }} (rare)           → style={{ a: 1, b: 2 }}
 *   style={{ a: 1, all: "revert" }}                       → style={{ a: 1 }}
 *
 * After stripping, also cleans up lone `style={{}}` (the prop disappears).
 *
 * The script is intentionally conservative: it only edits properties with the
 * key `all` whose value is the literal string `"revert"`. All other style
 * properties (and surrounding JSX) are left untouched.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const PROJECT_ROOT = process.cwd();
const ROOT = process.argv[2] || "src";

const SKIP_PATH_PATTERNS = [/tools\/ProtoType\//];

function* walk(dir) {
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		const st = statSync(full);
		if (st.isDirectory()) {
			if (entry === "node_modules" || entry.startsWith(".")) continue;
			yield* walk(full);
		} else if (/\.(tsx?|jsx?|css)$/.test(entry)) {
			yield full;
		}
	}
}

// Match `all: "revert"` followed by an optional comma and any trailing whitespace
// (including newlines and indentation). We greedily consume the trailing comma +
// whitespace so that we don't leave a dangling leading comma on the next prop.
const ALL_REVERT_WITH_COMMA = /all:\s*"revert"\s*,\s*/g;
// Match `all: "revert"` as the LAST property (no trailing comma). This is rare in
// JS but possible. We also handle the trailing comma case for completeness.
const ALL_REVERT_NO_COMMA = /,\s*all:\s*"revert"/g;

// After stripping, collapse `style={{  }}` (whitespace-only) and remove the prop.
const EMPTY_STYLE_PROP = /(?<=\s)style=\{\{\s*\}\}/g;

function processContent(content) {
	let next = content;

	// 1. Remove `all: "revert", ` (with trailing comma + whitespace) anywhere.
	next = next.replace(ALL_REVERT_WITH_COMMA, "");

	// 2. Remove `, all: "revert"` (preceded by comma — last property case).
	next = next.replace(ALL_REVERT_NO_COMMA, "");

	// 3. Final pass: lone `all: "revert"` left over (e.g., inside `{{ }}` with
	//    nothing else). Just nuke the property declaration.
	next = next.replace(/all:\s*"revert"/g, "");

	// 4. Clean up resulting `style={{ }}` and `style={{}}` props.
	next = next.replace(EMPTY_STYLE_PROP, "");

	return next;
}

let filesTouched = 0;
let bytesRemoved = 0;

for (const file of walk(join(PROJECT_ROOT, ROOT))) {
	const rel = relative(PROJECT_ROOT, file);
	if (SKIP_PATH_PATTERNS.some((p) => p.test(rel))) continue;
	const before = readFileSync(file, "utf8");
	const after = processContent(before);
	if (after !== before) {
		bytesRemoved += before.length - after.length;
		writeFileSync(file, after, "utf8");
		filesTouched++;
	}
}

console.log(`Files modified: ${filesTouched}`);
console.log(`Bytes removed: ${bytesRemoved}`);
