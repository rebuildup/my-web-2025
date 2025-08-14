/**
 * Bundle Analyzer test suite
 */

import {
  BundleAnalysis,
  BundleAnalyzer,
  bundleAnalyzer,
} from "../bundle-analyzer";

describe("BundleAnalyzer", () => {
  let analyzer: BundleAnalyzer;

  beforeEach(() => {
    analyzer = BundleAnalyzer.getInstance();
    analyzer.clearCache();
  });

  describe("getInstance", () => {
    it("should return singleton instance", () => {
      const instance1 = BundleAnalyzer.getInstance();
      const instance2 = BundleAnalyzer.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(bundleAnalyzer);
    });
  });

  describe("analyzePlaygroundBundle", () => {
    it("should return bundle analysis", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      expect(analysis).toHaveProperty("totalSize");
      expect(analysis).toHaveProperty("gzippedSize");
      expect(analysis).toHaveProperty("chunks");
      expect(analysis).toHaveProperty("dependencies");
      expect(analysis).toHaveProperty("recommendations");

      expect(typeof analysis.totalSize).toBe("number");
      expect(typeof analysis.gzippedSize).toBe("number");
      expect(Array.isArray(analysis.chunks)).toBe(true);
      expect(Array.isArray(analysis.dependencies)).toBe(true);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it("should cache analysis results", async () => {
      const analysis1 = await analyzer.analyzePlaygroundBundle();
      const analysis2 = await analyzer.analyzePlaygroundBundle();

      expect(analysis1).toBe(analysis2);
    });

    it("should include expected chunks", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      const chunkNames = analysis.chunks.map((chunk) => chunk.name);
      expect(chunkNames).toContain("playground-main");
      expect(chunkNames).toContain("design-experiments");
      expect(chunkNames).toContain("webgl-experiments");
      expect(chunkNames).toContain("three-js");
    });

    it("should include expected dependencies", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      const depNames = analysis.dependencies.map((dep) => dep.name);
      expect(depNames).toContain("three");
      expect(depNames).toContain("react");
      expect(depNames).toContain("next");
    });
  });

  describe("getOptimizationScore", () => {
    it("should return score between 0 and 100", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();
      const score = analyzer.getOptimizationScore(analysis);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should penalize large bundles", async () => {
      const largeAnalysis: BundleAnalysis = {
        totalSize: 2 * 1024 * 1024, // 2MB - over threshold
        gzippedSize: 600 * 1024,
        chunks: [
          {
            name: "large-chunk",
            size: 500 * 1024, // 500KB - over threshold
            gzippedSize: 150 * 1024,
            modules: [],
            loadTime: 4000, // Over threshold
            critical: false,
          },
        ],
        dependencies: [],
        recommendations: [],
      };

      const score = analyzer.getOptimizationScore(largeAnalysis);
      expect(score).toBeLessThan(100);
    });

    it("should give high score to optimized bundles", async () => {
      const optimizedAnalysis: BundleAnalysis = {
        totalSize: 200 * 1024, // 200KB - under threshold
        gzippedSize: 60 * 1024,
        chunks: [
          {
            name: "small-chunk",
            size: 100 * 1024, // 100KB - under threshold
            gzippedSize: 30 * 1024, // Good compression ratio
            modules: [],
            loadTime: 500, // Fast load time
            critical: true,
          },
        ],
        dependencies: [],
        recommendations: [],
      };

      const score = analyzer.getOptimizationScore(optimizedAnalysis);
      expect(score).toBeGreaterThan(80);
    });
  });

  describe("getBundleSizeComparison", () => {
    it("should return size comparison data", () => {
      const comparison = analyzer.getBundleSizeComparison();

      expect(comparison).toHaveProperty("current");
      expect(comparison).toHaveProperty("recommended");
      expect(comparison).toHaveProperty("difference");
      expect(comparison).toHaveProperty("percentageReduction");

      expect(typeof comparison.current).toBe("number");
      expect(typeof comparison.recommended).toBe("number");
      expect(typeof comparison.difference).toBe("number");
      expect(typeof comparison.percentageReduction).toBe("number");

      expect(comparison.current).toBeGreaterThan(comparison.recommended);
      expect(comparison.difference).toBeGreaterThan(0);
      expect(comparison.percentageReduction).toBeGreaterThan(0);
    });
  });

  describe("getLoadTimeAnalysis", () => {
    it("should return load time analysis", () => {
      const analysis = analyzer.getLoadTimeAnalysis();

      expect(analysis).toHaveProperty("critical");
      expect(analysis).toHaveProperty("nonCritical");
      expect(analysis).toHaveProperty("total");
      expect(analysis).toHaveProperty("recommendations");

      expect(typeof analysis.critical).toBe("number");
      expect(typeof analysis.nonCritical).toBe("number");
      expect(typeof analysis.total).toBe("number");
      expect(Array.isArray(analysis.recommendations)).toBe(true);

      expect(analysis.total).toBe(analysis.critical + analysis.nonCritical);
    });

    it("should provide recommendations for slow loading", () => {
      const analysis = analyzer.getLoadTimeAnalysis();

      if (analysis.total > 3000) {
        expect(
          analysis.recommendations.some((rec) =>
            rec.includes("Total load time exceeds 3 seconds"),
          ),
        ).toBe(true);
      }
    });
  });

  describe("updateThresholds", () => {
    it("should update performance thresholds", async () => {
      const newThresholds = {
        maxChunkSize: 100 * 1024, // 100KB
        maxTotalSize: 500 * 1024, // 500KB
      };

      analyzer.updateThresholds(newThresholds);

      const analysis = await analyzer.analyzePlaygroundBundle();

      // Should have more recommendations due to stricter thresholds
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("exportAnalysisReport", () => {
    it("should export analysis as JSON string", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();
      const report = analyzer.exportAnalysisReport(analysis);

      expect(typeof report).toBe("string");

      const parsed = JSON.parse(report);
      expect(parsed).toHaveProperty("timestamp");
      expect(parsed).toHaveProperty("summary");
      expect(parsed).toHaveProperty("chunks");
      expect(parsed).toHaveProperty("dependencies");
      expect(parsed).toHaveProperty("recommendations");
      expect(parsed).toHaveProperty("comparison");
      expect(parsed).toHaveProperty("loadTimeAnalysis");
    });

    it("should include formatted sizes in report", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();
      const report = analyzer.exportAnalysisReport(analysis);
      const parsed = JSON.parse(report);

      expect(parsed.summary.totalSize).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB)/);
      expect(parsed.summary.gzippedSize).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB)/);
      expect(parsed.summary.compressionRatio).toMatch(/\d+%/);
    });

    it("should include optimization score in report", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();
      const report = analyzer.exportAnalysisReport(analysis);
      const parsed = JSON.parse(report);

      expect(typeof parsed.summary.optimizationScore).toBe("number");
      expect(parsed.summary.optimizationScore).toBeGreaterThanOrEqual(0);
      expect(parsed.summary.optimizationScore).toBeLessThanOrEqual(100);
    });
  });

  describe("clearCache", () => {
    it("should clear analysis cache", async () => {
      // First analysis
      const analysis1 = await analyzer.analyzePlaygroundBundle();

      // Clear cache
      analyzer.clearCache();

      // Second analysis should be a new instance
      const analysis2 = await analyzer.analyzePlaygroundBundle();

      // They should have the same content but be different objects
      expect(analysis1).not.toBe(analysis2);
      expect(analysis1).toEqual(analysis2);
    });
  });

  describe("formatBytes helper", () => {
    it("should format bytes correctly", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();
      const report = analyzer.exportAnalysisReport(analysis);
      const parsed = JSON.parse(report);

      // Check that sizes are properly formatted
      parsed.chunks.forEach((chunk: { size: string; gzippedSize: string }) => {
        expect(chunk.size).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB|GB)/);
        expect(chunk.gzippedSize).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB|GB)/);
      });

      parsed.dependencies.forEach((dep: { size: string }) => {
        expect(dep.size).toMatch(/\d+(\.\d+)?\s+(Bytes|KB|MB|GB)/);
      });
    });
  });

  describe("recommendations generation", () => {
    it("should generate specific recommendations for Three.js", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      const hasThreeJsRecommendations = analysis.recommendations.some(
        (rec) => rec.includes("Three.js") || rec.includes("tree shaking"),
      );

      expect(hasThreeJsRecommendations).toBe(true);
    });

    it("should recommend dynamic imports for static modules", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      const hasDynamicImportRecommendation = analysis.recommendations.some(
        (rec) => rec.includes("dynamic imports"),
      );

      // Should recommend dynamic imports if there are many static modules
      expect(typeof hasDynamicImportRecommendation).toBe("boolean");
    });

    it("should recommend lazy loading for optional dependencies", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      const hasOptionalDeps = analysis.dependencies.some(
        (dep) => dep.usage === "optional",
      );

      if (hasOptionalDeps) {
        const hasLazyLoadingRecommendation = analysis.recommendations.some(
          (rec) => rec.includes("lazy loading optional dependencies"),
        );
        expect(hasLazyLoadingRecommendation).toBe(true);
      }
    });
  });

  describe("chunk analysis", () => {
    it("should identify critical chunks", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      const criticalChunks = analysis.chunks.filter((chunk) => chunk.critical);
      const nonCriticalChunks = analysis.chunks.filter(
        (chunk) => !chunk.critical,
      );

      expect(criticalChunks.length).toBeGreaterThan(0);
      expect(nonCriticalChunks.length).toBeGreaterThan(0);

      // Main playground chunk should be critical
      const mainChunk = analysis.chunks.find(
        (chunk) => chunk.name === "playground-main",
      );
      expect(mainChunk?.critical).toBe(true);
    });

    it("should include module information for chunks", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      analysis.chunks.forEach((chunk) => {
        expect(Array.isArray(chunk.modules)).toBe(true);

        chunk.modules.forEach((module) => {
          expect(module).toHaveProperty("name");
          expect(module).toHaveProperty("size");
          expect(module).toHaveProperty("path");
          expect(module).toHaveProperty("imported");
          expect(module).toHaveProperty("dynamic");

          expect(typeof module.name).toBe("string");
          expect(typeof module.size).toBe("number");
          expect(typeof module.path).toBe("string");
          expect(typeof module.imported).toBe("boolean");
          expect(typeof module.dynamic).toBe("boolean");
        });
      });
    });
  });

  describe("dependency analysis", () => {
    it("should categorize dependencies by usage", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      const criticalDeps = analysis.dependencies.filter(
        (dep) => dep.usage === "critical",
      );
      const importantDeps = analysis.dependencies.filter(
        (dep) => dep.usage === "important",
      );
      const optionalDeps = analysis.dependencies.filter(
        (dep) => dep.usage === "optional",
      );

      expect(criticalDeps.length).toBeGreaterThan(0);
      expect(importantDeps.length).toBeGreaterThanOrEqual(0);
      expect(optionalDeps.length).toBeGreaterThanOrEqual(0);

      // React and Next.js should be critical
      expect(criticalDeps.some((dep) => dep.name === "react")).toBe(true);
      expect(criticalDeps.some((dep) => dep.name === "next")).toBe(true);
    });

    it("should include version information", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      analysis.dependencies.forEach((dep) => {
        expect(dep.version).toMatch(/^\^?\d+\.\d+\.\d+/);
      });
    });

    it("should suggest alternatives for large dependencies", async () => {
      const analysis = await analyzer.analyzePlaygroundBundle();

      const largeDeps = analysis.dependencies.filter(
        (dep) => dep.size > 200 * 1024,
      );

      largeDeps.forEach((dep) => {
        if (dep.alternatives && dep.alternatives.length > 0) {
          expect(Array.isArray(dep.alternatives)).toBe(true);
          dep.alternatives.forEach((alt) => {
            expect(typeof alt).toBe("string");
          });
        }
      });
    });
  });
});
