/**
 * テストユーティリティのエクスポート
 * 全ての共通テストヘルパーとユーティリティを統合
 */

// 基本的なテストヘルパー
export * from "./test-helpers";
export * from "./test-setup";
export * from "./test-wrapper";

// モックファクトリー
export * from "./browser-mocks";
export * from "./common-mocks";
export * from "./mock-factories";

// 専門的なテストヘルパー
export * from "./accessibility-helpers";
export * from "./api-test-helpers";
export * from "./performance-helpers";

// 便利な再エクスポート
export { jest } from "@jest/globals";
export {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor as waitForElement,
} from "@testing-library/react";

// 個別インポート
import {
  auditAccessibility,
  testKeyboardNavigation,
  validateAriaAttributes,
} from "./accessibility-helpers";
import { auditApi, runApiTestSuite, testApiRoute } from "./api-test-helpers";
import {
  createMockApiResponse,
  createMockPortfolioItem,
  createMockRouter,
  createMockUser,
  setupAllMocks,
} from "./mock-factories";
import {
  auditPerformance,
  detectMemoryLeaks,
  measureRenderPerformance,
} from "./performance-helpers";
import { renderWithWrapper } from "./test-helpers";
import { setupTest, setupTestSuite, teardownTest } from "./test-setup";

// デフォルトエクスポート（よく使用される関数をまとめて）
export const testUtils = {
  // セットアップ関数
  setupTest,
  teardownTest,
  setupTestSuite,

  // レンダリングヘルパー
  renderWithWrapper,

  // モックファクトリー
  createMockUser,
  createMockPortfolioItem,
  createMockApiResponse,
  createMockRouter,
  setupAllMocks,

  // アクセシビリティテスト
  auditAccessibility,
  validateAriaAttributes,
  testKeyboardNavigation,

  // パフォーマンステスト
  measureRenderPerformance,
  auditPerformance,
  detectMemoryLeaks,

  // APIテスト
  testApiRoute,
  runApiTestSuite,
  auditApi,
};
