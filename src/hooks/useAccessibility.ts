/**
 * Accessibility utilities hook for playground components
 * Task 2.2: アクセシビリティ対応 - WCAG 2.1 AA準拠
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface AccessibilityState {
  isScreenReaderActive: boolean;
  prefersReducedMotion: boolean;
  highContrastMode: boolean;
  keyboardNavigation: boolean;
  focusVisible: boolean;
  textScaling: number;
  accessibilityIssues: string[];
}

export interface FocusManagement {
  currentFocusIndex: number;
  focusableElements: HTMLElement[];
  trapFocus: boolean;
}

export interface AriaAnnouncement {
  message: string;
  priority: "polite" | "assertive";
  timestamp: number;
}

// Screen reader detection
const detectScreenReader = (): boolean => {
  if (typeof window === "undefined") return false;

  // Check for common screen reader indicators
  const hasScreenReaderClass =
    document.documentElement.classList.contains("sr-only");
  const hasAriaLive = document.querySelector("[aria-live]") !== null;
  const hasScreenReaderText = document.querySelector(".sr-only") !== null;

  return hasScreenReaderClass || hasAriaLive || hasScreenReaderText;
};

// Media query checks
const getAccessibilityPreferences = (): Omit<
  AccessibilityState,
  "keyboardNavigation" | "focusVisible"
> => {
  if (typeof window === "undefined") {
    return {
      isScreenReaderActive: false,
      prefersReducedMotion: false,
      highContrastMode: false,
      textScaling: 1.0,
      accessibilityIssues: [],
    };
  }

  return {
    isScreenReaderActive: detectScreenReader(),
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    highContrastMode: window.matchMedia("(prefers-contrast: high)").matches,
    textScaling: 1.0, // Default text scaling
    accessibilityIssues: [],
  };
};

export const useAccessibility = () => {
  const [state, setState] = useState<AccessibilityState>(() => ({
    ...getAccessibilityPreferences(),
    keyboardNavigation: false,
    focusVisible: false,
    accessibilityIssues: [],
  }));

  const [announcements, setAnnouncements] = useState<AriaAnnouncement[]>([]);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Update accessibility state when media queries change
  useEffect(() => {
    const mediaQueries = [
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(prefers-contrast: high)"),
    ];

    const updateState = () => {
      setState((prev) => ({
        ...prev,
        ...getAccessibilityPreferences(),
      }));
    };

    mediaQueries.forEach((mq) => {
      mq.addEventListener("change", updateState);
    });

    return () => {
      mediaQueries.forEach((mq) => {
        mq.removeEventListener("change", updateState);
      });
    };
  }, []);

  // Keyboard navigation detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setState((prev) => ({
          ...prev,
          keyboardNavigation: true,
          focusVisible: true,
        }));
      }
    };

    const handleMouseDown = () => {
      setState((prev) => ({
        ...prev,
        focusVisible: false,
      }));
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  // Announce messages to screen readers
  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      const announcement: AriaAnnouncement = {
        message,
        priority,
        timestamp: Date.now(),
      };

      setAnnouncements((prev) => [...prev, announcement]);

      // Clean up old announcements
      setTimeout(() => {
        setAnnouncements((prev) =>
          prev.filter((a) => a.timestamp !== announcement.timestamp),
        );
      }, 5000);
    },
    [],
  );

  // Ensure minimum touch target size
  const ensureMinimumTouchTarget = useCallback((element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const minSize = 44; // 44px minimum touch target size

    if (rect.width < minSize || rect.height < minSize) {
      element.style.minWidth = `${minSize}px`;
      element.style.minHeight = `${minSize}px`;
    }
  }, []);

  // Container ref for tools
  const containerRef = useRef<HTMLDivElement>(null);

  // Run accessibility checks
  const runAccessibilityChecks = useCallback(() => {
    if (!containerRef.current) return [];

    const issues: string[] = [];
    const elements = containerRef.current.querySelectorAll("*");

    elements.forEach((element) => {
      // Check for missing alt text on images
      if (element.tagName === "IMG" && !element.getAttribute("alt")) {
        issues.push("Image missing alt text");
      }

      // Check for missing labels on form elements
      if (
        ["INPUT", "SELECT", "TEXTAREA"].includes(element.tagName) &&
        !element.getAttribute("aria-label") &&
        !element.getAttribute("aria-labelledby")
      ) {
        issues.push("Form element missing label");
      }
    });

    return issues;
  }, []);

  return {
    state,
    announce,
    announcements,
    announcementRef,
    ensureMinimumTouchTarget,
    containerRef,
    runAccessibilityChecks,
  };
};

// Focus management hook
export const useFocusManagement = (
  containerRef: React.RefObject<HTMLElement | null>,
) => {
  const [focusState, setFocusState] = useState<FocusManagement>({
    currentFocusIndex: -1,
    focusableElements: [],
    trapFocus: false,
  });

  // Get all focusable elements within container
  const updateFocusableElements = useCallback(() => {
    if (!containerRef.current) return;

    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(", ");

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelectors),
    ) as HTMLElement[];

    setFocusState((prev) => ({
      ...prev,
      focusableElements: elements,
    }));
  }, [containerRef]);

  // Focus management functions
  const focusFirst = useCallback(() => {
    if (focusState.focusableElements.length > 0) {
      focusState.focusableElements[0].focus();
      setFocusState((prev) => ({ ...prev, currentFocusIndex: 0 }));
    }
  }, [focusState.focusableElements]);

  const focusLast = useCallback(() => {
    const lastIndex = focusState.focusableElements.length - 1;
    if (lastIndex >= 0) {
      focusState.focusableElements[lastIndex].focus();
      setFocusState((prev) => ({ ...prev, currentFocusIndex: lastIndex }));
    }
  }, [focusState.focusableElements]);

  const focusNext = useCallback(() => {
    const nextIndex =
      (focusState.currentFocusIndex + 1) % focusState.focusableElements.length;
    if (focusState.focusableElements[nextIndex]) {
      focusState.focusableElements[nextIndex].focus();
      setFocusState((prev) => ({ ...prev, currentFocusIndex: nextIndex }));
    }
  }, [focusState.currentFocusIndex, focusState.focusableElements]);

  const focusPrevious = useCallback(() => {
    const prevIndex =
      focusState.currentFocusIndex === 0
        ? focusState.focusableElements.length - 1
        : focusState.currentFocusIndex - 1;
    if (focusState.focusableElements[prevIndex]) {
      focusState.focusableElements[prevIndex].focus();
      setFocusState((prev) => ({ ...prev, currentFocusIndex: prevIndex }));
    }
  }, [focusState.currentFocusIndex, focusState.focusableElements]);

  // Keyboard event handler for focus management
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!focusState.trapFocus) return;

      switch (e.key) {
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            focusPrevious();
          } else {
            focusNext();
          }
          break;
        case "Home":
          e.preventDefault();
          focusFirst();
          break;
        case "End":
          e.preventDefault();
          focusLast();
          break;
        case "Escape":
          setFocusState((prev) => ({ ...prev, trapFocus: false }));
          break;
      }
    },
    [focusState.trapFocus, focusNext, focusPrevious, focusFirst, focusLast],
  );

  // Set up keyboard event listeners
  useEffect(() => {
    if (focusState.trapFocus) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [focusState.trapFocus, handleKeyDown]);

  // Update focusable elements when container changes
  useEffect(() => {
    updateFocusableElements();
  }, [updateFocusableElements]);

  const enableFocusTrap = useCallback(() => {
    updateFocusableElements();
    setFocusState((prev) => ({ ...prev, trapFocus: true }));
    focusFirst();
  }, [updateFocusableElements, focusFirst]);

  const disableFocusTrap = useCallback(() => {
    setFocusState((prev) => ({ ...prev, trapFocus: false }));
  }, []);

  return {
    focusState,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    enableFocusTrap,
    disableFocusTrap,
    updateFocusableElements,
  };
};

// Skip link functionality
export const useSkipLinks = () => {
  const skipToContent = useCallback((targetId: string) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return { skipToContent };
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd want a more robust color parsing library
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getLuminance = (_unusedColor: string): number => {
    // This is a simplified implementation
    // You'd want to properly parse hex/rgb/hsl colors
    return 0.5; // Placeholder
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

export const meetsContrastRequirement = (
  color1: string,
  color2: string,
  level: "AA" | "AAA" = "AA",
): boolean => {
  const ratio = getContrastRatio(color1, color2);
  return level === "AA" ? ratio >= 4.5 : ratio >= 7;
};

// Alias for tools compatibility
export const useToolAccessibility = useAccessibility;
