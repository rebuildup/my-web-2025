import * as PortfolioComponents from "../index";

describe("Portfolio Components Index", () => {
  it("should export PortfolioAnalytics", () => {
    expect(PortfolioComponents.PortfolioAnalytics).toBeDefined();
  });

  it("should export PortfolioAnalyticsDashboard", () => {
    expect(PortfolioComponents.PortfolioAnalyticsDashboard).toBeDefined();
  });

  it("should export PortfolioInsights", () => {
    expect(PortfolioComponents.PortfolioInsights).toBeDefined();
  });

  it("should export usePortfolioTracking hooks", () => {
    expect(PortfolioComponents.usePortfolioTracking).toBeDefined();
    expect(PortfolioComponents.usePortfolioGalleryTracking).toBeDefined();
    expect(PortfolioComponents.usePortfolioDetailTracking).toBeDefined();
    expect(PortfolioComponents.usePortfolioItemTracking).toBeDefined();
  });

  it("should have correct function types for tracking hooks", () => {
    expect(typeof PortfolioComponents.usePortfolioTracking).toBe("function");
    expect(typeof PortfolioComponents.usePortfolioGalleryTracking).toBe(
      "function",
    );
    expect(typeof PortfolioComponents.usePortfolioDetailTracking).toBe(
      "function",
    );
    expect(typeof PortfolioComponents.usePortfolioItemTracking).toBe(
      "function",
    );
  });

  it("should export all expected components and hooks", () => {
    const expectedExports = [
      "PortfolioAnalytics",
      "PortfolioAnalyticsDashboard",
      "PortfolioInsights",
      "usePortfolioTracking",
      "usePortfolioGalleryTracking",
      "usePortfolioDetailTracking",
      "usePortfolioItemTracking",
    ];

    expectedExports.forEach((exportName) => {
      expect(PortfolioComponents).toHaveProperty(exportName);
    });
  });

  it("should have the correct number of exports", () => {
    const exportKeys = Object.keys(PortfolioComponents);
    expect(exportKeys.length).toBe(7); // 3 components + 4 hooks
  });
});
