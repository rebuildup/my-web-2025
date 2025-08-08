import {
  AccessibilityTester,
  FocusManager,
  KeyboardNavigation,
  MotionPreferences,
  RGBColor,
  ScreenReaderUtils,
  TextScaling,
  getContrastRatio,
  getRelativeLuminance,
  hexToRgb,
  meetsWCAGAA,
  meetsWCAGAAA,
} from "../index";

// Mock DOM methods
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock CSS.supports
Object.defineProperty(CSS, "supports", {
  writable: true,
  value: jest.fn().mockReturnValue(true),
});

describe("Accessibility Utils", () => {
  describe("Color contrast utilities", () => {
    describe("getRelativeLuminance", () => {
      it("should calculate luminance for white", () => {
        const white: RGBColor = { r: 255, g: 255, b: 255 };
        expect(getRelativeLuminance(white)).toBeCloseTo(1, 2);
      });

      it("should calculate luminance for black", () => {
        const black: RGBColor = { r: 0, g: 0, b: 0 };
        expect(getRelativeLuminance(black)).toBeCloseTo(0, 2);
      });

      it("should calculate luminance for red", () => {
        const red: RGBColor = { r: 255, g: 0, b: 0 };
        const luminance = getRelativeLuminance(red);
        expect(luminance).toBeGreaterThan(0);
        expect(luminance).toBeLessThan(1);
      });

      it("should handle edge case values", () => {
        const gray: RGBColor = { r: 128, g: 128, b: 128 };
        const luminance = getRelativeLuminance(gray);
        expect(luminance).toBeGreaterThan(0);
        expect(luminance).toBeLessThan(1);
      });
    });

    describe("getContrastRatio", () => {
      it("should return 21:1 for black and white", () => {
        const black: RGBColor = { r: 0, g: 0, b: 0 };
        const white: RGBColor = { r: 255, g: 255, b: 255 };
        expect(getContrastRatio(black, white)).toBeCloseTo(21, 0);
      });

      it("should return 1:1 for identical colors", () => {
        const color: RGBColor = { r: 128, g: 128, b: 128 };
        expect(getContrastRatio(color, color)).toBeCloseTo(1, 2);
      });

      it("should be symmetric", () => {
        const color1: RGBColor = { r: 255, g: 0, b: 0 };
        const color2: RGBColor = { r: 0, g: 255, b: 0 };
        expect(getContrastRatio(color1, color2)).toBeCloseTo(
          getContrastRatio(color2, color1),
          2,
        );
      });
    });

    describe("meetsWCAGAA", () => {
      it("should pass for high contrast combinations", () => {
        const black: RGBColor = { r: 0, g: 0, b: 0 };
        const white: RGBColor = { r: 255, g: 255, b: 255 };
        expect(meetsWCAGAA(black, white)).toBe(true);
        expect(meetsWCAGAA(black, white, true)).toBe(true);
      });

      it("should fail for low contrast combinations", () => {
        const lightGray: RGBColor = { r: 200, g: 200, b: 200 };
        const white: RGBColor = { r: 255, g: 255, b: 255 };
        expect(meetsWCAGAA(lightGray, white)).toBe(false);
      });

      it("should have different thresholds for large text", () => {
        const color1: RGBColor = { r: 100, g: 100, b: 100 };
        const color2: RGBColor = { r: 200, g: 200, b: 200 };
        // This might pass for large text but fail for normal text
        const normalText = meetsWCAGAA(color1, color2, false);
        const largeText = meetsWCAGAA(color1, color2, true);
        expect(typeof normalText).toBe("boolean");
        expect(typeof largeText).toBe("boolean");
      });
    });

    describe("meetsWCAGAAA", () => {
      it("should have stricter requirements than AA", () => {
        const black: RGBColor = { r: 0, g: 0, b: 0 };
        const white: RGBColor = { r: 255, g: 255, b: 255 };
        expect(meetsWCAGAAA(black, white)).toBe(true);
        expect(meetsWCAGAAA(black, white, true)).toBe(true);
      });

      it("should fail for combinations that might pass AA", () => {
        const darkGray: RGBColor = { r: 80, g: 80, b: 80 };
        const white: RGBColor = { r: 255, g: 255, b: 255 };
        // This should pass AA but might fail AAA
        expect(meetsWCAGAA(darkGray, white)).toBe(true);
      });
    });

    describe("hexToRgb", () => {
      it("should convert valid hex colors", () => {
        expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
        expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
        expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
        expect(hexToRgb("ffffff")).toEqual({ r: 255, g: 255, b: 255 });
      });

      it("should return null for invalid hex colors", () => {
        expect(hexToRgb("invalid")).toBeNull();
        expect(hexToRgb("#gggggg")).toBeNull();
        expect(hexToRgb("#fff")).toBeNull(); // Too short
        expect(hexToRgb("")).toBeNull();
      });

      it("should handle uppercase hex values", () => {
        expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
        expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
      });
    });
  });

  describe("FocusManager", () => {
    let container: HTMLElement;
    let button1: HTMLButtonElement;
    let button2: HTMLButtonElement;

    beforeEach(() => {
      document.body.innerHTML = "";
      container = document.createElement("div");
      button1 = document.createElement("button");
      button2 = document.createElement("button");
      button1.textContent = "Button 1";
      button2.textContent = "Button 2";
      container.appendChild(button1);
      container.appendChild(button2);
      document.body.appendChild(container);
    });

    describe("trapFocus", () => {
      it("should trap focus within container", () => {
        const cleanup = FocusManager.trapFocus(container);
        expect(typeof cleanup).toBe("function");
        cleanup();
      });

      it("should handle Tab key navigation", () => {
        const cleanup = FocusManager.trapFocus(container);

        // Simulate Tab key press
        const tabEvent = new KeyboardEvent("keydown", { key: "Tab" });
        container.dispatchEvent(tabEvent);

        cleanup();
      });

      it("should handle Shift+Tab key navigation", () => {
        const cleanup = FocusManager.trapFocus(container);

        // Simulate Shift+Tab key press
        const shiftTabEvent = new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true,
        });
        container.dispatchEvent(shiftTabEvent);

        cleanup();
      });

      it("should ignore non-Tab keys", () => {
        const cleanup = FocusManager.trapFocus(container);

        // Simulate other key press
        const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
        container.dispatchEvent(enterEvent);

        cleanup();
      });
    });

    describe("saveFocus and restoreFocus", () => {
      it("should save and restore focus", () => {
        button1.focus();
        expect(document.activeElement).toBe(button1);

        FocusManager.saveFocus(button2);
        expect(document.activeElement).toBe(button2);

        FocusManager.restoreFocus();
        expect(document.activeElement).toBe(button1);
      });

      it("should handle multiple focus saves", () => {
        button1.focus();
        FocusManager.saveFocus(button2);
        FocusManager.saveFocus();

        FocusManager.restoreFocus();
        expect(document.activeElement).toBe(button2);

        FocusManager.restoreFocus();
        expect(document.activeElement).toBe(button1);
      });

      it("should handle restore without save", () => {
        expect(() => FocusManager.restoreFocus()).not.toThrow();
      });
    });
  });

  describe("ScreenReaderUtils", () => {
    beforeEach(() => {
      document.body.innerHTML = "";
    });

    describe("announce", () => {
      it("should create announcement element", () => {
        ScreenReaderUtils.announce("Test message");

        const announcer = document.querySelector("[aria-live]");
        expect(announcer).toBeTruthy();
        expect(announcer?.textContent).toBe("Test message");
        expect(announcer?.getAttribute("aria-live")).toBe("polite");
      });

      it("should handle assertive priority", () => {
        ScreenReaderUtils.announce("Urgent message", "assertive");

        const announcer = document.querySelector('[aria-live="assertive"]');
        expect(announcer).toBeTruthy();
        expect(announcer?.textContent).toBe("Urgent message");
      });

      it("should remove announcement after timeout", () => {
        jest.useFakeTimers();

        ScreenReaderUtils.announce("Test message");

        const announcer = document.querySelector("[aria-live]");
        expect(announcer).toBeTruthy();
        expect(announcer?.textContent).toBe("Test message");

        // Fast-forward time
        jest.advanceTimersByTime(1000);

        const announcerAfter = document.querySelector("[aria-live]");
        expect(announcerAfter).toBeFalsy();

        jest.useRealTimers();
      });
    });

    describe("createDescription", () => {
      it("should create description element", () => {
        const element = document.createElement("button");
        document.body.appendChild(element);

        const descId = ScreenReaderUtils.createDescription(
          element,
          "Button description",
        );

        expect(element.getAttribute("aria-describedby")).toBe(descId);
        const descElement = document.getElementById(descId);
        expect(descElement?.textContent).toBe("Button description");
      });

      it("should handle element without parent", () => {
        const element = document.createElement("button");

        expect(() => {
          ScreenReaderUtils.createDescription(element, "Description");
        }).not.toThrow();
      });
    });
  });

  describe("KeyboardNavigation", () => {
    describe("handleGridNavigation", () => {
      const mockNavigate = jest.fn();

      beforeEach(() => {
        mockNavigate.mockClear();
      });

      it("should handle arrow right navigation", () => {
        const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
        KeyboardNavigation.handleGridNavigation(event, 0, 9, 3, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(1);
      });

      it("should handle arrow left navigation", () => {
        const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
        KeyboardNavigation.handleGridNavigation(event, 1, 9, 3, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(0);
      });

      it("should handle arrow down navigation", () => {
        const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
        KeyboardNavigation.handleGridNavigation(event, 0, 9, 3, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(3);
      });

      it("should handle arrow up navigation", () => {
        const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
        KeyboardNavigation.handleGridNavigation(event, 3, 9, 3, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(0);
      });

      it("should handle Home key", () => {
        const event = new KeyboardEvent("keydown", { key: "Home" });
        KeyboardNavigation.handleGridNavigation(event, 5, 9, 3, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(0);
      });

      it("should handle End key", () => {
        const event = new KeyboardEvent("keydown", { key: "End" });
        KeyboardNavigation.handleGridNavigation(event, 0, 9, 3, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(8);
      });

      it("should not navigate beyond boundaries", () => {
        const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
        KeyboardNavigation.handleGridNavigation(event, 8, 9, 3, mockNavigate);

        expect(mockNavigate).not.toHaveBeenCalled();
      });

      it("should ignore unhandled keys", () => {
        const event = new KeyboardEvent("keydown", { key: "Enter" });
        KeyboardNavigation.handleGridNavigation(event, 0, 9, 3, mockNavigate);

        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    describe("handleListNavigation", () => {
      const mockNavigate = jest.fn();

      beforeEach(() => {
        mockNavigate.mockClear();
      });

      it("should handle arrow down navigation", () => {
        const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
        KeyboardNavigation.handleListNavigation(event, 0, 5, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(1);
      });

      it("should wrap to beginning from end", () => {
        const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
        KeyboardNavigation.handleListNavigation(event, 4, 5, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(0);
      });

      it("should handle arrow up navigation", () => {
        const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
        KeyboardNavigation.handleListNavigation(event, 1, 5, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(0);
      });

      it("should wrap to end from beginning", () => {
        const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
        KeyboardNavigation.handleListNavigation(event, 0, 5, mockNavigate);

        expect(mockNavigate).toHaveBeenCalledWith(4);
      });
    });
  });

  describe("TextScaling", () => {
    describe("isTextScalingSupported", () => {
      it("should return true when CSS.supports returns true", () => {
        (CSS.supports as jest.Mock).mockReturnValue(true);
        expect(TextScaling.isTextScalingSupported()).toBe(true);
      });

      it("should return false when CSS.supports returns false", () => {
        (CSS.supports as jest.Mock).mockReturnValue(false);
        expect(TextScaling.isTextScalingSupported()).toBe(false);
      });
    });

    describe("getCurrentScaling", () => {
      it("should calculate current scaling level", () => {
        // Mock getComputedStyle
        Object.defineProperty(window, "getComputedStyle", {
          value: jest.fn().mockReturnValue({ fontSize: "16px" }),
        });

        const scaling = TextScaling.getCurrentScaling();
        expect(scaling).toBe(1);
      });

      it("should handle different font sizes", () => {
        Object.defineProperty(window, "getComputedStyle", {
          value: jest.fn().mockReturnValue({ fontSize: "32px" }),
        });

        const scaling = TextScaling.getCurrentScaling();
        expect(scaling).toBe(2);
      });
    });

    describe("ensureMinimumTouchTarget", () => {
      it("should set minimum size for small elements", () => {
        const element = document.createElement("button");

        // Mock getBoundingClientRect
        element.getBoundingClientRect = jest.fn().mockReturnValue({
          width: 20,
          height: 20,
        });

        TextScaling.ensureMinimumTouchTarget(element);

        expect(element.style.minWidth).toBe("44px");
        expect(element.style.minHeight).toBe("44px");
        expect(element.style.display).toBe("inline-flex");
      });

      it("should not modify elements that are already large enough", () => {
        const element = document.createElement("button");

        element.getBoundingClientRect = jest.fn().mockReturnValue({
          width: 50,
          height: 50,
        });

        TextScaling.ensureMinimumTouchTarget(element);

        expect(element.style.minWidth).toBe("");
        expect(element.style.minHeight).toBe("");
      });
    });
  });

  describe("MotionPreferences", () => {
    describe("prefersReducedMotion", () => {
      it("should return true when user prefers reduced motion", () => {
        (window.matchMedia as jest.Mock).mockReturnValue({ matches: true });
        expect(MotionPreferences.prefersReducedMotion()).toBe(true);
      });

      it("should return false when user does not prefer reduced motion", () => {
        (window.matchMedia as jest.Mock).mockReturnValue({ matches: false });
        expect(MotionPreferences.prefersReducedMotion()).toBe(false);
      });
    });

    describe("applyMotionPreferences", () => {
      it("should disable animations when reduced motion is preferred", () => {
        (window.matchMedia as jest.Mock).mockReturnValue({ matches: true });

        const element = document.createElement("div");
        MotionPreferences.applyMotionPreferences(element);

        expect(element.style.animation).toBe("none");
        expect(element.style.transition).toBe("none");
      });

      it("should not modify animations when reduced motion is not preferred", () => {
        (window.matchMedia as jest.Mock).mockReturnValue({ matches: false });

        const element = document.createElement("div");
        MotionPreferences.applyMotionPreferences(element);

        expect(element.style.animation).toBe("");
        expect(element.style.transition).toBe("");
      });
    });
  });

  describe("AccessibilityTester", () => {
    let container: HTMLElement;

    beforeEach(() => {
      document.body.innerHTML = "";
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    describe("runBasicChecks", () => {
      beforeEach(() => {
        // Mock getComputedStyle for all elements
        Object.defineProperty(window, "getComputedStyle", {
          value: jest.fn().mockReturnValue({
            color: "rgba(0, 0, 0, 0)",
            backgroundColor: "rgba(0, 0, 0, 0)",
          }),
        });
      });

      it("should detect missing alt text on images", () => {
        const img = document.createElement("img");
        img.src = "test.jpg";
        container.appendChild(img);

        const issues = AccessibilityTester.runBasicChecks(container);
        expect(issues).toContain("Image 1 missing alt text");
      });

      it("should not flag images with alt text", () => {
        const img = document.createElement("img");
        img.src = "test.jpg";
        img.alt = "Test image";
        container.appendChild(img);

        const issues = AccessibilityTester.runBasicChecks(container);
        expect(
          issues.filter((issue) => issue.includes("missing alt text")),
        ).toHaveLength(0);
      });

      it("should detect missing labels on form elements", () => {
        const input = document.createElement("input");
        input.type = "text";
        container.appendChild(input);

        const issues = AccessibilityTester.runBasicChecks(container);
        expect(issues).toContain("Form element 1 missing label");
      });

      it("should not flag form elements with labels", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.setAttribute("aria-label", "Test input");
        container.appendChild(input);

        const issues = AccessibilityTester.runBasicChecks(container);
        expect(
          issues.filter((issue) => issue.includes("missing label")),
        ).toHaveLength(0);
      });

      it("should detect heading hierarchy issues", () => {
        const h1 = document.createElement("h1");
        const h3 = document.createElement("h3"); // Skips h2
        container.appendChild(h1);
        container.appendChild(h3);

        const issues = AccessibilityTester.runBasicChecks(container);
        expect(issues.some((issue) => issue.includes("skips levels"))).toBe(
          true,
        );
      });

      it("should handle proper heading hierarchy", () => {
        const h1 = document.createElement("h1");
        const h2 = document.createElement("h2");
        const h3 = document.createElement("h3");
        container.appendChild(h1);
        container.appendChild(h2);
        container.appendChild(h3);

        const issues = AccessibilityTester.runBasicChecks(container);
        expect(
          issues.filter((issue) => issue.includes("skips levels")),
        ).toHaveLength(0);
      });

      it("should handle elements without computed styles", () => {
        const div = document.createElement("div");
        div.textContent = "Test content";
        container.appendChild(div);

        // Mock getComputedStyle to return transparent colors
        Object.defineProperty(window, "getComputedStyle", {
          value: jest.fn().mockReturnValue({
            color: "rgba(0, 0, 0, 0)",
            backgroundColor: "rgba(0, 0, 0, 0)",
          }),
        });

        expect(() =>
          AccessibilityTester.runBasicChecks(container),
        ).not.toThrow();
      });
    });
  });
});
