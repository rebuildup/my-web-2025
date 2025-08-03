/**
 * MarkdownEditor Component Tests
 * Tests for markdown editor with embed syntax support, toolbar, and validation
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach } from "node:test";
import React from "react";
import { MarkdownEditor } from "../MarkdownEditor";

// Mock media data for testing
const mockMediaData = {
  images: ["/image1.jpg", "/image2.png", "/image3.gif"],
  videos: [
    {
      type: "youtube",
      url: "https://youtu.be/dQw4w9WgXcQ",
      title: "Test Video 1",
      description: "A test video",
    },
    {
      type: "vimeo",
      url: "https://vimeo.com/123456789",
      title: "Test Video 2",
    },
  ],
  externalLinks: [
    {
      type: "github",
      url: "https://github.com/test/repo",
      title: "GitHub Repo",
      description: "Test repository",
    },
    {
      type: "demo",
      url: "https://demo.example.com",
      title: "Live Demo",
    },
  ],
};

describe("MarkdownEditor", () => {
  const defaultProps = {
    content: "",
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Functionality", () => {
    it("should render with default props", () => {
      render(<MarkdownEditor {...defaultProps} />);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Enter your markdown content/),
      ).toBeInTheDocument();
    });

    it("should display initial content", () => {
      const content = "# Test Content\n\nThis is a test.";
      render(<MarkdownEditor {...defaultProps} content={content} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(content);
    });

    it("should call onChange when content changes", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(<MarkdownEditor {...defaultProps} onChange={mockOnChange} />);

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Hello World");

      expect(mockOnChange).toHaveBeenCalledWith("Hello World");
    });

    it("should update content when prop changes", () => {
      const { rerender } = render(
        <MarkdownEditor {...defaultProps} content="Initial" />,
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("Initial");

      rerender(<MarkdownEditor {...defaultProps} content="Updated" />);

      expect(textarea).toHaveValue("Updated");
    });
  });

  describe("Toolbar Functionality", () => {
    it("should render toolbar with preview toggle by default", () => {
      render(<MarkdownEditor {...defaultProps} />);

      // Check for preview toggle button
      expect(screen.getByTitle(/Toggle Preview/)).toBeInTheDocument();
    });

    it("should hide toolbar when toolbar prop is false", () => {
      render(<MarkdownEditor {...defaultProps} toolbar={false} />);

      expect(screen.queryByTitle(/Toggle Preview/)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/Italic/)).not.toBeInTheDocument();
    });
  });

  describe("Preview Functionality", () => {
    it("should show preview toggle button by default", () => {
      render(<MarkdownEditor {...defaultProps} />);

      expect(screen.getByTitle(/Toggle Preview/)).toBeInTheDocument();
    });

    it("should hide preview toggle when preview prop is false", () => {
      render(<MarkdownEditor {...defaultProps} preview={false} />);

      expect(screen.queryByTitle(/Toggle Preview/)).not.toBeInTheDocument();
    });

    it("should toggle between edit and preview modes", async () => {
      const user = userEvent.setup();
      const content = "# Test Heading\n\nThis is **bold** text.";

      render(<MarkdownEditor {...defaultProps} content={content} />);

      const previewButton = screen.getByTitle(/Toggle Preview/);

      // Initially in edit mode
      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(previewButton).toHaveTextContent("Preview");

      // Switch to preview mode
      await user.click(previewButton);

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(previewButton).toHaveTextContent("Edit");
      expect(screen.getByText("Test Heading")).toBeInTheDocument();
    });

    it("should render markdown in preview mode", async () => {
      const user = userEvent.setup();
      const content = "# Test Heading\n\nThis is **bold** text.";

      render(<MarkdownEditor {...defaultProps} content={content} />);

      const previewButton = screen.getByTitle(/Toggle Preview/);
      await user.click(previewButton);

      expect(screen.getByText("Test Heading")).toBeInTheDocument();
      expect(screen.getByText(/This is/)).toBeInTheDocument();
      expect(screen.getByText("bold")).toBeInTheDocument();
    });
  });

  describe("Save Functionality", () => {
    it("should show save button when onSave and filePath are provided", () => {
      const mockOnSave = jest.fn();

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={mockOnSave}
          filePath="/test.md"
        />,
      );

      expect(screen.getByTitle(/Save File/)).toBeInTheDocument();
    });

    it("should hide save button when onSave is not provided", () => {
      render(<MarkdownEditor {...defaultProps} filePath="/test.md" />);

      expect(screen.queryByTitle(/Save File/)).not.toBeInTheDocument();
    });

    it("should call onSave when save button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn().mockResolvedValue(undefined);
      const content = "Test content";

      render(
        <MarkdownEditor
          {...defaultProps}
          content={content}
          onSave={mockOnSave}
          filePath="/test.md"
        />,
      );

      const saveButton = screen.getByTitle(/Save File/);
      await user.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledWith(content, "/test.md");
    });

    it("should show saving status during save operation", async () => {
      const user = userEvent.setup();
      let resolveSave: () => void;
      const mockOnSave = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveSave = resolve;
          }),
      );

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={mockOnSave}
          filePath="/test.md"
        />,
      );

      const saveButton = screen.getByTitle(/Save File/);
      await user.click(saveButton);

      expect(screen.getByText("Saving...")).toBeInTheDocument();
      expect(saveButton).toBeDisabled();

      // Resolve the save operation
      resolveSave!();

      await waitFor(() => {
        expect(screen.getByText("✓ Saved")).toBeInTheDocument();
      });
    });

    it("should show error status when save fails", async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn().mockRejectedValue(new Error("Save failed"));

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={mockOnSave}
          filePath="/test.md"
        />,
      );

      const saveButton = screen.getByTitle(/Save File/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("✗ Error")).toBeInTheDocument();
        expect(screen.getByText("Error: Save failed")).toBeInTheDocument();
      });
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should handle Ctrl+S for save", async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn().mockResolvedValue(undefined);

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={mockOnSave}
          filePath="/test.md"
        />,
      );

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.keyboard("{Control>}s{/Control}");

      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  describe("Status Bar", () => {
    it("should show content statistics", () => {
      const content = "Line 1\nLine 2\nLine 3";
      render(<MarkdownEditor {...defaultProps} content={content} />);

      expect(screen.getByText("Lines: 3")).toBeInTheDocument();
      expect(screen.getByText("Characters: 20")).toBeInTheDocument();
      expect(screen.getByText("Words: 6")).toBeInTheDocument();
    });

    it("should show file path when provided", () => {
      render(<MarkdownEditor {...defaultProps} filePath="/path/to/test.md" />);

      expect(screen.getByText("File: test.md")).toBeInTheDocument();
    });

    it("should update statistics when content changes", async () => {
      const user = userEvent.setup();

      render(<MarkdownEditor {...defaultProps} />);

      expect(screen.getByText("Lines: 1")).toBeInTheDocument();
      expect(screen.getByText("Characters: 0")).toBeInTheDocument();

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Hello\nWorld");

      expect(screen.getByText("Lines: 2")).toBeInTheDocument();
      expect(screen.getByText("Characters: 11")).toBeInTheDocument();
      expect(screen.getByText("Words: 2")).toBeInTheDocument();
    });
  });

  describe("Line Numbers", () => {
    it("should display line numbers", () => {
      const content = "Line 1\nLine 2\nLine 3";
      render(<MarkdownEditor {...defaultProps} content={content} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should update line numbers when content changes", async () => {
      const user = userEvent.setup();

      render(<MarkdownEditor {...defaultProps} content="Line 1" />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.queryByText("2")).not.toBeInTheDocument();

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "\nLine 2");

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should clear error when content changes", async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn().mockRejectedValue(new Error("Save failed"));

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={mockOnSave}
          filePath="/test.md"
        />,
      );

      // Trigger save error
      const saveButton = screen.getByTitle(/Save File/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Error: Save failed")).toBeInTheDocument();
      });

      // Change content should clear error
      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "New content");

      expect(screen.queryByText("Error: Save failed")).not.toBeInTheDocument();
    });

    it("should handle malformed embed syntax", async () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          embedSupport={true}
          mediaData={mockMediaData}
        />,
      );

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "![image:abc]" } }); // Non-numeric index

      await waitFor(() => {
        expect(screen.getByText("Embed Syntax Errors")).toBeInTheDocument();
        expect(
          screen.getByText(/Embed syntax requires a numeric index/),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", () => {
      render(<MarkdownEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAttribute("spellCheck", "false");
      expect(textarea).toHaveAttribute(
        "placeholder",
        "Enter your markdown content here...",
      );
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      render(<MarkdownEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);

      expect(textarea).toHaveFocus();

      // Tab should move focus (exact target may vary)
      await user.tab();
      expect(document.activeElement).not.toBe(textarea);
    });

    it("should have proper button titles for screen readers", () => {
      render(<MarkdownEditor {...defaultProps} />);

      expect(screen.getByTitle("Toggle Preview")).toBeInTheDocument();
    });
  });
});
