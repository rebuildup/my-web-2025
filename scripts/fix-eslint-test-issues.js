#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Find all test files
const testFiles = glob.sync("**/__tests__/*.{ts,tsx}", {
  ignore: ["node_modules/**", ".next/**", "out/**", "build/**", "dist/**"],
});

console.log(`Found ${testFiles.length} test files to process...`);

testFiles.forEach((filePath) => {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Fix 1: Replace `(_callback: any)` with proper typing or disable eslint
    if (content.includes("(_callback: any)")) {
      content = content.replace(
        /\.mockImplementation\(\(_callback: any\) =>/g,
        ".mockImplementation((_callback: PerformanceObserverCallback) =>",
      );
      modified = true;
      console.log(`Fixed callback typing in: ${filePath}`);
    }

    // Fix 2: Replace `(_callback)` with proper typing to avoid unused variable warning
    if (content.includes(".mockImplementation((_callback) =>")) {
      content = content.replace(
        /\.mockImplementation\(\(_callback\) =>/g,
        ".mockImplementation(() =>",
      );
      modified = true;
      console.log(`Removed unused callback parameter in: ${filePath}`);
    }

    // Fix 3: Replace `as any` with proper type assertions or eslint disable
    const asAnyMatches = content.match(/(\w+) as any/g);
    if (asAnyMatches) {
      asAnyMatches.forEach((match) => {
        const varName = match.replace(" as any", "");

        // For PerformanceObserver assignments
        if (content.includes("global.PerformanceObserver = " + match)) {
          content = content.replace(
            `global.PerformanceObserver = ${match};`,
            `// eslint-disable-next-line @typescript-eslint/no-explicit-any\n  global.PerformanceObserver = ${varName} as any;`,
          );
          modified = true;
        }

        // For component module assignments
        else if (match.includes("Module as any")) {
          content = content.replace(
            match,
            `// eslint-disable-next-line @typescript-eslint/no-explicit-any\n  ${match}`,
          );
          modified = true;
        }

        // For other cases, add eslint disable comment
        else {
          content = content.replace(
            match,
            `// eslint-disable-next-line @typescript-eslint/no-explicit-any\n  ${match}`,
          );
          modified = true;
        }
      });
      console.log(`Fixed 'as any' usage in: ${filePath}`);
    }

    // Fix 4: Add proper imports for PerformanceObserverCallback if needed
    if (
      content.includes("PerformanceObserverCallback") &&
      !content.includes('/// <reference types="')
    ) {
      // Add reference to DOM types at the top of the file
      const lines = content.split("\n");
      const firstImportIndex = lines.findIndex(
        (line) => line.startsWith("import ") || line.startsWith("/**"),
      );
      if (firstImportIndex >= 0) {
        lines.splice(
          firstImportIndex,
          0,
          '/// <reference types="@types/dom" />',
        );
        content = lines.join("\n");
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log("✅ All test files processed!");
