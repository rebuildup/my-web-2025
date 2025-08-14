/**
 * Manual test script for thumbnail saving functionality
 * Run with: node scripts/test-thumbnail-save.js
 */

const fs = require("fs").promises;
const path = require("path");

async function testThumbnailSave() {
  console.log("=== Testing Thumbnail Save Functionality ===");

  const portfolioPath = path.join(
    process.cwd(),
    "public/data/content/portfolio.json",
  );

  try {
    // Read current portfolio data
    const fileContent = await fs.readFile(portfolioPath, "utf-8");
    const portfolioData = JSON.parse(fileContent);

    console.log(`Found ${portfolioData.length} portfolio items`);

    // Find items without thumbnails
    const itemsWithoutThumbnails = portfolioData.filter(
      (item) => !item.thumbnail,
    );
    console.log(`Items without thumbnails: ${itemsWithoutThumbnails.length}`);

    itemsWithoutThumbnails.forEach((item) => {
      console.log(`- ${item.id}: ${item.title}`);
      console.log(`  Images: ${item.images ? item.images.length : 0}`);
      if (item.images && item.images.length > 0) {
        console.log(`  First image: ${item.images[0]}`);
      }
    });

    // Test creating a new item with thumbnail
    const testItem = {
      id: `portfolio-test-${Date.now()}`,
      type: "portfolio",
      title: "Test Thumbnail Item",
      description: "Testing thumbnail functionality",
      categories: ["video"],
      tags: ["test"],
      status: "published",
      priority: 50,
      content: "",
      useManualDate: false,
      images: [
        "/images/portfolio/test-image-1.jpg",
        "/images/portfolio/test-image-2.jpg",
      ],
      thumbnail: "/images/portfolio/test-image-2.jpg", // Explicitly set thumbnail
      videos: [],
      externalLinks: [],
      isOtherCategory: false,
      originalImages: [],
      processedImages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add test item
    portfolioData.push(testItem);

    // Save back to file
    await fs.writeFile(portfolioPath, JSON.stringify(portfolioData, null, 2));

    console.log("✓ Test item added with thumbnail:", testItem.thumbnail);

    // Verify the save
    const verifyContent = await fs.readFile(portfolioPath, "utf-8");
    const verifyData = JSON.parse(verifyContent);
    const savedItem = verifyData.find((item) => item.id === testItem.id);

    if (savedItem && savedItem.thumbnail === testItem.thumbnail) {
      console.log("✓ Thumbnail save verification successful");
    } else {
      console.log("✗ Thumbnail save verification failed");
      console.log("Expected:", testItem.thumbnail);
      console.log(
        "Actual:",
        savedItem ? savedItem.thumbnail : "Item not found",
      );
    }

    // Clean up - remove test item
    const cleanedData = verifyData.filter((item) => item.id !== testItem.id);
    await fs.writeFile(portfolioPath, JSON.stringify(cleanedData, null, 2));
    console.log("✓ Test item cleaned up");
  } catch (error) {
    console.error("Error during test:", error);
  }
}

// Test API endpoint simulation
async function testAPIEndpoint() {
  console.log("\n=== Testing API Endpoint Simulation ===");

  const testData = {
    id: `portfolio-api-test-${Date.now()}`,
    type: "portfolio",
    title: "API Test Item",
    description: "Testing API thumbnail handling",
    categories: ["design"],
    tags: ["api-test"],
    status: "published",
    priority: 50,
    content: "",
    images: [
      "/images/portfolio/api-test-1.jpg",
      "/images/portfolio/api-test-2.jpg",
    ],
    thumbnail: "/images/portfolio/api-test-2.jpg",
    videos: [],
    externalLinks: [],
  };

  console.log("Test data to send to API:");
  console.log("- Thumbnail:", testData.thumbnail);
  console.log("- Images:", testData.images);

  try {
    const response = await fetch("http://localhost:3001/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("✓ API call successful");
      console.log("Response:", result);

      // Verify saved data
      const portfolioPath = path.join(
        process.cwd(),
        "public/data/content/portfolio.json",
      );
      const fileContent = await fs.readFile(portfolioPath, "utf-8");
      const portfolioData = JSON.parse(fileContent);
      const savedItem = portfolioData.find((item) => item.id === testData.id);

      if (savedItem && savedItem.thumbnail === testData.thumbnail) {
        console.log("✓ API thumbnail save verification successful");
      } else {
        console.log("✗ API thumbnail save verification failed");
        console.log("Expected:", testData.thumbnail);
        console.log(
          "Actual:",
          savedItem ? savedItem.thumbnail : "Item not found",
        );
      }

      // Clean up
      const cleanedData = portfolioData.filter(
        (item) => item.id !== testData.id,
      );
      await fs.writeFile(portfolioPath, JSON.stringify(cleanedData, null, 2));
      console.log("✓ API test item cleaned up");
    } else {
      console.log("✗ API call failed:", response.status, response.statusText);
      const errorData = await response.json();
      console.log("Error:", errorData);
    }
  } catch (error) {
    console.log("✗ API call error:", error.message);
    console.log(
      "Note: Make sure the development server is running on port 3001",
    );
  }
}

// Run tests
async function runTests() {
  await testThumbnailSave();
  await testAPIEndpoint();
  console.log("\n=== Test Complete ===");
}

runTests().catch(console.error);
