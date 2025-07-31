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
  type PortfolioStats,
  type ValidationError,
  type ValidationResult,
  type ValidationWarning,
} from "./data-processor";

// SEO generator
export {
  SEOMetadataGenerator,
  seoMetadataGenerator,
  type OpenGraphData,
  type PageMetadata,
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

// Integration manager
export { PortfolioIntegrationManager } from "./integration-manager";

// Tag management system
export {
  createTagManager,
  PortfolioTagManager,
  portfolioTagManager,
} from "./tag-management";

// Integration classes
export {
  AboutIntegration,
  AnalyticsIntegration,
  HomePageIntegration,
  SearchIntegration,
  SEOIntegration,
  type AnalyticsEvent,
  type AnalyticsReport,
  type ClientProject,
  type PortfolioStats as HomePortfolioStats,
  type OpenGraphData as IntegrationOpenGraphData,
  type SearchFilter as IntegrationSearchFilter,
  type TwitterCardData as IntegrationTwitterCardData,
  type MetaTags,
  type PortfolioAnalytics,
  type SearchIndex,
  type SearchResult,
  type SitemapEntry,
  type Skill,
  type TechnologyExperience,
  type UpdateInfo,
} from "./integrations";

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

// Integration manager instance
import { PortfolioIntegrationManager } from "./integration-manager";
const portfolioIntegrationManager = new PortfolioIntegrationManager(
  portfolioDataManager,
);

// Integration convenience functions
export const portfolioIntegrations = {
  /**
   * Initialize all integrations
   */
  async initialize() {
    return portfolioIntegrationManager.initialize();
  },

  /**
   * Get home page integration data
   */
  async getHomePageData() {
    return portfolioIntegrationManager.homePage.getHomePageData();
  },

  /**
   * Search portfolio items with filters
   */
  async searchWithFilters(
    query: string,
    filters: Array<{ type: string; value: string }> = [],
  ) {
    return portfolioIntegrationManager.search.searchPortfolioItems(
      query,
      filters,
    );
  },

  /**
   * Get search filters
   */
  async getSearchFilters() {
    return portfolioIntegrationManager.search.getSearchFilters();
  },

  /**
   * Get skills extracted from projects
   */
  async getSkills() {
    return portfolioIntegrationManager.about.extractSkillsFromProjects();
  },

  /**
   * Get client work examples
   */
  async getClientWork() {
    return portfolioIntegrationManager.about.getClientWorkExamples();
  },

  /**
   * Generate sitemap for Next.js
   */
  async generateNextSitemap() {
    return portfolioIntegrationManager.seo.generateNextSitemap();
  },

  /**
   * Generate meta tags for page
   */
  async generateMetaTags(pageType: string, data: Record<string, unknown>) {
    return portfolioIntegrationManager.seo.updateMetaTags(pageType, data);
  },

  /**
   * Track portfolio analytics event
   */
  trackView(itemId: string, additionalData?: Record<string, unknown>) {
    return portfolioIntegrationManager.analytics.trackPortfolioView(
      itemId,
      additionalData,
    );
  },

  /**
   * Track gallery interaction
   */
  trackGalleryInteraction(
    galleryType: string,
    action: string,
    itemId?: string,
  ) {
    return portfolioIntegrationManager.analytics.trackGalleryInteraction(
      galleryType,
      action,
      itemId,
    );
  },

  /**
   * Get analytics report
   */
  async getAnalyticsReport(startDate?: Date, endDate?: Date) {
    return portfolioIntegrationManager.analytics.generatePortfolioReport(
      startDate,
      endDate,
    );
  },

  /**
   * Get dashboard data
   */
  async getDashboardData() {
    return portfolioIntegrationManager.getDashboardData();
  },

  /**
   * Get integration data for specific item
   */
  async getItemIntegrationData(itemId: string) {
    return portfolioIntegrationManager.getItemIntegrationData(itemId);
  },

  /**
   * Refresh all integrations
   */
  async refreshAll() {
    return portfolioIntegrationManager.refreshAllIntegrations();
  },

  /**
   * Health check for all integrations
   */
  async healthCheck() {
    return portfolioIntegrationManager.healthCheck();
  },
};
