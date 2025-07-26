/**
 * Custom hook for comprehensive accessibility features in tools
 */

import { useEffect, useRef, useState, useCallback } from "react";
import {
  FocusManager,
  ScreenReaderUtils,
  KeyboardNavigation,
  TextScaling,
  MotionPreferences,
  AccessibilityTester,
} from "@/lib/accessibility";

interface UseAccessibilityOptions {
  announceChanges?: boolean;
  trapFocus?: boolean;
  enableKeyboardNavigation?: boolean;
  respectMotionPreferences?: boolean;
  runAccessibilityChecks?: boolean;
}

interface AccessibilityState {
  prefersReducedMotion: boolean;
  textScaling: number;
  isHighContrast: boolean;
  isKeyboardUser: boolean;
  accessibilityIssues: string[];
}

export function useAccessibility(options: UseAccessibilityOptions = {}) {
  const {
    announceChanges = true,
    trapFocus = false,
    enableKeyboardNavigation = true,
    respectMotionPreferences = true,
    runAccessibilityChecks: shouldRunAccessibilityChecks = false,
  } = options;

  const containerRef = useRef<HTMLElement>(null);
  const [state, setState] = useState<AccessibilityState>({
    prefersReducedMotion: false,
    textScaling: 1,
    isHighContrast: false,
    isKeyboardUser: false,
    accessibilityIssues: [],
  });

  // Announce messages to screen readers
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (announceChanges) {
        ScreenReaderUtils.announce(message, priority);
      }
    },
    [announceChanges],
  );

  // Focus management
  const saveFocus = useCallback((newFocus?: HTMLElement) => {
    FocusManager.saveFocus(newFocus);
  }, []);

  const restoreFocus = useCallback(() => {
    FocusManager.restoreFocus();
  }, []);

  // Keyboard navigation helpers
  const handleGridNavigation = useCallback(
    (
      event: KeyboardEvent,
      currentIndex: number,
      totalItems: number,
      columns: number,
      onNavigate: (newIndex: number) => void,
    ) => {
      if (enableKeyboardNavigation) {
        KeyboardNavigation.handleGridNavigation(
          event,
          currentIndex,
          totalItems,
          columns,
          onNavigate,
        );
      }
    },
    [enableKeyboardNavigation],
  );

  const handleListNavigation = useCallback(
    (
      event: KeyboardEvent,
      currentIndex: number,
      totalItems: number,
      onNavigate: (newIndex: number) => void,
    ) => {
      if (enableKeyboardNavigation) {
        KeyboardNavigation.handleListNavigation(
          event,
          currentIndex,
          totalItems,
          onNavigate,
        );
      }
    },
    [enableKeyboardNavigation],
  );

  // Ensure minimum touch target size
  const ensureMinimumTouchTarget = useCallback((element: HTMLElement) => {
    TextScaling.ensureMinimumTouchTarget(element);
  }, []);

  // Run accessibility checks
  const runAccessibilityChecks = useCallback(() => {
    if (containerRef.current && shouldRunAccessibilityChecks) {
      const issues = AccessibilityTester.runBasicChecks(containerRef.current);
      setState((prev) => ({ ...prev, accessibilityIssues: issues }));
      return issues;
    }
    return [];
  }, [shouldRunAccessibilityChecks]);

  // Initialize accessibility state
  useEffect(() => {
    const updateState = () => {
      setState((prev) => ({
        ...prev,
        prefersReducedMotion: MotionPreferences.prefersReducedMotion(),
        textScaling: TextScaling.getCurrentScaling(),
        isHighContrast: window.matchMedia("(prefers-contrast: high)").matches,
      }));
    };

    updateState();

    // Listen for media query changes
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");

    const handleReducedMotionChange = () => updateState();
    const handleHighContrastChange = () => updateState();

    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    highContrastQuery.addEventListener("change", handleHighContrastChange);

    return () => {
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
      highContrastQuery.removeEventListener("change", handleHighContrastChange);
    };
  }, []);

  // Detect keyboard usage
  useEffect(() => {
    let keyboardUsed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        keyboardUsed = true;
        setState((prev) => ({ ...prev, isKeyboardUser: true }));
      }
    };

    const handleMouseDown = () => {
      if (keyboardUsed) {
        setState((prev) => ({ ...prev, isKeyboardUser: false }));
        keyboardUsed = false;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // Focus trap setup
  useEffect(() => {
    if (trapFocus && containerRef.current) {
      const cleanup = FocusManager.trapFocus(containerRef.current);
      return cleanup;
    }
  }, [trapFocus]);

  // Apply motion preferences
  useEffect(() => {
    if (
      respectMotionPreferences &&
      containerRef.current &&
      state.prefersReducedMotion
    ) {
      MotionPreferences.applyMotionPreferences(containerRef.current);
    }
  }, [respectMotionPreferences, state.prefersReducedMotion]);

  // Run accessibility checks on mount and when content changes
  useEffect(() => {
    if (shouldRunAccessibilityChecks) {
      const timer = setTimeout(() => {
        runAccessibilityChecks();
      }, 1000); // Delay to allow content to render

      return () => clearTimeout(timer);
    }
  }, [shouldRunAccessibilityChecks, runAccessibilityChecks]);

  return {
    containerRef,
    state,
    announce,
    saveFocus,
    restoreFocus,
    handleGridNavigation,
    handleListNavigation,
    ensureMinimumTouchTarget,
    runAccessibilityChecks,
  };
}

// Specialized hook for tool components
export function useToolAccessibility() {
  return useAccessibility({
    announceChanges: true,
    trapFocus: false,
    enableKeyboardNavigation: true,
    respectMotionPreferences: true,
    runAccessibilityChecks: true,
  });
}

export default useAccessibility;
