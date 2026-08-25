#!/usr/bin/env bun
/**
 * Install each submodule under external/.
 *
 * Runs `bun install` in each submodule directory. Skips empty/missing
 * submodule checkouts with a warning (so this script is safe to run before
 * `git submodule update --init --recursive`).
 *
 * Usage:
 *   bun --bun scripts/install-tools.ts
 *
 * Exit code 0 = all installs succeeded (or were skipped).
 * Exit code 1 = at least one install failed.
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const EXTERNAL_DIR = join(process.cwd(), "external");

function listSubmoduleDirs(): string[] {
	if (!existsSync(EXTERNAL_DIR)) return [];
	return Array.from(
		new Bun.Glob("*/").scanSync({ cwd: EXTERNAL_DIR, onlyFiles: false }),
	);
}

function installOne(name: string): boolean {
	const dir = join(EXTERNAL_DIR, name);
	const marker = join(dir, "package.json");
	if (!existsSync(marker)) {
		console.warn(`[install-tools] skip ${name}: no package.json`);
		return true;
	}
	console.log(`[install-tools] bun install in ${name}`);
	const result = spawnSync("bun", ["install"], {
		cwd: dir,
		stdio: "inherit",
		env: process.env,
	});
	return result.status === 0;
}

const dirs = listSubmoduleDirs();
if (dirs.length === 0) {
	console.log("[install-tools] no submodules found under external/");
	process.exit(0);
}

let failed = 0;
for (const name of dirs) {
	if (!installOne(name)) failed += 1;
}

if (failed > 0) {
	console.error(`[install-tools] ${failed} submodule(s) failed to install`);
	process.exit(1);
}
console.log("[install-tools] all submodules OK");
