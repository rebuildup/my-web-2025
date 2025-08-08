/**
 * Tests for Markdown API endpoints
 * @jest-environment node
 */

// Mock the markdown file manager
jest.mock("@/lib/portfolio/markdown-file-manager", () => ({
  markdownFileManager: {
    createMarkdownFile: jest.fn(),
    listMarkdownFiles: jest.fn(),
    getMarkdownFileMetadata: jest.fn(),
    validateMarkdownPath: jest.fn(),
    clearCache: jest.fn(),
  },
}));

describe("/api/admin/markdown", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Route module", () => {
    it("should export route handlers", async () => {
      // Test that the route module can be imported
      const routeModule = await import("../route");

      expect(typeof routeModule.POST).toBe("function");
      expect(typeof routeModule.GET).toBe("function");
      expect(typeof routeModule.DELETE).toBe("function");
    });

    it("should have markdown file manager available", async () => {
      const { markdownFileManager } = await import(
        "@/lib/portfolio/markdown-file-manager"
      );

      expect(markdownFileManager).toBeDefined();
      expect(typeof markdownFileManager.createMarkdownFile).toBe("function");
      expect(typeof markdownFileManager.listMarkdownFiles).toBe("function");
      expect(typeof markdownFileManager.clearCache).toBe("function");
    });
  });
});
