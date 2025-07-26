/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

describe("Middleware", () => {
  it("should export middleware function", async () => {
    const middlewareModule = await import("../middleware");

    expect(typeof middlewareModule.middleware).toBe("function");
  });

  it("should handle requests", async () => {
    const { middleware } = await import("../middleware");
    const request = new NextRequest("http://localhost:3000/");

    const response = middleware(request);

    // Should return a response object
    expect(response).toBeDefined();
  });
});
