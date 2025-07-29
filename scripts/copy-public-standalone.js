// Standalone build用にpublicディレクトリをコピーするスクリプト
const fs = require("fs");
const path = require("path");

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName),
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyPublicToStandalone() {
  const publicSrc = path.join(process.cwd(), "public");
  const standaloneDest = path.join(
    process.cwd(),
    ".next",
    "standalone",
    "public",
  );

  console.log("Copying public directory to standalone build...");
  console.log("From:", publicSrc);
  console.log("To:", standaloneDest);

  try {
    if (fs.existsSync(publicSrc)) {
      copyRecursiveSync(publicSrc, standaloneDest);
      console.log("✓ Public directory copied successfully");

      // Verify portfolio.json exists
      const portfolioPath = path.join(
        standaloneDest,
        "data",
        "content",
        "portfolio.json",
      );
      if (fs.existsSync(portfolioPath)) {
        const data = JSON.parse(fs.readFileSync(portfolioPath, "utf-8"));
        console.log(`✓ Portfolio data verified: ${data.length} items`);
      } else {
        console.warn("⚠ Portfolio data not found at:", portfolioPath);
      }
    } else {
      console.error("✗ Public directory not found:", publicSrc);
    }
  } catch (error) {
    console.error("✗ Error copying public directory:", error.message);
    process.exit(1);
  }
}

copyPublicToStandalone();
