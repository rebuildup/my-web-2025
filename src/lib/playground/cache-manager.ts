/**
 * Advanced Cache Manager for Playground
 * Multi-level caching with TTL and CDN optimization
 * Task 3.3: キャッシュ戦略の拡張
 */

export interface CacheEntry<T = unknown> {
	data: T;
	timestamp: number;
	ttl: number;
	accessCount: number;
	lastAccessed: number;
	size: number;
}

export interface CacheStats {
	totalEntries: number;
	totalSize: number;
	hitRate: number;
	missRate: number;
	evictionCount: number;
	oldestEntry: number;
	newestEntry: number;
}

export interface CacheConfig {
	maxSize: number; // Maximum cache size in bytes
	maxEntries: number; // Maximum number of entries
	defaultTTL: number; // Default TTL in milliseconds
	cleanupInterval: number; // Cleanup interval in milliseconds
	enableCompression: boolean;
	enablePersistence: boolean;
}

export class CacheManager {
	private static instance: CacheManager;
	private cache = new Map<string, CacheEntry>();
	private stats = {
		hits: 0,
		misses: 0,
		evictions: 0,
		totalRequests: 0,
	};

	private config: CacheConfig = {
		maxSize: 50 * 1024 * 1024, // 50MB
		maxEntries: 1000,
		defaultTTL: 6 * 60 * 60 * 1000, // 6 hours
		cleanupInterval: 5 * 60 * 1000, // 5 minutes
		enableCompression: true,
		enablePersistence: true,
	};

	private cleanupTimer: NodeJS.Timeout | null = null;

	static getInstance(): CacheManager {
		if (!CacheManager.instance) {
			CacheManager.instance = new CacheManager();
		}
		return CacheManager.instance;
	}

	constructor() {
		this.startCleanupTimer();
		this.loadFromPersistence();
	}

	/**
	 * Set cache configuration
	 */
	configure(config: Partial<CacheConfig>): void {
		this.config = { ...this.config, ...config };

		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
		}
		this.startCleanupTimer();
	}

	/**
	 * Get item from cache
	 */
	get<T>(key: string): T | null {
		this.stats.totalRequests++;

		const entry = this.cache.get(key);

		if (!entry) {
			this.stats.misses++;
			return null;
		}

		// Check if expired
		if (this.isExpired(entry)) {
			this.cache.delete(key);
			this.stats.misses++;
			return null;
		}

		// Update access statistics
		entry.accessCount++;
		entry.lastAccessed = Date.now();
		this.stats.hits++;

		return this.deserializeData(entry.data) as T;
	}

	/**
	 * Set item in cache
	 */
	set<T>(key: string, data: T, ttl?: number): boolean {
		const serializedData = this.serializeData(data);
		const size = this.calculateSize(serializedData);

		// Check if we need to make space
		if (!this.makeSpace(size)) {
			return false;
		}

		const entry: CacheEntry = {
			data: serializedData,
			timestamp: Date.now(),
			ttl: ttl || this.config.defaultTTL,
			accessCount: 0,
			lastAccessed: Date.now(),
			size,
		};

		this.cache.set(key, entry);
		this.saveToPersistence();

		return true;
	}

	/**
	 * Delete item from cache
	 */
	delete(key: string): boolean {
		const deleted = this.cache.delete(key);
		if (deleted) {
			this.saveToPersistence();
		}
		return deleted;
	}

	/**
	 * Check if key exists and is not expired
	 */
	has(key: string): boolean {
		const entry = this.cache.get(key);
		return entry ? !this.isExpired(entry) : false;
	}

	/**
	 * Clear all cache entries
	 */
	clear(): void {
		this.cache.clear();
		this.stats = {
			hits: 0,
			misses: 0,
			evictions: 0,
			totalRequests: 0,
		};
		this.saveToPersistence();
	}

	/**
	 * Get cache statistics
	 */
	getStats(): CacheStats {
		const entries = Array.from(this.cache.values());
		const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
		const timestamps = entries.map((entry) => entry.timestamp);

		return {
			totalEntries: this.cache.size,
			totalSize,
			hitRate:
				this.stats.totalRequests > 0
					? (this.stats.hits / this.stats.totalRequests) * 100
					: 0,
			missRate:
				this.stats.totalRequests > 0
					? (this.stats.misses / this.stats.totalRequests) * 100
					: 0,
			evictionCount: this.stats.evictions,
			oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : 0,
			newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : 0,
		};
	}

	/**
	 * Playground-specific cache methods
	 */

	/**
	 * Cache experiment data (6 hours TTL)
	 */
	cacheExperimentData(experimentId: string, data: unknown): boolean {
		return this.set(`experiment:${experimentId}`, data, 6 * 60 * 60 * 1000);
	}

	/**
	 * Get cached experiment data
	 */
	getExperimentData(experimentId: string): unknown | null {
		return this.get(`experiment:${experimentId}`);
	}

	/**
	 * Cache WebGL shader (24 hours TTL)
	 */
	cacheShader(shaderId: string, shaderCode: string): boolean {
		return this.set(`shader:${shaderId}`, shaderCode, 24 * 60 * 60 * 1000);
	}

	/**
	 * Get cached shader
	 */
	getShader(shaderId: string): string | null {
		return this.get(`shader:${shaderId}`);
	}

	/**
	 * Cache performance metrics (5 minutes TTL)
	 */
	cachePerformanceMetrics(experimentId: string, metrics: unknown): boolean {
		return this.set(`perf:${experimentId}`, metrics, 5 * 60 * 1000);
	}

	/**
	 * Get cached performance metrics
	 */
	getPerformanceMetrics(experimentId: string): unknown | null {
		return this.get(`perf:${experimentId}`);
	}

	/**
	 * Cache texture data (12 hours TTL)
	 */
	cacheTexture(textureId: string, textureData: ArrayBuffer): boolean {
		return this.set(`texture:${textureId}`, textureData, 12 * 60 * 60 * 1000);
	}

	/**
	 * Get cached texture
	 */
	getTexture(textureId: string): ArrayBuffer | null {
		return this.get(`texture:${textureId}`);
	}

	/**
	 * Cache compiled shader program (24 hours TTL)
	 */
	cacheCompiledShader(programId: string, program: unknown): boolean {
		return this.set(`compiled:${programId}`, program, 24 * 60 * 60 * 1000);
	}

	/**
	 * Get cached compiled shader
	 */
	getCompiledShader(programId: string): unknown | null {
		return this.get(`compiled:${programId}`);
	}

	/**
	 * Private helper methods
	 */

	private isExpired(entry: CacheEntry): boolean {
		return Date.now() - entry.timestamp > entry.ttl;
	}

	private makeSpace(requiredSize: number): boolean {
		const currentSize = this.getCurrentSize();

		// Check if we have enough space
		if (
			currentSize + requiredSize <= this.config.maxSize &&
			this.cache.size < this.config.maxEntries
		) {
			return true;
		}

		// Evict entries using LRU strategy
		const entries = Array.from(this.cache.entries())
			.map(([key, entry]) => ({ key, entry }))
			.sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);

		let freedSize = 0;
		let evicted = 0;

		for (const { key } of entries) {
			if (
				currentSize - freedSize + requiredSize <= this.config.maxSize &&
				this.cache.size - evicted < this.config.maxEntries
			) {
				break;
			}

			const entry = this.cache.get(key);
			if (entry) {
				freedSize += entry.size;
				this.cache.delete(key);
				evicted++;
				this.stats.evictions++;
			}
		}

		return currentSize - freedSize + requiredSize <= this.config.maxSize;
	}

	private getCurrentSize(): number {
		return Array.from(this.cache.values()).reduce(
			(sum, entry) => sum + entry.size,
			0,
		);
	}

	private calculateSize(data: unknown): number {
		if (typeof data === "string") {
			return data.length * 2; // UTF-16 encoding
		}

		if (data instanceof ArrayBuffer) {
			return data.byteLength;
		}

		if (
			data instanceof Uint8Array ||
			data instanceof Uint16Array ||
			data instanceof Uint32Array
		) {
			return data.byteLength;
		}

		// Estimate size for objects
		return JSON.stringify(data).length * 2;
	}

	private serializeData(data: unknown): unknown {
		if (!this.config.enableCompression) {
			return data;
		}

		// Simple compression for strings
		if (typeof data === "string" && data.length > 1000) {
			return this.compressString(data);
		}

		return data;
	}

	private deserializeData(data: unknown): unknown {
		if (!this.config.enableCompression) {
			return data;
		}

		// Check if data is compressed
		if (typeof data === "object" && data && "_compressed" in data) {
			const compressedData = data as { _compressed: boolean; data: string };
			return this.decompressString(compressedData.data);
		}

		return data;
	}

	private compressString(str: string): { _compressed: true; data: string } {
		// Simple run-length encoding for demonstration
		// In production, use a proper compression library
		let compressed = "";
		let count = 1;
		let current = str[0];

		for (let i = 1; i < str.length; i++) {
			if (str[i] === current && count < 255) {
				count++;
			} else {
				compressed += count > 1 ? `${count}${current}` : current;
				current = str[i];
				count = 1;
			}
		}
		compressed += count > 1 ? `${count}${current}` : current;

		return { _compressed: true, data: compressed };
	}

	private decompressString(compressed: string): string {
		// Decompress run-length encoded string
		let result = "";
		let i = 0;

		while (i < compressed.length) {
			if (/\d/.test(compressed[i])) {
				let count = "";
				while (i < compressed.length && /\d/.test(compressed[i])) {
					count += compressed[i];
					i++;
				}
				const char = compressed[i];
				result += char.repeat(parseInt(count, 10));
				i++;
			} else {
				result += compressed[i];
				i++;
			}
		}

		return result;
	}

	private startCleanupTimer(): void {
		this.cleanupTimer = setInterval(() => {
			this.cleanup();
		}, this.config.cleanupInterval);
	}

	private cleanup(): void {
		const now = Date.now();
		const expiredKeys: string[] = [];

		for (const [key, entry] of this.cache.entries()) {
			if (now - entry.timestamp > entry.ttl) {
				expiredKeys.push(key);
			}
		}

		expiredKeys.forEach((key) => this.cache.delete(key));

		if (expiredKeys.length > 0) {
			this.saveToPersistence();
		}
	}

	private saveToPersistence(): void {
		if (!this.config.enablePersistence || typeof window === "undefined") {
			return;
		}

		try {
			const cacheData = {
				entries: Array.from(this.cache.entries()),
				stats: this.stats,
				timestamp: Date.now(),
			};

			localStorage.setItem("playground-cache", JSON.stringify(cacheData));
		} catch (error) {
			console.warn("Failed to save cache to localStorage:", error);
		}
	}

	private loadFromPersistence(): void {
		if (!this.config.enablePersistence || typeof window === "undefined") {
			return;
		}

		try {
			const cached = localStorage.getItem("playground-cache");
			if (!cached) return;

			const cacheData = JSON.parse(cached);
			const now = Date.now();

			// Only load if cache is less than 24 hours old
			if (now - cacheData.timestamp > 24 * 60 * 60 * 1000) {
				localStorage.removeItem("playground-cache");
				return;
			}

			// Restore cache entries
			for (const [key, entry] of cacheData.entries) {
				if (!this.isExpired(entry)) {
					this.cache.set(key, entry);
				}
			}

			// Restore stats
			this.stats = cacheData.stats || this.stats;
		} catch (error) {
			console.warn("Failed to load cache from localStorage:", error);
			localStorage.removeItem("playground-cache");
		}
	}

	/**
	 * Destroy cache manager
	 */
	destroy(): void {
		if (this.cleanupTimer) {
			clearInterval(this.cleanupTimer);
			this.cleanupTimer = null;
		}
		this.clear();
	}
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance();

/**
 * CDN Cache Headers Utility
 */
export class CDNCacheHeaders {
	/**
	 * Get cache headers for static assets
	 */
	static getStaticAssetHeaders(): Record<string, string> {
		return {
			"Cache-Control": "public, max-age=31536000, immutable", // 1 year
			Expires: new Date(Date.now() + 31536000 * 1000).toUTCString(),
			ETag: `"${Date.now()}"`,
		};
	}

	/**
	 * Get cache headers for experiment data
	 */
	static getExperimentDataHeaders(): Record<string, string> {
		return {
			"Cache-Control": "public, max-age=21600, stale-while-revalidate=3600", // 6 hours, 1 hour stale
			Expires: new Date(Date.now() + 21600 * 1000).toUTCString(),
			Vary: "Accept-Encoding",
		};
	}

	/**
	 * Get cache headers for shader code
	 */
	static getShaderHeaders(): Record<string, string> {
		return {
			"Cache-Control": "public, max-age=86400, stale-while-revalidate=3600", // 24 hours, 1 hour stale
			Expires: new Date(Date.now() + 86400 * 1000).toUTCString(),
			"Content-Type": "text/plain",
		};
	}

	/**
	 * Get cache headers for performance metrics
	 */
	static getPerformanceMetricsHeaders(): Record<string, string> {
		return {
			"Cache-Control": "public, max-age=300, stale-while-revalidate=60", // 5 minutes, 1 minute stale
			Expires: new Date(Date.now() + 300 * 1000).toUTCString(),
			"Content-Type": "application/json",
		};
	}

	/**
	 * Get cache headers for texture data
	 */
	static getTextureHeaders(): Record<string, string> {
		return {
			"Cache-Control": "public, max-age=43200, immutable", // 12 hours
			Expires: new Date(Date.now() + 43200 * 1000).toUTCString(),
			"Content-Type": "application/octet-stream",
		};
	}
}

/**
 * Service Worker Cache Strategy
 */
export class ServiceWorkerCache {
	/**
	 * Register service worker for playground caching
	 */
	static async register(): Promise<void> {
		if ("serviceWorker" in navigator) {
			try {
				const registration =
					await navigator.serviceWorker.register("/sw-playground.js");
				console.log("Playground service worker registered:", registration);
			} catch (error) {
				console.warn("Failed to register playground service worker:", error);
			}
		}
	}

	/**
	 * Cache playground assets
	 */
	static async cachePlaygroundAssets(): Promise<void> {
		if ("caches" in window) {
			try {
				const cache = await caches.open("playground-v1");
				const assetsToCache = [
					"/portfolio/playground/design",
					"/portfolio/playground/WebGL",
					// Add other critical playground assets
				];

				await cache.addAll(assetsToCache);
				console.log("Playground assets cached");
			} catch (error) {
				console.warn("Failed to cache playground assets:", error);
			}
		}
	}
}
