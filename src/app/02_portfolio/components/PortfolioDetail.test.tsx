import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PortfolioDetail from './PortfolioDetail';
import type { ContentType, ExternalLink, MediaEmbed } from '@/types/content';

// Mock Next.js components
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} data-testid="next-image" />
  ),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
}));

describe('PortfolioDetail', () => {
  const mockItem = {
    id: 'portfolio-1',
    type: 'portfolio' as ContentType,
    title: 'Test Portfolio Item',
    description: 'Test description',
    category: 'develop',
    tags: ['react', 'typescript'],
    status: 'published' as const,
    priority: 50,
    createdAt: '2024-01-01T12:00:00Z',
    publishedAt: '2024-01-02T12:00:00Z',
    thumbnail: '/images/thumbnail.jpg',
    images: ['/images/image1.jpg', '/images/image2.jpg', '/images/image3.jpg'],
    stats: {
      views: 1250,
    },
    externalLinks: [
      { type: 'github' as const, url: 'https://github.com/example/repo', title: 'Source Code' },
      { type: 'demo' as const, url: 'https://example.com/demo', title: 'Live Demo' },
    ] as ExternalLink[],
  };

  it('should render portfolio details', () => {
    render(<PortfolioDetail item={mockItem} />);

    expect(screen.getByText('Test Portfolio Item')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('develop')).toBeInTheDocument();
    expect(screen.getByText('January 2, 2024')).toBeInTheDocument();
    expect(screen.getByText('1,250 views')).toBeInTheDocument();
  });

  it('should render back link', () => {
    render(<PortfolioDetail item={mockItem} />);

    const backLink = screen.getByTestId('next-link');
    expect(backLink).toHaveAttribute('href', '/02_portfolio');
    expect(screen.getByText('Back to Portfolio')).toBeInTheDocument();
  });

  it('should render tags', () => {
    render(<PortfolioDetail item={mockItem} />);

    expect(screen.getByText('Tags')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('should render external links', () => {
    render(<PortfolioDetail item={mockItem} />);

    expect(screen.getByText('Links')).toBeInTheDocument();
    expect(screen.getByText('Source Code')).toBeInTheDocument();
    expect(screen.getByText('Live Demo')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links[1]).toHaveAttribute('href', 'https://github.com/example/repo');
    expect(links[2]).toHaveAttribute('href', 'https://example.com/demo');
  });

  it('should render image gallery', () => {
    render(<PortfolioDetail item={mockItem} />);

    const images = screen.getAllByTestId('next-image');
    expect(images.length).toBe(4); // Main image + 3 thumbnails

    // First image should be the thumbnail/selected image
    expect(images[0]).toHaveAttribute('src', '/images/thumbnail.jpg');
  });

  it('should change selected image when clicking on thumbnail', () => {
    render(<PortfolioDetail item={mockItem} />);

    const images = screen.getAllByTestId('next-image');

    // Click on the second thumbnail
    fireEvent.click(images[2]);

    // Main image should now be the second image
    const updatedImages = screen.getAllByTestId('next-image');
    expect(updatedImages[0]).toHaveAttribute('src', '/images/image2.jpg');
  });

  it('should render YouTube video embed', () => {
    const itemWithVideo = {
      ...mockItem,
      videos: [
        {
          type: 'youtube' as const,
          url: 'https://www.youtube.com/watch?v=abcdef12345',
          title: 'Test Video',
        },
      ] as MediaEmbed[],
    };
    (itemWithVideo as { type: ContentType }).type = 'portfolio' as ContentType;

    render(<PortfolioDetail item={itemWithVideo} />);

    const iframe = screen.getByTitle('Test Video');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abcdef12345');
  });

  it('should render Vimeo video embed', () => {
    const itemWithVideo = {
      ...mockItem,
      videos: [
        {
          type: 'vimeo' as const,
          url: 'https://vimeo.com/123456789',
          title: 'Vimeo Test',
        },
      ] as MediaEmbed[],
    };
    (itemWithVideo as { type: ContentType }).type = 'portfolio' as ContentType;

    render(<PortfolioDetail item={itemWithVideo} />);

    const iframe = screen.getByTitle('Vimeo Test');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://player.vimeo.com/video/123456789');
  });

  it('should render multiple videos', () => {
    const itemWithVideos = {
      ...mockItem,
      videos: [
        {
          type: 'youtube' as const,
          url: 'https://www.youtube.com/watch?v=abcdef12345',
          title: 'Main Video',
        },
        {
          type: 'youtube' as const,
          url: 'https://www.youtube.com/watch?v=ghijkl67890',
          title: 'Secondary Video',
          description: 'This is a secondary video',
        },
      ] as MediaEmbed[],
    };
    (itemWithVideos as { type: ContentType }).type = 'portfolio' as ContentType;

    render(<PortfolioDetail item={itemWithVideos} />);

    expect(screen.getByTitle('Main Video')).toBeInTheDocument();
    expect(screen.getByText('Videos')).toBeInTheDocument();
    expect(screen.getByTitle('Secondary Video')).toBeInTheDocument();
    expect(screen.getByText('This is a secondary video')).toBeInTheDocument();
  });

  it('should render HTML content', () => {
    const itemWithContent = {
      ...mockItem,
      content: '<p>This is <strong>HTML</strong> content</p>',
    };
    (itemWithContent as { type: ContentType }).type = 'portfolio' as ContentType;

    render(<PortfolioDetail item={itemWithContent} />);

    const contentElement = document.querySelector('p');
    expect(contentElement).toBeInTheDocument();
    expect(contentElement?.innerHTML).toBe('This is <strong>HTML</strong> content');
  });

  it('should handle missing optional fields', () => {
    const minimalItem = {
      id: 'minimal',
      type: 'portfolio' as ContentType,
      title: 'Minimal Item',
      description: 'Minimal description',
      category: 'minimal',
      tags: [],
      status: 'published' as const,
      priority: 0,
      createdAt: '2024-01-01T12:00:00Z',
    };

    render(<PortfolioDetail item={minimalItem} />);

    expect(screen.getByText('Minimal Item')).toBeInTheDocument();
    expect(screen.getByText('Minimal description')).toBeInTheDocument();
    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
    expect(screen.queryByText('Links')).not.toBeInTheDocument();
    expect(screen.queryByText('Gallery')).not.toBeInTheDocument();
    expect(screen.queryByText('Videos')).not.toBeInTheDocument();
  });
});
