// import { createMockProps } from "@/test-utils/mock-factories";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { ComponentName } from "../ComponentName";

// アクセシビリティテストの拡張
expect.extend(toHaveNoViolations);

describe("ComponentName", () => {
  // デフォルトプロパティ
  const defaultProps = {}; // createMockProps();

  // 基本レンダリングテスト
  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<ComponentName {...defaultProps} />);
      expect(screen.getByRole("...")).toBeInTheDocument();
    });

    it("should render with custom props", () => {
      const customProps = { ...defaultProps, customProp: "custom value" };
      render(<ComponentName {...customProps} />);
      expect(screen.getByText("custom value")).toBeInTheDocument();
    });

    it("should render loading state", () => {
      const loadingProps = { ...defaultProps, isLoading: true };
      render(<ComponentName {...loadingProps} />);
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should render error state", () => {
      const errorProps = { ...defaultProps, error: "Test error" };
      render(<ComponentName {...errorProps} />);
      expect(screen.getByText("Test error")).toBeInTheDocument();
    });
  });

  // プロパティテスト
  describe("Props", () => {
    it("should handle required props correctly", () => {
      const requiredProps = { requiredProp: "required value" };
      render(<ComponentName {...requiredProps} />);
      expect(screen.getByText("required value")).toBeInTheDocument();
    });

    it("should use default values for optional props", () => {
      render(<ComponentName />);
      // デフォルト値の検証
    });

    it("should validate prop types", () => {
      // TypeScriptで型チェックされるが、ランタイム検証も必要な場合
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      render(<ComponentName invalidProp="invalid" />);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  // イベントハンドリングテスト
  describe("Event Handling", () => {
    it("should call onClick handler when clicked", async () => {
      const user = userEvent.setup();
      const mockOnClick = jest.fn();
      render(<ComponentName {...defaultProps} onClick={mockOnClick} />);

      await user.click(screen.getByRole("button"));
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("should call onChange handler with correct value", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      render(<ComponentName {...defaultProps} onChange={mockOnChange} />);

      await user.type(screen.getByRole("textbox"), "new value");
      expect(mockOnChange).toHaveBeenCalledWith("new value");
    });

    it("should handle keyboard events", async () => {
      const user = userEvent.setup();
      const mockOnKeyDown = jest.fn();
      render(<ComponentName {...defaultProps} onKeyDown={mockOnKeyDown} />);

      await user.keyboard("{Enter}");
      expect(mockOnKeyDown).toHaveBeenCalledWith(
        expect.objectContaining({ key: "Enter" }),
      );
    });
  });

  // 状態管理テスト
  describe("State Management", () => {
    it("should update internal state correctly", async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Toggle" }));

      await waitFor(() => {
        expect(screen.getByText("Toggled State")).toBeInTheDocument();
      });
    });

    it("should reset state when props change", () => {
      const { rerender } = render(<ComponentName {...defaultProps} />);

      // 状態変更
      fireEvent.click(screen.getByRole("button", { name: "Change State" }));

      // プロパティ変更で状態リセット
      rerender(<ComponentName {...defaultProps} resetTrigger={true} />);

      expect(screen.queryByText("Changed State")).not.toBeInTheDocument();
    });
  });

  // 副作用テスト
  describe("Side Effects", () => {
    it("should call useEffect on mount", () => {
      const mockEffect = jest.fn();
      render(<ComponentName {...defaultProps} onMount={mockEffect} />);
      expect(mockEffect).toHaveBeenCalledTimes(1);
    });

    it("should cleanup on unmount", () => {
      const mockCleanup = jest.fn();
      const { unmount } = render(
        <ComponentName {...defaultProps} onUnmount={mockCleanup} />,
      );

      unmount();
      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });
  });

  // アクセシビリティテスト
  describe("Accessibility", () => {
    it("should have no accessibility violations", async () => {
      const { container } = render(<ComponentName {...defaultProps} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);
      const element = screen.getByRole("button");

      await user.tab();
      expect(element).toHaveFocus();
    });

    it("should have proper ARIA attributes", () => {
      render(<ComponentName {...defaultProps} />);
      const element = screen.getByRole("button");

      expect(element).toHaveAttribute("aria-label");
      expect(element).toHaveAttribute("aria-describedby");
    });
  });

  // エラーハンドリングテスト
  describe("Error Handling", () => {
    it("should handle errors gracefully", () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      render(<ComponentName {...defaultProps} shouldThrowError={true} />);

      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      consoleSpy.mockRestore();
    });

    it("should recover from errors", async () => {
      const user = userEvent.setup();
      render(<ComponentName {...defaultProps} />);

      // エラー状態にする
      await user.click(screen.getByRole("button", { name: "Trigger Error" }));
      expect(screen.getByText("Error occurred")).toBeInTheDocument();

      // 回復
      await user.click(screen.getByRole("button", { name: "Retry" }));
      expect(screen.queryByText("Error occurred")).not.toBeInTheDocument();
    });
  });
});
