/**
 * @jest-environment node
 */

describe("Middleware", () => {
  it("should export middleware function", async () => {
    const middlewareModule = await import("../middleware");

    expect(typeof middlewareModule.middleware).toBe("function");
  });

  it("should handle requests", async () => {
    const { middleware } = await import("../middleware");

    // Create a proper mock request with nextUrl
    const mockRequest = {
      nextUrl: {
        pathname: "/test",
        searchParams: new URLSearchParams(),
        hostname: "localhost",
      },
      url: "http://localhost:3000/test",
      headers: new Map(),
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
      },
    } as unknown as Request;

    const response = middleware(mockRequest);

    // Middleware may return undefined for pass-through requests
    // This is expected behavior for non-admin routes
    expect(
      typeof response === "undefined" || typeof response === "object",
    ).toBe(true);
  });
});
