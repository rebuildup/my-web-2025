import { readFileSync } from "node:fs";

interface Row {
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

function summarize(rows: Row[]) {
	const acc = { perf: 0, access: 0, bp: 0, seo: 0, n: 0 };
	for (const r of rows) {
		if (!r.scores) continue;
		acc.perf += r.scores.performance;
		acc.access += r.scores.accessibility;
		acc.bp += r.scores.bestPractices;
		acc.seo += r.scores.seo;
		acc.n++;
	}
	return acc.n > 0
		? {
				performance: acc.perf / acc.n,
				accessibility: acc.access / acc.n,
				bestPractices: acc.bp / acc.n,
				seo: acc.seo / acc.n,
				n: acc.n,
			}
		: null;
}

const mobile = JSON.parse(
	readFileSync("lighthouse-results/mobile/summary.json", "utf-8"),
) as Row[];
const desktop = JSON.parse(
	readFileSync("lighthouse-results/desktop/summary.json", "utf-8"),
) as Row[];

const m = summarize(mobile);
const d = summarize(desktop);

console.log(`=== Mobile avg across ${m?.n} pages ===`);
console.log(`  Performance:     ${m?.performance.toFixed(1)}`);
console.log(`  Accessibility:   ${m?.accessibility.toFixed(1)}`);
console.log(`  Best Practices:  ${m?.bestPractices.toFixed(1)}`);
console.log(`  SEO:             ${m?.seo.toFixed(1)}`);

console.log(`\n=== Desktop avg across ${d?.n} pages ===`);
console.log(`  Performance:     ${d?.performance.toFixed(1)}`);
console.log(`  Accessibility:   ${d?.accessibility.toFixed(1)}`);
console.log(`  Best Practices:  ${d?.bestPractices.toFixed(1)}`);
console.log(`  SEO:             ${d?.seo.toFixed(1)}`);

console.log("\n=== Per-page (mobile) ===");
for (const r of mobile) {
	const s = r.scores
		? `P:${r.scores.performance} A:${r.scores.accessibility} BP:${r.scores.bestPractices} S:${r.scores.seo}`
		: "ERR";
	console.log(`${r.path.padEnd(40)} ${s}`);
}
