#!/usr/bin/env bun
/**
 * Cloudflare Pages build orchestration.
 *
 * Steps:
 *   1. Ensure git submodules are synced.
 *   2. Run `bun install --frozen-lockfile`.
 *   3. Run `bun --bun scripts/install-tools.ts` (tool submodule deps).
 *   4. Run `bun scripts/check-env.js` (env validation).
 *   5. Run `bun --bun next build` (static export → out/).
 *   6. Run `bun scripts/copy-content-data.js` (DB copy for build-time).
 *   7. Run `cargo build --release --manifest-path apps/cms-api/Cargo.toml`.
 *      (Cloudflare Containers wraps this via the Dockerfile in Task 14.)
 *
 * Exits non-zero on any failure. Intended to be set as the Pages build command
 * in Cloudflare Dashboard → Settings → Builds → Build command.
 */

import { spawnSync } from "node:child_process";

type Step = { name: string; cmd: string[]; cwd?: string };

const STEPS: Step[] = [
	{
		name: "submodule sync",
		cmd: ["git", "submodule", "update", "--init", "--recursive"],
	},
	{
		name: "bun install",
		cmd: ["bun", "install", "--frozen-lockfile"],
	},
	{
		name: "tool submodule deps",
		cmd: ["bun", "--bun", "scripts/install-tools.ts"],
	},
	{
		name: "env check",
		cmd: ["bun", "scripts/check-env.js"],
	},
	{
		name: "next build",
		cmd: ["bun", "--bun", "next", "build"],
	},
	{
		name: "copy content data",
		cmd: ["bun", "scripts/copy-content-data.js"],
	},
	{
		name: "cargo release build",
		cmd: [
			"cargo",
			"build",
			"--release",
			"--locked",
			"--manifest-path",
			"apps/cms-api/Cargo.toml",
		],
	},
];

function run(s: Step): void {
	console.log(`\n=== ${s.name} ===`);
	const [cmd, ...args] = s.cmd;
	if (!cmd) throw new Error(`Step "${s.name}" has no command`);
	const r = spawnSync(cmd, args, {
		cwd: s.cwd ?? process.cwd(),
		stdio: "inherit",
		env: process.env,
	});
	if (r.status !== 0) {
		console.error(`Step "${s.name}" failed with exit ${r.status}`);
		process.exit(r.status ?? 1);
	}
}

for (const s of STEPS) run(s);

console.log("\n=== build-cloudflare complete ===");
console.log("Artifact: ./out/  (Static Assets)");
console.log(
	"Artifact: ./apps/cms-api/target/release/cms-api  (Container binary)",
);
