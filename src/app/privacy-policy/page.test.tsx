import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PrivacyPolicyPage from './page';

describe('Privacy Policy Page', () => {
  it('should render the privacy policy page', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText('個人情報保護方量')).toBeInTheDocument();
  });

  it('should render navigation link', () => {
    render(<PrivacyPolicyPage />);

    const homeLink = screen.getByRole('link', { name: '← Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render basic policy section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('基本方針')).toBeInTheDocument();
    expect(
      screen.getByText(
        'samuido（以下「当サイト」）は、個人情報の重要性を認識し、個人情報保護法等の関連法令を遵守して、適切に個人情報を取り扱います。'
      )
    ).toBeInTheDocument();
  });

  it('should render information collection section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('収集する情報')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせフォーム')).toBeInTheDocument();
    expect(screen.getByText('アクセス情報')).toBeInTheDocument();

    // Contact form information
    expect(screen.getByText('お名前')).toBeInTheDocument();
    expect(screen.getByText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByText('会社名・組織名（任意）')).toBeInTheDocument();
    expect(screen.getByText('電話番号（任意）')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせ内容')).toBeInTheDocument();

    // Access information
    expect(screen.getByText('IPアドレス')).toBeInTheDocument();
    expect(screen.getByText('ブラウザ情報')).toBeInTheDocument();
    expect(screen.getByText('アクセス日時')).toBeInTheDocument();
    expect(screen.getByText('アクセスページ')).toBeInTheDocument();
  });

  it('should render usage purpose section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('利用目的')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせへの回答')).toBeInTheDocument();
    expect(screen.getByText('サービス向上のための分析')).toBeInTheDocument();
    expect(screen.getByText('ウェブサイトの改善')).toBeInTheDocument();
    expect(screen.getByText('統計データの作成（個人を特定しない形式）')).toBeInTheDocument();
  });

  it('should render third party disclosure section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('第三者への提供')).toBeInTheDocument();
    expect(
      screen.getByText('当サイトは、以下の場合を除き、個人情報を第三者に提供することはありません。')
    ).toBeInTheDocument();
    expect(screen.getByText('ご本人の同意がある場合')).toBeInTheDocument();
    expect(screen.getByText('法令に基づく場合')).toBeInTheDocument();
    expect(
      screen.getByText('生命、身体または財産の保護のために必要がある場合')
    ).toBeInTheDocument();
  });

  it('should render cookie usage section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('Cookieの使用')).toBeInTheDocument();
    expect(
      screen.getByText(
        '当サイトでは、ユーザー体験の向上のためにCookieを使用する場合があります。 Cookieは個人を特定する情報を含みません。'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'ブラウザの設定でCookieを無効にすることができますが、一部機能が正常に動作しない場合があります。'
      )
    ).toBeInTheDocument();
  });

  it('should render Google Analytics section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('Google Analytics')).toBeInTheDocument();
    expect(
      screen.getByText(
        '当サイトでは、ウェブサイトの分析のためにGoogle Analyticsを使用しています。 Google Analyticsは、Cookieを使用してユーザーの行動を分析します。'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'この分析は匿名で行われ、個人を特定することはありません。 データの使用を希望しない場合は、'
      )
    ).toBeInTheDocument();

    const optoutLink = screen.getByText('Google Analytics オプトアウトページ');
    expect(optoutLink).toHaveAttribute('href', 'https://tools.google.com/dlpage/gaoptout');
    expect(optoutLink).toHaveAttribute('target', '_blank');
    expect(optoutLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render reCAPTCHA section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('reCAPTCHA')).toBeInTheDocument();
    expect(
      screen.getByText(
        '当サイトのお問い合わせフォームでは、スパム防止のためにGoogle reCAPTCHAを使用しています。 reCAPTCHAの使用には、Googleの'
      )
    ).toBeInTheDocument();

    const privacyLink = screen.getByText('プライバシーポリシー');
    expect(privacyLink).toHaveAttribute('href', 'https://policies.google.com/privacy');
    expect(privacyLink).toHaveAttribute('target', '_blank');
    expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');

    const termsLink = screen.getByText('利用規約');
    expect(termsLink).toHaveAttribute('href', 'https://policies.google.com/terms');
    expect(termsLink).toHaveAttribute('target', '_blank');
    expect(termsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render personal information disclosure section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('個人情報の開示・訂正・削除')).toBeInTheDocument();
    expect(
      screen.getByText(
        'ご自身の個人情報について、開示・訂正・削除をご希望の場合は、お問い合わせフォームまたはメールでご連絡ください。'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('本人確認の上、合理的な期間内に対応いたします。')).toBeInTheDocument();
  });

  it('should render privacy policy changes section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('プライバシーポリシーの変更')).toBeInTheDocument();
    expect(
      screen.getByText(
        '当サイトは、必要に応じてプライバシーポリシーを変更する場合があります。 変更した場合は、当ページに掲載してお知らせします。'
      )
    ).toBeInTheDocument();
  });

  it('should render contact information section', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('お問い合わせ')).toBeInTheDocument();
    expect(
      screen.getByText('個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。')
    ).toBeInTheDocument();
    expect(screen.getByText('メール:')).toBeInTheDocument();
    expect(screen.getByText('361do.sleep@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('運営者:')).toBeInTheDocument();
    expect(screen.getByText('samuido（木村友亮）')).toBeInTheDocument();
  });

  it('should render effective date', () => {
    render(<PrivacyPolicyPage />);

    expect(screen.getByText('制定日: 2024年1月1日')).toBeInTheDocument();
    expect(screen.getByText('最終更新日: 2024年1月1日')).toBeInTheDocument();
  });

  it('should render main content structure', () => {
    render(<PrivacyPolicyPage />);

    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();

    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();

    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeInTheDocument();
  });

  it('should render all section headings', () => {
    render(<PrivacyPolicyPage />);

    const headings = [
      '基本方針',
      '収集する情報',
      '利用目的',
      '第三者への提供',
      'Cookieの使用',
      'Google Analytics',
      'reCAPTCHA',
      '個人情報の開示・訂正・削除',
      'プライバシーポリシーの変更',
      'お問い合わせ',
    ];

    headings.forEach(heading => {
      expect(screen.getByText(heading)).toBeInTheDocument();
    });
  });

  it('should render external links with proper attributes', () => {
    render(<PrivacyPolicyPage />);

    const externalLinks = screen.getAllByRole('link', { name: /privacy|terms|optout/i });
    externalLinks.forEach(link => {
      if (link.getAttribute('href')?.startsWith('https://')) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    });
  });

  it('should render list structures properly', () => {
    render(<PrivacyPolicyPage />);

    const lists = document.querySelectorAll('ul');
    expect(lists.length).toBeGreaterThan(0);

    const listItems = document.querySelectorAll('li');
    expect(listItems.length).toBeGreaterThan(0);
  });
});
