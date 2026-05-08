#!/usr/bin/env bun
/**
 * Merge dependencies from an external project's package.json
 * into the root package.json, skipping build-only dependencies.
 *
 * Usage:
 *   bun scripts/merge-deps.mjs <path-to-external-package.json> [--dry-run]
 *
 * Examples:
 *   bun scripts/merge-deps.mjs src/app/tools/ProtoType/package.json
 *   bun scripts/merge-deps.mjs src/app/tools/ProtoType/package.json --dry-run
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

// Packages to skip (build tools, not needed at runtime in Next.js)
const SKIP_PACKAGES = new Set([
	"vite",
	"@vitejs/plugin-react",
	"@vitejs/plugin-vue",
	"vite-plugin-*",
	"typescript",
	"@types/*",
	"ts-node",
	"tslib",
	"eslint",
	"eslint-*",
	"@eslint/*",
	"prettier",
	"prettier-*",
	"@biomejs/biome",
	"jest",
	"jest-*",
	"@jest/*",
	"@testing-library/*",
	"vitest",
	"@vitest/*",
	"playwright",
]);

// Packages that should go to devDependencies
const _DEV_ONLY_PACKAGES = new Set([]);

function shouldSkip(pkg) {
	for (const pattern of SKIP_PACKAGES) {
		if (pattern.endsWith("/*")) {
			if (pkg.startsWith(pattern.slice(0, -1))) return true;
		} else if (pkg === pattern) {
			return true;
		}
	}
	return false;
}

function semverGte(a, b) {
	// Simple version comparison - returns true if a >= b
	const parse = (v) =>
		v
			.replace(/^[\^~>=<\s]/g, "")
			.split(".")
			.map(Number);
	const pa = parse(a);
	const pb = parse(b);
	for (let i = 0; i < 3; i++) {
		if ((pa[i] || 0) > (pb[i] || 0)) return true;
		if ((pa[i] || 0) < (pb[i] || 0)) return false;
	}
	return true;
}

async function main() {
	const args = process.argv.slice(2);
	const dryRun = args.includes("--dry-run");
	const filePath = args.find((a) => !a.startsWith("--"));

	if (!filePath) {
		console.error(
			"Usage: bun scripts/merge-deps.mjs <package.json-path> [--dry-run]",
		);
		process.exit(1);
	}

	const externalPath = resolve(process.cwd(), filePath);
	const rootPath = resolve(process.cwd(), "package.json");

	console.log(`\nReading external: ${externalPath}`);
	console.log(`Reading root:     ${rootPath}\n`);

	const external = JSON.parse(await readFile(externalPath, "utf-8"));
	const root = JSON.parse(await readFile(rootPath, "utf-8"));

	const externalDeps = {
		...external.dependencies,
		...external.devDependencies,
	};
	const rootDeps = root.dependencies || {};
	const rootDevDeps = root.devDependencies || {};

	const toAdd = [];
	const conflicts = [];
	const skipped = [];

	for (const [pkg, version] of Object.entries(externalDeps)) {
		if (shouldSkip(pkg)) {
			skipped.push({ pkg, reason: "build-only/dev tool" });
			continue;
		}

		if (rootDeps[pkg]) {
			if (!semverGte(rootDeps[pkg], version)) {
				conflicts.push({ pkg, root: rootDeps[pkg], external: version });
			}
			// Already exists with sufficient version, skip
			continue;
		}

		if (rootDevDeps[pkg]) {
			// Already in devDeps, skip
			skipped.push({ pkg, reason: "already in devDependencies" });
			continue;
		}

		toAdd.push({ pkg, version });
	}

	// Report
	console.log("=== Packages to add ===");
	if (toAdd.length === 0) {
		console.log("  (none - all dependencies already satisfied)");
	} else {
		for (const { pkg, version } of toAdd) {
			console.log(`  ${pkg}@${version}`);
		}
	}

	console.log("\n=== Version conflicts (root < external) ===");
	if (conflicts.length === 0) {
		console.log("  (none)");
	} else {
		for (const { pkg, root: rv, external: ev } of conflicts) {
			console.log(`  ${pkg}: root=${rv} < external=${ev}`);
		}
	}

	console.log(`\n=== Skipped (${skipped.length}) ===`);
	for (const { pkg, reason } of skipped.slice(0, 10)) {
		console.log(`  ${pkg}: ${reason}`);
	}
	if (skipped.length > 10) {
		console.log(`  ... and ${skipped.length - 10} more`);
	}

	if (dryRun) {
		console.log("\n[Dry run] No changes made.");
		return;
	}

	if (toAdd.length === 0 && conflicts.length === 0) {
		console.log("\nNo changes needed.");
		return;
	}

	// Apply changes
	root.dependencies = root.dependencies || {};
	for (const { pkg, version } of toAdd) {
		root.dependencies[pkg] = version;
	}

	await writeFile(rootPath, `${JSON.stringify(root, null, "\t")}\n`, "utf-8");
	console.log(`\nUpdated ${rootPath} with ${toAdd.length} new dependencies.`);
	console.log("Run 'bun install' to install.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
