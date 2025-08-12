import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AccessibleIconButton, AccessibleTooltip } from "../AccessibleTooltip";

// Mock timer functions
jest.useFakeTimers();

describe("AccessibleTooltip", () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it("should render children correctly", () => {
    render(
      <AccessibleTooltip content="Tooltip content">
        <button>Hover me</button>
      </AccessibleTooltip>,
    );

    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("should show tooltip on mouse enter after delay", async () => {
    render(
      <AccessibleTooltip content="Tooltip content" delay={100}>
        <button>Hover me</button>
      </AccessibleTooltip>,
    );

    const button = screen.getByText("Hover me");

    // Tooltip should not be visible initially
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();

    // Hover over button
    fireEvent.mouseEnter(button);

    // Tooltip should not be visible immediately
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(100);

    // Tooltip should now be visible
    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });
  });

  it("should hide tooltip on mouse leave", async () => {
    render(
      <AccessibleTooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </AccessibleTooltip>,
    );

    const button = screen.getByText("Hover me");

    // Show tooltip
    fireEvent.mouseEnter(button);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });

    // Hide tooltip
    fireEvent.mouseLeave(button);

    await waitFor(() => {
      expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
    });
  });

  it("should show tooltip on focus", async () => {
    render(
      <AccessibleTooltip content="Tooltip content" delay={0}>
        <button>Focus me</button>
      </AccessibleTooltip>,
    );

    const button = screen.getByText("Focus me");

    // Focus button
    fireEvent.focus(button);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });
  });

  it("should hide tooltip on blur", async () => {
    render(
      <AccessibleTooltip content="Tooltip content" delay={0}>
        <button>Focus me</button>
      </AccessibleTooltip>,
    );

    const button = screen.getByText("Focus me");

    // Show tooltip
    fireEvent.focus(button);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });

    // Hide tooltip
    fireEvent.blur(button);

    await waitFor(() => {
      expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
    });
  });

  it("should position tooltip correctly", async () => {
    const { rerender } = render(
      <AccessibleTooltip content="Tooltip content" position="top" delay={0}>
        <button>Hover me</button>
      </AccessibleTooltip>,
    );

    const button = screen.getByText("Hover me");
    fireEvent.mouseEnter(button);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      const tooltip = screen.getByText("Tooltip content");
      expect(tooltip.parentElement).toHaveClass("bottom-full");
    });

    // Test bottom position
    rerender(
      <AccessibleTooltip content="Tooltip content" position="bottom" delay={0}>
        <button>Hover me</button>
      </AccessibleTooltip>,
    );

    fireEvent.mouseEnter(button);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      const tooltip = screen.getByText("Tooltip content");
      expect(tooltip.parentElement).toHaveClass("top-full");
    });
  });

  it("should have proper ARIA attributes", async () => {
    render(
      <AccessibleTooltip content="Tooltip content" delay={0}>
        <button>Hover me</button>
      </AccessibleTooltip>,
    );

    const button = screen.getByText("Hover me");

    // Button should have describedby attribute
    expect(button).toHaveAttribute("aria-describedby");

    // Show tooltip
    fireEvent.mouseEnter(button);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      const tooltip = screen.getByText("Tooltip content");
      expect(tooltip).toHaveAttribute("role", "tooltip");
      expect(tooltip).toHaveAttribute("id");

      // The ID should match the aria-describedby
      const tooltipId = tooltip.getAttribute("id");
      expect(button).toHaveAttribute("aria-describedby", tooltipId);
    });
  });

  it("should apply custom className", async () => {
    render(
      <AccessibleTooltip
        content="Tooltip content"
        className="custom-tooltip"
        delay={0}
      >
        <button>Hover me</button>
      </AccessibleTooltip>,
    );

    const button = screen.getByText("Hover me");
    fireEvent.mouseEnter(button);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      const tooltip = screen.getByText("Tooltip content");
      expect(tooltip.parentElement).toHaveClass("custom-tooltip");
    });
  });

  it("should cancel tooltip show on quick mouse leave", () => {
    render(
      <AccessibleTooltip content="Tooltip content" delay={500}>
        <button>Hover me</button>
      </AccessibleTooltip>,
    );

    const button = screen.getByText("Hover me");

    // Start hover
    fireEvent.mouseEnter(button);

    // Leave before delay completes
    fireEvent.mouseLeave(button);

    // Fast-forward past delay
    jest.advanceTimersByTime(500);

    // Tooltip should not appear
    expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
  });

  it("should handle Escape key to hide tooltip", async () => {
    render(
      <AccessibleTooltip content="Tooltip content" delay={0}>
        <button>Focus me</button>
      </AccessibleTooltip>,
    );

    const button = screen.getByText("Focus me");

    // Show tooltip
    fireEvent.focus(button);
    jest.advanceTimersByTime(0);

    await waitFor(() => {
      expect(screen.getByText("Tooltip content")).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(button, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByText("Tooltip content")).not.toBeInTheDocument();
    });
  });
});

describe("AccessibleIconButton", () => {
  const MockIcon = () => <span data-testid="mock-icon">Icon</span>;

  it("should render icon button with label", () => {
    render(<AccessibleIconButton icon={<MockIcon />} label="Save document" />);

    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save document" }),
    ).toBeInTheDocument();
  });

  it("should handle click events", () => {
    const handleClick = jest.fn();

    render(
      <AccessibleIconButton
        icon={<MockIcon />}
        label="Save document"
        onClick={handleClick}
      />,
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(
      <AccessibleIconButton
        icon={<MockIcon />}
        label="Save document"
        disabled
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveClass("opacity-50");
  });

  it("should apply variant styling", () => {
    render(
      <AccessibleIconButton
        icon={<MockIcon />}
        label="Delete item"
        variant="danger"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("text-red-600", "hover:bg-red-50");
  });

  it("should apply size styling", () => {
    render(
      <AccessibleIconButton
        icon={<MockIcon />}
        label="Large button"
        size="lg"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("p-3");
  });

  it("should show tooltip with label on hover", async () => {
    render(
      <AccessibleIconButton
        icon={<MockIcon />}
        label="Save document"
        showTooltip
      />,
    );

    const button = screen.getByRole("button");

    // Hover over button
    fireEvent.mouseEnter(button);
    jest.advanceTimersByTime(500); // Default tooltip delay

    await waitFor(() => {
      expect(screen.getByText("Save document")).toBeInTheDocument();
    });
  });

  it("should not show tooltip when showTooltip is false", () => {
    render(
      <AccessibleIconButton
        icon={<MockIcon />}
        label="Save document"
        showTooltip={false}
      />,
    );

    const button = screen.getByRole("button");

    // Hover over button
    fireEvent.mouseEnter(button);
    jest.advanceTimersByTime(500);

    // Tooltip should not appear
    expect(screen.queryByText("Save document")).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(
      <AccessibleIconButton
        icon={<MockIcon />}
        label="Custom button"
        className="custom-icon-button"
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveClass("custom-icon-button");
  });

  it("should handle keyboard events", () => {
    const handleClick = jest.fn();

    render(
      <AccessibleIconButton
        icon={<MockIcon />}
        label="Keyboard button"
        onClick={handleClick}
      />,
    );

    const button = screen.getByRole("button");

    // Test Enter key
    fireEvent.keyDown(button, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test Space key
    fireEvent.keyDown(button, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("should have proper accessibility attributes", () => {
    render(
      <AccessibleIconButton icon={<MockIcon />} label="Accessible button" />,
    );

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Accessible button");
    expect(button).toHaveAttribute("type", "button");
  });
});
