/**
 * Portfolio Data Manager
 * Task 1.2: データ処理パイプラインの統合管理
 */

import { ContentItem } from "@/types/content";
import {
  PortfolioDataProcessor,
  PortfolioContentItem,
  PortfolioStats,
  portfolioDataProcessor,
} from "./data-processor";
import { SEOMetadataGenerator, seoMetadataGenerator } from "./seo-generator";
import {
  PortfolioSearchIndexGenerator,
  PortfolioSearchIndex,
  SearchFilter,
  SearchStats,
  portfolioSearchIndexGenerator,
} from "./search-index";
import { testLogger } from "../utils/test-logger";

export interface DataCache {
  portfolioData: Map<string, PortfolioContentItem>;
  searchIndex: PortfolioSearchIndex[];
  searchFilters: SearchFilter[];
  searchStats: SearchStats;
  portfolioStats: PortfolioStats;
  lastUpdated: Date;
}

export interface ProcessingResult {
  success: boolean;
  data: PortfolioContentItem[];
  searchIndex: PortfolioSearchIndex[];
  stats: PortfolioStats;
  errors: string[];
  warnings: string[];
}

/**
 * Main Portfolio Data Manager
 * Coordinates all data processing, caching, and retrieval operations
 */
export class PortfolioDataManager {
  private cache: DataCache = {
    portfolioData: new Map(),
    searchIndex: [],
    searchFilters: [],
    searchStats: {
      totalItems: 0,
      categoryDistribution: {},
      technologyDistribution: {},
      yearDistribution: {},
    },
    portfolioStats: {
      totalProjects: 0,
      categoryCounts: {},
      technologyCounts: {},
      lastUpdate: new Date(),
    },
    lastUpdated: new Date(0),
  };

  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

  constructor(
    private dataProcessor: PortfolioDataProcessor = portfolioDataProcessor,
    private seoGenerator: SEOMetadataGenerator = seoMetadataGenerator,
    private searchIndexGenerator: PortfolioSearchIndexGenerator = portfolioSearchIndexGenerator
  ) {}

  /**
   * Process and cache portfolio data from raw ContentItem array
   */
  async processPortfolioData(
    rawData: ContentItem[]
  ): Promise<ProcessingResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      testLogger.log(
        `Starting portfolio data processing for ${rawData.length} items...`
      );

      // Process raw data through the pipeline
      const processedData = await this.dataProcessor.processRawData(rawData);
      testLogger.log(
        `Successfully processed ${processedData.length} portfolio items`
      );

      // Generate search index
      const searchIndex =
        this.searchIndexGenerator.generateSearchIndex(processedData);
      testLogger.log(
        `Generated search index with ${searchIndex.length} entries`
      );

      // Generate search filters and stats
      const searchFilters =
        this.searchIndexGenerator.generateSearchFilters(searchIndex);
      const searchStats =
        this.searchIndexGenerator.generateSearchStats(searchIndex);

      // Generate portfolio statistics
      const portfolioStats =
        await this.dataProcessor.generatePortfolioStats(processedData);

      // Update cache
      this.updateCache(
        processedData,
        searchIndex,
        searchFilters,
        searchStats,
        portfolioStats
      );

      testLogger.log("Portfolio data processing completed successfully");

      return {
        success: true,
        data: processedData,
        searchIndex,
        stats: portfolioStats,
        errors,
        warnings,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      errors.push(`Data processing failed: ${errorMessage}`);

      testLogger.error("Portfolio data processing failed:", error);

      return {
        success: false,
        data: [],
        searchIndex: [],
        stats: this.cache.portfolioStats,
        errors,
        warnings,
      };
    }
  }

  /**
   * Get processed portfolio data with caching
   */
  async getPortfolioData(
    forceRefresh: boolean = false
  ): Promise<PortfolioContentItem[]> {
    console.log("getPortfolioData called, forceRefresh:", forceRefresh);
    console.log("Cache valid:", this.isCacheValid());
    console.log("Cache size:", this.cache.portfolioData.size);

    if (!forceRefresh && this.isCacheValid()) {
      testLogger.log("Returning cached portfolio data");
      const cachedData = Array.from(this.cache.portfolioData.values());
      console.log("Cached data count:", cachedData.length);
      console.log(
        "Cached data statuses:",
        cachedData.map((item) => ({ id: item.id, status: item.status }))
      );
      // Filter for published items only for gallery display
      const publishedData = cachedData.filter(
        (item) => item.status === "published"
      );
      console.log("Published data count:", publishedData.length);
      return publishedData;
    }

    // Fetch fresh data from API
    console.log("Fetching fresh data from API...");
    const rawData = await this.fetchRawPortfolioData();
    console.log("Raw data fetched:", rawData.length, "items");
    console.log(
      "Raw data sample:",
      rawData.slice(0, 3).map((item) => ({
        id: item.id,
        status: item.status,
        title: item.title,
      }))
    );

    const result = await this.processPortfolioData(rawData);
    console.log("Processing result:", {
      success: result.success,
      dataCount: result.data.length,
    });

    if (result.success) {
      // Filter for published items only for gallery display
      const publishedData = result.data.filter(
        (item) => item.status === "published"
      );
      console.log(
        "Published data after processing:",
        publishedData.length,
        "items"
      );
      console.log(
        "Published items:",
        publishedData.map((item) => ({ id: item.id, title: item.title }))
      );
      return publishedData;
    } else {
      testLogger.warn("Failed to process fresh data");
      console.log("Processing errors:", result.errors);
      // Only return cached data if we have valid cache, otherwise return empty array
      if (this.cache.portfolioData.size > 0) {
        testLogger.warn("Returning cached data as fallback");
        const cachedData = Array.from(this.cache.portfolioData.values());
        // Filter for published items only for gallery display
        const publishedData = cachedData.filter(
          (item) => item.status === "published"
        );
        console.log("Fallback published data count:", publishedData.length);
        return publishedData;
      } else {
        testLogger.warn("No cached data available, returning empty array");
        return [];
      }
    }
  }

  /**
   * Get portfolio item by ID
   */
  async getPortfolioItem(id: string): Promise<PortfolioContentItem | null> {
    const data = await this.getPortfolioData();
    return data.find((item) => item.id === id) || null;
  }

  /**
   * Alias for getPortfolioItem - for integration compatibility
   */
  async getItemById(id: string): Promise<PortfolioContentItem | null> {
    return this.getPortfolioItem(id);
  }

  /**
   * Alias for getPortfolioData - for integration compatibility
   */
  async getAllItems(): Promise<PortfolioContentItem[]> {
    return this.getPortfolioData();
  }

  /**
   * Get all portfolio data including draft and archived items (for admin use)
   */
  async getAllPortfolioData(
    forceRefresh: boolean = false
  ): Promise<PortfolioContentItem[]> {
    if (!forceRefresh && this.isCacheValid()) {
      testLogger.log("Returning all cached portfolio data (including drafts)");
      return Array.from(this.cache.portfolioData.values());
    }

    // Fetch fresh data from API
    const rawData = await this.fetchRawPortfolioData();
    const result = await this.processPortfolioData(rawData);

    if (result.success) {
      return result.data; // Return all data without filtering
    } else {
      testLogger.warn("Failed to process fresh data");
      if (this.cache.portfolioData.size > 0) {
        testLogger.warn("Returning all cached data as fallback");
        return Array.from(this.cache.portfolioData.values());
      } else {
        testLogger.warn("No cached data available, returning empty array");
        return [];
      }
    }
  }

  /**
   * Alias for getPortfolioItemsByCategory - for integration compatibility
   */
  async getItemsByCategory(category: string): Promise<PortfolioContentItem[]> {
    return this.getPortfolioItemsByCategory(category);
  }

  /**
   * Clear cache - for integration compatibility
   */
  async clearCache(): Promise<void> {
    this.invalidateCache();
  }

  /**
   * Get portfolio items by category
   */
  async getPortfolioItemsByCategory(
    category: string
  ): Promise<PortfolioContentItem[]> {
    const data = await this.getPortfolioData();

    if (category === "all") {
      // Already filtered for published items in getPortfolioData
      return data;
    }

    // Already filtered for published items in getPortfolioData
    return data.filter((item) => item.category === category);
  }

  /**
   * Get search index
   */
  async getSearchIndex(): Promise<PortfolioSearchIndex[]> {
    if (!this.isCacheValid()) {
      await this.getPortfolioData(true); // Refresh data
    }
    return this.cache.searchIndex;
  }

  /**
   * Get search filters
   */
  async getSearchFilters(): Promise<SearchFilter[]> {
    if (!this.isCacheValid()) {
      await this.getPortfolioData(true); // Refresh data
    }
    return this.cache.searchFilters;
  }

  /**
   * Get portfolio statistics
   */
  async getPortfolioStats(): Promise<PortfolioStats> {
    if (!this.isCacheValid()) {
      await this.getPortfolioData(true); // Refresh data
    }
    return this.cache.portfolioStats;
  }

  /**
   * Get search statistics
   */
  async getSearchStats(): Promise<SearchStats> {
    if (!this.isCacheValid()) {
      await this.getPortfolioData(true); // Refresh data
    }
    return this.cache.searchStats;
  }

  /**
   * Search portfolio items
   */
  async searchPortfolioItems(
    query: string,
    options: {
      category?: string;
      technology?: string;
      year?: string;
      limit?: number;
    } = {}
  ) {
    const searchIndex = await this.getSearchIndex();

    // Apply additional filters
    let filteredIndex = searchIndex;

    if (options.category && options.category !== "all") {
      filteredIndex = filteredIndex.filter(
        (item) => item.category === options.category
      );
    }

    if (options.technology) {
      filteredIndex = filteredIndex.filter((item) =>
        item.technologies.some((tech) =>
          tech.toLowerCase().includes(options.technology!.toLowerCase())
        )
      );
    }

    if (options.year) {
      filteredIndex = filteredIndex.filter(
        (item) =>
          new Date(item.createdAt).getFullYear().toString() === options.year
      );
    }

    return this.searchIndexGenerator.searchPortfolioItems(
      query,
      filteredIndex,
      {
        limit: options.limit || 50,
        includeContent: true,
      }
    );
  }

  /**
   * Get featured projects for home page
   */
  async getFeaturedProjects(
    limit: number = 3
  ): Promise<PortfolioContentItem[]> {
    const data = await this.getPortfolioData();

    return data
      .filter((item) => item.status === "published") // Featured projects should only be published
      .sort((a, b) => {
        // Sort by priority first, then by update date
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return (
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
        );
      })
      .slice(0, limit);
  }

  /**
   * Get related items for a portfolio item
   */
  async getRelatedItems(
    itemId: string,
    limit: number = 3
  ): Promise<PortfolioContentItem[]> {
    const item = await this.getPortfolioItem(itemId);
    if (!item || !item.relatedItems) {
      return [];
    }

    const data = await this.getPortfolioData();
    const relatedItems = item.relatedItems
      .map((id: string) => data.find((item) => item.id === id))
      .filter(Boolean) as PortfolioContentItem[];

    return relatedItems.slice(0, limit);
  }

  /**
   * Generate sitemap entries
   */
  async generateSitemapEntries() {
    const data = await this.getPortfolioData();
    return this.seoGenerator.generateSitemapEntries(data);
  }

  /**
   * Invalidate cache
   */
  invalidateCache(): void {
    this.cache.lastUpdated = new Date(0);
    this.cache.portfolioData.clear();
    this.cache.searchIndex = [];
    this.cache.searchFilters = [];
    testLogger.log("Portfolio data cache invalidated");
  }

  /**
   * Get cache status
   */
  getCacheStatus(): {
    isValid: boolean;
    lastUpdated: Date;
    itemCount: number;
    searchIndexSize: number;
  } {
    return {
      isValid: this.isCacheValid(),
      lastUpdated: this.cache.lastUpdated,
      itemCount: this.cache.portfolioData.size,
      searchIndexSize: this.cache.searchIndex.length,
    };
  }

  /**
   * Private: Check if cache is valid
   */
  private isCacheValid(): boolean {
    const now = Date.now();
    const cacheAge = now - this.cache.lastUpdated.getTime();
    return cacheAge < this.CACHE_TTL && this.cache.portfolioData.size > 0;
  }

  /**
   * Private: Update cache with new data
   */
  private updateCache(
    data: PortfolioContentItem[],
    searchIndex: PortfolioSearchIndex[],
    searchFilters: SearchFilter[],
    searchStats: SearchStats,
    portfolioStats: PortfolioStats
  ): void {
    // Clear existing cache
    this.cache.portfolioData.clear();

    // Update portfolio data
    data.forEach((item) => {
      this.cache.portfolioData.set(item.id, item);
    });

    // Update other cache data
    this.cache.searchIndex = searchIndex;
    this.cache.searchFilters = searchFilters;
    this.cache.searchStats = searchStats;
    this.cache.portfolioStats = portfolioStats;
    this.cache.lastUpdated = new Date();

    testLogger.log(`Cache updated with ${data.length} items`);
  }

  /**
   * Private: Fetch raw portfolio data from API
   */
  private async fetchRawPortfolioData(): Promise<ContentItem[]> {
    try {
      // In production, try API first, then fallback to file
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL ||
        (typeof window !== "undefined"
          ? window.location.origin
          : "http://localhost:3000");

      // Add timestamp to prevent caching in development
      const timestamp =
        process.env.NODE_ENV === "development" ? `&_t=${Date.now()}` : "";

      const apiUrl = `${baseUrl}/api/content/portfolio?limit=100&status=all${timestamp}`;
      console.log("Fetching from API URL:", apiUrl);

      const response = await fetch(apiUrl, {
        next:
          process.env.NODE_ENV === "development"
            ? { revalidate: 0 } // No cache in development
            : { revalidate: 300 }, // 5 minutes cache in production
        cache:
          process.env.NODE_ENV === "development"
            ? "no-store" // No cache in development
            : "default", // Default cache in production
      });

      console.log("Portfolio API response status:", response.status);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      console.log("API response data count:", result.data?.length || 0);
      return result.data || [];
    } catch (error) {
      testLogger.error("Error fetching raw portfolio data from API:", error);
      testLogger.log("Falling back to file system data...");
      return await this.loadPortfolioFromFile();
    }
  }

  /**
   * Private: Load portfolio data from file system as fallback
   */
  private async loadPortfolioFromFile(): Promise<ContentItem[]> {
    try {
      const fs = await import("fs/promises");
      const path = await import("path");

      // Try multiple possible paths for different deployment environments
      const possiblePaths = [
        path.join(process.cwd(), "public/data/content/portfolio.json"),
        path.join(process.cwd(), "public", "data", "content", "portfolio.json"),
        path.join(__dirname, "../../../public/data/content/portfolio.json"),
        path.join(__dirname, "../../../../public/data/content/portfolio.json"),
        // Standalone build paths
        path.join(
          process.cwd(),
          ".next/standalone/public/data/content/portfolio.json"
        ),
        path.join(__dirname, "../../public/data/content/portfolio.json"),
        path.join(__dirname, "../../../public/data/content/portfolio.json"),
        // Vercel deployment paths
        path.join("/var/task/public/data/content/portfolio.json"),
        path.join("/tmp/public/data/content/portfolio.json"),
      ];

      let fileContent = "";
      let usedPath = "";

      for (const filePath of possiblePaths) {
        try {
          console.log("Trying to load portfolio data from:", filePath);
          fileContent = await fs.readFile(filePath, "utf-8");
          usedPath = filePath;
          console.log("Successfully loaded from:", filePath);
          break;
        } catch (pathError) {
          console.log(
            "Failed to load from:",
            filePath,
            pathError instanceof Error ? pathError.message : String(pathError)
          );
          continue;
        }
      }

      if (!fileContent) {
        throw new Error(
          "Could not find portfolio.json in any expected location"
        );
      }

      const data = JSON.parse(fileContent);

      // Return all data for processing - filtering will be done in getPortfolioData
      const allData = Array.isArray(data) ? data : [];

      testLogger.log(
        `Loaded ${allData.length} portfolio items from file system (${usedPath})`
      );
      console.log(
        `Loaded ${allData.length} portfolio items from file system (${usedPath})`
      );
      return allData;
    } catch (error) {
      testLogger.error("Error loading portfolio data from file:", error);
      console.error("Error loading portfolio data from file:", error);
      return [];
    }
  }
}

// Export singleton instance
export const portfolioDataManager = new PortfolioDataManager();
