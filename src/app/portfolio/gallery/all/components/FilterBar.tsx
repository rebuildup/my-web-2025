"use client";

/**
 * Filter Bar Component
 * Task 3.1: フィルター機能（カテゴリ、技術、年別、タグ）の実装
 */

import { SearchFilter } from "@/lib/portfolio/search-index";
import { Filter, Search, X } from "lucide-react";
import { useCallback, useState } from "react";
import { FilterOptions } from "./AllGalleryClient";

interface FilterBarProps {
  filters: FilterOptions;
  searchFilters: SearchFilter[];
  onFilterChange: (filters: FilterOptions) => void;
}

export function FilterBar({
  filters,
  searchFilters,
  onFilterChange,
}: FilterBarProps) {
  console.log("FilterBar rendered with:", {
    filtersCount: Object.keys(filters).length,
    searchFiltersCount: searchFilters.length,
    searchFilters: searchFilters.map((f) => ({
      type: f.type,
      optionsCount: f.options.length,
    })),
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || "");

  // Extract available options from search filters
  const categories =
    searchFilters.find((f) => f.type === "category")?.options || [];
  const technologies =
    searchFilters.find((f) => f.type === "technology")?.options || [];
  const years = searchFilters.find((f) => f.type === "year")?.options || [];
  const tags = searchFilters.find((f) => f.type === "tag")?.options || [];

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      onFilterChange({ ...filters, search: value || undefined });
    },
    [filters, onFilterChange],
  );

  const handleCategoryChange = useCallback(
    (category: string) => {
      onFilterChange({
        ...filters,
        category: category === "all" ? undefined : category,
      });
    },
    [filters, onFilterChange],
  );

  const handleTechnologyToggle = useCallback(
    (technology: string) => {
      const currentTechnologies = filters.technologies || [];
      const newTechnologies = currentTechnologies.includes(technology)
        ? currentTechnologies.filter((t) => t !== technology)
        : [...currentTechnologies, technology];

      onFilterChange({
        ...filters,
        technologies: newTechnologies.length > 0 ? newTechnologies : undefined,
      });
    },
    [filters, onFilterChange],
  );

  const handleYearChange = useCallback(
    (year: string) => {
      onFilterChange({
        ...filters,
        year: year === "all" ? undefined : year,
      });
    },
    [filters, onFilterChange],
  );

  const handleTagToggle = useCallback(
    (tag: string) => {
      const currentTags = filters.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];

      onFilterChange({
        ...filters,
        tags: newTags.length > 0 ? newTags : undefined,
      });
    },
    [filters, onFilterChange],
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = !!(
    filters.search ||
    filters.category ||
    (filters.technologies && filters.technologies.length > 0) ||
    filters.year ||
    (filters.tags && filters.tags.length > 0)
  );

  return (
    <div className="space-y-4">
      {/* Search and Toggle */}
      <div className="flex items-center space-x-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground/60" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-foreground bg-background text-foreground placeholder-foreground/60 focus:outline-none focus:border-accent"
          />
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center space-x-2 px-4 py-2 border transition-colors ${
            isExpanded || hasActiveFilters
              ? "border-accent text-accent"
              : "border-foreground text-foreground hover:border-accent hover:text-accent"
          }`}
          aria-expanded={isExpanded}
          aria-controls="filter-panel"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filters</span>
          {hasActiveFilters && (
            <span className="bg-accent text-background text-xs px-2 py-1 rounded-full">
              {
                [
                  filters.category,
                  ...(filters.technologies || []),
                  filters.year,
                  ...(filters.tags || []),
                  filters.search,
                ].filter(Boolean).length
              }
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center space-x-2 px-4 py-2 border border-foreground text-foreground hover:border-accent hover:text-accent transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Clear</span>
          </button>
        )}
      </div>

      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div
          id="filter-panel"
          className="border border-foreground bg-base p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-primary">Category</h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={!filters.category}
                    onChange={() => handleCategoryChange("all")}
                    className="text-accent focus:ring-accent"
                  />
                  <span className="text-sm">All Categories</span>
                </label>
                {categories.map((category) => (
                  <label
                    key={category.value}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={filters.category === category.value}
                      onChange={() => handleCategoryChange(category.value)}
                      className="text-accent focus:ring-accent"
                    />
                    <span className="text-sm">
                      {category.label} ({category.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Technology Filter */}
            {technologies.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-primary">
                  Technologies
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {technologies.map((tech) => (
                    <label
                      key={tech.value}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={(filters.technologies || []).includes(
                          tech.value,
                        )}
                        onChange={() => handleTechnologyToggle(tech.value)}
                        className="text-accent focus:ring-accent"
                      />
                      <span className="text-sm">
                        {tech.label} ({tech.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Year Filter */}
            {years.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-primary">Year</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="year"
                      value="all"
                      checked={!filters.year}
                      onChange={() => handleYearChange("all")}
                      className="text-accent focus:ring-accent"
                    />
                    <span className="text-sm">All Years</span>
                  </label>
                  {years.map((year) => (
                    <label
                      key={year.value}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="year"
                        value={year.value}
                        checked={filters.year === year.value}
                        onChange={() => handleYearChange(year.value)}
                        className="text-accent focus:ring-accent"
                      />
                      <span className="text-sm">
                        {year.label} ({year.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-primary">Tags</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {tags.map((tag) => (
                    <label
                      key={tag.value}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={(filters.tags || []).includes(tag.value)}
                        onChange={() => handleTagToggle(tag.value)}
                        className="text-accent focus:ring-accent"
                      />
                      <span className="text-sm">
                        {tag.label} ({tag.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
