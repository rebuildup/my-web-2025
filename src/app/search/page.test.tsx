import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchPage from './page';

// Mock the fetch function
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('SearchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the search page', () => {
    render(<SearchPage />);

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for content...')).toBeInTheDocument();
  });

  it('should display search results', async () => {
    const mockSearchResults = [
      {
        id: 1,
        title: 'React Tutorial',
        type: 'blog',
        category: 'portfolio',
        description: 'Learn React basics',
        url: '/blog/react-tutorial',
        tags: ['React', 'JavaScript'],
      },
      {
        id: 2,
        title: 'Vue.js Project',
        type: 'portfolio',
        category: 'web',
        description: 'A Vue.js application',
        url: '/portfolio/vue-project',
        tags: ['Vue.js', 'JavaScript'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await userEvent.type(searchInput, 'React');

    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
      expect(screen.getByText('Vue.js Project')).toBeInTheDocument();
    });
  });

  it('should filter by category', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'React Tutorial',
        type: 'blog',
        category: 'portfolio',
        description: 'Learn React basics',
        url: '/blog/react-tutorial',
        tags: ['React', 'JavaScript'],
      },
      {
        id: 2,
        title: 'Vue.js Project',
        type: 'portfolio',
        category: 'web',
        description: 'A Vue.js application',
        url: '/portfolio/vue-project',
        tags: ['Vue.js', 'JavaScript'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'React');

    const categorySelect = screen.getByLabelText('Category');
    await user.selectOptions(categorySelect, 'portfolio');

    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
      expect(screen.queryByText('Vue.js Project')).not.toBeInTheDocument();
    });
  });

  it('should filter by type', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'React Tutorial',
        type: 'blog',
        category: 'portfolio',
        description: 'Learn React basics',
        url: '/blog/react-tutorial',
        tags: ['React', 'JavaScript'],
      },
      {
        id: 2,
        title: 'Vue.js Project',
        type: 'portfolio',
        category: 'web',
        description: 'A Vue.js application',
        url: '/portfolio/vue-project',
        tags: ['Vue.js', 'JavaScript'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'React');

    const typeSelect = screen.getByLabelText('Type');
    await user.selectOptions(typeSelect, 'blog');

    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
      expect(screen.queryByText('Vue.js Project')).not.toBeInTheDocument();
    });
  });

  it('should handle search button click', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'React Tutorial',
        type: 'blog',
        category: 'portfolio',
        description: 'Learn React basics',
        url: '/blog/react-tutorial',
        tags: ['React', 'JavaScript'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'React');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
    });
  });

  it('should handle Enter key press', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'React Tutorial',
        type: 'blog',
        category: 'portfolio',
        description: 'Learn React basics',
        url: '/blog/react-tutorial',
        tags: ['React', 'JavaScript'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'React');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
    });
  });

  it('should handle empty search results', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'nonexistent');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
  });

  it('should handle search error', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error('Search failed'));

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'React');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to search')).toBeInTheDocument();
    });
  });

  it('should handle keyword suggestions', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'React Tutorial',
        type: 'blog',
        category: 'portfolio',
        description: 'Learn React basics',
        url: '/blog/react-tutorial',
        tags: ['React', 'JavaScript'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'React');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
    });

    const reactKeyword = screen.getByText('React');
    await user.click(reactKeyword);

    // Should trigger a new search with the clicked keyword
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle search with filters', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'React Tutorial',
        type: 'blog',
        category: 'portfolio',
        description: 'Learn React basics',
        url: '/blog/react-tutorial',
        tags: ['React', 'JavaScript'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'React');

    const categorySelect = screen.getByLabelText('Category');
    await user.selectOptions(categorySelect, 'portfolio');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
    });
  });

  it('should handle search with type filter', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'React Tutorial',
        type: 'blog',
        category: 'portfolio',
        description: 'Learn React basics',
        url: '/blog/react-tutorial',
        tags: ['React', 'JavaScript'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'React');

    const typeSelect = screen.getByLabelText('Type');
    await user.selectOptions(typeSelect, 'blog');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('React Tutorial')).toBeInTheDocument();
    });
  });

  it('should handle search with whitespace', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'React Tutorial',
        type: 'blog',
        category: 'portfolio',
        description: 'Learn React basics',
        url: '/blog/react-tutorial',
        tags: ['React', 'JavaScript'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, '   ');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a search term')).toBeInTheDocument();
    });
  });

  it('should handle search with special characters', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'Color Palette Tool',
        type: 'tool',
        category: 'design',
        description: 'A color palette generator',
        url: '/tools/color-palette',
        tags: ['Color', 'Design'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'Color');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Color Palette Tool')).toBeInTheDocument();
    });
  });

  it('should handle search with numbers', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'Project 2024',
        type: 'portfolio',
        category: 'web',
        description: 'A project from 2024',
        url: '/portfolio/project-2024',
        tags: ['2024', 'Project'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, '2024');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Project 2024')).toBeInTheDocument();
    });
  });

  it('should handle search with mixed content', async () => {
    const user = userEvent.setup();
    const mockSearchResults = [
      {
        id: 1,
        title: 'Hello 123! 😀',
        type: 'blog',
        category: 'portfolio',
        description: 'A blog post with mixed content',
        url: '/blog/hello-123',
        tags: ['Hello', '123', 'Emoji'],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    render(<SearchPage />);

    const searchInput = screen.getByPlaceholderText('Search for content...');
    await user.type(searchInput, 'Hello 123! 😀');

    const searchButton = screen.getByRole('button', { name: 'Search' });
    await user.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText('Hello 123! 😀')).toBeInTheDocument();
    });
  });
});
