/**
 * @jest-environment jsdom
 */

import {
  AccessibilityReport,
  autoFixAccessibilityIssues,
  getContrastRatio,
  logAccessibilityReport,
  runAccessibilityAudit,
  startAccessibilityMonitoring,
} from "../accessibility-testing";

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  group: jest.fn(),
  groupEnd: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(console, mockConsole);
  document.body.innerHTML = "";
});

describe("getContrastRatio", () => {
  it("should calculate correct contrast ratio for black and white", () => {
    const ratio = getContrastRatio("#000000", "#ffffff");
    expect(ratio).toBeCloseTo(21, 1);
  });

  it("should calculate correct contrast ratio for same colors", () => {
    const ratio = getContrastRatio("#ff0000", "#ff0000");
    expect(ratio).toBe(1);
  });

  it("should handle hex colors without # prefix", () => {
    const ratio = getContrastRatio("000000", "ffffff");
    expect(ratio).toBeCloseTo(21, 1);
  });

  it("should handle invalid hex colors gracefully", () => {
    const ratio = getContrastRatio("invalid", "#ffffff");
    expect(ratio).toBeGreaterThan(0);
  });
});

describe("runAccessibilityAudit", () => {
  it("should return empty report for empty container", async () => {
    const report = await runAccessibilityAudit(document.body);

    expect(report.issues).toHaveLength(0);
    expect(report.summary.total).toBe(0);
    expect(report.passedChecks).toContain("heading-hierarchy");
    expect(report.passedChecks).toContain("form-accessibility");
    expect(report.passedChecks).toContain("image-accessibility");
    expect(report.passedChecks).toContain("interactive-elements");
  });

  it("should detect heading hierarchy issues", async () => {
    document.body.innerHTML = `
      <h3 style="color: #000000; background-color: #ffffff;">Skip to h3</h3>
      <h1 style="color: #000000; background-color: #ffffff;">Main heading</h1>
    `;

    const report = await runAccessibilityAudit(document.body);

    const headingIssues = report.issues.filter(
      (issue) => issue.rule === "heading-hierarchy",
    );
    expect(headingIssues).toHaveLength(1);
    expect(headingIssues[0].rule).toBe("heading-hierarchy");
    expect(headingIssues[0].type).toBe("warning");
  });

  it("should detect skipped heading levels", async () => {
    document.body.innerHTML = `
      <h1 style="color: #000000; background-color: #ffffff;">Main heading</h1>
      <h4 style="color: #000000; background-color: #ffffff;">Skipped h2 and h3</h4>
    `;

    const report = await runAccessibilityAudit(document.body);

    const headingIssues = report.issues.filter(
      (issue) => issue.rule === "heading-hierarchy",
    );
    expect(headingIssues).toHaveLength(1);
    expect(headingIssues[0].rule).toBe("heading-hierarchy");
    expect(headingIssues[0].type).toBe("error");
    expect(headingIssues[0].severity).toBe("serious");
  });

  it("should detect form accessibility issues", async () => {
    document.body.innerHTML = `
      <form>
        <input type="text" />
        <input type="email" required />
      </form>
    `;

    const report = await runAccessibilityAudit(document.body);

    expect(report.issues.length).toBeGreaterThan(0);
    expect(report.issues.some((issue) => issue.rule === "form-label")).toBe(
      true,
    );
  });

  it("should detect properly labeled form elements", async () => {
    document.body.innerHTML = `
      <form>
        <label for="name">Name:</label>
        <input type="text" id="name" />
        <input type="email" aria-label="Email address" />
      </form>
    `;

    const report = await runAccessibilityAudit(document.body);

    const formLabelIssues = report.issues.filter(
      (issue) => issue.rule === "form-label",
    );
    expect(formLabelIssues).toHaveLength(0);
  });

  it("should detect image accessibility issues", async () => {
    document.body.innerHTML = `
      <img src="test.jpg" />
      <img src="test2.jpg" alt="image of something" />
    `;

    const report = await runAccessibilityAudit(document.body);

    expect(report.issues.length).toBeGreaterThan(0);
    expect(report.issues.some((issue) => issue.rule === "image-alt")).toBe(
      true,
    );
    expect(
      report.issues.some((issue) => issue.rule === "image-alt-redundant"),
    ).toBe(true);
  });

  it("should handle decorative images correctly", async () => {
    document.body.innerHTML = `
      <img src="test.jpg" alt="" role="presentation" />
      <img src="test2.jpg" alt="Descriptive text" />
    `;

    const report = await runAccessibilityAudit(document.body);

    const imageAltIssues = report.issues.filter(
      (issue) => issue.rule === "image-alt",
    );
    expect(imageAltIssues).toHaveLength(0);
  });

  it("should detect interactive element issues", async () => {
    document.body.innerHTML = `
      <button></button>
      <a href="#"></a>
      <div role="button"></div>
    `;

    const report = await runAccessibilityAudit(document.body);

    expect(report.issues.length).toBeGreaterThan(0);
    expect(
      report.issues.some((issue) => issue.rule === "accessible-name"),
    ).toBe(true);
  });

  it("should handle properly accessible interactive elements", async () => {
    document.body.innerHTML = `
      <button>Click me</button>
      <a href="#" aria-label="Go to section">Link</a>
      <div role="button" aria-label="Custom button">Custom</div>
    `;

    const report = await runAccessibilityAudit(document.body);

    const accessibleNameIssues = report.issues.filter(
      (issue) => issue.rule === "accessible-name",
    );
    expect(accessibleNameIssues).toHaveLength(0);
  });
});

describe("logAccessibilityReport", () => {
  it("should log report summary", () => {
    const report: AccessibilityReport = {
      issues: [
        {
          type: "error",
          rule: "test-rule",
          message: "Test error",
          severity: "critical",
        },
        {
          type: "warning",
          rule: "test-rule-2",
          message: "Test warning",
          severity: "moderate",
        },
      ],
      passedChecks: ["test-check"],
      summary: {
        errors: 1,
        warnings: 1,
        info: 0,
        total: 2,
      },
    };

    logAccessibilityReport(report);

    expect(mockConsole.group).toHaveBeenCalledWith(
      "🔍 Accessibility Audit Report",
    );
    expect(mockConsole.log).toHaveBeenCalledWith("📊 Summary: 2 issues found");
    expect(mockConsole.log).toHaveBeenCalledWith("❌ Errors: 1");
    expect(mockConsole.log).toHaveBeenCalledWith("⚠️ Warnings: 1");
    expect(mockConsole.log).toHaveBeenCalledWith("ℹ️ Info: 0");
    expect(mockConsole.log).toHaveBeenCalledWith(
      "✅ Passed checks: test-check",
    );
    expect(mockConsole.groupEnd).toHaveBeenCalled();
  });

  it("should log individual issues", () => {
    const mockElement = document.createElement("div");
    const report: AccessibilityReport = {
      issues: [
        {
          type: "error",
          rule: "test-rule",
          message: "Test error",
          severity: "critical",
          element: mockElement,
        },
      ],
      passedChecks: [],
      summary: {
        errors: 1,
        warnings: 0,
        info: 0,
        total: 1,
      },
    };

    logAccessibilityReport(report);

    expect(mockConsole.log).toHaveBeenCalledWith(
      "❌ 1. [test-rule] Test error",
    );
    expect(mockConsole.log).toHaveBeenCalledWith("   Element:", mockElement);
  });
});

describe("autoFixAccessibilityIssues", () => {
  it("should fix decorative images", async () => {
    document.body.innerHTML = `
      <img src="small.jpg" style="width: 20px; height: 20px;" />
    `;

    const result = await autoFixAccessibilityIssues([], document.body);

    const img = document.querySelector("img");
    expect(img?.getAttribute("alt")).toBe("");
    expect(img?.getAttribute("role")).toBe("presentation");
    expect(result.fixed).toBe(1);
  });

  it("should not fix large images", async () => {
    document.body.innerHTML = `
      <img src="large.jpg" style="width: 200px; height: 200px;" />
    `;

    // Mock getBoundingClientRect to return large dimensions
    const img = document.querySelector("img");
    if (img) {
      img.getBoundingClientRect = jest.fn().mockReturnValue({
        width: 200,
        height: 200,
        top: 0,
        left: 0,
        bottom: 200,
        right: 200,
      });
    }

    const result = await autoFixAccessibilityIssues([], document.body);

    expect(img?.hasAttribute("alt")).toBe(false);
    expect(result.fixed).toBe(0);
  });

  it("should add focus indicators to interactive elements", async () => {
    // Mock getComputedStyle to return no focus indicators
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = jest.fn().mockReturnValue({
      getPropertyValue: jest.fn().mockReturnValue("none"),
    });

    document.body.innerHTML = `
      <button>Test</button>
      <a href="#">Link</a>
    `;

    const result = await autoFixAccessibilityIssues([], document.body);

    const button = document.querySelector("button");
    const link = document.querySelector("a");

    expect(button?.classList.contains("focus-visible:outline-2")).toBe(true);
    expect(link?.classList.contains("focus-visible:outline-2")).toBe(true);
    expect(result.fixed).toBe(2);

    // Restore original function
    window.getComputedStyle = originalGetComputedStyle;
  });
});

describe("startAccessibilityMonitoring", () => {
  beforeEach(() => {
    // Mock process.env
    const originalEnv = process.env;
    process.env = { ...originalEnv, NODE_ENV: "development" };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should start monitoring in development mode", () => {
    const mockObserver = {
      observe: jest.fn(),
      disconnect: jest.fn(),
    };

    // Mock MutationObserver
    global.MutationObserver = jest.fn().mockImplementation(() => mockObserver);

    startAccessibilityMonitoring();

    expect(MutationObserver).toHaveBeenCalled();
    expect(mockObserver.observe).toHaveBeenCalledWith(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "class",
        "style",
        "aria-label",
        "aria-labelledby",
        "alt",
      ],
    });
    expect(mockConsole.log).toHaveBeenCalledWith(
      "🔍 Accessibility monitoring started",
    );
  });

  it("should not start monitoring in production mode", () => {
    process.env.NODE_ENV = "production";

    const mockObserver = {
      observe: jest.fn(),
      disconnect: jest.fn(),
    };

    global.MutationObserver = jest.fn().mockImplementation(() => mockObserver);

    startAccessibilityMonitoring();

    expect(MutationObserver).not.toHaveBeenCalled();
  });
});

describe("Edge cases and error handling", () => {
  it("should handle missing window object gracefully", () => {
    const originalWindow = global.window;
    // @ts-expect-error - Intentionally deleting window for testing
    delete global.window;

    expect(() => getContrastRatio("#000000", "#ffffff")).not.toThrow();

    global.window = originalWindow;
  });

  it("should handle malformed HTML gracefully", async () => {
    document.body.innerHTML = `
      <div>
        <img>
        <button>
        <form>
          <input>
    `;

    const report = await runAccessibilityAudit(document.body);

    expect(report).toBeDefined();
    expect(report.summary).toBeDefined();
    expect(Array.isArray(report.issues)).toBe(true);
  });

  it("should handle elements without computed styles", async () => {
    const mockElement = document.createElement("div");
    document.body.appendChild(mockElement);

    // Mock getComputedStyle to return null
    const originalGetComputedStyle = window.getComputedStyle;
    window.getComputedStyle = jest.fn().mockReturnValue({
      getPropertyValue: jest.fn().mockReturnValue(""),
    });

    const report = await runAccessibilityAudit(document.body);

    expect(report).toBeDefined();

    window.getComputedStyle = originalGetComputedStyle;
  });
});
