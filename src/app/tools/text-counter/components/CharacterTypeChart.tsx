"use client";

import React from "react";
import { TextStats } from "../types";

interface CharacterTypeChartProps {
  stats: TextStats;
}

export default function CharacterTypeChart({ stats }: CharacterTypeChartProps) {
  const { characterTypes } = stats;
  const total = Object.values(characterTypes).reduce(
    (sum, count) => sum + count,
    0
  );

  if (total === 0) {
    return (
      <div className="text-center text-sm text-foreground opacity-70 py-4">
        文字が入力されていません
      </div>
    );
  }

  const chartData = [
    { label: "ひらがな", count: characterTypes.hiragana, color: "#0000ff" },
    { label: "カタカナ", count: characterTypes.katakana, color: "#4169e1" },
    { label: "漢字", count: characterTypes.kanji, color: "#6495ed" },
    { label: "英数字", count: characterTypes.alphanumeric, color: "#87ceeb" },
    { label: "記号", count: characterTypes.symbols, color: "#b0c4de" },
  ].filter((item) => item.count > 0);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">文字種別分布</h4>

      {/* Bar Chart */}
      <div className="space-y-2">
        {chartData.map((item) => {
          const percentage = (item.count / total) * 100;
          return (
            <div key={item.label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-foreground">{item.label}</span>
                <span className="font-mono text-primary">
                  {item.count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-background border border-foreground h-2">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple Pie Chart Representation */}
      <div className="flex items-center justify-center mt-4">
        <div className="relative w-32 h-32">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full transform -rotate-90"
          >
            {
              chartData.reduce(
                (acc, item) => {
                  const percentage = (item.count / total) * 100;
                  const angle = (percentage / 100) * 360;
                  const startAngle = acc.currentAngle;
                  const endAngle = startAngle + angle;

                  const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

                  const largeArcFlag = angle > 180 ? 1 : 0;

                  const pathData = [
                    `M 50 50`,
                    `L ${x1} ${y1}`,
                    `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    `Z`,
                  ].join(" ");

                  acc.paths.push(
                    <path
                      key={item.label}
                      d={pathData}
                      fill={item.color}
                      stroke="#222222"
                      strokeWidth="0.5"
                    />
                  );

                  acc.currentAngle = endAngle;
                  return acc;
                },
                { paths: [] as React.ReactElement[], currentAngle: 0 }
              ).paths
            }
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center">
        {chartData.map((item) => (
          <div key={item.label} className="flex items-center gap-1 text-xs">
            <div
              className="w-3 h-3 border border-foreground"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
