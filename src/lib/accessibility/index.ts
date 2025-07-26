/**
 * Accessibility utilities for tools
 * Provides comprehensive WCAG 2.1 AA compliance helpers
 */

// Color contrast calculation utilities
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 guidelines
 */
export function getRelativeLuminance(rgb: RGBColor): number {
  const { r, g, b } = rgb;

  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio from 1:1 to 21:1
 */
export function getContrastRatio(color1: RGBColor, color2: RGBColor): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if color combination meets WCAG AA standards
 */
export function meetsWCAGAA(
  color1: RGBColor,
  color2: RGBColor,
  isLargeText = false,
): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if color combination meets WCAG AAA standards
 */
export function meetsWCAGAAA(
  color1: RGBColor,
  color2: RGBColor,
  isLargeText = false,
): boolean {
  const ratio = getContrastRatio(color1, color2);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGBColor | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Focus management utilities
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  /**
   * Trap focus within a container
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);

    // Return cleanup function
    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }

  /**
   * Save current focus and set new focus
   */
  static saveFocus(newFocus?: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }

    if (newFocus) {
      newFocus.focus();
    }
  }

  /**
   * Restore previously saved focus
   */
  static restoreFocus(): void {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }
}

// Screen reader utilities
export class ScreenReaderUtils {
  /**
   * Announce message to screen readers
   */
  static announce(
    message: string,
    priority: "polite" | "assertive" = "polite",
  ): void {
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.textContent = message;

    document.body.appendChild(announcer);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  /**
   * Create accessible description for complex UI elements
   */
  static createDescription(element: HTMLElement, description: string): string {
    const descId = `desc-${Math.random().toString(36).substring(2, 11)}`;

    const descElement = document.createElement("div");
    descElement.id = descId;
    descElement.className = "sr-only";
    descElement.textContent = description;

    element.parentNode?.insertBefore(descElement, element.nextSibling);
    element.setAttribute("aria-describedby", descId);

    return descId;
  }
}

// Keyboard navigation utilities
export class KeyboardNavigation {
  /**
   * Handle arrow key navigation for grid layouts
   */
  static handleGridNavigation(
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    columns: number,
    onNavigate: (newIndex: number) => void,
  ): void {
    const rows = Math.ceil(totalItems / columns);
    const currentRow = Math.floor(currentIndex / columns);

    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
        newIndex =
          currentIndex < totalItems - 1 ? currentIndex + 1 : currentIndex;
        break;
      case "ArrowLeft":
        newIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
        break;
      case "ArrowDown":
        if (currentRow < rows - 1) {
          newIndex = Math.min(currentIndex + columns, totalItems - 1);
        }
        break;
      case "ArrowUp":
        if (currentRow > 0) {
          newIndex = currentIndex - columns;
        }
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = totalItems - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onNavigate(newIndex);
    }
  }

  /**
   * Handle list navigation with arrow keys
   */
  static handleListNavigation(
    event: KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onNavigate: (newIndex: number) => void,
  ): void {
    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowDown":
        newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        break;
      case "ArrowUp":
        newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        break;
      case "Home":
        newIndex = 0;
        break;
      case "End":
        newIndex = totalItems - 1;
        break;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      onNavigate(newIndex);
    }
  }
}

// Text scaling utilities
export class TextScaling {
  /**
   * Check if text scaling is supported
   */
  static isTextScalingSupported(): boolean {
    return CSS.supports("font-size", "200%");
  }

  /**
   * Get current text scaling level
   */
  static getCurrentScaling(): number {
    const testElement = document.createElement("div");
    testElement.style.fontSize = "16px";
    testElement.style.position = "absolute";
    testElement.style.visibility = "hidden";
    document.body.appendChild(testElement);

    const computedSize = window.getComputedStyle(testElement).fontSize;
    document.body.removeChild(testElement);

    return parseFloat(computedSize) / 16;
  }

  /**
   * Ensure minimum touch target size (44x44px)
   */
  static ensureMinimumTouchTarget(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const minSize = 44;

    if (rect.width < minSize || rect.height < minSize) {
      element.style.minWidth = `${minSize}px`;
      element.style.minHeight = `${minSize}px`;
      element.style.display = "inline-flex";
      element.style.alignItems = "center";
      element.style.justifyContent = "center";
    }
  }
}

// Motion preferences
export class MotionPreferences {
  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Apply motion preferences to animations
   */
  static applyMotionPreferences(element: HTMLElement): void {
    if (this.prefersReducedMotion()) {
      element.style.animation = "none";
      element.style.transition = "none";
    }
  }
}

// Accessibility testing utilities
export class AccessibilityTester {
  /**
   * Run basic accessibility checks on an element
   */
  static runBasicChecks(element: HTMLElement): string[] {
    const issues: string[] = [];

    // Check for missing alt text on images
    const images = element.querySelectorAll("img");
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute("aria-label")) {
        issues.push(`Image ${index + 1} missing alt text`);
      }
    });

    // Check for missing labels on form elements
    const formElements = element.querySelectorAll("input, select, textarea");
    formElements.forEach((input, index) => {
      const hasLabel =
        input.getAttribute("aria-label") ||
        input.getAttribute("aria-labelledby") ||
        element.querySelector(`label[for="${input.id}"]`);

      if (!hasLabel) {
        issues.push(`Form element ${index + 1} missing label`);
      }
    });

    // Check for proper heading hierarchy
    const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > previousLevel + 1) {
        issues.push(
          `Heading ${index + 1} skips levels (h${previousLevel} to h${level})`,
        );
      }
      previousLevel = level;
    });

    // Check for sufficient color contrast
    const textElements = element.querySelectorAll("*");
    textElements.forEach((el, index) => {
      const styles = window.getComputedStyle(el);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;

      if (
        color &&
        backgroundColor &&
        color !== "rgba(0, 0, 0, 0)" &&
        backgroundColor !== "rgba(0, 0, 0, 0)"
      ) {
        // Basic contrast check (simplified)
        const colorRgb = this.parseColor(color);
        const bgRgb = this.parseColor(backgroundColor);

        if (colorRgb && bgRgb) {
          const ratio = getContrastRatio(colorRgb, bgRgb);
          if (ratio < 4.5) {
            issues.push(
              `Element ${index + 1} has insufficient color contrast (${ratio.toFixed(2)}:1)`,
            );
          }
        }
      }
    });

    return issues;
  }

  private static parseColor(color: string): RGBColor | null {
    // Simple RGB color parser
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
      };
    }
    return null;
  }
}

// Classes are already exported above
