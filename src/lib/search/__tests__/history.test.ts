/**
 * @jest-environment jsdom
 */

import {
  addToSearchHistory,
  getPopularSearches,
  getRecentSearches,
  getSearchHistory,
  searchHistory,
} from "../history";

describe("Search History Management", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("basic functionality", () => {
    it("should return empty array when no history exists", () => {
      const history = getSearchHistory();
      expect(history).toEqual([]);
    });

    it("should return empty array for recent searches when no history", () => {
      const recent = getRecentSearches();
      expect(recent).toEqual([]);
    });

    it("should return empty array for popular searches when no history", () => {
      const popular = getPopularSearches();
      expect(popular).toEqual([]);
    });

    it("should return empty array for search history when no query", () => {
      const results = searchHistory("");
      expect(results).toEqual([]);
    });

    it("should return empty array for search history when no matches", () => {
      const results = searchHistory("nonexistent");
      expect(results).toEqual([]);
    });

    it("should handle localStorage being null", () => {
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, "localStorage", {
        value: null,
        writable: true,
      });

      addToSearchHistory("test", 10);
      expect(console.error).toHaveBeenCalled();

      Object.defineProperty(window, "localStorage", {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it("should handle server environment", () => {
      const originalWindow = global.window;
      delete (global as unknown as { window?: unknown }).window;

      const history = getSearchHistory();
      expect(history).toEqual([]);

      global.window = originalWindow;
    });
  });
});
