import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();
  });

  it("returns initial value when localStorage is empty", () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "initial-value"),
    );

    expect(result.current[0]).toBe("initial-value");
  });

  it("returns stored value from localStorage", () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify("stored-value"));

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "initial-value"),
    );

    expect(result.current[0]).toBe("stored-value");
  });

  it("saves value to localStorage when setValue is called", () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "initial-value"),
    );

    act(() => {
      result.current[1]("new-value");
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify("new-value"),
    );
    expect(result.current[0]).toBe("new-value");
  });

  it("handles function updates", () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(5));

    const { result } = renderHook(() => useLocalStorage("test-key", 0));

    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });

    expect(result.current[0]).toBe(6);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "test-key",
      JSON.stringify(6),
    );
  });

  it("handles JSON parsing errors gracefully", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    localStorageMock.getItem.mockReturnValue("invalid-json");

    const { result } = renderHook(() =>
      useLocalStorage("test-key", "fallback"),
    );

    expect(result.current[0]).toBe("fallback");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles localStorage setItem errors gracefully", () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

    act(() => {
      result.current[1]("new-value");
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(result.current[0]).toBe("new-value"); // State should still update

    consoleSpy.mockRestore();
  });
});
