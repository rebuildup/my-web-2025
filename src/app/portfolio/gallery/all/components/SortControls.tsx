"use client";

/**
 * Sort Controls Component
 * Task 3.1: ソート機能（新着順、人気順、アルファベット順）の実装
 */

import { Select } from "@/components/ui/Select";
import { ArrowDown, ArrowUp } from "lucide-react";
import { SortOptions } from "./AllGalleryClient";

interface SortControlsProps {
  sort: SortOptions;
  onSortChange: (sort: SortOptions) => void;
}

const sortOptions = [
  { value: "updatedAt", label: "Updated Date" },
  { value: "createdAt", label: "Created Date" },
  { value: "title", label: "Title (A-Z)" },
  { value: "priority", label: "Priority" },
] as const;

export function SortControls({ sort, onSortChange }: SortControlsProps) {
  const handleSortByChange = (sortBy: SortOptions["sortBy"]) => {
    onSortChange({ ...sort, sortBy });
  };

  const handleSortOrderToggle = () => {
    onSortChange({
      ...sort,
      sortOrder: sort.sortOrder === "asc" ? "desc" : "asc",
    });
  };

  const getSortIcon = () => {
    if (sort.sortOrder === "asc") {
      return <ArrowUp className="w-4 h-4" />;
    } else {
      return <ArrowDown className="w-4 h-4" />;
    }
  };

  const getSortLabel = (value: string) => {
    return sortOptions.find((option) => option.value === value)?.label || value;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center space-x-2 sm:space-x-4">
        <span className="text-sm text-foreground/70">Sort by:</span>

        {/* Sort By Dropdown */}
        <Select
          value={sort.sortBy}
          onChange={(value) =>
            handleSortByChange(value as SortOptions["sortBy"])
          }
          options={sortOptions.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          size="sm"
        />

        {/* Sort Order Toggle */}
        <button
          onClick={handleSortOrderToggle}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 border border-foreground text-foreground hover:border-accent hover:text-accent transition-colors whitespace-nowrap min-w-fit w-auto"
          aria-label={`Sort ${sort.sortOrder === "asc" ? "ascending" : "descending"}`}
        >
          {getSortIcon()}
          <span className="text-xs sm:text-sm">
            {sort.sortOrder === "asc" ? "Ascending" : "Descending"}
          </span>
        </button>
      </div>

      {/* Sort Description */}
      <div className="text-xs sm:text-sm text-foreground/60">
        Sorted by {getSortLabel(sort.sortBy)} (
        {sort.sortOrder === "asc" ? "ascending" : "descending"})
      </div>
    </div>
  );
}
