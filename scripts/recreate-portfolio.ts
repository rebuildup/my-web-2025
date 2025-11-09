import * as fs from "node:fs";
import * as path from "node:path";
import { chromium, type Page } from "playwright";

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
	videos?: Array<{
		type: string;
		url: string;
		title?: string;
		description?: string;
		thumbnail?: string;
	}>;
	externalLinks?: Array<{
		type: string;
		url: string;
		title?: string;
		description?: string;
	}>;
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
			const confirm = page
				.locator('[role="dialog"]')
				.getByRole("button", { name: /削除/ })
				.first();
			await confirm.click();
			await page.waitForTimeout(500);
			await page
				.waitForSelector('[role="dialog"]', { state: "hidden", timeout: 5000 })
				.catch(() => {});
		}
	}
}

async function createContent(page: Page, item: PortfolioItem) {
	// 一覧ページのヘッダーが見える状態にスクロールしてからボタンを探す
	await page.evaluate(() =>
		window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }),
	);
	await page.waitForTimeout(200);

	// 新規コンテンツ
	console.log("  新規コンテンツ作成ボタンをクリック...");
	const newBtn = page.getByRole("button", { name: /新規コンテンツ/ }).first();
	await newBtn.waitFor({ state: "visible", timeout: 10000 });
	await newBtn.click();

	// ダイアログが開くまで待機
	console.log("  ダイアログの表示を待機...");
	await page.waitForSelector('[role="dialog"]', {
		state: "visible",
		timeout: 5000,
	});
	await page.waitForTimeout(1000);

	// ステータスを設定
	if (item.status) {
		console.log(`  ステータスを設定: ${item.status}`);
		try {
			const statusSelect = page
				.locator('select[label*="公開ステータス"], select[id*="status"]')
				.first();
			if ((await statusSelect.count()) > 0) {
				await statusSelect.click();
				await page.waitForTimeout(200);
				await page.locator(`option[value="${item.status}"]`).first().click();
				await page.waitForTimeout(200);
			}
		} catch (e) {
			console.log(`  ステータス設定をスキップ: ${e}`);
		}
	}

	// ID
	console.log(`  IDを入力: ${item.id}`);
	try {
		const idField = page.getByLabel("ID", { exact: false });
		await idField.waitFor({ state: "visible", timeout: 3000 });
		await idField.fill(item.id);
		await page.waitForTimeout(200);
	} catch (e) {
		console.log(`  ID入力に失敗、代替方法を試行: ${e}`);
		const inputs = await page.locator('input[type="text"]').all();
		if (inputs.length > 0) {
			await inputs[0].fill(item.id);
			await page.waitForTimeout(200);
		}
	}

	// タイトル
	console.log(`  タイトルを入力: ${item.title}`);
	try {
		const titleField = page.getByLabel("タイトル", { exact: false });
		await titleField.waitFor({ state: "visible", timeout: 3000 });
		await titleField.fill(item.title);
		await page.waitForTimeout(200);
	} catch (e) {
		console.log(`  タイトル入力に失敗、代替方法を試行: ${e}`);
		const inputs = await page.locator('input[type="text"]').all();
		if (inputs.length > 1) {
			await inputs[1].fill(item.title);
			await page.waitForTimeout(200);
		}
	}

	// 概要
	if (item.description) {
		console.log(`  概要を入力: ${item.description.substring(0, 50)}...`);
		try {
			const summaryField = page.getByLabel("概要", { exact: false });
			await summaryField.waitFor({ state: "visible", timeout: 3000 });
			await summaryField.fill(item.description);
			await page.waitForTimeout(200);
		} catch (e) {
			console.log(`  概要入力に失敗、代替方法を試行: ${e}`);
			const textareas = await page.locator("textarea").all();
			if (textareas.length > 0) {
				await textareas[0].fill(item.description);
				await page.waitForTimeout(200);
			}
		}
	}

	// 公開日
	const publishedAt = pickPublishedAt(item);
	if (publishedAt) {
		console.log(`  公開日を設定: ${publishedAt}`);
		try {
			const date = new Date(publishedAt);
			const dateStr = date.toISOString().slice(0, 10);
			const publishedAtField = page
				.getByLabel(/表示日付|publishedAt/, { exact: false })
				.first();
			await publishedAtField.fill(dateStr);
			await page.waitForTimeout(200);
		} catch (e) {
			console.log(`  公開日設定をスキップ: ${e}`);
		}
	}

	// タグ: 元タグ + カテゴリー由来タグ
	const baseTags = Array.from(new Set([...(item.tags || [])]));
	const categoryTags = deriveCategoryTags(item.categories);
	const finalTags = Array.from(new Set([...baseTags, ...categoryTags]));
	if (finalTags.length > 0) {
		console.log(`  タグを追加: ${finalTags.join(", ")}`);
		try {
			const tagField = page.getByLabel(/タグ/, { exact: false }).first();
			for (const tag of finalTags) {
				await tagField.fill(tag);
				await tagField.press("Enter");
				await page.waitForTimeout(300);
			}
		} catch (e) {
			console.log(`  タグ追加をスキップ: ${e}`);
		}
	}

	// サムネイルタブをクリック
	if (item.thumbnail || (item.videos && item.videos.length > 0)) {
		console.log("  サムネイルタブを開く...");
		try {
			await page.waitForSelector('[role="tab"]', {
				state: "visible",
				timeout: 5000,
			});

			let thumbnailTab = page
				.locator('[role="tab"]')
				.filter({ hasText: /サムネイル/ })
				.first();
			if ((await thumbnailTab.count()) === 0) {
				const tabs = await page.locator('[role="tab"]').all();
				if (tabs.length > 1) {
					thumbnailTab = tabs[1];
				} else {
					throw new Error("サムネイルタブが見つかりません");
				}
			}

			await thumbnailTab.waitFor({ state: "visible", timeout: 3000 });
			await thumbnailTab.click();
			await page.waitForTimeout(500);

			// サムネイル画像URLを設定（ファイル実体は無い想定なのでURLで設定）
			if (item.thumbnail) {
				console.log(`  サムネイル画像URLを設定: ${item.thumbnail}`);
				try {
					const imageUrlInputs = await page
						.locator(
							'[role="dialog"] input[type="url"], [role="dialog"] input[placeholder*="URL" i]',
						)
						.all();
					if (imageUrlInputs.length > 0) {
						await imageUrlInputs[0].fill(item.thumbnail);
						await page.waitForTimeout(200);
					}
				} catch (e) {
					console.log(`  サムネイル設定をスキップ: ${e}`);
				}
			}

			// サムネイルセクション内のYouTubeリンクも設定（最初の動画URL）
			const firstVideoUrl =
				item.videos && item.videos.length > 0 ? item.videos[0]?.url : undefined;
			if (firstVideoUrl) {
				console.log(`  サムネイル用YouTubeリンクを設定: ${firstVideoUrl}`);
				try {
					// ラベルにYouTubeが含まれる入力を優先して探す
					const ytLabelInputs = await page
						.getByLabel(/YouTube|youtube/i, { exact: false })
						.all();
					if (ytLabelInputs.length > 0) {
						await ytLabelInputs[ytLabelInputs.length - 1].fill(firstVideoUrl);
					} else {
						// ラベルが無い場合、URL系の2つ目の入力をYouTubeとみなして埋める（ヒューリスティック）
						const urlInputs = await page
							.locator(
								'[role="dialog"] input[type="url"], [role="dialog"] input[placeholder*="URL" i]',
							)
							.all();
						if (urlInputs.length > 1) {
							await urlInputs[1].fill(firstVideoUrl);
						}
					}
					await page.waitForTimeout(200);
				} catch (e) {
					console.log(`  サムネイル用YouTube設定をスキップ: ${e}`);
				}
			}
		} catch (e) {
			console.log(`  サムネイルタブ操作をスキップ: ${e}`);
		}
	}

	// リンク・メディアタブをクリック（動画・外部リンクを全件追加）
	if (
		(item.videos && item.videos.length > 0) ||
		(item.externalLinks && item.externalLinks.length > 0)
	) {
		console.log("  リンク・メディアタブを開く...");
		try {
			let mediaTab = page
				.locator('[role="tab"]')
				.filter({ hasText: /リンク|メディア/ })
				.first();
			if ((await mediaTab.count()) === 0) {
				const tabs = await page.locator('[role="tab"]').all();
				if (tabs.length > 2) {
					mediaTab = tabs[2];
				} else {
					throw new Error("リンク・メディアタブが見つかりません");
				}
			}
			await mediaTab.waitFor({ state: "visible", timeout: 3000 });
			await mediaTab.click();
			await page.waitForTimeout(500);

			// 動画（全件）
			for (const v of item.videos || []) {
				if (!v?.url) continue;
				console.log(`  メディア追加: ${v.url}`);
				try {
					const addBtn = page
						.locator('[role="dialog"]')
						.getByRole("button", { name: /追加|リンク追加|メディア追加/ })
						.first();
					if ((await addBtn.count()) > 0) {
						await addBtn.click();
						await page.waitForTimeout(300);
					}
					const urlInputs = await page.getByLabel(/URL|リンク|href/i).all();
					const urlInput = urlInputs[urlInputs.length - 1];
					if (urlInput) {
						await urlInput.fill(v.url);
					}
					if (v.title) {
						const titleInputs = await page.getByLabel(/タイトル|label/i).all();
						const titleInput = titleInputs[titleInputs.length - 1];
						if (titleInput) await titleInput.fill(v.title);
					}
					if (v.description) {
						const descInputs = await page.getByLabel(/説明|description/i).all();
						const descInput = descInputs[descInputs.length - 1];
						if (descInput) await descInput.fill(v.description);
					}
				} catch (e) {
					console.log(`  メディア追加をスキップ: ${e}`);
				}
			}

			// 外部リンク（全件）
			for (const l of item.externalLinks || []) {
				if (!l?.url) continue;
				console.log(`  外部リンク追加: ${l.url}`);
				try {
					const addBtn = page
						.locator('[role="dialog"]')
						.getByRole("button", { name: /追加|リンク追加|メディア追加/ })
						.first();
					if ((await addBtn.count()) > 0) {
						await addBtn.click();
						await page.waitForTimeout(300);
					}
					const urlInputs = await page.getByLabel(/URL|リンク|href/i).all();
					const urlInput = urlInputs[urlInputs.length - 1];
					if (urlInput) {
						await urlInput.fill(l.url);
					}
					if (l.title) {
						const titleInputs = await page.getByLabel(/タイトル|label/i).all();
						const titleInput = titleInputs[titleInputs.length - 1];
						if (titleInput) await titleInput.fill(l.title);
					}
					if (l.description) {
						const descInputs = await page.getByLabel(/説明|description/i).all();
						const descInput = descInputs[descInputs.length - 1];
						if (descInput) await descInput.fill(l.description);
					}
				} catch (e) {
					console.log(`  外部リンク追加をスキップ: ${e}`);
				}
			}
		} catch (e) {
			console.log(`  リンク・メディアタブ操作をスキップ: ${e}`);
		}
	}

	// 作成ボタンをクリック
	console.log("  作成ボタンをクリック...");
	const submit = page
		.locator('[role="dialog"]')
		.getByRole("button", { name: /作成/ })
		.first();
	await submit.click();
	await page.waitForTimeout(2000);
	await page
		.waitForSelector('[role="dialog"]', { state: "hidden", timeout: 8000 })
		.catch(() => {});
}

async function main() {
	const portfolioPath = path.join(process.cwd(), "portfolio.json");
	const items: PortfolioItem[] = JSON.parse(
		fs.readFileSync(portfolioPath, "utf-8"),
	);

	const browser = await chromium.launch({ headless: false });
	const page = await browser.newPage();

	let ok = 0;
	let ng = 0;

	try {
		await openAdmin(page);

		for (const item of items) {
			try {
				console.log(`\n[RECREATE] ${item.id} - ${item.title}`);
				// 一覧へ戻す安全策
				await openAdmin(page);
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
