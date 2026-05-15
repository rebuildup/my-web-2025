/**
 * In-memory rate limiter with bounded storage and automatic eviction
 */

export interface RateLimitOptions {
	windowMs: number;
	maxRequests: number;
	maxKeys: number;
}

interface RateLimitEntry {
	count: number;
	resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Normalize IP address from x-forwarded-for header
 * Takes the first IP and trims whitespace
 */
export function normalizeIp(ip: string): string {
	if (!ip) return "unknown";
	const firstIp = ip.split(",")[0];
	return firstIp.trim();
}

/**
 * Check rate limit for a key
 * Evicts expired entries and enforces maxKeys cap
 */
export function checkRateLimit(
	key: string,
	options: RateLimitOptions,
): boolean {
	const now = Date.now();

	// Clean up expired entries and find oldest entry
	cleanupRateLimitStore(now);

	const current = store.get(key);

	// No existing entry or window expired
	if (!current || now > current.resetTime) {
		// Before adding, ensure we have room (delete oldest if needed)
		if (store.size >= options.maxKeys) {
			evictOldestResetTime(now);
		}

		store.set(key, { count: 1, resetTime: now + options.windowMs });
		return true;
	}

	// Within window, check count
	if (current.count >= options.maxRequests) {
		return false;
	}

	current.count++;
	return true;
}

/**
 * Delete expired entries from the store
 */
export function cleanupRateLimitStore(now?: number): void {
	const currentTime = now ?? Date.now();

	for (const [key, entry] of store.entries()) {
		if (currentTime > entry.resetTime) {
			store.delete(key);
		}
	}
}

/**
 * Evict the entry with the oldest reset time
 * Used when maxKeys limit is reached
 */
function evictOldestResetTime(now: number): void {
	let oldestKey: string | null = null;
	let oldestResetTime = Infinity;

	for (const [key, entry] of store.entries()) {
		if (entry.resetTime < oldestResetTime) {
			oldestResetTime = entry.resetTime;
			oldestKey = key;
		}
	}

	if (oldestKey !== null) {
		store.delete(oldestKey);
	}
}

/**
 * Get current size of the rate limit store
 */
export function getRateLimitStoreSize(): number {
	return store.size;
}

/**
 * Reset the rate limit store (for testing)
 */
export function resetRateLimitStore(): void {
	store.clear();
}
