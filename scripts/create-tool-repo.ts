#!/usr/bin/env bun
/**
 * create-tool-repo — bootstrap a new per-tool repo + register it as a submodule.
 *
 * Usage:
 *   bun --bun scripts/create-tool-repo.ts <tool-slug> [--org rebuildup] [--visibility public]
 *
 * Side effects:
 *   1. gh repo create <org>/tool-<slug> --public --description "..." --license MIT
 *   2. clones <org>/tool-<slug> into ../tool-<slug>-work/
 *   3. scaffolds src/<Name>App.tsx, src/index.ts, README.md, LICENSE
 *   4. in my-web-2025: git submodule add <repo-url> external/<slug>
 *   5. writes a stub bridge at src/app/tools/<slug>/page.tsx if it does not exist
 *
 * Idempotent: refuses to overwrite an existing repo, existing submodule, or existing bridge.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const TOOL = process.argv[2];
const ORG = process.env.TOOL_REPO_ORG ?? "rebuildup";
const VIS = process.env.TOOL_REPO_VISIBILITY ?? "public";

if (!TOOL || !/^[a-z0-9-]+$/.test(TOOL)) {
	console.error("usage: bun --bun scripts/create-tool-repo.ts <tool-slug>");
	process.exit(2);
}

const REPO_NAME = `tool-${TOOL}`;
const REPO_URL = `https://github.com/${ORG}/${REPO_NAME}.git`;
const REPO_DIR = join(process.cwd(), "..", `${REPO_NAME}-work`);
const SUBMODULE_PATH = `external/${TOOL}`;
const BRIDGE_PATH = `src/app/tools/${TOOL}/page.tsx`;

function run(cmd: string, args: string[], cwd?: string) {
	const r = spawnSync(cmd, args, { cwd, stdio: "inherit", env: process.env });
	return r.status === 0;
}

if (existsSync(REPO_DIR)) {
	console.error(`refusing: ${REPO_DIR} already exists`);
	process.exit(1);
}
if (existsSync(SUBMODULE_PATH)) {
	console.error(`refusing: ${SUBMODULE_PATH} already exists`);
	process.exit(1);
}

console.log(`[create-tool-repo] gh repo create ${ORG}/${REPO_NAME} --${VIS}`);
if (
	!run("gh", [
		"repo",
		"create",
		`${ORG}/${REPO_NAME}`,
		`--${VIS}`,
		"--license",
		"MIT",
		"--add-readme",
		"--confirm",
	])
)
	process.exit(1);

console.log(`[create-tool-repo] cloning into ${REPO_DIR}`);
if (!run("git", ["clone", REPO_URL, REPO_DIR])) process.exit(1);

// scaffold src/<Tool>App.tsx (PascalCase) and src/index.ts
const pascal = TOOL.split("-")
	.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
	.join("");
const appTsx = `export default function ${pascal}App() { return <div>${pascal} placeholder</div>; }\n`;
const indexTs = `export { default } from "./${pascal}App";\nexport * from "./${pascal}App";\n`;
const readme = `# rebuildup/${REPO_NAME}\n\nStandalone ${TOOL} tool. See my-web-2025 spec for embed instructions.\n`;
for (const [rel, body] of [
	[`src/${pascal}App.tsx`, appTsx],
	["src/index.ts", indexTs],
	["README.md", readme],
] as const) {
	const p = join(REPO_DIR, rel);
	await Bun.write(p, body);
}
run("git", ["add", "-A"], REPO_DIR);
run("git", ["commit", "-m", "feat: scaffold per-tool repo"], REPO_DIR);
run("git", ["push", "origin", "master"], REPO_DIR);

console.log(
	`[create-tool-repo] git submodule add ${REPO_URL} ${SUBMODULE_PATH}`,
);
if (!run("git", ["submodule", "add", REPO_URL, SUBMODULE_PATH]))
	process.exit(1);

if (!existsSync(BRIDGE_PATH)) {
	const bridge = `"use client";\n\nimport dynamic from "next/dynamic";\n\nconst App = dynamic(() => import("../../../../${SUBMODULE_PATH}/src/${pascal}App"), { ssr: false });\n\nexport default function ${pascal}Page() { return <App />; }\n`;
	await Bun.write(BRIDGE_PATH, bridge);
	console.log(`[create-tool-repo] wrote ${BRIDGE_PATH}`);
}

console.log(
	"[create-tool-repo] DONE. Next: bun --bun scripts/install-tools.ts && bun run type-check",
);
