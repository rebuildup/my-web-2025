#!/usr/bin/env node

/**
 * Clear Development Cache Script
 * Clears all development-related caches that might cause HMR issues
 */

const fs = require("fs");
const path = require("path");

function removeDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removed: ${dirPath}`);
  } else {
    console.log(`⚠️  Not found: ${dirPath}`);
  }
}

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`✅ Removed: ${filePath}`);
  } else {
    console.log(`⚠️  Not found: ${filePath}`);
  }
}

console.log("🧹 Clearing development caches...\n");

// Next.js build cache
removeDirectory(".next");

// Node modules cache
removeDirectory("node_modules/.cache");

// TypeScript cache
removeFile(".tsbuildinfo");

// ESLint cache
removeFile(".eslintcache");

// Prettier cache
removeFile(".prettiercache");

// Jest cache
removeDirectory("node_modules/.cache/jest");

// Turbopack cache
removeDirectory(".turbo");

// SWC cache
removeDirectory("node_modules/.cache/@swc");

console.log("\n🎉 Development cache cleared successfully!");
console.log('💡 Run "npm run dev" to start fresh development server.');
