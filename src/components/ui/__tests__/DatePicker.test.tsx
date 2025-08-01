/**
 * DatePicker Component Tests
 * Tests for the date selection UI component implementation
 */

import type { DatePickerProps } from "@/types/enhanced-content";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { DatePicker } from "../DatePicker";

// Mock the lucide-react icons
jest.mock("lucide-react", () => ({
  Calendar: ({ className }: { className?: string }) => (
    <div data-testid="calendar-icon" className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <div data-testid="clock-icon" className={className} />
  ),
  ToggleLeft: ({ className }: { className?: string }) => (
    <div data-testid="toggle-left-icon" className={className} />
  ),
  ToggleRight: ({ className }: { className?: string }) => (
    <div data-testid="toggle-right-icon" className={className} />
  ),
}));

describe("DatePicker Component", () => {
  const defaultProps: DatePickerProps = {
    value: undefined,
    onChange: jest.fn(),
    useManualDate: false,
    onToggleManualDate: jest.fn(),
    placeholder: "Select date...",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with default props", () => {
    render(<DatePicker {...defaultProps} />);

    expect(screen.getByText("Date Setting")).toBeInTheDocument();
    expect(screen.getByText("Auto")).toBeInTheDocument();
  });

  it("should render with manual mode enabled", () => {
    render(<DatePicker {...defaultProps} useManualDate={true} />);

    expect(screen.getByText("Manual")).toBeInTheDocument();
    expect(screen.getByTestId("toggle-right-icon")).toBeInTheDocument();
  });

  it("should disable input in auto mode", () => {
    render(<DatePicker {...defaultProps} useManualDate={false} />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("should enable input in manual mode", () => {
    render(<DatePicker {...defaultProps} useManualDate={true} />);

    const input = screen.getByRole("textbox");
    expect(input).not.toBeDisabled();
  });

  it("should show calendar when calendar icon is clicked", async () => {
    const user = userEvent.setup();

    render(<DatePicker {...defaultProps} useManualDate={true} />);

    const calendarButton = screen.getByLabelText("Open calendar");
    await user.click(calendarButton);

    expect(screen.getByText("Today")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("should handle valid date input", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <DatePicker {...defaultProps} useManualDate={true} onChange={onChange} />,
    );

    const input = screen.getByRole("textbox");
    await user.clear(input);

    // Use paste instead of type to avoid intermediate calls
    await user.click(input);
    await user.paste("2023/12/25");

    // Check that onChange was called with the expected date
    expect(onChange).toHaveBeenCalledWith(expect.stringMatching(/2023-12-25/));
  });
});
