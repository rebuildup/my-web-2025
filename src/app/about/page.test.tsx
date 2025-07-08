import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AboutPage from './page';

describe('About Page', () => {
  it('should render the about page', () => {
    render(<AboutPage />);

    expect(screen.getByRole('heading', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByText('木村友亮 / samuido')).toBeInTheDocument();
    expect(
      screen.getByText('グラフィックデザイン、映像制作、個人開発など幅広く活動。')
    ).toBeInTheDocument();
  });

  it('should render profile cards', () => {
    render(<AboutPage />);

    expect(screen.getByText('本名プロフィール')).toBeInTheDocument();
    expect(screen.getByText('木村友亮 (Kimura Yusuke)')).toBeInTheDocument();
    expect(screen.getByText('採用担当者や企業向けの正式な自己紹介')).toBeInTheDocument();

    expect(screen.getByText('ハンドルネームプロフィール')).toBeInTheDocument();
    expect(screen.getByText('samuido')).toBeInTheDocument();
    expect(screen.getByText('ラフな自己紹介、同業者・仲間向け')).toBeInTheDocument();
  });

  it('should render navigation cards', () => {
    render(<AboutPage />);

    expect(screen.getByText('デジタル名刺')).toBeInTheDocument();
    expect(screen.getByText('連絡先・SNS・基本情報をまとめたカード')).toBeInTheDocument();

    expect(screen.getByText('リンクマップ')).toBeInTheDocument();
    expect(screen.getByText('SNS・作品・プラットフォームへのリンク集')).toBeInTheDocument();

    expect(screen.getByText('依頼について')).toBeInTheDocument();
    expect(screen.getByText('制作依頼・コラボレーション・お仕事の相談')).toBeInTheDocument();
  });

  it('should render navigation link', () => {
    render(<AboutPage />);

    const homeLink = screen.getByRole('link', { name: '← Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render profile links', () => {
    render(<AboutPage />);

    const realProfileLink = screen.getByText('本名プロフィール').closest('a');
    expect(realProfileLink).toHaveAttribute('href', '/about/profile/real');

    const handleProfileLink = screen.getByText('ハンドルネームプロフィール').closest('a');
    expect(handleProfileLink).toHaveAttribute('href', '/about/profile/handle');
  });

  it('should render navigation card links', () => {
    render(<AboutPage />);

    const digitalCardLink = screen.getByText('デジタル名刺').closest('a');
    expect(digitalCardLink).toHaveAttribute('href', '/about/card');

    const linkMapLink = screen.getByText('リンクマップ').closest('a');
    expect(linkMapLink).toHaveAttribute('href', '/about/links');

    const commissionLink = screen.getByText('依頼について').closest('a');
    expect(commissionLink).toHaveAttribute('href', '/about/commission');
  });

  it('should render JSON-LD script', () => {
    render(<AboutPage />);

    const jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    expect(jsonLdScript).toBeInTheDocument();

    const jsonLdData = JSON.parse(jsonLdScript!.textContent!);
    expect(jsonLdData['@context']).toBe('https://schema.org');
    expect(jsonLdData['@type']).toBe('Person');
    expect(jsonLdData.name).toBe('木村友亮');
    expect(jsonLdData.alternateName).toBe('samuido');
    expect(jsonLdData.jobTitle).toBe('Webデザイナー・開発者');
  });

  it('should render section headers', () => {
    render(<AboutPage />);

    expect(screen.getByText('プロフィール選択')).toBeInTheDocument();
    expect(screen.getByText('関連ページ')).toBeInTheDocument();
  });

  it('should render main content structure', () => {
    render(<AboutPage />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();

    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
  });
});
