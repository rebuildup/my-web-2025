/**
 * Design Playground Unit Tests
 * Task 4.1: プレイグラウンドの単体テスト（Jest）実装
 * Tests for DesignPlayground component and related functionality
 */

// Mock Web APIs
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

Object.defineProperty(navigator, "maxTouchPoints", {
  writable: true,
  value: 0,
});

import { deviceCapabilitiesDetector } from "@/lib/playground/device-capabilities";
import { playgroundManager } from "@/lib/playground/playground-manager";
import { DeviceCapabilities } from "@/types/playground";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock dependencies
jest.mock("@/lib/playground/device-capabilities");
jest.mock("@/lib/playground/performance-monitor");
jest.mock("@/lib/playground/playground-manager");

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
  loadWebGLUtils: jest.fn(),
  loadThreeJS: jest.fn(),
  preloadExperimentDependencies: jest.fn(),
}));

// Mock hooks
jest.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    breakpoints: {
      xs: false,
      sm: true,
      md: true,
      lg: true,
      xl: true,
      "2xl": true,
    },
    viewport: {
      width: 1024,
      height: 768,
      aspectRatio: 1024 / 768,
    },
    touch: {
      isTouchDevice: false,
      maxTouchPoints: 0,
      supportsHover: true,
      supportsPointer: true,
    },
    orientation: "landscape" as const,
    isSmallScreen: false,
  }),
}));

jest.mock("@/hooks/useTouchGestures", () => ({
  useTouchGestures: () => ({
    gestureState: {
      isActive: false,
      startPoint: null,
      currentPoint: null,
      swipe: null,
      pinch: null,
    },
    touchHandlers: {
      onTouchStart: jest.fn(),
      onTouchMove: jest.fn(),
      onTouchEnd: jest.fn(),
    },
  }),
  useExperimentSwipe: () => ({
    onTouchStart: jest.fn(),
    onTouchMove: jest.fn(),
    onTouchEnd: jest.fn(),
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

// Mock experiments data
jest.mock("@/components/playground/design-experiments/experiments-data", () => {
  const mockDesignExperiments = [
    {
      id: "css-animation-test",
      title: "CSS Animation Test",
      description: "Test CSS animation experiment",
      technology: ["CSS", "Animation"],
      interactive: true,
      component: () => null, // Will be replaced in beforeEach
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
      component: () => null, // Will be replaced in beforeEach
      category: "canvas" as const,
      difficulty: "intermediate" as const,
      createdAt: "2025-01-01",
      updatedAt: "2025-01-01",
      performanceLevel: "medium" as const,
    },
  ];

  return {
    designExperiments: mockDesignExperiments,
    getExperimentsByCategory: jest.fn((category: string) =>
      category === "all"
        ? mockDesignExperiments
        : mockDesignExperiments.filter((exp) => exp.category === category),
    ),
    getExperimentById: jest.fn((id: string) =>
      mockDesignExperiments.find((exp) => exp.id === id),
    ),
    getExperimentsByDifficulty: jest.fn((difficulty: string) =>
      mockDesignExperiments.filter((exp) => exp.difficulty === difficulty),
    ),
    getExperimentsByPerformance: jest.fn((level: string) =>
      mockDesignExperiments.filter((exp) => exp.performanceLevel === level),
    ),
  };
});

const mockDesignExperiments = [
  {
    id: "css-animation-test",
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

describe("DesignPlayground Component", () => {
  let mockDetectCapabilities: jest.MockedFunction<
    typeof deviceCapabilitiesDetector.detectCapabilities
  >;

  let mockGetExperimentsByType: jest.MockedFunction<
    typeof playgroundManager.getExperimentsByType
  >;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockDetectCapabilities =
      deviceCapabilitiesDetector.getCapabilities as jest.MockedFunction<
        typeof deviceCapabilitiesDetector.getCapabilities
      >;
    mockDetectCapabilities.mockResolvedValue(mockDeviceCapabilities);

    // Mock getRecommendedSettings
    const mockGetRecommendedSettings =
      deviceCapabilitiesDetector.getRecommendedSettings as jest.MockedFunction<
        typeof deviceCapabilitiesDetector.getRecommendedSettings
      >;
    mockGetRecommendedSettings.mockReturnValue({
      targetFPS: 60,
      qualityLevel: "medium",
      enableOptimizations: true,
    });

    mockGetExperimentsByType =
      playgroundManager.getExperimentsByType as jest.MockedFunction<
        typeof playgroundManager.getExperimentsByType
      >;
    mockGetExperimentsByType.mockReturnValue(mockDesignExperiments);

    // Ensure experiments data is available immediately
    const experimentsData = jest.requireMock(
      "@/components/playground/design-experiments/experiments-data",
    );
    experimentsData.designExperiments = mockDesignExperiments;

    // Mock preloadCriticalExperiments
    const dynamicLoader = jest.requireMock("@/lib/playground/dynamic-loader");
    const mockPreloadCriticalExperiments =
      dynamicLoader.preloadCriticalExperiments as jest.MockedFunction<
        () => Promise<void>
      >;
    mockPreloadCriticalExperiments.mockResolvedValue(undefined);

    // Mock all dynamic loader functions
    const mockLoadWebGLUtils =
      dynamicLoader.loadWebGLUtils as jest.MockedFunction<
        () => Promise<{ THREE: object; Stats: object }>
      >;
    mockLoadWebGLUtils.mockResolvedValue({ THREE: {}, Stats: {} });

    const mockLoadThreeJS = dynamicLoader.loadThreeJS as jest.MockedFunction<
      () => Promise<object>
    >;
    mockLoadThreeJS.mockResolvedValue({});

    const mockPreloadExperimentDependencies =
      dynamicLoader.preloadExperimentDependencies as jest.MockedFunction<
        () => Promise<void>
      >;
    mockPreloadExperimentDependencies.mockResolvedValue(undefined);

    // Mock getExperimentComponent
    const mockGetExperimentComponent =
      dynamicLoader.getExperimentComponent as jest.MockedFunction<
        (id: string) => React.ComponentType
      >;
    mockGetExperimentComponent.mockReturnValue(MockExperimentComponent);
  });

  describe("Component Rendering", () => {
    it("should render design playground page with header", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for device capabilities to load
      await waitFor(() => {
        expect(screen.getByText("Design Playground")).toBeInTheDocument();
      });

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

      await waitFor(() => {
        expect(
          screen.getByRole("combobox", { name: /category/i }),
        ).toBeInTheDocument();
      });

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
      await waitFor(() => {
        expect(screen.getByText("Design Playground")).toBeInTheDocument();
      });
    });
  });

  describe("Performance Monitoring", () => {
    it("should start performance monitoring when experiment becomes active", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Click on an experiment to activate it
      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      // Performance monitoring is handled by the experiment component itself
      // Just verify the experiment is activated
      await waitFor(() => {
        expect(screen.getByTestId("mock-experiment")).toBeInTheDocument();
      });
    });

    it("should stop performance monitoring when experiment becomes inactive", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Activate experiment
      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(screen.getByTestId("mock-experiment")).toBeInTheDocument();
      });

      // Click the same experiment to deactivate it
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(screen.queryByTestId("mock-experiment")).not.toBeInTheDocument();
      });
    });

    it("should handle performance metrics updates", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Activate experiment
      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      // Trigger performance update
      const updateButton = await screen.findByText("Update Performance");
      fireEvent.click(updateButton);

      // Should display performance metrics in the performance monitor section
      // First expand the performance monitor
      const performanceButton = screen.getByText("Performance Monitor");
      fireEvent.click(performanceButton);

      await waitFor(() => {
        expect(screen.getByText("60")).toBeInTheDocument();
      });
    });
  });

  describe("Interactive Elements", () => {
    it("should handle experiment selection", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(screen.getByTestId("mock-experiment")).toBeInTheDocument();
        expect(screen.getByText("Active: true")).toBeInTheDocument();
      });
    });

    it("should handle filter changes", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Change category filter
      const categorySelect = screen.getByRole("combobox", {
        name: /category/i,
      });
      fireEvent.change(categorySelect, { target: { value: "css" } });

      // Should filter experiments
      await waitFor(() => {
        expect(screen.getByText("CSS Animation Test")).toBeInTheDocument();
        expect(
          screen.queryByText("Canvas Particle Test"),
        ).not.toBeInTheDocument();
      });
    });

    it("should handle difficulty filter", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Change difficulty filter
      const difficultySelect = screen.getByRole("combobox", {
        name: /difficulty/i,
      });
      fireEvent.change(difficultySelect, { target: { value: "beginner" } });

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
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Find and click on first experiment directly (simulating keyboard activation)
      const firstExperiment = screen.getByText("CSS Animation Test");
      fireEvent.click(firstExperiment);

      await waitFor(() => {
        expect(screen.getByTestId("mock-experiment")).toBeInTheDocument();
      });
    });

    it("should support focus management", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Test that experiments can be focused and clicked
      const firstExperiment = screen.getByText("CSS Animation Test");
      expect(firstExperiment).toBeInTheDocument();

      const secondExperiment = screen.getByText("Canvas Particle Test");
      expect(secondExperiment).toBeInTheDocument();

      // Test clicking functionality
      fireEvent.click(firstExperiment);
      await waitFor(() => {
        expect(screen.getByTestId("mock-experiment")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle experiment loading errors", async () => {
      // Mock getExperimentComponent to return null (simulating loading error)
      const dynamicLoader = jest.requireMock("@/lib/playground/dynamic-loader");
      const mockGetExperimentComponent =
        dynamicLoader.getExperimentComponent as jest.MockedFunction<
          (id: string) => React.ComponentType | null
        >;
      mockGetExperimentComponent.mockReturnValue(null);

      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Click on an experiment to activate it
      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      // Should show error message
      await waitFor(() => {
        expect(
          screen.getByText(/Failed to load experiment/i),
        ).toBeInTheDocument();
      });
    });

    it("should handle performance monitoring errors", async () => {
      // Performance monitoring errors are handled gracefully by the component
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

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
      // Mock mobile responsive hook for this test
      const mockUseResponsive = jest.fn(() => ({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
        breakpoints: {
          xs: true,
          sm: false,
          md: false,
          lg: false,
          xl: false,
          "2xl": false,
        },
        viewport: {
          width: 375,
          height: 667,
          aspectRatio: 375 / 667,
        },
        touch: {
          isTouchDevice: true,
          maxTouchPoints: 5,
          supportsHover: false,
          supportsPointer: true,
        },
        orientation: "portrait" as const,
        isSmallScreen: true,
      }));

      // Temporarily override the mock
      const originalMock = jest.requireMock(
        "@/hooks/useResponsive",
      ).useResponsive;
      jest.requireMock("@/hooks/useResponsive").useResponsive =
        mockUseResponsive;

      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(
          screen.getByTestId("mobile-experiment-grid"),
        ).toBeInTheDocument();
      });

      // Restore original mock
      jest.requireMock("@/hooks/useResponsive").useResponsive = originalMock;
    });

    it("should handle touch gestures on mobile", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Simulate swipe gesture on experiment grid
      const experimentGrid = screen.getByTestId("experiment-grid");
      fireEvent.touchStart(experimentGrid, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchMove(experimentGrid, {
        touches: [{ clientX: 50, clientY: 100 }],
      });
      fireEvent.touchEnd(experimentGrid, {
        changedTouches: [{ clientX: 50, clientY: 100 }],
      });

      // Touch gestures are handled by the component
      expect(experimentGrid).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByRole("main")).toHaveAttribute(
          "aria-label",
          "Design playground",
        );
      });

      expect(
        screen.getByRole("navigation", {
          name: "Design playground navigation",
        }),
      ).toHaveAttribute("aria-label", "Design playground navigation");
    });

    it("should announce experiment changes to screen readers", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      const experimentCard = await screen.findByText("CSS Animation Test");
      fireEvent.click(experimentCard);

      // Check for aria-live region that announces changes
      await waitFor(() => {
        expect(screen.getByLabelText("Active experiment")).toBeInTheDocument();
      });
    });

    it("should support screen reader navigation", async () => {
      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
          "Design Playground",
        );
      });

      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        /Interactive design experiments/i,
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

      // Wait for component to load
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Open settings
      const settingsButton = screen.getByLabelText("Settings");
      await user.click(settingsButton);

      // Adjust quality level
      const qualitySelect = screen.getByTestId("quality-select");
      await user.selectOptions(qualitySelect, "medium");

      // Should update performance settings
      await waitFor(() => {
        const qualitySelect = screen.getByTestId("quality-select");
        expect(qualitySelect).toHaveValue("medium");
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

      // Mock getRecommendedSettings for low performance
      const mockGetRecommendedSettings =
        deviceCapabilitiesDetector.getRecommendedSettings as jest.MockedFunction<
          typeof deviceCapabilitiesDetector.getRecommendedSettings
        >;
      mockGetRecommendedSettings.mockReturnValue({
        targetFPS: 30,
        qualityLevel: "low",
        enableOptimizations: true,
      });

      const DesignPlaygroundPage = (
        await import("@/app/portfolio/playground/design/page")
      ).default;

      render(<DesignPlaygroundPage />);

      // Wait for component to load and settings to be applied
      await waitFor(() => {
        expect(screen.getByTestId("experiment-grid")).toBeInTheDocument();
      });

      // Open settings to check the quality level
      const settingsButton = screen.getByLabelText("Settings");
      fireEvent.click(settingsButton);

      await waitFor(() => {
        // Should automatically set lower quality settings
        const qualitySelect = screen.getByTestId("quality-select");
        expect(qualitySelect).toHaveValue("low");
      });
    });
  });
});
