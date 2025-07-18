import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
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
      const { asyncScriptOnLoad } = props;
      React.useEffect(() => {
        if (asyncScriptOnLoad) {
          asyncScriptOnLoad();
        }
      }, [asyncScriptOnLoad]);

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

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Info: () => <span data-testid="info-icon">Info</span>,
}));

describe('AccessibleRecaptcha', () => {
  it('should render without crashing', () => {
    const { container } = render(<AccessibleRecaptcha onChange={() => {}} />);
    console.log(container.innerHTML);
    expect(container).toBeTruthy();
  });

  it('should execute reCAPTCHA automatically when invisible is true', async () => {
    render(<AccessibleRecaptcha onChange={() => {}} invisible={true} />);

    // Check if execute was called
    expect(recaptchaExecuteMock).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AccessibleRecaptcha onChange={() => {}} className="custom-class" />
    );
    expect(container.querySelector('.recaptcha-container.custom-class')).toBeInTheDocument();
  });
});
