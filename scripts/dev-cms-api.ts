import { spawn } from "node:child_process";
import path from "node:path";

const host = process.env.CMS_API_HOST || "127.0.0.1";
const port = process.env.CMS_API_PORT || "3001";
const dataDir = process.env.CMS_API_DATA_DIR || "./data/db";
// The per-content CMS DBs live at `<repo>/data/contents/` and the Rust binary
// is `cargo run`'d from `./apps/cms-api/`, so its cwd is `./apps/cms-api/`.
// Without an explicit override, `cms_api_content_data_dir()` falls back to
// `cwd/data/contents` = `apps/cms-api/data/contents/`, which doesn't exist
// in dev — uploads then fail with SQLITE_CANTOPEN (14) "unable to open
// database file". Mirror production by resolving the dir relative to the
// repo root. (Production PM2 runs with `cwd: /var/www/yusuke-kim` so its
// `cwd/data/contents` already matches.)
const repoRoot = path.resolve(import.meta.dir, "..");
const contentDataDir =
	process.env.CMS_API_CONTENT_DATA_DIR ||
	path.join(repoRoot, "data", "contents");

const command = "cargo";
const args = ["run"];

const child = spawn(command, args, {
	cwd: "./apps/cms-api",
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
	console.error(
		"[dev-cms-api] Failed to start Rust CMS API. Install Rust and Cargo, then try again.",
	);
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
