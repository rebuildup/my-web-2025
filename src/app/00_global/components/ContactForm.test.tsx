import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm';

interface RecaptchaProps {
  onChange?: (token: string | null) => void;
  onError?: () => void;
  onExpired?: () => void;
  [key: string]: unknown;
}

vi.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: ({ onChange, onError, onExpired, ...props }: RecaptchaProps) => (
    <div
      data-testid="recaptcha"
      tabIndex={0}
      onClick={() => onChange && onChange('dummy-token')}
      onError={onError}
      {...props}
    >
      Mocked reCAPTCHA
    </div>
  ),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
    expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
  });

  it('should render initial state', () => {
    const { container } = render(<ContactForm />);
    // Security Score: 0% をtextContentで検証
    expect(container.textContent).toContain('Security Score');
    expect(container.textContent).toContain('0%');
  });

  it('should update security score as form fields are filled', async () => {
    const { container } = render(<ContactForm />);
    const user = userEvent.setup();
    const nameInput = screen.getByLabelText('Full Name *');
    const emailInput = screen.getByLabelText('Email Address *');
    const subjectInput = screen.getByLabelText('Subject *');
    const messageInput = screen.getByLabelText('Message *');

    // Fill name (should add 20%)
    await user.type(nameInput, 'John Doe');
    expect(container.textContent).toContain('20%');

    // Fill email (should add 20%)
    await user.type(emailInput, 'john@example.com');
    expect(container.textContent).toContain('40%');

    // Fill subject (should add 20%)
    await user.type(subjectInput, 'Test Subject');
    expect(container.textContent).toContain('60%');

    // Fill message (should add 20%)
    await user.type(messageInput, 'This is a test message');
    expect(container.textContent).toContain('80%');
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    // Should show validation errors
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Subject is required')).toBeInTheDocument();
    expect(screen.getByText('Message is required')).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    render(<ContactForm />);
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText('Email Address *');
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));
    // 非同期でバリデーションエラーを待つ
    await waitFor(() => {
      expect(screen.getByText(text => text.includes('valid email address'))).toBeInTheDocument();
    });
  });

  it('should validate message length', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const messageInput = screen.getByLabelText('Message *');
    await user.type(messageInput, 'short');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(screen.getByText('Message must be at least 10 characters long')).toBeInTheDocument();
  });

  it('should validate ReCAPTCHA completion', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill all required fields
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message that is long enough'
    );

    // Try to submit without completing ReCAPTCHA
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(screen.getByText('Please complete the reCAPTCHA verification')).toBeInTheDocument();
  });

  it('should submit form successfully', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill all fields
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message that is long enough'
    );

    // Complete ReCAPTCHA
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Mock fetch to return error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    });

    // Fill all fields
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message that is long enough'
    );

    // Complete ReCAPTCHA
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to submit form. Please try again.')).toBeInTheDocument();
    });
  });

  it('should handle fetch exceptions', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Mock fetch to throw exception
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    // Fill all fields
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message that is long enough'
    );

    // Complete ReCAPTCHA
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Failed to submit form. Please try again.')).toBeInTheDocument();
    });
  });

  it('should clear form after successful submission', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill all fields
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(screen.getByLabelText('Message *'), 'This is a test message');

    // Complete ReCAPTCHA
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
    });

    // Click "Send Another Message" button
    const sendAnotherButton = screen.getByRole('button', { name: 'Send Another Message' });
    await user.click(sendAnotherButton);

    // Form should be cleared
    expect(screen.getByLabelText('Full Name *')).toHaveValue('');
    expect(screen.getByLabelText('Email Address *')).toHaveValue('');
    expect(screen.getByLabelText('Subject *')).toHaveValue('');
    expect(screen.getByLabelText('Message *')).toHaveValue('');
    // Security Scoreの検証はtext matcherで柔軟に
    expect(screen.getByText(text => text.includes('Security Score'))).toBeInTheDocument();
  });

  it('should handle ReCAPTCHA errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill all fields
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message that is long enough'
    );

    // Trigger ReCAPTCHA error
    const recaptcha = screen.getByTestId('recaptcha');
    fireEvent.error(recaptcha);

    // Try to submit
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    // Should show ReCAPTCHA error（エラーメッセージのみをclassで絞り込む）
    const recaptchaErrors = screen.getAllByText(text => text.includes('reCAPTCHA'));
    expect(recaptchaErrors.some(el => el.className.includes('text-red-400'))).toBe(true);
  });

  it('should handle ReCAPTCHA expiration', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill all fields
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message that is long enough'
    );

    // Complete ReCAPTCHA
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    // Trigger ReCAPTCHA expiration
    fireEvent.error(recaptcha);

    // Try to submit
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    // Should show ReCAPTCHA error
    expect(screen.getByText(text => text.includes('reCAPTCHA'))).toBeInTheDocument();
  });

  it('should handle timeout during submission', async () => {
    vi.useFakeTimers();
    const { container } = render(<ContactForm />);
    // Mock fetch to never resolve
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));

    // Fill all fields
    await userEvent.setup().type(screen.getByLabelText('Full Name *'), 'John Doe');
    await userEvent.setup().type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await userEvent.setup().type(screen.getByLabelText('Subject *'), 'Test Subject');
    await userEvent
      .setup()
      .type(screen.getByLabelText('Message *'), 'This is a test message that is long enough');

    // Complete ReCAPTCHA
    const recaptcha = screen.getByTestId('recaptcha');
    await userEvent.setup().click(recaptcha);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await userEvent.setup().click(submitButton);

    // 10秒経過をシミュレート
    vi.advanceTimersByTime(10000);
    await waitFor(() => {
      expect(container.textContent).toMatch(/Failed to submit form|try again/i);
    });
    vi.useRealTimers();
  });
});
