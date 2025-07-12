import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PiGame from './PiGame';

describe('PiGame Component', () => {
  it('should render the pi game component', () => {
    render(<PiGame />);

    expect(screen.getByRole('heading', { name: 'Pi Game' })).toBeInTheDocument();
    expect(
      screen.getByText('Pi sequence memory game - Coming soon with number pad interface')
    ).toBeInTheDocument();
  });

  it('should have proper heading styling', () => {
    render(<PiGame />);

    const heading = screen.getByRole('heading', { name: 'Pi Game' });
    expect(heading).toHaveClass('neue-haas-grotesk-display', 'text-blue-500');
  });

  it('should have proper description styling', () => {
    render(<PiGame />);

    const description = screen.getByText(
      'Pi sequence memory game - Coming soon with number pad interface'
    );
    expect(description).toHaveClass('text-sm', 'text-gray-300');
  });
});
