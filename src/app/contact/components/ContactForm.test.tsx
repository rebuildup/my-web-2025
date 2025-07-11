import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm';

// Mock ReCAPTCHA
const mockReCAPTCHA = {
  reset: vi.fn(),
  getResponse: vi.fn(() => 'mock-token'),
};

vi.mock('react-google-recaptcha', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(({ onChange, onError, onExpired, ...props }) => (
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
global.fetch = vi.fn();

// Mock console.error to prevent test output pollution
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('ContactForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render the contact form with all fields', () => {
    render(<ContactForm />);

    expect(screen.getByRole('heading', { name: 'Contact Form' })).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject *')).toBeInTheDocument();
    expect(screen.getByLabelText('Message *')).toBeInTheDocument();
    expect(screen.getByLabelText('Security Verification *')).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
  });

  it('should display security score initially at 0%', () => {
    render(<ContactForm />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(
      screen.getByText('Low security - Please fill out the form and verify reCAPTCHA')
    ).toBeInTheDocument();
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
    await waitFor(() => {
      expect(screen.getByText('20%')).toBeInTheDocument();
    });

    // Fill email (should add 20%, total 40%)
    await user.type(emailInput, 'john@example.com');
    await waitFor(() => {
      expect(screen.getByText('40%')).toBeInTheDocument();
    });

    // Fill subject (should add 20%, total 60%)
    await user.type(subjectInput, 'Test Subject');
    await waitFor(() => {
      expect(screen.getByText('60%')).toBeInTheDocument();
      expect(screen.getByText('Medium security - Complete all fields')).toBeInTheDocument();
    });

    // Fill message (should add 20%, total 80%)
    await user.type(messageInput, 'This is a test message with more than 10 characters');
    await waitFor(() => {
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    // Complete reCAPTCHA (should add 20%, total 100%)
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('High security - Ready to submit')).toBeInTheDocument();
    });
  });

  it('should validate required fields and show errors', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Subject is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
      expect(screen.getByText('Please complete the reCAPTCHA verification')).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const emailInput = screen.getByLabelText('Email Address *');
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should validate message length', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const messageInput = screen.getByLabelText('Message *');
    await user.type(messageInput, 'short');

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters long')).toBeInTheDocument();
    });
  });

  it('should clear field errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // First submit to show errors
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    // Start typing in name field
    const nameInput = screen.getByLabelText('Full Name *');
    await user.type(nameInput, 'J');

    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  it('should submit form successfully with valid data', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill out form
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message with more than 10 characters'
    );

    // Complete reCAPTCHA
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    // Check loading state
    await waitFor(() => {
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });

    // Check success state
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
      expect(
        screen.getByText(
          "Thank you for your message. Your form was securely submitted and we'll get back to you soon."
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Verified with reCAPTCHA')).toBeInTheDocument();
    });

    // Verify fetch was called correctly
    expect(global.fetch).toHaveBeenCalledWith('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'This is a test message with more than 10 characters',
        recaptchaToken: 'mock-recaptcha-token',
      }),
    });
  });

  it('should handle form submission failure', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<ContactForm />);

    // Fill out form
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message with more than 10 characters'
    );

    // Complete reCAPTCHA
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to submit form. Please try again.')).toBeInTheDocument();
    });
  });

  it('should handle fetch error', async () => {
    const user = userEvent.setup();
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    render(<ContactForm />);

    // Fill out form
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message with more than 10 characters'
    );

    // Complete reCAPTCHA
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to submit form. Please try again.')).toBeInTheDocument();
    });
  });

  it('should clear form when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill out form
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(screen.getByLabelText('Message *'), 'This is a test message');

    // Click clear button
    const clearButton = screen.getByRole('button', { name: 'Clear' });
    await user.click(clearButton);

    // Check that all fields are cleared
    expect(screen.getByLabelText('Full Name *')).toHaveValue('');
    expect(screen.getByLabelText('Email Address *')).toHaveValue('');
    expect(screen.getByLabelText('Subject *')).toHaveValue('');
    expect(screen.getByLabelText('Message *')).toHaveValue('');
  });

  it('should handle reCAPTCHA error', () => {
    render(<ContactForm />);

    const recaptcha = screen.getByTestId('recaptcha');
    fireEvent.error(recaptcha);

    expect(screen.getByText('reCAPTCHA error. Please try again.')).toBeInTheDocument();
  });

  it('should clear reCAPTCHA error when successfully completed', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    const recaptcha = screen.getByTestId('recaptcha');

    // Trigger error first
    fireEvent.error(recaptcha);
    expect(screen.getByText('reCAPTCHA error. Please try again.')).toBeInTheDocument();

    // Complete reCAPTCHA successfully
    await user.click(recaptcha);

    await waitFor(() => {
      expect(screen.queryByText('reCAPTCHA error. Please try again.')).not.toBeInTheDocument();
    });
  });

  it('should show "Send Another Message" button and reset form after successful submission', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Fill and submit form
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message with more than 10 characters'
    );

    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
    });

    // Click "Send Another Message"
    const sendAnotherButton = screen.getByRole('button', { name: 'Send Another Message' });
    await user.click(sendAnotherButton);

    // Check that form is back to initial state
    expect(screen.getByRole('heading', { name: 'Contact Form' })).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should display correct security score colors and messages', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    // Initial state (0% - red)
    expect(screen.getByText('0%')).toHaveClass('text-red-400');
    expect(
      screen.getByText('Low security - Please fill out the form and verify reCAPTCHA')
    ).toBeInTheDocument();

    // Fill some fields (60% - yellow)
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');

    await waitFor(() => {
      expect(screen.getByText('60%')).toHaveClass('text-yellow-400');
      expect(screen.getByText('Medium security - Complete all fields')).toBeInTheDocument();
    });

    // Fill message and complete reCAPTCHA (100% - green)
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message with more than 10 characters'
    );
    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    await waitFor(() => {
      expect(screen.getByText('100%')).toHaveClass('text-green-400');
      expect(screen.getByText('High security - Ready to submit')).toBeInTheDocument();
    });
  });

  it('should disable submit button while submitting', async () => {
    const user = userEvent.setup();

    // Make fetch hang to test loading state
    (global.fetch as any).mockImplementationOnce(() => new Promise(() => {}));

    render(<ContactForm />);

    // Fill out form
    await user.type(screen.getByLabelText('Full Name *'), 'John Doe');
    await user.type(screen.getByLabelText('Email Address *'), 'john@example.com');
    await user.type(screen.getByLabelText('Subject *'), 'Test Subject');
    await user.type(
      screen.getByLabelText('Message *'),
      'This is a test message with more than 10 characters'
    );

    const recaptcha = screen.getByTestId('recaptcha');
    await user.click(recaptcha);

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'Send Message' });
    await user.click(submitButton);

    await waitFor(() => {
      const sendingButton = screen.getByRole('button', { name: 'Sending...' });
      expect(sendingButton).toBeDisabled();
      expect(sendingButton).toHaveClass('cursor-not-allowed');
    });
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });
});
