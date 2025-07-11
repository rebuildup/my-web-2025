import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PortfolioPage from './page';

describe('Portfolio Page', () => {
  it('should render the portfolio page', () => {
    render(<PortfolioPage />);

    expect(screen.getByRole('heading', { name: 'Portfolio' })).toBeInTheDocument();
    expect(screen.getByText('作品ギャラリー')).toBeInTheDocument();
    expect(screen.getByText(/4つのカテゴリ別ギャラリーで作品の全体像を把握/)).toBeInTheDocument();
  });

  it('should render statistics section', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('総作品数')).toBeInTheDocument();

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('開発作品')).toBeInTheDocument();

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('映像作品')).toBeInTheDocument();

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('デザイン作品')).toBeInTheDocument();
  });

  it('should render gallery categories section', () => {
    render(<PortfolioPage />);

    expect(screen.getByRole('heading', { name: 'Gallery Categories' })).toBeInTheDocument();
  });

  it('should render all gallery categories', () => {
    render(<PortfolioPage />);

    // Gallery Categoriesセクションのheadingのみをテスト
    expect(screen.getByRole('heading', { name: 'All' })).toBeInTheDocument();
    expect(screen.getByText('バラエティを重視した全作品の一覧')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Develop' })).toBeInTheDocument();
    expect(screen.getByText('プログラミング関連の制作作品')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Video' })).toBeInTheDocument();
    expect(screen.getByText('映像制作のみの作品一覧')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: 'Video & Design' })).toBeInTheDocument();
    expect(screen.getByText('映像・デザイン・Webデザイン作品')).toBeInTheDocument();
  });

  it('should render category descriptions', () => {
    render(<PortfolioPage />);

    expect(screen.getByText(/• サムネイル表示でカード一覧/)).toBeInTheDocument();
    expect(screen.getByText(/• プラグイン開発・ゲーム制作/)).toBeInTheDocument();
    expect(screen.getByText(/• 依頼映像・個人制作映像/)).toBeInTheDocument();
    expect(screen.getByText(/• デザインスキルを強調/)).toBeInTheDocument();
  });

  it('should render category links', () => {
    render(<PortfolioPage />);

    const allLink = screen.getByRole('heading', { name: 'All' }).closest('a');
    expect(allLink).toHaveAttribute('href', '/portfolio/gallery/all');

    const developLink = screen.getByRole('heading', { name: 'Develop' }).closest('a');
    expect(developLink).toHaveAttribute('href', '/portfolio/gallery/develop');

    const videoLink = screen.getByRole('heading', { name: 'Video' }).closest('a');
    expect(videoLink).toHaveAttribute('href', '/portfolio/gallery/video');

    const videoDesignLink = screen.getByRole('heading', { name: 'Video & Design' }).closest('a');
    expect(videoDesignLink).toHaveAttribute('href', '/portfolio/gallery/video-design');
  });

  it('should render featured works section', () => {
    render(<PortfolioPage />);

    expect(screen.getByRole('heading', { name: 'Featured Works' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'React Portfolio Website' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Motion Graphics Reel' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'UI/UX Design System' })).toBeInTheDocument();
  });

  it('should render playground section', () => {
    render(<PortfolioPage />);

    expect(screen.getByRole('heading', { name: 'Playground' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Design Playground' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'WebGL Playground' })).toBeInTheDocument();
  });

  it('should render playground links', () => {
    render(<PortfolioPage />);

    const designLink = screen.getByRole('heading', { name: 'Design Playground' }).closest('a');
    expect(designLink).toHaveAttribute('href', '/portfolio/playground/design');

    const webglLink = screen.getByRole('heading', { name: 'WebGL Playground' }).closest('a');
    expect(webglLink).toHaveAttribute('href', '/portfolio/playground/webgl');
  });

  it('should render navigation links', () => {
    render(<PortfolioPage />);

    const homeLink = screen.getByText('← Home');
    expect(homeLink).toHaveAttribute('href', '/');

    const aboutLink = screen.getByText('About →');
    expect(aboutLink).toHaveAttribute('href', '/about');

    const toolsLink = screen.getByText('Tools →');
    expect(toolsLink).toHaveAttribute('href', '/tools');

    const workshopLink = screen.getByText('Workshop →');
    expect(workshopLink).toHaveAttribute('href', '/workshop');
  });

  it('should render JSON-LD script', () => {
    render(<PortfolioPage />);

    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    expect(jsonLdScript).toBeInTheDocument();

    const jsonLdData = JSON.parse(jsonLdScript!.textContent!);
    expect(jsonLdData['@context']).toBe('https://schema.org');
    expect(jsonLdData['@type']).toBe('CollectionPage');
    expect(jsonLdData.name).toBe('Portfolio - samuido');
    expect(jsonLdData.description).toBe('Webデザイナー・開発者木村友亮の作品ポートフォリオ');
    expect(jsonLdData.url).toBe('https://yusuke-kim.com/portfolio');
    expect(jsonLdData.author.name).toBe('木村友亮');
    expect(jsonLdData.author.alternateName).toBe('samuido');
  });

  it('should render work count indicators', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('24作品 →')).toBeInTheDocument();
    expect(screen.getByText('8作品 →')).toBeInTheDocument();
    expect(screen.getByText('10作品 →')).toBeInTheDocument();
    expect(screen.getByText('6作品 →')).toBeInTheDocument();
  });
});
