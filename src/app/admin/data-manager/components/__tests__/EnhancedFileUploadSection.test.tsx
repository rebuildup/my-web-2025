/**
 * Enhanced File Upload Section Tests
 * Tests for the enhanced file upload UI component
 */

import { EnhancedFileUploadOptions } from "@/types";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { EnhancedFileUploadSection } from "../EnhancedFileUploadSection";

// Mock the enhanced file upload manager
jest.mock("@/lib/portfolio/enhanced-file-upload-manager", () => ({
  EnhancedFileUploadManager: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue({
      originalUrl: "/images/original.jpg",
      processedUrl: "/images/processed.jpg",
      thumbnailUrl: "/images/thumb.jpg",
      metadata: {
        fileName: "test.jpg",
        fileSize: 1024,
        mimeType: "image/jpeg",
        uploadedAt: "2023-01-01T00:00:00.000Z",
      },
    }),
  })),
}));

describe("EnhancedFileUploadSection", () => {
  const defaultProps = {
    images: [],
    onImagesChange: jest.fn(),
    onThumbnailChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the component with default options", () => {
      render(<EnhancedFileUploadSection {...defaultProps} />);

      expect(screen.getByText("Enhanced File Upload")).toBeInTheDocument();
      expect(screen.getByText("Upload Options")).toBeInTheDocument();
      expect(screen.getByText("Click to upload")).toBeInTheDocument();
    });

    it("should render upload options checkboxes", () => {
      render(<EnhancedFileUploadSection {...defaultProps} />);

      expect(screen.getByLabelText("Skip Processing")).toBeInTheDocument();
      expect(screen.getByLabelText("Preserve Original")).toBeInTheDocument();
      expect(screen.getByLabelText("Generate Variants")).toBeInTheDocument();
    });

    it("should render custom processing options when not skipping processing", () => {
      render(<EnhancedFileUploadSection {...defaultProps} />);

      expect(screen.getByText("Custom Processing")).toBeInTheDocument();
      expect(
        screen.getByRole("combobox", { name: "Output Format" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Add Watermark")).toBeInTheDocument();
      expect(
        screen.getByRole("spinbutton", { name: "Max Width" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("spinbutton", { name: "Max Height" }),
      ).toBeInTheDocument();
    });
  });

  describe("Options Handling", () => {
    it("should handle skip processing option change", () => {
      const onUploadOptionsChange = jest.fn();
      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          onUploadOptionsChange={onUploadOptionsChange}
        />,
      );

      const skipProcessingCheckbox = screen.getByLabelText("Skip Processing");
      fireEvent.click(skipProcessingCheckbox);

      expect(onUploadOptionsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          skipProcessing: true,
        }),
      );
    });

    it("should handle preserve original option change", () => {
      const onUploadOptionsChange = jest.fn();
      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          onUploadOptionsChange={onUploadOptionsChange}
        />,
      );

      const preserveOriginalCheckbox =
        screen.getByLabelText("Preserve Original");
      fireEvent.click(preserveOriginalCheckbox);

      expect(onUploadOptionsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          preserveOriginal: false,
        }),
      );
    });

    it("should handle generate variants option change", () => {
      const onUploadOptionsChange = jest.fn();
      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          onUploadOptionsChange={onUploadOptionsChange}
        />,
      );

      const generateVariantsCheckbox =
        screen.getByLabelText("Generate Variants");
      fireEvent.click(generateVariantsCheckbox);

      expect(onUploadOptionsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          generateVariants: true,
        }),
      );
    });

    it("should handle format selection change", () => {
      const onUploadOptionsChange = jest.fn();
      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          onUploadOptionsChange={onUploadOptionsChange}
        />,
      );

      const formatSelect = screen.getByLabelText("Output Format");
      fireEvent.change(formatSelect, { target: { value: "webp" } });

      expect(onUploadOptionsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          customProcessing: expect.objectContaining({
            format: "webp",
          }),
        }),
      );
    });

    it("should handle watermark option change", () => {
      const onUploadOptionsChange = jest.fn();
      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          onUploadOptionsChange={onUploadOptionsChange}
        />,
      );

      const watermarkCheckbox = screen.getByLabelText("Add Watermark");
      fireEvent.click(watermarkCheckbox);

      expect(onUploadOptionsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          customProcessing: expect.objectContaining({
            watermark: true,
          }),
        }),
      );
    });

    it("should handle resize dimensions change", () => {
      const onUploadOptionsChange = jest.fn();
      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          onUploadOptionsChange={onUploadOptionsChange}
        />,
      );

      const maxWidthInput = screen.getByLabelText("Max Width");
      fireEvent.change(maxWidthInput, { target: { value: "1200" } });

      expect(onUploadOptionsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          customProcessing: expect.objectContaining({
            resize: expect.objectContaining({
              width: 1200,
            }),
          }),
        }),
      );
    });
  });

  describe("Image Display", () => {
    it("should display processed images when provided", () => {
      const images = ["/images/processed1.jpg", "/images/processed2.jpg"];
      render(<EnhancedFileUploadSection {...defaultProps} images={images} />);

      expect(screen.getByText("Processed Images (2)")).toBeInTheDocument();
      expect(screen.getAllByAltText(/Processed \d+/)).toHaveLength(2);
    });

    it("should display original images when provided and preserve original is enabled", () => {
      const originalImages = ["/images/original1.jpg", "/images/original2.jpg"];
      const uploadOptions: EnhancedFileUploadOptions = {
        preserveOriginal: true,
      };

      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          originalImages={originalImages}
          uploadOptions={uploadOptions}
        />,
      );

      expect(screen.getByText("Original Images (2)")).toBeInTheDocument();
      expect(screen.getAllByAltText(/Original \d+/)).toHaveLength(2);
    });

    it("should show thumbnail indicator on selected thumbnail", () => {
      const images = ["/images/processed1.jpg", "/images/processed2.jpg"];
      const thumbnail = "/images/processed1.jpg";

      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          images={images}
          thumbnail={thumbnail}
        />,
      );

      expect(screen.getAllByText("Thumbnail")[0]).toBeInTheDocument();
    });
  });

  describe("Thumbnail Selection", () => {
    it("should render thumbnail selection dropdown when images exist", () => {
      const images = ["/images/processed1.jpg", "/images/processed2.jpg"];
      render(<EnhancedFileUploadSection {...defaultProps} images={images} />);

      expect(
        screen.getByRole("combobox", { name: "Thumbnail" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Select thumbnail...")).toBeInTheDocument();
      expect(screen.getByText("Processed Image 1")).toBeInTheDocument();
      expect(screen.getByText("Processed Image 2")).toBeInTheDocument();
    });

    it("should include original images in thumbnail selection", () => {
      const images = ["/images/processed1.jpg"];
      const originalImages = ["/images/original1.jpg"];

      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          images={images}
          originalImages={originalImages}
        />,
      );

      expect(screen.getByText("Processed Image 1")).toBeInTheDocument();
      expect(screen.getByText("Original Image 1")).toBeInTheDocument();
    });

    it("should call onThumbnailChange when thumbnail is selected", () => {
      const onThumbnailChange = jest.fn();
      const images = ["/images/processed1.jpg"];

      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          images={images}
          onThumbnailChange={onThumbnailChange}
        />,
      );

      const thumbnailSelect = screen.getByRole("combobox", {
        name: "Thumbnail",
      });
      fireEvent.change(thumbnailSelect, {
        target: { value: "/images/processed1.jpg" },
      });

      expect(onThumbnailChange).toHaveBeenCalledWith("/images/processed1.jpg");
    });
  });

  describe("Image Actions", () => {
    it("should call onImagesChange when removing a processed image", () => {
      const onImagesChange = jest.fn();
      const images = ["/images/processed1.jpg", "/images/processed2.jpg"];

      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          images={images}
          onImagesChange={onImagesChange}
        />,
      );

      const removeButtons = screen.getAllByText("Remove");
      fireEvent.click(removeButtons[0]);

      expect(onImagesChange).toHaveBeenCalledWith(["/images/processed2.jpg"]);
    });

    it("should call onOriginalImagesChange when removing an original image", () => {
      const onOriginalImagesChange = jest.fn();
      const originalImages = ["/images/original1.jpg", "/images/original2.jpg"];
      const uploadOptions: EnhancedFileUploadOptions = {
        preserveOriginal: true,
      };

      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          originalImages={originalImages}
          onOriginalImagesChange={onOriginalImagesChange}
          uploadOptions={uploadOptions}
        />,
      );

      // Find remove buttons in the original images section
      const removeButtons = screen.getAllByText("Remove");
      // Click the remove button for the first original image
      fireEvent.click(removeButtons[removeButtons.length - 2]);

      expect(onOriginalImagesChange).toHaveBeenCalledWith([
        "/images/original2.jpg",
      ]);
    });

    it("should call onThumbnailChange when setting image as thumbnail", () => {
      const onThumbnailChange = jest.fn();
      const images = ["/images/processed1.jpg"];

      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          images={images}
          onThumbnailChange={onThumbnailChange}
        />,
      );

      const thumbButton = screen.getByText("Thumb");
      fireEvent.click(thumbButton);

      expect(onThumbnailChange).toHaveBeenCalledWith("/images/processed1.jpg");
    });
  });

  describe("Manual URL Input", () => {
    it("should add image URL when Enter key is pressed", () => {
      const onImagesChange = jest.fn();
      const images = ["/images/existing.jpg"];

      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          images={images}
          onImagesChange={onImagesChange}
        />,
      );

      const urlInput = screen.getByPlaceholderText(
        "https://example.com/image.jpg",
      );
      fireEvent.change(urlInput, {
        target: { value: "https://example.com/new.jpg" },
      });
      fireEvent.keyDown(urlInput, { key: "Enter" });

      expect(onImagesChange).toHaveBeenCalledWith([
        "/images/existing.jpg",
        "https://example.com/new.jpg",
      ]);
    });

    it("should add image URL when Add button is clicked", () => {
      const onImagesChange = jest.fn();
      const images = ["/images/existing.jpg"];

      render(
        <EnhancedFileUploadSection
          {...defaultProps}
          images={images}
          onImagesChange={onImagesChange}
        />,
      );

      const urlInput = screen.getByPlaceholderText(
        "https://example.com/image.jpg",
      );
      const addButton = screen.getByText("Add");

      fireEvent.change(urlInput, {
        target: { value: "https://example.com/new.jpg" },
      });
      fireEvent.click(addButton);

      expect(onImagesChange).toHaveBeenCalledWith([
        "/images/existing.jpg",
        "https://example.com/new.jpg",
      ]);
    });
  });

  describe("Drag and Drop", () => {
    it("should handle drag over event", () => {
      render(<EnhancedFileUploadSection {...defaultProps} />);

      const dropZone = screen.getByText("Click to upload").closest("div");
      const dragOverEvent = new Event("dragover", { bubbles: true });
      Object.defineProperty(dragOverEvent, "preventDefault", {
        value: jest.fn(),
      });

      fireEvent(dropZone!, dragOverEvent);
      expect(dragOverEvent.preventDefault).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for form controls", () => {
      render(<EnhancedFileUploadSection {...defaultProps} />);

      expect(screen.getByLabelText("Skip Processing")).toBeInTheDocument();
      expect(screen.getByLabelText("Preserve Original")).toBeInTheDocument();
      expect(screen.getByLabelText("Generate Variants")).toBeInTheDocument();
      expect(
        screen.getByRole("combobox", { name: "Output Format" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Add Watermark")).toBeInTheDocument();
      expect(
        screen.getByRole("spinbutton", { name: "Max Width" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("spinbutton", { name: "Max Height" }),
      ).toBeInTheDocument();
    });

    it("should have proper button titles for image actions", () => {
      const images = ["/images/processed1.jpg"];
      render(<EnhancedFileUploadSection {...defaultProps} images={images} />);

      expect(screen.getByTitle("Set as thumbnail")).toBeInTheDocument();
      expect(screen.getByTitle("Remove image")).toBeInTheDocument();
    });
  });
});
