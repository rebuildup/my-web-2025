/**
 * モックファクトリーのテスト
 */

import {
  createMockApiResponse,
  createMockErrorResponse,
  createMockFetch,
  createMockIntersectionObserver,
  createMockLocalStorage,
  createMockPortfolioItem,
  createMockResizeObserver,
  createMockResponse,
  createMockRouter,
  createMockUser,
  setupAllMocks,
} from "../mock-factories";

describe("Mock Factories", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("createMockUser", () => {
    it("should create a mock user with default values", () => {
      const user = createMockUser();

      expect(user).toMatchObject({
        name: "Test User",
        email: "test@example.com",
        role: "user",
      });
      expect(user.id).toMatch(/^user-/);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a mock user with overrides", () => {
      const overrides = {
        name: "Custom User",
        role: "admin" as const,
      };

      const user = createMockUser(overrides);

      expect(user.name).toBe("Custom User");
      expect(user.role).toBe("admin");
      expect(user.email).toBe("test@example.com"); // default value
    });
  });

  describe("createMockPortfolioItem", () => {
    it("should create a mock portfolio item with default values", () => {
      const item = createMockPortfolioItem();

      expect(item).toMatchObject({
        title: "Test Portfolio Item",
        description: "This is a test portfolio item description",
        category: "web-development",
        tags: ["react", "typescript", "nextjs"],
        imageUrl: "/test-image.jpg",
        featured: false,
      });
      expect(item.id).toMatch(/^portfolio-/);
      expect(item.createdAt).toBeInstanceOf(Date);
    });

    it("should create a mock portfolio item with overrides", () => {
      const overrides = {
        title: "Custom Portfolio",
        featured: true,
        tags: ["vue", "javascript"],
      };

      const item = createMockPortfolioItem(overrides);

      expect(item.title).toBe("Custom Portfolio");
      expect(item.featured).toBe(true);
      expect(item.tags).toEqual(["vue", "javascript"]);
    });
  });

  describe("createMockApiResponse", () => {
    it("should create a successful API response", () => {
      const data = { message: "Success" };
      const response = createMockApiResponse(data);

      expect(response).toEqual({
        success: true,
        data,
        statusCode: 200,
        message: "Success",
      });
    });

    it("should create an API response with overrides", () => {
      const data = { id: 1 };
      const overrides = {
        statusCode: 201,
        message: "Created",
      };

      const response = createMockApiResponse(data, overrides);

      expect(response).toEqual({
        success: true,
        data,
        statusCode: 201,
        message: "Created",
      });
    });
  });

  describe("createMockErrorResponse", () => {
    it("should create an error response with default values", () => {
      const response = createMockErrorResponse();

      expect(response).toEqual({
        success: false,
        error: "Test error",
        statusCode: 400,
        message: "Error occurred",
      });
    });

    it("should create an error response with custom values", () => {
      const response = createMockErrorResponse("Custom error", 500);

      expect(response).toEqual({
        success: false,
        error: "Custom error",
        statusCode: 500,
        message: "Error occurred",
      });
    });
  });

  describe("createMockRouter", () => {
    it("should create a mock router with default methods", () => {
      const router = createMockRouter();

      expect(router).toMatchObject({
        push: expect.any(Function),
        replace: expect.any(Function),
        back: expect.any(Function),
        forward: expect.any(Function),
        refresh: expect.any(Function),
        prefetch: expect.any(Function),
        pathname: "/",
        query: {},
        asPath: "/",
        route: "/",
      });
    });

    it("should create a mock router with overrides", () => {
      const overrides = {
        pathname: "/custom",
        query: { id: "123" },
      };

      const router = createMockRouter(overrides);

      expect(router.pathname).toBe("/custom");
      expect(router.query).toEqual({ id: "123" });
    });
  });

  describe("createMockFetch", () => {
    it("should create a mock fetch with default response", () => {
      const mockFetch = createMockFetch();

      expect(global.fetch).toBe(mockFetch);
      expect(mockFetch).toHaveBeenCalledTimes(0);
    });

    it("should create a mock fetch with custom responses", async () => {
      const responses = [
        {
          url: "/api/test",
          response: createMockResponse({ success: true }),
        },
      ];

      const mockFetch = createMockFetch(responses);

      const result = await mockFetch("/api/test");
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");
    });
  });

  describe("createMockLocalStorage", () => {
    it("should create a mock localStorage", () => {
      const storage = createMockLocalStorage({ key1: "value1" });

      expect(storage.getItem("key1")).toBe("value1");
      expect(storage.length).toBe(1);

      storage.setItem("key2", "value2");
      expect(storage.getItem("key2")).toBe("value2");
      expect(storage.length).toBe(2);

      storage.removeItem("key1");
      expect(storage.getItem("key1")).toBeNull();
      expect(storage.length).toBe(1);

      storage.clear();
      expect(storage.length).toBe(0);
    });
  });

  describe("createMockIntersectionObserver", () => {
    it("should create a mock IntersectionObserver", () => {
      const MockObserver = createMockIntersectionObserver(true);

      const callback = jest.fn();
      const observer = new MockObserver(callback);

      expect(observer).toMatchObject({
        observe: expect.any(Function),
        unobserve: expect.any(Function),
        disconnect: expect.any(Function),
      });

      // コールバックが呼ばれることを確認
      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith([
          expect.objectContaining({
            isIntersecting: true,
            intersectionRatio: 1,
          }),
        ]);
      }, 10);
    });
  });

  describe("createMockResizeObserver", () => {
    it("should create a mock ResizeObserver", () => {
      const MockObserver = createMockResizeObserver({
        width: 200,
        height: 100,
      });

      const callback = jest.fn();
      const observer = new MockObserver(callback);

      expect(observer).toMatchObject({
        observe: expect.any(Function),
        unobserve: expect.any(Function),
        disconnect: expect.any(Function),
      });

      // コールバックが呼ばれることを確認
      setTimeout(() => {
        expect(callback).toHaveBeenCalledWith(
          [
            expect.objectContaining({
              contentRect: expect.objectContaining({
                width: 200,
                height: 100,
              }),
            }),
          ],
          observer,
        );
      }, 10);
    });
  });

  describe("setupAllMocks", () => {
    it("should setup all global mocks", () => {
      const { cleanup } = setupAllMocks();

      expect(global.IntersectionObserver).toBeDefined();
      expect(global.ResizeObserver).toBeDefined();
      expect(global.PerformanceObserver).toBeDefined();
      expect(window.localStorage).toBeDefined();
      expect(window.sessionStorage).toBeDefined();
      expect(global.fetch).toBeDefined();

      // クリーンアップが関数であることを確認
      expect(typeof cleanup).toBe("function");

      // クリーンアップを実行
      cleanup();
    });
  });
});
