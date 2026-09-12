#!/usr/bin/env bun
import { spawn } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const SOURCE_EXCLUDE_NAMES: ReadonlySet<string> = new Set([
	// Cargo's own build output — never compare the binary against itself.
	"target",
	// `.git` and `.cargo` are workspace bookkeeping, not Rust source.
	".git",
]);

/**
 * Walk `dir` recursively and return the newest mtime (epoch ms) of any
 * regular file inside it. Names listed in `exclude` are skipped
 * recursively so we never descend into `target/` or similar build trees.
 */
function findNewestMtimeMs(dir: string, exclude: ReadonlySet<string>): number {
	let max = 0;
	const walk = (current: string): void => {
		for (const entry of readdirSync(current, { withFileTypes: true })) {
			if (exclude.has(entry.name)) continue;
			const full = path.join(current, entry.name);
			if (entry.isDirectory()) {
				walk(full);
				continue;
			}
			if (!entry.isFile()) continue;
			const st = statSync(full);
			if (st.mtimeMs > max) max = st.mtimeMs;
		}
	};
	walk(dir);
	return max;
}

const host = process.env.CMS_API_HOST || "127.0.0.1";
const port = process.env.CMS_API_PORT || "3001";
const dataDir = process.env.CMS_API_DATA_DIR || "./data/db";
// Default local dev to skipping R2 hydrate / write-back so a fresh checkout
// boots without R2 credentials. Set `SKIP_R2=0` to force R2 sync locally
// (requires `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`).
const skipR2 = process.env.SKIP_R2 ?? "1";
// The per-content CMS DBs live at `<repo>/data/contents/` and the Rust binary
// is run from `./apps/cms-api/`'s cwd. Without an explicit override,
// `cms_api_content_data_dir()` falls back to `cwd/data/contents` =
// `apps/cms-api/data/contents/`, which doesn't exist in dev — uploads then
// fail with SQLITE_CANTOPEN (14) "unable to open database file". Mirror
// production by resolving the dir relative to the repo root. (Production
// PM2 runs with `cwd: /var/www/yusuke-kim` so its `cwd/data/contents`
// already matches.)
const repoRoot = path.resolve(import.meta.dir, "..");
const contentDataDir =
	process.env.CMS_API_CONTENT_DATA_DIR ||
	path.join(repoRoot, "data", "contents");

const cmsApiDir = path.join(repoRoot, "apps", "cms-api");
const releaseBinary =
	process.platform === "win32"
		? path.join(cmsApiDir, "target", "release", "cms-api.exe")
		: path.join(cmsApiDir, "target", "release", "cms-api");

// Decide between the prebuilt release binary and `cargo run`. A prebuilt
// binary only wins when it is *fresher* than every tracked source file
// under `apps/cms-api/` — otherwise we'd happily run stale code after a
// Rust edit. Stale detection walks the workspace and skips `target/`
// (so the binary's own mtime never enters the comparison) and `.git/`.
const usePrebuilt = existsSync(releaseBinary);
const sourceNewestMtimeMs = findNewestMtimeMs(cmsApiDir, SOURCE_EXCLUDE_NAMES);
const releaseBinaryMtimeMs = usePrebuilt ? statSync(releaseBinary).mtimeMs : 0;
const prebuiltIsStale =
	usePrebuilt && sourceNewestMtimeMs > releaseBinaryMtimeMs;

const launchSpec =
	usePrebuilt && !prebuiltIsStale
		? {
				label: "prebuilt release binary",
				command: releaseBinary,
				args: [] as string[],
				cwd: cmsApiDir,
			}
		: {
				label: prebuiltIsStale
					? "cargo run (release binary is stale)"
					: "cargo run (no release binary found)",
				command: "cargo",
				args: ["run"],
				cwd: cmsApiDir,
			};

if (prebuiltIsStale) {
	console.log(
		`[dev-cms-api] source newer than release binary, falling back to cargo run`,
	);
}

const specDescription = [launchSpec.command, ...launchSpec.args].join(" ");
console.log(
	`[dev-cms-api] launching via ${launchSpec.label}: ${specDescription}`,
);

const child = spawn(launchSpec.command, launchSpec.args, {
	cwd: launchSpec.cwd,
	stdio: "inherit",
	env: {
		...process.env,
		SKIP_R2: skipR2,
		CMS_API_HOST: host,
		CMS_API_PORT: port,
		CMS_API_DATA_DIR: dataDir,
		CMS_API_CONTENT_DATA_DIR: contentDataDir,
	},
});

child.on("error", (error) => {
	if (launchSpec.command === "cargo") {
		console.error(
			"[dev-cms-api] Failed to start Rust CMS API. To skip this cargo invocation on subsequent runs, install Rust via rustup and run `bun run cms-api:build`:",
		);
		console.error(
			'  curl --proto "=https" --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal',
		);
	} else {
		console.error(
			`[dev-cms-api] Failed to start prebuilt binary at ${releaseBinary}. Re-run \`bun run cms-api:build\` to refresh it.`,
		);
	}
	console.error(error);
	process.exit(1);
});

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 0);
});
