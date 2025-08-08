import { cn } from "../utils";

describe("Utils", () => {
  describe("cn function", () => {
    it("should merge class names correctly", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
    });

    it("should handle conditional classes", () => {
      expect(cn("class1", false && "class2", "class3")).toBe("class1 class3");
      expect(cn("class1", true && "class2", "class3")).toBe(
        "class1 class2 class3",
      );
    });

    it("should handle undefined and null values", () => {
      expect(cn("class1", undefined, null, "class2")).toBe("class1 class2");
    });

    it("should handle empty strings", () => {
      expect(cn("class1", "", "class2")).toBe("class1 class2");
    });

    it("should handle arrays of classes", () => {
      expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
    });

    it("should handle objects with boolean values", () => {
      expect(
        cn({
          class1: true,
          class2: false,
          class3: true,
        }),
      ).toBe("class1 class3");
    });

    it("should merge Tailwind classes correctly", () => {
      // Test Tailwind merge functionality
      expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("should handle complex combinations", () => {
      expect(
        cn(
          "base-class",
          {
            "conditional-class": true,
            "false-class": false,
          },
          ["array-class1", "array-class2"],
          undefined,
          "final-class",
        ),
      ).toBe(
        "base-class conditional-class array-class1 array-class2 final-class",
      );
    });

    it("should return empty string for no arguments", () => {
      expect(cn()).toBe("");
    });

    it("should handle only falsy values", () => {
      expect(cn(false, null, undefined, "")).toBe("");
    });
  });
});
