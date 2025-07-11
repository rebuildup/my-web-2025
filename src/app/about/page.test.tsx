import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutPage from './page';

describe('About Page', () => {
  it('should render the about page', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByText('木村友亮 / samuido')).toBeInTheDocument();
    expect(
      screen.getByText(/グラフィックデザイン、映像制作、個人開発など幅広く活動/)
    ).toBeInTheDocument();
  });

  it('should render profile selection section', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'Profile Selection' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '本名プロフィール' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ハンドルネームプロフィール' })).toBeInTheDocument();
  });

  it('should render profile links', () => {
    render(<AboutPage />);

    const realProfileLink = screen.getByRole('heading', { name: '本名プロフィール' }).closest('a');
    expect(realProfileLink).toHaveAttribute('href', '/about/profile/real');

    const handleProfileLink = screen
      .getByRole('heading', { name: 'ハンドルネームプロフィール' })
      .closest('a');
    expect(handleProfileLink).toHaveAttribute('href', '/about/profile/handle');
  });

  it('should render basic information section', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'Basic Information' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '基本情報' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '連絡先' })).toBeInTheDocument();

    // Basic info
    expect(screen.getByText(/平成19年10月生/)).toBeInTheDocument();
    expect(screen.getByText(/現役高専生（2025年7月現在）/)).toBeInTheDocument();
    expect(screen.getByText(/Webデザイナー・開発者/)).toBeInTheDocument();

    // Contact info
    expect(screen.getByText(/rebuild\.up\.up@gmail\.com/)).toBeInTheDocument();
    expect(screen.getByText(/361do\.sleep@gmail\.com/)).toBeInTheDocument();
    expect(screen.getByText(/@361do_sleep/)).toBeInTheDocument();
  });

  it('should render skills section', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'デザイン' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'プログラミング' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '技術スタック' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '映像・その他' })).toBeInTheDocument();

    // Skill items
    expect(screen.getByText(/• Photoshop/)).toBeInTheDocument();
    expect(screen.getByText(/• JavaScript/)).toBeInTheDocument();
    expect(screen.getByText(/• React \/ Next\.js/)).toBeInTheDocument();
    expect(screen.getByText(/• After Effects/)).toBeInTheDocument();
  });

  it('should render navigation section', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'Navigation' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Digital Card' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Link Map' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Commission' })).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<AboutPage />);

    const cardLink = screen.getByRole('heading', { name: 'Digital Card' }).closest('a');
    expect(cardLink).toHaveAttribute('href', '/about/card');

    const linksLink = screen.getByRole('heading', { name: 'Link Map' }).closest('a');
    expect(linksLink).toHaveAttribute('href', '/about/links');

    const commissionLink = screen.getByRole('heading', { name: 'Commission' }).closest('a');
    expect(commissionLink).toHaveAttribute('href', '/about/commission');
  });

  it('should render featured works section', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'Featured Works & Tools' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '最新ポートフォリオ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '便利ツール' })).toBeInTheDocument();

    // Links
    const portfolioLink = screen.getByText('ポートフォリオを見る →');
    expect(portfolioLink).toHaveAttribute('href', '/portfolio');

    const toolsLink = screen.getByText('ツール一覧を見る →');
    expect(toolsLink).toHaveAttribute('href', '/tools');
  });

  it('should render home navigation link', () => {
    render(<AboutPage />);

    const homeLink = screen.getByText('← Home');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render profile descriptions', () => {
    render(<AboutPage />);

    expect(screen.getByText('採用担当者や企業向けの正式な自己紹介')).toBeInTheDocument();
    expect(screen.getByText('ラフな自己紹介、同業者向け')).toBeInTheDocument();
    expect(screen.getByText(/• 学歴・経歴の詳細/)).toBeInTheDocument();
    expect(screen.getByText(/• カジュアルな自己紹介/)).toBeInTheDocument();
  });

  it('should render contact information', () => {
    render(<AboutPage />);

    expect(screen.getByText(/開発関連:/)).toBeInTheDocument();
    expect(screen.getByText(/映像・デザイン:/)).toBeInTheDocument();

    // getAllByTextを使用してTwitterの複数要素を処理
    const twitterElements = screen.getAllByText(/Twitter:/);
    expect(twitterElements).toHaveLength(2);
    expect(twitterElements[0]).toBeInTheDocument();
    expect(twitterElements[1]).toBeInTheDocument();
  });
});
