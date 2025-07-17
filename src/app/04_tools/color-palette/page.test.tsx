import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ColorPalettePage from './page';

// Mock the ColorPalette component
vi.mock('../components/ColorPalette', () => ({
  __esModule: true,
  default: () => <div data-testid="color-palette-component">Color Palette Component</div>,
}));

// Mock the ToolUsageTracker component
vi.mock('../components/ToolUsageTracker', () => ({
  __esModule: true,
  default: ({ toolId }: { toolId: string }) => (
    <div data-testid="tool-usage-tracker">Tool Usage Tracker: {toolId}</div>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

describe('ColorPalettePage', () => {
  it('should render the color palette page with title and description', () => {
    render(<ColorPalettePage />);

    expect(screen.getByText('Color Palette Generator')).toBeInTheDocument();
    expect(screen.getByText('カラーパレットジェネレーター')).toBeInTheDocument();
  });

  it('should render the color palette component', () => {
    render(<ColorPalettePage />);

    expect(screen.getByTestId('color-palette-component')).toBeInTheDocument();
  });

  it('should render the tool usage tracker with correct tool ID', () => {
    render(<ColorPalettePage />);

    expect(screen.getByTestId('tool-usage-tracker')).toBeInTheDocument();
    expect(screen.getByText('Tool Usage Tracker: color-palette')).toBeInTheDocument();
  });

  it('should render the back link', () => {
    render(<ColorPalettePage />);

    const backLink = screen.getByText('Back to Tools');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/04_tools');
  });

  it('should render the about section', () => {
    render(<ColorPalettePage />);

    expect(screen.getByText('About this tool')).toBeInTheDocument();
    expect(
      screen.getByText(/This color palette generator helps you create harmonious color schemes/)
    ).toBeInTheDocument();
    expect(screen.getByText(/All processing is done in your browser/)).toBeInTheDocument();
  });
});
