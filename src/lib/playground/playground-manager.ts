/**
 * Playground Manager
 * Manages experiment loading, metadata, and common functionality
 * Task 1.3: プレイグラウンド共通機能の実装
 */

import { designExperiments } from "@/components/playground/design-experiments/experiments-data";
import { webglExperiments } from "@/components/playground/webgl-experiments/experiments-data";
import {
  DeviceCapabilities,
  ExperimentItem,
  ExperimentMetadata,
  ExperimentShareData,
  PerformanceSettings,
  PlaygroundError,
} from "@/types/playground";

export class PlaygroundManager {
  private static instance: PlaygroundManager;
  private experiments: Map<string, ExperimentItem> = new Map();
  private metadata: Map<string, ExperimentMetadata> = new Map();
  private errors: PlaygroundError[] = [];

  static getInstance(): PlaygroundManager {
    if (!PlaygroundManager.instance) {
      PlaygroundManager.instance = new PlaygroundManager();
    }
    return PlaygroundManager.instance;
  }

  constructor() {
    this.loadExperiments();
  }

  /**
   * Load all available experiments
   */
  private loadExperiments(): void {
    // Load design experiments
    designExperiments.forEach((experiment) => {
      this.experiments.set(experiment.id, experiment);
      this.metadata.set(experiment.id, this.createMetadata(experiment));
    });

    // Load WebGL experiments
    webglExperiments.forEach((experiment) => {
      this.experiments.set(experiment.id, experiment);
      this.metadata.set(experiment.id, this.createMetadata(experiment));
    });
  }

  /**
   * Create metadata from experiment
   */
  private createMetadata(experiment: ExperimentItem): ExperimentMetadata {
    return {
      id: experiment.id,
      title: experiment.title,
      description: experiment.description,
      category: experiment.category,
      difficulty: experiment.difficulty,
      technology: experiment.technology,
      performanceLevel: ("performanceLevel" in experiment
        ? experiment.performanceLevel
        : "medium") as "low" | "medium" | "high",
      interactive: experiment.interactive,
      requiresWebGL:
        experiment.category === "3d" ||
        experiment.category === "shader" ||
        experiment.category === "particle" ||
        experiment.category === "effect",
      requiresWebGL2: Boolean(
        "requiresWebGL2" in experiment ? experiment.requiresWebGL2 : false,
      ),
      estimatedMemoryUsage: this.estimateMemoryUsage(experiment),
      targetFPS: this.getTargetFPS(experiment),
      createdAt: experiment.createdAt,
      updatedAt: experiment.updatedAt,
    };
  }

  /**
   * Estimate memory usage for experiment
   */
  private estimateMemoryUsage(experiment: ExperimentItem): number {
    const baseMemory = 10; // Base memory in MB

    switch (experiment.category) {
      case "3d":
        return baseMemory + 50; // 3D models and textures
      case "particle":
        return baseMemory + 30; // Particle systems
      case "shader":
        return baseMemory + 20; // Shader programs
      case "effect":
        return baseMemory + 40; // Complex effects
      case "canvas":
        return baseMemory + 15; // Canvas operations
      case "svg":
        return baseMemory + 5; // SVG elements
      case "css":
        return baseMemory + 5; // CSS animations
      case "animation":
        return baseMemory + 10; // Animation systems
      default:
        return baseMemory;
    }
  }

  /**
   * Get target FPS for experiment
   */
  private getTargetFPS(experiment: ExperimentItem): number {
    const performanceLevel =
      "performanceLevel" in experiment ? experiment.performanceLevel : "medium";

    switch (performanceLevel) {
      case "high":
        return 60;
      case "medium":
        return 45;
      case "low":
        return 30;
      default:
        return 60;
    }
  }

  /**
   * Get all experiments
   */
  getAllExperiments(): ExperimentItem[] {
    return Array.from(this.experiments.values());
  }

  /**
   * Get experiments by type
   */
  getExperimentsByType(type: "design" | "webgl"): ExperimentItem[] {
    return Array.from(this.experiments.values()).filter((experiment) => {
      if (type === "design") {
        return ["css", "svg", "canvas", "animation"].includes(
          experiment.category,
        );
      } else {
        return ["3d", "shader", "particle", "effect"].includes(
          experiment.category,
        );
      }
    });
  }

  /**
   * Get experiment by ID
   */
  getExperiment(id: string): ExperimentItem | undefined {
    return this.experiments.get(id);
  }

  /**
   * Get experiment metadata
   */
  getExperimentMetadata(id: string): ExperimentMetadata | undefined {
    return this.metadata.get(id);
  }

  /**
   * Check if experiment is compatible with device
   */
  isExperimentCompatible(
    experimentId: string,
    deviceCapabilities: DeviceCapabilities,
  ): { compatible: boolean; reason?: string } {
    const metadata = this.metadata.get(experimentId);
    if (!metadata) {
      return { compatible: false, reason: "Experiment not found" };
    }

    // Check WebGL requirement
    if (metadata.requiresWebGL && !deviceCapabilities.webglSupport) {
      return { compatible: false, reason: "WebGL not supported" };
    }

    // Check WebGL2 requirement
    if (metadata.requiresWebGL2 && !deviceCapabilities.webgl2Support) {
      return { compatible: false, reason: "WebGL2 not supported" };
    }

    // Check memory requirement
    if (
      deviceCapabilities.memoryLimit &&
      metadata.estimatedMemoryUsage > deviceCapabilities.memoryLimit
    ) {
      return { compatible: false, reason: "Insufficient memory" };
    }

    // Check performance level
    if (
      metadata.performanceLevel === "high" &&
      deviceCapabilities.performanceLevel === "low"
    ) {
      return { compatible: false, reason: "Device performance too low" };
    }

    return { compatible: true };
  }

  /**
   * Get recommended performance settings for experiment
   */
  getRecommendedSettings(
    experimentId: string,
    deviceCapabilities: DeviceCapabilities,
  ): PerformanceSettings {
    const metadata = this.metadata.get(experimentId);
    if (!metadata) {
      return {
        targetFPS: 60,
        qualityLevel: "medium",
        enableOptimizations: true,
      };
    }

    let qualityLevel: "low" | "medium" | "high" = "medium";
    let targetFPS = metadata.targetFPS;

    // Adjust based on device performance
    switch (deviceCapabilities.performanceLevel) {
      case "high":
        qualityLevel = metadata.performanceLevel === "high" ? "high" : "medium";
        break;
      case "medium":
        qualityLevel =
          metadata.performanceLevel === "high" ? "medium" : "medium";
        break;
      case "low":
        qualityLevel = "low";
        targetFPS = Math.min(targetFPS, 30);
        break;
    }

    // Adjust for mobile devices
    if (
      deviceCapabilities.touchSupport &&
      deviceCapabilities.devicePixelRatio > 2
    ) {
      qualityLevel = qualityLevel === "high" ? "medium" : "low";
      targetFPS = Math.min(targetFPS, 30);
    }

    return {
      targetFPS,
      qualityLevel,
      enableOptimizations: true,
    };
  }

  /**
   * Add error to error log
   */
  addError(error: PlaygroundError): void {
    this.errors.push({
      ...error,
      type: error.type,
      message: error.message,
      details: error.details,
      recoverable: error.recoverable,
    });

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
  }

  /**
   * Get all errors
   */
  getErrors(): PlaygroundError[] {
    return [...this.errors];
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: PlaygroundError["type"]): PlaygroundError[] {
    return this.errors.filter((error) => error.type === type);
  }

  /**
   * Create shareable data for experiment
   */
  createShareData(
    experimentId: string,
    settings: PerformanceSettings,
    deviceCapabilities: DeviceCapabilities,
  ): ExperimentShareData {
    return {
      experimentId,
      settings,
      timestamp: new Date().toISOString(),
      deviceInfo: {
        performanceLevel: deviceCapabilities.performanceLevel,
        webglSupport: deviceCapabilities.webglSupport,
        webgl2Support: deviceCapabilities.webgl2Support,
        touchSupport: deviceCapabilities.touchSupport,
      },
    };
  }

  /**
   * Generate share URL for experiment
   */
  generateShareURL(shareData: ExperimentShareData): string {
    const baseURL = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      experiment: shareData.experimentId,
      quality: shareData.settings.qualityLevel,
      fps: shareData.settings.targetFPS.toString(),
      optimizations: shareData.settings.enableOptimizations.toString(),
    });

    return `${baseURL}/portfolio/playground?${params.toString()}`;
  }

  /**
   * Parse share URL parameters
   */
  parseShareURL(url: string): Partial<ExperimentShareData> | null {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      const experimentId = params.get("experiment");
      if (!experimentId) return null;

      const settings: PerformanceSettings = {
        targetFPS: parseInt(params.get("fps") || "60"),
        qualityLevel:
          (params.get("quality") as PerformanceSettings["qualityLevel"]) ||
          "medium",
        enableOptimizations: params.get("optimizations") === "true",
      };

      return {
        experimentId,
        settings,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  /**
   * Get experiment statistics
   */
  getStatistics(): {
    totalExperiments: number;
    designExperiments: number;
    webglExperiments: number;
    byDifficulty: Record<string, number>;
    byCategory: Record<string, number>;
    requiresWebGL: number;
    requiresWebGL2: number;
  } {
    const experiments = this.getAllExperiments();
    const metadata = Array.from(this.metadata.values());

    const stats = {
      totalExperiments: experiments.length,
      designExperiments: this.getExperimentsByType("design").length,
      webglExperiments: this.getExperimentsByType("webgl").length,
      byDifficulty: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      requiresWebGL: metadata.filter((m) => m.requiresWebGL).length,
      requiresWebGL2: metadata.filter((m) => m.requiresWebGL2).length,
    };

    // Count by difficulty
    experiments.forEach((exp) => {
      stats.byDifficulty[exp.difficulty] =
        (stats.byDifficulty[exp.difficulty] || 0) + 1;
    });

    // Count by category
    experiments.forEach((exp) => {
      stats.byCategory[exp.category] =
        (stats.byCategory[exp.category] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const playgroundManager = PlaygroundManager.getInstance();
