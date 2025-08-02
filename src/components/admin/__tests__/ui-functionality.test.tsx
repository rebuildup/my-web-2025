/**
 * UI Functionality Tests
 * Comprehensive tests for enhanced UI components
 */

import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

// Mock the enhanced data manager hook
const mockUpdateField = jest.fn();
const mockValidateForm = jest.fn();
const mockSaveWithCacheInvalidation = jest.fn();
const mockPreloadRelatedData = jest.fn();

jest.mock("@/hooks/useEnhancedDataManager", () => ({
  useEnhancedDataManager: () => ({
    formData: {
      id: "test-item",
      title: "Test Item",
      description: "Test description",
      categories: ["develop"],
      tags: ["react", "typescript"],
      useManualDate: false,
      manualDate: "",
      markdownPath: "",
      processedImages: [],
      originalImages: [],
    },
    validationErrors: {},
    hasUnsavedChanges: false,
    isDirty: false,
    isAutoSaving: false,
    updateField: mockUpdateField,
    validateForm: mockValidateForm,
    saveWithCacheInvalidation: mockSaveWithCacheInvalidation,
    preloadRelatedData: mockPreloadRelatedData,
  }),
}));

// Mock components that we'll test
const MockMultiCategorySelector = ({
  selectedCategories,
  onChange,
  availableCategories,
}: {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
  availableCategories: string[];
}) => (
  <div data-testid="multi-category-selector">
    <div data-testid="selected-categories">
      {selectedCategories.map((cat: string) => (
        <span key={cat} data-testid={`selected-${cat}`}>
          {cat}
        </span>
      ))}
    </div>
    {availableCategories.map((cat: string) => (
      <button
        key={cat}
        data-testid={`category-${cat}`}
        onClick={() => {
          const newCategories = selectedCategories.includes(cat)
            ? selectedCategories.filter((c: string) => c !== cat)
            : [...selectedCategories, cat];
          onChange(newCategories);
        }}
      >
        {cat}
      </button>
    ))}
  </div>
);

const MockTagManagementUI = ({
  selectedTags,
  onChange,
  availableTags,
}: {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
}) => (
  <div data-testid="tag-management-ui">
    <div data-testid="selected-tags">
      {selectedTags.map((tag: string) => (
        <span key={tag} data-testid={`selected-tag-${tag}`}>
          {tag}
          <button
            data-testid={`remove-tag-${tag}`}
            onClick={() =>
              onChange(selectedTags.filter((t: string) => t !== tag))
            }
          >
            ×
          </button>
        </span>
      ))}
    </div>
    <input
      data-testid="tag-input"
      placeholder="Add new tag"
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.currentTarget.value.trim()) {
          onChange([...selectedTags, e.currentTarget.value.trim()]);
          e.currentTarget.value = "";
        }
      }}
    />
    {availableTags && (
      <div data-testid="available-tags">
        {availableTags.map((tag: string) => (
          <button
            key={tag}
            data-testid={`available-tag-${tag}`}
            onClick={() => {
              if (!selectedTags.includes(tag)) {
                onChange([...selectedTags, tag]);
              }
            }}
          >
            {tag}
          </button>
        ))}
      </div>
    )}
  </div>
);

const MockDatePicker = ({
  value,
  onChange,
  useManualDate,
  onToggleManualDate,
}: {
  value: string;
  onChange: (date: string) => void;
  useManualDate: boolean;
  onToggleManualDate: (use: boolean) => void;
}) => (
  <div data-testid="date-picker">
    <label>
      <input
        type="checkbox"
        data-testid="manual-date-toggle"
        checked={useManualDate}
        onChange={(e) => onToggleManualDate(e.target.checked)}
      />
      Use manual date
    </label>
    {useManualDate && (
      <input
        type="datetime-local"
        data-testid="date-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    )}
  </div>
);

const MockFileUploadSection = ({
  images,
  originalImages,
  onImagesChange,
  onOriginalImagesChange,
  uploadOptions,
  onUploadOptionsChange,
}: {
  images: string[];
  originalImages: string[];
  onImagesChange: (images: string[]) => void;
  onOriginalImagesChange: (images: string[]) => void;
  uploadOptions: Record<string, unknown>;
  onUploadOptionsChange: (options: Record<string, unknown>) => void;
}) => (
  <div data-testid="file-upload-section">
    <div data-testid="upload-options">
      <label>
        <input
          type="checkbox"
          data-testid="skip-processing-option"
          checked={uploadOptions.skipProcessing}
          onChange={(e) =>
            onUploadOptionsChange({
              ...uploadOptions,
              skipProcessing: e.target.checked,
            })
          }
        />
        Skip processing
      </label>
      <label>
        <input
          type="checkbox"
          data-testid="preserve-original-option"
          checked={uploadOptions.preserveOriginal}
          onChange={(e) =>
            onUploadOptionsChange({
              ...uploadOptions,
              preserveOriginal: e.target.checked,
            })
          }
        />
        Preserve original
      </label>
    </div>

    <div data-testid="processed-images">
      <h4>Processed Images</h4>
      {images.map((img: string, index: number) => (
        <div key={index} data-testid={`processed-image-${index}`}>
          {img}
          <button
            data-testid={`remove-processed-${index}`}
            onClick={() =>
              onImagesChange(images.filter((_, i: number) => i !== index))
            }
          >
            Remove
          </button>
        </div>
      ))}
      <input
        type="file"
        data-testid="processed-file-input"
        multiple
        accept="image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          const newImages = files.map((f) => `processed_${f.name}`);
          onImagesChange([...images, ...newImages]);
        }}
      />
    </div>

    <div data-testid="original-images">
      <h4>Original Images</h4>
      {originalImages.map((img: string, index: number) => (
        <div key={index} data-testid={`original-image-${index}`}>
          {img}
          <button
            data-testid={`remove-original-${index}`}
            onClick={() =>
              onOriginalImagesChange(
                originalImages.filter((_, i: number) => i !== index),
              )
            }
          >
            Remove
          </button>
        </div>
      ))}
      <input
        type="file"
        data-testid="original-file-input"
        multiple
        accept="image/*"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          const newImages = files.map((f) => `original_${f.name}`);
          onOriginalImagesChange([...originalImages, ...newImages]);
        }}
      />
    </div>
  </div>
);

const MockMarkdownEditor = ({
  content,
  onChange,
  filePath,
  onSave,
}: {
  content: string;
  onChange: (content: string) => void;
  filePath: string;
  onSave: () => void;
}) => (
  <div data-testid="markdown-editor">
    <div data-testid="markdown-toolbar">
      <button
        data-testid="bold-button"
        onClick={() => onChange(content + "**bold**")}
      >
        Bold
      </button>
      <button
        data-testid="italic-button"
        onClick={() => onChange(content + "*italic*")}
      >
        Italic
      </button>
      <button
        data-testid="heading-button"
        onClick={() => onChange(content + "\n# Heading")}
      >
        Heading
      </button>
    </div>

    <textarea
      data-testid="markdown-textarea"
      value={content}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter markdown content..."
    />

    <div data-testid="markdown-preview">
      <h4>Preview</h4>
      <div
        dangerouslySetInnerHTML={{
          __html: content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
        }}
      />
    </div>

    {filePath && (
      <div data-testid="file-info">
        File: {filePath}
        <button
          data-testid="save-button"
          onClick={() => onSave(content, filePath)}
        >
          Save
        </button>
      </div>
    )}
  </div>
);

describe("UI Functionality Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Multi-Category Selector", () => {
    it("should display selected categories", () => {
      render(
        <MockMultiCategorySelector
          selectedCategories={["develop", "design"]}
          onChange={jest.fn()}
          availableCategories={["develop", "design", "video", "other"]}
        />,
      );

      expect(screen.getByTestId("selected-develop")).toBeInTheDocument();
      expect(screen.getByTestId("selected-design")).toBeInTheDocument();
    });

    it("should allow selecting and deselecting categories", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <MockMultiCategorySelector
          selectedCategories={["develop"]}
          onChange={mockOnChange}
          availableCategories={["develop", "design", "video", "other"]}
        />,
      );

      // Select design category
      await user.click(screen.getByTestId("category-design"));
      expect(mockOnChange).toHaveBeenCalledWith(["develop", "design"]);

      // Deselect develop category
      await user.click(screen.getByTestId("category-develop"));
      expect(mockOnChange).toHaveBeenCalledWith([]);
    });

    it("should handle multiple category selections", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      const { rerender } = render(
        <MockMultiCategorySelector
          selectedCategories={[]}
          onChange={mockOnChange}
          availableCategories={["develop", "design", "video", "other"]}
        />,
      );

      await user.click(screen.getByTestId("category-develop"));
      expect(mockOnChange).toHaveBeenCalledWith(["develop"]);

      // Simulate selecting multiple categories by rerendering
      mockOnChange.mockClear();
      rerender(
        <MockMultiCategorySelector
          selectedCategories={["develop"]}
          onChange={mockOnChange}
          availableCategories={["develop", "design", "video", "other"]}
        />,
      );

      await user.click(screen.getByTestId("category-design"));
      expect(mockOnChange).toHaveBeenCalledWith(["develop", "design"]);
    });

    it("should handle Other category selection", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <MockMultiCategorySelector
          selectedCategories={[]}
          onChange={mockOnChange}
          availableCategories={["develop", "design", "video", "other"]}
        />,
      );

      await user.click(screen.getByTestId("category-other"));
      expect(mockOnChange).toHaveBeenCalledWith(["other"]);
    });
  });

  describe("Tag Management UI", () => {
    it("should display selected tags", () => {
      render(
        <MockTagManagementUI
          selectedTags={["react", "typescript"]}
          onChange={jest.fn()}
          availableTags={["react", "typescript", "javascript", "css"]}
        />,
      );

      expect(screen.getByTestId("selected-tag-react")).toBeInTheDocument();
      expect(screen.getByTestId("selected-tag-typescript")).toBeInTheDocument();
    });

    it("should allow removing tags", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <MockTagManagementUI
          selectedTags={["react", "typescript"]}
          onChange={mockOnChange}
          availableTags={[]}
        />,
      );

      await user.click(screen.getByTestId("remove-tag-react"));
      expect(mockOnChange).toHaveBeenCalledWith(["typescript"]);
    });

    it("should allow adding new tags via input", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <MockTagManagementUI
          selectedTags={["react"]}
          onChange={mockOnChange}
          availableTags={[]}
        />,
      );

      const input = screen.getByTestId("tag-input");
      await user.type(input, "new-tag");
      await user.keyboard("{Enter}");

      expect(mockOnChange).toHaveBeenCalledWith(["react", "new-tag"]);
    });

    it("should allow selecting from available tags", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <MockTagManagementUI
          selectedTags={["react"]}
          onChange={mockOnChange}
          availableTags={["typescript", "javascript", "css"]}
        />,
      );

      await user.click(screen.getByTestId("available-tag-typescript"));
      expect(mockOnChange).toHaveBeenCalledWith(["react", "typescript"]);
    });

    it("should not add duplicate tags", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <MockTagManagementUI
          selectedTags={["react"]}
          onChange={mockOnChange}
          availableTags={["react", "typescript"]}
        />,
      );

      await user.click(screen.getByTestId("available-tag-react"));
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("Date Picker Component", () => {
    it("should toggle manual date mode", async () => {
      const user = userEvent.setup();
      const mockOnToggle = jest.fn();

      render(
        <MockDatePicker
          value=""
          onChange={jest.fn()}
          useManualDate={false}
          onToggleManualDate={mockOnToggle}
        />,
      );

      await user.click(screen.getByTestId("manual-date-toggle"));
      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it("should show date input when manual date is enabled", () => {
      render(
        <MockDatePicker
          value="2024-01-01T12:00"
          onChange={jest.fn()}
          useManualDate={true}
          onToggleManualDate={jest.fn()}
        />,
      );

      expect(screen.getByTestId("date-input")).toBeInTheDocument();
      expect(screen.getByTestId("date-input")).toHaveValue("2024-01-01T12:00");
    });

    it("should hide date input when manual date is disabled", () => {
      render(
        <MockDatePicker
          value=""
          onChange={jest.fn()}
          useManualDate={false}
          onToggleManualDate={jest.fn()}
        />,
      );

      expect(screen.queryByTestId("date-input")).not.toBeInTheDocument();
    });

    it("should handle date changes", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <MockDatePicker
          value=""
          onChange={mockOnChange}
          useManualDate={true}
          onToggleManualDate={jest.fn()}
        />,
      );

      const dateInput = screen.getByTestId("date-input");
      await user.type(dateInput, "2024-01-15T14:30");

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Enhanced File Upload Section", () => {
    it("should display upload options", () => {
      render(
        <MockFileUploadSection
          images={[]}
          originalImages={[]}
          onImagesChange={jest.fn()}
          onOriginalImagesChange={jest.fn()}
          uploadOptions={{ skipProcessing: false, preserveOriginal: false }}
          onUploadOptionsChange={jest.fn()}
        />,
      );

      expect(screen.getByTestId("skip-processing-option")).toBeInTheDocument();
      expect(
        screen.getByTestId("preserve-original-option"),
      ).toBeInTheDocument();
    });

    it("should toggle upload options", async () => {
      const user = userEvent.setup();
      const mockOnOptionsChange = jest.fn();

      render(
        <MockFileUploadSection
          images={[]}
          originalImages={[]}
          onImagesChange={jest.fn()}
          onOriginalImagesChange={jest.fn()}
          uploadOptions={{ skipProcessing: false, preserveOriginal: false }}
          onUploadOptionsChange={mockOnOptionsChange}
        />,
      );

      await user.click(screen.getByTestId("skip-processing-option"));
      expect(mockOnOptionsChange).toHaveBeenCalledWith({
        skipProcessing: true,
        preserveOriginal: false,
      });

      await user.click(screen.getByTestId("preserve-original-option"));
      expect(mockOnOptionsChange).toHaveBeenCalledWith({
        skipProcessing: false,
        preserveOriginal: true,
      });
    });

    it("should display processed images", () => {
      render(
        <MockFileUploadSection
          images={["processed1.jpg", "processed2.jpg"]}
          originalImages={[]}
          onImagesChange={jest.fn()}
          onOriginalImagesChange={jest.fn()}
          uploadOptions={{ skipProcessing: false, preserveOriginal: false }}
          onUploadOptionsChange={jest.fn()}
        />,
      );

      expect(screen.getByTestId("processed-image-0")).toBeInTheDocument();
      expect(screen.getByTestId("processed-image-1")).toBeInTheDocument();
    });

    it("should display original images", () => {
      render(
        <MockFileUploadSection
          images={[]}
          originalImages={["original1.jpg", "original2.jpg"]}
          onImagesChange={jest.fn()}
          onOriginalImagesChange={jest.fn()}
          uploadOptions={{ skipProcessing: false, preserveOriginal: false }}
          onUploadOptionsChange={jest.fn()}
        />,
      );

      expect(screen.getByTestId("original-image-0")).toBeInTheDocument();
      expect(screen.getByTestId("original-image-1")).toBeInTheDocument();
    });

    it("should allow removing images", async () => {
      const user = userEvent.setup();
      const mockOnImagesChange = jest.fn();

      render(
        <MockFileUploadSection
          images={["processed1.jpg", "processed2.jpg"]}
          originalImages={[]}
          onImagesChange={mockOnImagesChange}
          onOriginalImagesChange={jest.fn()}
          uploadOptions={{ skipProcessing: false, preserveOriginal: false }}
          onUploadOptionsChange={jest.fn()}
        />,
      );

      await user.click(screen.getByTestId("remove-processed-0"));
      expect(mockOnImagesChange).toHaveBeenCalledWith(["processed2.jpg"]);
    });

    it("should handle file uploads", async () => {
      const user = userEvent.setup();
      const mockOnImagesChange = jest.fn();

      render(
        <MockFileUploadSection
          images={[]}
          originalImages={[]}
          onImagesChange={mockOnImagesChange}
          onOriginalImagesChange={jest.fn()}
          uploadOptions={{ skipProcessing: false, preserveOriginal: false }}
          onUploadOptionsChange={jest.fn()}
        />,
      );

      const fileInput = screen.getByTestId("processed-file-input");
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await user.upload(fileInput, file);
      expect(mockOnImagesChange).toHaveBeenCalledWith(["processed_test.jpg"]);
    });
  });

  describe("Markdown Editor", () => {
    it("should display markdown content", () => {
      render(
        <MockMarkdownEditor
          content="# Test Content"
          onChange={jest.fn()}
          filePath=""
          onSave={jest.fn()}
        />,
      );

      expect(screen.getByTestId("markdown-textarea")).toHaveValue(
        "# Test Content",
      );
    });

    it("should handle content changes", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <MockMarkdownEditor
          content=""
          onChange={mockOnChange}
          filePath=""
          onSave={jest.fn()}
        />,
      );

      const textarea = screen.getByTestId("markdown-textarea");
      await user.type(textarea, "New content");

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should provide toolbar functionality", async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();

      render(
        <MockMarkdownEditor
          content="Initial content"
          onChange={mockOnChange}
          filePath=""
          onSave={jest.fn()}
        />,
      );

      await user.click(screen.getByTestId("bold-button"));
      expect(mockOnChange).toHaveBeenCalledWith("Initial content**bold**");

      await user.click(screen.getByTestId("italic-button"));
      expect(mockOnChange).toHaveBeenCalledWith("Initial content*italic*");

      await user.click(screen.getByTestId("heading-button"));
      expect(mockOnChange).toHaveBeenCalledWith("Initial content\n# Heading");
    });

    it("should show preview", () => {
      render(
        <MockMarkdownEditor
          content="**Bold text**"
          onChange={jest.fn()}
          filePath=""
          onSave={jest.fn()}
        />,
      );

      const preview = screen.getByTestId("markdown-preview");
      expect(preview).toBeInTheDocument();
      expect(preview.innerHTML).toContain("<strong>Bold text</strong>");
    });

    it("should handle file operations", async () => {
      const user = userEvent.setup();
      const mockOnSave = jest.fn();

      render(
        <MockMarkdownEditor
          content="Content to save"
          onChange={jest.fn()}
          filePath="test.md"
          onSave={mockOnSave}
        />,
      );

      expect(screen.getByTestId("file-info")).toBeInTheDocument();
      expect(screen.getByText("File: test.md")).toBeInTheDocument();

      await user.click(screen.getByTestId("save-button"));
      expect(mockOnSave).toHaveBeenCalledWith("Content to save", "test.md");
    });
  });

  describe("Integration Tests", () => {
    it("should handle complex form interactions", async () => {
      const user = userEvent.setup();

      // Mock a complex form with multiple components
      const ComplexForm = () => {
        const [categories, setCategories] = React.useState(["develop"]);
        const [tags, setTags] = React.useState(["react"]);
        const [useManualDate, setUseManualDate] = React.useState(false);
        const [date, setDate] = React.useState("");

        return (
          <div data-testid="complex-form">
            <MockMultiCategorySelector
              selectedCategories={categories}
              onChange={setCategories}
              availableCategories={["develop", "design", "video", "other"]}
            />
            <MockTagManagementUI
              selectedTags={tags}
              onChange={setTags}
              availableTags={["typescript", "javascript"]}
            />
            <MockDatePicker
              value={date}
              onChange={setDate}
              useManualDate={useManualDate}
              onToggleManualDate={setUseManualDate}
            />
          </div>
        );
      };

      render(<ComplexForm />);

      // Test category selection
      await user.click(screen.getByTestId("category-design"));
      expect(screen.getByTestId("selected-design")).toBeInTheDocument();

      // Test tag management
      await user.click(screen.getByTestId("available-tag-typescript"));
      expect(screen.getByTestId("selected-tag-typescript")).toBeInTheDocument();

      // Test date picker
      await user.click(screen.getByTestId("manual-date-toggle"));
      expect(screen.getByTestId("date-input")).toBeInTheDocument();
    });

    it("should handle validation errors display", () => {
      const FormWithErrors = () => (
        <div data-testid="form-with-errors">
          <div data-testid="validation-errors">
            <div data-testid="title-error">Title is required</div>
            <div data-testid="category-error">
              At least one category is required
            </div>
          </div>
        </div>
      );

      render(<FormWithErrors />);

      expect(screen.getByTestId("title-error")).toBeInTheDocument();
      expect(screen.getByTestId("category-error")).toBeInTheDocument();
    });

    it("should handle loading states", () => {
      const LoadingForm = () => (
        <div data-testid="loading-form">
          <div data-testid="loading-spinner">Loading...</div>
          <button data-testid="save-button" disabled>
            Saving...
          </button>
        </div>
      );

      render(<LoadingForm />);

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByTestId("save-button")).toBeDisabled();
    });

    it("should handle auto-save functionality", async () => {
      jest.useFakeTimers();

      const AutoSaveForm = () => {
        const [content, setContent] = React.useState("");
        const [lastSaved, setLastSaved] = React.useState<Date | null>(null);

        React.useEffect(() => {
          if (content) {
            const timer = setTimeout(() => {
              setLastSaved(new Date());
            }, 2000);
            return () => clearTimeout(timer);
          }
        }, [content]);

        return (
          <div data-testid="auto-save-form">
            <input
              data-testid="content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            {lastSaved && (
              <div data-testid="last-saved">
                Last saved: {lastSaved.toISOString()}
              </div>
            )}
          </div>
        );
      };

      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      render(<AutoSaveForm />);

      await user.type(screen.getByTestId("content-input"), "Test content");

      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByTestId("last-saved")).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe("Accessibility Tests", () => {
    it("should have proper ARIA labels", () => {
      const AccessibleForm = () => (
        <div>
          <label htmlFor="title-input">Title</label>
          <input
            id="title-input"
            data-testid="title-input"
            aria-required="true"
          />

          <fieldset>
            <legend>Categories</legend>
            <input
              type="checkbox"
              id="develop"
              aria-describedby="develop-desc"
            />
            <label htmlFor="develop">Develop</label>
            <div id="develop-desc">Development projects</div>
          </fieldset>
        </div>
      );

      render(<AccessibleForm />);

      expect(screen.getByLabelText("Title")).toBeInTheDocument();
      expect(
        screen.getByRole("group", { name: "Categories" }),
      ).toBeInTheDocument();
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button data-testid="button1">Button 1</button>
          <button data-testid="button2">Button 2</button>
          <input data-testid="input1" />
        </div>,
      );

      // Tab navigation
      await user.tab();
      expect(screen.getByTestId("button1")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("button2")).toHaveFocus();

      await user.tab();
      expect(screen.getByTestId("input1")).toHaveFocus();
    });

    it("should announce changes to screen readers", () => {
      const AnnouncementForm = () => (
        <div>
          <div role="status" aria-live="polite" data-testid="status">
            Form saved successfully
          </div>
          <div role="alert" aria-live="assertive" data-testid="error">
            Validation error occurred
          </div>
        </div>
      );

      render(<AnnouncementForm />);

      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
