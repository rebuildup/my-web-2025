#!/usr/bin/env node

/**
 * インストールフックスクリプト
 * better-sqlite3のインストール時に自動でビルドを実行
 * postinstallフックとして実行されるため、bun installの後に自動的に実行される
 */
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

// エラーが発生しても必ず正常終了するようにする
process.on("uncaughtException", (error) => {
	console.error("❌ 予期しないエラー:", error.message);
	process.exit(0);
});

process.on("unhandledRejection", (reason) => {
	console.error("❌ 未処理のPromise拒否:", reason);
	process.exit(0);
});

try {
	console.log("🔧 インストールフックを実行中...");

	// better-sqlite3がインストールされているかチェック
	const packageJsonPath = path.join(process.cwd(), "package.json");

	if (!fs.existsSync(packageJsonPath)) {
		console.log("⚠️ package.jsonが見つかりません.スキップします.");
		process.exit(0);
	}

	const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

	if (packageJson.dependencies?.["better-sqlite3"]) {
		console.log("📦 better-sqlite3が検出されました.自動ビルドを開始...");

		try {
			// better-sqlite3を再ビルド（複数の方法を試行）
			console.log("🔨 方法1: bun rebuild...");
			try {
				execSync("bun rebuild better-sqlite3", { stdio: "inherit" });
			} catch (_rebuildError) {
				console.log("⚠️ bun rebuild failed, continuing...");
			}

			// 動作確認
			console.log("🧪 動作確認中...");
			try {
				const Database = require("better-sqlite3");
				const testDb = new Database(":memory:");
				testDb.close();
				console.log("✅ better-sqlite3の自動ビルド完了！");
			} catch (_requireError) {
				console.log("🔄 方法1が失敗、方法2を試行中...");
				try {
					// 代替方法: npm rebuild（bunが失敗した場合のフォールバック）
					try {
						execSync("npm rebuild better-sqlite3", { stdio: "inherit" });
					} catch (_npmRebuildError) {
						console.log("⚠️ npm rebuild failed, continuing...");
					}

					// 動作確認
					console.log("🧪 動作確認中...");
					try {
						const Database = require("better-sqlite3");
						const testDb = new Database(":memory:");
						testDb.close();
						console.log("✅ better-sqlite3の自動ビルド完了！");
					} catch (_requireError2) {
						console.log("🔄 方法2が失敗、方法3を試行中...");
						try {
							// 最終手段: 手動ビルド
							try {
								execSync("node -e \"require('better-sqlite3')\"", {
									stdio: "inherit",
								});
								console.log("✅ better-sqlite3が利用可能です！");
							} catch (nodeError) {
								console.error("❌ 全ての自動ビルド方法が失敗しました");
								console.error("❌ エラー:", nodeError.message);
								console.log(
									"💡 手動でビルドを実行してください: bun rebuild better-sqlite3",
								);
								// エラーが発生してもプロセスを続行（postinstallが失敗してもインストールは完了）
							}
						} catch (error3) {
							console.error("❌ 方法3でエラーが発生しました:", error3.message);
							// エラーが発生してもプロセスを続行
						}
					}
				} catch (_error2) {
					console.error("❌ 方法2でエラーが発生しました:", _error2.message);
					// エラーが発生してもプロセスを続行
				}
			}
		} catch (_error) {
			console.error("❌ 方法1でエラーが発生しました:", _error.message);
			// エラーが発生してもプロセスを続行
		}
	} else {
		console.log("ℹ️ better-sqlite3が見つかりません.スキップします.");
	}
} catch (error) {
	console.error("❌ インストールフックでエラーが発生しました:", error.message);
	// エラーが発生しても正常終了（postinstallが失敗してもインストールは完了）
}

// 必ず正常終了
process.exit(0);
