/**
 * Lighthouse Audit Script
 *
 * Run Lighthouse audits on all public pages of the site.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const BASE_URL = "https://yusuke-kim.com";

// Pages to audit (excluding admin and dynamic routes)
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

interface LighthouseResult {
	url: string;
	path: string;
	scores: {
		performance: number;
		accessibility: number;
		bestPractices: number;
		seo: number;
	};
	scoreBelow95: string[];
}

interface LighthouseCategory {
	categories: Record<string, { score: number | null }>;
}

const chromeFlags = [
	"--headless",
	"--disable-gpu",
	"--no-sandbox",
	"--disable-dev-shm-usage",
];

async function runLighthouse(url: string): Promise<LighthouseCategory> {
	const chrome = await chromeLauncher.launch({ chromeFlags });
	const options = {
		logLevel: "error" as const,
		output: "json" as const,
		port: chrome.port,
	};

	const runnerResult = await lighthouse(url, options);
	await chrome.kill();

	// @ts-expect-error - lighthouse result has complex types
	return runnerResult?.lhr;
}

function sanitizePath(path: string): string {
	return path
		.replace(/[^a-z0-9-]/gi, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

// @ts-expect-error - unused utility function
function _isScoreBelow95(category: LighthouseCategory): boolean {
	return category.score < 0.95;
}

async function auditPage(url: string, path: string): Promise<LighthouseResult> {
	console.log(`Auditing: ${url}`);

	const lhr = await runLighthouse(url);

	const performance = lhr.categories.performance.score * 100;
	const accessibility = lhr.categories.accessibility.score * 100;
	const bestPractices = lhr.categories["best-practices"].score * 100;
	const seo = lhr.categories.seo.score * 100;

	const scoreBelow95: string[] = [];
	if (performance < 95)
		scoreBelow95.push(`Performance: ${performance.toFixed(0)}`);
	if (accessibility < 95)
		scoreBelow95.push(`Accessibility: ${accessibility.toFixed(0)}`);
	if (bestPractices < 95)
		scoreBelow95.push(`Best Practices: ${bestPractices.toFixed(0)}`);
	if (seo < 95) scoreBelow95.push(`SEO: ${seo.toFixed(0)}`);

	return {
		url,
		path,
		scores: {
			performance,
			accessibility,
			bestPractices,
			seo,
		},
		scoreBelow95,
	};
}

async function main() {
	console.log("Starting Lighthouse audits...\n");

	// Ensure output directory exists
	const outDir = join(process.cwd(), "lighthouse-results");
	mkdirSync(outDir, { recursive: true });

	const results: LighthouseResult[] = [];
	let failedPages = 0;

	for (const page of PAGES) {
		const url = `${BASE_URL}${page}`;
		const sanitizedName = sanitizePath(page);

		try {
			const result = await auditPage(url, sanitizedName);
			results.push(result);

			// Save individual report
			const lhr = await runLighthouse(url);
			writeFileSync(
				join(outDir, `${sanitizedName}.report.json`),
				JSON.stringify(lhr, null, 2),
			);

			if (result.scoreBelow95.length > 0) {
				failedPages++;
				console.log(`  ❌ Scores below 95%: ${result.scoreBelow95.join(", ")}`);
			} else {
				console.log(`  ✅ All scores ≥ 95%`);
			}
		} catch (error) {
			console.error(`  ⚠️ Error auditing ${url}:`, error);
		}

		// Small delay between audits
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	// Generate summary report
	const summary = {
		timestamp: new Date().toISOString(),
		baseUrl: BASE_URL,
		totalPages: PAGES.length,
		pagesBelow95: failedPages,
		results: results.sort((a, b) => {
			// Sort by pages with most failures first
			return b.scoreBelow95.length - a.scoreBelow95.length;
		}),
	};

	writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));

	// Console output
	console.log(`\n${"=".repeat(60)}`);
	console.log("LIGHTHOUSE AUDIT SUMMARY");
	console.log("=".repeat(60));
	console.log(`Total pages audited: ${PAGES.length}`);
	console.log(`Pages below 95%: ${failedPages}`);
	console.log(`${"=".repeat(60)}\n`);

	if (failedPages > 0) {
		console.log("PAGES NEEDING IMPROVEMENT:\n");
		results
			.filter((r) => r.scoreBelow95.length > 0)
			.forEach((r) => {
				console.log(`🔴 ${r.path}`);
				r.scoreBelow95.forEach((s) => void console.log(`   - ${s}`));
				console.log("");
			});
	} else {
		console.log("🎉 All pages scored 95% or higher!");
	}

	console.log("\nDetailed reports saved to: lighthouse-results/");
}

main().catch(console.error);
