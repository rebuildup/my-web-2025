"use client";

import { useState, useRef, useCallback } from "react";
import {
  validateFile,
  extractFileMetadata,
  compressFileIfNeeded,
  FileProcessingOptions,
} from "@/lib/utils/file-processing";

interface FileUploadSectionProps {
  images: string[];
  thumbnail?: string;
  onImagesChange: (images: string[]) => void;
  onThumbnailChange: (thumbnail: string | undefined) => void;
}

interface UploadProgress {
  filename: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
}

export function FileUploadSection({
  images,
  thumbnail,
  onImagesChange,
  onThumbnailChange,
}: FileUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [processingOptions, setProcessingOptions] =
    useState<FileProcessingOptions>({
      generateThumbnail: true,
      optimizeImage: true,
      convertToWebP: true,
      quality: 85,
      thumbnailSize: 300,
      maxWidth: 1920,
      maxHeight: 1080,
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

    const uploadedUrls: string[] = [];

    try {
      for (const file of fileArray) {
        try {
          // Validate file
          const validation = validateFile(file, "image");
          if (!validation.valid) {
            updateProgress(file.name, {
              status: "error",
              error: validation.error,
            });
            continue;
          }

          updateProgress(file.name, { progress: 10 });

          // Extract metadata
          console.log("Extracting metadata for file:", file.name);
          let metadata;
          try {
            metadata = await extractFileMetadata(file);
            console.log("Metadata extracted successfully:", metadata);
          } catch (metadataError) {
            console.warn(
              "Failed to extract metadata, using basic info:",
              metadataError,
            );
            metadata = {
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              hash: "unknown",
            };
          }
          updateProgress(file.name, { progress: 20 });

          // Compress if needed
          let processedFile = file;
          if (file.size > 5 * 1024 * 1024) {
            // 5MB
            console.log("File is large, attempting compression:", file.size);
            try {
              processedFile = await compressFileIfNeeded(file);
              console.log(
                "File compressed successfully, new size:",
                processedFile.size,
              );
            } catch (compressionError) {
              console.warn(
                "File compression failed, using original:",
                compressionError,
              );
              processedFile = file;
            }
            updateProgress(file.name, { progress: 40 });
          }

          updateProgress(file.name, {
            progress: 50,
            status: "processing",
          });

          // Skip client-side FFmpeg processing for now
          // Server-side Sharp processing will handle image optimization
          console.log(
            "Skipping client-side FFmpeg processing, will use server-side Sharp instead",
          );

          // Upload original file with processing options
          const formData = new FormData();
          formData.append("file", processedFile);
          formData.append("type", "portfolio");
          formData.append("metadata", JSON.stringify(metadata));
          formData.append(
            "processingOptions",
            JSON.stringify(processingOptions),
          );

          console.log(
            "Uploading file with processing options:",
            processingOptions,
          );
          console.log("Starting upload request for file:", file.name);

          try {
            const response = await fetch("/api/admin/upload", {
              method: "POST",
              body: formData,
              // Add timeout for large file uploads
              signal: AbortSignal.timeout(60000), // 60 seconds timeout
            });

            console.log(
              "Upload request completed, response status:",
              response.status,
            );
            updateProgress(file.name, { progress: 90 });

            if (response.ok) {
              const result = await response.json();
              console.log("Upload successful:", result);

              // Use the main file URL
              if (result.files && result.files.length > 0) {
                uploadedUrls.push(result.files[0].url);
              } else if (result.urls && result.urls.length > 0) {
                uploadedUrls.push(...result.urls);
              }

              updateProgress(file.name, {
                progress: 100,
                status: "complete",
              });
            } else {
              const errorData = await response.json();
              console.error("Upload failed:", errorData);
              updateProgress(file.name, {
                status: "error",
                error: errorData.error || "Upload failed",
              });
            }
          } catch (uploadError) {
            console.error("Upload request failed:", uploadError);
            updateProgress(file.name, {
              status: "error",
              error:
                uploadError instanceof Error
                  ? uploadError.message
                  : "Upload request failed",
            });
          }
        } catch (error) {
          updateProgress(file.name, {
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      // Update images list with successfully uploaded files
      if (uploadedUrls.length > 0) {
        const newImages = [...images, ...uploadedUrls];
        onImagesChange(newImages);

        // Set first uploaded image as thumbnail if no thumbnail exists
        if (!thumbnail && uploadedUrls.length > 0) {
          onThumbnailChange(uploadedUrls[0]);
        }
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

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);

    // If removed image was thumbnail, clear thumbnail
    if (thumbnail === images[index]) {
      onThumbnailChange(undefined);
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
      <h3 className="font-medium text-gray-700">Images & Files</h3>

      {/* Processing Options */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Processing Options
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={processingOptions.generateThumbnail}
              onChange={(e) =>
                setProcessingOptions((prev) => ({
                  ...prev,
                  generateThumbnail: e.target.checked,
                }))
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Generate Thumbnails</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={processingOptions.optimizeImage}
              onChange={(e) =>
                setProcessingOptions((prev) => ({
                  ...prev,
                  optimizeImage: e.target.checked,
                }))
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Optimize Images</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={processingOptions.convertToWebP}
              onChange={(e) =>
                setProcessingOptions((prev) => ({
                  ...prev,
                  convertToWebP: e.target.checked,
                }))
              }
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Convert to WebP</span>
          </label>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Quality:</label>
            <input
              type="range"
              min="20"
              max="100"
              value={processingOptions.quality}
              onChange={(e) =>
                setProcessingOptions((prev) => ({
                  ...prev,
                  quality: parseInt(e.target.value),
                }))
              }
              className="flex-1"
            />
            <span className="text-xs text-gray-500 w-8">
              {processingOptions.quality}%
            </span>
          </div>
        </div>
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
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>

      {/* Thumbnail Selection */}
      {images.length > 0 && (
        <div>
          <label className={labelStyle}>Thumbnail</label>
          <select
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
                Image {index + 1}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Uploaded Images ({images.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 border border-gray-200 rounded overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual URL Input */}
      <div>
        <label className={labelStyle}>Add Image URL</label>
        <div className="flex gap-2">
          <input
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
