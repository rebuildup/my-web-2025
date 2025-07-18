import React from 'react';
import { render } from '@testing-library/react';
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
  it('should render without crashing', async () => {
    const { container } = render(await SearchPage({ searchParams: {} }));
    console.log(container.innerHTML);
    expect(container).toBeTruthy();
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

  it('should render search page elements', async () => {
    const { container } = render(await SearchPage({ searchParams: {} }));

    // Check for main elements
    const heading = container.querySelector('h1');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe('Search');

    const description = container.querySelector('.text-foreground\\/70');
    expect(description).toBeInTheDocument();
    expect(description?.textContent).toBe('サイト内検索');

    const searchComponent = container.querySelector('[data-testid="search-component"]');
    expect(searchComponent).toBeInTheDocument();
  });
});
