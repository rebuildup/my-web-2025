/**
 * Lighthouse Audit Script (CommonJS)
 * Run Lighthouse audits on all public pages
 */

const { execSync } = require("node:child_process");
const { writeFileSync, mkdirSync } = require("node:fs");
const { join } = require("node:path");

const BASE_URL = "https://yusuke-kim.com";
const OUT_DIR = join(__dirname, "..", "lighthouse-results");

// Pages to audit
const PAGES = [
	// Main
	"/",
	"/about",
	"/portfolio",
	"/search",
	"/offline",
	"/privacy-policy",

	// Portfolio
	"/portfolio/gallery/all",
	"/portfolio/gallery/develop",
	"/portfolio/gallery/video",
	"/portfolio/gallery/video&design",

	// About profiles
	"/about/profile/real",
	"/about/profile/handle",
	"/about/profile/AI",

	// About cards
	"/about/card/real",
	"/about/card/handle",

	// Commission
	"/about/commission/develop",
	"/about/commission/video",
	"/about/commission/estimate",

	// About
	"/about/links",

	// Tools
	"/tools",
	"/tools/ProtoType",
	"/tools/ae-expression",
	"/tools/business-mail-block",
	"/tools/code-type-p5",
	"/tools/color-palette",
	"/tools/fillgen",
	"/tools/history-quiz",
	"/tools/pi-game",
	"/tools/pomodoro",
	"/tools/qr-generator",
	"/tools/sequential-png-preview",
	"/tools/svg2tsx",
	"/tools/text-counter",

	// Workshop
	"/workshop",
	"/workshop/downloads",
	"/workshop/plugins",
];

// Create output directory
mkdirSync(OUT_DIR, { recursive: true });

console.log("Starting Lighthouse audits...");
console.log(`Output directory: ${OUT_DIR}\n`);

const results = [];
let failedPages = 0;
let successCount = 0;
let errorCount = 0;

function sanitizePath(path) {
	return path
		.replace(/[^a-z0-9-]/gi, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

function runLighthouse(url) {
	const _tmpFile = join(OUT_DIR, `tmp-${Date.now()}.json`);

	try {
		// Run lighthouse and output to file
		const cmd = `npx lighthouse "${url}" --output=json --chrome-flags="--headless --disable-gpu --no-sandbox" --quiet`;
		const output = execSync(cmd, {
			stdio: ["ignore", "pipe", "pipe"],
			encoding: "utf-8",
			timeout: 120000,
		});

		// Parse JSON
		const report = JSON.parse(output);
		return report;
	} catch (error) {
		throw new Error(`Lighthouse failed: ${error.message}`);
	}
}

async function auditPage(page, index) {
	const url = `${BASE_URL}${page}`;
	const safeName = sanitizePath(page);
	const outputFile = join(OUT_DIR, `${safeName}.report.json`);

	process.stdout.write(`[${index + 1}/${PAGES.length}] Auditing: ${url}... `);

	try {
		const report = runLighthouse(url);

		const perf = Math.round(report.categories.performance.score * 100);
		const a11y = Math.round(report.categories.accessibility.score * 100);
		const bp = Math.round(report.categories["best-practices"].score * 100);
		const seo = Math.round(report.categories.seo.score * 100);

		const below95 = [];
		if (perf < 95) below95.push(`Performance: ${perf}`);
		if (a11y < 95) below95.push(`Accessibility: ${a11y}`);
		if (bp < 95) below95.push(`Best Practices: ${bp}`);
		if (seo < 95) below95.push(`SEO: ${seo}`);

		results.push({
			path: page,
			performance: perf,
			accessibility: a11y,
			bestPractices: bp,
			seo,
			below95,
		});

		// Save report
		writeFileSync(outputFile, JSON.stringify(report, null, 2));

		if (below95.length > 0) {
			failedPages++;
			console.log(`❌ P:${perf} A:${a11y} BP:${bp} S:${seo}`);
		} else {
			successCount++;
			console.log(`✅ P:${perf} A:${a11y} BP:${bp} S:${seo}`);
		}
	} catch (error) {
		errorCount++;
		console.log(`⚠️  Error: ${error.message}`);
	}
}

// Run audits with delay between each
(async () => {
	for (let i = 0; i < PAGES.length; i++) {
		await auditPage(PAGES[i], i);

		// Delay between audits (except last one)
		if (i < PAGES.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}

	// Generate summary
	const summary = {
		timestamp: new Date().toISOString(),
		baseUrl: BASE_URL,
		totalPages: PAGES.length,
		successPages: successCount,
		errorPages: errorCount,
		pagesBelow95: failedPages,
		results: results.sort((a, b) => b.below95.length - a.below95.length),
	};

	writeFileSync(
		join(OUT_DIR, "summary.json"),
		JSON.stringify(summary, null, 2),
	);

	// Console output
	console.log(`\n${"=".repeat(60)}`);
	console.log("LIGHTHOUSE AUDIT SUMMARY");
	console.log("=".repeat(60));
	console.log(`Total pages audited: ${PAGES.length}`);
	console.log(`Successfully audited: ${successCount}`);
	console.log(`Errors: ${errorCount}`);
	console.log(`Pages below 95%: ${failedPages}`);
	console.log(`${"=".repeat(60)}\n`);

	if (failedPages > 0) {
		console.log("PAGES NEEDING IMPROVEMENT:\n");
		results
			.filter((r) => r.below95.length > 0)
			.forEach((r) => {
				console.log(`🔴 ${r.path}`);
				console.log(
					`   Performance: ${r.performance} | Accessibility: ${r.accessibility} | Best Practices: ${r.bestPractices} | SEO: ${r.seo}\n`,
				);
			});
	}

	if (successCount > 0 && failedPages === 0) {
		console.log("🎉 All audited pages scored 95% or higher!\n");
	}

	console.log(`\nDetailed reports saved to: lighthouse-results/`);
})();
