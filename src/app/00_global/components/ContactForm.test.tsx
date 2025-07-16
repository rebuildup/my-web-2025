import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactForm from './ContactForm';

// Mock ReCAPTCHA
const recaptchaResetMock = vi.fn();
const recaptchaExecuteMock = vi.fn();
vi.mock('react-google-recaptcha', () => {
  const MockRecaptcha = React.forwardRef(
    (
      props: { onChange: (token: string) => void },
      ref: React.Ref<{ reset: () => void; execute: () => void }>
    ) => {
      React.useImperativeHandle(ref, () => ({
        reset: recaptchaResetMock,
        execute: recaptchaExecuteMock,
      }));
      // Allow simulating a click to trigger onChange
      return <div data-testid="recaptcha" onClick={() => props.onChange('dummy-token')} />;
    }
  );
  MockRecaptcha.displayName = 'MockRecaptcha';
  return {
    __esModule: true,
    default: MockRecaptcha,
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
  });

  const fillForm = async () => {
    await user.type(screen.getByLabelText(/Full Name/), 'John Doe');
    await user.type(screen.getByLabelText(/Email Address/), 'john.doe@example.com');
    await user.type(screen.getByLabelText(/Subject/), 'Test Subject');
    await user.type(screen.getByLabelText(/Message/), 'This is a test message with enough length.');
    // Simulate reCAPTCHA completion
    await user.click(screen.getByTestId('recaptcha'));
    // Wait for the form to update
    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument();
    });
  };

  it('should render the form correctly', () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument();
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Message/ })).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields on submit', async () => {
    render(<ContactForm />);
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

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
    await user.type(screen.getByLabelText(/Email Address/), 'invalid-email');
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should show validation error for short message', async () => {
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/Message/), 'short');
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    await waitFor(() => {
      expect(screen.getByText('Message must be at least 10 characters long')).toBeInTheDocument();
    });
  });

  it('should submit the form successfully with valid data', async () => {
    render(<ContactForm />);
    await fillForm();
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/contact', expect.any(Object));
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
    });
  });

  it('should handle API error on submit', async () => {
    mockFetch.mockResolvedValue({ ok: false });
    render(<ContactForm />);
    await fillForm();
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit form. Please try again.')).toBeInTheDocument();
    });
  });

  it('should handle network error on submit', async () => {
    mockFetch.mockRejectedValue(new Error('Network Error'));
    render(<ContactForm />);
    await fillForm();
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    await waitFor(() => {
      expect(screen.getByText('Failed to submit form. Please try again.')).toBeInTheDocument();
    });
  });

  it('should clear the form when clear button is clicked', async () => {
    render(<ContactForm />);
    await user.type(screen.getByLabelText(/Full Name/), 'John Doe');
    await user.click(screen.getByRole('button', { name: /Clear/ }));

    expect(screen.getByLabelText(/Full Name/)).toHaveValue('');
    expect(recaptchaResetMock).toHaveBeenCalled();
  });

  it('should allow sending another message after successful submission', async () => {
    render(<ContactForm />);
    await fillForm();
    await user.click(screen.getByRole('button', { name: /Send Message/ }));

    await waitFor(() => {
      expect(screen.getByText('Message Sent Successfully!')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Send Another Message/ }));
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
  });

  it('should update security score as user types', async () => {
    render(<ContactForm />);
    expect(screen.getByText('0%')).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Full Name/), 'John');
    await waitFor(() => expect(screen.getByText('20%')).toBeInTheDocument());

    await user.type(screen.getByLabelText(/Email Address/), 'john@a.com');
    await waitFor(() => expect(screen.getByText('40%')).toBeInTheDocument());

    await user.type(screen.getByLabelText(/Subject/), 'Subject');
    await waitFor(() => expect(screen.getByText('60%')).toBeInTheDocument());

    await user.type(screen.getByLabelText(/Message/), 'A long message');
    await waitFor(() => expect(screen.getByText('80%')).toBeInTheDocument());

    await user.click(screen.getByTestId('recaptcha'));
    await waitFor(() => expect(screen.getByText('100%')).toBeInTheDocument());
  });
});
