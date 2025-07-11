import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PrivacyPolicyPage from './page';

describe('Privacy Policy Page', () => {
  it('should render the privacy policy page', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
    expect(screen.getByText(/個人情報の取り扱いについて/)).toBeInTheDocument();
  });

  it('should render last updated date', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('最終更新日: 2025年1月1日')).toBeInTheDocument();
  });

  it('should render basic policy section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: '基本方針' })).toBeInTheDocument();
    expect(
      screen.getByText(/samuido（以下「当サイト」）は、ユーザーの個人情報保護を重要な責務と考え/)
    ).toBeInTheDocument();
  });

  it('should render collected information section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: '収集する情報' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'お問い合わせフォーム' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'アクセスログ' })).toBeInTheDocument();

    // Contact form information - より具体的なパターンを使用
    expect(screen.getByText(/• 名前（ハンドルネーム可）/)).toBeInTheDocument();
    expect(screen.getByText(/• メールアドレス/)).toBeInTheDocument();
    expect(screen.getByText(/• 件名/)).toBeInTheDocument();
    expect(screen.getByText(/• お問い合わせ内容/)).toBeInTheDocument();

    // Access log information
    expect(screen.getByText(/• IPアドレス/)).toBeInTheDocument();
    expect(screen.getByText(/• アクセス日時/)).toBeInTheDocument();
  });

  it('should render usage purpose section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: '利用目的' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'お問い合わせへの対応' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'サイトの改善・運営' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '統計情報の作成' })).toBeInTheDocument();
  });

  it('should render cookie policy section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Cookieの使用について' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '必須Cookie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '分析Cookie' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cookie管理' })).toBeInTheDocument();
  });

  it('should render analytics section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'アクセス解析について' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Google Analytics' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'オプトアウト' })).toBeInTheDocument();
    expect(screen.getByText(/Google Inc.が提供するGoogle Analyticsを使用/)).toBeInTheDocument();
  });

  it('should render third party information section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: '第三者への情報提供' })).toBeInTheDocument();
    expect(screen.getByText(/個人情報を第三者に提供することはありません/)).toBeInTheDocument();
  });

  it('should render security measures section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: '安全管理措置' })).toBeInTheDocument();
    expect(screen.getByText(/SSL\/TLS暗号化通信の使用/)).toBeInTheDocument();
  });

  it('should render contact information section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'お問い合わせ先' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '連絡先' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '対応時間' })).toBeInTheDocument();

    // より具体的な連絡先情報を検索
    expect(screen.getByText(/サイト運営者: 木村友亮（samuido）/)).toBeInTheDocument();
    expect(screen.getByText(/メールアドレス: 361do\.sleep@gmail\.com/)).toBeInTheDocument();
  });

  it('should render policy changes section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'プライバシーポリシーの変更' })).toBeInTheDocument();
    expect(screen.getByText(/プライバシーポリシーを変更する場合があります/)).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(<PrivacyPolicyPage />);

    const homeLink = screen.getByText('← Home');
    expect(homeLink).toHaveAttribute('href', '/');

    const contactLink = screen.getByText('Contact →');
    expect(contactLink).toHaveAttribute('href', '/contact');

    const searchLink = screen.getByText('Search →');
    expect(searchLink).toHaveAttribute('href', '/search');
  });

  it('should render google analytics opt-out link', () => {
    render(<PrivacyPolicyPage />);

    const optOutLink = screen.getByText('Google Analyticsオプトアウト アドオン');
    expect(optOutLink).toHaveAttribute('href', 'https://tools.google.com/dlpage/gaoptout');
    expect(optOutLink).toHaveAttribute('target', '_blank');
    expect(optOutLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
