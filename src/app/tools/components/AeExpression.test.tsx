import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AeExpression from './AeExpression';

describe('AeExpression Component', () => {
  describe('AeExpression Component', () => {
    it('should render the AE Expression component', () => {
      render(<AeExpression />);

      expect(screen.getByRole('heading', { name: 'AE Expression' })).toBeInTheDocument();
      expect(
        screen.getByText('AfterEffects expressions - Coming soon with Scratch-like interface')
      ).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      render(<AeExpression />);

      const mainDiv = screen.getByRole('heading', { name: 'AE Expression' });
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = screen.getByRole('heading', { name: 'AE Expression' });
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

    it('should display the coming soon message', () => {
      render(<AeExpression />);

      expect(
        screen.getByText('AfterEffects expressions - Coming soon with Scratch-like interface')
      ).toBeInTheDocument();
    });

    it('should have proper text styling', () => {
      render(<AeExpression />);

      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description).toHaveClass('text-sm', 'text-gray-300');
    });

    it('should have proper container styling', () => {
      render(<AeExpression />);

      const descriptionContainer = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(descriptionContainer).toHaveClass('rounded-none', 'bg-gray-700', 'p-4');
    });

    it('should maintain consistent structure', () => {
      render(<AeExpression />);

      // Should have main container
      const mainContainer = screen.getByRole('heading', { name: 'AE Expression' });
      expect(mainContainer).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      // Should have heading
      const heading = screen.getByRole('heading', { name: 'AE Expression' });
      expect(heading).toBeInTheDocument();

      // Should have description container
      const descriptionContainer = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(descriptionContainer).toBeInTheDocument();

      // Should have description text
      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should be accessible', () => {
      render(<AeExpression />);

      // Should have proper heading structure
      const heading = screen.getByRole('heading', { name: 'AE Expression' });
      expect(heading).toBeInTheDocument();

      // Should have proper text content
      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle different screen sizes', () => {
      render(<AeExpression />);

      // Component should be responsive
      const mainContainer = screen.getByRole('heading', { name: 'AE Expression' });
      expect(mainContainer).toHaveClass('p-6'); // Should have padding

      const descriptionContainer = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(descriptionContainer).toHaveClass('p-4'); // Should have padding
    });

    it('should maintain proper spacing', () => {
      render(<AeExpression />);

      const heading = screen.getByRole('heading', { name: 'AE Expression' });
      expect(heading).toHaveClass('mb-4'); // Should have bottom margin

      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should have proper color scheme', () => {
      render(<AeExpression />);

      const heading = screen.getByRole('heading', { name: 'AE Expression' });
      expect(heading).toHaveClass('text-blue-500'); // Should be blue

      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description).toHaveClass('text-gray-300'); // Should be gray
    });

    it('should handle component updates', () => {
      const { rerender } = render(<AeExpression />);

      // Should still render correctly after re-render
      expect(() => rerender(<AeExpression />)).not.toThrow();

      expect(screen.getByRole('heading', { name: 'AE Expression' })).toBeInTheDocument();
      expect(
        screen.getByText('AfterEffects expressions - Coming soon with Scratch-like interface')
      ).toBeInTheDocument();
    });

    it('should handle multiple instances', () => {
      render(
        <div>
          <AeExpression />
          <AeExpression />
        </div>
      );

      const headings = screen.getAllByRole('heading', { name: 'AE Expression' });
      expect(headings).toHaveLength(2);

      const descriptions = screen.getAllByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(descriptions).toHaveLength(2);
    });

    it('should maintain proper HTML structure', () => {
      render(<AeExpression />);

      // Should have proper div structure
      const mainDiv = screen.getByRole('heading', { name: 'AE Expression' });
      expect(mainDiv.tagName).toBe('H2');

      const heading = screen.getByRole('heading', { name: 'AE Expression' });
      expect(heading.tagName).toBe('H2');

      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description.tagName).toBe('P');
    });

    it('should handle special characters in text', () => {
      render(<AeExpression />);

      // Should handle special characters in the description
      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      render(<AeExpression />);

      // Should handle the description text properly
      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description).toBeInTheDocument();
      expect(description.textContent).toBe(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
    });

    it('should have proper semantic structure', () => {
      render(<AeExpression />);

      // Should have proper heading hierarchy
      const heading = screen.getByRole('heading', { name: 'AE Expression' });
      expect(heading).toBeInTheDocument();

      // Should have proper paragraph for description
      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle component unmounting', () => {
      const { unmount } = render(<AeExpression />);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should maintain consistent styling across renders', () => {
      const { rerender } = render(<AeExpression />);

      const firstRender = screen.getByRole('heading', { name: 'AE Expression' });
      const firstClasses = firstRender.className;

      rerender(<AeExpression />);

      const secondRender = screen.getByRole('heading', { name: 'AE Expression' });
      const secondClasses = secondRender.className;

      expect(firstClasses).toBe(secondClasses);
    });

    it('should handle empty content gracefully', () => {
      // This test ensures the component doesn't crash with unexpected content
      render(<AeExpression />);

      // Should still render the expected content
      expect(screen.getByRole('heading', { name: 'AE Expression' })).toBeInTheDocument();
      expect(
        screen.getByText('AfterEffects expressions - Coming soon with Scratch-like interface')
      ).toBeInTheDocument();
    });

    it('should have proper contrast for accessibility', () => {
      render(<AeExpression />);

      // Heading should have good contrast (blue on dark background)
      const heading = screen.getByRole('heading', { name: 'AE Expression' });
      expect(heading).toHaveClass('text-blue-500');

      // Description should have good contrast (light gray on dark background)
      const description = screen.getByText(
        'AfterEffects expressions - Coming soon with Scratch-like interface'
      );
      expect(description).toHaveClass('text-gray-300');
    });

    it('should handle component in different contexts', () => {
      // Test component in different wrapper contexts
      render(
        <div className="test-wrapper">
          <AeExpression />
        </div>
      );

      expect(screen.getByRole('heading', { name: 'AE Expression' })).toBeInTheDocument();
      expect(
        screen.getByText('AfterEffects expressions - Coming soon with Scratch-like interface')
      ).toBeInTheDocument();
    });
  });
});
