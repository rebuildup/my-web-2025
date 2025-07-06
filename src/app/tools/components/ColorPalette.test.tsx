import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ColorPalette from './ColorPalette';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

describe('ColorPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the color palette title', () => {
    render(<ColorPalette />);

    expect(screen.getByText('Color Palette Generator')).toBeInTheDocument();
  });

  it('should render default color palette', () => {
    render(<ColorPalette />);

    // Check for color display elements
    expect(screen.getByText('#0000FF')).toBeInTheDocument();
    expect(screen.getByText('#4B5563')).toBeInTheDocument();
    expect(screen.getByText('#111827')).toBeInTheDocument();
  });

  it('should display color values', () => {
    render(<ColorPalette />);

    // Should show hex values
    expect(screen.getByText('#0000FF')).toBeInTheDocument();
    expect(screen.getByText('#4B5563')).toBeInTheDocument();
    expect(screen.getByText('#111827')).toBeInTheDocument();
  });

  it('should display color information', () => {
    render(<ColorPalette />);

    // Check that color information is displayed
    expect(
      screen.getByText(
        'Color palette generation tool - Generate harmonious color schemes for your projects'
      )
    ).toBeInTheDocument();
  });

  it('should display color blocks', () => {
    render(<ColorPalette />);

    // Check that color blocks are rendered (they have background colors)
    const colorBlocks = screen
      .getAllByRole('generic')
      .filter(
        el =>
          el.className.includes('bg-blue-500') ||
          el.className.includes('bg-gray-600') ||
          el.className.includes('bg-gray-900')
      );
    expect(colorBlocks.length).toBeGreaterThan(0);
  });

  it('should have proper heading structure', () => {
    render(<ColorPalette />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Color Palette Generator');
  });

  it('should render without crashing', () => {
    expect(() => render(<ColorPalette />)).not.toThrow();
  });
});
