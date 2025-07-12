import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AeExpression from './AeExpression';

describe('AeExpression Component', () => {
  it('should render the AE Expression component', () => {
    render(<AeExpression />);

    expect(screen.getByRole('heading', { name: 'AE Expression' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'After Effects expression generator - Coming soon with Scratch-like block interface'
      )
    ).toBeInTheDocument();
  });

  it('should have proper heading styling', () => {
    render(<AeExpression />);

    const heading = screen.getByRole('heading', { name: 'AE Expression' });
    expect(heading).toHaveClass('neue-haas-grotesk-display', 'text-blue-500');
  });

  it('should have proper description styling', () => {
    render(<AeExpression />);

    const description = screen.getByText(
      'After Effects expression generator - Coming soon with Scratch-like block interface'
    );
    expect(description).toHaveClass('text-sm', 'text-gray-300');
  });
});
