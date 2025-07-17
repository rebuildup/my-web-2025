'use client';

import React, { useRef, useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Info } from 'lucide-react';

interface AccessibleRecaptchaProps {
  siteKey?: string;
  onChange: (token: string | null) => void;
  invisible?: boolean;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  tabIndex?: number;
  onExpired?: () => void;
  onError?: (error: Error) => void;
  language?: string;
  className?: string;
}

/**
 * Accessible reCAPTCHA component with enhanced features
 */
export default function AccessibleRecaptcha({
  siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
  onChange,
  invisible = false,
  theme = 'light',
  size = 'normal',
  tabIndex = 0,
  onExpired,
  onError,
  language,
  className,
}: AccessibleRecaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Execute reCAPTCHA automatically if invisible
  useEffect(() => {
    if (invisible && recaptchaRef.current && isLoaded) {
      try {
        recaptchaRef.current.execute();
      } catch (error) {
        console.error('Failed to execute invisible reCAPTCHA:', error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      }
    }
  }, [invisible, isLoaded, onError]);

  // Handle reCAPTCHA change
  const handleChange = (token: string | null) => {
    onChange(token);
  };

  // Handle reCAPTCHA expiration
  const handleExpired = () => {
    onChange(null);
    if (onExpired) {
      onExpired();
    }
  };

  // Handle reCAPTCHA error
  const handleError = (error: Error) => {
    console.error('reCAPTCHA error:', error);
    setLoadError('Failed to load reCAPTCHA. Please try again later.');
    if (onError) {
      onError(error);
    }
  };

  // Handle reCAPTCHA load
  const handleLoad = () => {
    setIsLoaded(true);
    setLoadError(null);
  };

  // Toggle help text
  const toggleHelp = () => {
    setShowHelp(prev => !prev);
  };

  return (
    <div className={`recaptcha-container ${className || ''}`}>
      {/* Accessibility help button */}
      <button
        type="button"
        onClick={toggleHelp}
        className="text-foreground/70 hover:text-primary mb-2 flex items-center text-xs"
        aria-expanded={showHelp}
        aria-controls="recaptcha-help"
      >
        <Info className="mr-1 h-3 w-3" />
        reCAPTCHA accessibility information
      </button>

      {/* Help text */}
      {showHelp && (
        <div
          id="recaptcha-help"
          className="border-foreground/10 bg-foreground/5 text-foreground/80 mb-4 rounded border p-3 text-xs"
        >
          <p className="mb-2">
            This form is protected by reCAPTCHA to ensure you are not a robot. If you have
            difficulty using the visual challenge:
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li>Click the refresh button for a new challenge</li>
            <li>Click the audio button for an audio challenge</li>
            <li>
              If you need assistance, please contact us at{' '}
              <a href="mailto:support@samuido.com" className="text-primary underline">
                support@samuido.com
              </a>
            </li>
          </ul>
        </div>
      )}

      {/* reCAPTCHA component */}
      <div className="recaptcha-wrapper">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey || ''}
          onChange={handleChange}
          onExpired={handleExpired}
          onErrored={() => handleError(new Error('reCAPTCHA error'))}
          theme={theme}
          size={invisible ? 'invisible' : size}
          tabindex={tabIndex}
          hl={language}
          asyncScriptOnLoad={handleLoad}
        />
      </div>

      {/* Error message */}
      {loadError && (
        <div className="mt-2 text-xs text-red-500" role="alert">
          {loadError}
        </div>
      )}

      {/* Fallback for invisible reCAPTCHA */}
      {invisible && !isLoaded && (
        <div className="text-foreground/70 mt-2 text-xs">Loading security verification...</div>
      )}
    </div>
  );
}
