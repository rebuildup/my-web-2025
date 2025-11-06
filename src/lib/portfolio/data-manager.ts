/**
 * Portfolio Data Manager
 * Task 1.2: データ処理パイプラインの統合管理
 */

import { loadContentByType } from "@/lib/data";
import type { ContentItem } from "@/types/content";
import { testLogger } from "../utils/test-logger";
import {
	type PortfolioContentItem,
	type PortfolioDataProcessor,
	type PortfolioStats,
	portfolioDataProcessor,
} from "./data-processor";
import {
	type PortfolioSearchIndex,
	type PortfolioSearchIndexGenerator,
	portfolioSearchIndexGenerator,
	type SearchFilter,
	type SearchStats,
} from "./search-index";
import {
	type SEOMetadataGenerator,
	seoMetadataGenerator,
} from "./seo-generator";

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
	private emptyBackoffUntil = 0; // throttle when no data fetched

	constructor(
		private dataProcessor: PortfolioDataProcessor = portfolioDataProcessor,
		private seoGenerator: SEOMetadataGenerator = seoMetadataGenerator,
		private searchIndexGenerator: PortfolioSearchIndexGenerator = portfolioSearchIndexGenerator,
	) {}

	/**
	 * Process and cache portfolio data from raw ContentItem array
	 */
	async processPortfolioData(
		rawData: ContentItem[],
	): Promise<ProcessingResult> {
		const errors: string[] = [];
		const warnings: string[] = [];

		try {
			testLogger.log(
				`Starting portfolio data processing for ${rawData.length} items...`,
			);

			// Process raw data through the pipeline
			const processedData = await this.dataProcessor.processRawData(rawData);
			testLogger.log(
				`Successfully processed ${processedData.length} portfolio items`,
			);

			// Generate search index
			const searchIndex =
				this.searchIndexGenerator.generateSearchIndex(processedData);
			testLogger.log(
				`Generated search index with ${searchIndex.length} entries`,
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
				portfolioStats,
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
		forceRefresh: boolean = false,
	): Promise<PortfolioContentItem[]> {
		// Backoff if we recently saw empty source to avoid tight loops in dev
		if (!forceRefresh && Date.now() < this.emptyBackoffUntil) {
			return [];
		}
		// Always try to return cached data first if available and not forcing refresh
		if (!forceRefresh && this.cache.portfolioData.size > 0) {
			testLogger.log("Returning cached portfolio data");
			const cachedData = Array.from(this.cache.portfolioData.values());
			// Filter for published items only for gallery display
			const publishedData = cachedData.filter(
				(item) => item.status === "published",
			);
			if (publishedData.length > 0) {
				return publishedData;
			}
		}

		// Fetch fresh data from API
		const rawData = await this.fetchRawPortfolioData();

		if (rawData.length === 0) {
			if (process.env.CMS_DEBUG === "1") {
				testLogger.warn("No raw data fetched, checking cache as fallback");
			}
			// throttle next attempts for 10s
			this.emptyBackoffUntil = Date.now() + 10_000;
			if (this.cache.portfolioData.size > 0) {
				const cachedData = Array.from(this.cache.portfolioData.values());
				const publishedData = cachedData.filter(
					(item) => item.status === "published",
				);
				return publishedData;
			}
			return [];
		}

		const result = await this.processPortfolioData(rawData);

		if (result.success) {
			// Filter for published items only for gallery display
			const publishedData = result.data.filter(
				(item) => item.status === "published",
			);
			testLogger.log(
				`Successfully processed ${publishedData.length} published items`,
			);
			return publishedData;
		} else {
			testLogger.warn("Failed to process fresh data");
			// Only return cached data if we have valid cache, otherwise return empty array
			if (this.cache.portfolioData.size > 0) {
				testLogger.warn("Returning cached data as fallback");
				const cachedData = Array.from(this.cache.portfolioData.values());
				// Filter for published items only for gallery display
				const publishedData = cachedData.filter(
					(item) => item.status === "published",
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
		forceRefresh: boolean = false,
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
		category: string,
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
		} = {},
	) {
		const searchIndex = await this.getSearchIndex();

		// Apply additional filters
		let filteredIndex = searchIndex;

		if (options.category && options.category !== "all") {
			filteredIndex = filteredIndex.filter(
				(item) => item.category === options.category,
			);
		}

		const techQuery = options.technology?.toLowerCase();
		if (techQuery) {
			filteredIndex = filteredIndex.filter((item) =>
				item.technologies.some((tech) =>
					tech.toLowerCase().includes(techQuery),
				),
			);
		}

		if (options.year) {
			filteredIndex = filteredIndex.filter(
				(item) =>
					new Date(item.createdAt).getFullYear().toString() === options.year,
			);
		}

		return this.searchIndexGenerator.searchPortfolioItems(
			query,
			filteredIndex,
			{
				limit: options.limit || 50,
				includeContent: true,
			},
		);
	}

	/**
	 * Get featured projects for home page
	 */
	async getFeaturedProjects(
		limit: number = 3,
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
		limit: number = 3,
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
		portfolioStats: PortfolioStats,
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
		// In test environment, prefer hitting the API to satisfy fetch-based tests
		if (typeof fetch !== "undefined" && process.env.NODE_ENV === "test") {
			try {
				const response = await fetch("/api/content/by-type/portfolio", {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				} as RequestInit);
				if (response && "ok" in response && (response as Response).ok) {
					const data = (await (response as Response).json()) as ContentItem[];
					return Array.isArray(data) ? data : [];
				}
			} catch (error) {
				testLogger.warn(
					"Fetch to /api/content/by-type/portfolio failed in tests, falling back to SQLite",
					error,
				);
			}
		}

		try {
			const items = await loadContentByType("portfolio");
			return items;
		} catch (error) {
			testLogger.error(
				"Failed to load portfolio content from SQLite backend",
				error,
			);
			return [];
		}
	}
}

// Export singleton instance
export const portfolioDataManager = new PortfolioDataManager();
