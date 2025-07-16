'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Download, Type } from 'lucide-react';

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
  speakingTime: number;
}

interface KeywordDensity {
  word: string;
  count: number;
  density: number;
}
/*
interface SocialMediaLimits {
  platform: string;
  limit: number;
  remaining: number;
  status: 'good' | 'warning' | 'over';
}
*/
const TextCounter: React.FC = () => {
  const [text, setText] = useState('');
  const [showSEO, setShowSEO] = useState(false);

  // Basic text statistics
  const textStats: TextStats = useMemo(() => {
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim()
      ? text
          .trim()
          .split(/\s+/)
          .filter(word => word.length > 0).length
      : 0;
    const sentences = text.trim()
      ? text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length
      : 0;
    const paragraphs = text.trim()
      ? text.split(/\n\s*\n/).filter(para => para.trim().length > 0).length
      : 0;
    const readingTime = Math.ceil(words / 200);
    const speakingTime = Math.ceil(words / 130);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
    };
  }, [text]);

  // Syllable estimation
  function estimateSyllables(text: string): number {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return words.reduce((total, word) => {
      const syllables = word.match(/[aeiouy]+/g)?.length || 1;
      return total + Math.max(1, syllables);
    }, 0);
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
  /*
  const socialMediaLimits: SocialMediaLimits[] = useMemo(() => {
    const platforms = [
      { platform: 'Twitter', limit: 280 },
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
  */

  const copyToClipboard = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  const exportAnalysis = useCallback(
    (format: 'txt' | 'json' | 'csv') => {
      let content = '';
      switch (format) {
        case 'txt':
          content = `Text Analysis Report\n========================\n\nBasic Statistics:\n- Characters: ${textStats.characters}\n- Words: ${textStats.words}\n\nTop Keywords:\n${keywordDensity.map(kw => `- ${kw.word}: ${kw.count} times`).join('\n')}`;
          break;
        case 'json':
          content = JSON.stringify({ textStats, keywordDensity }, null, 2);
          break;
        case 'csv':
          content =
            'Metric,Value\n' + `Characters,${textStats.characters}\n` + `Words,${textStats.words}`;
          break;
      }
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `text-analysis.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [textStats, keywordDensity]
  );

  const getReadabilityLevel = (score: number): { level: string; color: string } => {
    if (score >= 90) return { level: 'Very Easy', color: 'text-green-600' };
    if (score >= 80) return { level: 'Easy', color: 'text-green-500' };
    if (score >= 70) return { level: 'Fairly Easy', color: 'text-yellow-500' };
    if (score >= 60) return { level: 'Standard', color: 'text-orange-500' };
    if (score >= 50) return { level: 'Fairly Difficult', color: 'text-orange-600' };
    if (score >= 30) return { level: 'Difficult', color: 'text-red-500' };
    return { level: 'Very Difficult', color: 'text-red-600' };
  };

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
          </div>
          <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
            <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
              {textStats.words.toLocaleString()}
            </div>
            <div className="noto-sans-jp text-foreground/70 text-xs">Words</div>
          </div>
          <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
            <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
              {textStats.sentences}
            </div>
            <div className="noto-sans-jp text-foreground/70 text-xs">Sentences</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
            </div>
          )}
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
        </div>
      </div>
    </div>
  );
};

export default TextCounter;
