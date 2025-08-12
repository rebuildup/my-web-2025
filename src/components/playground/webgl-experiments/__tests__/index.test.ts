/**
 * WebGL Experiments Index Tests
 * Tests for webgl experiments exports and metadata
 */

import { webglExperiments } from "../experiments-data";
import * as WebGLExperimentsIndex from "../index";

describe("WebGL Experiments Index", () => {
  it("should export all experiment components", () => {
    expect(WebGLExperimentsIndex.BasicGeometryExperiment).toBeDefined();
    expect(WebGLExperimentsIndex.ParticleSystemExperiment).toBeDefined();
    expect(WebGLExperimentsIndex.PhysicsSimulationExperiment).toBeDefined();
    expect(WebGLExperimentsIndex.ShaderExperiment).toBeDefined();
  });

  it("should export experiments data", () => {
    expect(WebGLExperimentsIndex.webglExperiments).toBeDefined();
    expect(Array.isArray(WebGLExperimentsIndex.webglExperiments)).toBe(true);
    expect(WebGLExperimentsIndex.webglExperiments.length).toBeGreaterThan(0);
  });

  it("should have consistent experiment data structure", () => {
    webglExperiments.forEach((experiment) => {
      expect(experiment).toHaveProperty("id");
      expect(experiment).toHaveProperty("title");
      expect(experiment).toHaveProperty("description");
      expect(experiment).toHaveProperty("technology");
      expect(experiment).toHaveProperty("interactive");
      expect(experiment).toHaveProperty("component");
      expect(experiment).toHaveProperty("category");
      expect(experiment).toHaveProperty("webglType");
      expect(experiment).toHaveProperty("difficulty");
      expect(experiment).toHaveProperty("performanceLevel");
      expect(experiment).toHaveProperty("requiresWebGL2");
      expect(experiment).toHaveProperty("memoryUsage");
      expect(experiment).toHaveProperty("createdAt");
      expect(experiment).toHaveProperty("updatedAt");

      // Validate types
      expect(typeof experiment.id).toBe("string");
      expect(typeof experiment.title).toBe("string");
      expect(typeof experiment.description).toBe("string");
      expect(Array.isArray(experiment.technology)).toBe(true);
      expect(typeof experiment.interactive).toBe("boolean");
      expect(typeof experiment.component).toBe("function");
      expect(typeof experiment.category).toBe("string");
      expect(typeof experiment.webglType).toBe("string");
      expect(typeof experiment.difficulty).toBe("string");
      expect(typeof experiment.performanceLevel).toBe("string");
      expect(typeof experiment.requiresWebGL2).toBe("boolean");
      expect(typeof experiment.memoryUsage).toBe("string");
      expect(typeof experiment.createdAt).toBe("string");
      expect(typeof experiment.updatedAt).toBe("string");
    });
  });

  it("should have unique experiment IDs", () => {
    const ids = webglExperiments.map((exp) => exp.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid categories", () => {
    const validCategories = ["3d", "particle", "shader", "effect"];
    webglExperiments.forEach((experiment) => {
      expect(validCategories).toContain(experiment.category);
    });
  });

  it("should have valid webgl types", () => {
    const validWebGLTypes = ["3d", "particle", "shader", "effect"];
    webglExperiments.forEach((experiment) => {
      expect(validWebGLTypes).toContain(experiment.webglType);
    });
  });

  it("should have valid difficulty levels", () => {
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    webglExperiments.forEach((experiment) => {
      expect(validDifficulties).toContain(experiment.difficulty);
    });
  });

  it("should have valid performance levels", () => {
    const validPerformanceLevels = ["low", "medium", "high"];
    webglExperiments.forEach((experiment) => {
      expect(validPerformanceLevels).toContain(experiment.performanceLevel);
    });
  });

  it("should have valid memory usage levels", () => {
    const validMemoryUsage = ["low", "medium", "high"];
    webglExperiments.forEach((experiment) => {
      expect(validMemoryUsage).toContain(experiment.memoryUsage);
    });
  });

  it("should have consistent technology arrays", () => {
    webglExperiments.forEach((experiment) => {
      expect(Array.isArray(experiment.technology)).toBe(true);
      expect(experiment.technology.length).toBeGreaterThan(0);
      experiment.technology.forEach((tech) => {
        expect(typeof tech).toBe("string");
        expect(tech.length).toBeGreaterThan(0);
      });
    });
  });

  it("should have valid date formats", () => {
    webglExperiments.forEach((experiment) => {
      expect(() => new Date(experiment.createdAt)).not.toThrow();
      expect(() => new Date(experiment.updatedAt)).not.toThrow();
    });
  });

  it("should have shader code for shader experiments", () => {
    const shaderExperiments = webglExperiments.filter(
      (exp) => exp.webglType === "shader",
    );

    shaderExperiments.forEach((experiment) => {
      if (experiment.shaderCode) {
        expect(typeof experiment.shaderCode).toBe("string");
        expect(experiment.shaderCode.length).toBeGreaterThan(0);
      }
    });
  });
});
