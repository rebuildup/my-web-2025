import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceCalculator from './PriceCalculator';

describe('PriceCalculator Component', () => {
  it('should render the Price Calculator component', () => {
    render(<PriceCalculator />);
    expect(screen.getByRole('heading', { name: 'Price Calculator' })).toBeInTheDocument();
  });
});
