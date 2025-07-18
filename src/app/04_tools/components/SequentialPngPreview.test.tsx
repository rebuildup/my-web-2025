import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SequentialPngPreview from './SequentialPngPreview';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ChevronLeft: () => <div data-testid="chevron-left-icon">ChevronLeft</div>,
  ChevronRight: () => <div data-testid="chevron-right-icon">ChevronRight</div>,
  Play: () => <div data-testid="play-icon">Play</div>,
  Pause: () => <div data-testid="pause-icon">Pause</div>,
  Upload: () => <div data-testid="upload-icon">Upload</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Check: () => <div data-testid="check-icon">Check</div>,
  RefreshCw: () => <div data-testid="refresh-icon">RefreshCw</div>,
  Image: () => <div data-testid="image-icon">Image</div>,
}));

// Mock Next/Image
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} data-testid="next-image" />
  ),
}));

describe('SequentialPngPreview Component', () => {
  it('should render the sequential png preview component', () => {
    const { container } = render(<SequentialPngPreview />);

    // Check for the heading text
    const headingElement = container.querySelector('h2');
    expect(headingElement).toBeInTheDocument();
    expect(headingElement?.textContent).toContain('Sequential PNG Preview');

    // Check for empty state message
    const emptyStateMessage = container.querySelector('p.text-foreground\\/70');
    expect(emptyStateMessage).toBeInTheDocument();
    expect(emptyStateMessage?.textContent).toContain('No image sequences loaded');
  });

  it('should have proper heading styling', () => {
    const { container } = render(<SequentialPngPreview />);

    // Find the h2 element
    const heading = container.querySelector('h2');
    expect(heading).toHaveClass('neue-haas-grotesk-display');
  });

  it('should have proper empty state message', () => {
    const { container } = render(<SequentialPngPreview />);

    // Find the empty state message
    const description = container.querySelector('p.text-foreground\\/70');
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('text-foreground/70');
  });
});
