/**
 * 包括的ユーザージャーニー統合テスト
 * Comprehensive User Journey Integration Tests
 *
 * This test suite orchestrates all three main user journeys:
 * 1. Portfolio creation to publication flow
 * 2. Search functionality integration
 * 3. Admin functionality integration
 */

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "@jest/globals";
import { NextRequest } from "next/server";

// Mock Next.js modules
jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      ok: options?.status ? options.status < 400 : true,
    })),
    redirect: jest.fn(),
  },
}));

// Mock file system operations
jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  readdir: jest.fn(),
  stat: jest.fn(),
  unlink: jest.fn(),
  access: jest.fn(),
}));

describe("Comprehensive User Journey Integration Tests", () => {
  let testEnvironment: {
    portfolioItems: Array<{ id: string; title: string }>;
    adminSession: { token: string; user: { id: string; role: string } };
    searchIndex: { id: string; status: string };
    analytics: Array<{ event: string; timestamp: Date }>;
  };

  beforeAll(async () => {
    // Initialize comprehensive test environment
    testEnvironment = {
      portfolioItems: [],
      adminSession: {
        userId: "comprehensive-admin",
        role: "admin",
        sessionId: `comprehensive-session-${Date.now()}`,
      },
      searchIndex: {
        id: `comprehensive-index-${Date.now()}`,
        items: [],
      },
      analytics: [],
    };

    // Setup test data
    const baseItems = [
      {
        id: `comprehensive-portfolio-1-${Date.now()}`,
        title: "Full Stack Web Application",
        description:
          "Modern web application with React, Node.js, and PostgreSQL",
        categories: ["develop"],
        tags: ["React", "Node.js", "PostgreSQL", "Full Stack"],
        status: "draft",
        content:
          "# Full Stack Application\n\nBuilding modern web applications with cutting-edge technologies.",
      },
      {
        id: `comprehensive-portfolio-2-${Date.now()}`,
        title: "Mobile App UI/UX Design",
        description: "Comprehensive mobile application design system",
        categories: ["design"],
        tags: ["Mobile", "UI/UX", "Design System", "Figma"],
        status: "draft",
        content:
          "# Mobile Design\n\nCreating intuitive and accessible mobile experiences.",
      },
      {
        id: `comprehensive-portfolio-3-${Date.now()}`,
        title: "3D WebGL Interactive Experience",
        description: "Immersive 3D web experience using WebGL and Three.js",
        categories: ["develop", "design"],
        tags: ["WebGL", "Three.js", "3D", "Interactive"],
        status: "draft",
        content:
          "# 3D Web Experience\n\nPushing the boundaries of web-based 3D graphics.",
      },
    ];

    testEnvironment.portfolioItems = baseItems;
  });

  afterAll(() => {
    // Comprehensive cleanup
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Journey 1: Complete Portfolio Lifecycle", () => {
    it("should execute the complete portfolio creation to publication flow", async () => {
      // This test orchestrates the entire portfolio lifecycle
      const portfolioItem = testEnvironment.portfolioItems[0];

      // Step 1: Create portfolio item
      const { POST: createContent } = await import(
        "@/app/api/admin/content/route"
      );
      const createRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          method: "POST",
          body: JSON.stringify(portfolioItem),
          headers: { "Content-Type": "application/json" },
        },
      );

      const createResponse = await createContent(createRequest);
      const createResult = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createResult.success).toBe(true);
      expect(createResult.data.id).toBe(portfolioItem.id);

      // Step 2: Add tags and metadata
      const { POST: createTags } = await import("@/app/api/admin/tags/route");
      for (const tag of portfolioItem.tags) {
        const tagRequest = new NextRequest(
          "http://localhost:3000/api/admin/tags",
          {
            method: "POST",
            body: JSON.stringify({
              name: tag,
              description: `Tag for ${tag}`,
            }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const tagResponse = await createTags(tagRequest);
        expect(tagResponse.status).toBe(201);
      }

      // Step 3: Process content and files
      const { POST: processContent } = await import(
        "@/app/api/admin/content-processing/route"
      );
      const processRequest = new NextRequest(
        "http://localhost:3000/api/admin/content-processing",
        {
          method: "POST",
          body: JSON.stringify({
            itemId: portfolioItem.id,
            processImages: true,
            generateThumbnails: true,
            optimizeFiles: true,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const processResponse = await processContent(processRequest);
      const processResult = await processResponse.json();

      expect(processResponse.status).toBe(200);
      expect(processResult.success).toBe(true);

      // Step 4: Publish content
      const { PUT: updateContent } = await import(
        "@/app/api/admin/content/route"
      );
      const publishRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          method: "PUT",
          body: JSON.stringify({
            id: portfolioItem.id,
            status: "published",
            publishDate: new Date().toISOString(),
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const publishResponse = await updateContent(publishRequest);
      const publishResult = await publishResponse.json();

      expect(publishResponse.status).toBe(200);
      expect(publishResult.success).toBe(true);
      expect(publishResult.data.status).toBe("published");

      // Step 5: Verify public availability
      const { GET: getPublicContent } = await import(
        "@/app/api/content/all/route"
      );
      const publicRequest = new NextRequest(
        "http://localhost:3000/api/content/all",
      );
      const publicResponse = await getPublicContent(publicRequest);
      const publicResult = await publicResponse.json();

      expect(publicResponse.status).toBe(200);
      const publishedItem = publicResult.find(
        (item: { id: string }) => item.id === portfolioItem.id,
      );
      expect(publishedItem).toBeDefined();
      expect(publishedItem.status).toBe("published");

      console.log(
        `✅ Portfolio lifecycle completed for: ${portfolioItem.title}`,
      );
    });

    it("should handle multiple portfolio items concurrently", async () => {
      // Test concurrent processing of multiple portfolio items
      const concurrentItems = testEnvironment.portfolioItems.slice(1); // Skip first item used above

      const { POST: createContent } = await import(
        "@/app/api/admin/content/route"
      );

      // Create all items concurrently
      const createPromises = concurrentItems.map(async (item) => {
        const request = new NextRequest(
          "http://localhost:3000/api/admin/content",
          {
            method: "POST",
            body: JSON.stringify(item),
            headers: { "Content-Type": "application/json" },
          },
        );
        return createContent(request);
      });

      const createResponses = await Promise.all(createPromises);

      // Verify all items were created successfully
      for (const response of createResponses) {
        expect(response.status).toBe(201);
        const result = await response.json();
        expect(result.success).toBe(true);
      }

      console.log(
        `✅ Concurrent portfolio creation completed for ${concurrentItems.length} items`,
      );
    });
  });

  describe("Journey 2: Search Functionality Integration", () => {
    it("should execute the complete search functionality flow", async () => {
      // This test orchestrates the entire search functionality

      // Step 1: Index all portfolio items
      const { POST: createIndex } = await import(
        "@/app/api/search/index/route"
      );

      for (const item of testEnvironment.portfolioItems) {
        const indexData = {
          action: "create",
          itemId: item.id,
          title: item.title,
          description: item.description,
          content: item.content,
          tags: item.tags,
          categories: item.categories,
          searchableText: `${item.title} ${item.description} ${item.content} ${item.tags.join(" ")}`,
        };

        const indexRequest = new NextRequest(
          "http://localhost:3000/api/search/index",
          {
            method: "POST",
            body: JSON.stringify(indexData),
            headers: { "Content-Type": "application/json" },
          },
        );

        const indexResponse = await createIndex(indexRequest);
        const indexResult = await indexResponse.json();

        expect(indexResponse.status).toBe(201);
        expect(indexResult.success).toBe(true);
      }

      // Step 2: Perform various search queries
      const { GET: search } = await import("@/app/api/search/route");

      const searchQueries = [
        "React Full Stack",
        "Mobile Design",
        "WebGL 3D",
        "modern web",
      ];

      for (const query of searchQueries) {
        const searchRequest = new NextRequest(
          `http://localhost:3000/api/search?q=${encodeURIComponent(query)}&limit=10`,
        );
        const searchResponse = await search(searchRequest);
        const searchResult = await searchResponse.json();

        expect(searchResponse.status).toBe(200);
        expect(searchResult.success).toBe(true);
        expect(Array.isArray(searchResult.data.results)).toBe(true);

        // Track search analytics
        testEnvironment.analytics.push({
          type: "search",
          query,
          resultsCount: searchResult.data.results.length,
          timestamp: new Date().toISOString(),
        });
      }

      // Step 3: Test advanced search features
      const advancedSearchRequest = new NextRequest(
        "http://localhost:3000/api/search?q=React&categories=develop&tags=Full Stack&sort=relevance",
      );
      const advancedResponse = await search(advancedSearchRequest);
      const advancedResult = await advancedResponse.json();

      expect(advancedResponse.status).toBe(200);
      expect(advancedResult.success).toBe(true);

      // Step 4: Test search suggestions
      const { GET: getSuggestions } = await import(
        "@/app/api/search/suggestions/route"
      );
      const suggestionsRequest = new NextRequest(
        "http://localhost:3000/api/search/suggestions?q=Rea&limit=5",
      );
      const suggestionsResponse = await getSuggestions(suggestionsRequest);
      const suggestionsResult = await suggestionsResponse.json();

      expect(suggestionsResponse.status).toBe(200);
      expect(suggestionsResult.success).toBe(true);
      expect(Array.isArray(suggestionsResult.data.suggestions)).toBe(true);

      console.log(
        `✅ Search functionality flow completed with ${searchQueries.length} queries`,
      );
    });

    it("should validate search performance and accuracy", async () => {
      // Test search performance metrics
      const { GET: getSearchAnalytics } = await import(
        "@/app/api/search/analytics/route"
      );

      const performanceRequest = new NextRequest(
        "http://localhost:3000/api/search/analytics?type=performance&period=1h",
      );
      const performanceResponse = await getSearchAnalytics(performanceRequest);
      const performanceResult = await performanceResponse.json();

      expect(performanceResponse.status).toBe(200);
      expect(performanceResult.success).toBe(true);
      expect(performanceResult.data).toHaveProperty("averageResponseTime");
      expect(performanceResult.data).toHaveProperty("totalSearches");

      console.log(`✅ Search performance validation completed`);
    });
  });

  describe("Journey 3: Admin Functionality Integration", () => {
    it("should execute the complete admin functionality flow", async () => {
      // This test orchestrates the entire admin functionality

      // Step 1: Admin authentication
      const { POST: adminAuth } = await import("@/app/api/admin/auth/route");
      const authRequest = new NextRequest(
        "http://localhost:3000/api/admin/auth",
        {
          method: "POST",
          body: JSON.stringify({
            username: "admin",
            password: "test-password",
            action: "login",
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const authResponse = await adminAuth(authRequest);
      const authResult = await authResponse.json();

      expect(authResponse.status).toBe(200);
      expect(authResult.success).toBe(true);

      // Step 2: System health monitoring
      const { GET: getStatus } = await import("@/app/api/admin/status/route");
      const statusRequest = new NextRequest(
        "http://localhost:3000/api/admin/status?type=health",
        {
          headers: {
            Authorization: `Bearer ${testEnvironment.adminSession.sessionId}`,
          },
        },
      );

      const statusResponse = await getStatus(statusRequest);
      const statusResult = await statusResponse.json();

      expect(statusResponse.status).toBe(200);
      expect(statusResult.success).toBe(true);
      expect(statusResult.data.status).toBe("healthy");

      // Step 3: Content management operations
      const { GET: getAdminContent } = await import(
        "@/app/api/admin/content/route"
      );
      const contentRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          headers: {
            Authorization: `Bearer ${testEnvironment.adminSession.sessionId}`,
          },
        },
      );

      const contentResponse = await getAdminContent(contentRequest);
      const contentResult = await contentResponse.json();

      expect(contentResponse.status).toBe(200);
      expect(contentResult.success).toBe(true);
      expect(Array.isArray(contentResult.data)).toBe(true);

      // Step 4: Analytics generation
      const { GET: getAnalytics } = await import(
        "@/app/api/admin/analytics/route"
      );
      const analyticsRequest = new NextRequest(
        "http://localhost:3000/api/admin/analytics?type=summary&period=24h",
        {
          headers: {
            Authorization: `Bearer ${testEnvironment.adminSession.sessionId}`,
          },
        },
      );

      const analyticsResponse = await getAnalytics(analyticsRequest);
      const analyticsResult = await analyticsResponse.json();

      expect(analyticsResponse.status).toBe(200);
      expect(analyticsResult.success).toBe(true);
      expect(analyticsResult.data).toHaveProperty("totalContent");
      expect(analyticsResult.data).toHaveProperty("totalViews");

      // Step 5: Data export
      const { GET: exportData } = await import("@/app/api/admin/export/route");
      const exportRequest = new NextRequest(
        "http://localhost:3000/api/admin/export?type=content&format=json",
        {
          headers: {
            Authorization: `Bearer ${testEnvironment.adminSession.sessionId}`,
          },
        },
      );

      const exportResponse = await exportData(exportRequest);
      const exportResult = await exportResponse.json();

      expect(exportResponse.status).toBe(200);
      expect(exportResult.success).toBe(true);
      expect(exportResult.data).toHaveProperty("exportId");

      console.log(`✅ Admin functionality flow completed`);
    });

    it("should validate admin data integrity and security", async () => {
      // Test admin security and data integrity
      const { GET: getAuditLogs } = await import("@/app/api/admin/audit/route");

      const auditRequest = new NextRequest(
        "http://localhost:3000/api/admin/audit?limit=10",
        {
          headers: {
            Authorization: `Bearer ${testEnvironment.adminSession.sessionId}`,
          },
        },
      );

      const auditResponse = await getAuditLogs(auditRequest);
      const auditResult = await auditResponse.json();

      expect(auditResponse.status).toBe(200);
      expect(auditResult.success).toBe(true);
      expect(Array.isArray(auditResult.data)).toBe(true);

      console.log(`✅ Admin security validation completed`);
    });
  });

  describe("Cross-Journey Integration", () => {
    it("should validate data consistency across all journeys", async () => {
      // This test ensures all three journeys work together seamlessly

      // Verify portfolio items are searchable
      const { GET: search } = await import("@/app/api/search/route");
      const portfolioTitle = testEnvironment.portfolioItems[0].title;

      const searchRequest = new NextRequest(
        `http://localhost:3000/api/search?q=${encodeURIComponent(portfolioTitle)}`,
      );
      const searchResponse = await search(searchRequest);
      const searchResult = await searchResponse.json();

      expect(searchResponse.status).toBe(200);
      expect(searchResult.success).toBe(true);
      expect(searchResult.data.results.length).toBeGreaterThan(0);

      // Verify admin can see all content
      const { GET: getAdminContent } = await import(
        "@/app/api/admin/content/route"
      );
      const adminRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          headers: {
            Authorization: `Bearer ${testEnvironment.adminSession.sessionId}`,
          },
        },
      );

      const adminResponse = await getAdminContent(adminRequest);
      const adminResult = await adminResponse.json();

      expect(adminResponse.status).toBe(200);
      expect(adminResult.success).toBe(true);

      // Verify all test portfolio items are present
      const adminItemIds = adminResult.data.map(
        (item: { id: string }) => item.id,
      );
      for (const portfolioItem of testEnvironment.portfolioItems) {
        expect(adminItemIds).toContain(portfolioItem.id);
      }

      // Verify public content matches admin content for published items
      const { GET: getPublicContent } = await import(
        "@/app/api/content/all/route"
      );
      const publicRequest = new NextRequest(
        "http://localhost:3000/api/content/all",
      );
      const publicResponse = await getPublicContent(publicRequest);
      const publicResult = await publicResponse.json();

      expect(publicResponse.status).toBe(200);
      expect(Array.isArray(publicResult)).toBe(true);

      console.log(`✅ Cross-journey data consistency validated`);
    });

    it("should validate end-to-end user experience", async () => {
      // Simulate complete user journey from creation to consumption

      // 1. Admin creates content
      const newItem = {
        id: `e2e-test-${Date.now()}`,
        title: "End-to-End Test Portfolio",
        description: "Testing complete user experience flow",
        categories: ["develop"],
        tags: ["E2E", "Test", "Integration"],
        status: "draft",
        content: "# E2E Test\n\nComplete end-to-end testing of user journey.",
      };

      const { POST: createContent } = await import(
        "@/app/api/admin/content/route"
      );
      const createRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          method: "POST",
          body: JSON.stringify(newItem),
          headers: { "Content-Type": "application/json" },
        },
      );

      const createResponse = await createContent(createRequest);
      expect(createResponse.status).toBe(201);

      // 2. Content gets indexed for search
      const { POST: indexContent } = await import(
        "@/app/api/search/index/route"
      );
      const indexRequest = new NextRequest(
        "http://localhost:3000/api/search/index",
        {
          method: "POST",
          body: JSON.stringify({
            action: "create",
            itemId: newItem.id,
            title: newItem.title,
            description: newItem.description,
            content: newItem.content,
            tags: newItem.tags,
            categories: newItem.categories,
            searchableText: `${newItem.title} ${newItem.description} ${newItem.content} ${newItem.tags.join(" ")}`,
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const indexResponse = await indexContent(indexRequest);
      expect(indexResponse.status).toBe(201);

      // 3. Content gets published
      const { PUT: updateContent } = await import(
        "@/app/api/admin/content/route"
      );
      const publishRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          method: "PUT",
          body: JSON.stringify({
            id: newItem.id,
            status: "published",
            publishDate: new Date().toISOString(),
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const publishResponse = await updateContent(publishRequest);
      expect(publishResponse.status).toBe(200);

      // 4. User can find content via search
      const { GET: search } = await import("@/app/api/search/route");
      const searchRequest = new NextRequest(
        `http://localhost:3000/api/search?q=${encodeURIComponent("End-to-End Test")}`,
      );
      const searchResponse = await search(searchRequest);
      const searchResult = await searchResponse.json();

      expect(searchResponse.status).toBe(200);
      expect(searchResult.success).toBe(true);

      const foundItem = searchResult.data.results.find(
        (item: { id: string }) => item.id === newItem.id,
      );
      expect(foundItem).toBeDefined();

      // 5. User can access content directly
      const { GET: getContent } = await import("@/app/api/content/[id]/route");
      const contentRequest = new NextRequest(
        `http://localhost:3000/api/content/${newItem.id}`,
      );
      const contentResponse = await getContent(contentRequest, {
        params: { id: newItem.id },
      });

      expect(contentResponse.status).toBe(200);
      const contentResult = await contentResponse.json();
      expect(contentResult.id).toBe(newItem.id);
      expect(contentResult.status).toBe("published");

      console.log(
        `✅ End-to-end user experience validated for: ${newItem.title}`,
      );
    });

    it("should measure overall system performance", async () => {
      // Test system performance under integrated load
      const startTime = Date.now();

      // Simulate concurrent operations across all journeys
      const operations = [
        // Portfolio operations
        import("@/app/api/content/all/route").then(({ GET }) =>
          GET(new NextRequest("http://localhost:3000/api/content/all")),
        ),
        // Search operations
        import("@/app/api/search/route").then(({ GET }) =>
          GET(new NextRequest("http://localhost:3000/api/search?q=test")),
        ),
        // Admin operations
        import("@/app/api/admin/status/route").then(({ GET }) =>
          GET(
            new NextRequest("http://localhost:3000/api/admin/status", {
              headers: {
                Authorization: `Bearer ${testEnvironment.adminSession.sessionId}`,
              },
            }),
          ),
        ),
      ];

      const responses = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify all operations completed successfully
      for (const response of responses) {
        expect(response.status).toBeLessThan(400);
      }

      // Performance should be reasonable (under 5 seconds for all operations)
      expect(totalTime).toBeLessThan(5000);

      console.log(
        `✅ System performance validated: ${totalTime}ms for concurrent operations`,
      );
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle errors gracefully across all journeys", async () => {
      // Test error scenarios in each journey

      // Portfolio journey error
      const { POST: createContent } = await import(
        "@/app/api/admin/content/route"
      );
      const invalidContentRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          method: "POST",
          body: JSON.stringify({
            /* missing required fields */
          }),
          headers: { "Content-Type": "application/json" },
        },
      );

      const contentErrorResponse = await createContent(invalidContentRequest);
      expect(contentErrorResponse.status).toBe(400);

      // Search journey error
      const { GET: search } = await import("@/app/api/search/route");
      const invalidSearchRequest = new NextRequest(
        "http://localhost:3000/api/search?q=", // empty query
      );

      const searchErrorResponse = await search(invalidSearchRequest);
      expect(searchErrorResponse.status).toBe(400);

      // Admin journey error
      const { GET: getAdminContent } = await import(
        "@/app/api/admin/content/route"
      );
      const unauthorizedRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        // No authorization header
      );

      const adminErrorResponse = await getAdminContent(unauthorizedRequest);
      expect(adminErrorResponse.status).toBe(401);

      console.log(`✅ Error handling validated across all journeys`);
    });

    it("should maintain system stability after errors", async () => {
      // Verify system remains functional after error scenarios

      // Test normal operations still work
      const { GET: getPublicContent } = await import(
        "@/app/api/content/all/route"
      );
      const publicRequest = new NextRequest(
        "http://localhost:3000/api/content/all",
      );
      const publicResponse = await getPublicContent(publicRequest);

      expect(publicResponse.status).toBe(200);

      const { GET: search } = await import("@/app/api/search/route");
      const searchRequest = new NextRequest(
        "http://localhost:3000/api/search?q=test",
      );
      const searchResponse = await search(searchRequest);

      expect(searchResponse.status).toBe(200);

      console.log(`✅ System stability maintained after error scenarios`);
    });
  });
});
