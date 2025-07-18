import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PiGame from './PiGame';
import AeExpression from './AeExpression';
import ProtoType from './ProtoType';
import Svg2tsx from './Svg2tsx';

describe('Simple Tool Components', () => {
  describe('PiGame Component', () => {
    it('should render the Pi Game component', () => {
      const { container } = render(<PiGame />);

      // Check for heading element using querySelector
      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('Pi Game');
      expect(
        screen.getByText('Pi sequence memory game - Coming soon with number pad interface')
      ).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<PiGame />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('Pi Game');
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<PiGame />)).not.toThrow();
    });
  });

  describe('AeExpression Component', () => {
    it('should render the AE Expression component', () => {
      const { container } = render(<AeExpression />);

      // Check for heading element using querySelector
      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('AE Expression');
      expect(
        screen.getByText(
          'After Effects expression generator - Coming soon with Scratch-like block interface'
        )
      ).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<AeExpression />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('AE Expression');
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<AeExpression />)).not.toThrow();
    });
  });

  describe('ProtoType Component', () => {
    it('should render the ProtoType component', () => {
      const { container } = render(<ProtoType />);

      // Check for heading element using querySelector
      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('ProtoType');
      expect(
        screen.getByText('PIXIjs typing game - Coming soon with GitHub repository integration')
      ).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<ProtoType />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('ProtoType');
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<ProtoType />)).not.toThrow();
    });
  });

  describe('Svg2tsx Component', () => {
    it('should render the SVG2TSX component', () => {
      const { container } = render(<Svg2tsx />);

      // Check for heading element using querySelector
      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('SVG2TSX');
      expect(
        screen.getByText('SVG to TSX converter - Coming soon with React component generation')
      ).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<Svg2tsx />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = container.querySelector('h2');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('SVG2TSX');
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<Svg2tsx />)).not.toThrow();
    });
  });

  describe('Common Structure Tests', () => {
    it('should all have consistent structure', () => {
      const components = [
        { Component: PiGame, name: 'Pi Game' },
        { Component: AeExpression, name: 'AE Expression' },
        { Component: ProtoType, name: 'ProtoType' },
        { Component: Svg2tsx, name: 'SVG2TSX' },
      ];

      components.forEach(({ Component, name }) => {
        const { container } = render(<Component />);

        // Check main structure
        const mainDiv = container.firstChild as HTMLElement;
        expect(mainDiv.tagName).toBe('DIV');

        // Check heading existence
        const heading = container.querySelector('h2');
        expect(heading).toBeInTheDocument();
        expect(heading?.textContent).toBe(name);

        // Check content div existence
        const contentDiv = container.querySelector('.bg-gray-700');
        expect(contentDiv).toBeInTheDocument();

        // Check "Coming soon" text pattern
        const comingSoonText = container.querySelector('p');
        expect(comingSoonText?.textContent).toMatch(/Coming soon/);
      });
    });

    it('should all have proper accessibility structure', () => {
      const components = [PiGame, AeExpression, ProtoType, Svg2tsx];

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
        { Component: PiGame, name: 'Pi Game' },
        { Component: AeExpression, name: 'AE Expression' },
        { Component: ProtoType, name: 'ProtoType' },
        { Component: Svg2tsx, name: 'SVG2TSX' },
      ];

      components.forEach(({ Component, name }) => {
        const { container } = render(<Component />);
        const heading = container.querySelector('h2');
        expect(heading).toBeInTheDocument();
        expect(heading?.textContent).toBe(name);
        expect(heading).toHaveClass('text-blue-500');
      });
    });
  });
});
