/**
 * WebGL Playground Unit Tests
 * Task 4.1: プレイグラウンドの単体テスト（Jest）実装
 * Tests for WebGLPlayground component and WebGL-specific functionality
 */

import { deviceCapabilitiesDetector } from "@/lib/playground/device-capabilities";
import { DeviceCapabilities } from "@/types/playground";
import { render, screen, waitFor } from "@testing-library/react";
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

describe("WebGLPlayground Component", () => {
  let mockDetectCapabilities: jest.MockedFunction<
    typeof deviceCapabilitiesDetector.getCapabilities
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
  });

  describe("Basic Rendering", () => {
    it("should render WebGL playground page", async () => {
      const { default: WebGLPlaygroundPage } = await import(
        "@/app/portfolio/playground/WebGL/page"
      );

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("WebGL Playground")).toBeInTheDocument();
      });
    });

    it("should show loading state initially", async () => {
      // Mock slow capability detection
      mockDetectCapabilities.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockDeviceCapabilities), 100),
          ),
      );

      const { default: WebGLPlaygroundPage } = await import(
        "@/app/portfolio/playground/WebGL/page"
      );

      render(<WebGLPlaygroundPage />);

      expect(screen.getByText("デバイス性能を検出中...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("WebGL Playground")).toBeInTheDocument();
      });
    });

    it("should detect WebGL support on mount", async () => {
      const { default: WebGLPlaygroundPage } = await import(
        "@/app/portfolio/playground/WebGL/page"
      );

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(mockDetectCapabilities).toHaveBeenCalled();
      });
    });

    it("should show device capabilities section", async () => {
      const { default: WebGLPlaygroundPage } = await import(
        "@/app/portfolio/playground/WebGL/page"
      );

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("Device & Settings")).toBeInTheDocument();
      });
    });

    it("should show performance monitor section", async () => {
      const { default: WebGLPlaygroundPage } = await import(
        "@/app/portfolio/playground/WebGL/page"
      );

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("Performance Monitor")).toBeInTheDocument();
      });
    });
  });

  describe("Device Capabilities", () => {
    it("should handle WebGL not supported", async () => {
      const noWebGLCapabilities: DeviceCapabilities = {
        ...mockDeviceCapabilities,
        webglSupport: false,
        webgl2Support: false,
      };

      mockDetectCapabilities.mockResolvedValue(noWebGLCapabilities);

      const { default: WebGLPlaygroundPage } = await import(
        "@/app/portfolio/playground/WebGL/page"
      );

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("WebGL Playground")).toBeInTheDocument();
      });
    });

    it("should handle capability detection errors", async () => {
      mockDetectCapabilities.mockRejectedValue(new Error("Detection failed"));

      const { default: WebGLPlaygroundPage } = await import(
        "@/app/portfolio/playground/WebGL/page"
      );

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("WebGL Playground")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("should have navigation links", async () => {
      const { default: WebGLPlaygroundPage } = await import(
        "@/app/portfolio/playground/WebGL/page"
      );

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("← Portfolio に戻る")).toBeInTheDocument();
        expect(screen.getByText("Design Playground")).toBeInTheDocument();
        expect(screen.getByText("Portfolio Home")).toBeInTheDocument();
        expect(screen.getByText("Tools")).toBeInTheDocument();
      });
    });
  });

  describe("Technical Notes", () => {
    it("should show technical information", async () => {
      const { default: WebGLPlaygroundPage } = await import(
        "@/app/portfolio/playground/WebGL/page"
      );

      render(<WebGLPlaygroundPage />);

      await waitFor(() => {
        expect(screen.getByText("Technical Notes")).toBeInTheDocument();
        expect(
          screen.getByText("Performance Optimization"),
        ).toBeInTheDocument();
        expect(screen.getByText("WebGL Features")).toBeInTheDocument();
      });
    });
  });
});
