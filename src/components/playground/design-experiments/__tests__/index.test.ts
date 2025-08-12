/**
 * Design Experiments Index Tests
 * Tests for design experiments exports and metadata
 */

import { designExperiments } from "../experiments-data";
import * as DesignExperimentsIndex from "../index";

describe("Design Experiments Index", () => {
  it("should export all experiment components", () => {
    expect(DesignExperimentsIndex.CanvasParticleExperiment).toBeDefined();
    expect(DesignExperimentsIndex.ColorPaletteExperiment).toBeDefined();
    expect(DesignExperimentsIndex.CSSGridExperiment).toBeDefined();
    expect(DesignExperimentsIndex.InteractiveShapesExperiment).toBeDefined();
    expect(DesignExperimentsIndex.SVGAnimationExperiment).toBeDefined();
    expect(DesignExperimentsIndex.TypographyAnimationExperiment).toBeDefined();
  });

  it("should export experiments data", () => {
    expect(DesignExperimentsIndex.designExperiments).toBeDefined();
    expect(Array.isArray(DesignExperimentsIndex.designExperiments)).toBe(true);
    expect(DesignExperimentsIndex.designExperiments.length).toBeGreaterThan(0);
  });

  it("should have consistent experiment data structure", () => {
    designExperiments.forEach((experiment) => {
      expect(experiment).toHaveProperty("id");
      expect(experiment).toHaveProperty("title");
      expect(experiment).toHaveProperty("description");
      expect(experiment).toHaveProperty("technology");
      expect(experiment).toHaveProperty("interactive");
      expect(experiment).toHaveProperty("component");
      expect(experiment).toHaveProperty("category");
      expect(experiment).toHaveProperty("difficulty");
      expect(experiment).toHaveProperty("performanceLevel");
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
      expect(typeof experiment.difficulty).toBe("string");
      expect(typeof experiment.performanceLevel).toBe("string");
      expect(typeof experiment.createdAt).toBe("string");
      expect(typeof experiment.updatedAt).toBe("string");
    });
  });

  it("should have unique experiment IDs", () => {
    const ids = designExperiments.map((exp) => exp.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have valid categories", () => {
    const validCategories = ["css", "animation", "svg", "canvas"];
    designExperiments.forEach((experiment) => {
      expect(validCategories).toContain(experiment.category);
    });
  });

  it("should have valid difficulty levels", () => {
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    designExperiments.forEach((experiment) => {
      expect(validDifficulties).toContain(experiment.difficulty);
    });
  });

  it("should have valid performance levels", () => {
    const validPerformanceLevels = ["low", "medium", "high"];
    designExperiments.forEach((experiment) => {
      expect(validPerformanceLevels).toContain(experiment.performanceLevel);
    });
  });
});
