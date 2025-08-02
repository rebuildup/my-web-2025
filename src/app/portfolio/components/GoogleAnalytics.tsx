"use client";

import {
  GA_CONFIG,
  initializeGoogleAnalytics,
} from "@/lib/analytics/ga-config";
import Script from "next/script";
import { useEffect } from "react";

interface GoogleAnalyticsProps {
  measurementId?: string;
  enabled?: boolean;
  debugMode?: boolean;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export default function GoogleAnalytics({
  measurementId = GA_CONFIG.MEASUREMENT_ID,
  enabled = true, // 常に有効にする
  debugMode = GA_CONFIG.DEBUG_MODE,
}: GoogleAnalyticsProps) {
  useEffect(() => {
    if (!enabled || !measurementId) {
      console.warn(
        "Google Analytics: 設定が無効またはmeasurementIdが設定されていません",
      );
      return;
    }

    // Google Analytics初期化
    initializeGoogleAnalytics();
  }, [measurementId, enabled, debugMode]);

  if (!enabled || !measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Google Analytics script loaded successfully");
        }}
        onError={(e) => {
          console.error("Google Analytics script failed to load:", e);
        }}
      />
    </>
  );
}

/**
 * Track portfolio-specific events
 */
export const trackPortfolioEvent = (
  action: string,
  category: string = "Portfolio",
  label?: string,
  value?: number,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
      custom_map: {
        dimension1: "portfolio_section",
      },
    });
    console.log(`Tracked event: ${action}`, { category, label, value });
  } else {
    console.warn("Google Analytics gtag not available");
  }
};

/**
 * Track portfolio page views
 */
export const trackPortfolioPageView = (
  pagePath: string,
  pageTitle: string,
  contentId?: string,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", GA_CONFIG.MEASUREMENT_ID, {
      page_path: pagePath,
      page_title: pageTitle,
      custom_map: {
        dimension1: "portfolio_section",
        dimension2: contentId || "unknown",
      },
    });

    // Track as custom event
    window.gtag("event", "page_view", {
      event_category: "Portfolio",
      event_label: contentId || pagePath,
      custom_map: {
        dimension1: "portfolio_section",
        dimension2: contentId || "unknown",
      },
    });
    console.log(`Tracked page view: ${pagePath}`, { pageTitle, contentId });
  } else {
    console.warn("Google Analytics gtag not available for page view tracking");
  }
};

/**
 * Track portfolio interactions
 */
export const trackPortfolioInteraction = (
  interactionType: "view" | "download" | "share" | "like",
  contentId: string,
  contentType: "portfolio" | "gallery" | "detail" = "portfolio",
) => {
  trackPortfolioEvent(
    `portfolio_${interactionType}`,
    "Portfolio Engagement",
    `${contentType}_${contentId}`,
    1,
  );
};

/**
 * Track portfolio search
 */
export const trackPortfolioSearch = (
  searchTerm: string,
  resultsCount: number,
  searchType: "simple" | "detailed" = "simple",
) => {
  trackPortfolioEvent(
    "portfolio_search",
    "Portfolio Search",
    searchTerm,
    resultsCount,
  );

  // Additional search tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "search", {
      search_term: searchTerm,
      content_type: "portfolio",
      custom_map: {
        dimension1: "portfolio_section",
        dimension3: searchType,
      },
    });
  }
};

/**
 * Track portfolio performance metrics
 */
export const trackPortfolioPerformance = (
  metricName: string,
  value: number,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "timing_complete", {
      name: metricName,
      value: value,
      event_category: "Portfolio Performance",
      custom_map: {
        dimension1: "portfolio_section",
      },
    });
  }
};

/**
 * Hook for portfolio analytics tracking
 */
export function usePortfolioAnalytics() {
  return {
    trackPageView: trackPortfolioPageView,
    trackEvent: trackPortfolioEvent,
    trackInteraction: trackPortfolioInteraction,
    trackSearch: trackPortfolioSearch,
    trackPerformance: trackPortfolioPerformance,
  };
}
