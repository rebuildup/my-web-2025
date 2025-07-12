import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BusinessMailBlock from './BusinessMailBlock';

describe('BusinessMailBlock Component', () => {
  it('should render the business mail block component', () => {
    render(<BusinessMailBlock />);

    expect(screen.getByRole('heading', { name: 'Business Mail Block' })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Business mail template generator - Coming soon with Scratch-like block interface'
      )
    ).toBeInTheDocument();
  });

  it('should have proper heading styling', () => {
    render(<BusinessMailBlock />);

    const heading = screen.getByRole('heading', { name: 'Business Mail Block' });
    expect(heading).toHaveClass('neue-haas-grotesk-display', 'text-blue-500');
  });

  it('should have proper description styling', () => {
    render(<BusinessMailBlock />);

    const description = screen.getByText(
      'Business mail template generator - Coming soon with Scratch-like block interface'
    );
    expect(description).toHaveClass('text-sm', 'text-gray-300');
  });
});
