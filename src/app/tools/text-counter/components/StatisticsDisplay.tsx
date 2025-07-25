"use client";

import { TextStats, DisplaySettings } from "../types";
import CharacterTypeChart from "./CharacterTypeChart";

interface StatisticsDisplayProps {
  stats: TextStats;
  displaySettings: DisplaySettings;
}

export default function StatisticsDisplay({
  stats,
  displaySettings,
}: StatisticsDisplayProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-primary">統計情報</h2>

      {displaySettings.showBasicStats && (
        <div className="bg-base border border-foreground p-4 space-y-3">
          <h3 className="font-medium text-foreground">基本統計</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem label="総文字数" value={stats.totalCharacters} />
            <StatItem
              label="スペース除く"
              value={stats.charactersWithoutSpaces}
            />
            <StatItem
              label="改行除く"
              value={stats.charactersWithoutNewlines}
            />
            <StatItem
              label="空白除く"
              value={stats.charactersWithoutWhitespace}
            />
          </div>
        </div>
      )}

      {displaySettings.showStructureStats && (
        <div className="bg-base border border-foreground p-4 space-y-3">
          <h3 className="font-medium text-foreground">構造統計</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem label="単語数" value={stats.wordCount} />
            <StatItem label="行数" value={stats.lineCount} />
            <StatItem label="段落数" value={stats.paragraphCount} />
            <StatItem label="文数" value={stats.sentenceCount} />
          </div>
        </div>
      )}

      {displaySettings.showCharacterTypes && (
        <div className="bg-base border border-foreground p-4 space-y-3">
          <h3 className="font-medium text-foreground">文字種別</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatItem label="ひらがな" value={stats.characterTypes.hiragana} />
            <StatItem label="カタカナ" value={stats.characterTypes.katakana} />
            <StatItem label="漢字" value={stats.characterTypes.kanji} />
            <StatItem
              label="英数字"
              value={stats.characterTypes.alphanumeric}
            />
            <StatItem label="記号" value={stats.characterTypes.symbols} />
          </div>

          {displaySettings.showGraphs && (
            <div className="mt-4">
              <CharacterTypeChart stats={stats} />
            </div>
          )}
        </div>
      )}

      {displaySettings.showDetailedStats && (
        <div className="bg-base border border-foreground p-4 space-y-3">
          <h3 className="font-medium text-foreground">詳細統計</h3>
          <div className="space-y-2">
            <StatItem
              label="平均行文字数"
              value={stats.averageCharactersPerLine.toFixed(1)}
            />
            <StatItem label="最長行文字数" value={stats.longestLineLength} />
            <StatItem
              label="文字密度"
              value={`${stats.characterDensity.toFixed(1)}%`}
            />
            <StatItem
              label="平均行単語数"
              value={stats.averageWordsPerLine.toFixed(1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-foreground">{label}</span>
      <span className="font-mono text-sm font-medium text-primary">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
    </div>
  );
}
