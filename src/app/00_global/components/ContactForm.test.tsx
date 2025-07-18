import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/test-utils';
import ContactForm from './ContactForm';

// Mock AccessibleRecaptcha
vi.mock('./AccessibleRecaptcha', () => {
  return {
    __esModule: true,
    default: ({ onChange, onExpired, onError }: { 
      onChange: (token: string) => void;
      onExpired?: () => void;
      onError?: (error: string) => void;
    }) => (
      <div data-testid="recaptcha">
        <button data-testid="verify-recaptcha" onClick={() => onChange('dummy-token')}>
          Verify reCAPTCHA
        </button>
        <button onClick={() => onExpired()}>Expire</button>
        <button onClick={() => onError('error')}>Error</button>
      </div>
    ),
  };
});

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ContactForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful fetch
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });
    // Clear document body
    document.body.innerHTML = '';
  });

  const fillForm = async () => {
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await user.type(
      screen.getByLabelText(/message/i),
      'This is a test message with enough length.'
    );
    // Simulate reCAPTCHA completion
    await user.click(screen.getByTestId('verify-recaptcha'));
  };

  it('should render the form correctly', () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields on submit', async () => {
    render(<ContactForm />);

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Subject is required')).toBeInTheDocument();
      expect(screen.getByText('Message is required')).toBeInTheDocument();
      expect(screen.getByText('Please complete the reCAPTCHA verification')).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email format', async () => {
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should show validation error for short message', async () => {
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/message/i), 'short');

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters long')).toBeInTheDocument();
    });
  });

  it('should submit the form successfully with valid data', async () => {
    render(<ContactForm />);
    await fillForm();

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        body: expect.any(String)
      }));
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
    });
  });

  it('should handle API error on submit', async () => {
    mockFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ success: false }) });
    render(<ContactForm />);
    await fillForm();

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to submit form. Please try again.')).toBeInTheDocument();
    });
  });

  it('should handle network error on submit', async () => {
    mockFetch.mockRejectedValue(new Error('Network Error'));
    render(<ContactForm />);
    await fillForm();

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to submit form. Please try again.')).toBeInTheDocument();
    });
  });

  it('should clear the form when clear button is clicked', async () => {
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/name/i), 'John Doe');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await user.click(clearButton);

    expect(screen.getByLabelText(/name/i)).toHaveValue('');
  });

  it('should allow sending another message after successful submission', async () => {
    render(<ContactForm />);
    await fillForm();

    const sendButton = screen.getByRole('button', { name: /send message/i });
    await user.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
    });

    const sendAnotherButton = screen.getByRole('button', { name: /send another message/i });
    await user.click(sendAnotherButton);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it('should update security score as user types', async () => {
    render(<ContactForm />);

    // Initial score
    expect(screen.getByText('0%')).toBeInTheDocument();

    // Fill name
    await user.type(screen.getByLabelText(/name/i), 'John');
    await waitFor(() => expect(screen.getByText('20%')).toBeInTheDocument());

    // Fill email
    await user.type(screen.getByLabelText(/email/i), 'john@a.com');
    await waitFor(() => expect(screen.getByText('40%')).toBeInTheDocument());

    // Fill subject
    await user.type(screen.getByLabelText(/subject/i), 'Subject');
    await waitFor(() => expect(screen.getByText('60%')).toBeInTheDocument());

    // Fill message
    await user.type(screen.getByLabelText(/message/i), 'A long message');
    await waitFor(() => expect(screen.getByText('80%')).toBeInTheDocument());

    // Complete reCAPTCHA
    await user.click(screen.getByTestId('verify-recaptcha'));
    await waitFor(() => expect(screen.getByText('100%')).toBeInTheDocument());
  });
});
