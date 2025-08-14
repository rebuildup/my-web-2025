/**
 * アクセシビリティテスト用ヘルパー関数
 * 要件2.5: ARIA属性、キーボードナビゲーション、スクリーンリーダー対応が検証されること
 */

import { RenderResult } from "@testing-library/react";
import { simulateKeyboardEvent } from "./test-helpers";

// ARIA属性の検証
export interface AriaAttributes {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-expanded"?: boolean;
  "aria-hidden"?: boolean;
  "aria-disabled"?: boolean;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  "aria-live"?: "polite" | "assertive" | "off";
  "aria-atomic"?: boolean;
  "aria-busy"?: boolean;
  "aria-controls"?: string;
  "aria-owns"?: string;
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  role?: string;
}

/**
 * ARIA属性の検証
 */
export const validateAriaAttributes = (
  element: Element,
  expectedAttributes: AriaAttributes,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  Object.entries(expectedAttributes).forEach(([attr, expectedValue]) => {
    const actualValue = element.getAttribute(attr);

    if (expectedValue === undefined || expectedValue === null) {
      if (actualValue !== null) {
        errors.push(`Expected ${attr} to be absent, but found: ${actualValue}`);
      }
    } else if (typeof expectedValue === "boolean") {
      const actualBoolValue = actualValue === "true";
      if (actualBoolValue !== expectedValue) {
        errors.push(
          `Expected ${attr} to be ${expectedValue}, but found: ${actualValue}`,
        );
      }
    } else {
      if (actualValue !== String(expectedValue)) {
        errors.push(
          `Expected ${attr} to be "${expectedValue}", but found: "${actualValue}"`,
        );
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * フォーカス可能な要素の検証
 */
export const getFocusableElements = (container: Element): Element[] => {
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
  ).filter((element) => {
    // 非表示要素を除外
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  });
};

/**
 * タブオーダーの検証
 */
export const validateTabOrder = (
  container: Element,
): {
  isValid: boolean;
  elements: Element[];
  errors: string[];
} => {
  const focusableElements = getFocusableElements(container);
  const errors: string[] = [];

  // タブインデックスでソート
  const sortedElements = focusableElements.sort((a, b) => {
    const aTabIndex = parseInt(a.getAttribute("tabindex") || "0");
    const bTabIndex = parseInt(b.getAttribute("tabindex") || "0");

    // tabindex="0"は最後に来る
    if (aTabIndex === 0 && bTabIndex !== 0) return 1;
    if (bTabIndex === 0 && aTabIndex !== 0) return -1;
    if (aTabIndex === 0 && bTabIndex === 0) return 0;

    return aTabIndex - bTabIndex;
  });

  // 負のタブインデックスをチェック
  focusableElements.forEach((element, index) => {
    const tabIndex = parseInt(element.getAttribute("tabindex") || "0");
    if (tabIndex < 0 && tabIndex !== -1) {
      errors.push(
        `Element at index ${index} has invalid tabindex: ${tabIndex}`,
      );
    }
  });

  return {
    isValid: errors.length === 0,
    elements: sortedElements,
    errors,
  };
};

/**
 * キーボードナビゲーションのテスト
 */
export const testKeyboardNavigation = async (
  component: RenderResult,
  keys: string[] = [
    "Tab",
    "Enter",
    " ",
    "Escape",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
  ],
): Promise<{ success: boolean; errors: string[] }> => {
  const errors: string[] = [];
  const container = component.container;

  try {
    // フォーカス可能な要素を取得
    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) {
      errors.push("No focusable elements found");
      return { success: false, errors };
    }

    // 各キーをテスト
    for (const key of keys) {
      for (const element of focusableElements) {
        try {
          // 要素にフォーカス
          (element as HTMLElement).focus();

          // キーイベントをシミュレート
          simulateKeyboardEvent(element, key);

          // フォーカスの変化を確認（Tabキーの場合）
          if (key === "Tab") {
            const activeElement = document.activeElement;
            if (!activeElement || !container.contains(activeElement)) {
              errors.push(
                `Tab navigation failed from element: ${element.tagName}`,
              );
            }
          }
        } catch (error) {
          errors.push(
            `Keyboard event failed for key "${key}" on element: ${element.tagName} - ${error}`,
          );
        }
      }
    }
  } catch (error) {
    errors.push(`Keyboard navigation test failed: ${error}`);
  }

  return {
    success: errors.length === 0,
    errors,
  };
};

/**
 * スクリーンリーダー対応の検証
 */
export const validateScreenReaderSupport = (
  element: Element,
): {
  isValid: boolean;
  score: number;
  recommendations: string[];
} => {
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 10;

  // ラベルの存在確認
  const hasLabel =
    element.getAttribute("aria-label") ||
    element.getAttribute("aria-labelledby") ||
    (element.tagName === "INPUT" && element.closest("label"));
  if (hasLabel) {
    score += 2;
  } else {
    recommendations.push("Add aria-label or associate with a label element");
  }

  // 説明の存在確認
  if (element.getAttribute("aria-describedby")) {
    score += 1;
  } else if (element.getAttribute("title")) {
    score += 0.5;
  } else {
    recommendations.push(
      "Consider adding aria-describedby for additional context",
    );
  }

  // ロールの適切性確認
  const role = element.getAttribute("role");
  const tagName = element.tagName.toLowerCase();
  if (
    role ||
    ["button", "input", "select", "textarea", "a"].includes(tagName)
  ) {
    score += 2;
  } else {
    recommendations.push("Add appropriate role attribute");
  }

  // 状態の表現確認
  const hasStateAttributes = [
    "aria-expanded",
    "aria-selected",
    "aria-checked",
    "aria-pressed",
  ].some((attr) => element.hasAttribute(attr));
  if (hasStateAttributes) {
    score += 2;
  } else if (["button", "input"].includes(tagName)) {
    recommendations.push(
      "Add state attributes (aria-expanded, aria-selected, etc.)",
    );
  }

  // ライブリージョンの確認
  if (element.getAttribute("aria-live")) {
    score += 1;
  }

  // フォーカス可能性の確認
  const isFocusable =
    element.getAttribute("tabindex") !== null ||
    ["a", "button", "input", "select", "textarea"].includes(tagName);
  if (isFocusable) {
    score += 2;
  } else if (element.getAttribute("role") === "button") {
    recommendations.push(
      "Interactive elements should be focusable (add tabindex)",
    );
  }

  return {
    isValid: score >= maxScore * 0.7, // 70%以上で合格
    score: Math.round((score / maxScore) * 100),
    recommendations,
  };
};

/**
 * カラーコントラストの検証（簡易版）
 */
export const validateColorContrast = (
  element: Element,
): {
  isValid: boolean;
  ratio: number | null;
  recommendation: string;
} => {
  const style = window.getComputedStyle(element);
  const color = style.color;
  const backgroundColor = style.backgroundColor;

  // 簡易的な検証（実際のコントラスト比計算は複雑）
  if (!color || !backgroundColor || backgroundColor === "rgba(0, 0, 0, 0)") {
    return {
      isValid: false,
      ratio: null,
      recommendation:
        "Unable to determine color contrast. Ensure text has sufficient contrast with background.",
    };
  }

  // RGB値を抽出（簡易版）
  const extractRGB = (colorStr: string): number[] | null => {
    const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return match
      ? [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])]
      : null;
  };

  const textRGB = extractRGB(color);
  const bgRGB = extractRGB(backgroundColor);

  if (!textRGB || !bgRGB) {
    return {
      isValid: false,
      ratio: null,
      recommendation: "Unable to parse color values. Use standard RGB format.",
    };
  }

  // 簡易的な明度計算
  const getLuminance = (rgb: number[]): number => {
    const [r, g, b] = rgb.map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const textLuminance = getLuminance(textRGB);
  const bgLuminance = getLuminance(bgRGB);

  const ratio =
    (Math.max(textLuminance, bgLuminance) + 0.05) /
    (Math.min(textLuminance, bgLuminance) + 0.05);

  const isValid = ratio >= 4.5; // WCAG AA基準

  return {
    isValid,
    ratio: Math.round(ratio * 100) / 100,
    recommendation: isValid
      ? "Color contrast meets WCAG AA standards"
      : `Color contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA standard (4.5:1). Consider using darker text or lighter background.`,
  };
};

/**
 * 包括的なアクセシビリティ監査
 */
export const auditAccessibility = async (
  component: RenderResult,
  options: {
    checkAria?: boolean;
    checkKeyboard?: boolean;
    checkScreenReader?: boolean;
    checkColorContrast?: boolean;
  } = {},
): Promise<{
  score: number;
  isAccessible: boolean;
  results: {
    aria?: ReturnType<typeof validateAriaAttributes>;
    keyboard?: Awaited<ReturnType<typeof testKeyboardNavigation>>;
    screenReader?: ReturnType<typeof validateScreenReaderSupport>;
    colorContrast?: ReturnType<typeof validateColorContrast>;
  };
  recommendations: string[];
}> => {
  const {
    checkAria = true,
    checkKeyboard = true,
    checkScreenReader = true,
    checkColorContrast = true,
  } = options;

  const results: {
    aria?: ReturnType<typeof validateAriaAttributes>;
    keyboard?: Awaited<ReturnType<typeof testKeyboardNavigation>>;
    screenReader?: ReturnType<typeof validateScreenReaderSupport>;
    colorContrast?: ReturnType<typeof validateColorContrast>;
  } = {};
  const recommendations: string[] = [];
  let totalScore = 0;
  let maxScore = 0;

  const container = component.container;
  const interactiveElements = getFocusableElements(container);

  // ARIA属性の検証
  if (checkAria && interactiveElements.length > 0) {
    const ariaResults = interactiveElements.map((element) =>
      validateAriaAttributes(element, {}),
    );
    results.aria = {
      isValid: ariaResults.every((r) => r.isValid),
      errors: ariaResults.flatMap((r) => r.errors),
    };
    if (results.aria.isValid) totalScore += 25;
    maxScore += 25;
    recommendations.push(...results.aria.errors);
  }

  // キーボードナビゲーションの検証
  if (checkKeyboard) {
    results.keyboard = await testKeyboardNavigation(component);
    if (results.keyboard.success) totalScore += 25;
    maxScore += 25;
    recommendations.push(...results.keyboard.errors);
  }

  // スクリーンリーダー対応の検証
  if (checkScreenReader && interactiveElements.length > 0) {
    const screenReaderResults = interactiveElements.map((element) =>
      validateScreenReaderSupport(element),
    );
    const avgScore =
      screenReaderResults.reduce((sum, r) => sum + r.score, 0) /
      screenReaderResults.length;
    results.screenReader = {
      isValid: avgScore >= 70,
      score: avgScore,
      recommendations: screenReaderResults.flatMap((r) => r.recommendations),
    };
    if (results.screenReader.isValid) totalScore += 25;
    maxScore += 25;
    recommendations.push(...results.screenReader.recommendations);
  }

  // カラーコントラストの検証
  if (checkColorContrast) {
    const textElements = Array.from(container.querySelectorAll("*")).filter(
      (el) => {
        const style = window.getComputedStyle(el);
        return (
          style.color && el.textContent && el.textContent.trim().length > 0
        );
      },
    );

    if (textElements.length > 0) {
      const contrastResults = textElements.map((element) =>
        validateColorContrast(element),
      );
      results.colorContrast = {
        isValid: contrastResults.every((r) => r.isValid),
        ratio: null,
        recommendation:
          contrastResults.length > 0
            ? contrastResults[0].recommendation
            : "No color contrast data available",
      };
      if (results.colorContrast?.isValid) totalScore += 25;
      maxScore += 25;
      recommendations.push(
        ...contrastResults
          .map((r) => r.recommendation)
          .filter((r) => !r.includes("meets")),
      );
    }
  }

  const finalScore =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  return {
    score: finalScore,
    isAccessible: finalScore >= 80, // 80%以上で合格
    results,
    recommendations: [...new Set(recommendations)], // 重複を除去
  };
};
