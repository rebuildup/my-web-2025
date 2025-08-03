#!/usr/bin/env node

/**
 * Migration Script for Markdown Content System
 * Runs the migration of existing content to markdown files
 */

const { execSync } = require("child_process");
const path = require("path");

// Change to project root directory
process.chdir(path.join(__dirname, ".."));

console.log("🚀 Starting content migration to markdown system...\n");

try {
  // Run the migration using Node.js with TypeScript support
  const result = execSync("npx tsx scripts/migrate-content.ts", {
    stdio: "inherit",
    encoding: "utf8",
  });

  console.log("\n✅ Migration completed successfully!");
} catch (error) {
  console.error("\n❌ Migration failed:", error.message);
  process.exit(1);
}
