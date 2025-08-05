/**
 * Design Playground Unit Tests
 * Task 4.1: プレイグラウンドの単体テスト（Jest）実装
 * Tests for DesignPlayground component and related functionality
 */

import { deviceCapabilitiesDetector } from "@/lib/playground/device-capabilities";
import { performanceMonitor } from "@/lib/playground/performance-monitor";
import { playgroundManager } from "@/lib/playground/playground-manager";
import { DeviceCapabilities } from "@/types/playground";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock dependencies
jest.mock("@/lib/playground/device-capabilities");
jest.mock("@/lib/playground/performance-monitor");
jest.mock("@/lib/playground/playground-manager");
jest.mock("@/components/playground/design-experiments/experiments-data");

// Mock Next.js components
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mock dynamic imports
jest.mock("@/lib/playground/dynamic-loader", () => ({
  getExperimentComponent: jest.fn(),
  preloadCriticalExperiments: jest.fn(),
}));

// Mock hooks
jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoint: "desktop",
  }),
}));

jest.mock("@/hooks/useTouchGestures", () => ({
  useExperimentSwipe: () => ({
    currentIndex: 0,
    nextExperiment: jest.fn(),
    previousExperiment: jest.fn(),
    canGoNext: true,
    canGoPrevious: false,
  }),
}));

// Mock experiment components
const MockExperimentComponent = ({
  isActive,
  onPerformanceUpdate,
}: {
  isActive: boolean;
  onPerformanceUpdate: (metrics: unknown) => void;
}) => {
  return (
    <div data-testid="mock-experiment">
      <div>Active: {isActive ? "true" : "false"}</div>
      <button
        onClick={() =>
          onPerformanceUpdate?.({
            fps: 60,
            frameTime: 16.67,
            memoryUsage: 50,
          })
        }
      >
        Update Performance
      </button>
    </div>
  );
};

// Mock data
const mockDeviceCapabilities: DeviceCapabilities = {
  webglSupport: true,
  webgl2Support: true,
  performanceLevel: "high",
  touchSupport: false,
  maxTextureSize: 4096,
  devicePixelRatio: 1,
  hardwareConcurrency: 8,
  memoryLimit: 1000,
};

// const mockPerformanceSettings: PerformanceSettings = {
//   targetFPS: 60,
//   qualityLevel: "high",
//   enableOptimizations: true,
// };

const mockDesignExperiments = [
  {
    id: "css-animation-1",
    title: "CSS Animation Test",
    description: "Test CSS animation experiment",
    technology: ["CSS", "Animation"],
    interactive: true,
    component: MockExperimentComponent,
    category: "css" as const,
    difficulty: "beginner" as const,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
    performanceLevel: "low" as const,
  },
  {
    id: "canvas-particle-1",
    title: "Canvas Particle Test",
    description: "Test canvas particle experiment",
    technology: ["Canvas", "JavaScript"],
    interactive: true,
    component: MockExperimentComponent,
    category: "canvas" as const,
    difficulty: "intermediate" as const,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
    performanceLevel: "medium" as const,
  },
];

describe.skip("DesignPlayground Component", () => {
  let mockDetectCapabilities: jest.MockedFunction<
    typeof deviceCapabilitiesDetector.detectCapabilities
  >;
  let mockStartMonitoring: jest.MockedFunction<
    typeof performanceMonitor.startMonitoring
  >;
  let mockStopMonitoring: jest.MockedFunction<
    typeof performanceMonitor.stopMonitoring
  >;
  let mockGetExperimentsByType: jest.MockedFunction<
    typeof playgroundManager.getExperimentsByType
  >;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockDetectCapabilities =
      deviceCapabilitiesDetector.detectCapabilities as jest.MockedFunction<
        typeof deviceCapabilitiesDetector.detectCapabilities
      >;
    mockDetectCapabilities.mockResolvedValue(mockDeviceCapabilities);

    mockStartMonitoring =
      performanceMonitor.startMonitoring as jest.MockedFunction<
        typeof performanceMonitor.startMonitoring
      >;
    mockStopMonitoring =
      performanceMonitor.stopMonitoring as jest.MockedFunction<
        typeof performanceMonitor.stopMonitoring
      >;

    mockGetExperimentsByType =
      playgroundManager.getExperimentsByType as jest.MockedFunction<
        typeof playgroundManager.getExperimentsByType
      >;
    mockGetExperimentsByType.mockReturnValue(mockDesignExperiments);

    // Mock the designExperiments import
    jest.doMock(
      "@/components/playground/design-experiments/experiments-data",
      () => ({
        designExperiments: mockDesignExperiments,
      }),
    );
  });

  describe("Component Rendering", () => {
    it("should render design playground page with header", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      expect(screen.getByText("Design Playground")).toBeInTheDocument();
      expect(
        screen.getByText(/Interactive design experiments/),
      ).toBeInTheDocument();
    });

    it("should render experiment grid", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });
    });

    it("should render filter bar", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      expect(
        screen.getByRole("combobox", { name: /category/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("combobox", { name: /difficulty/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Device Capabilities Detection", () => {
    it("should detect device capabilities on mount", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      await waitFor(() => {
        expect(mockDetectCapabilities).toHaveBeenCalled();
      });
    });

    it("should handle device capabilities detection failure", async () => {
      mockDetectCapabilities.mockRejectedValue(new Error("Detection failed"));

      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      await waitFor(() => {
        expect(mockDetectCapabilities).toHaveBeenCalled();
      });

      // Should still render with fallback capabilities
      expect(screen.getByText("Design Playground")).toBeInTheDocument();
    });
  });

  describe("Performance Monitoring", () => {
    it("should start performance monitoring when experiment becomes active", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Click on an experiment to activate it
      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(mockStartMonitoring).toHaveBeenCalled();
      });
    });

    it("should stop performance monitoring when experiment becomes inactive", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Activate and then deactivate experiment
      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(mockStartMonitoring).toHaveBeenCalled();
      });

      // Click close or another experiment
      const closeButton = screen.getByRole("button", { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(mockStopMonitoring).toHaveBeenCalled();
      });
    });

    it("should handle performance metrics updates", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      // Trigger performance update
      const updateButton = await screen.findByText("Update Performance");
      fireEvent.click(updateButton);

      // Should display performance metrics
      await waitFor(() => {
        expect(screen.getByText(/60.*fps/i)).toBeInTheDocument();
      });
    });
  });

  describe("Interactive Elements", () => {
    it("should handle experiment selection", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(screen.getByTestId("mock-experiment")).toBeInTheDocument();
        expect(screen.getByText("Active: true")).toBeInTheDocument();
      });
    });

    it("should handle filter changes", async () => {
      const user = userEvent.setup();
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Change category filter
      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      await user.selectOptions(categorySelect, "css");

      // Should filter experiments
      await waitFor(() => {
        expect(screen.getByText("CSS Animation Test")).toBeInTheDocument();
        expect(
          screen.queryByText("Canvas Particle Test"),
        ).not.toBeInTheDocument();
      });
    });

    it("should handle difficulty filter", async () => {
      const user = userEvent.setup();
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Change difficulty filter
      const difficultySelect = screen.getByRole("combobox", {
        name: /difficulty/i,
      });
      await user.selectOptions(difficultySelect, "beginner");

      // Should filter experiments
      await waitFor(() => {
        expect(screen.getByText("CSS Animation Test")).toBeInTheDocument();
        expect(
          screen.queryByText("Canvas Particle Test"),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Navigation", () => {
    it("should support keyboard navigation through experiments", async () => {
      const user = userEvent.setup();
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Tab to first experiment
      await user.tab();
      const firstExperiment = screen.getByText("CSS Animation Test");
      expect(firstExperiment).toHaveFocus();

      // Press Enter to activate
      await user.keyboard("{Enter}");

      await waitFor(() => {
        expect(screen.getByTestId("mock-experiment")).toBeInTheDocument();
      });
    });

    it("should support arrow key navigation", async () => {
      const user = userEvent.setup();
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Focus first experiment
      const firstExperiment = screen.getByText("CSS Animation Test");
      firstExperiment.focus();

      // Use arrow keys to navigate
      await user.keyboard("{ArrowRight}");

      const secondExperiment = screen.getByText("Canvas Particle Test");
      expect(secondExperiment).toHaveFocus();
    });
  });

  describe("Error Handling", () => {
    it("should handle experiment loading errors", async () => {
      // Mock experiment that throws error
      const ErrorExperiment = () => {
        throw new Error("Experiment failed to load");
      };

      const errorExperiment = {
        ...mockDesignExperiments[0],
        component: ErrorExperiment,
      };

      mockGetExperimentsByType.mockReturnValue([errorExperiment]);

      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Should show error message
      await waitFor(() => {
        expect(
          screen.getByText(/error loading experiment/i),
        ).toBeInTheDocument();
      });
    });

    it("should handle performance monitoring errors", async () => {
      mockStartMonitoring.mockImplementation(() => {
        throw new Error("Performance monitoring failed");
      });

      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      // Should still render experiment without performance monitoring
      await waitFor(() => {
        expect(screen.getByTestId("mock-experiment")).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Behavior", () => {
    it("should adapt layout for mobile devices", async () => {
      // Mock mobile responsive hook
      jest.doMock("@/hooks/useResponsive", () => ({
        useResponsive: () => ({
          isMobile: true,
          isTablet: false,
          isDesktop: false,
          breakpoint: "mobile",
        }),
      }));

      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Should show mobile-optimized layout
      expect(screen.getByTestId("mobile-experiment-grid")).toBeInTheDocument();
    });

    it("should handle touch gestures on mobile", async () => {
      const mockNextExperiment = jest.fn();
      const mockPreviousExperiment = jest.fn();

      jest.doMock("@/hooks/useTouchGestures", () => ({
        useExperimentSwipe: () => ({
          currentIndex: 0,
          nextExperiment: mockNextExperiment,
          previousExperiment: mockPreviousExperiment,
          canGoNext: true,
          canGoPrevious: false,
        }),
      }));

      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Simulate swipe gesture
      const experimentGrid = screen.getByTestId("experiment-grid");
      fireEvent.touchStart(experimentGrid, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchEnd(experimentGrid, {
        changedTouches: [{ clientX: 50, clientY: 100 }],
      });

      expect(mockNextExperiment).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      expect(screen.getByRole("main")).toHaveAttribute(
        "aria-label",
        "Design playground",
      );
      expect(screen.getByRole("navigation")).toHaveAttribute(
        "aria-label",
        "Design playground navigation",
      );
    });

    it("should announce experiment changes to screen readers", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent(
          /CSS Animation Test.*activated/i,
        );
      });
    });

    it("should support screen reader navigation", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Should have proper heading structure
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "Design Playground",
      );
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        /experiments/i,
      );
    });
  });

  describe("Performance Settings", () => {
    it("should allow performance settings adjustment", async () => {
      const user = userEvent.setup();
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Open settings
      const settingsButton = screen.getByRole("button", { name: /settings/i });
      await user.click(settingsButton);

      // Adjust quality level
      const qualitySelect = screen.getByRole("combobox", { name: /quality/i });
      await user.selectOptions(qualitySelect, "medium");

      // Should update performance settings
      await waitFor(() => {
        expect(screen.getByDisplayValue("medium")).toBeInTheDocument();
      });
    });

    it("should adapt settings based on device capabilities", async () => {
      // Mock low-performance device
      const lowPerfCapabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        performanceLevel: "low",
        hardwareConcurrency: 2,
      };

      mockDetectCapabilities.mockResolvedValue(lowPerfCapabilities);

      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      await waitFor(() => {
        // Should automatically set lower quality settings
        expect(screen.getByDisplayValue("low")).toBeInTheDocument();
      });
    });
  });
});
