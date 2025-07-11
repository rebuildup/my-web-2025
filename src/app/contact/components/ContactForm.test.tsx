import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm';

// Mock ReCAPTCHA
vi.mock('react-google-recaptcha', () => ({
  default: vi.fn().mockImplementation(({ onChange, onError, ...props }) => (
    <div
      data-testid="recaptcha"
      onClick={() => {
        onChange('mock-recaptcha-token');
      }}
      onError={() => onError && onError()}
      {...props}
    >
      Mock ReCAPTCHA
    </div>
  )),
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

  it('should show security score indicator', () => {
    render(<ContactForm />);

    expect(screen.getByText('Security Score: 0%')).toBeInTheDocument();
  });

  it('should update security score as form fields are filled', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const nameInput = screen.getByLabelText('Full Name *');
    const emailInput = screen.getByLabelText('Email Address *');
    const subjectInput = screen.getByLabelText('Subject *');
    const messageInput = screen.getByLabelText('Message *');

    // Fill name (should add 20%)
    await user.type(nameInput, 'John Doe');
    expect(screen.getByText('Security Score: 20%')).toBeInTheDocument();

    // Fill email (should add 20%)
    await user.type(emailInput, 'john@example.com');
    expect(screen.getByText('Security Score: 40%')).toBeInTheDocument();

    // Fill subject (should add 20%)
    await user.type(subjectInput, 'Test Subject');
    expect(screen.getByText('Security Score: 60%')).toBeInTheDocument();

    // Fill message (should add 20%)
    await user.type(messageInput, 'This is a test message');
    expect(screen.getByText('Security Score: 80%')).toBeInTheDocument();

    // Complete ReCAPTCHA (should add 20%)
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);
    expect(screen.getByText('Security Score: 100%')).toBeInTheDocument();
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
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText('Email Address *');
    await user.type(emailInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('should validate message length', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const messageInput = screen.getByLabelText('Message *');
    await user.type(messageInput, 'short');
    await user.click(screen.getByRole('button', { name: 'Send Message' }));

    expect(screen.getByText('Message must be at least 10 characters')).toBeInTheDocument();
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

    expect(screen.getByText('Please complete the reCAPTCHA')).toBeInTheDocument();
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
      expect(screen.getByText('Message sent successfully!')).toBeInTheDocument();
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
      expect(screen.getByText('Failed to send message. Please try again.')).toBeInTheDocument();
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
      expect(screen.getByText('Failed to send message. Please try again.')).toBeInTheDocument();
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
      expect(screen.getByText('Message sent successfully!')).toBeInTheDocument();
    });

    // Click "Send Another Message" button
    const sendAnotherButton = screen.getByRole('button', { name: 'Send Another Message' });
    await user.click(sendAnotherButton);

    // Form should be cleared
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
    expect(screen.getByText('Security Score: 0%')).toBeInTheDocument();
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

    // Should show ReCAPTCHA error
    expect(screen.getByText('Please complete the reCAPTCHA')).toBeInTheDocument();
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
    expect(screen.getByText('Please complete the reCAPTCHA')).toBeInTheDocument();
  });

  it('should handle timeout during submission', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Mock fetch to never resolve
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));

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

    // Should show timeout message after 10 seconds
    await waitFor(
      () => {
        expect(screen.getByText('Request timed out. Please try again.')).toBeInTheDocument();
      },
      { timeout: 11000 }
    );
  });
});
