"use client";

import { ContentItem } from "@/types/content";
import { useState } from "react";

interface PreviewPanelProps {
  item: ContentItem;
  onEdit: () => void;
}

export function PreviewPanel({ item, onEdit }: PreviewPanelProps) {
  const [previewMode, setPreviewMode] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-2xl";
      default:
        return "max-w-full";
    }
  };

  const buttonStyle =
    "border border-foreground px-3 py-1 text-xs hover:bg-foreground hover:text-background transition-colors";
  const activeButtonStyle =
    "border border-foreground px-3 py-1 text-xs bg-foreground text-background";

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setPreviewMode("desktop")}
            className={
              previewMode === "desktop" ? activeButtonStyle : buttonStyle
            }
          >
            Desktop
          </button>
          <button
            onClick={() => setPreviewMode("tablet")}
            className={
              previewMode === "tablet" ? activeButtonStyle : buttonStyle
            }
          >
            Tablet
          </button>
          <button
            onClick={() => setPreviewMode("mobile")}
            className={
              previewMode === "mobile" ? activeButtonStyle : buttonStyle
            }
          >
            Mobile
          </button>
        </div>

        <button onClick={onEdit} className={buttonStyle}>
          Edit
        </button>
      </div>

      {/* Preview Content */}
      <div
        className={`mx-auto ${getPreviewWidth()} transition-all duration-300`}
      >
        <div className="border border-gray-300 bg-white shadow-lg">
          {/* Preview Header */}
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <div className="flex justify-between items-center text-xs text-gray-600">
              <span>Preview Mode: {previewMode}</span>
              <span>Type: {item.type}</span>
            </div>
          </div>

          {/* Content Preview */}
          <div className="p-6 space-y-6">
            {/* Title and Status */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h1 className="neue-haas-grotesk-display text-2xl text-primary">
                  {item.title || "Untitled"}
                </h1>
                <span
                  className={`px-2 py-1 text-xs rounded ${getStatusColor(item.status)}`}
                >
                  {item.status}
                </span>
              </div>

              {item.description && (
                <p className="noto-sans-jp-light text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {item.category && (
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="ml-2 text-gray-600">{item.category}</span>
                </div>
              )}

              <div>
                <span className="font-medium text-gray-700">Priority:</span>
                <span className="ml-2 text-gray-600">{item.priority}/100</span>
              </div>

              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="ml-2 text-gray-600">
                  {formatDate(item.createdAt)}
                </span>
              </div>

              {item.updatedAt && (
                <div>
                  <span className="font-medium text-gray-700">Updated:</span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(item.updatedAt)}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {item.images && item.images.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {item.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-gray-100 border border-gray-200 rounded overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0cHgiIGZpbGw9IiM5OTk5OTkiPkltYWdlPC90ZXh0Pjwvc3ZnPg==";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {item.videos && item.videos.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Videos</h3>
                <div className="space-y-2">
                  {item.videos.map((video, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 p-3 rounded"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          {video.title || "Untitled Video"}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {video.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{video.url}</p>
                      {video.description && (
                        <p className="text-xs text-gray-600">
                          {video.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {item.externalLinks && item.externalLinks.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  External Links
                </h3>
                <div className="space-y-2">
                  {item.externalLinks.map((link, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 p-3 rounded"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">
                          {link.title}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {link.type}
                        </span>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline block mb-1"
                      >
                        {link.url}
                      </a>
                      {link.description && (
                        <p className="text-xs text-gray-600">
                          {link.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content */}
            {item.content && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Content</h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                    {item.content}
                  </pre>
                </div>
              </div>
            )}

            {/* Download Info */}
            {item.downloadInfo && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Download Information
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">File:</span>
                      <span className="ml-2">{item.downloadInfo.fileName}</span>
                    </div>
                    <div>
                      <span className="font-medium">Size:</span>
                      <span className="ml-2">
                        {(item.downloadInfo.fileSize / 1024 / 1024).toFixed(2)}{" "}
                        MB
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <span className="ml-2">{item.downloadInfo.fileType}</span>
                    </div>
                    <div>
                      <span className="font-medium">Downloads:</span>
                      <span className="ml-2">
                        {item.downloadInfo.downloadCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SEO Information */}
            {item.seo && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  SEO Information
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded space-y-2">
                  {item.seo.title && (
                    <div>
                      <span className="font-medium text-sm">Title:</span>
                      <span className="ml-2 text-sm">{item.seo.title}</span>
                    </div>
                  )}
                  {item.seo.description && (
                    <div>
                      <span className="font-medium text-sm">Description:</span>
                      <span className="ml-2 text-sm">
                        {item.seo.description}
                      </span>
                    </div>
                  )}
                  {item.seo.keywords && item.seo.keywords.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">Keywords:</span>
                      <span className="ml-2 text-sm">
                        {item.seo.keywords.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
