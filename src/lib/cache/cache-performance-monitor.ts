/**
 * Cache Performance Monitor
 * Monitors cache performance and provides optimization recommendations
 */

import { enhancedDataCache } from "./EnhancedCacheManager";

export interface CachePerformanceMetrics {
  timestamp: number;
  hitRate: number;
  totalRequests: number;
  cacheSize: number;
  memoryUsage: number;
  averageResponseTime: number;
  slowQueries: Array<{
    key: string;
    responseTime: number;
    timestamp: number;
  }>;
}

export interface CacheOptimizationRecommendation {
  type:
    | "increase_ttl"
    | "decrease_ttl"
    | "increase_size"
    | "preload_data"
    | "cleanup_unused";
  priority: "high" | "medium" | "low";
  description: string;
  impact: string;
  implementation: string;
}

export class CachePerformanceMonitor {
  private metrics: CachePerformanceMetrics[] = [];
  private maxMetricsHistory = 100;
  private performanceThresholds = {
    minHitRate: 0.8, // 80% minimum hit rate
    maxResponseTime: 100, // 100ms maximum response time
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB maximum memory usage
  };
  private queryTimes = new Map<string, number>();

  constructor() {
    // Start periodic monitoring
    this.startPeriodicMonitoring();
  }

  /**
   * Start periodic performance monitoring
   */
  private startPeriodicMonitoring(): void {
    // Monitor every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Generate recommendations every 5 minutes
    setInterval(
      () => {
        this.generateRecommendations();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Collect current cache performance metrics
   */
  collectMetrics(): CachePerformanceMetrics {
    const stats = enhancedDataCache.getCacheStats();
    const timestamp = Date.now();

    // Calculate memory usage (approximate)
    const memoryUsage = this.estimateMemoryUsage();

    // Get slow queries from the last period
    const slowQueries = this.getSlowQueries();

    const metrics: CachePerformanceMetrics = {
      timestamp,
      hitRate: stats.total.hitRate,
      totalRequests: stats.total.hits + stats.total.misses,
      cacheSize: stats.total.size,
      memoryUsage,
      averageResponseTime: this.calculateAverageResponseTime(),
      slowQueries,
    };

    // Store metrics
    this.metrics.push(metrics);
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Log performance warnings
    this.checkPerformanceThresholds(metrics);

    return metrics;
  }

  /**
   * Track query performance
   */
  startQueryTimer(key: string): void {
    this.queryTimes.set(key, Date.now());
  }

  endQueryTimer(key: string): number {
    const startTime = this.queryTimes.get(key);
    if (!startTime) return 0;

    const responseTime = Date.now() - startTime;
    this.queryTimes.delete(key);

    // Track slow queries
    if (responseTime > this.performanceThresholds.maxResponseTime) {
      console.warn(
        `[CacheMonitor] Slow query detected: ${key} (${responseTime}ms)`,
      );
    }

    return responseTime;
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): CachePerformanceMetrics | null {
    return this.metrics.length > 0
      ? this.metrics[this.metrics.length - 1]
      : null;
  }

  /**
   * Get historical metrics
   */
  getHistoricalMetrics(limit?: number): CachePerformanceMetrics[] {
    const metrics = [...this.metrics];
    return limit ? metrics.slice(-limit) : metrics;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(): CacheOptimizationRecommendation[] {
    const recommendations: CacheOptimizationRecommendation[] = [];
    const currentMetrics = this.getCurrentMetrics();

    if (!currentMetrics) return recommendations;

    // Low hit rate recommendation
    if (currentMetrics.hitRate < this.performanceThresholds.minHitRate) {
      recommendations.push({
        type: "increase_ttl",
        priority: "high",
        description: `Cache hit rate is low (${(currentMetrics.hitRate * 100).toFixed(1)}%)`,
        impact:
          "Increasing TTL will keep data cached longer, improving hit rates",
        implementation:
          "Consider increasing TTL for frequently accessed data types",
      });

      recommendations.push({
        type: "preload_data",
        priority: "medium",
        description: "Consider preloading frequently accessed data",
        impact: "Preloading will improve initial response times and hit rates",
        implementation: "Implement cache warming strategies for common queries",
      });
    }

    // High memory usage recommendation
    if (
      currentMetrics.memoryUsage > this.performanceThresholds.maxMemoryUsage
    ) {
      recommendations.push({
        type: "cleanup_unused",
        priority: "high",
        description: `High memory usage detected (${Math.round(currentMetrics.memoryUsage / 1024 / 1024)}MB)`,
        impact: "Cleaning up unused cache entries will reduce memory pressure",
        implementation:
          "Implement more aggressive cache cleanup or reduce cache sizes",
      });

      recommendations.push({
        type: "decrease_ttl",
        priority: "medium",
        description: "Consider reducing TTL for less critical data",
        impact:
          "Shorter TTL will reduce memory usage but may decrease hit rates",
        implementation:
          "Analyze data access patterns and adjust TTL accordingly",
      });
    }

    // Slow response time recommendation
    if (
      currentMetrics.averageResponseTime >
      this.performanceThresholds.maxResponseTime
    ) {
      recommendations.push({
        type: "increase_size",
        priority: "medium",
        description: `Slow average response time (${currentMetrics.averageResponseTime.toFixed(1)}ms)`,
        impact:
          "Increasing cache size may reduce cache evictions and improve performance",
        implementation:
          "Consider increasing cache size limits for frequently accessed data",
      });
    }

    // Cache size recommendations
    if (currentMetrics.cacheSize === 0) {
      recommendations.push({
        type: "preload_data",
        priority: "high",
        description: "Cache is empty - consider preloading common data",
        impact: "Preloading will significantly improve initial performance",
        implementation: "Implement cache warming on application startup",
      });
    }

    // Log recommendations
    if (recommendations.length > 0) {
      console.log(
        `[CacheMonitor] Generated ${recommendations.length} optimization recommendations`,
      );
      recommendations.forEach((rec) => {
        console.log(
          `[CacheMonitor] ${rec.priority.toUpperCase()}: ${rec.description}`,
        );
      });
    }

    return recommendations;
  }

  /**
   * Get cache efficiency report
   */
  getEfficiencyReport(): {
    overall: "excellent" | "good" | "fair" | "poor";
    hitRate: number;
    memoryEfficiency: number;
    responseTime: number;
    recommendations: CacheOptimizationRecommendation[];
    trends: {
      hitRateTrend: "improving" | "stable" | "declining";
      memoryTrend: "increasing" | "stable" | "decreasing";
      responseTrend: "improving" | "stable" | "declining";
    };
  } {
    const currentMetrics = this.getCurrentMetrics();
    const recommendations = this.generateRecommendations();

    if (!currentMetrics) {
      return {
        overall: "poor",
        hitRate: 0,
        memoryEfficiency: 0,
        responseTime: 0,
        recommendations,
        trends: {
          hitRateTrend: "stable",
          memoryTrend: "stable",
          responseTrend: "stable",
        },
      };
    }

    // Calculate efficiency scores
    const hitRateScore = Math.min(
      currentMetrics.hitRate / this.performanceThresholds.minHitRate,
      1,
    );
    const memoryScore = Math.max(
      1 -
        currentMetrics.memoryUsage / this.performanceThresholds.maxMemoryUsage,
      0,
    );
    const responseScore = Math.max(
      1 -
        currentMetrics.averageResponseTime /
          this.performanceThresholds.maxResponseTime,
      0,
    );

    const overallScore = (hitRateScore + memoryScore + responseScore) / 3;

    let overall: "excellent" | "good" | "fair" | "poor";
    if (overallScore >= 0.9) overall = "excellent";
    else if (overallScore >= 0.7) overall = "good";
    else if (overallScore >= 0.5) overall = "fair";
    else overall = "poor";

    // Calculate trends
    const trends = this.calculateTrends();

    return {
      overall,
      hitRate: currentMetrics.hitRate,
      memoryEfficiency: memoryScore,
      responseTime: currentMetrics.averageResponseTime,
      recommendations,
      trends,
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(): {
    hitRateTrend: "improving" | "stable" | "declining";
    memoryTrend: "increasing" | "stable" | "decreasing";
    responseTrend: "improving" | "stable" | "declining";
  } {
    if (this.metrics.length < 2) {
      return {
        hitRateTrend: "stable",
        memoryTrend: "stable",
        responseTrend: "stable",
      };
    }

    const recent = this.metrics.slice(-5); // Last 5 measurements
    const older = this.metrics.slice(-10, -5); // Previous 5 measurements

    const recentAvg = {
      hitRate: recent.reduce((sum, m) => sum + m.hitRate, 0) / recent.length,
      memory: recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length,
      response:
        recent.reduce((sum, m) => sum + m.averageResponseTime, 0) /
        recent.length,
    };

    const olderAvg = {
      hitRate: older.reduce((sum, m) => sum + m.hitRate, 0) / older.length,
      memory: older.reduce((sum, m) => sum + m.memoryUsage, 0) / older.length,
      response:
        older.reduce((sum, m) => sum + m.averageResponseTime, 0) / older.length,
    };

    const threshold = 0.05; // 5% change threshold

    return {
      hitRateTrend:
        recentAvg.hitRate > olderAvg.hitRate + threshold
          ? "improving"
          : recentAvg.hitRate < olderAvg.hitRate - threshold
            ? "declining"
            : "stable",
      memoryTrend:
        recentAvg.memory > olderAvg.memory + olderAvg.memory * threshold
          ? "increasing"
          : recentAvg.memory < olderAvg.memory - olderAvg.memory * threshold
            ? "decreasing"
            : "stable",
      responseTrend:
        recentAvg.response < olderAvg.response - threshold
          ? "improving"
          : recentAvg.response > olderAvg.response + threshold
            ? "declining"
            : "stable",
    };
  }

  /**
   * Estimate memory usage (approximate)
   */
  private estimateMemoryUsage(): number {
    // This is a rough estimation - in a real implementation,
    // you might want to use more sophisticated memory tracking
    const stats = enhancedDataCache.getCacheStats();

    // Estimate based on cache size and average entry size
    const estimatedEntrySize = 1024; // 1KB average per entry
    return stats.total.size * estimatedEntrySize;
  }

  /**
   * Get slow queries from recent history
   */
  private getSlowQueries(): Array<{
    key: string;
    responseTime: number;
    timestamp: number;
  }> {
    // In a real implementation, you would track this data
    // For now, return empty array
    return [];
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    // In a real implementation, you would track response times
    // For now, return a placeholder value
    return 50; // 50ms average
  }

  /**
   * Check performance thresholds and log warnings
   */
  private checkPerformanceThresholds(metrics: CachePerformanceMetrics): void {
    if (metrics.hitRate < this.performanceThresholds.minHitRate) {
      console.warn(
        `[CacheMonitor] Low hit rate: ${(metrics.hitRate * 100).toFixed(1)}%`,
      );
    }

    if (
      metrics.averageResponseTime > this.performanceThresholds.maxResponseTime
    ) {
      console.warn(
        `[CacheMonitor] Slow response time: ${metrics.averageResponseTime.toFixed(1)}ms`,
      );
    }

    if (metrics.memoryUsage > this.performanceThresholds.maxMemoryUsage) {
      console.warn(
        `[CacheMonitor] High memory usage: ${Math.round(metrics.memoryUsage / 1024 / 1024)}MB`,
      );
    }
  }

  /**
   * Reset monitoring data
   */
  reset(): void {
    this.metrics = [];
    this.queryTimes.clear();
  }

  /**
   * Export performance data for analysis
   */
  exportData(): {
    metrics: CachePerformanceMetrics[];
    thresholds: {
      minHitRate: number;
      maxResponseTime: number;
      maxMemoryUsage: number;
    };
    recommendations: CacheOptimizationRecommendation[];
  } {
    return {
      metrics: [...this.metrics],
      thresholds: { ...this.performanceThresholds },
      recommendations: this.generateRecommendations(),
    };
  }
}

// Global cache performance monitor instance
export const cachePerformanceMonitor = new CachePerformanceMonitor();

// Utility functions for performance tracking
export const trackCacheQuery = <T>(
  key: string,
  queryFn: () => Promise<T> | T,
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    cachePerformanceMonitor.startQueryTimer(key);

    try {
      const result = await queryFn();
      cachePerformanceMonitor.endQueryTimer(key);
      resolve(result);
    } catch (error) {
      cachePerformanceMonitor.endQueryTimer(key);
      reject(error);
    }
  });
};
