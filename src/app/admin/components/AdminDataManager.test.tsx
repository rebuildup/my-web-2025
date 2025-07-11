import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdminDataManager from './AdminDataManager';

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

describe('AdminDataManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the admin data manager', () => {
    render(<AdminDataManager />);

    expect(screen.getByText('Admin Data Manager')).toBeInTheDocument();
    expect(screen.getByText('Content Management')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
  });

  it('should load and display content data', async () => {
    const mockContentData = [
      {
        id: 1,
        title: 'Test Content 1',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-01',
        status: 'published',
      },
      {
        id: 2,
        title: 'Test Content 2',
        type: 'blog',
        category: 'design',
        date: '2024-01-02',
        status: 'draft',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContentData,
    });

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Content 1')).toBeInTheDocument();
      expect(screen.getByText('Test Content 2')).toBeInTheDocument();
    });
  });

  it('should handle content loading error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load content')).toBeInTheDocument();
    });
  });

  it('should filter content by type', async () => {
    const user = userEvent.setup();
    const mockContentData = [
      {
        id: 1,
        title: 'Web Project',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-01',
        status: 'published',
      },
      {
        id: 2,
        title: 'Blog Post',
        type: 'blog',
        category: 'design',
        date: '2024-01-02',
        status: 'published',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContentData,
    });

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('Web Project')).toBeInTheDocument();
      expect(screen.getByText('Blog Post')).toBeInTheDocument();
    });

    const typeFilter = screen.getByLabelText('Filter by type');
    await user.selectOptions(typeFilter, 'portfolio');

    expect(screen.getByText('Web Project')).toBeInTheDocument();
    expect(screen.queryByText('Blog Post')).not.toBeInTheDocument();
  });

  it('should filter content by category', async () => {
    const user = userEvent.setup();
    const mockContentData = [
      {
        id: 1,
        title: 'Web Project',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-01',
        status: 'published',
      },
      {
        id: 2,
        title: 'Design Project',
        type: 'portfolio',
        category: 'design',
        date: '2024-01-02',
        status: 'published',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContentData,
    });

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('Web Project')).toBeInTheDocument();
      expect(screen.getByText('Design Project')).toBeInTheDocument();
    });

    const categoryFilter = screen.getByLabelText('Filter by category');
    await user.selectOptions(categoryFilter, 'web');

    expect(screen.getByText('Web Project')).toBeInTheDocument();
    expect(screen.queryByText('Design Project')).not.toBeInTheDocument();
  });

  it('should search content by title', async () => {
    const user = userEvent.setup();
    const mockContentData = [
      {
        id: 1,
        title: 'React Project',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-01',
        status: 'published',
      },
      {
        id: 2,
        title: 'Vue Project',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-02',
        status: 'published',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContentData,
    });

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('React Project')).toBeInTheDocument();
      expect(screen.getByText('Vue Project')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search content...');
    await user.type(searchInput, 'React');

    expect(screen.getByText('React Project')).toBeInTheDocument();
    expect(screen.queryByText('Vue Project')).not.toBeInTheDocument();
  });

  it('should handle content editing', async () => {
    const user = userEvent.setup();
    const mockContentData = [
      {
        id: 1,
        title: 'Test Content 1',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-01',
        status: 'published',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContentData,
    });

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Content 1')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByText('Edit Content')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Content 1')).toBeInTheDocument();
  });

  it('should handle content deletion', async () => {
    const user = userEvent.setup();
    const mockContentData = [
      {
        id: 1,
        title: 'Test Content 1',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-01',
        status: 'published',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContentData,
    });

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Content 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(screen.getByText('Are you sure you want to delete this content?')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: 'Delete' });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Content deleted successfully')).toBeInTheDocument();
    });
  });

  it('should handle content status updates', async () => {
    const user = userEvent.setup();
    const mockContentData = [
      {
        id: 1,
        title: 'Test Content 1',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-01',
        status: 'draft',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContentData,
    });

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Content 1')).toBeInTheDocument();
    });

    const statusSelect = screen.getByDisplayValue('draft');
    await user.selectOptions(statusSelect, 'published');

    await waitFor(() => {
      expect(screen.getByText('Status updated successfully')).toBeInTheDocument();
    });
  });

  it('should display statistics', async () => {
    const mockStats = {
      totalContent: 10,
      publishedContent: 7,
      draftContent: 3,
      portfolioItems: 5,
      blogPosts: 3,
      tools: 2,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats,
    });

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should handle statistics loading error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch stats'));

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
    });
  });

  it('should handle form reset', async () => {
    const user = userEvent.setup();
    render(<AdminDataManager />);

    const resetButton = screen.getByRole('button', { name: 'Reset' });
    await user.click(resetButton);

    expect(screen.getByText('Form reset successfully')).toBeInTheDocument();
  });

  it('should handle bulk operations', async () => {
    const user = userEvent.setup();
    const mockContentData = [
      {
        id: 1,
        title: 'Test Content 1',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-01',
        status: 'draft',
      },
      {
        id: 2,
        title: 'Test Content 2',
        type: 'portfolio',
        category: 'web',
        date: '2024-01-02',
        status: 'draft',
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockContentData,
    });

    render(<AdminDataManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Content 1')).toBeInTheDocument();
      expect(screen.getByText('Test Content 2')).toBeInTheDocument();
    });

    const selectAllCheckbox = screen.getByLabelText('Select all');
    await user.click(selectAllCheckbox);

    const bulkPublishButton = screen.getByRole('button', { name: 'Publish Selected' });
    await user.click(bulkPublishButton);

    await waitFor(() => {
      expect(screen.getByText('Bulk operation completed')).toBeInTheDocument();
    });
  });
});
