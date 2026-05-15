/**
 * Server-side memory cache for CMS content
 * Used for caching database queries in server components
 */

type CacheEntry<T> = {
	data: T;
	timestamp: number;
	ttl: number;
};

class ServerCache<T> {
	private cache = new Map<string, CacheEntry<T>>();
	private defaultTtl: number;

	constructor(defaultTtlMs: number = 5 * 60 * 1000) {
		this.defaultTtl = defaultTtlMs;
	}

	get(key: string): T | undefined {
		const entry = this.cache.get(key);
		if (!entry) return undefined;
		if (Date.now() - entry.timestamp > entry.ttl) {
			this.cache.delete(key);
			return undefined;
		}
		return entry.data;
	}

	set(key: string, data: T, ttl?: number): void {
		this.cache.set(key, {
			data,
			timestamp: Date.now(),
			ttl: ttl ?? this.defaultTtl,
		});
	}

	delete(key: string): void {
		this.cache.delete(key);
	}

	clear(): void {
		this.cache.clear();
	}

	deleteByPrefix(prefix: string): void {
		for (const key of this.cache.keys()) {
			if (key.startsWith(prefix)) {
				this.cache.delete(key);
			}
		}
	}

	getOrSet(
		key: string,
		factory: () => T | Promise<T>,
		ttl?: number,
	): T | Promise<T> {
		const cached = this.get(key);
		if (cached !== undefined) return cached;

		const result = factory();
		if (result instanceof Promise) {
			return result.then((data) => {
				this.set(key, data, ttl);
				return data;
			});
		}
		this.set(key, result, ttl);
		return result;
	}

	async getOrSetAsync(
		key: string,
		factory: () => Promise<T>,
		ttl?: number,
	): Promise<T> {
		const cached = this.get(key);
		if (cached !== undefined) return cached;

		const data = await factory();
		this.set(key, data, ttl);
		return data;
	}

	getStats() {
		return {
			size: this.cache.size,
			keys: Array.from(this.cache.keys()),
		};
	}
}

export const contentCache = new ServerCache<unknown>(5 * 60 * 1000);
export const markdownCache = new ServerCache<unknown>(5 * 60 * 1000);
export const thumbnailsCache = new ServerCache<unknown>(10 * 60 * 1000);

export function clearAllCaches(): void {
	contentCache.clear();
	markdownCache.clear();
	thumbnailsCache.clear();
}
