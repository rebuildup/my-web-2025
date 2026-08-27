#!/usr/bin/env bun
/**
 * Cloudflare Pages build orchestration.
 *
 * Steps:
 *   1. Ensure git submodules are synced.
 *   2. Run `bun install --frozen-lockfile`.
 *   3. Run `bun --bun scripts/install-tools.ts` (tool submodule deps).
 *   4. Run `bun scripts/check-env.js` (env validation).
 *   5. Run `bun next build` (static export → out/).
 *   6. Run `bun scripts/copy-content-data.js` (DB copy for build-time).
 *
 * Exits non-zero on any failure. Intended to be set as the Pages build command
 * in Cloudflare Dashboard → Settings → Builds → Build command.
 *
 * Note: Rust build is intentionally NOT part of this script. Cloudflare
 * Pages ships Bun + Node, not a Rust toolchain. The cms-api Container image
 * is built by Cloudflare Containers at Workers deploy time using the
 * Dockerfile in apps/cms-api/Dockerfile. Rust validation is covered by the
 * local canonical gate (cargo check / clippy / test).
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
		// Drop `--bun` on Cloudflare's Linux env: Bun's CJS wrapper is incompatible
		// with Next.js 16 Turbopack runtime ("Expected CommonJS module to have a
		// function wrapper"). Falling back to Node 22 keeps page-data workers stable.
		cmd: ["bun", "next", "build"],
	},
	{
		name: "copy content data",
		cmd: ["bun", "scripts/copy-content-data.js"],
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
console.log("Artifact: ./out/  (Static Assets for Cloudflare Pages)");
console.log(
	"Note: Container image is built by Cloudflare Containers at Workers deploy time",
);
