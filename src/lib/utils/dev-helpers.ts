/**
 * Development helper utilities
 */

/**
 * Clear analytics consent in development environment
 * Useful when GA_ID is not configured
 */
export function clearAnalyticsConsent(): void {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    localStorage.removeItem("analytics-consent");
    console.log("Analytics consent cleared");
  }
}

/**
 * Check if analytics is properly configured
 */
export function checkAnalyticsConfig(): boolean {
  const hasGAId = !!process.env.NEXT_PUBLIC_GA_ID;
  const hasConsent = localStorage.getItem("analytics-consent") === "true";

  console.log("Analytics config check:", {
    hasGAId,
    hasConsent,
    gaId: process.env.NEXT_PUBLIC_GA_ID || "not configured",
  });

  return hasGAId;
}

// Auto-clear consent if GA_ID is not configured (development only)
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  if (
    !process.env.NEXT_PUBLIC_GA_ID &&
    localStorage.getItem("analytics-consent")
  ) {
    clearAnalyticsConsent();
  }
}
