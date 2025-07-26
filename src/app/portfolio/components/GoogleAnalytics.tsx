"use client";

import { useEffect } from "react";
import Script from "next/script";

interface GoogleAnalyticsProps {
  measurementId?: string;
  enabled?: boolean;
  debugMode?: boolean;
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export default function GoogleAnalytics({
  measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  enabled = process.env.NODE_ENV === "production",
  debugMode = process.env.NODE_ENV === "development",
}: GoogleAnalyticsProps) {
  useEffect(() => {
    if (!enabled || !measurementId) {
      return;
    }

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];

    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }

    window.gtag = gtag;

    // Configure Google Analytics
    gtag("js", new Date());
    gtag("config", measurementId, {
      // Privacy-compliant settings
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_flags: "SameSite=None;Secure",
      debug_mode: debugMode,
    });

    if (debugMode) {
      console.log("Google Analytics initialized:", measurementId);
    }
  }, [measurementId, enabled, debugMode]);

  if (!enabled || !measurementId) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
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
    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
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
