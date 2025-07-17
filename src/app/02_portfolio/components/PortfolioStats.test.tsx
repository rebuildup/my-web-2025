import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PortfolioStats from './PortfolioStats';

// Mock recharts
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Eye: () => <div data-testid="eye-icon" />,
  Filter: () => <div data-testid="filter-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
}));

describe('PortfolioStats', () => {
  const mockStats = [
    { id: 'item1', title: 'Portfolio Item 1', category: 'develop', views: 150 },
    { id: 'item2', title: 'Portfolio Item 2', category: 'design', views: 75 },
    { id: 'item3', title: 'Portfolio Item 3', category: 'video', views: 200 },
    { id: 'item4', title: 'Portfolio Item 4', category: 'develop', views: 100 },
  ];

  it('should render the portfolio stats component', () => {
    render(<PortfolioStats portfolioStats={mockStats} />);

    expect(screen.getByText('Total Views')).toBeInTheDocument();
    expect(screen.getByText('525')).toBeInTheDocument(); // Total views
    expect(screen.getByText('Filter by Category')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Views by Item')).toBeInTheDocument();
  });

  it('should render category filter buttons', () => {
    render(<PortfolioStats portfolioStats={mockStats} />);

    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('develop')).toBeInTheDocument();
    expect(screen.getByText('design')).toBeInTheDocument();
    expect(screen.getByText('video')).toBeInTheDocument();
  });

  it('should filter stats by category when filter button is clicked', async () => {
    render(<PortfolioStats portfolioStats={mockStats} />);

    // Initially all items should be shown
    expect(screen.getAllByRole('row')).toHaveLength(5); // 4 items + header row

    // Click on develop filter
    fireEvent.click(screen.getByText('develop'));

    // Should now show only develop items (2) + header row
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Portfolio Item 1')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Item 4')).toBeInTheDocument();
    expect(screen.queryByText('Portfolio Item 2')).not.toBeInTheDocument();
  });

  it('should render the chart component', () => {
    render(<PortfolioStats portfolioStats={mockStats} />);

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should render the stats table with correct data', () => {
    render(<PortfolioStats portfolioStats={mockStats} />);

    // Check table headers
    expect(screen.getByText('Portfolio Item')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Views')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();

    // Check table data
    expect(screen.getByText('Portfolio Item 1')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Item 2')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Item 3')).toBeInTheDocument();
    expect(screen.getByText('Portfolio Item 4')).toBeInTheDocument();

    // Check view counts
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should show empty state when no stats match the filter', () => {
    render(<PortfolioStats portfolioStats={mockStats} />);

    // Click on a non-existent category
    fireEvent.click(screen.getByText('All Categories'));
    const customButton = document.createElement('button');
    customButton.textContent = 'non-existent';
    customButton.onclick = () => {};
    document.body.appendChild(customButton);
    fireEvent.click(customButton);

    // Should show empty state
    expect(
      screen.getByText('No statistics available for the selected category.')
    ).toBeInTheDocument();
  });

  it('should render view links for each portfolio item', () => {
    render(<PortfolioStats portfolioStats={mockStats} />);

    const viewLinks = screen.getAllByText('View');
    expect(viewLinks).toHaveLength(4);

    // Check that links point to correct URLs
    expect(viewLinks[0].closest('a')).toHaveAttribute('href', '/02_portfolio/item1');
    expect(viewLinks[1].closest('a')).toHaveAttribute('href', '/02_portfolio/item2');
    expect(viewLinks[2].closest('a')).toHaveAttribute('href', '/02_portfolio/item3');
    expect(viewLinks[3].closest('a')).toHaveAttribute('href', '/02_portfolio/item4');
  });
});
