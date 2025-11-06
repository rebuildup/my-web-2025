import * as fs from "fs";
import * as path from "path";
import { chromium } from "playwright";

interface PortfolioItem {
	id: string;
	title?: string;
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
		await page.goto("http://localhost:3010/admin/content");
		await page.waitForSelector("text=コンテンツ管理", { timeout: 15000 });

		// ページが完全に読み込まれるまで待機
		await page.waitForSelector("table", { state: "visible", timeout: 10000 });
		await page.waitForTimeout(2000);

		// 実際に存在するコンテンツIDをAPIから取得
		const apiResponse = await page.evaluate(async () => {
			const res = await fetch("/api/cms/contents");
			return await res.json();
		});
		const existingIds = (apiResponse as Array<{ id: string }>).map((c) => c.id);
		console.log(`\n実際に存在するコンテンツ: ${existingIds.length}件`);
		console.log(
			`存在するID: ${existingIds.slice(0, 10).join(", ")}${existingIds.length > 10 ? "..." : ""}`,
		);

		for (const item of items) {
			try {
				console.log(`\n[DELETE] ${item.id} - ${item.title ?? ""}`);

				// APIから取得したIDリストに存在するか確認
				if (!existingIds.includes(item.id)) {
					console.log("  ℹ️ APIに存在しません（スキップ）");
					continue;
				}

				// テーブル全体からIDを含む行を探す（より確実な方法）
				const allRows = page.locator("table tbody tr");
				const rowCount = await allRows.count();
				let foundRow = null;

				// すべての行をチェック
				for (let i = 0; i < rowCount; i++) {
					const row = allRows.nth(i);

					// 行が見えるようにスクロール
					try {
						await row.scrollIntoViewIfNeeded();
						await page.waitForTimeout(100);
					} catch (e) {
						// スクロールエラーは無視
					}

					const text = await row.textContent();
					if (text && text.trim().includes(item.id)) {
						// さらに確実にするため、TableCell内のテキストも確認
						const cells = row.locator("td");
						const cellCount = await cells.count();
						for (let j = 0; j < cellCount; j++) {
							const cell = cells.nth(j);
							const cellText = await cell.textContent();
							if (cellText && cellText.trim() === item.id) {
								foundRow = row;
								break;
							}
						}
						if (foundRow) break;
					}
				}

				if (!foundRow) {
					console.log("  ℹ️ 見つかりません（スキップ）");
					continue;
				}

				// 行が見つかったら、スクロールして削除ボタンを探す
				await foundRow.scrollIntoViewIfNeeded();
				await page.waitForTimeout(300);

				// 削除ボタンを探す（aria-label="削除"を持つボタン）
				const allButtons = foundRow.locator("button");
				const btnCount = await allButtons.count();
				let deleteButton = null;

				for (let i = 0; i < btnCount; i++) {
					const btn = allButtons.nth(i);
					const ariaLabel = await btn.getAttribute("aria-label");
					if (
						ariaLabel &&
						(ariaLabel.includes("削除") ||
							ariaLabel.toLowerCase().includes("delete"))
					) {
						deleteButton = btn;
						break;
					}
				}

				if (!deleteButton) {
					// フォールバック: Tooltipで削除と表示されているボタンを探す
					const buttonsWithTooltip = foundRow.locator(
						"button[aria-label*='削除']",
					);
					if ((await buttonsWithTooltip.count()) > 0) {
						deleteButton = buttonsWithTooltip.first();
					}
				}

				if (deleteButton) {
					await deleteButton.click();
					await page.waitForTimeout(500);

					// 確認ダイアログ
					const confirm = page
						.locator('[role="dialog"]')
						.getByRole("button", { name: /削除/ })
						.first();
					if ((await confirm.count()) > 0) {
						await confirm.click();
						await page.waitForTimeout(1500);
						await page
							.waitForSelector('[role="dialog"]', {
								state: "hidden",
								timeout: 8000,
							})
							.catch(() => {});
						console.log("  ✅ 削除しました");
						ok++;

						// ページが更新されるまで少し待機
						await page.waitForTimeout(500);
					} else {
						console.log("  ⚠️ 確認ダイアログが見つかりません");
						ng++;
					}
				} else {
					console.log("  ⚠️ 削除ボタンが見つかりません");
					ng++;
				}
			} catch (e) {
				console.error(`  ❌ 失敗: ${item.id}`, e);
				ng++;
			}
		}
	} finally {
		console.log(`\n=== 削除 完了 ===`);
		console.log(
			`成功: ${ok}件 / 失敗: ${ng}件 / 合計ターゲット: ${items.length}件`,
		);
		await browser.close();
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
