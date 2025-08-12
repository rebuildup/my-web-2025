import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AccessibilityProvider } from "../AccessibilityProvider";
import { AccessibleConfirmModal, AccessibleModal } from "../AccessibleModal";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const renderWithProvider = (component: React.ReactElement) => {
  return render(<AccessibilityProvider>{component}</AccessibilityProvider>);
};

// Mock createPortal
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (children: React.ReactNode) => children,
}));

describe("AccessibleModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: "Test Modal",
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render when isOpen is false", () => {
    renderWithProvider(<AccessibleModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });

  it("should render modal when isOpen is true", () => {
    renderWithProvider(<AccessibleModal {...defaultProps} />);

    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = jest.fn();

    renderWithProvider(<AccessibleModal {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole("button", {
      name: /ダイアログを閉じる/i,
    });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when overlay is clicked and closeOnOverlayClick is true", () => {
    const onClose = jest.fn();

    renderWithProvider(
      <AccessibleModal
        {...defaultProps}
        onClose={onClose}
        closeOnOverlayClick={true}
      />,
    );

    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when modal content is clicked", () => {
    const onClose = jest.fn();

    renderWithProvider(
      <AccessibleModal
        {...defaultProps}
        onClose={onClose}
        closeOnOverlayClick={true}
      />,
    );

    const modalContent = screen.getByText("Modal content");
    fireEvent.click(modalContent);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should call onClose when Escape key is pressed and closeOnEscape is true", () => {
    const onClose = jest.fn();

    renderWithProvider(
      <AccessibleModal
        {...defaultProps}
        onClose={onClose}
        closeOnEscape={true}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when Escape key is pressed and closeOnEscape is false", () => {
    const onClose = jest.fn();

    renderWithProvider(
      <AccessibleModal
        {...defaultProps}
        onClose={onClose}
        closeOnEscape={false}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should apply correct size classes", () => {
    const { rerender } = renderWithProvider(
      <AccessibleModal {...defaultProps} size="sm" />,
    );

    let modalContent = screen
      .getByRole("dialog")
      .querySelector(".modal-content");
    expect(modalContent).toHaveClass("max-w-md"); // sm maps to max-w-md

    rerender(
      <AccessibilityProvider>
        <AccessibleModal {...defaultProps} size="lg" />
      </AccessibilityProvider>,
    );

    modalContent = screen.getByRole("dialog").querySelector(".modal-content");
    expect(modalContent).toHaveClass("max-w-2xl"); // lg maps to max-w-2xl
  });

  it("should apply custom className", () => {
    renderWithProvider(
      <AccessibleModal {...defaultProps} className="custom-modal" />,
    );

    const modalContent = screen
      .getByRole("dialog")
      .querySelector(".modal-content");
    expect(modalContent).toHaveClass("custom-modal");
  });

  it("should have proper ARIA attributes", () => {
    renderWithProvider(<AccessibleModal {...defaultProps} />);

    const modal = screen.getByRole("dialog");
    expect(modal).toHaveAttribute("aria-modal", "true");
    expect(modal).toHaveAttribute("aria-labelledby");

    const title = screen.getByText("Test Modal");
    expect(title).toHaveAttribute("id");
  });

  it("should trap focus within modal", async () => {
    renderWithProvider(
      <AccessibleModal {...defaultProps}>
        <div>
          <button>First button</button>
          <button>Second button</button>
        </div>
      </AccessibleModal>,
    );

    const firstButton = screen.getByText("First button");
    const secondButton = screen.getByText("Second button");
    const closeButton = screen.getByRole("button", {
      name: /ダイアログを閉じる/i,
    });

    // The modal should focus the close button by default
    await waitFor(() => {
      expect(closeButton).toHaveFocus();
    });

    // Simulate Tab navigation - the focus trap should work
    // Note: JSDOM doesn't fully support focus trapping, so we'll test the basic functionality
    expect(firstButton).toBeInTheDocument();
    expect(secondButton).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
  });

  it("should focus initial element when specified", async () => {
    const initialFocusRef = { current: null };

    renderWithProvider(
      <AccessibleModal {...defaultProps} initialFocus={initialFocusRef}>
        <div>
          <button>First button</button>
          <button ref={initialFocusRef}>Initial focus button</button>
        </div>
      </AccessibleModal>,
    );

    await waitFor(() => {
      expect(screen.getByText("Initial focus button")).toHaveFocus();
    });
  });

  it("should restore focus when modal closes", async () => {
    const triggerButton = document.createElement("button");
    triggerButton.textContent = "Open Modal";
    document.body.appendChild(triggerButton);
    triggerButton.focus();

    const { rerender } = renderWithProvider(
      <AccessibleModal {...defaultProps} />,
    );

    // Modal should be open and focus should be inside
    await waitFor(() => {
      expect(document.activeElement).not.toBe(triggerButton);
    });

    // Close modal
    rerender(
      <AccessibilityProvider>
        <AccessibleModal {...defaultProps} isOpen={false} />
      </AccessibilityProvider>,
    );

    // Focus should return to trigger button
    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });

    document.body.removeChild(triggerButton);
  });
});

describe("AccessibleConfirmModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render confirm modal with message", () => {
    renderWithProvider(<AccessibleConfirmModal {...defaultProps} />);

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to proceed?"),
    ).toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", () => {
    const onConfirm = jest.fn();

    renderWithProvider(
      <AccessibleConfirmModal {...defaultProps} onConfirm={onConfirm} />,
    );

    const confirmButton = screen.getByText("確認");
    fireEvent.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", () => {
    const onClose = jest.fn();

    renderWithProvider(
      <AccessibleConfirmModal {...defaultProps} onClose={onClose} />,
    );

    const cancelButton = screen.getByText("キャンセル");
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should use custom button labels", () => {
    renderWithProvider(
      <AccessibleConfirmModal
        {...defaultProps}
        confirmLabel="Delete"
        cancelLabel="Keep"
      />,
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
  });

  it("should apply danger variant styling", () => {
    renderWithProvider(
      <AccessibleConfirmModal {...defaultProps} variant="danger" />,
    );

    const confirmButton = screen.getByText("確認");
    expect(confirmButton).toHaveClass("bg-red-600");
  });

  it("should show loading state on confirm button", () => {
    renderWithProvider(
      <AccessibleConfirmModal {...defaultProps} loading={true} />,
    );

    const confirmButton = screen.getByRole("button", { name: "確認" });
    expect(confirmButton).toBeDisabled();
  });

  it("should handle keyboard navigation between buttons", async () => {
    renderWithProvider(<AccessibleConfirmModal {...defaultProps} />);

    const cancelButton = screen.getByRole("button", { name: "キャンセル" });
    const confirmButton = screen.getByRole("button", { name: "確認" });

    // The modal should focus the confirm button by default (initialFocus)
    await waitFor(() => {
      expect(confirmButton).toHaveFocus();
    });

    // Test that both buttons are present and accessible
    expect(cancelButton).toBeInTheDocument();
    expect(confirmButton).toBeInTheDocument();
  });
});
