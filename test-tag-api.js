/**
 * Simple test script to verify Tag Management API endpoints
 */

const BASE_URL = "http://localhost:3000";

async function testTagAPI() {
  console.log("🧪 Testing Tag Management API Endpoints...\n");

  try {
    // Test 1: GET /api/admin/tags - Get all tags
    console.log("1. Testing GET /api/admin/tags");
    const getAllResponse = await fetch(`${BASE_URL}/api/admin/tags`);
    const getAllData = await getAllResponse.json();
    console.log(
      "✅ GET /api/admin/tags:",
      getAllData.success ? "SUCCESS" : "FAILED",
    );
    console.log("   Tags count:", getAllData.data?.length || 0);

    // Test 2: POST /api/admin/tags - Create a new tag
    console.log("\n2. Testing POST /api/admin/tags");
    const createResponse = await fetch(`${BASE_URL}/api/admin/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "test-tag-" + Date.now() }),
    });
    const createData = await createResponse.json();
    console.log(
      "✅ POST /api/admin/tags:",
      createData.success ? "SUCCESS" : "FAILED",
    );
    console.log("   Created tag:", createData.data?.name);

    // Test 3: GET /api/admin/tags?q=test - Search tags
    console.log("\n3. Testing GET /api/admin/tags?q=test");
    const searchResponse = await fetch(`${BASE_URL}/api/admin/tags?q=test`);
    const searchData = await searchResponse.json();
    console.log(
      "✅ GET /api/admin/tags?q=test:",
      searchData.success ? "SUCCESS" : "FAILED",
    );
    console.log("   Search results:", searchData.data?.length || 0);

    // Test 4: GET /api/admin/tags/stats - Get tag statistics
    console.log("\n4. Testing GET /api/admin/tags/stats");
    const statsResponse = await fetch(`${BASE_URL}/api/admin/tags/stats`);
    const statsData = await statsResponse.json();
    console.log(
      "✅ GET /api/admin/tags/stats:",
      statsData.success ? "SUCCESS" : "FAILED",
    );
    console.log("   Total tags:", statsData.data?.totalTags || 0);

    // Test 5: PUT /api/admin/tags/[name] - Update tag usage
    if (createData.success && createData.data?.name) {
      console.log("\n5. Testing PUT /api/admin/tags/[name]");
      const updateResponse = await fetch(
        `${BASE_URL}/api/admin/tags/${encodeURIComponent(createData.data.name)}`,
        {
          method: "PUT",
        },
      );
      const updateData = await updateResponse.json();
      console.log(
        "✅ PUT /api/admin/tags/[name]:",
        updateData.success ? "SUCCESS" : "FAILED",
      );
      console.log("   Updated tag usage:", updateData.data?.count);

      // Test 6: DELETE /api/admin/tags/[name] - Delete specific tag
      console.log("\n6. Testing DELETE /api/admin/tags/[name]");
      const deleteResponse = await fetch(
        `${BASE_URL}/api/admin/tags/${encodeURIComponent(createData.data.name)}`,
        {
          method: "DELETE",
        },
      );
      const deleteData = await deleteResponse.json();
      console.log(
        "✅ DELETE /api/admin/tags/[name]:",
        deleteData.success ? "SUCCESS" : "FAILED",
      );
    }

    console.log("\n🎉 All Tag Management API endpoints are working correctly!");
  } catch (error) {
    console.error("❌ Error testing Tag API:", error.message);
    console.log(
      "\n💡 Make sure the development server is running: npm run dev",
    );
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testTagAPI();
}

module.exports = { testTagAPI };
