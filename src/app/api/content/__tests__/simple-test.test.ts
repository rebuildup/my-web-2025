/**
 * @jest-environment node
 */

describe("Simple API Test", () => {
  it("should pass basic test", () => {
    expect(1 + 1).toBe(2);
  });

  it("should test NextRequest creation", () => {
    const { NextRequest } = jest.requireMock("next/server");
    const request = new NextRequest("http://localhost:3000/api/test");
    expect(request.url).toBe("http://localhost:3000/api/test");
  });

  it("should test URL parsing", () => {
    const url = new URL("http://localhost:3000/api/test?param=value");
    expect(url.searchParams.get("param")).toBe("value");
  });
});
