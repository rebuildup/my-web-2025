interface ContentSummary {
	id: string;
	title?: string;
	status?: string;
	visibility?: string;
	thumbnails?: { image?: { src?: string } };
}

async function fetchAll(): Promise<ContentSummary[]> {
	const res = await fetch("http://localhost:3010/api/cms/contents");
	if (!res.ok) throw new Error(`GET contents failed: ${res.status}`);
	return (await res.json()) as ContentSummary[];
}

async function promote(id: string) {
	const payload = {
		id,
		status: "published",
		visibility: "public",
	};
	const res = await fetch("http://localhost:3010/api/cms/contents", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});
	if (!res.ok) {
		const msg = await res.text();
		throw new Error(`PUT failed for ${id}: ${res.status} ${msg}`);
	}
}

async function main() {
	const all = await fetchAll();
	let updated = 0;
	let skipped = 0;
	for (const c of all) {
		const hasThumb = !!c.thumbnails?.image?.src;
		const already = c.status === "published" && c.visibility === "public";
		if (!hasThumb || already) {
			skipped++;
			continue;
		}
		await promote(c.id);
		updated++;
		console.log(`✅ ${c.id} -> published/public`);
	}
	console.log(`\n=== プロモート完了 ===`);
	console.log(
		`更新: ${updated}件 / スキップ: ${skipped}件 / 合計: ${all.length}件`,
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
