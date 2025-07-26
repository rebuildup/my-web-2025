/**
 * Performance Optimizer Component for Tools
 * Provides performance monitoring, offline functionality, and optimization features
 */

"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  Wifi,
  WifiOff,
  Activity,
  HardDrive,
  Zap,
} from "lucide-react";
import useOfflinePerformance from "@/hooks/useOfflinePerformance";

interface PerformanceOptimizerProps {
  toolName: string;
  children: React.ReactNode;
  showPerformanceInfo?: boolean;
  enableOptimizations?: boolean;
}

export default function PerformanceOptimizer({
  toolName,
  children,
  showPerformanceInfo = false,
  enableOptimizations = true,
}: PerformanceOptimizerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const {
    isOnline,
    isProcessing,
    processingProgress,
    storageUsage,
    performanceMetrics,
    error,
    clearError,
    clearData,
  } = useOfflinePerformance({
    toolName,
    enablePerformanceMonitoring: enableOptimizations,
    enableOfflineNotifications: true,
    autoSaveSettings: true,
  });

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  return (
    <div className="relative">
      {/* Performance Status Bar */}
      {showPerformanceInfo && (
        <div className="mb-4 bg-base border border-foreground p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="neue-haas-grotesk-display text-sm text-primary">
              Performance Status
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-accent hover:text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              aria-label="Toggle performance details"
            >
              {showDetails ? "Hide" : "Show"} Details
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi size={14} className="text-green-600" />
              ) : (
                <WifiOff size={14} className="text-yellow-600" />
              )}
              <span>{isOnline ? "Online" : "Offline"}</span>
            </div>

            {/* Processing Status */}
            <div className="flex items-center space-x-2">
              <Activity
                size={14}
                className={isProcessing ? "text-blue-600" : "text-gray-400"}
              />
              <span>
                {isProcessing ? `${processingProgress.toFixed(0)}%` : "Ready"}
              </span>
            </div>

            {/* Storage Usage */}
            <div className="flex items-center space-x-2">
              <HardDrive size={14} className="text-purple-600" />
              <span>{storageUsage.percentage.toFixed(1)}% used</span>
            </div>

            {/* Memory Usage */}
            <div className="flex items-center space-x-2">
              <Zap size={14} className="text-orange-600" />
              <span>
                {performanceMetrics.memoryUsage
                  ? `${(performanceMetrics.memoryUsage.used / 1024 / 1024).toFixed(1)}MB`
                  : "N/A"}
              </span>
            </div>
          </div>

          {/* Detailed Information */}
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-foreground space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h4 className="font-medium mb-2">Storage Information</h4>
                  <div className="space-y-1">
                    <div>Used: {(storageUsage.used / 1024).toFixed(1)} KB</div>
                    <div>
                      Available: {(storageUsage.available / 1024).toFixed(1)} KB
                    </div>
                    <div className="w-full bg-background border border-foreground h-2">
                      <div
                        className="h-full bg-accent transition-all duration-300"
                        style={{
                          width: `${Math.min(100, storageUsage.percentage)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Performance Metrics</h4>
                  <div className="space-y-1">
                    {performanceMetrics.memoryUsage && (
                      <>
                        <div>
                          Memory:{" "}
                          {(
                            performanceMetrics.memoryUsage.used /
                            1024 /
                            1024
                          ).toFixed(1)}{" "}
                          MB
                        </div>
                        <div>
                          Total:{" "}
                          {(
                            performanceMetrics.memoryUsage.total /
                            1024 /
                            1024
                          ).toFixed(1)}{" "}
                          MB
                        </div>
                      </>
                    )}
                    {performanceMetrics.lastProcessingTime > 0 && (
                      <div>
                        Last Process:{" "}
                        {performanceMetrics.lastProcessingTime.toFixed(2)}ms
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearData}
                  className="text-xs bg-background border border-foreground px-3 py-1 hover:bg-base transition-colors focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  Clear Tool Data
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="text-xs bg-background border border-foreground px-3 py-1 hover:bg-base transition-colors focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  Refresh Tool
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing Progress Bar */}
      {isProcessing && (
        <div className="mb-4 bg-base border border-foreground p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-primary">Processing...</span>
            <span className="text-sm text-accent">
              {processingProgress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-background border border-foreground h-2">
            <div
              className="h-full bg-accent transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 p-3 flex items-start space-x-2">
          <AlertCircle
            size={16}
            className="text-red-600 mt-0.5 flex-shrink-0"
          />
          <div className="flex-1">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-xs text-red-600 hover:text-red-800 mt-1 focus:outline-none focus:underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Offline Mode Indicator */}
      {!isOnline && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 p-3 flex items-center space-x-2">
          <WifiOff size={16} className="text-yellow-600" />
          <p className="text-sm text-yellow-800">
            オフラインモードで動作中。すべての機能はローカルで処理されます。
          </p>
        </div>
      )}

      {/* Tool Content */}
      <div
        className={`${isProcessing ? "opacity-75 pointer-events-none" : ""} transition-opacity duration-200`}
      >
        {children}
      </div>

      {/* Performance Optimization Tips */}
      {showPerformanceInfo && enableOptimizations && (
        <div className="mt-6 bg-base border border-foreground p-4">
          <h3 className="neue-haas-grotesk-display text-sm text-primary mb-3">
            Performance Tips
          </h3>
          <ul className="text-xs space-y-2 text-foreground">
            <li>• このツールは完全にオフラインで動作します</li>
            <li>• 大きなファイルは自動的にチャンク処理されます</li>
            <li>• 設定は自動的にローカルに保存されます</li>
            <li>• メモリ使用量が高い場合は、ページを更新してください</li>
            {storageUsage.percentage > 80 && (
              <li className="text-yellow-600">
                •
                ストレージ使用量が高いです。データをクリアすることを検討してください
              </li>
            )}
            {performanceMetrics.memoryUsage &&
              performanceMetrics.memoryUsage.percentage > 80 && (
                <li className="text-red-600">
                  • メモリ使用量が高いです。ページを更新することをお勧めします
                </li>
              )}
          </ul>
        </div>
      )}
    </div>
  );
}
