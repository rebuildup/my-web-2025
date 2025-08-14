/**
 * WCAG 2.1 AA Compliance Testing Utility
 * Provides comprehensive automated testing for WCAG 2.1 AA compliance
 * including color contrast, keyboard navigation, and screen reader support.
 */

import type { Result } from "axe-core";
import { axe } from "jest-axe";

export interface WCAGComplianceReport {
  passed: boolean;
  violations: WCAGViolation[];
  warnings: WCAGViolation[];
  score: number; // 0-100
  categories: {
    perceivable: WCAGCategoryResult;
    operable: WCAGCategoryResult;
    understandable: WCAGCategoryResult;
    robust: WCAGCategoryResult;
  };
}

export interface WCAGViolation {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
  wcagLevel: "A" | "AA" | "AAA";
  principle: "perceivable" | "operable" | "understandable" | "robust";
}

export interface WCAGCategoryResult {
  passed: boolean;
  violations: number;
  score: number;
  issues: string[];
}

/**
 * WCAG 2.1 AA rule configuration
 */
export const WCAG_21_AA_RULES = {
  // Perceivable
  "color-contrast": { enabled: true, level: "AA", principle: "perceivable" },
  "image-alt": { enabled: true, level: "A", principle: "perceivable" },
  "audio-caption": { enabled: true, level: "A", principle: "perceivable" },
  "video-caption": { enabled: true, level: "A", principle: "perceivable" },

  // Operable
  keyboard: { enabled: true, level: "A", principle: "operable" },
  "focus-order-semantics": { enabled: true, level: "A", principle: "operable" },
  "link-in-text-block": { enabled: true, level: "A", principle: "operable" },
  "skip-link": { enabled: true, level: "A", principle: "operable" },

  // Understandable
  "html-has-lang": { enabled: true, level: "A", principle: "understandable" },
  "html-lang-valid": { enabled: true, level: "A", principle: "understandable" },
  label: { enabled: true, level: "A", principle: "understandable" },
  "form-field-multiple-labels": {
    enabled: true,
    level: "A",
    principle: "understandable",
  },

  // Robust
  "valid-lang": { enabled: true, level: "A", principle: "robust" },
  "aria-allowed-attr": { enabled: true, level: "A", principle: "robust" },
  "aria-required-attr": { enabled: true, level: "A", principle: "robust" },
  "aria-valid-attr": { enabled: true, level: "A", principle: "robust" },
  "aria-valid-attr-value": { enabled: true, level: "A", principle: "robust" },
};

/**
 * WCAG 2.1 AA Compliance Tester
 */
export class WCAGComplianceTester {
  private axeConfig = {
    rules: WCAG_21_AA_RULES,
    tags: ["wcag2a", "wcag2aa", "wcag21aa"],
  };

  /**
   * Run comprehensive WCAG 2.1 AA compliance test
   */
  async testCompliance(container: HTMLElement): Promise<WCAGComplianceReport> {
    const results = await axe(container, this.axeConfig);

    return this.processResults(results);
  }

  /**
   * Test specific WCAG category
   */
  async testCategory(
    container: HTMLElement,
    category: "perceivable" | "operable" | "understandable" | "robust",
  ): Promise<WCAGCategoryResult> {
    const categoryRules = Object.entries(WCAG_21_AA_RULES)
      .filter(([, config]) => config.principle === category)
      .reduce((acc, [rule, config]) => ({ ...acc, [rule]: config }), {});

    const results = await axe(container, {
      rules: categoryRules,
    } as Parameters<typeof axe>[1]);

    return this.processCategoryResults(results);
  }

  /**
   * Test color contrast specifically
   */
  async testColorContrast(container: HTMLElement): Promise<{
    passed: boolean;
    violations: WCAGViolation[];
    elements: Array<{
      selector: string;
      foreground: string;
      background: string;
      ratio: number;
      required: number;
    }>;
  }> {
    const results = await axe(container, {
      rules: {
        "color-contrast": { enabled: true },
        "color-contrast-enhanced": { enabled: true },
      },
    });

    const violations = this.mapViolations(results.violations);
    const elements = this.extractColorContrastElements();

    return {
      passed: violations.length === 0,
      violations,
      elements,
    };
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(container: HTMLElement): Promise<{
    passed: boolean;
    violations: WCAGViolation[];
    focusableElements: number;
    tabOrder: string[];
    skipLinks: number;
  }> {
    const results = await axe(container, {
      rules: {
        keyboard: { enabled: true },
        "focus-order-semantics": { enabled: true },
        "skip-link": { enabled: true },
        tabindex: { enabled: true },
      },
    });

    const violations = this.mapViolations(results.violations);
    const focusableElements = this.getFocusableElements(container);
    const tabOrder = this.getTabOrder(container);
    const skipLinks = this.getSkipLinks(container);

    return {
      passed: violations.length === 0,
      violations,
      focusableElements: focusableElements.length,
      tabOrder,
      skipLinks: skipLinks.length,
    };
  }

  /**
   * Test form accessibility
   */
  async testFormAccessibility(container: HTMLElement): Promise<{
    passed: boolean;
    violations: WCAGViolation[];
    forms: number;
    labeledInputs: number;
    unlabeledInputs: number;
    fieldsets: number;
  }> {
    const results = await axe(container, {
      rules: {
        label: { enabled: true },
        "label-title-only": { enabled: true },
        "form-field-multiple-labels": { enabled: true },
        "required-attr": { enabled: true },
        "aria-required-attr": { enabled: true },
        "fieldset-legend": { enabled: true },
      },
    });

    const violations = this.mapViolations(results.violations);
    const formStats = this.analyzeFormAccessibility(container);

    return {
      passed: violations.length === 0,
      violations,
      ...formStats,
    };
  }

  /**
   * Test heading structure
   */
  async testHeadingStructure(container: HTMLElement): Promise<{
    passed: boolean;
    violations: WCAGViolation[];
    headings: Array<{
      level: number;
      text: string;
      element: string;
    }>;
    hasH1: boolean;
    properHierarchy: boolean;
  }> {
    const results = await axe(container, {
      rules: {
        "heading-order": { enabled: true },
        "empty-heading": { enabled: true },
        "p-as-heading": { enabled: true },
      },
    });

    const violations = this.mapViolations(results.violations);
    const headingAnalysis = this.analyzeHeadingStructure(container);

    return {
      passed: violations.length === 0,
      violations,
      ...headingAnalysis,
    };
  }

  /**
   * Test ARIA implementation
   */
  async testARIA(container: HTMLElement): Promise<{
    passed: boolean;
    violations: WCAGViolation[];
    ariaElements: number;
    landmarks: number;
    liveRegions: number;
    roles: string[];
  }> {
    const results = await axe(container, {
      rules: {
        "aria-allowed-attr": { enabled: true },
        "aria-required-attr": { enabled: true },
        "aria-valid-attr": { enabled: true },
        "aria-valid-attr-value": { enabled: true },
        "aria-roles": { enabled: true },
        "landmark-one-main": { enabled: true },
        "landmark-complementary-is-top-level": { enabled: true },
      },
    });

    const violations = this.mapViolations(results.violations);
    const ariaAnalysis = this.analyzeARIA(container);

    return {
      passed: violations.length === 0,
      violations,
      ...ariaAnalysis,
    };
  }

  /**
   * Process axe results into WCAG compliance report
   */
  private processResults(results: {
    violations: Result[];
    incomplete: Result[];
  }): WCAGComplianceReport {
    const violations = this.mapViolations(results.violations);
    const warnings = this.mapViolations(results.incomplete);

    const categories = {
      perceivable: this.getCategoryResult(violations, "perceivable"),
      operable: this.getCategoryResult(violations, "operable"),
      understandable: this.getCategoryResult(violations, "understandable"),
      robust: this.getCategoryResult(violations, "robust"),
    };

    const totalViolations = violations.length;
    const criticalViolations = violations.filter(
      (v) => v.impact === "critical",
    ).length;
    const seriousViolations = violations.filter(
      (v) => v.impact === "serious",
    ).length;

    // Calculate score (0-100)
    let score = 100;
    score -= criticalViolations * 20;
    score -= seriousViolations * 10;
    score -= (totalViolations - criticalViolations - seriousViolations) * 5;
    score = Math.max(0, score);

    return {
      passed: violations.length === 0,
      violations,
      warnings,
      score,
      categories,
    };
  }

  /**
   * Process category-specific results
   */
  private processCategoryResults(results: {
    violations: Result[];
  }): WCAGCategoryResult {
    const violations = this.mapViolations(results.violations);
    const issues = violations.map((v) => v.description);

    let score = 100;
    score -= violations.filter((v) => v.impact === "critical").length * 25;
    score -= violations.filter((v) => v.impact === "serious").length * 15;
    score -= violations.filter((v) => v.impact === "moderate").length * 10;
    score -= violations.filter((v) => v.impact === "minor").length * 5;
    score = Math.max(0, score);

    return {
      passed: violations.length === 0,
      violations: violations.length,
      score,
      issues,
    };
  }

  /**
   * Map axe violations to WCAG violations
   */
  private mapViolations(axeViolations: Result[]): WCAGViolation[] {
    return axeViolations.map((violation) => ({
      id: violation.id,
      impact: violation.impact as "minor" | "moderate" | "serious" | "critical",
      description: violation.description,
      help: violation.help,
      helpUrl: violation.helpUrl,
      nodes: violation.nodes.map((node) => ({
        html: node.html,
        target: Array.isArray(node.target)
          ? (node.target as string[])
          : typeof node.target === "string"
            ? [node.target]
            : [String(node.target)],
        failureSummary: node.failureSummary || "",
      })),
      wcagLevel: this.getWCAGLevel(violation.id),
      principle: this.getWCAGPrinciple(violation.id),
    }));
  }

  /**
   * Get WCAG level for a rule
   */
  private getWCAGLevel(ruleId: string): "A" | "AA" | "AAA" {
    const rule = WCAG_21_AA_RULES[ruleId as keyof typeof WCAG_21_AA_RULES];
    return (rule?.level as "A" | "AA" | "AAA") || "A";
  }

  /**
   * Get WCAG principle for a rule
   */
  private getWCAGPrinciple(
    ruleId: string,
  ): "perceivable" | "operable" | "understandable" | "robust" {
    const rule = WCAG_21_AA_RULES[ruleId as keyof typeof WCAG_21_AA_RULES];
    return (
      (rule?.principle as
        | "perceivable"
        | "operable"
        | "understandable"
        | "robust") || "robust"
    );
  }

  /**
   * Get category result from violations
   */
  private getCategoryResult(
    violations: WCAGViolation[],
    category: string,
  ): WCAGCategoryResult {
    const categoryViolations = violations.filter(
      (v) => v.principle === category,
    );
    const issues = categoryViolations.map((v) => v.description);

    let score = 100;
    score -=
      categoryViolations.filter((v) => v.impact === "critical").length * 25;
    score -=
      categoryViolations.filter((v) => v.impact === "serious").length * 15;
    score -=
      categoryViolations.filter((v) => v.impact === "moderate").length * 10;
    score -= categoryViolations.filter((v) => v.impact === "minor").length * 5;
    score = Math.max(0, score);

    return {
      passed: categoryViolations.length === 0,
      violations: categoryViolations.length,
      score,
      issues,
    };
  }

  /**
   * Extract color contrast information
   */
  private extractColorContrastElements(): Array<{
    selector: string;
    foreground: string;
    background: string;
    ratio: number;
    required: number;
  }> {
    // This would extract actual color contrast data from axe results
    // For now, return empty array as axe results structure is complex
    return [];
  }

  /**
   * Get focusable elements
   */
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ];

    return Array.from(
      container.querySelectorAll(focusableSelectors.join(", ")),
    ) as HTMLElement[];
  }

  /**
   * Get tab order
   */
  private getTabOrder(container: HTMLElement): string[] {
    const focusableElements = this.getFocusableElements(container);

    return focusableElements
      .sort((a, b) => {
        const aTabIndex = parseInt(a.getAttribute("tabindex") || "0");
        const bTabIndex = parseInt(b.getAttribute("tabindex") || "0");
        return aTabIndex - bTabIndex;
      })
      .map((el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ""));
  }

  /**
   * Get skip links
   */
  private getSkipLinks(container: HTMLElement): HTMLElement[] {
    return Array.from(
      container.querySelectorAll('a[href^="#"]'),
    ) as HTMLElement[];
  }

  /**
   * Analyze form accessibility
   */
  private analyzeFormAccessibility(container: HTMLElement): {
    forms: number;
    labeledInputs: number;
    unlabeledInputs: number;
    fieldsets: number;
  } {
    const forms = container.querySelectorAll("form").length;
    const inputs = Array.from(
      container.querySelectorAll("input, textarea, select"),
    );
    const fieldsets = container.querySelectorAll("fieldset").length;

    let labeledInputs = 0;
    let unlabeledInputs = 0;

    inputs.forEach((input) => {
      const id = input.getAttribute("id");
      const ariaLabel = input.getAttribute("aria-label");
      const ariaLabelledBy = input.getAttribute("aria-labelledby");
      const label = id ? container.querySelector(`label[for="${id}"]`) : null;

      if (label || ariaLabel || ariaLabelledBy) {
        labeledInputs++;
      } else {
        unlabeledInputs++;
      }
    });

    return {
      forms,
      labeledInputs,
      unlabeledInputs,
      fieldsets,
    };
  }

  /**
   * Analyze heading structure
   */
  private analyzeHeadingStructure(container: HTMLElement): {
    headings: Array<{
      level: number;
      text: string;
      element: string;
    }>;
    hasH1: boolean;
    properHierarchy: boolean;
  } {
    const headingElements = Array.from(
      container.querySelectorAll("h1, h2, h3, h4, h5, h6"),
    );

    const headings = headingElements.map((el) => ({
      level: parseInt(el.tagName.charAt(1)),
      text: el.textContent || "",
      element: el.tagName.toLowerCase(),
    }));

    const hasH1 = headings.some((h) => h.level === 1);

    // Check proper hierarchy (no skipping levels)
    let properHierarchy = true;
    let previousLevel = 0;

    for (const heading of headings) {
      if (previousLevel > 0 && heading.level > previousLevel + 1) {
        properHierarchy = false;
        break;
      }
      previousLevel = heading.level;
    }

    return {
      headings,
      hasH1,
      properHierarchy,
    };
  }

  /**
   * Analyze ARIA implementation
   */
  private analyzeARIA(container: HTMLElement): {
    ariaElements: number;
    landmarks: number;
    liveRegions: number;
    roles: string[];
  } {
    const ariaElements = container.querySelectorAll("[aria-*], [role]").length;
    const landmarks = container.querySelectorAll(
      '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]',
    ).length;
    const liveRegions = container.querySelectorAll(
      '[aria-live], [role="status"], [role="alert"]',
    ).length;

    const roleElements = Array.from(container.querySelectorAll("[role]"));
    const roles = [
      ...new Set(
        roleElements
          .map((el) => el.getAttribute("role"))
          .filter((role): role is string => Boolean(role)),
      ),
    ];

    return {
      ariaElements,
      landmarks,
      liveRegions,
      roles,
    };
  }

  /**
   * Generate compliance report
   */
  generateReport(report: WCAGComplianceReport): string {
    const lines = [
      "=== WCAG 2.1 AA Compliance Report ===",
      "",
      `Overall Status: ${report.passed ? "PASSED" : "FAILED"}`,
      `Compliance Score: ${report.score}/100`,
      "",
      "Category Scores:",
      `  Perceivable: ${report.categories.perceivable.score}/100 (${report.categories.perceivable.violations} violations)`,
      `  Operable: ${report.categories.operable.score}/100 (${report.categories.operable.violations} violations)`,
      `  Understandable: ${report.categories.understandable.score}/100 (${report.categories.understandable.violations} violations)`,
      `  Robust: ${report.categories.robust.score}/100 (${report.categories.robust.violations} violations)`,
      "",
      `Total Violations: ${report.violations.length}`,
      `Total Warnings: ${report.warnings.length}`,
    ];

    if (report.violations.length > 0) {
      lines.push("", "Violations:");
      report.violations.forEach((violation, index) => {
        lines.push(
          `  ${index + 1}. ${violation.description} (${violation.impact})`,
        );
        lines.push(`     Help: ${violation.help}`);
        lines.push(`     Nodes: ${violation.nodes.length}`);
      });
    }

    return lines.join("\n");
  }
}
