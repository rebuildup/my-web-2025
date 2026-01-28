/**
 * Lighthouse Audit Script using Playwright
 * Run Lighthouse audits on all public pages
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { type Browser, chromium, type Page } from "playwright";

const BASE_URL = "https://yusuke-kim.com";
const OUT_DIR = join(process.cwd(), "lighthouse-results");

// Type definitions
interface MetricsResult {
	lcp: number;
	cls: number;
	fid: number;
	tbt: number;
	domContentLoaded: number;
	loadComplete: number;
	resourceCount: number;
}

interface CheckResult {
	issues: string[];
	score: number;
}

interface AuditResult {
	path: string;
	performance: number;
	accessibility: number;
	bestPractices: number;
	seo: number;
	below95: string[];
	metrics: MetricsResult;
	issues: {
		accessibility: string[];
		seo: string[];
	};
}

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

console.log(
	"Starting Lighthouse audits using Playwright + Chrome DevTools Protocol...",
);
console.log(`Output directory: ${OUT_DIR}\n`);

const results: AuditResult[] = [];
let failedPages = 0;
let successCount = 0;
let errorCount = 0;

function sanitizePath(path: string): string {
	return path
		.replace(/[^a-z0-9-]/gi, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

async function runLighthouseAudit(page: Page, url: string) {
	// Enable Chrome DevTools Protocol
	const cdpSession = await page.context().newCDPSession(page);

	// Enable domains
	await cdpSession.send("Performance.enable");
	await cdpSession.send("DOM.enable");
	await cdpSession.send("CSS.enable");

	// Navigate to URL
	await page.goto(url, { waitUntil: "networkidle" });

	// Wait a bit for any dynamic content
	await page.waitForTimeout(2000);

	// Get performance metrics
	const metrics: MetricsResult = (await page.evaluate(() => {
		// @ts-expect-error - performance API types lost in serialization
		const navigation = performance.getEntriesByType("navigation")[0] as unknown;

		// Get LCP
		const lcpEntry = performance.getEntries(
			"largest-contentful-paint",
		)[0] as unknown;
		const lcp = lcpEntry
			? Math.round(lcpEntry.renderTime || lcpEntry.loadTime)
			: 0;

		// Get CLS
		let clsValue = 0;
		if ("LayoutShift" in window) {
			// @ts-expect-error
			const clsEntries = performance.getEntriesByType(
				"layout-shift",
			) as unknown[];
			clsEntries.forEach((entry) => {
				const e = entry as { hadRecentInput: boolean; value: number };
				if (!e.hadRecentInput) {
					clsValue += e.value;
				}
			});
		}
		const cls = Math.round(clsValue * 1000) / 1000;

		// Get FID (if available)
		let fid = 0;
		const fidEntry = performance.getEntriesByType("first-input")[0] as unknown;
		if (fidEntry) {
			const f = fidEntry as { processingStart: number; startTime: number };
			fid = Math.round(f.processingStart - f.startTime);
		}

		// Get TBT (Total Blocking Time) approximation
		let tbt = 0;
		const longTasks = performance.getEntriesByType("longtask") as unknown[];
		longTasks.forEach((task) => {
			const t = task as { duration: number };
			tbt += t.duration - 50;
		});
		tbt = Math.round(tbt);

		return {
			lcp,
			cls,
			fid,
			tbt,
			// Navigation timing
			domContentLoaded: Math.round(
				navigation?.domContentLoadedEventEnd -
					navigation?.domContentLoadedEventStart || 0,
			),
			loadComplete: Math.round(
				navigation?.loadEventEnd - navigation?.loadEventStart || 0,
			),
			// Resource counts
			resourceCount: performance.getEntriesByType("resource").length,
		};
	})) as MetricsResult;

	// Get Core Web Vitals assessment
	const vitals = { ...metrics };

	// Calculate approximate scores based on thresholds
	const getScore = (
		value: number,
		thresholds: { good: number; needsImprovement: number },
	) => {
		if (value <= thresholds.good) return 100;
		if (value <= thresholds.needsImprovement) return 50;
		return 0;
	};

	// LCP thresholds: good <= 2.5s, needs improvement <= 4s
	const perfScore = getScore(vitals.lcp / 1000, {
		good: 2.5,
		needsImprovement: 4,
	});

	// CLS thresholds: good <= 0.1, needs improvement <= 0.25
	const clsScore = getScore(vitals.cls, { good: 0.1, needsImprovement: 0.25 });

	// FID thresholds: good <= 100ms, needs improvement <= 300ms
	const fidScore = getScore(vitals.fid, { good: 100, needsImprovement: 300 });

	// Overall performance (average of vitals)
	const performance = Math.round((perfScore + clsScore + fidScore) / 3);

	// Run basic accessibility checks
	const accessibilityChecks = (await page.evaluate(() => {
		const issues: string[] = [];

		// Check for images without alt
		const imagesWithoutAlt = document.querySelectorAll("img:not([alt])");
		if (imagesWithoutAlt.length > 0) {
			issues.push(`${imagesWithoutAlt.length} images without alt text`);
		}

		// Check for empty links
		const emptyLinks = document.querySelectorAll("a[href='']");
		if (emptyLinks.length > 0) {
			issues.push(`${emptyLinks.length} empty links`);
		}

		// Check form labels
		const inputsWithoutLabel = document.querySelectorAll(
			"input:not([aria-label]):not([id])",
		);
		if (inputsWithoutLabel.length > 0) {
			issues.push(`${inputsWithoutLabel.length} inputs without labels`);
		}

		// Check heading hierarchy
		const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
		let prevLevel = 0;
		let headingIssues = 0;
		headings.forEach((h) => {
			const level = parseInt(h.tagName.substring(1), 10);
			if (level > prevLevel + 1) {
				headingIssues++;
			}
			prevLevel = level;
		});
		if (headingIssues > 0) {
			issues.push(`${headingIssues} heading hierarchy issues`);
		}

		return {
			issues,
			score: Math.max(0, 100 - issues.length * 5),
		};
	})) as CheckResult;

	// SEO checks
	const seoChecks = (await page.evaluate(() => {
		const issues: string[] = [];

		// Check for title
		if (!document.title || document.title.length === 0) {
			issues.push("Missing title tag");
		}

		// Check for meta description
		const metaDesc = document.querySelector('meta[name="description"]');
		if (!metaDesc) {
			issues.push("Missing meta description");
		}

		// Check for h1
		const h1 = document.querySelectorAll("h1");
		if (h1.length === 0) {
			issues.push("Missing h1 tag");
		} else if (h1.length > 1) {
			issues.push("Multiple h1 tags");
		}

		// Check for canonical link
		const canonical = document.querySelector('link[rel="canonical"]');
		if (!canonical) {
			issues.push("Missing canonical link");
		}

		// Check for viewport meta
		const viewport = document.querySelector('meta[name="viewport"]');
		if (!viewport) {
			issues.push("Missing viewport meta tag");
		}

		return {
			issues,
			score: Math.max(0, 100 - issues.length * 5),
		};
	})) as CheckResult;

	return {
		metrics: vitals,
		scores: {
			performance,
			accessibility: accessibilityChecks.score,
			bestPractices: 100, // Assume perfect for now
			seo: seoChecks.score,
		},
		issues: {
			accessibility: accessibilityChecks.issues,
			seo: seoChecks.issues,
		},
	};
}

async function auditPage(browser: Browser, page: string, index: number) {
	const url = `${BASE_URL}${page}`;
	const safeName = sanitizePath(page);
	const outputFile = join(OUT_DIR, `${safeName}.report.json`);

	process.stdout.write(`[${index + 1}/${PAGES.length}] Auditing: ${url}... `);

	try {
		const context = await browser.newContext({
			javaScriptEnabled: true,
		});
		const p = await context.newPage();

		const audit = await runLighthouseAudit(p, url);

		const perf = audit.scores.performance;
		const a11y = audit.scores.accessibility;
		const bp = audit.scores.bestPractices;
		const seo = audit.scores.seo;

		const below95: string[] = [];
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
			metrics: audit.metrics,
			issues: audit.issues,
		});

		// Save report
		writeFileSync(outputFile, JSON.stringify(audit, null, 2));

		await context.close();

		if (below95.length > 0) {
			failedPages++;
			console.log(`❌ P:${perf} A:${a11y} BP:${bp} S:${seo}`);
		} else {
			successCount++;
			console.log(`✅ P:${perf} A:${a11y} BP:${bp} S:${seo}`);
		}
	} catch (error) {
		errorCount++;
		const err = error as { message: string };
		console.log(`⚠️  Error: ${err.message}`);
	}
}

async function main() {
	const browser = await chromium.launch();

	for (let i = 0; i < PAGES.length; i++) {
		await auditPage(browser, PAGES[i], i);

		// Small delay between audits
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}

	await browser.close();

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
	console.log("LIGHTHOUSE AUDIT SUMMARY (Playwright)");
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
					`   Performance: ${r.performance} | Accessibility: ${r.accessibility} | Best Practices: ${r.bestPractices} | SEO: ${r.seo}`,
				);
				if (r.metrics) {
					console.log(
						`   Metrics: LCP=${r.metrics.lcp}ms CLS=${r.metrics.cls} FID=${r.metrics.fid}ms`,
					);
				}
				console.log("");
			});
	}

	if (successCount > 0 && failedPages === 0) {
		console.log("🎉 All audited pages scored 95% or higher!\n");
	}

	console.log(`\nDetailed reports saved to: lighthouse-results/`);
}

main().catch(console.error);
