import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AccessibleRecaptcha from './AccessibleRecaptcha';

// Mock ReCAPTCHA
const recaptchaExecuteMock = vi.fn();
const recaptchaResetMock = vi.fn();

vi.mock('react-google-recaptcha', () => {
  const MockRecaptcha = React.forwardRef(
    (
      props: {
        onChange: (token: string | null) => void;
        onExpired?: () => void;
        onErrored?: (error: Error) => void;
        asyncScriptOnLoad?: () => void;
      },
      ref: React.Ref<{ execute: () => void; reset: () => void }>
    ) => {
      React.useImperativeHandle(ref, () => ({
        execute: recaptchaExecuteMock,
        reset: recaptchaResetMock,
      }));

      // Call asyncScriptOnLoad to simulate script loading
      React.useEffect(() => {
        if (props.asyncScriptOnLoad) {
          props.asyncScriptOnLoad();
        }
      }, [props.asyncScriptOnLoad]);

      return (
        <div data-testid="recaptcha">
          <button onClick={() => props.onChange('test-token')} data-testid="recaptcha-success">
            Simulate Success
          </button>
          <button onClick={() => props.onChange(null)} data-testid="recaptcha-failure">
            Simulate Failure
          </button>
          <button
            onClick={() => {
              if (props.onExpired) props.onExpired();
            }}
            data-testid="recaptcha-expired"
          >
            Simulate Expiry
          </button>
          <button
            onClick={() => {
              if (props.onErrored) props.onErrored(new Error('reCAPTCHA error'));
            }}
            data-testid="recaptcha-error"
          >
            Simulate Error
          </button>
        </div>
      );
    }
  );
  MockRecaptcha.displayName = 'MockRecaptcha';
  return {
    __esModule: true,
    default: MockRecaptcha,
  };
});

describe('AccessibleRecaptcha', () => {
  const onChangeMock = vi.fn();
  const onExpiredMock = vi.fn();
  const onErrorMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the reCAPTCHA component', () => {
    render(<AccessibleRecaptcha onChange={onChangeMock} />);
    expect(screen.getByTestId('recaptcha')).toBeInTheDocument();
    expect(screen.getByText('reCAPTCHA accessibility information')).toBeInTheDocument();
  });

  it('should show help text when accessibility button is clicked', () => {
    render(<AccessibleRecaptcha onChange={onChangeMock} />);

    // Help text should not be visible initially
    expect(screen.queryByText(/This form is protected by reCAPTCHA/)).not.toBeInTheDocument();

    // Click the accessibility button
    fireEvent.click(screen.getByText('reCAPTCHA accessibility information'));

    // Help text should now be visible
    expect(screen.getByText(/This form is protected by reCAPTCHA/)).toBeInTheDocument();
  });

  it('should call onChange when reCAPTCHA verification succeeds', () => {
    render(<AccessibleRecaptcha onChange={onChangeMock} />);

    // Simulate successful verification
    fireEvent.click(screen.getByTestId('recaptcha-success'));

    expect(onChangeMock).toHaveBeenCalledWith('test-token');
  });

  it('should call onChange with null when reCAPTCHA verification fails', () => {
    render(<AccessibleRecaptcha onChange={onChangeMock} />);

    // Simulate failed verification
    fireEvent.click(screen.getByTestId('recaptcha-failure'));

    expect(onChangeMock).toHaveBeenCalledWith(null);
  });

  it('should call onExpired when reCAPTCHA expires', () => {
    render(<AccessibleRecaptcha onChange={onChangeMock} onExpired={onExpiredMock} />);

    // Simulate expiry
    fireEvent.click(screen.getByTestId('recaptcha-expired'));

    expect(onChangeMock).toHaveBeenCalledWith(null);
    expect(onExpiredMock).toHaveBeenCalled();
  });

  it('should call onError when reCAPTCHA encounters an error', () => {
    render(<AccessibleRecaptcha onChange={onChangeMock} onError={onErrorMock} />);

    // Simulate error
    fireEvent.click(screen.getByTestId('recaptcha-error'));

    expect(onErrorMock).toHaveBeenCalledWith(expect.any(Error));
    expect(screen.getByText(/Failed to load reCAPTCHA/)).toBeInTheDocument();
  });

  it('should execute reCAPTCHA automatically when invisible is true', async () => {
    render(<AccessibleRecaptcha onChange={onChangeMock} invisible={true} />);

    // Wait for the component to load and execute
    await waitFor(() => {
      expect(recaptchaExecuteMock).toHaveBeenCalled();
    });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AccessibleRecaptcha onChange={onChangeMock} className="custom-class" />
    );
    expect(container.querySelector('.recaptcha-container.custom-class')).toBeInTheDocument();
  });
});
