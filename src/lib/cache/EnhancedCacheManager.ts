"use client";

// Enhanced cache manager for performance optimization
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  cleanupInterval?: number; // Cleanup interval in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
}

export class EnhancedCacheManager<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats = { hits: 0, misses: 0 };
  private cleanupTimer: NodeJS.Timeout | null = null;
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      cleanupInterval: options.cleanupInterval || 60 * 1000, // 1 minute
    };

    this.startCleanupTimer();
  }

  // Set cache entry
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const entryTtl = ttl || this.options.ttl;

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: entryTtl,
      accessCount: 0,
      lastAccessed: now,
    });
  }

  // Get cache entry
  get(key: string): T | null {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = now;
    this.stats.hits++;

    return entry.data;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Delete cache entry
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  // Get cache statistics
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      hitRate: total > 0 ? this.stats.hits / total : 0,
    };
  }

  // Get or set with factory function
  async getOrSet<U extends T>(
    key: string,
    factory: () => Promise<U> | U,
    ttl?: number,
  ): Promise<U> {
    const cached = this.get(key) as U;
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  // Batch get multiple keys
  getMultiple(keys: string[]): Map<string, T | null> {
    const result = new Map<string, T | null>();
    keys.forEach((key) => {
      result.set(key, this.get(key));
    });
    return result;
  }

  // Batch set multiple entries
  setMultiple(entries: Map<string, T>, ttl?: number): void {
    entries.forEach((data, key) => {
      this.set(key, data, ttl);
    });
  }

  // Get keys matching pattern
  getKeys(pattern?: RegExp): string[] {
    const keys = Array.from(this.cache.keys());
    return pattern ? keys.filter((key) => pattern.test(key)) : keys;
  }

  // Evict least recently used entries
  private evictLRU(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Cleanup expired entries
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach((key) => this.cache.delete(key));

    if (process.env.NODE_ENV === "development" && expiredKeys.length > 0) {
      console.log(`[Cache] Cleaned up ${expiredKeys.length} expired entries`);
    }
  }

  // Start automatic cleanup timer
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.options.cleanupInterval);
  }

  // Stop cleanup timer
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Specialized cache managers for different data types
export class MarkdownCacheManager extends EnhancedCacheManager<string> {
  constructor() {
    super({
      ttl: 10 * 60 * 1000, // 10 minutes for markdown content
      maxSize: 500,
    });
  }

  // Cache markdown content with file path as key
  cacheMarkdown(filePath: string, content: string): void {
    this.set(`markdown:${filePath}`, content);
  }

  // Get cached markdown content
  getMarkdown(filePath: string): string | null {
    return this.get(`markdown:${filePath}`);
  }
}

export class TagCacheManager extends EnhancedCacheManager<unknown> {
  constructor() {
    super({
      ttl: 5 * 60 * 1000, // 5 minutes for tag data
      maxSize: 200,
    });
  }

  // Cache tag list
  cacheTagList(tags: unknown[]): void {
    this.set("tags:all", tags);
  }

  // Get cached tag list
  getTagList(): unknown[] | null {
    return this.get("tags:all") as unknown[] | null;
  }

  // Cache tag search results
  cacheTagSearch(query: string, results: unknown[]): void {
    this.set(`tags:search:${query}`, results);
  }

  // Get cached tag search results
  getTagSearch(query: string): unknown[] | null {
    return this.get(`tags:search:${query}`) as unknown[] | null;
  }
}

export class ImageCacheManager extends EnhancedCacheManager<unknown> {
  constructor() {
    super({
      ttl: 30 * 60 * 1000, // 30 minutes for image metadata
      maxSize: 1000,
    });
  }

  // Cache image metadata
  cacheImageMetadata(url: string, metadata: unknown): void {
    this.set(`image:${url}`, metadata);
  }

  // Get cached image metadata
  getImageMetadata(url: string): unknown | null {
    return this.get(`image:${url}`);
  }
}

// Enhanced Data Cache - Specialized cache for portfolio data
export class EnhancedDataCache {
  private markdownCache: MarkdownCacheManager;
  private tagCache: TagCacheManager;
  private imageCache: ImageCacheManager;
  private contentCache: EnhancedCacheManager<unknown>;

  constructor() {
    this.markdownCache = new MarkdownCacheManager();
    this.tagCache = new TagCacheManager();
    this.imageCache = new ImageCacheManager();
    this.contentCache = new EnhancedCacheManager({
      ttl: 15 * 60 * 1000, // 15 minutes for content data
      maxSize: 500,
    });
  }

  // Markdown content caching
  async getMarkdownContent(filePath: string): Promise<string | null> {
    // Return cached content if available
    const cached = this.markdownCache.getMarkdown(filePath);
    if (cached !== null) {
      return cached;
    }

    // For client-side cache, content should be provided externally
    // This method now only retrieves from cache
    return null;
  }

  setMarkdownContent(filePath: string, content: string): void {
    this.markdownCache.cacheMarkdown(filePath, content);
  }

  // Tag data caching
  async getTagList(): Promise<unknown[] | null> {
    return this.tagCache.getTagList();
  }

  setTagList(tags: unknown[]): void {
    this.tagCache.cacheTagList(tags);
  }

  async getTagSearchResults(query: string): Promise<unknown[] | null> {
    return this.tagCache.getTagSearch(query);
  }

  setTagSearchResults(query: string, results: unknown[]): void {
    this.tagCache.cacheTagSearch(query, results);
  }

  // Image metadata caching
  getImageMetadata(url: string): unknown | null {
    return this.imageCache.getImageMetadata(url);
  }

  setImageMetadata(url: string, metadata: unknown): void {
    this.imageCache.cacheImageMetadata(url, metadata);
  }

  // Content data caching
  getContentData(key: string): unknown | null {
    return this.contentCache.get(key);
  }

  setContentData(key: string, data: unknown, ttl?: number): void {
    this.contentCache.set(key, data, ttl);
  }

  // Portfolio items caching
  getPortfolioItems(category?: string): unknown[] | null {
    const key = category ? `portfolio:${category}` : "portfolio:all";
    return this.contentCache.get(key) as unknown[] | null;
  }

  setPortfolioItems(items: unknown[], category?: string): void {
    const key = category ? `portfolio:${category}` : "portfolio:all";
    this.contentCache.set(key, items);
  }

  // Cache invalidation strategies
  invalidateMarkdownCache(filePath?: string): void {
    if (filePath) {
      this.markdownCache.delete(`markdown:${filePath}`);
    } else {
      // Clear all markdown cache
      const keys = this.markdownCache.getKeys(/^markdown:/);
      keys.forEach((key) => this.markdownCache.delete(key));
    }
  }

  invalidateTagCache(): void {
    this.tagCache.clear();
  }

  invalidateImageCache(url?: string): void {
    if (url) {
      this.imageCache.delete(`image:${url}`);
    } else {
      this.imageCache.clear();
    }
  }

  invalidateContentCache(pattern?: RegExp): void {
    if (pattern) {
      const keys = this.contentCache.getKeys(pattern);
      keys.forEach((key) => this.contentCache.delete(key));
    } else {
      this.contentCache.clear();
    }
  }

  // Invalidate portfolio cache when content changes
  invalidatePortfolioCache(): void {
    this.invalidateContentCache(/^portfolio:/);
  }

  // Get comprehensive cache statistics
  getCacheStats(): {
    markdown: ReturnType<MarkdownCacheManager["getStats"]>;
    tags: ReturnType<TagCacheManager["getStats"]>;
    images: ReturnType<ImageCacheManager["getStats"]>;
    content: ReturnType<EnhancedCacheManager["getStats"]>;
    total: {
      hits: number;
      misses: number;
      size: number;
      hitRate: number;
    };
  } {
    const markdownStats = this.markdownCache.getStats();
    const tagStats = this.tagCache.getStats();
    const imageStats = this.imageCache.getStats();
    const contentStats = this.contentCache.getStats();

    const totalHits =
      markdownStats.hits + tagStats.hits + imageStats.hits + contentStats.hits;
    const totalMisses =
      markdownStats.misses +
      tagStats.misses +
      imageStats.misses +
      contentStats.misses;
    const totalSize =
      markdownStats.size + tagStats.size + imageStats.size + contentStats.size;
    const totalRequests = totalHits + totalMisses;

    return {
      markdown: markdownStats,
      tags: tagStats,
      images: imageStats,
      content: contentStats,
      total: {
        hits: totalHits,
        misses: totalMisses,
        size: totalSize,
        hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      },
    };
  }

  // Preload commonly accessed data
  async preloadCommonData(): Promise<void> {
    try {
      // Check if tag list is cached
      if (!this.getTagList()) {
        console.log(
          "[Cache] Tag data not in cache - should be loaded externally",
        );
      }

      // Check if portfolio items are cached
      if (!this.getPortfolioItems()) {
        console.log(
          "[Cache] Portfolio data not in cache - should be loaded externally",
        );
      }
    } catch (error) {
      console.warn("[Cache] Failed to check preload status:", error);
    }
  }

  // Cache warming for specific content
  async warmCache(
    items: { id: string; markdownPath?: string; content?: string }[],
  ): Promise<void> {
    items.forEach((item) => {
      if (item.markdownPath && item.content) {
        this.setMarkdownContent(item.markdownPath, item.content);
      }
    });

    console.log(`[Cache] Warmed cache for ${items.length} items`);
  }

  // Cleanup and destroy all caches
  destroy(): void {
    this.markdownCache.destroy();
    this.tagCache.destroy();
    this.imageCache.destroy();
    this.contentCache.destroy();
  }
}

// Global cache instances
export const markdownCache = new MarkdownCacheManager();
export const tagCache = new TagCacheManager();
export const imageCache = new ImageCacheManager();
export const enhancedDataCache = new EnhancedDataCache();

// Cache cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    markdownCache.destroy();
    tagCache.destroy();
    imageCache.destroy();
    enhancedDataCache.destroy();
  });
}
