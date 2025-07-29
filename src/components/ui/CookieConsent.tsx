/**
 * Cookie Consent Component
 * GDPR-compliant cookie consent banner
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAnalytics } from "@/components/providers/AnalyticsProvider";

interface CookieConsentProps {
  className?: string;
}

export function CookieConsent({ className = "" }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { consentGiven, setConsent } = useAnalytics();

  useEffect(() => {
    // Don't show banner in test environment
    if (
      process.env.NODE_ENV === "test" ||
      process.env.PLAYWRIGHT_TEST === "true"
    ) {
      return;
    }

    // Show banner if consent hasn't been given or denied
    const savedConsent = localStorage.getItem("analytics-consent");
    if (savedConsent === null) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    setConsent(true);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    setConsent(false);
    setShowBanner(false);
  };

  const handleAcceptSelected = () => {
    // For now, we only have analytics cookies
    // In a more complex setup, you'd handle individual cookie categories
    setConsent(true);
    setShowBanner(false);
    setShowDetails(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm shadow-lg ${className}`}
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="max-w-7xl mx-auto p-4">
        {!showDetails ? (
          // Simple consent banner
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3
                id="cookie-consent-title"
                className="neue-haas-grotesk-display text-xl text-primary mb-2"
              >
                Cookie Settings
              </h3>
              <p
                id="cookie-consent-description"
                className="noto-sans-jp-light text-sm text-foreground"
              >
                We use cookies to improve your experience and analyze site
                usage. You can choose which cookies to accept.
              </p>
            </div>
            <div className="flex flex-row gap-2 flex-wrap">
              <button
                onClick={() => setShowDetails(true)}
                className="px-ratio-sm py-ratio-xs noto-sans-jp-light text-sm text-accent hover:text-primary underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Customize
              </button>
              <button
                onClick={handleRejectAll}
                className="px-ratio-sm py-ratio-xs noto-sans-jp-light text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-ratio-sm py-ratio-xs noto-sans-jp-light text-sm bg-primary text-background hover:bg-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed consent options
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="neue-haas-grotesk-display text-xl text-primary">
                Cookie Preferences
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                aria-label="Close details"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Essential Cookies */}
              <div className="border border-foreground bg-background/80 backdrop-blur-sm p-4 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="neue-haas-grotesk-display text-base text-primary">
                    Essential Cookies
                  </h4>
                  <span className="noto-sans-jp-light text-sm text-muted-foreground bg-secondary/80 px-2 py-1 rounded-sm">
                    Always Active
                  </span>
                </div>
                <p className="noto-sans-jp-light text-sm text-foreground">
                  These cookies are necessary for the website to function and
                  cannot be disabled. They are usually set in response to
                  actions made by you such as setting your privacy preferences.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-foreground bg-background/80 backdrop-blur-sm p-4 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="neue-haas-grotesk-display text-base text-primary">
                    Analytics Cookies
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={consentGiven}
                      onChange={() => {
                        // Handle individual cookie category toggle
                        // For now, this is the only optional category
                      }}
                    />
                    <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>
                <p className="noto-sans-jp-light text-sm text-foreground mb-2">
                  These cookies help us understand how visitors interact with
                  our website by collecting and reporting information
                  anonymously.
                </p>
                <details className="noto-sans-jp-light text-sm text-muted-foreground">
                  <summary className="cursor-pointer hover:text-foreground">
                    View details
                  </summary>
                  <div className="mt-2 pl-4 border-l-2 border-border">
                    <p>
                      <strong>Google Analytics:</strong> Tracks page views, user
                      interactions, and performance metrics
                    </p>
                    <p>
                      <strong>Data collected:</strong> Page URLs, referrer
                      information, device type, browser information
                    </p>
                    <p>
                      <strong>Retention:</strong> 26 months
                    </p>
                    <p>
                      <strong>Purpose:</strong> Website optimization and user
                      experience improvement
                    </p>
                  </div>
                </details>
              </div>
            </div>

            <div className="flex flex-row gap-2 justify-end flex-wrap">
              <button
                onClick={handleRejectAll}
                className="px-ratio-sm py-ratio-xs noto-sans-jp-light text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptSelected}
                className="px-ratio-sm py-ratio-xs noto-sans-jp-light text-sm bg-primary text-background hover:bg-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                Save Preferences
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-ratio-sm py-ratio-xs noto-sans-jp-light text-sm bg-primary text-background hover:bg-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
              >
                Accept All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Cookie settings component for privacy policy page
export function CookieSettings() {
  const { consentGiven, setConsent } = useAnalytics();
  const [analyticsEnabled, setAnalyticsEnabled] = useState(consentGiven);

  const handleSave = () => {
    setConsent(analyticsEnabled);
    alert("Cookie preferences saved successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background/95 backdrop-blur-sm border border-foreground rounded-sm shadow-lg">
      <h2 className="neue-haas-grotesk-display text-2xl text-primary mb-4">
        Cookie Settings
      </h2>

      <div className="space-y-4">
        {/* Essential Cookies */}
        <div className="border border-foreground bg-background/80 backdrop-blur-sm p-4 rounded-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="neue-haas-grotesk-display text-base text-primary">
              Essential Cookies
            </h3>
            <span className="noto-sans-jp-light text-sm text-muted-foreground bg-secondary/80 px-2 py-1 rounded-sm">
              Always Active
            </span>
          </div>
          <p className="noto-sans-jp-light text-sm text-foreground">
            Required for basic website functionality. Cannot be disabled.
          </p>
        </div>

        {/* Analytics Cookies */}
        <div className="border border-foreground bg-background/80 backdrop-blur-sm p-4 rounded-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="neue-haas-grotesk-display text-base text-primary">
              Analytics Cookies
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </label>
          </div>
          <p className="noto-sans-jp-light text-sm text-foreground">
            Help us improve the website by allowing us to analyze usage
            patterns.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSave}
          className="px-ratio-sm py-ratio-xs noto-sans-jp-light bg-primary text-background hover:bg-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
