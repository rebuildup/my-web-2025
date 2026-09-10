#!/usr/bin/env bun
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const host = process.env.CMS_API_HOST || "127.0.0.1";
const port = process.env.CMS_API_PORT || "3001";
const dataDir = process.env.CMS_API_DATA_DIR || "./data/db";
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
const usePrebuilt = existsSync(releaseBinary);

const launchSpec = usePrebuilt
	? {
			label: "prebuilt release binary",
			command: releaseBinary,
			args: [] as string[],
			cwd: cmsApiDir,
		}
	: {
			label: "cargo run (no release binary found)",
			command: "cargo",
			args: ["run"],
			cwd: cmsApiDir,
		};

const specDescription = [launchSpec.command, ...launchSpec.args].join(" ");
console.log(
	`[dev-cms-api] launching via ${launchSpec.label}: ${specDescription}`,
);

const child = spawn(launchSpec.command, launchSpec.args, {
	cwd: launchSpec.cwd,
	stdio: "inherit",
	env: {
		...process.env,
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
