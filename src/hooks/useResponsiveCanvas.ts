/**
 * Responsive canvas utilities for playground experiments
 * Task 2.1: プレイグラウンドのレスポンシブ対応 - 画面サイズに応じたキャンバスサイズ調整
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
	containerRef?: React.RefObject<HTMLElement | null>,
	config: CanvasConfig = {},
) => {
	const responsive = useResponsive();

	// Create a default ref if none provided
	const defaultRef = useRef<HTMLElement | null>(null);
	const activeRef = containerRef || defaultRef;

	// Container size is held in state only because the ResizeObserver
	// callback needs to trigger a re-render when the box changes. It is
	// derived, not a source of truth — `dimensions` is recomputed inline
	// from this plus the latest responsive snapshot.
	const [containerSize, setContainerSize] = useState<{
		width: number;
		height: number;
	} | null>(null);

	const calculateDimensions = useCallback(
		(containerSize?: { width: number; height: number }): CanvasDimensions => {
			const finalConfig = { ...DEFAULT_CONFIG, ...config };
			let containerWidth = containerSize?.width ?? responsive.viewport.width;
			let containerHeight = containerSize?.height ?? responsive.viewport.height;

			// Apply responsive adjustments
			if (responsive.isMobile) {
				containerWidth = Math.min(containerWidth * 0.95, finalConfig.maxWidth);
				containerHeight = Math.min(
					containerHeight * 0.6,
					finalConfig.maxHeight,
				);
			} else if (responsive.isTablet) {
				containerWidth = Math.min(containerWidth * 0.9, finalConfig.maxWidth);
				containerHeight = Math.min(
					containerHeight * 0.7,
					finalConfig.maxHeight,
				);
			} else {
				containerWidth = Math.min(containerWidth * 0.8, finalConfig.maxWidth);
				containerHeight = Math.min(
					containerHeight * 0.8,
					finalConfig.maxHeight,
				);
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

			// Calculate pixel ratio with fallback
			const basePixelRatio =
				typeof window !== "undefined" && responsive.viewport.width > 0
					? window.devicePixelRatio || 1
					: 1;
			const pixelRatio = basePixelRatio * finalConfig.pixelRatioMultiplier;

			// Adjust for device performance
			let performanceMultiplier = 1;
			if (responsive.isMobile) {
				performanceMultiplier = 0.75; // Reduce resolution on mobile for performance
			} else if (responsive.isTablet) {
				performanceMultiplier = 0.85;
			}

			const actualWidth = Math.floor(
				width * pixelRatio * performanceMultiplier,
			);
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
		},
		[
			responsive.viewport.width,
			responsive.viewport.height,
			responsive.isMobile,
			responsive.isTablet,
			config,
		],
	);

	// Derive `dimensions` inline from the latest `containerSize` and the
	// latest `calculateDimensions` closure. Recomputed whenever either
	// changes (viewport resize re-creates `calculateDimensions`, observer
	// updates `containerSize`). Replaces the previous "update dimensions"
	// effect (P4 value-reaction) with a pure derivation.
	const dimensions = useMemo<CanvasDimensions>(
		() => calculateDimensions(containerSize ?? undefined),
		[calculateDimensions, containerSize],
	);

	// Single source of `containerSize` updates: the ResizeObserver
	// subscription below. Cleanup disconnects the observer. When the API
	// or the ref is unavailable, there is nothing to clean up — the
	// dimensions fall back to viewport-based sizing.
	useEffect(() => {
		const el = activeRef?.current;
		if (!el || typeof ResizeObserver === "undefined") {
			return;
		}

		const resizeObserver = new ResizeObserver(() => {
			// Extract conditional logic outside try/catch to satisfy React Compiler
			let rect: DOMRect | null = null;
			try {
				rect = el.getBoundingClientRect();
			} catch (error) {
				// Fallback to null if getBoundingClientRect fails
				console.warn("Failed to get container dimensions:", error);
				setContainerSize(null);
				return;
			}

			// Conditional logic outside try/catch block
			const hasValidDimensions = rect.width > 0 && rect.height > 0;
			if (hasValidDimensions) {
				setContainerSize({ width: rect.width, height: rect.height });
			} else {
				setContainerSize(null);
			}
		});

		resizeObserver.observe(el);

		return () => {
			resizeObserver.disconnect();
		};
	}, [activeRef]);

	// Setup canvas with proper dimensions and pixel ratio
	const setupCanvas = useCallback(
		(canvas: HTMLCanvasElement): CanvasDimensions => {
			// Use containerSize from state to avoid React Compiler issues with ref.current access
			const dims = calculateDimensions(containerSize ?? undefined);

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
		[calculateDimensions, containerSize],
	);

	// WebGL canvas setup
	const setupWebGLCanvas = useCallback(
		(canvas: HTMLCanvasElement): CanvasDimensions => {
			// Use containerSize from state to avoid React Compiler issues with ref.current access
			const dims = calculateDimensions(containerSize ?? undefined);

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
		[calculateDimensions, containerSize],
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
const _useCanvasResize = (
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
	}, [canvasRef, setupCanvas, setupWebGLCanvas, onResize]);

	return {
		containerRef,
		dimensions,
	};
};

// Utility for responsive text sizing
const _getResponsiveTextSize = (
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
const _getResponsiveSpacing = (
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
