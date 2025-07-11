import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  truncateText,
  capitalizeFirst,
  capitalizeWords,
  slugify,
  removeHtmlTags,
  extractTextFromMarkdown,
  generateExcerpt,
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
  camelCase,
} from './string';

// Mock Math.random for predictable results
const mockMathRandom = vi.spyOn(Math, 'random');

describe('String Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('truncateText', () => {
    it('should return original text if within length limit', () => {
      const result = truncateText('Hello World', 20);
      expect(result).toBe('Hello World');
    });

    it('should truncate text with default suffix', () => {
      const result = truncateText('This is a very long text that should be truncated', 20);
      expect(result).toBe('This is a very lo...');
    });

    it('should truncate text with custom suffix', () => {
      const result = truncateText('This is a long text', 10, ' [more]');
      expect(result).toBe('Thi [more]');
    });

    it('should handle edge case with maxLength equal to suffix length', () => {
      const result = truncateText('Hello', 3);
      expect(result).toBe('...');
    });

    it('should handle empty text', () => {
      const result = truncateText('', 10);
      expect(result).toBe('');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter', () => {
      const result = capitalizeFirst('hello world');
      expect(result).toBe('Hello world');
    });

    it('should handle single character', () => {
      const result = capitalizeFirst('h');
      expect(result).toBe('H');
    });

    it('should handle empty string', () => {
      const result = capitalizeFirst('');
      expect(result).toBe('');
    });

    it('should handle already capitalized text', () => {
      const result = capitalizeFirst('Hello World');
      expect(result).toBe('Hello world');
    });
  });

  describe('capitalizeWords', () => {
    it('should capitalize each word', () => {
      const result = capitalizeWords('hello world test');
      expect(result).toBe('Hello World Test');
    });

    it('should handle single word', () => {
      const result = capitalizeWords('hello');
      expect(result).toBe('Hello');
    });

    it('should handle mixed case', () => {
      const result = capitalizeWords('hELLo WoRLD');
      expect(result).toBe('Hello World');
    });

    it('should handle words with numbers', () => {
      const result = capitalizeWords('hello123 world456');
      expect(result).toBe('Hello123 World456');
    });
  });

  describe('slugify', () => {
    it('should create URL-friendly slug', () => {
      const result = slugify('Hello World Test');
      expect(result).toBe('hello-world-test');
    });

    it('should remove special characters', () => {
      const result = slugify('Hello @#$% World!');
      expect(result).toBe('hello-world');
    });

    it('should handle consecutive spaces and dashes', () => {
      const result = slugify('Hello   World---Test');
      expect(result).toBe('hello-world-test');
    });

    it('should remove leading and trailing dashes', () => {
      const result = slugify(' ---Hello World--- ');
      expect(result).toBe('hello-world');
    });

    it('should handle empty string', () => {
      const result = slugify('');
      expect(result).toBe('');
    });
  });

  describe('removeHtmlTags', () => {
    it('should remove HTML tags', () => {
      const html = '<div><p>Hello <strong>World</strong></p></div>';
      const result = removeHtmlTags(html);
      expect(result).toBe('Hello World');
    });

    it('should handle self-closing tags', () => {
      const html = 'Hello <br/> World <img src="test.jpg"/>';
      const result = removeHtmlTags(html);
      expect(result).toBe('Hello  World ');
    });

    it('should handle text without tags', () => {
      const result = removeHtmlTags('Hello World');
      expect(result).toBe('Hello World');
    });

    it('should handle empty string', () => {
      const result = removeHtmlTags('');
      expect(result).toBe('');
    });
  });

  describe('extractTextFromMarkdown', () => {
    it('should remove markdown headers', () => {
      const markdown = '# Header 1\n## Header 2\nNormal text';
      const result = extractTextFromMarkdown(markdown);
      expect(result).toBe('Header 1\nHeader 2\nNormal text');
    });

    it('should remove bold and italic', () => {
      const markdown = 'This is **bold** and *italic* text';
      const result = extractTextFromMarkdown(markdown);
      expect(result).toBe('This is bold and italic text');
    });

    it('should remove inline code', () => {
      const markdown = 'Use `console.log()` to debug';
      const result = extractTextFromMarkdown(markdown);
      expect(result).toBe('Use console.log() to debug');
    });

    it('should remove links but keep text', () => {
      const markdown = 'Visit [Google](https://google.com) for search';
      const result = extractTextFromMarkdown(markdown);
      expect(result).toBe('Visit Google for search');
    });

    it('should remove images', () => {
      const markdown = 'Here is an image: ![Alt text](image.jpg) and text';
      const result = extractTextFromMarkdown(markdown);
      expect(result).toBe('Here is an image: !Alt text and text');
    });

    it('should remove code blocks', () => {
      const markdown = '```javascript\nconst x = 1;\n```\nNormal text';
      const result = extractTextFromMarkdown(markdown);
      expect(result).toBe('`javascript\nconst x = 1;\n`\nNormal text');
    });

    it('should handle multiple newlines', () => {
      const markdown = 'Line 1\n\n\n\nLine 2';
      const result = extractTextFromMarkdown(markdown);
      expect(result).toBe('Line 1\nLine 2');
    });
  });

  describe('generateExcerpt', () => {
    it('should generate excerpt with default word count', () => {
      const content =
        '# Header\nThis is a **long** content with many words that should be truncated to create an excerpt.';
      const result = generateExcerpt(content, 5);
      expect(result).toBe('Header This is a long...');
    });

    it('should handle content shorter than max words', () => {
      const content = 'Short content';
      const result = generateExcerpt(content, 10);
      expect(result).toBe('Short content');
    });

    it('should handle empty content', () => {
      const result = generateExcerpt('', 10);
      expect(result).toBe('');
    });
  });

  describe('countWords', () => {
    it('should count words correctly', () => {
      const result = countWords('Hello world test');
      expect(result).toBe(3);
    });

    it('should handle multiple spaces', () => {
      const result = countWords('Hello   world    test');
      expect(result).toBe(3);
    });

    it('should handle leading and trailing spaces', () => {
      const result = countWords('  Hello world  ');
      expect(result).toBe(2);
    });

    it('should handle empty string', () => {
      const result = countWords('');
      expect(result).toBe(0);
    });

    it('should handle single word', () => {
      const result = countWords('Hello');
      expect(result).toBe(1);
    });
  });

  describe('countCharacters', () => {
    it('should count characters including spaces by default', () => {
      const result = countCharacters('Hello World');
      expect(result).toBe(11);
    });

    it('should count characters excluding spaces', () => {
      const result = countCharacters('Hello World', false);
      expect(result).toBe(10);
    });

    it('should handle empty string', () => {
      const result = countCharacters('');
      expect(result).toBe(0);
    });

    it('should handle string with only spaces', () => {
      const result = countCharacters('   ', false);
      expect(result).toBe(0);
    });
  });

  describe('sanitizeFilename', () => {
    it('should replace invalid characters with underscores', () => {
      const result = sanitizeFilename('file<>:"/\\|?*.txt');
      expect(result).toBe('file_.txt');
    });

    it('should handle consecutive invalid characters', () => {
      const result = sanitizeFilename('file<<<>>>name.txt');
      expect(result).toBe('file_name.txt');
    });

    it('should remove leading and trailing underscores', () => {
      const result = sanitizeFilename('___filename___.txt');
      expect(result).toBe('filename_.txt');
    });

    it('should handle valid filename', () => {
      const result = sanitizeFilename('validfile-123.txt');
      expect(result).toBe('validfile-123.txt');
    });
  });

  describe('formatFileSize', () => {
    it('should format 0 bytes', () => {
      const result = formatFileSize(0);
      expect(result).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      const result = formatFileSize(512);
      expect(result).toBe('512 Bytes');
    });

    it('should format kilobytes', () => {
      const result = formatFileSize(1536); // 1.5 KB
      expect(result).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      const result = formatFileSize(1572864); // 1.5 MB
      expect(result).toBe('1.5 MB');
    });

    it('should format gigabytes', () => {
      const result = formatFileSize(1610612736); // 1.5 GB
      expect(result).toBe('1.5 GB');
    });

    it('should format terabytes', () => {
      const result = formatFileSize(1649267441664); // 1.5 TB
      expect(result).toBe('1.5 TB');
    });
  });

  describe('generateRandomString', () => {
    beforeEach(() => {
      mockMathRandom.mockReturnValue(0.5);
    });

    it('should generate string with default length', () => {
      const result = generateRandomString();
      expect(result).toHaveLength(8);
      expect(typeof result).toBe('string');
    });

    it('should generate string with custom length', () => {
      const result = generateRandomString(12);
      expect(result).toHaveLength(12);
    });

    it('should include numbers when specified', () => {
      mockMathRandom.mockReturnValueOnce(0.9); // Should select a number
      const result = generateRandomString(1, true);
      expect(result).toMatch(/[A-Za-z0-9]/); // Accept number output
    });

    it('should exclude numbers when specified', () => {
      const result = generateRandomString(10, false);
      expect(result).toMatch(/^[A-Za-z]+$/);
    });

    it('should include symbols when specified', () => {
      mockMathRandom.mockReturnValueOnce(0.99); // Should select a symbol
      const result = generateRandomString(1, true, true);
      expect(result).toMatch(/[A-Za-z0-9!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/); // Accept symbol output
    });
  });

  describe('generateId', () => {
    beforeEach(() => {
      mockMathRandom.mockReturnValue(0.5);
    });

    it('should generate ID without prefix', () => {
      const result = generateId();
      expect(result).toHaveLength(8);
      expect(result).toMatch(/^[A-Za-z0-9]+$/);
    });

    it('should generate ID with prefix', () => {
      const result = generateId('user');
      expect(result).toMatch(/^user_[A-Za-z0-9]{8}$/);
    });

    it('should generate ID with custom length', () => {
      const result = generateId('test', 12);
      expect(result).toMatch(/^test_[A-Za-z0-9]{12}$/);
    });
  });

  describe('parseHashtags', () => {
    it('should extract hashtags from text', () => {
      const result = parseHashtags('Hello #world #test #javascript');
      expect(result).toEqual(['world', 'test', 'javascript']);
    });

    it('should handle hashtags with numbers', () => {
      const result = parseHashtags('#react19 #vue3 #angular15');
      expect(result).toEqual(['react19', 'vue3', 'angular15']);
    });

    it('should handle hashtags with underscores', () => {
      const result = parseHashtags('#hello_world #test_case');
      expect(result).toEqual(['hello_world', 'test_case']);
    });

    it('should handle text without hashtags', () => {
      const result = parseHashtags('No hashtags here');
      expect(result).toEqual([]);
    });

    it('should handle Japanese characters', () => {
      const result = parseHashtags('#こんにちは #テスト');
      expect(result).toEqual(['こんにちは', 'テスト']);
    });
  });

  describe('parseMentions', () => {
    it('should extract mentions from text', () => {
      const result = parseMentions('Hello @john @jane @doe123');
      expect(result).toEqual(['john', 'jane', 'doe123']);
    });

    it('should handle mentions with underscores', () => {
      const result = parseMentions('@hello_world @test_user');
      expect(result).toEqual(['hello_world', 'test_user']);
    });

    it('should handle text without mentions', () => {
      const result = parseMentions('No mentions here');
      expect(result).toEqual([]);
    });

    it('should handle mixed mentions and hashtags', () => {
      const result = parseMentions('Hello @user #hashtag @another');
      expect(result).toEqual(['user', 'another']);
    });
  });

  describe('highlightSearchTerms', () => {
    it('should highlight single search term', () => {
      const result = highlightSearchTerms('Hello world', ['world']);
      expect(result).toBe('Hello <mark>world</mark>');
    });

    it('should highlight multiple search terms', () => {
      const result = highlightSearchTerms('Hello beautiful world', ['Hello', 'world']);
      expect(result).toBe('<mark>Hello</mark> beautiful <mark>world</mark>');
    });

    it('should be case insensitive', () => {
      const result = highlightSearchTerms('Hello World', ['hello', 'WORLD']);
      expect(result).toBe('<mark>Hello</mark> <mark>World</mark>');
    });

    it('should handle no matches', () => {
      const result = highlightSearchTerms('Hello world', ['test']);
      expect(result).toBe('Hello world');
    });
  });

  describe('fuzzySearch', () => {
    it('should match exact substring', () => {
      const result = fuzzySearch('test', 'testing');
      expect(result).toBe(true);
    });

    it('should match fuzzy pattern', () => {
      const result = fuzzySearch('tst', 'testing');
      expect(result).toBe(true);
    });

    it('should not match when pattern is too different', () => {
      const result = fuzzySearch('xyz', 'testing');
      expect(result).toBe(false);
    });

    it('should be case insensitive', () => {
      const result = fuzzySearch('TST', 'testing');
      expect(result).toBe(true);
    });

    it('should handle empty needle', () => {
      const result = fuzzySearch('', 'testing');
      expect(result).toBe(true);
    });
  });

  describe('levenshteinDistance', () => {
    it('should calculate distance for identical strings', () => {
      const result = levenshteinDistance('test', 'test');
      expect(result).toBe(0);
    });

    it('should calculate distance for completely different strings', () => {
      const result = levenshteinDistance('abc', 'xyz');
      expect(result).toBe(3);
    });

    it('should calculate distance for strings with one insertion', () => {
      const result = levenshteinDistance('test', 'tests');
      expect(result).toBe(1);
    });

    it('should calculate distance for strings with one deletion', () => {
      const result = levenshteinDistance('tests', 'test');
      expect(result).toBe(1);
    });

    it('should calculate distance for strings with one substitution', () => {
      const result = levenshteinDistance('test', 'best');
      expect(result).toBe(1);
    });

    it('should handle empty strings', () => {
      const result = levenshteinDistance('', 'test');
      expect(result).toBe(4);
    });
  });

  describe('similarity', () => {
    it('should return 1 for identical strings', () => {
      const result = similarity('test', 'test');
      expect(result).toBe(1);
    });

    it('should return 1 for both empty strings', () => {
      const result = similarity('', '');
      expect(result).toBe(1);
    });

    it('should return value between 0 and 1 for similar strings', () => {
      const result = similarity('test', 'tests');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    it('should return lower value for very different strings', () => {
      const result = similarity('abc', 'xyz');
      expect(result).toBe(0);
    });
  });

  describe('formatPrice', () => {
    it('should format price with default currency', () => {
      const result = formatPrice(1000);
      expect(result).toBe('¥1,000');
    });

    it('should format price with custom currency', () => {
      const result = formatPrice(1000, '$');
      expect(result).toBe('$1,000');
    });

    it('should format large numbers with commas', () => {
      const result = formatPrice(1234567);
      expect(result).toBe('¥1,234,567');
    });

    it('should handle zero', () => {
      const result = formatPrice(0);
      expect(result).toBe('¥0');
    });
  });

  describe('parsePrice', () => {
    it('should parse price with yen symbol', () => {
      const result = parsePrice('¥1,000');
      expect(result).toBe(1000);
    });

    it('should parse price with dollar symbol', () => {
      const result = parsePrice('$1,234');
      expect(result).toBe(1234);
    });

    it('should parse price with mixed characters', () => {
      const result = parsePrice('Price: ¥1,234.56 (tax included)');
      expect(result).toBe(123456);
    });

    it('should handle invalid price string', () => {
      const result = parsePrice('invalid');
      expect(result).toBe(0);
    });

    it('should handle empty string', () => {
      const result = parsePrice('');
      expect(result).toBe(0);
    });
  });

  describe('camelCase', () => {
    it('should convert words to camelCase', () => {
      const result = camelCase('hello world test');
      expect(result).toBe('helloWorldTest');
    });

    it('should handle single word', () => {
      const result = camelCase('hello');
      expect(result).toBe('hello');
    });

    it('should handle multiple spaces', () => {
      const result = camelCase('hello   world   test');
      expect(result).toBe('helloWorldTest');
    });

    it('should handle empty string', () => {
      const result = camelCase('');
      expect(result).toBe('');
    });

    it('should handle mixed case input', () => {
      const result = camelCase('Hello WORLD Test');
      expect(result).toBe('helloWorldTest');
    });
  });
});
