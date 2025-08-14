/**
 * SortControls Component Tests
 * Tests for the responsive button sizing fix (Task 4)
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { SortOptions } from "../AllGalleryClient";
import { SortControls } from "../SortControls";

describe("SortControls", () => {
  const mockOnSortChange = jest.fn();

  const defaultSort: SortOptions = {
    sortBy: "updatedAt",
    sortOrder: "desc",
  };

  beforeEach(() => {
    mockOnSortChange.mockClear();
  });

  it("renders sort controls with icon-only button styling", () => {
    render(<SortControls sort={defaultSort} onSortChange={mockOnSortChange} />);

    // Check that the sort order button exists
    const sortButton = screen.getByRole("button", { name: /sort descending/i });
    expect(sortButton).toBeInTheDocument();

    // Check that the button has proper styling for icon-only display
    expect(sortButton).toHaveClass("flex", "items-center", "justify-center");
    expect(sortButton).toHaveClass("px-2", "sm:px-3");
    expect(sortButton).toHaveClass("border", "border-foreground");
  });

  it("displays correct icon for descending order", () => {
    render(<SortControls sort={defaultSort} onSortChange={mockOnSortChange} />);

    const sortButton = screen.getByRole("button", { name: /sort descending/i });
    expect(sortButton).toBeInTheDocument();
    // Check that the button contains an icon (ArrowDown)
    expect(sortButton.querySelector("svg")).toBeInTheDocument();
  });

  it("displays correct icon for ascending order", () => {
    const ascendingSort: SortOptions = {
      sortBy: "updatedAt",
      sortOrder: "asc",
    };

    render(
      <SortControls sort={ascendingSort} onSortChange={mockOnSortChange} />,
    );

    const sortButton = screen.getByRole("button", { name: /sort ascending/i });
    expect(sortButton).toBeInTheDocument();
    // Check that the button contains an icon (ArrowUp)
    expect(sortButton.querySelector("svg")).toBeInTheDocument();
  });

  it("toggles sort order when button is clicked", () => {
    render(<SortControls sort={defaultSort} onSortChange={mockOnSortChange} />);

    const sortButton = screen.getByRole("button", { name: /sort descending/i });
    fireEvent.click(sortButton);

    expect(mockOnSortChange).toHaveBeenCalledWith({
      sortBy: "updatedAt",
      sortOrder: "asc",
    });
  });

  it("has proper button styling for icon-only display", () => {
    render(<SortControls sort={defaultSort} onSortChange={mockOnSortChange} />);

    const sortButton = screen.getByRole("button", { name: /sort descending/i });
    expect(sortButton).toHaveClass("flex", "items-center", "justify-center");
    expect(sortButton).toHaveClass("px-2", "sm:px-3", "py-2");
  });

  it("has responsive container layout", () => {
    const { container } = render(
      <SortControls sort={defaultSort} onSortChange={mockOnSortChange} />,
    );

    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass("flex", "flex-col", "sm:flex-row");
    expect(mainContainer).toHaveClass("sm:items-center", "sm:justify-between");
    expect(mainContainer).toHaveClass("gap-4");
  });

  it("displays sort description with responsive text", () => {
    render(<SortControls sort={defaultSort} onSortChange={mockOnSortChange} />);

    const description = screen.getByText(
      /sorted by updated date \(descending\)/i,
    );
    expect(description).toHaveClass("text-xs", "sm:text-sm");
  });
});
