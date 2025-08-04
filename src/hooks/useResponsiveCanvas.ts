/**
 * Responsive canvas utilities for playground experiments
 * Task 2.1: プレイグラウンドのレスポンシブ対応 - 画面サイズに応じたキャンバスサイズ調整
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useResponsive } from "./useResponsive";

export interface CanvasDimensions {
  width: number;
  height: number;
  aspectRatio: number;
  pixelRatio: number;
  displayWidth: number;
  displayHeight: number;
}

export interface CanvasConfig {
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  maintainAspectRatio?: boolean;
  pixelRatioMultiplier?: number;
  minWidth?: number;
  minHeight?: number;
}

const DEFAULT_CONFIG: Required<CanvasConfig> = {
  maxWidth: 1200,
  maxHeight: 800,
  aspectRatio: 16 / 9,
  maintainAspectRatio: true,
  pixelRatioMultiplier: 1,
  minWidth: 320,
  minHeight: 240,
};

export const useResponsiveCanvas = (
  containerRef: React.RefObject<HTMLElement | null>,
  config: CanvasConfig = {},
) => {
  const responsive = useResponsive();
  const [dimensions, setDimensions] = useState<CanvasDimensions>({
    width: 800,
    height: 600,
    aspectRatio: 4 / 3,
    pixelRatio: 1,
    displayWidth: 800,
    displayHeight: 600,
  });

  const calculateDimensions = useCallback((): CanvasDimensions => {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    let containerWidth = responsive.viewport.width;
    let containerHeight = responsive.viewport.height;

    // Get container dimensions if available
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerWidth = rect.width;
      containerHeight = rect.height;
    }

    // Apply responsive adjustments
    if (responsive.isMobile) {
      containerWidth = Math.min(containerWidth * 0.95, finalConfig.maxWidth);
      containerHeight = Math.min(containerHeight * 0.6, finalConfig.maxHeight);
    } else if (responsive.isTablet) {
      containerWidth = Math.min(containerWidth * 0.9, finalConfig.maxWidth);
      containerHeight = Math.min(containerHeight * 0.7, finalConfig.maxHeight);
    } else {
      containerWidth = Math.min(containerWidth * 0.8, finalConfig.maxWidth);
      containerHeight = Math.min(containerHeight * 0.8, finalConfig.maxHeight);
    }

    let width = containerWidth;
    let height = containerHeight;

    // Maintain aspect ratio if required
    if (finalConfig.maintainAspectRatio) {
      const targetAspectRatio = finalConfig.aspectRatio;
      const containerAspectRatio = containerWidth / containerHeight;

      if (containerAspectRatio > targetAspectRatio) {
        // Container is wider than target aspect ratio
        width = containerHeight * targetAspectRatio;
        height = containerHeight;
      } else {
        // Container is taller than target aspect ratio
        width = containerWidth;
        height = containerWidth / targetAspectRatio;
      }
    }

    // Apply min/max constraints
    width = Math.max(
      finalConfig.minWidth,
      Math.min(width, finalConfig.maxWidth),
    );
    height = Math.max(
      finalConfig.minHeight,
      Math.min(height, finalConfig.maxHeight),
    );

    // Calculate pixel ratio
    const basePixelRatio =
      responsive.viewport.width > 0 ? window.devicePixelRatio || 1 : 1;
    const pixelRatio = basePixelRatio * finalConfig.pixelRatioMultiplier;

    // Adjust for device performance
    let performanceMultiplier = 1;
    if (responsive.isMobile) {
      performanceMultiplier = 0.75; // Reduce resolution on mobile for performance
    } else if (responsive.isTablet) {
      performanceMultiplier = 0.85;
    }

    const actualWidth = Math.floor(width * pixelRatio * performanceMultiplier);
    const actualHeight = Math.floor(
      height * pixelRatio * performanceMultiplier,
    );

    return {
      width: actualWidth,
      height: actualHeight,
      aspectRatio: actualWidth / actualHeight,
      pixelRatio,
      displayWidth: width,
      displayHeight: height,
    };
  }, [responsive, containerRef, config]);

  // Update dimensions when responsive state changes
  useEffect(() => {
    const newDimensions = calculateDimensions();
    setDimensions(newDimensions);
  }, [calculateDimensions]);

  // Setup canvas with proper dimensions and pixel ratio
  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement): CanvasDimensions => {
      const dims = calculateDimensions();

      // Set display size (CSS)
      canvas.style.width = `${dims.displayWidth}px`;
      canvas.style.height = `${dims.displayHeight}px`;

      // Set actual size (canvas buffer)
      canvas.width = dims.width;
      canvas.height = dims.height;

      // Scale context for high DPI displays
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dims.pixelRatio, dims.pixelRatio);
      }

      return dims;
    },
    [calculateDimensions],
  );

  // WebGL canvas setup
  const setupWebGLCanvas = useCallback(
    (canvas: HTMLCanvasElement): CanvasDimensions => {
      const dims = calculateDimensions();

      // Set display size (CSS)
      canvas.style.width = `${dims.displayWidth}px`;
      canvas.style.height = `${dims.displayHeight}px`;

      // Set actual size (canvas buffer)
      canvas.width = dims.width;
      canvas.height = dims.height;

      // WebGL viewport setup is handled by the WebGL context
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        gl.viewport(0, 0, dims.width, dims.height);
      }

      return dims;
    },
    [calculateDimensions],
  );

  return {
    dimensions,
    setupCanvas,
    setupWebGLCanvas,
    calculateDimensions,
    responsive,
  };
};

// Hook for managing canvas resize events
export const useCanvasResize = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onResize?: (dimensions: CanvasDimensions) => void,
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { dimensions, setupCanvas, setupWebGLCanvas } =
    useResponsiveCanvas(containerRef);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const isWebGL = canvas.getContext("webgl2") || canvas.getContext("webgl");

      const newDimensions = isWebGL
        ? setupWebGLCanvas(canvas)
        : setupCanvas(canvas);

      onResize?.(newDimensions);
    }
  }, [dimensions, canvasRef, setupCanvas, setupWebGLCanvas, onResize]);

  return {
    containerRef,
    dimensions,
  };
};

// Utility for responsive text sizing
export const getResponsiveTextSize = (
  baseSize: number,
  responsive: ReturnType<typeof useResponsive>,
): number => {
  if (responsive.isMobile) {
    return Math.max(baseSize * 0.8, 12);
  } else if (responsive.isTablet) {
    return baseSize * 0.9;
  }
  return baseSize;
};

// Utility for responsive spacing
export const getResponsiveSpacing = (
  baseSpacing: number,
  responsive: ReturnType<typeof useResponsive>,
): number => {
  if (responsive.isMobile) {
    return baseSpacing * 0.75;
  } else if (responsive.isTablet) {
    return baseSpacing * 0.85;
  }
  return baseSpacing;
};
