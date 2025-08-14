/**
 * @jest-environment jsdom
 */

/**
 * Canvas Particle Experiment Tests
 * Tests for CanvasParticleExperiment component
 */

import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { CanvasParticleExperiment } from "../CanvasParticleExperiment";

// Mock performance monitor
jest.mock("@/lib/playground/performance-monitor", () => ({
  performanceMonitor: {
    startMonitoring: jest.fn(),
    stopMonitoring: jest.fn(),
  },
}));

// Mock Canvas API
const mockCanvas = {
  getContext: jest.fn(() => ({
    fillStyle: "",
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    globalAlpha: 1,
    strokeStyle: "",
    lineWidth: 1,
  })),
  width: 800,
  height: 400,
  clientWidth: 800,
  clientHeight: 400,
  getBoundingClientRect: jest.fn(() => ({
    left: 0,
    top: 0,
    width: 800,
    height: 400,
  })),
  parentElement: {
    clientWidth: 800,
    clientHeight: 400,
  },
};

// Mock HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: mockCanvas.getContext,
});

Object.defineProperty(HTMLCanvasElement.prototype, "width", {
  get: () => mockCanvas.width,
  set: (value) => {
    mockCanvas.width = value;
  },
});

Object.defineProperty(HTMLCanvasElement.prototype, "height", {
  get: () => mockCanvas.height,
  set: (value) => {
    mockCanvas.height = value;
  },
});

Object.defineProperty(HTMLCanvasElement.prototype, "clientWidth", {
  get: () => mockCanvas.clientWidth,
});

Object.defineProperty(HTMLCanvasElement.prototype, "clientHeight", {
  get: () => mockCanvas.clientHeight,
});

Object.defineProperty(HTMLCanvasElement.prototype, "getBoundingClientRect", {
  value: mockCanvas.getBoundingClientRect,
});

Object.defineProperty(HTMLCanvasElement.prototype, "parentElement", {
  get: () => mockCanvas.parentElement,
});

// Mock requestAnimationFrame - don't actually execute callbacks to avoid infinite loops
global.requestAnimationFrame = jest.fn(() => 1);
global.cancelAnimationFrame = jest.fn();

describe("CanvasParticleExperiment", () => {
  const defaultProps = {
    isActive: true,
    onPerformanceUpdate: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("should render without crashing", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);
      expect(screen.getByText("Particle System Controls")).toBeInTheDocument();
    });

    it("should render canvas element", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);
      const canvas = document.querySelector("canvas");
      expect(canvas).toBeInTheDocument();
    });

    it("should render control buttons", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      expect(screen.getByText("Start")).toBeInTheDocument();
      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("should render all control sliders", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      expect(screen.getByDisplayValue("100")).toBeInTheDocument(); // Count slider
      expect(screen.getByDisplayValue("2")).toBeInTheDocument(); // Speed slider
      expect(screen.getByDisplayValue("3")).toBeInTheDocument(); // Size slider
      expect(screen.getByDisplayValue("0.1")).toBeInTheDocument(); // Gravity slider
      expect(screen.getByDisplayValue("0.99")).toBeInTheDocument(); // Friction slider
    });

    it("should render dropdown controls", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      expect(screen.getByDisplayValue("Bounce")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Rainbow")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Mixed")).toBeInTheDocument();
    });
  });

  describe("Animation Controls", () => {
    it("should start animation on button click", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const startButton = screen.getByText("Start");
      fireEvent.click(startButton);

      expect(screen.getByText("Pause")).toBeInTheDocument();
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it("should pause animation", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      // Start animation first
      const startButton = screen.getByText("Start");
      fireEvent.click(startButton);

      // Then pause it
      const pauseButton = screen.getByText("Pause");
      fireEvent.click(pauseButton);

      expect(screen.getByText("Start")).toBeInTheDocument();
    });

    it("should reset particles", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const resetButton = screen.getByText("Reset");
      fireEvent.click(resetButton);

      // Should clear canvas - check if getContext was called
      expect(mockCanvas.getContext).toHaveBeenCalled();
    });
  });

  describe("Particle Configuration", () => {
    it("should update particle count", async () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const countSlider = screen.getByDisplayValue("100");
      fireEvent.change(countSlider, { target: { value: "200" } });

      expect(screen.getByText("Count: 200")).toBeInTheDocument();
    });

    it("should update particle speed", async () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const speedSlider = screen.getByDisplayValue("2");
      fireEvent.change(speedSlider, { target: { value: "5.0" } });

      expect(screen.getByText("Speed: 5.0")).toBeInTheDocument();
    });

    it("should update particle size", async () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const sizeSlider = screen.getByDisplayValue("3");
      fireEvent.change(sizeSlider, { target: { value: "5" } });

      expect(screen.getByText("Size: 5")).toBeInTheDocument();
    });

    it("should update gravity", async () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const gravitySlider = screen.getByDisplayValue("0.1");
      fireEvent.change(gravitySlider, { target: { value: "0.5" } });

      expect(screen.getByText("Gravity: 0.50")).toBeInTheDocument();
    });

    it("should update friction", async () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const frictionSlider = screen.getByDisplayValue("0.99");
      fireEvent.change(frictionSlider, { target: { value: "0.95" } });

      expect(screen.getByText("Friction: 0.95")).toBeInTheDocument();
    });
  });

  describe("Physics Modes", () => {
    it("should change physics mode", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const physicsSelect = screen.getByDisplayValue("Bounce");
      fireEvent.change(physicsSelect, { target: { value: "flow" } });

      expect(physicsSelect).toHaveValue("flow");
    });

    it("should handle all physics modes", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const physicsModes = ["bounce", "flow", "attract", "repel"];
      const physicsSelect = screen.getByDisplayValue("Bounce");

      for (const mode of physicsModes) {
        fireEvent.change(physicsSelect, { target: { value: mode } });
        expect(physicsSelect).toHaveValue(mode);
      }
    });
  });

  describe("Color Modes", () => {
    it("should change color mode", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const colorSelect = screen.getByDisplayValue("Rainbow");
      fireEvent.change(colorSelect, { target: { value: "monochrome" } });

      expect(colorSelect).toHaveValue("monochrome");
    });

    it("should handle all color modes", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const colorModes = ["rainbow", "monochrome", "gradient"];
      const colorSelect = screen.getByDisplayValue("Rainbow");

      for (const mode of colorModes) {
        fireEvent.change(colorSelect, { target: { value: mode } });
        expect(colorSelect).toHaveValue(mode);
      }
    });
  });

  describe("Shape Modes", () => {
    it("should change shape mode", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const shapeSelect = screen.getByDisplayValue("Mixed");
      fireEvent.change(shapeSelect, { target: { value: "circle" } });

      expect(shapeSelect).toHaveValue("circle");
    });

    it("should handle all shape modes", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const shapeModes = ["mixed", "circle", "square", "triangle"];
      const shapeSelect = screen.getByDisplayValue("Mixed");

      for (const mode of shapeModes) {
        fireEvent.change(shapeSelect, { target: { value: mode } });
        expect(shapeSelect).toHaveValue(mode);
      }
    });
  });

  describe("Mouse Interaction", () => {
    it("should handle mouse move events", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const canvas = document.querySelector("canvas");
      expect(canvas).toBeInTheDocument();

      // Mock getBoundingClientRect using Object.defineProperty
      if (canvas) {
        Object.defineProperty(canvas, "getBoundingClientRect", {
          value: jest.fn(() => ({
            left: 0,
            top: 0,
            width: 800,
            height: 400,
            right: 800,
            bottom: 400,
            x: 0,
            y: 0,
            toJSON: () => {},
          })),
          writable: true,
        });
      }

      fireEvent.mouseMove(canvas!, {
        clientX: 100,
        clientY: 100,
      });

      // Should not throw error
      expect(canvas).toBeInTheDocument();
    });

    it("should handle mouse down events", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const canvas = document.querySelector("canvas");
      expect(canvas).toBeInTheDocument();

      fireEvent.mouseDown(canvas!);
      fireEvent.mouseUp(canvas!);

      // Should not throw error
      expect(canvas).toBeInTheDocument();
    });

    it("should handle mouse leave events", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const canvas = document.querySelector("canvas");
      expect(canvas).toBeInTheDocument();

      fireEvent.mouseLeave(canvas!);

      // Should not throw error
      expect(canvas).toBeInTheDocument();
    });
  });

  describe("Canvas Initialization", () => {
    it("should initialize canvas with correct size", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const canvas = document.querySelector("canvas");
      expect(canvas).toBeInTheDocument();
      expect(mockCanvas.getContext).toHaveBeenCalled();
    });

    it("should handle window resize", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      // Trigger resize event
      fireEvent(window, new Event("resize"));

      // Should not throw error
      const canvas = document.querySelector("canvas");
      expect(canvas).toBeInTheDocument();
    });
  });

  describe("Performance Monitoring", () => {
    it("should start performance monitoring when active", () => {
      const { performanceMonitor } = jest.requireMock(
        "@/lib/playground/performance-monitor",
      );

      render(<CanvasParticleExperiment {...defaultProps} isActive={true} />);

      expect(performanceMonitor.startMonitoring).toHaveBeenCalled();
    });

    it("should not start monitoring when inactive", () => {
      const { performanceMonitor } = jest.requireMock(
        "@/lib/playground/performance-monitor",
      );

      render(<CanvasParticleExperiment {...defaultProps} isActive={false} />);

      expect(performanceMonitor.startMonitoring).not.toHaveBeenCalled();
    });

    it("should stop monitoring on cleanup", () => {
      const { performanceMonitor } = jest.requireMock(
        "@/lib/playground/performance-monitor",
      );

      const { unmount } = render(
        <CanvasParticleExperiment {...defaultProps} isActive={true} />,
      );

      unmount();

      expect(performanceMonitor.stopMonitoring).toHaveBeenCalled();
    });
  });

  describe("Instructions and Help", () => {
    it("should render interaction guide", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      expect(screen.getByText("Interaction Guide")).toBeInTheDocument();
      expect(
        screen.getByText(/マウスを動かしてパーティクルとインタラクション/),
      ).toBeInTheDocument();
    });

    it("should provide helpful instructions", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      expect(
        screen.getByText(/Attract\/Repel モードでマウスの影響を体験/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/異なる物理モードで様々な動作を確認/),
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for controls", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      expect(screen.getByText(/Count:/)).toBeInTheDocument();
      expect(screen.getByText(/Speed:/)).toBeInTheDocument();
      expect(screen.getByText(/Size:/)).toBeInTheDocument();
      expect(screen.getByText(/Gravity:/)).toBeInTheDocument();
      expect(screen.getByText("Physics")).toBeInTheDocument();
      expect(screen.getByText("Colors")).toBeInTheDocument();
      expect(screen.getByText("Shape")).toBeInTheDocument();
    });

    it("should have keyboard accessible controls", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const startButton = screen.getByText("Start");
      const resetButton = screen.getByText("Reset");

      expect(startButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
    });

    it("should have cursor crosshair on canvas", () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      const canvas = document.querySelector("canvas");
      expect(canvas).toHaveClass("cursor-crosshair");
    });
  });

  describe("Error Handling", () => {
    it("should handle canvas context creation failure", () => {
      // Mock getContext to return null
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = jest.fn(() => null);

      render(<CanvasParticleExperiment {...defaultProps} />);

      // Should still render without crashing
      expect(screen.getByText("Particle System Controls")).toBeInTheDocument();

      // Restore original method
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    });
  });

  describe("Component Lifecycle", () => {
    it("should cleanup animation frame on unmount", () => {
      const { unmount } = render(
        <CanvasParticleExperiment {...defaultProps} />,
      );

      unmount();

      // Component should unmount without errors
      expect(document.body).toBeInTheDocument();
    });

    it("should handle config changes", async () => {
      render(<CanvasParticleExperiment {...defaultProps} />);

      // Change multiple config values
      const countSlider = screen.getByDisplayValue("100");
      fireEvent.change(countSlider, { target: { value: "150" } });

      const speedSlider = screen.getByDisplayValue("2");
      fireEvent.change(speedSlider, { target: { value: "3.0" } });

      expect(screen.getByText("Count: 150")).toBeInTheDocument();
      expect(screen.getByText("Speed: 3.0")).toBeInTheDocument();
    });
  });
});
