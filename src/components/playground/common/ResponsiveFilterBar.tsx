/**
 * Responsive filter bar component for playground experiments
 * Task 2.1: プレイグラウンドのレスポンシブ対応
 */

"use client";

import { useResponsive } from "@/hooks/useResponsive";
import { ExperimentFilter } from "@/types/playground";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { useState } from "react";

interface ResponsiveFilterBarProps {
  filter: ExperimentFilter;
  onFilterChange: (filter: ExperimentFilter) => void;
  availableCategories: string[];
  availableTechnologies: string[];
  className?: string;
}

export const ResponsiveFilterBar: React.FC<ResponsiveFilterBarProps> = ({
  filter,
  onFilterChange,
  availableCategories,
  availableTechnologies,
  className = "",
}) => {
  const responsive = useResponsive();
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filter).some(
    (value) => value !== undefined,
  );

  // Clear all filters
  const clearFilters = () => {
    onFilterChange({
      category: undefined,
      difficulty: undefined,
      technology: undefined,
      performanceLevel: undefined,
      interactive: undefined,
    });
  };

  // Update individual filter
  const updateFilter = <K extends keyof ExperimentFilter>(
    key: K,
    value: ExperimentFilter[K],
  ) => {
    onFilterChange({
      ...filter,
      [key]: value || undefined,
    });
  };

  // Get responsive classes
  const getContainerClasses = () => {
    const baseClasses = "bg-base border border-foreground p-4 space-y-4";
    return `${baseClasses} ${className}`;
  };

  const getGridClasses = () => {
    if (responsive.isMobile) {
      return "grid grid-cols-1 gap-4";
    } else if (responsive.isTablet) {
      return "grid grid-cols-2 gap-4";
    } else {
      return "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4";
    }
  };

  const getInputClasses = () => {
    const baseClasses =
      "w-full border border-foreground bg-background text-foreground p-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background";
    return baseClasses;
  };

  const getLabelClasses = () => {
    return responsive.isMobile
      ? "noto-sans-jp-light text-sm text-foreground font-medium"
      : "noto-sans-jp-light text-sm text-foreground";
  };

  // Mobile collapsed view
  if (responsive.isMobile && !isExpanded) {
    return (
      <div className={getContainerClasses()}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
          aria-expanded={isExpanded}
          aria-controls="filter-content"
        >
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            <h3 className="zen-kaku-gothic-new text-lg text-primary">
              Filters
            </h3>
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-accent text-background text-xs rounded">
                Active
              </span>
            )}
          </div>
          <ChevronDown className="w-4 h-4" />
        </button>

        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <span className="noto-sans-jp-light text-xs text-foreground">
              {Object.values(filter).filter((v) => v !== undefined).length}{" "}
              filters active
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center text-xs text-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={getContainerClasses()}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          <h3 className="zen-kaku-gothic-new text-lg text-primary">
            Experiment Filter
          </h3>
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center text-sm text-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </button>
          )}

          {responsive.isMobile && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Collapse filters"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div id="filter-content" className={getGridClasses()}>
        {/* Category Filter */}
        <div className="space-y-2">
          <label className={getLabelClasses()}>Category</label>
          <select
            value={filter.category || ""}
            onChange={(e) =>
              updateFilter(
                "category",
                e.target.value as ExperimentFilter["category"],
              )
            }
            className={getInputClasses()}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {availableCategories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="space-y-2">
          <label className={getLabelClasses()}>Difficulty</label>
          <select
            value={filter.difficulty || ""}
            onChange={(e) =>
              updateFilter(
                "difficulty",
                e.target.value as ExperimentFilter["difficulty"],
              )
            }
            className={getInputClasses()}
            aria-label="Filter by difficulty"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Technology Filter */}
        <div className="space-y-2">
          <label className={getLabelClasses()}>Technology</label>
          <input
            type="text"
            value={filter.technology || ""}
            onChange={(e) => updateFilter("technology", e.target.value)}
            placeholder="Search technology..."
            className={getInputClasses()}
            aria-label="Filter by technology"
            list="technology-suggestions"
          />
          <datalist id="technology-suggestions">
            {availableTechnologies.map((tech) => (
              <option key={tech} value={tech} />
            ))}
          </datalist>
        </div>

        {/* Performance Level Filter (Desktop only) */}
        {!responsive.isMobile && (
          <div className="space-y-2">
            <label className={getLabelClasses()}>Performance</label>
            <select
              value={filter.performanceLevel || ""}
              onChange={(e) =>
                updateFilter(
                  "performanceLevel",
                  e.target.value as ExperimentFilter["performanceLevel"],
                )
              }
              className={getInputClasses()}
              aria-label="Filter by performance level"
            >
              <option value="">All Levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        )}

        {/* Interactive Filter (Desktop only) */}
        {!responsive.isMobile && (
          <div className="space-y-2">
            <label className={getLabelClasses()}>Interactive</label>
            <select
              value={
                filter.interactive === undefined
                  ? ""
                  : filter.interactive.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                updateFilter(
                  "interactive",
                  value === "" ? undefined : value === "true",
                );
              }}
              className={getInputClasses()}
              aria-label="Filter by interactivity"
            >
              <option value="">All Types</option>
              <option value="true">Interactive Only</option>
              <option value="false">Static Only</option>
            </select>
          </div>
        )}
      </div>

      {/* Mobile additional filters */}
      {responsive.isMobile && (
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-foreground">
          <div className="space-y-2">
            <label className={getLabelClasses()}>Performance</label>
            <select
              value={filter.performanceLevel || ""}
              onChange={(e) =>
                updateFilter(
                  "performanceLevel",
                  e.target.value as ExperimentFilter["performanceLevel"],
                )
              }
              className={getInputClasses()}
              aria-label="Filter by performance level"
            >
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="medium">Med</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className={getLabelClasses()}>Type</label>
            <select
              value={
                filter.interactive === undefined
                  ? ""
                  : filter.interactive.toString()
              }
              onChange={(e) => {
                const value = e.target.value;
                updateFilter(
                  "interactive",
                  value === "" ? undefined : value === "true",
                );
              }}
              className={getInputClasses()}
              aria-label="Filter by interactivity"
            >
              <option value="">All</option>
              <option value="true">Interactive</option>
              <option value="false">Static</option>
            </select>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-foreground">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filter).map(([key, value]) => {
              if (value === undefined) return null;

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 bg-accent bg-opacity-20 border border-accent text-accent text-xs rounded"
                >
                  {key}: {value.toString()}
                  <button
                    onClick={() =>
                      updateFilter(key as keyof ExperimentFilter, undefined)
                    }
                    className="ml-1 hover:text-foreground focus:outline-none"
                    aria-label={`Remove ${key} filter`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
