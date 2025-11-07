import fs from "node:fs";
import path from "node:path";
import { expect, type Page, test } from "@playwright/test";

const BASE_URL =
	process.env.BASE_URL ||
	process.env.NEXT_PUBLIC_EDITOR_HOME_URL ||
	"http://localhost:3010";

/**
 * ページが安定するまで待機
 */
async function waitForPageLoad(page: Page) {
	try {
		await page.waitForLoadState("networkidle", { timeout: 5000 });
	} catch {
		// ignore
	}
	await page.waitForTimeout(500);
}

type PortfolioContent = {
	id: string;
	title: string;
	description?: string;
	images?: string[];
	videos?: { type: string; url: string }[];
	externalLinks?: { url: string }[];
};

/**
 * コンテンツを選択
 */
async function selectContent(
	page: Page,
	contentId: string,
	contentTitle?: string,
) {
	console.log(
		`  - Selecting content: ${contentId} (${contentTitle || "no title"})`,
	);

	try {
		// MUI Selectの外側のdivをクリック
		// data-testid="content-select"を使用
		const selectElement = page
			.locator('[data-testid="content-select"]')
			.first();

		if (await selectElement.isVisible({ timeout: 3000 }).catch(() => false)) {
			console.log(`    Found select element by data-testid`);
			await selectElement.click();
			await page.waitForTimeout(1000);
		} else {
			// 代替: role="combobox"でクリック
			console.log(`    Trying alternative: role="combobox"`);
			const combobox = page.locator('div[role="combobox"]').first();
			await combobox.waitFor({ state: "visible", timeout: 5000 });
			await combobox.click();
			await page.waitForTimeout(1000);
		}

		// ドロップダウンメニューが表示されるのを待つ
		await page.waitForSelector('ul[role="listbox"]', { timeout: 5000 });
		console.log(`    Dropdown menu opened`);

		// MenuItemを探す
		const menuItems = page.locator('li[role="option"]');
		const count = await menuItems.count();
		console.log(`    Found ${count} menu items`);

		// titleまたはIDで検索
		let found = false;
		for (let i = 0; i < count; i++) {
			const item = menuItems.nth(i);
			const text = await item.textContent();

			// "Select content"オプションをスキップ
			if (text && text.includes("Select content")) {
				continue;
			}

			// titleまたはIDに一致するか確認
			if (
				text &&
				(text.includes(contentId) ||
					(contentTitle && text.includes(contentTitle)))
			) {
				console.log(`    Clicking on: "${text}"`);
				await item.click();
				found = true;
				break;
			}
		}

		if (!found) {
			console.error(
				`    Content not found in menu: ${contentId} / ${contentTitle}`,
			);
			// デバッグ: 利用可能なオプションを表示
			console.log(`    Available options:`);
			for (let i = 0; i < Math.min(count, 10); i++) {
				const item = menuItems.nth(i);
				const text = await item.textContent();
				console.log(`      [${i}] ${text}`);
			}
			throw new Error(`Content not found: ${contentId}`);
		}

		await waitForPageLoad(page);
		console.log(`    Content selected successfully`);
	} catch (error) {
		console.error(`    Error selecting content:`, error);
		// エラー時のスクリーンショット
		await page.screenshot({ path: `debug-select-error-${Date.now()}.png` });
		throw error;
	}
}

/**
 * 既存記事を削除
 */
async function deleteExistingPages(
	page: Page,
	contentId: string,
	contentTitle?: string,
) {
	console.log(`  - Deleting existing pages for: ${contentId}`);
	await selectContent(page, contentId, contentTitle);
	await waitForPageLoad(page);

	// 記事一覧から全ての記事を削除
	let attempts = 0;
	const maxAttempts = 50; // 最大50記事まで削除

	while (attempts < maxAttempts) {
		try {
			// ListItemButton (MUIコンポーネント) を探す
			// これらは .MuiListItemButton-root クラスを持つ
			const listItemButtons = page.locator(".MuiListItemButton-root");
			const count = await listItemButtons.count();

			if (count === 0) {
				console.log(`    No pages found to delete`);
				break;
			}

			console.log(
				`    Found ${count} page(s), deleting first one (attempt ${attempts + 1}/${maxAttempts})`,
			);

			// 最初の記事をクリック
			const firstItem = listItemButtons.first();
			await firstItem.scrollIntoViewIfNeeded();
			await page.waitForTimeout(300);
			await firstItem.click();
			await page.waitForTimeout(1000);
			await waitForPageLoad(page);

			// サイドバーの削除ボタンを探す
			const deleteButton = page.locator('button:has-text("Delete page")');

			await deleteButton
				.waitFor({ state: "visible", timeout: 5000 })
				.catch(() => {
					console.log(`    Delete button not visible yet, waiting...`);
				});

			if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
				console.log(`    Clicking delete button`);

				// 確認ダイアログのハンドラーを設定
				page.once("dialog", async (dialog) => {
					console.log(`      Accepting dialog: "${dialog.message()}"`);
					await dialog.accept();
				});

				// 削除ボタンをクリック
				await deleteButton.click();

				// 削除処理の完了を待つ
				await page.waitForTimeout(2000);
				await waitForPageLoad(page);
				console.log(`    Page deleted successfully`);
			} else {
				console.log(`    Delete button not found after opening page`);
				// デバッグ用スクリーンショット
				await page.screenshot({
					path: `debug-no-delete-button-${Date.now()}.png`,
				});
				console.log(`    Screenshot saved for debugging`);
				break;
			}

			attempts++;
		} catch (error) {
			console.error(`    Error deleting page:`, error);
			await page.screenshot({ path: `debug-delete-error-${Date.now()}.png` });
			break;
		}
	}

	if (attempts > 0) {
		console.log(`    Successfully deleted ${attempts} page(s)`);
	}
}

/**
 * 新しい記事を作成
 */
async function createNewPage(
	page: Page,
	contentId: string,
	title: string,
	slug: string,
) {
	console.log(`  - Creating new page: "${title}" (slug: ${slug})`);

	// コンテンツが既に選択されているか確認
	const currentContentText = await page
		.locator('[data-testid="content-select"]')
		.textContent();
	if (
		!currentContentText?.includes(title) &&
		!currentContentText?.includes(contentId)
	) {
		console.log(`    Selecting content again...`);
		await selectContent(page, contentId, title);
		await waitForPageLoad(page);
	} else {
		console.log(`    Content already selected`);
	}

	// New pageボタンを探す
	const newPageButton = page.locator('button:has-text("New page")');
	await newPageButton.waitFor({ state: "visible", timeout: 5000 });

	console.log(`    Setting up dialog handlers`);

	// ダイアログハンドラーを設定（2つのプロンプトが順番に表示される）
	let dialogHandled = 0;
	const dialogHandler = async (dialog: any) => {
		dialogHandled++;
		const message = dialog.message();
		console.log(`    Dialog ${dialogHandled}: "${message}"`);

		// 最初のダイアログ: タイトル
		if (dialogHandled === 1 || message.toLowerCase().includes("title")) {
			console.log(`      → Entering title: "${title}"`);
			await dialog.accept(title);
		}
		// 2番目のダイアログ: スラッグ
		else if (dialogHandled === 2 || message.toLowerCase().includes("slug")) {
			console.log(`      → Entering slug: "${slug}"`);
			await dialog.accept(slug);
		} else {
			console.log(`      → Unknown dialog, dismissing`);
			await dialog.dismiss();
		}
	};

	// イベントリスナーを登録
	page.on("dialog", dialogHandler);

	// New pageボタンをクリック
	console.log(`    Clicking "New page" button`);
	await newPageButton.click();

	// ダイアログの処理とページ作成を待つ
	// 最大10秒待機（2つのダイアログ + ページ作成）
	await page.waitForTimeout(5000);

	// 記事が作成されたか確認
	const listItemButtons = page.locator(".MuiListItemButton-root");
	const count = await listItemButtons.count();
	console.log(`    Current page count: ${count}`);

	if (count > 0) {
		console.log(`    ✓ New page created successfully`);

		// 作成された記事を開く（リストの最初の項目）
		console.log(`    Opening newly created page...`);
		await listItemButtons.first().click();
		await page.waitForTimeout(1000);
		await waitForPageLoad(page);
	} else {
		console.warn(`    ⚠ No pages found after creation`);
		// デバッグ用スクリーンショット
		await page.screenshot({
			path: `debug-no-pages-after-create-${Date.now()}.png`,
		});
	}

	await waitForPageLoad(page);

	// イベントリスナーを削除
	page.off("dialog", dialogHandler);
}

/**
 * 全ブロックをクリアして、最初のブロックにフォーカス
 */
async function clearAllBlocks(page: Page) {
	console.log(`  - Clearing all blocks and focusing first block`);

	// 全てのcontenteditable要素を探す
	const textEditor = page.locator('div[contenteditable="true"]').first();

	if (await textEditor.isVisible({ timeout: 2000 }).catch(() => false)) {
		try {
			// クリックしてフォーカス
			await textEditor.click({ timeout: 5000 });
			await page.waitForTimeout(300);

			// 全選択して削除
			await page.keyboard.press("Control+A");
			await page.waitForTimeout(200);
			await page.keyboard.press("Delete");
			await page.waitForTimeout(300);

			// 最初のブロックにフォーカスが当たっていることを確認
			await textEditor.click();
			await page.waitForTimeout(300);

			return;
		} catch (error) {
			console.warn(`  Warning: Could not clear blocks properly`);
		}
	}

	// フォールバック: 少なくとも最初のブロックをクリック
	const firstBlock = page.locator('div[contenteditable="true"]').first();
	if (await firstBlock.isVisible({ timeout: 1000 }).catch(() => false)) {
		await firstBlock.click();
		await page.waitForTimeout(300);
	}
}

/**
 * エディタにテキストを入力（Enterで自動的にブロックが作成される）
 */
async function typeInEditor(page: Page, text: string) {
	// 現在フォーカスされているエディタに直接入力
	await page.keyboard.type(text, { delay: 10 });
	await page.waitForTimeout(300);
}

/**
 * Enterキーを押して改行（新しいブロックが自動作成される）
 */
async function pressEnter(page: Page) {
	await page.keyboard.press("Enter");
	await page.waitForTimeout(500);
}

/**
 * Headingブロックを追加（ボタンクリック不要、テキスト入力のみ）
 */
async function addHeadingBlock(page: Page, text: string, level: 1 | 2 | 3 = 1) {
	const prefix = "#".repeat(level) + " ";
	console.log(`  - Adding heading (H${level}): ${prefix}${text}`);

	// 見出しプレースホルダにフォーカス（なければ先頭のtextbox）
	const headingEditable = page
		.locator('div[role="textbox"][data-placeholder="Heading"]')
		.first();
	const fallbackEditable = page.locator('div[role="textbox"]').first();
	if (await headingEditable.isVisible({ timeout: 800 }).catch(() => false)) {
		await headingEditable.click();
	} else if (
		await fallbackEditable.isVisible({ timeout: 800 }).catch(() => false)
	) {
		await fallbackEditable.click();
	}
	await page.waitForTimeout(100);

	// 一括挿入で変換前に全文字列を入れる
	await page.keyboard.insertText(`${prefix}${text}`);
	await page.waitForTimeout(150);

	// Enterで次の段落ブロックを自動作成（必ず見出しtextboxにフォーカスしてから）
	const editorRoot = page.locator("[data-editor-id]").first();
	const firstBlockTextbox = editorRoot
		.locator("[data-block-id]")
		.first()
		.locator('div[role="textbox"]')
		.first();
	if (await firstBlockTextbox.isVisible({ timeout: 1000 }).catch(() => false)) {
		await firstBlockTextbox.click();
		await page.waitForTimeout(50);
		// キャレットを末尾に移動してからEnter
		await page.keyboard.press("End");
		await page.waitForTimeout(30);
	}
	await page.keyboard.press("Enter");
	// 次ブロック生成待ち
	await editorRoot
		.locator("[data-block-id]")
		.nth(1)
		.waitFor({ state: "visible", timeout: 2000 })
		.catch(() => {});
}

/**
 * Paragraphブロックを追加（ボタンクリック不要、テキスト入力のみ）
 */
async function addParagraphBlock(page: Page, text: string) {
	console.log(`  - Adding paragraph`);
	// エディタ領域内の「2番目」のブロック（H1の直後）を特定してクリック
	const editorRoot = page.locator("[data-editor-id]").first();
	const secondBlock = editorRoot.locator("[data-block-id]").nth(1);
	const secondTextbox = secondBlock.locator('div[role="textbox"]').first();

	// 次ブロックが生成されるまで待機
	await secondBlock
		.waitFor({ state: "visible", timeout: 3000 })
		.catch(() => {});
	if (await secondTextbox.isVisible({ timeout: 2000 }).catch(() => false)) {
		await secondTextbox.click();
		await page.waitForTimeout(120);
	} else {
		// フォールバック: Enterで段落を生成してから再度取得
		await pressEnter(page);
		await page.waitForTimeout(150);
		await secondBlock
			.waitFor({ state: "visible", timeout: 1500 })
			.catch(() => {});
		if (await secondTextbox.isVisible({ timeout: 1000 }).catch(() => false)) {
			await secondTextbox.click();
			await page.waitForTimeout(100);
		}
	}

	// 一括挿入で確実に入力
	await page.keyboard.insertText(text);
	await pressEnter(page);
}

/**
 * 最初のH1見出しと直下のParagraphを検証し、必要なら修復する
 */
async function ensureFirstHeadingAndParagraph(
	page: Page,
	title: string,
	description?: string,
): Promise<void> {
	for (let attempt = 1; attempt <= 3; attempt++) {
		console.log(`  - Ensure structure attempt ${attempt}/3`);

		// 1) クリアして見出し+段落を再入力
		await clearAllBlocks(page);
		await addHeadingBlock(page, title, 1);
		if (description && description.trim().length > 0) {
			await addParagraphBlock(page, description);
		}

		// 2) エディタ上の最初の2ブロックを検証（EditableTextを直接確認）
		const editorRoot = page.locator("[data-editor-id]").first();
		const editors = editorRoot.locator(
			'div[role="textbox"]:not([data-placeholder="Caption"])',
		);
		const firstText =
			(await editors
				.nth(0)
				.textContent()
				.catch(() => null)) ?? "";
		const secondText =
			(await editors
				.nth(1)
				.textContent()
				.catch(() => null)) ?? "";

		const expectHeading = `# ${title}`;
		const headingOk = firstText.trim().startsWith(expectHeading);
		let paraOk = true;
		if (description && description.trim().length > 0) {
			paraOk = secondText.includes(
				description.substring(0, Math.min(description.length, 10)),
			);
		}

		if (headingOk && paraOk) {
			console.log("  ✓ Structure confirmed: H1 then Paragraph");
			return;
		} else {
			console.log(
				`    Verification failed → first:"${firstText.trim().slice(0, 40)}" second:"${secondText.trim().slice(0, 40)}"`,
			);
		}
	}

	throw new Error("Failed to ensure heading/paragraph structure after retries");
}

/**
 * CSSセレクタ用の簡易エスケープ
 */
function escapeForSelector(text: string): string {
	return text.replace(/"/g, '\\"').replace(/\n/g, " ");
}

/**
 * Custom HTMLブロックを追加（YouTubeの埋め込み用）
 */
async function addCustomHTMLBlock(page: Page, htmlContent: string) {
	console.log(`  - Adding custom HTML block`);

	// 事前に空の段落ブロックを用意してフォーカス
	await pressEnter(page);
	const lastEditable = page.locator('div[contenteditable="true"]').last();
	if (await lastEditable.isVisible({ timeout: 2000 }).catch(() => false)) {
		await lastEditable.click();
		await page.waitForTimeout(150);
	}

	// 「/」を入力してブロックメニューを開く
	await page.keyboard.type("/");
	await page.waitForTimeout(500);

	// "html"を検索（より確実に）
	await page.keyboard.type("html");
	await page.waitForTimeout(500);

	// Enterで選択
	await page.keyboard.press("Enter");
	await page.waitForTimeout(800);

	// Custom HTMLのEditableTextはcontenteditableのdiv（role="textbox"）
	const htmlEditor = page
		.locator('div[role="textbox"][data-placeholder*="div"]')
		.last();

	const editorVisible = await htmlEditor
		.isVisible({ timeout: 1500 })
		.catch(() => false);
	if (editorVisible) {
		await htmlEditor.scrollIntoViewIfNeeded();
		await page.waitForTimeout(100);
		await htmlEditor.fill(htmlContent);
	} else {
		// フォールバック: そのまま現在のエディタにタイプ
		console.log("    HTML textarea not found, typing into active editor");
		await page.keyboard.type(htmlContent, { delay: 2 });
	}
	await page.waitForTimeout(500);

	// Escapeキーを押してブロックを確定
	await page.keyboard.press("Escape");
	await page.waitForTimeout(500);

	// 最後のブロックの後ろにフォーカスを移動
	await page.keyboard.press("End");
	await page.waitForTimeout(300);
	await pressEnter(page);
}

/**
 * Imageブロックを追加
 */
async function addImageBlock(page: Page, imageUrl: string) {
	console.log(`  - Adding image: ${imageUrl}`);

	// 「/」を入力してブロックメニューを開く
	await page.keyboard.type("/");
	await page.waitForTimeout(500);

	// "Image"を検索
	await page.keyboard.type("image");
	await page.waitForTimeout(500);

	// Enterで選択
	await page.keyboard.press("Enter");
	await page.waitForTimeout(2000);

	// 画像コントロールを強制表示
	await page.evaluate(() => {
		const controls = document.querySelectorAll(".image-controls");
		controls.forEach((control) => {
			if (control instanceof HTMLElement) {
				control.style.opacity = "1";
				control.style.pointerEvents = "auto";
			}
		});
	});
	await page.waitForTimeout(500);

	const urlInput = page
		.locator('input[placeholder*="https"]')
		.or(page.locator('textbox[label="URL"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(imageUrl);
	await page.waitForTimeout(500);

	// Escapeキーを押してブロックを確定
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);
	await pressEnter(page);
}

/**
 * Videoブロックを追加
 */
async function addVideoBlock(page: Page, videoUrl: string) {
	console.log(`  - Adding video: ${videoUrl}`);
	const videoButton = page
		.locator('button:has-text("Video")')
		.or(page.locator('button:has-text("▶ Video")'))
		.first();
	await videoButton.waitFor({ state: "visible", timeout: 5000 });
	await videoButton.click();
	await page.waitForTimeout(2000);

	const urlInput = page
		.locator('input[placeholder*="https"]')
		.or(page.locator('textbox[label="URL"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(videoUrl);
	await page.waitForTimeout(500);
}

/**
 * Fileブロックを追加
 */
async function addFileBlock(page: Page, fileUrl: string, fileName: string) {
	console.log(`  - Adding file: ${fileName}`);
	const fileButton = page
		.locator('button:has-text("File")')
		.or(page.locator('button:has-text("📎 File")'))
		.first();
	await fileButton.waitFor({ state: "visible", timeout: 5000 });
	await fileButton.click();
	await page.waitForTimeout(2000);

	const urlInput = page
		.locator('input[placeholder*="https"]')
		.or(page.locator('textbox[label="URL"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(fileUrl);
	await page.waitForTimeout(500);
}

/**
 * Bookmarkブロックを追加
 */
async function addBookmarkBlock(page: Page, url: string) {
	console.log(`  - Adding bookmark: ${url}`);

	// 「/」を入力してブロックメニューを開く
	await page.keyboard.type("/");
	await page.waitForTimeout(500);

	// "Bookmark"を検索
	await page.keyboard.type("bookmark");
	await page.waitForTimeout(500);

	// Enterで選択
	await page.keyboard.press("Enter");
	await page.waitForTimeout(2000);

	const urlInput = page
		.locator('input[placeholder*="https"]')
		.or(page.locator('textbox[label="URL"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(url);
	await page.waitForTimeout(500);

	// Escapeキーを押してブロックを確定
	await page.keyboard.press("Escape");
	await page.waitForTimeout(300);
	await pressEnter(page);
}

/**
 * ページを保存
 */
async function savePage(page: Page) {
	console.log(`  - Saving page`);
	const saveButton = page.locator('button:has-text("Save now")');
	await saveButton.waitFor({ state: "visible", timeout: 10000 });
	if (await saveButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
		await saveButton.click();
		await waitForPageLoad(page);
		await page
			.waitForSelector('text="All changes saved"', { timeout: 10000 })
			.catch(() => {
				console.warn("    Save confirmation not found");
			});
	}
}

/**
 * YouTubeのURLからビデオIDを抽出
 */
function extractYoutubeVideoId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
		/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}

	return null;
}

/**
 * YouTube埋め込み用のiframeを生成
 */
function generateYoutubeEmbed(url: string): string {
	const videoId = extractYoutubeVideoId(url);
	if (!videoId) return "";

	return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}

test.setTimeout(1800000); // 30分タイムアウト

test.describe("Portfolio Articles Creation", () => {
	// デバッグ用: 最初の1つだけをテスト
	test("【デバッグ】最初の1つのコンテンツをテスト", async ({ page }) => {
		console.log("\n========================================");
		console.log("デバッグモード: 最初の1コンテンツのみ処理");
		console.log("========================================\n");

		const portfolioPath = path.join(process.cwd(), "portfolio.json");
		const portfolioData: PortfolioContent[] = JSON.parse(
			fs.readFileSync(portfolioPath, "utf-8"),
		);
		const content = portfolioData[0]; // 最初の1つだけ

		console.log(`テスト対象: ${content.id} - ${content.title}\n`);

		await page.goto(`${BASE_URL}/admin/content/page-editor`);
		await waitForPageLoad(page);

		console.log("Page loaded, waiting for content selector...");
		await page.waitForTimeout(2000);

		// スクリーンショットを撮って確認
		await page.screenshot({ path: "debug-page-initial.png" });
		console.log("Screenshot saved: debug-page-initial.png");

		try {
			// 1. 既存記事の削除
			await deleteExistingPages(page, content.id, content.title);

			// 2. 新しい記事を作成
			await createNewPage(page, content.id, content.title, content.id);

			// 3. 全ブロックをクリア
			await clearAllBlocks(page);

			// 4-5. H1 + Paragraph を検証しつつ投入（うまくいくまで自己修復）
			await ensureFirstHeadingAndParagraph(
				page,
				content.title,
				content.description,
			);

			// 6. Mediaセクション
			const hasMedia =
				(content.videos && content.videos.length > 0) ||
				(content.images && content.images.length > 0);

			if (hasMedia) {
				await addHeadingBlock(page, "Media", 2);

				// YouTubeビデオ
				if (content.videos && content.videos.length > 0) {
					for (const video of content.videos) {
						if (video.type === "youtube" && video.url) {
							const embedHtml = generateYoutubeEmbed(video.url);
							if (embedHtml) {
								await addCustomHTMLBlock(page, embedHtml);
							}
						}
					}
				}

				// 画像 - 一旦コメントアウト
				/*
				if (content.images && content.images.length > 0) {
					for (const imageUrl of content.images) {
						if (imageUrl) {
							// 相対パスを絶対URLに変換
							const fullImageUrl = imageUrl.startsWith("http")
								? imageUrl
								: `${BASE_URL}${imageUrl}`;
							await addImageBlock(page, fullImageUrl);
						}
					}
				}
				*/
			}

			// 7. Linksセクション - 一旦コメントアウト
			/*
			if (content.externalLinks && content.externalLinks.length > 0) {
				await addHeadingBlock(page, "Links", 2);

				for (const link of content.externalLinks) {
					if (link.url) {
						await addBookmarkBlock(page, link.url);
					}
				}
			}
			*/

			// 8. ページを保存
			await savePage(page);
			console.log(`✓ Successfully created article`);
		} catch (error) {
			console.error(`✗ Failed:`, error);
			await page.screenshot({ path: "debug-page-error.png" });
			console.log("Error screenshot saved: debug-page-error.png");
			throw error;
		}
	});

	test.skip("ポートフォリオコンテンツから記事を自動作成", async ({
		page,
		browser,
	}) => {
		// ヘッドレスモードをオフにして、ブラウザを表示
		console.log("\n========================================");
		console.log("ポートフォリオ記事の自動作成を開始");
		console.log("========================================\n");

		// portfolio.jsonを読み込み
		const portfolioPath = path.join(process.cwd(), "portfolio.json");
		const portfolioData: PortfolioContent[] = JSON.parse(
			fs.readFileSync(portfolioPath, "utf-8"),
		);

		console.log(`読み込んだポートフォリオ件数: ${portfolioData.length}\n`);

		// page-editorに移動
		console.log(`Navigating to: ${BASE_URL}/admin/content/page-editor`);
		await page.goto(`${BASE_URL}/admin/content/page-editor`);
		await waitForPageLoad(page);

		// ページが正しく読み込まれたか確認
		console.log(`Page title: ${await page.title()}`);

		// コンテンツセレクターが表示されるまで待機
		await page
			.waitForSelector('[aria-labelledby="content-selector-label"]', {
				timeout: 10000,
			})
			.catch(() => {
				console.warn("Content selector not found with aria-labelledby");
			});

		// 利用可能なコンテンツを確認
		const contentOptions = await page.locator('li[role="option"]').count();
		console.log(`Available content options: ${contentOptions}`);

		for (let i = 0; i < portfolioData.length; i++) {
			const content = portfolioData[i];
			console.log(
				`\n[${i + 1}/${portfolioData.length}] Processing: ${content.id}`,
			);
			console.log(`  Title: ${content.title}`);

			try {
				// 1. 既存記事の削除
				await deleteExistingPages(page, content.id, content.title);

				// 2. 新しい記事を作成
				await createNewPage(page, content.id, content.title, content.id);

				// 3. H1 + Paragraph を検証しつつ投入
				await ensureFirstHeadingAndParagraph(
					page,
					content.title,
					content.description,
				);

				// 6. Mediaセクション
				const hasMedia =
					(content.videos && content.videos.length > 0) ||
					(content.images && content.images.length > 0);

				if (hasMedia) {
					await addHeadingBlock(page, "Media", 2);

					// YouTubeビデオ
					if (content.videos && content.videos.length > 0) {
						for (const video of content.videos) {
							if (video.type === "youtube" && video.url) {
								const embedHtml = generateYoutubeEmbed(video.url);
								if (embedHtml) {
									await addCustomHTMLBlock(page, embedHtml);
								}
							}
						}
					}

					// 画像
					if (content.images && content.images.length > 0) {
						for (const imageUrl of content.images) {
							// 相対パスを絶対URLに変換
							const fullImageUrl = imageUrl.startsWith("http")
								? imageUrl
								: `${BASE_URL}${imageUrl}`;
							await addImageBlock(page, fullImageUrl);
						}
					}
				}

				// 7. Linksセクション
				if (content.externalLinks && content.externalLinks.length > 0) {
					await addHeadingBlock(page, "Links", 2);

					for (const link of content.externalLinks) {
						await addBookmarkBlock(page, link.url);
					}
				}

				// 8. 保存
				await savePage(page);

				console.log(`  ✓ Successfully created article for: ${content.id}`);
			} catch (error) {
				console.error(`  ✗ Failed to create article for ${content.id}:`, error);
				// エラーが発生しても次のコンテンツを処理
				continue;
			}

			// 次のコンテンツ処理前に少し待機
			await page.waitForTimeout(1000);
		}

		console.log("\n========================================");
		console.log("全ての記事作成が完了しました");
		console.log("========================================\n");
	});
});
