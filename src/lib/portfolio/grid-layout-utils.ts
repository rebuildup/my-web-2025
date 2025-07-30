/**
 * Grid Layout Utilities for Video & Design Gallery
 * Implements content-responsive sizing for 3-column grid layout
 */

import { PortfolioContentItem } from "@/types/portfolio";

export interface GridItem {
  id: string;
  title: string;
  thumbnail: string;
  aspectRatio: number;
  gridSize: GridSize;
  priority: number;
  category: string;
  url: string;
}

export type GridSize = "1x1" | "1x2" | "2x1" | "2x2" | "1x3";

export interface GridLayoutConfig {
  columns: 3;
  minItemHeight: number;
  maxItemHeight: number;
  gap: number;
}

/**
 * Calculate optimal grid size based on content properties
 */
export function calculateCreativeGridSize(
  item: PortfolioContentItem,
  index: number,
  _totalItems: number,
  recentSizes: GridSize[],
): GridSize {
  const { priority, aspectRatio } = item;

  // Define base probabilities based on priority
  let probabilities: Record<GridSize, number>;

  if (priority >= 80) {
    // High priority: favor large sizes but with more variety
    probabilities = {
      "1x1": 0.05,
      "1x2": 0.2,
      "2x1": 0.2,
      "2x2": 0.3,
      "1x3": 0.25,
    };
  } else if (priority >= 60) {
    // Medium priority: balanced distribution with slight medium preference
    probabilities = {
      "1x1": 0.25,
      "1x2": 0.25,
      "2x1": 0.25,
      "2x2": 0.15,
      "1x3": 0.1,
    };
  } else {
    // Low priority: more varied distribution with surprises
    probabilities = {
      "1x1": 0.35,
      "1x2": 0.25,
      "2x1": 0.25,
      "2x2": 0.1,
      "1x3": 0.05,
    };
  }

  // Adjust probabilities based on aspect ratio
  if (aspectRatio) {
    if (aspectRatio > 1.5) {
      // Wide content - boost horizontal layouts
      probabilities["2x1"] *= 1.5;
      probabilities["1x2"] *= 0.5;
    } else if (aspectRatio < 0.7) {
      // Tall content - boost vertical layouts
      probabilities["1x2"] *= 1.5;
      probabilities["1x3"] *= 1.3;
      probabilities["2x1"] *= 0.5;
    }
  }

  // Penalize recently used sizes to avoid repetition
  recentSizes.forEach((recentSize, recentIndex) => {
    const penalty = 1 - (recentIndex + 1) * 0.3; // More recent = higher penalty
    probabilities[recentSize] *= Math.max(penalty, 0.1); // Minimum 10% chance
  });

  // Add position-based variation for more organic feel
  const positionVariation = Math.sin(index * 0.7) * 0.2 + 1; // Sine wave variation
  Object.keys(probabilities).forEach((size) => {
    probabilities[size as GridSize] *= positionVariation;
  });

  // Normalize probabilities
  const totalProbability = Object.values(probabilities).reduce(
    (sum, prob) => sum + prob,
    0,
  );
  Object.keys(probabilities).forEach((size) => {
    probabilities[size as GridSize] /= totalProbability;
  });

  // Select size based on weighted random
  return selectWeightedRandom(probabilities);
}

/**
 * Select a random item based on weighted probabilities
 */
function selectWeightedRandom(
  probabilities: Record<GridSize, number>,
): GridSize {
  const random = Math.random();
  let cumulativeWeight = 0;

  for (const [size, weight] of Object.entries(probabilities)) {
    cumulativeWeight += weight;
    if (random <= cumulativeWeight) {
      return size as GridSize;
    }
  }

  // Fallback
  return "1x1";
}

/**
 * Calculate aspect ratio from image dimensions or content type
 */
export function calculateAspectRatio(item: PortfolioContentItem): number {
  // If aspect ratio is already provided, use it
  if (item.aspectRatio) {
    return item.aspectRatio;
  }

  // For now, we'll use default aspect ratios based on category
  // In the future, this could be enhanced to analyze actual image dimensions

  // Default aspect ratios based on category
  switch (item.category) {
    case "video":
      return 16 / 9; // Standard video aspect ratio
    case "design":
      return 4 / 3; // Common design aspect ratio
    case "develop":
      return 16 / 10; // Common web development aspect ratio
    default:
      return 1; // Square fallback
  }
}

/**
 * Generate grid layout with creative, non-repetitive distribution
 */
export function generateGridLayout(items: PortfolioContentItem[]): GridItem[] {
  // Sort items by priority and creation date
  const sortedItems = [...items].sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const gridItems: GridItem[] = [];
  const recentSizes: GridSize[] = []; // Track recent sizes to avoid repetition
  const maxRecentTrack = 4; // Number of recent items to track

  sortedItems.forEach((item, index) => {
    const aspectRatio = calculateAspectRatio(item);
    const gridSize = calculateCreativeGridSize(
      item,
      index,
      sortedItems.length,
      recentSizes,
    );

    // Add to recent sizes tracking
    recentSizes.push(gridSize);
    if (recentSizes.length > maxRecentTrack) {
      recentSizes.shift();
    }

    gridItems.push({
      id: item.id,
      title: item.title,
      thumbnail:
        item.thumbnail ||
        item.images?.[0] ||
        "/images/portfolio/placeholder-image.svg",
      aspectRatio,
      gridSize,
      priority: item.priority,
      category: item.category,
      url: `/portfolio/${item.id}`,
    });
  });

  return gridItems;
}

/**
 * Get CSS classes for grid item based on size
 */
export function getGridItemClasses(gridSize: GridSize): string {
  const baseClasses =
    "relative overflow-hidden bg-base border border-foreground";

  switch (gridSize) {
    case "1x1":
      return `${baseClasses} col-span-1 row-span-1`;
    case "1x2":
      return `${baseClasses} col-span-1 row-span-2`;
    case "2x1":
      return `${baseClasses} col-span-2 row-span-1`;
    case "2x2":
      return `${baseClasses} col-span-2 row-span-2`;
    case "1x3":
      return `${baseClasses} col-span-1 row-span-3`;
    default:
      return `${baseClasses} col-span-1 row-span-1`;
  }
}

/**
 * Get minimum height for grid item based on size using global grid system
 */
export function getGridItemMinHeight(gridSize: GridSize): string {
  // Use CSS custom properties from global grid system
  switch (gridSize) {
    case "1x1":
      return "min-h-[var(--gallery-item-base)]"; // 200px base
    case "1x2":
      return "min-h-[var(--gallery-item-double)]"; // 420px
    case "2x1":
      return "min-h-[var(--gallery-item-base)]"; // 200px base
    case "2x2":
      return "min-h-[var(--gallery-item-double)]"; // 420px
    case "1x3":
      return "min-h-[var(--gallery-item-triple)]"; // 640px
    default:
      return "min-h-[var(--gallery-item-base)]"; // 200px base
  }
}

/**
 * Shuffle array for random distribution
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create balanced grid layout with perfect gap filling and size variation
 */
export function createBalancedLayout(items: GridItem[]): GridItem[] {
  const result: GridItem[] = [];
  const remaining = [...items];

  // Track grid state for perfect filling
  const gridState = new GridTracker();

  while (remaining.length > 0) {
    const nextPosition = gridState.getNextAvailablePosition();
    const availableSpace = gridState.getAvailableSpace(nextPosition);

    // Find the best item that fits in the available space and avoids repetition
    const bestItem = findBestItemForPosition(
      remaining,
      availableSpace,
      result.slice(-3), // Check last 3 items for size repetition
      nextPosition,
    );

    if (bestItem) {
      result.push(bestItem);
      remaining.splice(remaining.indexOf(bestItem), 1);
      gridState.placeItem(bestItem, nextPosition);
    } else {
      // Fallback: take smallest available item
      const smallestItem = remaining.reduce((smallest, current) =>
        getItemArea(current.gridSize) < getItemArea(smallest.gridSize)
          ? current
          : smallest,
      );
      result.push(smallestItem);
      remaining.splice(remaining.indexOf(smallestItem), 1);
      gridState.placeItem(smallestItem, nextPosition);
    }
  }

  // Fill remaining gaps with placeholder items
  const filledResult = fillGridGaps(result, gridState);

  return filledResult;
}

/**
 * Grid tracker to manage perfect filling
 */
class GridTracker {
  private grid: boolean[][] = [];
  private currentRow = 0;
  private readonly COLS = 3;

  constructor() {
    // Initialize with empty grid
    this.expandGrid();
  }

  private expandGrid() {
    // Add more rows as needed
    const targetRows = Math.max(this.currentRow + 10, this.grid.length + 5);
    for (let i = this.grid.length; i < targetRows; i++) {
      this.grid[i] = new Array(this.COLS).fill(false);
    }
  }

  getNextAvailablePosition(): { row: number; col: number } {
    this.expandGrid();

    for (let row = 0; row < this.grid.length; row++) {
      for (let col = 0; col < this.COLS; col++) {
        if (!this.grid[row][col]) {
          return { row, col };
        }
      }
    }

    // Should never reach here, but fallback
    return { row: this.grid.length, col: 0 };
  }

  getAvailableSpace(position: { row: number; col: number }): {
    maxCols: number;
    maxRows: number;
  } {
    this.expandGrid();

    const { row, col } = position;
    let maxCols = 0;
    let maxRows = 0;

    // Check horizontal space
    if (this.grid[row]) {
      for (let c = col; c < this.COLS && !this.grid[row][c]; c++) {
        maxCols++;
      }
    }

    // Check vertical space
    for (
      let r = row;
      r < this.grid.length && this.grid[r] && !this.grid[r][col];
      r++
    ) {
      maxRows++;
    }

    return { maxCols, maxRows };
  }

  placeItem(item: GridItem, position: { row: number; col: number }) {
    const { row, col } = position;
    const colSpan = getColumnSpan(item.gridSize);
    const rowSpan = getRowSpan(item.gridSize);

    // Ensure grid is large enough
    const requiredRows = row + rowSpan;
    while (this.grid.length < requiredRows) {
      this.grid.push(new Array(this.COLS).fill(false));
    }

    // Mark grid cells as occupied
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        if (r < this.grid.length && c < this.COLS && this.grid[r]) {
          this.grid[r][c] = true;
        }
      }
    }
  }
}

/**
 * Find the best item for a specific position considering space and variety
 */
function findBestItemForPosition(
  candidates: GridItem[],
  availableSpace: { maxCols: number; maxRows: number },
  recentItems: GridItem[],
  position: { row: number; col: number },
): GridItem | null {
  const recentSizes = recentItems.map((item) => item.gridSize);

  // Filter candidates that fit in available space
  const fittingCandidates = candidates.filter((item) => {
    const colSpan = getColumnSpan(item.gridSize);
    const rowSpan = getRowSpan(item.gridSize);
    return (
      colSpan <= availableSpace.maxCols && rowSpan <= availableSpace.maxRows
    );
  });

  if (fittingCandidates.length === 0) return null;

  // Prefer items that haven't been used recently
  const nonRecentCandidates = fittingCandidates.filter(
    (item) => !recentSizes.includes(item.gridSize),
  );

  const candidatePool =
    nonRecentCandidates.length > 0 ? nonRecentCandidates : fittingCandidates;

  // Score candidates based on multiple factors
  const scoredCandidates = candidatePool.map((item) => ({
    item,
    score: calculateItemScore(item, availableSpace, position, recentSizes),
  }));

  // Sort by score (higher is better)
  scoredCandidates.sort((a, b) => b.score - a.score);

  return scoredCandidates[0]?.item || null;
}

/**
 * Calculate score for item placement
 */
function calculateItemScore(
  item: GridItem,
  availableSpace: { maxCols: number; maxRows: number },
  position: { row: number; col: number },
  recentSizes: GridSize[],
): number {
  let score = item.priority; // Base score from priority

  const colSpan = getColumnSpan(item.gridSize);
  const rowSpan = getRowSpan(item.gridSize);

  // Bonus for filling space efficiently
  const spaceEfficiency =
    (colSpan * rowSpan) /
    (availableSpace.maxCols * Math.min(availableSpace.maxRows, 3));
  score += spaceEfficiency * 50;

  // Penalty for recent size usage
  if (recentSizes.includes(item.gridSize)) {
    score -= 30;
  }

  // Bonus for variety in grid positions
  if (position.col === 0 && colSpan === 2) {
    score += 10; // Prefer 2-wide items at start of row
  }

  // Bonus for perfect fits
  if (colSpan === availableSpace.maxCols) {
    score += 20;
  }

  return score;
}

/**
 * Get area of grid item
 */
function getItemArea(gridSize: GridSize): number {
  return getColumnSpan(gridSize) * getRowSpan(gridSize);
}

/**
 * Fill remaining gaps in the grid with placeholder items
 */
function fillGridGaps(items: GridItem[], gridState: GridTracker): GridItem[] {
  const result = [...items];
  let placeholderCount = 0;

  // Fill only the current incomplete row
  while (true) {
    const nextPosition = gridState.getNextAvailablePosition();

    // If we're at the start of a new row, stop (current row is complete)
    if (nextPosition.col === 0) {
      break;
    }

    const availableSpace = gridState.getAvailableSpace(nextPosition);

    // If no space available, break
    if (availableSpace.maxCols === 0 || availableSpace.maxRows === 0) {
      break;
    }

    // Calculate remaining columns in current row
    const remainingCols = 3 - nextPosition.col;

    // Choose size based on remaining space
    let placeholderSize: GridSize;
    if (remainingCols >= 2) {
      placeholderSize = "2x1"; // Fill 2 columns with single height
    } else {
      placeholderSize = "1x1"; // Fill 1 column
    }

    const placeholder = createPlaceholderItem(
      placeholderCount++,
      placeholderSize,
    );

    result.push(placeholder);
    gridState.placeItem(placeholder, nextPosition);

    // Safety check to prevent infinite loop
    if (placeholderCount > 10) {
      break;
    }
  }

  return result;
}

// Removed unused functions: determinePlaceholderSize and determinePlaceholderSizeForLastRow

/**
 * Create a placeholder grid item
 */
function createPlaceholderItem(index: number, gridSize: GridSize): GridItem {
  return {
    id: `placeholder-${index}`,
    title: "",
    thumbnail: "", // Empty thumbnail for placeholder
    aspectRatio: 1,
    gridSize,
    priority: 0,
    category: "placeholder",
    url: "#",
  };
}

/**
 * Get column span for grid size
 */
function getColumnSpan(gridSize: GridSize): number {
  switch (gridSize) {
    case "2x1":
    case "2x2":
      return 2;
    default:
      return 1;
  }
}

/**
 * Get row span for grid size
 */
function getRowSpan(gridSize: GridSize): number {
  switch (gridSize) {
    case "1x2":
    case "2x2":
      return 2;
    case "1x3":
      return 3;
    default:
      return 1;
  }
}
