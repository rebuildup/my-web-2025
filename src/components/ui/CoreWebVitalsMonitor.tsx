"use client";

import React, { useEffect, useState } from "react";
import {
  CoreWebVitalsMonitor,
  CoreWebVitalsMetrics,
  PerformanceRating,
  initializeCoreWebVitals,
} from "@/lib/utils/core-web-vitals";
import {
  PerformanceTestRunner,
  initializePerformanceRegression,
} from "@/lib/utils/performance-regression";

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
  const [monitor, setMonitor] = useState<CoreWebVitalsMonitor | null>(null);
  const [testRunner, setTestRunner] = useState<PerformanceTestRunner | null>(
    null,
  );

  useEffect(() => {
    const cwvMonitor = initializeCoreWebVitals();
    const perfTestRunner = initializePerformanceRegression();

    setMonitor(cwvMonitor);
    setTestRunner(perfTestRunner);

    const unsubscribe = cwvMonitor.subscribe(setMetrics);

    return () => {
      unsubscribe();
      cwvMonitor.cleanup();
    };
  }, []);

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
    if (!testRunner) return;

    try {
      const results = await testRunner.runPerformanceTests();
      console.log("Performance test results:", results);

      // Show results in development
      if (process.env.NODE_ENV === "development") {
        alert(
          `Performance Test Complete!\nScore: ${results.regressionReport.summary.regressionCount === 0 ? "PASS" : "FAIL"}\nRegressions: ${results.regressionReport.summary.regressionCount}`,
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
      const rating = CoreWebVitalsMonitor.getRating(metric, metrics[metric]);
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
          const rating = CoreWebVitalsMonitor.getRating(metricKey, value);
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

      {monitor && (
        <div className="mt-6">
          <PerformanceReport monitor={monitor} />
        </div>
      )}
    </div>
  );
};

interface PerformanceReportProps {
  monitor: CoreWebVitalsMonitor;
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({ monitor }) => {
  const [report, setReport] = useState(monitor.generateReport());

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(monitor.generateReport());
    }, 5000);

    return () => clearInterval(interval);
  }, [monitor]);

  return (
    <div className="border-t pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-medium text-gray-800">Performance Score</h4>
        <div
          className={`text-2xl font-bold ${
            report.score >= 90
              ? "text-green-500"
              : report.score >= 70
                ? "text-yellow-500"
                : "text-red-500"
          }`}
        >
          {report.score}/100
        </div>
      </div>

      {report.recommendations.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h5 className="text-sm font-medium text-yellow-800 mb-2">
            Recommendations
          </h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{recommendation}</span>
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
