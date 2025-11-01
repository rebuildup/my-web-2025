/**
 * テストセットアップとティアダウンの標準化
 * 要件7.2: 共通のテストユーティリティが再利用可能な形で提供されること
 */

import { cleanup } from "@testing-library/react";
import { setupAllMocks } from "./mock-factories";

// テスト環境の設定
export interface TestEnvironmentConfig {
	enableMocks?: boolean;
	enablePerformanceTracking?: boolean;
	enableMemoryTracking?: boolean;
	enableConsoleSuppress?: boolean;
	timeout?: number;
}

// デフォルト設定
const defaultConfig: TestEnvironmentConfig = {
	enableMocks: true,
	enablePerformanceTracking: false,
	enableMemoryTracking: false,
	enableConsoleSuppress: true,
	timeout: 10000,
};

// グローバル変数
let testStartTime: number;
let mockCleanup: (() => void) | null = null;
let originalConsole: Console;

/**
 * テスト開始前のセットアップ
 */
export const setupTest = (config: TestEnvironmentConfig = {}) => {
	const finalConfig = { ...defaultConfig, ...config };

	// 開始時間を記録
	testStartTime = performance.now();

	// モックのセットアップ
	if (finalConfig.enableMocks) {
		const { cleanup } = setupAllMocks();
		mockCleanup = cleanup;
	}

	// コンソール出力の抑制
	if (finalConfig.enableConsoleSuppress) {
		suppressConsoleOutput();
	}

	// タイムアウトの設定
	if (finalConfig.timeout) {
		jest.setTimeout(finalConfig.timeout);
	}

	// パフォーマンス追跡
	if (finalConfig.enablePerformanceTracking) {
		console.log("🚀 Test performance tracking enabled");
	}

	// メモリ追跡
	if (finalConfig.enableMemoryTracking) {
		trackMemoryUsage("Test setup");
	}
};

/**
 * テスト終了後のティアダウン
 */
export const teardownTest = (config: TestEnvironmentConfig = {}) => {
	const finalConfig = { ...defaultConfig, ...config };

	// React Testing Libraryのクリーンアップ
	cleanup();

	// モックのクリーンアップ
	if (mockCleanup) {
		mockCleanup();
		mockCleanup = null;
	}

	// Jestモックのクリア
	jest.clearAllMocks();
	jest.clearAllTimers();

	// コンソール出力の復元
	if (finalConfig.enableConsoleSuppress && originalConsole) {
		restoreConsoleOutput();
	}

	// パフォーマンス測定
	if (finalConfig.enablePerformanceTracking) {
		const duration = performance.now() - testStartTime;
		console.log(`⏱️ Test completed in ${duration.toFixed(2)}ms`);
	}

	// メモリ追跡
	if (finalConfig.enableMemoryTracking) {
		trackMemoryUsage("Test teardown");
	}

	// ガベージコレクション（利用可能な場合）
	if (global.gc) {
		global.gc();
	}
};

/**
 * コンソール出力の抑制
 */
const suppressConsoleOutput = () => {
	originalConsole = global.console;

	global.console = {
		...originalConsole,
		log: jest.fn(),
		debug: jest.fn(),
		info: jest.fn(),
		warn: (...args) => {
			// 重要な警告のみ表示
			if (
				args.some(
					(arg) =>
						typeof arg === "string" &&
						(arg.includes("Warning:") || arg.includes("Error:")),
				)
			) {
				originalConsole.warn(...args);
			}
		},
		error: (...args) => {
			// エラーは常に表示（ただし、テスト用エラーは除外）
			if (
				!args.some(
					(arg) => typeof arg === "string" && arg.includes("Test error"),
				)
			) {
				originalConsole.error(...args);
			}
		},
	};
};

/**
 * コンソール出力の復元
 */
const restoreConsoleOutput = () => {
	if (originalConsole) {
		global.console = originalConsole;
	}
};

/**
 * メモリ使用量の追跡
 */
const trackMemoryUsage = (phase: string) => {
	if (performance.memory) {
		const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } =
			performance.memory;
		console.log(
			`🧠 Memory usage (${phase}): ` +
				`${Math.round(usedJSHeapSize / 1024 / 1024)}MB / ` +
				`${Math.round(totalJSHeapSize / 1024 / 1024)}MB ` +
				`(limit: ${Math.round(jsHeapSizeLimit / 1024 / 1024)}MB)`,
		);
	}
};

/**
 * テストスイート用のセットアップ関数
 */
export const setupTestSuite = (
	suiteName: string,
	config: TestEnvironmentConfig = {},
) => {
	describe(suiteName, () => {
		beforeAll(() => {
			console.log(`🧪 Setting up test suite: ${suiteName}`);
			setupTest(config);
		});

		afterAll(() => {
			console.log(`✅ Tearing down test suite: ${suiteName}`);
			teardownTest(config);
		});

		beforeEach(() => {
			// 各テスト前のセットアップ
			testStartTime = performance.now();
		});

		afterEach(() => {
			// 各テスト後のクリーンアップ
			cleanup();
			jest.clearAllMocks();

			if (config.enablePerformanceTracking) {
				const duration = performance.now() - testStartTime;
				if (duration > 1000) {
					// 1秒以上かかった場合は警告
					console.warn(`⚠️ Slow test detected: ${duration.toFixed(2)}ms`);
				}
			}
		});
	});
};

/**
 * 個別テスト用のセットアップ関数
 */
export const setupIndividualTest = (
	testName: string,
	testFn: () => void | Promise<void>,
	config: TestEnvironmentConfig = {},
) => {
	return async () => {
		console.log(`🔬 Running test: ${testName}`);

		const testConfig = { ...defaultConfig, ...config };
		const startTime = performance.now();

		try {
			// テスト前のセットアップ
			if (testConfig.enableMocks) {
				const { cleanup } = setupAllMocks();
				mockCleanup = cleanup;
			}

			// テスト実行
			await testFn();

			// パフォーマンス測定
			if (testConfig.enablePerformanceTracking) {
				const duration = performance.now() - startTime;
				console.log(
					`⏱️ Test "${testName}" completed in ${duration.toFixed(2)}ms`,
				);
			}
		} finally {
			// テスト後のクリーンアップ
			cleanup();
			if (mockCleanup) {
				mockCleanup();
				mockCleanup = null;
			}
			jest.clearAllMocks();
		}
	};
};

/**
 * 非同期テスト用のヘルパー
 */
export const runAsyncTest = async <T>(
	testFn: () => Promise<T>,
	timeout: number = 10000,
): Promise<T> => {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(new Error(`Test timed out after ${timeout}ms`));
		}, timeout);

		testFn()
			.then((result) => {
				clearTimeout(timer);
				resolve(result);
			})
			.catch((error) => {
				clearTimeout(timer);
				reject(error);
			});
	});
};

/**
 * テストデータのクリーンアップ
 */
export const cleanupTestData = () => {
	// ローカルストレージのクリア
	if (typeof window !== "undefined" && window.localStorage) {
		window.localStorage.clear();
	}

	// セッションストレージのクリア
	if (typeof window !== "undefined" && window.sessionStorage) {
		window.sessionStorage.clear();
	}

	// DOMのクリーンアップ
	document.body.innerHTML = "";

	// イベントリスナーのクリーンアップ
	const events = ["click", "keydown", "keyup", "mouseenter", "mouseleave"];
	events.forEach((event) => {
		document.removeEventListener(event, () => {});
	});
};

/**
 * テスト環境の検証
 */
export const validateTestEnvironment = (): boolean => {
	const checks = [
		() => typeof jest !== "undefined",
		() => typeof expect !== "undefined",
		() => typeof describe !== "undefined",
		() => typeof it !== "undefined",
		() => typeof beforeEach !== "undefined",
		() => typeof afterEach !== "undefined",
	];

	const results = checks.map((check) => {
		try {
			return check();
		} catch {
			return false;
		}
	});

	const isValid = results.every((result) => result === true);

	if (!isValid) {
		console.error("❌ Test environment validation failed");
		console.error(
			"Missing:",
			results
				.map((result, index) =>
					result
						? null
						: ["jest", "expect", "describe", "it", "beforeEach", "afterEach"][
								index
							],
				)
				.filter(Boolean),
		);
	} else {
		console.log("✅ Test environment validation passed");
	}

	return isValid;
};

// 自動的に環境検証を実行
if (process.env.NODE_ENV === "test") {
	validateTestEnvironment();
}
