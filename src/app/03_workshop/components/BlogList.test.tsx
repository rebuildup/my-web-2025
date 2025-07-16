/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import BlogList from './BlogList';

// Mock global.fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BlogList Component', () => {
  const mockBlogData = [
    {
      id: '1',
      title: 'Test Post 1',
      excerpt: 'Excerpt 1',
      date: '2024-01-01',
      tags: ['tech'],
      slug: 'p1',
    },
    {
      id: '2',
      title: 'Test Post 2',
      excerpt: 'Excerpt 2',
      date: '2024-01-02',
      tags: ['life'],
      slug: 'p2',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should display loading state initially', () => {
    // Mock a pending promise
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<BlogList />);
    expect(screen.getByText('Loading blog posts...')).toBeInTheDocument();
  });

  it('should display posts when data is loaded', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockBlogData),
    });
    render(<BlogList />);
    await waitFor(() => {
      expect(screen.getByText('Test Post 1')).toBeInTheDocument();
      expect(screen.getByText('Excerpt 2')).toBeInTheDocument();
    });
  });

  it('should display error message when fetch fails with a network error', async () => {
    mockFetch.mockRejectedValue(new Error('Network request failed'));
    render(<BlogList />);
    await waitFor(() => {
      expect(screen.getByText('Network request failed')).toBeInTheDocument();
    });
  });

  it('should display error message when response is not ok', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
    });
    render(<BlogList />);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch blog posts')).toBeInTheDocument();
    });
  });

  it('should handle non-Error objects being thrown', async () => {
    mockFetch.mockRejectedValue('A custom error string');
    render(<BlogList />);
    await waitFor(() => {
      expect(screen.getByText('An unknown error occurred')).toBeInTheDocument();
    });
  });

  it('should handle empty blog data', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    render(<BlogList />);
    await waitFor(() => {
      // Check that the main container is there, but no posts are rendered
      expect(screen.getByText('Blog Posts')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });
});
