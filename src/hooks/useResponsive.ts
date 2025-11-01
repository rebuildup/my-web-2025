/**
 * Responsive utilities hook for playground components
 * Task 2.1: プレイグラウンドのレスポンシブ対応
 */

import { useEffect, useState } from "react";

export interface ResponsiveBreakpoints {
	xs: boolean; // < 640px
	sm: boolean; // >= 640px
	md: boolean; // >= 768px
	lg: boolean; // >= 1024px
	xl: boolean; // >= 1280px
	"2xl": boolean; // >= 1536px
}

export interface ViewportDimensions {
	width: number;
	height: number;
	aspectRatio: number;
}

export interface TouchCapabilities {
	isTouchDevice: boolean;
	maxTouchPoints: number;
	supportsHover: boolean;
	supportsPointer: boolean;
}

export interface ResponsiveState {
	breakpoints: ResponsiveBreakpoints;
	viewport: ViewportDimensions;
	touch: TouchCapabilities;
	orientation: "portrait" | "landscape";
	isSmallScreen: boolean;
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
}

const getBreakpoints = (width: number): ResponsiveBreakpoints => ({
	xs: width < 640,
	sm: width >= 640,
	md: width >= 768,
	lg: width >= 1024,
	xl: width >= 1280,
	"2xl": width >= 1536,
});

const getTouchCapabilities = (): TouchCapabilities => {
	if (typeof window === "undefined") {
		return {
			isTouchDevice: false,
			maxTouchPoints: 0,
			supportsHover: true,
			supportsPointer: true,
		};
	}

	// Safe matchMedia access
	const safeMatchMedia = (query: string): boolean => {
		try {
			return typeof window !== "undefined" &&
				window.matchMedia &&
				typeof window.matchMedia === "function"
				? window.matchMedia(query).matches
				: true; // Default to true for hover/pointer capabilities
		} catch {
			return true;
		}
	};

	return {
		isTouchDevice:
			typeof window !== "undefined" &&
			("ontouchstart" in window ||
				(typeof navigator !== "undefined" && navigator.maxTouchPoints > 0)),
		maxTouchPoints:
			typeof navigator !== "undefined" ? navigator.maxTouchPoints || 0 : 0,
		supportsHover: safeMatchMedia("(hover: hover)"),
		supportsPointer: safeMatchMedia("(pointer: fine)"),
	};
};

const getViewportDimensions = (): ViewportDimensions => {
	if (typeof window === "undefined") {
		return { width: 1024, height: 768, aspectRatio: 1024 / 768 };
	}

	const width = window.innerWidth;
	const height = window.innerHeight;

	return {
		width,
		height,
		aspectRatio: width / height,
	};
};

export const useResponsive = (): ResponsiveState => {
	const [state, setState] = useState<ResponsiveState>(() => {
		const viewport = getViewportDimensions();
		const breakpoints = getBreakpoints(viewport.width);
		const touch = getTouchCapabilities();

		return {
			breakpoints,
			viewport,
			touch,
			orientation: viewport.width > viewport.height ? "landscape" : "portrait",
			isSmallScreen: breakpoints.xs,
			isMobile: breakpoints.xs || (breakpoints.sm && touch.isTouchDevice),
			isTablet: breakpoints.md && touch.isTouchDevice && !breakpoints.xs,
			isDesktop: breakpoints.lg && !touch.isTouchDevice,
		};
	});

	useEffect(() => {
		// Skip event listeners in test environment to prevent infinite loops
		if (typeof window === "undefined" || process.env.NODE_ENV === "test") {
			return;
		}

		let timeoutId: NodeJS.Timeout;

		const updateState = () => {
			// Debounce updates to prevent excessive re-renders
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				const viewport = getViewportDimensions();
				const breakpoints = getBreakpoints(viewport.width);
				const touch = getTouchCapabilities();

				setState((prevState) => {
					// Only update if values actually changed
					const newState = {
						breakpoints,
						viewport,
						touch,
						orientation: (viewport.width > viewport.height
							? "landscape"
							: "portrait") as "portrait" | "landscape",
						isSmallScreen: breakpoints.xs,
						isMobile: breakpoints.xs || (breakpoints.sm && touch.isTouchDevice),
						isTablet: breakpoints.md && touch.isTouchDevice && !breakpoints.xs,
						isDesktop: breakpoints.lg && !touch.isTouchDevice,
					};

					// Shallow comparison to prevent unnecessary updates
					if (
						prevState.viewport.width === newState.viewport.width &&
						prevState.viewport.height === newState.viewport.height &&
						prevState.touch.isTouchDevice === newState.touch.isTouchDevice
					) {
						return prevState;
					}

					return newState;
				});
			}, 16); // ~60fps debounce
		};

		// Listen for resize events
		window.addEventListener("resize", updateState, { passive: true });
		window.addEventListener("orientationchange", updateState, {
			passive: true,
		});

		// Listen for media query changes with error handling
		const mediaQueries: MediaQueryList[] = [];
		try {
			const hoverQuery = window.matchMedia("(hover: hover)");
			const pointerQuery = window.matchMedia("(pointer: fine)");

			mediaQueries.push(hoverQuery, pointerQuery);

			mediaQueries.forEach((mq) => {
				if (mq && typeof mq.addEventListener === "function") {
					mq.addEventListener("change", updateState);
				}
			});
		} catch (error) {
			// Ignore media query errors in test environments
			console.warn("Media query setup failed:", error);
		}

		return () => {
			clearTimeout(timeoutId);

			if (typeof window !== "undefined") {
				window.removeEventListener("resize", updateState);
				window.removeEventListener("orientationchange", updateState);
			}

			mediaQueries.forEach((mq) => {
				try {
					if (mq && typeof mq.removeEventListener === "function") {
						mq.removeEventListener("change", updateState);
					}
				} catch {
					// Ignore cleanup errors
				}
			});
		};
	}, []);

	return state;
};

// Canvas size calculation utilities
export const getOptimalCanvasSize = (
	viewport: ViewportDimensions,
	containerElement?: HTMLElement,
): { width: number; height: number } => {
	if (containerElement) {
		const rect = containerElement.getBoundingClientRect();
		return {
			width: Math.floor(rect.width),
			height: Math.floor(rect.height),
		};
	}

	// Fallback to viewport-based calculation
	const maxWidth = Math.min(viewport.width * 0.9, 1200);
	const maxHeight = Math.min(viewport.height * 0.7, 800);

	// Maintain aspect ratio
	const aspectRatio = 16 / 9;
	let width = maxWidth;
	let height = width / aspectRatio;

	if (height > maxHeight) {
		height = maxHeight;
		width = height * aspectRatio;
	}

	return {
		width: Math.floor(width),
		height: Math.floor(height),
	};
};

// Touch gesture utilities
export const useTouchGestures = () => {
	const [gestureState, setGestureState] = useState({
		isSwipeEnabled: false,
		swipeDirection: null as "left" | "right" | "up" | "down" | null,
		swipeDistance: 0,
	});

	const handleTouchStart = (e: React.TouchEvent) => {
		if (e.touches.length === 1) {
			setGestureState((prev) => ({
				...prev,
				isSwipeEnabled: true,
				swipeDirection: null,
				swipeDistance: 0,
			}));
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		if (!gestureState.isSwipeEnabled || e.touches.length !== 1) return;

		// Calculate swipe direction and distance
		// This is a simplified implementation - you might want to store start position
		// and calculate relative movement
		console.log("Touch move detected", e.touches[0]);
	};

	const handleTouchEnd = () => {
		setGestureState((prev) => ({
			...prev,
			isSwipeEnabled: false,
		}));
	};

	return {
		gestureState,
		touchHandlers: {
			onTouchStart: handleTouchStart,
			onTouchMove: handleTouchMove,
			onTouchEnd: handleTouchEnd,
		},
	};
};
