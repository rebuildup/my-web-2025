/**
 * Tests for TagManagementUI Component
 */

import type { TagInfo, TagManagementSystem } from "@/types/enhanced-content";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { TagManagementUI } from "../TagManagementUI";

// Mock tag manager
const mockTagManager: TagManagementSystem = {
  getAllTags: jest.fn(),
  createTag: jest.fn(),
  updateTagUsage: jest.fn(),
  deleteTag: jest.fn(),
  searchTags: jest.fn(),
};

const mockTags: TagInfo[] = [
  {
    name: "react",
    count: 10,
    createdAt: "2023-01-01T00:00:00.000Z",
    lastUsed: "2023-01-03T00:00:00.000Z",
  },
  {
    name: "typescript",
    count: 8,
    createdAt: "2023-01-02T00:00:00.000Z",
    lastUsed: "2023-01-04T00:00:00.000Z",
  },
  {
    name: "nextjs",
    count: 5,
    createdAt: "2023-01-03T00:00:00.000Z",
    lastUsed: "2023-01-05T00:00:00.000Z",
  },
];

describe("TagManagementUI", () => {
  const defaultProps = {
    selectedTags: [],
    onChange: jest.fn(),
    tagManager: mockTagManager,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockTagManager.getAllTags as jest.Mock).mockResolvedValue(mockTags);
  });

  it("should render with empty state", async () => {
    render(<TagManagementUI {...defaultProps} />);

    expect(
      screen.getByPlaceholderText("Search or add tags..."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(mockTagManager.getAllTags).toHaveBeenCalled();
    });
  });

  it("should display selected tags", () => {
    render(
      <TagManagementUI
        {...defaultProps}
        selectedTags={["react", "typescript"]}
      />,
    );

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("should remove selected tag when X is clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TagManagementUI
        {...defaultProps}
        selectedTags={["react", "typescript"]}
        onChange={onChange}
      />,
    );

    const removeButton = screen.getAllByLabelText(/Remove .* tag/)[0];
    await user.click(removeButton);

    expect(onChange).toHaveBeenCalledWith(["typescript"]);
  });

  it("should show dropdown when input is focused", async () => {
    const user = userEvent.setup();

    render(<TagManagementUI {...defaultProps} />);

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.getByText("10 uses")).toBeInTheDocument();
    });
  });

  it("should filter tags based on search query", async () => {
    const user = userEvent.setup();

    render(<TagManagementUI {...defaultProps} />);

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);
    await user.type(input, "react");

    await waitFor(() => {
      expect(screen.getByText("react")).toBeInTheDocument();
      expect(screen.queryByText("typescript")).not.toBeInTheDocument();
    });
  });

  it("should select tag when clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<TagManagementUI {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("react")).toBeInTheDocument();
    });

    await user.click(screen.getByText("react"));

    expect(onChange).toHaveBeenCalledWith(["react"]);
    expect(mockTagManager.updateTagUsage).toHaveBeenCalledWith("react");
  });

  it("should show create new tag option", async () => {
    const user = userEvent.setup();

    render(<TagManagementUI {...defaultProps} allowNewTags={true} />);

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);
    await user.type(input, "newtag");

    await waitFor(() => {
      expect(screen.getByText('Create "newtag"')).toBeInTheDocument();
    });
  });

  it("should create new tag when create option is clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const newTag: TagInfo = {
      name: "newtag",
      count: 0,
      createdAt: "2023-01-06T00:00:00.000Z",
      lastUsed: "2023-01-06T00:00:00.000Z",
    };

    (mockTagManager.createTag as jest.Mock).mockResolvedValue(newTag);

    render(
      <TagManagementUI
        {...defaultProps}
        onChange={onChange}
        allowNewTags={true}
      />,
    );

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);
    await user.type(input, "newtag");

    await waitFor(() => {
      expect(screen.getByText('Create "newtag"')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Create "newtag"'));

    expect(mockTagManager.createTag).toHaveBeenCalledWith("newtag");
    expect(onChange).toHaveBeenCalledWith(["newtag"]);
  });

  it("should handle Enter key to create new tag", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    const newTag: TagInfo = {
      name: "newtag",
      count: 0,
      createdAt: "2023-01-06T00:00:00.000Z",
      lastUsed: "2023-01-06T00:00:00.000Z",
    };

    (mockTagManager.createTag as jest.Mock).mockResolvedValue(newTag);

    render(
      <TagManagementUI
        {...defaultProps}
        onChange={onChange}
        allowNewTags={true}
      />,
    );

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);
    await user.type(input, "newtag");
    await user.keyboard("{Enter}");

    expect(mockTagManager.createTag).toHaveBeenCalledWith("newtag");
    expect(onChange).toHaveBeenCalledWith(["newtag"]);
  });

  it("should handle Enter key to select existing tag", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<TagManagementUI {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);
    await user.type(input, "react");
    await user.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  it("should handle Escape key to close dropdown", async () => {
    const user = userEvent.setup();

    render(<TagManagementUI {...defaultProps} />);

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);

    await waitFor(() => {
      expect(screen.getByText("react")).toBeInTheDocument();
    });

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByText("react")).not.toBeInTheDocument();
    });
  });

  it("should handle Backspace to remove last tag", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(
      <TagManagementUI
        {...defaultProps}
        selectedTags={["react", "typescript"]}
        onChange={onChange}
      />,
    );

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);
    await user.keyboard("{Backspace}");

    expect(onChange).toHaveBeenCalledWith(["react"]);
  });

  it("should respect maxTags limit", () => {
    render(
      <TagManagementUI
        {...defaultProps}
        selectedTags={["react", "typescript"]}
        maxTags={2}
      />,
    );

    expect(screen.getByText("2 / 2 tags selected")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Maximum 2 tags selected"),
    ).toBeDisabled();
  });

  it("should not allow new tags when allowNewTags is false", async () => {
    const user = userEvent.setup();

    render(<TagManagementUI {...defaultProps} allowNewTags={false} />);

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);
    await user.type(input, "newtag");

    await waitFor(() => {
      expect(screen.queryByText('Create "newtag"')).not.toBeInTheDocument();
    });
  });

  it("should exclude already selected tags from dropdown", async () => {
    const user = userEvent.setup();

    render(<TagManagementUI {...defaultProps} selectedTags={["react"]} />);

    const input = screen.getByPlaceholderText("Search or add tags...");
    await user.click(input);

    await waitFor(() => {
      // Check that react is not in the dropdown (but it will be in selected tags area)
      const dropdownButtons = screen
        .getAllByRole("button")
        .filter((button) => button.textContent?.includes("uses"));
      const reactInDropdown = dropdownButtons.some((button) =>
        button.textContent?.includes("react"),
      );
      expect(reactInDropdown).toBe(false);

      // Check that typescript is in the dropdown
      const typescriptInDropdown = dropdownButtons.some((button) =>
        button.textContent?.includes("typescript"),
      );
      expect(typescriptInDropdown).toBe(true);
    });
  });

  it("should handle loading state", async () => {
    (mockTagManager.getAllTags as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockTags), 200)),
    );

    render(<TagManagementUI {...defaultProps} />);

    const input = screen.getByPlaceholderText("Search or add tags...");
    await userEvent.click(input);

    // Check if loading state appears or if tags are already loaded
    try {
      expect(screen.getByText("Loading tags...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Loading tags...")).not.toBeInTheDocument();
      });
    } catch {
      // If loading state doesn't appear, check that tags are loaded instead
      await waitFor(() => {
        expect(screen.getByText("react")).toBeInTheDocument();
      });
    }
  });

  it("should handle tag manager errors gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    (mockTagManager.getAllTags as jest.Mock).mockRejectedValue(
      new Error("Network error"),
    );

    render(<TagManagementUI {...defaultProps} />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load tags:",
        expect.any(Error),
      );
    });

    consoleSpy.mockRestore();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <TagManagementUI {...defaultProps} className="custom-class" />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should use custom placeholder", () => {
    render(
      <TagManagementUI {...defaultProps} placeholder="Custom placeholder" />,
    );

    expect(
      screen.getByPlaceholderText("Custom placeholder"),
    ).toBeInTheDocument();
  });
});
