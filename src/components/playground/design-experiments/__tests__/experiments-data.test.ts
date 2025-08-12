/**
 * Design Experiments Data Tests
 * Tests for experiment data and utility functions
 */

import {
  designExperiments,
  getExperimentById,
  getExperimentsByCategory,
  getExperimentsByDifficulty,
  getExperimentsByPerformance,
} from "../experiments-data";

describe("Design Experiments Data", () => {
  describe("designExperiments array", () => {
    it("should contain experiments", () => {
      expect(Array.isArray(designExperiments)).toBe(true);
      expect(designExperiments.length).toBeGreaterThan(0);
    });

    it("should have experiments with required properties", () => {
      designExperiments.forEach((experiment) => {
        expect(experiment.id).toBeDefined();
        expect(experiment.title).toBeDefined();
        expect(experiment.description).toBeDefined();
        expect(experiment.technology).toBeDefined();
        expect(experiment.component).toBeDefined();
        expect(experiment.category).toBeDefined();
        expect(experiment.difficulty).toBeDefined();
        expect(experiment.performanceLevel).toBeDefined();
      });
    });

    it("should have valid date formats", () => {
      designExperiments.forEach((experiment) => {
        expect(() => new Date(experiment.createdAt)).not.toThrow();
        expect(() => new Date(experiment.updatedAt)).not.toThrow();
      });
    });
  });

  describe("getExperimentsByCategory", () => {
    it("should return all experiments for 'all' category", () => {
      const result = getExperimentsByCategory("all");
      expect(result).toEqual(designExperiments);
    });

    it("should filter experiments by category", () => {
      const cssExperiments = getExperimentsByCategory("css");
      expect(cssExperiments.every((exp) => exp.category === "css")).toBe(true);
    });

    it("should return empty array for non-existent category", () => {
      const result = getExperimentsByCategory("non-existent");
      expect(result).toEqual([]);
    });

    it("should handle case sensitivity", () => {
      const result = getExperimentsByCategory("CSS");
      expect(result).toEqual([]);
    });
  });

  describe("getExperimentById", () => {
    it("should return experiment by ID", () => {
      const firstExperiment = designExperiments[0];
      const result = getExperimentById(firstExperiment.id);
      expect(result).toEqual(firstExperiment);
    });

    it("should return undefined for non-existent ID", () => {
      const result = getExperimentById("non-existent-id");
      expect(result).toBeUndefined();
    });

    it("should handle empty string ID", () => {
      const result = getExperimentById("");
      expect(result).toBeUndefined();
    });
  });

  describe("getExperimentsByDifficulty", () => {
    it("should filter experiments by difficulty", () => {
      const beginnerExperiments = getExperimentsByDifficulty("beginner");
      expect(
        beginnerExperiments.every((exp) => exp.difficulty === "beginner"),
      ).toBe(true);
    });

    it("should return empty array for non-existent difficulty", () => {
      const result = getExperimentsByDifficulty("expert");
      expect(result).toEqual([]);
    });

    it("should handle all difficulty levels", () => {
      const difficulties = ["beginner", "intermediate", "advanced"];
      difficulties.forEach((difficulty) => {
        const result = getExperimentsByDifficulty(difficulty);
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe("getExperimentsByPerformance", () => {
    it("should filter experiments by performance level", () => {
      const lowPerfExperiments = getExperimentsByPerformance("low");
      expect(
        lowPerfExperiments.every((exp) => exp.performanceLevel === "low"),
      ).toBe(true);
    });

    it("should return empty array for non-existent performance level", () => {
      const result = getExperimentsByPerformance("ultra");
      expect(result).toEqual([]);
    });

    it("should handle all performance levels", () => {
      const levels = ["low", "medium", "high"];
      levels.forEach((level) => {
        const result = getExperimentsByPerformance(level);
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe("data consistency", () => {
    it("should have consistent technology arrays", () => {
      designExperiments.forEach((experiment) => {
        expect(Array.isArray(experiment.technology)).toBe(true);
        expect(experiment.technology.length).toBeGreaterThan(0);
        experiment.technology.forEach((tech) => {
          expect(typeof tech).toBe("string");
          expect(tech.length).toBeGreaterThan(0);
        });
      });
    });

    it("should have valid animation types", () => {
      const validAnimationTypes = ["click", "continuous", "hover"];
      designExperiments.forEach((experiment) => {
        if (experiment.animationType) {
          expect(validAnimationTypes).toContain(experiment.animationType);
        }
      });
    });

    it("should have valid color schemes", () => {
      const validColorSchemes = ["hsl", "dynamic", "gradient"];
      designExperiments.forEach((experiment) => {
        if (experiment.colorScheme) {
          expect(Array.isArray(experiment.colorScheme)).toBe(true);
          experiment.colorScheme.forEach((scheme) => {
            expect(validColorSchemes).toContain(scheme);
          });
        }
      });
    });
  });
});
