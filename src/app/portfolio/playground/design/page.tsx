/**
 * Enhanced Design Playground Page
 * Interactive design experiments with performance monitoring
 * Task 1.1: デザインプレイグラウンド(/portfolio/playground/design)の実装
 */

"use client";

import {
  ResponsiveExperimentGrid,
  ResponsiveFilterBar,
} from "@/components/playground/common";
import { designExperiments } from "@/components/playground/design-experiments/experiments-data";
import { useResponsive } from "@/hooks/useResponsive";
import { useExperimentSwipe } from "@/hooks/useTouchGestures";
import { deviceCapabilitiesDetector } from "@/lib/playground/device-capabilities";
import {
  getExperimentComponent,
  preloadCriticalExperiments,
} from "@/lib/playground/dynamic-loader";
import {
  DeviceCapabilities,
  ExperimentFilter,
  PerformanceMetrics,
  PerformanceSettings,
} from "@/types/playground";
import { ChevronDown, ChevronUp, Monitor, Settings } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function DesignPlaygroundPage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";
  const responsive = useResponsive();

  // State management
  const [deviceCapabilities, setDeviceCapabilities] =
    useState<DeviceCapabilities | null>(null);
  const [performanceSettings, setPerformanceSettings] =
    useState<PerformanceSettings>({
      targetFPS: 60,
      qualityLevel: "medium",
      enableOptimizations: true,
    });
  const [performanceMetrics, setPerformanceMetrics] =
    useState<PerformanceMetrics>({
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
    });
  const [activeExperiment, setActiveExperiment] = useState<string | null>(null);
  const [filter, setFilter] = useState<ExperimentFilter>({
    category: undefined,
    difficulty: undefined,
    technology: undefined,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [experimentError, setExperimentError] = useState<string | null>(null);

  // Initialize device capabilities and preload critical experiments
  useEffect(() => {
    const initializeCapabilities = async () => {
      try {
        const capabilities = await deviceCapabilitiesDetector.getCapabilities();
        setDeviceCapabilities(capabilities);

        // Set recommended performance settings
        const recommendedSettings =
          deviceCapabilitiesDetector.getRecommendedSettings(capabilities);
        setPerformanceSettings(recommendedSettings);

        // Preload critical experiments for better performance
        try {
          await preloadCriticalExperiments();
        } catch (error) {
          console.warn("Failed to preload critical experiments:", error);
          // Continue without preloading
        }
      } catch (error) {
        console.error("Failed to detect device capabilities:", error);
        // Fallback to safe defaults
        setDeviceCapabilities({
          webglSupport: false,
          webgl2Support: false,
          performanceLevel: "medium",
          touchSupport: false,
          maxTextureSize: 2048,
          devicePixelRatio: 1,
          hardwareConcurrency: 4,
        });
      }
    };

    initializeCapabilities();
  }, []);

  // Performance monitoring
  const handlePerformanceUpdate = useCallback(
    (metrics: PerformanceMetrics) => {
      setPerformanceMetrics(metrics);

      // Auto-adjust quality if performance is poor
      if (
        performanceSettings.enableOptimizations &&
        metrics.fps < performanceSettings.targetFPS * 0.7
      ) {
        setPerformanceSettings((prev) => ({
          ...prev,
          qualityLevel: prev.qualityLevel === "high" ? "medium" : "low",
        }));
      }
    },
    [performanceSettings],
  );

  // Filter experiments
  const filteredExperiments = useMemo(() => {
    return designExperiments.filter((experiment) => {
      if (filter.category && experiment.category !== filter.category)
        return false;
      if (filter.difficulty && experiment.difficulty !== filter.difficulty)
        return false;
      if (
        filter.performanceLevel &&
        experiment.performanceLevel !== filter.performanceLevel
      )
        return false;
      if (
        filter.interactive !== undefined &&
        experiment.interactive !== filter.interactive
      )
        return false;
      if (
        filter.technology &&
        !experiment.technology.some((tech) =>
          tech.toLowerCase().includes(filter.technology!.toLowerCase()),
        )
      )
        return false;
      return true;
    });
  }, [filter]);

  // Available filter options
  const availableCategories = useMemo(() => {
    return Array.from(new Set(designExperiments.map((exp) => exp.category)));
  }, []);

  const availableTechnologies = useMemo(() => {
    return Array.from(
      new Set(designExperiments.flatMap((exp) => exp.technology)),
    );
  }, []);

  // Experiment switching with swipe gestures
  const experimentIds = filteredExperiments.map((exp) => exp.id);
  const currentExperimentIndex = activeExperiment
    ? experimentIds.indexOf(activeExperiment)
    : -1;

  const handleExperimentSwipe = useCallback(
    (newIndex: number) => {
      if (newIndex >= 0 && newIndex < experimentIds.length) {
        setActiveExperiment(experimentIds[newIndex]);
        setExperimentError(null);
      }
    },
    [experimentIds],
  );

  const swipeHandlers = useExperimentSwipe(
    experimentIds,
    currentExperimentIndex,
    handleExperimentSwipe,
  );

  // Render experiment component with dynamic loading
  const renderExperiment = (experimentId: string) => {
    const experiment = designExperiments.find((exp) => exp.id === experimentId);
    if (!experiment || !deviceCapabilities) return null;

    // Use dynamic component loading
    const ExperimentComponent = getExperimentComponent(experimentId);

    if (!ExperimentComponent) {
      return (
        <div className="aspect-video bg-background border border-red-500 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="text-red-500 text-lg">⚠️ Loading Error</div>
            <p className="text-sm text-foreground">
              Failed to load experiment: {experimentId}
            </p>
          </div>
        </div>
      );
    }

    return (
      <ExperimentComponent
        isActive={activeExperiment === experimentId}
        deviceCapabilities={deviceCapabilities}
        performanceSettings={performanceSettings}
        onPerformanceUpdate={handlePerformanceUpdate}
        onError={(error) => {
          console.error("Experiment error:", error);
          setExperimentError(
            `Error loading experiment: ${error.message || error}`,
          );
          setActiveExperiment(null);
        }}
      />
    );
  };

  if (!deviceCapabilities) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="noto-sans-jp-light text-sm text-foreground">
            デバイス性能を検出中...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main
        role="main"
        aria-label="Design playground"
        className="flex items-center py-10"
      >
        <div className="container-system">
          <div className="space-y-10">
            {/* Header */}
            <header className="space-y-12">
              <nav className="mb-6">
                <Link
                  href="/portfolio"
                  className="noto-sans-jp-light text-sm text-accent border border-accent px-2 py-1 inline-block w-fit focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  ← Portfolio に戻る
                </Link>
              </nav>
              <h1
                className="neue-haas-grotesk-display text-6xl text-primary"
                role="heading"
                aria-level={1}
              >
                Design Playground
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                インタラクティブなデザイン実験とアニメーションの実験場です。
                <br />
                CSS、SVG、Canvas
                を使った視覚的表現とリアルタイム更新機能を体験できます。
              </p>
              <h2 className="sr-only" role="heading" aria-level={2}>
                Interactive design experiments
              </h2>
            </header>

            {/* Device Info & Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device Capabilities */}
              <div className="bg-base border border-foreground p-4 space-y-4">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center justify-between w-full text-left"
                  role="button"
                  aria-label="Settings"
                >
                  <h3 className="zen-kaku-gothic-new text-lg text-primary flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Device & Settings
                  </h3>
                  {showSettings ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showSettings && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="noto-sans-jp-light text-foreground">
                          Performance Level:
                        </span>
                        <div className="text-accent">
                          {deviceCapabilities.performanceLevel}
                        </div>
                      </div>
                      <div>
                        <span className="noto-sans-jp-light text-foreground">
                          Touch Support:
                        </span>
                        <div className="text-accent">
                          {deviceCapabilities.touchSupport ? "Yes" : "No"}
                        </div>
                      </div>
                      <div>
                        <span className="noto-sans-jp-light text-foreground">
                          Device Pixel Ratio:
                        </span>
                        <div className="text-accent">
                          {deviceCapabilities.devicePixelRatio}x
                        </div>
                      </div>
                      <div>
                        <span className="noto-sans-jp-light text-foreground">
                          CPU Cores:
                        </span>
                        <div className="text-accent">
                          {deviceCapabilities.hardwareConcurrency}
                        </div>
                      </div>
                    </div>

                    {/* Performance Settings */}
                    <div className="space-y-2">
                      <label className="noto-sans-jp-light text-sm text-foreground">
                        Quality Level
                      </label>
                      <select
                        value={performanceSettings.qualityLevel}
                        onChange={(e) =>
                          setPerformanceSettings((prev) => ({
                            ...prev,
                            qualityLevel: e.target
                              .value as PerformanceSettings["qualityLevel"],
                          }))
                        }
                        className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
                        data-testid="quality-select"
                      >
                        <option value="low">Low (30 FPS)</option>
                        <option value="medium">Medium (60 FPS)</option>
                        <option value="high">High (60+ FPS)</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="optimizations"
                        checked={performanceSettings.enableOptimizations}
                        onChange={(e) =>
                          setPerformanceSettings((prev) => ({
                            ...prev,
                            enableOptimizations: e.target.checked,
                          }))
                        }
                        className="w-4 h-4"
                      />
                      <label
                        htmlFor="optimizations"
                        className="noto-sans-jp-light text-sm text-foreground"
                      >
                        Auto Performance Optimization
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Monitor */}
              <div className="bg-base border border-foreground p-4 space-y-4">
                <button
                  onClick={() => setShowPerformance(!showPerformance)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="zen-kaku-gothic-new text-lg text-primary flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    Performance Monitor
                  </h3>
                  {showPerformance ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showPerformance && (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {performanceMetrics.fps}
                      </div>
                      <div className="noto-sans-jp-light text-foreground">
                        FPS
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {performanceMetrics.frameTime.toFixed(1)}
                      </div>
                      <div className="noto-sans-jp-light text-foreground">
                        Frame Time (ms)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">
                        {performanceMetrics.memoryUsage}
                      </div>
                      <div className="noto-sans-jp-light text-foreground">
                        Memory (MB)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Responsive Experiment Filter */}
            <ResponsiveFilterBar
              filter={filter}
              onFilterChange={setFilter}
              availableCategories={availableCategories}
              availableTechnologies={availableTechnologies}
            />

            {/* Responsive Experiment Grid */}
            <ResponsiveExperimentGrid
              experiments={filteredExperiments}
              activeExperiment={activeExperiment}
              onExperimentSelect={(experimentId) => {
                setActiveExperiment(experimentId);
                setExperimentError(null);
              }}
            />

            {/* Error Message */}
            {experimentError && (
              <div className="bg-red-100 border border-red-500 text-red-700 p-4 rounded">
                <p>{experimentError}</p>
                <button
                  onClick={() => setExperimentError(null)}
                  className="mt-2 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Active Experiment */}
            {activeExperiment && (
              <div
                className="bg-base border border-foreground p-4 space-y-4"
                onTouchStart={
                  responsive.touch.isTouchDevice
                    ? swipeHandlers.onTouchStart
                    : undefined
                }
                onTouchMove={
                  responsive.touch.isTouchDevice
                    ? swipeHandlers.onTouchMove
                    : undefined
                }
                onTouchEnd={
                  responsive.touch.isTouchDevice
                    ? swipeHandlers.onTouchEnd
                    : undefined
                }
                aria-live="polite"
                aria-label="Active experiment"
              >
                <div className="flex items-center justify-between">
                  <h3 className="zen-kaku-gothic-new text-lg text-primary">
                    Active Experiment:{" "}
                    {
                      designExperiments.find(
                        (exp) => exp.id === activeExperiment,
                      )?.title
                    }
                  </h3>

                  {/* Mobile experiment navigation */}
                  {responsive.isMobile && experimentIds.length > 1 && (
                    <div className="flex items-center space-x-2">
                      <span className="noto-sans-jp-light text-xs text-foreground">
                        {currentExperimentIndex + 1} / {experimentIds.length}
                      </span>
                      <span className="noto-sans-jp-light text-xs text-foreground opacity-70">
                        スワイプで切り替え
                      </span>
                    </div>
                  )}
                </div>

                {renderExperiment(activeExperiment)}
              </div>
            )}

            {/* Navigation */}
            <nav aria-label="Design playground navigation">
              <h3 className="sr-only">Design Playground機能</h3>
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                <Link
                  href="/portfolio/playground/WebGL"
                  className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>WebGL Playground</span>
                </Link>

                <Link
                  href="/portfolio"
                  className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Portfolio Home</span>
                </Link>

                <Link
                  href="/tools"
                  className="border border-foreground text-center p-4 flex items-center justify-center hover:border-accent hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Tools</span>
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <footer className="pt-4 border-t border-foreground">
              <div className="text-center">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - Design Playground
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
