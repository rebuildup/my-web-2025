import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BusinessMailBlock from './BusinessMailBlock';
import SequentialPngPreview from './SequentialPngPreview';
import PriceCalculator from './PriceCalculator';

describe('Simple Tool Components 2', () => {
  describe('BusinessMailBlock Component', () => {
    it('should render the Business Mail Block component', () => {
      render(<BusinessMailBlock />);

      expect(screen.getByRole('heading', { name: 'Business Mail Block' })).toBeInTheDocument();
      expect(
        screen.getByText(
          'Business mail template generator - Coming soon with Scratch-like block interface'
        )
      ).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<BusinessMailBlock />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = screen.getByRole('heading', { name: 'Business Mail Block' });
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<BusinessMailBlock />)).not.toThrow();
    });
  });

  describe('SequentialPngPreview Component', () => {
    it('should render the Sequential PNG Preview component', () => {
      render(<SequentialPngPreview />);

      expect(screen.getByRole('heading', { name: 'Sequential PNG Preview' })).toBeInTheDocument();
      expect(
        screen.getByText('Sequential PNG animation preview - Coming soon with file upload support')
      ).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<SequentialPngPreview />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<SequentialPngPreview />)).not.toThrow();
    });
  });

  describe('PriceCalculator Component', () => {
    it('should render the Price Calculator component', () => {
      render(<PriceCalculator />);

      expect(screen.getByRole('heading', { name: 'Price Calculator' })).toBeInTheDocument();
      expect(
        screen.getByText('Price calculation tool - Coming soon with project estimation features')
      ).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<PriceCalculator />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = screen.getByRole('heading', { name: 'Price Calculator' });
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<PriceCalculator />)).not.toThrow();
    });
  });

  describe('Common Structure Tests', () => {
    it('should all have consistent "Coming soon" structure', () => {
      const components = [
        { Component: BusinessMailBlock, name: 'Business Mail Block' },
        { Component: SequentialPngPreview, name: 'Sequential PNG Preview' },
        { Component: PriceCalculator, name: 'Price Calculator' },
      ];

      components.forEach(({ Component, name }) => {
        const { container } = render(<Component />);

        // Check main structure
        const mainDiv = container.firstChild as HTMLElement;
        expect(mainDiv.tagName).toBe('DIV');

        // Check heading existence
        expect(screen.getByRole('heading', { name })).toBeInTheDocument();

        // Check content div existence
        const contentDiv = container.querySelector('.bg-gray-700');
        expect(contentDiv).toBeInTheDocument();

        // Check "Coming soon" text pattern
        const comingSoonText = container.querySelector('p');
        expect(comingSoonText?.textContent).toMatch(/Coming soon/);
      });
    });

    it('should all have proper accessibility structure', () => {
      const components = [BusinessMailBlock, SequentialPngPreview, PriceCalculator];

      components.forEach(Component => {
        const { container } = render(<Component />);

        // Check heading level
        const heading = container.querySelector('h2');
        expect(heading).toBeInTheDocument();

        // Check text content accessibility
        const textContent = container.querySelector('p');
        expect(textContent).toBeInTheDocument();
        expect(textContent?.className).toContain('text-sm');
      });
    });

    it('should all have blue heading color', () => {
      const components = [
        { Component: BusinessMailBlock, name: 'Business Mail Block' },
        { Component: SequentialPngPreview, name: 'Sequential PNG Preview' },
        { Component: PriceCalculator, name: 'Price Calculator' },
      ];

      components.forEach(({ Component, name }) => {
        render(<Component />);
        const heading = screen.getByRole('heading', { name });
        expect(heading).toHaveClass('text-blue-500');
      });
    });

    it('should all follow the same content structure pattern', () => {
      const components = [BusinessMailBlock, SequentialPngPreview, PriceCalculator];

      components.forEach(Component => {
        const { container } = render(<Component />);

        // Check outer div structure
        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

        // Check inner content div
        const innerDiv = container.querySelector('.bg-gray-700');
        expect(innerDiv).toHaveClass('rounded-none', 'bg-gray-700', 'p-4');

        // Check paragraph text
        const paragraph = container.querySelector('p');
        expect(paragraph).toHaveClass('text-sm', 'text-gray-300');
      });
    });
  });
});
