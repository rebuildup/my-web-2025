import type {
  AsyncState,
  CacheItem,
  ColorInfo,
  ColorPalette,
  FormField,
  GridSystemConfig,
  ImageOptimizationConfig,
  LazyComponentConfig,
  PartialBy,
  RequiredBy,
  ToolConfig,
  ValidationResult,
} from "../utils";
import {
  assertNever,
  getEnvVar,
  getKeys,
  isErrorState,
  isLoadingState,
  isSuccessState,
} from "../utils";

describe("types/utils", () => {
  describe("AsyncState type guards", () => {
    describe("isLoadingState", () => {
      it("should return true for loading state", () => {
        const state: AsyncState<string> = { status: "loading" };
        expect(isLoadingState(state)).toBe(true);
      });

      it("should return false for non-loading states", () => {
        expect(isLoadingState({ status: "idle" })).toBe(false);
        expect(isLoadingState({ status: "success", data: "test" })).toBe(false);
        expect(isLoadingState({ status: "error", error: "test error" })).toBe(
          false,
        );
      });
    });

    describe("isSuccessState", () => {
      it("should return true for success state", () => {
        const state: AsyncState<string> = {
          status: "success",
          data: "test data",
        };
        expect(isSuccessState(state)).toBe(true);

        if (isSuccessState(state)) {
          expect(state.data).toBe("test data");
        }
      });

      it("should return false for non-success states", () => {
        expect(isSuccessState({ status: "idle" })).toBe(false);
        expect(isSuccessState({ status: "loading" })).toBe(false);
        expect(isSuccessState({ status: "error", error: "test error" })).toBe(
          false,
        );
      });
    });

    describe("isErrorState", () => {
      it("should return true for error state", () => {
        const state: AsyncState<string> = {
          status: "error",
          error: "test error",
        };
        expect(isErrorState(state)).toBe(true);

        if (isErrorState(state)) {
          expect(state.error).toBe("test error");
        }
      });

      it("should return false for non-error states", () => {
        expect(isErrorState({ status: "idle" })).toBe(false);
        expect(isErrorState({ status: "loading" })).toBe(false);
        expect(isErrorState({ status: "success", data: "test" })).toBe(false);
      });
    });
  });

  describe("assertNever", () => {
    it("should throw error with unexpected value", () => {
      expect(() => {
        assertNever("unexpected" as never);
      }).toThrow("Unexpected value: unexpected");
    });

    it("should be used in exhaustive switch statements", () => {
      const handleState = (state: "loading" | "success" | "error") => {
        switch (state) {
          case "loading":
            return "Loading...";
          case "success":
            return "Success!";
          case "error":
            return "Error!";
          default:
            return assertNever(state);
        }
      };

      expect(handleState("loading")).toBe("Loading...");
      expect(handleState("success")).toBe("Success!");
      expect(handleState("error")).toBe("Error!");
    });
  });

  describe("getKeys", () => {
    it("should return type-safe object keys", () => {
      const obj = {
        name: "John",
        age: 30,
        active: true,
      };

      const keys = getKeys(obj);

      expect(keys).toEqual(["name", "age", "active"]);
      expect(keys).toHaveLength(3);
    });

    it("should work with empty object", () => {
      const obj = {};
      const keys = getKeys(obj);

      expect(keys).toEqual([]);
      expect(keys).toHaveLength(0);
    });

    it("should preserve key types", () => {
      const obj = {
        stringKey: "value",
        numberKey: 123,
      };

      const keys = getKeys(obj);

      // TypeScript should infer the correct key types
      keys.forEach((key) => {
        expect(["stringKey", "numberKey"]).toContain(key);
      });
    });
  });

  describe("getEnvVar", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("should return environment variable value", () => {
      process.env.NODE_ENV = "test";

      expect(getEnvVar("NODE_ENV")).toBe("test");
    });

    it("should throw error for undefined environment variable", () => {
      delete process.env.NODE_ENV;

      expect(() => {
        getEnvVar("NODE_ENV");
      }).toThrow("Environment variable NODE_ENV is not defined");
    });

    it("should work with custom environment variables", () => {
      process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

      expect(getEnvVar("NEXT_PUBLIC_APP_URL")).toBe("https://example.com");
    });
  });

  describe("interface validations", () => {
    describe("LazyComponentConfig", () => {
      it("should accept valid lazy component config", () => {
        const config: LazyComponentConfig = {
          component: {} as React.LazyExoticComponent<
            React.ComponentType<Record<string, unknown>>
          >,
          fallback: () => null,
          errorBoundary: () => null,
        };

        expect(config.component).toBeDefined();
        expect(typeof config.fallback).toBe("function");
        expect(typeof config.errorBoundary).toBe("function");
      });
    });

    describe("ImageOptimizationConfig", () => {
      it("should accept valid image optimization config", () => {
        const config: ImageOptimizationConfig = {
          width: 800,
          height: 600,
          quality: 80,
          format: "webp",
          placeholder: "blur",
          blurDataURL: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
        };

        expect(config.width).toBe(800);
        expect(config.height).toBe(600);
        expect(config.quality).toBe(80);
        expect(config.format).toBe("webp");
        expect(config.placeholder).toBe("blur");
      });

      it("should accept partial config", () => {
        const config: ImageOptimizationConfig = {
          width: 400,
          format: "jpg",
        };

        expect(config.width).toBe(400);
        expect(config.format).toBe("jpg");
        expect(config.height).toBeUndefined();
      });
    });

    describe("CacheItem", () => {
      it("should accept cache item with generic data", () => {
        const cacheItem: CacheItem<string> = {
          data: "cached data",
          timestamp: Date.now(),
          ttl: 3600000, // 1 hour
        };

        expect(cacheItem.data).toBe("cached data");
        expect(typeof cacheItem.timestamp).toBe("number");
        expect(cacheItem.ttl).toBe(3600000);
      });

      it("should accept cache item with object data", () => {
        const cacheItem: CacheItem<{ id: string; name: string }> = {
          data: { id: "1", name: "Test" },
          timestamp: Date.now(),
          ttl: 1800000, // 30 minutes
        };

        expect(cacheItem.data.id).toBe("1");
        expect(cacheItem.data.name).toBe("Test");
      });
    });

    describe("ValidationResult", () => {
      it("should accept valid validation result", () => {
        const result: ValidationResult = {
          isValid: true,
        };

        expect(result.isValid).toBe(true);
        expect(result.errors).toBeUndefined();
        expect(result.error).toBeUndefined();
      });

      it("should accept invalid validation result with errors", () => {
        const result: ValidationResult = {
          isValid: false,
          errors: ["Field is required", "Invalid format"],
          error: "Validation failed",
        };

        expect(result.isValid).toBe(false);
        expect(result.errors).toEqual(["Field is required", "Invalid format"]);
        expect(result.error).toBe("Validation failed");
      });
    });

    describe("ColorInfo", () => {
      it("should accept valid color info", () => {
        const color: ColorInfo = {
          hex: "#ff0000",
          rgb: { r: 255, g: 0, b: 0 },
          hsl: { h: 0, s: 100, l: 50 },
          hsv: { h: 0, s: 100, v: 100 },
        };

        expect(color.hex).toBe("#ff0000");
        expect(color.rgb.r).toBe(255);
        expect(color.hsl.s).toBe(100);
        expect(color.hsv.v).toBe(100);
      });
    });

    describe("ColorPalette", () => {
      it("should accept valid color palette", () => {
        const palette: ColorPalette = {
          id: "palette-1",
          name: "Primary Colors",
          colors: [
            {
              hex: "#ff0000",
              rgb: { r: 255, g: 0, b: 0 },
              hsl: { h: 0, s: 100, l: 50 },
              hsv: { h: 0, s: 100, v: 100 },
            },
          ],
          createdAt: "2023-01-01T00:00:00Z",
        };

        expect(palette.id).toBe("palette-1");
        expect(palette.name).toBe("Primary Colors");
        expect(palette.colors).toHaveLength(1);
        expect(palette.colors[0].hex).toBe("#ff0000");
      });
    });

    describe("ToolConfig", () => {
      it("should accept valid tool config", () => {
        const config: ToolConfig = {
          id: "tool-1",
          name: "Color Picker",
          description: "A tool for picking colors",
          category: "design",
          settings: {
            defaultFormat: "hex",
            showAlpha: true,
          },
          accessibility: {
            keyboardShortcuts: {
              "ctrl+c": "Copy color",
              "ctrl+v": "Paste color",
            },
            ariaLabels: {
              colorInput: "Color input field",
              copyButton: "Copy color to clipboard",
            },
            screenReaderSupport: true,
          },
        };

        expect(config.id).toBe("tool-1");
        expect(config.name).toBe("Color Picker");
        expect(config.accessibility.screenReaderSupport).toBe(true);
        expect(config.settings.defaultFormat).toBe("hex");
      });
    });

    describe("GridSystemConfig", () => {
      it("should accept valid grid system config", () => {
        const config: GridSystemConfig = {
          base: 384,
          breakpoints: {
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
          },
          ratios: {
            golden: 1.618,
            xs: 0.75,
            sm: 0.875,
            base: 1,
            lg: 1.125,
            xl: 1.25,
          },
        };

        expect(config.base).toBe(384);
        expect(config.breakpoints.md).toBe(768);
        expect(config.ratios.golden).toBe(1.618);
      });
    });

    describe("FormField", () => {
      it("should accept string form field", () => {
        const field: FormField<string> = {
          value: "test value",
          error: "Field is required",
          touched: true,
          required: true,
        };

        expect(field.value).toBe("test value");
        expect(field.error).toBe("Field is required");
        expect(field.touched).toBe(true);
        expect(field.required).toBe(true);
      });

      it("should accept number form field", () => {
        const field: FormField<number> = {
          value: 42,
          touched: false,
        };

        expect(field.value).toBe(42);
        expect(field.touched).toBe(false);
        expect(field.error).toBeUndefined();
        expect(field.required).toBeUndefined();
      });
    });

    describe("PartialBy utility type", () => {
      it("should make specific properties optional", () => {
        interface User {
          id: string;
          name: string;
          email: string;
          age: number;
        }

        type UserWithOptionalEmail = PartialBy<User, "email">;

        const user: UserWithOptionalEmail = {
          id: "1",
          name: "John",
          age: 30,
          // email is optional
        };

        expect(user.id).toBe("1");
        expect(user.name).toBe("John");
        expect(user.age).toBe(30);
      });
    });

    describe("RequiredBy utility type", () => {
      it("should make specific properties required", () => {
        interface User {
          id: string;
          name: string;
          email?: string;
          age?: number;
        }

        type UserWithRequiredEmail = RequiredBy<User, "email">;

        const user: UserWithRequiredEmail = {
          id: "1",
          name: "John",
          email: "john@example.com", // now required
          // age is still optional
        };

        expect(user.id).toBe("1");
        expect(user.email).toBe("john@example.com");
      });
    });
  });
});
