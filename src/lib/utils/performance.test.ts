import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  cacheManager,
  preloadResource,
  // ... other imports
} from './performance';

// Mock localStorage and document globally
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    get store() {
      return store;
    },
    set store(newStore: Record<string, string>) {
      store = newStore;
    },
    getItem: vi.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    hasOwnProperty: vi.fn((key: string) => key in store),
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

const appendChildSpy = vi.fn();
const createElementSpy = vi.fn(() => ({
  rel: '',
  href: '',
  as: '',
  crossOrigin: '',
}));

vi.stubGlobal('document', {
  createElement: createElementSpy,
  head: {
    appendChild: appendChildSpy,
  },
});

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.store = {};
    // Mock window object to ensure it's defined
    Object.defineProperty(global, 'window', {
      value: {
        localStorage: localStorageMock,
        sessionStorage: localStorageMock,
      },
      writable: true,
    });
    // Also mock localStorage directly
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    // Mock document directly
    Object.defineProperty(global, 'document', {
      value: {
        createElement: createElementSpy,
        head: {
          appendChild: appendChildSpy,
        },
      },
      writable: true,
    });
  });

  describe('cacheManager', () => {
    it('should set and get from cache', () => {
      const key = 'test';
      const data = { a: 1 };

      cacheManager.setCache(key, data);

      expect(cacheManager.getCache(key)).toEqual(data);
    });
  });

  describe('preloadResource', () => {
    it('should append a link element to head', () => {
      preloadResource('/test.css', 'style');
      expect(createElementSpy).toHaveBeenCalledWith('link');
      expect(appendChildSpy).toHaveBeenCalled();
    });
  });

  // ... other tests
});
