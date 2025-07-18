import React from 'react';
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render, debug } from '@/test/test-utils';

// Simple test component
const SimpleComponent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={className} data-testid="simple-component">
      {children}
    </div>
  );
};

describe('Simple Component Test', () => {
  it('should render with children', () => {
    render(
      <SimpleComponent>
        <span>Test content</span>
      </SimpleComponent>
    );

    debug();
    expect(screen.getByTestId('simple-component')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <SimpleComponent className="custom-class">
        <span>Test content</span>
      </SimpleComponent>
    );

    const component = screen.getByTestId('simple-component');
    expect(component).toHaveClass('custom-class');
  });
});
