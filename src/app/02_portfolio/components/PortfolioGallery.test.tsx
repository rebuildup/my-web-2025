import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PortfolioGallery from './PortfolioGallery';
import type { ContentItem } from '@/types/content';


// Mock Next.js components
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
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

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Filter: () => <span>Filter</span>,
  Loader2: () => <span role="status">Loading...</span>,
  ExternalLink: () => <span>External</span>,
  Eye: () => <span>Eye</span>,
}));

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

  // Create a mock URL object
  class MockURL {
    searchParams: URLSearchParams;
    constructor(public href: string) {
      this.searchParams = new URLSearchParams();
    }
    toString() {
      const params = this.searchParams.toString();
      return params ? `${this.href}?${params}` : this.href;
    }
  }

  // Mock window.URL
  global.URL = MockURL as typeof URL;

  it('should render without crashing', () => {
    const { container } = render(<PortfolioGallery initialItems={mockItems} />);
    console.log(container.innerHTML);
    expect(container).toBeTruthy();
  });

  it('should render portfolio items', () => {
    const { container } = render(<PortfolioGallery initialItems={mockItems} />);

    // Check if all project titles are rendered
    const text = container.textContent;
    expect(text).toContain('Development Project');
    expect(text).toContain('Design Project');
    expect(text).toContain('Video Project');
  });
});
