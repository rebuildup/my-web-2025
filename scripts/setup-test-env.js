#!/usr/bin/env node

// Extend Jest matchers (e.g., toBeInTheDocument)
try {
	require("@testing-library/jest-dom");
} catch (_) {}

const fs = require("node:fs");
const path = require("node:path");

console.log("Setting up test environment...");

// Create required directories
const directories = [
	"public/data/content",
	"public/data/stats",
	"public/data/cache",
	"public/data/logs",
	"public/images",
	"public/videos",
	"public/downloads",
	"public/favicons",
];

directories.forEach((dir) => {
	const fullPath = path.join(process.cwd(), dir);
	if (!fs.existsSync(fullPath)) {
		fs.mkdirSync(fullPath, { recursive: true });
		console.log(`✅ Created directory: ${dir}`);
	} else {
		console.log(`✅ Directory exists: ${dir}`);
	}
});

// Create required JSON files
const jsonFiles = {
	"public/data/content/portfolio.json": [],
	"public/data/content/blog.json": [],
	"public/data/content/plugin.json": [],
	"public/data/content/download.json": [],
	"public/data/content/tool.json": [],
	"public/data/content/profile.json": [],
	"public/data/stats/view-stats.json": {},
	"public/data/stats/download-stats.json": {},
	"public/data/stats/search-stats.json": {},
	"public/data/cache/performance.json": {
		lastBuildTime: new Date().toISOString(),
		cacheHitRate: 0.85,
		averageLoadTime: 1200,
	},
};

Object.entries(jsonFiles).forEach(([filePath, content]) => {
	const fullPath = path.join(process.cwd(), filePath);
	if (!fs.existsSync(fullPath)) {
		fs.writeFileSync(fullPath, JSON.stringify(content, null, 2));
		console.log(`✅ Created file: ${filePath}`);
	} else {
		console.log(`✅ File exists: ${filePath}`);
	}
});

// Create manifest.json if it doesn't exist
const manifestPath = path.join(process.cwd(), "public/manifest.json");
if (!fs.existsSync(manifestPath)) {
	const manifest = {
		name: "samuido Portfolio",
		short_name: "samuido",
		description: "Creative Portfolio and Development Works",
		start_url: "/",
		display: "standalone",
		background_color: "#181818",
		theme_color: "#0000ff",
		icons: [
			{
				src: "/favicons/favicon-192x192.png",
				sizes: "192x192",
				type: "image/png",
			},
		],
	};
	fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
	console.log("✅ Created manifest.json");
}

// Create basic favicon files if they don't exist
const faviconFiles = [
	"public/favicons/favicon.ico",
	"public/favicons/favicon.svg",
	"public/favicons/favicon-32x32.png",
	"public/favicons/favicon-192x192.png",
];

faviconFiles.forEach((filePath) => {
	const fullPath = path.join(process.cwd(), filePath);
	if (!fs.existsSync(fullPath)) {
		// Create empty files for CI/CD
		fs.writeFileSync(fullPath, "");
		console.log(`✅ Created placeholder: ${filePath}`);
	}
});

// Suppress baseline-browser-mapping warnings
const originalWarn = console.warn;
console.warn = (...args) => {
	const message = args.join(" ");
	if (message.includes("baseline-browser-mapping")) {
		return; // Suppress baseline-browser-mapping warnings
	}
	originalWarn(...args);
};

console.log("✅ Test environment setup completed");
