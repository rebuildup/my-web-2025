#!/usr/bin/env bun
import { spawnSync } from "node:child_process";
/**
 * Install each workspace that has its own package.json.
 *
 * Scans:
 * - external/<name>/ (submodule tools)
 * - workers/<name>/ (in-tree workspace packages like workers/router)
 *
 * Runs `bun install` in each. Missing directories or entries without a
 * package.json are skipped with a warning (so this script is safe to run
 * before `git submodule update --init --recursive`).
 *
 * Usage:
 *   bun --bun scripts/install-tools.ts
 *
 * Exit code 0 = all installs succeeded (or were skipped).
 * Exit code 1 = at least one install failed.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const SCAN_ROOTS: ReadonlyArray<{ dir: string; label: string }> = [
	{ dir: join(process.cwd(), "external"), label: "external" },
	{ dir: join(process.cwd(), "workers"), label: "workers" },
];

function listSubDirs(root: string): string[] {
	if (!existsSync(root)) return [];
	return Array.from(
		new Bun.Glob("*/").scanSync({ cwd: root, onlyFiles: false }),
	);
}

function installOne(rootDir: string, name: string): boolean {
	const dir = join(rootDir, name);
	const marker = join(dir, "package.json");
	if (!existsSync(marker)) {
		console.warn(`[install-tools] skip ${name}: no package.json`);
		return true;
	}
	console.log(`[install-tools] bun install in ${name}`);
	const result = spawnSync("bun", ["install", "--ignore-scripts"], {
		cwd: dir,
		stdio: "inherit",
		env: process.env,
	});
	return result.status === 0;
}

let total = 0;
let failed = 0;
let didAny = false;

for (const { dir, label } of SCAN_ROOTS) {
	if (!existsSync(dir)) {
		console.log(`[install-tools] no ${label}/ directory, skipping`);
		continue;
	}
	const names = listSubDirs(dir);
	if (names.length === 0) {
		console.log(`[install-tools] no entries under ${label}/`);
		continue;
	}
	for (const name of names) {
		didAny = true;
		total += 1;
		if (!installOne(dir, name)) failed += 1;
	}
}

if (!didAny) {
	console.log("[install-tools] no installable workspaces found");
	process.exit(0);
}
if (failed > 0) {
	console.error(
		`[install-tools] ${failed}/${total} workspace(s) failed to install`,
	);
	process.exit(1);
}
console.log(`[install-tools] all ${total} workspace(s) OK`);
