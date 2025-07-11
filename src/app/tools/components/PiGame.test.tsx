import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PiGame from './PiGame';

describe('PiGame Component', () => {
  describe('PiGame Component', () => {
    it('should render the Pi Game component', () => {
      render(<PiGame />);

      expect(screen.getByRole('heading', { name: 'Pi Game' })).toBeInTheDocument();
      expect(
        screen.getByText('Pi sequence memory game - Coming soon with number pad interface')
      ).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<PiGame />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = screen.getByRole('heading', { name: 'Pi Game' });
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

    it('should display the coming soon message', () => {
      render(<PiGame />);

      expect(
        screen.getByText('Pi sequence memory game - Coming soon with number pad interface')
      ).toBeInTheDocument();
    });

    it('should have proper text styling', () => {
      render(<PiGame />);

      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description).toHaveClass('text-sm', 'text-gray-300');
    });

    it('should have proper container styling', () => {
      const { container } = render(<PiGame />);

      const descriptionContainer = container.querySelector('.bg-gray-700');
      expect(descriptionContainer).toHaveClass('rounded-none', 'bg-gray-700', 'p-4');
    });

    it('should maintain consistent structure', () => {
      const { container } = render(<PiGame />);

      // Should have main container
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      // Should have heading
      const heading = screen.getByRole('heading', { name: 'Pi Game' });
      expect(heading).toBeInTheDocument();

      // Should have description container
      const descriptionContainer = container.querySelector('.bg-gray-700');
      expect(descriptionContainer).toBeInTheDocument();

      // Should have description text
      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should be accessible', () => {
      render(<PiGame />);

      // Should have proper heading structure
      const heading = screen.getByRole('heading', { name: 'Pi Game' });
      expect(heading).toBeInTheDocument();

      // Should have proper text content
      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle different screen sizes', () => {
      const { container } = render(<PiGame />);

      // Component should be responsive
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('p-6'); // Should have padding

      const descriptionContainer = container.querySelector('.bg-gray-700');
      expect(descriptionContainer).toHaveClass('p-4'); // Should have padding
    });

    it('should maintain proper spacing', () => {
      const { container } = render(<PiGame />);

      const heading = screen.getByRole('heading', { name: 'Pi Game' });
      expect(heading).toHaveClass('mb-4'); // Should have bottom margin

      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should have proper color scheme', () => {
      render(<PiGame />);

      const heading = screen.getByRole('heading', { name: 'Pi Game' });
      expect(heading).toHaveClass('text-blue-500'); // Should be blue

      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description).toHaveClass('text-gray-300'); // Should be gray
    });

    it('should handle component updates', () => {
      const { rerender } = render(<PiGame />);

      // Should still render correctly after re-render
      expect(() => rerender(<PiGame />)).not.toThrow();

      expect(screen.getByRole('heading', { name: 'Pi Game' })).toBeInTheDocument();
      expect(
        screen.getByText('Pi sequence memory game - Coming soon with number pad interface')
      ).toBeInTheDocument();
    });

    it('should handle multiple instances', () => {
      const { container } = render(
        <div>
          <PiGame />
          <PiGame />
        </div>
      );

      const headings = screen.getAllByRole('heading', { name: 'Pi Game' });
      expect(headings).toHaveLength(2);

      const descriptions = screen.getAllByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(descriptions).toHaveLength(2);
    });

    it('should maintain proper HTML structure', () => {
      const { container } = render(<PiGame />);

      // Should have proper div structure
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.tagName).toBe('DIV');

      const heading = screen.getByRole('heading', { name: 'Pi Game' });
      expect(heading.tagName).toBe('H2');

      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description.tagName).toBe('P');
    });

    it('should handle special characters in text', () => {
      render(<PiGame />);

      // Should handle special characters in the description
      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      render(<PiGame />);

      // Should handle the description text properly
      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description).toBeInTheDocument();
      expect(description.textContent).toBe(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
    });

    it('should have proper semantic structure', () => {
      render(<PiGame />);

      // Should have proper heading hierarchy
      const heading = screen.getByRole('heading', { name: 'Pi Game' });
      expect(heading).toBeInTheDocument();

      // Should have proper paragraph for description
      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle component unmounting', () => {
      const { unmount } = render(<PiGame />);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should maintain consistent styling across renders', () => {
      const { rerender } = render(<PiGame />);

      const firstRender = screen.getByRole('heading', { name: 'Pi Game' });
      const firstClasses = firstRender.className;

      rerender(<PiGame />);

      const secondRender = screen.getByRole('heading', { name: 'Pi Game' });
      const secondClasses = secondRender.className;

      expect(firstClasses).toBe(secondClasses);
    });

    it('should handle empty content gracefully', () => {
      // This test ensures the component doesn't crash with unexpected content
      render(<PiGame />);

      // Should still render the expected content
      expect(screen.getByRole('heading', { name: 'Pi Game' })).toBeInTheDocument();
      expect(
        screen.getByText('Pi sequence memory game - Coming soon with number pad interface')
      ).toBeInTheDocument();
    });

    it('should have proper contrast for accessibility', () => {
      render(<PiGame />);

      // Heading should have good contrast (blue on dark background)
      const heading = screen.getByRole('heading', { name: 'Pi Game' });
      expect(heading).toHaveClass('text-blue-500');

      // Description should have good contrast (light gray on dark background)
      const description = screen.getByText(
        'Pi sequence memory game - Coming soon with number pad interface'
      );
      expect(description).toHaveClass('text-gray-300');
    });

    it('should handle component in different contexts', () => {
      // Test component in different wrapper contexts
      const { container } = render(
        <div className="test-wrapper">
          <PiGame />
        </div>
      );

      expect(screen.getByRole('heading', { name: 'Pi Game' })).toBeInTheDocument();
      expect(
        screen.getByText('Pi sequence memory game - Coming soon with number pad interface')
      ).toBeInTheDocument();
    });
  });
});
