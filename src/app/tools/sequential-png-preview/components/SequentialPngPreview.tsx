"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Settings,
  Grid,
  List,
} from "lucide-react";
import FileUploader from "./FileUploader";
import AnimationPlayer from "./AnimationPlayer";
import FrameGrid from "./FrameGrid";
import ExportPanel from "./ExportPanel";
import { AnimationSettings, PreviewMode, FrameData } from "../types";

export default function SequentialPngPreview() {
  const [frames, setFrames] = useState<FrameData[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("animation");
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [settings, setSettings] = useState<AnimationSettings>({
    frameRate: 12,
    loop: true,
    direction: "forward",
    quality: "medium",
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFilesLoaded = useCallback((loadedFrames: FrameData[]) => {
    setFrames(loadedFrames);
    setCurrentFrame(0);
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const resetAnimation = useCallback(() => {
    setCurrentFrame(0);
    setIsPlaying(false);
  }, []);

  const nextFrame = useCallback(() => {
    if (frames.length === 0) return;

    setCurrentFrame((prev) => {
      if (settings.direction === "forward") {
        return prev >= frames.length - 1
          ? settings.loop
            ? 0
            : prev
          : prev + 1;
      } else if (settings.direction === "backward") {
        return prev <= 0
          ? settings.loop
            ? frames.length - 1
            : prev
          : prev - 1;
      } else {
        // ping-pong mode would be implemented here
        return prev >= frames.length - 1
          ? settings.loop
            ? 0
            : prev
          : prev + 1;
      }
    });
  }, [frames.length, settings.direction, settings.loop]);

  // Animation loop
  useEffect(() => {
    if (isPlaying && frames.length > 0) {
      intervalRef.current = setInterval(() => {
        nextFrame();
      }, 1000 / settings.frameRate);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, frames.length, settings.frameRate, nextFrame]);

  const handleFrameSelect = useCallback((frameIndex: number) => {
    setCurrentFrame(frameIndex);
    setIsPlaying(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="bg-base border border-foreground p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-primary">
          ファイル選択
        </h2>
        <FileUploader onFilesLoaded={handleFilesLoaded} />
      </div>

      {frames.length > 0 && (
        <>
          {/* Controls */}
          <div className="bg-base border border-foreground p-4 rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayback}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
                  aria-label={isPlaying ? "停止" : "再生"}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? "停止" : "再生"}
                </button>

                <button
                  onClick={resetAnimation}
                  className="flex items-center gap-2 px-4 py-2 border border-foreground rounded hover:bg-foreground/10 transition-colors"
                  aria-label="リセット"
                >
                  <RotateCcw size={16} />
                  リセット
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex border border-foreground rounded overflow-hidden">
                  <button
                    onClick={() => setPreviewMode("animation")}
                    className={`px-3 py-2 flex items-center gap-2 transition-colors ${
                      previewMode === "animation"
                        ? "bg-primary text-white"
                        : "hover:bg-foreground/10"
                    }`}
                    aria-label="アニメーション表示"
                  >
                    <Play size={16} />
                    アニメーション
                  </button>
                  <button
                    onClick={() => setPreviewMode("grid")}
                    className={`px-3 py-2 flex items-center gap-2 transition-colors ${
                      previewMode === "grid"
                        ? "bg-primary text-white"
                        : "hover:bg-foreground/10"
                    }`}
                    aria-label="グリッド表示"
                  >
                    <Grid size={16} />
                    グリッド
                  </button>
                  <button
                    onClick={() => setPreviewMode("list")}
                    className={`px-3 py-2 flex items-center gap-2 transition-colors ${
                      previewMode === "list"
                        ? "bg-primary text-white"
                        : "hover:bg-foreground/10"
                    }`}
                    aria-label="リスト表示"
                  >
                    <List size={16} />
                    リスト
                  </button>
                </div>

                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2 px-4 py-2 border border-foreground rounded hover:bg-foreground/10 transition-colors"
                  aria-label="設定"
                >
                  <Settings size={16} />
                  設定
                </button>

                <button
                  onClick={() => setShowExport(!showExport)}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 transition-colors"
                  aria-label="エクスポート"
                >
                  <Download size={16} />
                  エクスポート
                </button>
              </div>
            </div>

            {/* Frame Info */}
            <div className="mt-4 text-sm text-foreground">
              フレーム: {currentFrame + 1} / {frames.length} | フレームレート:{" "}
              {settings.frameRate}fps | ループ: {settings.loop ? "ON" : "OFF"}
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-base border border-foreground p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-primary">
                アニメーション設定
              </h3>
              <div className="grid grid-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    フレームレート: {settings.frameRate}fps
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={settings.frameRate}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        frameRate: parseInt(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    再生方向
                  </label>
                  <select
                    value={settings.direction}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        direction: e.target.value as
                          | "forward"
                          | "backward"
                          | "pingpong",
                      }))
                    }
                    className="w-full p-2 border border-foreground rounded"
                  >
                    <option value="forward">順再生</option>
                    <option value="backward">逆再生</option>
                    <option value="pingpong">往復再生</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.loop}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          loop: e.target.checked,
                        }))
                      }
                    />
                    ループ再生
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    プレビュー品質
                  </label>
                  <select
                    value={settings.quality}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        quality: e.target.value as "low" | "medium" | "high",
                      }))
                    }
                    className="w-full p-2 border border-foreground rounded"
                  >
                    <option value="low">低品質</option>
                    <option value="medium">中品質</option>
                    <option value="high">高品質</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Export Panel */}
          {showExport && (
            <ExportPanel
              frames={frames}
              settings={settings}
              onClose={() => setShowExport(false)}
            />
          )}

          {/* Preview Area */}
          <div className="bg-base border border-foreground rounded-lg overflow-hidden">
            {previewMode === "animation" && (
              <AnimationPlayer
                frames={frames}
                currentFrame={currentFrame}
                onFrameSelect={handleFrameSelect}
                settings={settings}
              />
            )}

            {previewMode === "grid" && (
              <FrameGrid
                frames={frames}
                currentFrame={currentFrame}
                onFrameSelect={handleFrameSelect}
              />
            )}

            {previewMode === "list" && (
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-primary">
                  フレーム一覧
                </h3>
                <div className="space-y-2">
                  {frames.map((frame, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-3 rounded cursor-pointer transition-colors ${
                        index === currentFrame
                          ? "bg-primary/20 border border-primary"
                          : "hover:bg-foreground/5"
                      }`}
                      onClick={() => handleFrameSelect(index)}
                    >
                      <Image
                        src={frame.dataUrl}
                        alt={`Frame ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-contain border border-foreground/20 rounded"
                        unoptimized
                      />
                      <div>
                        <div className="font-medium">フレーム {index + 1}</div>
                        <div className="text-sm text-foreground">
                          {frame.name}
                        </div>
                        <div className="text-xs text-foreground/70">
                          {frame.width} × {frame.height}px
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
