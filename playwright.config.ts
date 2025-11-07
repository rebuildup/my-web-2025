import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: "./scripts",
	// テストのタイムアウト（30分）
	timeout: 30 * 60 * 1000,
	expect: {
		timeout: 10000,
	},
	// 並列実行を無効化（記事作成は順次実行が必要）
	fullyParallel: false,
	workers: 1,
	// 失敗時のリトライ回数
	retries: 0,
	// レポーター設定
	reporter: [["list"], ["html", { open: "never" }]],

	use: {
		// ベースURL
		baseURL: process.env.BASE_URL || "http://localhost:3010",
		// トレース設定
		trace: "on-first-retry",
		// スクリーンショット設定
		screenshot: "only-on-failure",
		// ビデオ設定
		video: "retain-on-failure",
		// ナビゲーションタイムアウト
		navigationTimeout: 30000,
		// アクションタイムアウト
		actionTimeout: 10000,
	},

	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				// ヘッドレスモードをオフにして、ブラウザを表示
				headless: false,
				// ビューポートサイズ
				viewport: { width: 1920, height: 1080 },
				// スロー実行（デバッグ用、ミリ秒）
				// slowMo: 100,
			},
		},
	],

	// 開発サーバー設定（必要に応じて有効化）
	// webServer: {
	//   command: 'pnpm dev',
	//   url: 'http://localhost:3010',
	//   reuseExistingServer: !process.env.CI,
	//   timeout: 120 * 1000,
	// },
});
