import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDataManager from './AdminDataManager';

// Mock the fetch function
global.fetch = vi.fn();

// Mock file system operations
const mockFileSystem = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  exists: vi.fn(),
  mkdir: vi.fn(),
};

// Mock the fs module
vi.mock('fs', () => ({
  promises: mockFileSystem,
}));

describe('AdminDataManager Component', () => {
  const mockContentData = [
    {
      id: '1',
      title: 'Test Content 1',
      type: 'video',
      category: 'portfolio',
      description: 'Test description 1',
      url: 'https://example.com/video1',
      thumbnail: '/images/thumb1.jpg',
      tags: ['test', 'video'],
      date: '2024-01-01',
    },
    {
      id: '2',
      title: 'Test Content 2',
      type: 'image',
      category: 'portfolio',
      description: 'Test description 2',
      url: 'https://example.com/image2',
      thumbnail: '/images/thumb2.jpg',
      tags: ['test', 'image'],
      date: '2024-01-02',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset file system mocks
    mockFileSystem.readFile.mockReset();
    mockFileSystem.writeFile.mockReset();
    mockFileSystem.exists.mockReset();
    mockFileSystem.mkdir.mockReset();
  });

  describe('AdminDataManager Component', () => {
    it('should render the admin data manager component', () => {
      render(<AdminDataManager />);

      expect(screen.getByRole('heading', { name: 'Content Data Manager' })).toBeInTheDocument();
      expect(screen.getByText('Manage portfolio, tools, and workshop content')).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<AdminDataManager />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = screen.getByRole('heading', { name: 'Content Data Manager' });
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<AdminDataManager />)).not.toThrow();
    });

    it('should display content type tabs', () => {
      render(<AdminDataManager />);

      expect(screen.getByRole('tab', { name: 'Portfolio' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Tools' })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: 'Workshop' })).toBeInTheDocument();
    });

    it('should display add content form', () => {
      render(<AdminDataManager />);

      expect(screen.getByText('Add New Content')).toBeInTheDocument();
      expect(screen.getByLabelText('Title *')).toBeInTheDocument();
      expect(screen.getByLabelText('Type *')).toBeInTheDocument();
      expect(screen.getByLabelText('Category *')).toBeInTheDocument();
      expect(screen.getByLabelText('Description')).toBeInTheDocument();
      expect(screen.getByLabelText('URL')).toBeInTheDocument();
      expect(screen.getByLabelText('Thumbnail')).toBeInTheDocument();
      expect(screen.getByLabelText('Tags (comma-separated)')).toBeInTheDocument();
    });

    it('should display content list', () => {
      render(<AdminDataManager />);

      expect(screen.getByText('Content List')).toBeInTheDocument();
      expect(screen.getByText('No content found')).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Fill out the form
      await user.type(screen.getByLabelText('Title *'), 'Test Content');
      await user.selectOptions(screen.getByLabelText('Type *'), 'video');
      await user.selectOptions(screen.getByLabelText('Category *'), 'portfolio');
      await user.type(screen.getByLabelText('Description'), 'Test description');
      await user.type(screen.getByLabelText('URL'), 'https://example.com/test');
      await user.type(screen.getByLabelText('Thumbnail'), '/images/test.jpg');
      await user.type(screen.getByLabelText('Tags (comma-separated)'), 'test, video');

      // Submit the form
      await user.click(screen.getByRole('button', { name: 'Add Content' }));

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Content added successfully')).toBeInTheDocument();
      });
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Try to submit without required fields
      await user.click(screen.getByRole('button', { name: 'Add Content' }));

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
        expect(screen.getByText('Type is required')).toBeInTheDocument();
        expect(screen.getByText('Category is required')).toBeInTheDocument();
      });
    });

    it('should handle content deletion', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Mock content data
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContentData,
      });

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Test Content 1')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      // Should show confirmation dialog
      expect(screen.getByText('Are you sure you want to delete this content?')).toBeInTheDocument();

      // Confirm deletion
      await user.click(screen.getByRole('button', { name: 'Delete' }));

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText('Content deleted successfully')).toBeInTheDocument();
      });
    });

    it('should handle content editing', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Mock content data
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContentData,
      });

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Test Content 1')).toBeInTheDocument();
      });

      // Click edit button
      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      await user.click(editButtons[0]);

      // Should populate form with content data
      expect(screen.getByDisplayValue('Test Content 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test description 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('https://example.com/video1')).toBeInTheDocument();
    });

    it('should handle file upload', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Mock file input
      const file = new File(['test content'], 'test.json', { type: 'application/json' });
      const fileInput = screen.getByLabelText('Upload JSON File');

      await user.upload(fileInput, file);

      // Should show file name
      expect(screen.getByText('test.json')).toBeInTheDocument();
    });

    it('should handle JSON export', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Mock content data
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContentData,
      });

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Test Content 1')).toBeInTheDocument();
      });

      // Click export button
      await user.click(screen.getByRole('button', { name: 'Export JSON' }));

      // Should trigger download
      await waitFor(() => {
        expect(screen.getByText('JSON exported successfully')).toBeInTheDocument();
      });
    });

    it('should handle tab switching', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Click on Tools tab
      await user.click(screen.getByRole('tab', { name: 'Tools' }));

      // Should show tools content
      expect(screen.getByText('Tools Content')).toBeInTheDocument();

      // Click on Workshop tab
      await user.click(screen.getByRole('tab', { name: 'Workshop' }));

      // Should show workshop content
      expect(screen.getByText('Workshop Content')).toBeInTheDocument();
    });

    it('should handle search functionality', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Mock content data
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContentData,
      });

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Test Content 1')).toBeInTheDocument();
      });

      // Search for content
      await user.type(screen.getByPlaceholderText('Search content...'), 'Test Content 1');

      // Should filter results
      expect(screen.getByText('Test Content 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Content 2')).not.toBeInTheDocument();
    });

    it('should handle bulk operations', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Mock content data
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContentData,
      });

      // Wait for content to load
      await waitFor(() => {
        expect(screen.getByText('Test Content 1')).toBeInTheDocument();
      });

      // Select multiple items
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[1]); // Select first content item
      await user.click(checkboxes[2]); // Select second content item

      // Click bulk delete
      await user.click(screen.getByRole('button', { name: 'Bulk Delete' }));

      // Should show confirmation
      expect(screen.getByText('Are you sure you want to delete 2 items?')).toBeInTheDocument();
    });

    it('should handle form reset', async () => {
      const user = userEvent.setup();
      render(<AdminDataManager />);

      // Fill out the form
      await user.type(screen.getByLabelText('Title *'), 'Test Content');
      await user.type(screen.getByLabelText('Description'), 'Test description');

      // Reset the form
      await user.click(screen.getByRole('button', { name: 'Reset' }));

      // Form should be cleared
      expect(screen.getByLabelText('Title *')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
    });

    it('should handle network errors gracefully', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load content')).toBeInTheDocument();
      });
    });

    it('should handle malformed JSON data', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load content')).toBeInTheDocument();
      });
    });

    it('should handle content with missing fields', async () => {
      const incompleteData = [
        {
          id: '1',
          title: 'Test Content',
          // Missing other fields
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteData,
      });

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });

    it('should handle content with special characters', async () => {
      const specialData = [
        {
          id: '1',
          title: 'Test & Special Content: "Quotes" and <Tags>',
          type: 'video',
          category: 'portfolio',
          description: 'Special characters test',
          url: 'https://example.com/test',
          thumbnail: '/images/test.jpg',
          tags: ['test', 'special'],
          date: '2024-01-01',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => specialData,
      });

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText('Test & Special Content: "Quotes" and <Tags>')).toBeInTheDocument();
      });
    });

    it('should handle content with long titles', async () => {
      const longTitleData = [
        {
          id: '1',
          title:
            'This is a very long content title that should be handled properly by the component without breaking the layout or causing any rendering issues',
          type: 'video',
          category: 'portfolio',
          description: 'Long title test',
          url: 'https://example.com/test',
          thumbnail: '/images/test.jpg',
          tags: ['test', 'long'],
          date: '2024-01-01',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => longTitleData,
      });

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText(/This is a very long content title/)).toBeInTheDocument();
      });
    });

    it('should handle content with multiple tags', async () => {
      const multiTagData = [
        {
          id: '1',
          title: 'Multi-tag Content',
          type: 'video',
          category: 'portfolio',
          description: 'Testing multiple tags',
          url: 'https://example.com/test',
          thumbnail: '/images/test.jpg',
          tags: ['test', 'video', 'tutorial', 'example'],
          date: '2024-01-01',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => multiTagData,
      });

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
        expect(screen.getByText('video')).toBeInTheDocument();
        expect(screen.getByText('tutorial')).toBeInTheDocument();
        expect(screen.getByText('example')).toBeInTheDocument();
      });
    });

    it('should handle content with no tags', async () => {
      const noTagData = [
        {
          id: '1',
          title: 'No Tag Content',
          type: 'video',
          category: 'portfolio',
          description: 'Testing no tags',
          url: 'https://example.com/test',
          thumbnail: '/images/test.jpg',
          tags: [],
          date: '2024-01-01',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => noTagData,
      });

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText('No Tag Content')).toBeInTheDocument();
        // Should not crash when there are no tags
      });
    });

    it('should handle content with null or undefined tags', async () => {
      const nullTagData = [
        {
          id: '1',
          title: 'Null Tag Content',
          type: 'video',
          category: 'portfolio',
          description: 'Testing null tags',
          url: 'https://example.com/test',
          thumbnail: '/images/test.jpg',
          tags: null,
          date: '2024-01-01',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => nullTagData,
      });

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText('Null Tag Content')).toBeInTheDocument();
        // Should not crash when tags are null
      });
    });

    it('should handle content with invalid dates', async () => {
      const invalidDateData = [
        {
          id: '1',
          title: 'Invalid Date Content',
          type: 'video',
          category: 'portfolio',
          description: 'Testing invalid date',
          url: 'https://example.com/test',
          thumbnail: '/images/test.jpg',
          tags: ['test'],
          date: 'invalid-date',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => invalidDateData,
      });

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText('Invalid Date Content')).toBeInTheDocument();
        // Should handle invalid dates gracefully
      });
    });

    it('should handle content with missing URLs', async () => {
      const noUrlData = [
        {
          id: '1',
          title: 'No URL Content',
          type: 'video',
          category: 'portfolio',
          description: 'Testing no URL',
          url: '',
          thumbnail: '/images/test.jpg',
          tags: ['test'],
          date: '2024-01-01',
        },
      ];

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => noUrlData,
      });

      render(<AdminDataManager />);

      await waitFor(() => {
        expect(screen.getByText('No URL Content')).toBeInTheDocument();
        // Should handle missing URLs gracefully
      });
    });
  });
});
