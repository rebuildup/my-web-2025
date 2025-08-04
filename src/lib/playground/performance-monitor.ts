/**
 * Performance Monitor for Playground Experiments
 * Monitors FPS, memory usage, and other performance metrics
 */

import { PerformanceMetrics } from "@/types/playground";

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private isMonitoring = false;
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private frameTime = 0;
  private memoryUsage = 0;
  private callbacks: ((metrics: PerformanceMetrics) => void)[] = [];
  private animationFrameId: number | null = null;
  private updateInterval: number | null = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start monitoring performance
   */
  startMonitoring(callback?: (metrics: PerformanceMetrics) => void): void {
    if (callback) {
      this.callbacks.push(callback);
    }

    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.frameCount = 0;
    this.lastTime = performance.now();

    // Start FPS monitoring
    this.monitorFrame();

    // Start memory monitoring (every 1 second)
    this.updateInterval = window.setInterval(() => {
      this.updateMemoryUsage();
    }, 1000);
  }

  /**
   * Stop monitoring performance
   */
  stopMonitoring(callback?: (metrics: PerformanceMetrics) => void): void {
    if (callback) {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    }

    if (this.callbacks.length === 0) {
      this.isMonitoring = false;

      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }

      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    }
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return {
      fps: this.fps,
      frameTime: this.frameTime,
      memoryUsage: this.memoryUsage,
    };
  }

  /**
   * Monitor frame rate
   */
  private monitorFrame = (): void => {
    if (!this.isMonitoring) {
      return;
    }

    const currentTime = performance.now();
    this.frameTime = currentTime - this.lastTime;
    this.frameCount++;

    // Calculate FPS every 60 frames or 1 second
    if (this.frameCount >= 60 || currentTime - this.lastTime >= 1000) {
      const deltaTime = currentTime - this.lastTime;
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Notify callbacks
      this.notifyCallbacks();
    }

    this.animationFrameId = requestAnimationFrame(this.monitorFrame);
  };

  /**
   * Update memory usage
   */
  private updateMemoryUsage(): void {
    try {
      const memory = (performance as { memory?: { usedJSHeapSize: number } })
        .memory;
      if (memory) {
        this.memoryUsage = Math.round(memory.usedJSHeapSize / (1024 * 1024)); // Convert to MB
      }
    } catch {
      // Memory API not available
      this.memoryUsage = 0;
    }
  }

  /**
   * Notify all callbacks with current metrics
   */
  private notifyCallbacks(): void {
    const metrics = this.getCurrentMetrics();
    this.callbacks.forEach((callback) => {
      try {
        callback(metrics);
      } catch (error) {
        console.error("Performance monitor callback error:", error);
      }
    });
  }

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(targetFPS: number = 30): boolean {
    return this.fps >= targetFPS * 0.8; // Allow 20% tolerance
  }

  /**
   * Get performance recommendations
   */
  getPerformanceRecommendations(targetFPS: number = 60): string[] {
    const recommendations: string[] = [];

    if (this.fps < targetFPS * 0.5) {
      recommendations.push("Consider reducing quality settings");
      recommendations.push("Reduce particle count or complexity");
    } else if (this.fps < targetFPS * 0.8) {
      recommendations.push("Consider minor quality adjustments");
    }

    if (this.memoryUsage > 500) {
      recommendations.push(
        "High memory usage detected - consider optimization",
      );
    }

    if (this.frameTime > 33) {
      // More than 33ms per frame (30 FPS)
      recommendations.push("Frame time is high - optimize rendering");
    }

    return recommendations;
  }

  /**
   * Reset performance metrics
   */
  reset(): void {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fps = 0;
    this.frameTime = 0;
    this.memoryUsage = 0;
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitor(
  isActive: boolean,
  targetFPS: number = 60,
): {
  metrics: PerformanceMetrics;
  isAcceptable: boolean;
  recommendations: string[];
} {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
  });

  React.useEffect(() => {
    if (!isActive) {
      performanceMonitor.stopMonitoring(setMetrics);
      return;
    }

    performanceMonitor.startMonitoring(setMetrics);

    return () => {
      performanceMonitor.stopMonitoring(setMetrics);
    };
  }, [isActive]);

  const isAcceptable = performanceMonitor.isPerformanceAcceptable(targetFPS);
  const recommendations =
    performanceMonitor.getPerformanceRecommendations(targetFPS);

  return {
    metrics,
    isAcceptable,
    recommendations,
  };
}

// Add React import for the hook
import React from "react";
