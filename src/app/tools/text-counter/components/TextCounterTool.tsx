"use client";

import { useState, useCallback, useMemo } from "react";
import { Copy, RotateCcw, Settings, BarChart3 } from "lucide-react";
import TextInput from "./TextInput";
import StatisticsDisplay from "./StatisticsDisplay";
import SettingsPanel from "./SettingsPanel";
import { TextStats, CountSettings, DisplaySettings } from "../types";
import { calculateTextStats } from "../utils/textAnalysis";

const DEFAULT_SETTINGS: CountSettings = {
  includeSpaces: true,
  includeNewlines: true,
  includeWhitespace: true,
  countMethod: "all",
};

const DEFAULT_DISPLAY: DisplaySettings = {
  showBasicStats: true,
  showDetailedStats: true,
  showCharacterTypes: true,
  showStructureStats: true,
  showGraphs: false,
  theme: "light",
  fontSize: "medium",
};

export default function TextCounterTool() {
  const [text, setText] = useState("");
  const [settings, setSettings] = useState<CountSettings>(DEFAULT_SETTINGS);
  const [displaySettings, setDisplaySettings] =
    useState<DisplaySettings>(DEFAULT_DISPLAY);
  const [showSettings, setShowSettings] = useState(false);

  const stats: TextStats = useMemo(() => {
    return calculateTextStats(text, settings);
  }, [text, settings]);

  const handleTextChange = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const handleClear = useCallback(() => {
    setText("");
  }, []);

  const handleCopyText = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  }, [text]);

  return (
    <div
      className="space-y-6"
      role="application"
      aria-label="Text Counter Tool"
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="flex items-center justify-center w-10 h-10 bg-base border border-foreground hover:bg-accent transition-colors"
            aria-label="テキストをクリア"
            title="クリア"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handleCopyText}
            className="flex items-center justify-center w-10 h-10 bg-base border border-foreground hover:bg-accent transition-colors"
            aria-label="テキストをコピー"
            title="テキストをコピー"
          >
            <Copy size={16} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              setDisplaySettings((prev) => ({
                ...prev,
                showGraphs: !prev.showGraphs,
              }))
            }
            className={`flex items-center justify-center w-10 h-10 border border-foreground transition-colors ${
              displaySettings.showGraphs
                ? "bg-primary text-background"
                : "bg-base hover:bg-accent"
            }`}
            aria-label="グラフ表示を切り替え"
            title="グラフ"
          >
            <BarChart3 size={16} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center justify-center w-10 h-10 border border-foreground transition-colors ${
              showSettings
                ? "bg-primary text-background"
                : "bg-base hover:bg-accent"
            }`}
            aria-label="設定パネルを切り替え"
            title="設定"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <TextInput
          value={text}
          onChange={handleTextChange}
          placeholder="ここにテキストを入力してください..."
          fontSize={displaySettings.fontSize}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {showSettings && (
            <SettingsPanel
              settings={settings}
              displaySettings={displaySettings}
              onSettingsChange={setSettings}
              onDisplaySettingsChange={setDisplaySettings}
            />
          )}

          <div className={showSettings ? "" : "lg:col-span-2"}>
            <StatisticsDisplay
              stats={stats}
              displaySettings={displaySettings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
