/**
 * Color utility functions comprehensive test suite
 */

import {
  clampColor,
  ColorInfo,
  deltaE,
  generateColorHarmony,
  generateGoldenRatioColors,
  generatePerceptuallyUniformColors,
  getAccessibilityInfo,
  getContrastRatio,
  getLuminance,
  hexToRgb,
  hslToRgb,
  HSVColor,
  hsvToRgb,
  isColorBlindSafe,
  LABColor,
  randomInRange,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToLab,
  sortColorsByHue,
  sortColorsByLightness,
  sortColorsBySaturation,
} from "../color";

describe("Color conversion functions", () => {
  describe("hsvToRgb", () => {
    it("should convert HSV to RGB correctly", () => {
      expect(hsvToRgb(0, 100, 100)).toEqual({ r: 255, g: 0, b: 0 }); // Red
      expect(hsvToRgb(120, 100, 100)).toEqual({ r: 0, g: 255, b: 0 }); // Green
      expect(hsvToRgb(240, 100, 100)).toEqual({ r: 0, g: 0, b: 255 }); // Blue
      expect(hsvToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 }); // White
      expect(hsvToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 }); // Black
    });

    it("should handle intermediate values", () => {
      const result = hsvToRgb(60, 50, 75);
      expect(result.r).toBeCloseTo(191, 0);
      expect(result.g).toBeCloseTo(191, 0);
      expect(result.b).toBeCloseTo(96, 0);
    });

    it("should handle edge cases", () => {
      expect(hsvToRgb(360, 100, 100)).toEqual({ r: 255, g: 0, b: 0 }); // 360° = 0°
      expect(hsvToRgb(-60, 100, 100)).toEqual({ r: 255, g: 0, b: 255 }); // Negative hue
    });
  });

  describe("rgbToHsv", () => {
    it("should convert RGB to HSV correctly", () => {
      expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 }); // Red
      expect(rgbToHsv(0, 255, 0)).toEqual({ h: 120, s: 100, v: 100 }); // Green
      expect(rgbToHsv(0, 0, 255)).toEqual({ h: 240, s: 100, v: 100 }); // Blue
      expect(rgbToHsv(255, 255, 255)).toEqual({ h: 0, s: 0, v: 100 }); // White
      expect(rgbToHsv(0, 0, 0)).toEqual({ h: 0, s: 0, v: 0 }); // Black
    });

    it("should handle grayscale colors", () => {
      expect(rgbToHsv(128, 128, 128)).toEqual({ h: 0, s: 0, v: 50 });
    });
  });

  describe("rgbToHsl", () => {
    it("should convert RGB to HSL correctly", () => {
      expect(rgbToHsl(255, 0, 0)).toEqual({ h: 0, s: 100, l: 50 }); // Red
      expect(rgbToHsl(0, 255, 0)).toEqual({ h: 120, s: 100, l: 50 }); // Green
      expect(rgbToHsl(0, 0, 255)).toEqual({ h: 240, s: 100, l: 50 }); // Blue
      expect(rgbToHsl(255, 255, 255)).toEqual({ h: 0, s: 0, l: 100 }); // White
      expect(rgbToHsl(0, 0, 0)).toEqual({ h: 0, s: 0, l: 0 }); // Black
    });
  });

  describe("hslToRgb", () => {
    it("should convert HSL to RGB correctly", () => {
      expect(hslToRgb(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 }); // Red
      expect(hslToRgb(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 }); // Green
      expect(hslToRgb(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 }); // Blue
      expect(hslToRgb(0, 0, 100)).toEqual({ r: 255, g: 255, b: 255 }); // White
      expect(hslToRgb(0, 0, 0)).toEqual({ r: 0, g: 0, b: 0 }); // Black
    });

    it("should handle achromatic colors", () => {
      expect(hslToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 }); // Gray
    });
  });

  describe("rgbToLab", () => {
    it("should convert RGB to LAB color space", () => {
      const lab = rgbToLab(255, 255, 255); // White
      expect(lab.l).toBeCloseTo(100, 0);
      expect(lab.a).toBeCloseTo(0, 0);
      expect(lab.b).toBeCloseTo(0, 0);
    });

    it("should handle black color", () => {
      const lab = rgbToLab(0, 0, 0); // Black
      expect(lab.l).toBeCloseTo(0, 0);
    });
  });

  describe("rgbToHex", () => {
    it("should convert RGB to hex correctly", () => {
      expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
      expect(rgbToHex(0, 255, 0)).toBe("#00ff00");
      expect(rgbToHex(0, 0, 255)).toBe("#0000ff");
      expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
      expect(rgbToHex(0, 0, 0)).toBe("#000000");
    });

    it("should handle single digit hex values", () => {
      expect(rgbToHex(15, 15, 15)).toBe("#0f0f0f");
    });
  });

  describe("hexToRgb", () => {
    it("should convert hex to RGB correctly", () => {
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    });

    it("should handle hex without # prefix", () => {
      expect(hexToRgb("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should return null for invalid hex", () => {
      expect(hexToRgb("invalid")).toBeNull();
      expect(hexToRgb("#gggggg")).toBeNull();
    });
  });
});

describe("Accessibility functions", () => {
  describe("getLuminance", () => {
    it("should calculate luminance correctly", () => {
      expect(getLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2); // White
      expect(getLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 2); // Black
    });

    it("should handle intermediate values", () => {
      const luminance = getLuminance({ r: 128, g: 128, b: 128 });
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe("getContrastRatio", () => {
    it("should calculate contrast ratio correctly", () => {
      const white = { r: 255, g: 255, b: 255 };
      const black = { r: 0, g: 0, b: 0 };

      expect(getContrastRatio(white, black)).toBeCloseTo(21, 0);
      expect(getContrastRatio(white, white)).toBeCloseTo(1, 0);
      expect(getContrastRatio(black, black)).toBeCloseTo(1, 0);
    });

    it("should be symmetric", () => {
      const color1 = { r: 255, g: 0, b: 0 };
      const color2 = { r: 0, g: 255, b: 0 };

      expect(getContrastRatio(color1, color2)).toBeCloseTo(
        getContrastRatio(color2, color1),
        2,
      );
    });
  });

  describe("getAccessibilityInfo", () => {
    it("should provide accessibility information", () => {
      const red = { r: 255, g: 0, b: 0 };
      const info = getAccessibilityInfo(red);

      expect(info).toHaveProperty("contrastWithWhite");
      expect(info).toHaveProperty("contrastWithBlack");
      expect(info).toHaveProperty("wcagAA");
      expect(info).toHaveProperty("wcagAAA");
      expect(info).toHaveProperty("colorBlindSafe");
      expect(info).toHaveProperty("readableOnWhite");
      expect(info).toHaveProperty("readableOnBlack");

      expect(typeof info.wcagAA).toBe("boolean");
      expect(typeof info.wcagAAA).toBe("boolean");
    });

    it("should correctly identify WCAG compliance", () => {
      const darkBlue = { r: 0, g: 0, b: 139 }; // Should be readable on white
      const info = getAccessibilityInfo(darkBlue);

      expect(info.readableOnWhite).toBe(true);
    });
  });

  describe("isColorBlindSafe", () => {
    it("should identify color blind safe colors", () => {
      const highSaturation = { r: 255, g: 0, b: 0 }; // Red with high saturation
      const lowSaturation = { r: 200, g: 190, b: 190 }; // Low saturation

      expect(isColorBlindSafe(highSaturation)).toBe(true);
      expect(isColorBlindSafe(lowSaturation)).toBe(false);
    });
  });
});

describe("Color harmony generation", () => {
  describe("generateColorHarmony", () => {
    const baseColor: HSVColor = { h: 0, s: 80, v: 80 }; // Red

    it("should generate monochromatic harmony", () => {
      const harmony = generateColorHarmony(baseColor, "monochromatic");

      expect(harmony.type).toBe("monochromatic");
      expect(harmony.colors).toHaveLength(5); // Base + 4 variations
      expect(harmony.description).toContain("Same hue");

      // All colors should have the same hue
      harmony.colors.forEach((color) => {
        expect(color.hsv.h).toBe(baseColor.h);
      });
    });

    it("should generate analogous harmony", () => {
      const harmony = generateColorHarmony(baseColor, "analogous");

      expect(harmony.type).toBe("analogous");
      expect(harmony.colors).toHaveLength(5); // Base + 4 variations
      expect(harmony.description).toContain("Adjacent colors");
    });

    it("should generate complementary harmony", () => {
      const harmony = generateColorHarmony(baseColor, "complementary");

      expect(harmony.type).toBe("complementary");
      expect(harmony.colors).toHaveLength(2); // Base + complement
      expect(harmony.description).toContain("Opposite colors");

      // Complementary color should be 180° away
      expect(harmony.colors[1].hsv.h).toBe((baseColor.h + 180) % 360);
    });

    it("should generate triadic harmony", () => {
      const harmony = generateColorHarmony(baseColor, "triadic");

      expect(harmony.type).toBe("triadic");
      expect(harmony.colors).toHaveLength(3); // Base + 2 triadic colors
      expect(harmony.description).toContain("equally spaced");
    });

    it("should generate tetradic harmony", () => {
      const harmony = generateColorHarmony(baseColor, "tetradic");

      expect(harmony.type).toBe("tetradic");
      expect(harmony.colors).toHaveLength(4); // Base + 3 tetradic colors
      expect(harmony.description).toContain("rectangle");
    });

    it("should generate split-complementary harmony", () => {
      const harmony = generateColorHarmony(baseColor, "split-complementary");

      expect(harmony.type).toBe("split-complementary");
      expect(harmony.colors).toHaveLength(3); // Base + 2 split-complementary colors
      expect(harmony.description).toContain(
        "Base color plus two colors adjacent to its complement",
      );
    });

    it("should include accessibility information for all colors", () => {
      const harmony = generateColorHarmony(baseColor, "monochromatic");

      harmony.colors.forEach((color) => {
        expect(color.accessibility).toBeDefined();
        expect(color.accessibility?.wcagAA).toBeDefined();
        expect(color.accessibility?.contrastWithWhite).toBeGreaterThan(0);
      });
    });
  });

  describe("generateGoldenRatioColors", () => {
    it("should generate colors using golden ratio", () => {
      const colors = generateGoldenRatioColors(0, 5);

      expect(colors).toHaveLength(5);

      colors.forEach((color) => {
        expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
        expect(color.hsv.h).toBeGreaterThanOrEqual(0);
        expect(color.hsv.h).toBeLessThan(360);
        expect(color.accessibility).toBeDefined();
      });
    });

    it("should generate different hues based on golden ratio", () => {
      const colors = generateGoldenRatioColors(0, 3);

      // Hues should be different
      expect(colors[0].hsv.h).not.toBe(colors[1].hsv.h);
      expect(colors[1].hsv.h).not.toBe(colors[2].hsv.h);
    });
  });

  describe("generatePerceptuallyUniformColors", () => {
    it("should generate perceptually uniform colors", () => {
      const colors = generatePerceptuallyUniformColors(4);

      expect(colors).toHaveLength(4);

      colors.forEach((color) => {
        expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
        expect(color.lab).toBeDefined();
        expect(color.lab?.l).toBeGreaterThanOrEqual(50);
        expect(color.lab?.l).toBeLessThanOrEqual(90);
      });
    });
  });
});

describe("Utility functions", () => {
  describe("randomInRange", () => {
    it("should generate random numbers in range", () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInRange(10, 20);
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThanOrEqual(20);
      }
    });

    it("should handle negative ranges", () => {
      const value = randomInRange(-10, -5);
      expect(value).toBeGreaterThanOrEqual(-10);
      expect(value).toBeLessThanOrEqual(-5);
    });
  });

  describe("clampColor", () => {
    it("should clamp values to valid range", () => {
      expect(clampColor(300)).toBe(255);
      expect(clampColor(-50)).toBe(0);
      expect(clampColor(128)).toBe(128);
    });

    it("should handle custom ranges", () => {
      expect(clampColor(150, 0, 100)).toBe(100);
      expect(clampColor(50, 60, 80)).toBe(60);
    });

    it("should round values", () => {
      expect(clampColor(128.7)).toBe(129);
      expect(clampColor(128.3)).toBe(128);
    });
  });

  describe("deltaE", () => {
    it("should calculate color difference in LAB space", () => {
      const lab1: LABColor = { l: 50, a: 0, b: 0 };
      const lab2: LABColor = { l: 60, a: 0, b: 0 };

      const difference = deltaE(lab1, lab2);
      expect(difference).toBeCloseTo(10, 1);
    });

    it("should return 0 for identical colors", () => {
      const lab: LABColor = { l: 50, a: 20, b: -10 };

      expect(deltaE(lab, lab)).toBe(0);
    });
  });

  describe("Color sorting functions", () => {
    const colors: ColorInfo[] = [
      {
        hex: "#ff0000",
        rgb: { r: 255, g: 0, b: 0 },
        hsv: { h: 0, s: 100, v: 100 },
        hsl: { h: 0, s: 100, l: 50 },
      },
      {
        hex: "#00ff00",
        rgb: { r: 0, g: 255, b: 0 },
        hsv: { h: 120, s: 100, v: 100 },
        hsl: { h: 120, s: 100, l: 50 },
      },
      {
        hex: "#0000ff",
        rgb: { r: 0, g: 0, b: 255 },
        hsv: { h: 240, s: 100, v: 100 },
        hsl: { h: 240, s: 100, l: 50 },
      },
    ];

    describe("sortColorsByHue", () => {
      it("should sort colors by hue", () => {
        const shuffled = [colors[2], colors[0], colors[1]]; // Blue, Red, Green
        const sorted = sortColorsByHue(shuffled);

        expect(sorted[0].hsv.h).toBe(0); // Red
        expect(sorted[1].hsv.h).toBe(120); // Green
        expect(sorted[2].hsv.h).toBe(240); // Blue
      });

      it("should not mutate original array", () => {
        const original = [...colors];
        sortColorsByHue(colors);

        expect(colors).toEqual(original);
      });
    });

    describe("sortColorsByLightness", () => {
      it("should sort colors by lightness", () => {
        const darkColors: ColorInfo[] = [
          { ...colors[0], hsl: { h: 0, s: 100, l: 80 } },
          { ...colors[1], hsl: { h: 120, s: 100, l: 20 } },
          { ...colors[2], hsl: { h: 240, s: 100, l: 50 } },
        ];

        const sorted = sortColorsByLightness(darkColors);

        expect(sorted[0].hsl.l).toBe(20);
        expect(sorted[1].hsl.l).toBe(50);
        expect(sorted[2].hsl.l).toBe(80);
      });
    });

    describe("sortColorsBySaturation", () => {
      it("should sort colors by saturation", () => {
        const varyingSaturation: ColorInfo[] = [
          { ...colors[0], hsv: { h: 0, s: 80, v: 100 } },
          { ...colors[1], hsv: { h: 120, s: 20, v: 100 } },
          { ...colors[2], hsv: { h: 240, s: 50, v: 100 } },
        ];

        const sorted = sortColorsBySaturation(varyingSaturation);

        expect(sorted[0].hsv.s).toBe(20);
        expect(sorted[1].hsv.s).toBe(50);
        expect(sorted[2].hsv.s).toBe(80);
      });
    });
  });
});

describe("Edge cases and error handling", () => {
  it("should handle extreme HSV values", () => {
    expect(() => hsvToRgb(720, 200, 200)).not.toThrow();
    expect(() => hsvToRgb(-180, -50, -50)).not.toThrow();
  });

  it("should handle extreme RGB values", () => {
    expect(() => rgbToHsv(300, -50, 500)).not.toThrow();
    expect(() => rgbToHex(300, -50, 500)).not.toThrow();
  });

  it("should handle division by zero in contrast calculations", () => {
    const result = getContrastRatio({ r: 0, g: 0, b: 0 }, { r: 0, g: 0, b: 0 });
    expect(result).toBe(1);
  });

  it("should handle invalid color inputs gracefully", () => {
    expect(hexToRgb("")).toBeNull();
    expect(hexToRgb("#")).toBeNull();
    expect(hexToRgb("#12345")).toBeNull();
  });

  it("should handle NaN values in color calculations", () => {
    const result = rgbToHsv(NaN, 100, 100);
    expect(result.h).not.toBeNaN();
    expect(result.s).not.toBeNaN();
    expect(result.v).not.toBeNaN();
  });
});
