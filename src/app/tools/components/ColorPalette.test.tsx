import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ColorPalette from './ColorPalette';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock fetch for search index
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ index: [] }),
});

describe('ColorPalette', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the color palette title', () => {
    render(<ColorPalette />);

    expect(screen.getByRole('heading', { name: 'Color Palette Generator' })).toBeInTheDocument();
  });

  it('should render base color inputs', () => {
    render(<ColorPalette />);

    // Check for base color inputs - there are two inputs with the same value
    const inputs = screen.getAllByDisplayValue('#3b82f6');
    expect(inputs).toHaveLength(2);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render harmony type selector', () => {
    render(<ColorPalette />);

    // Check for harmony type selector using display value
    expect(screen.getByDisplayValue('Complementary')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should render options checkboxes', () => {
    render(<ColorPalette />);

    // Check for checkboxes using labels within the checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);
    expect(screen.getByText('Show Details')).toBeInTheDocument();
    expect(screen.getByText('Accessibility Check')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<ColorPalette />);

    // Check for action buttons using text content
    expect(screen.getByText('Random')).toBeInTheDocument();
    expect(screen.getByText('CSS')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
  });

  it('should render color palette sections', () => {
    render(<ColorPalette />);

    // Check for section headings
    expect(screen.getByRole('heading', { name: 'Generated Palette' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Preview' })).toBeInTheDocument();
  });

  it('should have proper heading structure', () => {
    render(<ColorPalette />);

    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]).toHaveTextContent('Color Palette Generator');
  });

  it('should render without crashing', () => {
    expect(() => render(<ColorPalette />)).not.toThrow();
  });
});
