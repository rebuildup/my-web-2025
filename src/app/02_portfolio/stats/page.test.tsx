import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PortfolioStatsPage from './page';
import { getTopStats } from '@/lib/stats';
import { getContentByType } from '@/lib/utils/content-loader';
import type { ContentItem } from '@/types/content';
import { ContentType } from '@/types/content';

// Mock dependencies
vi.mock('@/lib/stats', () => ({
  getTopStats: vi.fn(),
}));

vi.mock('@/lib/utils/content-loader', () => ({
  getContentByType: vi.fn(),
}));

// Mock PortfolioStats component
vi.mock('../components/PortfolioStats', () => ({
  __esModule: true,
  default: ({
    portfolioStats,
  }: {
    portfolioStats: { id: string; title: string; views: number }[];
  }) => (
    <div data-testid="portfolio-stats">
      <div>Stats Count: {portfolioStats.length}</div>
      {portfolioStats.map(stat => (
        <div key={stat.id} data-testid="portfolio-stat-item">
          {stat.title}: {stat.views} views
        </div>
      ))}
    </div>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

describe('PortfolioStatsPage', () => {
  const mockTopStats: [string, number][] = [
    ['item1', 150],
    ['item2', 75],
    ['item3', 200],
  ];

  const mockPortfolioItems: ContentItem[] = [
    {
      id: 'item1',
      title: 'Portfolio Item 1',
      category: 'develop',
      type: 'portfolio' as ContentType,
      description: 'desc1',
      tags: [],
      status: 'published',
      priority: 0,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'item2',
      title: 'Portfolio Item 2',
      category: 'design',
      type: 'portfolio' as ContentType,
      description: 'desc2',
      tags: [],
      status: 'published',
      priority: 0,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'item3',
      title: 'Portfolio Item 3',
      category: 'video',
      type: 'portfolio' as ContentType,
      description: 'desc3',
      tags: [],
      status: 'published',
      priority: 0,
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (getTopStats as ReturnType<typeof vi.fn>).mockResolvedValue(mockTopStats);
    (getContentByType as ReturnType<typeof vi.fn>).mockResolvedValue(mockPortfolioItems);
  });

  it('should render the portfolio stats page with title and description', async () => {
    render(await PortfolioStatsPage());

    expect(screen.getByText('Portfolio Statistics')).toBeInTheDocument();
    expect(screen.getByText('ポートフォリオ統計')).toBeInTheDocument();
  });

  it('should fetch top stats and portfolio items', async () => {
    await PortfolioStatsPage();

    expect(getTopStats).toHaveBeenCalledWith('view', 20);
    expect(getContentByType).toHaveBeenCalledWith('portfolio', { status: 'all' });
  });

  it('should pass mapped portfolio stats to the PortfolioStats component', async () => {
    render(await PortfolioStatsPage());

    expect(screen.getByTestId('portfolio-stats')).toBeInTheDocument();
    expect(screen.getByText('Stats Count: 3')).toBeInTheDocument();

    const statItems = screen.getAllByTestId('portfolio-stat-item');
    expect(statItems).toHaveLength(3);
    expect(statItems[0]).toHaveTextContent('Portfolio Item 1: 150 views');
    expect(statItems[1]).toHaveTextContent('Portfolio Item 2: 75 views');
    expect(statItems[2]).toHaveTextContent('Portfolio Item 3: 200 views');
  });

  it('should render the back link', async () => {
    render(await PortfolioStatsPage());

    const backLink = screen.getByText('Back to Portfolio');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/02_portfolio');
  });

  it('should handle unknown portfolio items', async () => {
    // Mock a stat for an item that doesn't exist in the portfolio items
    (getTopStats as ReturnType<typeof vi.fn>).mockResolvedValue([
      ...mockTopStats,
      ['unknown-item', 50],
    ]);

    render(await PortfolioStatsPage());

    const statItems = screen.getAllByTestId('portfolio-stat-item');
    expect(statItems).toHaveLength(4);
    expect(statItems[3]).toHaveTextContent('unknown-item: 50 views');
  });
});
