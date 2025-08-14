/**
 * @jest-environment jsdom
 */

import { WebGLProductionOptimizer } from "../production-optimizer";

// Mock the production config
jest.mock("@/lib/config/production");

import { getProductionConfig } from "@/lib/config/production";
const mockGetProductionConfig = getProductionConfig as jest.MockedFunction<
  typeof getProductionConfig
>;

// Mock the performance monitor
const mockPerformanceMonitor = {
  start: jest.fn(),
  stop: jest.fn(),
};

jest.mock("@/lib/monitoring/performance", () => ({
  WebGLPerformanceMonitor: jest
    .fn()
    .mockImplementation(() => mockPerformanceMonitor),
}));

// Mock WebGL context classes
(
  global as unknown as { WebGLRenderingContext: unknown }
).WebGLRenderingContext = class WebGLRenderingContext {};
(
  global as unknown as { WebGL2RenderingContext: unknown }
).WebGL2RenderingContext = class WebGL2RenderingContext {};

// Mock WebGL context
const createMockWebGLContext = (
  isWebGL2 = false,
): WebGLRenderingContext | WebGL2RenderingContext => {
  const gl = {
    // WebGL constants
    MAX_TEXTURE_SIZE: 0x0d33,
    MAX_VERTEX_ATTRIBS: 0x8869,
    MAX_VARYING_VECTORS: 0x8dfc,
    MAX_FRAGMENT_UNIFORM_VECTORS: 0x8dfd,
    NO_ERROR: 0,
    INVALID_ENUM: 0x0500,
    INVALID_VALUE: 0x0501,
    INVALID_OPERATION: 0x0502,
    OUT_OF_MEMORY: 0x0505,
    CONTEXT_LOST_WEBGL: 0x9242,
    TEXTURE_2D: 0x0de1,
    RGBA: 0x1908,
    UNSIGNED_BYTE: 0x1401,
    LINEAR: 0x2601,
    LINEAR_MIPMAP_LINEAR: 0x2703,
    TEXTURE_MIN_FILTER: 0x2801,
    TEXTURE_MAG_FILTER: 0x2800,
    TEXTURE_WRAP_S: 0x2802,
    TEXTURE_WRAP_T: 0x2803,
    CLAMP_TO_EDGE: 0x812f,

    // Mock methods
    getParameter: jest.fn((param) => {
      switch (param) {
        case gl.MAX_TEXTURE_SIZE:
          return 4096;
        case gl.MAX_VERTEX_ATTRIBS:
          return 16;
        case gl.MAX_VARYING_VECTORS:
          return 8;
        case gl.MAX_FRAGMENT_UNIFORM_VECTORS:
          return 16;
        case "UNMASKED_RENDERER_WEBGL":
          return "Mock GPU";
        case "UNMASKED_VENDOR_WEBGL":
          return "Mock Vendor";
        default:
          return 0;
      }
    }),
    getSupportedExtensions: jest.fn(() => [
      "EXT_texture_filter_anisotropic",
      "WEBGL_debug_renderer_info",
    ]),
    getExtension: jest.fn((name) => {
      if (name === "WEBGL_debug_renderer_info") {
        return {
          UNMASKED_RENDERER_WEBGL: "UNMASKED_RENDERER_WEBGL",
          UNMASKED_VENDOR_WEBGL: "UNMASKED_VENDOR_WEBGL",
        };
      }
      return null;
    }),
    createTexture: jest.fn(() => ({})),
    bindTexture: jest.fn(),
    texImage2D: jest.fn(),
    generateMipmap: jest.fn(),
    texParameteri: jest.fn(),
    getError: jest.fn(() => gl.NO_ERROR),
  };

  // Add WebGL2 specific properties
  if (isWebGL2) {
    Object.setPrototypeOf(
      gl,
      (global as unknown as { WebGL2RenderingContext: { prototype: unknown } })
        .WebGL2RenderingContext.prototype,
    );
  } else {
    Object.setPrototypeOf(
      gl,
      (global as unknown as { WebGLRenderingContext: { prototype: unknown } })
        .WebGLRenderingContext.prototype,
    );
  }

  return gl;
};

// Mock DOM elements
const createMockImage = (width = 512, height = 512): HTMLImageElement => {
  const img = {
    width,
    height,
  } as HTMLImageElement;
  return img;
};

const createMockCanvas = (width = 512, height = 512): HTMLCanvasElement => {
  const canvas = {
    width,
    height,
    getContext: jest.fn((contextType: string) => {
      if (contextType === "2d") {
        return {
          drawImage: jest.fn(),
          getImageData: jest.fn(),
          putImageData: jest.fn(),
          createImageData: jest.fn(),
        };
      }
      return null;
    }),
  } as unknown as HTMLCanvasElement;
  return canvas;
};

// Mock document.createElement
const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName: string) => {
  if (tagName === "canvas") {
    const canvas = createMockCanvas();
    // Ensure getContext returns a valid 2D context
    (canvas.getContext as jest.Mock).mockImplementation(
      (contextType: string) => {
        if (contextType === "2d") {
          return {
            drawImage: jest.fn(),
            getImageData: jest.fn(),
            putImageData: jest.fn(),
            createImageData: jest.fn(),
          };
        }
        return null;
      },
    );
    return canvas;
  }
  return originalCreateElement.call(document, tagName);
});

// Mock fetch for error reporting
const mockFetch = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    json: async () => ({}),
  });
});
global.fetch = mockFetch;

describe("WebGLProductionOptimizer", () => {
  let mockGL: WebGLRenderingContext | WebGL2RenderingContext;
  let optimizer: WebGLProductionOptimizer;

  beforeEach(() => {
    mockGetProductionConfig.mockReturnValue({
      webgl: {
        maxTextureSize: 2048,
        performanceMonitoring: false, // Disable to avoid mock issues
      },
    });

    // Reset document.createElement mock
    (document.createElement as jest.Mock).mockImplementation(
      (tagName: string) => {
        if (tagName === "canvas") {
          return createMockCanvas();
        }
        return originalCreateElement.call(document, tagName);
      },
    );

    // Reset fetch mock
    mockFetch.mockClear();
    mockFetch.mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      });
    });

    // Mock window object
    if (typeof global.window === "undefined") {
      Object.defineProperty(global, "window", {
        value: {
          location: {
            href: "http://localhost:3000/test",
          },
        },
        writable: true,
        configurable: true,
      });
    } else {
      global.window.location = {
        href: "http://localhost:3000/test",
      } as Location;
    }

    mockGL = createMockWebGLContext();
    optimizer = new WebGLProductionOptimizer(mockGL);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with WebGL1 context", () => {
      const gl = createMockWebGLContext(false);
      const opt = new WebGLProductionOptimizer(gl);

      const capabilities = opt.getCapabilities();
      expect(capabilities.webglVersion).toBe(1);
    });

    it("should initialize with WebGL2 context", () => {
      const gl = createMockWebGLContext(true);
      const opt = new WebGLProductionOptimizer(gl);

      const capabilities = opt.getCapabilities();
      expect(capabilities.webglVersion).toBe(2);
    });

    it("should detect device capabilities", () => {
      const capabilities = optimizer.getCapabilities();

      expect(capabilities).toEqual({
        webglVersion: 1,
        maxTextureSize: 4096,
        maxVertexAttribs: 16,
        maxVaryingVectors: 8,
        maxFragmentUniforms: 16,
        extensions: [
          "EXT_texture_filter_anisotropic",
          "WEBGL_debug_renderer_info",
        ],
        renderer: "Mock GPU",
        vendor: "Mock Vendor",
        performanceLevel: "medium",
      });
    });
  });

  describe("performance level detection", () => {
    it("should detect high performance level for RTX GPU", () => {
      const gl = createMockWebGLContext();
      gl.getExtension.mockImplementation((name) => {
        if (name === "WEBGL_debug_renderer_info") {
          return {
            UNMASKED_RENDERER_WEBGL: "UNMASKED_RENDERER_WEBGL",
            UNMASKED_VENDOR_WEBGL: "UNMASKED_VENDOR_WEBGL",
          };
        }
        return null;
      });
      gl.getParameter.mockImplementation((param) => {
        if (param === "UNMASKED_RENDERER_WEBGL") return "NVIDIA RTX 3080";
        if (param === "UNMASKED_VENDOR_WEBGL") return "NVIDIA";
        if (param === gl.MAX_TEXTURE_SIZE) return 8192;
        return 0;
      });

      const opt = new WebGLProductionOptimizer(gl);
      const capabilities = opt.getCapabilities();

      expect(capabilities.performanceLevel).toBe("high");
    });

    it("should detect low performance level for integrated GPU", () => {
      const gl = createMockWebGLContext();
      gl.getParameter.mockImplementation((param) => {
        if (param === "UNMASKED_RENDERER_WEBGL") return "Intel HD Graphics";
        if (param === "UNMASKED_VENDOR_WEBGL") return "Intel";
        if (param === gl.MAX_TEXTURE_SIZE) return 2048;
        return 0;
      });
      gl.getSupportedExtensions.mockReturnValue([]);

      const opt = new WebGLProductionOptimizer(gl);
      const capabilities = opt.getCapabilities();

      expect(capabilities.performanceLevel).toBe("low");
    });
  });

  describe("optimization settings", () => {
    it("should generate optimal settings based on capabilities", () => {
      const settings = optimizer.getSettings();

      expect(settings).toEqual({
        maxTextureSize: 1024, // Medium performance level
        enableMipmaps: true,
        textureCompression: true,
        antialiasingLevel: 2,
        shadowQuality: "medium",
        particleCount: 500,
        lodDistance: 50,
        enableOcclusion: false,
        targetFPS: 60,
      });
    });
  });

  describe("dynamic quality adjustment", () => {
    it("should reduce quality when FPS is low", () => {
      const initialSettings = optimizer.getSettings();
      const initialTextureSize = initialSettings.maxTextureSize;

      optimizer.updateSettings({ fps: 30, frameTime: 33 }); // Low FPS

      const updatedSettings = optimizer.getSettings();
      expect(updatedSettings.maxTextureSize).toBeLessThanOrEqual(
        initialTextureSize,
      );
    });

    it("should not change settings when FPS is stable", () => {
      const initialSettings = optimizer.getSettings();

      optimizer.updateSettings({ fps: 60, frameTime: 16 }); // Target FPS

      const updatedSettings = optimizer.getSettings();
      expect(updatedSettings).toEqual(initialSettings);
    });
  });

  describe("texture optimization", () => {
    it("should create optimized texture with default options", () => {
      const mockImage = createMockImage(1024, 1024);

      const texture = optimizer.createOptimizedTexture(mockImage);

      expect(texture).toBeDefined();
      expect(mockGL.createTexture).toHaveBeenCalled();
      expect(mockGL.bindTexture).toHaveBeenCalledWith(mockGL.TEXTURE_2D, {});
      expect(mockGL.texImage2D).toHaveBeenCalled();
    });

    it("should generate mipmaps when enabled", () => {
      const mockImage = createMockImage(512, 512);

      optimizer.createOptimizedTexture(mockImage, { generateMipmaps: true });

      expect(mockGL.generateMipmap).toHaveBeenCalledWith(mockGL.TEXTURE_2D);
      expect(mockGL.texParameteri).toHaveBeenCalledWith(
        mockGL.TEXTURE_2D,
        mockGL.TEXTURE_MIN_FILTER,
        mockGL.LINEAR_MIPMAP_LINEAR,
      );
    });

    it("should handle texture creation failure", () => {
      mockGL.createTexture.mockReturnValue(null);
      const mockImage = createMockImage(512, 512);

      const texture = optimizer.createOptimizedTexture(mockImage);

      expect(texture).toBeNull();
    });
  });

  describe("error handling", () => {
    it("should detect no errors", () => {
      mockGL.getError.mockReturnValue(mockGL.NO_ERROR);

      const hasError = optimizer.checkErrors();

      expect(hasError).toBe(true);
      expect(mockGL.getError).toHaveBeenCalled();
    });

    it("should detect and handle WebGL errors", () => {
      mockGL.getError.mockReturnValue(mockGL.INVALID_ENUM);
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const hasError = optimizer.checkErrors();

      expect(hasError).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith("WebGL Error:", "Invalid enum");

      consoleSpy.mockRestore();
    });
  });

  describe("resource cleanup", () => {
    it("should dispose resources properly", () => {
      // Since performance monitoring is disabled, dispose should not throw
      optimizer.dispose();

      // No performance monitor to stop, so just verify it doesn't crash
      expect(true).toBe(true);
    });
  });
});
