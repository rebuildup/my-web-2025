#!/usr/bin/env node

/**
 * Cache Clear Script
 * デプロイ後にキャッシュをクリアするためのスクリプト
 */

const fs = require("fs").promises;
const path = require("path");

async function clearCache() {
  try {
    console.log("🧹 Clearing Next.js cache...");

    // Clear .next cache
    const nextCachePath = path.join(process.cwd(), ".next");
    try {
      await fs.rmdir(nextCachePath, { recursive: true });
      console.log("✅ .next cache cleared");
    } catch (error) {
      console.log("ℹ️  .next cache not found or already cleared");
    }

    // Clear node_modules/.cache if exists
    const nodeModulesCachePath = path.join(
      process.cwd(),
      "node_modules",
      ".cache",
    );
    try {
      await fs.rmdir(nodeModulesCachePath, { recursive: true });
      console.log("✅ node_modules/.cache cleared");
    } catch (error) {
      console.log("ℹ️  node_modules/.cache not found or already cleared");
    }

    console.log("🎉 Cache clearing completed!");
    console.log(
      "💡 Please restart your development server or redeploy to production",
    );
  } catch (error) {
    console.error("❌ Error clearing cache:", error);
    process.exit(1);
  }
}

clearCache();
