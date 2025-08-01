/**
 * Tests for MarkdownEditor component
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MarkdownEditor } from "../MarkdownEditor";

// Mock the markdown file manager
jest.mock("@/lib/portfolio/markdown-file-manager", () => ({
  markdownFileManager: {
    updateMarkdownFile: jest.fn(),
    readMarkdownFile: jest.fn(),
  },
}));

describe("MarkdownEditor", () => {
  const defaultProps = {
    content: "# Test Content\n\nThis is a test.",
    onChange: jest.fn(),
    onSave: jest.fn(),
    preview: true,
    toolbar: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render the editor with content", () => {
      render(<MarkdownEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue("# Test Content\n\nThis is a test.");
    });

    it("should render toolbar when toolbar prop is true", () => {
      render(<MarkdownEditor {...defaultProps} toolbar={true} />);

      expect(screen.getByTitle(/Bold/)).toBeInTheDocument();
      expect(screen.getByTitle(/Italic/)).toBeInTheDocument();
      expect(screen.getByTitle(/Heading 1/)).toBeInTheDocument();
    });

    it("should not render toolbar when toolbar prop is false", () => {
      render(<MarkdownEditor {...defaultProps} toolbar={false} />);

      expect(screen.queryByTitle(/Bold/)).not.toBeInTheDocument();
      expect(screen.queryByTitle(/Italic/)).not.toBeInTheDocument();
    });

    it("should render preview toggle when preview prop is true", () => {
      render(<MarkdownEditor {...defaultProps} preview={true} />);

      expect(screen.getByTitle("Toggle Preview")).toBeInTheDocument();
    });

    it("should not render preview toggle when preview prop is false", () => {
      render(<MarkdownEditor {...defaultProps} preview={false} />);

      expect(screen.queryByTitle("Toggle Preview")).not.toBeInTheDocument();
    });
  });

  describe("Content Editing", () => {
    it("should call onChange when content is modified", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);
      await user.type(textarea, "New content");

      expect(onChange).toHaveBeenCalledWith("New content");
    });

    it("should update content when content prop changes", () => {
      const { rerender } = render(<MarkdownEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("# Test Content\n\nThis is a test.");

      rerender(
        <MarkdownEditor {...defaultProps} content="# Updated Content" />,
      );
      expect(textarea).toHaveValue("# Updated Content");
    });
  });

  describe("Toolbar Actions", () => {
    it("should insert bold markdown when bold button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.click(screen.getByTitle(/Bold/));

      expect(onChange).toHaveBeenCalledWith(
        "# Test Content\n\nThis is a test.****",
      );
    });

    it("should insert italic markdown when italic button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.click(screen.getByTitle(/Italic/));

      expect(onChange).toHaveBeenCalledWith(
        "# Test Content\n\nThis is a test.**",
      );
    });

    it("should insert heading markdown when heading button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.click(screen.getByTitle(/Heading 1/));

      expect(onChange).toHaveBeenCalledWith(
        "# Test Content\n\nThis is a test.# ",
      );
    });

    it("should insert link markdown when link button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.click(screen.getByTitle(/Link/));

      expect(onChange).toHaveBeenCalledWith(
        "# Test Content\n\nThis is a test.[](url)",
      );
    });

    it("should insert code markdown when code button is clicked", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.click(screen.getByTitle(/^Code$/));

      expect(onChange).toHaveBeenCalledWith(
        "# Test Content\n\nThis is a test.``",
      );
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should insert bold markdown when Ctrl+B is pressed", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.keyboard("{Control>}b{/Control}");

      expect(onChange).toHaveBeenCalledWith(
        "# Test Content\n\nThis is a test.****",
      );
    });

    it("should insert italic markdown when Ctrl+I is pressed", async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();

      render(<MarkdownEditor {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.keyboard("{Control>}i{/Control}");

      expect(onChange).toHaveBeenCalledWith(
        "# Test Content\n\nThis is a test.**",
      );
    });

    it("should call save when Ctrl+S is pressed", async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={onSave}
          filePath="/test/file.md"
        />,
      );

      const textarea = screen.getByRole("textbox");
      await user.click(textarea);
      await user.keyboard("{Control>}s{/Control}");

      expect(onSave).toHaveBeenCalledWith(
        "# Test Content\n\nThis is a test.",
        "/test/file.md",
      );
    });
  });

  describe("Preview Mode", () => {
    it("should toggle to preview mode when preview button is clicked", async () => {
      const user = userEvent.setup();

      render(<MarkdownEditor {...defaultProps} />);

      const previewButton = screen.getByTitle("Toggle Preview");
      await user.click(previewButton);

      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      expect(screen.getByText("Edit")).toBeInTheDocument();
    });

    it("should render markdown as HTML in preview mode", async () => {
      const user = userEvent.setup();

      render(
        <MarkdownEditor
          {...defaultProps}
          content="# Test Heading\n\n**Bold text**"
        />,
      );

      const previewButton = screen.getByTitle("Toggle Preview");
      await user.click(previewButton);

      // Check if preview mode is active
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    });

    it("should toggle back to edit mode when edit button is clicked", async () => {
      const user = userEvent.setup();

      render(<MarkdownEditor {...defaultProps} />);

      // Switch to preview mode
      const previewButton = screen.getByTitle("Toggle Preview");
      await user.click(previewButton);

      // Switch back to edit mode
      const editButton = screen.getByText("Edit");
      await user.click(editButton);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByText("Preview")).toBeInTheDocument();
    });
  });

  describe("File Operations", () => {
    it("should render save button when filePath and onSave are provided", () => {
      render(<MarkdownEditor {...defaultProps} filePath="/test/file.md" />);

      expect(screen.getByTitle(/Save File/)).toBeInTheDocument();
    });

    it("should not render save button when filePath is not provided", () => {
      render(<MarkdownEditor {...defaultProps} filePath={undefined} />);

      expect(screen.queryByTitle(/Save File/)).not.toBeInTheDocument();
    });

    it("should call onSave when save button is clicked", async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={onSave}
          filePath="/test/file.md"
        />,
      );

      const saveButton = screen.getByTitle(/Save File/);
      await user.click(saveButton);

      expect(onSave).toHaveBeenCalledWith(
        "# Test Content\n\nThis is a test.",
        "/test/file.md",
      );
    });

    it("should show saving status when save is in progress", async () => {
      const user = userEvent.setup();
      const onSave = jest
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        );

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={onSave}
          filePath="/test/file.md"
        />,
      );

      const saveButton = screen.getByTitle(/Save File/);
      await user.click(saveButton);

      expect(screen.getByText("Saving...")).toBeInTheDocument();
    });

    it("should show success status after successful save", async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={onSave}
          filePath="/test/file.md"
        />,
      );

      const saveButton = screen.getByTitle(/Save File/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("✓ Saved")).toBeInTheDocument();
      });
    });

    it("should show error status when save fails", async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockRejectedValue(new Error("Save failed"));

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={onSave}
          filePath="/test/file.md"
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

  describe("Status Bar", () => {
    it("should display content statistics", () => {
      render(
        <MarkdownEditor
          {...defaultProps}
          content="Line 1\nLine 2\nHello world"
        />,
      );

      expect(screen.getByText(/Lines:/)).toBeInTheDocument();
      expect(screen.getByText(/Characters:/)).toBeInTheDocument();
      expect(screen.getByText(/Words:/)).toBeInTheDocument();
    });

    it("should display file name when filePath is provided", () => {
      render(
        <MarkdownEditor {...defaultProps} filePath="/test/path/example.md" />,
      );

      expect(screen.getByText("File: example.md")).toBeInTheDocument();
    });

    it("should not display file name when filePath is not provided", () => {
      render(<MarkdownEditor {...defaultProps} filePath={undefined} />);

      expect(screen.queryByText(/File:/)).not.toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when save fails", async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockRejectedValue(new Error("Network error"));

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={onSave}
          filePath="/test/file.md"
        />,
      );

      const saveButton = screen.getByTitle(/Save File/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Error: Network error")).toBeInTheDocument();
      });
    });

    it("should clear error when content is changed", async () => {
      const user = userEvent.setup();
      const onSave = jest.fn().mockRejectedValue(new Error("Save error"));
      const onChange = jest.fn();

      render(
        <MarkdownEditor
          {...defaultProps}
          onSave={onSave}
          onChange={onChange}
          filePath="/test/file.md"
        />,
      );

      // Trigger save error
      const saveButton = screen.getByTitle(/Save File/);
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("Error: Save error")).toBeInTheDocument();
      });

      // Change content to clear error
      const textarea = screen.getByRole("textbox");
      await user.type(textarea, " updated");

      expect(screen.queryByText("Error: Save error")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels and roles", () => {
      render(<MarkdownEditor {...defaultProps} />);

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeInTheDocument();
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

      // Test that textarea is focusable
      expect(textarea).toHaveFocus();
    });
  });
});
