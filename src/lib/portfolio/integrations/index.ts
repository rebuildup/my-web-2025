// Integration classes for cross-page functionality
export { HomePageIntegration } from "./home-page-integration";
export { SearchIntegration } from "./search-integration";
export { AboutIntegration } from "./about-integration";
export { SEOIntegration } from "./seo-integration";
export { AnalyticsIntegration } from "./analytics-integration";

// Type exports
export type { PortfolioStats, UpdateInfo } from "./home-page-integration";
export type {
  SearchIndex,
  SearchFilter,
  SearchResult,
} from "./search-integration";
export type {
  Skill,
  ClientProject,
  TechnologyExperience,
} from "./about-integration";
export type {
  SitemapEntry,
  MetaTags,
  OpenGraphData,
  TwitterCardData,
} from "./seo-integration";
export type {
  AnalyticsEvent,
  PortfolioAnalytics,
  AnalyticsReport,
} from "./analytics-integration";

// Integration manager
export { PortfolioIntegrationManager } from "../integration-manager";
