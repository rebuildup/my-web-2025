"use client";

import { webglExperiments } from "@/components/playground/webgl-experiments";
import { deviceCapabilitiesDetector } from "@/lib/playground/device-capabilities";
import {
  DeviceCapabilities,
  ExperimentFilter,
  PerformanceMetrics,
  PerformanceSettings,
} from "@/types/playground";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Monitor,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function WebGLPlaygroundPage() {
  const Global_title = "noto-sans-jp-regular text-base leading-snug";

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

  // Initialize device capabilities
  useEffect(() => {
    const initializeCapabilities = async () => {
      try {
        const capabilities = await deviceCapabilitiesDetector.getCapabilities();
        setDeviceCapabilities(capabilities);

        // Set recommended performance settings
        const recommendedSettings =
          deviceCapabilitiesDetector.getRecommendedSettings(capabilities);
        setPerformanceSettings(recommendedSettings);
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
          memoryLimit: 1024,
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
  const filteredExperiments = webglExperiments.filter((experiment) => {
    if (filter.category && experiment.category !== filter.category)
      return false;
    if (filter.difficulty && experiment.difficulty !== filter.difficulty)
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

  // Render experiment component
  const renderExperiment = (experimentId: string) => {
    const experiment = webglExperiments.find((exp) => exp.id === experimentId);
    if (!experiment || !deviceCapabilities) return null;

    const ExperimentComponent = experiment.component;

    return (
      <ExperimentComponent
        isActive={activeExperiment === experimentId}
        deviceCapabilities={deviceCapabilities}
        performanceSettings={performanceSettings}
        onPerformanceUpdate={handlePerformanceUpdate}
        onError={(error) => console.error("Experiment error:", error)}
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
      <main className="flex items-center py-10">
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
              <h1 className="neue-haas-grotesk-display text-6xl text-primary">
                WebGL Playground
              </h1>
              <p className="noto-sans-jp-light text-sm max-w leading-loose">
                WebGL・Three.js・WebGPU実験場です。
                <br />
                3D表現、シェーダー、パーティクルシステム、インタラクティブ体験を実験しています。
              </p>
            </header>

            {/* Device Info & Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Device Capabilities */}
              <div className="bg-base border border-foreground p-4 space-y-4">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center justify-between w-full text-left"
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
                          WebGL Support:
                        </span>
                        <div className="text-accent">
                          {deviceCapabilities.webglSupport ? "Yes" : "No"}
                        </div>
                      </div>
                      <div>
                        <span className="noto-sans-jp-light text-foreground">
                          WebGL2 Support:
                        </span>
                        <div className="text-accent">
                          {deviceCapabilities.webgl2Support ? "Yes" : "No"}
                        </div>
                      </div>
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
                          Max Texture Size:
                        </span>
                        <div className="text-accent">
                          {deviceCapabilities.maxTextureSize}px
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

            {/* Experiment Filter */}
            <div className="bg-base border border-foreground p-4 space-y-4">
              <h3 className="zen-kaku-gothic-new text-lg text-primary flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Experiment Filter
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="noto-sans-jp-light text-sm text-foreground">
                    Category
                  </label>
                  <select
                    value={filter.category || ""}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        category:
                          (e.target.value as ExperimentFilter["category"]) ||
                          undefined,
                      }))
                    }
                    className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    <option value="3d">3D</option>
                    <option value="shader">Shader</option>
                    <option value="particle">Particle</option>
                    <option value="effect">Effect</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="noto-sans-jp-light text-sm text-foreground">
                    Difficulty
                  </label>
                  <select
                    value={filter.difficulty || ""}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        difficulty:
                          (e.target.value as ExperimentFilter["difficulty"]) ||
                          undefined,
                      }))
                    }
                    className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="noto-sans-jp-light text-sm text-foreground">
                    Technology
                  </label>
                  <input
                    type="text"
                    value={filter.technology || ""}
                    onChange={(e) =>
                      setFilter((prev) => ({
                        ...prev,
                        technology: e.target.value || undefined,
                      }))
                    }
                    placeholder="Search technology..."
                    className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Experiment Selection */}
            <div className="bg-base border border-foreground p-4 space-y-4">
              <h3 className="zen-kaku-gothic-new text-lg text-primary">
                Available Experiments ({filteredExperiments.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredExperiments.map((experiment) => (
                  <button
                    key={experiment.id}
                    onClick={() =>
                      setActiveExperiment(
                        activeExperiment === experiment.id
                          ? null
                          : experiment.id,
                      )
                    }
                    className={`text-left p-4 border transition-colors focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background ${
                      activeExperiment === experiment.id
                        ? "border-accent bg-accent bg-opacity-10"
                        : "border-foreground hover:border-accent"
                    }`}
                  >
                    <div className="space-y-2">
                      <h4 className="zen-kaku-gothic-new text-base text-primary">
                        {experiment.title}
                      </h4>
                      <p className="noto-sans-jp-light text-sm text-foreground">
                        {experiment.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span className="noto-sans-jp-light text-xs border border-foreground px-2 py-1">
                          {experiment.category}
                        </span>
                        <span className="noto-sans-jp-light text-xs border border-foreground px-2 py-1">
                          {experiment.difficulty}
                        </span>
                        <span className="noto-sans-jp-light text-xs border border-foreground px-2 py-1">
                          {experiment.performanceLevel}
                        </span>
                        {experiment.requiresWebGL2 && (
                          <span className="noto-sans-jp-light text-xs border border-accent text-accent px-2 py-1">
                            WebGL2
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {experiment.technology
                          .slice(0, 3)
                          .map((tech, index) => (
                            <span
                              key={index}
                              className="noto-sans-jp-light text-xs text-accent"
                            >
                              {tech}
                            </span>
                          ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Experiment */}
            {activeExperiment && (
              <div className="bg-base border border-foreground p-4 space-y-4">
                <h3 className="zen-kaku-gothic-new text-lg text-primary">
                  Active Experiment:{" "}
                  {
                    webglExperiments.find((exp) => exp.id === activeExperiment)
                      ?.title
                  }
                </h3>
                {renderExperiment(activeExperiment)}
              </div>
            )}

            {/* Technical Notes */}
            <section>
              <h2 className="neue-haas-grotesk-display text-3xl text-primary mb-8">
                Technical Notes
              </h2>
              <div className="grid-system grid-1 xs:grid-2 sm:grid-2 md:grid-2 gap-6">
                <div className="bg-base border border-foreground p-4 space-y-4">
                  <div className="flex items-center">
                    <Zap className="w-6 h-6 text-accent mr-3" />
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      Performance Optimization
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • Three.js による本格的な3D表現
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • デバイス性能に応じた品質調整
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • GPU加速パーティクルシステム
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • 適切なリソース解放とクリーンアップ
                    </p>
                  </div>
                </div>

                <div className="bg-base border border-foreground p-4 space-y-4">
                  <div className="flex items-center">
                    <Settings className="w-6 h-6 text-accent mr-3" />
                    <h3 className="zen-kaku-gothic-new text-lg text-primary">
                      WebGL Features
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • カスタムシェーダーとGLSL実装
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • 物理シミュレーションと衝突検出
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • インタラクティブな3Dジオメトリ
                    </p>
                    <p className="noto-sans-jp-light text-sm text-foreground">
                      • リアルタイムパフォーマンス監視
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Navigation */}
            <nav aria-label="WebGL playground navigation">
              <h3 className="sr-only">WebGL Playground機能</h3>
              <div className="grid-system grid-1 xs:grid-3 sm:grid-3 gap-6">
                <Link
                  href="/portfolio/playground/design"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Design Playground</span>
                </Link>

                <Link
                  href="/portfolio"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Portfolio Home</span>
                </Link>

                <Link
                  href="/tools"
                  className="border border-foreground text-center p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2 focus:ring-offset-background"
                >
                  <span className={Global_title}>Tools</span>
                </Link>
              </div>
            </nav>

            {/* Footer */}
            <footer className="pt-4 border-t border-foreground">
              <div className="text-center">
                <p className="shippori-antique-b1-regular text-sm inline-block">
                  © 2025 samuido - WebGL Playground
                </p>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
