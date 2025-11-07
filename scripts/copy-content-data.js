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
		continue;
	}
	try {
		copyRecursive(sourceDir, target);
		copied.push(target);
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
	process.exit(0);
}

console.log(
	"[copy-content-data] Copied data directory to:\n - " + copied.join("\n - "),
);
