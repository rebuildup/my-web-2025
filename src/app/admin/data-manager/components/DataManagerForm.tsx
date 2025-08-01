"use client";

import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { TagManagementUI } from "@/components/ui/TagManagementUI";
import { clientDateManager } from "@/lib/portfolio/client-date-manager";
import { clientTagManager } from "@/lib/portfolio/client-tag-manager";
import { EnhancedContentItem } from "@/types";
import {
  ContentItem,
  getPortfolioCategoryOptions,
  isValidPortfolioCategory,
} from "@/types/content";
import { useEffect, useState } from "react";
import { DownloadInfoSection } from "./DownloadInfoSection";
import { ExternalLinksSection } from "./ExternalLinksSection";
import { FileUploadSection } from "./FileUploadSection";
import { MediaEmbedSection } from "./MediaEmbedSection";
import { SEOSection } from "./SEOSection";

interface DataManagerFormProps {
  item: ContentItem | EnhancedContentItem;
  onSave: (item: ContentItem | EnhancedContentItem) => void;
  onCancel: () => void;
  isLoading: boolean;
  saveStatus?: "idle" | "saving" | "success" | "error";
  enhanced?: boolean; // Flag to enable enhanced features
}

export function DataManagerForm({
  item,
  onSave,
  onCancel,
  isLoading,
  saveStatus = "idle",
  enhanced = false,
}: DataManagerFormProps) {
  const [formData, setFormData] = useState<ContentItem | EnhancedContentItem>(
    item,
  );
  const [activeTab, setActiveTab] = useState<
    "basic" | "media" | "links" | "download" | "seo" | "dates"
  >("basic");

  // Date management state for enhanced mode
  const [useManualDate, setUseManualDate] = useState<boolean>(
    (enhanced && (item as EnhancedContentItem).useManualDate) || false,
  );

  useEffect(() => {
    setFormData(item);
  }, [item]);

  const handleInputChange = (
    field: keyof (ContentItem | EnhancedContentItem),
    value: unknown,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleDateChange = (date: string) => {
    if (enhanced) {
      const enhancedItem = formData as EnhancedContentItem;
      setFormData({
        ...enhancedItem,
        manualDate: date,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleToggleManualDate = (use: boolean) => {
    setUseManualDate(use);
    if (enhanced) {
      const enhancedItem = formData as EnhancedContentItem;
      setFormData({
        ...enhancedItem,
        useManualDate: use,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleTagsChange = (tags: string[]) => {
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
      formData.category &&
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
        {enhanced && (
          <button
            type="button"
            onClick={() => setActiveTab("dates")}
            className={activeTab === "dates" ? activeTabStyle : tabStyle}
          >
            Date Management
          </button>
        )}
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
                  value={formData.category || ""}
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
            <label className={labelStyle}>Tags</label>
            <TagManagementUI
              selectedTags={formData.tags || []}
              onChange={handleTagsChange}
              tagManager={clientTagManager}
              allowNewTags={true}
              maxTags={10}
              placeholder="Search or add tags..."
              className="mt-1"
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

      {activeTab === "dates" && enhanced && (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Date Management
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Control how dates are managed for this content item. You can
              either use automatic date management (based on creation/update
              time) or set a manual date.
            </p>

            <DatePicker
              value={(formData as EnhancedContentItem).manualDate}
              onChange={handleDateChange}
              useManualDate={useManualDate}
              onToggleManualDate={handleToggleManualDate}
              placeholder="Select a date..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Current Date Information
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div>
                <span className="font-medium">Created:</span>{" "}
                {new Date(formData.createdAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {new Date(
                  formData.updatedAt || formData.createdAt,
                ).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                })}
              </div>
              {enhanced && (formData as EnhancedContentItem).manualDate && (
                <div>
                  <span className="font-medium">Manual Date:</span>{" "}
                  {new Date(
                    (formData as EnhancedContentItem).manualDate!,
                  ).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  })}
                </div>
              )}
              <div>
                <span className="font-medium">Effective Date:</span>{" "}
                {enhanced
                  ? clientDateManager
                      .getEffectiveDate(formData as EnhancedContentItem)
                      .toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })
                  : new Date(formData.createdAt).toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "short",
                    })}
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">
              Date History
            </h4>
            <p className="text-sm text-yellow-800">
              Date changes are automatically tracked. The effective date will be
              used for sorting and display purposes throughout the application.
            </p>
          </div>
        </div>
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
