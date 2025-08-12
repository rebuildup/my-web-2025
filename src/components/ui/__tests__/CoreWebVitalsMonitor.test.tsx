import { render, screen } from "@testing-library/react";
import {
  CoreWebVitalsDisplay,
  PerformanceBudgetIndicator,
  PerformanceDevPanel,
} from "../CoreWebVitalsMonitor";

// Mock the performance regression utilities
jest.mock("@/lib/utils/performance-regression", () => ({
  initializePerformanceRegression: jest.fn(() => ({
    detectRegression: jest.fn(),
    getMetrics: jest.fn(() => ({})),
  })),
}));

// Mock PerformanceObserver
global.PerformanceObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock process.env
const originalEnv = process.env;

describe("CoreWebVitalsDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should render without crashing", () => {
    render(<CoreWebVitalsDisplay />);

    expect(screen.getByText(/core web vitals/i)).toBeInTheDocument();
  });

  it("should show basic metrics by default", () => {
    render(<CoreWebVitalsDisplay />);

    expect(screen.getByText(/core web vitals/i)).toBeInTheDocument();
    expect(screen.getByText(/needs improvement/i)).toBeInTheDocument();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CoreWebVitalsDisplay className="custom-vitals" />,
    );

    expect(container.firstChild).toHaveClass("custom-vitals");
  });
});

describe("PerformanceBudgetIndicator", () => {
  it("should render performance budget status", () => {
    render(<PerformanceBudgetIndicator />);

    expect(screen.getByText(/performance budget/i)).toBeInTheDocument();
  });
});

describe("PerformanceDevPanel", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "development";
  });

  it("should not render in production", () => {
    process.env.NODE_ENV = "production";

    const { container } = render(<PerformanceDevPanel />);

    expect(container.firstChild).toBeNull();
  });

  it("should render toggle button in development", () => {
    render(<PerformanceDevPanel />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
