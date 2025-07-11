import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextCounter from './TextCounter';

describe('TextCounter Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('TextCounter Component', () => {
    it('should render the Text Counter component', () => {
      render(<TextCounter />);

      expect(screen.getByRole('heading', { name: 'Text Counter' })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your text here...')).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<TextCounter />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = screen.getByRole('heading', { name: 'Text Counter' });
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<TextCounter />)).not.toThrow();
    });

    it('should display initial counter values', () => {
      render(<TextCounter />);

      expect(screen.getByText('Characters: 0')).toBeInTheDocument();
      expect(screen.getByText('Words: 0')).toBeInTheDocument();
      expect(screen.getByText('Lines: 0')).toBeInTheDocument();
      expect(screen.getByText('Sentences: 0')).toBeInTheDocument();
      expect(screen.getByText('Paragraphs: 0')).toBeInTheDocument();
    });

    it('should update character count when text is entered', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello');

      expect(screen.getByText('Characters: 5')).toBeInTheDocument();
    });

    it('should update word count when text is entered', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello world');

      expect(screen.getByText('Words: 2')).toBeInTheDocument();
    });

    it('should update line count when text is entered', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Line 1\nLine 2');

      expect(screen.getByText('Lines: 2')).toBeInTheDocument();
    });

    it('should update sentence count when text is entered', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello. World. Test.');

      expect(screen.getByText('Sentences: 3')).toBeInTheDocument();
    });

    it('should update paragraph count when text is entered', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Paragraph 1.\n\nParagraph 2.');

      expect(screen.getByText('Paragraphs: 2')).toBeInTheDocument();
    });

    it('should handle empty text correctly', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.clear(textarea);

      expect(screen.getByText('Characters: 0')).toBeInTheDocument();
      expect(screen.getByText('Words: 0')).toBeInTheDocument();
      expect(screen.getByText('Lines: 0')).toBeInTheDocument();
      expect(screen.getByText('Sentences: 0')).toBeInTheDocument();
      expect(screen.getByText('Paragraphs: 0')).toBeInTheDocument();
    });

    it('should handle whitespace correctly', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, '   \n\n   ');

      expect(screen.getByText('Characters: 6')).toBeInTheDocument();
      expect(screen.getByText('Words: 0')).toBeInTheDocument();
      expect(screen.getByText('Lines: 3')).toBeInTheDocument();
    });

    it('should handle special characters correctly', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello! @#$%^&*()');

      expect(screen.getByText('Characters: 18')).toBeInTheDocument();
      expect(screen.getByText('Words: 2')).toBeInTheDocument();
    });

    it('should handle mixed content correctly', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(
        textarea,
        'Hello world.\n\nThis is a test. It has multiple sentences.\n\nAnd paragraphs.'
      );

      expect(screen.getByText('Characters: 75')).toBeInTheDocument();
      expect(screen.getByText('Words: 12')).toBeInTheDocument();
      expect(screen.getByText('Lines: 5')).toBeInTheDocument();
      expect(screen.getByText('Sentences: 3')).toBeInTheDocument();
      expect(screen.getByText('Paragraphs: 3')).toBeInTheDocument();
    });

    it('should have proper textarea styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass(
        'w-full',
        'min-h-[200px]',
        'rounded-none',
        'border',
        'border-gray-600',
        'bg-gray-700',
        'p-4',
        'text-white',
        'placeholder-gray-400',
        'focus:border-blue-500',
        'focus:outline-none',
        'resize-none'
      );
    });

    it('should have proper counter styling', () => {
      render(<TextCounter />);

      const counters = screen.getAllByText(/Characters:|Words:|Lines:|Sentences:|Paragraphs:/);
      counters.forEach(counter => {
        expect(counter).toHaveClass('text-sm', 'text-gray-300');
      });
    });

    it('should have proper container styling', () => {
      const { container } = render(<TextCounter />);

      const counterContainer = container.querySelector('.grid');
      expect(counterContainer).toHaveClass('grid', 'grid-cols-2', 'gap-4', 'mt-4');
    });

    it('should handle rapid text changes', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');

      await userEvent.type(textarea, 'Hello');
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'World');
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Final');

      expect(screen.getByText('Characters: 5')).toBeInTheDocument();
      expect(screen.getByText('Words: 1')).toBeInTheDocument();
    });

    it('should handle very long text', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      const longText = 'A'.repeat(1000);
      await userEvent.type(textarea, longText);

      expect(screen.getByText('Characters: 1000')).toBeInTheDocument();
    });

    it('should handle unicode characters correctly', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'こんにちは世界！');

      expect(screen.getByText('Characters: 7')).toBeInTheDocument();
      expect(screen.getByText('Words: 1')).toBeInTheDocument();
    });

    it('should handle emoji characters correctly', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello 😀 World 🌍');

      expect(screen.getByText('Characters: 15')).toBeInTheDocument();
      expect(screen.getByText('Words: 3')).toBeInTheDocument();
    });

    it('should maintain focus after text changes', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.click(textarea);
      await userEvent.type(textarea, 'Test');

      expect(textarea).toHaveFocus();
    });

    it('should handle copy and paste operations', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');

      // Simulate paste operation
      const pasteData = new DataTransfer();
      pasteData.setData('text/plain', 'Pasted text with multiple words');

      fireEvent.paste(textarea, { clipboardData: pasteData });

      await waitFor(() => {
        expect(screen.getByText('Characters: 33')).toBeInTheDocument();
        expect(screen.getByText('Words: 5')).toBeInTheDocument();
      });
    });

    it('should handle keyboard shortcuts', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello');

      // Test Ctrl+A (select all)
      await userEvent.keyboard('{Control>}a{/Control}');
      await userEvent.type(textarea, 'Replaced');

      expect(screen.getByText('Characters: 8')).toBeInTheDocument();
      expect(screen.getByText('Words: 1')).toBeInTheDocument();
    });

    it('should handle text selection', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello world');

      // Select "world" and replace it
      (textarea as HTMLTextAreaElement).setSelectionRange(6, 11);
      await userEvent.type(textarea, 'universe');

      expect(screen.getByText('Characters: 12')).toBeInTheDocument();
      expect(screen.getByText('Words: 2')).toBeInTheDocument();
    });

    it('should handle undo/redo operations', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello');

      // Test undo (Ctrl+Z)
      await userEvent.keyboard('{Control>}z{/Control}');

      expect(screen.getByText('Characters: 0')).toBeInTheDocument();
    });

    it('should handle text with multiple spaces', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello    world');

      expect(screen.getByText('Words: 2')).toBeInTheDocument();
    });

    it('should handle text with tabs', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello\tworld');

      expect(screen.getByText('Characters: 10')).toBeInTheDocument();
      expect(screen.getByText('Words: 2')).toBeInTheDocument();
    });

    it('should handle text with mixed line endings', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Line 1\r\nLine 2\nLine 3');

      expect(screen.getByText('Lines: 3')).toBeInTheDocument();
    });

    it('should handle text with only punctuation', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, '...!!!???');

      expect(screen.getByText('Characters: 9')).toBeInTheDocument();
      expect(screen.getByText('Words: 0')).toBeInTheDocument();
      expect(screen.getByText('Sentences: 3')).toBeInTheDocument();
    });

    it('should handle text with numbers', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, '123 456 789');

      expect(screen.getByText('Characters: 11')).toBeInTheDocument();
      expect(screen.getByText('Words: 3')).toBeInTheDocument();
    });

    it('should handle text with mixed content types', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.type(textarea, 'Hello 123! 😀\n\nWorld 456? 🌍');

      expect(screen.getByText('Characters: 25')).toBeInTheDocument();
      expect(screen.getByText('Words: 4')).toBeInTheDocument();
      expect(screen.getByText('Lines: 3')).toBeInTheDocument();
      expect(screen.getByText('Sentences: 2')).toBeInTheDocument();
      expect(screen.getByText('Paragraphs: 2')).toBeInTheDocument();
    });

    it('should be accessible with proper ARIA labels', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveAttribute('aria-label', 'Text input for counting');
    });

    it('should have proper heading structure', () => {
      render(<TextCounter />);

      const heading = screen.getByRole('heading', { name: 'Text Counter' });
      expect(heading.tagName).toBe('H2');
    });

    it('should handle textarea resize', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveStyle({ resize: 'none' });
    });

    it('should have proper contrast for accessibility', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('text-white', 'placeholder-gray-400');
    });

    it('should handle textarea focus states', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.click(textarea);

      expect(textarea).toHaveClass('focus:border-blue-500', 'focus:outline-none');
    });

    it('should handle textarea blur states', async () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      await userEvent.click(textarea);
      await userEvent.tab();

      expect(textarea).not.toHaveFocus();
    });

    it('should handle textarea with minimum height', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('min-h-[200px]');
    });

    it('should handle textarea with proper padding', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('p-4');
    });

    it('should handle textarea with proper border', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('border', 'border-gray-600');
    });

    it('should handle textarea with proper background', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('bg-gray-700');
    });

    it('should handle textarea with proper width', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('w-full');
    });

    it('should handle textarea with proper rounded corners', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('rounded-none');
    });

    it('should handle counter grid layout', () => {
      const { container } = render(<TextCounter />);

      const grid = container.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-2', 'gap-4', 'mt-4');
    });

    it('should handle counter text styling', () => {
      render(<TextCounter />);

      const counters = screen.getAllByText(/Characters:|Words:|Lines:|Sentences:|Paragraphs:/);
      counters.forEach(counter => {
        expect(counter).toHaveClass('text-sm', 'text-gray-300');
      });
    });

    it('should handle main container styling', () => {
      const { container } = render(<TextCounter />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');
    });

    it('should handle heading styling', () => {
      render(<TextCounter />);

      const heading = screen.getByRole('heading', { name: 'Text Counter' });
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should handle textarea placeholder styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('placeholder-gray-400');
    });

    it('should handle textarea focus styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('focus:border-blue-500', 'focus:outline-none');
    });

    it('should handle textarea resize styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('resize-none');
    });

    it('should handle textarea minimum height styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('min-h-[200px]');
    });

    it('should handle textarea width styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('w-full');
    });

    it('should handle textarea padding styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('p-4');
    });

    it('should handle textarea border styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('border', 'border-gray-600');
    });

    it('should handle textarea background styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('bg-gray-700');
    });

    it('should handle textarea text color styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('text-white');
    });

    it('should handle textarea rounded corners styling', () => {
      render(<TextCounter />);

      const textarea = screen.getByPlaceholderText('Enter your text here...');
      expect(textarea).toHaveClass('rounded-none');
    });
  });
});
