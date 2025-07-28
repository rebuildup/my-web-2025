const fs = require("fs");
const path = require("path");

// Read portfolio data from file
async function readPortfolioData() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "content",
      "portfolio.json",
    );
    const fileContent = await fs.promises.readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);
    console.log(`Loaded ${data.length} portfolio items from file`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error reading portfolio data:", error);
    return [];
  }
}

// Test API logic
async function testAPI() {
  const portfolioData = await readPortfolioData();

  console.log("\n=== All Data ===");
  portfolioData.forEach((item) => {
    console.log(`ID: ${item.id}, Title: ${item.title}, Status: ${item.status}`);
  });

  console.log("\n=== Published Only (default) ===");
  const publishedData = portfolioData.filter(
    (item) => item.status === "published",
  );
  publishedData.forEach((item) => {
    console.log(`ID: ${item.id}, Title: ${item.title}, Status: ${item.status}`);
  });

  console.log("\n=== All Data (status=all) ===");
  // This should show all data including draft and archived
  portfolioData.forEach((item) => {
    console.log(`ID: ${item.id}, Title: ${item.title}, Status: ${item.status}`);
  });

  console.log("\n=== Draft Only (status=draft) ===");
  const draftData = portfolioData.filter((item) => item.status === "draft");
  draftData.forEach((item) => {
    console.log(`ID: ${item.id}, Title: ${item.title}, Status: ${item.status}`);
  });

  console.log("\n=== Archived Only (status=archived) ===");
  const archivedData = portfolioData.filter(
    (item) => item.status === "archived",
  );
  archivedData.forEach((item) => {
    console.log(`ID: ${item.id}, Title: ${item.title}, Status: ${item.status}`);
  });
}

testAPI().catch(console.error);
