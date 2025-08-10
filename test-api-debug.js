// Simple test to debug API route handlers
const { NextRequest } = require("next/server");

async function testDatesAPI() {
  try {
    // Import the GET function from dates route
    const { GET } = require("./src/app/api/admin/dates/route.ts");

    console.log("GET function:", typeof GET);

    const request = new NextRequest("http://localhost/api/admin/dates");
    console.log("Request created:", !!request);

    const response = await GET(request);
    console.log("Response:", response);
    console.log("Response type:", typeof response);

    if (response) {
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testDatesAPI();
