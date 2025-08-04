/**
 * Performance Settings UI Component
 * Provides UI for adjusting playground performance settings
 * Task 1.3: プレイグラウンド共通機能の実装
 */

"use client";

import {
  DeviceCapabilities,
  PerformanceMetrics,
  PerformanceSettings,
} from "@/types/playground";
import { ChevronDown, ChevronUp, Monitor, Settings, Zap } from "lucide-react";
import { useCallback, useState } from "react";

interface PerformanceSettingsUIProps {
  deviceCapabilities: DeviceCapabilities;
  performanceSettings: PerformanceSettings;
  performanceMetrics: PerformanceMetrics;
  onSettingsChange: (settings: PerformanceSettings) => void;
  className?: string;
}

export function PerformanceSettingsUI({
  deviceCapabilities,
  performanceSettings,
  performanceMetrics,
  onSettingsChange,
  className = "",
}: PerformanceSettingsUIProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  const handleSettingChange = useCallback(
    (key: keyof PerformanceSettings, value: unknown) => {
      onSettingsChange({
        ...performanceSettings,
        [key]: value,
      });
    },
    [performanceSettings, onSettingsChange],
  );

  const getPerformanceStatus = () => {
    const { fps } = performanceMetrics;

    if (fps >= performanceSettings.targetFPS * 0.9) {
      return { status: "excellent", color: "text-green-600", icon: "🟢" };
    } else if (fps >= performanceSettings.targetFPS * 0.7) {
      return { status: "good", color: "text-yellow-600", icon: "🟡" };
    } else {
      return { status: "poor", color: "text-red-600", icon: "🔴" };
    }
  };

  const getRecommendations = () => {
    const { fps } = performanceMetrics;
    const recommendations: string[] = [];

    if (fps < performanceSettings.targetFPS * 0.7) {
      recommendations.push("品質レベルを下げることを推奨します");
      recommendations.push("他のアプリケーションを閉じてください");
    }

    if (performanceMetrics.memoryUsage > 500) {
      recommendations.push("メモリ使用量が高いです");
    }

    if (!performanceSettings.enableOptimizations) {
      recommendations.push("パフォーマンス最適化を有効にしてください");
    }

    return recommendations;
  };

  const performanceStatus = getPerformanceStatus();
  const recommendations = getRecommendations();

  return (
    <div className={`bg-base border border-foreground ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-foreground">
        <div className="flex items-center justify-between">
          <h3 className="zen-kaku-gothic-new text-lg text-primary flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Performance Settings
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${performanceStatus.color}`}>
              {performanceStatus.icon} {performanceStatus.status}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Basic Settings</h4>

          {/* Quality Level */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Quality Level
            </label>
            <select
              value={performanceSettings.qualityLevel}
              onChange={(e) =>
                handleSettingChange(
                  "qualityLevel",
                  e.target.value as PerformanceSettings["qualityLevel"],
                )
              }
              className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
            >
              <option value="low">Low (30 FPS, 最小品質)</option>
              <option value="medium">Medium (60 FPS, 標準品質)</option>
              <option value="high">High (60+ FPS, 最高品質)</option>
            </select>
            <p className="text-xs text-foreground opacity-70">
              デバイス性能: {deviceCapabilities.performanceLevel}
            </p>
          </div>

          {/* Target FPS */}
          <div className="space-y-2">
            <label className="noto-sans-jp-light text-sm text-foreground">
              Target FPS: {performanceSettings.targetFPS}
            </label>
            <input
              type="range"
              min="15"
              max="120"
              step="15"
              value={performanceSettings.targetFPS}
              onChange={(e) =>
                handleSettingChange("targetFPS", parseInt(e.target.value))
              }
              className="w-full"
            />
            <div className="flex justify-between text-xs text-foreground opacity-70">
              <span>15</span>
              <span>30</span>
              <span>60</span>
              <span>120</span>
            </div>
          </div>

          {/* Auto Optimization */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="optimizations"
              checked={performanceSettings.enableOptimizations}
              onChange={(e) =>
                handleSettingChange("enableOptimizations", e.target.checked)
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

        {/* Advanced Settings */}
        <div className="space-y-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-foreground flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Advanced Settings
            </h4>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="space-y-4 pl-6">
              {/* WebGL-specific settings */}
              {deviceCapabilities.webglSupport && (
                <>
                  <div className="space-y-2">
                    <label className="noto-sans-jp-light text-sm text-foreground">
                      Texture Quality
                    </label>
                    <select
                      value={performanceSettings.textureQuality || "medium"}
                      onChange={(e) =>
                        handleSettingChange(
                          "textureQuality",
                          e.target
                            .value as PerformanceSettings["textureQuality"],
                        )
                      }
                      className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
                    >
                      <option value="low">Low (512px)</option>
                      <option value="medium">Medium (1024px)</option>
                      <option value="high">High (2048px)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="noto-sans-jp-light text-sm text-foreground">
                      Shadow Quality
                    </label>
                    <select
                      value={performanceSettings.shadowQuality || "medium"}
                      onChange={(e) =>
                        handleSettingChange(
                          "shadowQuality",
                          e.target
                            .value as PerformanceSettings["shadowQuality"],
                        )
                      }
                      className="w-full border border-foreground bg-background text-foreground p-2 text-sm"
                    >
                      <option value="off">Off</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="noto-sans-jp-light text-sm text-foreground">
                      Max Particles: {performanceSettings.maxParticles || 1000}
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={performanceSettings.maxParticles || 1000}
                      onChange={(e) =>
                        handleSettingChange(
                          "maxParticles",
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {/* Device Info */}
              <div className="bg-background border border-foreground p-3 rounded text-sm">
                <h5 className="font-medium text-foreground mb-2">
                  Device Info
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-foreground opacity-70">WebGL:</span>
                    <span className="ml-1 text-accent">
                      {deviceCapabilities.webglSupport ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground opacity-70">WebGL2:</span>
                    <span className="ml-1 text-accent">
                      {deviceCapabilities.webgl2Support ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground opacity-70">Touch:</span>
                    <span className="ml-1 text-accent">
                      {deviceCapabilities.touchSupport ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground opacity-70">Cores:</span>
                    <span className="ml-1 text-accent">
                      {deviceCapabilities.hardwareConcurrency}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground opacity-70">DPR:</span>
                    <span className="ml-1 text-accent">
                      {deviceCapabilities.devicePixelRatio}x
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground opacity-70">
                      Max Texture:
                    </span>
                    <span className="ml-1 text-accent">
                      {deviceCapabilities.maxTextureSize}px
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        <div className="space-y-4">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-foreground flex items-center">
              <Monitor className="w-4 h-4 mr-2" />
              Performance Monitor
            </h4>
            {showMetrics ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showMetrics && (
            <div className="space-y-4 pl-6">
              {/* Metrics Display */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {performanceMetrics.fps}
                  </div>
                  <div className="noto-sans-jp-light text-foreground">FPS</div>
                  <div className="text-xs text-foreground opacity-70">
                    Target: {performanceSettings.targetFPS}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {performanceMetrics.frameTime.toFixed(1)}
                  </div>
                  <div className="noto-sans-jp-light text-foreground">
                    Frame Time (ms)
                  </div>
                  <div className="text-xs text-foreground opacity-70">
                    Target: {(1000 / performanceSettings.targetFPS).toFixed(1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">
                    {performanceMetrics.memoryUsage}
                  </div>
                  <div className="noto-sans-jp-light text-foreground">
                    Memory (MB)
                  </div>
                  <div className="text-xs text-foreground opacity-70">
                    Limit: {deviceCapabilities.memoryLimit || "N/A"}
                  </div>
                </div>
              </div>

              {/* GPU Metrics (if available) */}
              {performanceMetrics.gpuUsage !== undefined && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent">
                      {performanceMetrics.gpuUsage}%
                    </div>
                    <div className="noto-sans-jp-light text-foreground">
                      GPU Usage
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-accent">
                      {performanceMetrics.drawCalls || 0}
                    </div>
                    <div className="noto-sans-jp-light text-foreground">
                      Draw Calls
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <h5 className="font-medium text-yellow-800 mb-2">
                    Performance Recommendations
                  </h5>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-xs mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preset Buttons */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground">Quick Presets</h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() =>
                onSettingsChange({
                  targetFPS: 30,
                  qualityLevel: "low",
                  enableOptimizations: true,
                  textureQuality: "low",
                  shadowQuality: "off",
                  maxParticles: 500,
                })
              }
              className="px-3 py-2 border border-foreground text-sm hover:border-accent hover:text-accent transition-colors"
            >
              Battery Saver
            </button>
            <button
              onClick={() =>
                onSettingsChange({
                  targetFPS: 60,
                  qualityLevel: "medium",
                  enableOptimizations: true,
                  textureQuality: "medium",
                  shadowQuality: "medium",
                  maxParticles: 2000,
                })
              }
              className="px-3 py-2 border border-foreground text-sm hover:border-accent hover:text-accent transition-colors"
            >
              Balanced
            </button>
            <button
              onClick={() =>
                onSettingsChange({
                  targetFPS: 60,
                  qualityLevel: "high",
                  enableOptimizations: false,
                  textureQuality: "high",
                  shadowQuality: "high",
                  maxParticles: 5000,
                })
              }
              className="px-3 py-2 border border-foreground text-sm hover:border-accent hover:text-accent transition-colors"
            >
              Max Quality
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
