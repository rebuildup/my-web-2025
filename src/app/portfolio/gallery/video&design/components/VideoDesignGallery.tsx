"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PortfolioContentItem } from "@/types/portfolio";
import {
  generateGridLayout,
  getGridItemClasses,
  getGridItemMinHeight,
  createBalancedLayout,
  GridItem,
} from "@/lib/portfolio/grid-layout-utils";
import { Play, Palette, Video, Eye, Filter } from "lucide-react";

interface VideoDesignGalleryProps {
  items: PortfolioContentItem[];
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

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items.filter((item) => item.status === "published");

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((item) => item.category === filters.category);
    }

    // Year filter
    if (filters.year !== "all") {
      const year = parseInt(filters.year);
      filtered = filtered.filter(
        (item) => new Date(item.createdAt).getFullYear() === year,
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "priority":
          return b.priority - a.priority;
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, filters]);

  // Generate grid layout with creative distribution
  const gridItems = useMemo(() => {
    const gridLayout = generateGridLayout(filteredItems);
    const balancedLayout = createBalancedLayout(gridLayout);

    // Add some final randomization while maintaining visual balance
    return balancedLayout.map((item, index) => ({
      ...item,
      // Add slight random variation to positioning for more organic feel
      randomOffset: Math.sin(index * 1.3) * 0.1,
    }));
  }, [filteredItems]);

  // Get available years for filter
  const availableYears = useMemo(() => {
    const years = items.map((item) => new Date(item.createdAt).getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [items]);

  // Get available categories for filter
  const availableCategories = useMemo(() => {
    const categories = items.map((item) => item.category);
    return [...new Set(categories)];
  }, [items]);

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
            <label className="noto-sans-jp-light text-sm text-foreground block mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full bg-background border border-foreground px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="noto-sans-jp-light text-sm text-foreground block mb-2">
              Year
            </label>
            <select
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
            <label className="noto-sans-jp-light text-sm text-foreground block mb-2">
              Sort By
            </label>
            <select
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
        <p className="noto-sans-jp-light text-sm text-foreground">
          {gridItems.filter((item) => item.category !== "placeholder").length}{" "}
          projects found
        </p>
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
        style={{ gridAutoRows: "minmax(200px, auto)" }}
      >
        {gridItems.map((item) => (
          <GridItemComponent
            key={item.id}
            item={item}
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

interface GridItemComponentProps {
  item: GridItem;
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
              {item.category === "video" && (
                <Video className="w-4 h-4 text-white" />
              )}
              {item.category === "design" && (
                <Palette className="w-4 h-4 text-white" />
              )}
              {item.category === "develop" && (
                <Play className="w-4 h-4 text-white" />
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
                {item.category}
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
