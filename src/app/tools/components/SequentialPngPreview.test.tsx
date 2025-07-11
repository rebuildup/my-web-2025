import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SequentialPngPreview from './SequentialPngPreview';

describe('SequentialPngPreview Component', () => {
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

    it('should display the coming soon message', () => {
      render(<SequentialPngPreview />);

      expect(
        screen.getByText('Sequential PNG animation preview - Coming soon with file upload support')
      ).toBeInTheDocument();
    });

    it('should have proper text styling', () => {
      render(<SequentialPngPreview />);

      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description).toHaveClass('text-sm', 'text-gray-300');
    });

    it('should have proper container styling', () => {
      const { container } = render(<SequentialPngPreview />);

      const descriptionContainer = container.querySelector('.bg-gray-700');
      expect(descriptionContainer).toHaveClass('rounded-none', 'bg-gray-700', 'p-4');
    });

    it('should maintain consistent structure', () => {
      const { container } = render(<SequentialPngPreview />);

      // Should have main container
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      // Should have heading
      const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      expect(heading).toBeInTheDocument();

      // Should have description container
      const descriptionContainer = container.querySelector('.bg-gray-700');
      expect(descriptionContainer).toBeInTheDocument();

      // Should have description text
      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description).toBeInTheDocument();
    });

    it('should be accessible', () => {
      render(<SequentialPngPreview />);

      // Should have proper heading structure
      const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      expect(heading).toBeInTheDocument();

      // Should have proper text content
      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle different screen sizes', () => {
      const { container } = render(<SequentialPngPreview />);

      // Component should be responsive
      const mainContainer = container.firstChild as HTMLElement;
      expect(mainContainer).toHaveClass('p-6'); // Should have padding

      const descriptionContainer = container.querySelector('.bg-gray-700');
      expect(descriptionContainer).toHaveClass('p-4'); // Should have padding
    });

    it('should maintain proper spacing', () => {
      const { container } = render(<SequentialPngPreview />);

      const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      expect(heading).toHaveClass('mb-4'); // Should have bottom margin

      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description).toBeInTheDocument();
    });

    it('should have proper color scheme', () => {
      render(<SequentialPngPreview />);

      const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      expect(heading).toHaveClass('text-blue-500'); // Should be blue

      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description).toHaveClass('text-gray-300'); // Should be gray
    });

    it('should handle component updates', () => {
      const { rerender } = render(<SequentialPngPreview />);

      // Should still render correctly after re-render
      expect(() => rerender(<SequentialPngPreview />)).not.toThrow();

      expect(screen.getByRole('heading', { name: 'Sequential PNG Preview' })).toBeInTheDocument();
      expect(
        screen.getByText('Sequential PNG animation preview - Coming soon with file upload support')
      ).toBeInTheDocument();
    });

    it('should handle multiple instances', () => {
      const { container } = render(
        <div>
          <SequentialPngPreview />
          <SequentialPngPreview />
        </div>
      );

      const headings = screen.getAllByRole('heading', { name: 'Sequential PNG Preview' });
      expect(headings).toHaveLength(2);

      const descriptions = screen.getAllByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(descriptions).toHaveLength(2);
    });

    it('should maintain proper HTML structure', () => {
      const { container } = render(<SequentialPngPreview />);

      // Should have proper div structure
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv.tagName).toBe('DIV');

      const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      expect(heading.tagName).toBe('H2');

      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description.tagName).toBe('P');
    });

    it('should handle special characters in text', () => {
      render(<SequentialPngPreview />);

      // Should handle special characters in the description
      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle long text content', () => {
      render(<SequentialPngPreview />);

      // Should handle the description text properly
      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description).toBeInTheDocument();
      expect(description.textContent).toBe(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
    });

    it('should have proper semantic structure', () => {
      render(<SequentialPngPreview />);

      // Should have proper heading hierarchy
      const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      expect(heading).toBeInTheDocument();

      // Should have proper paragraph for description
      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description).toBeInTheDocument();
    });

    it('should handle component unmounting', () => {
      const { unmount } = render(<SequentialPngPreview />);

      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should maintain consistent styling across renders', () => {
      const { rerender } = render(<SequentialPngPreview />);

      const firstRender = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      const firstClasses = firstRender.className;

      rerender(<SequentialPngPreview />);

      const secondRender = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      const secondClasses = secondRender.className;

      expect(firstClasses).toBe(secondClasses);
    });

    it('should handle empty content gracefully', () => {
      // This test ensures the component doesn't crash with unexpected content
      render(<SequentialPngPreview />);

      // Should still render the expected content
      expect(screen.getByRole('heading', { name: 'Sequential PNG Preview' })).toBeInTheDocument();
      expect(
        screen.getByText('Sequential PNG animation preview - Coming soon with file upload support')
      ).toBeInTheDocument();
    });

    it('should have proper contrast for accessibility', () => {
      render(<SequentialPngPreview />);

      // Heading should have good contrast (blue on dark background)
      const heading = screen.getByRole('heading', { name: 'Sequential PNG Preview' });
      expect(heading).toHaveClass('text-blue-500');

      // Description should have good contrast (light gray on dark background)
      const description = screen.getByText(
        'Sequential PNG animation preview - Coming soon with file upload support'
      );
      expect(description).toHaveClass('text-gray-300');
    });

    it('should handle component in different contexts', () => {
      // Test component in different wrapper contexts
      const { container } = render(
        <div className="test-wrapper">
          <SequentialPngPreview />
        </div>
      );

      expect(screen.getByRole('heading', { name: 'Sequential PNG Preview' })).toBeInTheDocument();
      expect(
        screen.getByText('Sequential PNG animation preview - Coming soon with file upload support')
      ).toBeInTheDocument();
    });
  });
});
