"use client";

import { enhancedGalleryFilter } from "@/lib/portfolio/enhanced-gallery-filter";
import {
  createBalancedLayout,
  generateGridLayout,
  getGridItemClasses,
  getGridItemMinHeight,
  GridItem,
} from "@/lib/portfolio/grid-layout-utils";
import type {
  EnhancedCategoryType,
  EnhancedContentItem,
} from "@/types/enhanced-content";
import { PortfolioContentItem } from "@/types/portfolio";
import { Eye, Filter, Palette, Video } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

interface VideoDesignGalleryProps {
  items: (PortfolioContentItem | EnhancedContentItem)[];
}

interface FilterState {
  category: string;
  year: string;
  sortBy: "priority" | "date" | "title";
}

export function VideoDesignGallery({ items }: VideoDesignGalleryProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    year: "all",
    sortBy: "priority",
  });

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Validate and sanitize input items
  const validItems = useMemo(() => {
    if (!Array.isArray(items)) {
      console.warn(
        "VideoDesignGallery: items is not an array, using empty array",
      );
      return [];
    }

    return items.filter((item) => {
      if (!item || !item.id || !item.title) {
        console.warn("VideoDesignGallery: Invalid item found, skipping:", item);
        return false;
      }
      return true;
    });
  }, [items]);

  // Debug: Log items received
  console.log("VideoDesignGallery received items:", {
    total: validItems.length,
    enhanced: validItems.filter((item) => "categories" in item).length,
    legacy: validItems.filter((item) => !("categories" in item)).length,
    categories: validItems.map((item) => {
      if ("categories" in item && Array.isArray(item.categories)) {
        return item.categories.join(", ");
      }
      return (item as PortfolioContentItem).category;
    }),
  });

  // Filter and sort items using enhanced gallery filter
  const filteredItems = useMemo(() => {
    // Use enhanced gallery filter for consistent filtering
    const filterOptions: {
      year?: number;
      categories?: EnhancedCategoryType[];
    } = {};

    if (filters.year !== "all") {
      filterOptions.year = parseInt(filters.year);
    }

    if (filters.category !== "all") {
      filterOptions.categories = [filters.category as EnhancedCategoryType];
    }

    const filtered = enhancedGalleryFilter.filterItemsForGallery(
      validItems,
      "video&design",
      filterOptions,
    );

    // Apply sorting using enhanced gallery filter
    const sorted = enhancedGalleryFilter.sortItems(filtered, {
      sortBy: filters.sortBy === "date" ? "createdAt" : filters.sortBy,
      sortOrder: filters.sortBy === "title" ? "asc" : "desc",
    });

    return sorted;
  }, [validItems, filters]);

  // Generate grid layout with creative distribution
  const gridItems = useMemo(() => {
    const gridLayout = generateGridLayout(
      filteredItems as unknown as PortfolioContentItem[],
    );
    const balancedLayout = createBalancedLayout(gridLayout);

    // Add some final randomization while maintaining visual balance and enhanced properties
    return balancedLayout.map((item, index) => {
      const originalItem = filteredItems.find((fi) => fi.id === item.id);
      return {
        ...item,
        // Add categories from enhanced items
        categories: (originalItem as EnhancedContentItem)?.categories,
        // Add slight random variation to positioning for more organic feel
        randomOffset: Math.sin(index * 1.3) * 0.1,
      } as EnhancedGridItem;
    });
  }, [filteredItems]);

  // Get available years for filter
  const availableYears = useMemo(() => {
    const years = validItems.map((item) =>
      new Date(item.createdAt).getFullYear(),
    );
    return [...new Set(years)].sort((a, b) => b - a);
  }, [validItems]);

  // Statistics for video&design category items
  const videoDesignStats = useMemo(() => {
    const allItems = validItems as (
      | PortfolioContentItem
      | EnhancedContentItem
    )[];

    // Count items by category type
    const stats = {
      videoOnly: 0,
      designOnly: 0,
      videoAndDesign: 0,
      multiCategory: 0,
      total: allItems.length,
    };

    allItems.forEach((item) => {
      // Handle enhanced items with multiple categories
      if ("categories" in item && Array.isArray(item.categories)) {
        const enhancedItem = item as EnhancedContentItem;
        const relevantCategories = enhancedItem.categories.filter((cat) =>
          ["video", "design", "video&design"].includes(cat),
        );

        if (relevantCategories.includes("video&design")) {
          stats.videoAndDesign++;
        } else if (
          relevantCategories.includes("video") &&
          relevantCategories.includes("design")
        ) {
          stats.multiCategory++;
        } else if (relevantCategories.includes("video")) {
          stats.videoOnly++;
        } else if (relevantCategories.includes("design")) {
          stats.designOnly++;
        }
      } else {
        // Handle legacy items
        const legacyItem = item as PortfolioContentItem;
        if (legacyItem.category === "video&design") {
          stats.videoAndDesign++;
        } else if (legacyItem.category === "video") {
          stats.videoOnly++;
        } else if (legacyItem.category === "design") {
          stats.designOnly++;
        }
      }
    });

    return stats;
  }, [validItems]);

  // Get available categories for filter (video&design specific)
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();

    validItems.forEach((item) => {
      // Handle enhanced items with multiple categories
      if ("categories" in item && Array.isArray(item.categories)) {
        const enhancedItem = item as EnhancedContentItem;
        enhancedItem.categories.forEach((category) => {
          // Only include video, design, and video&design categories
          if (["video", "design", "video&design"].includes(category)) {
            categories.add(category);
          }
        });
      } else {
        // Handle legacy items
        const legacyItem = item as PortfolioContentItem;
        if (
          legacyItem.category &&
          ["video", "design", "video&design"].includes(legacyItem.category)
        ) {
          categories.add(legacyItem.category);
        }
      }
    });

    return Array.from(categories).sort();
  }, [validItems]);

  return (
    <div className="space-y-8">
      {/* Filter Controls */}
      <div className="bg-base border border-foreground p-4">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-accent mr-2" />
          <h3 className="zen-kaku-gothic-new text-lg text-primary">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Category Filter */}
          <div>
            <label
              htmlFor="category-filter"
              className="noto-sans-jp-light text-sm text-foreground block mb-2"
            >
              Category
            </label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full bg-background border border-foreground px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category === "video&design"
                    ? "Video & Design"
                    : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label
              htmlFor="year-filter"
              className="noto-sans-jp-light text-sm text-foreground block mb-2"
            >
              Year
            </label>
            <select
              id="year-filter"
              value={filters.year}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, year: e.target.value }))
              }
              className="w-full bg-background border border-foreground px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div>
            <label
              htmlFor="sort-filter"
              className="noto-sans-jp-light text-sm text-foreground block mb-2"
            >
              Sort By
            </label>
            <select
              id="sort-filter"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sortBy: e.target.value as FilterState["sortBy"],
                }))
              }
              className="w-full bg-background border border-foreground px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="priority">Priority</option>
              <option value="date">Date</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="noto-sans-jp-light text-sm text-foreground">
            {gridItems.filter((item) => item.category !== "placeholder").length}{" "}
            projects found
          </p>
          <div className="flex items-center space-x-4 text-xs text-foreground opacity-75">
            {videoDesignStats.videoOnly > 0 && (
              <span>Video: {videoDesignStats.videoOnly}</span>
            )}
            {videoDesignStats.designOnly > 0 && (
              <span>Design: {videoDesignStats.designOnly}</span>
            )}
            {videoDesignStats.videoAndDesign > 0 && (
              <span>V&D: {videoDesignStats.videoAndDesign}</span>
            )}
            {videoDesignStats.multiCategory > 0 && (
              <span>Multi: {videoDesignStats.multiCategory}</span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Palette className="w-4 h-4 text-accent" />
          <Video className="w-4 h-4 text-primary" />
          <span className="noto-sans-jp-light text-xs text-foreground">
            Video & Design
          </span>
        </div>
      </div>

      {/* Masonry-style Grid Layout */}
      <div
        className="grid grid-cols-3 gap-4"
        style={{ gridAutoRows: "minmax(var(--gallery-item-base), auto)" }}
      >
        {gridItems.map((item) => (
          <GridItemComponent
            key={item.id}
            item={item as EnhancedGridItem}
            isHovered={hoveredItem === item.id}
            onHover={setHoveredItem}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-base border border-foreground p-8">
            <Eye className="w-12 h-12 text-accent mx-auto mb-4" />
            <h3 className="zen-kaku-gothic-new text-xl text-primary mb-2">
              No projects found
            </h3>
            <p className="noto-sans-jp-light text-sm text-foreground mb-4">
              Try adjusting your filters to see more projects.
            </p>
            <button
              onClick={() =>
                setFilters({ category: "all", year: "all", sortBy: "priority" })
              }
              className="noto-sans-jp-light text-sm text-accent border border-accent px-4 py-2 hover:bg-accent hover:text-background transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface EnhancedGridItem extends GridItem {
  categories?: EnhancedCategoryType[];
}

interface GridItemComponentProps {
  item: EnhancedGridItem;
  isHovered: boolean;
  onHover: (id: string | null) => void;
}

function GridItemComponent({
  item,
  isHovered,
  onHover,
}: GridItemComponentProps) {
  const gridClasses = getGridItemClasses(item.gridSize);
  const minHeightClass = getGridItemMinHeight(item.gridSize);

  // Check if this is a placeholder item
  const isPlaceholder = item.category === "placeholder";

  // Add dynamic styling based on item properties
  const dynamicStyles = {
    transform: isHovered && !isPlaceholder ? "scale(1.02)" : "scale(1)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    // Add subtle rotation for more organic feel
    "--rotation": `${Math.sin(item.priority * 0.1) * 2}deg`,
  } as React.CSSProperties;

  // For placeholder items, render a simple black box
  if (isPlaceholder) {
    return (
      <div
        className={`${gridClasses} ${minHeightClass} bg-black border border-foreground`}
        style={{
          ...dynamicStyles,
          display: "block",
          position: "relative",
        }}
      />
    );
  }

  return (
    <Link
      href={item.url}
      className={`${gridClasses} ${minHeightClass} group cursor-pointer hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background block`}
      style={{
        ...dynamicStyles,
        display: "block",
        position: "relative",
      }}
      onMouseEnter={() => onHover(item.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Image Container */}
      <div className="relative w-full h-full">
        <div
          className="absolute inset-0 transition-transform duration-300 group-hover:scale-105"
          style={{
            backgroundImage: `url(${item.thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            transform: "translateZ(0)", // GPU acceleration
          }}
        />

        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isHovered ? "opacity-60" : "opacity-0"
          }`}
        />

        {/* Content Overlay */}
        <div
          className={`absolute inset-0 p-4 flex flex-col justify-between transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Top Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-1">
              {/* Show icons for all categories the item belongs to */}
              {(item.category === "video" ||
                (item.categories && item.categories.includes("video"))) && (
                <Video className="w-4 h-4 text-white" />
              )}
              {(item.category === "design" ||
                (item.categories && item.categories.includes("design"))) && (
                <Palette className="w-4 h-4 text-white" />
              )}
              {(item.category === "video&design" ||
                (item.categories &&
                  item.categories.includes("video&design"))) && (
                <>
                  <Video className="w-4 h-4 text-white" />
                  <Palette className="w-4 h-4 text-white" />
                </>
              )}
            </div>
            <div className="bg-black bg-opacity-50 px-2 py-1 rounded">
              <span className="noto-sans-jp-light text-xs text-white">
                {item.gridSize}
              </span>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="space-y-2">
            <h3 className="zen-kaku-gothic-new text-white font-medium line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="noto-sans-jp-light text-xs text-white opacity-80">
                {/* Display primary category or multiple categories */}
                {item.categories && item.categories.length > 1
                  ? item.categories
                      .filter((cat) =>
                        ["video", "design", "video&design"].includes(cat),
                      )
                      .map((cat) =>
                        cat === "video&design"
                          ? "V&D"
                          : cat.charAt(0).toUpperCase(),
                      )
                      .join(" + ")
                  : item.category === "video&design"
                    ? "Video & Design"
                    : item.category?.charAt(0).toUpperCase() +
                      item.category?.slice(1)}
              </span>
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3 text-white opacity-60" />
                <span className="noto-sans-jp-light text-xs text-white opacity-60">
                  View
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority Indicator */}
        {item.priority >= 80 && (
          <div className="absolute top-2 left-2 bg-accent text-background px-2 py-1 text-xs font-medium">
            Featured
          </div>
        )}
      </div>
    </Link>
  );
}
