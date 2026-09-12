/**
 * Lighthouse Audit - Mobile + Desktop via CLI
 * Runs all public pages against both form factors in sequence using `npx lighthouse`.
 * Works around the Windows EPERM/EBUSY on chrome temp-dir cleanup by ignoring
 * non-zero exits when the output file was written.
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE_URL = "https://yusuke-kim.com";

const PAGES = [
	"/",
	"/about",
	"/portfolio",
	"/search",
	"/offline",
	"/privacy-policy",
	"/portfolio/gallery/all",
	"/portfolio/gallery/develop",
	"/portfolio/gallery/video",
	"/portfolio/gallery/video&design",
	"/about/profile/real",
	"/about/profile/handle",
	"/about/profile/AI",
	"/about/card/real",
	"/about/card/handle",
	"/about/commission/develop",
	"/about/commission/video",
	"/about/commission/estimate",
	"/about/links",
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
	"/workshop",
	"/workshop/downloads",
	"/workshop/plugins",
];

interface FormFactor {
	name: "mobile" | "desktop";
	flags: string[];
}

const FORM_FACTORS: FormFactor[] = [
	{ name: "mobile", flags: ["--form-factor=mobile"] },
	{ name: "desktop", flags: ["--preset=desktop"] },
];

interface AuditRow {
	path: string;
	scores?: {
		performance: number;
		accessibility: number;
		bestPractices: number;
		seo: number;
	};
	below95?: string[];
	error?: string;
}

function sanitizePath(path: string): string {
	return path
		.replace(/[^a-z0-9-]/gi, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

async function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function below95List(s: NonNullable<AuditRow["scores"]>): string[] {
	const list: string[] = [];
	if (s.performance < 95) list.push(`Performance: ${s.performance}`);
	if (s.accessibility < 95) list.push(`Accessibility: ${s.accessibility}`);
	if (s.bestPractices < 95) list.push(`Best Practices: ${s.bestPractices}`);
	if (s.seo < 95) list.push(`SEO: ${s.seo}`);
	return list;
}

function summarize(lhr: {
	categories: Record<string, { score: number | null }>;
}): NonNullable<AuditRow["scores"]> {
	const r = (n: string) => Math.round((lhr.categories[n]?.score ?? 0) * 100);
	return {
		performance: r("performance"),
		accessibility: r("accessibility"),
		bestPractices: r("best-practices"),
		seo: r("seo"),
	};
}

async function main() {
	const rootOut = join(process.cwd(), "lighthouse-results");
	mkdirSync(rootOut, { recursive: true });

	const summary: Record<string, AuditRow[]> = {};

	for (const ff of FORM_FACTORS) {
		const dir = join(rootOut, ff.name);
		mkdirSync(dir, { recursive: true });
		const rows: AuditRow[] = [];
		console.log(`\n=== ${ff.name.toUpperCase()} ===`);

		for (let i = 0; i < PAGES.length; i++) {
			const page = PAGES[i];
			const url = `${BASE_URL}${page}`;
			const safeName = sanitizePath(page);
			const file = join(dir, `${safeName}.report.json`);
			process.stdout.write(`[${i + 1}/${PAGES.length}] ${url} ... `);
			const t0 = Date.now();

			try {
				execFileSync(
					"npx",
					[
						"lighthouse",
						url,
						...ff.flags,
						"--output=json",
						`--output-path=${file}`,
						"--chrome-flags=--headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage",
						"--quiet",
						"--only-categories=performance,accessibility,best-practices,seo",
					],
					{
						stdio: ["ignore", "pipe", "pipe"],
						encoding: "utf-8",
						timeout: 180000,
					},
				);
			} catch {
				// Non-zero exit is expected on Windows due to EPERM/EBUSY temp cleanup;
				// the report file is still written.
			}

			// Read the result file
			try {
				const lhr = JSON.parse(await Bun.file(file).text());
				const scores = summarize(lhr);
				const below = below95List(scores);
				const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
				console.log(
					`P:${scores.performance} A:${scores.accessibility} BP:${scores.bestPractices} S:${scores.seo} (${elapsed}s)${below.length ? `  ⚠️ ${below.join(", ")}` : ""}`,
				);
				rows.push({ path: page, scores, below95: below });
			} catch (e) {
				console.log(`ERROR: ${(e as Error).message}`);
				rows.push({ path: page, error: (e as Error).message });
			}

			// Wait for chrome cleanup + temp release before next run
			await sleep(2500);
		}

		writeFileSync(join(dir, "summary.json"), JSON.stringify(rows, null, 2));
		summary[ff.name] = rows;
	}

	writeFileSync(
		join(rootOut, "summary.json"),
		JSON.stringify(summary, null, 2),
	);
	console.log("\nDone. Summary saved to lighthouse-results/summary.json");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
