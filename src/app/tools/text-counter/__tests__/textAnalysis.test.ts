import { calculateTextStats } from "../utils/textAnalysis";
import { CountSettings } from "../types";

const defaultSettings: CountSettings = {
  includeSpaces: true,
  includeNewlines: true,
  includeWhitespace: true,
  countMethod: "all",
};

describe("Text Analysis", () => {
  describe("calculateTextStats", () => {
    it("should return zero stats for empty text", () => {
      const stats = calculateTextStats("", defaultSettings);

      expect(stats.totalCharacters).toBe(0);
      expect(stats.wordCount).toBe(0);
      expect(stats.lineCount).toBe(0);
      expect(stats.paragraphCount).toBe(0);
      expect(stats.characterTypes.hiragana).toBe(0);
      expect(stats.characterTypes.katakana).toBe(0);
      expect(stats.characterTypes.kanji).toBe(0);
      expect(stats.characterTypes.alphanumeric).toBe(0);
      expect(stats.characterTypes.symbols).toBe(0);
    });

    it("should count basic English text correctly", () => {
      const text = "Hello World";
      const stats = calculateTextStats(text, defaultSettings);

      expect(stats.totalCharacters).toBe(11);
      expect(stats.charactersWithoutSpaces).toBe(10);
      expect(stats.wordCount).toBe(2);
      expect(stats.lineCount).toBe(1);
      expect(stats.characterTypes.alphanumeric).toBe(10);
    });

    it("should count Japanese text correctly", () => {
      const text = "こんにちは世界";
      const stats = calculateTextStats(text, defaultSettings);

      expect(stats.totalCharacters).toBe(7);
      expect(stats.characterTypes.hiragana).toBe(5); // こんにちは
      expect(stats.characterTypes.kanji).toBe(2); // 世界
      expect(stats.lineCount).toBe(1);
    });

    it("should count mixed Japanese and English text", () => {
      const text = "Hello こんにちは World 世界";
      const stats = calculateTextStats(text, defaultSettings);

      expect(stats.totalCharacters).toBe(20);
      expect(stats.characterTypes.alphanumeric).toBe(10); // Hello World
      expect(stats.characterTypes.hiragana).toBe(5); // こんにちは
      expect(stats.characterTypes.kanji).toBe(2); // 世界
      expect(stats.wordCount).toBeGreaterThan(0);
    });

    it("should count katakana correctly", () => {
      const text = "カタカナ";
      const stats = calculateTextStats(text, defaultSettings);

      expect(stats.characterTypes.katakana).toBe(4);
      expect(stats.totalCharacters).toBe(4);
    });

    it("should count lines and paragraphs correctly", () => {
      const text = "Line 1\nLine 2\n\nParagraph 2";
      const stats = calculateTextStats(text, defaultSettings);

      expect(stats.lineCount).toBe(4);
      expect(stats.paragraphCount).toBe(2);
    });

    it("should count sentences correctly", () => {
      const text =
        "This is sentence 1. This is sentence 2! Is this sentence 3?";
      const stats = calculateTextStats(text, defaultSettings);

      expect(stats.sentenceCount).toBe(3);
    });

    it("should count Japanese sentences correctly", () => {
      const text = "これは文章です。これも文章です！これは質問ですか？";
      const stats = calculateTextStats(text, defaultSettings);

      expect(stats.sentenceCount).toBe(3);
    });

    it("should calculate detailed statistics correctly", () => {
      const text = "Hello\nWorld\nTest";
      const stats = calculateTextStats(text, defaultSettings);

      expect(stats.averageCharactersPerLine).toBeCloseTo(4.67, 1);
      expect(stats.longestLineLength).toBe(5); // "Hello" or "World"
      expect(stats.characterDensity).toBeGreaterThan(0);
    });

    it("should handle symbols correctly", () => {
      const text = "Hello! @#$%^&*()";
      const stats = calculateTextStats(text, defaultSettings);

      expect(stats.characterTypes.alphanumeric).toBe(5); // Hello
      expect(stats.characterTypes.symbols).toBeGreaterThan(0);
    });
  });
});
