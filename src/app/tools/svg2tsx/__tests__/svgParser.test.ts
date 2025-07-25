import { parseSVG, validateSVG } from "../utils/svgParser";

describe("SVG Parser", () => {
  const validSVG = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>
      <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
    </svg>
  `;

  const invalidSVG = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"
    </svg>
  `;

  describe("validateSVG", () => {
    it("validates correct SVG", () => {
      const result = validateSVG(validSVG);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("detects invalid SVG", () => {
      const result = validateSVG(invalidSVG);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("detects missing SVG element", () => {
      const result = validateSVG("<div>Not an SVG</div>");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("No SVG element found");
    });
  });

  describe("parseSVG", () => {
    it("parses valid SVG correctly", () => {
      const result = parseSVG(validSVG);

      expect(result).not.toBeNull();
      expect(result?.tagName).toBe("svg");
      expect(result?.attributes.width).toBe("24");
      expect(result?.attributes.height).toBe("24");
      expect(result?.children).toHaveLength(2);
      expect(result?.children[0].tagName).toBe("path");
    });

    it("returns null for invalid SVG", () => {
      const result = parseSVG(invalidSVG);
      expect(result).toBeNull();
    });

    it("handles nested elements", () => {
      const nestedSVG = `
        <svg width="24" height="24">
          <g transform="translate(2,2)">
            <circle cx="10" cy="10" r="5"/>
          </g>
        </svg>
      `;

      const result = parseSVG(nestedSVG);

      expect(result).not.toBeNull();
      expect(result?.children).toHaveLength(1);
      expect(result?.children[0].tagName).toBe("g");
      expect(result?.children[0].children).toHaveLength(1);
      expect(result?.children[0].children[0].tagName).toBe("circle");
    });
  });
});
