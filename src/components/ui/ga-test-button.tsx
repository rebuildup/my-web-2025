"use client";

import { Button } from "@/components/ui/button";

// Simple gtag function for testing
const trackPortfolioEvent = (portfolioId: string, action: string) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "portfolio_interaction", {
      event_category: "Portfolio",
      event_label: `${action}_${portfolioId}`,
      portfolio_id: portfolioId,
      interaction_type: action,
    });
  }
};

export function GATestButton() {
  const handleTestEvent = () => {
    trackPortfolioEvent("test-portfolio", "test-action");
    console.log("GA test event sent");
  };

  return (
    <Button
      onClick={handleTestEvent}
      variant="outline"
      size="sm"
      className="fixed bottom-4 right-4 z-50"
    >
      Test GA Event
    </Button>
  );
}
