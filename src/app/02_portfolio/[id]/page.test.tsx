import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PortfolioDetailPage, { generateMetadata } from './page';
import { getContentByType } from '@/lib/utils/content-loader';
import { trackStat } from '@/lib/stats';
import { notFound } from 'next/navigation';

// Mock dependencies
vi.mock('@/lib/utils/content-loader', () => ({
  getContentByType: vi.fn(),
}));

vi.mock('@/lib/stats', () => ({
  trackStat: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}));

vi.mock('../components/PortfolioDetail', () => ({
  __esModule: true,
  default: ({ item }: { item: { title: string; description: string } }) => (
    <div data-testid="portfolio-detail">
      <h1>{item.title}</h1>
      <p>{item.description}</p>
    </div>
  ),
}));

describe('PortfolioDetailPage', () => {
  const mockItem = {
    id: 'portfolio-1',
    type: 'portfolio',
    title: 'Test Portfolio Item',
    description: 'Test description',
    category: 'develop',
    tags: ['test'],
    status: 'published',
    priority: 50,
    createdAt: '2024-01-01T12:00:00Z',
  };

  beforeEach(() => {
    vi.resetAllMocks();
    (getContentByType as ReturnType<typeof vi.fn>).mockResolvedValue([mockItem]);
    (trackStat as ReturnType<typeof vi.fn>).mockResolvedValue(1);
  });

  it('should render the portfolio detail page', async () => {
    render(await PortfolioDetailPage({ params: { id: 'portfolio-1' } }));

    expect(screen.getByTestId('portfolio-detail')).toBeInTheDocument();
    expect(screen.getByText('Test Portfolio Item')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('should track view when page is loaded', async () => {
    await PortfolioDetailPage({ params: { id: 'portfolio-1' } });

    expect(trackStat).toHaveBeenCalledWith('view', 'portfolio-1');
  });

  it('should return 404 if item not found', async () => {
    (getContentByType as ReturnType<typeof vi.fn>).mockResolvedValue([]);

    await PortfolioDetailPage({ params: { id: 'non-existent' } });

    expect(notFound).toHaveBeenCalled();
  });

  describe('generateMetadata', () => {
    it('should generate metadata from portfolio item', async () => {
      const metadata = await generateMetadata({ params: { id: 'portfolio-1' } });

      expect(metadata.title).toBe('Test Portfolio Item | Portfolio | samuido');
      expect(metadata.description).toBe('Test description');
    });

    it('should handle item with SEO data', async () => {
      const itemWithSeo = {
        ...mockItem,
        seo: {
          ogImage: '/images/og-image.jpg',
        },
      };
      (getContentByType as ReturnType<typeof vi.fn>).mockResolvedValue([itemWithSeo]);

      const metadata = await generateMetadata({ params: { id: 'portfolio-1' } });

      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.images?.[0].url).toBe('/images/og-image.jpg');
    });

    it('should handle item not found', async () => {
      (getContentByType as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const metadata = await generateMetadata({ params: { id: 'non-existent' } });

      expect(metadata.title).toBe('Portfolio Item Not Found | samuido');
    });
  });
});
