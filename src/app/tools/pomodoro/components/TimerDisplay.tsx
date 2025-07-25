"use client";

import { SessionType } from "../types";

interface TimerDisplayProps {
  timeLeft: number; // in seconds
  progress: number; // 0-100
  isRunning: boolean;
  sessionType: SessionType;
}

export default function TimerDisplay({
  timeLeft,
  progress,
  isRunning,
  sessionType,
}: TimerDisplayProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getProgressColor = () => {
    switch (sessionType) {
      case "work":
        return "bg-primary";
      case "shortBreak":
        return "bg-accent";
      case "longBreak":
        return "bg-green-500";
      default:
        return "bg-primary";
    }
  };

  const getBackgroundColor = () => {
    switch (sessionType) {
      case "work":
        return "bg-primary/10";
      case "shortBreak":
        return "bg-accent/10";
      case "longBreak":
        return "bg-green-500/10";
      default:
        return "bg-primary/10";
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Display */}
      <div
        className={`relative p-8 rounded-full ${getBackgroundColor()} border-4 ${
          isRunning ? "border-primary animate-pulse" : "border-foreground/20"
        } transition-all duration-300`}
      >
        <div className="text-center">
          <div className="text-6xl font-mono font-bold text-primary">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </div>
          <div className="text-sm text-foreground mt-2">
            {isRunning ? "実行中" : "停止中"}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-foreground">
          <span>進捗</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-foreground/20 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-1000 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Session Info */}
      <div className="grid grid-3 gap-4 text-center text-sm">
        <div
          className={`p-3 rounded-lg ${
            sessionType === "work"
              ? "bg-primary/20 border border-primary"
              : "bg-foreground/5"
          }`}
        >
          <div className="font-medium">作業</div>
          <div className="text-xs text-foreground">25分</div>
        </div>
        <div
          className={`p-3 rounded-lg ${
            sessionType === "shortBreak"
              ? "bg-accent/20 border border-accent"
              : "bg-foreground/5"
          }`}
        >
          <div className="font-medium">短い休憩</div>
          <div className="text-xs text-foreground">5分</div>
        </div>
        <div
          className={`p-3 rounded-lg ${
            sessionType === "longBreak"
              ? "bg-green-500/20 border border-green-500"
              : "bg-foreground/5"
          }`}
        >
          <div className="font-medium">長い休憩</div>
          <div className="text-xs text-foreground">15分</div>
        </div>
      </div>
    </div>
  );
}
