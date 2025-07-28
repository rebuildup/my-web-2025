/**
 * Portfolio Error Handling and Recovery System
 * Handles errors gracefully with fallback strategies
 */

import type { PortfolioContentItem, GalleryItem } from "@/types/portfolio";
import { PortfolioDataCache } from "./cache-manager";
import { testLogger } from "../utils/test-logger";

export class PortfolioErrorHandler {
  private cache: PortfolioDataCache;

  constructor() {
    this.cache = PortfolioDataCache.getInstance();
  }

  /**
   * Handle data errors with fallback strategies
   */
  async handleDataError(error: Error, context: string): Promise<unknown> {
    testLogger.error(`Portfolio data error in ${context}:`, error);

    // Report error for monitoring
    this.reportError(error, context);

    // Apply fallback strategy based on context
    switch (context) {
      case "gallery":
        return this.getFallbackGalleryData();
      case "detail":
        return this.getFallbackDetailData();
      case "search":
        return this.getFallbackSearchData();
      case "stats":
        return this.getFallbackStatsData();
      case "api":
        return this.getFallbackApiData();
      default:
        return null;
    }
  }

  /**
   * Handle API errors with retry logic
   */
  async handleApiError(
    error: Error,
    endpoint: string,
    retryCount: number = 0,
    maxRetries: number = 3,
  ): Promise<unknown> {
    testLogger.error(
      `API error for ${endpoint} (attempt ${retryCount + 1}):`,
      error,
    );

    if (retryCount < maxRetries) {
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await this.sleep(delay);

      try {
        // Retry the API call
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      } catch (retryError) {
        return this.handleApiError(
          retryError as Error,
          endpoint,
          retryCount + 1,
          maxRetries,
        );
      }
    }

    // Max retries reached, use fallback
    return this.handleDataError(error, "api");
  }

  /**
   * Handle image loading errors
   */
  handleImageError(imageSrc: string, fallbackSrc?: string): string {
    testLogger.warn(`Image loading failed: ${imageSrc}`);

    // Return fallback image or default placeholder
    return fallbackSrc || "/images/portfolio/placeholder.jpg";
  }

  /**
   * Handle video embedding errors
   */
  handleVideoError(
    videoUrl: string,
    videoType: string,
  ): {
    fallbackUrl?: string;
    errorMessage: string;
    showFallback: boolean;
  } {
    testLogger.warn(`Video embedding failed: ${videoUrl} (${videoType})`);

    return {
      fallbackUrl: "/images/portfolio/video-placeholder.jpg",
      errorMessage: "動画の読み込みに失敗しました",
      showFallback: true,
    };
  }

  /**
   * Handle WebGL errors
   */
  handleWebGLError(
    error: Error,
    experimentId: string,
  ): {
    fallbackComponent: string;
    errorMessage: string;
    showFallback: boolean;
  } {
    testLogger.error(`WebGL error in experiment ${experimentId}:`, error);

    return {
      fallbackComponent: "WebGLFallback",
      errorMessage: "WebGLがサポートされていないか、エラーが発生しました",
      showFallback: true,
    };
  }

  /**
   * Validate data integrity and handle corruption
   */
  validateAndRecover<T>(
    data: T,
    validator: (data: T) => boolean,
    fallbackProvider: () => T,
  ): T {
    try {
      if (validator(data)) {
        return data;
      } else {
        testLogger.warn("Data validation failed, using fallback");
        return fallbackProvider();
      }
    } catch (error) {
      testLogger.error("Data validation error:", error);
      return fallbackProvider();
    }
  }

  /**
   * Report errors to monitoring system
   */
  private reportError(error: Error, context: string): void {
    // In a real application, this would send to error monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "server",
      url: typeof window !== "undefined" ? window.location.href : "server",
    };

    // Log to console for development
    testLogger.error("Error Report:", errorReport);

    // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
    // this.sendToMonitoring(errorReport);
  }

  /**
   * Get fallback gallery data from cache or minimal data
   */
  private async getFallbackGalleryData(): Promise<GalleryItem[]> {
    try {
      // Try to recover from cache
      const cached = await this.tryRecoverFromCache("portfolio:data");
      if (cached && Array.isArray(cached)) {
        return this.transformToGalleryItems(cached);
      }
    } catch (cacheError) {
      testLogger.warn("Cache recovery failed:", cacheError);
    }

    // Return minimal fallback data
    return this.getMinimalGalleryData();
  }

  /**
   * Get fallback detail data
   */
  private async getFallbackDetailData(): Promise<PortfolioContentItem | null> {
    try {
      // Try to recover from cache
      const cached = await this.tryRecoverFromCache("portfolio:data");
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached[0];
      }
    } catch (cacheError) {
      testLogger.warn("Cache recovery failed:", cacheError);
    }

    // Return minimal fallback item
    return this.getMinimalPortfolioItem();
  }

  /**
   * Get fallback search data
   */
  private async getFallbackSearchData(): Promise<unknown[]> {
    try {
      // Try to recover from cache
      const cached = await this.tryRecoverFromCache("portfolio:search-index");
      if (cached && Array.isArray(cached)) {
        return cached;
      }
    } catch (cacheError) {
      console.warn("Cache recovery failed:", cacheError);
    }

    return [];
  }

  /**
   * Get fallback stats data
   */
  private async getFallbackStatsData(): Promise<unknown> {
    try {
      // Try to recover from cache
      const cached = await this.tryRecoverFromCache("portfolio:stats");
      if (cached) {
        return cached;
      }
    } catch (cacheError) {
      testLogger.warn("Cache recovery failed:", cacheError);
    }

    return {
      totalProjects: 0,
      categoryCounts: {},
      technologyCounts: {},
      lastUpdate: new Date(),
    };
  }

  /**
   * Get fallback API data
   */
  private async getFallbackApiData(): Promise<unknown[]> {
    return this.getFallbackGalleryData();
  }

  /**
   * Try to recover data from cache
   */
  private async tryRecoverFromCache(key: string): Promise<unknown> {
    try {
      // Check if cache has the key (even if expired)
      const cached = this.cache["cache"].get(key);
      if (cached) {
        testLogger.log(`Recovered data from cache: ${key}`);
        return cached;
      }
    } catch (error) {
      testLogger.warn(`Cache recovery failed for ${key}:`, error);
    }
    return null;
  }

  /**
   * Transform cached data to gallery items
   */
  private transformToGalleryItems(data: PortfolioContentItem[]): GalleryItem[] {
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      thumbnail: item.thumbnail || "/images/portfolio/placeholder.jpg",
      category: item.category,
      tags: item.tags || [],
      url: `/portfolio/${item.id}`,
    }));
  }

  /**
   * Get minimal gallery data as last resort
   */
  private getMinimalGalleryData(): GalleryItem[] {
    return [
      {
        id: "fallback-1",
        title: "ポートフォリオを読み込み中...",
        description:
          "データの読み込みに時間がかかっています。しばらくお待ちください。",
        thumbnail: "/images/portfolio/placeholder.jpg",
        category: "システム",
        tags: ["loading"],
        url: "#",
      },
    ];
  }

  /**
   * Get minimal portfolio item as last resort
   */
  private getMinimalPortfolioItem(): PortfolioContentItem {
    return {
      id: "fallback-item",
      type: "portfolio",
      title: "データを読み込み中...",
      description: "ポートフォリオデータの読み込みに時間がかかっています。",
      category: "システム",
      tags: ["loading"],
      status: "published",
      priority: 50,
      createdAt: new Date().toISOString(),
      thumbnail: "/images/portfolio/placeholder.jpg",
      technologies: [],
      seo: {
        title: "データを読み込み中... - samuido",
        description: "ポートフォリオデータの読み込み中です。",
        keywords: ["loading", "portfolio"],
        ogImage: "/images/og-default.jpg",
        twitterImage: "/images/twitter-default.jpg",
        canonical: "https://yusuke-kim.com/portfolio",
        structuredData: {},
      },
    };
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Check if error is recoverable
   */
  isRecoverableError(error: Error): boolean {
    const recoverableErrors = [
      "NetworkError",
      "TimeoutError",
      "AbortError",
      "TypeError", // Often network-related
    ];

    return recoverableErrors.some(
      (errorType) =>
        error.name === errorType || error.message.includes(errorType),
    );
  }

  /**
   * Get error severity level
   */
  getErrorSeverity(
    error: Error,
    context: string,
  ): "low" | "medium" | "high" | "critical" {
    // Critical errors that break core functionality
    if (context === "api" && error.message.includes("500")) {
      return "critical";
    }

    // High severity errors that affect user experience
    if (context === "gallery" || context === "detail") {
      return "high";
    }

    // Medium severity errors that have fallbacks
    if (context === "search" || context === "stats") {
      return "medium";
    }

    // Low severity errors (images, videos, etc.)
    return "low";
  }

  /**
   * Create error boundary component props
   */
  createErrorBoundaryProps(context: string) {
    return {
      fallback: () => {
        return {
          type: "div",
          props: {
            className: "error-fallback",
            children: [
              { type: "h3", props: { children: "エラーが発生しました" } },
              {
                type: "p",
                props: {
                  children:
                    "データの読み込み中にエラーが発生しました。ページを再読み込みしてください。",
                },
              },
              {
                type: "button",
                props: {
                  onClick: () => window.location.reload(),
                  children: "再読み込み",
                },
              },
            ],
          },
        };
      },
      onError: (error: Error) => {
        this.handleDataError(error, context);
      },
    };
  }
}
