/**
 * Service Worker registration and management utilities
 * Handles offline functionality and caching strategies
 */

export interface ServiceWorkerStatus {
	isSupported: boolean;
	isRegistered: boolean;
	isActive: boolean;
	version?: string;
}

export class ServiceWorkerManager {
	private registration: ServiceWorkerRegistration | null = null;
	private status: ServiceWorkerStatus = {
		isSupported: false,
		isRegistered: false,
		isActive: false,
	};

	constructor() {
		this.status.isSupported = "serviceWorker" in navigator;
	}

	// Register service worker
	public async register(): Promise<ServiceWorkerStatus> {
		if (!this.status.isSupported) {
			console.warn("Service Worker not supported");
			return this.status;
		}

		// Only register in production to avoid development issues
		if (process.env.NODE_ENV !== "production") {
			console.log("Service Worker: Skipping registration in development");
			return this.status;
		}

		try {
			this.registration = await navigator.serviceWorker.register("/sw.js", {
				scope: "/",
				updateViaCache: "none",
			});

			this.status.isRegistered = true;

			// Handle updates
			this.registration.addEventListener("updatefound", () => {
				this.handleUpdate();
			});

			// Check if service worker is active
			if (this.registration.active) {
				this.status.isActive = true;
				this.getVersion();
			}

			// Listen for controller changes
			navigator.serviceWorker.addEventListener("controllerchange", () => {
				if (process.env.NODE_ENV !== "production") {
					console.log("Service Worker: Controller changed");
				}
				// Avoid immediate reload in development to prevent infinite loops
				if (process.env.NODE_ENV === "production") {
					window.location.reload();
				}
			});

			// Listen for messages from service worker
			navigator.serviceWorker.addEventListener("message", (event) => {
				this.handleMessage(event);
			});

			if (process.env.NODE_ENV !== "production") {
				console.log("Service Worker: Registered successfully");
			}
			return this.status;
		} catch (error) {
			console.error("Service Worker: Registration failed", error);
			// Don't throw error, just return status
			return this.status;
		}
	}

	// Handle service worker updates
	private handleUpdate(): void {
		if (!this.registration) return;

		const newWorker = this.registration.installing;
		if (!newWorker) return;

		newWorker.addEventListener("statechange", () => {
			if (
				newWorker.state === "installed" &&
				navigator.serviceWorker.controller
			) {
				// New service worker is available
				this.showUpdateNotification();
			}
		});
	}

	// Show update notification to user
	private showUpdateNotification(): void {
		if (confirm("新しいバージョンが利用可能です。更新しますか？")) {
			this.skipWaiting();
		}
	}

	// Skip waiting and activate new service worker
	public skipWaiting(): void {
		if (!this.registration || !this.registration.waiting) return;

		this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
	}

	// Get service worker version
	private async getVersion(): Promise<void> {
		if (!navigator.serviceWorker.controller) return;

		const messageChannel = new MessageChannel();
		messageChannel.port1.onmessage = (event) => {
			this.status.version = event.data.version;
		};

		navigator.serviceWorker.controller.postMessage({ type: "GET_VERSION" }, [
			messageChannel.port2,
		]);
	}

	// Handle messages from service worker
	private handleMessage(event: MessageEvent): void {
		const { data } = event;

		switch (data.type) {
			case "CACHE_UPDATED":
				if (process.env.NODE_ENV !== "production") {
					console.log("Service Worker: Cache updated");
				}
				break;
			case "OFFLINE":
				if (process.env.NODE_ENV !== "production") {
					console.log("Service Worker: App is offline");
				}
				this.handleOfflineStatus(true);
				break;
			case "ONLINE":
				if (process.env.NODE_ENV !== "production") {
					console.log("Service Worker: App is online");
				}
				this.handleOfflineStatus(false);
				break;
			default:
				if (process.env.NODE_ENV !== "production") {
					console.log("Service Worker: Unknown message", data);
				}
		}
	}

	// Handle offline/online status
	private handleOfflineStatus(isOffline: boolean): void {
		// Update UI to show offline status
		const offlineIndicator = document.getElementById("offline-indicator");
		if (offlineIndicator) {
			offlineIndicator.style.display = isOffline ? "block" : "none";
		}

		// Dispatch custom event
		window.dispatchEvent(
			new CustomEvent("connectionchange", {
				detail: { isOffline },
			}),
		);
	}

	// Clear all caches
	public async clearCache(): Promise<void> {
		if (!navigator.serviceWorker.controller) return;

		navigator.serviceWorker.controller.postMessage({ type: "CLEAR_CACHE" });
		if (process.env.NODE_ENV !== "production") {
			console.log("Service Worker: Cache cleared");
		}
	}

	// Unregister service worker
	public async unregister(): Promise<boolean> {
		if (!this.registration) return false;

		try {
			const result = await this.registration.unregister();
			this.status.isRegistered = false;
			this.status.isActive = false;
			if (process.env.NODE_ENV !== "production") {
				console.log("Service Worker: Unregistered successfully");
			}
			return result;
		} catch (error) {
			console.error("Service Worker: Unregistration failed", error);
			return false;
		}
	}

	// Get current status
	public getStatus(): ServiceWorkerStatus {
		return { ...this.status };
	}

	// Check if app is offline
	public isOffline(): boolean {
		return !navigator.onLine;
	}

	// Sync data when online
	public async syncWhenOnline(): Promise<void> {
		if (!this.registration) return;

		try {
			// Check if sync is supported
			if ("sync" in this.registration && this.registration.sync) {
				await this.registration.sync.register("analytics-sync");
				if (process.env.NODE_ENV !== "production") {
					console.log("Service Worker: Background sync registered");
				}
			} else {
				if (process.env.NODE_ENV !== "production") {
					console.log("Service Worker: Background sync not supported");
				}
			}
		} catch (error) {
			console.error("Service Worker: Background sync failed", error);
		}
	}
}

// Network status monitoring
export class NetworkMonitor {
	private callbacks: Set<(isOnline: boolean) => void> = new Set();
	private isOnline: boolean = navigator.onLine;

	constructor() {
		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		window.addEventListener("online", () => {
			this.isOnline = true;
			this.notifyCallbacks(true);
		});

		window.addEventListener("offline", () => {
			this.isOnline = false;
			this.notifyCallbacks(false);
		});

		// Additional connection quality monitoring
		if ("connection" in navigator) {
			const connection = (
				navigator as Navigator & {
					connection: {
						effectiveType: string;
						addEventListener: (event: string, callback: () => void) => void;
					};
				}
			).connection;
			connection.addEventListener("change", () => {
				this.checkConnectionQuality();
			});
		}
	}

	private checkConnectionQuality(): void {
		if ("connection" in navigator) {
			const connection = (
				navigator as Navigator & {
					connection: {
						effectiveType: string;
					};
				}
			).connection;
			const isSlowConnection =
				connection.effectiveType === "slow-2g" ||
				connection.effectiveType === "2g";

			if (isSlowConnection) {
				console.log("Network: Slow connection detected");
				// Implement data saving strategies
				this.enableDataSaving();
			}
		}
	}

	private enableDataSaving(): void {
		// Reduce image quality, disable auto-play videos, etc.
		document.documentElement.classList.add("data-saving");
	}

	private notifyCallbacks(isOnline: boolean): void {
		this.callbacks.forEach((callback) => {
			try {
				callback(isOnline);
			} catch (error) {
				console.error("Network callback error:", error);
			}
		});
	}

	public subscribe(callback: (isOnline: boolean) => void): () => void {
		this.callbacks.add(callback);

		// Return unsubscribe function
		return () => {
			this.callbacks.delete(callback);
		};
	}

	public getStatus(): boolean {
		return this.isOnline;
	}
}

// Cache management utilities
export class CacheManager {
	// Preload critical resources
	public static async preloadCriticalResources(): Promise<void> {
		if (!("caches" in window)) return;

		const criticalResources = [
			"/",
			"/about",
			"/portfolio",
			"/workshop",
			"/tools",
			"/images/og-image.png",
		];

		try {
			const cache = await caches.open("samuido-critical-v1");

			// Cache resources individually to handle failures gracefully
			const cachePromises = criticalResources.map(async (resource) => {
				try {
					const response = await fetch(resource);
					if (response.ok) {
						await cache.put(resource, response);
						if (process.env.NODE_ENV !== "production") {
							console.log("Preloaded:", resource);
						}
					} else {
						if (process.env.NODE_ENV !== "production") {
							console.warn("Failed to preload (not found):", resource);
						}
					}
				} catch (error) {
					if (process.env.NODE_ENV !== "production") {
						console.warn(
							"Failed to preload (error):",
							resource,
							error instanceof Error ? error.message : String(error),
						);
					}
				}
			});

			await Promise.allSettled(cachePromises);
			if (process.env.NODE_ENV !== "production") {
				console.log("Critical resources preloading completed");
			}
		} catch (error) {
			console.error("Failed to preload critical resources:", error);
		}
	}

	// Clear specific cache
	public static async clearCache(cacheName: string): Promise<boolean> {
		if (!("caches" in window)) return false;

		try {
			const result = await caches.delete(cacheName);
			if (process.env.NODE_ENV !== "production") {
				console.log(`Cache ${cacheName} cleared:`, result);
			}
			return result;
		} catch (error) {
			console.error(`Failed to clear cache ${cacheName}:`, error);
			return false;
		}
	}

	// Get cache storage usage
	public static async getCacheUsage(): Promise<{
		usage: number;
		quota: number;
		percentage: number;
	}> {
		if (!("storage" in navigator && "estimate" in navigator.storage)) {
			return { usage: 0, quota: 0, percentage: 0 };
		}

		try {
			const estimate = await navigator.storage.estimate();
			const usage = estimate.usage || 0;
			const quota = estimate.quota || 0;
			const percentage = quota > 0 ? (usage / quota) * 100 : 0;

			return { usage, quota, percentage };
		} catch (error) {
			console.error("Failed to get cache usage:", error);
			return { usage: 0, quota: 0, percentage: 0 };
		}
	}
}

// Initialize service worker and monitoring
export const initializeServiceWorker = async (): Promise<{
	serviceWorker: ServiceWorkerManager;
	networkMonitor: NetworkMonitor;
}> => {
	const serviceWorker = new ServiceWorkerManager();
	const networkMonitor = new NetworkMonitor();

	// Register service worker
	if (typeof window !== "undefined") {
		try {
			await serviceWorker.register();

			// Preload critical resources (don't await to avoid blocking)
			CacheManager.preloadCriticalResources().catch((error) => {
				console.warn("Critical resources preloading failed:", error);
			});

			// Setup network monitoring
			networkMonitor.subscribe((isOnline) => {
				if (isOnline) {
					serviceWorker.syncWhenOnline().catch((error) => {
						console.warn("Sync when online failed:", error);
					});
				}
			});
		} catch (error) {
			console.error("Service Worker initialization failed:", error);
			// Continue without service worker
		}
	}

	return { serviceWorker, networkMonitor };
};
