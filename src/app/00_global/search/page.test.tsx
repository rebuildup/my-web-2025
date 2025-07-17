import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchPage from './page';
import { search } from '@/lib/search/search-engine';

// Mock the search function
vi.mock('@/lib/search/search-engine', () => ({
  search: vi.fn(),
}));

// Mock the SearchComponent
vi.mock('./SearchComponent', () => ({
  __esModule: true,
  default: ({ initialQuery, initialResults, initialTotal, initialSuggestedQueries }) => (
    <div data-testid="search-component">
      <div data-testid="initial-query">{initialQuery}</div>
      <div data-testid="initial-results">{JSON.stringify(initialResults)}</div>
      <div data-testid="initial-total">{initialTotal}</div>
      <div data-testid="initial-suggested-queries">{JSON.stringify(initialSuggestedQueries)}</div>
    </div>
  ),
}));

describe('SearchPage', () => {
  it('should render the search page with title and description', async () => {
    render(await SearchPage({ searchParams: {} }));

    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('サイト内検索')).toBeInTheDocument();
    expect(screen.getByTestId('search-component')).toBeInTheDocument();
  });

  it('should pass empty initial values when no query is provided', async () => {
    render(await SearchPage({ searchParams: {} }));

    expect(screen.getByTestId('initial-query').textContent).toBe('');
    expect(screen.getByTestId('initial-results').textContent).toBe('[]');
    expect(screen.getByTestId('initial-total').textContent).toBe('0');
    expect(screen.getByTestId('initial-suggested-queries').textContent).toBe('[]');
    expect(search).not.toHaveBeenCalled();
  });

  it('should perform search when query is provided', async () => {
    const mockResults = {
      results: [
        {
          id: 'test',
          title: 'Test Result',
          description: 'Test description',
          url: '/test',
          score: 1,
          highlights: [],
        },
      ],
      total: 1,
      query: 'test',
      limit: 10,
      offset: 0,
      hasMore: false,
      executionTimeMs: 5,
      suggestedQueries: ['test query'],
    };

    (search as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

    render(await SearchPage({ searchParams: { q: 'test' } }));

    expect(screen.getByTestId('initial-query').textContent).toBe('test');
    expect(JSON.parse(screen.getByTestId('initial-results').textContent!)).toEqual(
      mockResults.results
    );
    expect(screen.getByTestId('initial-total').textContent).toBe('1');
    expect(JSON.parse(screen.getByTestId('initial-suggested-queries').textContent!)).toEqual([
      'test query',
    ]);
    expect(search).toHaveBeenCalledWith(expect.objectContaining({ query: 'test' }));
  });

  it('should handle search parameters', async () => {
    const mockResults = {
      results: [],
      total: 0,
      query: 'test',
      limit: 5,
      offset: 10,
      hasMore: false,
      executionTimeMs: 5,
      suggestedQueries: [],
    };

    (search as ReturnType<typeof vi.fn>).mockResolvedValue(mockResults);

    render(
      await SearchPage({
        searchParams: {
          q: 'test',
          type: ['blog', 'portfolio'],
          category: 'design',
          limit: '5',
          offset: '10',
        },
      })
    );

    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'test',
        contentTypes: ['blog', 'portfolio'],
        categories: ['design'],
        limit: 5,
        offset: 10,
      })
    );
  });

  it('should handle search errors gracefully', async () => {
    (search as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Search failed'));

    // Spy on console.error to prevent error output in tests
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(await SearchPage({ searchParams: { q: 'test' } }));

    expect(screen.getByTestId('initial-results').textContent).toBe('[]');
    expect(screen.getByTestId('initial-total').textContent).toBe('0');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
