import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

import BlogList from './BlogList';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('BlogList Component', () => {
  const mockBlogData = [
    {
      id: '1',
      title: 'Test Blog Post 1',
      excerpt: 'This is a test blog post excerpt',
      date: '2024-01-01',
      tags: ['test', 'blog'],
      slug: 'test-blog-post-1',
    },
    {
      id: '2',
      title: 'Test Blog Post 2',
      excerpt: 'Another test blog post excerpt',
      date: '2024-01-02',
      tags: ['test', 'tutorial'],
      slug: 'test-blog-post-2',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BlogList Component', () => {
    it('should render the blog list component', () => {
      render(<BlogList />);

      expect(screen.getByRole('heading', { name: 'Blog' })).toBeInTheDocument();
      expect(screen.getByText('Latest articles and tutorials')).toBeInTheDocument();
    });

    it('should have proper CSS classes', () => {
      const { container } = render(<BlogList />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('rounded-none', 'bg-gray-800', 'p-6', 'text-white');

      const heading = screen.getByRole('heading', { name: 'Blog' });
      expect(heading).toHaveClass(
        'neue-haas-grotesk-display',
        'mb-4',
        'text-xl',
        'font-bold',
        'text-blue-500'
      );
    });

    it('should render without crashing', () => {
      expect(() => render(<BlogList />)).not.toThrow();
    });

    it('should display loading state initially', () => {
      render(<BlogList />);

      expect(screen.getByText('Loading blog posts...')).toBeInTheDocument();
    });

    it('should display blog posts when data is loaded', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlogData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('Test Blog Post 1')).toBeInTheDocument();
        expect(screen.getByText('Test Blog Post 2')).toBeInTheDocument();
      });
    });

    it('should display error message when fetch fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load blog posts')).toBeInTheDocument();
      });
    });

    it('should display blog post excerpts', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlogData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('This is a test blog post excerpt')).toBeInTheDocument();
        expect(screen.getByText('Another test blog post excerpt')).toBeInTheDocument();
      });
    });

    it('should display blog post dates', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlogData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
        expect(screen.getByText('January 2, 2024')).toBeInTheDocument();
      });
    });

    it('should display blog post tags', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlogData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
        expect(screen.getByText('blog')).toBeInTheDocument();
        expect(screen.getByText('tutorial')).toBeInTheDocument();
      });
    });

    it('should handle empty blog data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('No blog posts found')).toBeInTheDocument();
      });
    });

    it('should handle network error gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load blog posts')).toBeInTheDocument();
      });
    });

    it('should handle malformed JSON response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load blog posts')).toBeInTheDocument();
      });
    });

    it('should handle blog posts with missing fields', async () => {
      const incompleteData = [
        {
          id: '1',
          title: 'Test Post',
          // Missing excerpt, date, tags
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => incompleteData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('Test Post')).toBeInTheDocument();
      });
    });

    it('should display blog post links correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockBlogData,
      });

      render(<BlogList />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/workshop/blog/test-blog-post-1');
        expect(links[1]).toHaveAttribute('href', '/workshop/blog/test-blog-post-2');
      });
    });

    it('should handle blog posts with special characters in titles', async () => {
      const specialData = [
        {
          id: '1',
          title: 'Test & Special Characters: "Quotes" and <Tags>',
          excerpt: 'Special characters test',
          date: '2024-01-01',
          tags: ['test'],
          slug: 'test-special-characters',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => specialData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(
          screen.getByText('Test & Special Characters: "Quotes" and <Tags>')
        ).toBeInTheDocument();
      });
    });

    it('should handle blog posts with long titles', async () => {
      const longTitleData = [
        {
          id: '1',
          title:
            'This is a very long blog post title that should be handled properly by the component without breaking the layout or causing any rendering issues',
          excerpt: 'Long title test',
          date: '2024-01-01',
          tags: ['test'],
          slug: 'long-title-test',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => longTitleData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText(/This is a very long blog post title/)).toBeInTheDocument();
      });
    });

    it('should handle blog posts with multiple tags', async () => {
      const multiTagData = [
        {
          id: '1',
          title: 'Multi-tag Post',
          excerpt: 'Testing multiple tags',
          date: '2024-01-01',
          tags: ['test', 'tutorial', 'guide', 'example'],
          slug: 'multi-tag-post',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => multiTagData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
        expect(screen.getByText('tutorial')).toBeInTheDocument();
        expect(screen.getByText('guide')).toBeInTheDocument();
        expect(screen.getByText('example')).toBeInTheDocument();
      });
    });

    it('should handle blog posts with no tags', async () => {
      const noTagData = [
        {
          id: '1',
          title: 'No Tag Post',
          excerpt: 'Testing no tags',
          date: '2024-01-01',
          tags: [],
          slug: 'no-tag-post',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => noTagData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('No Tag Post')).toBeInTheDocument();
        // Should not crash when there are no tags
      });
    });

    it('should handle blog posts with null or undefined tags', async () => {
      const nullTagData = [
        {
          id: '1',
          title: 'Null Tag Post',
          excerpt: 'Testing null tags',
          date: '2024-01-01',
          tags: null,
          slug: 'null-tag-post',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => nullTagData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('Null Tag Post')).toBeInTheDocument();
        // Should not crash when tags are null
      });
    });

    it('should handle blog posts with invalid dates', async () => {
      const invalidDateData = [
        {
          id: '1',
          title: 'Invalid Date Post',
          excerpt: 'Testing invalid date',
          date: 'invalid-date',
          tags: ['test'],
          slug: 'invalid-date-post',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => invalidDateData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('Invalid Date Post')).toBeInTheDocument();
        // Should handle invalid dates gracefully
      });
    });

    it('should handle blog posts with missing slugs', async () => {
      const noSlugData = [
        {
          id: '1',
          title: 'No Slug Post',
          excerpt: 'Testing no slug',
          date: '2024-01-01',
          tags: ['test'],
          // Missing slug
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => noSlugData,
      });

      render(<BlogList />);

      await waitFor(() => {
        expect(screen.getByText('No Slug Post')).toBeInTheDocument();
        // Should handle missing slugs gracefully
      });
    });
  });
});
