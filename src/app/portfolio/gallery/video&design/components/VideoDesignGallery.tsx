"use client";

/**
 * Video & Design Gallery Component
 * Task 4.2: Gallery performance optimization - never load markdown files
 *
 * Gallery Performance Rules:
 * - NEVER load markdown files for gallery display
 * - Only display essential information (title, description, thumbnail, category, tags)
 * - Use enhanced gallery filter with caching for performance
 * - Maintain consistent performance with large datasets
 */

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
import {
  AlertTriangle,
  Eye,
  Filter,
  Palette,
  RefreshCw,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface VideoDesignGalleryProps {
  items: (PortfolioContentItem | EnhancedContentItem)[];
  showVideoItems?: boolean; // Show video category
  showDesignItems?: boolean; // Show design category
  showVideoDesignItems?: boolean; // Show video&design category
  deduplication?: boolean; // Enable deduplication
  enableCaching?: boolean; // Enable performance caching
  onError?: (error: Error) => void; // Error callback
}

interface FilterState {
  category: string;
  year: string;
  sortBy: "priority" | "date" | "title";
}

interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorBoundary?: boolean;
}

interface PerformanceMetrics {
  renderTime: number;
  itemCount: number;
  filterTime: number;
  layoutTime: number;
}

export function VideoDesignGallery({
  items,
  showVideoItems = true,
  showDesignItems = true,
  showVideoDesignItems = true,
  deduplication = true,
  enableCaching = true,
  onError,
}: VideoDesignGalleryProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: "all",
    year: "all",
    sortBy: "priority",
  });

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics | null>(null);

  // Performance tracking refs
  const renderStartTime = useRef<number>(0);
  const cacheRef = useRef<
    Map<string, (PortfolioContentItem | EnhancedContentItem)[]>
  >(new Map());
  const lastItemsHash = useRef<string>("");

  // Error handling callback
  const handleError = useCallback(
    (error: Error, context: string) => {
      console.error(`VideoDesignGallery Error (${context}):`, error);
      setErrorState({ hasError: true, error });
      onError?.(error);
    },
    [onError],
  );

  // Performance measurement
  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    if (renderStartTime.current > 0) {
      const renderTime = performance.now() - renderStartTime.current;
      setPerformanceMetrics((prev) => (prev ? { ...prev, renderTime } : null));
    }
  }, []);

  // Enhanced validation and sanitization with error handling
  const validItems = useMemo(() => {
    try {
      const startTime = performance.now();

      if (!Array.isArray(items)) {
        const error = new Error("Items is not an array");
        handleError(error, "validation");
        return [];
      }

      // Generate hash for caching
      const itemsHash = JSON.stringify(
        items.map((item) => ({ id: item?.id, title: item?.title })),
      );

      // Use cache if enabled and hash matches
      if (
        enableCaching &&
        itemsHash === lastItemsHash.current &&
        cacheRef.current.has("validItems")
      ) {
        const cached = cacheRef.current.get("validItems");
        return cached || [];
      }

      const validated = items.filter(
        (item: PortfolioContentItem | EnhancedContentItem) => {
          if (!item || typeof item !== "object") {
            console.warn(
              "VideoDesignGallery: Invalid item object found, skipping:",
              item,
            );
            return false;
          }

          if (
            !item.id ||
            typeof item.id !== "string" ||
            item.id.trim() === ""
          ) {
            console.warn(
              "VideoDesignGallery: Item missing valid id, skipping:",
              item,
            );
            return false;
          }

          if (
            !item.title ||
            typeof item.title !== "string" ||
            item.title.trim() === ""
          ) {
            console.warn(
              "VideoDesignGallery: Item missing valid title, skipping:",
              item,
            );
            return false;
          }

          // Validate priority (should be a number)
          if (typeof item.priority !== "number" || isNaN(item.priority)) {
            console.warn(
              "VideoDesignGallery: Item has invalid priority, setting default:",
              item,
            );
            item.priority = 50; // Set default priority
          }

          // Validate createdAt (should be a valid date string)
          if (!item.createdAt || isNaN(new Date(item.createdAt).getTime())) {
            console.warn(
              "VideoDesignGallery: Item has invalid createdAt, setting default:",
              item,
            );
            item.createdAt = new Date().toISOString(); // Set current date as default
          }

          // Validate category structure
          if ("categories" in item) {
            const enhancedItem = item as EnhancedContentItem;
            if (!Array.isArray(enhancedItem.categories)) {
              console.warn(
                "VideoDesignGallery: Enhanced item has invalid categories array, skipping:",
                item,
              );
              return false;
            }
          } else {
            const legacyItem = item as PortfolioContentItem;
            if (
              !legacyItem.category ||
              typeof legacyItem.category !== "string"
            ) {
              console.warn(
                "VideoDesignGallery: Legacy item missing valid category, skipping:",
                item,
              );
              return false;
            }
          }

          return true;
        },
      );

      // Cache results if enabled
      if (enableCaching) {
        lastItemsHash.current = itemsHash;
        cacheRef.current.set("validItems", validated);
      }

      const validationTime = performance.now() - startTime;
      setPerformanceMetrics(
        (prev) =>
          ({
            ...prev,
            itemCount: validated.length,
            filterTime: validationTime,
          }) as PerformanceMetrics,
      );

      return validated;
    } catch (error) {
      handleError(error as Error, "validation");
      return [];
    }
  }, [items, enableCaching, handleError]);

  // Debug: Log items received
  console.log("VideoDesignGallery received items:", {
    total: validItems.length,
    enhanced: validItems.filter(
      (item: PortfolioContentItem | EnhancedContentItem) =>
        "categories" in item,
    ).length,
    legacy: validItems.filter(
      (item: PortfolioContentItem | EnhancedContentItem) =>
        !("categories" in item),
    ).length,
    categories: validItems.map(
      (item: PortfolioContentItem | EnhancedContentItem) => {
        if ("categories" in item && Array.isArray(item.categories)) {
          return item.categories.join(", ");
        }
        return (item as PortfolioContentItem).category;
      },
    ),
  });

  // Enhanced filtering with category display options and deduplication
  const filteredItems = useMemo(() => {
    try {
      const startTime = performance.now();

      // Generate cache key for filtering
      const filterCacheKey = `filtered_${JSON.stringify(filters)}_${showVideoItems}_${showDesignItems}_${showVideoDesignItems}_${deduplication}`;

      // Use cache if enabled
      if (enableCaching && cacheRef.current.has(filterCacheKey)) {
        const cached = cacheRef.current.get(filterCacheKey);
        return cached || [];
      }

      // Step 1: Apply category display options
      let categoryFilteredItems = validItems.filter(
        (item: PortfolioContentItem | EnhancedContentItem) => {
          if ("categories" in item && Array.isArray(item.categories)) {
            const enhancedItem = item as EnhancedContentItem;
            const relevantCategories = enhancedItem.categories.filter((cat) =>
              ["video", "design", "video&design"].includes(cat),
            );

            // Check if item should be shown based on display options
            const hasVideo = relevantCategories.includes("video");
            const hasDesign = relevantCategories.includes("design");
            const hasVideoDesign = relevantCategories.includes("video&design");

            return (
              (showVideoItems && hasVideo) ||
              (showDesignItems && hasDesign) ||
              (showVideoDesignItems && hasVideoDesign)
            );
          } else {
            const legacyItem = item as PortfolioContentItem;
            const category = legacyItem.category;

            return (
              (showVideoItems && category === "video") ||
              (showDesignItems && category === "design") ||
              (showVideoDesignItems && category === "video&design")
            );
          }
        },
      );

      // Step 2: Apply deduplication if enabled
      if (deduplication) {
        const seen = new Set<string>();
        categoryFilteredItems = categoryFilteredItems.filter(
          (item: PortfolioContentItem | EnhancedContentItem) => {
            if (seen.has(item.id)) {
              console.log(
                `VideoDesignGallery: Removing duplicate item ${item.id}`,
              );
              return false;
            }
            seen.add(item.id);
            return true;
          },
        );
      }

      // Step 3: Apply user filters
      const filterOptions: {
        year?: number;
        categories?: EnhancedCategoryType[];
      } = {};

      if (filters.year !== "all") {
        const yearNum = parseInt(filters.year);
        if (!isNaN(yearNum)) {
          filterOptions.year = yearNum;
        }
      }

      if (filters.category !== "all") {
        filterOptions.categories = [filters.category as EnhancedCategoryType];
      }

      const filtered = enhancedGalleryFilter.filterItemsForGallery(
        categoryFilteredItems,
        "video&design",
        filterOptions,
      );

      // Step 4: Apply sorting using enhanced gallery filter
      const sorted = enhancedGalleryFilter.sortItems(filtered, {
        sortBy: filters.sortBy === "date" ? "createdAt" : filters.sortBy,
        sortOrder: filters.sortBy === "title" ? "asc" : "desc",
      });

      // Cache results if enabled
      if (enableCaching) {
        cacheRef.current.set(filterCacheKey, sorted);
      }

      const filterTime = performance.now() - startTime;
      setPerformanceMetrics(
        (prev) =>
          ({
            ...prev,
            filterTime,
          }) as PerformanceMetrics,
      );

      return sorted;
    } catch (error) {
      handleError(error as Error, "filtering");
      return [];
    }
  }, [
    validItems,
    filters,
    showVideoItems,
    showDesignItems,
    showVideoDesignItems,
    deduplication,
    enableCaching,
    handleError,
  ]);

  // Generate grid layout with creative distribution
  const gridItems = useMemo(() => {
    const gridLayout = generateGridLayout(
      filteredItems as unknown as PortfolioContentItem[],
    );
    const balancedLayout = createBalancedLayout(gridLayout);

    // Add some final randomization while maintaining visual balance and enhanced properties
    return balancedLayout.map((item, index) => {
      const originalItem = filteredItems.find(
        (fi: PortfolioContentItem | EnhancedContentItem) => fi.id === item.id,
      );
      return {
        ...item,
        // Add categories from enhanced items
        categories: (originalItem as EnhancedContentItem)?.categories,
        // Add slight random variation to positioning for more organic feel
        randomOffset: Math.sin((index || 0) * 1.3) * 0.1,
      } as EnhancedGridItem;
    });
  }, [filteredItems]);

  // Get available years for filter
  const availableYears = useMemo(() => {
    const years: number[] = validItems.map(
      (item: PortfolioContentItem | EnhancedContentItem) =>
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

    allItems.forEach((item: PortfolioContentItem | EnhancedContentItem) => {
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

    validItems.forEach((item: PortfolioContentItem | EnhancedContentItem) => {
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

  // Error boundary - show error state if there's an error
  if (errorState.hasError) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <h3
              className="zen-kaku-gothic-new text-lg text-red-800"
              role="alert"
            >
              Error Loading Gallery
            </h3>
          </div>
          <p
            className="noto-sans-jp-light text-sm text-red-700 mb-4"
            role="alert"
          >
            {errorState.error?.message ||
              "An unexpected error occurred while loading the gallery."}
          </p>
          <button
            onClick={() => {
              setErrorState({ hasError: false });
              // Clear cache to force refresh
              cacheRef.current.clear();
            }}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Performance Metrics (Development Only) */}
      {process.env.NODE_ENV === "development" && performanceMetrics && (
        <div className="bg-gray-100 border border-gray-300 p-3 text-xs">
          <div className="flex items-center space-x-4">
            <span>Items: {String(performanceMetrics.itemCount || 0)}</span>
            <span>
              Filter:{" "}
              {String(Number(performanceMetrics.filterTime || 0).toFixed(2))}
              ms
            </span>
            <span>
              Render:{" "}
              {String(Number(performanceMetrics.renderTime || 0).toFixed(2))}
              ms
            </span>
            <span>Cache: {enableCaching ? "ON" : "OFF"}</span>
            <span>Dedup: {deduplication ? "ON" : "OFF"}</span>
          </div>
        </div>
      )}
      {/* Filter Controls */}
      <div className="bg-base border border-foreground p-4">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-accent mr-2" />
          <h3 className="zen-kaku-gothic-new text-lg text-primary">Filters</h3>
        </div>

        <div className="space-y-4">
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
                aria-label="Filter by category"
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
                aria-label="Filter by year"
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
                aria-label="Sort projects by"
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

          {/* Reset Button */}
          <div className="flex justify-end">
            <button
              onClick={() =>
                setFilters({ category: "all", year: "all", sortBy: "priority" })
              }
              className="px-4 py-2 text-sm text-foreground border border-foreground hover:bg-accent hover:text-background transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p
            className="noto-sans-jp-light text-sm text-foreground"
            aria-live="polite"
          >
            {String(
              Math.max(
                0,
                gridItems.filter((item) => item.category !== "placeholder")
                  .length,
              ),
            )}{" "}
            projects found
          </p>
          <div className="flex items-center space-x-4 text-xs text-foreground opacity-75">
            {(videoDesignStats.videoOnly || 0) > 0 && (
              <span>Video: {String(videoDesignStats.videoOnly || 0)}</span>
            )}
            {(videoDesignStats.designOnly || 0) > 0 && (
              <span>Design: {String(videoDesignStats.designOnly || 0)}</span>
            )}
            {(videoDesignStats.videoAndDesign || 0) > 0 && (
              <span>V&D: {String(videoDesignStats.videoAndDesign || 0)}</span>
            )}
            {(videoDesignStats.multiCategory || 0) > 0 && (
              <span>Multi: {String(videoDesignStats.multiCategory || 0)}</span>
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
            <p className="noto-sans-jp-light text-sm text-foreground">
              Try adjusting your filters to see more projects.
            </p>
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
    "--rotation": `${Math.sin((Number(item.priority) || 0) * 0.1) * 2}deg`,
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
                {String(item.gridSize)}
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
        {(Number(item.priority) || 0) >= 80 && (
          <div className="absolute top-2 left-2 bg-accent text-background px-2 py-1 text-xs font-medium">
            Featured
          </div>
        )}
      </div>
    </Link>
  );
}
