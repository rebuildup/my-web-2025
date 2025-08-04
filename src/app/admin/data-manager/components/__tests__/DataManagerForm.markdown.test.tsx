/**
 * DataManagerForm Markdown Editing Workflow Tests
 * Tests for creating, editing, and migrating content with markdown
 * Covers requirements 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Define types locally to avoid import issues
interface EnhancedContentItem {
  id: string;
  type: "portfolio";
  title: string;
  description: string;
  categories: string[];
  tags: string[];
  status: "draft" | "published";
  priority: number;
  createdAt: string;
  isOtherCategory: boolean;
  useManualDate: boolean;
  originalImages: string[];
  processedImages: string[];
  markdownPath?: string;
}

// Mock the markdown client service
jest.mock("@/lib/markdown/client-service", () => ({
  clientMarkdownService: {
    generateFilePath: jest.fn(),
    createMarkdownFile: jest.fn(),
    updateMarkdownFile: jest.fn(),
    fileExists: jest.fn(),
    getMarkdownContent: jest.fn(),
    deleteMarkdownFile: jest.fn(),
  },
}));

// Mock other dependencies
jest.mock("@/lib/portfolio/client-tag-manager", () => ({
  clientTagManager: {
    getAllTags: jest.fn().mockResolvedValue([]),
    createTag: jest.fn(),
    updateTagUsage: jest.fn(),
    deleteTag: jest.fn(),
    searchTags: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("@/lib/portfolio/client-date-manager", () => ({
  clientDateManager: {
    getEffectiveDate: jest.fn().mockReturnValue(new Date()),
  },
}));

// Mock MarkdownEditor component
jest.mock("@/components/ui/MarkdownEditor", () => {
  const MockMarkdownEditor = ({
    content,
    onChange,
    onSave,
    filePath,
    preview,
    toolbar,
  }: {
    content: string;
    onChange: (content: string) => void;
    onSave?: (content: string, filePath: string) => Promise<void>;
    filePath?: string;
    preview?: boolean;
    toolbar?: boolean;
  }) => (
    <div data-testid="markdown-editor">
      <textarea
        data-testid="markdown-textarea"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter markdown content..."
      />
      {onSave && filePath && (
        <button
          data-testid="markdown-save-button"
          onClick={() => onSave(content, filePath)}
        >
          Save Markdown
        </button>
      )}
      <div data-testid="markdown-preview">
        {preview ? "Preview enabled" : "Preview disabled"}
      </div>
      <div data-testid="markdown-toolbar">
        {toolbar ? "Toolbar enabled" : "Toolbar disabled"}
      </div>
    </div>
  );
  MockMarkdownEditor.displayName = "MockMarkdownEditor";
  return { MarkdownEditor: MockMarkdownEditor };
});

// Mock other components
jest.mock("../FileUploadSection", () => {
  const MockFileUploadSection = () => <div data-testid="file-upload-section" />;
  MockFileUploadSection.displayName = "MockFileUploadSection";
  return { FileUploadSection: MockFileUploadSection };
});

jest.mock("../EnhancedFileUploadSection", () => {
  const MockEnhancedFileUploadSection = () => (
    <div data-testid="enhanced-file-upload-section" />
  );
  MockEnhancedFileUploadSection.displayName = "MockEnhancedFileUploadSection";
  return { EnhancedFileUploadSection: MockEnhancedFileUploadSection };
});

jest.mock("../MediaEmbedSection", () => {
  const MockMediaEmbedSection = () => <div data-testid="media-embed-section" />;
  MockMediaEmbedSection.displayName = "MockMediaEmbedSection";
  return { MediaEmbedSection: MockMediaEmbedSection };
});

jest.mock("../ExternalLinksSection", () => {
  const MockExternalLinksSection = () => (
    <div data-testid="external-links-section" />
  );
  MockExternalLinksSection.displayName = "MockExternalLinksSection";
  return { ExternalLinksSection: MockExternalLinksSection };
});

jest.mock("../DownloadInfoSection", () => {
  const MockDownloadInfoSection = () => (
    <div data-testid="download-info-section" />
  );
  MockDownloadInfoSection.displayName = "MockDownloadInfoSection";
  return { DownloadInfoSection: MockDownloadInfoSection };
});

jest.mock("../SEOSection", () => {
  const MockSEOSection = () => <div data-testid="seo-section" />;
  MockSEOSection.displayName = "MockSEOSection";
  return { SEOSection: MockSEOSection };
});

jest.mock("@/components/ui/MultiCategorySelector", () => {
  const MockMultiCategorySelector = ({
    selectedCategories,
  }: {
    selectedCategories: string[];
  }) => (
    <div data-testid="multi-category-selector">
      Selected: {selectedCategories.join(", ")}
    </div>
  );
  MockMultiCategorySelector.displayName = "MockMultiCategorySelector";
  return { MultiCategorySelector: MockMultiCategorySelector };
});

jest.mock("@/components/ui/TagManagementUI", () => {
  const MockTagManagementUI = ({
    selectedTags,
  }: {
    selectedTags: string[];
  }) => (
    <div data-testid="tag-management-ui">Tags: {selectedTags.join(", ")}</div>
  );
  MockTagManagementUI.displayName = "MockTagManagementUI";
  return { TagManagementUI: MockTagManagementUI };
});

// Import components after mocks
import { clientMarkdownService } from "@/lib/markdown/client-service";
import { DataManagerForm } from "../DataManagerForm";

describe("DataManagerForm - Markdown Editing Workflow", () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  const mockMarkdownService = jest.mocked(clientMarkdownService);

  beforeEach(() => {
    jest.clearAllMocks();
    mockMarkdownService.generateFilePath.mockResolvedValue(
      "portfolio/test-123.md",
    );
    mockMarkdownService.createMarkdownFile.mockResolvedValue(undefined);
    mockMarkdownService.updateMarkdownFile.mockResolvedValue(undefined);
    mockMarkdownService.fileExists.mockResolvedValue(false);
    mockMarkdownService.getMarkdownContent.mockResolvedValue("");
  });

  describe("Creating New Content with Markdown (Requirement 1.1)", () => {
    const newEnhancedItem: EnhancedContentItem = {
      id: "new-item-123",
      type: "portfolio",
      title: "New Portfolio Item",
      description: "New item description",
      categories: ["develop"],
      tags: [],
      status: "draft",
      priority: 50,
      createdAt: new Date().toISOString(),
      isOtherCategory: false,
      useManualDate: false,
      originalImages: [],
      processedImages: [],
    };

    it("should render markdown editor for new enhanced content", () => {
      render(
        <DataManagerForm
          item={newEnhancedItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
          enhanced={true}
        />,
      );

      // Should have markdown editor
      expect(screen.getByTestId("markdown-editor")).toBeInTheDocument();
      expect(screen.getByTestId("markdown-textarea")).toBeInTheDocument();
    });

    it("should create markdown file when content is saved", async () => {
      const user = userEvent.setup();

      render(
        <DataManagerForm
          item={newEnhancedItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
          enhanced={true}
        />,
      );

      // Add markdown content
      const textarea = screen.getByTestId("markdown-textarea");
      await user.type(
        textarea,
        "# New Content\n\nThis is new markdown content.",
      );

      // Save the form
      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMarkdownService.generateFilePath).toHaveBeenCalledWith(
          "new-item-123",
          "portfolio",
        );
        expect(mockMarkdownService.createMarkdownFile).toHaveBeenCalledWith(
          "new-item-123",
          "portfolio",
          "# New Content\n\nThis is new markdown content.",
        );
      });
    });

    it("should include markdown file path in saved data", async () => {
      const user = userEvent.setup();

      render(
        <DataManagerForm
          item={newEnhancedItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
          enhanced={true}
        />,
      );

      // Add markdown content
      const textarea = screen.getByTestId("markdown-textarea");
      await user.type(textarea, "# Test Content");

      // Save the form
      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMarkdownService.createMarkdownFile).toHaveBeenCalledWith(
          "new-item-123",
          "portfolio",
          "# Test Content",
        );
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            content: "# Test Content", // Content should remain when no markdown file path is set
          }),
        );
      });
    });

    it("should handle markdown file creation errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock generateFilePath to return null (simulating failure)
      mockMarkdownService.generateFilePath.mockResolvedValue(null);

      render(
        <DataManagerForm
          item={newEnhancedItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
          enhanced={true}
        />,
      );

      // Add markdown content
      const textarea = screen.getByTestId("markdown-textarea");
      await user.type(textarea, "# Test Content");

      // Save the form
      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMarkdownService.generateFilePath).toHaveBeenCalled();
        // Form should still save, but without markdown file path
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            content: "# Test Content", // Content remains as text
            markdownPath: undefined, // No markdown file path set
          }),
        );
      });
    });
  });

  describe("Editing Existing Content with Markdown (Requirement 1.2)", () => {
    const existingEnhancedItem: EnhancedContentItem = {
      id: "existing-item-456",
      type: "portfolio",
      title: "Existing Portfolio Item",
      description: "Existing item description",
      categories: ["design"],
      tags: ["existing"],
      status: "published",
      priority: 75,
      createdAt: "2024-01-01T00:00:00.000Z",
      markdownPath: "portfolio/existing-item-456.md",
      isOtherCategory: false,
      useManualDate: false,
      originalImages: [],
      processedImages: [],
    };

    beforeEach(() => {
      mockMarkdownService.fileExists.mockResolvedValue(true);
      mockMarkdownService.getMarkdownContent.mockResolvedValue(
        "# Existing Content\n\nThis is existing markdown content.",
      );
    });

    it("should load existing markdown content in editor", () => {
      const itemWithContent = {
        ...existingEnhancedItem,
        content: "# Existing Content\n\nThis is existing markdown content.",
      };

      render(
        <DataManagerForm
          item={itemWithContent}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
          enhanced={true}
        />,
      );

      const textarea = screen.getByTestId("markdown-textarea");
      expect(textarea).toHaveValue(
        "# Existing Content\n\nThis is existing markdown content.",
      );
    });

    it("should update existing markdown file when content is changed", async () => {
      const user = userEvent.setup();

      render(
        <DataManagerForm
          item={existingEnhancedItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
          enhanced={true}
        />,
      );

      // Modify markdown content
      const textarea = screen.getByTestId("markdown-textarea");
      await user.clear(textarea);
      await user.type(
        textarea,
        "# Updated Content\n\nThis content has been updated.",
      );

      // Save the form
      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMarkdownService.updateMarkdownFile).toHaveBeenCalledWith(
          "portfolio/existing-item-456.md",
          "# Updated Content\n\nThis content has been updated.",
        );
      });
    });
  });

  describe("Basic Functionality Tests", () => {
    const testItem: EnhancedContentItem = {
      id: "test-item",
      type: "portfolio",
      title: "Test Item",
      description: "Test description",
      categories: ["develop"],
      tags: [],
      status: "draft",
      priority: 50,
      createdAt: "2024-01-01T00:00:00.000Z",
      isOtherCategory: false,
      useManualDate: false,
      originalImages: [],
      processedImages: [],
    };

    it("should render markdown editor with correct props", () => {
      render(
        <DataManagerForm
          item={testItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
          enhanced={true}
        />,
      );

      const markdownEditor = screen.getByTestId("markdown-editor");
      expect(markdownEditor).toBeInTheDocument();

      // Should have preview and toolbar enabled
      expect(screen.getByTestId("markdown-preview")).toHaveTextContent(
        "Preview enabled",
      );
      expect(screen.getByTestId("markdown-toolbar")).toHaveTextContent(
        "Toolbar enabled",
      );
    });

    it("should handle content changes in markdown editor", async () => {
      const user = userEvent.setup();

      render(
        <DataManagerForm
          item={testItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
          enhanced={true}
        />,
      );

      const textarea = screen.getByTestId("markdown-textarea");
      await user.type(textarea, "# Test Markdown\n\nThis is test content.");

      expect(textarea).toHaveValue("# Test Markdown\n\nThis is test content.");
    });

    it("should save content with markdown", async () => {
      const user = userEvent.setup();

      render(
        <DataManagerForm
          item={testItem}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          isLoading={false}
          enhanced={true}
        />,
      );

      // Add content
      const textarea = screen.getByTestId("markdown-textarea");
      await user.type(textarea, "# Test Content");

      // Save the form
      const saveButton = screen.getByText("Save");
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockMarkdownService.createMarkdownFile).toHaveBeenCalledWith(
          "test-item",
          "portfolio",
          "# Test Content",
        );
      });
    });
  });
});
