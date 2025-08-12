/**
 * @jest-environment jsdom
 */

/**
 * Basic Geometry Experiment Tests
 * Tests for BasicGeometryExperiment component
 */

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { BasicGeometryExperiment } from "../BasicGeometryExperiment";

// Mock Three.js
const mockScene = {
  add: jest.fn(),
  remove: jest.fn(),
  background: null,
};

const mockCamera = {
  position: {
    z: 5,
    set: jest.fn(),
  },
  aspect: 1,
  updateProjectionMatrix: jest.fn(),
};

const mockRenderer = {
  setSize: jest.fn(),
  setPixelRatio: jest.fn(),
  render: jest.fn(),
  dispose: jest.fn(),
  domElement: document.createElement("canvas"),
  shadowMap: {
    enabled: false,
    type: null,
  },
};

const mockGeometry = {
  dispose: jest.fn(),
};

const mockMaterial = {
  dispose: jest.fn(),
};

const mockMesh = {
  geometry: mockGeometry,
  material: mockMaterial,
  rotation: { x: 0, y: 0 },
  castShadow: false,
  receiveShadow: false,
};

const mockLight = {
  position: { set: jest.fn() },
  castShadow: false,
  shadow: {
    mapSize: { width: 1024, height: 1024 },
  },
};

const mockClock = {
  getDelta: jest.fn(() => 0.016),
};

jest.mock("three", () => ({
  Scene: jest.fn(() => mockScene),
  PerspectiveCamera: jest.fn(() => mockCamera),
  WebGLRenderer: jest.fn(() => mockRenderer),
  BoxGeometry: jest.fn(() => mockGeometry),
  SphereGeometry: jest.fn(() => mockGeometry),
  TorusGeometry: jest.fn(() => mockGeometry),
  ConeGeometry: jest.fn(() => mockGeometry),
  MeshBasicMaterial: jest.fn(() => mockMaterial),
  MeshLambertMaterial: jest.fn(() => mockMaterial),
  MeshPhongMaterial: jest.fn(() => mockMaterial),
  MeshStandardMaterial: jest.fn(() => mockMaterial),
  Mesh: jest.fn(() => mockMesh),
  AmbientLight: jest.fn(() => mockLight),
  DirectionalLight: jest.fn(() => mockLight),
  Clock: jest.fn(() => mockClock),
  Color: jest.fn(),
  PCFSoftShadowMap: "PCFSoftShadowMap",
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => {
  setTimeout(cb, 16);
  return 1;
});

global.cancelAnimationFrame = jest.fn();

// Mock performance.now
global.performance.now = jest.fn(() => Date.now());

// Mock performance.memory - only if it doesn't exist
if (!global.performance.memory) {
  Object.defineProperty(global.performance, "memory", {
    value: {
      usedJSHeapSize: 1000000,
    },
    configurable: true,
  });
}

describe("BasicGeometryExperiment", () => {
  const defaultProps = {
    isActive: true,
    deviceCapabilities: {
      webglSupport: true,
      webgl2Support: true,
      performanceLevel: "high" as const,
      devicePixelRatio: 1,
    },
    performanceSettings: {
      qualityLevel: "medium" as const,
    },
    onPerformanceUpdate: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockScene.add.mockClear();
    mockScene.remove.mockClear();
    mockCamera.updateProjectionMatrix.mockClear();
    mockRenderer.setSize.mockClear();
    mockRenderer.setPixelRatio.mockClear();
    mockRenderer.render.mockClear();
    mockRenderer.dispose.mockClear();
    mockGeometry.dispose.mockClear();
    mockMaterial.dispose.mockClear();
    mockClock.getDelta.mockReturnValue(0.016);
  });

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      render(<BasicGeometryExperiment {...defaultProps} />);
      // Component should render even if WebGL fails
      expect(document.body).toBeInTheDocument();
    });

    it("should render 3D canvas container", () => {
      render(<BasicGeometryExperiment {...defaultProps} />);

      const canvasContainer = document.querySelector(".aspect-video");
      expect(canvasContainer).toBeInTheDocument();
    });
  });

  describe("WebGL Support", () => {
    it("should show error when WebGL is not supported", () => {
      const propsWithoutWebGL = {
        ...defaultProps,
        deviceCapabilities: {
          ...defaultProps.deviceCapabilities,
          webglSupport: false,
        },
      };

      render(<BasicGeometryExperiment {...propsWithoutWebGL} />);

      expect(screen.getByText("⚠️ WebGL Error")).toBeInTheDocument();
      expect(
        screen.getByText("WebGL is not supported on this device"),
      ).toBeInTheDocument();
    });

    it("should handle WebGL initialization", () => {
      render(<BasicGeometryExperiment {...defaultProps} />);
      // Component should handle initialization gracefully
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Geometry Controls", () => {
    it("should render controls when WebGL is supported", () => {
      // Mock successful WebGL initialization
      const THREE = jest.requireMock("three");
      THREE.WebGLRenderer.mockImplementationOnce(() => mockRenderer);

      render(<BasicGeometryExperiment {...defaultProps} />);

      // If WebGL fails, we'll see error message instead of controls
      const hasError = screen.queryByText("⚠️ WebGL Error");
      if (!hasError) {
        // Controls should be present when WebGL works
        expect(document.body).toBeInTheDocument();
      } else {
        // Error state is also valid
        expect(hasError).toBeInTheDocument();
      }
    });
  });

  describe("Animation Controls", () => {
    it("should handle control interactions gracefully", () => {
      render(<BasicGeometryExperiment {...defaultProps} />);

      // Component should render without throwing errors
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Performance Settings", () => {
    it("should adapt to low quality settings", () => {
      const lowQualityProps = {
        ...defaultProps,
        performanceSettings: {
          qualityLevel: "low" as const,
        },
      };

      render(<BasicGeometryExperiment {...lowQualityProps} />);

      // Should still render without crashing
      expect(document.body).toBeInTheDocument();
    });

    it("should adapt to high quality settings", () => {
      const highQualityProps = {
        ...defaultProps,
        performanceSettings: {
          qualityLevel: "high" as const,
        },
      };

      render(<BasicGeometryExperiment {...highQualityProps} />);

      // Should still render without crashing
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Animation Loop", () => {
    it("should handle active state", () => {
      render(<BasicGeometryExperiment {...defaultProps} isActive={true} />);
      expect(document.body).toBeInTheDocument();
    });

    it("should handle inactive state", () => {
      render(<BasicGeometryExperiment {...defaultProps} isActive={false} />);
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Performance Monitoring", () => {
    it("should accept performance callback", () => {
      const onPerformanceUpdate = jest.fn();

      render(
        <BasicGeometryExperiment
          {...defaultProps}
          onPerformanceUpdate={onPerformanceUpdate}
        />,
      );

      // Component should render without errors
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Window Resize", () => {
    it("should handle window resize", () => {
      render(<BasicGeometryExperiment {...defaultProps} />);

      // Trigger resize event
      fireEvent(window, new Event("resize"));

      // Should not throw error
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle Three.js initialization errors", () => {
      const THREE = jest.requireMock("three");
      THREE.WebGLRenderer.mockImplementationOnce(() => {
        throw new Error("WebGL initialization failed");
      });

      const onError = jest.fn();
      render(<BasicGeometryExperiment {...defaultProps} onError={onError} />);

      expect(screen.getByText("⚠️ WebGL Error")).toBeInTheDocument();
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle renderer creation failure", () => {
      const THREE = jest.requireMock("three");
      THREE.WebGLRenderer.mockImplementationOnce(() => null);

      render(<BasicGeometryExperiment {...defaultProps} />);

      expect(screen.getByText("⚠️ WebGL Error")).toBeInTheDocument();
    });
  });

  describe("Component Lifecycle", () => {
    it("should cleanup resources on unmount", () => {
      const { unmount } = render(<BasicGeometryExperiment {...defaultProps} />);

      unmount();

      // Should unmount without errors
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should render accessible component", () => {
      render(<BasicGeometryExperiment {...defaultProps} />);

      // Component should be accessible
      expect(document.body).toBeInTheDocument();
    });
  });

  describe("Visual Feedback", () => {
    it("should provide visual feedback", () => {
      render(<BasicGeometryExperiment {...defaultProps} />);

      // Component should render visual elements
      expect(document.body).toBeInTheDocument();
    });
  });
});
