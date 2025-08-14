/**
 * Portfolio Cache Management System
 * Handles caching and synchronization of portfolio data
 */

import type {
  CategoryStats,
  PortfolioContentItem,
  PortfolioSearchIndex,
  PortfolioStats,
} from "@/types/portfolio";
import { testLogger } from "../utils/test-logger";

export class PortfolioCache {
  private cache = new Map<string, unknown>();
  private lastUpdate = new Map<string, Date>();
  private readonly DEFAULT_TTL = 3600000; // 1 hour in milliseconds

  /**
   * Get cached data or fetch fresh data
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<T> {
    const cached = this.cache.get(key);
    const lastUpdate = this.lastUpdate.get(key);

    if (cached && lastUpdate && Date.now() - lastUpdate.getTime() < ttl) {
      return cached as T;
    }

    const fresh = await fetcher();
    this.cache.set(key, fresh);
    this.lastUpdate.set(key, new Date());
    return fresh;
  }

  /**
   * Set cache data directly
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, data);
    this.lastUpdate.set(key, new Date());
  }

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern?: string): void {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          this.lastUpdate.delete(key);
        }
      }
    } else {
      this.cache.clear();
      this.lastUpdate.clear();
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    memoryUsage: number;
  } {
    const entries = Array.from(this.lastUpdate.values());
    const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length;

    return {
      totalEntries: this.cache.size,
      oldestEntry:
        entries.length > 0
          ? new Date(Math.min(...entries.map((d) => d.getTime())))
          : null,
      newestEntry:
        entries.length > 0
          ? new Date(Math.max(...entries.map((d) => d.getTime())))
          : null,
      memoryUsage,
    };
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(key: string, ttl: number = this.DEFAULT_TTL): boolean {
    const cached = this.cache.get(key);
    const lastUpdate = this.lastUpdate.get(key);

    return !!(cached && lastUpdate && Date.now() - lastUpdate.getTime() < ttl);
  }

  /**
   * Clear expired entries
   */
  clearExpired(ttl: number = this.DEFAULT_TTL): number {
    let cleared = 0;
    const now = Date.now();

    for (const [key, updateTime] of this.lastUpdate.entries()) {
      if (now - updateTime.getTime() > ttl) {
        this.cache.delete(key);
        this.lastUpdate.delete(key);
        cleared++;
      }
    }

    return cleared;
  }
}

/**
 * Portfolio-specific data cache with typed methods
 */
export class PortfolioDataCache extends PortfolioCache {
  private static instance: PortfolioDataCache;

  static getInstance(): PortfolioDataCache {
    if (!PortfolioDataCache.instance) {
      PortfolioDataCache.instance = new PortfolioDataCache();
    }
    return PortfolioDataCache.instance;
  }

  /**
   * Cache portfolio data
   */
  async getPortfolioData(
    fetcher: () => Promise<PortfolioContentItem[]>,
  ): Promise<PortfolioContentItem[]> {
    return this.get("portfolio:data", fetcher, 3600000); // 1 hour TTL
  }

  /**
   * Cache search index
   */
  async getSearchIndex(
    fetcher: () => Promise<PortfolioSearchIndex[]>,
  ): Promise<PortfolioSearchIndex[]> {
    return this.get("portfolio:search-index", fetcher, 43200000); // 12 hours TTL
  }

  /**
   * Cache category statistics
   */
  async getCategoryStats(
    fetcher: () => Promise<CategoryStats>,
  ): Promise<CategoryStats> {
    return this.get("portfolio:category-stats", fetcher, 3600000); // 1 hour TTL
  }

  /**
   * Cache portfolio statistics
   */
  async getPortfolioStats(
    fetcher: () => Promise<PortfolioStats>,
  ): Promise<PortfolioStats> {
    return this.get("portfolio:stats", fetcher, 3600000); // 1 hour TTL
  }

  /**
   * Cache gallery data by type
   */
  async getGalleryData(
    galleryType: string,
    fetcher: () => Promise<unknown[]>,
  ): Promise<unknown[]> {
    return this.get(`portfolio:gallery:${galleryType}`, fetcher, 1800000); // 30 minutes TTL
  }

  /**
   * Cache individual portfolio item
   */
  async getPortfolioItem(
    itemId: string,
    fetcher: () => Promise<PortfolioContentItem | null>,
  ): Promise<PortfolioContentItem | null> {
    return this.get(`portfolio:item:${itemId}`, fetcher, 3600000); // 1 hour TTL
  }

  /**
   * Update cache when portfolio data changes
   */
  updatePortfolioData(data: PortfolioContentItem[]): void {
    this.set("portfolio:data", data);

    // Invalidate related caches
    this.invalidate("portfolio:gallery:");
    this.invalidate("portfolio:search-index");
    this.invalidate("portfolio:stats");
    this.invalidate("portfolio:category-stats");
  }

  /**
   * Update individual portfolio item cache
   */
  updatePortfolioItem(item: PortfolioContentItem): void {
    this.set(`portfolio:item:${item.id}`, item);

    // Invalidate related caches
    this.invalidate("portfolio:data");
    this.invalidate("portfolio:gallery:");
    this.invalidate("portfolio:search-index");
    this.invalidate("portfolio:stats");
  }

  /**
   * Remove portfolio item from cache
   */
  removePortfolioItem(itemId: string): void {
    this.invalidate(`portfolio:item:${itemId}`);

    // Invalidate related caches
    this.invalidate("portfolio:data");
    this.invalidate("portfolio:gallery:");
    this.invalidate("portfolio:search-index");
    this.invalidate("portfolio:stats");
  }

  /**
   * Sync cache with API
   */
  async syncWithAPI(): Promise<void> {
    try {
      // Clear all portfolio-related cache
      this.invalidate("portfolio:");

      // Trigger fresh data fetch on next access
      testLogger.log("Portfolio cache synchronized with API");
    } catch (error) {
      testLogger.error("Failed to sync portfolio cache with API:", error);
      throw error;
    }
  }

  /**
   * Preload critical portfolio data
   */
  async preloadCriticalData(): Promise<void> {
    try {
      // Preload portfolio data
      await this.getPortfolioData(async () => {
        const response = await fetch("/api/content/by-type/portfolio");
        if (!response.ok) throw new Error("Failed to fetch portfolio data");
        return response.json();
      });

      // Preload category stats
      await this.getCategoryStats(async () => {
        const data = await this.get("portfolio:data", async () => []);
        return this.calculateCategoryStats(data);
      });

      testLogger.log("Critical portfolio data preloaded");
    } catch (error) {
      testLogger.error("Failed to preload critical portfolio data:", error);
    }
  }

  /**
   * Calculate category statistics from portfolio data
   */
  private calculateCategoryStats(data: PortfolioContentItem[]): CategoryStats {
    const stats: CategoryStats = {
      all: data.length,
      develop: 0,
      video: 0,
      "video&design": 0,
    };

    data.forEach((item) => {
      if (
        item.projectType &&
        ["web", "game", "tool", "plugin"].includes(item.projectType)
      ) {
        stats.develop++;
      }
      if (
        item.videoType &&
        ["mv", "lyric", "animation", "promotion"].includes(item.videoType)
      ) {
        stats.video++;
      }
      if (
        item.category.toLowerCase().includes("design") ||
        item.tags.some((tag) =>
          ["design", "motion", "graphics"].includes(tag.toLowerCase()),
        )
      ) {
        stats["video&design"]++;
      }
    });

    return stats;
  }

  /**
   * Get cache health status
   */
  getHealthStatus(): {
    status: "healthy" | "warning" | "error";
    message: string;
    stats: ReturnType<PortfolioCache["getStats"]>;
  } {
    const stats = this.getStats();

    if (stats.memoryUsage > 10 * 1024 * 1024) {
      // 10MB
      return {
        status: "warning",
        message: "Cache memory usage is high",
        stats,
      };
    }

    if (stats.totalEntries === 0) {
      return {
        status: "warning",
        message: "Cache is empty",
        stats,
      };
    }

    return {
      status: "healthy",
      message: "Cache is operating normally",
      stats,
    };
  }
}
