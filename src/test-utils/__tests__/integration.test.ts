/**
 * テストユーティリティの統合テスト
 */

import { render } from "@testing-library/react";
import React from "react";
import { testUtils } from "../index";

// テスト用コンポーネント
const SimpleComponent: React.FC = () => {
  return React.createElement(
    "div",
    {
      "data-testid": "simple-component",
    },
    "Hello World",
  );
};

describe("Test Utils Integration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("testUtils object", () => {
    it("should have all expected utilities", () => {
      expect(testUtils).toHaveProperty("setupTest");
      expect(testUtils).toHaveProperty("teardownTest");
      expect(testUtils).toHaveProperty("setupTestSuite");
      expect(testUtils).toHaveProperty("renderWithWrapper");
      expect(testUtils).toHaveProperty("createMockUser");
      expect(testUtils).toHaveProperty("createMockPortfolioItem");
      expect(testUtils).toHaveProperty("createMockApiResponse");
      expect(testUtils).toHaveProperty("createMockRouter");
      expect(testUtils).toHaveProperty("setupAllMocks");
      expect(testUtils).toHaveProperty("auditAccessibility");
      expect(testUtils).toHaveProperty("validateAriaAttributes");
      expect(testUtils).toHaveProperty("testKeyboardNavigation");
      expect(testUtils).toHaveProperty("measureRenderPerformance");
      expect(testUtils).toHaveProperty("auditPerformance");
      expect(testUtils).toHaveProperty("detectMemoryLeaks");
      expect(testUtils).toHaveProperty("testApiRoute");
      expect(testUtils).toHaveProperty("runApiTestSuite");
      expect(testUtils).toHaveProperty("auditApi");
    });

    it("should have functions as expected types", () => {
      expect(typeof testUtils.setupTest).toBe("function");
      expect(typeof testUtils.teardownTest).toBe("function");
      expect(typeof testUtils.renderWithWrapper).toBe("function");
      expect(typeof testUtils.createMockUser).toBe("function");
      expect(typeof testUtils.createMockPortfolioItem).toBe("function");
      expect(typeof testUtils.createMockApiResponse).toBe("function");
      expect(typeof testUtils.setupAllMocks).toBe("function");
    });
  });

  describe("Mock factories integration", () => {
    it("should create mock user with expected structure", () => {
      const user = testUtils.createMockUser();

      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("role");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("updatedAt");

      expect(typeof user.id).toBe("string");
      expect(typeof user.name).toBe("string");
      expect(typeof user.email).toBe("string");
      expect(["admin", "user", "guest"]).toContain(user.role);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should create mock portfolio item with expected structure", () => {
      const item = testUtils.createMockPortfolioItem();

      expect(item).toHaveProperty("id");
      expect(item).toHaveProperty("title");
      expect(item).toHaveProperty("description");
      expect(item).toHaveProperty("category");
      expect(item).toHaveProperty("tags");
      expect(item).toHaveProperty("imageUrl");
      expect(item).toHaveProperty("createdAt");
      expect(item).toHaveProperty("featured");

      expect(typeof item.id).toBe("string");
      expect(typeof item.title).toBe("string");
      expect(typeof item.description).toBe("string");
      expect(typeof item.category).toBe("string");
      expect(Array.isArray(item.tags)).toBe(true);
      expect(typeof item.imageUrl).toBe("string");
      expect(item.createdAt).toBeInstanceOf(Date);
      expect(typeof item.featured).toBe("boolean");
    });

    it("should create mock API response with expected structure", () => {
      const response = testUtils.createMockApiResponse({ test: "data" });

      expect(response).toHaveProperty("success");
      expect(response).toHaveProperty("data");
      expect(response).toHaveProperty("statusCode");
      expect(response).toHaveProperty("message");

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ test: "data" });
      expect(response.statusCode).toBe(200);
      expect(typeof response.message).toBe("string");
    });

    it("should create mock router with expected methods", () => {
      const router = testUtils.createMockRouter();

      expect(router).toHaveProperty("push");
      expect(router).toHaveProperty("replace");
      expect(router).toHaveProperty("back");
      expect(router).toHaveProperty("forward");
      expect(router).toHaveProperty("refresh");
      expect(router).toHaveProperty("prefetch");
      expect(router).toHaveProperty("pathname");
      expect(router).toHaveProperty("query");
      expect(router).toHaveProperty("asPath");
      expect(router).toHaveProperty("route");

      expect(typeof router.push).toBe("function");
      expect(typeof router.replace).toBe("function");
      expect(typeof router.back).toBe("function");
      expect(typeof router.forward).toBe("function");
      expect(typeof router.refresh).toBe("function");
      expect(typeof router.prefetch).toBe("function");
    });
  });

  describe("Render utilities integration", () => {
    it("should render component with wrapper", () => {
      const result = testUtils.renderWithWrapper(
        React.createElement(SimpleComponent),
      );

      expect(
        result.container.querySelector('[data-testid="test-wrapper"]'),
      ).toBeInTheDocument();
      expect(result.getByTestId("simple-component")).toBeInTheDocument();
      expect(result.getByText("Hello World")).toBeInTheDocument();
    });
  });

  describe("Setup and teardown integration", () => {
    it("should setup and teardown without errors", () => {
      expect(() => {
        testUtils.setupTest({
          enableMocks: true,
          enablePerformanceTracking: false,
          enableMemoryTracking: false,
        });
      }).not.toThrow();

      expect(() => {
        testUtils.teardownTest({
          enableMocks: true,
          enablePerformanceTracking: false,
          enableMemoryTracking: false,
        });
      }).not.toThrow();
    });

    it("should setup all mocks without errors", () => {
      expect(() => {
        const { cleanup } = testUtils.setupAllMocks();
        expect(typeof cleanup).toBe("function");
        cleanup();
      }).not.toThrow();
    });
  });

  describe("Performance utilities integration", () => {
    it("should measure render performance", async () => {
      const result = await testUtils.measureRenderPerformance(() => {
        return render(React.createElement(SimpleComponent));
      });

      expect(result).toHaveProperty("renderTime");
      expect(result).toHaveProperty("memoryUsage");
      expect(result).toHaveProperty("componentCount");
      expect(result).toHaveProperty("domNodeCount");
      expect(result).toHaveProperty("reRenderCount");

      expect(typeof result.renderTime).toBe("number");
      expect(result.renderTime).toBeGreaterThanOrEqual(0);
      expect(typeof result.componentCount).toBe("number");
      expect(typeof result.domNodeCount).toBe("number");
      expect(result.reRenderCount).toBe(1);
    });
  });

  describe("Accessibility utilities integration", () => {
    it("should validate ARIA attributes", () => {
      const { container } = render(
        React.createElement(
          "button",
          {
            "aria-label": "Test button",
            role: "button",
          },
          "Click me",
        ),
      );

      const button = container.querySelector("button")!;
      const result = testUtils.validateAriaAttributes(button, {
        "aria-label": "Test button",
        role: "button",
      });

      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("errors");
      expect(result.isValid).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should audit accessibility", async () => {
      const component = render(
        React.createElement(
          "div",
          null,
          React.createElement(
            "button",
            { "aria-label": "Test button" },
            "Click me",
          ),
          React.createElement("input", { "aria-label": "Test input" }),
        ),
      );

      const result = await testUtils.auditAccessibility(component, {
        checkAria: true,
        checkKeyboard: true,
        checkScreenReader: true,
        checkColorContrast: false, // Skip color contrast for this test
      });

      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("isAccessible");
      expect(result).toHaveProperty("results");
      expect(result).toHaveProperty("recommendations");

      expect(typeof result.score).toBe("number");
      expect(typeof result.isAccessible).toBe("boolean");
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
});
