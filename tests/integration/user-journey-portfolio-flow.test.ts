/**
 * ポートフォリオ作成から公開までの完全フローテスト
 * Portfolio Creation to Publication Complete Flow Integration Test
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
}));

// Mock path operations
jest.mock("path", () => ({
  join: jest.fn((...args) => args.join("/")),
  resolve: jest.fn((...args) => args.join("/")),
  dirname: jest.fn((path) => path.split("/").slice(0, -1).join("/")),
  basename: jest.fn((path) => path.split("/").pop()),
  extname: jest.fn((path) => {
    const parts = path.split(".");
    return parts.length > 1 ? `.${parts.pop()}` : "";
  }),
}));

describe("Portfolio Creation to Publication Flow Integration Test", () => {
  let testPortfolioId: string;
  // let mockRequest: jest.MockedFunction<typeof fetch>;

  beforeAll(() => {
    // Setup test environment
    testPortfolioId = `test-portfolio-${Date.now()}`;
    // mockRequest = jest.fn();
  });

  afterAll(() => {
    // Cleanup test data
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Step 1: Portfolio Item Creation", () => {
    it("should create a new portfolio item with complete metadata", async () => {
      // Mock admin content creation API
      const { POST } = await import("@/app/api/admin/content/route");

      const testData = {
        title: "Integration Test Portfolio",
        description: "Complete integration test portfolio item",
        categories: ["develop", "design"],
        tags: ["React", "TypeScript", "Integration"],
        status: "draft",
        useManualDate: true,
        manualDate: "2024-02-15",
        content: "# Integration Test\n\nThis is a test portfolio item.",
      };

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          method: "POST",
          body: JSON.stringify(testData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        title: testData.title,
        description: testData.description,
        categories: testData.categories,
        tags: testData.tags,
      });

      testPortfolioId = result.data.id;
    });

    it("should validate required fields during creation", async () => {
      const { POST } = await import("@/app/api/admin/content/route");

      const invalidData = {
        description: "Missing title",
        categories: [],
      };

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          method: "POST",
          body: JSON.stringify(invalidData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toContain("title");
    });
  });

  describe("Step 2: Tag Management Integration", () => {
    it("should create and manage tags through the complete flow", async () => {
      const { POST: createTag } = await import("@/app/api/admin/tags/route");
      const { GET: getTags } = await import("@/app/api/admin/tags/route");

      // Create new tags
      const newTags = ["integration-test", "automated-test", "e2e-test"];

      for (const tagName of newTags) {
        const mockRequest = new NextRequest(
          "http://localhost:3000/api/admin/tags",
          {
            method: "POST",
            body: JSON.stringify({
              name: tagName,
              description: `Test tag: ${tagName}`,
            }),
            headers: { "Content-Type": "application/json" },
          },
        );

        const response = await createTag(mockRequest);
        const result = await response.json();

        expect(response.status).toBe(201);
        expect(result.success).toBe(true);
        expect(result.data.name).toBe(tagName);
      }

      // Verify tags are retrievable
      const getRequest = new NextRequest(
        "http://localhost:3000/api/admin/tags",
      );
      const getResponse = await getTags(getRequest);
      const allTags = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(allTags.success).toBe(true);

      const tagNames = allTags.data.map((tag: { name: string }) => tag.name);
      newTags.forEach((tagName) => {
        expect(tagNames).toContain(tagName);
      });
    });

    it("should handle tag search and filtering", async () => {
      const { GET } = await import("@/app/api/admin/tags/route");

      const searchRequest = new NextRequest(
        "http://localhost:3000/api/admin/tags?q=integration&limit=5",
      );
      const response = await GET(searchRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      // Should find tags containing 'integration'
      const foundTags = result.data.filter((tag: { name: string }) =>
        tag.name.includes("integration"),
      );
      expect(foundTags.length).toBeGreaterThan(0);
    });
  });

  describe("Step 3: Date Management Integration", () => {
    it("should handle manual date setting and retrieval", async () => {
      const { POST: setDate, GET: getDate } = await import(
        "@/app/api/admin/dates/route"
      );

      const dateData = {
        itemId: testPortfolioId,
        date: "2024-02-15",
        timezone: "Asia/Tokyo",
      };

      // Set manual date
      const setRequest = new NextRequest(
        "http://localhost:3000/api/admin/dates",
        {
          method: "POST",
          body: JSON.stringify(dateData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const setResponse = await setDate(setRequest);
      const setResult = await setResponse.json();

      expect(setResponse.status).toBe(200);
      expect(setResult.success).toBe(true);

      // Retrieve the set date
      const getRequest = new NextRequest(
        `http://localhost:3000/api/admin/dates?itemId=${testPortfolioId}`,
      );
      const getResponse = await getDate(getRequest);
      const getResult = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getResult.success).toBe(true);
      expect(getResult.data.date).toBe(dateData.date);
      expect(getResult.data.itemId).toBe(testPortfolioId);
    });

    it("should handle bulk date operations", async () => {
      const { PUT } = await import("@/app/api/admin/dates/route");

      const bulkData = {
        updates: [
          { itemId: `${testPortfolioId}-1`, date: "2024-01-01" },
          { itemId: `${testPortfolioId}-2`, date: "2024-01-02" },
          { itemId: `${testPortfolioId}-3`, date: "2024-01-03" },
        ],
      };

      const bulkRequest = new NextRequest(
        "http://localhost:3000/api/admin/dates",
        {
          method: "PUT",
          body: JSON.stringify(bulkData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await PUT(bulkRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.updated).toBe(bulkData.updates.length);
    });
  });

  describe("Step 4: Content Processing and File Management", () => {
    it("should process content with file attachments", async () => {
      const { POST } = await import("@/app/api/admin/content-processing/route");

      const processingData = {
        itemId: testPortfolioId,
        processImages: true,
        generateThumbnails: true,
        optimizeFiles: true,
        skipProcessing: false,
      };

      const mockRequest = new NextRequest(
        "http://localhost:3000/api/admin/content-processing",
        {
          method: "POST",
          body: JSON.stringify(processingData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.processed).toBe(true);
      expect(result.data.itemId).toBe(testPortfolioId);
    });

    it("should handle markdown content creation and management", async () => {
      const { POST: createMarkdown, GET: getMarkdown } = await import(
        "@/app/api/admin/markdown/route"
      );

      const markdownData = {
        path: `portfolio/${testPortfolioId}.md`,
        content: `# ${testPortfolioId}\n\nThis is integration test content.\n\n## Features\n- Complete flow testing\n- API integration\n- Data persistence`,
        metadata: {
          title: "Integration Test Portfolio",
          tags: ["integration", "test"],
          category: "develop",
        },
      };

      // Create markdown file
      const createRequest = new NextRequest(
        "http://localhost:3000/api/admin/markdown",
        {
          method: "POST",
          body: JSON.stringify(markdownData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const createResponse = await createMarkdown(createRequest);
      const createResult = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createResult.success).toBe(true);
      expect(createResult.data.path).toBe(markdownData.path);

      // Retrieve markdown file
      const getRequest = new NextRequest(
        "http://localhost:3000/api/admin/markdown",
      );
      const getResponse = await getMarkdown(getRequest);
      const getResult = await getResponse.json();

      expect(getResponse.status).toBe(200);
      expect(getResult.success).toBe(true);
      expect(Array.isArray(getResult.data)).toBe(true);

      const createdFile = getResult.data.find(
        (file: { path: string }) => file.path === markdownData.path,
      );
      expect(createdFile).toBeDefined();
    });
  });

  describe("Step 5: Publication and Gallery Integration", () => {
    it("should publish content and verify gallery appearance", async () => {
      const { PUT } = await import("@/app/api/admin/content/route");
      const { GET: getContent } = await import("@/app/api/content/all/route");

      // Update status to published
      const publishData = {
        id: testPortfolioId,
        status: "published",
        publishDate: new Date().toISOString(),
      };

      const publishRequest = new NextRequest(
        "http://localhost:3000/api/admin/content",
        {
          method: "PUT",
          body: JSON.stringify(publishData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const publishResponse = await PUT(publishRequest);
      const publishResult = await publishResponse.json();

      expect(publishResponse.status).toBe(200);
      expect(publishResult.success).toBe(true);
      expect(publishResult.data.status).toBe("published");

      // Verify content appears in public API
      const contentRequest = new NextRequest(
        "http://localhost:3000/api/content/all",
      );
      const contentResponse = await getContent(contentRequest);
      const contentResult = await contentResponse.json();

      expect(contentResponse.status).toBe(200);
      expect(Array.isArray(contentResult)).toBe(true);

      const publishedItem = contentResult.find(
        (item: { id: string }) => item.id === testPortfolioId,
      );
      expect(publishedItem).toBeDefined();
      expect(publishedItem.status).toBe("published");
    });

    it("should handle category-specific gallery filtering", async () => {
      const { GET: getDevelop } = await import(
        "@/app/api/content/develop/route"
      );
      const { GET: getDesign } = await import("@/app/api/content/design/route");

      // Test develop category
      const developRequest = new NextRequest(
        "http://localhost:3000/api/content/develop",
      );
      const developResponse = await getDevelop(developRequest);
      const developResult = await developResponse.json();

      expect(developResponse.status).toBe(200);
      expect(Array.isArray(developResult)).toBe(true);

      const developItem = developResult.find(
        (item: { id: string }) => item.id === testPortfolioId,
      );
      expect(developItem).toBeDefined(); // Should appear in develop gallery

      // Test design category
      const designRequest = new NextRequest(
        "http://localhost:3000/api/content/design",
      );
      const designResponse = await getDesign(designRequest);
      const designResult = await designResponse.json();

      expect(designResponse.status).toBe(200);
      expect(Array.isArray(designResult)).toBe(true);

      const designItem = designResult.find(
        (item: { id: string }) => item.id === testPortfolioId,
      );
      expect(designItem).toBeDefined(); // Should appear in design gallery
    });
  });

  describe("Step 6: Analytics and Monitoring Integration", () => {
    it("should track portfolio views and interactions", async () => {
      const { POST: trackView } = await import("@/app/api/analytics/route");

      const viewData = {
        itemId: testPortfolioId,
        action: "view",
        timestamp: new Date().toISOString(),
        userAgent: "Integration Test",
        referrer: "test",
      };

      const trackRequest = new NextRequest(
        "http://localhost:3000/api/analytics",
        {
          method: "POST",
          body: JSON.stringify(viewData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await trackView(trackRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it("should generate portfolio statistics", async () => {
      const { GET } = await import("@/app/api/admin/analytics/route");

      const statsRequest = new NextRequest(
        `http://localhost:3000/api/admin/analytics?type=portfolio&itemId=${testPortfolioId}`,
      );
      const response = await GET(statsRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("views");
      expect(result.data).toHaveProperty("interactions");
    });
  });

  describe("Step 7: Complete Flow Validation", () => {
    it("should validate the complete portfolio lifecycle", async () => {
      // Verify all components work together
      const { GET: getItem } = await import("@/app/api/content/[id]/route");

      const itemRequest = new NextRequest(
        `http://localhost:3000/api/content/${testPortfolioId}`,
      );
      const itemResponse = await getItem(itemRequest, {
        params: { id: testPortfolioId },
      });
      const item = await itemResponse.json();

      expect(itemResponse.status).toBe(200);
      expect(item).toMatchObject({
        id: testPortfolioId,
        title: "Integration Test Portfolio",
        status: "published",
        categories: expect.arrayContaining(["develop", "design"]),
        tags: expect.arrayContaining(["React", "TypeScript", "Integration"]),
      });

      // Verify metadata integrity
      expect(item.createdAt).toBeDefined();
      expect(item.updatedAt).toBeDefined();
      expect(item.publishDate).toBeDefined();

      // Verify content processing
      expect(item.processed).toBe(true);

      // Verify file associations
      if (item.files) {
        expect(Array.isArray(item.files)).toBe(true);
      }
    });

    it("should handle error scenarios gracefully", async () => {
      // Test non-existent item
      const { GET } = await import("@/app/api/content/[id]/route");

      const nonExistentRequest = new NextRequest(
        "http://localhost:3000/api/content/non-existent-id",
      );
      const response = await GET(nonExistentRequest, {
        params: { id: "non-existent-id" },
      });

      expect(response.status).toBe(404);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });
  });

  describe("Step 8: SEO and Social Media Integration", () => {
    it("should generate proper SEO metadata", async () => {
      const { GET } = await import("@/app/api/seo/metadata/route");

      const seoRequest = new NextRequest(
        `http://localhost:3000/api/seo/metadata?itemId=${testPortfolioId}&type=portfolio`,
      );
      const response = await GET(seoRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("title");
      expect(result.data).toHaveProperty("description");
      expect(result.data).toHaveProperty("keywords");
      expect(result.data).toHaveProperty("openGraph");
      expect(result.data).toHaveProperty("twitter");
    });

    it("should generate social media previews", async () => {
      const { POST } = await import("@/app/api/admin/ogp/route");

      const ogpData = {
        itemId: testPortfolioId,
        generateImage: true,
        customTitle: "Integration Test Portfolio",
        customDescription: "Complete integration test portfolio item",
      };

      const ogpRequest = new NextRequest(
        "http://localhost:3000/api/admin/ogp",
        {
          method: "POST",
          body: JSON.stringify(ogpData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(ogpRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("ogImageUrl");
      expect(result.data).toHaveProperty("twitterImageUrl");
    });

    it("should update sitemap with new content", async () => {
      const { POST } = await import("@/app/api/sitemap/update/route");

      const sitemapData = {
        action: "add",
        urls: [
          {
            url: `/portfolio/${testPortfolioId}`,
            lastModified: new Date().toISOString(),
            changeFrequency: "monthly",
            priority: 0.8,
          },
        ],
      };

      const sitemapRequest = new NextRequest(
        "http://localhost:3000/api/sitemap/update",
        {
          method: "POST",
          body: JSON.stringify(sitemapData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(sitemapRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.updated).toBe(true);
    });
  });

  describe("Step 9: Performance and Accessibility Validation", () => {
    it("should validate content accessibility", async () => {
      const { POST } = await import("@/app/api/accessibility/validate/route");

      const accessibilityData = {
        itemId: testPortfolioId,
        checkWCAG: true,
        level: "AA",
        includeImages: true,
      };

      const accessibilityRequest = new NextRequest(
        "http://localhost:3000/api/accessibility/validate",
        {
          method: "POST",
          body: JSON.stringify(accessibilityData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(accessibilityRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("wcagCompliance");
      expect(result.data).toHaveProperty("issues");
      expect(result.data).toHaveProperty("score");
      expect(Array.isArray(result.data.issues)).toBe(true);
    });

    it("should measure content performance metrics", async () => {
      const { GET } = await import("@/app/api/performance/metrics/route");

      const metricsRequest = new NextRequest(
        `http://localhost:3000/api/performance/metrics?itemId=${testPortfolioId}&type=content`,
      );
      const response = await GET(metricsRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("loadTime");
      expect(result.data).toHaveProperty("renderTime");
      expect(result.data).toHaveProperty("imageOptimization");
      expect(result.data).toHaveProperty("coreWebVitals");
    });

    it("should validate responsive design", async () => {
      const { POST } = await import("@/app/api/responsive/validate/route");

      const responsiveData = {
        itemId: testPortfolioId,
        viewports: ["mobile", "tablet", "desktop"],
        checkLayout: true,
        checkImages: true,
      };

      const responsiveRequest = new NextRequest(
        "http://localhost:3000/api/responsive/validate",
        {
          method: "POST",
          body: JSON.stringify(responsiveData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await POST(responsiveRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty("viewportTests");
      expect(result.data).toHaveProperty("layoutIssues");
      expect(Array.isArray(result.data.viewportTests)).toBe(true);
    });
  });

  describe("Step 10: Cleanup and Data Integrity", () => {
    it("should maintain data integrity throughout the flow", async () => {
      // Verify no orphaned data
      const { GET: getTags } = await import("@/app/api/admin/tags/route");
      const { GET: getDates } = await import("@/app/api/admin/dates/route");

      // Check tags are properly associated
      const tagsRequest = new NextRequest(
        "http://localhost:3000/api/admin/tags",
      );
      const tagsResponse = await getTags(tagsRequest);
      const tagsResult = await tagsResponse.json();

      expect(tagsResponse.status).toBe(200);
      expect(tagsResult.success).toBe(true);

      // Check dates are properly managed
      const datesRequest = new NextRequest(
        `http://localhost:3000/api/admin/dates?itemId=${testPortfolioId}`,
      );
      const datesResponse = await getDates(datesRequest);
      const datesResult = await datesResponse.json();

      expect(datesResponse.status).toBe(200);
      expect(datesResult.success).toBe(true);
    });

    it("should validate complete data consistency", async () => {
      // Comprehensive data integrity check
      const { GET: getContent } = await import("@/app/api/content/[id]/route");
      const { GET: getPublicContent } = await import(
        "@/app/api/content/all/route"
      );

      // Check individual item consistency
      const itemRequest = new NextRequest(
        `http://localhost:3000/api/content/${testPortfolioId}`,
      );
      const itemResponse = await getContent(itemRequest, {
        params: { id: testPortfolioId },
      });
      const item = await itemResponse.json();

      expect(itemResponse.status).toBe(200);
      expect(item.id).toBe(testPortfolioId);

      // Check item appears in public listings
      const publicRequest = new NextRequest(
        "http://localhost:3000/api/content/all",
      );
      const publicResponse = await getPublicContent(publicRequest);
      const publicContent = await publicResponse.json();

      expect(publicResponse.status).toBe(200);
      const publishedItem = publicContent.find(
        (content: { id: string }) => content.id === testPortfolioId,
      );
      expect(publishedItem).toBeDefined();
      expect(publishedItem.status).toBe("published");
    });

    it("should support content deletion and cleanup", async () => {
      const { DELETE } = await import(
        "@/app/api/admin/content-processing/route"
      );

      const deleteData = {
        itemId: testPortfolioId,
        cleanupFiles: true,
        removeFromIndex: true,
        updateSitemap: true,
      };

      const deleteRequest = new NextRequest(
        "http://localhost:3000/api/admin/content-processing",
        {
          method: "DELETE",
          body: JSON.stringify(deleteData),
          headers: { "Content-Type": "application/json" },
        },
      );

      const response = await DELETE(deleteRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(true);
      expect(result.data.cleanedUp).toBe(true);
      expect(result.data.sitemapUpdated).toBe(true);
    });
  });
});
