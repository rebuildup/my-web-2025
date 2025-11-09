import * as fs from "node:fs";
import * as path from "node:path";

interface PortfolioItem {
	id: string;
	title?: string;
	description?: string;
}

async function createOne(item: PortfolioItem) {
	const res = await fetch("http://localhost:3010/api/cms/markdown", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			contentId: item.id,
			slug: item.id,
			frontmatter: {
				title: item.title ?? item.id,
				description: item.description ?? "",
			},
			body: `# ${item.title ?? item.id}\n\n${item.description ?? ""}`,
			status: "draft",
		}),
	});
	if (!res.ok) {
		throw new Error(
			`Failed to create markdown for ${item.id}: ${res.status} ${await res.text()}`,
		);
	}
}

async function main() {
	const portfolioPath = path.join(process.cwd(), "portfolio.json");
	const items: PortfolioItem[] = JSON.parse(
		fs.readFileSync(portfolioPath, "utf-8"),
	);
	let ok = 0;
	let ng = 0;
	for (const it of items) {
		try {
			await createOne(it);
			ok++;
			console.log(`✅ created: ${it.id}`);
		} catch (e) {
			ng++;
			console.error(`❌ failed: ${it.id}`, e);
		}
	}
	console.log(`\n=== detail markdown creation done ===`);
	console.log(`success: ${ok} / failed: ${ng} / total: ${items.length}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
