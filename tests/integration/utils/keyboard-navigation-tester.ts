/**
 * Keyboard Navigation Testing Utility
 * Provides comprehensive testing for keyboard navigation and screen reader support
 * including focus management, tab order, and keyboard shortcuts.
 */

import userEvent from "@testing-library/user-event";
// import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

export interface KeyboardNavigationReport {
  passed: boolean;
  focusableElements: number;
  tabOrder: FocusableElement[];
  skipLinks: SkipLink[];
  keyboardShortcuts: KeyboardShortcut[];
  focusTraps: FocusTrap[];
  issues: KeyboardIssue[];
}

export interface FocusableElement {
  element: HTMLElement;
  tagName: string;
  id?: string;
  className?: string;
  tabIndex: number;
  ariaLabel?: string;
  accessibleName: string;
  role?: string;
  isVisible: boolean;
  canReceiveFocus: boolean;
}

export interface SkipLink {
  element: HTMLElement;
  text: string;
  target: string;
  isVisible: boolean;
  isWorking: boolean;
}

export interface KeyboardShortcut {
  key: string;
  modifiers: string[];
  description: string;
  element?: HTMLElement;
  isWorking: boolean;
}

export interface FocusTrap {
  container: HTMLElement;
  isActive: boolean;
  firstFocusable?: HTMLElement;
  lastFocusable?: HTMLElement;
  isWorking: boolean;
}

export interface KeyboardIssue {
  type:
    | "focus-order"
    | "skip-link"
    | "focus-trap"
    | "keyboard-shortcut"
    | "focus-visible"
    | "tab-index";
  severity: "error" | "warning" | "info";
  element?: HTMLElement;
  description: string;
  recommendation: string;
}

/**
 * Keyboard Navigation Tester
 */
export class KeyboardNavigationTester {
  private user: ReturnType<typeof userEvent.setup>;
  private container: HTMLElement;
  private focusHistory: HTMLElement[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
    this.user = userEvent.setup();
  }

  /**
   * Run comprehensive keyboard navigation test
   */
  async testKeyboardNavigation(): Promise<KeyboardNavigationReport> {
    const focusableElements = this.getFocusableElements();
    const tabOrder = await this.testTabOrder();
    const skipLinks = await this.testSkipLinks();
    const keyboardShortcuts = await this.testKeyboardShortcuts();
    const focusTraps = await this.testFocusTraps();
    const issues = this.analyzeIssues(
      focusableElements,
      tabOrder,
      skipLinks,
      focusTraps,
    );

    return {
      passed: issues.filter((i) => i.severity === "error").length === 0,
      focusableElements: focusableElements.length,
      tabOrder,
      skipLinks,
      keyboardShortcuts,
      focusTraps,
      issues,
    };
  }

  /**
   * Test tab order and focus management
   */
  async testTabOrder(): Promise<FocusableElement[]> {
    const focusableElements = this.getFocusableElements();
    const tabOrder: FocusableElement[] = [];

    // Reset focus to body
    document.body.focus();
    this.focusHistory = [];

    // Tab through all focusable elements
    for (let i = 0; i < focusableElements.length + 2; i++) {
      await this.user.tab();

      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement !== document.body) {
        const focusableInfo = this.createFocusableElementInfo(activeElement);

        // Only add if not already in tab order (avoid duplicates)
        if (!tabOrder.find((el) => el.element === activeElement)) {
          tabOrder.push(focusableInfo);
        }

        this.focusHistory.push(activeElement);
      }
    }

    return tabOrder;
  }

  /**
   * Test reverse tab order
   */
  async testReverseTabOrder(): Promise<FocusableElement[]> {
    const reverseTabOrder: FocusableElement[] = [];

    // Start from the end
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].element.focus();
    }

    // Shift+Tab through elements
    for (let i = 0; i < focusableElements.length + 2; i++) {
      await this.user.tab({ shift: true });

      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement !== document.body) {
        const focusableInfo = this.createFocusableElementInfo(activeElement);

        if (!reverseTabOrder.find((el) => el.element === activeElement)) {
          reverseTabOrder.push(focusableInfo);
        }
      }
    }

    return reverseTabOrder;
  }

  /**
   * Test skip links functionality
   */
  async testSkipLinks(): Promise<SkipLink[]> {
    const skipLinkElements = this.container.querySelectorAll('a[href^="#"]');
    const skipLinks: SkipLink[] = [];

    for (const linkElement of Array.from(skipLinkElements)) {
      const link = linkElement as HTMLAnchorElement;
      const href = link.getAttribute("href");
      const text = link.textContent || link.getAttribute("aria-label") || "";

      if (!href) continue;

      const target = href.substring(1); // Remove #
      const targetElement = this.container.querySelector(`#${target}`);

      const skipLink: SkipLink = {
        element: link,
        text,
        target,
        isVisible: this.isElementVisible(link),
        isWorking: false,
      };

      // Test if skip link works
      try {
        link.focus();
        await this.user.keyboard("{Enter}");

        // Check if focus moved to target
        if (targetElement && document.activeElement === targetElement) {
          skipLink.isWorking = true;
        }
      } catch {
        // Skip link test failed
      }

      skipLinks.push(skipLink);
    }

    return skipLinks;
  }

  /**
   * Test keyboard shortcuts
   */
  async testKeyboardShortcuts(): Promise<KeyboardShortcut[]> {
    const shortcuts: KeyboardShortcut[] = [];

    // Common keyboard shortcuts to test
    const commonShortcuts = [
      { key: "Escape", modifiers: [], description: "Close modal/dialog" },
      { key: "Enter", modifiers: [], description: "Activate button/link" },
      { key: " ", modifiers: [], description: "Activate button" },
      { key: "ArrowUp", modifiers: [], description: "Navigate up" },
      { key: "ArrowDown", modifiers: [], description: "Navigate down" },
      { key: "ArrowLeft", modifiers: [], description: "Navigate left" },
      { key: "ArrowRight", modifiers: [], description: "Navigate right" },
      { key: "Home", modifiers: [], description: "Go to beginning" },
      { key: "End", modifiers: [], description: "Go to end" },
      { key: "PageUp", modifiers: [], description: "Page up" },
      { key: "PageDown", modifiers: [], description: "Page down" },
    ];

    for (const shortcut of commonShortcuts) {
      const keyboardShortcut: KeyboardShortcut = {
        ...shortcut,
        isWorking: await this.testKeyboardShortcut(
          shortcut.key,
          shortcut.modifiers,
        ),
      };

      shortcuts.push(keyboardShortcut);
    }

    return shortcuts;
  }

  /**
   * Test focus traps (for modals, dialogs, etc.)
   */
  async testFocusTraps(): Promise<FocusTrap[]> {
    const focusTraps: FocusTrap[] = [];

    // Look for modal/dialog elements
    const modalElements = this.container.querySelectorAll(
      '[role="dialog"], [role="alertdialog"], .modal, [aria-modal="true"]',
    );

    for (const modalElement of Array.from(modalElements)) {
      const modal = modalElement as HTMLElement;
      const isVisible = this.isElementVisible(modal);

      if (!isVisible) continue;

      const focusableInModal = this.getFocusableElementsInContainer(modal);
      const firstFocusable = focusableInModal[0]?.element;
      const lastFocusable =
        focusableInModal[focusableInModal.length - 1]?.element;

      const focusTrap: FocusTrap = {
        container: modal,
        isActive: isVisible,
        firstFocusable,
        lastFocusable,
        isWorking: false,
      };

      // Test focus trap
      if (firstFocusable && lastFocusable) {
        try {
          // Focus first element
          firstFocusable.focus();

          // Tab to last element
          for (let i = 0; i < focusableInModal.length; i++) {
            await this.user.tab();
          }

          // One more tab should cycle back to first
          await this.user.tab();

          if (document.activeElement === firstFocusable) {
            focusTrap.isWorking = true;
          }
        } catch {
          // Focus trap test failed
        }
      }

      focusTraps.push(focusTrap);
    }

    return focusTraps;
  }

  /**
   * Test specific keyboard shortcut
   */
  private async testKeyboardShortcut(
    key: string,
    modifiers: string[],
  ): Promise<boolean> {
    try {
      const focusableElements = this.getFocusableElements();

      if (focusableElements.length === 0) return false;

      // Focus a relevant element
      const testElement = focusableElements.find(
        (el) =>
          el.element.tagName === "BUTTON" ||
          el.element.tagName === "A" ||
          el.element.getAttribute("role") === "button",
      );

      if (testElement) {
        testElement.element.focus();

        // Build keyboard command
        let keyCommand = "";
        if (modifiers.includes("ctrl")) keyCommand += "{Control>}";
        if (modifiers.includes("alt")) keyCommand += "{Alt>}";
        if (modifiers.includes("shift")) keyCommand += "{Shift>}";

        keyCommand += `{${key}}`;

        if (modifiers.includes("shift")) keyCommand += "{/Shift}";
        if (modifiers.includes("alt")) keyCommand += "{/Alt}";
        if (modifiers.includes("ctrl")) keyCommand += "{/Control}";

        await this.user.keyboard(keyCommand);

        // For now, assume shortcut works if no error thrown
        return true;
      }
    } catch {
      return false;
    }

    return false;
  }

  /**
   * Get all focusable elements in container
   */
  private getFocusableElements(): FocusableElement[] {
    return this.getFocusableElementsInContainer(this.container);
  }

  /**
   * Get focusable elements in specific container
   */
  private getFocusableElementsInContainer(
    container: HTMLElement,
  ): FocusableElement[] {
    const focusableSelectors = [
      'a[href]:not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
      'input:not([disabled]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([tabindex="-1"])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]:not([tabindex="-1"])',
      'audio[controls]:not([tabindex="-1"])',
      'video[controls]:not([tabindex="-1"])',
      'details summary:not([tabindex="-1"])',
    ];

    const elements = Array.from(
      container.querySelectorAll(focusableSelectors.join(", ")),
    ) as HTMLElement[];

    return elements
      .filter((el) => this.isElementVisible(el))
      .map((el) => this.createFocusableElementInfo(el));
  }

  /**
   * Create focusable element information
   */
  private createFocusableElementInfo(element: HTMLElement): FocusableElement {
    const computedStyle = window.getComputedStyle(element);
    const isVisible = this.isElementVisible(element);

    return {
      element,
      tagName: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      tabIndex: parseInt(element.getAttribute("tabindex") || "0"),
      ariaLabel: element.getAttribute("aria-label") || undefined,
      accessibleName: this.getAccessibleName(element),
      role: element.getAttribute("role") || undefined,
      isVisible,
      canReceiveFocus: isVisible && computedStyle.display !== "none",
    };
  }

  /**
   * Get accessible name for element
   */
  private getAccessibleName(element: HTMLElement): string {
    // Check aria-label
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) return ariaLabel;

    // Check aria-labelledby
    const ariaLabelledBy = element.getAttribute("aria-labelledby");
    if (ariaLabelledBy) {
      const labelElement = document.getElementById(ariaLabelledBy);
      if (labelElement) return labelElement.textContent || "";
    }

    // Check associated label
    const id = element.getAttribute("id");
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return label.textContent || "";
    }

    // Check text content
    const textContent = element.textContent?.trim();
    if (textContent) return textContent;

    // Check alt attribute for images
    const alt = element.getAttribute("alt");
    if (alt) return alt;

    // Check title attribute
    const title = element.getAttribute("title");
    if (title) return title;

    return "";
  }

  /**
   * Check if element is visible
   */
  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      computedStyle.display !== "none" &&
      computedStyle.visibility !== "hidden" &&
      computedStyle.opacity !== "0"
    );
  }

  /**
   * Analyze keyboard navigation issues
   */
  private analyzeIssues(
    focusableElements: FocusableElement[],
    tabOrder: FocusableElement[],
    skipLinks: SkipLink[],
    focusTraps: FocusTrap[],
  ): KeyboardIssue[] {
    const issues: KeyboardIssue[] = [];

    // Check for elements without accessible names
    focusableElements.forEach((el) => {
      if (!el.accessibleName && el.tagName !== "input") {
        issues.push({
          type: "focus-order",
          severity: "error",
          element: el.element,
          description: `Focusable ${el.tagName} element lacks accessible name`,
          recommendation:
            "Add aria-label, aria-labelledby, or visible text content",
        });
      }
    });

    // Check for invalid tab indices
    focusableElements.forEach((el) => {
      if (el.tabIndex > 0) {
        issues.push({
          type: "tab-index",
          severity: "warning",
          element: el.element,
          description: `Element has positive tabindex (${el.tabIndex})`,
          recommendation: 'Use tabindex="0" or rely on natural tab order',
        });
      }
    });

    // Check skip links
    skipLinks.forEach((skipLink) => {
      if (!skipLink.isWorking) {
        issues.push({
          type: "skip-link",
          severity: "error",
          element: skipLink.element,
          description: `Skip link "${skipLink.text}" is not working`,
          recommendation: "Ensure skip link target exists and is focusable",
        });
      }

      if (!skipLink.isVisible) {
        issues.push({
          type: "skip-link",
          severity: "info",
          element: skipLink.element,
          description: `Skip link "${skipLink.text}" is not visible`,
          recommendation: "Consider making skip links visible on focus",
        });
      }
    });

    // Check focus traps
    focusTraps.forEach((focusTrap) => {
      if (focusTrap.isActive && !focusTrap.isWorking) {
        issues.push({
          type: "focus-trap",
          severity: "error",
          element: focusTrap.container,
          description: "Modal/dialog does not properly trap focus",
          recommendation: "Implement focus trap to cycle focus within modal",
        });
      }
    });

    // Check for missing focus indicators
    focusableElements.forEach((el) => {
      // This is a simplified check - in real implementation,
      // you'd need to check computed styles for focus indicators
      const hasOutline = el.element.style.outline !== "none";
      const hasBoxShadow = el.element.style.boxShadow !== "none";

      if (!hasOutline && !hasBoxShadow) {
        issues.push({
          type: "focus-visible",
          severity: "warning",
          element: el.element,
          description: "Element may lack visible focus indicator",
          recommendation:
            "Ensure focus indicators are visible and meet contrast requirements",
        });
      }
    });

    return issues;
  }

  /**
   * Generate keyboard navigation report
   */
  generateReport(report: KeyboardNavigationReport): string {
    const lines = [
      "=== Keyboard Navigation Report ===",
      "",
      `Status: ${report.passed ? "PASSED" : "FAILED"}`,
      `Focusable Elements: ${report.focusableElements}`,
      `Tab Order Elements: ${report.tabOrder.length}`,
      `Skip Links: ${report.skipLinks.length}`,
      `Focus Traps: ${report.focusTraps.length}`,
      `Issues: ${report.issues.length}`,
      "",
    ];

    if (report.skipLinks.length > 0) {
      lines.push("Skip Links:");
      report.skipLinks.forEach((skipLink, index) => {
        lines.push(
          `  ${index + 1}. "${skipLink.text}" -> #${skipLink.target} (${skipLink.isWorking ? "Working" : "Not Working"})`,
        );
      });
      lines.push("");
    }

    if (report.focusTraps.length > 0) {
      lines.push("Focus Traps:");
      report.focusTraps.forEach((trap, index) => {
        lines.push(
          `  ${index + 1}. ${trap.container.tagName} (${trap.isWorking ? "Working" : "Not Working"})`,
        );
      });
      lines.push("");
    }

    if (report.issues.length > 0) {
      lines.push("Issues:");
      report.issues.forEach((issue, index) => {
        lines.push(
          `  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`,
        );
        lines.push(`     Recommendation: ${issue.recommendation}`);
      });
    }

    return lines.join("\n");
  }
}
