import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PortfolioDetail from './PortfolioDetail';
import type { ContentType, ExternalLink, MediaEmbed } from '@/types/content';

// Mock Next.js components
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, fill, sizes }: {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    sizes?: string;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      data-testid="next-image"
      data-fill={fill ? 'true' : 'false'}
      data-sizes={sizes}
    />
  ),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
  Calendar: () => <span data-testid="calendar-icon">📅</span>,
  Tag: () => <span data-testid="tag-icon">🏷️</span>,
  Eye: () => <span data-testid="eye-icon">👁️</span>,
  ExternalLink: () => <span data-testid="external-link-icon">🔗</span>,
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

  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
  });

  it('should render portfolio details', () => {
    render(<PortfolioDetail item={mockItem} />);

    // Debug what's being rendered
    // console.log(document.body.innerHTML);

    // Use more flexible selectors
    const titleElement = document.querySelector('h1');
    expect(titleElement?.textContent).toContain('Test Portfolio Item');

    const descriptionElement = document.querySelector('.prose p');
    expect(descriptionElement?.textContent).toContain('Test description');

    const categoryElement = document.body.textContent;
    expect(categoryElement).toContain('develop');

    // Check for formatted date
    expect(document.body.textContent).toContain('January 2, 2024');

    // Check for views
    expect(document.body.textContent).toContain('1,250 views');
  });

  it('should render back link', () => {
    render(<PortfolioDetail item={mockItem} />);

    const backLink = document.querySelector('[data-testid="next-link"]');
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/02_portfolio');
    expect(document.body.textContent).toContain('Back to Portfolio');
  });

  it('should render tags', () => {
    render(<PortfolioDetail item={mockItem} />);

    const headings = Array.from(document.querySelectorAll('h3'));
    const tagsHeading = headings.find(el => el.textContent === 'Tags');
    expect(tagsHeading).toBeInTheDocument();

    const tagElements = document.querySelectorAll('.bg-gray\\/50');
    expect(tagElements.length).toBe(2);
    expect(tagElements[0].textContent).toContain('react');
    expect(tagElements[1].textContent).toContain('typescript');
  });

  it('should render external links', () => {
    render(<PortfolioDetail item={mockItem} />);

    const headings = Array.from(document.querySelectorAll('h3'));
    const linksHeading = headings.find(el => el.textContent === 'Links');
    expect(linksHeading).toBeInTheDocument();

    const links = document.querySelectorAll('a[target="_blank"]');
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain('Source Code');
    expect(links[1].textContent).toContain('Live Demo');
    expect(links[0]).toHaveAttribute('href', 'https://github.com/example/repo');
    expect(links[1]).toHaveAttribute('href', 'https://example.com/demo');
  });

  it('should render image gallery', () => {
    render(<PortfolioDetail item={mockItem} />);

    const images = document.querySelectorAll('[data-testid="next-image"]');
    expect(images.length).toBe(4); // Main image + 3 thumbnails

    // First image should be the thumbnail/selected image
    expect(images[0]).toHaveAttribute('src', '/images/thumbnail.jpg');
  });

  it('should change selected image when clicking on thumbnail', () => {
    render(<PortfolioDetail item={mockItem} />);

    const thumbnailButtons = document.querySelectorAll('.aspect-square');
    expect(thumbnailButtons.length).toBe(3);

    // Click on the second thumbnail
    fireEvent.click(thumbnailButtons[1]);

    // Main image should now be the second image
    const mainImage = document.querySelector('.aspect-w-16 img');
    expect(mainImage).toHaveAttribute('src', '/images/image2.jpg');
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

    render(<PortfolioDetail item={itemWithVideo} />);

    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://www.youtube.com/embed/abcdef12345');
    expect(iframe).toHaveAttribute('title', 'Test Video');
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

    render(<PortfolioDetail item={itemWithVideo} />);

    const iframe = document.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://player.vimeo.com/video/123456789');
    expect(iframe).toHaveAttribute('title', 'Vimeo Test');
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

    render(<PortfolioDetail item={itemWithVideos} />);

    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBe(2);
    expect(iframes[0]).toHaveAttribute('title', 'Main Video');

    const headings = Array.from(document.querySelectorAll('h3'));
    const videosHeading = headings.find(el => el.textContent === 'Videos');
    expect(videosHeading).toBeInTheDocument();

    expect(iframes[1]).toHaveAttribute('title', 'Secondary Video');
    expect(document.body.textContent).toContain('This is a secondary video');
  });

  it('should render HTML content', () => {
    const itemWithContent = {
      ...mockItem,
      content: '<p>This is <strong>HTML</strong> content</p>',
    };

    render(<PortfolioDetail item={itemWithContent} />);

    // Check if the HTML content is rendered somewhere in the document
    // This is more reliable than looking for a specific container
    const htmlContent = document.body.innerHTML;
    expect(htmlContent).toContain('This is');
    expect(htmlContent).toContain('HTML');
    expect(htmlContent).toContain('content');
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

    const titleElement = document.querySelector('h1');
    expect(titleElement?.textContent).toContain('Minimal Item');

    const descriptionElement = document.querySelector('.prose p');
    expect(descriptionElement?.textContent).toContain('Minimal description');

    // These elements should not exist
    const tagsHeading = Array.from(document.querySelectorAll('h3')).find(
      el => el.textContent === 'Tags'
    );
    expect(tagsHeading).toBeUndefined();

    const linksHeading = Array.from(document.querySelectorAll('h3')).find(
      el => el.textContent === 'Links'
    );
    expect(linksHeading).toBeUndefined();

    const galleryHeading = Array.from(document.querySelectorAll('h3')).find(
      el => el.textContent === 'Gallery'
    );
    expect(galleryHeading).toBeUndefined();

    const videosHeading = Array.from(document.querySelectorAll('h3')).find(
      el => el.textContent === 'Videos'
    );
    expect(videosHeading).toBeUndefined();
  });
});
