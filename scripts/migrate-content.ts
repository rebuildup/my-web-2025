#!/usr/bin/env tsx

/**
 * Content Migration Script
 * Migrates existing string-based content to markdown files
 */

import { contentMigrationService } from "../src/lib/markdown/migration";

async function main() {
  console.log("📊 Checking current migration status...\n");

  try {
    // Get current migration status
    const status = await contentMigrationService.getMigrationStatus();

    console.log("Current Migration Status:");
    console.log(`- Total files: ${status.totalFiles}`);
    console.log(`- Total items: ${status.totalItems}`);
    console.log(`- Migrated items: ${status.migratedItems}`);
    console.log(`- Pending items: ${status.pendingItems}\n`);

    // Show status per file
    console.log("File-by-file status:");
    for (const fileStatus of status.fileStatus) {
      console.log(`  ${fileStatus.fileName}:`);
      console.log(`    - Total: ${fileStatus.totalItems}`);
      console.log(`    - Migrated: ${fileStatus.migratedItems}`);
      console.log(`    - Pending: ${fileStatus.pendingItems}`);
    }
    console.log("");

    if (status.pendingItems === 0) {
      console.log("✅ All content is already migrated!");
      return;
    }

    console.log(
      `🔄 Starting migration of ${status.pendingItems} pending items...\n`,
    );

    // Run the migration
    const migrationResult = await contentMigrationService.migrateAllContent({
      dryRun: false,
      backupOriginal: true,
      overwriteExisting: false,
      batchSize: 5,
    });

    console.log("\n📋 Migration Results:");
    console.log(`- Total items processed: ${migrationResult.totalItems}`);
    console.log(`- Successful migrations: ${migrationResult.successCount}`);
    console.log(`- Failed migrations: ${migrationResult.failureCount}`);

    if (migrationResult.errors.length > 0) {
      console.log("\n❌ Errors encountered:");
      migrationResult.errors.forEach((error) => {
        console.log(`  - ${error}`);
      });
    }

    if (migrationResult.failureCount > 0) {
      console.log("\n⚠️  Some items failed to migrate. Details:");
      migrationResult.results
        .filter((result) => !result.success)
        .forEach((result) => {
          console.log(`  - ${result.itemId}: ${result.error}`);
        });
    }

    // Show final status
    console.log("\n📊 Final migration status...");
    const finalStatus = await contentMigrationService.getMigrationStatus();
    console.log(`- Total items: ${finalStatus.totalItems}`);
    console.log(`- Migrated items: ${finalStatus.migratedItems}`);
    console.log(`- Pending items: ${finalStatus.pendingItems}`);

    if (finalStatus.pendingItems === 0) {
      console.log(
        "\n🎉 All content has been successfully migrated to markdown files!",
      );
    } else {
      console.log(
        `\n⚠️  ${finalStatus.pendingItems} items still need migration.`,
      );
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
