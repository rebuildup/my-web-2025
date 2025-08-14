import { render, screen } from "@testing-library/react";
import React from "react";

// Mock the advanced cache utils
jest.mock("@/lib/advanced-cache-utils", () => ({
  AdvancedBrowserCacheManager: {
    getInstance: jest.fn(() => ({
      diagnoseCacheState: jest.fn().mockResolvedValue({
        cacheState: {
          serviceWorkers: 0,
          localStorage: 0,
          sessionStorage: 0,
          caches: [],
          indexedDBs: [],
          cookies: 0,
          performance: true,
        },
        recommendations: [],
      }),
      detectBrowserInfo: jest.fn().mockResolvedValue({
        browser: "Chrome",
        version: "120.0.0.0",
        platform: "Windows",
        isIncognito: false,
        issues: [],
        solutions: [],
      }),
    })),
  },
  clearAllBrowserCaches: jest.fn().mockResolvedValue({
    serviceWorkers: 0,
    localStorage: true,
    sessionStorage: true,
    indexedDB: 0,
    cacheAPI: 0,
    cookies: 0,
    performance: true,
    memory: true,
    errors: [],
  }),
  diagnoseBrowserCache: jest.fn().mockResolvedValue({
    browser: "Chrome",
    version: "120.0.0.0",
    platform: "Windows",
    isIncognito: false,
    issues: [],
    solutions: [],
  }),
}));

// Import the component AFTER setting up mocks
import AdvancedCacheClearPanel from "../AdvancedCacheClearPanel";

describe("AdvancedCacheClearPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the component", () => {
    render(<AdvancedCacheClearPanel />);

    // Just check that the component renders without crashing
    expect(
      screen.getByText(/高度なキャッシュクリア管理パネル/),
    ).toBeInTheDocument();
  });

  it("should display the main title", () => {
    render(<AdvancedCacheClearPanel />);

    expect(
      screen.getAllByText("🧹 高度なキャッシュクリア管理パネル")[0],
    ).toBeInTheDocument();
  });

  it("should display the description", () => {
    render(<AdvancedCacheClearPanel />);

    expect(
      screen.getAllByText(
        "全ブラウザ（通常・シークレットモード）対応の完全キャッシュクリア機能",
      )[0],
    ).toBeInTheDocument();
  });

  it("should display usage instructions", () => {
    render(<AdvancedCacheClearPanel />);

    expect(screen.getAllByText(/使用方法/)[0]).toBeInTheDocument();
  });

  it("should display command line information", () => {
    render(<AdvancedCacheClearPanel />);

    expect(screen.getAllByText(/コマンドライン版/)[0]).toBeInTheDocument();
  });
});
