"use client";

import { useState } from "react";
import Image from "next/image";
import { FrameData } from "../types";
import { formatFileSize } from "../utils/fileProcessor";

interface FrameGridProps {
  frames: FrameData[];
  currentFrame: number;
  onFrameSelect: (frameIndex: number) => void;
}

export default function FrameGrid({
  frames,
  currentFrame,
  onFrameSelect,
}: FrameGridProps) {
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">(
    "medium"
  );
  const [showInfo, setShowInfo] = useState(true);

  const gridSizeClasses = {
    small: "grid-cols-8 gap-2",
    medium: "grid-cols-6 gap-3",
    large: "grid-cols-4 gap-4",
  };

  const thumbnailSizeClasses = {
    small: "h-16",
    medium: "h-24",
    large: "h-32",
  };

  if (frames.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-foreground">
        フレームが読み込まれていません
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">
          フレームグリッド ({frames.length} フレーム)
        </h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">表示サイズ:</label>
            <select
              value={gridSize}
              onChange={(e) =>
                setGridSize(e.target.value as "small" | "medium" | "large")
              }
              className="px-2 py-1 border border-foreground rounded text-sm"
            >
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showInfo}
              onChange={(e) => setShowInfo(e.target.checked)}
            />
            詳細情報を表示
          </label>
        </div>
      </div>

      {/* Grid */}
      <div className={`grid ${gridSizeClasses[gridSize]}`}>
        {frames.map((frame, index) => (
          <div
            key={index}
            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
              index === currentFrame
                ? "border-primary shadow-lg scale-105"
                : "border-foreground/20 hover:border-foreground/40 hover:scale-102"
            }`}
            onClick={() => onFrameSelect(index)}
          >
            {/* Thumbnail */}
            <div
              className={`relative ${thumbnailSizeClasses[gridSize]} bg-background`}
            >
              <Image
                src={frame.dataUrl}
                alt={`Frame ${index + 1}`}
                width={frame.width}
                height={frame.height}
                className="w-full h-full object-contain"
                loading="lazy"
                unoptimized
              />

              {/* Frame Number Overlay */}
              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                {index + 1}
              </div>

              {/* Current Frame Indicator */}
              {index === currentFrame && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <div className="bg-primary text-white px-2 py-1 rounded text-sm font-medium">
                    現在のフレーム
                  </div>
                </div>
              )}
            </div>

            {/* Frame Info */}
            {showInfo && (
              <div className="p-2 bg-base border-t border-foreground/20">
                <div className="text-xs space-y-1">
                  <div className="font-medium truncate" title={frame.name}>
                    {frame.name}
                  </div>
                  <div className="text-foreground/70">
                    {frame.width} × {frame.height}px
                  </div>
                  <div className="text-foreground/70">
                    {formatFileSize(frame.size)}
                  </div>
                </div>
              </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Grid Statistics */}
      <div className="mt-6 p-4 bg-base border border-foreground/20 rounded-lg">
        <h4 className="font-medium mb-2 text-primary">統計情報</h4>
        <div className="grid grid-2 gap-4 text-sm">
          <div>
            <span className="text-foreground/70">総フレーム数:</span>
            <span className="ml-2 font-medium">{frames.length}</span>
          </div>
          <div>
            <span className="text-foreground/70">総ファイルサイズ:</span>
            <span className="ml-2 font-medium">
              {formatFileSize(
                frames.reduce((total, frame) => total + frame.size, 0)
              )}
            </span>
          </div>
          <div>
            <span className="text-foreground/70">平均解像度:</span>
            <span className="ml-2 font-medium">
              {Math.round(
                frames.reduce((total, frame) => total + frame.width, 0) /
                  frames.length
              )}{" "}
              ×{" "}
              {Math.round(
                frames.reduce((total, frame) => total + frame.height, 0) /
                  frames.length
              )}
              px
            </span>
          </div>
          <div>
            <span className="text-foreground/70">現在のフレーム:</span>
            <span className="ml-2 font-medium">
              {currentFrame + 1} / {frames.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
