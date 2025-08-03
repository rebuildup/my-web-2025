#!/usr/bin/env tsx

/**
 * Fix Remaining Migration Script
 * Manually fixes the remaining item that failed migration
 */

import { promises as fs } from "fs";

async function main() {
  console.log("🔧 Fixing remaining migration item...\n");

  try {
    const portfolioPath = "public/data/content/portfolio.json";
    const content = await fs.readFile(portfolioPath, "utf8");
    const items = JSON.parse(content);

    // Find the item that needs fixing
    const itemToFix = items.find(
      (item: { id: string }) => item.id === "portfolio-1753706120147",
    );

    if (!itemToFix) {
      console.log("❌ Item portfolio-1753706120147 not found");
      return;
    }

    if (itemToFix.markdownMigrated) {
      console.log("✅ Item is already migrated");
      return;
    }

    // Add markdown reference
    itemToFix.markdownPath = "portfolio/portfolio-1753706120147.md";
    itemToFix.markdownMigrated = true;

    // Write back to file
    await fs.writeFile(portfolioPath, JSON.stringify(items, null, 2), "utf8");

    console.log("✅ Successfully fixed the remaining migration item");
    console.log(`   - Added markdownPath: ${itemToFix.markdownPath}`);
    console.log(`   - Set markdownMigrated: ${itemToFix.markdownMigrated}`);
  } catch (error) {
    console.error("❌ Failed to fix migration:", error);
    process.exit(1);
  }
}

// Run the fix
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
