import { readFileSync } from "node:fs";
import { join } from "node:path";
import { chromium, type Page } from "playwright";

interface PortfolioItem {
	id: string;
	type: string;
	title: string;
	description: string;
	categories?: string[];
	tags?: string[];
	status?: string;
	priority?: number;
	content?: string;
	markdownPath?: string;
	useManualDate?: boolean;
	manualDate?: string;
	images?: string[];
	thumbnail?: string;
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
	isOtherCategory?: boolean;
	originalImages?: string[];
	processedImages?: string[];
	createdAt?: string;
	updatedAt?: string;
}

// portfolio.jsonのデータをCMSのContent型にマッピング
function mapPortfolioToContent(item: PortfolioItem) {
	const content: Record<string, unknown> = {
		id: item.id,
		title: item.title,
		summary: item.description || "",
		tags: item.tags || [],
		status: item.status || "published",
		visibility: "public",
		lang: "ja",
	};

	// サムネイル
	if (item.thumbnail) {
		content.thumbnails = {
			image: {
				src: item.thumbnail,
			},
		};
	}

	// YouTubeサムネイル
	if (item.videos && item.videos.length > 0) {
		const youtubeVideo = item.videos.find((v) => v.type === "youtube");
		if (youtubeVideo?.url) {
			content.ext = {
				...((content.ext as Record<string, unknown>) || {}),
				thumbnail: {
					...(((content.ext as Record<string, unknown>)?.thumbnail as Record<
						string,
						unknown
					>) || {}),
					youtube: youtubeVideo.url,
				},
			};
		}
	}

	// アセット（画像と動画）
	const assets: Array<{ src: string; type: string }> = [];
	if (item.images && item.images.length > 0) {
		for (const img of item.images) {
			assets.push({ src: img, type: "image/*" });
		}
	}
	if (item.videos && item.videos.length > 0) {
		for (const video of item.videos) {
			if (video.url) {
				assets.push({
					src: video.url,
					type: video.type === "youtube" ? "video/youtube" : "video/*",
				});
			}
		}
	}
	if (assets.length > 0) {
		content.assets = assets;
	}

	// リンク
	if (item.externalLinks && item.externalLinks.length > 0) {
		content.links = item.externalLinks.map((link) => ({
			label: link.title || link.type || "",
			href: link.url,
		}));
	}

	// 公開日
	if (item.useManualDate && item.manualDate) {
		content.publishedAt = item.manualDate;
	} else if (item.createdAt) {
		content.publishedAt = item.createdAt;
	}

	// 検索可能データ
	content.searchable = {
		fullText: `${item.title} ${item.description || ""} ${(item.tags || []).join(" ")}`,
	};

	// タイムスタンプ
	if (item.createdAt) {
		content.createdAt = item.createdAt;
	}
	if (item.updatedAt) {
		content.updatedAt = item.updatedAt;
	}

	return content;
}

async function fillContentForm(page: Page, content: Record<string, unknown>) {
	try {
		// 新規コンテンツ作成ボタンをクリック
		console.log("  新規コンテンツ作成ボタンをクリック...");
		const createButton = page.getByRole("button", { name: /新規コンテンツ/ });
		await createButton.waitFor({ state: "visible", timeout: 10000 });
		await createButton.click();

		// ダイアログが開くまで待機
		console.log("  ダイアログの表示を待機...");
		await page.waitForSelector('div[role="dialog"]', {
			state: "visible",
			timeout: 5000,
		});
		await page.waitForTimeout(1000);

		// ステータスを設定（もしあれば）
		if (content.status) {
			console.log(`  ステータスを設定: ${content.status}`);
			try {
				const statusSelect = page
					.locator('select[label*="公開ステータス"], select[id*="status"]')
					.first();
				if ((await statusSelect.count()) > 0) {
					await statusSelect.click();
					await page.waitForTimeout(200);
					await page
						.locator(`option[value="${content.status}"]`)
						.first()
						.click();
					await page.waitForTimeout(200);
				}
			} catch (e) {
				console.log(`  ステータス設定をスキップ: ${e}`);
			}
		}

		// フォームフィールドを入力（MUIのTextField構造に合わせて）
		// ID
		if (content.id) {
			console.log(`  IDを入力: ${content.id}`);
			try {
				const idField = page.getByLabel("ID", { exact: false });
				await idField.waitFor({ state: "visible", timeout: 3000 });
				await idField.fill(content.id as string);
				await page.waitForTimeout(200);
			} catch (e) {
				console.log(`  ID入力に失敗、代替方法を試行: ${e}`);
				// フォールバック: 最初のinputを試す
				const inputs = await page.locator('input[type="text"]').all();
				if (inputs.length > 0) {
					await inputs[0].fill(content.id as string);
					await page.waitForTimeout(200);
				}
			}
		}

		// タイトル
		if (content.title) {
			console.log(`  タイトルを入力: ${content.title}`);
			try {
				const titleField = page.getByLabel("タイトル", { exact: false });
				await titleField.waitFor({ state: "visible", timeout: 3000 });
				await titleField.fill(content.title as string);
				await page.waitForTimeout(200);
			} catch (e) {
				console.log(`  タイトル入力に失敗、代替方法を試行: ${e}`);
				// フォールバック: 2番目のinputを試す
				const inputs = await page.locator('input[type="text"]').all();
				if (inputs.length > 1) {
					await inputs[1].fill(content.title as string);
					await page.waitForTimeout(200);
				}
			}
		}

		// 概要
		if (content.summary) {
			console.log(
				`  概要を入力: ${(content.summary as string).substring(0, 50)}...`,
			);
			try {
				const summaryField = page.getByLabel("概要", { exact: false });
				await summaryField.waitFor({ state: "visible", timeout: 3000 });
				await summaryField.fill(content.summary as string);
				await page.waitForTimeout(200);
			} catch (e) {
				console.log(`  概要入力に失敗、代替方法を試行: ${e}`);
				// フォールバック: 最初のtextareaを試す
				const textareas = await page.locator("textarea").all();
				if (textareas.length > 0) {
					await textareas[0].fill(content.summary as string);
					await page.waitForTimeout(200);
				}
			}
		}

		// タグを追加
		if (
			content.tags &&
			Array.isArray(content.tags) &&
			content.tags.length > 0
		) {
			console.log(`  タグを追加: ${content.tags.join(", ")}`);
			try {
				const tagField = page.getByLabel(/タグ/, { exact: false }).first();
				for (const tag of content.tags) {
					await tagField.fill(tag as string);
					await tagField.press("Enter");
					await page.waitForTimeout(300);
				}
			} catch (e) {
				console.log(`  タグ追加をスキップ: ${e}`);
			}
		}

		// 公開日を設定
		if (content.publishedAt) {
			console.log(`  公開日を設定: ${content.publishedAt}`);
			try {
				const date = new Date(content.publishedAt as string);
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

		// サムネイルタブをクリック
		console.log("  サムネイルタブを開く...");
		try {
			// MUIのTabコンポーネントはrole="tab"を使用
			// タブが見つかるまで待機
			await page.waitForSelector('[role="tab"]', {
				state: "visible",
				timeout: 5000,
			});

			// サムネイルタブを探す（複数の方法を試す）
			let thumbnailTab = page
				.locator('[role="tab"]')
				.filter({ hasText: /サムネイル/ })
				.first();
			if ((await thumbnailTab.count()) === 0) {
				// フォールバック: タブのインデックスで探す（サムネイルは2番目、インデックス1）
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

			// サムネイル画像URLを設定
			if (content.thumbnails && typeof content.thumbnails === "object") {
				const thumbnails = content.thumbnails as Record<string, unknown>;
				if (thumbnails.image && typeof thumbnails.image === "object") {
					const image = thumbnails.image as Record<string, unknown>;
					if (image.src) {
						console.log(`  サムネイル画像URLを設定: ${image.src}`);
						try {
							const thumbnailField = page
								.getByLabel(/画像URL/, { exact: false })
								.first();
							await thumbnailField.fill(image.src as string);
							await page.waitForTimeout(200);
						} catch (e) {
							console.log(`  サムネイル画像URL設定をスキップ: ${e}`);
						}
					}
				}
			}

			// YouTubeリンクを設定
			if (content.ext && typeof content.ext === "object") {
				const ext = content.ext as Record<string, unknown>;
				if (ext.thumbnail && typeof ext.thumbnail === "object") {
					const thumbnail = ext.thumbnail as Record<string, unknown>;
					if (thumbnail.youtube) {
						console.log(`  YouTubeリンクを設定: ${thumbnail.youtube}`);
						try {
							const youtubeField = page
								.getByLabel(/YouTube/, { exact: false })
								.first();
							await youtubeField.fill(thumbnail.youtube as string);
							await page.waitForTimeout(200);
						} catch (e) {
							console.log(`  YouTubeリンク設定をスキップ: ${e}`);
						}
					}
				}
			}
		} catch (e) {
			console.log(`  サムネイルタブをスキップ: ${e}`);
			// エラーが発生しても続行
		}

		// リンクを追加
		if (
			content.links &&
			Array.isArray(content.links) &&
			content.links.length > 0
		) {
			console.log(`  リンクを追加: ${content.links.length}件`);
			try {
				// リンク・メディアタブをクリック（MUIのTabコンポーネント）
				let linksTab = page
					.locator('[role="tab"]')
					.filter({ hasText: /リンク.*メディア|メディア.*リンク/ })
					.first();
				if ((await linksTab.count()) === 0) {
					// フォールバック: タブのインデックスで探す（リンク・メディアは3番目、インデックス2）
					const tabs = await page.locator('[role="tab"]').all();
					if (tabs.length > 2) {
						linksTab = tabs[2];
					} else {
						throw new Error("リンク・メディアタブが見つかりません");
					}
				}
				await linksTab.waitFor({ state: "visible", timeout: 3000 });
				await linksTab.click();
				await page.waitForTimeout(500);

				// 各リンクを追加
				for (const link of content.links) {
					if (typeof link === "object" && link !== null) {
						const linkObj = link as Record<string, unknown>;
						// リンク追加ボタンをクリック
						const addLinkButton = page
							.getByRole("button", { name: /リンクを追加/ })
							.first();
						await addLinkButton.click();
						await page.waitForTimeout(300);

						// ラベルとURLを入力
						if (linkObj.label) {
							try {
								const labelInputs = await page
									.getByLabel(/ラベル/, { exact: false })
									.all();
								if (labelInputs.length > 0) {
									const lastLabelInput = labelInputs[labelInputs.length - 1];
									await lastLabelInput.fill(linkObj.label as string);
								}
							} catch (e) {
								console.log(`  ラベル入力をスキップ: ${e}`);
							}
						}
						if (linkObj.href) {
							try {
								const urlInputs = await page
									.getByLabel(/URL/, { exact: false })
									.all();
								if (urlInputs.length > 0) {
									const lastUrlInput = urlInputs[urlInputs.length - 1];
									await lastUrlInput.fill(linkObj.href as string);
								}
							} catch (e) {
								console.log(`  URL入力をスキップ: ${e}`);
							}
						}
					}
				}
			} catch (e) {
				console.log(`  リンク追加をスキップ: ${e}`);
				// エラーが発生しても続行
			}
		}

		// 作成ボタンをクリック
		console.log("  作成ボタンをクリック...");
		try {
			const submitButton = page.getByRole("button", { name: /作成/ }).first();
			await submitButton.click();
			// 作成完了を待機（ダイアログが閉じるまで）
			await page
				.waitForSelector('div[role="dialog"]', {
					state: "hidden",
					timeout: 10000,
				})
				.catch(() => {
					// ダイアログが閉じない場合でも続行
				});
			await page.waitForTimeout(2000);
			console.log("  ✓ 作成完了");
		} catch (e) {
			console.log(`  ✗ 作成ボタンのクリックに失敗: ${e}`);
			throw e;
		}
	} catch (error) {
		console.error(`  フォーム入力エラー:`, error);
		throw error;
	}
}

async function main() {
	const portfolioJsonPath = join(process.cwd(), "portfolio.json");
	const portfolioData = JSON.parse(
		readFileSync(portfolioJsonPath, "utf-8"),
	) as PortfolioItem[];

	console.log(
		`ポートフォリオデータ ${portfolioData.length} 件を読み込みました`,
	);

	const browser = await chromium.launch({
		headless: false,
		slowMo: 500, // 操作を遅くして確認しやすくする
	});

	const context = await browser.newContext({
		viewport: { width: 1920, height: 1080 },
	});

	const page = await context.newPage();

	try {
		// 開発サーバーが起動していることを確認
		const baseUrl = process.env.BASE_URL || "http://localhost:3010";
		console.log(`管理ページにアクセス: ${baseUrl}/admin/content`);

		await page.goto(`${baseUrl}/admin/content`, { waitUntil: "networkidle" });

		// ページが読み込まれるまで待機
		await page.waitForSelector('button:has-text("新規コンテンツ")', {
			timeout: 10000,
		});

		// 各ポートフォリオアイテムを処理
		for (let i = 0; i < portfolioData.length; i++) {
			const item = portfolioData[i];
			console.log(`\n[${i + 1}/${portfolioData.length}] 処理中: ${item.title}`);

			try {
				const content = mapPortfolioToContent(item);
				await fillContentForm(page, content);

				console.log(`✓ ${item.title} を作成しました`);

				// 次のアイテムの前に少し待機
				await page.waitForTimeout(1000);
			} catch (error) {
				console.error(`✗ ${item.title} の作成に失敗しました:`, error);
				// エラーが発生しても続行
			}
		}

		console.log("\nすべてのポートフォリオデータのインポートが完了しました");
	} catch (error) {
		console.error("エラーが発生しました:", error);
	} finally {
		// ブラウザを閉じる前に少し待機（確認のため）
		await page.waitForTimeout(2000);
		await browser.close();
	}
}

main().catch(console.error);
