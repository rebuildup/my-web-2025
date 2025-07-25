/**
 * Portfolio Components
 * Analytics and tracking components for portfolio section
 */

export { default as PortfolioAnalytics } from "./PortfolioAnalytics";
export { default as PortfolioAnalyticsDashboard } from "./PortfolioAnalyticsDashboard";
export { default as PortfolioInsights } from "./PortfolioInsights";
export { default as GoogleAnalytics } from "./GoogleAnalytics";

export {
  usePortfolioTracking,
  usePortfolioGalleryTracking,
  usePortfolioDetailTracking,
  usePortfolioItemTracking,
} from "./usePortfolioTracking";

export {
  trackPortfolioEvent,
  trackPortfolioPageView,
  trackPortfolioInteraction,
  trackPortfolioSearch,
  trackPortfolioPerformance,
  usePortfolioAnalytics,
} from "./GoogleAnalytics";

// Types for portfolio analytics
export interface PortfolioAnalyticsData {
  totalViews: number;
  totalDownloads: number;
  mostViewed: Array<{ id: string; views: number }>;
  mostDownloaded: Array<{ id: string; downloads: number }>;
}

export interface PortfolioInsightData {
  metric: string;
  value: number;
  change: number;
  trend: "up" | "down" | "stable";
  period: string;
  description: string;
}

export interface PortfolioTrackingOptions {
  contentId: string;
  contentType?: "portfolio" | "portfolio-gallery" | "portfolio-detail";
  trackViews?: boolean;
  trackDownloads?: boolean;
  debounceMs?: number;
}
