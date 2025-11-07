import { expect, Page, test } from "@playwright/test";

const BASE_URL =
	process.env.BASE_URL ||
	process.env.NEXT_PUBLIC_EDITOR_HOME_URL ||
	"http://localhost:3010";

type ContentItem = {
	id: string;
	title: string;
	summary?: string;
	links?: Array<{ href: string; label?: string; description?: string }>;
	assets?: Array<{ src: string; type?: string; alt?: string }>;
};

type MediaItem = {
	id: string;
	filename: string;
	mimeType: string;
	alt?: string;
};

async function waitForPageLoad(page: Page) {
	try {
		await page.waitForLoadState("networkidle", { timeout: 5000 });
	} catch {
		// If networkidle times out, just continue
	}
	await page.waitForTimeout(500); // Reduced wait time
}

async function selectContent(page: Page, contentId: string) {
	const trigger = page
		.locator('[aria-labelledby="content-selector-label"]')
		.first();
	await trigger.waitFor({ state: "visible", timeout: 10000 });
	await trigger.click();
	await page.waitForTimeout(500);
	const option = page
		.locator(`li[role="option"][data-value="${contentId}"]`)
		.first();
	await option.waitFor({ state: "visible", timeout: 10000 });
	await option.click();
	await waitForPageLoad(page);
}

async function createOrOpenPage(
	page: Page,
	contentId: string,
	title: string,
	slug: string,
): Promise<boolean> {
	await selectContent(page, contentId);
	await waitForPageLoad(page);

	const pagesSection = page.locator('text="Pages"').locator("..").locator("..");
	const existingPageLink = pagesSection.locator(`text="${slug}"`).first();

	if (await existingPageLink.isVisible({ timeout: 2000 }).catch(() => false)) {
		await existingPageLink.click();
		await waitForPageLoad(page);
		return false;
	}

	const newPageButton = page.locator('button:has-text("New page")');
	await newPageButton.waitFor({ state: "visible", timeout: 5000 });
	await newPageButton.click();
	await page.waitForTimeout(500);

	await page.evaluate(
		([title, slug]) => {
			window.prompt = (msg: string) => {
				if (msg.includes("title") || msg.includes("Title")) {
					return title;
				}
				if (msg.includes("slug") || msg.includes("Slug")) {
					return slug;
				}
				return null;
			};
		},
		[title, slug],
	);

	await page.waitForTimeout(1000);
	await waitForPageLoad(page);
	return true;
}

async function clearAllBlocks(page: Page) {
	// Try to find a text editor (Heading or Paragraph) first
	const textEditor = page
		.locator('div[contenteditable="true"][data-placeholder="Heading"]')
		.or(
			page.locator(
				'div[contenteditable="true"][data-placeholder="Write text"]',
			),
		)
		.first();

	if (await textEditor.isVisible({ timeout: 2000 }).catch(() => false)) {
		try {
			await textEditor.click({ timeout: 5000 });
			await page.keyboard.press("Control+A");
			await page.keyboard.press("Delete");
			await page.waitForTimeout(300);
			return;
		} catch (error) {
			// If click fails, try to use fill instead
			try {
				await textEditor.fill("");
				await page.waitForTimeout(300);
				return;
			} catch {
				// If that also fails, just continue
			}
		}
	}

	// If no text editor found, try to find any contenteditable element that's not a caption
	const allEditors = page.locator('div[contenteditable="true"]');
	const count = await allEditors.count();
	if (count === 0) return;

	// Skip caption fields and try to find a main editor
	for (let i = 0; i < Math.min(count, 10); i++) {
		try {
			const editor = allEditors.nth(i);
			const placeholder = await editor.getAttribute("data-placeholder");
			if (placeholder && placeholder !== "Caption") {
				try {
					await editor.click({ timeout: 5000 });
					await page.keyboard.press("Control+A");
					await page.keyboard.press("Delete");
					await page.waitForTimeout(300);
					return;
				} catch {
					try {
						await editor.fill("");
						await page.waitForTimeout(300);
						return;
					} catch {
						// Continue to next editor
					}
				}
			}
		} catch {
			// Continue to next editor
		}
	}
}

async function addHeadingBlock(page: Page, text: string, level: 1 | 2 | 3 = 1) {
	const headingButton = page
		.locator('button:has-text("H Heading")')
		.or(page.locator('button:has-text("Heading")'))
		.first();
	await headingButton.waitFor({ state: "visible", timeout: 5000 });
	await headingButton.click();
	await page.waitForTimeout(1000);

	const headingEditor = page
		.locator('div[contenteditable="true"][data-placeholder="Heading"]')
		.last();
	await headingEditor.waitFor({ state: "visible", timeout: 10000 });
	await headingEditor.scrollIntoViewIfNeeded();
	await page.waitForTimeout(200);
	await headingEditor.fill(text);
	await page.waitForTimeout(300);
}

async function addParagraphBlock(page: Page, text: string) {
	const paragraphButton = page
		.locator('button:has-text("Paragraph")')
		.or(page.locator('button:has-text("¶ Paragraph")'))
		.first();
	await paragraphButton.waitFor({ state: "visible", timeout: 5000 });
	await paragraphButton.click();
	await page.waitForTimeout(1000);

	const paragraphEditor = page
		.locator('div[contenteditable="true"][data-placeholder="Write text"]')
		.last();
	await paragraphEditor.waitFor({ state: "visible", timeout: 10000 });
	await paragraphEditor.scrollIntoViewIfNeeded();
	await page.waitForTimeout(200);
	await paragraphEditor.fill(text);
	await page.waitForTimeout(300);
}

async function addListBlock(page: Page, items: string[]) {
	const listButton = page
		.locator('button:has-text("List")')
		.or(page.locator('button:has-text("• List")'))
		.first();
	await listButton.waitFor({ state: "visible", timeout: 5000 });
	await listButton.click();
	await page.waitForTimeout(1000);

	for (let i = 0; i < items.length; i++) {
		const listEditor = page.locator('div[contenteditable="true"]').last();
		await listEditor.waitFor({ state: "visible", timeout: 5000 });
		await listEditor.click();
		await listEditor.fill(items[i]);
		await page.waitForTimeout(500);

		if (i < items.length - 1) {
			await listEditor.press("Enter");
			await page.waitForTimeout(500);
		}
	}
}

async function addImageBlock(page: Page, mediaUrl: string, alt?: string) {
	const imageButton = page
		.locator('button:has-text("Image")')
		.or(page.locator('button:has-text("🖼 Image")'))
		.first();
	await imageButton.waitFor({ state: "visible", timeout: 5000 });
	await imageButton.click();
	await page.waitForTimeout(2000);

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
	await urlInput.fill(mediaUrl);
	await page.waitForTimeout(500);

	if (alt) {
		const altInput = page.locator('textbox[label="Alt"]').first();
		if (await altInput.isVisible({ timeout: 2000 }).catch(() => false)) {
			await altInput.scrollIntoViewIfNeeded();
			await page.waitForTimeout(300);
			await altInput.fill(alt);
			await page.waitForTimeout(500);
		}
	}
}

async function addVideoBlock(page: Page, mediaUrl: string) {
	const videoButton = page
		.locator('button:has-text("Video")')
		.or(page.locator('button:has-text("▶ Video")'))
		.first();
	await videoButton.waitFor({ state: "visible", timeout: 5000 });
	await videoButton.click();
	await page.waitForTimeout(2000);

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

	const urlInput = page
		.locator('textbox[label="URL"]')
		.or(page.locator('input[placeholder*="https"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(mediaUrl);
	await page.waitForTimeout(500);
}

async function addAudioBlock(page: Page, mediaUrl: string) {
	const audioButton = page
		.locator('button:has-text("Audio")')
		.or(page.locator('button:has-text("♪ Audio")'))
		.first();
	await audioButton.waitFor({ state: "visible", timeout: 5000 });
	await audioButton.click();
	await page.waitForTimeout(2000);

	const audioBlock = page
		.locator('text="Paste an audio URL"')
		.or(page.locator('text="Attach audio"'))
		.locator("..")
		.locator("..")
		.first();
	if (await audioBlock.isVisible({ timeout: 2000 }).catch(() => false)) {
		await audioBlock.hover();
		await page.waitForTimeout(500);
	}

	const urlInput = page
		.locator('textbox[label="URL"]')
		.or(page.locator('input[placeholder*="https"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(mediaUrl);
	await page.waitForTimeout(500);
}

async function addBookmarkBlock(page: Page, url: string, label?: string) {
	const bookmarkButton = page
		.locator('button:has-text("Bookmark")')
		.or(page.locator('button:has-text("🔖 Bookmark")'))
		.first();
	await bookmarkButton.waitFor({ state: "visible", timeout: 5000 });
	await bookmarkButton.click();
	await page.waitForTimeout(2000);

	const bookmarkBlock = page
		.locator('text="Paste a URL"')
		.or(page.locator('text="Bookmark"'))
		.locator("..")
		.locator("..")
		.first();
	if (await bookmarkBlock.isVisible({ timeout: 2000 }).catch(() => false)) {
		await bookmarkBlock.hover();
		await page.waitForTimeout(500);
	}

	const urlInput = page
		.locator('textbox[label="URL"]')
		.or(page.locator('input[placeholder*="https"]'))
		.first();
	await urlInput.waitFor({ state: "visible", timeout: 5000 });
	await urlInput.scrollIntoViewIfNeeded();
	await page.waitForTimeout(300);
	await urlInput.fill(url);
	await page.waitForTimeout(500);
}

async function savePage(page: Page) {
	const saveButton = page.locator('button:has-text("Save now")');
	await saveButton.waitFor({ state: "visible", timeout: 10000 });
	if (await saveButton.isEnabled({ timeout: 2000 }).catch(() => false)) {
		await saveButton.click();
		await waitForPageLoad(page);
		await page
			.waitForSelector('text="All changes saved"', { timeout: 10000 })
			.catch(() => {
				console.warn("Save confirmation not found");
			});
	}
}

test.setTimeout(1200000); // 20 minutes timeout for the entire test

test("generate detail markdown pages for all contents using page-editor UI", async ({
	page,
	request,
}) => {
	await page.goto(`${BASE_URL}/admin/content/page-editor`);
	await waitForPageLoad(page);

	const contentsRes = await request.get(`${BASE_URL}/api/cms/contents`);
	expect(contentsRes.ok()).toBeTruthy();
	const contents: ContentItem[] = await contentsRes.json();

	for (const content of contents) {
		try {
			console.log(`Processing content: ${content.id} - ${content.title}`);

			// Check if page is still open
			if (page.isClosed()) {
				console.error("Page was closed, cannot continue");
				break;
			}

			const mediaRes = await request.get(
				`${BASE_URL}/api/cms/media?contentId=${encodeURIComponent(content.id)}`,
			);
			const media: MediaItem[] = mediaRes.ok() ? await mediaRes.json() : [];

			const isNew = await createOrOpenPage(
				page,
				content.id,
				content.title,
				content.id,
			);
			await page.waitForTimeout(500); // Reduced wait time

			await clearAllBlocks(page);

			await addHeadingBlock(page, content.title, 1);
			await page.waitForTimeout(200); // Reduced wait time

			if (content.summary) {
				await addParagraphBlock(page, content.summary.trim());
				await page.waitForTimeout(200); // Reduced wait time
			}

			if (content.links && content.links.length > 0) {
				await addHeadingBlock(page, "Links", 2);
				await page.waitForTimeout(200); // Reduced wait time

				for (const link of content.links) {
					await addBookmarkBlock(page, link.href, link.label);
					await page.waitForTimeout(200); // Reduced wait time
				}
			}

			if (media.length > 0) {
				await addHeadingBlock(page, "Media", 2);
				await page.waitForTimeout(200); // Reduced wait time

				for (const m of media) {
					const mediaUrl = `${BASE_URL}/api/cms/media?contentId=${encodeURIComponent(content.id)}&id=${encodeURIComponent(m.id)}&raw=1`;
					if (m.mimeType.startsWith("image/")) {
						await addImageBlock(page, mediaUrl, m.alt || m.filename);
					} else if (m.mimeType.startsWith("video/")) {
						await addVideoBlock(page, mediaUrl);
					} else if (m.mimeType.startsWith("audio/")) {
						await addAudioBlock(page, mediaUrl);
					}
					await page.waitForTimeout(200); // Reduced wait time
				}
			}

			await savePage(page);
			await page.waitForTimeout(500); // Reduced wait time
		} catch (error) {
			console.error(`Failed to create page for content ${content.id}:`, error);
			// Continue to next content even if one fails
			continue;
		}
	}
});
