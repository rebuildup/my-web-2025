import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RootLayout from './layout';

// Mock the metadata module to avoid the `new URL()` call
vi.mock('./metadata', () => ({
  siteMetadata: {
    title: 'Mock Title',
    description: 'Mock Description',
  },
}));

vi.mock('next/font/google', () => ({
  Noto_Sans_JP: () => ({
    className: '__className_noto-sans-jp',
    variable: '--font-noto-sans-jp',
  }),
  Shippori_Antique_B1: () => ({
    className: '__className_shippori-antique',
    variable: '--font-shippori-antique',
  }),
}));

describe('RootLayout', () => {
  it('should render children and apply font classes', () => {
    render(
      <RootLayout>
        <div data-testid="child-element">Hello World</div>
      </RootLayout>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    const htmlElement = document.documentElement;
    expect(htmlElement.className).toContain('--font-noto-sans-jp');
  });
});
