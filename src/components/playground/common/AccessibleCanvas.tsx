/**
 * Accessible canvas component for WebGL and Canvas experiments
 * Task 2.2: アクセシビリティ対応 - Canvas・WebGL要素のaria属性設定
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useResponsiveCanvas } from "@/hooks/useResponsiveCanvas";
import type {
	DeviceCapabilities,
	PerformanceMetrics,
} from "@/types/playground";

interface AccessibleCanvasProps {
	title: string;
	description: string;
	canvasType: "2d" | "webgl" | "webgl2";
	deviceCapabilities: DeviceCapabilities;
	onPerformanceUpdate?: (metrics: PerformanceMetrics) => void;
	onCanvasReady?: (
		canvas: HTMLCanvasElement,
		context:
			| CanvasRenderingContext2D
			| WebGLRenderingContext
			| WebGL2RenderingContext
			| null,
	) => void;
	onError?: (error: Error) => void;
	className?: string;
	width?: number;
	height?: number;
	maintainAspectRatio?: boolean;
}

export const AccessibleCanvas: React.FC<AccessibleCanvasProps> = ({
	title,
	description,
	canvasType,
	deviceCapabilities,
	onPerformanceUpdate,
	onCanvasReady,
	onError,
	className = "",
	width,
	height,
	maintainAspectRatio = true,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const animationFrameRef = useRef<number | undefined>(undefined);
	const isAnimatingRef = useRef(false);
	const animationLoopRef = useRef<((currentTime: number) => void) | undefined>(
		undefined,
	);
	const performanceRef = useRef({
		lastTime: 0,
		frameCount: 0,
		fpsHistory: [] as number[],
	});

	const { state: accessibilityState, announce } = useAccessibility();
	const { dimensions, setupCanvas, setupWebGLCanvas } = useResponsiveCanvas(
		containerRef,
		{
			maxWidth: width,
			maxHeight: height,
			maintainAspectRatio,
		},
	);

	const [canvasState, setCanvasState] = useState<{
		isInitialized: boolean;
		hasError: boolean;
		errorMessage: string;
		isAnimating: boolean;
	}>({
		isInitialized: false,
		hasError: false,
		errorMessage: "",
		isAnimating: false,
	});

	// Initialize canvas and context
	const initializeCanvas = useCallback(async () => {
		if (!canvasRef.current) return;

		try {
			const canvas = canvasRef.current;
			let context:
				| CanvasRenderingContext2D
				| WebGLRenderingContext
				| WebGL2RenderingContext
				| null = null;

			// Set up canvas dimensions
			let initializationError: Error | null = null;

			if (canvasType === "2d") {
				setupCanvas(canvas);
				context = canvas.getContext("2d");
				if (!context) {
					initializationError = new Error("2D canvas context not supported");
				}
			} else {
				setupWebGLCanvas(canvas);

				if (canvasType === "webgl2") {
					context = canvas.getContext("webgl2");
					if (!context) {
						if (deviceCapabilities.webgl2Support) {
							initializationError = new Error(
								"WebGL2 not supported on this device",
							);
						}
					}
				}

				if (context === null) {
					if (initializationError === null) {
						context = canvas.getContext("webgl");
						if (!context) {
							initializationError = new Error(
								"WebGL not supported on this device",
							);
						}
					}
				}

				// WebGL-specific setup
				if (context !== null) {
					if (initializationError === null) {
						context.viewport(0, 0, canvas.width, canvas.height);
						context.clearColor(0.0, 0.0, 0.0, 1.0);
						context.clear(context.COLOR_BUFFER_BIT);
					}
				}
			}

			if (initializationError) {
				const errorMessage = initializationError.message;
				setCanvasState((prev) => ({
					...prev,
					hasError: true,
					errorMessage,
				}));
				if (onError) {
					onError(initializationError);
				}
				announce(`キャンバスエラー: ${errorMessage}`, "assertive");
				return;
			}

			setCanvasState((prev) => ({
				...prev,
				isInitialized: true,
				hasError: false,
				errorMessage: "",
			}));

			if (onCanvasReady) {
				onCanvasReady(canvas, context);
			}
			announce(`${title} キャンバスが初期化されました`, "polite");
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown canvas error";
			setCanvasState((prev) => ({
				...prev,
				hasError: true,
				errorMessage,
			}));
			if (onError) {
				onError(error instanceof Error ? error : new Error(errorMessage));
			}
			announce(`キャンバスエラー: ${errorMessage}`, "assertive");
		}
	}, [
		canvasType,
		deviceCapabilities,
		setupCanvas,
		setupWebGLCanvas,
		onCanvasReady,
		onError,
		title,
		announce,
	]);

	// Performance monitoring
	const updatePerformanceMetrics = useCallback(
		(currentTime: number) => {
			const perf = performanceRef.current;

			if (perf.lastTime === 0) {
				perf.lastTime = currentTime;
				return;
			}

			const deltaTime = currentTime - perf.lastTime;
			const fps = 1000 / deltaTime;

			perf.fpsHistory.push(fps);
			if (perf.fpsHistory.length > 60) {
				perf.fpsHistory.shift();
			}

			const avgFps =
				perf.fpsHistory.reduce((a, b) => a + b, 0) / perf.fpsHistory.length;

			const performanceMemory = (
				performance as Performance & {
					memory?: { usedJSHeapSize: number };
				}
			).memory;

			const metrics: PerformanceMetrics = {
				fps: Math.round(avgFps),
				frameTime: deltaTime,
				memoryUsage: performanceMemory?.usedJSHeapSize
					? Math.round(performanceMemory.usedJSHeapSize / 1024 / 1024)
					: 0,
			};

			onPerformanceUpdate?.(metrics);
			perf.lastTime = currentTime;
		},
		[onPerformanceUpdate],
	);

	// Animation loop for performance monitoring
	const animationLoop = useCallback(
		(currentTime: number) => {
			if (isAnimatingRef.current) {
				updatePerformanceMetrics(currentTime);
				animationFrameRef.current = requestAnimationFrame(
					animationLoopRef.current!,
				);
			}
		},
		[updatePerformanceMetrics],
	);

	// Update animation loop ref when it changes (outside of render)
	useEffect(() => {
		animationLoopRef.current = animationLoop;
	}, [animationLoop]);

	// Start/stop animation monitoring
	const startAnimation = useCallback(() => {
		isAnimatingRef.current = true;
		setCanvasState((prev) => ({ ...prev, isAnimating: true }));
		animationFrameRef.current = requestAnimationFrame(animationLoop);
	}, [animationLoop]);

	const stopAnimation = useCallback(() => {
		isAnimatingRef.current = false;
		setCanvasState((prev) => ({ ...prev, isAnimating: false }));
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
		}
	}, []);

	// Initialize canvas when component mounts
	useEffect(() => {
		initializeCanvas();
	}, [initializeCanvas]);

	// Cleanup animation frame on unmount
	useEffect(() => {
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	// Handle keyboard interactions
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!canvasRef.current || !canvasState.isInitialized) return;

			switch (e.key) {
				case " ": // Space bar
					e.preventDefault();
					if (canvasState.isAnimating) {
						stopAnimation();
						announce("アニメーションを一時停止しました", "polite");
					} else {
						startAnimation();
						announce("アニメーションを開始しました", "polite");
					}
					break;
				case "Enter":
					// Focus on canvas for screen readers
					canvasRef.current.focus();
					announce("キャンバスにフォーカスしました", "polite");
					break;
			}
		},
		[
			canvasState.isInitialized,
			canvasState.isAnimating,
			startAnimation,
			stopAnimation,
			announce,
		],
	);

	// Set up keyboard event listeners
	useEffect(() => {
		if (canvasState.isInitialized && accessibilityState.keyboardNavigation) {
			document.addEventListener("keydown", handleKeyDown);
			return () => document.removeEventListener("keydown", handleKeyDown);
		}
	}, [
		canvasState.isInitialized,
		accessibilityState.keyboardNavigation,
		handleKeyDown,
	]);

	// Get ARIA attributes for canvas
	const getCanvasAriaAttributes = () => {
		const baseAttributes = {
			role: canvasType === "2d" ? "img" : "application",
			"aria-label": `${title} - ${description}`,
			"aria-describedby": `canvas-description-${title.replace(/\s+/g, "-").toLowerCase()}`,
			tabIndex: 0,
		};

		if (canvasType !== "2d") {
			return {
				...baseAttributes,
				"aria-live": "polite" as const,
				"aria-atomic": false,
				"aria-busy": canvasState.isAnimating,
			};
		}

		return baseAttributes;
	};

	// Fallback content for non-canvas browsers or errors
	const renderFallbackContent = () => {
		if (canvasState.hasError) {
			return (
				<div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded">
					<p className="text-red-800 font-medium mb-2">キャンバスエラー</p>
					<p className="text-red-600 text-sm text-center">
						{canvasState.errorMessage}
					</p>
					<button
						type="button"
						onClick={initializeCanvas}
						className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
					>
						再試行
					</button>
				</div>
			);
		}

		return (
			<div className="flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-200 rounded">
				<p className="text-gray-800 font-medium mb-2">{title}</p>
				<p className="text-gray-600 text-sm text-center">{description}</p>
				<p className="text-gray-500 text-xs mt-2">
					このブラウザは{canvasType.toUpperCase()}をサポートしていません.
				</p>
			</div>
		);
	};

	return (
		<div ref={containerRef} className={`relative ${className}`}>
			{/* Canvas description for screen readers */}
			<div
				id={`canvas-description-${title.replace(/\s+/g, "-").toLowerCase()}`}
				className="sr-only"
			>
				{description}
				{canvasType !== "2d" && (
					<>
						{" "}
						スペースキーでアニメーションの開始・停止、Enterキーでフォーカスできます.
					</>
				)}
			</div>

			{/* Canvas element */}
			<canvas
				ref={canvasRef}
				{...getCanvasAriaAttributes()}
				className="block max-w-full h-auto border border-main"
				style={{
					width: dimensions.displayWidth,
					height: dimensions.displayHeight,
				}}
			>
				{renderFallbackContent()}
			</canvas>

			{/* Screen reader status updates */}
			{accessibilityState.isScreenReaderActive && (
				<div className="sr-only" aria-live="polite">
					{canvasState.isAnimating && "アニメーション実行中"}
					{!canvasState.isAnimating &&
						canvasState.isInitialized &&
						"アニメーション停止中"}
				</div>
			)}

			{/* Keyboard shortcuts help */}
			{accessibilityState.keyboardNavigation && canvasType !== "2d" && (
				<div className="mt-2 text-xs text-main opacity-70">
					<kbd className="px-1 py-0.5 bg-main text-base rounded text-xs">
						Space
					</kbd>{" "}
					アニメーション切り替え{" "}
					<kbd className="px-1 py-0.5 bg-main text-base rounded text-xs">
						Enter
					</kbd>{" "}
					フォーカス
				</div>
			)}

			{/* Reduced motion indicator */}
			{accessibilityState.prefersReducedMotion && canvasState.isAnimating && (
				<div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
					<p className="text-yellow-800">
						アニメーション設定により、動きが制限される場合があります.
					</p>
				</div>
			)}
		</div>
	);
};
