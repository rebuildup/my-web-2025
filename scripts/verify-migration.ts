#!/usr/bin/env tsx

/**
 * Migration Verification Script
 * Verifies that all migrated content can be properly read and displayed
 */

import { promises as fs } from "fs";
import path from "path";

async function main() {
  console.log("🔍 Verifying migration results...\n");

  try {
    // Read the portfolio data
    const portfolioPath = "public/data/content/portfolio.json";
    const content = await fs.readFile(portfolioPath, "utf8");
    const items = JSON.parse(content);

    console.log(`📊 Found ${items.length} portfolio items`);

    let migratedCount = 0;
    const verificationErrors = [];

    for (const item of items) {
      if (item.markdownMigrated && item.markdownPath) {
        migratedCount++;

        try {
          // Verify the markdown file exists and can be read
          const fullPath = path.join(
            "public/data/content/markdown",
            item.markdownPath,
          );
          const markdownContent = await fs.readFile(fullPath, "utf8");

          // Basic validation
          if (!markdownContent || markdownContent.trim() === "") {
            verificationErrors.push(`${item.id}: Empty markdown content`);
          } else if (markdownContent !== item.content) {
            verificationErrors.push(
              `${item.id}: Markdown content doesn't match original content`,
            );
          }
        } catch (error) {
          verificationErrors.push(
            `${item.id}: Failed to read markdown file - ${error}`,
          );
        }
      }
    }

    console.log(`✅ Migrated items: ${migratedCount}/${items.length}`);
    console.log(`📁 Verification errors: ${verificationErrors.length}`);

    if (verificationErrors.length > 0) {
      console.log("\n❌ Verification errors found:");
      verificationErrors.forEach((error) => {
        console.log(`  - ${error}`);
      });
    } else {
      console.log("\n🎉 All migrated content verified successfully!");
    }

    // Check markdown directory structure
    console.log("\n📂 Checking markdown directory structure...");
    const markdownDir = "public/data/content/markdown/portfolio";
    const markdownFiles = await fs.readdir(markdownDir);
    console.log(`   Found ${markdownFiles.length} markdown files`);

    // Sample a few files to verify content
    console.log("\n📄 Sample content verification:");
    const sampleFiles = markdownFiles.slice(0, 3);
    for (const fileName of sampleFiles) {
      const filePath = path.join(markdownDir, fileName);
      const content = await fs.readFile(filePath, "utf8");
      const preview =
        content.length > 50 ? content.substring(0, 50) + "..." : content;
      console.log(`   ${fileName}: "${preview}"`);
    }

    console.log("\n✅ Migration verification completed!");
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

// Run the verification
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
