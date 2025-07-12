import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProtoType from './ProtoType';

describe('ProtoType Component', () => {
  it('should render the prototype component', () => {
    render(<ProtoType />);

    expect(screen.getByRole('heading', { name: 'ProtoType' })).toBeInTheDocument();
    expect(
      screen.getByText('PIXIjs typing game - Coming soon with GitHub repository integration')
    ).toBeInTheDocument();
  });

  it('should have proper heading styling', () => {
    render(<ProtoType />);

    const heading = screen.getByRole('heading', { name: 'ProtoType' });
    expect(heading).toHaveClass('neue-haas-grotesk-display', 'text-blue-500');
  });

  it('should have proper description styling', () => {
    render(<ProtoType />);

    const description = screen.getByText(
      'PIXIjs typing game - Coming soon with GitHub repository integration'
    );
    expect(description).toHaveClass('text-sm', 'text-gray-300');
  });
});
