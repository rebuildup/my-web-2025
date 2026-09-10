#!/usr/bin/env bun
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Build the Rust CMS API as a release binary.
 *
 * Runs `cargo build --release --locked` against `apps/cms-api/`. The
 * `--release --locked` flag pair mirrors `apps/cms-api/Dockerfile` line 19
 * so the local binary and the production container artifact are produced
 * by identical cargo invocations.
 *
 * Output: `apps/cms-api/target/release/cms-api`. Run it directly with
 * `bun run dev:cms-api`, which prefers this binary and falls back to
 * `cargo run` when it is missing.
 *
 * Usage:
 *   bun run cms-api:build
 *
 * Exit code 0 = release binary present. Non-zero = `cargo` failed or
 * is missing; in the missing case, the error message points at rustup.
 */

const repoRoot = path.resolve(import.meta.dir, "..");
const manifestPath = path.join(repoRoot, "apps", "cms-api", "Cargo.toml");

if (!existsSync(manifestPath)) {
	console.error(`[build-cms-api] Cargo manifest not found at ${manifestPath}.`);
	console.error("[build-cms-api] Run this script from the repository root.");
	process.exit(1);
}

const child = spawn(
	"cargo",
	["build", "--release", "--locked", "--manifest-path", manifestPath],
	{
		cwd: repoRoot,
		stdio: "inherit",
	},
);

child.on("error", (error) => {
	console.error(
		"[build-cms-api] Failed to start `cargo`. Install Rust via rustup:",
	);
	console.error(
		'  curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal',
	);
	console.error(error);
	process.exit(1);
});

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 1);
});
