/**
 * Playground Manager Unit Tests
 * Task 4.1: プレイグラウンドの単体テスト（Jest）実装
 * Tests for playground manager functionality
 */

import { cacheManager } from "@/lib/playground/cache-manager";
import {
  playgroundManager,
  PlaygroundManager,
} from "@/lib/playground/playground-manager";
import {
  DeviceCapabilities,
  PerformanceSettings,
  PlaygroundError,
} from "@/types/playground";

// Mock dependencies
jest.mock("@/lib/playground/cache-manager");
jest.mock(
  "@/components/playground/design-experiments/experiments-data",
  () => ({
    designExperiments: [
      {
        id: "design-1",
        title: "Design Test 1",
        description: "Test design experiment",
        technology: ["CSS", "JavaScript"],
        interactive: true,
        component: () => null,
        category: "css",
        difficulty: "beginner",
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
        performanceLevel: "low",
      },
      {
        id: "design-2",
        title: "Design Test 2",
        description: "Test canvas experiment",
        technology: ["Canvas", "JavaScript"],
        interactive: true,
        component: () => null,
        category: "canvas",
        difficulty: "intermediate",
        createdAt: "2025-01-01",
        updatedAt: "2025-01-01",
        performanceLevel: "medium",
      },
    ],
  }),
);

jest.mock("@/components/playground/webgl-experiments/experiments-data", () => ({
  webglExperiments: [
    {
      id: "webgl-1",
      title: "WebGL Test 1",
      description: "Test 3D experiment",
      technology: ["WebGL", "Three.js"],
      interactive: true,
      component: () => null,
      category: "3d",
      difficulty: "intermediate",
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
      webglType: "3d",
      performanceLevel: "medium",
      requiresWebGL2: false,
    },
    {
      id: "webgl-2",
      title: "WebGL Test 2",
      description: "Test shader experiment",
      technology: ["WebGL", "GLSL"],
      interactive: true,
      component: () => null,
      category: "shader",
      difficulty: "advanced",
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
      webglType: "shader",
      performanceLevel: "high",
      requiresWebGL2: true,
      shaderCode:
        "precision mediump float; void main() { gl_FragColor = vec4(1.0); }",
    },
  ],
}));

// Mock data
const mockDeviceCapabilities: DeviceCapabilities = {
  webglSupport: true,
  webgl2Support: true,
  performanceLevel: "high",
  touchSupport: false,
  maxTextureSize: 4096,
  devicePixelRatio: 1,
  hardwareConcurrency: 8,
  memoryLimit: 1000,
};

describe("PlaygroundManager", () => {
  let manager: PlaygroundManager;
  let mockGetExperimentData: jest.MockedFunction<
    typeof cacheManager.getExperimentData
  >;
  let mockCacheExperimentData: jest.MockedFunction<
    typeof cacheManager.cacheExperimentData
  >;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create new instance for each test
    manager = new PlaygroundManager();

    mockGetExperimentData =
      cacheManager.getExperimentData as jest.MockedFunction<
        typeof cacheManager.getExperimentData
      >;
    mockCacheExperimentData =
      cacheManager.cacheExperimentData as jest.MockedFunction<
        typeof cacheManager.cacheExperimentData
      >;

    // Default to cache miss
    mockGetExperimentData.mockReturnValue(null);
  });

  describe("Experiment Loading", () => {
    it("should load all experiments on initialization", () => {
      const allExperiments = manager.getAllExperiments();

      expect(allExperiments).toHaveLength(4);
      expect(allExperiments.map((e) => e.id)).toEqual([
        "design-1",
        "design-2",
        "webgl-1",
        "webgl-2",
      ]);
    });

    it("should separate design and WebGL experiments", () => {
      const designExperiments = manager.getExperimentsByType("design");
      const webglExperiments = manager.getExperimentsByType("webgl");

      expect(designExperiments).toHaveLength(2);
      expect(webglExperiments).toHaveLength(2);

      expect(
        designExperiments.every((e) =>
          ["css", "canvas", "svg", "animation"].includes(e.category),
        ),
      ).toBe(true);
      expect(
        webglExperiments.every((e) =>
          ["3d", "shader", "particle", "effect"].includes(e.category),
        ),
      ).toBe(true);
    });

    it("should cache experiment data", () => {
      manager.getAllExperiments();

      expect(mockCacheExperimentData).toHaveBeenCalledWith(
        "all-experiments",
        expect.any(Array),
      );
    });

    it("should return cached data when available", () => {
      const cachedData = [{ id: "cached-1" }];
      mockGetExperimentData.mockReturnValue(cachedData);

      const result = manager.getAllExperiments();

      expect(result).toBe(cachedData);
      expect(mockCacheExperimentData).not.toHaveBeenCalled();
    });
  });

  describe("Experiment Retrieval", () => {
    it("should get experiment by ID", () => {
      const experiment = manager.getExperiment("design-1");

      expect(experiment).toBeDefined();
      expect(experiment?.id).toBe("design-1");
      expect(experiment?.title).toBe("Design Test 1");
    });

    it("should return undefined for non-existent experiment", () => {
      const experiment = manager.getExperiment("non-existent");

      expect(experiment).toBeUndefined();
    });

    it("should get experiment metadata", () => {
      const metadata = manager.getExperimentMetadata("webgl-2");

      expect(metadata).toBeDefined();
      expect(metadata?.id).toBe("webgl-2");
      expect(metadata?.requiresWebGL).toBe(true);
      expect(metadata?.requiresWebGL2).toBe(true);
      expect(metadata?.estimatedMemoryUsage).toBeGreaterThan(0);
    });
  });

  describe("Memory Usage Estimation", () => {
    it("should estimate memory usage for different experiment types", () => {
      const designMetadata = manager.getExperimentMetadata("design-1");
      const webglMetadata = manager.getExperimentMetadata("webgl-1");
      const shaderMetadata = manager.getExperimentMetadata("webgl-2");

      expect(designMetadata?.estimatedMemoryUsage).toBeLessThan(
        webglMetadata?.estimatedMemoryUsage || 0,
      );
      expect(shaderMetadata?.estimatedMemoryUsage).toBeLessThan(
        webglMetadata?.estimatedMemoryUsage || 0,
      );
    });

    it("should set appropriate target FPS based on performance level", () => {
      const lowPerfMetadata = manager.getExperimentMetadata("design-1"); // low performance
      const mediumPerfMetadata = manager.getExperimentMetadata("webgl-1"); // medium performance
      const highPerfMetadata = manager.getExperimentMetadata("webgl-2"); // high performance

      expect(lowPerfMetadata?.targetFPS).toBe(30);
      expect(mediumPerfMetadata?.targetFPS).toBe(45);
      expect(highPerfMetadata?.targetFPS).toBe(60);
    });
  });

  describe("Device Compatibility", () => {
    it("should check WebGL compatibility", () => {
      const webglExperiment = manager.isExperimentCompatible(
        "webgl-1",
        mockDeviceCapabilities,
      );
      const designExperiment = manager.isExperimentCompatible(
        "design-1",
        mockDeviceCapabilities,
      );

      expect(webglExperiment.compatible).toBe(true);
      expect(designExperiment.compatible).toBe(true);
    });

    it("should reject WebGL experiments on devices without WebGL", () => {
      const noWebGLCapabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        webglSupport: false,
        webgl2Support: false,
      };

      const webglResult = manager.isExperimentCompatible(
        "webgl-1",
        noWebGLCapabilities,
      );
      const designResult = manager.isExperimentCompatible(
        "design-1",
        noWebGLCapabilities,
      );

      expect(webglResult.compatible).toBe(false);
      expect(webglResult.reason).toBe("WebGL not supported");
      expect(designResult.compatible).toBe(true);
    });

    it("should reject WebGL2 experiments on devices without WebGL2", () => {
      const webgl1Capabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        webgl2Support: false,
      };

      const webgl1Result = manager.isExperimentCompatible(
        "webgl-1",
        webgl1Capabilities,
      );
      const webgl2Result = manager.isExperimentCompatible(
        "webgl-2",
        webgl1Capabilities,
      );

      expect(webgl1Result.compatible).toBe(true);
      expect(webgl2Result.compatible).toBe(false);
      expect(webgl2Result.reason).toBe("WebGL2 not supported");
    });

    it("should check memory requirements", () => {
      const lowMemoryCapabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        memoryLimit: 20, // Very low memory limit
      };

      const result = manager.isExperimentCompatible(
        "webgl-1",
        lowMemoryCapabilities,
      );

      expect(result.compatible).toBe(false);
      expect(result.reason).toBe("Insufficient memory");
    });

    it("should check performance level compatibility", () => {
      const lowPerfCapabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        performanceLevel: "low",
      };

      const highPerfResult = manager.isExperimentCompatible(
        "webgl-2",
        lowPerfCapabilities,
      );
      const lowPerfResult = manager.isExperimentCompatible(
        "design-1",
        lowPerfCapabilities,
      );

      expect(highPerfResult.compatible).toBe(false);
      expect(highPerfResult.reason).toBe("Device performance too low");
      expect(lowPerfResult.compatible).toBe(true);
    });
  });

  describe("Performance Settings Recommendations", () => {
    it("should recommend settings based on device capabilities", () => {
      const settings = manager.getRecommendedSettings(
        "webgl-1",
        mockDeviceCapabilities,
      );

      expect(settings.targetFPS).toBe(45); // Medium performance experiment
      expect(settings.qualityLevel).toBe("medium");
      expect(settings.enableOptimizations).toBe(true);
    });

    it("should adjust settings for low-performance devices", () => {
      const lowPerfCapabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        performanceLevel: "low",
        hardwareConcurrency: 2,
      };

      const settings = manager.getRecommendedSettings(
        "webgl-2",
        lowPerfCapabilities,
      );

      expect(settings.targetFPS).toBeLessThanOrEqual(30);
      expect(settings.qualityLevel).toBe("low");
      expect(settings.enableOptimizations).toBe(true);
    });

    it("should adjust settings for mobile devices", () => {
      const mobileCapabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        touchSupport: true,
        devicePixelRatio: 3,
      };

      const settings = manager.getRecommendedSettings(
        "webgl-1",
        mobileCapabilities,
      );

      expect(settings.targetFPS).toBeLessThanOrEqual(30);
      expect(settings.qualityLevel).toBe("low");
    });
  });

  describe("Error Management", () => {
    it("should add and retrieve errors", () => {
      const error: PlaygroundError = {
        type: "webgl",
        message: "Context lost",
        details: "WebGL context was lost",
        recoverable: true,
      };

      manager.addError(error);
      const errors = manager.getErrors();

      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual(error);
    });

    it("should limit error history", () => {
      // Add more than 50 errors
      for (let i = 0; i < 60; i++) {
        manager.addError({
          type: "runtime",
          message: `Error ${i}`,
          recoverable: true,
        });
      }

      const errors = manager.getErrors();
      expect(errors).toHaveLength(50);
      expect(errors[0].message).toBe("Error 10"); // First 10 should be removed
    });

    it("should filter errors by type", () => {
      manager.addError({
        type: "webgl",
        message: "WebGL error",
        recoverable: true,
      });
      manager.addError({
        type: "performance",
        message: "Performance error",
        recoverable: true,
      });
      manager.addError({
        type: "webgl",
        message: "Another WebGL error",
        recoverable: true,
      });

      const webglErrors = manager.getErrorsByType("webgl");
      const perfErrors = manager.getErrorsByType("performance");

      expect(webglErrors).toHaveLength(2);
      expect(perfErrors).toHaveLength(1);
    });

    it("should clear all errors", () => {
      manager.addError({
        type: "runtime",
        message: "Error",
        recoverable: true,
      });
      manager.clearErrors();

      expect(manager.getErrors()).toHaveLength(0);
    });
  });

  describe("Sharing Functionality", () => {
    it("should create share data", () => {
      const settings: PerformanceSettings = {
        targetFPS: 60,
        qualityLevel: "high",
        enableOptimizations: true,
      };

      const shareData = manager.createShareData(
        "webgl-1",
        settings,
        mockDeviceCapabilities,
      );

      expect(shareData.experimentId).toBe("webgl-1");
      expect(shareData.settings).toEqual(settings);
      expect(shareData.deviceInfo.performanceLevel).toBe("high");
      expect(shareData.timestamp).toBeDefined();
    });

    it("should generate share URL", () => {
      const shareData = {
        experimentId: "webgl-1",
        settings: {
          targetFPS: 60,
          qualityLevel: "high" as const,
          enableOptimizations: true,
        },
        timestamp: "2025-01-01T00:00:00.000Z",
        deviceInfo: {
          performanceLevel: "high" as const,
          webglSupport: true,
          webgl2Support: true,
          touchSupport: false,
        },
      };

      const url = manager.generateShareURL(shareData);

      expect(url).toContain("experiment=webgl-1");
      expect(url).toContain("quality=high");
      expect(url).toContain("fps=60");
      expect(url).toContain("optimizations=true");
    });

    it("should parse share URL", () => {
      const url =
        "https://example.com/portfolio/playground?experiment=webgl-1&quality=medium&fps=30&optimizations=false";

      const parsed = manager.parseShareURL(url);

      expect(parsed).toBeDefined();
      if (parsed) {
        expect(parsed.experimentId).toBe("webgl-1");
        expect(parsed.settings?.qualityLevel).toBe("medium");
        expect(parsed.settings?.targetFPS).toBe(30);
        expect(parsed.settings?.enableOptimizations).toBe(false);
      }
    });

    it("should handle invalid share URLs", () => {
      const invalidUrl = "https://example.com/invalid";
      const parsed = manager.parseShareURL(invalidUrl);

      expect(parsed).toBeNull();
    });
  });

  describe("Statistics", () => {
    it("should generate experiment statistics", () => {
      const stats = manager.getStatistics();

      expect(stats.totalExperiments).toBe(4);
      expect(stats.designExperiments).toBe(2);
      expect(stats.webglExperiments).toBe(2);
      expect(stats.requiresWebGL).toBe(2);
      expect(stats.requiresWebGL2).toBe(1);
    });

    it("should count experiments by difficulty", () => {
      const stats = manager.getStatistics();

      expect(stats.byDifficulty.beginner).toBe(1);
      expect(stats.byDifficulty.intermediate).toBe(2);
      expect(stats.byDifficulty.advanced).toBe(1);
    });

    it("should count experiments by category", () => {
      const stats = manager.getStatistics();

      expect(stats.byCategory.css).toBe(1);
      expect(stats.byCategory.canvas).toBe(1);
      expect(stats.byCategory["3d"]).toBe(1);
      expect(stats.byCategory.shader).toBe(1);
    });
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = PlaygroundManager.getInstance();
      const instance2 = PlaygroundManager.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(playgroundManager);
    });
  });
});
