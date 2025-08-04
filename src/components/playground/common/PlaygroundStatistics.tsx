/**
 * Playground Statistics Component
 * Displays statistics and insights about playground experiments
 * Task 1.3: プレイグラウンド共通機能の実装
 */

"use client";

import { playgroundManager } from "@/lib/playground/playground-manager";
import { BarChart3, TrendingUp, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface PlaygroundStatisticsProps {
  className?: string;
}

export function PlaygroundStatistics({
  className = "",
}: PlaygroundStatisticsProps) {
  const [stats, setStats] = useState<ReturnType<
    typeof playgroundManager.getStatistics
  > | null>(null);

  useEffect(() => {
    const statistics = playgroundManager.getStatistics();
    setStats(statistics);
  }, []);

  if (!stats) {
    return (
      <div className={`bg-base border border-foreground p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-foreground opacity-20 rounded mb-2"></div>
          <div className="h-8 bg-foreground opacity-20 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-base border border-foreground ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-foreground">
        <h3 className="zen-kaku-gothic-new text-lg text-primary flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Playground Statistics
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {stats.totalExperiments}
            </div>
            <div className="text-sm text-foreground">Total Experiments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {stats.designExperiments}
            </div>
            <div className="text-sm text-foreground">Design</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {stats.webglExperiments}
            </div>
            <div className="text-sm text-foreground">WebGL</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">
              {stats.requiresWebGL}
            </div>
            <div className="text-sm text-foreground">Requires WebGL</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            By Category
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-foreground capitalize">
                  {category}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-background border border-foreground rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent"
                      style={{
                        width: `${(count / stats.totalExperiments) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-accent font-medium w-6 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            By Difficulty
          </h4>
          <div className="space-y-2">
            {Object.entries(stats.byDifficulty).map(([difficulty, count]) => (
              <div
                key={difficulty}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-foreground capitalize">
                  {difficulty}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 h-2 bg-background border border-foreground rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        difficulty === "beginner"
                          ? "bg-green-500"
                          : difficulty === "intermediate"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{
                        width: `${(count / stats.totalExperiments) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-accent font-medium w-6 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WebGL Requirements */}
        <div className="bg-background border border-foreground p-3 rounded">
          <h4 className="font-medium text-foreground mb-2">
            WebGL Requirements
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-foreground opacity-70">
                WebGL Required:
              </span>
              <span className="ml-2 text-accent font-medium">
                {stats.requiresWebGL} / {stats.totalExperiments}
              </span>
            </div>
            <div>
              <span className="text-foreground opacity-70">
                WebGL2 Required:
              </span>
              <span className="ml-2 text-accent font-medium">
                {stats.requiresWebGL2} / {stats.totalExperiments}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs text-foreground opacity-70">
            {((stats.requiresWebGL / stats.totalExperiments) * 100).toFixed(1)}%
            of experiments require WebGL support
          </div>
        </div>

        {/* Technology Distribution */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Popular Technologies</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-foreground">Three.js</span>
              <span className="text-accent">{stats.webglExperiments}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">Canvas</span>
              <span className="text-accent">
                {stats.byCategory.canvas || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">SVG</span>
              <span className="text-accent">{stats.byCategory.svg || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-foreground">CSS</span>
              <span className="text-accent">{stats.byCategory.css || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
