import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  it('should render the main heading', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'samuido' })).toBeInTheDocument();
    expect(screen.getByText('フロントエンドエンジニアの個人サイト')).toBeInTheDocument();
  });

  it('should render main categories section', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Main Categories' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Workshop' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tools' })).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<HomePage />);

    const aboutLink = screen.getByRole('heading', { name: 'About' }).closest('a');
    expect(aboutLink).toHaveAttribute('href', '/about');

    const portfolioLink = screen.getByRole('heading', { name: 'Portfolio' }).closest('a');
    expect(portfolioLink).toHaveAttribute('href', '/portfolio');

    const workshopLink = screen.getByRole('heading', { name: 'Workshop' }).closest('a');
    expect(workshopLink).toHaveAttribute('href', '/workshop');

    const toolsLink = screen.getByRole('heading', { name: 'Tools' }).closest('a');
    expect(toolsLink).toHaveAttribute('href', '/tools');
  });

  it('should render site functions section', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Site Functions' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Search' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
  });

  it('should render site function links', () => {
    render(<HomePage />);

    const privacyLink = screen.getByRole('heading', { name: 'Privacy Policy' }).closest('a');
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy');

    const searchLink = screen.getByRole('heading', { name: 'Search' }).closest('a');
    expect(searchLink).toHaveAttribute('href', '/search');

    const contactLink = screen.getByRole('heading', { name: 'Contact' }).closest('a');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });

  it('should render latest updates section', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: 'Latest Updates' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '最新作品タイトル' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '最新ブログ記事' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '新機能追加' })).toBeInTheDocument();
  });

  it('should render category descriptions', () => {
    render(<HomePage />);

    expect(screen.getByText('プロフィール、デジタル名刺、依頼ページへの導線')).toBeInTheDocument();
    expect(screen.getByText(/4つのギャラリー.*への導線/)).toBeInTheDocument();
    expect(
      screen.getByText('プラグイン配布、ブログ、素材ダウンロードへの導線')
    ).toBeInTheDocument();
    expect(screen.getByText('実用的なWebツール集への導線')).toBeInTheDocument();
  });

  it('should render footer', () => {
    render(<HomePage />);

    expect(screen.getByText('© 2025 samuido (木村友亮)')).toBeInTheDocument();
    expect(
      screen.getByText('フロントエンドエンジニア・Webデザイナー・映像クリエイター')
    ).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    expect(() => render(<HomePage />)).not.toThrow();
  });
});
