import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { AccessibilityTester } from "../AccessibilityTester";

// Mock the accessibility testing utilities
jest.mock("@/lib/utils/accessibility-testing", () => ({
  runAccessibilityAudit: jest.fn(),
  autoFixAccessibilityIssues: jest.fn(),
  logAccessibilityReport: jest.fn(),
}));

import {
  autoFixAccessibilityIssues,
  runAccessibilityAudit,
} from "@/lib/utils/accessibility-testing";

const mockRunAccessibilityAudit = runAccessibilityAudit as jest.MockedFunction<
  typeof runAccessibilityAudit
>;
const mockAutoFixAccessibilityIssues =
  autoFixAccessibilityIssues as jest.MockedFunction<
    typeof autoFixAccessibilityIssues
  >;

// Mock process.env
const originalEnv = process.env;

describe("AccessibilityTester", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should not render when disabled", () => {
    render(<AccessibilityTester enabled={false} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should not render in production environment", () => {
    process.env.NODE_ENV = "production";

    render(<AccessibilityTester />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("should render floating button in development", () => {
    process.env.NODE_ENV = "development";

    render(<AccessibilityTester showFloatingButton={true} />);

    expect(
      screen.getByRole("button", { name: /アクセシビリティテスターを開く/i }),
    ).toBeInTheDocument();
  });

  it("should run audit automatically when autoRun is true", async () => {
    const mockReport = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
      timestamp: new Date().toISOString(),
      url: "http://localhost",
      toolOptions: {},
      summary: {
        total: 0,
        violations: 0,
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
      },
      passedChecks: [],
      failedChecks: [],
    };

    mockRunAccessibilityAudit.mockResolvedValue(mockReport);
    process.env.NODE_ENV = "development";

    render(<AccessibilityTester autoRun={true} showFloatingButton={true} />);

    await waitFor(
      () => {
        expect(mockRunAccessibilityAudit).toHaveBeenCalled();
      },
      { timeout: 5000 },
    );
  });

  it("should show audit results when button is clicked", async () => {
    const mockReport = {
      issues: [
        {
          type: "error" as const,
          rule: "color-contrast",
          severity: "serious" as const,
          message: "Elements must have sufficient color contrast",
        },
      ],
      passedChecks: ["aria-labels"],
      summary: {
        total: 1,
        errors: 1,
        warnings: 0,
        info: 0,
      },
    };

    mockRunAccessibilityAudit.mockResolvedValue(mockReport);
    process.env.NODE_ENV = "development";

    render(<AccessibilityTester autoRun={false} showFloatingButton={true} />);

    const button = screen.getByRole("button", {
      name: /アクセシビリティテスターを開く/i,
    });
    fireEvent.click(button);

    // Click the "Run Audit" button
    const runAuditButton = screen.getByText("Run Audit");
    fireEvent.click(runAuditButton);

    await waitFor(
      () => {
        expect(mockRunAccessibilityAudit).toHaveBeenCalled();
      },
      { timeout: 5000 },
    );

    // Check if results are displayed
    await waitFor(
      () => {
        expect(screen.getAllByText(/violations/i)[0]).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    await waitFor(
      () => {
        expect(screen.getByText(/color-contrast/i)).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });

  it("should handle audit errors gracefully", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    mockRunAccessibilityAudit.mockRejectedValue(new Error("Audit failed"));
    process.env.NODE_ENV = "development";

    render(<AccessibilityTester autoRun={false} showFloatingButton={true} />);

    const button = screen.getByRole("button", {
      name: /アクセシビリティテスターを開く/i,
    });
    fireEvent.click(button);

    // Click the "Run Audit" button
    const runAuditButton = screen.getByText("Run Audit");
    fireEvent.click(runAuditButton);

    await waitFor(() => {
      expect(mockRunAccessibilityAudit).toHaveBeenCalled();
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Accessibility audit failed:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });

  it("should toggle panel visibility", async () => {
    const mockReport = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
      timestamp: new Date().toISOString(),
      url: "http://localhost",
      toolOptions: {},
      summary: {
        total: 0,
        violations: 0,
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
      },
      passedChecks: [],
      failedChecks: [],
    };

    mockRunAccessibilityAudit.mockResolvedValue(mockReport);
    process.env.NODE_ENV = "development";

    render(<AccessibilityTester autoRun={false} showFloatingButton={true} />);

    const button = screen.getByRole("button", {
      name: /アクセシビリティテスターを開く/i,
    });

    // First click should show panel
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Accessibility Tester/i)).toBeInTheDocument();
    });

    // Second click should hide panel
    fireEvent.click(button);

    await waitFor(() => {
      expect(
        screen.queryByText(/Accessibility Tester/i),
      ).not.toBeInTheDocument();
    });
  });

  it("should run auto-fix when fix button is clicked", async () => {
    const mockReport = {
      issues: [
        {
          type: "error" as const,
          rule: "color-contrast",
          severity: "serious" as const,
          message: "Elements must have sufficient color contrast",
        },
      ],
      passedChecks: [],
      summary: {
        total: 1,
        errors: 1,
        warnings: 0,
        info: 0,
      },
    };

    mockRunAccessibilityAudit.mockResolvedValue(mockReport);
    mockAutoFixAccessibilityIssues.mockResolvedValue({ fixed: 1, failed: 0 });
    process.env.NODE_ENV = "development";

    render(<AccessibilityTester autoRun={false} showFloatingButton={true} />);

    const button = screen.getByRole("button", {
      name: /アクセシビリティテスターを開く/i,
    });
    fireEvent.click(button);

    // Click the "Run Audit" button first
    const runAuditButton = screen.getByText("Run Audit");
    fireEvent.click(runAuditButton);

    await waitFor(() => {
      expect(screen.getAllByText(/violations/i)[0]).toBeInTheDocument();
    });

    const fixButton = screen.getByText(/auto-fix/i);
    fireEvent.click(fixButton);

    await waitFor(() => {
      expect(mockAutoFixAccessibilityIssues).toHaveBeenCalledWith(
        mockReport.issues,
      );
    });
  });

  it("should close panel when close button is clicked", async () => {
    const mockReport = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
      timestamp: new Date().toISOString(),
      url: "http://localhost",
      toolOptions: {},
      summary: {
        total: 0,
        violations: 0,
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
      },
    };

    mockRunAccessibilityAudit.mockResolvedValue(mockReport);
    process.env.NODE_ENV = "development";

    render(<AccessibilityTester autoRun={false} showFloatingButton={true} />);

    const button = screen.getByRole("button", {
      name: /アクセシビリティテスターを開く/i,
    });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/accessibility tester/i)).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /閉じる/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/accessibility tester/i),
      ).not.toBeInTheDocument();
    });
  });

  it("should display violation details correctly", async () => {
    const mockReport = {
      issues: [
        {
          type: "error" as const,
          rule: "color-contrast",
          severity: "serious" as const,
          message: "Elements must have sufficient color contrast",
        },
      ],
      passedChecks: [],
      summary: {
        total: 1,
        errors: 1,
        warnings: 0,
        info: 0,
      },
    };

    mockRunAccessibilityAudit.mockResolvedValue(mockReport);
    process.env.NODE_ENV = "development";

    render(<AccessibilityTester autoRun={false} showFloatingButton={true} />);

    const button = screen.getByRole("button", {
      name: /アクセシビリティテスターを開く/i,
    });
    fireEvent.click(button);

    // Click the "Run Audit" button first
    const runAuditButton = screen.getByText("Run Audit");
    fireEvent.click(runAuditButton);

    await waitFor(() => {
      expect(screen.getByText("color-contrast")).toBeInTheDocument();
      expect(
        screen.getByText("Elements must have sufficient color contrast"),
      ).toBeInTheDocument();
      expect(screen.getByText("Severity: serious")).toBeInTheDocument();
    });
  });

  it("should show loading state during audit", async () => {
    const mockReport = {
      violations: [],
      passes: [],
      incomplete: [],
      inapplicable: [],
      timestamp: new Date().toISOString(),
      url: "http://localhost",
      toolOptions: {},
      summary: {
        total: 0,
        violations: 0,
        passes: 0,
        incomplete: 0,
        inapplicable: 0,
      },
      passedChecks: [],
      failedChecks: [],
    };

    mockRunAccessibilityAudit.mockResolvedValue(mockReport);
    process.env.NODE_ENV = "development";

    render(<AccessibilityTester autoRun={false} showFloatingButton={true} />);

    const button = screen.getByRole("button", {
      name: /アクセシビリティテスターを開く/i,
    });
    fireEvent.click(button);

    // Should show initial state
    expect(
      screen.getByText(/click.*run audit.*to check accessibility/i),
    ).toBeInTheDocument();

    // Click run audit button
    const runAuditButton = screen.getByText("Run Audit");
    fireEvent.click(runAuditButton);

    await waitFor(() => {
      expect(
        screen.getByText("No accessibility issues found!"),
      ).toBeInTheDocument();
    });
  });
});
