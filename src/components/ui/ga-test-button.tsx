"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/google-analytics";

export function GATestButton() {
  const handleTestEvent = () => {
    trackEvent({
      action: "test_click",
      category: "Debug",
      label: "GA Test Button",
      value: 1,
    });
    console.log("GA test event sent");
  };

  const handleTestPageView = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", process.env.NEXT_PUBLIC_GA_ID!, {
        page_title: "Test Page",
        page_location: window.location.href,
      });
      console.log("GA test page view sent");
    }
  };

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50">
      <h3 className="font-bold mb-2">GA Test</h3>
      <div className="space-y-2">
        <Button size="sm" onClick={handleTestEvent} className="w-full text-xs">
          Test Event
        </Button>
        <Button
          size="sm"
          onClick={handleTestPageView}
          className="w-full text-xs"
          variant="outline"
        >
          Test Page View
        </Button>
      </div>
    </div>
  );
}
