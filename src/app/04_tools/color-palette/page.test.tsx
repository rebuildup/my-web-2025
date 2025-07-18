import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ColorPalettePage from './page';

// Mock Next.js metadata
vi.mock('next/metadata', () => ({
  __esModule: true,
}));

// Mock Next.js Link component
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
      <a href={href} className={className} data-testid="next-link">
        {children}
      </a>
    ),
  };
});

// Mock the ColorPalette component
vi.mock('../components/ColorPalette', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="color-palette-component">Color Palette Component</div>,
  };
});

// Mock the ToolUsageTracker component
vi.mock('../components/ToolUsageTracker', () => {
  return {
    __esModule: true,
    default: ({ toolId }: { toolId: string }) => (
      <div data-testid="tool-usage-tracker">Tool Usage Tracker: {toolId}</div>
    ),
  };
});

// Mock Lucide icons
vi.mock('lucide-react', () => {
  return {
    ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
  };
});

describe('ColorPalettePage', () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
  });

  it('should render the color palette page with title and description', () => {
    render(<ColorPalettePage />);

    // Debug what's being rendered
    // console.log(document.body.innerHTML);

    // Use a more flexible selector
    const titleElement = document.querySelector('h1');
    expect(titleElement?.textContent).toContain('Color Palette Generator');

    const descriptionElement = document.querySelector('.noto-sans-jp');
    expect(descriptionElement?.textContent).toContain('カラーパレットジェネレーター');
  });

  it('should render the color palette component', () => {
    render(<ColorPalettePage />);

    const colorPaletteComponent = document.querySelector('[data-testid="color-palette-component"]');
    expect(colorPaletteComponent).toBeInTheDocument();
  });

  it('should render the tool usage tracker with correct tool ID', () => {
    render(<ColorPalettePage />);

    const toolUsageTracker = document.querySelector('[data-testid="tool-usage-tracker"]');
    expect(toolUsageTracker).toBeInTheDocument();
    expect(toolUsageTracker?.textContent).toContain('Tool Usage Tracker: color-palette');
  });

  it('should render the back link', () => {
    render(<ColorPalettePage />);

    const backLink = document.querySelector('[data-testid="next-link"]');
    expect(backLink).toBeInTheDocument();
    expect(backLink?.textContent).toContain('Back to Tools');
    expect(backLink).toHaveAttribute('href', '/04_tools');
  });

  it('should render the about section', () => {
    render(<ColorPalettePage />);

    const aboutHeading = Array.from(document.querySelectorAll('h2')).find(
      el => el.textContent === 'About this tool'
    );
    expect(aboutHeading).toBeInTheDocument();

    const aboutText = document.body.textContent;
    expect(aboutText).toContain(
      'This color palette generator helps you create harmonious color schemes'
    );
    expect(aboutText).toContain('All processing is done in your browser');
  });
});
