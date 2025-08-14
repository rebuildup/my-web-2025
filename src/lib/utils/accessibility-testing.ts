/**
 * Accessibility testing utilities for runtime accessibility checks
 * Helps ensure WCAG 2.1 AA compliance across the application
 */

export interface AccessibilityIssue {
  type: "error" | "warning" | "info";
  rule: string;
  message: string;
  element?: Element;
  severity: "critical" | "serious" | "moderate" | "minor";
}

export interface AccessibilityReport {
  issues: AccessibilityIssue[];
  passedChecks: string[];
  summary: {
    errors: number;
    warnings: number;
    info: number;
    total: number;
  };
}

/**
 * Check color contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert color to RGB
    const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };

    // Convert to relative luminance
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r =
      rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g =
      gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b =
      bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Get computed color from element
 */
function getComputedColor(element: Element, property: string): string {
  const computed = window.getComputedStyle(element);
  const color = computed.getPropertyValue(property);

  // Convert rgb() to hex
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  return color;
}

/**
 * Check if element meets minimum touch target size
 */
function checkTouchTargetSize(element: Element): boolean {
  const rect = element.getBoundingClientRect();
  const minSize = 44; // 44px minimum according to WCAG
  return rect.width >= minSize && rect.height >= minSize;
}

/**
 * Check if element has proper focus indicator
 */
function checkFocusIndicator(element: Element): boolean {
  const computed = window.getComputedStyle(element, ":focus-visible");
  const outline = computed.getPropertyValue("outline");
  const boxShadow = computed.getPropertyValue("box-shadow");

  return outline !== "none" || boxShadow !== "none";
}

/**
 * Check heading hierarchy
 */
function checkHeadingHierarchy(container: Element): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const headings = container.querySelectorAll("h1, h2, h3, h4, h5, h6");

  let previousLevel = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));

    if (index === 0 && level !== 1) {
      issues.push({
        type: "warning",
        rule: "heading-hierarchy",
        message: "Page should start with h1",
        element: heading,
        severity: "moderate",
      });
    }

    if (previousLevel > 0 && level > previousLevel + 1) {
      issues.push({
        type: "error",
        rule: "heading-hierarchy",
        message: `Heading level skipped from h${previousLevel} to h${level}`,
        element: heading,
        severity: "serious",
      });
    }

    previousLevel = level;
  });

  return issues;
}

/**
 * Check form accessibility
 */
function checkFormAccessibility(container: Element): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const formElements = container.querySelectorAll("input, textarea, select");

  formElements.forEach((element) => {
    const id = element.getAttribute("id");
    const ariaLabel = element.getAttribute("aria-label");
    const ariaLabelledBy = element.getAttribute("aria-labelledby");

    // Check for label
    let hasLabel = false;
    if (id) {
      const label = container.querySelector(`label[for="${id}"]`);
      hasLabel = !!label;
    }

    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      issues.push({
        type: "error",
        rule: "form-label",
        message: "Form element must have an accessible label",
        element,
        severity: "critical",
      });
    }

    // Check required field indication
    if (element.hasAttribute("required")) {
      const label = id ? container.querySelector(`label[for="${id}"]`) : null;
      if (
        label &&
        !label.textContent?.includes("*") &&
        !element.getAttribute("aria-required")
      ) {
        issues.push({
          type: "warning",
          rule: "required-field",
          message: "Required field should be clearly indicated",
          element,
          severity: "moderate",
        });
      }
    }
  });

  return issues;
}

/**
 * Check image accessibility
 */
function checkImageAccessibility(container: Element): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const images = container.querySelectorAll("img");

  images.forEach((img) => {
    const alt = img.getAttribute("alt");
    const role = img.getAttribute("role");

    if (alt === null && role !== "presentation") {
      issues.push({
        type: "error",
        rule: "image-alt",
        message: "Image must have alt text or be marked as decorative",
        element: img,
        severity: "critical",
      });
    }

    if (
      alt &&
      (alt.toLowerCase().includes("image") ||
        alt.toLowerCase().includes("picture"))
    ) {
      issues.push({
        type: "warning",
        rule: "image-alt-redundant",
        message:
          "Alt text should not contain redundant words like 'image' or 'picture'",
        element: img,
        severity: "minor",
      });
    }
  });

  return issues;
}

/**
 * Check color contrast
 */
function checkColorContrast(container: Element): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const textElements = container.querySelectorAll(
    "p, h1, h2, h3, h4, h5, h6, span, div, a, button, label",
  );

  textElements.forEach((element) => {
    const color = getComputedColor(element, "color");
    const backgroundColor = getComputedColor(element, "background-color");

    if (color && backgroundColor && color !== backgroundColor) {
      const ratio = getContrastRatio(color, backgroundColor);

      if (ratio < 4.5) {
        issues.push({
          type: "error",
          rule: "color-contrast",
          message: `Color contrast ratio ${ratio.toFixed(2)} is below WCAG AA standard (4.5:1)`,
          element,
          severity: "serious",
        });
      } else if (ratio < 7) {
        issues.push({
          type: "info",
          rule: "color-contrast",
          message: `Color contrast ratio ${ratio.toFixed(2)} meets AA but not AAA standard (7:1)`,
          element,
          severity: "minor",
        });
      }
    }
  });

  return issues;
}

/**
 * Check interactive element accessibility
 */
function checkInteractiveElements(container: Element): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const interactiveElements = container.querySelectorAll(
    "button, a, input, textarea, select, [tabindex], [role='button']",
  );

  interactiveElements.forEach((element) => {
    // Check touch target size
    if (!checkTouchTargetSize(element)) {
      issues.push({
        type: "warning",
        rule: "touch-target-size",
        message: "Interactive element should be at least 44x44 pixels",
        element,
        severity: "moderate",
      });
    }

    // Check focus indicator
    if (!checkFocusIndicator(element)) {
      issues.push({
        type: "error",
        rule: "focus-indicator",
        message: "Interactive element must have visible focus indicator",
        element,
        severity: "serious",
      });
    }

    // Check accessible name
    const tagName = element.tagName.toLowerCase();
    const accessibleName =
      element.getAttribute("aria-label") ||
      element.getAttribute("aria-labelledby") ||
      (tagName === "button" ? element.textContent : null) ||
      (tagName === "a" ? element.textContent : null);

    if (!accessibleName?.trim()) {
      issues.push({
        type: "error",
        rule: "accessible-name",
        message: "Interactive element must have an accessible name",
        element,
        severity: "critical",
      });
    }
  });

  return issues;
}

/**
 * Run comprehensive accessibility audit
 */
export function runAccessibilityAudit(
  container: Element = document.body,
): Promise<AccessibilityReport> {
  const issues: AccessibilityIssue[] = [];
  const passedChecks: string[] = [];

  // Run all checks
  const headingIssues = checkHeadingHierarchy(container);
  const formIssues = checkFormAccessibility(container);
  const imageIssues = checkImageAccessibility(container);
  const contrastIssues = checkColorContrast(container);
  const interactiveIssues = checkInteractiveElements(container);

  issues.push(
    ...headingIssues,
    ...formIssues,
    ...imageIssues,
    ...contrastIssues,
    ...interactiveIssues,
  );

  // Track passed checks
  if (headingIssues.length === 0) passedChecks.push("heading-hierarchy");
  if (formIssues.length === 0) passedChecks.push("form-accessibility");
  if (imageIssues.length === 0) passedChecks.push("image-accessibility");
  if (contrastIssues.length === 0) passedChecks.push("color-contrast");
  if (interactiveIssues.length === 0) passedChecks.push("interactive-elements");

  // Generate summary
  const summary = {
    errors: issues.filter((issue) => issue.type === "error").length,
    warnings: issues.filter((issue) => issue.type === "warning").length,
    info: issues.filter((issue) => issue.type === "info").length,
    total: issues.length,
  };

  return Promise.resolve({
    issues,
    passedChecks,
    summary,
  });
}

/**
 * Log accessibility report to console
 */
export function logAccessibilityReport(report: AccessibilityReport): void {
  console.group("🔍 Accessibility Audit Report");

  console.log(`📊 Summary: ${report.summary.total} issues found`);
  console.log(`❌ Errors: ${report.summary.errors}`);
  console.log(`⚠️ Warnings: ${report.summary.warnings}`);
  console.log(`ℹ️ Info: ${report.summary.info}`);

  if (report.passedChecks.length > 0) {
    console.log(`✅ Passed checks: ${report.passedChecks.join(", ")}`);
  }

  if (report.issues.length > 0) {
    console.group("Issues:");
    report.issues.forEach((issue, index) => {
      const icon =
        issue.type === "error" ? "❌" : issue.type === "warning" ? "⚠️" : "ℹ️";
      console.log(`${icon} ${index + 1}. [${issue.rule}] ${issue.message}`);
      if (issue.element) {
        console.log("   Element:", issue.element);
      }
    });
    console.groupEnd();
  }

  console.groupEnd();
}

/**
 * Auto-fix some accessibility issues
 */
export function autoFixAccessibilityIssues(
  violations?: AccessibilityIssue[],
  container: Element = document.body,
): Promise<{ fixed: number; failed: number }> {
  let fixedCount = 0;
  const failedCount = 0;

  // Fix missing alt attributes on decorative images
  const decorativeImages = container.querySelectorAll("img:not([alt])");
  decorativeImages.forEach((img) => {
    // Only fix if image appears to be decorative (no surrounding link, small size, etc.)
    const rect = img.getBoundingClientRect();
    const isDecorative =
      rect.width < 50 && rect.height < 50 && !img.closest("a");

    if (isDecorative) {
      img.setAttribute("alt", "");
      img.setAttribute("role", "presentation");
      fixedCount++;
    }
  });

  // Fix missing focus indicators
  const interactiveElements = container.querySelectorAll(
    "button, a, input, textarea, select, [tabindex]",
  );
  interactiveElements.forEach((element) => {
    if (!checkFocusIndicator(element)) {
      element.classList.add(
        "focus-visible:outline-2",
        "focus-visible:outline-accent",
      );
      fixedCount++;
    }
  });

  return Promise.resolve({ fixed: fixedCount, failed: failedCount });
}

/**
 * Monitor accessibility in development
 */
export function startAccessibilityMonitoring(): void {
  if (process.env.NODE_ENV !== "development") return;

  let timeoutId: NodeJS.Timeout;

  const runAudit = async () => {
    const report = await runAccessibilityAudit();
    if (report.summary.total > 0) {
      logAccessibilityReport(report);
    }
  };

  // Use runAudit function
  void runAudit();

  // Run audit on DOM changes
  const observer = new MutationObserver(() => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const report = await runAccessibilityAudit();
      if (report.summary.total > 0) {
        logAccessibilityReport(report);
      }
    }, 1000);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "aria-label", "aria-labelledby", "alt"],
  });

  // Initial audit
  setTimeout(async () => {
    const report = await runAccessibilityAudit();
    if (report.summary.total > 0) {
      logAccessibilityReport(report);
    }
  }, 2000);

  console.log("🔍 Accessibility monitoring started");
}
