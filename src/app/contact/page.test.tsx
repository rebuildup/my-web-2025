import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactPage from './page';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch as typeof fetch;

describe('Contact Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  it('should render the contact page', () => {
    render(<ContactPage />);

    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
    expect(
      screen.getByText(/Webデザイン・開発のご依頼、プラグイン・ツールについてのご質問/)
    ).toBeInTheDocument();
  });

  it('should render contact information section', () => {
    render(<ContactPage />);

    expect(screen.getByText('連絡先情報')).toBeInTheDocument();
    expect(screen.getByText('361do.sleep@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('@361do_sleep')).toBeInTheDocument();
    expect(screen.getByText('24-48時間')).toBeInTheDocument();
  });

  it('should render contact form', () => {
    render(<ContactPage />);

    expect(screen.getByText('お問い合わせフォーム')).toBeInTheDocument();
    expect(screen.getByLabelText(/お名前/)).toBeInTheDocument();
    expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument();
    expect(screen.getByLabelText(/会社名・組織名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/電話番号/)).toBeInTheDocument();
    expect(screen.getByLabelText(/カテゴリー/)).toBeInTheDocument();
    expect(screen.getByLabelText(/希望連絡方法/)).toBeInTheDocument();
    expect(screen.getByLabelText(/件名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/お問い合わせ内容/)).toBeInTheDocument();
  });

  it('should render form categories', () => {
    render(<ContactPage />);

    const categorySelect = screen.getByLabelText(/カテゴリー/);
    expect(categorySelect).toBeInTheDocument();

    // Check for category options
    expect(screen.getByText('開発依頼')).toBeInTheDocument();
    expect(screen.getByText('映像制作依頼')).toBeInTheDocument();
    expect(screen.getByText('プラグイン・ツールについて')).toBeInTheDocument();
    expect(screen.getByText('その他')).toBeInTheDocument();
  });

  it('should handle form submission and show confirmation', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Fill out required fields
    await user.type(screen.getByLabelText(/お名前/), 'Test User');
    await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com');
    await user.selectOptions(screen.getByLabelText(/カテゴリー/), 'development');
    await user.type(screen.getByLabelText(/件名/), 'Test Subject');
    await user.type(screen.getByLabelText(/お問い合わせ内容/), 'Test message');

    // Submit form
    await user.click(screen.getByRole('button', { name: /確認画面へ進む/ }));

    // Should show confirmation screen
    await waitFor(() => {
      expect(screen.getByText('送信内容の確認')).toBeInTheDocument();
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Test Subject')).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should handle form validation errors', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /確認画面へ進む/ }));

    // Form should stay on the same page and not go to confirmation
    expect(screen.queryByText('送信内容の確認')).not.toBeInTheDocument();
    expect(screen.getByText('お問い合わせフォーム')).toBeInTheDocument();
  });

  it('should handle successful form submission', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    render(<ContactPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/お名前/), 'Test User');
    await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com');
    await user.selectOptions(screen.getByLabelText(/カテゴリー/), 'development');
    await user.type(screen.getByLabelText(/件名/), 'Test Subject');
    await user.type(screen.getByLabelText(/お問い合わせ内容/), 'Test message');

    await user.click(screen.getByRole('button', { name: /確認画面へ進む/ }));

    // Wait for confirmation screen and submit
    await waitFor(() => {
      expect(screen.getByText('送信内容の確認')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /送信する/ }));

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('送信完了')).toBeInTheDocument();
    });
  });

  it('should handle form submission errors', async () => {
    const user = userEvent.setup();
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ContactPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/お名前/), 'Test User');
    await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com');
    await user.selectOptions(screen.getByLabelText(/カテゴリー/), 'development');
    await user.type(screen.getByLabelText(/件名/), 'Test Subject');
    await user.type(screen.getByLabelText(/お問い合わせ内容/), 'Test message');

    await user.click(screen.getByRole('button', { name: /確認画面へ進む/ }));

    await waitFor(() => {
      expect(screen.getByText('送信内容の確認')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /送信する/ }));

    // Mock failed, so button should remain enabled and page stays on confirmation
    await waitFor(() => {
      expect(screen.getByText('送信内容の確認')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /送信する/ })).toBeInTheDocument();
    });
  });

  it('should allow going back from confirmation screen', async () => {
    const user = userEvent.setup();
    render(<ContactPage />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/お名前/), 'Test User');
    await user.type(screen.getByLabelText(/メールアドレス/), 'test@example.com');
    await user.selectOptions(screen.getByLabelText(/カテゴリー/), 'development');
    await user.type(screen.getByLabelText(/件名/), 'Test Subject');
    await user.type(screen.getByLabelText(/お問い合わせ内容/), 'Test message');

    await user.click(screen.getByRole('button', { name: /確認画面へ進む/ }));

    await waitFor(() => {
      expect(screen.getByText('送信内容の確認')).toBeInTheDocument();
    });

    // Go back to form
    await user.click(screen.getByRole('button', { name: /戻って修正/ }));

    // Should be back to form
    await waitFor(() => {
      expect(screen.getByText('お問い合わせフォーム')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
  });

  it('should render reCAPTCHA notice', () => {
    render(<ContactPage />);

    expect(screen.getByText(/このサイトはreCAPTCHAによって保護されており/)).toBeInTheDocument();
    expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument();
    expect(screen.getByText('利用規約')).toBeInTheDocument();
  });

  it('should have proper form field labels and structure', () => {
    render(<ContactPage />);

    // Required fields should have asterisks (check for asterisk span)
    expect(screen.getByText('お名前')).toBeInTheDocument();
    expect(screen.getByText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByText('カテゴリー')).toBeInTheDocument();
    expect(screen.getByText('件名')).toBeInTheDocument();
    expect(screen.getByText('お問い合わせ内容')).toBeInTheDocument();

    // Check for asterisks (they are in separate spans)
    const asterisks = screen.getAllByText('*');
    expect(asterisks.length).toBeGreaterThanOrEqual(5); // At least 5 required fields

    // Optional fields should not have asterisks
    expect(screen.getByLabelText('会社名・組織名')).toBeInTheDocument();
    expect(screen.getByLabelText('電話番号')).toBeInTheDocument();
  });
});
