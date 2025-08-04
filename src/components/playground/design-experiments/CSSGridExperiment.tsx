/**
 * CSS Grid Layout Experiment
 * Responsive grid layouts and interactive elements
 */

"use client";

import { performanceMonitor } from "@/lib/playground/performance-monitor";
import { ExperimentProps } from "@/types/playground";
import { Grid, RotateCcw, Shuffle } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

interface GridItem {
  id: number;
  content: string;
  color: string;
  size: "small" | "medium" | "large";
  gridArea?: string;
}

const gridLayouts = [
  {
    name: "Basic Grid",
    value: "basic",
    columns: "repeat(3, 1fr)",
    rows: "repeat(3, 1fr)",
  },
  {
    name: "Masonry Style",
    value: "masonry",
    columns: "repeat(4, 1fr)",
    rows: "masonry",
  },
  {
    name: "Magazine Layout",
    value: "magazine",
    columns: "repeat(6, 1fr)",
    rows: "repeat(4, 1fr)",
  },
  {
    name: "Card Layout",
    value: "cards",
    columns: "repeat(auto-fit, minmax(200px, 1fr))",
    rows: "auto",
  },
  {
    name: "Sidebar Layout",
    value: "sidebar",
    columns: "200px 1fr",
    rows: "auto 1fr auto",
  },
];

const colors = [
  "#ff6b6b",
  "#4ecdc4",
  "#45b7d1",
  "#96ceb4",
  "#ffeaa7",
  "#dda0dd",
  "#98d8c8",
  "#f7dc6f",
  "#bb8fce",
  "#85c1e9",
];

export const CSSGridExperiment: React.FC<ExperimentProps> = ({
  isActive,
  onPerformanceUpdate,
}) => {
  const [selectedLayout, setSelectedLayout] = useState("basic");
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gap, setGap] = useState(16);
  const [itemCount, setItemCount] = useState(9);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  // Generate grid items
  const generateGridItems = useCallback((count: number) => {
    const items: GridItem[] = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i,
        content: `Item ${i + 1}`,
        color: colors[i % colors.length],
        size: ["small", "medium", "large"][
          Math.floor(Math.random() * 3)
        ] as GridItem["size"],
      });
    }
    return items;
  }, []);

  // Shuffle grid items
  const shuffleItems = useCallback(() => {
    setIsAnimating(true);
    setGridItems((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.map((item, index) => ({
        ...item,
        color: colors[index % colors.length],
      }));
    });
    setTimeout(() => setIsAnimating(false), 600);
  }, []);

  // Reset grid
  const resetGrid = useCallback(() => {
    setGridItems(generateGridItems(itemCount));
    setIsAnimating(false);
    setHoveredItem(null);
  }, [generateGridItems, itemCount]);

  // Get grid styles based on layout
  const getGridStyles = (): React.CSSProperties => {
    const layout = gridLayouts.find((l) => l.value === selectedLayout);
    if (!layout) return {};

    const baseStyles: React.CSSProperties = {
      display: "grid",
      gap: `${gap}px`,
      gridTemplateColumns: layout.columns,
      gridTemplateRows: layout.rows === "masonry" ? "masonry" : layout.rows,
      transition: "all 0.3s ease",
    };

    // Special handling for different layouts
    switch (selectedLayout) {
      case "magazine":
        return {
          ...baseStyles,
          gridTemplateAreas: `
            "header header header header header header"
            "sidebar main main main main aside"
            "sidebar main main main main aside"
            "footer footer footer footer footer footer"
          `,
        };

      case "sidebar":
        return {
          ...baseStyles,
          gridTemplateAreas: `
            "sidebar header"
            "sidebar main"
            "sidebar footer"
          `,
          minHeight: "400px",
        };

      default:
        return baseStyles;
    }
  };

  // Get item styles
  const getItemStyles = (
    item: GridItem,
    index: number,
  ): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: item.color,
      border: "2px solid transparent",
      borderRadius: "8px",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      transform: isAnimating ? "scale(0.95)" : "scale(1)",
      opacity: isAnimating ? 0.8 : 1,
    };

    // Size variations
    if (selectedLayout === "basic" || selectedLayout === "masonry") {
      switch (item.size) {
        case "large":
          baseStyles.gridColumn = "span 2";
          baseStyles.gridRow = "span 2";
          break;
        case "medium":
          baseStyles.gridColumn = "span 2";
          break;
        default:
          // small - default size
          break;
      }
    }

    // Magazine layout specific areas
    if (selectedLayout === "magazine") {
      switch (index) {
        case 0:
          baseStyles.gridArea = "header";
          break;
        case 1:
          baseStyles.gridArea = "sidebar";
          break;
        case 2:
          baseStyles.gridArea = "main";
          break;
        case 3:
          baseStyles.gridArea = "aside";
          break;
        case 4:
          baseStyles.gridArea = "footer";
          break;
        default:
          break;
      }
    }

    // Sidebar layout specific areas
    if (selectedLayout === "sidebar") {
      switch (index) {
        case 0:
          baseStyles.gridArea = "sidebar";
          break;
        case 1:
          baseStyles.gridArea = "header";
          break;
        case 2:
          baseStyles.gridArea = "main";
          break;
        case 3:
          baseStyles.gridArea = "footer";
          break;
        default:
          break;
      }
    }

    // Hover effects
    if (hoveredItem === item.id) {
      baseStyles.transform = "scale(1.05)";
      baseStyles.borderColor = "#ffffff";
      baseStyles.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
      baseStyles.zIndex = 10;
    }

    return baseStyles;
  };

  // Initialize grid items
  useEffect(() => {
    setGridItems(generateGridItems(itemCount));
  }, [generateGridItems, itemCount]);

  // Update item count based on layout
  useEffect(() => {
    let newCount = itemCount;
    switch (selectedLayout) {
      case "magazine":
        newCount = 5;
        break;
      case "sidebar":
        newCount = 4;
        break;
      default:
        newCount = Math.max(4, itemCount);
        break;
    }
    if (newCount !== gridItems.length) {
      setGridItems(generateGridItems(newCount));
    }
  }, [selectedLayout, itemCount, gridItems.length, generateGridItems]);

  // Performance monitoring
  useEffect(() => {
    if (!isActive) return;

    const handlePerformanceUpdate = (metrics: {
      fps: number;
      frameTime: number;
      memoryUsage: number;
    }) => {
      onPerformanceUpdate?.(metrics);
    };

    performanceMonitor.startMonitoring(handlePerformanceUpdate);

    return () => {
      performanceMonitor.stopMonitoring(handlePerformanceUpdate);
    };
  }, [isActive, onPerformanceUpdate]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-base border border-foreground p-4 space-y-4">
        <h3 className="zen-kaku-gothic-new text-lg text-primary flex items-center">
          <Grid className="w-5 h-5 mr-2" />
          Grid Layout Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Layout Type */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Layout Type
            </label>
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
              className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
            >
              {gridLayouts.map((layout) => (
                <option key={layout.value} value={layout.value}>
                  {layout.name}
                </option>
              ))}
            </select>
          </div>

          {/* Gap Size */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Gap: {gap}px
            </label>
            <input
              type="range"
              min="0"
              max="40"
              step="4"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Item Count (for applicable layouts) */}
          {!["magazine", "sidebar"].includes(selectedLayout) && (
            <div className="space-y-2">
              <label className="noto-sans-jp-light text-sm text-foreground">
                Items: {itemCount}
              </label>
              <input
                type="range"
                min="4"
                max="20"
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={shuffleItems}
            className="flex items-center border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            <span className="noto-sans-jp-light text-sm">Shuffle</span>
          </button>

          <button
            onClick={resetGrid}
            className="flex items-center border border-foreground px-4 py-2 hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span className="noto-sans-jp-light text-sm">Reset</span>
          </button>
        </div>
      </div>

      {/* Grid Display */}
      <div className="bg-base border border-foreground p-4 space-y-4">
        <h3 className="zen-kaku-gothic-new text-lg text-primary">
          {gridLayouts.find((l) => l.value === selectedLayout)?.name} Layout
        </h3>

        <div
          style={getGridStyles()}
          className="min-h-[400px] bg-background border border-foreground p-4"
        >
          {gridItems.map((item, index) => (
            <div
              key={item.id}
              style={getItemStyles(item, index)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                // Add click animation
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 300);
              }}
            >
              <div className="text-center">
                <div className="text-white font-bold text-lg mb-1">
                  {item.content}
                </div>
                <div className="text-white text-xs opacity-75">
                  {item.size} • {item.color}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Layout Information */}
      <div className="bg-base border border-foreground p-4 space-y-4">
        <h3 className="zen-kaku-gothic-new text-lg text-primary">
          Layout Properties
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="noto-sans-jp-light text-sm font-bold text-foreground">
              CSS Grid Properties:
            </h4>
            <div className="noto-sans-jp-light text-xs text-foreground space-y-1">
              <div>display: grid</div>
              <div>gap: {gap}px</div>
              <div>
                grid-template-columns:{" "}
                {gridLayouts.find((l) => l.value === selectedLayout)?.columns}
              </div>
              <div>
                grid-template-rows:{" "}
                {gridLayouts.find((l) => l.value === selectedLayout)?.rows}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="noto-sans-jp-light text-sm font-bold text-foreground">
              Features:
            </h4>
            <div className="noto-sans-jp-light text-xs text-foreground space-y-1">
              <div>• Responsive grid system</div>
              <div>• Interactive hover effects</div>
              <div>• Dynamic item sizing</div>
              <div>• Smooth transitions</div>
              <div>• Touch-friendly design</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
