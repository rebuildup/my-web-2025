#!/usr/bin/env node

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Test configuration
const BASE_URL = "http://localhost:3000";
const TEST_PAGES = [
  "/",
  "/about",
  "/portfolio",
  "/portfolio/gallery/all",
  "/portfolio/gallery/develop",
  "/portfolio/gallery/video",
  "/portfolio/gallery/design",
  "/tools",
  "/workshop",
  "/contact",
];

// Test results
const results = {
  pages: [],
  assets: [],
  errors: [],
};

// Helper function to make HTTP requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https:") ? https : http;

    protocol
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Test page loading
async function testPage(pagePath) {
  try {
    console.log(`Testing page: ${pagePath}`);
    const response = await makeRequest(`${BASE_URL}${pagePath}`);

    const result = {
      path: pagePath,
      statusCode: response.statusCode,
      success: response.statusCode === 200,
      contentType: response.headers["content-type"],
      contentLength: response.headers["content-length"],
      issues: [],
    };

    // Check for common issues in HTML
    if (response.body) {
      // Check for missing CSS
      if (!response.body.includes("/_next/static/css/")) {
        result.issues.push("No CSS files detected");
      }

      // Check for JavaScript errors in HTML
      if (
        response.body.includes("ChunkLoadError") ||
        response.body.includes("Loading chunk")
      ) {
        result.issues.push("Potential chunk loading error");
      }

      // Check for missing images
      const imgMatches = response.body.match(/<img[^>]+src="([^"]+)"/g);
      if (imgMatches) {
        for (const match of imgMatches) {
          const srcMatch = match.match(/src="([^"]+)"/);
          if (srcMatch && srcMatch[1].startsWith("/")) {
            // Test if image exists
            try {
              const imgResponse = await makeRequest(
                `${BASE_URL}${srcMatch[1]}`,
              );
              if (imgResponse.statusCode !== 200) {
                result.issues.push(`Missing image: ${srcMatch[1]}`);
              }
            } catch (err) {
              result.issues.push(
                `Image load error: ${srcMatch[1]} - ${err.message}`,
              );
            }
          }
        }
      }
    }

    results.pages.push(result);

    if (result.success) {
      console.log(`✅ ${pagePath} - OK`);
    } else {
      console.log(`❌ ${pagePath} - Status: ${result.statusCode}`);
    }

    if (result.issues.length > 0) {
      console.log(`⚠️  Issues found: ${result.issues.join(", ")}`);
    }
  } catch (error) {
    console.log(`❌ ${pagePath} - Error: ${error.message}`);
    results.errors.push({
      path: pagePath,
      error: error.message,
    });
  }
}

// Test static assets
async function testAssets() {
  console.log("\n🔍 Testing static assets...");

  const assetPaths = [
    "/_next/static/css/cc3ed86401a250b4.css", // CSS file from build output
    "/favicon.ico",
    "/manifest.json",
    "/images/og-image.png",
  ];

  for (const assetPath of assetPaths) {
    try {
      const response = await makeRequest(`${BASE_URL}${assetPath}`);
      const result = {
        path: assetPath,
        statusCode: response.statusCode,
        success: response.statusCode === 200,
        contentType: response.headers["content-type"],
        contentLength: response.headers["content-length"],
      };

      results.assets.push(result);

      if (result.success) {
        console.log(`✅ ${assetPath} - OK (${result.contentType})`);
      } else {
        console.log(`❌ ${assetPath} - Status: ${result.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ ${assetPath} - Error: ${error.message}`);
      results.errors.push({
        path: assetPath,
        error: error.message,
      });
    }
  }
}

// Main test function
async function runTests() {
  console.log("🚀 Starting production environment tests...\n");

  // Test pages
  console.log("📄 Testing pages...");
  for (const pagePath of TEST_PAGES) {
    await testPage(pagePath);
    // Small delay to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Test assets
  await testAssets();

  // Generate report
  console.log("\n📊 Test Results Summary:");
  console.log(`Pages tested: ${results.pages.length}`);
  console.log(
    `Pages successful: ${results.pages.filter((p) => p.success).length}`,
  );
  console.log(`Assets tested: ${results.assets.length}`);
  console.log(
    `Assets successful: ${results.assets.filter((a) => a.success).length}`,
  );
  console.log(`Total errors: ${results.errors.length}`);

  // Show issues
  const pagesWithIssues = results.pages.filter((p) => p.issues.length > 0);
  if (pagesWithIssues.length > 0) {
    console.log("\n⚠️  Pages with issues:");
    pagesWithIssues.forEach((page) => {
      console.log(`  ${page.path}: ${page.issues.join(", ")}`);
    });
  }

  // Show errors
  if (results.errors.length > 0) {
    console.log("\n❌ Errors:");
    results.errors.forEach((error) => {
      console.log(`  ${error.path}: ${error.error}`);
    });
  }

  // Save detailed report
  const reportPath = path.join(process.cwd(), "production-test-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📝 Detailed report saved to: ${reportPath}`);

  // Exit with appropriate code
  const hasErrors =
    results.errors.length > 0 ||
    results.pages.some((p) => !p.success) ||
    results.assets.some((a) => !a.success);
  process.exit(hasErrors ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error("Test runner error:", error);
  process.exit(1);
});
