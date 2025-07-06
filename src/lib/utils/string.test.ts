import { describe, it, expect } from 'vitest';
import {
  slugify,
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  removeHtmlTags,
  countWords,
  countCharacters,
  sanitizeFilename,
  formatFileSize,
  generateRandomString,
  generateId,
  parseHashtags,
  parseMentions,
  highlightSearchTerms,
  fuzzySearch,
  levenshteinDistance,
  similarity,
  formatPrice,
  parsePrice,
  extractTextFromMarkdown,
  generateExcerpt
} from './string';

describe('String Utilities', () => {
  describe('slugify', () => {
    it('should convert text to URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Hello, World!')).toBe('hello-world');
      expect(slugify('  Hello   World  ')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello@World#2023')).toBe('helloworld2023');
      expect(slugify('Test_Case-Example')).toBe('test-case-example');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
      expect(slugify('   ')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate text when longer than limit', () => {
      expect(truncateText('Hello World', 5)).toBe('He...');
      expect(truncateText('Hello World', 8)).toBe('Hello...');
    });

    it('should not truncate when text is shorter than limit', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should use custom suffix', () => {
      expect(truncateText('Hello World', 5, '---')).toBe('He---');
    });

    it('should handle exact length', () => {
      expect(truncateText('Hello', 5)).toBe('Hello');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
      expect(capitalizeFirst('HELLO')).toBe('Hello');
      expect(capitalizeFirst('hELLO')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalizeFirst('')).toBe('');
    });

    it('should handle single character', () => {
      expect(capitalizeFirst('h')).toBe('H');
    });
  });

  describe('capitalizeWords', () => {
    it('should capitalize each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
      expect(capitalizeWords('HELLO WORLD')).toBe('Hello World');
      expect(capitalizeWords('hello-world')).toBe('Hello-World');
    });

    it('should handle empty string', () => {
      expect(capitalizeWords('')).toBe('');
    });
  });

  describe('removeHtmlTags', () => {
    it('should remove HTML tags', () => {
      expect(removeHtmlTags('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
      expect(removeHtmlTags('<div><span>Test</span></div>')).toBe('Test');
    });

    it('should handle text without HTML', () => {
      expect(removeHtmlTags('Plain text')).toBe('Plain text');
    });

    it('should handle empty string', () => {
      expect(removeHtmlTags('')).toBe('');
    });
  });

  describe('extractTextFromMarkdown', () => {
    it('should remove markdown formatting', () => {
      expect(extractTextFromMarkdown('# Header')).toBe('Header');
      expect(extractTextFromMarkdown('**Bold** text')).toBe('Bold text');
      expect(extractTextFromMarkdown('*Italic* text')).toBe('Italic text');
    });

    it('should handle links', () => {
      expect(extractTextFromMarkdown('[Link text](http://example.com)')).toBe('Link text');
    });

    it('should handle inline code', () => {
      expect(extractTextFromMarkdown('This is `code` inline')).toBe('This is code inline');
    });
  });

  describe('generateExcerpt', () => {
    it('should generate excerpt from markdown', () => {
      const content = '# Title\n\nThis is **bold** content with many words that should be truncated at some point.';
      const excerpt = generateExcerpt(content, 10);
      expect(excerpt.split(' ').length).toBeLessThanOrEqual(11); // 10 words + '...'
    });

    it('should not add ellipsis for short content', () => {
      const content = 'Short content';
      const excerpt = generateExcerpt(content, 50);
      expect(excerpt).toBe('Short content');
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      expect(countWords('Hello world')).toBe(2);
      expect(countWords('Hello    world   test')).toBe(3);
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
    });

    it('should handle single word', () => {
      expect(countWords('Hello')).toBe(1);
    });
  });

  describe('countCharacters', () => {
    it('should count characters with spaces', () => {
      expect(countCharacters('Hello world', true)).toBe(11);
    });

    it('should count characters without spaces', () => {
      expect(countCharacters('Hello world', false)).toBe(10);
    });

    it('should handle empty string', () => {
      expect(countCharacters('', true)).toBe(0);
      expect(countCharacters('', false)).toBe(0);
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filename', () => {
      expect(sanitizeFilename('Hello World.txt')).toBe('Hello_World.txt');
      expect(sanitizeFilename('file@name#2023.doc')).toBe('file_name_2023.doc');
    });

    it('should handle consecutive special chars', () => {
      expect(sanitizeFilename('file@@##name')).toBe('file_name');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
    });

    it('should handle decimal places', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });
  });

  describe('generateRandomString', () => {
    it('should generate string of correct length', () => {
      expect(generateRandomString(8).length).toBe(8);
      expect(generateRandomString(16).length).toBe(16);
    });

    it('should include numbers when specified', () => {
      const str = generateRandomString(100, true, false);
      expect(/[0-9]/.test(str)).toBe(true);
    });

    it('should include symbols when specified', () => {
      const str = generateRandomString(100, true, true);
      expect(/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(str)).toBe(true);
    });
  });

  describe('generateId', () => {
    it('should generate ID with prefix', () => {
      const id = generateId('test', 8);
      expect(id).toMatch(/^test_[A-Za-z0-9]{8}$/);
    });

    it('should generate ID without prefix', () => {
      const id = generateId('', 8);
      expect(id).toMatch(/^[A-Za-z0-9]{8}$/);
    });
  });

  describe('parseHashtags', () => {
    it('should extract hashtags', () => {
      const text = 'This is #awesome and #cool #test';
      const hashtags = parseHashtags(text);
      expect(hashtags).toEqual(['awesome', 'cool', 'test']);
    });

    it('should handle Japanese hashtags', () => {
      const text = 'これは #テスト です';
      const hashtags = parseHashtags(text);
      expect(hashtags).toEqual(['テスト']);
    });

    it('should return empty array when no hashtags', () => {
      expect(parseHashtags('No hashtags here')).toEqual([]);
    });
  });

  describe('parseMentions', () => {
    it('should extract mentions', () => {
      const text = 'Hello @john and @jane_doe';
      const mentions = parseMentions(text);
      expect(mentions).toEqual(['john', 'jane_doe']);
    });

    it('should return empty array when no mentions', () => {
      expect(parseMentions('No mentions here')).toEqual([]);
    });
  });

  describe('highlightSearchTerms', () => {
    it('should highlight search terms', () => {
      const result = highlightSearchTerms('Hello World', ['World']);
      expect(result).toBe('Hello <mark>World</mark>');
    });

    it('should highlight multiple terms', () => {
      const result = highlightSearchTerms('Hello beautiful World', ['Hello', 'World']);
      expect(result).toBe('<mark>Hello</mark> beautiful <mark>World</mark>');
    });

    it('should be case insensitive', () => {
      const result = highlightSearchTerms('Hello World', ['world']);
      expect(result).toBe('Hello <mark>World</mark>');
    });
  });

  describe('fuzzySearch', () => {
    it('should match fuzzy patterns', () => {
      expect(fuzzySearch('hll', 'hello')).toBe(true);
      expect(fuzzySearch('wrld', 'world')).toBe(true);
      expect(fuzzySearch('hello', 'hello')).toBe(true);
    });

    it('should not match non-fuzzy patterns', () => {
      expect(fuzzySearch('xyz', 'hello')).toBe(false);
      expect(fuzzySearch('olleh', 'hello')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(fuzzySearch('HLL', 'hello')).toBe(true);
    });
  });

  describe('levenshteinDistance', () => {
    it('should calculate correct distance', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
      expect(levenshteinDistance('hello', 'hallo')).toBe(1);
      expect(levenshteinDistance('hello', 'world')).toBe(4);
    });

    it('should handle empty strings', () => {
      expect(levenshteinDistance('', '')).toBe(0);
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', 'world')).toBe(5);
    });
  });

  describe('similarity', () => {
    it('should calculate similarity correctly', () => {
      expect(similarity('hello', 'hello')).toBe(1);
      expect(similarity('', '')).toBe(1);
      expect(similarity('hello', 'hallo')).toBeCloseTo(0.8);
    });

    it('should handle different lengths', () => {
      const sim = similarity('hello', 'hello world');
      expect(sim).toBeLessThan(1);
      expect(sim).toBeGreaterThan(0);
    });
  });

  describe('formatPrice', () => {
    it('should format price with default currency', () => {
      expect(formatPrice(1000)).toBe('¥1,000');
      expect(formatPrice(1234567)).toBe('¥1,234,567');
    });

    it('should format price with custom currency', () => {
      expect(formatPrice(1000, '$')).toBe('$1,000');
      expect(formatPrice(1000, 'USD ')).toBe('USD 1,000');
    });
  });

  describe('parsePrice', () => {
    it('should parse price from string', () => {
      expect(parsePrice('¥1,000')).toBe(1000);
      expect(parsePrice('$1,234,567')).toBe(1234567);
      expect(parsePrice('USD 500')).toBe(500);
    });

    it('should handle invalid input', () => {
      expect(parsePrice('not a price')).toBe(0);
      expect(parsePrice('')).toBe(0);
    });
  });
});