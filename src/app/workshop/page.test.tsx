import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkshopPage from './page';

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

describe('Workshop Page', () => {
  it('should render the workshop page', () => {
    render(<WorkshopPage />);

    expect(screen.getByRole('heading', { name: 'Workshop' })).toBeInTheDocument();
    expect(screen.getByText('プラグイン・ブログ・素材配布')).toBeInTheDocument();
    expect(screen.getByText(/AfterEffectsプラグイン、技術記事、素材の配布/)).toBeInTheDocument();
  });

  it('should render statistics section', () => {
    render(<WorkshopPage />);

    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('技術記事')).toBeInTheDocument();

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('プラグイン')).toBeInTheDocument();

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('素材・テンプレート')).toBeInTheDocument();

    expect(screen.getByText('2.1K')).toBeInTheDocument();
    expect(screen.getByText('総ダウンロード')).toBeInTheDocument();
  });

  it('should render Workshop Categories section', () => {
    render(<WorkshopPage />);

    expect(screen.getByRole('heading', { name: 'Workshop Categories' })).toBeInTheDocument();

    // Blog section
    expect(screen.getByRole('heading', { name: 'Blog' })).toBeInTheDocument();
    expect(screen.getByText('技術記事、チュートリアル、解説記事の配信')).toBeInTheDocument();
    expect(screen.getByText('• 技術記事・チュートリアル')).toBeInTheDocument();
    expect(screen.getByText('• 制作過程・解説記事')).toBeInTheDocument();
    expect(screen.getByText('• Markdown + 埋め込みコンテンツ')).toBeInTheDocument();
    expect(screen.getByText('• タグフィルター・検索機能')).toBeInTheDocument();
    expect(screen.getByText('18記事 →')).toBeInTheDocument();

    // Plugins section
    expect(screen.getByRole('heading', { name: 'Plugins' })).toBeInTheDocument();
    expect(screen.getByText('AfterEffects、Premiere Proなどのプラグイン配布')).toBeInTheDocument();
    expect(screen.getByText('• AfterEffects・Premiere Pro対応')).toBeInTheDocument();
    expect(screen.getByText('• ダウンロード統計・バージョン管理')).toBeInTheDocument();
    expect(screen.getByText('• 使用方法・インストール手順')).toBeInTheDocument();
    expect(screen.getByText('• 無料配布・オープンソース')).toBeInTheDocument();
    expect(screen.getByText('6プラグイン →')).toBeInTheDocument();

    // Downloads section
    expect(screen.getByRole('heading', { name: 'Downloads' })).toBeInTheDocument();
    expect(screen.getByText('テンプレート、素材集などの配布')).toBeInTheDocument();
    expect(screen.getByText('• テンプレート・素材集')).toBeInTheDocument();
    expect(screen.getByText('• サンプルファイル・その他')).toBeInTheDocument();
    expect(screen.getByText('• ライセンス情報・利用規約')).toBeInTheDocument();
    expect(screen.getByText('• ZIP形式での一括ダウンロード')).toBeInTheDocument();
    expect(screen.getByText('12素材 →')).toBeInTheDocument();
  });

  it('should render workshop categories with correct links', () => {
    render(<WorkshopPage />);

    const blogLink = screen.getByRole('link', { name: /Blog/ });
    expect(blogLink).toHaveAttribute('href', '/workshop/blog');

    const pluginsLink = screen.getByRole('link', { name: /Plugins/ });
    expect(pluginsLink).toHaveAttribute('href', '/workshop/plugins');

    const downloadsLink = screen.getByRole('link', { name: /Downloads/ });
    expect(downloadsLink).toHaveAttribute('href', '/workshop/downloads');
  });

  it('should render Latest Content section', () => {
    render(<WorkshopPage />);

    expect(screen.getByRole('heading', { name: 'Latest Content' })).toBeInTheDocument();

    // Latest blog post
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Next.js 15 + React 19の新機能解説' })
    ).toBeInTheDocument();
    expect(screen.getByText(/Next.js 15とReact 19の新機能について詳しく解説/)).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('技術記事')).toBeInTheDocument();
    expect(screen.getByText('2025/01/20')).toBeInTheDocument();

    // Latest plugin
    expect(screen.getByText('Plugin')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AE Auto Keyframe v2.1' })).toBeInTheDocument();
    expect(
      screen.getByText(/After Effectsでキーフレームを自動生成するプラグイン/)
    ).toBeInTheDocument();
    expect(screen.getByText('After Effects')).toBeInTheDocument();
    expect(screen.getByText('CEP')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('v2.1')).toBeInTheDocument();
    expect(screen.getByText('847 downloads')).toBeInTheDocument();

    // Latest download
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Motion Graphics Templates Pack' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/After Effects用のモーショングラフィックステンプレート集/)
    ).toBeInTheDocument();
    expect(screen.getByText('Template')).toBeInTheDocument();
    expect(screen.getByText('Motion Graphics')).toBeInTheDocument();
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('12 files')).toBeInTheDocument();
    expect(screen.getByText('156 downloads')).toBeInTheDocument();
  });

  it('should render Popular Content section', () => {
    render(<WorkshopPage />);

    expect(screen.getByRole('heading', { name: 'Popular Content' })).toBeInTheDocument();

    // Popular plugins
    expect(screen.getByRole('heading', { name: '人気プラグイン' })).toBeInTheDocument();
    expect(screen.getByText('AE Expression Helper')).toBeInTheDocument();
    expect(screen.getByText('1,247 downloads')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();

    expect(screen.getByText('Auto Keyframe v2.1')).toBeInTheDocument();
    expect(screen.getByText('847 downloads')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();

    expect(screen.getByText('Layer Manager Pro')).toBeInTheDocument();
    expect(screen.getByText('634 downloads')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();

    // Popular articles
    expect(screen.getByRole('heading', { name: '人気記事' })).toBeInTheDocument();
    expect(screen.getByText('React Hooks完全ガイド')).toBeInTheDocument();
    expect(screen.getByText('3,421 views')).toBeInTheDocument();

    expect(screen.getByText('AE Expression入門')).toBeInTheDocument();
    expect(screen.getByText('2,156 views')).toBeInTheDocument();

    expect(screen.getByText('Tailwind CSS v4 新機能')).toBeInTheDocument();
    expect(screen.getByText('1,893 views')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<WorkshopPage />);

    expect(screen.getByRole('link', { name: '← Home' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'About →' })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: 'Portfolio →' })).toHaveAttribute('href', '/portfolio');
    expect(screen.getByRole('link', { name: 'Tools →' })).toHaveAttribute('href', '/tools');
  });

  it('should render JSON-LD script', () => {
    render(<WorkshopPage />);

    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    expect(jsonLdScript).toBeInTheDocument();

    const jsonContent = JSON.parse(jsonLdScript?.textContent || '{}');
    expect(jsonContent['@context']).toBe('https://schema.org');
    expect(jsonContent['@type']).toBe('WebSite');
    expect(jsonContent.name).toBe('samuido Workshop');
    expect(jsonContent.description).toBe('AfterEffectsプラグイン、技術記事、素材の配布サイト');
    expect(jsonContent.url).toBe('https://yusuke-kim.com/workshop');
  });

  it('should render category cards in grid layout', () => {
    render(<WorkshopPage />);

    const categoriesSection = screen
      .getByRole('heading', { name: 'Workshop Categories' })
      .closest('section');
    const categoryCards = categoriesSection?.querySelectorAll('a[href^="/workshop/"]');

    expect(categoryCards).toHaveLength(3);
  });

  it('should render latest content in grid layout', () => {
    render(<WorkshopPage />);

    const latestContentSection = screen
      .getByRole('heading', { name: 'Latest Content' })
      .closest('section');
    const contentCards = latestContentSection?.querySelectorAll('.card');

    expect(contentCards).toHaveLength(3);
  });

  it('should render popular content rankings', () => {
    render(<WorkshopPage />);

    // Check for ranking indicators
    const rankings = screen.getAllByText(/#[1-3]/);
    expect(rankings).toHaveLength(6); // 3 plugins + 3 articles = 6 rankings
  });

  it('should have proper accessibility structure', () => {
    render(<WorkshopPage />);

    // Check heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1, name: 'Workshop' });
    expect(h1).toBeInTheDocument();

    const h2Headings = screen.getAllByRole('heading', { level: 2 });
    expect(h2Headings.length).toBeGreaterThan(0);

    const h3Headings = screen.getAllByRole('heading', { level: 3 });
    expect(h3Headings.length).toBeGreaterThan(0);
  });

  it('should render hover effects for category cards', () => {
    render(<WorkshopPage />);

    const blogCard = screen.getByRole('link', { name: /Blog/ });
    expect(blogCard).toHaveClass('hover:border-blue-500');

    const pluginsCard = screen.getByRole('link', { name: /Plugins/ });
    expect(pluginsCard).toHaveClass('hover:border-blue-500');

    const downloadsCard = screen.getByRole('link', { name: /Downloads/ });
    expect(downloadsCard).toHaveClass('hover:border-blue-500');
  });

  it('should display content type badges correctly', () => {
    render(<WorkshopPage />);

    // Check for type badges in latest content
    const typeLabels = ['Blog', 'Plugin', 'Download'];
    typeLabels.forEach(type => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });

  it('should display download and view statistics', () => {
    render(<WorkshopPage />);

    // Check download statistics
    expect(screen.getByText('847 downloads')).toBeInTheDocument();
    expect(screen.getByText('156 downloads')).toBeInTheDocument();
    expect(screen.getByText('1,247 downloads')).toBeInTheDocument();
    expect(screen.getByText('634 downloads')).toBeInTheDocument();

    // Check view statistics
    expect(screen.getByText('3,421 views')).toBeInTheDocument();
    expect(screen.getByText('2,156 views')).toBeInTheDocument();
    expect(screen.getByText('1,893 views')).toBeInTheDocument();
  });

  it('should render category descriptions and features', () => {
    render(<WorkshopPage />);

    // Blog features
    expect(screen.getByText('• 技術記事・チュートリアル')).toBeInTheDocument();
    expect(screen.getByText('• 制作過程・解説記事')).toBeInTheDocument();

    // Plugin features
    expect(screen.getByText('• AfterEffects・Premiere Pro対応')).toBeInTheDocument();
    expect(screen.getByText('• 無料配布・オープンソース')).toBeInTheDocument();

    // Download features
    expect(screen.getByText('• テンプレート・素材集')).toBeInTheDocument();
    expect(screen.getByText('• ZIP形式での一括ダウンロード')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    expect(() => render(<WorkshopPage />)).not.toThrow();
  });
});
