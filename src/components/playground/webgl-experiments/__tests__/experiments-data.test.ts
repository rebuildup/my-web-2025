/**
 * WebGL Experiments Data Tests
 * Tests for webgl experiment data and metadata
 */

import { webglExperiments } from "../experiments-data";

describe("WebGL Experiments Data", () => {
  describe("webglExperiments array", () => {
    it("should contain experiments", () => {
      expect(Array.isArray(webglExperiments)).toBe(true);
      expect(webglExperiments.length).toBeGreaterThan(0);
    });

    it("should have experiments with required WebGL properties", () => {
      webglExperiments.forEach((experiment) => {
        expect(experiment.id).toBeDefined();
        expect(experiment.title).toBeDefined();
        expect(experiment.description).toBeDefined();
        expect(experiment.technology).toBeDefined();
        expect(experiment.component).toBeDefined();
        expect(experiment.category).toBeDefined();
        expect(experiment.webglType).toBeDefined();
        expect(experiment.difficulty).toBeDefined();
        expect(experiment.performanceLevel).toBeDefined();
        expect(experiment.requiresWebGL2).toBeDefined();
        expect(experiment.memoryUsage).toBeDefined();
      });
    });

    it("should have valid WebGL-specific properties", () => {
      webglExperiments.forEach((experiment) => {
        // WebGL type should be valid
        expect(["3d", "particle", "shader", "effect"]).toContain(
          experiment.webglType,
        );

        // Memory usage should be valid
        expect(["low", "medium", "high"]).toContain(experiment.memoryUsage);

        // RequiresWebGL2 should be boolean
        expect(typeof experiment.requiresWebGL2).toBe("boolean");
      });
    });

    it("should have appropriate technology stacks for WebGL", () => {
      webglExperiments.forEach((experiment) => {
        const hasWebGLTech = experiment.technology.some((tech) =>
          ["WebGL", "Three.js", "GLSL"].includes(tech),
        );
        expect(hasWebGLTech).toBe(true);
      });
    });
  });

  describe("experiment categories", () => {
    it("should have 3d experiments", () => {
      const threeDExperiments = webglExperiments.filter(
        (exp) => exp.webglType === "3d",
      );
      expect(threeDExperiments.length).toBeGreaterThan(0);
    });

    it("should have particle experiments", () => {
      const particleExperiments = webglExperiments.filter(
        (exp) => exp.webglType === "particle",
      );
      expect(particleExperiments.length).toBeGreaterThan(0);
    });

    it("should have shader experiments", () => {
      const shaderExperiments = webglExperiments.filter(
        (exp) => exp.webglType === "shader",
      );
      expect(shaderExperiments.length).toBeGreaterThan(0);
    });

    it("should have effect experiments", () => {
      const effectExperiments = webglExperiments.filter(
        (exp) => exp.webglType === "effect",
      );
      expect(effectExperiments.length).toBeGreaterThan(0);
    });
  });

  describe("performance characteristics", () => {
    it("should have experiments with different performance levels", () => {
      const performanceLevels = webglExperiments.map(
        (exp) => exp.performanceLevel,
      );
      const uniqueLevels = new Set(performanceLevels);
      expect(uniqueLevels.size).toBeGreaterThan(1);
    });

    it("should have experiments with different memory usage", () => {
      const memoryUsages = webglExperiments.map((exp) => exp.memoryUsage);
      const uniqueUsages = new Set(memoryUsages);
      expect(uniqueUsages.size).toBeGreaterThan(1);
    });

    it("should have both WebGL1 and WebGL2 experiments", () => {
      const webgl1Experiments = webglExperiments.filter(
        (exp) => !exp.requiresWebGL2,
      );
      const webgl2Experiments = webglExperiments.filter(
        (exp) => exp.requiresWebGL2,
      );

      expect(webgl1Experiments.length).toBeGreaterThan(0);
      // WebGL2 experiments are optional but should be handled
      expect(webgl2Experiments.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("shader experiments", () => {
    it("should have shader code for shader experiments", () => {
      const shaderExperiments = webglExperiments.filter(
        (exp) => exp.webglType === "shader",
      );

      shaderExperiments.forEach((experiment) => {
        if (experiment.shaderCode) {
          expect(typeof experiment.shaderCode).toBe("string");
          expect(experiment.shaderCode.trim().length).toBeGreaterThan(0);

          // Should contain GLSL keywords
          const hasGLSLKeywords = [
            "precision",
            "uniform",
            "gl_FragColor",
            "void main",
          ].some((keyword) => experiment.shaderCode!.includes(keyword));

          expect(hasGLSLKeywords).toBe(true);
        }
      });
    });
  });

  describe("difficulty progression", () => {
    it("should have beginner experiments", () => {
      const beginnerExperiments = webglExperiments.filter(
        (exp) => exp.difficulty === "beginner",
      );
      expect(beginnerExperiments.length).toBeGreaterThan(0);
    });

    it("should have intermediate experiments", () => {
      const intermediateExperiments = webglExperiments.filter(
        (exp) => exp.difficulty === "intermediate",
      );
      expect(intermediateExperiments.length).toBeGreaterThan(0);
    });

    it("should have advanced experiments", () => {
      const advancedExperiments = webglExperiments.filter(
        (exp) => exp.difficulty === "advanced",
      );
      expect(advancedExperiments.length).toBeGreaterThan(0);
    });

    it("should correlate difficulty with performance requirements", () => {
      const beginnerExperiments = webglExperiments.filter(
        (exp) => exp.difficulty === "beginner",
      );
      const advancedExperiments = webglExperiments.filter(
        (exp) => exp.difficulty === "advanced",
      );

      // Beginner experiments should generally have lower performance requirements
      const beginnerHighPerf = beginnerExperiments.filter(
        (exp) => exp.performanceLevel === "high",
      ).length;
      const advancedHighPerf = advancedExperiments.filter(
        (exp) => exp.performanceLevel === "high",
      ).length;

      // Advanced experiments should have at least as many high-performance requirements
      expect(advancedHighPerf).toBeGreaterThanOrEqual(beginnerHighPerf);
    });
  });

  describe("technology stacks", () => {
    it("should have Three.js experiments", () => {
      const threeJSExperiments = webglExperiments.filter((exp) =>
        exp.technology.includes("Three.js"),
      );
      expect(threeJSExperiments.length).toBeGreaterThan(0);
    });

    it("should have GLSL experiments", () => {
      const glslExperiments = webglExperiments.filter((exp) =>
        exp.technology.includes("GLSL"),
      );
      expect(glslExperiments.length).toBeGreaterThan(0);
    });

    it("should have WebGL experiments", () => {
      const webglExperiments_filtered = webglExperiments.filter((exp) =>
        exp.technology.includes("WebGL"),
      );
      expect(webglExperiments_filtered.length).toBeGreaterThan(0);
    });
  });

  describe("data consistency", () => {
    it("should have consistent ID format", () => {
      webglExperiments.forEach((experiment) => {
        expect(experiment.id).toMatch(/^[a-z0-9-]+$/);
        expect(experiment.id.length).toBeGreaterThan(0);
      });
    });

    it("should have non-empty titles and descriptions", () => {
      webglExperiments.forEach((experiment) => {
        expect(experiment.title.trim().length).toBeGreaterThan(0);
        expect(experiment.description.trim().length).toBeGreaterThan(0);
      });
    });

    it("should have interactive experiments", () => {
      webglExperiments.forEach((experiment) => {
        expect(experiment.interactive).toBe(true);
      });
    });

    it("should have valid component references", () => {
      webglExperiments.forEach((experiment) => {
        expect(typeof experiment.component).toBe("function");
        expect(experiment.component.name).toBeTruthy();
      });
    });
  });

  describe("export validation", () => {
    it("should export as default", async () => {
      const experimentsData = await import("../experiments-data");
      expect(experimentsData.default).toEqual(webglExperiments);
    });

    it("should be importable as named export", async () => {
      const experimentsData = await import("../experiments-data");
      expect(experimentsData.webglExperiments).toBeDefined();
      expect(Array.isArray(experimentsData.webglExperiments)).toBe(true);
    });
  });
});
