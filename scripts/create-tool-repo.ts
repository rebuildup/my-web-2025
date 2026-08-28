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
 *   3. scaffolds src/<Name>App.tsx, src/index.ts, README.md, package.json, .gitignore
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

// scaffold src/<Tool>App.tsx (PascalCase), src/index.ts (barrel), README.md,
// package.json (minimal: react 19 + UI workspace link), and .gitignore.
const pascal = TOOL.split("-")
	.map((s) => s.charAt(0).toUpperCase() + s.slice(1))
	.join("");
const appTsx = `export default function ${pascal}App() { return <div>${pascal} placeholder</div>; }\n`;
const indexTs = `export { default } from "./${pascal}App";\nexport * from "./${pascal}App";\n`;
const readme = `# rebuildup/${REPO_NAME}\n\nStandalone ${TOOL} tool. See my-web-2025 spec for embed instructions.\n`;
// Minimal package.json: React 19 + UI workspace link. Tool-specific deps are
// added during Phase 2-N batch source moves; this scaffold is intentionally
// bare so the helper stays single-purpose.
const packageJson =
	JSON.stringify(
		{
			name: `tool-${TOOL}`,
			private: true,
			version: "0.1.0",
			type: "module",
			scripts: {
				dev: "vite",
				build: "tsc -b && vite build",
				typecheck: "tsc -b",
				lint: "biome check .",
				test: "bun run lint && bun run build",
				format: "biome format . --write",
				preview: "vite preview",
			},
			dependencies: {
				"@rebuildup/my-web-tools-ui": "link:../../ui/src",
				react: "^19.2.8",
				"react-dom": "^19.2.8",
			},
			devDependencies: {
				"@biomejs/biome": "^1.9.0",
				"@vitejs/plugin-react": "^4.3.4",
				typescript: "~5.6.2",
				vite: "^6.0.5",
			},
		},
		null,
		"\t",
	) + "\n";
// Standard Vite-scaffold gitignore. Prevents the Batch A near-miss of
// accidentally committing node_modules inside a tool repo.
const gitignore = "node_modules/\n.next/\ndist/\n.vscode/\n*.log\n";
for (const [rel, body] of [
	[`src/${pascal}App.tsx`, appTsx],
	["src/index.ts", indexTs],
	["README.md", readme],
	["package.json", packageJson],
	[".gitignore", gitignore],
] as const) {
	const p = join(REPO_DIR, rel);
	await Bun.write(p, body);
}
run("git", ["add", "-A"], REPO_DIR);
run("git", ["commit", "-m", "feat: scaffold per-tool repo"], REPO_DIR);
// Phase 1 R-1: new tool repos default branch is `main` (GitHub modern default),
// not `master`. The main my-web-2025 repo keeps `master`.
run("git", ["push", "-u", "origin", "main"], REPO_DIR);

console.log(
	`[create-tool-repo] git submodule add ${REPO_URL} ${SUBMODULE_PATH}`,
);
if (!run("git", ["submodule", "add", REPO_URL, SUBMODULE_PATH]))
	process.exit(1);

if (!existsSync(BRIDGE_PATH)) {
	// Bridge imports from the barrel `src/index.ts` (Phase 2-N canonical).
	// TypeScript's bundler resolution maps the bare `src` path to `src/index.ts`.
	const bridge = `"use client";\n\nimport dynamic from "next/dynamic";\n\nconst App = dynamic(() => import("../../../../${SUBMODULE_PATH}/src"), { ssr: false });\n\nexport default function ${pascal}Page() { return <App />; }\n`;
	await Bun.write(BRIDGE_PATH, bridge);
	console.log(`[create-tool-repo] wrote ${BRIDGE_PATH}`);
}

console.log(
	"[create-tool-repo] DONE. Next: bun --bun scripts/install-tools.ts && bun run type-check",
);
