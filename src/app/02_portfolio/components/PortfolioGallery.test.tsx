import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PortfolioGallery from './PortfolioGallery';
import type { ContentItem } from '@/types/content';
import { trackStat } from '@/lib/stats';

// Mock Next.js components
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

// Mock stats tracking
vi.mock('@/lib/stats', () => ({
  trackStat: vi.fn().mockResolvedValue(1),
}));

// Mock fetch
global.fetch = vi.fn();

describe('PortfolioGallery', () => {
  const mockItems: ContentItem[] = [
    {
      id: 'portfolio-1',
      type: 'portfolio' as import('@/types/content').ContentType,
      title: 'Development Project',
      description: 'A web development project',
      category: 'develop',
      tags: ['react', 'typescript'],
      status: 'published' as const,
      priority: 90,
      createdAt: '2024-01-01T12:00:00Z',
      thumbnail: '/images/portfolio-1.jpg',
    },
    {
      id: 'portfolio-2',
      type: 'portfolio' as import('@/types/content').ContentType,
      title: 'Design Project',
      description: 'A graphic design project',
      category: 'design',
      tags: ['photoshop', 'illustrator'],
      status: 'published' as const,
      priority: 80,
      createdAt: '2024-01-02T12:00:00Z',
      thumbnail: '/images/portfolio-2.jpg',
    },
    {
      id: 'portfolio-3',
      type: 'portfolio' as import('@/types/content').ContentType,
      title: 'Video Project',
      description: 'A video production project',
      category: 'video',
      tags: ['after-effects', 'premiere'],
      status: 'published' as const,
      priority: 70,
      createdAt: '2024-01-03T12:00:00Z',
      thumbnail: '/images/portfolio-3.jpg',
      externalLinks: [{ type: 'demo' as const, url: 'https://example.com/demo', title: 'Demo' }],
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock window.history.pushState
    Object.defineProperty(window, 'history', {
      writable: true,
      value: { pushState: vi.fn() },
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: 'http://localhost/portfolio' },
    });

    // Mock successful fetch
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, data: mockItems }),
    });
  });

  it('should render portfolio items', () => {
    render(<PortfolioGallery initialItems={mockItems} />);

    expect(screen.getByText('Development Project')).toBeInTheDocument();
    expect(screen.getByText('Design Project')).toBeInTheDocument();
    expect(screen.getByText('Video Project')).toBeInTheDocument();
  });

  it('should filter items by category', () => {
    render(<PortfolioGallery initialItems={mockItems} />);

    // Click on Design filter
    fireEvent.click(screen.getByText('Design'));

    // Should only show design items
    expect(screen.getByText('Design Project')).toBeInTheDocument();
    expect(screen.queryByText('Development Project')).not.toBeInTheDocument();
    expect(screen.queryByText('Video Project')).not.toBeInTheDocument();

    // Click on All filter
    fireEvent.click(screen.getByText('All'));

    // Should show all items again
    expect(screen.getByText('Development Project')).toBeInTheDocument();
    expect(screen.getByText('Design Project')).toBeInTheDocument();
    expect(screen.getByText('Video Project')).toBeInTheDocument();
  });

  it('should update URL when category changes', () => {
    render(<PortfolioGallery initialItems={mockItems} />);

    // Click on Video filter
    fireEvent.click(screen.getByText('Video'));

    // Should update URL
    expect(window.history.pushState).toHaveBeenCalledWith(
      {},
      '',
      'http://localhost/portfolio?category=video'
    );
  });

  it('should track item view when clicked', () => {
    render(<PortfolioGallery initialItems={mockItems} />);

    // Click on an item
    fireEvent.click(screen.getByText('Development Project'));

    // Should track view
    expect(trackStat).toHaveBeenCalledWith('view', 'portfolio-1');
  });

  it('should display external links', () => {
    render(<PortfolioGallery initialItems={mockItems} />);

    // Should show external link
    expect(screen.getByText('demo')).toBeInTheDocument();
    expect(screen.getByText('demo').closest('a')).toHaveAttribute(
      'href',
      'https://example.com/demo'
    );
  });

  it('should fetch items if not provided', async () => {
    render(<PortfolioGallery />);

    // Should show loading state
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Should fetch items
    expect(global.fetch).toHaveBeenCalledWith('/api/content/portfolio');

    // Should show items after loading
    await waitFor(() => {
      expect(screen.getByText('Development Project')).toBeInTheDocument();
    });
  });

  it('should handle fetch errors', async () => {
    // Mock fetch error
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Failed to fetch'));

    render(<PortfolioGallery />);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to load portfolio items/)).toBeInTheDocument();
    });
  });

  it('should show empty state when no items match filter', () => {
    render(<PortfolioGallery initialItems={mockItems} initialCategory="video&design" />);

    // Should show empty state
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });
});
