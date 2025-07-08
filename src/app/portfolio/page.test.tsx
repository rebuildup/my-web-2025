import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PortfolioPage from './page';

describe('Portfolio Page', () => {
  it('should render the portfolio page', () => {
    render(<PortfolioPage />);

    expect(screen.getByRole('heading', { name: 'Portfolio' })).toBeInTheDocument();
    expect(
      screen.getByText('Webデザイン、開発、映像制作における作品ギャラリー')
    ).toBeInTheDocument();
    expect(screen.getByText('カテゴリ別に整理された制作実績をご覧ください')).toBeInTheDocument();
  });

  it('should render navigation link', () => {
    render(<PortfolioPage />);

    const homeLink = screen.getByRole('link', { name: '← Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render statistics overview', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('総作品数')).toBeInTheDocument();

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('開発作品')).toBeInTheDocument();

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('映像作品')).toBeInTheDocument();

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('デザイン作品')).toBeInTheDocument();
  });

  it('should render gallery categories section', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('ギャラリーカテゴリ')).toBeInTheDocument();
  });

  it('should render all gallery categories', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('All Works')).toBeInTheDocument();
    expect(screen.getByText('全作品一覧')).toBeInTheDocument();

    expect(screen.getByText('Development')).toBeInTheDocument();
    expect(screen.getByText('開発系作品')).toBeInTheDocument();

    expect(screen.getByText('Video Production')).toBeInTheDocument();
    expect(screen.getByText('映像作品')).toBeInTheDocument();

    expect(screen.getByText('Video & Design')).toBeInTheDocument();
    expect(screen.getByText('映像・デザイン作品')).toBeInTheDocument();
  });

  it('should render category descriptions', () => {
    render(<PortfolioPage />);

    expect(
      screen.getByText(
        'バラエティを重視した全作品の一覧。時系列ソート、カテゴリフィルター、検索機能を備えたギャラリー'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'プログラミング関連の制作物。プラグイン開発、ゲーム制作、Webアプリケーション、技術詳細を重視した表示'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('映像制作のみ。依頼映像、個人制作映像をforiioライクなギャラリー表示で紹介')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '映像に加えて画像デザイン、Webデザインなど。デザインスキルを強調したクリエイティブギャラリー'
      )
    ).toBeInTheDocument();
  });

  it('should render category links', () => {
    render(<PortfolioPage />);

    const allWorksLink = screen.getByText('All Works').closest('a');
    expect(allWorksLink).toHaveAttribute('href', '/portfolio/gallery/all');

    const developmentLink = screen.getByText('Development').closest('a');
    expect(developmentLink).toHaveAttribute('href', '/portfolio/gallery/develop');

    const videoLink = screen.getByText('Video Production').closest('a');
    expect(videoLink).toHaveAttribute('href', '/portfolio/gallery/video');

    const videoDesignLink = screen.getByText('Video & Design').closest('a');
    expect(videoDesignLink).toHaveAttribute('href', '/portfolio/gallery/video&design');
  });

  it('should render category features', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('時系列ソート')).toBeInTheDocument();
    expect(screen.getByText('カテゴリフィルター')).toBeInTheDocument();
    expect(screen.getByText('タグフィルター')).toBeInTheDocument();
    expect(screen.getByText('検索機能')).toBeInTheDocument();

    expect(screen.getByText('2列交互表示')).toBeInTheDocument();
    expect(screen.getByText('プレビュー動画')).toBeInTheDocument();
    expect(screen.getByText('技術タグフィルター')).toBeInTheDocument();
    expect(screen.getByText('リポジトリリンク')).toBeInTheDocument();

    expect(screen.getByText('foriioライク表示')).toBeInTheDocument();
    expect(screen.getByText('埋め込み動画')).toBeInTheDocument();
    expect(screen.getByText('軽量プレビュー')).toBeInTheDocument();
    expect(screen.getByText('制作過程重視')).toBeInTheDocument();

    expect(screen.getByText('縦3列表示')).toBeInTheDocument();
    expect(screen.getByText('動的サイズ')).toBeInTheDocument();
    expect(screen.getByText('ホバー表示')).toBeInTheDocument();
    expect(screen.getByText('デザインコンセプト重視')).toBeInTheDocument();
  });

  it('should render playground section', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('プレイグラウンド')).toBeInTheDocument();
    expect(screen.getByText('実験的な制作物・プロトタイプ')).toBeInTheDocument();
  });

  it('should render playground items', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('WebGL Experiments')).toBeInTheDocument();
    expect(screen.getByText('WebGL・Three.js実験場')).toBeInTheDocument();
    expect(screen.getByText('WebGL/Three.jsによる実験的な3D表現や視覚効果')).toBeInTheDocument();

    expect(screen.getByText('UI/UX Prototypes')).toBeInTheDocument();
    expect(screen.getByText('UI/UXプロトタイプ')).toBeInTheDocument();
    expect(screen.getByText('新しいUIパターンやインタラクションの実験')).toBeInTheDocument();
  });

  it('should render playground links', () => {
    render(<PortfolioPage />);

    const webglLink = screen.getByText('WebGL Experiments').closest('a');
    expect(webglLink).toHaveAttribute('href', '/portfolio/playground/webgl');

    const prototypeLink = screen.getByText('UI/UX Prototypes').closest('a');
    expect(prototypeLink).toHaveAttribute('href', '/portfolio/playground/design');
  });

  it('should render quick actions', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('クイックアクション')).toBeInTheDocument();
    expect(screen.getByText('最新の作品')).toBeInTheDocument();
    expect(screen.getByText('最近更新された作品を表示')).toBeInTheDocument();

    expect(screen.getByText('人気の作品')).toBeInTheDocument();
    expect(screen.getByText('閲覧数の多い作品を表示')).toBeInTheDocument();

    expect(screen.getByText('作品検索')).toBeInTheDocument();
    expect(screen.getByText('キーワードで作品を検索')).toBeInTheDocument();
  });

  it('should render quick action links', () => {
    render(<PortfolioPage />);

    const latestLink = screen.getByText('最新の作品').closest('a');
    expect(latestLink).toHaveAttribute('href', '/portfolio/gallery/all?sort=latest');

    const popularLink = screen.getByText('人気の作品').closest('a');
    expect(popularLink).toHaveAttribute('href', '/portfolio/gallery/all?sort=popular');

    const searchLink = screen.getByText('作品検索').closest('a');
    expect(searchLink).toHaveAttribute('href', '/portfolio/gallery/all?search=true');
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

  it('should render main content structure', () => {
    render(<PortfolioPage />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();

    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();

    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });

  it('should render view more buttons', () => {
    render(<PortfolioPage />);

    const viewMoreButtons = screen.getAllByText('詳細を見る →');
    expect(viewMoreButtons).toHaveLength(4); // One for each category
  });

  it('should render category counts', () => {
    render(<PortfolioPage />);

    expect(screen.getByText('12件の作品')).toBeInTheDocument();
    expect(screen.getByText('5件の作品')).toBeInTheDocument();
    expect(screen.getByText('4件の作品')).toBeInTheDocument();
    expect(screen.getByText('3件の作品')).toBeInTheDocument();
  });
});
