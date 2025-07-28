"use client";

import { useState, useEffect } from "react";
import {
  ContentItem,
  getPortfolioCategoryOptions,
  isValidPortfolioCategory,
} from "@/types/content";
import { Select } from "@/components/ui/Select";
import { FileUploadSection } from "./FileUploadSection";
import { MediaEmbedSection } from "./MediaEmbedSection";
import { ExternalLinksSection } from "./ExternalLinksSection";
import { DownloadInfoSection } from "./DownloadInfoSection";
import { SEOSection } from "./SEOSection";

interface DataManagerFormProps {
  item: ContentItem;
  onSave: (item: ContentItem) => void;
  onCancel: () => void;
  isLoading: boolean;
  saveStatus?: "idle" | "saving" | "success" | "error";
}

export function DataManagerForm({
  item,
  onSave,
  onCancel,
  isLoading,
  saveStatus = "idle",
}: DataManagerFormProps) {
  const [formData, setFormData] = useState<ContentItem>(item);
  const [activeTab, setActiveTab] = useState<
    "basic" | "media" | "links" | "download" | "seo"
  >("basic");

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleInputChange = (field: keyof ContentItem, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    handleInputChange("tags", tags);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== Form submission started ===");
    console.log("Original form data:", JSON.stringify(formData, null, 2));

    // Basic validation
    if (!formData.title.trim()) {
      console.error("Validation failed: Title is required");
      alert("Title is required");
      return;
    }

    // Portfolio category validation
    if (formData.type === "portfolio" && !formData.category) {
      console.error("Validation failed: Portfolio category is required");
      alert("Please select a category for portfolio items");
      return;
    }

    if (
      formData.type === "portfolio" &&
      !isValidPortfolioCategory(formData.category)
    ) {
      console.error("Validation failed: Invalid portfolio category");
      alert("Please select a valid portfolio category");
      return;
    }

    // Filter out empty external links
    const validExternalLinks = (formData.externalLinks || []).filter(
      (link) => link.url.trim() && link.title.trim(),
    );

    // Ensure required fields are set
    const dataToSave = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description || "",
      category: formData.category || "",
      tags: formData.tags || [],
      videos: formData.videos || [],
      images: formData.images || [],
      externalLinks: validExternalLinks,
      updatedAt: new Date().toISOString(),
    };

    console.log("Data to save:", JSON.stringify(dataToSave, null, 2));
    console.log("Calling onSave...");
    onSave(dataToSave);
  };

  const inputStyle =
    "w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent rounded-md";

  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";
  const buttonStyle =
    "border border-foreground px-4 py-2 text-sm hover:bg-foreground hover:text-background transition-colors rounded-md";
  const activeTabStyle =
    "border border-foreground px-4 py-2 text-sm bg-foreground text-background rounded-md";
  const tabStyle =
    "border border-foreground px-4 py-2 text-sm hover:bg-gray-100 transition-colors rounded-md";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("basic")}
          className={activeTab === "basic" ? activeTabStyle : tabStyle}
        >
          Basic Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("media")}
          className={activeTab === "media" ? activeTabStyle : tabStyle}
        >
          Media
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("links")}
          className={activeTab === "links" ? activeTabStyle : tabStyle}
        >
          Links
        </button>
        {formData.type === "download" && (
          <button
            type="button"
            onClick={() => setActiveTab("download")}
            className={activeTab === "download" ? activeTabStyle : tabStyle}
          >
            Download
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={activeTab === "seo" ? activeTabStyle : tabStyle}
        >
          SEO
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "basic" && (
        <div className="space-y-4">
          <div>
            <label className={labelStyle}>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`${inputStyle} h-24 resize-vertical`}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Category</label>
              {formData.type === "portfolio" ? (
                <Select
                  value={formData.category}
                  onChange={(value) => handleInputChange("category", value)}
                  options={getPortfolioCategoryOptions()}
                  placeholder="Select Category"
                  variant="admin"
                />
              ) : (
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className={inputStyle}
                  placeholder="Enter category"
                />
              )}
            </div>

            <div>
              <label className={labelStyle}>Status</label>
              <Select
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
                options={[
                  { value: "draft", label: "Draft" },
                  { value: "published", label: "Published" },
                  { value: "archived", label: "Archived" },
                  { value: "scheduled", label: "Scheduled" },
                ]}
                variant="admin"
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags.join(", ")}
              onChange={(e) => handleTagsChange(e.target.value)}
              className={inputStyle}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div>
            <label className={labelStyle}>Priority (0-100)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.priority}
              onChange={(e) =>
                handleInputChange("priority", parseInt(e.target.value))
              }
              className={inputStyle}
            />
          </div>

          <div>
            <label className={labelStyle}>Content (Markdown)</label>
            <textarea
              value={formData.content || ""}
              onChange={(e) => handleInputChange("content", e.target.value)}
              className={`${inputStyle} h-48 resize-vertical font-mono`}
              rows={10}
              placeholder="Enter Markdown content here..."
            />
          </div>
        </div>
      )}

      {activeTab === "media" && (
        <div className="space-y-6">
          <FileUploadSection
            images={formData.images || []}
            thumbnail={formData.thumbnail}
            onImagesChange={(images) => handleInputChange("images", images)}
            onThumbnailChange={(thumbnail) =>
              handleInputChange("thumbnail", thumbnail)
            }
          />

          <MediaEmbedSection
            videos={formData.videos || []}
            onVideosChange={(videos) => handleInputChange("videos", videos)}
          />
        </div>
      )}

      {activeTab === "links" && (
        <ExternalLinksSection
          links={formData.externalLinks || []}
          onLinksChange={(links) => handleInputChange("externalLinks", links)}
        />
      )}

      {activeTab === "download" && formData.type === "download" && (
        <DownloadInfoSection
          downloadInfo={formData.downloadInfo}
          onDownloadInfoChange={(downloadInfo) =>
            handleInputChange("downloadInfo", downloadInfo)
          }
        />
      )}

      {activeTab === "seo" && (
        <SEOSection
          seo={formData.seo}
          onSEOChange={(seo) => handleInputChange("seo", seo)}
        />
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className={buttonStyle}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${buttonStyle} bg-primary text-white border-primary hover:bg-primary-dark ${
            saveStatus === "success" ? "bg-green-600 border-green-600" : ""
          } ${saveStatus === "error" ? "bg-red-600 border-red-600" : ""}`}
          disabled={isLoading}
        >
          {saveStatus === "saving" && "Saving..."}
          {saveStatus === "success" && "✓ Saved"}
          {saveStatus === "error" && "✗ Error"}
          {saveStatus === "idle" && (isLoading ? "Saving..." : "Save")}
        </button>
      </div>
    </form>
  );
}
