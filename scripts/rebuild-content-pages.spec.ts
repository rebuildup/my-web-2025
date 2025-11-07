import { expect, type Page, test } from "@playwright/test";

const BASE_URL =
	process.env.BASE_URL ||
	process.env.NEXT_PUBLIC_EDITOR_HOME_URL ||
	"http://localhost:3010";

const CONTENT_LIMIT = process.env.CONTENT_LIMIT
	? Number.parseInt(process.env.CONTENT_LIMIT, 10)
	: undefined;

// デバッグモード: trueにすると各ステップで待機時間が長くなり、操作が見やすくなります
const DEBUG_MODE = process.env.DEBUG === "1" || process.env.DEBUG === "true";

type AssetRef = {
	src: string;
	type?: string;
	alt?: string;
	description?: string;
};

type ContentLink = {
	href: string;
	label?: string;
	description?: string;
};

type ContentRecord = {
	id: string;
	title: string;
	summary?: string;
	assets?: AssetRef[];
	links?: ContentLink[];
	ext?: Record<string, unknown>;
};

type MediaItem = {
	id: string;
	filename?: string;
	mimeType: string;
	alt?: string;
	size?: number;
};

type MediaTask =
	| { kind: "youtube"; url: string }
	| { kind: "image"; url: string }
	| { kind: "video"; url: string }
	| { kind: "file"; url: string; filename?: string };

test.describe("Page editor bulk rebuild", () => {
	test.setTimeout(30 * 60 * 1000);

	test("recreate every page-editor article from CMS content", async ({
		page,
		request,
	}) => {
		console.log("\n========================================");
		console.log("Page-editor rebuild start");
		console.log("========================================\n");

		// サーバーが起動しているか確認
		console.log(`Checking server availability at ${BASE_URL}...`);
		let serverReady = false;
		for (let attempt = 0; attempt < 30; attempt++) {
			try {
				const response = await request.get(`${BASE_URL}/api/cms/contents`, {
					timeout: 2000,
				});
				if (
					response.ok() ||
					response.status() === 401 ||
					response.status() === 403
				) {
					serverReady = true;
					console.log(`✓ Server is ready`);
					break;
				}
			} catch {
				// サーバーがまだ起動していない
			}
			if (attempt < 29) {
				console.log(`  Waiting for server... (${attempt + 1}/30)`);
				await page.waitForTimeout(1000);
			}
		}

		if (!serverReady) {
			throw new Error(
				`Server is not available at ${BASE_URL}. Please start the development server with "pnpm dev"`,
			);
		}

		await page.goto(`${BASE_URL}/admin/content/page-editor`);
		await waitForPageLoad(page);

		const contentsRes = await request.get(`${BASE_URL}/api/cms/contents`);
		expect(contentsRes.ok()).toBeTruthy();
		let contents = (await contentsRes.json()) as ContentRecord[];
		if (Number.isFinite(CONTENT_LIMIT) && CONTENT_LIMIT && CONTENT_LIMIT > 0) {
			contents = contents.slice(0, CONTENT_LIMIT);
		}

		console.log(`Total contents to rebuild: ${contents.length}`);

		for (let index = 0; index < contents.length; index++) {
			const contentSummary = contents[index];
			console.log(
				`\n[${index + 1}/${contents.length}] Processing ${contentSummary.id} - ${contentSummary.title}`,
			);

			try {
				const detailRes = await request.get(
					`${BASE_URL}/api/cms/contents?id=${encodeURIComponent(contentSummary.id)}`,
				);
				if (!detailRes.ok()) {
					console.error("  ? Failed to load content detail");
					continue;
				}
				const content = (await detailRes.json()) as ContentRecord;

				const mediaRes = await request.get(
					`${BASE_URL}/api/cms/media?contentId=${encodeURIComponent(content.id)}`,
				);
				const uploads = mediaRes.ok()
					? ((await mediaRes.json()) as MediaItem[])
					: [];

				await deleteExistingPages(page, content.id, content.title);
				await createNewPage(page, content.id, content.title, content.id);
				// 作成したページを選択（ページリストから選択）
				const pageButton = page
					.locator(`button:has-text("${content.title}")`)
					.or(page.locator(`button:has-text("${content.id}")`))
					.first();
				if (await pageButton.isVisible({ timeout: 3000 }).catch(() => false)) {
					await pageButton.click();
					await waitForPageLoad(page);
					await page.waitForTimeout(DEBUG_MODE ? 1000 : 500);
				}
				await clearAllBlocks(page);
				await ensureFirstHeadingAndParagraph(
					page,
					content.title,
					content.summary,
				);

				const mediaTasks = collectMediaSources(content, uploads);
				if (mediaTasks.length > 0) {
					console.log(`  - Adding ${mediaTasks.length} media item(s)`);
					await addHeadingBlock(page, "Media", 2);
					for (const media of mediaTasks) {
						await insertMediaBlock(page, media);
					}
				} else {
					console.log(`  - No media items to add`);
				}

				if (content.links && content.links.length > 0) {
					console.log(`  - Adding ${content.links.length} link(s)`);
					await addHeadingBlock(page, "Links", 2);
					for (const link of content.links) {
						if (!link.href) continue;
						console.log(`    Adding bookmark: ${link.href}`);
						await addBookmarkBlock(page, link.href);
					}
				} else {
					console.log(`  - No links to add`);
				}

				await savePage(page);
				console.log(`  ✓ Completed article for ${content.id}`);
				const waitTime = DEBUG_MODE ? 1500 : 800;
				await page.waitForTimeout(waitTime);
			} catch (error) {
				console.error(`  ✗ Failed for ${contentSummary.id}:`, error);
				// ページが閉じられていないか確認
				if (!page.isClosed()) {
					try {
						await page.screenshot({
							path: `debug-page-error-${contentSummary.id}.png`,
							fullPage: true,
						});
					} catch (screenshotError) {
						console.warn(`    Could not take screenshot: ${screenshotError}`);
					}
				}
				continue;
			}
		}

		console.log("\n========================================");
		console.log("Page-editor rebuild completed");
		console.log("========================================\n");
	});
});

async function waitForPageLoad(page: Page) {
	try {
		await page.waitForLoadState("networkidle", { timeout: 5000 });
	} catch {
		// ignore flakiness
	}
	const waitTime = DEBUG_MODE ? 1000 : 500;
	await page.waitForTimeout(waitTime);
}

async function selectContent(
	page: Page,
	contentId: string,
	contentTitle?: string,
) {
	console.log(`  - Selecting content: ${contentId}`);
	try {
		const selectElement = page
			.locator('[data-testid="content-select"]')
			.first();
		if (await selectElement.isVisible({ timeout: 3000 }).catch(() => false)) {
			await selectElement.click();
		} else {
			const combobox = page.locator('div[role="combobox"]').first();
			await combobox.waitFor({ state: "visible", timeout: 5000 });
			await combobox.click();
		}
		await page.waitForSelector('ul[role="listbox"]', { timeout: 5000 });
		const menuItems = page.locator('li[role="option"]');
		const count = await menuItems.count();
		for (let i = 0; i < count; i++) {
			const item = menuItems.nth(i);
			const text = (await item.textContent()) || "";
			if (
				text.includes(contentId) ||
				(contentTitle &&
					text.toLowerCase().includes(contentTitle.toLowerCase()))
			) {
				await item.click();
				await waitForPageLoad(page);
				console.log(`    ✓ Content selected: ${contentId}`);
				return;
			}
		}
		throw new Error(`Content not found in selector: ${contentId}`);
	} catch (error) {
		console.error(`    ✗ Failed to select content ${contentId}:`, error);
		throw error;
	}
}

async function deleteExistingPages(
	page: Page,
	contentId: string,
	contentTitle?: string,
) {
	console.log(`  - Deleting existing pages for ${contentId}`);
	await selectContent(page, contentId, contentTitle);
	await waitForPageLoad(page);

	const listItemButtons = page.locator(".MuiListItemButton-root");
	let deletedCount = 0;
	for (let attempt = 0; attempt < 50; attempt++) {
		const count = await listItemButtons.count();
		if (count === 0) {
			if (deletedCount > 0) {
				console.log(`    ✓ Deleted ${deletedCount} existing page(s)`);
			} else {
				console.log("    ✓ No existing pages to delete");
			}
			break;
		}
		const firstItem = listItemButtons.first();
		await firstItem.scrollIntoViewIfNeeded();
		await firstItem.click();
		await waitForPageLoad(page);

		const deleteButton = page.locator('button:has-text("Delete page")');
		await deleteButton.waitFor({ state: "visible", timeout: 5000 });
		page.once("dialog", async (dialog) => {
			await dialog.accept();
		});
		await deleteButton.click();
		const waitTime = DEBUG_MODE ? 1200 : 600;
		await page.waitForTimeout(waitTime);
		deletedCount++;
	}
}

async function createNewPage(
	page: Page,
	contentId: string,
	title: string,
	slug: string,
) {
	console.log(`  - Creating page for ${contentId}`);
	console.log(`    Title: ${title}`);
	console.log(`    Slug: ${slug}`);
	await selectContent(page, contentId, title);
	const newPageButton = page.locator('button:has-text("New page")');
	await newPageButton.waitFor({ state: "visible", timeout: 5000 });

	let dialogHandled = 0;
	const dialogHandler = async (dialog: any) => {
		dialogHandled++;
		const message = dialog.message().toLowerCase();
		if (dialogHandled === 1 || message.includes("title")) {
			console.log(`    Entering title: ${title}`);
			await dialog.accept(title);
		} else {
			console.log(`    Entering slug: ${slug}`);
			await dialog.accept(slug);
		}
	};
	page.on("dialog", dialogHandler);
	await newPageButton.click();
	const waitTime = DEBUG_MODE ? 1000 : 500;
	await page.waitForTimeout(waitTime);
	page.off("dialog", dialogHandler);
	await waitForPageLoad(page);
	console.log(`    ✓ Page created successfully`);
}

async function clearAllBlocks(page: Page) {
	const editor = page.locator('div[contenteditable="true"]').first();
	if (await editor.isVisible({ timeout: 2000 }).catch(() => false)) {
		await editor.click({ timeout: 5000 });
		await page.keyboard.press("Control+A");
		await page.keyboard.press("Delete");
		await page.waitForTimeout(300);
	}
}

async function addHeadingBlock(page: Page, text: string, level: 1 | 2 | 3 = 1) {
	console.log(`    Adding heading (H${level}): ${text}`);
	// BlockLibraryパネルからHeadingブロックをクリック
	const headingButton = page
		.locator('button:has-text("Heading")')
		.or(page.locator('button:has-text("H Heading")'))
		.first();
	await headingButton.waitFor({ state: "visible", timeout: 5000 });
	await headingButton.click();
	const waitTime = DEBUG_MODE ? 1500 : 1000;
	await page.waitForTimeout(waitTime);

	// Headingエディタを探して入力
	const headingEditor = page
		.locator('div[contenteditable="true"][data-placeholder="Heading"]')
		.or(page.locator('div[role="textbox"][data-placeholder="Heading"]'))
		.last();
	await headingEditor.waitFor({ state: "visible", timeout: 5000 });
	await headingEditor.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);

	// レベルに応じたプレフィックスを追加（H1は#、H2は##、H3は###）
	const prefix = "#".repeat(level) + " ";
	await headingEditor.fill(`${prefix}${text}`);

	// レベルを設定するために、attributesを更新する必要がある場合はここで処理
	// ただし、エディタが自動的に変換する可能性があるので、まずはテキストを入力
	const waitTime2 = DEBUG_MODE ? 800 : 500;
	await page.waitForTimeout(waitTime2);
}

async function addParagraphBlock(page: Page, text: string) {
	console.log(
		`    Adding paragraph: ${text.substring(0, 50)}${text.length > 50 ? "..." : ""}`,
	);
	// BlockLibraryパネルからParagraphブロックをクリック
	const paragraphButton = page
		.locator('button:has-text("Paragraph")')
		.or(page.locator('button:has-text("¶ Paragraph")'))
		.first();
	await paragraphButton.waitFor({ state: "visible", timeout: 5000 });
	await paragraphButton.click();
	const waitTime = DEBUG_MODE ? 1500 : 1000;
	await page.waitForTimeout(waitTime);

	// Paragraphエディタを探して入力
	const paragraphEditor = page
		.locator('div[contenteditable="true"][data-placeholder*="Write"]')
		.or(page.locator('div[role="textbox"][data-placeholder*="Write"]'))
		.or(
			page
				.locator('div[contenteditable="true"]')
				.filter({ hasNotText: "Heading" })
				.last(),
		)
		.last();
	await paragraphEditor.waitFor({ state: "visible", timeout: 5000 });
	await paragraphEditor.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await paragraphEditor.fill(text);
	const waitTime2 = DEBUG_MODE ? 800 : 500;
	await page.waitForTimeout(waitTime2);
}

async function addCustomHTMLBlock(page: Page, htmlContent: string) {
	console.log(`    Adding HTML block`);
	// BlockLibraryパネルからHTMLブロックをクリック
	const htmlButton = page
		.locator('button:has-text("HTML")')
		.or(page.locator('button:has-text("Custom HTML")'))
		.first();
	await htmlButton.waitFor({ state: "visible", timeout: 5000 });
	await htmlButton.click();
	const waitTime = DEBUG_MODE ? 2000 : 1500;
	await page.waitForTimeout(waitTime);

	// HTMLエディタを探して入力
	const htmlEditor = page
		.locator('div[role="textbox"][data-placeholder*="div"]')
		.or(page.locator('div[role="textbox"][placeholder*="div"]'))
		.last();
	await htmlEditor.waitFor({ state: "visible", timeout: 5000 });
	await htmlEditor.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await htmlEditor.fill(htmlContent);
	const waitTime2 = DEBUG_MODE ? 800 : 500;
	await page.waitForTimeout(waitTime2);
}

async function addImageBlock(page: Page, imageUrl: string) {
	console.log(`    Adding Image block`);
	// BlockLibraryパネルからImageブロックをクリック
	const imageButton = page
		.locator('button:has-text("Image")')
		.or(page.locator('button:has-text("🖼 Image")'))
		.first();
	await imageButton.waitFor({ state: "visible", timeout: 5000 });
	await imageButton.click();
	const waitTime = DEBUG_MODE ? 2000 : 1500;
	await page.waitForTimeout(waitTime);

	// 画像ブロックが追加されたことを確認
	const imageBlock = page
		.locator('text="Paste an image URL"')
		.locator("..")
		.locator("..")
		.first();
	await imageBlock.waitFor({ state: "visible", timeout: 5000 });

	// Force show image controls by setting pointerEvents and opacity
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
		.locator('textbox[label="URL"]')
		.or(page.locator('input[placeholder*="https"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(imageUrl);
	const waitTime2 = DEBUG_MODE ? 800 : 500;
	await page.waitForTimeout(waitTime2);
}

async function addVideoBlock(page: Page, videoUrl: string) {
	console.log(`    Adding Video block`);
	// BlockLibraryパネルからVideoブロックをクリック
	const videoButton = page
		.locator('button:has-text("Video")')
		.or(page.locator('button:has-text("▶ Video")'))
		.first();
	await videoButton.waitFor({ state: "visible", timeout: 5000 });
	await videoButton.click();
	const waitTime = DEBUG_MODE ? 2000 : 1500;
	await page.waitForTimeout(waitTime);

	// 動画ブロックが追加されたことを確認
	const videoBlock = page
		.locator('text="Paste a video URL"')
		.or(page.locator('text="Embed video"'))
		.locator("..")
		.locator("..")
		.first();
	if (await videoBlock.isVisible({ timeout: 2000 }).catch(() => false)) {
		await videoBlock.hover();
		await page.waitForTimeout(500);
	}

	// Force show video controls
	await page.evaluate(() => {
		const controls = document.querySelectorAll(".video-controls");
		controls.forEach((control) => {
			if (control instanceof HTMLElement) {
				control.style.opacity = "1";
				control.style.pointerEvents = "auto";
			}
		});
	});
	await page.waitForTimeout(500);

	const urlInput = page
		.locator('textbox[label="URL"]')
		.or(page.locator('input[placeholder*="https"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(videoUrl);
	const waitTime2 = DEBUG_MODE ? 800 : 500;
	await page.waitForTimeout(waitTime2);
}

async function addFileBlock(page: Page, fileUrl: string, fileName: string) {
	console.log(`    Adding File block`);
	// BlockLibraryパネルからFileブロックをクリック
	const fileButton = page
		.locator('button:has-text("File")')
		.or(page.locator('button:has-text("📄 File")'))
		.first();
	await fileButton.waitFor({ state: "visible", timeout: 5000 });
	await fileButton.click();
	const waitTime = DEBUG_MODE ? 2000 : 1500;
	await page.waitForTimeout(waitTime);

	// ファイルブロックが追加されたことを確認
	const fileBlock = page
		.locator('text="Upload a file or paste a URL"')
		.locator("..")
		.locator("..")
		.first();
	if (await fileBlock.isVisible({ timeout: 2000 }).catch(() => false)) {
		await fileBlock.hover();
		await page.waitForTimeout(500);
	}

	// Force show file controls
	await page.evaluate(() => {
		const controls = document.querySelectorAll(".file-controls");
		controls.forEach((control) => {
			if (control instanceof HTMLElement) {
				control.style.opacity = "1";
				control.style.pointerEvents = "auto";
			}
		});
	});
	await page.waitForTimeout(500);

	const urlInput = page
		.locator('textbox[label="URL"]')
		.or(page.locator('input[placeholder*="https"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(fileUrl);
	await page.waitForTimeout(200);

	const nameInput = page
		.locator('textbox[label="File name"]')
		.or(page.locator('input[placeholder*="File name"]'));
	if (await nameInput.isVisible({ timeout: 500 }).catch(() => false)) {
		await nameInput.scrollIntoViewIfNeeded();
		await page.waitForTimeout(300);
		await nameInput.fill(fileName);
	}
	const waitTime2 = DEBUG_MODE ? 800 : 500;
	await page.waitForTimeout(waitTime2);
}

async function addBookmarkBlock(page: Page, url: string) {
	console.log(`    Adding Bookmark block`);
	// BlockLibraryパネルからBookmarkブロックをクリック
	const bookmarkButton = page
		.locator('button:has-text("Bookmark")')
		.or(page.locator('button:has-text("🔖 Bookmark")'))
		.first();
	await bookmarkButton.waitFor({ state: "visible", timeout: 5000 });
	await bookmarkButton.click();
	const waitTime = DEBUG_MODE ? 2000 : 1500;
	await page.waitForTimeout(waitTime);

	// JavaScriptでReact Fiberから直接onChangeを呼び出してURLを設定
	const success = await page.evaluate((targetUrl) => {
		// BookmarkブロックのCard要素を探す
		const bookmarkCards = Array.from(
			document.querySelectorAll('[class*="MuiCard"]'),
		).filter((card) => {
			const text = card.textContent || "";
			return (
				text.includes("Bookmark") &&
				!text.includes("Show rich preview") &&
				!text.includes("🔖")
			);
		});

		if (bookmarkCards.length === 0) return false;

		const lastCard = bookmarkCards[bookmarkCards.length - 1];

		// ホバーイベントを発火してinputを表示
		lastCard.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

		// bookmark-url-inputを探す
		const bookmarkInputs = document.querySelectorAll(".bookmark-url-input");
		const lastInput = bookmarkInputs[bookmarkInputs.length - 1];

		if (!lastInput) return false;

		// input要素を探す
		const input =
			lastInput.querySelector('input[type="text"]') ||
			lastInput.querySelector(".MuiInputBase-input") ||
			lastInput.querySelector("input");
		if (!input) return false;

		// 値を設定
		input.value = targetUrl;

		// イベントを発火
		input.dispatchEvent(new Event("input", { bubbles: true }));
		input.dispatchEvent(new Event("change", { bubbles: true }));

		// ReactのonChangeを発火させるために、React FiberからonChangeプロップを探す
		const reactKey = Object.keys(input).find(
			(key) =>
				key.startsWith("__reactFiber") ||
				key.startsWith("__reactInternalInstance"),
		);
		if (reactKey) {
			const fiber = input[reactKey];
			if (fiber) {
				let node = fiber;
				while (node) {
					if (node.memoizedProps && node.memoizedProps.onChange) {
						// Reactの合成イベントオブジェクトを作成
						const syntheticEvent = {
							target: input,
							currentTarget: input,
							type: "change",
							bubbles: true,
							cancelable: true,
							defaultPrevented: false,
							eventPhase: 2,
							isTrusted: false,
							preventDefault: () => {},
							stopPropagation: () => {},
							persist: () => {},
							timeStamp: Date.now(),
						};
						node.memoizedProps.onChange(syntheticEvent);
						return true;
					}
					node = node.return;
				}
			}
		}

		return true;
	}, url);

	if (!success) {
		console.warn(
			`    ⚠ Could not set URL via JavaScript, trying fallback method`,
		);
		// フォールバック: 通常の方法で入力を試みる
		const bookmarkCard = page
			.locator('[class*="MuiCard"]')
			.filter({ hasText: /^Bookmark$/ })
			.last();

		if (await bookmarkCard.isVisible({ timeout: 2000 }).catch(() => false)) {
			await bookmarkCard.hover();
			await page.waitForTimeout(500);

			const urlInput = page
				.locator('.bookmark-url-input input[placeholder="https://example.com"]')
				.or(page.locator('.bookmark-url-input input[type="text"]'))
				.last();

			if (await urlInput.isVisible({ timeout: 2000 }).catch(() => false)) {
				await urlInput.click();
				await page.waitForTimeout(200);
				await page.keyboard.press("Control+A");
				await page.waitForTimeout(100);
				await urlInput.type(url, { delay: 30 });
				await page.waitForTimeout(800);
				await page.keyboard.press("Tab");
			}
		}
	}

	// プレビューが表示されるまで待つ
	const waitTime2 = DEBUG_MODE ? 2000 : 1500;
	await page.waitForTimeout(waitTime2);
}

async function savePage(page: Page) {
	console.log(`  - Saving page...`);
	const saveButton = page.locator('button:has-text("Save now")');
	await saveButton.waitFor({ state: "visible", timeout: 10000 });
	if (await saveButton.isEnabled().catch(() => false)) {
		await saveButton.click();
		await waitForPageLoad(page);
		try {
			await page.waitForSelector('text="All changes saved"', {
				timeout: 10000,
			});
			console.log(`    ✓ Page saved successfully`);
		} catch {
			console.warn(
				"    ⚠ Save confirmation missing, but save button was clicked",
			);
		}
	} else {
		console.log(`    ⚠ Save button is disabled (may already be saved)`);
	}
}

function collectMediaSources(
	content: ContentRecord,
	uploads: MediaItem[],
): MediaTask[] {
	const tasks: MediaTask[] = [];
	const assets = content.assets || [];
	for (const asset of assets) {
		const resolvedUrl = resolveAssetUrl(asset.src);
		if (!resolvedUrl) continue;
		const type = (asset.type || "").toLowerCase();
		if (isYoutubeUrl(resolvedUrl) || type.includes("youtube")) {
			tasks.push({ kind: "youtube", url: resolvedUrl });
		} else if (type.startsWith("image/")) {
			tasks.push({ kind: "image", url: resolvedUrl });
		} else if (type.startsWith("video/")) {
			tasks.push({ kind: "video", url: resolvedUrl });
		} else {
			tasks.push({ kind: "file", url: resolvedUrl, filename: asset.alt });
		}
	}

	const youtubeFromExt = (content.ext as Record<string, any> | undefined)
		?.thumbnail?.youtube;
	if (typeof youtubeFromExt === "string" && isYoutubeUrl(youtubeFromExt)) {
		tasks.push({ kind: "youtube", url: youtubeFromExt });
	}

	for (const media of uploads) {
		const mediaUrl = buildMediaUrl(content.id, media.id);
		const mime = media.mimeType || "";
		if (mime.startsWith("image/")) {
			tasks.push({ kind: "image", url: mediaUrl });
		} else if (mime.startsWith("video/")) {
			tasks.push({ kind: "video", url: mediaUrl });
		} else {
			tasks.push({
				kind: "file",
				url: mediaUrl,
				filename: media.filename,
			});
		}
	}
	return tasks;
}

async function insertMediaBlock(page: Page, media: MediaTask) {
	console.log(
		`    Adding ${media.kind} block: ${media.url.substring(0, 60)}${media.url.length > 60 ? "..." : ""}`,
	);
	switch (media.kind) {
		case "youtube": {
			const html = generateYoutubeEmbed(media.url);
			if (html) {
				await addCustomHTMLBlock(page, html);
			}
			break;
		}
		case "image": {
			await addImageBlock(page, media.url);
			break;
		}
		case "video": {
			await addVideoBlock(page, media.url);
			break;
		}
		case "file": {
			await addFileBlock(page, media.url, media.filename || "download");
			break;
		}
	}
}

function resolveAssetUrl(src?: string): string | null {
	if (!src) return null;
	if (src.startsWith("http")) return src;
	return `${BASE_URL}${src.startsWith("/") ? src : `/${src}`}`;
}

function buildMediaUrl(contentId: string, mediaId: string) {
	const url = new URL("/api/cms/media", BASE_URL);
	url.searchParams.set("contentId", contentId);
	url.searchParams.set("id", mediaId);
	url.searchParams.set("raw", "1");
	return url.toString();
}

function isYoutubeUrl(url: string) {
	return /youtu\.be|youtube\.com/.test(url);
}

function extractYoutubeVideoId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
	];
	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) {
			return match[1];
		}
	}
	return null;
}

function generateYoutubeEmbed(url: string) {
	const videoId = extractYoutubeVideoId(url);
	if (!videoId) return "";
	return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
}

async function ensureFirstHeadingAndParagraph(
	page: Page,
	title: string,
	description?: string,
) {
	console.log(`  - Setting up initial content`);
	await clearAllBlocks(page);
	await page.waitForTimeout(DEBUG_MODE ? 800 : 500);

	// 既存の最初のテキストボックスにタイトルを入力（Headingブロックは追加しない）
	const firstEditor = page
		.locator('div[contenteditable="true"]')
		.or(page.locator('div[role="textbox"]'))
		.first();
	await firstEditor.waitFor({ state: "visible", timeout: 5000 });
	await firstEditor.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await firstEditor.fill(`# ${title}`);
	await page.waitForTimeout(DEBUG_MODE ? 800 : 500);

	// 説明がある場合はParagraphブロックを追加
	if (description && description.trim().length > 0) {
		await addParagraphBlock(page, description.trim());
		await page.waitForTimeout(DEBUG_MODE ? 800 : 500);
	}
}
