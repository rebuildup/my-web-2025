import {
  getPiDigit,
  getPiSequence,
  validatePiInput,
  getFormattedPi,
} from "../utils/piDigits";

describe("Pi Digits Utilities", () => {
  describe("getPiDigit", () => {
    it("returns correct digits for known positions", () => {
      expect(getPiDigit(0)).toBe("1"); // First digit after decimal
      expect(getPiDigit(1)).toBe("4");
      expect(getPiDigit(2)).toBe("1");
      expect(getPiDigit(3)).toBe("5");
      expect(getPiDigit(4)).toBe("9");
      expect(getPiDigit(5)).toBe("2");
    });

    it("returns empty string for invalid positions", () => {
      expect(getPiDigit(-1)).toBe("");
      expect(getPiDigit(10000)).toBe(""); // Beyond available digits
    });
  });

  describe("getPiSequence", () => {
    it("returns correct sequence for valid range", () => {
      expect(getPiSequence(0, 6)).toBe("141592");
      expect(getPiSequence(0, 10)).toBe("1415926535");
      expect(getPiSequence(5, 5)).toBe("26535");
    });

    it("handles edge cases", () => {
      expect(getPiSequence(-1, 5)).toBe("");
      expect(getPiSequence(0, 0)).toBe("");
      expect(getPiSequence(10000, 5)).toBe("");
    });

    it("truncates sequence at end of available digits", () => {
      const lastPosition = 999; // Near end of available digits
      const sequence = getPiSequence(lastPosition, 10);
      expect(sequence.length).toBeLessThanOrEqual(10);
    });
  });

  describe("validatePiInput", () => {
    it("validates correct inputs", () => {
      expect(validatePiInput(0, "1")).toBe(true);
      expect(validatePiInput(1, "4")).toBe(true);
      expect(validatePiInput(2, "1")).toBe(true);
      expect(validatePiInput(3, "5")).toBe(true);
    });

    it("rejects incorrect inputs", () => {
      expect(validatePiInput(0, "2")).toBe(false);
      expect(validatePiInput(1, "3")).toBe(false);
      expect(validatePiInput(2, "0")).toBe(false);
    });

    it("handles invalid positions", () => {
      expect(validatePiInput(-1, "1")).toBe(false);
      expect(validatePiInput(10000, "1")).toBe(false);
    });
  });

  describe("getFormattedPi", () => {
    it("formats pi with context around current position", () => {
      const result = getFormattedPi(5, 3);

      expect(result).toHaveProperty("before");
      expect(result).toHaveProperty("current");
      expect(result).toHaveProperty("after");
      expect(result).toHaveProperty("formatted");

      expect(result.current).toBe("2"); // 6th digit (position 5) is "2"
      expect(result.before).toBe("159"); // 3 digits before
      expect(result.after.length).toBeLessThanOrEqual(3); // Up to 3 digits after
    });

    it("handles position at start", () => {
      const result = getFormattedPi(0, 3);

      expect(result.current).toBe("1");
      expect(result.before).toBe("");
      expect(result.after.length).toBeLessThanOrEqual(3);
    });

    it("handles position near end", () => {
      const result = getFormattedPi(995, 3); // Near end of available digits

      expect(result.current).toBeTruthy();
      expect(result.before.length).toBeLessThanOrEqual(3);
    });

    it("creates properly formatted string", () => {
      const result = getFormattedPi(2, 2);

      expect(result.formatted).toMatch(/^3\.\w*\[\w\]\w*$/);
      expect(result.formatted).toContain("[1]"); // Position 2 is "1"
    });
  });

  describe("Pi sequence accuracy", () => {
    it("starts with correct known sequence", () => {
      const knownStart = "1415926535897932384626433832795";
      const sequence = getPiSequence(0, knownStart.length);
      expect(sequence).toBe(knownStart);
    });

    it("maintains consistency across different access methods", () => {
      for (let i = 0; i < 20; i++) {
        const singleDigit = getPiDigit(i);
        const sequenceDigit = getPiSequence(i, 1);
        expect(singleDigit).toBe(sequenceDigit);
      }
    });
  });
});
