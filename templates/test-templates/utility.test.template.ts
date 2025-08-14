// import { createTestData } from "@/test-utils/mock-factories";
import { utilityFunction } from "../utility-function";

describe("utilityFunction", () => {
  // 正常系テスト
  describe("Normal Cases", () => {
    it("should return expected result for valid input", () => {
      const input = "test data"; // createTestData();
      const result = utilityFunction(input);
      expect(result).toBe("expected output");
    });

    it("should handle multiple valid inputs", () => {
      const testCases = [
        { input: "test1", expected: "result1" },
        { input: "test2", expected: "result2" },
        { input: "test3", expected: "result3" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(utilityFunction(input)).toBe(expected);
      });
    });

    it("should be idempotent", () => {
      const input = "test data"; // createTestData();
      const result1 = utilityFunction(input);
      const result2 = utilityFunction(input);
      expect(result1).toEqual(result2);
    });
  });

  // 境界値テスト
  describe("Boundary Cases", () => {
    it("should handle empty input", () => {
      expect(utilityFunction("")).toBe("");
    });

    it("should handle null input", () => {
      expect(utilityFunction(null)).toBe(null);
    });

    it("should handle undefined input", () => {
      expect(utilityFunction(undefined)).toBe(undefined);
    });

    it("should handle maximum length input", () => {
      const maxInput = "a".repeat(1000);
      expect(() => utilityFunction(maxInput)).not.toThrow();
    });

    it("should handle minimum value", () => {
      expect(utilityFunction(0)).toBe(0);
    });

    it("should handle maximum value", () => {
      const maxValue = Number.MAX_SAFE_INTEGER;
      expect(() => utilityFunction(maxValue)).not.toThrow();
    });
  });

  // 異常系テスト
  describe("Error Cases", () => {
    it("should throw error for invalid input type", () => {
      expect(() => utilityFunction(123 as unknown as string)).toThrow(
        "Invalid input type",
      );
    });

    it("should throw error for out of range input", () => {
      expect(() => utilityFunction(-1)).toThrow("Input out of range");
    });

    it("should handle network errors gracefully", async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error("Network error"));
      global.fetch = mockFetch;

      await expect(utilityFunction("test")).rejects.toThrow("Network error");
    });

    it("should validate input format", () => {
      const invalidFormats = ["", "   ", "invalid-format", "123abc"];

      invalidFormats.forEach((invalidInput) => {
        expect(() => utilityFunction(invalidInput)).toThrow();
      });
    });
  });

  // 非同期処理テスト
  describe("Async Operations", () => {
    beforeEach(() => {
      jest.clearAllTimers();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should resolve with correct value", async () => {
      const promise = utilityFunction("async-test");

      // タイマーを進める
      jest.advanceTimersByTime(1000);

      const result = await promise;
      expect(result).toBe("async-result");
    });

    it("should handle async errors", async () => {
      await expect(utilityFunction("error-trigger")).rejects.toThrow();
    });

    it("should timeout after specified duration", async () => {
      jest.setTimeout(5000);

      const promise = utilityFunction("timeout-test");
      jest.advanceTimersByTime(10000);

      await expect(promise).rejects.toThrow("Timeout");
    });

    it("should handle concurrent calls", async () => {
      const promises = [
        utilityFunction("concurrent-1"),
        utilityFunction("concurrent-2"),
        utilityFunction("concurrent-3"),
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      expect(results.every((result: unknown) => result !== undefined)).toBe(
        true,
      );
    });
  });

  // パフォーマンステスト
  describe("Performance", () => {
    it("should complete within acceptable time", () => {
      const start = performance.now();
      utilityFunction("performance-test");
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // 100ms以内
    });

    it("should handle large datasets efficiently", () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => i);

      const start = performance.now();
      utilityFunction(largeData);
      const end = performance.now();

      expect(end - start).toBeLessThan(1000); // 1秒以内
    });

    it("should not cause memory leaks", () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // 大量のデータを処理
      for (let i = 0; i < 1000; i++) {
        utilityFunction(`test-${i}`);
      }

      // ガベージコレクションを強制実行
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // メモリ増加が許容範囲内
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
    });
  });

  // 型安全性テスト
  describe("Type Safety", () => {
    it("should maintain type safety with TypeScript", () => {
      // TypeScriptの型チェックで検証される
      const result: string = utilityFunction("typed-input");
      expect(typeof result).toBe("string");
    });

    it("should handle generic types correctly", () => {
      const numberResult = utilityFunction<number>(123);
      const stringResult = utilityFunction<string>("test");

      expect(typeof numberResult).toBe("number");
      expect(typeof stringResult).toBe("string");
    });
  });

  // 副作用テスト
  describe("Side Effects", () => {
    it("should not modify input parameters", () => {
      const originalInput = { value: "test", nested: { prop: "nested" } };
      const inputCopy = JSON.parse(JSON.stringify(originalInput));

      utilityFunction(originalInput);

      expect(originalInput).toEqual(inputCopy);
    });

    it("should handle external dependencies correctly", () => {
      const mockDependency = jest.fn().mockReturnValue("mocked");

      // 依存関係を注入
      const result = utilityFunction("test", { dependency: mockDependency });

      expect(mockDependency).toHaveBeenCalled();
      expect(result).toContain("mocked");
    });
  });
});
