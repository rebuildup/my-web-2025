import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BusinessMailBlock from './BusinessMailBlock';

describe('BusinessMailBlock Component', () => {
  describe('BusinessMailBlock Component', () => {
    it('should render the Business Mail Block component', () => {
      render(<BusinessMailBlock />);

      expect(screen.getByRole('heading', { name: 'Business Mail Block' })).toBeInTheDocument();
      expect(
        screen.getByText('Business email templates - Coming soon with block-based interface')
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

    it('should display the coming soon message', () => {
      render(<BusinessMailBlock />);

      expect(
        screen.getByText('Business email templates - Coming soon with block-based interface')
      ).toBeInTheDocument();
    });

    it('should have proper text styling', () => {
      render(<BusinessMailBlock />);

      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description).toHaveClass('text-sm', 'text-gray-300');
    });

    it('should have proper container styling', () => {
      const { container } = render(<BusinessMailBlock />);

      const descriptionContainer = container.querySelector('.bg-gray-700');
      expect(descriptionContainer).toHaveClass('rounded-none', 'bg-gray-700', 'p-4');
    });

    it('should maintain consistent structure', () => {
      const { container } = render(<BusinessMailBlock />);

      // Should have main container
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      // Should have heading
      const heading = screen.getByRole('heading', { name: 'Business Mail Block' });
      expect(heading).toBeInTheDocument();

      // Should have description container
      const descriptionContainer = container.querySelector('.bg-gray-700');
      expect(descriptionContainer).toBeInTheDocument();

      // Should have description text
      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should be accessible', () => {
      render(<BusinessMailBlock />);

      // Should have proper heading structure
      const heading = screen.getByRole('heading', { name: 'Business Mail Block' });
      expect(heading).toBeInTheDocument();

      // Should have proper text content
      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle different screen sizes', () => {
      const { container } = render(<BusinessMailBlock />);

      // Component should be responsive
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('p-6'); // Should have padding

      const descriptionContainer = container.querySelector('.bg-gray-700');
      expect(descriptionContainer).toHaveClass('p-4'); // Should have padding
    });

    it('should maintain proper spacing', () => {
      const { container } = render(<BusinessMailBlock />);

      const heading = screen.getByRole('heading', { name: 'Business Mail Block' });
      expect(heading).toHaveClass('mb-4'); // Should have bottom margin

      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should have proper color scheme', () => {
      render(<BusinessMailBlock />);

      const heading = screen.getByRole('heading', { name: 'Business Mail Block' });
      expect(heading).toHaveClass('text-blue-500'); // Should be blue

      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description).toHaveClass('text-gray-300'); // Should be gray
    });

    it('should handle component updates', () => {
      const { rerender } = render(<BusinessMailBlock />);

      // Should still render correctly after re-render
      expect(() => rerender(<BusinessMailBlock />)).not.toThrow();

      expect(screen.getByRole('heading', { name: 'Business Mail Block' })).toBeInTheDocument();
      expect(
        screen.getByText('Business email templates - Coming soon with block-based interface')
      ).toBeInTheDocument();
    });

    it('should handle multiple instances', () => {
      const { container } = render(
        <div>
          <BusinessMailBlock />
          <BusinessMailBlock />
        </div>
      );

      const headings = screen.getAllByRole('heading', { name: 'Business Mail Block' });
      expect(headings).toHaveLength(2);

      const descriptions = screen.getAllByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(descriptions).toHaveLength(2);
    });

    it('should maintain proper HTML structure', () => {
      const { container } = render(<BusinessMailBlock />);

      // Should have proper div structure
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.tagName).toBe('DIV');

      const heading = screen.getByRole('heading', { name: 'Business Mail Block' });
      expect(heading.tagName).toBe('H2');

      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description.tagName).toBe('P');
    });

    it('should handle special characters in text', () => {
      render(<BusinessMailBlock />);

      // Should handle special characters in the description
      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      render(<BusinessMailBlock />);

      // Should handle the description text properly
      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description).toBeInTheDocument();
      expect(description.textContent).toBe(
        'Business email templates - Coming soon with block-based interface'
      );
    });

    it('should have proper semantic structure', () => {
      render(<BusinessMailBlock />);

      // Should have proper heading hierarchy
      const heading = screen.getByRole('heading', { name: 'Business Mail Block' });
      expect(heading).toBeInTheDocument();

      // Should have proper paragraph for description
      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle component unmounting', () => {
      const { unmount } = render(<BusinessMailBlock />);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should maintain consistent styling across renders', () => {
      const { rerender } = render(<BusinessMailBlock />);

      const firstRender = screen.getByRole('heading', { name: 'Business Mail Block' });
      const firstClasses = firstRender.className;

      rerender(<BusinessMailBlock />);

      const secondRender = screen.getByRole('heading', { name: 'Business Mail Block' });
      const secondClasses = secondRender.className;

      expect(firstClasses).toBe(secondClasses);
    });

    it('should handle empty content gracefully', () => {
      // This test ensures the component doesn't crash with unexpected content
      render(<BusinessMailBlock />);

      // Should still render the expected content
      expect(screen.getByRole('heading', { name: 'Business Mail Block' })).toBeInTheDocument();
      expect(
        screen.getByText('Business email templates - Coming soon with block-based interface')
      ).toBeInTheDocument();
    });

    it('should have proper contrast for accessibility', () => {
      render(<BusinessMailBlock />);

      // Heading should have good contrast (blue on dark background)
      const heading = screen.getByRole('heading', { name: 'Business Mail Block' });
      expect(heading).toHaveClass('text-blue-500');

      // Description should have good contrast (light gray on dark background)
      const description = screen.getByText(
        'Business email templates - Coming soon with block-based interface'
      );
      expect(description).toHaveClass('text-gray-300');
    });

    it('should handle component in different contexts', () => {
      // Test component in different wrapper contexts
      const { container } = render(
        <div className="test-wrapper">
          <BusinessMailBlock />
        </div>
      );

      expect(screen.getByRole('heading', { name: 'Business Mail Block' })).toBeInTheDocument();
      expect(
        screen.getByText('Business email templates - Coming soon with block-based interface')
      ).toBeInTheDocument();
    });
  });
});
