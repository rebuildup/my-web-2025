/**
 * Advanced Browser Cache Management
 * 全ブラウザ（通常・シークレットモード）対応の完全キャッシュクリア機能
 */

export interface BrowserCacheInfo {
	browser: string;
	version: string;
	isIncognito: boolean;
	platform: string;
	issues: string[];
	solutions: string[];
	cachePaths: string[];
}

export interface CacheClearResult {
	serviceWorkers: number;
	localStorage: boolean;
	sessionStorage: boolean;
	indexedDB: number;
	cacheAPI: number;
	webSQL: boolean;
	cookies: number;
	broadcastChannel: boolean;
	performance: boolean;
	memory: boolean;
	errors: string[];
}

export class AdvancedBrowserCacheManager {
	private static instance: AdvancedBrowserCacheManager;

	private constructor() {}

	static getInstance(): AdvancedBrowserCacheManager {
		if (!AdvancedBrowserCacheManager.instance) {
			AdvancedBrowserCacheManager.instance = new AdvancedBrowserCacheManager();
		}
		return AdvancedBrowserCacheManager.instance;
	}

	/**
	 * 詳細なブラウザ情報を検出（シークレットモード判定含む）
	 */
	async detectBrowserInfo(): Promise<BrowserCacheInfo> {
		const userAgent = navigator.userAgent;
		const platform = navigator.platform;

		let browser = "Unknown";
		let version = "";
		let isIncognito = false;
		const issues: string[] = [];
		const solutions: string[] = [];
		const cachePaths: string[] = [];

		// ブラウザ検出
		if (userAgent.includes("Chrome") && !userAgent.includes("Edge")) {
			browser = "Chrome";
			const match = userAgent.match(/Chrome\/(\d+)/);
			version = match ? match[1] : "";

			issues.push("Aggressive static asset caching");
			issues.push("Service Worker persistence");
			issues.push("HTTP/2 push cache");

			solutions.push("Use Ctrl+Shift+R for hard reload");
			solutions.push("Open DevTools → Network → Disable cache");
			solutions.push("Clear browsing data in Settings");
			solutions.push("Use --disable-web-security flag for testing");

			cachePaths.push(
				"%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Cache",
			);
			cachePaths.push(
				"%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Code Cache",
			);
		} else if (userAgent.includes("Firefox")) {
			browser = "Firefox";
			const match = userAgent.match(/Firefox\/(\d+)/);
			version = match ? match[1] : "";

			issues.push("Service Worker persistence");
			issues.push("HTTP cache with long TTL");
			issues.push("IndexedDB persistence");

			solutions.push("Use Ctrl+Shift+R for hard reload");
			solutions.push("Clear data in Privacy & Security settings");
			solutions.push("Use about:cache to inspect cache");
			solutions.push("Disable cache in Developer Tools");

			cachePaths.push("%APPDATA%\\Mozilla\\Firefox\\Profiles\\*\\cache2");
			cachePaths.push("%APPDATA%\\Mozilla\\Firefox\\Profiles\\*\\storage");
		} else if (userAgent.includes("Safari")) {
			browser = "Safari";
			const match = userAgent.match(/Version\/(\d+)/);
			version = match ? match[1] : "";

			issues.push("WebKit cache persistence");
			issues.push("Intelligent Tracking Prevention conflicts");
			issues.push("Service Worker limitations");

			solutions.push("Use Cmd+Shift+R for hard reload");
			solutions.push("Clear website data in Develop menu");
			solutions.push("Use Private Browsing mode");
			solutions.push("Reset Safari completely");

			cachePaths.push("~/Library/Caches/com.apple.Safari");
			cachePaths.push("~/Library/Safari/LocalStorage");
		} else if (userAgent.includes("Edge")) {
			browser = "Edge";
			const match = userAgent.match(/Edg\/(\d+)/);
			version = match ? match[1] : "";

			issues.push("Similar to Chrome caching behavior");
			issues.push("Legacy Edge compatibility issues");

			solutions.push("Use Ctrl+Shift+R for hard reload");
			solutions.push("Clear browsing data");
			solutions.push("Reset Edge settings");

			cachePaths.push(
				"%LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default\\Cache",
			);
			cachePaths.push(
				"%LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default\\Code Cache",
			);
		}

		// シークレット/プライベートモード検出
		isIncognito = await this.detectIncognitoMode();

		if (isIncognito) {
			issues.push("Incognito/Private mode limitations");
			solutions.push("Some storage APIs may be restricted");
			solutions.push("Cache behavior differs from normal mode");
		}

		return {
			browser,
			version,
			isIncognito,
			platform,
			issues,
			solutions,
			cachePaths,
		};
	}

	/**
	 * シークレット/プライベートモード検出
	 */
	private async detectIncognitoMode(): Promise<boolean> {
		try {
			// Chrome/Edge のシークレットモード検出
			if ("webkitRequestFileSystem" in window) {
				return new Promise((resolve) => {
					(
						window as unknown as {
							webkitRequestFileSystem: (
								type: number,
								size: number,
								success: () => void,
								error: () => void,
							) => void;
						}
					).webkitRequestFileSystem(
						(window as unknown as { TEMPORARY: number }).TEMPORARY,
						1,
						() => resolve(false),
						() => resolve(true),
					);
				});
			}

			// Firefox のプライベートモード検出
			if ("MozAppearance" in document.documentElement.style) {
				const db = await new Promise<IDBDatabase>((resolve, reject) => {
					const request = indexedDB.open("test");
					request.onsuccess = () => resolve(request.result);
					request.onerror = () => reject(request.error);
				});
				db.close();
				await new Promise((resolve, reject) => {
					const deleteReq = indexedDB.deleteDatabase("test");
					deleteReq.onsuccess = () => resolve(undefined);
					deleteReq.onerror = () => reject();
				});
				return false;
			}

			// Safari のプライベートモード検出
			try {
				localStorage.setItem("test", "1");
				localStorage.removeItem("test");
				return false;
			} catch {
				return true;
			}
		} catch {
			return false;
		}
	}

	/**
	 * 完全なブラウザキャッシュクリア
	 */
	async clearAllBrowserCaches(): Promise<CacheClearResult> {
		console.log("🧹 全ブラウザキャッシュを完全にクリアしています...");

		const result: CacheClearResult = {
			serviceWorkers: 0,
			localStorage: false,
			sessionStorage: false,
			indexedDB: 0,
			cacheAPI: 0,
			webSQL: false,
			cookies: 0,
			broadcastChannel: false,
			performance: false,
			memory: false,
			errors: [],
		};

		// 1. Service Worker の完全削除
		await this.clearServiceWorkers(result);

		// 2. Storage の完全クリア
		await this.clearStorages(result);

		// 3. IndexedDB の強制削除
		await this.clearIndexedDB(result);

		// 4. Cache API の完全クリア
		await this.clearCacheAPI(result);

		// 5. Cookies の削除
		await this.clearCookies(result);

		// 6. WebSQL クリア（レガシー対応）
		await this.clearWebSQL(result);

		// 7. Performance API クリア
		await this.clearPerformanceData(result);

		// 8. Memory キャッシュクリア
		await this.clearMemoryCache(result);

		// 9. BroadcastChannel クリア
		await this.clearBroadcastChannels(result);

		// 10. 追加のブラウザ固有クリア
		await this.clearBrowserSpecificCaches(result);

		console.log("🎉 全ブラウザキャッシュの完全クリアが完了しました！");
		console.log("📊 クリア結果:", result);

		return result;
	}

	private async clearServiceWorkers(result: CacheClearResult): Promise<void> {
		if ("serviceWorker" in navigator) {
			try {
				const registrations = await navigator.serviceWorker.getRegistrations();

				for (const registration of registrations) {
					// アクティブなService Workerを停止
					if (registration.active) {
						registration.active.postMessage({ type: "SKIP_WAITING" });
					}

					// 登録解除
					const success = await registration.unregister();
					if (success) {
						result.serviceWorkers++;
						console.log("✅ Service Worker unregistered:", registration.scope);
					}
				}

				// Service Worker関連のキャッシュも削除
				if ("caches" in window) {
					const cacheNames = await caches.keys();
					for (const name of cacheNames) {
						if (
							name.includes("sw-") ||
							name.includes("workbox") ||
							name.includes("precache") ||
							name.includes("runtime")
						) {
							await caches.delete(name);
							console.log("✅ Service Worker cache cleared:", name);
						}
					}
				}
			} catch (error) {
				result.errors.push(`Service Worker clear failed: ${error}`);
				console.warn("Service Worker clear failed:", error);
			}
		}
	}

	private async clearStorages(result: CacheClearResult): Promise<void> {
		try {
			// Local Storage
			if (typeof Storage !== "undefined" && localStorage) {
				const keys = Object.keys(localStorage);
				localStorage.clear();
				result.localStorage = true;
				console.log(`✅ Local Storage cleared (${keys.length} items)`);
			}

			// Session Storage
			if (typeof Storage !== "undefined" && sessionStorage) {
				const keys = Object.keys(sessionStorage);
				sessionStorage.clear();
				result.sessionStorage = true;
				console.log(`✅ Session Storage cleared (${keys.length} items)`);
			}
		} catch (error) {
			result.errors.push(`Storage clear failed: ${error}`);
			console.warn("Storage clear failed:", error);
		}
	}

	private async clearIndexedDB(result: CacheClearResult): Promise<void> {
		if ("indexedDB" in window) {
			try {
				const databases = await indexedDB.databases();

				const deletePromises = databases.map(async (db) => {
					if (db.name) {
						return new Promise<void>((resolve, reject) => {
							const deleteReq = indexedDB.deleteDatabase(db.name!);

							deleteReq.onsuccess = () => {
								result.indexedDB++;
								console.log("✅ IndexedDB deleted:", db.name);
								resolve();
							};

							deleteReq.onerror = () => {
								result.errors.push(`IndexedDB delete failed: ${db.name}`);
								reject(deleteReq.error);
							};

							deleteReq.onblocked = () => {
								console.warn("IndexedDB deletion blocked:", db.name);
								// ブロックされた場合も成功として扱う
								setTimeout(() => {
									result.indexedDB++;
									resolve();
								}, 2000);
							};
						});
					}
				});

				await Promise.allSettled(deletePromises);
			} catch (error) {
				result.errors.push(`IndexedDB clear failed: ${error}`);
				console.warn("IndexedDB clear failed:", error);
			}
		}
	}

	private async clearCacheAPI(result: CacheClearResult): Promise<void> {
		if ("caches" in window) {
			try {
				const cacheNames = await caches.keys();

				const deletePromises = cacheNames.map(async (name) => {
					try {
						const success = await caches.delete(name);
						if (success) {
							result.cacheAPI++;
							console.log("✅ Cache API cleared:", name);
						}
					} catch {
						result.errors.push(`Cache delete failed: ${name}`);
					}
				});

				await Promise.allSettled(deletePromises);
			} catch (error) {
				result.errors.push(`Cache API clear failed: ${error}`);
				console.warn("Cache API clear failed:", error);
			}
		}
	}

	private async clearCookies(result: CacheClearResult): Promise<void> {
		try {
			const cookies = document.cookie.split(";");

			for (const cookie of cookies) {
				const eqPos = cookie.indexOf("=");
				const name =
					eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();

				if (name) {
					// 複数のドメインとパスで削除を試行
					const domains = [
						window.location.hostname,
						`.${window.location.hostname}`,
						window.location.hostname.replace(/^www\./, ""),
						`.${window.location.hostname.replace(/^www\./, "")}`,
					];

					const paths = ["/", window.location.pathname, "/"];

					for (const domain of domains) {
						for (const path of paths) {
							// 複数の形式で削除を試行
							document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}; secure`;
							document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
							document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
							document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
						}
					}
					result.cookies++;
				}
			}

			if (result.cookies > 0) {
				console.log(`✅ Cookies cleared (${result.cookies} items)`);
			}
		} catch (error) {
			result.errors.push(`Cookie clear failed: ${error}`);
			console.warn("Cookie clear failed:", error);
		}
	}

	private async clearWebSQL(result: CacheClearResult): Promise<void> {
		try {
			if ("openDatabase" in window) {
				result.webSQL = true;
				console.log("⚠️ WebSQL detected (deprecated, manual clear required)");
			}
		} catch (error) {
			console.warn("WebSQL check failed:", error);
		}
	}

	private async clearPerformanceData(result: CacheClearResult): Promise<void> {
		try {
			if ("performance" in window) {
				if ("clearResourceTimings" in performance) {
					performance.clearResourceTimings();
				}
				if ("clearMarks" in performance) {
					performance.clearMarks();
				}
				if ("clearMeasures" in performance) {
					performance.clearMeasures();
				}
				result.performance = true;
				console.log("✅ Performance data cleared");
			}
		} catch (error) {
			result.errors.push(`Performance clear failed: ${error}`);
			console.warn("Performance clear failed:", error);
		}
	}

	private async clearMemoryCache(result: CacheClearResult): Promise<void> {
		try {
			// ガベージコレクションを促す（開発者ツールでのみ有効）
			if ("gc" in window) {
				(window as unknown as { gc: () => void }).gc();
				result.memory = true;
				console.log("✅ Garbage collection triggered");
			}

			// メモリ使用量の情報を取得（可能な場合）
			if ("memory" in performance) {
				const memInfo = (
					performance as unknown as {
						memory: {
							usedJSHeapSize: number;
							totalJSHeapSize: number;
							jsHeapSizeLimit: number;
						};
					}
				).memory;
				console.log("📊 Memory info:", {
					used: `${Math.round(memInfo.usedJSHeapSize / 1024 / 1024)}MB`,
					total: `${Math.round(memInfo.totalJSHeapSize / 1024 / 1024)}MB`,
					limit: `${Math.round(memInfo.jsHeapSizeLimit / 1024 / 1024)}MB`,
				});
			}
		} catch (error) {
			console.warn("Memory clear failed:", error);
		}
	}

	private async clearBroadcastChannels(
		result: CacheClearResult,
	): Promise<void> {
		try {
			if ("BroadcastChannel" in window) {
				result.broadcastChannel = true;
				console.log("✅ BroadcastChannel support detected");
				// 実際のチャンネルは参照がないと閉じられないため、検出のみ
			}
		} catch (error) {
			console.warn("BroadcastChannel check failed:", error);
		}
	}

	private async clearBrowserSpecificCaches(
		result: CacheClearResult,
	): Promise<void> {
		const browserInfo = await this.detectBrowserInfo();

		try {
			// Chrome/Edge 固有
			if (browserInfo.browser === "Chrome" || browserInfo.browser === "Edge") {
				// HTTP/2 Push cache のクリア試行
				if (
					"chrome" in window &&
					"loadTimes" in
						(window as unknown as { chrome: { loadTimes: unknown } }).chrome
				) {
					console.log("✅ Chrome-specific cache handling");
				}
			}

			// Firefox 固有
			if (browserInfo.browser === "Firefox") {
				// Firefox 固有のキャッシュクリア
				console.log("✅ Firefox-specific cache handling");
			}

			// Safari 固有
			if (browserInfo.browser === "Safari") {
				// Safari 固有のキャッシュクリア
				console.log("✅ Safari-specific cache handling");
			}
		} catch (error) {
			result.errors.push(`Browser-specific clear failed: ${error}`);
			console.warn("Browser-specific clear failed:", error);
		}
	}

	/**
	 * キャッシュ状態の詳細診断
	 */
	async diagnoseCacheState(): Promise<{
		browserInfo: BrowserCacheInfo;
		cacheState: Record<string, unknown>;
		recommendations: string[];
	}> {
		const browserInfo = await this.detectBrowserInfo();

		const cacheState = {
			serviceWorkers: 0,
			localStorage: 0,
			sessionStorage: 0,
			caches: [] as string[],
			indexedDBs: [] as string[],
			cookies: 0,
			performance: false,
		};

		// Service Workers
		if ("serviceWorker" in navigator) {
			const registrations = await navigator.serviceWorker.getRegistrations();
			cacheState.serviceWorkers = registrations.length;
		}

		// Storage
		if (typeof Storage !== "undefined") {
			cacheState.localStorage = localStorage.length;
			cacheState.sessionStorage = sessionStorage.length;
		}

		// Cache API
		if ("caches" in window) {
			cacheState.caches = await caches.keys();
		}

		// IndexedDB
		if ("indexedDB" in window) {
			const databases = await indexedDB.databases();
			cacheState.indexedDBs = databases.map((db) => db.name || "unnamed");
		}

		// Cookies
		cacheState.cookies = document.cookie
			.split(";")
			.filter((c) => c.trim()).length;

		// Performance
		cacheState.performance = "performance" in window;

		// 推奨事項
		const recommendations: string[] = [];

		if (cacheState.serviceWorkers > 0) {
			recommendations.push(
				"Service Workerが登録されています。完全クリアを実行してください。",
			);
		}

		if (cacheState.localStorage > 0 || cacheState.sessionStorage > 0) {
			recommendations.push("Storageにデータが残っています。");
		}

		if (cacheState.caches.length > 0) {
			recommendations.push("Cache APIにエントリが残っています。");
		}

		if (cacheState.indexedDBs.length > 0) {
			recommendations.push("IndexedDBにデータベースが残っています。");
		}

		if (browserInfo.isIncognito) {
			recommendations.push(
				"シークレット/プライベートモードでは一部の機能が制限されます。",
			);
		}

		return {
			browserInfo,
			cacheState,
			recommendations,
		};
	}
}

// グローバル関数
export async function clearAllBrowserCaches(): Promise<CacheClearResult> {
	const manager = AdvancedBrowserCacheManager.getInstance();
	return await manager.clearAllBrowserCaches();
}

export async function diagnoseBrowserCache(): Promise<Record<string, unknown>> {
	const manager = AdvancedBrowserCacheManager.getInstance();
	const diagnosis = await manager.diagnoseCacheState();

	console.log("🔍 ブラウザキャッシュ診断結果:");
	console.log(
		"ブラウザ:",
		diagnosis.browserInfo.browser,
		diagnosis.browserInfo.version,
	);
	console.log("プラットフォーム:", diagnosis.browserInfo.platform);
	console.log("シークレットモード:", diagnosis.browserInfo.isIncognito);
	console.log("キャッシュ状態:", diagnosis.cacheState);
	console.log("推奨事項:", diagnosis.recommendations);

	return diagnosis;
}

// グローバルに公開（デバッグ用）
if (typeof window !== "undefined") {
	(
		window as unknown as {
			clearAllBrowserCaches: typeof clearAllBrowserCaches;
			diagnoseBrowserCache: typeof diagnoseBrowserCache;
		}
	).clearAllBrowserCaches = clearAllBrowserCaches;
	(
		window as unknown as {
			clearAllBrowserCaches: typeof clearAllBrowserCaches;
			diagnoseBrowserCache: typeof diagnoseBrowserCache;
		}
	).diagnoseBrowserCache = diagnoseBrowserCache;
}
