// Test setup file for vitest
import '@testing-library/jest-dom';

// Mock Next.js router
import { vi, beforeAll, afterAll, afterEach } from 'vitest';

vi.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    beforePopState: vi.fn(),
    events: {
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
    },
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
Object.defineProperty(global, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Setup console warnings suppression for tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: Each child in a list should have a unique'))
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

import { createCanvas } from 'canvas';

// Patch HTMLCanvasElement for jsdom (for tests that use canvas)
if (typeof window !== 'undefined' && window.HTMLCanvasElement) {
  // @ts-expect-error: Patching HTMLCanvasElement for jsdom environment
  window.HTMLCanvasElement.prototype.getContext = function (contextType: string) {
    const canvas = createCanvas(this.width, this.height);
    if (contextType === '2d') {
      return canvas.getContext('2d');
    }
    return null;
  };
  window.HTMLCanvasElement.prototype.toDataURL = function toDataURL() {
    const canvas = createCanvas(this.width, this.height);
    return canvas.toDataURL();
  };
}
