/**
 * Advanced Cache Utilities
 * ブラウザキャッシュの問題を完全に解決するためのユーティリティ関数
 * 通常モードとシークレットモード両方に対応
 */

export interface CacheBustConfig {
	timestamp: number;
	buildId: string;
	headers: Record<string, string>;
	meta: Record<string, string>;
}

export interface BrowserCacheInfo {
	browser: string;
	version: string;
	isIncognito: boolean;
	platform: string;
	issues: string[];
	solutions: string[];
	cachePaths: string[];
}

export class BrowserCacheManager {
	private static instance: BrowserCacheManager;
	private cacheBustConfig: CacheBustConfig | null = null;

	private constructor() {}

	static getInstance(): BrowserCacheManager {
		if (!BrowserCacheManager.instance) {
			BrowserCacheManager.instance = new BrowserCacheManager();
		}
		return BrowserCacheManager.instance;
	}

	/**
	 * キャッシュバスティング設定を読み込み
	 */
	async loadCacheBustConfig(): Promise<CacheBustConfig | null> {
		try {
			const response = await fetch("/cache-bust-config.json");
			if (response.ok) {
				this.cacheBustConfig = await response.json();
				return this.cacheBustConfig;
			}
		} catch (error) {
			console.warn("Cache bust config not found:", error);
		}
		return null;
	}

	/**
	 * URLにキャッシュバスティングパラメータを追加
	 */
	addCacheBustParam(url: string): string {
		const separator = url.includes("?") ? "&" : "?";
		const timestamp = this.cacheBustConfig?.timestamp || Date.now();
		const buildId = this.cacheBustConfig?.buildId || "default";

		return `${url}${separator}v=${buildId}&t=${timestamp}`;
	}

	/**
	 * ブラウザキャッシュを完全にクリア
	 */
	async clearBrowserCache(): Promise<void> {
		console.log("🧹 ブラウザキャッシュをクリアしています...");

		// Service Worker の登録解除
		if ("serviceWorker" in navigator) {
			try {
				const registrations = await navigator.serviceWorker.getRegistrations();
				for (const registration of registrations) {
					await registration.unregister();
					console.log("✅ Service Worker unregistered");
				}
			} catch (error) {
				console.warn("Service Worker unregister failed:", error);
			}
		}

		// Storage クリア
		if (typeof Storage !== "undefined") {
			try {
				localStorage.clear();
				console.log("✅ Local Storage cleared");

				sessionStorage.clear();
				console.log("✅ Session Storage cleared");
			} catch (error) {
				console.warn("Storage clear failed:", error);
			}
		}

		// IndexedDB クリア
		if ("indexedDB" in window) {
			try {
				const databases = await indexedDB.databases();
				for (const db of databases) {
					if (db.name) {
						indexedDB.deleteDatabase(db.name);
						console.log("✅ IndexedDB cleared:", db.name);
					}
				}
			} catch (error) {
				console.warn("IndexedDB clear failed:", error);
			}
		}

		// Cache API クリア
		if ("caches" in window) {
			try {
				const cacheNames = await caches.keys();
				for (const name of cacheNames) {
					await caches.delete(name);
					console.log("✅ Cache cleared:", name);
				}
			} catch (error) {
				console.warn("Cache API clear failed:", error);
			}
		}

		console.log("🎉 ブラウザキャッシュのクリアが完了しました！");
	}

	/**
	 * ブラウザ固有の問題を検出
	 */
	detectBrowserIssues(): {
		browser: string;
		issues: string[];
		solutions: string[];
	} {
		const userAgent = navigator.userAgent;
		const issues: string[] = [];
		const solutions: string[] = [];

		let browser = "Unknown";

		// ブラウザ検出
		if (userAgent.includes("Chrome")) {
			browser = "Chrome";
			issues.push("Aggressive caching of static assets");
			solutions.push("Use Ctrl+Shift+R for hard reload");
			solutions.push("Open DevTools → Network → Disable cache");
		} else if (userAgent.includes("Firefox")) {
			browser = "Firefox";
			issues.push("Service Worker persistence");
			solutions.push("Use Ctrl+Shift+R for hard reload");
			solutions.push("Clear data in Privacy settings");
		} else if (userAgent.includes("Safari")) {
			browser = "Safari";
			issues.push("Webkit cache persistence");
			solutions.push("Use Cmd+Shift+R for hard reload");
			solutions.push("Clear website data in Develop menu");
		} else if (userAgent.includes("Edge")) {
			browser = "Edge";
			issues.push("Similar to Chrome caching behavior");
			solutions.push("Use Ctrl+Shift+R for hard reload");
			solutions.push("Clear browsing data");
		}

		return { browser, issues, solutions };
	}

	/**
	 * キャッシュ状態を診断
	 */
	async diagnoseCacheState(): Promise<{
		serviceWorkers: number;
		localStorage: number;
		sessionStorage: number;
		caches: string[];
		indexedDBs: string[];
	}> {
		const result = {
			serviceWorkers: 0,
			localStorage: 0,
			sessionStorage: 0,
			caches: [] as string[],
			indexedDBs: [] as string[],
		};

		// Service Worker 数
		if ("serviceWorker" in navigator) {
			try {
				const registrations = await navigator.serviceWorker.getRegistrations();
				result.serviceWorkers = registrations.length;
			} catch (error) {
				console.warn("Service Worker check failed:", error);
			}
		}

		// Storage サイズ
		if (typeof Storage !== "undefined") {
			result.localStorage = localStorage.length;
			result.sessionStorage = sessionStorage.length;
		}

		// Cache API
		if ("caches" in window) {
			try {
				result.caches = await caches.keys();
			} catch (error) {
				console.warn("Cache API check failed:", error);
			}
		}

		// IndexedDB
		if ("indexedDB" in window) {
			try {
				const databases = await indexedDB.databases();
				result.indexedDBs = databases.map((db) => db.name || "unnamed");
			} catch (error) {
				console.warn("IndexedDB check failed:", error);
			}
		}

		return result;
	}

	/**
	 * 強制リロードを実行
	 */
	forceReload(): void {
		// キャッシュを無視してリロード
		window.location.reload();
	}

	/**
	 * キャッシュクリア後の検証
	 */
	async verifyCacheClear(): Promise<boolean> {
		const state = await this.diagnoseCacheState();

		const isCleared =
			state.serviceWorkers === 0 &&
			state.localStorage === 0 &&
			state.sessionStorage === 0 &&
			state.caches.length === 0 &&
			state.indexedDBs.length === 0;

		if (isCleared) {
			console.log("✅ キャッシュクリアが正常に完了しました");
		} else {
			console.warn("⚠️ 一部のキャッシュが残っている可能性があります", state);
		}

		return isCleared;
	}
}

/**
 * グローバルなキャッシュクリア関数
 */
export async function clearAllCaches(): Promise<void> {
	const manager = BrowserCacheManager.getInstance();
	await manager.clearBrowserCache();

	// 検証
	const isCleared = await manager.verifyCacheClear();

	if (!isCleared) {
		const browserInfo = manager.detectBrowserIssues();
		console.log(`ブラウザ: ${browserInfo.browser}`);
		console.log("推奨解決策:", browserInfo.solutions);
	}
}

/**
 * 開発者向けのキャッシュ診断関数
 */
export async function diagnoseCacheIssues(): Promise<void> {
	const manager = BrowserCacheManager.getInstance();

	console.log("🔍 キャッシュ状態を診断中...");

	const state = await manager.diagnoseCacheState();
	const browserInfo = manager.detectBrowserIssues();

	console.log("📊 キャッシュ診断結果:");
	console.log("- Service Workers:", state.serviceWorkers);
	console.log("- Local Storage items:", state.localStorage);
	console.log("- Session Storage items:", state.sessionStorage);
	console.log("- Cache API entries:", state.caches);
	console.log("- IndexedDB databases:", state.indexedDBs);
	console.log("- ブラウザ:", browserInfo.browser);
	console.log("- 既知の問題:", browserInfo.issues);
	console.log("- 推奨解決策:", browserInfo.solutions);
}

// グローバルに関数を公開（開発時のデバッグ用）
if (typeof window !== "undefined") {
	(
		window as unknown as {
			clearAllCaches: typeof clearAllCaches;
			diagnoseCacheIssues: typeof diagnoseCacheIssues;
		}
	).clearAllCaches = clearAllCaches;
	(
		window as unknown as {
			clearAllCaches: typeof clearAllCaches;
			diagnoseCacheIssues: typeof diagnoseCacheIssues;
		}
	).diagnoseCacheIssues = diagnoseCacheIssues;
}
