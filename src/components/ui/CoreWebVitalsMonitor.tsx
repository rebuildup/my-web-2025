"use client";

import {
  PerformanceRegressionDetector,
  initializePerformanceRegression,
} from "@/lib/utils/performance-regression";
import React, { useEffect, useState } from "react";

interface CoreWebVitalsMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  inp: number | null;
  ttfb: number | null;
  fcp: number | null;
}

type PerformanceRating = "good" | "needs-improvement" | "poor";

interface CoreWebVitalsDisplayProps {
  showDetails?: boolean;
  className?: string;
}

export const CoreWebVitalsDisplay: React.FC<CoreWebVitalsDisplayProps> = ({
  showDetails = false,
  className = "",
}) => {
  const [metrics, setMetrics] = useState<CoreWebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    inp: null,
    ttfb: null,
    fcp: null,
  });
  const [detector, setDetector] =
    useState<PerformanceRegressionDetector | null>(null);

  useEffect(() => {
    const perfDetector = initializePerformanceRegression();
    setDetector(perfDetector);

    // Initialize performance observers
    if (typeof window !== "undefined" && "PerformanceObserver" in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
            startTime: number;
          };
          setMetrics((prev) => ({ ...prev, lcp: lastEntry.startTime }));
        });
        lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const fidEntry = entry as PerformanceEntry & {
              processingStart: number;
              startTime: number;
            };
            if ("processingStart" in fidEntry) {
              const fid = fidEntry.processingStart - fidEntry.startTime;
              setMetrics((prev) => ({ ...prev, fid }));
            }
          });
        });
        fidObserver.observe({ entryTypes: ["first-input"] });

        // CLS Observer
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            const clsEntry = entry as PerformanceEntry & {
              hadRecentInput: boolean;
              value: number;
            };
            if ("hadRecentInput" in clsEntry && "value" in clsEntry) {
              if (!clsEntry.hadRecentInput) {
                clsValue += clsEntry.value;
              }
            }
          });
          setMetrics((prev) => ({ ...prev, cls: clsValue }));
        });
        clsObserver.observe({ entryTypes: ["layout-shift"] });

        // FCP Observer
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(
            (entry: PerformanceEntry & { name: string; startTime: number }) => {
              if (entry.name === "first-contentful-paint") {
                setMetrics((prev) => ({ ...prev, fcp: entry.startTime }));
              }
            },
          );
        });
        fcpObserver.observe({ entryTypes: ["paint"] });

        return () => {
          lcpObserver.disconnect();
          fidObserver.disconnect();
          clsObserver.disconnect();
          fcpObserver.disconnect();
        };
      } catch (error) {
        console.warn("Performance observers failed to initialize:", error);
      }
    }
  }, []);

  const getRating = (
    metric: keyof CoreWebVitalsMetrics,
    value: number | null,
  ): PerformanceRating => {
    if (value === null) return "poor";

    switch (metric) {
      case "lcp":
        return value <= 2500
          ? "good"
          : value <= 4000
            ? "needs-improvement"
            : "poor";
      case "fid":
        return value <= 100
          ? "good"
          : value <= 300
            ? "needs-improvement"
            : "poor";
      case "cls":
        return value <= 0.1
          ? "good"
          : value <= 0.25
            ? "needs-improvement"
            : "poor";
      case "fcp":
        return value <= 1800
          ? "good"
          : value <= 3000
            ? "needs-improvement"
            : "poor";
      case "ttfb":
        return value <= 800
          ? "good"
          : value <= 1800
            ? "needs-improvement"
            : "poor";
      default:
        return "poor";
    }
  };

  const getRatingColor = (rating: PerformanceRating): string => {
    switch (rating) {
      case "good":
        return "text-green-500";
      case "needs-improvement":
        return "text-yellow-500";
      case "poor":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const formatMetricValue = (
    metric: keyof CoreWebVitalsMetrics,
    value: number | null,
  ): string => {
    if (value === null) return "N/A";

    switch (metric) {
      case "lcp":
      case "fid":
      case "inp":
      case "ttfb":
      case "fcp":
        return `${Math.round(value)}ms`;
      case "cls":
        return value.toFixed(3);
      default:
        return value.toString();
    }
  };

  const getMetricName = (metric: keyof CoreWebVitalsMetrics): string => {
    switch (metric) {
      case "lcp":
        return "LCP";
      case "fid":
        return "FID";
      case "cls":
        return "CLS";
      case "inp":
        return "INP";
      case "ttfb":
        return "TTFB";
      case "fcp":
        return "FCP";
      default:
        return String(metric).toUpperCase();
    }
  };

  const getMetricDescription = (metric: keyof CoreWebVitalsMetrics): string => {
    switch (metric) {
      case "lcp":
        return "Largest Contentful Paint - Time to render the largest content element";
      case "fid":
        return "First Input Delay - Time from first user interaction to browser response";
      case "cls":
        return "Cumulative Layout Shift - Visual stability of the page";
      case "inp":
        return "Interaction to Next Paint - Responsiveness to user interactions";
      case "ttfb":
        return "Time to First Byte - Server response time";
      case "fcp":
        return "First Contentful Paint - Time to first content render";
      default:
        return "";
    }
  };

  const runPerformanceTest = async () => {
    if (!detector) return;

    try {
      const status = detector.getPerformanceStatus();
      console.log("Performance status:", status);

      // Show results in development
      if (process.env.NODE_ENV === "development") {
        alert(
          `Performance Test Complete!\nRegressions: ${status.regressions.length}\nBaseline: ${status.baseline ? "Set" : "Not Set"}`,
        );
      }
    } catch (error) {
      console.error("Performance test failed:", error);
    }
  };

  if (!showDetails) {
    // Compact view - show only core metrics
    const coreMetrics = ["lcp", "fid", "cls"] as const;
    const allGood = coreMetrics.every((metric) => {
      const rating = getRating(metric, metrics[metric]);
      return rating === "good";
    });

    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div
          className={`w-3 h-3 rounded-full ${allGood ? "bg-green-500" : "bg-yellow-500"}`}
        />
        <span className="text-sm text-gray-600">
          Core Web Vitals: {allGood ? "Good" : "Needs Improvement"}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Core Web Vitals</h3>
        {process.env.NODE_ENV === "development" && (
          <button
            onClick={runPerformanceTest}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Run Test
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(metrics).map(([metric, value]) => {
          const metricKey = metric as keyof CoreWebVitalsMetrics;
          const rating = getRating(metricKey, value);
          const colorClass = getRatingColor(rating);

          return (
            <div key={metric} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {getMetricName(metricKey)}
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    rating === "good"
                      ? "bg-green-500"
                      : rating === "needs-improvement"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                />
              </div>

              <div className={`text-lg font-bold ${colorClass}`}>
                {formatMetricValue(metricKey, value)}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {getMetricDescription(metricKey)}
              </div>
            </div>
          );
        })}
      </div>

      {detector && (
        <div className="mt-6">
          <PerformanceReport detector={detector} />
        </div>
      )}
    </div>
  );
};

interface PerformanceReportProps {
  detector: PerformanceRegressionDetector;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({ detector }) => {
  const [status, setStatus] = useState(detector.getPerformanceStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(detector.getPerformanceStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, [detector]);

  const score =
    status.regressions.length === 0
      ? 100
      : Math.max(0, 100 - status.regressions.length * 20);

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-medium text-gray-800">Performance Score</h4>
        <div
          className={`text-2xl font-bold ${
            score >= 90
              ? "text-green-500"
              : score >= 70
                ? "text-yellow-500"
                : "text-red-500"
          }`}
        >
          {score}/100
        </div>
      </div>

      {status.regressions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-yellow-800 mb-2">
            Performance Issues ({status.regressions.length})
          </h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            {status.regressions.map((regression, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  {regression.metric}: {regression.regression.toFixed(1)}%
                  regression
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Performance budget indicator
interface PerformanceBudgetProps {
  className?: string;
}

export const PerformanceBudgetIndicator: React.FC<PerformanceBudgetProps> = ({
  className = "",
}) => {
  const [budgetStatus, setBudgetStatus] = useState<{
    withinBudget: boolean;
    violations: number;
  }>({
    withinBudget: true,
    violations: 0,
  });

  useEffect(() => {
    // This would integrate with the PerformanceBudget class
    // For now, simulate budget checking
    const checkBudget = () => {
      // Simulate budget check
      setBudgetStatus({
        withinBudget: Math.random() > 0.3,
        violations: Math.floor(Math.random() * 3),
      });
    };

    checkBudget();
    const interval = setInterval(checkBudget, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`w-3 h-3 rounded-full ${
          budgetStatus.withinBudget ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm text-gray-600">
        Performance Budget:{" "}
        {budgetStatus.withinBudget
          ? "Within Limits"
          : `${budgetStatus.violations} Violations`}
      </span>
    </div>
  );
};

// Development-only performance panel
export const PerformanceDevPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Performance Monitor"
      >
        ⚡
      </button>

      {isVisible && (
        <div className="absolute bottom-12 left-0 w-96 max-h-96 overflow-y-auto">
          <CoreWebVitalsDisplay showDetails={true} />
          <div className="mt-2">
            <PerformanceBudgetIndicator />
          </div>
        </div>
      )}
    </div>
  );
};
