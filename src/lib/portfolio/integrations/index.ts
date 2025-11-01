// Integration classes for cross-page functionality

// Integration manager
export { PortfolioIntegrationManager } from "../integration-manager";
export type {
	ClientProject,
	Skill,
	TechnologyExperience,
} from "./about-integration";
export { AboutIntegration } from "./about-integration";
export type {
	AnalyticsEvent,
	AnalyticsReport,
	PortfolioAnalytics,
} from "./analytics-integration";
export { AnalyticsIntegration } from "./analytics-integration";

// Type exports
export type { PortfolioStats, UpdateInfo } from "./home-page-integration";
export { HomePageIntegration } from "./home-page-integration";
export type {
	SearchFilter,
	SearchIndex,
	SearchResult,
} from "./search-integration";
export { SearchIntegration } from "./search-integration";
export type {
	MetaTags,
	OpenGraphData,
	SitemapEntry,
	TwitterCardData,
} from "./seo-integration";
export { SEOIntegration } from "./seo-integration";
