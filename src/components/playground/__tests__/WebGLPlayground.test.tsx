/**
 * WebGL Playground Unit Tests
 * Task 4.1: プレイグラウンドの単体テスト（Jest）実装
 * Tests for WebGLPlayground component and WebGL-specific functionality
 */

// import { webglExperiments } from "@/components/playground/webgl-experiments/experiments-data";
import { deviceCapabilitiesDetector } from "@/lib/playground/device-capabilities";
import { performanceOptimizer } from "@/lib/playground/performance-optimizer";
import { playgroundManager } from "@/lib/playground/playground-manager";
import { webglMemoryManager } from "@/lib/playground/webgl-memory-manager";
import { DeviceCapabilities, WebGLExperiment } from "@/types/playground";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock WebGL context
const mockWebGLContext = {
  canvas: document.createElement("canvas"),
  getParameter: jest.fn(),
  createShader: jest.fn(),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  getShaderParameter: jest.fn(),
  createProgram: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  getProgramParameter: jest.fn(),
  useProgram: jest.fn(),
  clear: jest.fn(),
  clearColor: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),
  viewport: jest.fn(),
  drawArrays: jest.fn(),
  drawElements: jest.fn(),
};

// Mock WebGL support
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: jest.fn((contextType) => {
    if (contextType === "webgl" || contextType === "webgl2") {
      return mockWebGLContext;
    }
    return null;
  }),
});

// Mock dependencies
jest.mock("@/lib/playground/device-capabilities");
jest.mock("@/lib/playground/performance-optimizer");
jest.mock("@/lib/playground/webgl-memory-manager");
jest.mock("@/lib/playground/playground-manager");
jest.mock("@/components/playground/webgl-experiments/experiments-data");

// Mock Three.js
jest.mock("three", () => ({
  Scene: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn(),
  })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: document.createElement("canvas"),
    getContext: () => mockWebGLContext,
  })),
  BoxGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Mesh: jest.fn(() => ({
    rotation: { x: 0, y: 0, z: 0 },
  })),
  AnimationMixer: jest.fn(),
  Clock: jest.fn(() => ({
    getDelta: jest.fn(() => 0.016),
  })),
}));

// Mock experiment components
const MockWebGLExperiment = ({
  isActive,
  onPerformanceUpdate,
  onError,
}: {
  experiment: unknown;
  isActive: boolean;
  onPerformanceUpdate: (metrics: unknown) => void;
  onError: (error: Error) => void;
}) => {
  return (
    <div data-testid="mock-webgl-experiment">
      <canvas data-testid="webgl-canvas" />
      <div>Active: {isActive ? "true" : "false"}</div>
      <button
        onClick={() =>
          onPerformanceUpdate?.({
            fps: 60,
            frameTime: 16.67,
            memoryUsage: 100,
            gpuUsage: 50,
            drawCalls: 10,
            triangles: 1000,
          })
        }
      >
        Update Performance
      </button>
      <button onClick={() => onError?.(new Error("WebGL context lost"))}>
        Trigger Error
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

const mockWebGLExperiments: WebGLExperiment[] = [
  {
    id: "basic-geometry-1",
    title: "Basic Geometry Test",
    description: "Test basic 3D geometry",
    technology: ["WebGL", "Three.js"],
    interactive: true,
    component: MockWebGLExperiment,
    category: "3d",
    difficulty: "beginner",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
    webglType: "3d",
    performanceLevel: "medium",
    requiresWebGL2: false,
  },
  {
    id: "shader-experiment-1",
    title: "Shader Test",
    description: "Test custom shaders",
    technology: ["WebGL", "GLSL"],
    interactive: true,
    component: MockWebGLExperiment,
    category: "shader",
    difficulty: "advanced",
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
    webglType: "shader",
    performanceLevel: "high",
    requiresWebGL2: true,
    shaderCode:
      "precision mediump float; void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }",
  },
];

describe.skip("WebGLPlayground Component", () => {
  let mockDetectCapabilities: jest.MockedFunction<
    typeof deviceCapabilitiesDetector.detectCapabilities
  >;
  let mockOptimizeForDevice: jest.MockedFunction<
    typeof performanceOptimizer.optimizeForDevice
  >;
  let mockInitializeMemoryManager: jest.MockedFunction<
    typeof webglMemoryManager.initialize
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

    mockOptimizeForDevice =
      performanceOptimizer.optimizeForDevice as jest.MockedFunction<
        typeof performanceOptimizer.optimizeForDevice
      >;
    mockOptimizeForDevice.mockReturnValue({
      targetFPS: 60,
      qualityLevel: "high",
      enableOptimizations: true,
    });

    mockInitializeMemoryManager =
      webglMemoryManager.initialize as jest.MockedFunction<
        typeof webglMemoryManager.initialize
      >;

    mockGetExperimentsByType =
      playgroundManager.getExperimentsByType as jest.MockedFunction<
        typeof playgroundManager.getExperimentsByType
      >;
    mockGetExperimentsByType.mockReturnValue(mockWebGLExperiments);

    // (webglExperiments as any) = mockWebGLExperiments;
  });

  describe("WebGL Initialization", () => {
    it("should detect WebGL support on mount", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(mockDetectCapabilities).toHaveBeenCalled();
      });
    });

    it("should initialize WebGL memory manager", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(mockInitializeMemoryManager).toHaveBeenCalledWith(
          mockDeviceCapabilities,
        );
      });
    });

    it("should handle WebGL context creation", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate a WebGL experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(screen.getByTestId("webgl-canvas")).toBeInTheDocument();
      });
    });

    it("should handle WebGL context loss", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      // Simulate context loss
      const canvas = await screen.findByTestId("webgl-canvas");
      fireEvent(canvas, new Event("webglcontextlost"));

      await waitFor(() => {
        expect(screen.getByText(/webgl context lost/i)).toBeInTheDocument();
      });
    });
  });

  describe("Device Performance Detection", () => {
    it("should detect device performance level", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(mockDetectCapabilities).toHaveBeenCalled();
        expect(mockOptimizeForDevice).toHaveBeenCalledWith(
          mockDeviceCapabilities,
        );
      });
    });

    it("should adapt quality settings for low-performance devices", async () => {
      const lowPerfCapabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        performanceLevel: "low",
        hardwareConcurrency: 2,
        maxTextureSize: 1024,
      };

      mockDetectCapabilities.mockResolvedValue(lowPerfCapabilities);
      mockOptimizeForDevice.mockReturnValue({
        targetFPS: 30,
        qualityLevel: "low",
        enableOptimizations: true,
      });

      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(mockOptimizeForDevice).toHaveBeenCalledWith(lowPerfCapabilities);
      });
    });

    it("should handle WebGL2 requirement checking", async () => {
      // Mock device without WebGL2 support
      const webgl1Capabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        webgl2Support: false,
      };

      mockDetectCapabilities.mockResolvedValue(webgl1Capabilities);

      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Should show only WebGL1 compatible experiments
      await waitFor(() => {
        expect(screen.getByText("Basic Geometry Test")).toBeInTheDocument();
        expect(screen.queryByText("Shader Test")).not.toBeInTheDocument();
      });
    });
  });

  describe("Performance Monitoring", () => {
    it("should monitor WebGL performance metrics", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      // Trigger performance update
      const updateButton = await screen.findByText("Update Performance");
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText(/60.*fps/i)).toBeInTheDocument();
        expect(screen.getByText(/10.*draw calls/i)).toBeInTheDocument();
        expect(screen.getByText(/1000.*triangles/i)).toBeInTheDocument();
      });
    });

    it("should maintain 60fps target", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      // Should show FPS target
      await waitFor(() => {
        expect(screen.getByText(/target.*60.*fps/i)).toBeInTheDocument();
      });
    });

    it("should handle performance degradation", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      // Simulate low FPS
      const updateButton = await screen.findByText("Update Performance");
      fireEvent.click(updateButton);

      // Mock low performance update
      // const mockLowPerf: PerformanceMetrics = {
      //   fps: 20,
      //   frameTime: 50,
      //   memoryUsage: 200,
      //   gpuUsage: 90,
      //   drawCalls: 50,
      //   triangles: 10000,
      // };

      // Should show performance warning
      await waitFor(() => {
        expect(screen.getByText(/performance warning/i)).toBeInTheDocument();
      });
    });
  });

  describe("Quality Adjustment", () => {
    it("should allow manual quality adjustment", async () => {
      const user = userEvent.setup();
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Open quality settings
      const settingsButton = screen.getByRole("button", { name: /settings/i });
      await user.click(settingsButton);

      // Adjust quality
      const qualitySlider = screen.getByRole("slider", { name: /quality/i });
      fireEvent.change(qualitySlider, { target: { value: "50" } });

      await waitFor(() => {
        expect(screen.getByDisplayValue("50")).toBeInTheDocument();
      });
    });

    it("should automatically adjust quality based on performance", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      // Simulate performance drop
      // const mockLowPerf: PerformanceMetrics = {
      //   fps: 15,
      //   frameTime: 66.67,
      //   memoryUsage: 300,
      //   gpuUsage: 95,
      //   drawCalls: 100,
      //   triangles: 50000,
      // };

      // Should automatically reduce quality
      await waitFor(() => {
        expect(
          screen.getByText(/quality automatically reduced/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Shader Code Display", () => {
    it("should display shader code for shader experiments", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate shader experiment (if WebGL2 is supported)
      if (mockDeviceCapabilities.webgl2Support) {
        const shaderCard = await screen.findByText("Shader Test");
        fireEvent.click(shaderCard);

        await waitFor(() => {
          expect(
            screen.getByText(/precision mediump float/),
          ).toBeInTheDocument();
        });
      }
    });

    it("should allow shader code editing", async () => {
      const user = userEvent.setup();
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      if (mockDeviceCapabilities.webgl2Support) {
        // Activate shader experiment
        const shaderCard = await screen.findByText("Shader Test");
        fireEvent.click(shaderCard);

        // Edit shader code
        const codeEditor = await screen.findByRole("textbox", {
          name: /shader code/i,
        });
        await user.clear(codeEditor);
        await user.type(
          codeEditor,
          "precision mediump float; void main() { gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); }",
        );

        // Apply changes
        const applyButton = screen.getByRole("button", { name: /apply/i });
        await user.click(applyButton);

        await waitFor(() => {
          expect(screen.getByText(/shader updated/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle WebGL initialization errors", async () => {
      // Mock WebGL context creation failure
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null);

      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText(/webgl not supported/i)).toBeInTheDocument();
      });
    });

    it("should handle shader compilation errors", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment and trigger error
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      const errorButton = await screen.findByText("Trigger Error");
      fireEvent.click(errorButton);

      await waitFor(() => {
        expect(screen.getByText(/webgl context lost/i)).toBeInTheDocument();
      });
    });

    it("should provide fallback for unsupported experiments", async () => {
      // Mock device without WebGL support
      const noWebGLCapabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        webglSupport: false,
        webgl2Support: false,
      };

      mockDetectCapabilities.mockResolvedValue(noWebGLCapabilities);

      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText(/webgl not supported/i)).toBeInTheDocument();
        expect(screen.getByText(/fallback content/i)).toBeInTheDocument();
      });
    });
  });

  describe("Memory Management", () => {
    it("should track WebGL memory usage", async () => {
      const mockGetMemoryUsage = jest.fn(() => ({
        textureMemory: 50,
        bufferMemory: 30,
        totalMemory: 80,
      }));

      (webglMemoryManager.getMemoryUsage as jest.Mock) = mockGetMemoryUsage;

      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(screen.getByText(/80.*mb.*memory/i)).toBeInTheDocument();
      });
    });

    it("should cleanup resources on experiment change", async () => {
      const mockCleanup = jest.fn();
      (webglMemoryManager.cleanup as jest.Mock) = mockCleanup;

      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate first experiment
      const firstCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(firstCard);

      // Switch to second experiment
      const secondCard = await screen.findByText("Shader Test");
      fireEvent.click(secondCard);

      await waitFor(() => {
        expect(mockCleanup).toHaveBeenCalled();
      });
    });
  });

  describe("Accessibility", () => {
    it("should provide alternative content for screen readers", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(
          screen.getByRole("img", { name: /3d geometry visualization/i }),
        ).toBeInTheDocument();
      });
    });

    it("should announce WebGL state changes", async () => {
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent(
          /webgl experiment.*activated/i,
        );
      });
    });

    it("should support keyboard controls for WebGL experiments", async () => {
      const user = userEvent.setup();
      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      // Use keyboard controls
      const canvas = await screen.findByTestId("webgl-canvas");
      canvas.focus();

      await user.keyboard("{ArrowUp}");
      await user.keyboard("{ArrowDown}");
      await user.keyboard("{ArrowLeft}");
      await user.keyboard("{ArrowRight}");

      // Should handle keyboard input
      expect(canvas).toHaveFocus();
    });
  });

  describe("Dynamic Loading", () => {
    it("should dynamically load experiment components", async () => {
      const mockGetExperimentComponent = jest.fn();
      jest.doMock("@/lib/playground/dynamic-loader", () => ({
        getExperimentComponent: mockGetExperimentComponent,
        preloadCriticalExperiments: jest.fn(),
      }));

      mockGetExperimentComponent.mockResolvedValue(MockWebGLExperiment);

      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      // Activate experiment
      const experimentCard = await screen.findByText("Basic Geometry Test");
      fireEvent.click(experimentCard);

      await waitFor(() => {
        expect(mockGetExperimentComponent).toHaveBeenCalledWith(
          "basic-geometry-1",
        );
      });
    });

    it("should preload critical experiments", async () => {
      const mockPreloadCritical = jest.fn();
      jest.doMock("@/lib/playground/dynamic-loader", () => ({
        getExperimentComponent: jest.fn(),
        preloadCriticalExperiments: mockPreloadCritical,
      }));

      const WebGLPlaygroundPage = (
        await import("@/app/portfolio/playground/WebGL/page")
      ).default;

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(mockPreloadCritical).toHaveBeenCalledWith("webgl");
      });
    });
  });
});
