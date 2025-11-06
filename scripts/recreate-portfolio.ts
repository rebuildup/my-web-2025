import { chromium, type Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

type CategoryTag = "develop" | "video" | "design";

interface PortfolioItem {
	id: string;
	title: string;
	description?: string;
	tags?: string[];
	categories?: string[];
	status?: string;
	thumbnail?: string;
	images?: string[];
	videos?: Array<{ type: string; url: string; title?: string; description?: string; thumbnail?: string }>;
	useManualDate?: boolean;
	manualDate?: string;
	createdAt?: string;
}

function deriveCategoryTags(categories?: string[]): CategoryTag[] {
	if (!categories) return [];
	const lc = categories.map((c) => c.toLowerCase());
	const tags: CategoryTag[] = [];
	if (lc.includes("develop")) tags.push("develop");
	if (lc.includes("video")) tags.push("video");
	if (lc.includes("design")) tags.push("design");
	return tags;
}

function pickPublishedAt(item: PortfolioItem): string | undefined {
	if (item.useManualDate && item.manualDate) return item.manualDate;
	if (item.createdAt) return item.createdAt;
	return undefined;
}

async function openAdmin(page: Page) {
	await page.goto("http://localhost:3010/admin/content");
	await page.waitForSelector("text=コンテンツ管理", { timeout: 15000 });
}

async function deleteIfExists(page: Page, id: string) {
	// 探して削除
	const rowMatch = page.locator("tr, div[role='row']").filter({ hasText: id });
	if (await rowMatch.count()) {
		const delBtn = rowMatch.getByRole("button", { name: /削除/ }).first();
		if (await delBtn.count()) {
			await delBtn.click();
			// 確認ダイアログで削除確定（文言は/削除/でヒットさせる）
			const confirm = page.locator('[role="dialog"]').getByRole("button", { name: /削除/ }).first();
			await confirm.click();
			await page.waitForTimeout(500);
			await page.waitForSelector('[role="dialog"]', { state: "hidden", timeout: 5000 }).catch(() => {});
		}
	}
}

async function createContent(page: Page, item: PortfolioItem) {
	// 新規コンテンツ
	await page.getByRole("button", { name: /新規コンテンツ/ }).first().click();
	await page.waitForSelector('[role="dialog"]', { state: "visible", timeout: 5000 });

	// 基本
	await page.getByLabel("タイトル", { exact: true }).fill(item.title);
	await page.getByLabel("ID", { exact: true }).fill(item.id);
	if (item.description) {
		await page.getByLabel("概要", { exact: true }).fill(item.description);
	}

	// 公開日
	const publishedAt = pickPublishedAt(item);
	if (publishedAt) {
		const dateStr = new Date(publishedAt).toISOString().slice(0, 10);
		const dateField = page.getByLabel(/表示日付|publishedAt/, { exact: false }).first();
		await dateField.fill(dateStr);
	}

	// タグ: 元タグ + カテゴリー由来タグ
	const baseTags = Array.from(new Set([...(item.tags || [])]));
	const categoryTags = deriveCategoryTags(item.categories);
	const finalTags = Array.from(new Set([...baseTags, ...categoryTags]));
	if (finalTags.length) {
		const tagAutocomplete = page.getByRole("combobox", { name: /タグ検索|追加/ });
		for (const tag of finalTags) {
			await tagAutocomplete.fill(tag);
			await page.keyboard.press("Enter");
			await page.waitForTimeout(100);
		}
	}

	// サムネイル（任意）
	if (item.thumbnail) {
		try {
			const tab = page.locator('[role="tab"]').filter({ hasText: /サムネイル/ }).first();
			if (await tab.count()) {
				await tab.click();
				await page.waitForTimeout(200);
				// 代表的なサムネイルURLフィールドを想定
				const thumbField = page.getByLabel(/サムネイル|thumbnail|image/i).first();
				if (await thumbField.count()) {
					await thumbField.fill(item.thumbnail);
				}
			}
		} catch {}
	}

	// リンク・メディア（動画URLなど）: 主要YouTubeがあれば1件だけ追加（任意）
	try {
		const yt = (item.videos || []).find((v) => v.type === "youtube" && v.url);
		if (yt?.url) {
			const tab = page.locator('[role="tab"]').filter({ hasText: /リンク|メディア/ }).first();
			if (await tab.count()) {
				await tab.click();
				await page.waitForTimeout(200);
				const addBtn = page.getByRole("button", { name: /追加|リンク追加|メディア追加/ }).first();
				if (await addBtn.count()) {
					await addBtn.click();
					await page.waitForTimeout(100);
					const urlField = page.getByLabel(/URL|リンク|href/i).first();
					if (await urlField.count()) {
						await urlField.fill(yt.url);
					}
				}
			}
		}
	} catch {}

	// 作成/更新
	const submit = page.locator('[role="dialog"]').getByRole("button", { name: /(作成|更新)/ }).first();
	await submit.click();
	await page.waitForTimeout(800);
	await page.waitForSelector('[role="dialog"]', { state: "hidden", timeout: 8000 }).catch(() => {});
}

async function main() {
	const portfolioPath = path.join(process.cwd(), "portfolio.json");
	const items: PortfolioItem[] = JSON.parse(fs.readFileSync(portfolioPath, "utf-8"));

	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	let ok = 0;
	let ng = 0;

	try {
		await openAdmin(page);

		for (const item of items) {
			try {
				console.log(`\n[RECREATE] ${item.id} - ${item.title}`);
				await deleteIfExists(page, item.id);
				await createContent(page, item);
				console.log(`  ✅ 完了: ${item.id}`);
				ok++;
				await page.waitForTimeout(200);
			} catch (e) {
				console.error(`  ❌ 失敗: ${item.id}`, e);
				ng++;
			}
		}
	} finally {
		console.log(`\n=== 再作成 完了 ===`);
		console.log(`成功: ${ok}件 / 失敗: ${ng}件 / 合計: ${items.length}件`);
		await browser.close();
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
