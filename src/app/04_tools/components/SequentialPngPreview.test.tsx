import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SequentialPngPreview from './SequentialPngPreview';

describe('SequentialPngPreview Component', () => {
  it('should render the sequential png preview component', () => {
    render(<SequentialPngPreview />);

    expect(screen.getByRole('heading', { name: 'Sequential PNG Preview' })).toBeInTheDocument();
    expect(screen.getByText('No image sequences loaded')).toBeInTheDocument();
  });

  it('should have proper heading styling', () => {
    render(<SequentialPngPreview />);

    const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
    expect(heading).toHaveClass('neue-haas-grotesk-display');
  });

  it('should have proper empty state message', () => {
    render(<SequentialPngPreview />);

    const description = screen.getByText('No image sequences loaded');
    expect(description).toHaveClass('text-foreground/70');
  });
});
