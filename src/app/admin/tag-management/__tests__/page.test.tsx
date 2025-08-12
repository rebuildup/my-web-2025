import { fireEvent, render, screen } from "@testing-library/react";
import TagManagementPage from "../page";

// Mock the TagManagementUI component
jest.mock("@/components/ui/TagManagementUI", () => ({
  TagManagementUI: ({
    selectedTags,
    onChange,
    maxTags,
    allowNewTags,
    placeholder,
    className,
  }: {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
    maxTags: number;
    allowNewTags: boolean;
    placeholder: string;
    className: string;
  }) => (
    <div data-testid="tag-management-ui" className={className}>
      <div data-testid="selected-tags-count">{selectedTags.length}</div>
      <div data-testid="max-tags">{maxTags}</div>
      <div data-testid="allow-new-tags">{allowNewTags ? "true" : "false"}</div>
      <input data-testid="tag-input" placeholder={placeholder} />
      <div data-testid="selected-tags">
        {selectedTags.map((tag: string, index: number) => (
          <span key={index} data-testid="selected-tag">
            {tag}
            <button
              onClick={() =>
                onChange(selectedTags.filter((_, i: number) => i !== index))
              }
            >
              Remove
            </button>
          </span>
        ))}
      </div>
    </div>
  ),
}));

// Mock the client tag manager
jest.mock("@/lib/portfolio/client-tag-manager", () => ({
  clientTagManager: {
    getAllTags: jest.fn().mockResolvedValue(["tag1", "tag2", "tag3"]),
    addTag: jest.fn(),
    removeTag: jest.fn(),
  },
}));

describe("TagManagementPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("component rendering", () => {
    it("should render main layout and title", () => {
      render(<TagManagementPage />);

      expect(screen.getByText("Tag Management UI Demo")).toBeInTheDocument();
      expect(screen.getByText("Controls")).toBeInTheDocument();
      expect(screen.getByText("Tag Management")).toBeInTheDocument();
    });

    it("should render controls section", () => {
      render(<TagManagementPage />);

      expect(screen.getByText("Max Tags")).toBeInTheDocument();
      expect(screen.getByText("Allow New Tags")).toBeInTheDocument();
      expect(screen.getByText("Clear Tags")).toBeInTheDocument();
    });

    it("should render TagManagementUI component", () => {
      render(<TagManagementPage />);

      expect(screen.getByTestId("tag-management-ui")).toBeInTheDocument();
      expect(screen.getByTestId("tag-input")).toBeInTheDocument();
    });

    it("should render selected tags display section", () => {
      render(<TagManagementPage />);

      expect(screen.getByText("Selected Tags")).toBeInTheDocument();
      expect(screen.getByText("No tags selected")).toBeInTheDocument();
    });

    it("should render usage instructions", () => {
      render(<TagManagementPage />);

      expect(screen.getByText("Usage Instructions")).toBeInTheDocument();
      expect(
        screen.getByText(/Click the input field to see available tags/),
      ).toBeInTheDocument();
    });
  });

  describe("max tags control", () => {
    it("should have default max tags value", () => {
      render(<TagManagementPage />);

      expect(screen.getByTestId("max-tags")).toHaveTextContent("10");
      expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    });

    it("should update max tags when input changes", () => {
      render(<TagManagementPage />);

      const maxTagsInput = screen.getByDisplayValue("10");
      fireEvent.change(maxTagsInput, { target: { value: "15" } });

      expect(screen.getByTestId("max-tags")).toHaveTextContent("15");
    });
  });

  describe("allow new tags control", () => {
    it("should have default allow new tags value", () => {
      render(<TagManagementPage />);

      expect(screen.getByTestId("allow-new-tags")).toHaveTextContent("true");
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("should toggle allow new tags when checkbox is clicked", () => {
      render(<TagManagementPage />);

      const allowNewTagsCheckbox = screen.getByRole("checkbox");
      expect(screen.getByTestId("allow-new-tags")).toHaveTextContent("true");

      fireEvent.click(allowNewTagsCheckbox);
      expect(screen.getByTestId("allow-new-tags")).toHaveTextContent("false");
    });
  });

  describe("clear tags functionality", () => {
    it("should clear all selected tags when clear button is clicked", () => {
      render(<TagManagementPage />);

      const clearButton = screen.getByText("Clear Tags");
      fireEvent.click(clearButton);

      expect(screen.getByTestId("selected-tags-count")).toHaveTextContent("0");
    });
  });

  describe("selected tags display", () => {
    it("should show no tags selected message initially", () => {
      render(<TagManagementPage />);

      expect(screen.getByText("No tags selected")).toBeInTheDocument();
    });
  });

  describe("TagManagementUI props", () => {
    it("should pass correct props to TagManagementUI", () => {
      render(<TagManagementPage />);

      expect(screen.getByTestId("tag-management-ui")).toHaveClass("max-w-2xl");
      expect(screen.getByTestId("tag-input")).toHaveAttribute(
        "placeholder",
        "Search or add tags...",
      );
      expect(screen.getByTestId("max-tags")).toHaveTextContent("10");
      expect(screen.getByTestId("allow-new-tags")).toHaveTextContent("true");
    });
  });

  describe("responsive design", () => {
    it("should have responsive grid classes", () => {
      render(<TagManagementPage />);

      const controlsGrid = screen.getByDisplayValue("10").closest(".grid");
      expect(controlsGrid).toHaveClass("grid-cols-1", "md:grid-cols-3");
    });

    it("should have proper container classes", () => {
      render(<TagManagementPage />);

      const container = screen
        .getByText("Tag Management UI Demo")
        .closest(".max-w-4xl");
      expect(container).toHaveClass("max-w-4xl", "mx-auto", "px-4");
    });
  });

  describe("accessibility", () => {
    it("should have proper form labels", () => {
      render(<TagManagementPage />);

      expect(screen.getByText("Max Tags")).toBeInTheDocument();
      expect(screen.getByText("Allow New Tags")).toBeInTheDocument();
    });

    it("should have proper button text", () => {
      render(<TagManagementPage />);

      expect(
        screen.getByRole("button", { name: "Clear Tags" }),
      ).toBeInTheDocument();
    });

    it("should have proper input attributes", () => {
      render(<TagManagementPage />);

      const maxTagsInput = screen.getByDisplayValue("10");
      expect(maxTagsInput).toHaveAttribute("type", "number");
      expect(maxTagsInput).toHaveAttribute("min", "1");
      expect(maxTagsInput).toHaveAttribute("max", "20");
    });
  });
});
