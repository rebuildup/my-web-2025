"use client";

import { DatePicker } from "@/components/ui/DatePicker";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { Select } from "@/components/ui/Select";
import { TagManagementUI } from "@/components/ui/TagManagementUI";
import { clientDateManager } from "@/lib/portfolio/client-date-manager";
import { clientTagManager } from "@/lib/portfolio/client-tag-manager";

import { MultiCategorySelector } from "@/components/ui/MultiCategorySelector";
import {
  EnhancedCategoryType,
  EnhancedContentItem,
  EnhancedFileUploadOptions,
  isEnhancedContentItem,
  isValidEnhancedPortfolioCategory,
} from "@/types";
import {
  ContentItem,
  getPortfolioCategoryOptions,
  isValidPortfolioCategory,
} from "@/types/content";
import { useEffect, useState } from "react";
import { DownloadInfoSection } from "./DownloadInfoSection";
import { EnhancedFileUploadSection } from "./EnhancedFileUploadSection";
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

  // Enhanced file upload options state
  const [uploadOptions, setUploadOptions] = useState<EnhancedFileUploadOptions>(
    {
      skipProcessing: false,
      preserveOriginal: true,
      generateVariants: false,
      customProcessing: {
        resize: { width: 1920, height: 1080 },
        format: "jpeg",
        watermark: false,
      },
    },
  );

  // Markdown editor state
  const [markdownFilePath] = useState<string | undefined>(
    enhanced ? (item as EnhancedContentItem).markdownPath : undefined,
  );

  useEffect(() => {
    setFormData(item);

    // Migration check is handled in the UI render
  }, [item, enhanced]);

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

  const handleEnhancedInputChange = (
    field: keyof EnhancedContentItem,
    value: unknown,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Category change impact analysis
  const [categoryChangeImpact, setCategoryChangeImpact] = useState<{
    show: boolean;
    oldCategories: EnhancedCategoryType[];
    newCategories: EnhancedCategoryType[];
    impacts: string[];
  } | null>(null);

  const analyzeCategoryChangeImpact = (
    oldCategories: EnhancedCategoryType[],
    newCategories: EnhancedCategoryType[],
  ): string[] => {
    const impacts: string[] = [];

    // Check if item will be removed from galleries
    const removedCategories = oldCategories.filter(
      (cat) => !newCategories.includes(cat),
    );
    const addedCategories = newCategories.filter(
      (cat) => !oldCategories.includes(cat),
    );

    if (removedCategories.length > 0) {
      impacts.push(
        `Will be removed from: ${removedCategories
          .map((cat) =>
            cat === "video&design"
              ? "Video & Design"
              : cat.charAt(0).toUpperCase() + cat.slice(1),
          )
          .join(", ")} galleries`,
      );
    }

    if (addedCategories.length > 0) {
      impacts.push(
        `Will be added to: ${addedCategories
          .map((cat) =>
            cat === "video&design"
              ? "Video & Design"
              : cat.charAt(0).toUpperCase() + cat.slice(1),
          )
          .join(", ")} galleries`,
      );
    }

    // Check for "other" category special behavior
    const hadOther = oldCategories.includes("other");
    const hasOther = newCategories.includes("other");

    if (!hadOther && hasOther) {
      impacts.push(
        "⚠ Will only appear in 'All' gallery due to 'Other' category",
      );
    } else if (hadOther && !hasOther) {
      impacts.push("✓ Will now appear in specific category galleries");
    }

    // Check for potential visibility issues
    if (newCategories.length === 0) {
      impacts.push(
        "⚠ No categories selected - item may not be visible in galleries",
      );
    }

    return impacts;
  };

  const handleCategoriesChange = (categories: EnhancedCategoryType[]) => {
    if (enhanced && isEnhancedContentItem(formData)) {
      const oldCategories = formData.categories || [];

      // Show impact analysis if there are significant changes
      if (
        oldCategories.length > 0 &&
        JSON.stringify(oldCategories.sort()) !==
          JSON.stringify(categories.sort())
      ) {
        const impacts = analyzeCategoryChangeImpact(oldCategories, categories);
        if (impacts.length > 0) {
          setCategoryChangeImpact({
            show: true,
            oldCategories,
            newCategories: categories,
            impacts,
          });
        }
      }

      handleEnhancedInputChange("categories", categories);
      handleEnhancedInputChange(
        "isOtherCategory",
        categories.includes("other"),
      );
    }
  };

  // Data migration helpers

  const checkIfNeedsMigration = (
    item: ContentItem | EnhancedContentItem,
  ): boolean => {
    if (!enhanced) return false;

    // Check if item has old single category format
    if (!isEnhancedContentItem(item) && item.category) {
      return true;
    }

    // Check if enhanced item has incomplete migration
    if (isEnhancedContentItem(item)) {
      return !item.categories || item.categories.length === 0;
    }

    return false;
  };

  const migrateItemData = () => {
    if (!enhanced || isEnhancedContentItem(formData)) return;

    const legacyItem = formData as ContentItem;
    const migratedCategories: EnhancedCategoryType[] = [];

    if (
      legacyItem.category &&
      isValidEnhancedPortfolioCategory(legacyItem.category)
    ) {
      migratedCategories.push(legacyItem.category as EnhancedCategoryType);
    } else if (legacyItem.category) {
      // Unknown category, migrate to "other"
      migratedCategories.push("other");
    }

    const enhancedData: EnhancedContentItem = {
      ...legacyItem,
      categories: migratedCategories,
      isOtherCategory: migratedCategories.includes("other"),
      useManualDate: false,
      originalImages: [],
      processedImages: legacyItem.images || [],
    };

    setFormData(enhancedData);
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
    if (formData.type === "portfolio") {
      if (enhanced && isEnhancedContentItem(formData)) {
        // Enhanced mode: Validate multiple categories
        if (!formData.categories || formData.categories.length === 0) {
          console.error("Validation failed: At least one category is required");
          alert("Please select at least one category for portfolio items");
          return;
        }

        // Validate each category
        const invalidCategories = formData.categories.filter(
          (cat) => !isValidEnhancedPortfolioCategory(cat),
        );
        if (invalidCategories.length > 0) {
          console.error(
            "Validation failed: Invalid categories:",
            invalidCategories,
          );
          alert(`Invalid categories selected: ${invalidCategories.join(", ")}`);
          return;
        }

        // Check for conflicting categories
        const hasOther = formData.categories.includes("other");
        const hasSpecificCategories = formData.categories.some(
          (cat) => cat !== "other",
        );

        if (hasOther && hasSpecificCategories) {
          const shouldContinue = confirm(
            "Warning: You have selected 'Other' category along with specific categories. " +
              "Items with 'Other' category will only appear in the 'All' gallery, " +
              "regardless of other selected categories. Do you want to continue?",
          );
          if (!shouldContinue) {
            return;
          }
        }

        // Check for maximum categories
        if (formData.categories.length > 3) {
          console.error("Validation failed: Too many categories selected");
          alert("Please select a maximum of 3 categories");
          return;
        }
      } else {
        // Legacy mode: Validate single category
        if (!formData.category) {
          console.error("Validation failed: Portfolio category is required");
          alert("Please select a category for portfolio items");
          return;
        }

        if (formData.category && !isValidPortfolioCategory(formData.category)) {
          console.error("Validation failed: Invalid portfolio category");
          alert("Please select a valid portfolio category");
          return;
        }
      }
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
      tags: formData.tags || [],
      videos: formData.videos || [],
      images: formData.images || [],
      externalLinks: validExternalLinks,
      updatedAt: new Date().toISOString(),
      // Include markdown file path for enhanced mode
      ...(enhanced &&
        markdownFilePath && {
          markdownPath: markdownFilePath,
        }),
      // Handle category/categories based on mode
      ...(enhanced && isEnhancedContentItem(formData)
        ? {
            // Enhanced mode: Use categories array
            categories: formData.categories || [],
            isOtherCategory: formData.categories?.includes("other") || false,
            // Keep legacy category for backward compatibility
            category: formData.categories?.[0] || "",
          }
        : {
            // Legacy mode: Use single category
            category: formData.category || "",
          }),
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
          {/* Migration Helper */}
          {enhanced && checkIfNeedsMigration(formData) && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">!</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-900 mb-2">
                    Data Migration Required
                  </h4>
                  <p className="text-sm text-yellow-800 mb-3">
                    This item uses the old single-category format. Migrate it to
                    the new multi-category format to take advantage of enhanced
                    features.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={migrateItemData}
                      className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                    >
                      Migrate Now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        /* Migration helper is always shown when needed */
                      }}
                      className="px-3 py-1 border border-yellow-600 text-yellow-600 text-sm rounded hover:bg-yellow-50 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Category Change Impact Analysis */}
          {categoryChangeImpact?.show && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">i</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Category Change Impact
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800 mb-3">
                    {categoryChangeImpact.impacts.map((impact, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{impact}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCategoryChangeImpact(null)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Understood
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Revert to old categories
                        if (categoryChangeImpact.oldCategories) {
                          handleEnhancedInputChange(
                            "categories",
                            categoryChangeImpact.oldCategories,
                          );
                          handleEnhancedInputChange(
                            "isOtherCategory",
                            categoryChangeImpact.oldCategories.includes(
                              "other",
                            ),
                          );
                        }
                        setCategoryChangeImpact(null);
                      }}
                      className="px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors"
                    >
                      Revert Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
              {formData.type === "portfolio" && enhanced ? (
                // Enhanced mode: Multiple category selection
                <MultiCategorySelector
                  selectedCategories={
                    isEnhancedContentItem(formData)
                      ? formData.categories || []
                      : formData.category
                        ? [formData.category as EnhancedCategoryType]
                        : []
                  }
                  onChange={handleCategoriesChange}
                  availableCategories={[
                    "develop",
                    "video",
                    "design",
                    "video&design",
                    "other",
                  ]}
                  maxSelections={3}
                  showOtherOption={true}
                  className="col-span-full"
                />
              ) : formData.type === "portfolio" ? (
                // Legacy mode: Single category selection
                <div>
                  <label className={labelStyle}>Category</label>
                  <Select
                    value={formData.category || ""}
                    onChange={(value) => handleInputChange("category", value)}
                    options={getPortfolioCategoryOptions()}
                    placeholder="Select Category"
                    variant="admin"
                  />
                </div>
              ) : (
                // Non-portfolio items: Text input
                <div>
                  <label className={labelStyle}>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className={inputStyle}
                    placeholder="Enter category"
                  />
                </div>
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

          {/* Category Validation Summary */}
          {enhanced &&
            formData.type === "portfolio" &&
            isEnhancedContentItem(formData) &&
            formData.categories &&
            formData.categories.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Gallery Visibility Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-medium">Will appear in:</span>
                    <span className="text-gray-600">
                      {formData.categories.includes("other")
                        ? "All gallery only"
                        : `All, ${formData.categories
                            .map((cat) =>
                              cat === "video&design"
                                ? "Video & Design"
                                : cat.charAt(0).toUpperCase() + cat.slice(1),
                            )
                            .join(", ")} galleries`}
                    </span>
                  </div>

                  {formData.categories.includes("other") &&
                    formData.categories.length > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                        <span className="text-yellow-700 text-xs">
                          Note: Other category overrides specific categories -
                          item will only appear in All gallery
                        </span>
                      </div>
                    )}

                  {formData.categories.length > 2 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-blue-700 text-xs">
                        Multiple categories selected - item may appear in
                        multiple galleries
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

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
            {enhanced ? (
              <MarkdownEditor
                content={formData.content || ""}
                onChange={(content) => handleInputChange("content", content)}
                preview={true}
                toolbar={true}
              />
            ) : (
              <textarea
                value={formData.content || ""}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className={`${inputStyle} h-48 resize-vertical font-mono`}
                rows={10}
                placeholder="Enter Markdown content here..."
              />
            )}
          </div>
        </div>
      )}

      {activeTab === "media" && (
        <div className="space-y-6">
          {enhanced ? (
            <EnhancedFileUploadSection
              images={formData.images || []}
              originalImages={
                (formData as EnhancedContentItem).originalImages || []
              }
              thumbnail={formData.thumbnail}
              onImagesChange={(images) => handleInputChange("images", images)}
              onOriginalImagesChange={(originalImages) =>
                handleEnhancedInputChange("originalImages", originalImages)
              }
              onThumbnailChange={(thumbnail) =>
                handleInputChange("thumbnail", thumbnail)
              }
              uploadOptions={uploadOptions}
              onUploadOptionsChange={setUploadOptions}
            />
          ) : (
            <FileUploadSection
              images={formData.images || []}
              thumbnail={formData.thumbnail}
              onImagesChange={(images) => handleInputChange("images", images)}
              onThumbnailChange={(thumbnail) =>
                handleInputChange("thumbnail", thumbnail)
              }
            />
          )}

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
