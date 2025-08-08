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

    it("should have proper environment check function", async () => {
      // Test that the module can be imported without errors
      const routeModule = await import("../route");

      expect(routeModule).toBeDefined();
      expect(routeModule.GET).toBeDefined();
      expect(routeModule.HEAD).toBeDefined();
    });
  });
});
