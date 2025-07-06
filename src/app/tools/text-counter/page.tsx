'use client';

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { 
  Type, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  FileText,
  Hash,
  AlignLeft,
  Languages
} from "lucide-react";

interface TextStatistics {
  totalChars: number;
  charsNoSpaces: number;
  charsNoLinebreaks: number;
  charsNoWhitespace: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  hiragana: number;
  katakana: number;
  kanji: number;
  alphanumeric: number;
  symbols: number;
  avgCharsPerLine: number;
  longestLine: number;
  readingTime: number; // in minutes
}

interface DisplaySettings {
  showBasicStats: boolean;
  showDetailedStats: boolean;
  showCharacterTypes: boolean;
  showStructureStats: boolean;
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  showRealTime: boolean;
}

const defaultSettings: DisplaySettings = {
  showBasicStats: true,
  showDetailedStats: true,
  showCharacterTypes: true,
  showStructureStats: true,
  theme: 'dark',
  fontSize: 'medium',
  showRealTime: true
};

export default function TextCounterPage() {
  const [text, setText] = useState('');
  const [settings, setSettings] = useState<DisplaySettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('text-counter-settings');
      if (saved) {
        setSettings({...defaultSettings, ...JSON.parse(saved)});
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = (newSettings: DisplaySettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('text-counter-settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const statistics: TextStatistics = useMemo(() => {
    if (!text) {
      return {
        totalChars: 0,
        charsNoSpaces: 0,
        charsNoLinebreaks: 0,
        charsNoWhitespace: 0,
        words: 0,
        lines: 0,
        paragraphs: 0,
        sentences: 0,
        hiragana: 0,
        katakana: 0,
        kanji: 0,
        alphanumeric: 0,
        symbols: 0,
        avgCharsPerLine: 0,
        longestLine: 0,
        readingTime: 0
      };
    }

    const totalChars = text.length;
    const charsNoSpaces = text.replace(/ /g, '').length;
    const charsNoLinebreaks = text.replace(/\n/g, '').length;
    const charsNoWhitespace = text.replace(/\s/g, '').length;
    
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    const sentences = text.trim() ? text.split(/[。！？.!?]+/).filter(s => s.trim()).length : 0;

    // Character type counts
    let hiragana = 0, katakana = 0, kanji = 0, alphanumeric = 0, symbols = 0;
    
    for (const char of text) {
      const code = char.charCodeAt(0);
      
      if (code >= 0x3041 && code <= 0x3096) {
        hiragana++;
      } else if (code >= 0x30A1 && code <= 0x30FA) {
        katakana++;
      } else if ((code >= 0x4E00 && code <= 0x9FAF) || 
                 (code >= 0x3400 && code <= 0x4DBF)) {
        kanji++;
      } else if ((code >= 0x30 && code <= 0x39) || // 0-9
                 (code >= 0x41 && code <= 0x5A) || // A-Z
                 (code >= 0x61 && code <= 0x7A)) { // a-z
        alphanumeric++;
      } else if (!/\s/.test(char)) {
        symbols++;
      }
    }

    const textLines = text.split('\n');
    const lineLengths = textLines.map(line => line.length);
    const avgCharsPerLine = lines > 0 ? Math.round(totalChars / lines) : 0;
    const longestLine = Math.max(...lineLengths, 0);

    // Reading time calculation (Japanese: ~500 chars/min, English: ~250 words/min)
    const jpChars = hiragana + katakana + kanji;
    const enWords = alphanumeric > 0 ? Math.ceil(alphanumeric / 5) : 0; // Approximate
    const readingTime = Math.ceil((jpChars / 500) + (enWords / 250));

    return {
      totalChars,
      charsNoSpaces,
      charsNoLinebreaks,
      charsNoWhitespace,
      words,
      lines,
      paragraphs,
      sentences,
      hiragana,
      katakana,
      kanji,
      alphanumeric,
      symbols,
      avgCharsPerLine,
      longestLine,
      readingTime
    };
  }, [text]);

  const clearText = () => {
    setText('');
  };

  const getCharacterTypePercentage = (count: number): number => {
    return statistics.totalChars > 0 ? Math.round((count / statistics.totalChars) * 100) : 0;
  };

  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Text Counter",
    "description": "テキストの文字数を詳細にカウントするツール",
    "url": "https://yusuke-kim.com/tools/text-counter",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Web Browser",
    "author": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link 
              href="/tools" 
              className="neue-haas-grotesk-display text-xl text-primary hover:text-primary/80 flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Tools</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <Settings size={16} />
                <span className="noto-sans-jp text-sm">設定</span>
              </button>
              
              <button
                onClick={clearText}
                className="flex items-center space-x-2 px-4 py-2 border border-red-500/30 text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-colors"
              >
                <span className="noto-sans-jp text-sm">クリア</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-12 px-4">
          <div className="flex justify-center mb-4">
            <Type size={64} className="text-primary" />
          </div>
          <h1 className="neue-haas-grotesk-display text-4xl md:text-6xl text-primary mb-4">
            Text Counter
          </h1>
          <p className="noto-sans-jp text-lg text-foreground/80 max-w-2xl mx-auto">
            テキストの文字数を詳細にカウント。<br />
            総文字数、単語数、行数、文字種別など豊富な統計情報を提供。
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 pb-16">
          {/* Settings Panel */}
          {showSettings && (
            <section className="mb-8 border border-foreground/20 bg-gray/50 p-6">
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4">表示設定</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Display Options */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">表示項目</label>
                  <div className="space-y-2">
                    {[
                      { key: 'showBasicStats', label: '基本統計' },
                      { key: 'showDetailedStats', label: '詳細統計' },
                      { key: 'showCharacterTypes', label: '文字種別' },
                      { key: 'showStructureStats', label: '構造統計' },
                      { key: 'showRealTime', label: 'リアルタイム更新' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={settings[key as keyof DisplaySettings] as boolean}
                          onChange={(e) => saveSettings({
                            ...settings,
                            [key]: e.target.checked
                          })}
                          className="rounded border-foreground/20"
                        />
                        <span className="noto-sans-jp text-sm text-foreground">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Font Size */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">フォントサイズ</label>
                  <select
                    value={settings.fontSize}
                    onChange={(e) => saveSettings({
                      ...settings,
                      fontSize: e.target.value as any
                    })}
                    className="w-full p-2 border border-foreground/20 bg-gray text-foreground"
                  >
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label className="block noto-sans-jp text-sm text-foreground/70 mb-2">テーマ</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => saveSettings({
                      ...settings,
                      theme: e.target.value as any
                    })}
                    className="w-full p-2 border border-foreground/20 bg-gray text-foreground"
                  >
                    <option value="light">ライト</option>
                    <option value="dark">ダーク</option>
                  </select>
                </div>
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Text Input */}
            <div>
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4 flex items-center space-x-2">
                <FileText size={24} />
                <span>テキスト入力</span>
              </h3>
              
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="ここにテキストを入力してください..."
                className={`w-full h-96 p-4 border border-foreground/20 bg-gray text-foreground resize-none focus:border-primary focus:outline-none ${fontSizeClasses[settings.fontSize]} leading-relaxed`}
                style={{ 
                  fontFamily: 'Noto Sans JP, sans-serif',
                }}
              />
              
              {settings.showRealTime && text && (
                <div className="mt-2 text-xs text-foreground/60 noto-sans-jp">
                  リアルタイム更新中 • {statistics.totalChars} 文字
                </div>
              )}
            </div>

            {/* Statistics */}
            <div>
              <h3 className="neue-haas-grotesk-display text-xl text-foreground mb-4 flex items-center space-x-2">
                <BarChart3 size={24} />
                <span>統計情報</span>
              </h3>
              
              <div className="space-y-6">
                {/* Basic Statistics */}
                {settings.showBasicStats && (
                  <div className="border border-foreground/20 bg-gray/50 p-4">
                    <h4 className="flex items-center space-x-2 text-foreground mb-3">
                      <Hash size={16} />
                      <span className="noto-sans-jp font-medium">基本統計</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gray border border-foreground/10">
                        <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                          {statistics.totalChars.toLocaleString()}
                        </div>
                        <div className="noto-sans-jp text-xs text-foreground/70">総文字数</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray border border-foreground/10">
                        <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                          {statistics.charsNoSpaces.toLocaleString()}
                        </div>
                        <div className="noto-sans-jp text-xs text-foreground/70">スペース除く</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray border border-foreground/10">
                        <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                          {statistics.words.toLocaleString()}
                        </div>
                        <div className="noto-sans-jp text-xs text-foreground/70">単語数</div>
                      </div>
                      
                      <div className="text-center p-3 bg-gray border border-foreground/10">
                        <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                          {statistics.lines.toLocaleString()}
                        </div>
                        <div className="noto-sans-jp text-xs text-foreground/70">行数</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Character Types */}
                {settings.showCharacterTypes && (
                  <div className="border border-foreground/20 bg-gray/50 p-4">
                    <h4 className="flex items-center space-x-2 text-foreground mb-3">
                      <Languages size={16} />
                      <span className="noto-sans-jp font-medium">文字種別</span>
                    </h4>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'ひらがな', count: statistics.hiragana, color: 'bg-blue-500' },
                        { label: 'カタカナ', count: statistics.katakana, color: 'bg-green-500' },
                        { label: '漢字', count: statistics.kanji, color: 'bg-purple-500' },
                        { label: '英数字', count: statistics.alphanumeric, color: 'bg-orange-500' },
                        { label: '記号', count: statistics.symbols, color: 'bg-red-500' }
                      ].map(({ label, count, color }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="noto-sans-jp text-sm text-foreground/70">{label}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray border border-foreground/10 h-2 rounded overflow-hidden">
                              <div 
                                className={`h-full ${color} transition-all duration-300`}
                                style={{ width: `${getCharacterTypePercentage(count)}%` }}
                              />
                            </div>
                            <span className="text-sm text-foreground w-12 text-right">
                              {count}
                            </span>
                            <span className="text-xs text-foreground/50 w-8 text-right">
                              {getCharacterTypePercentage(count)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structure Statistics */}
                {settings.showStructureStats && (
                  <div className="border border-foreground/20 bg-gray/50 p-4">
                    <h4 className="flex items-center space-x-2 text-foreground mb-3">
                      <AlignLeft size={16} />
                      <span className="noto-sans-jp font-medium">構造統計</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="noto-sans-jp text-foreground/70">段落数</span>
                        <span className="text-foreground">{statistics.paragraphs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="noto-sans-jp text-foreground/70">文数</span>
                        <span className="text-foreground">{statistics.sentences}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="noto-sans-jp text-foreground/70">平均文字数/行</span>
                        <span className="text-foreground">{statistics.avgCharsPerLine}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="noto-sans-jp text-foreground/70">最長行</span>
                        <span className="text-foreground">{statistics.longestLine}</span>
                      </div>
                      <div className="flex justify-between col-span-2">
                        <span className="noto-sans-jp text-foreground/70">読み時間（概算）</span>
                        <span className="text-foreground">{statistics.readingTime}分</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Statistics */}
                {settings.showDetailedStats && (
                  <div className="border border-foreground/20 bg-gray/50 p-4">
                    <h4 className="noto-sans-jp font-medium text-foreground mb-3">詳細統計</h4>
                    
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="noto-sans-jp text-foreground/70">改行除く文字数</span>
                        <span className="text-foreground">{statistics.charsNoLinebreaks.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="noto-sans-jp text-foreground/70">空白除く文字数</span>
                        <span className="text-foreground">{statistics.charsNoWhitespace.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}