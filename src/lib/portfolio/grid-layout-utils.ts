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
  const baseClasses = "relative border border-foreground";

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
 * Create balanced grid layout with improved bottom row alignment
 */
export function createBalancedLayout(items: GridItem[]): GridItem[] {
  // Input validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.warn("createBalancedLayout: Invalid or empty items array");
    return [];
  }

  try {
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

    // Apply improved bottom row alignment
    const alignedResult = alignBottomRow(result, gridState);

    // Ensure we return a valid array
    if (!alignedResult || !Array.isArray(alignedResult)) {
      console.warn(
        "createBalancedLayout: alignBottomRow returned invalid result",
      );
      return result;
    }

    return alignedResult;
  } catch (error) {
    console.error("Error in createBalancedLayout:", error);
    // Return original items as fallback
    return items;
  }
}

/**
 * Grid tracker to manage perfect filling with improved bottom row handling
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
        if (!this.grid[row] || !this.grid[row][col]) {
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
    try {
      this.expandGrid();

      const { row, col } = position;

      // Validate position
      if (row < 0 || col < 0 || col >= this.COLS) {
        return { maxCols: 0, maxRows: 0 };
      }

      let maxCols = 0;
      let maxRows = 0;

      // Check horizontal space - ensure row exists
      if (this.grid[row]) {
        for (let c = col; c < this.COLS && !this.grid[row][c]; c++) {
          maxCols++;
        }
      } else {
        // If row doesn't exist, we have full width available
        maxCols = this.COLS - col;
      }

      // Check vertical space - ensure each row exists before checking
      for (let r = row; r < this.grid.length; r++) {
        if (!this.grid[r]) {
          // If row doesn't exist, we can expand vertically
          maxRows++;
        } else if (!this.grid[r][col]) {
          // Row exists and cell is empty
          maxRows++;
        } else {
          // Row exists and cell is occupied
          break;
        }
      }

      // If we haven't found any vertical space, we can still expand
      if (maxRows === 0) {
        maxRows = 1;
      }

      return { maxCols, maxRows };
    } catch (error) {
      console.error("Error in getAvailableSpace:", error);
      return { maxCols: 1, maxRows: 1 };
    }
  }

  placeItem(item: GridItem, position: { row: number; col: number }) {
    try {
      if (!item || !position) {
        console.warn("placeItem: Invalid item or position");
        return;
      }

      const { row, col } = position;

      // Validate position
      if (row < 0 || col < 0 || col >= this.COLS) {
        console.warn("placeItem: Invalid position", position);
        return;
      }

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
          if (r < this.grid.length && c < this.COLS) {
            // Ensure row exists before accessing
            if (!this.grid[r]) {
              this.grid[r] = new Array(this.COLS).fill(false);
            }
            this.grid[r][c] = true;
          }
        }
      }
    } catch (error) {
      console.error("Error in placeItem:", error);
    }
  }

  /**
   * Get the current grid state for debugging and analysis
   */
  getGridState(): boolean[][] {
    return this.grid.map((row) => [...row]);
  }

  /**
   * Get the last row that has any occupied cells
   */
  getLastOccupiedRow(): number {
    for (let row = this.grid.length - 1; row >= 0; row--) {
      if (this.grid[row] && this.grid[row].some((cell) => cell)) {
        return row;
      }
    }
    return -1;
  }

  /**
   * Check if a row is complete (all cells occupied)
   */
  isRowComplete(row: number): boolean {
    if (!this.grid[row]) return false;
    return this.grid[row].every((cell) => cell);
  }

  /**
   * Get the number of occupied cells in a row
   */
  getRowOccupancy(row: number): number {
    if (!this.grid[row]) return 0;
    return this.grid[row].filter((cell) => cell).length;
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
  try {
    // Input validation
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return null;
    }

    if (
      !availableSpace ||
      availableSpace.maxCols <= 0 ||
      availableSpace.maxRows <= 0
    ) {
      return null;
    }

    const recentSizes = (recentItems || [])
      .map((item) => item?.gridSize)
      .filter(Boolean);

    // Filter candidates that fit in available space
    const fittingCandidates = candidates.filter((item) => {
      if (!item || !item.gridSize) return false;

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
  } catch (error) {
    console.error("Error in findBestItemForPosition:", error);
    return candidates[0] || null;
  }
}

/**
 * Calculate score for item placement with improved bottom row handling
 */
function calculateItemScore(
  item: GridItem,
  availableSpace: { maxCols: number; maxRows: number },
  position: { row: number; col: number },
  recentSizes: GridSize[],
): number {
  try {
    // Input validation
    if (!item || !availableSpace || !position) {
      return 0;
    }

    let score = item.priority || 0; // Base score from priority

    const colSpan = getColumnSpan(item.gridSize);
    const rowSpan = getRowSpan(item.gridSize);

    // Bonus for filling space efficiently
    const maxRows = Math.min(availableSpace.maxRows, 3);
    if (availableSpace.maxCols > 0 && maxRows > 0) {
      const spaceEfficiency =
        (colSpan * rowSpan) / (availableSpace.maxCols * maxRows);
      score += spaceEfficiency * 50;
    }

    // Penalty for recent size usage
    if (recentSizes && recentSizes.includes(item.gridSize)) {
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

    // Special handling for bottom row alignment
    // Prefer items that create better visual balance
    if (position.col > 0) {
      // We're not at the start of a row, consider bottom row alignment
      const remainingCols = availableSpace.maxCols;

      if (remainingCols === 2 && colSpan === 2) {
        // Perfect fit for remaining space
        score += 30;
      } else if (remainingCols === 1 && colSpan === 1) {
        // Perfect fit for single remaining cell
        score += 25;
      } else if (remainingCols === 2 && colSpan === 1) {
        // Leaves one cell, which is acceptable for visual balance
        score += 15;
      }
    }

    // Bonus for creating balanced layouts
    // Prefer smaller items when we have limited space to avoid overflow
    if (availableSpace.maxCols <= 2) {
      if (colSpan <= availableSpace.maxCols) {
        score += 10;
      } else {
        score -= 50; // Heavy penalty for items that don't fit
      }
    }

    return score;
  } catch (error) {
    console.error("Error in calculateItemScore:", error);
    return item?.priority || 0;
  }
}

/**
 * Get area of grid item
 */
function getItemArea(gridSize: GridSize): number {
  return getColumnSpan(gridSize) * getRowSpan(gridSize);
}

/**
 * Align bottom row with improved spacing and consistent alignment
 */
function alignBottomRow(items: GridItem[], gridState: GridTracker): GridItem[] {
  // Input validation
  if (!items || !Array.isArray(items)) {
    console.warn("alignBottomRow: Invalid items array");
    return [];
  }

  if (!gridState) {
    console.warn("alignBottomRow: Invalid gridState");
    return items;
  }

  try {
    const result = [...items];
    const lastOccupiedRow = gridState.getLastOccupiedRow();

    // If no occupied rows, return as is
    if (lastOccupiedRow < 0) {
      return result;
    }

    // Check if the last row is incomplete
    const isLastRowComplete = gridState.isRowComplete(lastOccupiedRow);

    if (isLastRowComplete) {
      // Last row is complete, no alignment needed
      return result;
    }

    // Get current occupancy of the last row
    const currentOccupancy = gridState.getRowOccupancy(lastOccupiedRow);
    const remainingCells = 3 - currentOccupancy;

    // Strategy for bottom row alignment based on remaining space
    let placeholderCount = 0;

    if (remainingCells === 2) {
      // Two cells remaining - add one 2x1 placeholder for balanced look
      const placeholder = createPlaceholderItem(placeholderCount++, "2x1");
      const nextPosition = gridState.getNextAvailablePosition();

      if (nextPosition.row === lastOccupiedRow) {
        result.push(placeholder);
        gridState.placeItem(placeholder, nextPosition);
      }
    } else if (remainingCells === 1) {
      // One cell remaining - add one 1x1 placeholder
      const placeholder = createPlaceholderItem(placeholderCount++, "1x1");
      const nextPosition = gridState.getNextAvailablePosition();

      if (nextPosition.row === lastOccupiedRow) {
        result.push(placeholder);
        gridState.placeItem(placeholder, nextPosition);
      }
    }

    // For better visual balance, ensure we don't have orphaned single items
    // If the last row has only one item, try to balance it
    if (currentOccupancy === 1 && remainingCells === 2) {
      // Add a 1x1 placeholder to create better visual balance
      // This leaves one cell empty for a more organic look
      const placeholder = createPlaceholderItem(placeholderCount++, "1x1");
      const nextPosition = gridState.getNextAvailablePosition();

      if (nextPosition.row === lastOccupiedRow) {
        result.push(placeholder);
        gridState.placeItem(placeholder, nextPosition);
      }
    }

    return result;
  } catch (error) {
    console.error("Error in alignBottomRow:", error);
    return items;
  }
}

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
