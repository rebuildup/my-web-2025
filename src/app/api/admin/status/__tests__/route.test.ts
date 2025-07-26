/**
 * @jest-environment node
 */

describe("/api/admin/status", () => {
  describe("Route module", () => {
    it("should export GET and HEAD functions", async () => {
      const routeModule = await import("../route");

      expect(typeof routeModule.GET).toBe("function");
      expect(typeof routeModule.HEAD).toBe("function");
    });

    it("should handle requests properly", async () => {
      const { GET } = await import("../route");

      const response = await GET();

      // Should return a response object
      expect(response).toBeDefined();
      expect(typeof response.json).toBe("function");
      expect(typeof response.status).toBe("number");
    });
  });
});
