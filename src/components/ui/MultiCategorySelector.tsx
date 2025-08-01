"use client";

import type { EnhancedCategoryType } from "@/types/enhanced-content";
import { Check, HelpCircle, Info } from "lucide-react";
import { useState } from "react";

interface MultiCategorySelectorProps {
  selectedCategories: EnhancedCategoryType[];
  onChange: (categories: EnhancedCategoryType[]) => void;
  availableCategories: EnhancedCategoryType[];
  maxSelections?: number;
  showOtherOption?: boolean;
  className?: string;
  disabled?: boolean;
}

// Category information for help display
const CATEGORY_INFO: Record<
  EnhancedCategoryType,
  { label: string; description: string; color: string }
> = {
  develop: {
    label: "Development",
    description: "Web applications, games, tools, and programming projects",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  video: {
    label: "Video",
    description:
      "Music videos, animations, promotional videos, and video content",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  design: {
    label: "Design",
    description:
      "Graphic design, UI/UX design, illustrations, and visual content",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  "video&design": {
    label: "Video & Design",
    description: "Projects that combine both video and design elements",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  other: {
    label: "Other",
    description:
      "Projects that don't fit into specific categories (shown only in All gallery)",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

export function MultiCategorySelector({
  selectedCategories,
  onChange,
  availableCategories,
  maxSelections,
  showOtherOption = true,
  className = "",
  disabled = false,
}: MultiCategorySelectorProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Filter available categories based on showOtherOption
  const filteredCategories = availableCategories.filter(
    (category) => showOtherOption || category !== "other",
  );

  const handleCategoryToggle = (category: EnhancedCategoryType) => {
    if (disabled) return;

    let newCategories: EnhancedCategoryType[];

    if (selectedCategories.includes(category)) {
      // Remove category
      newCategories = selectedCategories.filter((c) => c !== category);
      setValidationError(null);
    } else {
      // Add category
      if (maxSelections && selectedCategories.length >= maxSelections) {
        setValidationError(
          `Maximum ${maxSelections} categories can be selected`,
        );
        return;
      }

      newCategories = [...selectedCategories, category];
      setValidationError(null);
    }

    onChange(newCategories);
  };

  const canSelectMore =
    !maxSelections || selectedCategories.length < maxSelections;
  const hasOtherSelected = selectedCategories.includes("other");

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with help toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="block text-sm font-medium text-gray-700">
            Categories
            {maxSelections && (
              <span className="text-gray-500 ml-1">(max {maxSelections})</span>
            )}
          </label>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Show category help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Selection count */}
        <div className="text-xs text-gray-500">
          {selectedCategories.length} selected
          {maxSelections && ` / ${maxSelections}`}
        </div>
      </div>

      {/* Help panel */}
      {showHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-blue-900">
                Category Guidelines
              </h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>
                  • Select one or more categories that best describe your
                  project
                </li>
                <li>
                  • Items can appear in multiple galleries based on selected
                  categories
                </li>
                <li>
                  • &quot;Other&quot; category items only appear in the
                  &quot;All&quot; gallery
                </li>
                <li>
                  • &quot;Video &amp; Design&quot; is for projects combining
                  both elements
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Category selection grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCategories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const categoryInfo = CATEGORY_INFO[category];
          const isOtherCategory = category === "other";

          return (
            <div
              key={category}
              className={`
                relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? `${categoryInfo.color} border-current shadow-sm`
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                ${!canSelectMore && !isSelected ? "opacity-60" : ""}
              `}
              onClick={() => handleCategoryToggle(category)}
            >
              {/* Selection indicator */}
              <div className="absolute top-2 right-2">
                {isSelected && (
                  <div className="w-5 h-5 bg-current rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Category content */}
              <div className="pr-8">
                <h3 className="font-medium text-sm mb-1">
                  {categoryInfo.label}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {categoryInfo.description}
                </p>

                {/* Special indicator for Other category */}
                {isOtherCategory && (
                  <div className="mt-2 text-xs text-orange-600 font-medium">
                    ⚠ All gallery only
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Validation error */}
      {validationError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <span className="text-sm text-red-800">{validationError}</span>
          </div>
        </div>
      )}

      {/* Selection summary */}
      {selectedCategories.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Selected Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => {
              const categoryInfo = CATEGORY_INFO[category];
              return (
                <span
                  key={category}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryInfo.color}`}
                >
                  {categoryInfo.label}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryToggle(category);
                    }}
                    className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
                    aria-label={`Remove ${categoryInfo.label} category`}
                    disabled={disabled}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>

          {/* Gallery visibility info */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h5 className="text-xs font-medium text-gray-700 mb-1">
              Will appear in galleries:
            </h5>
            <div className="text-xs text-gray-600">
              {hasOtherSelected ? (
                <span className="text-orange-600">
                  All gallery only (due to Other category)
                </span>
              ) : (
                <>
                  <span>All</span>
                  {selectedCategories
                    .filter((cat) => cat !== "other")
                    .map((cat) => `, ${CATEGORY_INFO[cat].label}`)
                    .join("")}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {selectedCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-sm">No categories selected</div>
          <div className="text-xs mt-1">
            Select at least one category to specify where this item should
            appear
          </div>
        </div>
      )}
    </div>
  );
}
