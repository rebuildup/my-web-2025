import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ContactPage from './page';

// Mock fetch
global.fetch = vi.fn();

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  it('should render contact form', () => {
    render(<ContactPage />);

    expect(screen.getByText('Contact')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせフォーム')).toBeInTheDocument();
    expect(screen.getByLabelText('お名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('件名')).toBeInTheDocument();
    expect(screen.getByLabelText('お問い合わせ内容')).toBeInTheDocument();
  });

  it('should render navigation link', () => {
    render(<ContactPage />);

    const homeLink = screen.getByRole('link', { name: '← Home' });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should render category options', () => {
    render(<ContactPage />);

    const categorySelect = screen.getByLabelText('カテゴリー');
    expect(categorySelect).toBeInTheDocument();

    expect(screen.getByText('開発依頼')).toBeInTheDocument();
    expect(screen.getByText('映像制作依頼')).toBeInTheDocument();
    expect(screen.getByText('プラグイン・ツールについて')).toBeInTheDocument();
    expect(screen.getByText('その他')).toBeInTheDocument();
  });

  it('should render contact method options', () => {
    render(<ContactPage />);

    expect(screen.getByText('メール')).toBeInTheDocument();
    expect(screen.getByText('電話')).toBeInTheDocument();
    expect(screen.getByText('どちらでも')).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    const nameInput = screen.getByLabelText('お名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    const subjectInput = screen.getByLabelText('件名');
    const contentInput = screen.getByLabelText('お問い合わせ内容');

    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(subjectInput, 'Test Subject');
    await user.type(contentInput, 'Test Content');

    expect(nameInput).toHaveValue('Test User');
    expect(emailInput).toHaveValue('test@example.com');
    expect(subjectInput).toHaveValue('Test Subject');
    expect(contentInput).toHaveValue('Test Content');
  });

  it('should handle category selection', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    const categorySelect = screen.getByLabelText('カテゴリー');
    await user.selectOptions(categorySelect, 'development');

    expect(categorySelect).toHaveValue('development');
  });

  it('should handle contact method selection', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    const phoneRadio = screen.getByLabelText('電話');
    await user.click(phoneRadio);

    expect(phoneRadio).toBeChecked();
  });

  it('should show confirmation screen on form submission', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Fill form
    await user.type(screen.getByLabelText('お名前'), 'Test User');
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('件名'), 'Test Subject');
    await user.type(screen.getByLabelText('お問い合わせ内容'), 'Test Content');
    await user.selectOptions(screen.getByLabelText('カテゴリー'), 'development');

    // Submit form
    await user.click(screen.getByRole('button', { name: 'お問い合わせを送信' }));

    // Check confirmation screen
    await waitFor(() => {
      expect(screen.getByText('送信内容の確認')).toBeInTheDocument();
      expect(
        screen.getByText(
          '以下の内容で送信いたします。よろしければ「送信する」ボタンを押してください。'
        )
      ).toBeInTheDocument();
    });
  });

  it('should display form data in confirmation screen', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Fill form
    await user.type(screen.getByLabelText('お名前'), 'Test User');
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('件名'), 'Test Subject');
    await user.type(screen.getByLabelText('お問い合わせ内容'), 'Test Content');
    await user.selectOptions(screen.getByLabelText('カテゴリー'), 'development');

    // Submit form
    await user.click(screen.getByRole('button', { name: 'お問い合わせを送信' }));

    // Check confirmation screen shows form data
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('Test Subject')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('開発依頼')).toBeInTheDocument();
    });
  });

  it('should handle form submission from confirmation screen', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText('お名前'), 'Test User');
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('件名'), 'Test Subject');
    await user.type(screen.getByLabelText('お問い合わせ内容'), 'Test Content');
    await user.selectOptions(screen.getByLabelText('カテゴリー'), 'development');

    await user.click(screen.getByRole('button', { name: 'お問い合わせを送信' }));

    // Confirm submission
    await waitFor(() => {
      expect(screen.getByText('送信する')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '送信する' }));

    // Check API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          content: 'Test Content',
          category: 'development',
          company: '',
          phone: '',
          contactMethod: 'email',
          recaptchaToken: 'mock-token',
        }),
      });
    });
  });

  it('should handle submission success', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText('お名前'), 'Test User');
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('件名'), 'Test Subject');
    await user.type(screen.getByLabelText('お問い合わせ内容'), 'Test Content');
    await user.selectOptions(screen.getByLabelText('カテゴリー'), 'development');

    await user.click(screen.getByRole('button', { name: 'お問い合わせを送信' }));
    await user.click(screen.getByRole('button', { name: '送信する' }));

    // Check success message
    await waitFor(() => {
      expect(screen.getByText('送信完了')).toBeInTheDocument();
    });
  });

  it('should handle submission error', async () => {
    const user = userEvent.setup();
    (fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, message: 'Server error' }),
    });

    render(<ContactPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText('お名前'), 'Test User');
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('件名'), 'Test Subject');
    await user.type(screen.getByLabelText('お問い合わせ内容'), 'Test Content');
    await user.selectOptions(screen.getByLabelText('カテゴリー'), 'development');

    await user.click(screen.getByRole('button', { name: 'お問い合わせを送信' }));
    await user.click(screen.getByRole('button', { name: '送信する' }));

    // Check error message
    await waitFor(() => {
      expect(screen.getByText('送信に失敗しました')).toBeInTheDocument();
    });
  });

  it('should render contact information', () => {
    render(<ContactPage />);

    expect(screen.getByText('直接連絡')).toBeInTheDocument();
    expect(screen.getByText('361do.sleep@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('緊急時のみ電話対応可能')).toBeInTheDocument();
  });

  it('should render FAQ section', () => {
    render(<ContactPage />);

    expect(screen.getByText('よくある質問')).toBeInTheDocument();
    expect(screen.getByText('料金について')).toBeInTheDocument();
    expect(screen.getByText('対応時間について')).toBeInTheDocument();
    expect(screen.getByText('制作期間について')).toBeInTheDocument();
  });

  it('should render optional fields', () => {
    render(<ContactPage />);

    expect(screen.getByLabelText('会社名・組織名（任意）')).toBeInTheDocument();
    expect(screen.getByLabelText('電話番号（任意）')).toBeInTheDocument();
  });

  it('should render back button in confirmation screen', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText('お名前'), 'Test User');
    await user.type(screen.getByLabelText('メールアドレス'), 'test@example.com');
    await user.type(screen.getByLabelText('件名'), 'Test Subject');
    await user.type(screen.getByLabelText('お問い合わせ内容'), 'Test Content');
    await user.selectOptions(screen.getByLabelText('カテゴリー'), 'development');

    await user.click(screen.getByRole('button', { name: 'お問い合わせを送信' }));

    // Check back button exists
    await waitFor(() => {
      expect(screen.getByText('修正する')).toBeInTheDocument();
    });
  });
});
