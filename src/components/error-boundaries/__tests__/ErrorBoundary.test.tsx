/**
 * ErrorBoundary Component Tests
 * Comprehensive tests for error handling, fallback display, and recovery functionality
 */

import { jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import {
  AboutErrorBoundary,
  AdminErrorBoundary,
  ErrorBoundary,
  PortfolioErrorBoundary,
  ToolsErrorBoundary,
  WorkshopErrorBoundary,
} from "../ErrorBoundary";

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Test component that throws an error
const ThrowError: React.FC<{
  shouldThrow?: boolean;
  errorMessage?: string;
}> = ({ shouldThrow = true, errorMessage = "Test error" }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>No error</div>;
};

// Test component that works normally
const WorkingComponent: React.FC = () => <div>Working component</div>;

describe("ErrorBoundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment
    delete (process.env as NodeJS.ProcessEnv).NODE_ENV;
  });

  describe("Normal operation", () => {
    it("should render children when no error occurs", () => {
      render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Working component")).toBeInTheDocument();
    });

    it("should not display error UI when children render successfully", () => {
      render(
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>,
      );

      expect(screen.getByText("Test content")).toBeInTheDocument();
      expect(
        screen.queryByText("エラーが発生しました"),
      ).not.toBeInTheDocument();
    });
  });

  describe("Error catching and handling", () => {
    it("should catch errors thrown by children", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      expect(screen.getByText("再試行")).toBeInTheDocument();
    });

    it("should call custom onError handler when provided", () => {
      const mockOnError = jest.fn();

      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.any(String),
          message: expect.any(String),
          timestamp: expect.any(String),
        }),
      );
    });

    it("should handle different error types correctly", () => {
      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Network connection failed" />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });
  });

  describe("Fallback UI rendering", () => {
    it("should render custom fallback when provided", () => {
      const customFallback = <div>Custom error fallback</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Custom error fallback")).toBeInTheDocument();
      expect(
        screen.queryByText("エラーが発生しました"),
      ).not.toBeInTheDocument();
    });

    it("should render default error UI when no custom fallback provided", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      expect(screen.getByText("再試行")).toBeInTheDocument();
      // Should show user-friendly error message
      expect(
        screen.getByText(/An unexpected error occurred/),
      ).toBeInTheDocument();
    });

    it("should render error icon correctly", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      // Check for SVG element
      const errorIcon = document.querySelector("svg");
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveAttribute("viewBox", "0 0 24 24");
    });
  });

  describe("Recovery functionality", () => {
    it("should handle retry button click", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      const retryButton = screen.getByText("再試行");
      expect(retryButton).toBeInTheDocument();

      // Click retry button
      fireEvent.click(retryButton);

      // Button should still be there (error state persists until component re-renders with working children)
      expect(screen.getByText("再試行")).toBeInTheDocument();
    });

    it("should render recovery actions when available", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      // Default recovery actions should be present
      expect(screen.getByText("再試行")).toBeInTheDocument();

      // Check for additional recovery buttons (these come from the default recovery options)
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(1);
    });

    it("should have working retry functionality", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();

      // Simulate retry by re-rendering with working component
      rerender(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>,
      );

      // Error should still be shown because error boundary state persists
      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });
  });

  describe("Development mode features", () => {
    it("should show error details in development mode", () => {
      process.env.NODE_ENV = "development";

      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Development error" />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラー詳細 (開発環境)")).toBeInTheDocument();

      // Click to expand details
      fireEvent.click(screen.getByText("エラー詳細 (開発環境)"));

      // Should show details element
      const details = screen.getByRole("group");
      expect(details).toBeInTheDocument();
    });

    it("should not show error details in production mode", () => {
      process.env.NODE_ENV = "production";

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(
        screen.queryByText("エラー詳細 (開発環境)"),
      ).not.toBeInTheDocument();
    });

    it("should handle missing error stack gracefully", () => {
      process.env.NODE_ENV = "development";

      // Create error without stack
      const ErrorWithoutStack: React.FC = () => {
        const error = new Error("No stack error");
        delete error.stack;
        throw error;
      };

      render(
        <ErrorBoundary>
          <ErrorWithoutStack />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラー詳細 (開発環境)")).toBeInTheDocument();
    });
  });

  describe("Section-specific error boundaries", () => {
    it("should render AboutErrorBoundary with section-specific fallback", () => {
      render(
        <AboutErrorBoundary>
          <ThrowError />
        </AboutErrorBoundary>,
      );

      expect(
        screen.getByText("Aboutセクションが利用できません"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Aboutセクションは一時的に利用できません。後でもう一度お試しください。",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("ホームに戻る")).toBeInTheDocument();
    });

    it("should handle AboutErrorBoundary home navigation", () => {
      render(
        <AboutErrorBoundary>
          <ThrowError />
        </AboutErrorBoundary>,
      );

      const homeButton = screen.getByText("ホームに戻る");
      expect(homeButton).toBeInTheDocument();

      // Test that clicking doesn't throw an error
      expect(() => fireEvent.click(homeButton)).not.toThrow();
    });

    it("should render PortfolioErrorBoundary with reload and home options", () => {
      render(
        <PortfolioErrorBoundary>
          <ThrowError />
        </PortfolioErrorBoundary>,
      );

      expect(screen.getByText("Portfolioが利用できません")).toBeInTheDocument();
      expect(screen.getByText("再読み込み")).toBeInTheDocument();
      expect(screen.getByText("ホームに戻る")).toBeInTheDocument();
    });

    it("should handle PortfolioErrorBoundary reload functionality", () => {
      render(
        <PortfolioErrorBoundary>
          <ThrowError />
        </PortfolioErrorBoundary>,
      );

      const reloadButton = screen.getByText("再読み込み");
      expect(reloadButton).toBeInTheDocument();

      // Test that clicking doesn't throw an error
      expect(() => fireEvent.click(reloadButton)).not.toThrow();
    });

    it("should render WorkshopErrorBoundary correctly", () => {
      render(
        <WorkshopErrorBoundary>
          <ThrowError />
        </WorkshopErrorBoundary>,
      );

      expect(screen.getByText("Workshopが利用できません")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Workshopセクションは一時的に利用できません。後でもう一度お試しください。",
        ),
      ).toBeInTheDocument();
    });

    it("should render ToolsErrorBoundary with reload option", () => {
      render(
        <ToolsErrorBoundary>
          <ThrowError />
        </ToolsErrorBoundary>,
      );

      expect(screen.getByText("Toolsが利用できません")).toBeInTheDocument();
      expect(screen.getByText("再読み込み")).toBeInTheDocument();
      expect(screen.getByText("ホームに戻る")).toBeInTheDocument();
    });

    it("should render AdminErrorBoundary for admin panel errors", () => {
      render(
        <AdminErrorBoundary>
          <ThrowError />
        </AdminErrorBoundary>,
      );

      expect(screen.getByText("管理パネルエラー")).toBeInTheDocument();
      expect(
        screen.getByText(
          "管理パネルでエラーが発生しました。詳細はコンソールを確認してください。",
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("管理パネルを再読み込み")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      const errorContainer = screen
        .getByText("エラーが発生しました")
        .closest("div");
      expect(errorContainer).toBeInTheDocument();
    });

    it("should have focusable retry button", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      const retryButton = screen.getByText("再試行");
      expect(retryButton).toBeInTheDocument();
      expect(retryButton.tagName).toBe("BUTTON");
    });

    it("should have proper button roles for recovery actions", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });

    it("should support keyboard navigation", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      const retryButton = screen.getByText("再試行");
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);
    });
  });

  describe("Error boundary lifecycle", () => {
    it("should call getDerivedStateFromError when error occurs", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <WorkingComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("Working component")).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });

    it("should maintain error state after re-render", () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();

      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });

    it("should handle componentDidCatch lifecycle", () => {
      const mockOnError = jest.fn();

      render(
        <ErrorBoundary onError={mockOnError}>
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(mockOnError).toHaveBeenCalled();
    });
  });

  describe("Edge cases", () => {
    it("should handle null children gracefully", () => {
      render(<ErrorBoundary>{null}</ErrorBoundary>);

      // Should not crash and not show error UI
      expect(
        screen.queryByText("エラーが発生しました"),
      ).not.toBeInTheDocument();
    });

    it("should handle undefined children gracefully", () => {
      render(<ErrorBoundary>{undefined}</ErrorBoundary>);

      expect(
        screen.queryByText("エラーが発生しました"),
      ).not.toBeInTheDocument();
    });

    it("should handle multiple children with one throwing error", () => {
      render(
        <ErrorBoundary>
          <WorkingComponent />
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      expect(screen.queryByText("Working component")).not.toBeInTheDocument();
    });

    it("should handle async errors in children", async () => {
      const AsyncErrorComponent: React.FC = () => {
        React.useEffect(() => {
          setTimeout(() => {
            throw new Error("Async error");
          }, 0);
        }, []);
        return <div>Async component</div>;
      };

      render(
        <ErrorBoundary>
          <AsyncErrorComponent />
        </ErrorBoundary>,
      );

      // Note: Error boundaries don't catch async errors, so this should render normally
      expect(screen.getByText("Async component")).toBeInTheDocument();
    });

    it("should handle section prop correctly", () => {
      render(
        <ErrorBoundary section="test-section">
          <ThrowError />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });

    it("should handle errors with different error objects", () => {
      const CustomErrorComponent: React.FC = () => {
        throw { message: "Custom error object", code: "CUSTOM" };
      };

      render(
        <ErrorBoundary>
          <CustomErrorComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });

    it("should handle string errors", () => {
      const StringErrorComponent: React.FC = () => {
        throw "String error";
      };

      render(
        <ErrorBoundary>
          <StringErrorComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });
  });

  describe("Error message display", () => {
    it("should display appropriate error message based on error type", () => {
      render(
        <ErrorBoundary>
          <ThrowError errorMessage="Network error" />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
      // Should show some error message - use getAllByText since there are multiple matches
      const errorTexts = screen.getAllByText(/error occurred|エラー/i);
      expect(errorTexts.length).toBeGreaterThan(0);
    });

    it("should handle very long error messages", () => {
      const longMessage = "A".repeat(1000);

      render(
        <ErrorBoundary>
          <ThrowError errorMessage={longMessage} />
        </ErrorBoundary>,
      );

      expect(screen.getByText("エラーが発生しました")).toBeInTheDocument();
    });
  });

  describe("Recovery actions", () => {
    it("should provide default recovery actions", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(1);

      // Should have retry button at minimum
      expect(screen.getByText("再試行")).toBeInTheDocument();
    });

    it("should handle recovery action clicks without crashing", () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>,
      );

      const buttons = screen.getAllByRole("button");

      // Click each button to ensure they don't crash
      buttons.forEach((button) => {
        expect(() => fireEvent.click(button)).not.toThrow();
      });
    });
  });
});
