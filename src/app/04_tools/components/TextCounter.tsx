'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Download, Type, Check } from 'lucide-react';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: number;
  speakingTime: number;
  japaneseCharacters: number;
  kanjiCount: number;
  hiraganaCount: number;
  katakanaCount: number;
}

interface KeywordDensity {
  word: string;
  count: number;
  density: number;
}

interface SocialMediaLimits {
  platform: string;
  limit: number;
  remaining: number;
  status: 'good' | 'warning' | 'over';
}
const TextCounter: React.FC = () => {
  const [text, setText] = useState('');
  const [showSEO, setShowSEO] = useState(false);

  // Japanese text detection and counting
  const countJapaneseCharacters = useCallback((text: string) => {
    // Count Japanese characters (Hiragana, Katakana, Kanji)
    const hiraganaRegex = /[\u3040-\u309F]/g;
    const katakanaRegex = /[\u30A0-\u30FF]/g;
    const kanjiRegex = /[\u4E00-\u9FAF]/g;

    const hiragana = text.match(hiraganaRegex) || [];
    const katakana = text.match(katakanaRegex) || [];
    const kanji = text.match(kanjiRegex) || [];

    return {
      hiraganaCount: hiragana.length,
      katakanaCount: katakana.length,
      kanjiCount: kanji.length,
      japaneseCharacters: hiragana.length + katakana.length + kanji.length,
    };
  }, []);

  // Word counting with Japanese support
  const countWords = useCallback(
    (text: string) => {
      if (!text.trim()) return 0;

      // For Japanese text, we need special handling
      const hasJapanese =
        /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF]/.test(text);

      if (hasJapanese) {
        // For Japanese text, we count words differently
        // Split by spaces for any non-Japanese words
        const nonJapaneseWords = text
          .split(/\s+/)
          .filter(
            word =>
              word.length > 0 &&
              !/[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF]/.test(word)
          ).length;

        // For Japanese, we estimate words based on characters
        // This is an approximation as Japanese doesn't use spaces between words
        const japaneseChars = countJapaneseCharacters(text).japaneseCharacters;
        const estimatedJapaneseWords = Math.ceil(japaneseChars / 2); // Approximate 2 characters per word

        return nonJapaneseWords + estimatedJapaneseWords;
      } else {
        // For non-Japanese text, use standard word counting
        return text
          .trim()
          .split(/\s+/)
          .filter(word => word.length > 0).length;
      }
    },
    [countJapaneseCharacters]
  );

  // Basic text statistics
  const textStats: TextStats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = countWords(text);

    // Count sentences with support for Japanese sentence endings
    const sentences = text.trim()
      ? text.split(/[.!?。！？]+/).filter(sentence => sentence.trim().length > 0).length
      : 0;

    const paragraphs = text.trim()
      ? text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length
      : 0;

    // Count lines
    const lines = text.trim() ? text.split('\n').length : 0;

    const readingTime = Math.ceil(words / 200); // Words per minute for reading
    const speakingTime = Math.ceil(words / 130); // Words per minute for speaking

    // Get Japanese character counts
    const japaneseStats = countJapaneseCharacters(text);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime,
      ...japaneseStats,
    };
  }, [text, countWords, countJapaneseCharacters]);

  // Syllable estimation
  function estimateSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    let total = 0;
    for (const word of words) {
      const syllables = word.match(/[aeiouy]+/g)?.length || 1;
      total += Math.max(1, syllables);
    }
    return total;
  }

  // Readability score
  const calculateReadabilityScore = useCallback(
    (text: string): number => {
      if (textStats.words === 0 || textStats.sentences === 0) return 0;
      const avgSentenceLength = textStats.words / textStats.sentences;
      const avgSyllables = estimateSyllables(text) / textStats.words;
      const score = 206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllables;
      return Math.max(0, Math.min(100, Math.round(score)));
    },
    [textStats.words, textStats.sentences]
  );

  // Keyword density
  const keywordDensity: KeywordDensity[] = useMemo(() => {
    if (!text.trim() || textStats.words === 0) return [];
    const cleanText = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const words = cleanText.split(' ').filter(word => word.length > 2);
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    return Object.entries(wordCount)
      .map(([word, count]) => ({
        word,
        count,
        density: (count / textStats.words) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [text, textStats.words]);

  // SEO Analysis
  const seoAnalysis = useMemo(() => {
    const titleLength = text.length;
    const metaDescLength = text.length;
    return {
      titleOptimal: titleLength >= 30 && titleLength <= 60,
      titleLength,
      titleMessage:
        titleLength < 30
          ? 'Too short for SEO title'
          : titleLength > 60
            ? 'Too long for SEO title'
            : 'Good length for SEO title',
      metaOptimal: metaDescLength >= 120 && metaDescLength <= 160,
      metaDescLength,
      metaMessage:
        metaDescLength < 120
          ? 'Too short for meta description'
          : metaDescLength > 160
            ? 'Too long for meta description'
            : 'Good length for meta description',
      wordCount: textStats.words,
      readabilityScore: calculateReadabilityScore(text),
    };
  }, [text, textStats.words, calculateReadabilityScore]);

  // Social media limits
  const socialMediaLimits: SocialMediaLimits[] = useMemo(() => {
    const platforms = [
      { platform: 'Twitter/X', limit: 280 },
      { platform: 'Facebook', limit: 500 },
      { platform: 'Instagram', limit: 2200 },
      { platform: 'LinkedIn', limit: 3000 },
      { platform: 'YouTube', limit: 5000 },
    ];
    return platforms.map(({ platform, limit }) => {
      const remaining = limit - textStats.characters;
      let status: 'good' | 'warning' | 'over' = 'good';
      if (remaining < 0) status = 'over';
      else if (remaining < limit * 0.1) status = 'warning';
      return { platform, limit, remaining, status };
    });
  }, [textStats.characters]);

  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (content: string, label: string = 'Text') => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(`${label} copied!`);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setCopySuccess('Copy failed');
      setTimeout(() => setCopySuccess(null), 2000);
    }
  }, []);

  const getReadabilityLevel = useCallback((score: number): { level: string; color: string } => {
    if (score >= 90) return { level: 'Very Easy', color: 'text-green-600' };
    if (score >= 80) return { level: 'Easy', color: 'text-green-500' };
    if (score >= 70) return { level: 'Fairly Easy', color: 'text-yellow-500' };
    if (score >= 60) return { level: 'Standard', color: 'text-orange-500' };
    if (score >= 50) return { level: 'Fairly Difficult', color: 'text-orange-600' };
    if (score >= 30) return { level: 'Difficult', color: 'text-red-500' };
    return { level: 'Very Difficult', color: 'text-red-600' };
  }, []);

  const exportAnalysis = useCallback(
    (format: 'txt' | 'json' | 'csv') => {
      let content = '';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

      switch (format) {
        case 'txt':
          content = `Text Analysis Report
========================
Generated: ${new Date().toLocaleString()}

Basic Statistics:
- Characters: ${textStats.characters}
- Characters (No Spaces): ${textStats.charactersNoSpaces}
- Words: ${textStats.words}
- Sentences: ${textStats.sentences}
- Paragraphs: ${textStats.paragraphs}
- Lines: ${textStats.lines}
- Reading Time: ${textStats.readingTime} minutes
- Speaking Time: ${textStats.speakingTime} minutes

${
  textStats.japaneseCharacters > 0
    ? `
Japanese Text Analysis:
- Japanese Characters: ${textStats.japaneseCharacters}
- Kanji: ${textStats.kanjiCount}
- Hiragana: ${textStats.hiraganaCount}
- Katakana: ${textStats.katakanaCount}
`
    : ''
}

Readability:
- Score: ${seoAnalysis.readabilityScore}/100
- Level: ${getReadabilityLevel(seoAnalysis.readabilityScore).level}

Top Keywords:
${keywordDensity.map(kw => `- ${kw.word}: ${kw.count} times (${kw.density.toFixed(2)}%)`).join('\n')}

Social Media Compatibility:
${socialMediaLimits.map(sm => `- ${sm.platform}: ${sm.remaining < 0 ? 'Over limit by ' + Math.abs(sm.remaining) : sm.remaining + ' characters remaining'}`).join('\n')}

Original Text:
"${text.length > 1000 ? text.substring(0, 1000) + '...' : text}"`;
          break;

        case 'json':
          content = JSON.stringify(
            {
              textStats,
              keywordDensity,
              readability: {
                score: seoAnalysis.readabilityScore,
                level: getReadabilityLevel(seoAnalysis.readabilityScore).level,
              },
              socialMediaLimits,
              seoAnalysis,
              timestamp: new Date().toISOString(),
              text: text.length > 1000 ? text.substring(0, 1000) + '...' : text,
            },
            null,
            2
          );
          break;

        case 'csv':
          content =
            'Metric,Value\n' +
            `Characters,${textStats.characters}\n` +
            `Characters (No Spaces),${textStats.charactersNoSpaces}\n` +
            `Words,${textStats.words}\n` +
            `Sentences,${textStats.sentences}\n` +
            `Paragraphs,${textStats.paragraphs}\n` +
            `Lines,${textStats.lines}\n` +
            `Reading Time (min),${textStats.readingTime}\n` +
            `Speaking Time (min),${textStats.speakingTime}\n`;

          if (textStats.japaneseCharacters > 0) {
            content +=
              `Japanese Characters,${textStats.japaneseCharacters}\n` +
              `Kanji,${textStats.kanjiCount}\n` +
              `Hiragana,${textStats.hiraganaCount}\n` +
              `Katakana,${textStats.katakanaCount}\n`;
          }

          content += `Readability Score,${seoAnalysis.readabilityScore}\n`;

          // Add keyword density
          content += '\n\nKeyword,Count,Density\n';
          keywordDensity.forEach(kw => {
            content += `${kw.word},${kw.count},${kw.density.toFixed(2)}%\n`;
          });

          // Add social media limits
          content += '\n\nPlatform,Limit,Remaining,Status\n';
          socialMediaLimits.forEach(sm => {
            content += `${sm.platform},${sm.limit},${sm.remaining},${sm.status}\n`;
          });
          break;
      }

      const blob = new Blob([content], {
        type: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv' : 'text/plain',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `text-analysis-${timestamp}.${format}`;
      a.click();
      URL.revokeObjectURL(url);

      setCopySuccess(`Analysis exported as ${format.toUpperCase()}`);
      setTimeout(() => setCopySuccess(null), 2000);
    },
    [textStats, keywordDensity, seoAnalysis, socialMediaLimits, text, getReadabilityLevel]
  );

  const readability = getReadabilityLevel(seoAnalysis.readabilityScore);

  return (
    <div className="space-y-6">
      <div className="border-foreground/20 border p-6">
        <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl">
          <Type className="mr-2 inline" size={24} />
          Text Counter & Analyzer
        </h2>
        <div className="space-y-4">
          <div>
            <label className="noto-sans-jp text-foreground mb-2 block text-sm font-medium">
              Enter your text to analyze
            </label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste or type your text here..."
              className="border-foreground/20 bg-gray text-foreground noto-sans-jp h-40 w-full border px-4 py-3 focus:outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setText('')}
              className="border-foreground/20 text-foreground/70 hover:border-primary/50 border px-4 py-2 text-sm transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => copyToClipboard(text)}
              className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-1 border px-4 py-2 text-sm transition-colors"
            >
              <Copy size={14} />
              <span>Copy Text</span>
            </button>
          </div>
        </div>
      </div>
      <div className="border-foreground/20 border p-6">
        <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">Basic Statistics</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
            <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
              {textStats.characters.toLocaleString()}
            </div>
            <div className="noto-sans-jp text-foreground/70 text-xs">Characters</div>
            <button
              onClick={() => copyToClipboard(textStats.characters.toString())}
              className="text-foreground/50 hover:text-primary mt-1 text-xs"
              title="Copy to clipboard"
            >
              <Copy size={12} />
            </button>
          </div>
          <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
            <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
              {textStats.charactersNoSpaces.toLocaleString()}
            </div>
            <div className="noto-sans-jp text-foreground/70 text-xs">Characters (No Spaces)</div>
            <button
              onClick={() => copyToClipboard(textStats.charactersNoSpaces.toString())}
              className="text-foreground/50 hover:text-primary mt-1 text-xs"
              title="Copy to clipboard"
            >
              <Copy size={12} />
            </button>
          </div>
          <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
            <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
              {textStats.words.toLocaleString()}
            </div>
            <div className="noto-sans-jp text-foreground/70 text-xs">Words</div>
            <button
              onClick={() => copyToClipboard(textStats.words.toString())}
              className="text-foreground/50 hover:text-primary mt-1 text-xs"
              title="Copy to clipboard"
            >
              <Copy size={12} />
            </button>
          </div>
          <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
            <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
              {textStats.sentences}
            </div>
            <div className="noto-sans-jp text-foreground/70 text-xs">Sentences</div>
            <button
              onClick={() => copyToClipboard(textStats.sentences.toString())}
              className="text-foreground/50 hover:text-primary mt-1 text-xs"
              title="Copy to clipboard"
            >
              <Copy size={12} />
            </button>
          </div>
          <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
            <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
              {textStats.paragraphs}
            </div>
            <div className="noto-sans-jp text-foreground/70 text-xs">Paragraphs</div>
            <button
              onClick={() => copyToClipboard(textStats.paragraphs.toString())}
              className="text-foreground/50 hover:text-primary mt-1 text-xs"
              title="Copy to clipboard"
            >
              <Copy size={12} />
            </button>
          </div>
          <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
            <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
              {textStats.lines}
            </div>
            <div className="noto-sans-jp text-foreground/70 text-xs">Lines</div>
            <button
              onClick={() => copyToClipboard(textStats.lines.toString())}
              className="text-foreground/50 hover:text-primary mt-1 text-xs"
              title="Copy to clipboard"
            >
              <Copy size={12} />
            </button>
          </div>
          <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
            <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
              {textStats.readingTime}
            </div>
            <div className="noto-sans-jp text-foreground/70 text-xs">Reading Time (min)</div>
            <button
              onClick={() => copyToClipboard(textStats.readingTime.toString())}
              className="text-foreground/50 hover:text-primary mt-1 text-xs"
              title="Copy to clipboard"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Japanese Text Analysis */}
      {textStats.japaneseCharacters > 0 && (
        <div className="border-foreground/20 border p-6">
          <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
            Japanese Text Analysis
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
              <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                {textStats.japaneseCharacters.toLocaleString()}
              </div>
              <div className="noto-sans-jp text-foreground/70 text-xs">Japanese Characters</div>
              <button
                onClick={() => copyToClipboard(textStats.japaneseCharacters.toString())}
                className="text-foreground/50 hover:text-primary mt-1 text-xs"
                title="Copy to clipboard"
              >
                <Copy size={12} />
              </button>
            </div>
            <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
              <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                {textStats.kanjiCount.toLocaleString()}
              </div>
              <div className="noto-sans-jp text-foreground/70 text-xs">漢字 (Kanji)</div>
              <button
                onClick={() => copyToClipboard(textStats.kanjiCount.toString())}
                className="text-foreground/50 hover:text-primary mt-1 text-xs"
                title="Copy to clipboard"
              >
                <Copy size={12} />
              </button>
            </div>
            <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
              <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                {textStats.hiraganaCount.toLocaleString()}
              </div>
              <div className="noto-sans-jp text-foreground/70 text-xs">ひらがな (Hiragana)</div>
              <button
                onClick={() => copyToClipboard(textStats.hiraganaCount.toString())}
                className="text-foreground/50 hover:text-primary mt-1 text-xs"
                title="Copy to clipboard"
              >
                <Copy size={12} />
              </button>
            </div>
            <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
              <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                {textStats.katakanaCount.toLocaleString()}
              </div>
              <div className="noto-sans-jp text-foreground/70 text-xs">カタカナ (Katakana)</div>
              <button
                onClick={() => copyToClipboard(textStats.katakanaCount.toString())}
                className="text-foreground/50 hover:text-primary mt-1 text-xs"
                title="Copy to clipboard"
              >
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="border-foreground/20 border p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="neue-haas-grotesk-display text-foreground text-xl">SEO Analysis</h3>
            <button
              onClick={() => setShowSEO(!showSEO)}
              className={`text-sm transition-colors ${showSEO ? 'text-primary' : 'text-foreground/60'}`}
            >
              {showSEO ? 'Hide' : 'Show'}
            </button>
          </div>
          {showSEO && (
            <div className="space-y-4">
              <div className="border-foreground/20 border p-3">
                <span className="noto-sans-jp text-foreground text-sm font-medium">
                  Readability Score:{' '}
                </span>
                <span className={`text-sm font-medium ${readability.color}`}>
                  {seoAnalysis.readabilityScore}/100 ({readability.level})
                </span>
              </div>
              <div className="border-foreground/20 border p-3">
                <span className="noto-sans-jp text-foreground text-sm font-medium">
                  SEO Title Length:{' '}
                </span>
                <span
                  className={`text-sm font-medium ${seoAnalysis.titleOptimal ? 'text-green-500' : 'text-orange-500'}`}
                >
                  {seoAnalysis.titleLength} characters
                </span>
                <p className="text-foreground/70 mt-1 text-xs">{seoAnalysis.titleMessage}</p>
              </div>
              <div className="border-foreground/20 border p-3">
                <span className="noto-sans-jp text-foreground text-sm font-medium">
                  Meta Description Length:{' '}
                </span>
                <span
                  className={`text-sm font-medium ${seoAnalysis.metaOptimal ? 'text-green-500' : 'text-orange-500'}`}
                >
                  {seoAnalysis.metaDescLength} characters
                </span>
                <p className="text-foreground/70 mt-1 text-xs">{seoAnalysis.metaMessage}</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-foreground/20 border p-6">
          <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
            Social Media Limits
          </h3>
          <div className="space-y-3">
            {socialMediaLimits.map(({ platform, limit, remaining, status }) => (
              <div key={platform} className="border-foreground/20 border p-3">
                <div className="flex items-center justify-between">
                  <span className="noto-sans-jp text-foreground text-sm font-medium">
                    {platform}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      status === 'over'
                        ? 'text-red-500'
                        : status === 'warning'
                          ? 'text-orange-500'
                          : 'text-green-500'
                    }`}
                  >
                    {remaining < 0 ? 'Over limit' : `${remaining} characters left`}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className={`h-full ${
                      status === 'over'
                        ? 'bg-red-500'
                        : status === 'warning'
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min(100, ((limit - Math.min(remaining, limit)) / limit) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="border-foreground/20 border p-6">
        <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">Export Analysis</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => exportAnalysis('txt')}
            className="bg-primary hover:bg-primary/80 flex items-center space-x-2 px-4 py-2 text-white transition-colors"
          >
            <Download size={16} />
            <span>TXT Report</span>
          </button>
          <button
            onClick={() => exportAnalysis('json')}
            className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-2 border px-4 py-2 transition-colors"
          >
            <Download size={16} />
            <span>JSON Data</span>
          </button>
          <button
            onClick={() => exportAnalysis('csv')}
            className="border-primary text-primary hover:bg-primary/10 flex items-center space-x-2 border px-4 py-2 transition-colors"
          >
            <Download size={16} />
            <span>CSV Data</span>
          </button>
        </div>

        {/* Copy notification */}
        {copySuccess && (
          <div className="bg-primary/10 text-primary mt-4 flex items-center gap-2 rounded-md p-2 text-sm">
            <Check size={16} />
            <span>{copySuccess}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextCounter;
