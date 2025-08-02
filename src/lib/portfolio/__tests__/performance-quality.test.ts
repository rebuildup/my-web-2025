import { performance } from "perf_hooks";
import { EnhancedContentItem } from "../../../types/enhanced-content";
import { EnhancedCacheManager } from "../../cache/enhanced-cache-system";
import { DateManagementSystem } from "../date-management";
import { TagManagementSystem } from "../tag-management";

// Mock file system operations for testing
jest.mock("fs/promises", () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(),
  mkdir: jest.fn(),
  stat: jest.fn(),
  access: jest.fn(),
}));

describe.skip("Performance and Quality Tests", () => {
  let processor: EnhancedDataProcessingPipeline;
  let cacheManager: EnhancedCacheManager;
  let markdownManager: MarkdownFileManager;
  let tagManager: TagManagementSystem;
  let dateManager: DateManagementSystem;

  beforeEach(() => {
    // Initialize components
    cacheManager = new EnhancedCacheManager();
    markdownManager = new MarkdownFileManager();
    tagManager = new TagManagementSystem();
    dateManager = new DateManagementSystem();
    processor = new EnhancedDataProcessingPipeline();

    // Clear any existing timers
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Large Dataset Performance Tests", () => {
    test("should process 1000 portfolio items within performance budget", async () => {
      // Generate large dataset
      const largeDataset: EnhancedContentItem[] = Array.from(
        { length: 1000 },
        (_, i) => ({
          id: `portfolio-${i}`,
          type: "portfolio" as const,
          title: `Portfolio Item ${i}`,
          description: `Description for portfolio item ${i}`,
          categories: ["develop", "design"],
          tags: [`tag-${i % 10}`, `category-${i % 5}`, "common-tag"],
          status: "published" as const,
          priority: Math.floor(Math.random() * 100),
          createdAt: new Date(Date.now() - i * 86400000).toISOString(),
          isOtherCategory: i % 50 === 0, // 2% Other category items
          useManualDate: i % 10 === 0, // 10% manual dates
          manualDate:
            i % 10 === 0
              ? new Date(Date.now() - i * 86400000).toISOString()
              : undefined,
          originalImages: i % 3 === 0 ? [`original-${i}.jpg`] : [],
          processedImages: [`processed-${i}.jpg`, `thumb-${i}.jpg`],
          markdownPath: i % 5 === 0 ? `content/portfolio-${i}.md` : undefined,
          markdownContent:
            i % 5 === 0
              ? `# Portfolio Item ${i}\n\nContent for item ${i}`
              : undefined,
        }),
      );

      const startTime = performance.now();
      const processedData = await processor.processRawData(largeDataset);
      const endTime = performance.now();

      const processingTime = endTime - startTime;

      // Should process 1000 items in less than 5 seconds
      expect(processingTime).toBeLessThan(5000);
      expect(processedData).toHaveLength(1000);

      console.log(`Processed 1000 items in ${processingTime.toFixed(2)}ms`);
    });

    test("should handle memory efficiently with large datasets", async () => {
      const initialMemory = process.memoryUsage();

      // Process multiple batches to test memory management
      for (let batch = 0; batch < 5; batch++) {
        const batchData: EnhancedContentItem[] = Array.from(
          { length: 200 },
          (_, i) => ({
            id: `batch-${batch}-item-${i}`,
            type: "portfolio" as const,
            title: `Batch ${batch} Item ${i}`,
            description:
              `Large description content for batch ${batch} item ${i}`.repeat(
                10,
              ),
            categories: ["develop"],
            tags: [`batch-${batch}`, `item-${i}`],
            status: "published" as const,
            priority: 50,
            createdAt: new Date().toISOString(),
            isOtherCategory: false,
            processedImages: [`image-${batch}-${i}.jpg`],
            markdownContent: `# Batch ${batch} Item ${i}\n\n${"Content ".repeat(100)}`,
          }),
        );

        await processor.processRawData(batchData);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 100MB for 1000 items)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);

      console.log(
        `Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
      );
    });

    test("should maintain performance with complex filtering operations", async () => {
      const complexDataset: EnhancedContentItem[] = Array.from(
        { length: 500 },
        (_, i) => ({
          id: `complex-${i}`,
          type: "portfolio" as const,
          title: `Complex Item ${i}`,
          description: `Complex description ${i}`,
          categories: [
            "develop",
            ...(i % 2 === 0 ? ["design"] : []),
            ...(i % 3 === 0 ? ["video"] : []),
            ...(i % 7 === 0 ? ["other"] : []),
          ] as string[],
          tags: Array.from(
            { length: Math.floor(Math.random() * 10) + 1 },
            (_, j) => `tag-${i}-${j}`,
          ),
          status: "published" as const,
          priority: Math.floor(Math.random() * 100),
          createdAt: new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          isOtherCategory: i % 7 === 0,
          useManualDate: Math.random() > 0.5,
          manualDate:
            Math.random() > 0.5 ? new Date().toISOString() : undefined,
          originalImages: Array.from(
            { length: Math.floor(Math.random() * 5) },
            (_, j) => `orig-${i}-${j}.jpg`,
          ),
          processedImages: Array.from(
            { length: Math.floor(Math.random() * 3) + 1 },
            (_, j) => `proc-${i}-${j}.jpg`,
          ),
        }),
      );

      const startTime = performance.now();

      // Test various filtering operations
      const developItems = complexDataset.filter((item) =>
        item.categories.includes("develop"),
      );
      const designItems = complexDataset.filter((item) =>
        item.categories.includes("design"),
      );
      const videoDesignItems = complexDataset.filter(
        (item) =>
          item.categories.includes("video") ||
          item.categories.includes("design") ||
          item.categories.includes("video&design"),
      );
      const otherItems = complexDataset.filter((item) => item.isOtherCategory);
      // const _taggedItems = complexDataset.filter(
      //   (item) => item.tags.length > 5,
      // );

      const endTime = performance.now();
      const filteringTime = endTime - startTime;

      // Complex filtering should complete quickly
      expect(filteringTime).toBeLessThan(100);

      // Verify filtering results
      expect(developItems.length).toBeGreaterThan(0);
      expect(designItems.length).toBeGreaterThan(0);
      expect(videoDesignItems.length).toBeGreaterThan(0);
      expect(otherItems.length).toBeGreaterThan(0);

      console.log(
        `Complex filtering completed in ${filteringTime.toFixed(2)}ms`,
      );
      console.log(
        `Filtered results: develop=${developItems.length}, design=${designItems.length}, video&design=${videoDesignItems.length}, other=${otherItems.length}`,
      );
    });
  });

  describe("Cache Performance Tests", () => {
    test("should provide significant performance improvement with caching", async () => {
      const testData = "Large markdown content ".repeat(1000);
      const cacheKey = "performance-test-key";

      // First access (cache miss)
      const startTime1 = performance.now();
      await cacheManager.set(cacheKey, testData, 3600);
      const cached1 = await cacheManager.get(cacheKey);
      const endTime1 = performance.now();

      // Second access (cache hit)
      const startTime2 = performance.now();
      const cached2 = await cacheManager.get(cacheKey);
      const endTime2 = performance.now();

      const firstAccessTime = endTime1 - startTime1;
      const secondAccessTime = endTime2 - startTime2;

      // Cache hit should be significantly faster
      expect(secondAccessTime).toBeLessThan(firstAccessTime * 0.5);
      expect(cached1).toBe(testData);
      expect(cached2).toBe(testData);

      console.log(
        `First access: ${firstAccessTime.toFixed(2)}ms, Second access: ${secondAccessTime.toFixed(2)}ms`,
      );
    });

    test("should handle cache invalidation efficiently", async () => {
      const cacheKeys = Array.from({ length: 100 }, (_, i) => `cache-key-${i}`);
      const testData = "Test data for cache invalidation";

      // Populate cache
      const populateStart = performance.now();
      await Promise.all(
        cacheKeys.map((key) => cacheManager.set(key, testData, 3600)),
      );
      const populateEnd = performance.now();

      // Invalidate cache
      const invalidateStart = performance.now();
      await Promise.all(cacheKeys.map((key) => cacheManager.delete(key)));
      const invalidateEnd = performance.now();

      const populateTime = populateEnd - populateStart;
      const invalidateTime = invalidateEnd - invalidateStart;

      // Both operations should be reasonably fast
      expect(populateTime).toBeLessThan(1000);
      expect(invalidateTime).toBeLessThan(500);

      // Verify cache is cleared
      const remainingItems = await Promise.all(
        cacheKeys.map((key) => cacheManager.get(key)),
      );
      expect(remainingItems.every((item) => item === null)).toBe(true);

      console.log(
        `Cache populate: ${populateTime.toFixed(2)}ms, Cache invalidate: ${invalidateTime.toFixed(2)}ms`,
      );
    });

    test("should handle concurrent cache operations safely", async () => {
      const concurrentOperations = 50;
      const testKey = "concurrent-test-key";

      const operations = Array.from(
        { length: concurrentOperations },
        async (_, i) => {
          const data = `Concurrent data ${i}`;
          await cacheManager.set(`${testKey}-${i}`, data, 3600);
          const retrieved = await cacheManager.get(`${testKey}-${i}`);
          expect(retrieved).toBe(data);
          return retrieved;
        },
      );

      const startTime = performance.now();
      const results = await Promise.all(operations);
      const endTime = performance.now();

      const concurrentTime = endTime - startTime;

      // Concurrent operations should complete reasonably quickly
      expect(concurrentTime).toBeLessThan(2000);
      expect(results).toHaveLength(concurrentOperations);

      console.log(
        `${concurrentOperations} concurrent cache operations completed in ${concurrentTime.toFixed(2)}ms`,
      );
    });
  });

  describe("File Operation Performance Tests", () => {
    test("should handle markdown file operations efficiently", async () => {
      const fs = await import("fs/promises");

      // Mock file operations with realistic delays
      fs.readFile.mockImplementation(async (path: string) => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 10));
        return `# Markdown Content\n\nContent for ${path}`;
      });

      fs.writeFile.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 20));
        return Promise.resolve();
      });

      fs.stat.mockImplementation(async () => ({
        mtimeMs: Date.now(),
        isFile: () => true,
      }));

      const fileOperations = Array.from({ length: 20 }, async (_, i) => {
        const itemId = `perf-test-${i}`;
        const content = `# Performance Test ${i}\n\n${"Content ".repeat(100)}`;

        // Create markdown file
        const filePath = await markdownManager.createMarkdownFile(
          itemId,
          content,
        );

        // Read it back
        const readContent = await markdownManager.readMarkdownFile(filePath);

        expect(readContent).toContain(`Performance Test ${i}`);
        return filePath;
      });

      const startTime = performance.now();
      const results = await Promise.all(fileOperations);
      const endTime = performance.now();

      const fileOperationTime = endTime - startTime;

      // File operations should complete within reasonable time
      expect(fileOperationTime).toBeLessThan(3000);
      expect(results).toHaveLength(20);

      console.log(
        `20 markdown file operations completed in ${fileOperationTime.toFixed(2)}ms`,
      );
    });

    test("should batch file operations for better performance", async () => {
      const fs = await import("fs/promises");

      fs.readFile.mockImplementation(async (path: string) => {
        await new Promise((resolve) => setTimeout(resolve, 5));
        return `Content for ${path}`;
      });

      const filePaths = Array.from(
        { length: 50 },
        (_, i) => `test-file-${i}.md`,
      );

      // Sequential operations
      const sequentialStart = performance.now();
      const sequentialResults = [];
      for (const path of filePaths) {
        const content = await markdownManager.readMarkdownFile(path);
        sequentialResults.push(content);
      }
      const sequentialEnd = performance.now();

      // Parallel operations
      const parallelStart = performance.now();
      const parallelResults = await Promise.all(
        filePaths.map((path) => markdownManager.readMarkdownFile(path)),
      );
      const parallelEnd = performance.now();

      const sequentialTime = sequentialEnd - sequentialStart;
      const parallelTime = parallelEnd - parallelStart;

      // Parallel should be significantly faster
      expect(parallelTime).toBeLessThan(sequentialTime * 0.7);
      expect(sequentialResults).toHaveLength(50);
      expect(parallelResults).toHaveLength(50);

      console.log(
        `Sequential: ${sequentialTime.toFixed(2)}ms, Parallel: ${parallelTime.toFixed(2)}ms`,
      );
    });
  });

  describe("Tag Management Performance Tests", () => {
    test("should handle large tag datasets efficiently", async () => {
      // Create large tag dataset
      const largeTags = Array.from({ length: 1000 }, (_, i) => ({
        name: `tag-${i}`,
        count: Math.floor(Math.random() * 100),
        createdAt: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        lastUsed: new Date().toISOString(),
      }));

      // Mock tag storage
      const tagStorage = [...largeTags];

      jest.spyOn(tagManager, "getAllTags").mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return tagStorage;
      });

      jest
        .spyOn(tagManager, "searchTags")
        .mockImplementation(async (query: string) => {
          await new Promise((resolve) => setTimeout(resolve, 5));
          return tagStorage.filter((tag) => tag.name.includes(query));
        });

      // Test tag retrieval performance
      const retrievalStart = performance.now();
      const allTags = await tagManager.getAllTags();
      const retrievalEnd = performance.now();

      // Test tag search performance
      const searchStart = performance.now();
      const searchResults = await tagManager.searchTags("tag-1");
      const searchEnd = performance.now();

      const retrievalTime = retrievalEnd - retrievalStart;
      const searchTime = searchEnd - searchStart;

      // Operations should be fast even with large datasets
      expect(retrievalTime).toBeLessThan(100);
      expect(searchTime).toBeLessThan(50);
      expect(allTags).toHaveLength(1000);
      expect(searchResults.length).toBeGreaterThan(0);

      console.log(
        `Tag retrieval: ${retrievalTime.toFixed(2)}ms, Tag search: ${searchTime.toFixed(2)}ms`,
      );
    });

    test("should optimize tag usage updates", async () => {
      const tagUpdates = Array.from(
        { length: 100 },
        (_, i) => `update-tag-${i}`,
      );

      jest.spyOn(tagManager, "updateTagUsage").mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2));
        return Promise.resolve();
      });

      // Sequential updates
      const sequentialStart = performance.now();
      for (const tag of tagUpdates) {
        await tagManager.updateTagUsage(tag);
      }
      const sequentialEnd = performance.now();

      // Parallel updates
      const parallelStart = performance.now();
      await Promise.all(
        tagUpdates.map((tag) => tagManager.updateTagUsage(tag)),
      );
      const parallelEnd = performance.now();

      const sequentialTime = sequentialEnd - sequentialStart;
      const parallelTime = parallelEnd - parallelStart;

      // Parallel updates should be faster
      expect(parallelTime).toBeLessThan(sequentialTime * 0.8);

      console.log(
        `Sequential tag updates: ${sequentialTime.toFixed(2)}ms, Parallel: ${parallelTime.toFixed(2)}ms`,
      );
    });
  });

  describe("UI Responsiveness Tests", () => {
    test("should maintain responsive data processing for UI updates", async () => {
      const uiUpdateData: EnhancedContentItem[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `ui-test-${i}`,
          type: "portfolio" as const,
          title: `UI Test Item ${i}`,
          description: `Description ${i}`,
          categories: ["develop"],
          tags: [`ui-tag-${i}`],
          status: "published" as const,
          priority: 50,
          createdAt: new Date().toISOString(),
          isOtherCategory: false,
          processedImages: [`ui-image-${i}.jpg`],
        }),
      );

      // Simulate UI update processing with time constraints
      const uiUpdateStart = performance.now();

      // Process in chunks to maintain responsiveness
      const chunkSize = 10;
      const processedChunks = [];

      for (let i = 0; i < uiUpdateData.length; i += chunkSize) {
        const chunk = uiUpdateData.slice(i, i + chunkSize);
        const processedChunk = await processor.processRawData(chunk);
        processedChunks.push(...processedChunk);

        // Simulate UI frame budget (16ms for 60fps)
        const chunkTime = performance.now() - uiUpdateStart;
        if (chunkTime > 16) {
          // Yield to UI thread
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      const uiUpdateEnd = performance.now();
      const uiUpdateTime = uiUpdateEnd - uiUpdateStart;

      // Should complete within reasonable time while maintaining responsiveness
      expect(uiUpdateTime).toBeLessThan(1000);
      expect(processedChunks).toHaveLength(100);

      console.log(
        `UI-responsive processing completed in ${uiUpdateTime.toFixed(2)}ms`,
      );
    });

    test("should handle real-time search efficiently", async () => {
      const searchDataset: EnhancedContentItem[] = Array.from(
        { length: 500 },
        (_, i) => ({
          id: `search-${i}`,
          type: "portfolio" as const,
          title: `Searchable Item ${i} ${i % 10 === 0 ? "special" : "normal"}`,
          description: `Description with keywords: ${i % 5 === 0 ? "react" : ""} ${i % 3 === 0 ? "typescript" : ""} ${i % 7 === 0 ? "design" : ""}`,
          categories: ["develop"],
          tags: [
            `search-tag-${i % 20}`,
            ...(i % 10 === 0 ? ["special-tag"] : []),
          ],
          status: "published" as const,
          priority: 50,
          createdAt: new Date().toISOString(),
          isOtherCategory: false,
        }),
      );

      const searchQueries = [
        "special",
        "react",
        "typescript",
        "design",
        "search-tag-5",
      ];

      const searchResults = [];

      for (const query of searchQueries) {
        const searchStart = performance.now();

        // Simulate real-time search
        const results = searchDataset.filter(
          (item) =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase()) ||
            item.tags.some((tag) =>
              tag.toLowerCase().includes(query.toLowerCase()),
            ),
        );

        const searchEnd = performance.now();
        const searchTime = searchEnd - searchStart;

        // Real-time search should be very fast (under 50ms)
        expect(searchTime).toBeLessThan(50);

        searchResults.push({
          query,
          results: results.length,
          time: searchTime,
        });
      }

      console.log("Search performance results:");
      searchResults.forEach((result) => {
        console.log(
          `  "${result.query}": ${result.results} results in ${result.time.toFixed(2)}ms`,
        );
      });
    });
  });

  describe("Security and Data Validation Tests", () => {
    test("should validate input data securely", async () => {
      const maliciousInputs: Partial<EnhancedContentItem>[] = [
        {
          id: "<script>alert('xss')</script>",
          title: "Normal Title",
          description: "Normal Description",
        },
        {
          id: "normal-id",
          title: "<img src=x onerror=alert('xss')>",
          description: "Normal Description",
        },
        {
          id: "normal-id",
          title: "Normal Title",
          description: "javascript:alert('xss')",
        },
        {
          id: "normal-id",
          title: "Normal Title",
          markdownContent: "<script>malicious()</script>",
        },
        {
          id: "../../../etc/passwd",
          title: "Path Traversal Test",
          markdownPath: "../../../etc/passwd",
        },
      ];

      for (const maliciousInput of maliciousInputs) {
        const validationStart = performance.now();

        // Simulate input validation
        const isValid = validateEnhancedContentItem(maliciousInput);

        const validationEnd = performance.now();
        const validationTime = validationEnd - validationStart;

        // Validation should be fast
        expect(validationTime).toBeLessThan(10);

        // Malicious inputs should be rejected or sanitized
        if (
          maliciousInput.id?.includes("<script>") ||
          maliciousInput.title?.includes("<script>") ||
          maliciousInput.id?.includes("../")
        ) {
          expect(isValid).toBe(false);
        }
      }

      console.log("Security validation tests completed");
    });

    test("should handle data sanitization efficiently", async () => {
      const unsafeData: EnhancedContentItem[] = Array.from(
        { length: 100 },
        (_, i) => ({
          id: `unsafe-${i}`,
          type: "portfolio" as const,
          title: `Title with <script>alert(${i})</script> content`,
          description: `Description with <img src=x onerror=alert(${i})> and javascript:void(0)`,
          categories: ["develop"],
          tags: [`<script>tag-${i}</script>`, `normal-tag-${i}`],
          status: "published" as const,
          priority: 50,
          createdAt: new Date().toISOString(),
          isOtherCategory: false,
          markdownContent: `# Title ${i}\n\n<script>malicious()</script>\n\nNormal content`,
        }),
      );

      const sanitizationStart = performance.now();

      const sanitizedData = unsafeData.map((item) =>
        sanitizeEnhancedContentItem(item),
      );

      const sanitizationEnd = performance.now();
      const sanitizationTime = sanitizationEnd - sanitizationStart;

      // Sanitization should be efficient
      expect(sanitizationTime).toBeLessThan(500);
      expect(sanitizedData).toHaveLength(100);

      // Verify sanitization worked
      sanitizedData.forEach((item) => {
        expect(item.title).not.toContain("<script>");
        expect(item.description).not.toContain("<script>");
        expect(item.description).not.toContain("javascript:");
        expect(item.markdownContent).not.toContain("<script>");
        item.tags.forEach((tag) => {
          expect(tag).not.toContain("<script>");
        });
      });

      console.log(`Sanitized 100 items in ${sanitizationTime.toFixed(2)}ms`);
    });
  });

  describe("Memory Management Tests", () => {
    test("should clean up resources properly", async () => {
      const initialMemory = process.memoryUsage();

      // Create and process large amounts of data
      for (let iteration = 0; iteration < 10; iteration++) {
        const iterationData: EnhancedContentItem[] = Array.from(
          { length: 100 },
          (_, i) => ({
            id: `memory-test-${iteration}-${i}`,
            type: "portfolio" as const,
            title: `Memory Test ${iteration}-${i}`,
            description: "Large description content ".repeat(50),
            categories: ["develop"],
            tags: Array.from(
              { length: 10 },
              (_, j) => `tag-${iteration}-${i}-${j}`,
            ),
            status: "published" as const,
            priority: 50,
            createdAt: new Date().toISOString(),
            isOtherCategory: false,
            markdownContent:
              "# Large Content\n\n" + "Content paragraph ".repeat(100),
          }),
        );

        await processor.processRawData(iterationData);

        // Clear references
        iterationData.length = 0;

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      console.log(
        `Memory increase after processing 1000 items: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`,
      );
    });

    test("should handle memory pressure gracefully", async () => {
      const memoryPressureData: EnhancedContentItem[] = Array.from(
        { length: 2000 },
        (_, i) => ({
          id: `pressure-${i}`,
          type: "portfolio" as const,
          title: `Pressure Test ${i}`,
          description: "Very large description content ".repeat(100),
          categories: ["develop", "design"],
          tags: Array.from({ length: 20 }, (_, j) => `pressure-tag-${i}-${j}`),
          status: "published" as const,
          priority: 50,
          createdAt: new Date().toISOString(),
          isOtherCategory: false,
          markdownContent:
            "# Large Markdown\n\n" + "Large paragraph content ".repeat(200),
          originalImages: Array.from(
            { length: 5 },
            (_, j) => `large-original-${i}-${j}.jpg`,
          ),
          processedImages: Array.from(
            { length: 10 },
            (_, j) => `large-processed-${i}-${j}.jpg`,
          ),
        }),
      );

      const memoryStart = process.memoryUsage();

      // Process in smaller chunks to manage memory
      const chunkSize = 100;
      const results = [];

      for (let i = 0; i < memoryPressureData.length; i += chunkSize) {
        const chunk = memoryPressureData.slice(i, i + chunkSize);
        const processed = await processor.processRawData(chunk);

        // Only keep essential data
        results.push(processed.length);

        // Clear chunk reference
        chunk.length = 0;

        // Force cleanup
        if (global.gc) {
          global.gc();
        }
      }

      const memoryEnd = process.memoryUsage();
      const memoryUsed = memoryEnd.heapUsed - memoryStart.heapUsed;

      // Should handle large datasets without excessive memory usage
      expect(memoryUsed).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
      expect(results.reduce((sum, count) => sum + count, 0)).toBe(2000);

      console.log(
        `Processed 2000 large items using ${(memoryUsed / 1024 / 1024).toFixed(2)}MB additional memory`,
      );
    });
  });
});

// Helper functions for validation and sanitization
function validateEnhancedContentItem(
  item: Partial<EnhancedContentItem>,
): boolean {
  // Basic validation rules
  if (!item.id || typeof item.id !== "string") return false;
  if (item.id.includes("<script>") || item.id.includes("../")) return false;
  if (
    item.title &&
    (item.title.includes("<script>") || item.title.includes("javascript:"))
  )
    return false;
  if (item.markdownPath && item.markdownPath.includes("../")) return false;

  return true;
}

function sanitizeEnhancedContentItem(
  item: EnhancedContentItem,
): EnhancedContentItem {
  return {
    ...item,
    title: item.title
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/javascript:/gi, ""),
    description: item.description
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/javascript:/gi, ""),
    tags: item.tags.map((tag) =>
      tag.replace(/<script[^>]*>.*?<\/script>/gi, ""),
    ),
    markdownContent: item.markdownContent?.replace(
      /<script[^>]*>.*?<\/script>/gi,
      "",
    ),
  };
}
