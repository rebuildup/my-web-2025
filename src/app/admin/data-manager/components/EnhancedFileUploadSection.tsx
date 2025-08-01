"use client";

import { EnhancedFileUploadOptions, FileUploadResult } from "@/types";
import { useCallback, useRef, useState } from "react";

interface EnhancedFileUploadSectionProps {
  images: string[];
  originalImages?: string[];
  thumbnail?: string;
  onImagesChange: (images: string[]) => void;
  onOriginalImagesChange?: (images: string[]) => void;
  onThumbnailChange: (thumbnail: string | undefined) => void;
  uploadOptions?: EnhancedFileUploadOptions;
  onUploadOptionsChange?: (options: EnhancedFileUploadOptions) => void;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
  result?: FileUploadResult;
}

export function EnhancedFileUploadSection({
  images,
  originalImages = [],
  thumbnail,
  onImagesChange,
  onOriginalImagesChange,
  onThumbnailChange,
  uploadOptions = {},
  onUploadOptionsChange,
}: EnhancedFileUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [options, setOptions] = useState<EnhancedFileUploadOptions>({
    skipProcessing: false,
    preserveOriginal: true,
    generateVariants: false,
    customProcessing: {
      resize: { width: 1920, height: 1080 },
      format: "jpeg",
      watermark: false,
    },
    ...uploadOptions,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProgress = useCallback(
    (filename: string, updates: Partial<UploadProgress>) => {
      setUploadProgress((prev) =>
        prev.map((p) => (p.filename === filename ? { ...p, ...updates } : p)),
      );
    },
    [],
  );

  const handleOptionsChange = (
    newOptions: Partial<EnhancedFileUploadOptions>,
  ) => {
    const updatedOptions = { ...options, ...newOptions };
    setOptions(updatedOptions);
    onUploadOptionsChange?.(updatedOptions);
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    const fileArray = Array.from(files);

    // Initialize progress tracking
    const initialProgress = fileArray.map((file) => ({
      filename: file.name,
      progress: 0,
      status: "uploading" as const,
    }));
    setUploadProgress(initialProgress);

    const uploadedImages: string[] = [];
    const uploadedOriginals: string[] = [];

    try {
      for (const file of fileArray) {
        try {
          updateProgress(file.name, { progress: 10 });

          // Create form data for API upload
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", "portfolio");
          formData.append("processingOptions", JSON.stringify(options));

          updateProgress(file.name, { progress: 30 });

          // Upload via API
          const response = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          updateProgress(file.name, { progress: 70 });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Upload failed");
          }

          const result = await response.json();

          updateProgress(file.name, {
            progress: 90,
            status: "processing",
            result: result.files?.[0],
          });

          // Handle different result types
          const fileResult = result.files?.[0];
          if (!fileResult) {
            throw new Error("No file result returned");
          }

          // Add URLs to appropriate arrays
          if (options.skipProcessing && fileResult.originalUrl) {
            uploadedOriginals.push(fileResult.originalUrl);
          } else {
            if (fileResult.processedUrl) {
              uploadedImages.push(fileResult.processedUrl);
            } else if (fileResult.url) {
              uploadedImages.push(fileResult.url);
            }

            if (fileResult.originalUrl && options.preserveOriginal) {
              uploadedOriginals.push(fileResult.originalUrl);
            }
          }

          updateProgress(file.name, {
            progress: 100,
            status: "complete",
          });
        } catch (error) {
          updateProgress(file.name, {
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          });
        }
      }

      // Update state with uploaded files
      if (uploadedImages.length > 0) {
        const newImages = [...images, ...uploadedImages];
        onImagesChange(newImages);

        // Set first uploaded image as thumbnail if no thumbnail exists
        if (!thumbnail && uploadedImages.length > 0) {
          onThumbnailChange(uploadedImages[0]);
        }
      }

      if (uploadedOriginals.length > 0 && onOriginalImagesChange) {
        const newOriginals = [...originalImages, ...uploadedOriginals];
        onOriginalImagesChange(newOriginals);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      // Clear progress after a delay
      setTimeout(() => setUploadProgress([]), 3000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = (index: number, isOriginal = false) => {
    if (isOriginal && onOriginalImagesChange) {
      const newOriginals = originalImages.filter((_, i) => i !== index);
      onOriginalImagesChange(newOriginals);
    } else {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);

      // If removed image was thumbnail, clear thumbnail
      if (thumbnail === images[index]) {
        onThumbnailChange(undefined);
      }
    }
  };

  const setAsThumbnail = (imageUrl: string) => {
    onThumbnailChange(imageUrl);
  };

  const inputStyle =
    "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const buttonStyle =
    "border border-foreground px-3 py-1 text-xs hover:bg-foreground hover:text-background transition-colors";

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-700">Enhanced File Upload</h3>

      {/* Enhanced Processing Options */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Upload Options
        </h4>

        {/* Basic Options */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.skipProcessing}
              onChange={(e) =>
                handleOptionsChange({ skipProcessing: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Skip Processing</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.preserveOriginal}
              onChange={(e) =>
                handleOptionsChange({ preserveOriginal: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Preserve Original</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={options.generateVariants}
              onChange={(e) =>
                handleOptionsChange({ generateVariants: e.target.checked })
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Generate Variants</span>
          </label>
        </div>

        {/* Custom Processing Options */}
        {!options.skipProcessing && (
          <div className="border-t pt-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Custom Processing
            </h5>

            <div className="grid grid-cols-2 gap-4">
              {/* Format Selection */}
              <div>
                <label htmlFor="output-format" className={labelStyle}>
                  Output Format
                </label>
                <select
                  id="output-format"
                  value={options.customProcessing?.format || "jpeg"}
                  onChange={(e) =>
                    handleOptionsChange({
                      customProcessing: {
                        ...options.customProcessing,
                        format: e.target.value as "jpeg" | "png" | "webp",
                      },
                    })
                  }
                  className={inputStyle}
                >
                  <option value="jpeg">JPEG</option>
                  <option value="png">PNG</option>
                  <option value="webp">WebP</option>
                </select>
              </div>

              {/* Watermark Option */}
              <label
                htmlFor="add-watermark"
                className="flex items-center space-x-2 pt-6"
              >
                <input
                  id="add-watermark"
                  type="checkbox"
                  checked={options.customProcessing?.watermark || false}
                  onChange={(e) =>
                    handleOptionsChange({
                      customProcessing: {
                        ...options.customProcessing,
                        watermark: e.target.checked,
                      },
                    })
                  }
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-600">Add Watermark</span>
              </label>

              {/* Resize Options */}
              <div>
                <label htmlFor="max-width" className={labelStyle}>
                  Max Width
                </label>
                <input
                  id="max-width"
                  type="number"
                  value={options.customProcessing?.resize?.width || 1920}
                  onChange={(e) =>
                    handleOptionsChange({
                      customProcessing: {
                        ...options.customProcessing,
                        resize: {
                          ...options.customProcessing?.resize,
                          width: parseInt(e.target.value) || 1920,
                          height:
                            options.customProcessing?.resize?.height || 1080,
                        },
                      },
                    })
                  }
                  className={inputStyle}
                  min="100"
                  max="4000"
                />
              </div>

              <div>
                <label htmlFor="max-height" className={labelStyle}>
                  Max Height
                </label>
                <input
                  id="max-height"
                  type="number"
                  value={options.customProcessing?.resize?.height || 1080}
                  onChange={(e) =>
                    handleOptionsChange({
                      customProcessing: {
                        ...options.customProcessing,
                        resize: {
                          width:
                            options.customProcessing?.resize?.width || 1920,
                          height: parseInt(e.target.value) || 1080,
                        },
                      },
                    })
                  }
                  className={inputStyle}
                  min="100"
                  max="4000"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Upload Progress
          </h4>
          <div className="space-y-2">
            {uploadProgress.map((progress) => (
              <div key={progress.filename} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate flex-1">
                    {progress.filename}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">
                    {progress.status === "complete"
                      ? "Complete"
                      : progress.status === "error"
                        ? "Error"
                        : progress.status === "processing"
                          ? "Processing"
                          : `${progress.progress}%`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.status === "complete"
                        ? "bg-green-500"
                        : progress.status === "error"
                          ? "bg-red-500"
                          : progress.status === "processing"
                            ? "bg-blue-500"
                            : "bg-blue-400"
                    }`}
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
                {progress.error && (
                  <p className="text-xs text-red-600">{progress.error}</p>
                )}
                {progress.result && progress.status === "complete" && (
                  <div className="text-xs text-green-600">
                    {progress.result.isDuplicate && "Duplicate detected - "}
                    {progress.result.originalUrl && "Original saved"}
                    {progress.result.processedUrl && " • Processed saved"}
                    {progress.result.variants &&
                      ` • ${Object.keys(progress.result.variants).length} variants`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />

        {isUploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400">
              <svg
                className="mx-auto h-12 w-12"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:text-primary-dark font-medium"
              >
                Click to upload
              </button>
              <span className="text-gray-600"> or drag and drop</span>
            </div>
            <p className="text-xs text-gray-500">
              {options.skipProcessing
                ? "Files will be uploaded without processing"
                : "Images will be processed according to your settings"}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail Selection */}
      {images.length > 0 && (
        <div>
          <label htmlFor="thumbnail-select" className={labelStyle}>
            Thumbnail
          </label>
          <select
            id="thumbnail-select"
            value={thumbnail || ""}
            onChange={(e) => onThumbnailChange(e.target.value || undefined)}
            className={`${inputStyle} bg-background text-foreground`}
          >
            <option value="" className="bg-background text-foreground">
              Select thumbnail...
            </option>
            {images.map((image, index) => (
              <option
                key={index}
                value={image}
                className="bg-background text-foreground"
              >
                Processed Image {index + 1}
              </option>
            ))}
            {originalImages.map((image, index) => (
              <option
                key={`orig-${index}`}
                value={image}
                className="bg-background text-foreground"
              >
                Original Image {index + 1}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Processed Images Gallery */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Processed Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 border border-gray-200 rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Processed ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTk5OTkiPkVycm9yPC90ZXh0Pjwvc3ZnPg==";
                    }}
                  />
                </div>

                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setAsThumbnail(image)}
                    className="bg-white text-black px-2 py-1 text-xs rounded hover:bg-gray-100"
                    title="Set as thumbnail"
                  >
                    Thumb
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                    title="Remove image"
                  >
                    Remove
                  </button>
                </div>

                {/* Thumbnail Indicator */}
                {thumbnail === image && (
                  <div className="absolute top-1 left-1 bg-primary text-white px-2 py-1 text-xs rounded">
                    Thumbnail
                  </div>
                )}

                {/* Processed Indicator */}
                <div className="absolute top-1 right-1 bg-blue-500 text-white px-2 py-1 text-xs rounded">
                  Processed
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Original Images Gallery */}
      {originalImages.length > 0 && options.preserveOriginal && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Original Images ({originalImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {originalImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 border border-gray-200 rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Original ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTk5OTkiPkVycm9yPC90ZXh0Pjwvc3ZnPg==";
                    }}
                  />
                </div>

                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setAsThumbnail(image)}
                    className="bg-white text-black px-2 py-1 text-xs rounded hover:bg-gray-100"
                    title="Set as thumbnail"
                  >
                    Thumb
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index, true)}
                    className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                    title="Remove image"
                  >
                    Remove
                  </button>
                </div>

                {/* Thumbnail Indicator */}
                {thumbnail === image && (
                  <div className="absolute top-1 left-1 bg-primary text-white px-2 py-1 text-xs rounded">
                    Thumbnail
                  </div>
                )}

                {/* Original Indicator */}
                <div className="absolute top-1 right-1 bg-green-500 text-white px-2 py-1 text-xs rounded">
                  Original
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual URL Input */}
      <div>
        <label htmlFor="manual-url" className={labelStyle}>
          Add Image URL
        </label>
        <div className="flex gap-2">
          <input
            id="manual-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            className={`${inputStyle} flex-1`}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const input = e.target as HTMLInputElement;
                if (input.value.trim()) {
                  onImagesChange([...images, input.value.trim()]);
                  input.value = "";
                }
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = (e.target as HTMLButtonElement)
                .previousElementSibling as HTMLInputElement;
              if (input.value.trim()) {
                onImagesChange([...images, input.value.trim()]);
                input.value = "";
              }
            }}
            className={buttonStyle}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
