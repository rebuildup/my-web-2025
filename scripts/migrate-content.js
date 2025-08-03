#!/usr/bin/env node

/**
 * Content Migration CLI Script
 * Migrates existing string-based content to markdown files
 */

const { contentMigrationService } = require("../src/lib/markdown/migration.ts");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes("--dry-run"),
  backupOriginal: !args.includes("--no-backup"),
  overwriteExisting: args.includes("--overwrite"),
  batchSize:
    parseInt(
      args.find((arg) => arg.startsWith("--batch-size="))?.split("=")[1],
    ) || 10,
};

const command = args.find((arg) => !arg.startsWith("--")) || "migrate";

async function main() {
  console.log("Content Migration Tool");
  console.log("======================");
  console.log(`Command: ${command}`);
  console.log(`Options:`, options);
  console.log("");

  try {
    switch (command) {
      case "migrate":
        await runMigration();
        break;
      case "status":
        await showStatus();
        break;
      case "rollback":
        await runRollback();
        break;
      default:
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

async function runMigration() {
  console.log("Starting content migration...");

  if (options.dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made");
  }

  const summary = await contentMigrationService.migrateAllContent(options);

  console.log("\nMigration Results:");
  console.log("==================");
  console.log(`Total items: ${summary.totalItems}`);
  console.log(`✅ Successful: ${summary.successCount}`);
  console.log(`❌ Failed: ${summary.failureCount}`);

  if (summary.errors.length > 0) {
    console.log("\nErrors:");
    summary.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (options.dryRun) {
    console.log("\n📋 Preview of files that would be created:");
    summary.results
      .filter((r) => r.success && r.filePath)
      .forEach((r) => console.log(`  - ${r.filePath}`));
  }

  console.log("\nMigration completed!");
}

async function showStatus() {
  console.log("Getting migration status...");

  const status = await contentMigrationService.getMigrationStatus();

  console.log("\nMigration Status:");
  console.log("=================");
  console.log(`Total files: ${status.totalFiles}`);
  console.log(`Total items: ${status.totalItems}`);
  console.log(`✅ Migrated: ${status.migratedItems}`);
  console.log(`⏳ Pending: ${status.pendingItems}`);

  if (status.fileStatus.length > 0) {
    console.log("\nFile Details:");
    status.fileStatus.forEach((file) => {
      const percentage =
        file.totalItems > 0
          ? Math.round((file.migratedItems / file.totalItems) * 100)
          : 0;
      console.log(
        `  ${file.fileName}: ${file.migratedItems}/${file.totalItems} (${percentage}%)`,
      );
    });
  }
}

async function runRollback() {
  const itemIds = args.filter(
    (arg) => !arg.startsWith("--") && arg !== "rollback",
  );

  if (itemIds.length === 0) {
    console.log("❌ No item IDs provided for rollback");
    console.log(
      "Usage: node migrate-content.js rollback <item-id-1> <item-id-2> ...",
    );
    process.exit(1);
  }

  console.log(`Rolling back migration for ${itemIds.length} items...`);
  console.log("Items:", itemIds);

  const summary = await contentMigrationService.rollbackMigration(itemIds);

  console.log("\nRollback Results:");
  console.log("=================");
  console.log(`Total items: ${summary.totalItems}`);
  console.log(`✅ Successful: ${summary.successCount}`);
  console.log(`❌ Failed: ${summary.failureCount}`);

  if (summary.errors.length > 0) {
    console.log("\nErrors:");
    summary.errors.forEach((error) => console.log(`  - ${error}`));
  }

  console.log("\nRollback completed!");
}

function showHelp() {
  console.log(`
Content Migration Tool

Usage:
  node migrate-content.js [command] [options]

Commands:
  migrate    Migrate content to markdown files (default)
  status     Show migration status
  rollback   Rollback migration for specific items

Options:
  --dry-run           Preview migration without making changes
  --no-backup         Skip creating backup of original files
  --overwrite         Overwrite existing markdown files
  --batch-size=N      Process items in batches of N (default: 10)

Examples:
  node migrate-content.js migrate --dry-run
  node migrate-content.js status
  node migrate-content.js rollback item-1 item-2
  node migrate-content.js migrate --overwrite --batch-size=5
`);
}

// Run the script
main().catch(console.error);
