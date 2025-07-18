import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import HomePage from './page';

// Mock the stats module
vi.mock('@/lib/stats', () => ({
  updateStats: vi.fn(),
}));

// Mock Next.js modules
vi.mock('next/link', () => ({
  __esModule: true,
  default: function MockLink({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string;
    alt: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(<HomePage />);
    console.log(container.innerHTML);
    expect(container).toBeTruthy();
  });

  it('should render main sections', () => {
    const { container } = render(<HomePage />);

    // Check for main sections
    const text = container.textContent;
    expect(text).toContain('samuido');
    expect(text).toContain('フロントエンドエンジニアの個人サイト');
    expect(text).toContain('Main Categories');
    expect(text).toContain('Site Functions');
    expect(text).toContain('Latest Updates');
  });

  it('should render category links', () => {
    const { container } = render(<HomePage />);

    // Check for links
    const aboutLink = container.querySelector('a[href="/01_about"]');
    const portfolioLink = container.querySelector('a[href="/02_portfolio"]');
    const workshopLink = container.querySelector('a[href="/03_workshop"]');
    const toolsLink = container.querySelector('a[href="/04_tools"]');

    expect(aboutLink).toBeInTheDocument();
    expect(portfolioLink).toBeInTheDocument();
    expect(workshopLink).toBeInTheDocument();
    expect(toolsLink).toBeInTheDocument();
  });

  it('should render footer content', () => {
    const { container } = render(<HomePage />);

    // Check for footer content
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer?.textContent).toContain('© 2025 samuido');
    expect(footer?.textContent).toContain('フロントエンドエンジニア');
  });
});
