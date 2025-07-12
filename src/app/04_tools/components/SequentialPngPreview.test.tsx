import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SequentialPngPreview from './SequentialPngPreview';

describe('SequentialPngPreview Component', () => {
  it('should render the sequential png preview component', () => {
    render(<SequentialPngPreview />);

    expect(screen.getByRole('heading', { name: 'Sequential PNG Preview' })).toBeInTheDocument();
    expect(
      screen.getByText('Sequential PNG animation preview - Coming soon with file upload support')
    ).toBeInTheDocument();
  });

  it('should have proper heading styling', () => {
    render(<SequentialPngPreview />);

    const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
    expect(heading).toHaveClass('neue-haas-grotesk-display', 'text-blue-500');
  });

  it('should have proper description styling', () => {
    render(<SequentialPngPreview />);

    const description = screen.getByText(
      'Sequential PNG animation preview - Coming soon with file upload support'
    );
    expect(description).toHaveClass('text-sm', 'text-gray-300');
  });
});
