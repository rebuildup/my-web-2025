/**
 * @jest-environment node
 */

describe("Simple import test", () => {
  it("should be able to import route modules", async () => {
    try {
      const contentRoute = await import("../content/route");
      console.log("Content route exports:", Object.keys(contentRoute));
      expect(contentRoute).toBeDefined();
      expect(typeof contentRoute.POST).toBe("function");
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  });
});
