/**
 * Performance Optimizer for Playground
 * WebGL performance optimization, frame rate monitoring, and device adaptation
 * Task 3.1: プレイグラウンドのパフォーマンス最適化
 */

import { DeviceCapabilities } from "@/types/playground";

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  gpuMemoryUsage?: number;
  drawCalls?: number;
  triangles?: number;
}

export interface OptimizationSettings {
  targetFPS: number;
  maxMemoryUsage: number;
  adaptiveQuality: boolean;
  enableProfiling: boolean;
  frameTimeThreshold: number;
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
  };

  private frameHistory: number[] = [];
  private lastFrameTime = 0;
  private frameCount = 0;
  private lastSecond = 0;

  private optimizationSettings: OptimizationSettings = {
    targetFPS: 60,
    maxMemoryUsage: 512, // MB
    adaptiveQuality: true,
    enableProfiling: true,
    frameTimeThreshold: 16.67, // 60fps = 16.67ms per frame
  };

  private performanceCallbacks: ((metrics: PerformanceMetrics) => void)[] = [];
  private qualityAdjustmentCallbacks: ((newQuality: string) => void)[] = [];

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * Initialize performance monitoring
   */
  initialize(settings?: Partial<OptimizationSettings>): void {
    if (settings) {
      this.optimizationSettings = { ...this.optimizationSettings, ...settings };
    }

    this.startMonitoring();
  }

  /**
   * Start performance monitoring
   */
  private startMonitoring(): void {
    const monitor = () => {
      const now = performance.now();

      if (this.lastFrameTime > 0) {
        const frameTime = now - this.lastFrameTime;
        this.frameHistory.push(frameTime);

        // Keep only last 60 frames for rolling average
        if (this.frameHistory.length > 60) {
          this.frameHistory.shift();
        }

        this.frameCount++;

        // Update metrics every second
        if (now - this.lastSecond >= 1000) {
          this.updateMetrics();
          this.lastSecond = now;
          this.frameCount = 0;
        }
      }

      this.lastFrameTime = now;
      requestAnimationFrame(monitor);
    };

    requestAnimationFrame(monitor);
  }

  /**
   * Update performance metrics
   */
  private updateMetrics(): void {
    // Calculate FPS
    this.metrics.fps = this.frameCount;

    // Calculate average frame time
    if (this.frameHistory.length > 0) {
      this.metrics.frameTime =
        this.frameHistory.reduce((a, b) => a + b, 0) / this.frameHistory.length;
    }

    // Get memory usage
    this.metrics.memoryUsage = this.getMemoryUsage();

    // Notify callbacks
    this.performanceCallbacks.forEach((callback) => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.warn("Performance callback error:", error);
      }
    });

    // Check if quality adjustment is needed
    if (this.optimizationSettings.adaptiveQuality) {
      this.checkQualityAdjustment();
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryUsage(): number {
    if ("memory" in performance) {
      const memory = (performance as { memory?: { usedJSHeapSize: number } })
        .memory;
      return memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0;
    }
    return 0;
  }

  /**
   * Check if quality adjustment is needed
   */
  private checkQualityAdjustment(): void {
    const { fps, frameTime, memoryUsage } = this.metrics;
    const { targetFPS, maxMemoryUsage, frameTimeThreshold } =
      this.optimizationSettings;

    let shouldAdjust = false;
    let newQuality = "medium";

    // Check FPS performance
    if (fps < targetFPS * 0.8) {
      // 80% of target FPS
      shouldAdjust = true;
      newQuality = "low";
    } else if (fps > targetFPS * 0.95 && frameTime < frameTimeThreshold * 0.8) {
      shouldAdjust = true;
      newQuality = "high";
    }

    // Check memory usage
    if (memoryUsage > maxMemoryUsage * 0.9) {
      // 90% of max memory
      shouldAdjust = true;
      newQuality = "low";
    }

    // Check frame time consistency
    if (this.frameHistory.length >= 30) {
      const recentFrames = this.frameHistory.slice(-30);
      const variance = this.calculateVariance(recentFrames);

      if (variance > frameTimeThreshold * 0.5) {
        // High variance indicates inconsistent performance
        shouldAdjust = true;
        newQuality = "medium";
      }
    }

    if (shouldAdjust) {
      this.qualityAdjustmentCallbacks.forEach((callback) => {
        try {
          callback(newQuality);
        } catch (error) {
          console.warn("Quality adjustment callback error:", error);
        }
      });
    }
  }

  /**
   * Calculate variance of frame times
   */
  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get optimal WebGL settings based on device capabilities
   */
  getOptimalWebGLSettings(deviceCapabilities: DeviceCapabilities): {
    pixelRatio: number;
    antialias: boolean;
    powerPreference: "default" | "high-performance" | "low-power";
    alpha: boolean;
    premultipliedAlpha: boolean;
    preserveDrawingBuffer: boolean;
    stencil: boolean;
    depth: boolean;
  } {
    const { performanceLevel, devicePixelRatio } = deviceCapabilities;

    return {
      pixelRatio: Math.min(
        devicePixelRatio,
        performanceLevel === "high"
          ? 2
          : performanceLevel === "medium"
            ? 1.5
            : 1,
      ),
      antialias: performanceLevel !== "low",
      powerPreference:
        performanceLevel === "high" ? "high-performance" : "default",
      alpha: false, // Better performance without alpha
      premultipliedAlpha: false,
      preserveDrawingBuffer: false, // Better performance
      stencil: performanceLevel === "high",
      depth: true,
    };
  }

  /**
   * Get optimal texture settings
   */
  getOptimalTextureSettings(deviceCapabilities: DeviceCapabilities): {
    maxTextureSize: number;
    textureFormat: string;
    mipmaps: boolean;
    filtering: string;
  } {
    const { performanceLevel, maxTextureSize } = deviceCapabilities;

    let optimalSize = 1024;
    if (performanceLevel === "high") {
      optimalSize = Math.min(maxTextureSize, 2048);
    } else if (performanceLevel === "medium") {
      optimalSize = Math.min(maxTextureSize, 1024);
    } else {
      optimalSize = Math.min(maxTextureSize, 512);
    }

    return {
      maxTextureSize: optimalSize,
      textureFormat: "RGB", // More efficient than RGBA when alpha not needed
      mipmaps: performanceLevel !== "low",
      filtering: performanceLevel === "high" ? "trilinear" : "bilinear",
    };
  }

  /**
   * Get optimal shader settings
   */
  getOptimalShaderSettings(deviceCapabilities: DeviceCapabilities): {
    precision: "lowp" | "mediump" | "highp";
    maxComplexity: number;
    enableOptimizations: boolean;
  } {
    const { performanceLevel } = deviceCapabilities;

    return {
      precision:
        performanceLevel === "high"
          ? "highp"
          : performanceLevel === "medium"
            ? "mediump"
            : "lowp",
      maxComplexity:
        performanceLevel === "high"
          ? 100
          : performanceLevel === "medium"
            ? 50
            : 25,
      enableOptimizations: true,
    };
  }

  /**
   * Optimize WebGL context for performance
   */
  optimizeWebGLContext(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
  ): void {
    // Enable depth testing for better performance
    gl.enable(gl.DEPTH_TEST);

    // Enable face culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Set optimal clear color (black is fastest)
    gl.clearColor(0, 0, 0, 1);

    // Disable unnecessary features for better performance
    gl.disable(gl.DITHER);
    gl.disable(gl.STENCIL_TEST);

    // Set optimal viewport
    const canvas = gl.canvas as HTMLCanvasElement;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  /**
   * Monitor WebGL performance
   */
  monitorWebGLPerformance(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
  ): void {
    if (!this.optimizationSettings.enableProfiling) return;

    // Get WebGL debug info if available
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      console.log("WebGL Renderer:", renderer);
      console.log("WebGL Vendor:", vendor);
    }

    // Monitor draw calls and triangles if extension is available
    const timerExt =
      gl.getExtension("EXT_disjoint_timer_query_webgl2") ||
      gl.getExtension("EXT_disjoint_timer_query");

    if (timerExt) {
      // Implementation for GPU timing would go here
      // This is complex and requires careful handling of async queries
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Subscribe to performance updates
   */
  onPerformanceUpdate(
    callback: (metrics: PerformanceMetrics) => void,
  ): () => void {
    this.performanceCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.performanceCallbacks.indexOf(callback);
      if (index > -1) {
        this.performanceCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to quality adjustments
   */
  onQualityAdjustment(callback: (newQuality: string) => void): () => void {
    this.qualityAdjustmentCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.qualityAdjustmentCallbacks.indexOf(callback);
      if (index > -1) {
        this.qualityAdjustmentCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Update optimization settings
   */
  updateSettings(settings: Partial<OptimizationSettings>): void {
    this.optimizationSettings = { ...this.optimizationSettings, ...settings };
  }

  /**
   * Reset performance history
   */
  reset(): void {
    this.frameHistory = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.lastSecond = 0;
    this.metrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Optimize settings for device capabilities
   */
  optimizeForDevice(deviceCapabilities: DeviceCapabilities): {
    targetFPS: number;
    qualityLevel: "low" | "medium" | "high";
    enableOptimizations: boolean;
  } {
    const { performanceLevel } = deviceCapabilities;

    switch (performanceLevel) {
      case "high":
        return {
          targetFPS: 60,
          qualityLevel: "high",
          enableOptimizations: true,
        };
      case "medium":
        return {
          targetFPS: 45,
          qualityLevel: "medium",
          enableOptimizations: true,
        };
      case "low":
        return {
          targetFPS: 30,
          qualityLevel: "low",
          enableOptimizations: true,
        };
      default:
        return {
          targetFPS: 60,
          qualityLevel: "medium",
          enableOptimizations: true,
        };
    }
  }

  /**
   * Get performance recommendations
   */
  getRecommendations(deviceCapabilities: DeviceCapabilities): string[] {
    const recommendations: string[] = [];
    const { fps, frameTime, memoryUsage } = this.metrics;
    const { targetFPS, maxMemoryUsage } = this.optimizationSettings;

    if (fps < targetFPS * 0.8) {
      recommendations.push(
        "Consider reducing particle count or texture quality",
      );
      recommendations.push(
        "Try disabling antialiasing or reducing pixel ratio",
      );
    }

    if (frameTime > this.optimizationSettings.frameTimeThreshold * 1.5) {
      recommendations.push("Frame time is high - consider optimizing shaders");
      recommendations.push("Reduce complexity of visual effects");
    }

    if (memoryUsage > maxMemoryUsage * 0.8) {
      recommendations.push(
        "Memory usage is high - consider reducing texture sizes",
      );
      recommendations.push("Optimize geometry and dispose unused resources");
    }

    if (deviceCapabilities.performanceLevel === "low") {
      recommendations.push(
        "Device performance is limited - use low quality settings",
      );
      recommendations.push("Consider disabling complex visual effects");
    }

    if (!deviceCapabilities.webgl2Support) {
      recommendations.push(
        "WebGL2 not supported - some features may be limited",
      );
    }

    return recommendations;
  }
}

// Export singleton instance
export const performanceOptimizer = PerformanceOptimizer.getInstance();
