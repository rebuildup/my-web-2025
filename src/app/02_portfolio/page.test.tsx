import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PortfolioPage from './page';
import { getContentByType } from '@/lib/utils/content-loader';
import type { ContentItem } from '@/types/content';

// Mock dependencies
vi.mock('@/lib/utils/content-loader', () => ({
  getContentByType: vi.fn(),
}));

vi.mock('./components/PortfolioGallery', () => ({
  __esModule: true,
  default: ({
    initialItems,
    initialCategory,
  }: {
    initialItems: unknown;
    initialCategory: string;
  }) => (
    <div data-testid="portfolio-gallery">
      <div data-testid="initial-items">{JSON.stringify(initialItems)}</div>
      <div data-testid="initial-category">{initialCategory}</div>
    </div>
  ),
}));

describe('PortfolioPage', () => {
  const mockItems: ContentItem[] = [
    {
      id: 'portfolio-1',
      type: 'portfolio' as import('@/types/content').ContentType,
      title: 'Test Portfolio Item',
      description: 'Test description',
      category: 'develop',
      tags: ['test'],
      status: 'published',
      priority: 50,
      createdAt: '2024-01-01T12:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (getContentByType as ReturnType<typeof vi.fn>).mockResolvedValue(mockItems);
  });

  it('should render the portfolio page with title and description', async () => {
    render(await PortfolioPage({ searchParams: {} }));

    expect(screen.getByText('Portfolio')).toBeInTheDocument();
    expect(screen.getByText('ポートフォリオ')).toBeInTheDocument();
    expect(screen.getByTestId('portfolio-gallery')).toBeInTheDocument();
  });

  it('should pass portfolio items to gallery component', async () => {
    render(await PortfolioPage({ searchParams: {} }));

    const itemsElement = screen.getByTestId('initial-items');
    const items = JSON.parse(itemsElement.textContent || '[]');

    expect(items).toEqual(mockItems);
    expect(getContentByType).toHaveBeenCalledWith('portfolio', expect.any(Object));
  });

  it('should pass category from search params', async () => {
    render(await PortfolioPage({ searchParams: { category: 'design' } }));

    expect(screen.getByTestId('initial-category').textContent).toBe('design');
  });

  it('should default to "all" category if not specified', async () => {
    render(await PortfolioPage({ searchParams: {} }));

    expect(screen.getByTestId('initial-category').textContent).toBe('all');
  });
});
