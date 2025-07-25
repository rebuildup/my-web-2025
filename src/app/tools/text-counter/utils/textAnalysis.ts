import { TextStats, CountSettings, CharacterTypeBreakdown } from "../types";

// Japanese character ranges
const HIRAGANA_RANGE = /[\u3040-\u309F]/g;
const KATAKANA_RANGE = /[\u30A0-\u30FF]/g;
const KANJI_RANGE = /[\u4E00-\u9FAF]/g;
const ALPHANUMERIC_RANGE = /[A-Za-z0-9]/g;

export function calculateTextStats(
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _settings: CountSettings
): TextStats {
  if (!text) {
    return {
      totalCharacters: 0,
      charactersWithoutSpaces: 0,
      charactersWithoutNewlines: 0,
      charactersWithoutWhitespace: 0,
      wordCount: 0,
      lineCount: 0,
      paragraphCount: 0,
      sentenceCount: 0,
      characterTypes: {
        hiragana: 0,
        katakana: 0,
        kanji: 0,
        alphanumeric: 0,
        symbols: 0,
      },
      averageCharactersPerLine: 0,
      longestLineLength: 0,
      characterDensity: 0,
      averageWordsPerLine: 0,
    };
  }

  // Basic character counts
  const totalCharacters = text.length;
  const charactersWithoutSpaces = text.replace(/ /g, "").length;
  const charactersWithoutNewlines = text.replace(/\n/g, "").length;
  const charactersWithoutWhitespace = text.replace(/\s/g, "").length;

  // Line and paragraph analysis
  const lines = text.split("\n");
  const lineCount = lines.length;
  const paragraphCount = text
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;

  // Word count (handles both Japanese and English)
  const wordCount = countWords(text);

  // Sentence count (Japanese and English sentence endings)
  const sentenceCount = countSentences(text);

  // Character type analysis
  const characterTypes = analyzeCharacterTypes(text);

  // Detailed statistics
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
  const averageCharactersPerLine =
    nonEmptyLines.length > 0
      ? nonEmptyLines.reduce((sum, line) => sum + line.length, 0) /
        nonEmptyLines.length
      : 0;

  const longestLineLength = Math.max(...lines.map((line) => line.length), 0);

  const characterDensity =
    totalCharacters > 0
      ? (charactersWithoutWhitespace / totalCharacters) * 100
      : 0;

  const averageWordsPerLine =
    nonEmptyLines.length > 0 ? wordCount / nonEmptyLines.length : 0;

  return {
    totalCharacters,
    charactersWithoutSpaces,
    charactersWithoutNewlines,
    charactersWithoutWhitespace,
    wordCount,
    lineCount,
    paragraphCount,
    sentenceCount,
    characterTypes,
    averageCharactersPerLine,
    longestLineLength,
    characterDensity,
    averageWordsPerLine,
  };
}

function countWords(text: string): number {
  // Handle Japanese text (no spaces between words) and English text
  const trimmedText = text.trim();
  if (!trimmedText) return 0;

  // For mixed Japanese/English text, we need a more sophisticated approach
  // Split by whitespace for English words
  const englishWords = trimmedText
    .split(/\s+/)
    .filter((word) => /[A-Za-z0-9]/.test(word));

  // For Japanese, we'll count character transitions as word boundaries
  // This is a simplified approach - in reality, Japanese word segmentation is complex
  const japaneseCharCount = (
    trimmedText.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g) || []
  ).length;
  const estimatedJapaneseWords = Math.ceil(japaneseCharCount / 2); // Rough estimate

  // If text is primarily English, use space-based counting
  if (englishWords.length > estimatedJapaneseWords) {
    return trimmedText.split(/\s+/).length;
  }

  // For Japanese text, return estimated word count
  return Math.max(englishWords.length + estimatedJapaneseWords, 1);
}

function countSentences(text: string): number {
  if (!text.trim()) return 0;

  // Japanese sentence endings: 。！？
  // English sentence endings: .!?
  const sentenceEndings = /[。！？.!?]/g;
  const matches = text.match(sentenceEndings);
  return matches ? matches.length : 1;
}

function analyzeCharacterTypes(text: string) {
  const hiragana = (text.match(HIRAGANA_RANGE) || []).length;
  const katakana = (text.match(KATAKANA_RANGE) || []).length;
  const kanji = (text.match(KANJI_RANGE) || []).length;
  const alphanumeric = (text.match(ALPHANUMERIC_RANGE) || []).length;

  // Symbols are everything else (excluding whitespace)
  const totalNonWhitespace = text.replace(/\s/g, "").length;
  const symbols =
    totalNonWhitespace - hiragana - katakana - kanji - alphanumeric;

  return {
    hiragana,
    katakana,
    kanji,
    alphanumeric,
    symbols: Math.max(symbols, 0),
  };
}

export function getCharacterTypeBreakdown(
  text: string
): CharacterTypeBreakdown {
  const hiragana = text.match(HIRAGANA_RANGE) || [];
  const katakana = text.match(KATAKANA_RANGE) || [];
  const kanji = text.match(KANJI_RANGE) || [];
  const alphanumeric = text.match(ALPHANUMERIC_RANGE) || [];

  // Get all other characters (symbols)
  const allChars = text.split("");
  const symbols = allChars.filter(
    (char) =>
      !HIRAGANA_RANGE.test(char) &&
      !KATAKANA_RANGE.test(char) &&
      !KANJI_RANGE.test(char) &&
      !ALPHANUMERIC_RANGE.test(char) &&
      !/\s/.test(char)
  );

  return {
    hiragana: [...new Set(hiragana)],
    katakana: [...new Set(katakana)],
    kanji: [...new Set(kanji)],
    alphanumeric: [...new Set(alphanumeric)],
    symbols: [...new Set(symbols)],
  };
}
