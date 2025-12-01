#!/usr/bin/env node
/**
 * Manually sync the embedded ProtoType game with the upstream GitHub repository.
 *
 * What it does:
 * 1. shallow-clone https://github.com/rebuildup/ProtoType.git into a temp dir
 * 2. copy its `prototype-src` folder over `src/app/tools/ProtoType/prototype-src`
 *    (overwrites existing files)
 * 3. writes the latest commit hash into src/app/tools/ProtoType/VERSION
 *
 * Usage: pnpm proto:sync  (or npm run proto:sync)
 */
const {
	mkdtempSync,
	rmSync,
	cpSync,
	writeFileSync,
	existsSync,
} = require("node:fs");
const { tmpdir } = require("node:os");
const { join, resolve } = require("node:path");
const { execSync } = require("node:child_process");

const REPO = "https://github.com/rebuildup/ProtoType.git";
const TARGET = resolve(__dirname, "../src/app/tools/ProtoType/prototype-src");
const VERSION_FILE = resolve(__dirname, "../src/app/tools/ProtoType/VERSION");

function run(cmd, options = {}) {
	return execSync(cmd, { stdio: "inherit", ...options });
}

function main() {
	const tmp = mkdtempSync(join(tmpdir(), "proto-sync-"));
	console.log(`Cloning ${REPO} to ${tmp}`);
	run(`git clone --depth 1 ${REPO} ${tmp}`);

	const src = join(tmp, "prototype-src");
	if (!existsSync(src)) {
		throw new Error(`prototype-src not found in cloned repo: ${src}`);
	}

	console.log(`Replacing ${TARGET} with upstream contents...`);
	rmSync(TARGET, { recursive: true, force: true });
	cpSync(src, TARGET, { recursive: true });

	// store current commit hash for traceability
	const hash = execSync("git rev-parse HEAD", { cwd: tmp }).toString().trim();
	writeFileSync(
		VERSION_FILE,
		`Upstream: ${REPO}\nCommit: ${hash}\nSyncedAt: ${new Date().toISOString()}\n`,
		"utf8",
	);

	console.log("Done. Updated prototype-src and VERSION file.");
	rmSync(tmp, { recursive: true, force: true });
}

try {
	main();
} catch (err) {
	console.error("Sync failed:", err.message || err);
	process.exit(1);
}
