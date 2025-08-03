"use client";

import {
  CoreWebVitalsMetrics,
  CoreWebVitalsMonitor,
  initializeCoreWebVitals,
} from "@/lib/utils/core-web-vitals";
import { initializeDynamicImports } from "@/lib/utils/dynamic-imports";
import { initializePerformanceMonitoring } from "@/lib/utils/performance";
import {
  initializePerformanceAlerting,
  PerformanceAlert,
  RealTimeMonitor,
} from "@/lib/utils/performance-alerts";
import {
  initializePerformanceRegression,
  PerformanceTestRunner,
} from "@/lib/utils/performance-regression";
import { initializeServiceWorker } from "@/lib/utils/service-worker";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface PerformanceReport {
  performance: {
    summary: {
      totalAlerts: number;
      errorCount: number;
      warningCount: number;
      infoCount: number;
    };
    alerts: PerformanceAlert[];
    recommendations: string[];
  };
  budget: Record<
    string,
    {
      exceeded: boolean;
      usage: number;
      budget: number;
      percentage: number;
    }
  >;
  timestamp: number;
}

interface PerformanceContextType {
  isOnline: boolean;
  performanceScore: number;
  memoryUsage: number;
  serviceWorkerStatus: "loading" | "ready" | "error";
  alerts: PerformanceAlert[];
  coreWebVitals: CoreWebVitalsMetrics;
  clearCache: () => Promise<void>;
  generateReport: () => PerformanceReport | null;
  runPerformanceTest: () => Promise<void>;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error("usePerformance must be used within a PerformanceProvider");
  }
  return context;
};

interface PerformanceProviderProps {
  children: ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({
  children,
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [performanceScore, setPerformanceScore] = useState(100);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [serviceWorkerStatus, setServiceWorkerStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [monitor, setMonitor] = useState<RealTimeMonitor | null>(null);
  const [coreWebVitals, setCoreWebVitals] = useState<CoreWebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    inp: null,
    ttfb: null,
    fcp: null,
  });
  const [, setCwvMonitor] = useState<CoreWebVitalsMonitor | null>(null);
  const [testRunner, setTestRunner] = useState<PerformanceTestRunner | null>(
    null,
  );

  useEffect(() => {
    const initializePerformance = async () => {
      try {
        // Initialize performance monitoring
        const performanceMonitor = initializePerformanceMonitoring();

        // Initialize service worker
        const { serviceWorker, networkMonitor } =
          await initializeServiceWorker();

        // Initialize dynamic imports
        initializeDynamicImports();

        // Initialize performance alerting
        const realTimeMonitor = initializePerformanceAlerting();
        setMonitor(realTimeMonitor);

        // Initialize Core Web Vitals monitoring
        const coreWebVitalsMonitor = initializeCoreWebVitals();
        setCwvMonitor(coreWebVitalsMonitor);

        // Initialize performance regression testing
        const performanceTestRunner = initializePerformanceRegression();
        setTestRunner(performanceTestRunner);

        // Subscribe to network status
        const unsubscribe = networkMonitor.subscribe((online) => {
          setIsOnline(online);
        });

        // Subscribe to Core Web Vitals updates
        const unsubscribeCWV = coreWebVitalsMonitor.subscribe(setCoreWebVitals);

        // Subscribe to performance alerts
        const unsubscribeAlerts = realTimeMonitor
          .getAlerting()
          .subscribe((alert: PerformanceAlert) => {
            setAlerts((prev) => [...prev, alert]);
          });

        // Update service worker status
        const swStatus = serviceWorker.getStatus();
        setServiceWorkerStatus(swStatus.isActive ? "ready" : "error");

        // Monitor memory usage
        const memoryInterval = setInterval(() => {
          if ("memory" in performance) {
            const memory = (
              performance as Performance & {
                memory: {
                  usedJSHeapSize: number;
                  jsHeapSizeLimit: number;
                };
              }
            ).memory;
            const usage =
              (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
            setMemoryUsage(usage);
          }
        }, 5000);

        // Monitor performance score (simplified)
        const scoreInterval = setInterval(() => {
          const metrics = performanceMonitor.getMetrics();
          let score = 100;

          // Reduce score based on metrics
          if (metrics.lcp && metrics.lcp > 2500) score -= 20;
          if (metrics.fid && metrics.fid > 100) score -= 20;
          if (metrics.cls && metrics.cls > 0.1) score -= 20;

          setPerformanceScore(Math.max(0, score));
        }, 10000);

        // Cleanup
        return () => {
          unsubscribe();
          unsubscribeAlerts();
          unsubscribeCWV();
          clearInterval(memoryInterval);
          clearInterval(scoreInterval);
          performanceMonitor.cleanup();
          coreWebVitalsMonitor.cleanup();
        };
      } catch (error) {
        console.error("Performance initialization failed:", error);
        setServiceWorkerStatus("error");
      }
    };

    initializePerformance();
  }, []);

  const clearCache = async () => {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
      window.location.reload();
    }
  };

  const generateReport = () => {
    return monitor?.generateReport() || null;
  };

  const runPerformanceTest = async () => {
    if (!testRunner) return;

    try {
      const results = await testRunner.runPerformanceTests();
      if (process.env.NODE_ENV === "development") {
        console.log("Performance test results:", results);
      }

      // Log regression results
      if (results.regressionReport.hasRegressions) {
        console.warn(
          "Performance regressions detected:",
          results.regressionReport.regressions,
        );
      }
    } catch (error) {
      console.error("Performance test failed:", error);
    }
  };

  const value: PerformanceContextType = {
    isOnline,
    performanceScore,
    memoryUsage,
    serviceWorkerStatus,
    alerts,
    coreWebVitals,
    clearCache,
    generateReport,
    runPerformanceTest,
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}

      {/* Performance indicators (development only) */}
      {process.env.NODE_ENV === "development" && <PerformanceIndicators />}

      {/* Offline indicator */}
      {!isOnline && (
        <div
          id="offline-indicator"
          className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 z-50"
        >
          オフラインモード - 一部の機能が制限されています
        </div>
      )}
    </PerformanceContext.Provider>
  );
};

// Performance indicators for development
const PerformanceIndicators: React.FC = () => {
  const {
    performanceScore,
    memoryUsage,
    serviceWorkerStatus,
    alerts,
    coreWebVitals,
    runPerformanceTest,
  } = usePerformance();
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        title="Performance Monitor"
      >
        📊
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white text-black p-4 rounded-lg shadow-xl min-w-64 max-w-80">
          <h3 className="font-bold mb-2">Performance Monitor</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Score:</span>
              <span
                className={
                  performanceScore >= 80
                    ? "text-green-600"
                    : performanceScore >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                }
              >
                {performanceScore}/100
              </span>
            </div>

            <div className="flex justify-between">
              <span>Memory:</span>
              <span
                className={
                  memoryUsage < 70
                    ? "text-green-600"
                    : memoryUsage < 85
                      ? "text-yellow-600"
                      : "text-red-600"
                }
              >
                {memoryUsage.toFixed(1)}%
              </span>
            </div>

            <div className="flex justify-between">
              <span>Service Worker:</span>
              <span
                className={
                  serviceWorkerStatus === "ready"
                    ? "text-green-600"
                    : serviceWorkerStatus === "loading"
                      ? "text-yellow-600"
                      : "text-red-600"
                }
              >
                {serviceWorkerStatus}
              </span>
            </div>

            {/* Core Web Vitals */}
            <div className="pt-2 border-t">
              <div className="text-xs font-semibold mb-1">Core Web Vitals</div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>LCP:</span>
                  <span
                    className={
                      coreWebVitals.lcp && coreWebVitals.lcp <= 2500
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {coreWebVitals.lcp
                      ? `${Math.round(coreWebVitals.lcp)}ms`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>FID:</span>
                  <span
                    className={
                      coreWebVitals.fid && coreWebVitals.fid <= 100
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {coreWebVitals.fid
                      ? `${Math.round(coreWebVitals.fid)}ms`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CLS:</span>
                  <span
                    className={
                      coreWebVitals.cls && coreWebVitals.cls <= 0.1
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {coreWebVitals.cls ? coreWebVitals.cls.toFixed(3) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Test Button */}
            <div className="pt-2 border-t">
              <button
                onClick={runPerformanceTest}
                className="w-full px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
              >
                Run Performance Test
              </button>
            </div>

            {alerts.length > 0 && (
              <div className="mt-2 pt-2 border-t">
                <div className="text-xs text-red-600">
                  {alerts.length} alert{alerts.length !== 1 ? "s" : ""}
                </div>
                <div className="max-h-20 overflow-y-auto">
                  {alerts.slice(-3).map((alert, index) => (
                    <div key={index} className="text-xs text-gray-600 truncate">
                      {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
