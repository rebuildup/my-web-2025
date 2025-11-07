#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "data");

if (!fs.existsSync(sourceDir)) {
	console.warn(
		`[copy-content-data] Source directory not found at ${sourceDir}. Skipping copy.`,
	);
	process.exit(0);
}

const targets = [
	path.join(projectRoot, ".next", "standalone", "data"),
	path.join(projectRoot, ".next", "server", "data"),
	path.join(projectRoot, ".next", "data"),
];

function copyRecursive(src, dest) {
	fs.rmSync(dest, { recursive: true, force: true });
	fs.mkdirSync(path.dirname(dest), { recursive: true });
	fs.cpSync(src, dest, { recursive: true });
}

const copied = [];
for (const target of targets) {
	const parent = path.dirname(target);
	if (!fs.existsSync(parent)) {
		console.warn(
			`[copy-content-data] Parent directory not found: ${parent}, skipping ${target}`,
		);
		continue;
	}
	try {
		console.log(`[copy-content-data] Copying ${sourceDir} to ${target}...`);
		copyRecursive(sourceDir, target);
		copied.push(target);

		// Verify copy was successful
		if (fs.existsSync(target)) {
			const contentsCount = fs.existsSync(path.join(target, "contents"))
				? fs
						.readdirSync(path.join(target, "contents"))
						.filter((f) => f.endsWith(".db")).length
				: 0;
			console.log(
				`[copy-content-data] ✅ Successfully copied to ${target} (${contentsCount} content databases)`,
			);
		} else {
			console.warn(`[copy-content-data] ⚠️  Warning: ${target} was not created`);
		}
	} catch (error) {
		console.warn(
			`[copy-content-data] Failed to copy data to ${target}:`,
			error,
		);
	}
}

if (copied.length === 0) {
	console.warn(
		"[copy-content-data] No build output directories were available. Run this script after `next build`.",
	);
	console.warn(`[copy-content-data] Checked targets: ${targets.join(", ")}`);
	process.exit(0);
}

console.log(
	"[copy-content-data] Copied data directory to:\n - " + copied.join("\n - "),
);

// Final verification
const standaloneData = path.join(projectRoot, ".next", "standalone", "data");
if (fs.existsSync(standaloneData)) {
	const contentsDir = path.join(standaloneData, "contents");
	if (fs.existsSync(contentsDir)) {
		const dbFiles = fs
			.readdirSync(contentsDir)
			.filter((f) => f.endsWith(".db"));
		console.log(
			`[copy-content-data] ✅ Verification: ${dbFiles.length} content database files found in standalone/data/contents`,
		);
	} else {
		console.warn(
			"[copy-content-data] ⚠️  Warning: contents directory not found in standalone/data",
		);
	}
} else {
	console.warn(
		"[copy-content-data] ⚠️  Warning: standalone/data directory not found",
	);
}
