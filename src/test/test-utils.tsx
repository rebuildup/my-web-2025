import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string; [key: string]: unknown }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} data-testid="next-image" {...props} />;
  },
}));

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => {
    return (
      <a href={href} data-testid="next-link" {...props}>
        {children}
      </a>
    );
  },
}));

// Mock reCAPTCHA
vi.mock('react-google-recaptcha', () => ({
  default: ({ onChange, onExpired, onError, ...props }: {
    onChange?: (token: string) => void;
    onExpired?: () => void;
    onError?: (error: string) => void;
    [key: string]: unknown;
  }) => {
    return (
      <div data-testid="recaptcha" {...props}>
        <button onClick={() => onChange?.('mock-token')}>Verify</button>
        <button onClick={() => onExpired?.()}>Expire</button>
        <button onClick={() => onError?.('mock-error')}>Error</button>
      </div>
    );
  },
}));

// Mock CSS modules
vi.mock('*.module.css', () => ({}));

// Mock CSS variables
Object.defineProperty(document.documentElement.style, 'getPropertyValue', {
  value: vi.fn(() => '#000000'),
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
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

// Custom render function with providers
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  return render(ui, {
    ...options,
    container: document.body,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Debug helper
export const debug = (element?: Element | null) => {
  if (element) {
    console.log('Element HTML:', element.outerHTML);
  } else {
    console.log('Document HTML:', document.documentElement.outerHTML);
  }
};
