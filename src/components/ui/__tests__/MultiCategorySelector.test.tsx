import type { EnhancedCategoryType } from "@/types/enhanced-content";
import { fireEvent, render, screen } from "@testing-library/react";
import { MultiCategorySelector } from "../MultiCategorySelector";

describe("MultiCategorySelector", () => {
  const mockOnChange = jest.fn();
  const availableCategories: EnhancedCategoryType[] = [
    "develop",
    "video",
    "design",
    "video&design",
    "other",
  ];

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it("renders all available categories", () => {
    render(
      <MultiCategorySelector
        selectedCategories={[]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    expect(screen.getByText("Development")).toBeInTheDocument();
    expect(screen.getByText("Video")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
    expect(screen.getByText("Video & Design")).toBeInTheDocument();
  });

  it("shows selected categories with check marks", () => {
    render(
      <MultiCategorySelector
        selectedCategories={["develop", "video"]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    // Check that selected categories show check marks
    expect(screen.getAllByText("Development")).toHaveLength(2); // Button and summary
    expect(screen.getAllByText("Video")).toHaveLength(2); // Button and summary

    // Check for selected state in summary
    expect(screen.getByText(/2.*selected/)).toBeInTheDocument();
  });

  it("calls onChange when category is selected", () => {
    render(
      <MultiCategorySelector
        selectedCategories={[]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    const developCategory = screen.getByText("Development").closest("button");
    fireEvent.click(developCategory!);

    expect(mockOnChange).toHaveBeenCalledWith(["develop"]);
  });

  it("calls onChange when category is deselected", () => {
    render(
      <MultiCategorySelector
        selectedCategories={["develop", "video"]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    // Find the category button (not the tag in summary)
    const categoryCards = screen.getAllByText("Development");
    const developCategory = categoryCards[0].closest("button");
    fireEvent.click(developCategory!);

    expect(mockOnChange).toHaveBeenCalledWith(["video"]);
  });

  it("respects maxSelections limit", () => {
    render(
      <MultiCategorySelector
        selectedCategories={["develop", "video"]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
        maxSelections={2}
      />,
    );

    const designCategory = screen.getByText("Design").closest("div");
    fireEvent.click(designCategory!);

    // Design button should be disabled when max selections reached
    const designButton = screen.getByText("Design").closest("button");
    expect(designButton).toBeDisabled();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("shows help panel when help button is clicked", () => {
    render(
      <MultiCategorySelector
        selectedCategories={[]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    const helpButton = screen.getByLabelText("Show category help");
    fireEvent.click(helpButton);

    expect(screen.getByText("Category Guidelines")).toBeInTheDocument();
    expect(screen.getByText(/Default is "Other"/)).toBeInTheDocument();
  });

  it("shows selection summary when categories are selected", () => {
    render(
      <MultiCategorySelector
        selectedCategories={["develop", "video"]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    expect(screen.getByText("Selected Categories")).toBeInTheDocument();
    expect(screen.getByText("Will appear in galleries:")).toBeInTheDocument();
    // Check for the text content in a more flexible way
    const galleryText = screen.getByText("Will appear in galleries:");
    const parentElement = galleryText.parentElement;
    expect(parentElement?.textContent).toContain("All, Development, Video");
  });

  it("shows special message for Other category selection", () => {
    render(
      <MultiCategorySelector
        selectedCategories={["other"]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    expect(
      screen.getByText("All gallery only (Other category)"),
    ).toBeInTheDocument();
  });

  it("hides Other category when showOtherOption is false", () => {
    render(
      <MultiCategorySelector
        selectedCategories={[]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
        showOtherOption={false}
      />,
    );

    expect(screen.queryByText("Other")).not.toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(
      <MultiCategorySelector
        selectedCategories={[]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
        disabled={true}
      />,
    );

    const developCategory = screen.getByText("Development").closest("div");
    fireEvent.click(developCategory!);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("shows empty state when no categories are selected", () => {
    render(
      <MultiCategorySelector
        selectedCategories={[]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    expect(
      screen.getByText("No specific categories selected"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Item will appear in "Other" category/),
    ).toBeInTheDocument();
  });

  it("allows removing categories from selection summary", () => {
    render(
      <MultiCategorySelector
        selectedCategories={["develop", "video"]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    // Find the remove button for the Development category in the summary
    const removeButton = screen.getByLabelText("Remove Development category");

    fireEvent.click(removeButton);

    expect(mockOnChange).toHaveBeenCalledWith(["video"]);
  });

  it("shows selection count", () => {
    render(
      <MultiCategorySelector
        selectedCategories={["develop", "video"]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
        maxSelections={3}
      />,
    );

    expect(screen.getByText("2 selected / 3")).toBeInTheDocument();
  });

  it("shows warning indicator for Other category", () => {
    render(
      <MultiCategorySelector
        selectedCategories={[]}
        onChange={mockOnChange}
        availableCategories={availableCategories}
      />,
    );

    expect(
      screen.getByText(/Item will appear in.*Other.*category/),
    ).toBeInTheDocument();
  });
});
