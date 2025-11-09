import * as fs from "node:fs";
import * as path from "node:path";
import { chromium } from "playwright";

interface PortfolioItem {
	id: string;
	title: string;
	manualDate?: string;
	useManualDate?: boolean;
}

async function updatePublishedDates() {
	const portfolioPath = path.join(process.cwd(), "portfolio.json");
	const portfolioData: PortfolioItem[] = JSON.parse(
		fs.readFileSync(portfolioPath, "utf-8"),
	);

	// manualDateを持つアイテムのみをフィルタ
	const itemsToUpdate = portfolioData.filter(
		(item) => item.manualDate && (item.useManualDate || item.manualDate),
	);

	console.log(`${itemsToUpdate.length}件のコンテンツの日付を更新します...`);

	const browser = await chromium.launch({ headless: false });
	const context = await browser.newContext();
	const page = await context.newPage();

	try {
		// 管理ページに移動
		await page.goto("http://localhost:3010/admin/content");
		await page.waitForTimeout(1000);

		let successCount = 0;
		let errorCount = 0;

		for (const item of itemsToUpdate) {
			try {
				console.log(`\n[${item.id}] ${item.title}`);
				console.log(`  日付: ${item.manualDate}`);

				// コンテンツ一覧を更新（必要に応じて）
				await page.waitForTimeout(500);

				// 編集ボタンを探す（より確実な方法）
				let editButton = null;
				let found = false;

				// まず、IDを含むテキストを探す
				const idLocator = page.locator(`text=${item.id}`).first();

				if ((await idLocator.count()) > 0) {
					// IDが見つかった場合、その近くの編集ボタンを探す
					// テーブル構造に応じて、親要素を遡って編集ボタンを探す
					const parentRow = idLocator.locator("..").locator("..").locator("..");
					const buttonInRow = parentRow
						.getByRole("button", { name: /編集/ })
						.first();

					if ((await buttonInRow.count()) > 0) {
						editButton = buttonInRow;
						found = true;
					}
				}

				// フォールバック: テーブル全体からIDを含む行を探す
				if (!found) {
					const allRows = page.locator("tr, div[role='row']");
					const rowCount = await allRows.count();

					for (let i = 0; i < rowCount; i++) {
						const row = allRows.nth(i);
						const rowText = await row.textContent();
						if (rowText?.includes(item.id)) {
							const button = row.getByRole("button", { name: /編集/ }).first();
							if ((await button.count()) > 0) {
								editButton = button;
								found = true;

								// 行が画面外の場合はスクロール
								try {
									await row.scrollIntoViewIfNeeded();
									await page.waitForTimeout(200);
								} catch {
									// スクロールエラーは無視
								}
								break;
							}
						}
					}
				}

				if (!found || !editButton) {
					console.log(
						`  ⚠️ コンテンツまたは編集ボタンが見つかりません: ${item.id}`,
					);
					errorCount++;
					continue;
				}

				// 編集ボタンをクリック
				await editButton.click();
				await page.waitForTimeout(1000);

				// ダイアログが開くまで待機
				await page.waitForSelector('[role="dialog"]', {
					state: "visible",
					timeout: 5000,
				});

				// 日付フィールドを探して設定
				const dateInput = page
					.locator('[role="dialog"]')
					.getByLabel(/表示日付|publishedAt/, { exact: false })
					.first();

				if ((await dateInput.count()) === 0) {
					console.log(`  ⚠️ 日付フィールドが見つかりません: ${item.id}`);
					// キャンセルボタンをクリック
					await page
						.locator('[role="dialog"]')
						.getByRole("button", { name: /キャンセル/ })
						.first()
						.click();
					await page.waitForTimeout(500);
					errorCount++;
					continue;
				}

				// 日付を設定
				if (!item.manualDate) {
					console.warn(`  手動日付が設定されていません: ${item.id}`);
					errorCount++;
					continue;
				}
				const date = new Date(item.manualDate);
				const dateStr = date.toISOString().slice(0, 10);
				console.log(`  日付を設定: ${dateStr}`);

				// 日付フィールドに値を設定
				await dateInput.fill(dateStr);
				await page.waitForTimeout(500);

				// 更新ボタンをクリック
				const updateButton = page
					.locator('[role="dialog"]')
					.getByRole("button", { name: /更新/ })
					.first();

				await updateButton.click();
				await page.waitForTimeout(2000);

				// ダイアログが閉じるまで待機
				await page
					.waitForSelector('[role="dialog"]', {
						state: "hidden",
						timeout: 5000,
					})
					.catch(() => {
						// 既に閉じている場合は無視
					});

				console.log(`  ✅ 更新完了: ${item.id}`);
				successCount++;

				// 次のアイテムの前に少し待機
				await page.waitForTimeout(500);
			} catch (error) {
				console.error(`  ❌ エラー: ${item.id}`, error);
				errorCount++;

				// エラーが発生した場合、ダイアログを閉じる
				try {
					const cancelButton = page
						.locator('[role="dialog"]')
						.getByRole("button", { name: /キャンセル/ })
						.first();
					if (await cancelButton.isVisible()) {
						await cancelButton.click();
						await page.waitForTimeout(500);
					}
				} catch {
					// ダイアログが既に閉じている場合は無視
				}
			}
		}

		console.log(`\n=== 完了 ===`);
		console.log(`成功: ${successCount}件`);
		console.log(`失敗: ${errorCount}件`);
		console.log(`合計: ${itemsToUpdate.length}件`);
	} finally {
		await browser.close();
	}
}

updatePublishedDates().catch(console.error);
