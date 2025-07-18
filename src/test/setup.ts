// Test setup file for vitest
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';

// Mock jsdom environment properly
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
});

global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.history = dom.window.history;
global.localStorage = dom.window.localStorage;
global.sessionStorage = dom.window.sessionStorage;

// Mock window.location to prevent "Cannot redefine property: location" errors
try {
  Object.defineProperty(window, 'location', {
    value: {
      href: 'http://localhost',
      origin: 'http://localhost',
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      pathname: '/',
      search: '',
      hash: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    },
    writable: true,
    configurable: true,
  });
} catch {
  // Location already defined, skip
}

// Mock getComputedStyle
global.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(),
})) as unknown as typeof getComputedStyle;

// Mock Element.prototype methods
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  top: 0,
  right: 100,
  bottom: 100,
  left: 0,
  toJSON: () => ({}),
})) as unknown as typeof Element.prototype.getBoundingClientRect;

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
(
  global as typeof globalThis & {
    IntersectionObserver: typeof IntersectionObserver;
  }
).IntersectionObserver = class {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit;
  elements: Set<Element>;

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.options = options;
    this.elements = new Set();
  }

  observe(element: Element) {
    this.elements.add(element);
    // Simulate immediate intersection for tests with async behavior
    setTimeout(() => {
      if (this.callback) {
        this.callback(
          [
            {
              isIntersecting: true,
              intersectionRatio: 1,
              target: element,
              boundingClientRect: {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                top: 0,
                right: 100,
                bottom: 100,
                left: 0,
                toJSON: () => ({}),
              } as DOMRectReadOnly,
              intersectionRect: {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                top: 0,
                right: 100,
                bottom: 100,
                left: 0,
                toJSON: () => ({}),
              } as DOMRectReadOnly,
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ],
          this
        );
      }
    }, 0);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  get root() {
    return this.options?.root || null;
  }
  get rootMargin() {
    return this.options?.rootMargin || '';
  }
  get thresholds() {
    return Array.isArray(this.options?.threshold)
      ? this.options.threshold
      : [this.options?.threshold || 0];
  }
};

// Mock ResizeObserver
(
  global as typeof globalThis & {
    ResizeObserver: typeof ResizeObserver;
  }
).ResizeObserver = class {
  callback: ResizeObserverCallback;
  elements: Set<Element>;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    this.elements = new Set();
  }

  observe(element: Element) {
    this.elements.add(element);
    // Simulate immediate resize for tests
    setTimeout(() => {
      if (this.callback) {
        this.callback(
          [
            {
              target: element,
              contentRect: {
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                top: 0,
                right: 100,
                bottom: 100,
                left: 0,
                toJSON: () => ({}),
              } as DOMRectReadOnly,
              borderBoxSize: [{ blockSize: 100, inlineSize: 100 }] as ResizeObserverSize[],
              contentBoxSize: [{ blockSize: 100, inlineSize: 100 }] as ResizeObserverSize[],
              devicePixelContentBoxSize: [
                { blockSize: 100, inlineSize: 100 },
              ] as ResizeObserverSize[],
            } as ResizeObserverEntry,
          ],
          this
        );
      }
    }, 0);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }
};

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

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(() => {
    try {
      callback(performance.now());
    } catch {
      // Ignore errors in test environment
    }
  }, 0) as unknown as number;
});

// Mock cancelAnimationFrame
global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

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
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Enhanced canvas mocking for jsdom
if (typeof window !== 'undefined') {
  // Ensure document.body exists for tests
  if (!document.body) {
    document.body = document.createElement('body');
  }

  // Mock HTMLCanvasElement if it exists
  if (window.HTMLCanvasElement) {
    // Mock getContext method - temporarily disabled for type safety
    /*
    window.HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextType: string
    ): CanvasRenderingContext2D | null {
      if (contextType === '2d') {
        return {
          fillRect: vi.fn(),
          clearRect: vi.fn(),
          getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
          putImageData: vi.fn(),
          createImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
          drawImage: vi.fn(),
          save: vi.fn(),
          fillText: vi.fn(),
          restore: vi.fn(),
          beginPath: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          stroke: vi.fn(),
          translate: vi.fn(),
          scale: vi.fn(),
          rotate: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          measureText: vi.fn(() => ({ width: 0 })),
          transform: vi.fn(),
          rect: vi.fn(),
          quadraticCurveTo: vi.fn(),
          bezierCurveTo: vi.fn(),
          clip: vi.fn(),
          isPointInPath: vi.fn(() => false),
          isPointInStroke: vi.fn(() => false),
          createConicGradient: vi.fn(),
          createLinearGradient: vi.fn(),
          createRadialGradient: vi.fn(),
          createPattern: vi.fn(),
          drawFocusIfNeeded: vi.fn(),
          scrollPathIntoView: vi.fn(),
          addHitRegion: vi.fn(),
          removeHitRegion: vi.fn(),
          clearHitRegions: vi.fn(),
          getLineDash: vi.fn(() => []),
          setLineDash: vi.fn(),
          getTransform: vi.fn(() => new DOMMatrix()),
          setTransform: vi.fn(),
          resetTransform: vi.fn(),
          fillStyle: '',
          strokeStyle: '',
          lineWidth: 1,
          font: '',
          textAlign: 'left',
          textBaseline: 'alphabetic',
          globalAlpha: 1,
          globalCompositeOperation: 'source-over',
          canvas: this,
        } as unknown as CanvasRenderingContext2D;
      }
      // For WebGL contexts, return a basic mock
      if (contextType === 'webgl' || contextType === 'webgl2') {
        return {
          drawArrays: vi.fn(),
          drawElements: vi.fn(),
          clear: vi.fn(),
          clearColor: vi.fn(),
          createBuffer: vi.fn(() => ({})),
          bindBuffer: vi.fn(),
          bufferData: vi.fn(),
          createShader: vi.fn(() => ({})),
          shaderSource: vi.fn(),
          compileShader: vi.fn(),
          createProgram: vi.fn(() => ({})),
          attachShader: vi.fn(),
          linkProgram: vi.fn(),
          useProgram: vi.fn(),
          getAttribLocation: vi.fn(() => 0),
          getUniformLocation: vi.fn(() => ({})),
          uniformMatrix4fv: vi.fn(),
          uniform1i: vi.fn(),
          uniform1f: vi.fn(),
          uniform2f: vi.fn(),
          uniform3f: vi.fn(),
          uniform4f: vi.fn(),
          vertexAttribPointer: vi.fn(),
          enableVertexAttribArray: vi.fn(),
          viewport: vi.fn(),
          canvas: this,
        } as unknown;
      }
      return null;
    };
    */

    // Mock toDataURL method
    window.HTMLCanvasElement.prototype.toDataURL = function toDataURL() {
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    };

    // Mock toBlob method
    window.HTMLCanvasElement.prototype.toBlob = function toBlob(
      callback: (blob: Blob | null) => void
    ) {
      const blob = new Blob([''], { type: 'image/png' });
      callback(blob);
    };
  }

  // Mock WebGLRenderingContext and WebGL2RenderingContext
  if (!window.WebGLRenderingContext) {
    // @ts-expect-error: This is a test mock for WebGLRenderingContext, not a full implementation
    window.WebGLRenderingContext = class MockWebGLRenderingContext {
      static readonly POINTS = 0x0000;
      static readonly LINES = 0x0001;
      static readonly LINE_LOOP = 0x0002;
      static readonly LINE_STRIP = 0x0003;
      static readonly TRIANGLES = 0x0004;
      static readonly TRIANGLE_STRIP = 0x0005;
      static readonly TRIANGLE_FAN = 0x0006;
    };
  }

  if (!window.WebGL2RenderingContext) {
    // @ts-expect-error: This is a test mock for WebGL2RenderingContext, not a full implementation
    window.WebGL2RenderingContext = class MockWebGL2RenderingContext extends (
      window.WebGLRenderingContext
    ) {
      // WebGL2 specific constants
    };
  }

  // Mock DOMMatrix if it doesn't exist
  if (!window.DOMMatrix) {
    // @ts-expect-error: This is a test mock for DOMMatrix, not a full implementation
    window.DOMMatrix = class MockDOMMatrix {
      constructor() {
        // Mock implementation
      }
    };
  }
}
