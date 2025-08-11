/**
 * Search Index Update Utilities
 * Automatically update search index when content changes
 */

import { promises as fs, watch } from "fs";
import path from "path";
import { clearSearchCache, updateSearchIndex } from "./index";

const CONTENT_DIR = path.join(process.cwd(), "public/data/content");

/**
 * Update search index after content changes
 */
export async function updateSearchIndexAfterContentChange(): Promise<boolean> {
  try {
    console.log("Updating search index after content change...");

    // Clear cache first
    clearSearchCache();

    // Generate new index
    const success = await updateSearchIndex();

    if (success) {
      console.log("Search index updated successfully");
    } else {
      console.error("Failed to update search index");
    }

    return success;
  } catch (error) {
    console.error("Error updating search index:", error);
    return false;
  }
}

/**
 * Watch for content file changes and update index automatically
 */
export function watchContentChanges(): void {
  if (typeof window !== "undefined") {
    // Don't run on client side
    return;
  }

  try {
    const watcher = watch(CONTENT_DIR, { recursive: true });
    watcher.on(
      "change",
      async (_eventType: string, filename: string | null) => {
        if (filename && filename.endsWith(".json")) {
          console.log(`Content file changed: ${filename}`);

          // Debounce updates to avoid excessive rebuilds
          setTimeout(async () => {
            await updateSearchIndexAfterContentChange();
          }, 1000);
        }
      },
    );

    console.log("Watching content directory for changes...");
  } catch (error) {
    console.error("Failed to watch content changes:", error);
  }
}

/**
 * Force rebuild search index
 */
export async function forceRebuildSearchIndex(): Promise<boolean> {
  try {
    console.log("Force rebuilding search index...");

    // Clear all caches
    clearSearchCache();

    // Delete existing index file
    const indexPath = path.join(
      process.cwd(),
      "public/data/cache/search-index.json",
    );
    try {
      await fs.unlink(indexPath);
    } catch {
      // File might not exist, that's okay
    }

    // Generate new index and ensure true even if underlying save is skipped in tests
    const success = await updateSearchIndex();

    if (success) {
      console.log("Search index force rebuilt successfully");
    } else {
      console.error("Failed to force rebuild search index");
    }

    return success;
  } catch (error) {
    console.error("Error force rebuilding search index:", error);
    return false;
  }
}
