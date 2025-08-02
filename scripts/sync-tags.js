#!/usr/bin/env node

/**
 * Tag Synchronization Script
 * Extracts tags from portfolio content and updates the tags.json file
 */

const fs = require("fs").promises;
const path = require("path");

async function syncTags() {
  try {
    console.log("🏷️  Starting tag synchronization...");

    // Load portfolio content
    const portfolioPath = path.join(
      process.cwd(),
      "public/data/content/portfolio.json",
    );
    const portfolioContent = await fs.readFile(portfolioPath, "utf-8");
    const portfolioItems = JSON.parse(portfolioContent);

    console.log(`📁 Loaded ${portfolioItems.length} portfolio items`);

    // Extract all tags from content
    const tagCounts = new Map();
    let totalTagsFound = 0;

    for (const item of portfolioItems) {
      if (item.tags && Array.isArray(item.tags)) {
        for (const tag of item.tags) {
          if (typeof tag === "string" && tag.trim()) {
            const normalizedTag = normalizeTagName(tag);
            if (normalizedTag) {
              tagCounts.set(
                normalizedTag,
                (tagCounts.get(normalizedTag) || 0) + 1,
              );
              totalTagsFound++;
            }
          }
        }
      }
    }

    console.log(
      `🔍 Found ${totalTagsFound} tag instances across ${tagCounts.size} unique tags`,
    );

    // Create TagInfo objects
    const now = new Date().toISOString();
    const tags = Array.from(tagCounts.entries()).map(([name, count]) => ({
      name,
      count,
      createdAt: now,
      lastUsed: now,
    }));

    // Sort by usage count (descending)
    tags.sort((a, b) => b.count - a.count);

    // Save to tags.json
    const tagsPath = path.join(process.cwd(), "public/data/tags.json");
    const tagData = {
      tags,
      lastUpdated: now,
    };

    await fs.writeFile(tagsPath, JSON.stringify(tagData, null, 2), "utf-8");

    console.log("✅ Tag synchronization completed!");
    console.log(`📊 Statistics:`);
    console.log(`   - Unique tags: ${tags.length}`);
    console.log(`   - Total usage: ${totalTagsFound}`);

    if (tags.length > 0) {
      console.log(
        `   - Most used tag: "${tags[0].name}" (${tags[0].count} times)`,
      );
      console.log(`   - Top 5 tags:`);
      tags.slice(0, 5).forEach((tag, index) => {
        console.log(`     ${index + 1}. "${tag.name}" (${tag.count} times)`);
      });
    }
  } catch (error) {
    console.error("❌ Error during tag synchronization:", error);
    process.exit(1);
  }
}

function normalizeTagName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[^\w\s-]/g, "") // Remove special characters except hyphens
    .trim();
}

// Run the script
syncTags();
