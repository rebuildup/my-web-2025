/**
 * モック作成ヘルパーとテストデータファクトリー
 * 要件7.4: 外部依存関係が適切にモック化され、テストが独立して実行されること
 */

import { jest } from "@jest/globals";

// 基本的なテストデータ型定義
export interface TestUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  createdAt: Date;
  updatedAt: Date;
}

export interface TestPortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  imageUrl: string;
  createdAt: Date;
  featured: boolean;
}

export interface TestApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
}

/**
 * ユーザーデータファクトリー
 */
export const createMockUser = (overrides: Partial<TestUser> = {}): TestUser => {
  const now = new Date();
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    name: "Test User",
    email: "test@example.com",
    role: "user",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

/**
 * ポートフォリオアイテムデータファクトリー
 */
export const createMockPortfolioItem = (
  overrides: Partial<TestPortfolioItem> = {},
): TestPortfolioItem => {
  const now = new Date();
  return {
    id: `portfolio-${Math.random().toString(36).substr(2, 9)}`,
    title: "Test Portfolio Item",
    description: "This is a test portfolio item description",
    category: "web-development",
    tags: ["react", "typescript", "nextjs"],
    imageUrl: "/test-image.jpg",
    createdAt: now,
    featured: false,
    ...overrides,
  };
};

/**
 * APIレスポンスデータファクトリー
 */
export const createMockApiResponse = <T>(
  data?: T,
  overrides: Partial<TestApiResponse<T>> = {},
): TestApiResponse<T> => {
  return {
    success: true,
    data,
    statusCode: 200,
    message: "Success",
    ...overrides,
  };
};

/**
 * エラーレスポンスデータファクトリー
 */
export const createMockErrorResponse = (
  error: string = "Test error",
  statusCode: number = 400,
): TestApiResponse => {
  return {
    success: false,
    error,
    statusCode,
    message: "Error occurred",
  };
};

/**
 * Next.js Routerモックファクトリー
 */
export const createMockRouter = (overrides: Record<string, unknown> = {}) => {
  return {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
    route: "/",
    ...overrides,
  };
};

/**
 * Next.js Requestモックファクトリー
 */
export const createMockRequest = (
  url: string = "http://localhost:3000/api/test",
  options: RequestInit = {},
): Request => {
  return new Request(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });
};

/**
 * Next.js Responseモックファクトリー
 */
export const createMockResponse = (
  body: unknown = {},
  init: ResponseInit = {},
): Response => {
  return new Response(JSON.stringify(body), {
    status: 200,
    statusText: "OK",
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });
};

/**
 * Fetchモックファクトリー
 */
export const createMockFetch = (
  responses: Array<{ url?: string; response: Response }> = [],
): jest.MockedFunction<typeof fetch> => {
  const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;

  if (responses.length === 0) {
    // デフォルトレスポンス
    mockFetch.mockResolvedValue(createMockResponse({ success: true }));
  } else {
    // URL-based responses
    const urlResponses = responses.filter((r) => r.url);
    const sequentialResponses = responses.filter((r) => !r.url);

    if (urlResponses.length > 0) {
      mockFetch.mockImplementation((input) => {
        const requestUrl =
          typeof input === "string" ? input : (input as Request).url;
        const matchingResponse = urlResponses.find(({ url }) =>
          requestUrl.includes(url!),
        );
        return Promise.resolve(
          matchingResponse?.response || createMockResponse({ success: true }),
        );
      });
    } else {
      // Sequential responses
      sequentialResponses.forEach(({ response }) => {
        mockFetch.mockResolvedValueOnce(response);
      });
    }
  }

  global.fetch = mockFetch;
  return mockFetch;
};

/**
 * ローカルストレージモックファクトリー
 */
export const createMockLocalStorage = (
  initialData: Record<string, string> = {},
): Storage => {
  const storage: Record<string, string> = { ...initialData };

  const mockStorage: Storage = {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    key: jest.fn((index: number) => Object.keys(storage)[index] || null),
    get length() {
      return Object.keys(storage).length;
    },
  };

  return mockStorage;
};

/**
 * IntersectionObserverモックファクトリー
 */
export const createMockIntersectionObserver = (
  isIntersecting: boolean = true,
): typeof IntersectionObserver => {
  const mockIntersectionObserver = jest.fn().mockImplementation((callback) => {
    const mockEntry = {
      isIntersecting,
      intersectionRatio: isIntersecting ? 1 : 0,
      target: document.createElement("div"),
      boundingClientRect: {
        top: 0,
        left: 0,
        bottom: 100,
        right: 100,
        width: 100,
        height: 100,
      },
      intersectionRect: isIntersecting
        ? {
            top: 0,
            left: 0,
            bottom: 100,
            right: 100,
            width: 100,
            height: 100,
          }
        : {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            width: 0,
            height: 0,
          },
      rootBounds: {
        top: 0,
        left: 0,
        bottom: 1000,
        right: 1000,
        width: 1000,
        height: 1000,
      },
      time: Date.now(),
    };

    // 即座にコールバックを実行
    setTimeout(
      () =>
        (callback as IntersectionObserverCallback)(
          [mockEntry as unknown as IntersectionObserverEntry],
          mockIntersectionObserver as unknown as IntersectionObserver,
        ),
      0,
    );

    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
  });

  return mockIntersectionObserver as unknown as typeof IntersectionObserver;
};

/**
 * ResizeObserverモックファクトリー
 */
export const createMockResizeObserver = (
  dimensions: { width: number; height: number } = { width: 100, height: 100 },
): typeof ResizeObserver => {
  const mockResizeObserver = jest.fn().mockImplementation((callback) => {
    const mockEntry = {
      target: document.createElement("div"),
      contentRect: {
        top: 0,
        left: 0,
        width: dimensions.width,
        height: dimensions.height,
        bottom: dimensions.height,
        right: dimensions.width,
      },
      borderBoxSize: [
        {
          blockSize: dimensions.height,
          inlineSize: dimensions.width,
        },
      ],
      contentBoxSize: [
        {
          blockSize: dimensions.height,
          inlineSize: dimensions.width,
        },
      ],
      devicePixelContentBoxSize: [
        {
          blockSize: dimensions.height,
          inlineSize: dimensions.width,
        },
      ],
    };

    // 即座にコールバックを実行
    setTimeout(
      () =>
        (callback as ResizeObserverCallback)(
          [mockEntry as unknown as ResizeObserverEntry],
          mockResizeObserver as unknown as ResizeObserver,
        ),
      0,
    );

    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
  });

  return mockResizeObserver as unknown as typeof ResizeObserver;
};

/**
 * PerformanceObserverモックファクトリー
 */
export const createMockPerformanceObserver = (
  entries: PerformanceEntry[] = [],
): typeof PerformanceObserver => {
  const mockPerformanceObserver = jest.fn().mockImplementation((callback) => {
    // 即座にコールバックを実行
    setTimeout(
      () =>
        (callback as PerformanceObserverCallback)(
          { getEntries: () => entries } as PerformanceObserverEntryList,
          mockPerformanceObserver as unknown as PerformanceObserver,
        ),
      0,
    );

    return {
      observe: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(() => entries),
    };
  });

  // supportedEntryTypesプロパティを追加
  Object.defineProperty(mockPerformanceObserver, "supportedEntryTypes", {
    value: ["largest-contentful-paint", "first-input", "layout-shift", "paint"],
    writable: false,
  });

  return mockPerformanceObserver as unknown as typeof PerformanceObserver;
};

/**
 * WebGL Contextモックファクトリー
 */
export const createMockWebGLContext = (): WebGLRenderingContext => {
  const mockContext = {
    canvas: document.createElement("canvas"),
    drawingBufferWidth: 300,
    drawingBufferHeight: 150,
    getContextAttributes: jest.fn(() => ({
      alpha: true,
      antialias: true,
      depth: true,
      desynchronized: false,
      failIfMajorPerformanceCaveat: false,
      powerPreference: "default",
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
      stencil: false,
    })),
    isContextLost: jest.fn(() => false),
    getSupportedExtensions: jest.fn(() => []),
    getExtension: jest.fn(() => null),
    activeTexture: jest.fn(),
    attachShader: jest.fn(),
    bindAttribLocation: jest.fn(),
    bindBuffer: jest.fn(),
    bindFramebuffer: jest.fn(),
    bindRenderbuffer: jest.fn(),
    bindTexture: jest.fn(),
    blendColor: jest.fn(),
    blendEquation: jest.fn(),
    blendEquationSeparate: jest.fn(),
    blendFunc: jest.fn(),
    blendFuncSeparate: jest.fn(),
    bufferData: jest.fn(),
    bufferSubData: jest.fn(),
    checkFramebufferStatus: jest.fn(() => 36053), // FRAMEBUFFER_COMPLETE
    clear: jest.fn(),
    clearColor: jest.fn(),
    clearDepth: jest.fn(),
    clearStencil: jest.fn(),
    colorMask: jest.fn(),
    compileShader: jest.fn(),
    createBuffer: jest.fn(() => ({})),
    createFramebuffer: jest.fn(() => ({})),
    createProgram: jest.fn(() => ({})),
    createRenderbuffer: jest.fn(() => ({})),
    createShader: jest.fn(() => ({})),
    createTexture: jest.fn(() => ({})),
    deleteBuffer: jest.fn(),
    deleteFramebuffer: jest.fn(),
    deleteProgram: jest.fn(),
    deleteRenderbuffer: jest.fn(),
    deleteShader: jest.fn(),
    deleteTexture: jest.fn(),
    depthFunc: jest.fn(),
    depthMask: jest.fn(),
    depthRange: jest.fn(),
    detachShader: jest.fn(),
    disable: jest.fn(),
    disableVertexAttribArray: jest.fn(),
    drawArrays: jest.fn(),
    drawElements: jest.fn(),
    enable: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    finish: jest.fn(),
    flush: jest.fn(),
    getParameter: jest.fn((param) => {
      switch (param) {
        case 7936:
          return "WebKit"; // VENDOR
        case 7937:
          return "WebKit WebGL"; // RENDERER
        case 7938:
          return "WebGL 1.0"; // VERSION
        default:
          return null;
      }
    }),
    getError: jest.fn(() => 0), // NO_ERROR
    getProgramParameter: jest.fn(() => true),
    getShaderParameter: jest.fn(() => true),
    getProgramInfoLog: jest.fn(() => ""),
    getShaderInfoLog: jest.fn(() => ""),
    linkProgram: jest.fn(),
    shaderSource: jest.fn(),
    useProgram: jest.fn(),
    validateProgram: jest.fn(),
    vertexAttribPointer: jest.fn(),
    viewport: jest.fn(),
  } as unknown as WebGLRenderingContext;

  return mockContext;
};

/**
 * 全てのモックをセットアップする統合ファクトリー
 */
export const setupAllMocks = () => {
  // グローバルオブジェクトのモック
  global.IntersectionObserver = createMockIntersectionObserver();
  global.ResizeObserver = createMockResizeObserver();
  global.PerformanceObserver = createMockPerformanceObserver();

  // ストレージのモック
  Object.defineProperty(window, "localStorage", {
    value: createMockLocalStorage(),
    writable: true,
  });

  Object.defineProperty(window, "sessionStorage", {
    value: createMockLocalStorage(),
    writable: true,
  });

  // Fetchのモック
  createMockFetch();

  return {
    cleanup: () => {
      jest.restoreAllMocks();
    },
  };
};
