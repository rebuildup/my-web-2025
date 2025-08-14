/**
 * テストヘルパー関数のテスト
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import {
  measureTestPerformance,
  mockLocalStorage,
  mockMediaQuery,
  renderWithWrapper,
  setViewportSize,
  simulateKeyboardEvent,
  simulateMouseEvent,
  validateTestData,
  waitForCondition,
} from "../test-helpers";

// テスト用コンポーネント
const TestComponent: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return React.createElement(
    "button",
    {
      onClick,
      "data-testid": "test-button",
    },
    "Test Button",
  );
};

describe("Test Helpers", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("renderWithWrapper", () => {
    it("should render component with wrapper", () => {
      const result = renderWithWrapper(React.createElement(TestComponent));

      expect(
        result.container.querySelector('[data-testid="test-wrapper"]'),
      ).toBeInTheDocument();
      expect(screen.getByTestId("test-button")).toBeInTheDocument();
    });
  });

  describe("simulateKeyboardEvent", () => {
    it("should simulate keyboard events", () => {
      const { container } = render(React.createElement(TestComponent));
      const button = container.querySelector("button")!;

      const eventSpy = jest.fn();
      button.addEventListener("keydown", eventSpy);

      simulateKeyboardEvent(button, "Enter");

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: "Enter",
          code: "Enter",
          bubbles: true,
        }),
      );
    });
  });

  describe("simulateMouseEvent", () => {
    it("should simulate mouse events", () => {
      const { container } = render(React.createElement(TestComponent));
      const button = container.querySelector("button")!;

      const eventSpy = jest.fn();
      button.addEventListener("click", eventSpy);

      simulateMouseEvent(button, "click");

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "click",
          bubbles: true,
          cancelable: true,
        }),
      );
    });
  });

  describe("setViewportSize", () => {
    it("should set viewport size", () => {
      const originalInnerWidth = window.innerWidth;
      const originalInnerHeight = window.innerHeight;

      setViewportSize(1024, 768);

      expect(window.innerWidth).toBe(1024);
      expect(window.innerHeight).toBe(768);

      // Restore original values
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: originalInnerWidth,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: originalInnerHeight,
      });
    });
  });

  describe("mockMediaQuery", () => {
    it("should mock media query", () => {
      const mockMatchMedia = mockMediaQuery("(min-width: 768px)", true);

      const result = window.matchMedia("(min-width: 768px)");
      expect(result.matches).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith("(min-width: 768px)");
    });
  });

  describe("mockLocalStorage", () => {
    it("should mock localStorage", () => {
      const storage = mockLocalStorage({ key1: "value1" });

      expect(storage.getItem("key1")).toBe("value1");
      expect(storage.getItem("nonexistent")).toBeNull();

      storage.setItem("key2", "value2");
      expect(storage.getItem("key2")).toBe("value2");

      storage.removeItem("key1");
      expect(storage.getItem("key1")).toBeNull();

      storage.clear();
      expect(storage.getItem("key2")).toBeNull();
    });
  });

  describe("measureTestPerformance", () => {
    it("should measure test performance", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const result = measureTestPerformance(() => {
        return "test result";
      }, "test function");

      expect(result).toBe("test result");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Test "test function" took'),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("validateTestData", () => {
    it("should validate test data against schema", () => {
      const data = {
        name: "John",
        age: 30,
        email: "john@example.com",
      };

      const schema = {
        name: (value: unknown) => typeof value === "string",
        age: (value: unknown) => typeof value === "number" && value > 0,
        email: (value: unknown) =>
          typeof value === "string" && value.includes("@"),
      };

      expect(validateTestData(data, schema)).toBe(true);

      const invalidData = {
        name: 123,
        age: -5,
        email: "invalid-email",
      };

      expect(validateTestData(invalidData, schema)).toBe(false);
    });

    it("should return false for non-object data", () => {
      expect(validateTestData("string", {})).toBe(false);
      expect(validateTestData(null, {})).toBe(false);
      expect(validateTestData(undefined, {})).toBe(false);
    });
  });

  describe("waitForCondition", () => {
    it("should wait for condition to be true", async () => {
      let counter = 0;
      const condition = () => {
        counter++;
        return counter >= 3;
      };

      await expect(
        waitForCondition(condition, 1000, 10),
      ).resolves.toBeUndefined();
      expect(counter).toBeGreaterThanOrEqual(3);
    });

    it("should timeout if condition is never met", async () => {
      const condition = () => false;

      await expect(waitForCondition(condition, 100, 10)).rejects.toThrow(
        "Condition not met within 100ms",
      );
    });
  });
});
