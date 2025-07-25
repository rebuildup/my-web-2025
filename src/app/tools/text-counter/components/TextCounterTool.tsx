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

  const handleCopyStats = useCallback(() => {
    const statsText = `
テキスト統計情報
================

基本統計:
- 総文字数: ${stats.totalCharacters}
- 文字数（スペース除く）: ${stats.charactersWithoutSpaces}
- 文字数（改行除く）: ${stats.charactersWithoutNewlines}
- 文字数（空白除く）: ${stats.charactersWithoutWhitespace}

構造統計:
- 単語数: ${stats.wordCount}
- 行数: ${stats.lineCount}
- 段落数: ${stats.paragraphCount}
- 文数: ${stats.sentenceCount}

文字種別:
- ひらがな: ${stats.characterTypes.hiragana}
- カタカナ: ${stats.characterTypes.katakana}
- 漢字: ${stats.characterTypes.kanji}
- 英数字: ${stats.characterTypes.alphanumeric}
- 記号: ${stats.characterTypes.symbols}

詳細統計:
- 平均行文字数: ${stats.averageCharactersPerLine.toFixed(1)}
- 最長行文字数: ${stats.longestLineLength}
- 文字密度: ${stats.characterDensity.toFixed(2)}%
    `.trim();

    navigator.clipboard.writeText(statsText).then(() => {
      // Could add a toast notification here
    });
  }, [stats]);

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
            className="flex items-center gap-2 px-4 py-2 bg-base border border-foreground hover:bg-accent transition-colors"
            aria-label="テキストをクリア"
          >
            <RotateCcw size={16} />
            クリア
          </button>
          <button
            onClick={handleCopyStats}
            className="flex items-center gap-2 px-4 py-2 bg-base border border-foreground hover:bg-accent transition-colors"
            aria-label="統計情報をコピー"
          >
            <Copy size={16} />
            統計をコピー
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
            className={`flex items-center gap-2 px-4 py-2 border border-foreground transition-colors ${
              displaySettings.showGraphs
                ? "bg-primary text-background"
                : "bg-base hover:bg-accent"
            }`}
            aria-label="グラフ表示を切り替え"
          >
            <BarChart3 size={16} />
            グラフ
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex items-center gap-2 px-4 py-2 border border-foreground transition-colors ${
              showSettings
                ? "bg-primary text-background"
                : "bg-base hover:bg-accent"
            }`}
            aria-label="設定パネルを切り替え"
          >
            <Settings size={16} />
            設定
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <TextInput
            value={text}
            onChange={handleTextChange}
            placeholder="ここにテキストを入力してください..."
            fontSize={displaySettings.fontSize}
          />

          {showSettings && (
            <SettingsPanel
              settings={settings}
              displaySettings={displaySettings}
              onSettingsChange={setSettings}
              onDisplaySettingsChange={setDisplaySettings}
            />
          )}
        </div>

        <div className="space-y-4">
          <StatisticsDisplay stats={stats} displaySettings={displaySettings} />
        </div>
      </div>
    </div>
  );
}
