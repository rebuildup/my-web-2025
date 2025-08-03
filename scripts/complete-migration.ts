#!/usr/bin/env tsx

/**
 * Complete Migration Script
 * Handles remaining items with overwrite option
 */

import { contentMigrationService } from "../src/lib/markdown/migration";

async function main() {
  console.log("🔄 Completing migration with overwrite for existing files...\n");

  try {
    // Run migration with overwrite option for remaining items
    const migrationResult = await contentMigrationService.migrateAllContent({
      dryRun: false,
      backupOriginal: false, // Already backed up
      overwriteExisting: true,
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
