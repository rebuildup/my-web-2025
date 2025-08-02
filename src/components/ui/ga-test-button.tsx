"use client";

import { trackPortfolioEvent } from "@/app/portfolio/components/GoogleAnalytics";
import { Button } from "@/components/ui/button";

export function GATestButton() {
  const handleTestEvent = () => {
    // テストイベントを送信
    trackPortfolioEvent("test_event", "Test", "manual_test", 1);
    console.log("Google Analytics test event sent");
  };

  const handleTestPageView = () => {
    // テストページビューを送信
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-RHP8NQ10X2", {
        page_path: "/test-page",
        page_title: "Test Page",
      });
      console.log("Google Analytics test page view sent");
    } else {
      console.warn("Google Analytics gtag not available");
    }
  };

  const handleTestCustomEvent = () => {
    // カスタムイベントを送信
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "custom_test_event", {
        event_category: "Test",
        event_label: "Custom Test Event",
        value: 1,
        custom_parameter: "test_value",
      });
      console.log("Google Analytics custom test event sent");
    } else {
      console.warn("Google Analytics gtag not available");
    }
  };

  // 開発環境でのみ表示
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <div className="bg-background border border-border rounded-lg p-4 shadow-lg">
        <h3 className="text-sm font-semibold mb-2">Google Analytics Test</h3>
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestEvent}
            className="w-full"
          >
            Test Event
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestPageView}
            className="w-full"
          >
            Test Page View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleTestCustomEvent}
            className="w-full"
          >
            Test Custom Event
          </Button>
        </div>
      </div>
    </div>
  );
}
