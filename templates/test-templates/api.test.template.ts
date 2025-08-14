import { createMocks } from "node-mocks-http";
import handler from "../api/route";

describe("/api/route", () => {
  // GET リクエストテスト
  describe("GET", () => {
    it("should return 200 with valid data", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { id: "1" },
        headers: {
          "content-type": "application/json",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        id: "1",
        data: expect.any(Object),
        timestamp: expect.any(String),
      });
    });

    it("should return 400 for missing required parameters", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: {},
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Missing required parameter: id",
        code: "MISSING_PARAMETER",
      });
    });

    it("should return 404 for non-existent resource", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { id: "non-existent" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Resource not found",
        code: "NOT_FOUND",
      });
    });

    it("should handle query parameter validation", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { id: "invalid-format" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Invalid parameter format",
        code: "INVALID_FORMAT",
        details: expect.any(Array),
      });
    });
  });

  // POST リクエストテスト
  describe("POST", () => {
    it("should create resource successfully", async () => {
      const testData = {
        name: "Test Resource",
        value: "test-value",
        metadata: { type: "test" },
      };

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: testData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({
        id: expect.any(String),
        ...testData,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should validate request body", async () => {
      const invalidData = { name: "" }; // 必須フィールドが空
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: invalidData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: expect.arrayContaining([
          expect.objectContaining({
            field: "name",
            message: expect.any(String),
          }),
        ]),
      });
    });

    it("should handle malformed JSON", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: "invalid-json",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Invalid JSON format",
        code: "INVALID_JSON",
      });
    });

    it("should handle content-type validation", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "content-type": "text/plain",
        },
        body: { name: "test" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(415);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Unsupported media type",
        code: "UNSUPPORTED_MEDIA_TYPE",
        expected: "application/json",
      });
    });
  });

  // PUT リクエストテスト
  describe("PUT", () => {
    it("should update existing resource", async () => {
      const updateData = {
        name: "Updated Resource",
        value: "updated-value",
      };

      const { req, res } = createMocks({
        method: "PUT",
        query: { id: "1" },
        headers: {
          "content-type": "application/json",
        },
        body: updateData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        id: "1",
        ...updateData,
        updatedAt: expect.any(String),
      });
    });

    it("should create resource if not exists (upsert)", async () => {
      const newData = {
        name: "New Resource",
        value: "new-value",
      };

      const { req, res } = createMocks({
        method: "PUT",
        query: { id: "new-id" },
        headers: {
          "content-type": "application/json",
        },
        body: newData,
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toEqual({
        id: "new-id",
        ...newData,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });
  });

  // DELETE リクエストテスト
  describe("DELETE", () => {
    it("should delete existing resource", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        query: { id: "1" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(204);
      expect(res._getData()).toBe("");
    });

    it("should return 404 for non-existent resource", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        query: { id: "non-existent" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(404);
    });
  });

  // 認証・認可テスト
  describe("Authentication & Authorization", () => {
    it("should require authentication for protected routes", async () => {
      const { req, res } = createMocks({
        method: "POST",
        body: { data: "test" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Authentication required",
        code: "UNAUTHORIZED",
      });
    });

    it("should accept valid Bearer token", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          authorization: "Bearer valid-token",
          "content-type": "application/json",
        },
        body: { data: "test" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).not.toBe(401);
    });

    it("should reject invalid token", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          authorization: "Bearer invalid-token",
          "content-type": "application/json",
        },
        body: { data: "test" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Invalid token",
        code: "INVALID_TOKEN",
      });
    });

    it("should check user permissions", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        query: { id: "1" },
        headers: {
          authorization: "Bearer user-token", // 管理者権限なし
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Insufficient permissions",
        code: "FORBIDDEN",
      });
    });
  });

  // レート制限テスト
  describe("Rate Limiting", () => {
    it("should allow requests within rate limit", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { id: "1" },
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()).toHaveProperty("x-ratelimit-remaining");
    });

    it("should reject requests exceeding rate limit", async () => {
      // 複数回リクエストを送信してレート制限をテスト
      const requests = Array.from({ length: 101 }, () =>
        createMocks({
          method: "GET",
          query: { id: "1" },
          headers: {
            "x-forwarded-for": "192.168.1.2",
          },
        }),
      );

      // 最後のリクエストがレート制限に引っかかることを確認
      const lastRequest = requests[requests.length - 1];
      await handler(lastRequest.req, lastRequest.res);

      expect(lastRequest.res._getStatusCode()).toBe(429);
      expect(JSON.parse(lastRequest.res._getData())).toEqual({
        error: "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: expect.any(Number),
      });
    });
  });

  // エラーハンドリングテスト
  describe("Error Handling", () => {
    it("should handle database errors", async () => {
      // データベースエラーをモック
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const { req, res } = createMocks({
        method: "GET",
        query: { id: "db-error-trigger" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
        requestId: expect.any(String),
      });

      consoleSpy.mockRestore();
    });

    it("should handle unsupported methods", async () => {
      const { req, res } = createMocks({
        method: "PATCH",
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      expect(res._getHeaders()).toHaveProperty("allow");
      expect(JSON.parse(res._getData())).toEqual({
        error: "Method not allowed",
        code: "METHOD_NOT_ALLOWED",
        allowedMethods: expect.any(Array),
      });
    });

    it("should handle timeout errors", async () => {
      jest.setTimeout(10000);

      const { req, res } = createMocks({
        method: "GET",
        query: { id: "timeout-trigger" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(408);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Request timeout",
        code: "TIMEOUT",
      });
    });

    it("should sanitize error messages in production", async () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as { NODE_ENV: string }).NODE_ENV = "production";

      const { req, res } = createMocks({
        method: "GET",
        query: { id: "sensitive-error-trigger" },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).not.toContain("sensitive information");

      (process.env as { NODE_ENV: string }).NODE_ENV = originalEnv;
    });
  });

  // CORS テスト
  describe("CORS", () => {
    it("should handle preflight requests", async () => {
      const { req, res } = createMocks({
        method: "OPTIONS",
        headers: {
          origin: "https://example.com",
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
        },
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()).toHaveProperty("access-control-allow-origin");
      expect(res._getHeaders()).toHaveProperty("access-control-allow-methods");
      expect(res._getHeaders()).toHaveProperty("access-control-allow-headers");
    });

    it("should set CORS headers for actual requests", async () => {
      const { req, res } = createMocks({
        method: "GET",
        query: { id: "1" },
        headers: {
          origin: "https://allowed-origin.com",
        },
      });

      await handler(req, res);

      expect(res._getHeaders()).toHaveProperty("access-control-allow-origin");
    });
  });
});
