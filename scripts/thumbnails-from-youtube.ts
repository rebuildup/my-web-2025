import * as fs from "fs";
import * as path from "path";

interface PortfolioItem {
	id: string;
	title?: string;
	videos?: Array<{ type?: string; url?: string }>;
}

function extractYouTubeId(url: string): string | null {
	try {
		// youtu.be/<id>
		const short = url.match(/youtu\.be\/([\w-]{6,})/i);
		if (short) return short[1];
		// youtube.com/watch?v=<id>
		const vParam = url.match(/[?&]v=([\w-]{6,})/i);
		if (vParam) return vParam[1];
		// youtube.com/shorts/<id>
		const shorts = url.match(/youtube\.com\/shorts\/([\w-]{6,})/i);
		if (shorts) return shorts[1];
		return null;
	} catch {
		return null;
	}
}

function buildThumbUrls(videoId: string) {
	return {
		maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
		hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
	};
}

async function updateOne(id: string, youtubeUrl: string, imageUrl: string) {
	const payload = {
		id,
		thumbnails: { image: { src: imageUrl } },
		ext: { thumbnail: { youtube: youtubeUrl } },
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
	const portfolioPath = path.join(process.cwd(), "portfolio.json");
	const items: PortfolioItem[] = JSON.parse(
		fs.readFileSync(portfolioPath, "utf-8"),
	);

	let updated = 0;
	let skipped = 0;
	let failed = 0;

	for (const item of items) {
		try {
			const firstYt =
				(item.videos || []).find(
					(v) =>
						(v?.type ?? "").toLowerCase() === "youtube" &&
						typeof v.url === "string" &&
						v.url.length > 0,
				) ||
				(item.videos || []).find(
					(v) => typeof v.url === "string" && /youtu/i.test(v.url!),
				);
			if (!firstYt?.url) {
				skipped++;
				continue;
			}
			const vid = extractYouTubeId(firstYt.url);
			if (!vid) {
				skipped++;
				continue;
			}
			const thumbs = buildThumbUrls(vid);
			// まずmaxresで更新。表示側で落ちたらhqへ切替可能
			await updateOne(item.id, firstYt.url, thumbs.maxres);
			updated++;
			console.log(`✅ ${item.id} -> ${thumbs.maxres}`);
		} catch (e) {
			failed++;
			console.error(`❌ ${item.id}`, e);
		}
	}

	console.log(`\n=== サムネイル更新 完了 ===`);
	console.log(
		`更新: ${updated}件 / スキップ: ${skipped}件 / 失敗: ${failed}件`,
	);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
