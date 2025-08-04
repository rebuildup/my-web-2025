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

  return {
    isTouchDevice: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    supportsHover: window.matchMedia("(hover: hover)").matches,
    supportsPointer: window.matchMedia("(pointer: fine)").matches,
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
    const updateState = () => {
      const viewport = getViewportDimensions();
      const breakpoints = getBreakpoints(viewport.width);
      const touch = getTouchCapabilities();

      setState({
        breakpoints,
        viewport,
        touch,
        orientation:
          viewport.width > viewport.height ? "landscape" : "portrait",
        isSmallScreen: breakpoints.xs,
        isMobile: breakpoints.xs || (breakpoints.sm && touch.isTouchDevice),
        isTablet: breakpoints.md && touch.isTouchDevice && !breakpoints.xs,
        isDesktop: breakpoints.lg && !touch.isTouchDevice,
      });
    };

    // Listen for resize events
    window.addEventListener("resize", updateState);
    window.addEventListener("orientationchange", updateState);

    // Listen for media query changes
    const mediaQueries = [
      window.matchMedia("(hover: hover)"),
      window.matchMedia("(pointer: fine)"),
    ];

    mediaQueries.forEach((mq) => {
      mq.addEventListener("change", updateState);
    });

    return () => {
      window.removeEventListener("resize", updateState);
      window.removeEventListener("orientationchange", updateState);
      mediaQueries.forEach((mq) => {
        mq.removeEventListener("change", updateState);
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

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      setGestureState((prev) => ({
        ...prev,
        isSwipeEnabled: true,
        swipeDirection: null,
        swipeDistance: 0,
      }));
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
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
