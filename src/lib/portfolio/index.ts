/**
 * Portfolio Data Processing Pipeline - Main Export
 * Task 1.2: データ処理パイプラインの構築
 */

import { ContentItem } from "@/types/content";

// Main data manager
export {
  PortfolioDataManager,
  portfolioDataManager,
  type DataCache,
  type ProcessingResult,
} from "./data-manager";

// Data processor
export {
  PortfolioDataProcessor,
  portfolioDataProcessor,
  type PortfolioContentItem,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type PortfolioStats,
} from "./data-processor";

// SEO generator
export {
  SEOMetadataGenerator,
  seoMetadataGenerator,
  type PageMetadata,
  type OpenGraphData,
  type TwitterCardData,
} from "./seo-generator";

// Search index generator
export {
  PortfolioSearchIndexGenerator,
  portfolioSearchIndexGenerator,
  type PortfolioSearchIndex,
  type SearchFilter,
  type SearchStats,
} from "./search-index";

// Import singleton instances for convenience functions
import { portfolioDataManager } from "./data-manager";
import { seoMetadataGenerator } from "./seo-generator";

// Convenience functions for common operations
export const portfolioDataPipeline = {
  /**
   * Process raw portfolio data through the complete pipeline
   */
  async processData(rawData: ContentItem[]) {
    return portfolioDataManager.processPortfolioData(rawData);
  },

  /**
   * Get processed portfolio data with caching
   */
  async getData(forceRefresh = false) {
    return portfolioDataManager.getPortfolioData(forceRefresh);
  },

  /**
   * Get portfolio item by ID
   */
  async getItem(id: string) {
    return portfolioDataManager.getPortfolioItem(id);
  },

  /**
   * Get items by category
   */
  async getItemsByCategory(category: string) {
    return portfolioDataManager.getPortfolioItemsByCategory(category);
  },

  /**
   * Search portfolio items
   */
  async search(query: string, options = {}) {
    return portfolioDataManager.searchPortfolioItems(query, options);
  },

  /**
   * Get featured projects
   */
  async getFeatured(limit = 3) {
    return portfolioDataManager.getFeaturedProjects(limit);
  },

  /**
   * Get portfolio statistics
   */
  async getStats() {
    return portfolioDataManager.getPortfolioStats();
  },

  /**
   * Generate SEO metadata for gallery page
   */
  generateGalleryMetadata(galleryType: string) {
    return seoMetadataGenerator.generateGalleryMetadata(galleryType);
  },

  /**
   * Generate SEO metadata for detail page
   */
  async generateDetailMetadata(itemId: string) {
    const item = await portfolioDataManager.getPortfolioItem(itemId);
    if (!item) return null;
    return seoMetadataGenerator.generateDetailMetadata(item);
  },

  /**
   * Generate sitemap entries
   */
  async generateSitemap() {
    return portfolioDataManager.generateSitemapEntries();
  },

  /**
   * Invalidate cache
   */
  invalidateCache() {
    portfolioDataManager.invalidateCache();
  },

  /**
   * Get cache status
   */
  getCacheStatus() {
    return portfolioDataManager.getCacheStatus();
  },
};
