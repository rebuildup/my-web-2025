/**
 * Direct thumbnail fix script
 * Fixes missing thumbnails without requiring the web server
 */

const fs = require("fs").promises;
const path = require("path");

async function fixThumbnailsDirect() {
  console.log("=== Direct Thumbnail Fix ===");

  const portfolioPath = path.join(
    process.cwd(),
    "public/data/content/portfolio.json",
  );

  try {
    // Read current portfolio data
    const fileContent = await fs.readFile(portfolioPath, "utf-8");
    const portfolioData = JSON.parse(fileContent);

    console.log(`Found ${portfolioData.length} portfolio items`);

    let fixedCount = 0;
    const fixedItems = [];

    // Fix items without thumbnails
    const updatedData = portfolioData.map((item) => {
      // Check if item needs thumbnail fix
      if (
        !item.thumbnail &&
        item.images &&
        Array.isArray(item.images) &&
        item.images.length > 0
      ) {
        console.log(`Fixing thumbnail for item: ${item.id} - ${item.title}`);
        console.log(`  Setting thumbnail to: ${item.images[0]}`);
        fixedCount++;
        fixedItems.push(item.id);

        return {
          ...item,
          thumbnail: item.images[0], // Set first image as thumbnail
          updatedAt: new Date().toISOString(),
        };
      }

      return item;
    });

    // Write updated data back to file
    if (fixedCount > 0) {
      await fs.writeFile(
        portfolioPath,
        JSON.stringify(updatedData, null, 2),
        "utf-8",
      );
      console.log(`✓ Fixed ${fixedCount} items`);
      console.log("Fixed items:", fixedItems);
    } else {
      console.log("No items needed fixing");
    }

    // Verify the fix
    const verifyContent = await fs.readFile(portfolioPath, "utf-8");
    const verifyData = JSON.parse(verifyContent);

    const itemsStillWithoutThumbnails = verifyData.filter(
      (item) => !item.thumbnail,
    );
    console.log(
      `Items still without thumbnails: ${itemsStillWithoutThumbnails.length}`,
    );

    if (itemsStillWithoutThumbnails.length > 0) {
      console.log("Items still missing thumbnails:");
      itemsStillWithoutThumbnails.forEach((item) => {
        console.log(`- ${item.id}: ${item.title}`);
        console.log(`  Images: ${item.images ? item.images.length : 0}`);
      });
    }

    console.log("✓ Thumbnail fix complete");
  } catch (error) {
    console.error("Error fixing thumbnails:", error);
  }
}

fixThumbnailsDirect().catch(console.error);
