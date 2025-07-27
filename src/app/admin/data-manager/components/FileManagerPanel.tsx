"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  FileText,
  Image as ImageIcon,
  Video,
  Trash2,
  Eye,
  Copy,
  RotateCcw,
  Archive,
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  createdAt: string;
  category: string;
  versions?: Array<{
    type: string;
    url: string;
    size: number;
  }>;
  metadata?: Record<string, unknown>;
}

interface FileManagerPanelProps {
  onFileSelect?: (file: FileItem) => void;
  category?: string;
}

export function FileManagerPanel({
  onFileSelect,
  category,
}: FileManagerPanelProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "date" | "size" | "type">(
    "date",
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBackups, setShowBackups] = useState(false);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/files${category ? `?category=${category}` : ""}`,
      );
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Load files
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Filter and sort files
  const filteredFiles = files
    .filter((file) => {
      if (filterType !== "all" && !file.type.startsWith(filterType))
        return false;
      if (
        searchQuery &&
        !file.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.size - a.size;
        case "type":
          return a.type.localeCompare(b.type);
        case "date":
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

  const handleFileSelect = (file: FileItem) => {
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(`/api/admin/files/${fileId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        setSelectedFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;
    if (
      !confirm(`Are you sure you want to delete ${selectedFiles.size} files?`)
    )
      return;

    try {
      const response = await fetch("/api/admin/files/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: Array.from(selectedFiles) }),
      });

      if (response.ok) {
        setFiles((prev) => prev.filter((f) => !selectedFiles.has(f.id)));
        setSelectedFiles(new Set());
      }
    } catch (error) {
      console.error("Failed to delete files:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    if (type.startsWith("video/")) return <Video className="w-4 h-4" />;
    if (type.includes("zip") || type.includes("archive"))
      return <Archive className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const inputStyle =
    "border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent";
  const buttonStyle =
    "border border-foreground px-3 py-1 text-xs hover:bg-foreground hover:text-background transition-colors";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-700">File Manager</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className={buttonStyle}
          >
            {viewMode === "grid" ? "List" : "Grid"}
          </button>
          <button
            onClick={() => setShowBackups(!showBackups)}
            className={buttonStyle}
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Backups
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={inputStyle}
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={inputStyle}
        >
          <option value="all">All Types</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="application">Documents</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "name" | "date" | "size" | "type")
          }
          className={inputStyle}
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
          <option value="type">Sort by Type</option>
        </select>

        {selectedFiles.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="bg-red-500 text-white px-3 py-2 text-sm hover:bg-red-600 transition-colors"
          >
            Delete Selected ({selectedFiles.size})
          </button>
        )}
      </div>

      {/* File Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${
                selectedFiles.has(file.id)
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <div className="aspect-square bg-gray-100 rounded mb-2 flex items-center justify-center overflow-hidden relative">
                {file.type.startsWith("image/") ? (
                  <Image
                    src={file.url}
                    alt={file.name || "File preview"}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (
                        e.target as HTMLImageElement
                      ).nextElementSibling!.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div
                  className={`${file.type.startsWith("image/") ? "hidden" : ""} text-gray-400`}
                >
                  {getFileIcon(file.type)}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
                {file.versions && (
                  <p className="text-xs text-blue-600">
                    {file.versions.length} versions
                  </p>
                )}
              </div>

              <div className="flex justify-between items-center mt-2">
                <input
                  type="checkbox"
                  checked={selectedFiles.has(file.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    const newSet = new Set(selectedFiles);
                    if (e.target.checked) {
                      newSet.add(file.id);
                    } else {
                      newSet.delete(file.id);
                    }
                    setSelectedFiles(newSet);
                  }}
                  className="rounded border-gray-300"
                />

                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(file.url, "_blank");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="View"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(file.url);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    title="Copy URL"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDelete(file.id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer ${
                selectedFiles.has(file.id)
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
              onClick={() => handleFileSelect(file)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      const newSet = new Set(selectedFiles);
                      if (e.target.checked) {
                        newSet.add(file.id);
                      } else {
                        newSet.delete(file.id);
                      }
                      setSelectedFiles(newSet);
                    }}
                    className="rounded border-gray-300"
                  />

                  {getFileIcon(file.type)}

                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} •{" "}
                      {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {file.versions && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                      {file.versions.length} versions
                    </span>
                  )}

                  <div className="flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(file.url, "_blank");
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(file.url);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-1"
                      title="Copy URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileDelete(file.id);
                      }}
                      className="text-gray-400 hover:text-red-600 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredFiles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No files found</p>
          {searchQuery && (
            <p className="text-sm">Try adjusting your search or filters</p>
          )}
        </div>
      )}
    </div>
  );
}
