import { describe, it, expect } from 'vitest';

// String utility functions
const stringUtils = {
  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  truncate: (text: string, length: number, suffix = '...'): string => {
    if (text.length <= length) return text;
    return text.substring(0, length - suffix.length) + suffix;
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  camelCase: (text: string): string => {
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  },

  kebabCase: (text: string): string => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  removeHtml: (text: string): string => {
    return text.replace(/<[^>]*>/g, '');
  },

  escapeHtml: (text: string): string => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  },

  wordCount: (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },

  readingTime: (text: string, wordsPerMinute = 200): number => {
    const words = stringUtils.wordCount(text);
    return Math.ceil(words / wordsPerMinute);
  },

  extractEmails: (text: string): string[] => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    return text.match(emailRegex) || [];
  },

  extractUrls: (text: string): string[] => {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    return text.match(urlRegex) || [];
  },

  isJapanese: (text: string): boolean => {
    const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
    return japaneseRegex.test(text);
  },

  highlightText: (text: string, query: string, className = 'highlight'): string => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
  },
};

describe('String Utilities', () => {
  describe('slugify', () => {
    it('should convert text to URL-friendly slug', () => {
      expect(stringUtils.slugify('Hello World')).toBe('hello-world');
      expect(stringUtils.slugify('Hello, World!')).toBe('hello-world');
      expect(stringUtils.slugify('  Hello   World  ')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(stringUtils.slugify('Hello@World#2023')).toBe('helloworld2023');
      expect(stringUtils.slugify('Test_Case-Example')).toBe('test-case-example');
    });

    it('should handle empty string', () => {
      expect(stringUtils.slugify('')).toBe('');
      expect(stringUtils.slugify('   ')).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate text when longer than limit', () => {
      expect(stringUtils.truncate('Hello World', 5)).toBe('He...');
      expect(stringUtils.truncate('Hello World', 8)).toBe('Hello...');
    });

    it('should not truncate when text is shorter than limit', () => {
      expect(stringUtils.truncate('Hello', 10)).toBe('Hello');
    });

    it('should use custom suffix', () => {
      expect(stringUtils.truncate('Hello World', 5, '---')).toBe('He---');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(stringUtils.capitalize('hello')).toBe('Hello');
      expect(stringUtils.capitalize('HELLO')).toBe('Hello');
      expect(stringUtils.capitalize('hELLO')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(stringUtils.capitalize('')).toBe('');
    });
  });

  describe('camelCase', () => {
    it('should convert to camelCase', () => {
      expect(stringUtils.camelCase('hello world')).toBe('helloWorld');
      expect(stringUtils.camelCase('Hello World')).toBe('helloWorld');
      expect(stringUtils.camelCase('HELLO WORLD')).toBe('helloWorld');
    });

    it('should handle multiple spaces', () => {
      expect(stringUtils.camelCase('hello   world   test')).toBe('helloWorldTest');
    });
  });

  describe('kebabCase', () => {
    it('should convert to kebab-case', () => {
      expect(stringUtils.kebabCase('HelloWorld')).toBe('hello-world');
      expect(stringUtils.kebabCase('hello world')).toBe('hello-world');
      expect(stringUtils.kebabCase('hello_world')).toBe('hello-world');
    });
  });

  describe('removeHtml', () => {
    it('should remove HTML tags', () => {
      expect(stringUtils.removeHtml('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
      expect(stringUtils.removeHtml('<div><span>Test</span></div>')).toBe('Test');
    });

    it('should handle text without HTML', () => {
      expect(stringUtils.removeHtml('Plain text')).toBe('Plain text');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(stringUtils.escapeHtml('<script>alert("test")</script>')).toBe('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;');
      expect(stringUtils.escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });
  });

  describe('wordCount', () => {
    it('should count words correctly', () => {
      expect(stringUtils.wordCount('Hello world')).toBe(2);
      expect(stringUtils.wordCount('Hello    world   test')).toBe(3);
      expect(stringUtils.wordCount('')).toBe(0);
      expect(stringUtils.wordCount('   ')).toBe(0);
    });
  });

  describe('readingTime', () => {
    it('should calculate reading time', () => {
      const text = 'This is a test text with some words to calculate reading time.';
      expect(stringUtils.readingTime(text, 200)).toBe(1); // Should be 1 minute for short text
    });

    it('should handle custom words per minute', () => {
      const text = Array(300).fill('word').join(' '); // 300 words
      expect(stringUtils.readingTime(text, 100)).toBe(3); // 300 words / 100 wpm = 3 minutes
    });
  });

  describe('extractEmails', () => {
    it('should extract email addresses', () => {
      const text = 'Contact us at test@example.com or admin@site.org for help.';
      const emails = stringUtils.extractEmails(text);
      expect(emails).toEqual(['test@example.com', 'admin@site.org']);
    });

    it('should return empty array when no emails found', () => {
      expect(stringUtils.extractEmails('No emails here')).toEqual([]);
    });
  });

  describe('extractUrls', () => {
    it('should extract URLs', () => {
      const text = 'Visit https://example.com or http://test.org for more info.';
      const urls = stringUtils.extractUrls(text);
      expect(urls).toEqual(['https://example.com', 'http://test.org']);
    });

    it('should return empty array when no URLs found', () => {
      expect(stringUtils.extractUrls('No URLs here')).toEqual([]);
    });
  });

  describe('isJapanese', () => {
    it('should detect Japanese text', () => {
      expect(stringUtils.isJapanese('こんにちは')).toBe(true);
      expect(stringUtils.isJapanese('カタカナ')).toBe(true);
      expect(stringUtils.isJapanese('漢字')).toBe(true);
      expect(stringUtils.isJapanese('Hello World')).toBe(false);
    });

    it('should detect mixed text', () => {
      expect(stringUtils.isJapanese('Hello こんにちは')).toBe(true);
    });
  });

  describe('highlightText', () => {
    it('should highlight matching text', () => {
      const result = stringUtils.highlightText('Hello World', 'World');
      expect(result).toBe('Hello <span class="highlight">World</span>');
    });

    it('should be case insensitive', () => {
      const result = stringUtils.highlightText('Hello World', 'world');
      expect(result).toBe('Hello <span class="highlight">World</span>');
    });

    it('should use custom class name', () => {
      const result = stringUtils.highlightText('Hello World', 'World', 'custom');
      expect(result).toBe('Hello <span class="custom">World</span>');
    });

    it('should handle empty query', () => {
      expect(stringUtils.highlightText('Hello World', '')).toBe('Hello World');
    });
  });
});