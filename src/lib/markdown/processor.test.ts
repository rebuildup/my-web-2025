/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  processMarkdown,
  extractFrontmatter,
  generateTableOfContents,
  calculateReadingTime,
  countWords,
  generateExcerpt,
  validateMarkdownMetadata,
  addMarkdownExtensions,
  sanitizeHtml,
} from './processor';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

// markedのモックを改善
vi.mock('marked', async () => {
  const actual = await vi.importActual('marked');
  const parse = vi.fn().mockImplementation(async (md: string) => `<p>${md}</p>`);
  const use = vi.fn();
  const setOptions = vi.fn();
  // Rendererのモックも改善
  const Renderer = vi.fn().mockImplementation(() => ({
    heading: vi.fn((text, level) => {
      const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
      return `<h${level} id="${escapedText}">${text}</h${level}>`;
    }),
  }));

  return {
    marked: {
      ...(actual as typeof import('marked')),
      parse,
      use,
      setOptions,
      Renderer,
    },
  };
});

// DOMPurifyのモック
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: vi.fn(html => html),
  },
}));

describe('Markdown Processor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processMarkdown', () => {
    it('should process markdown with frontmatter and generate all properties', async () => {
      const rawContent = `---
title: Test Title
description: Test Description
excerpt: Custom Excerpt
---
# Hello
Some content.`;
      (marked.parse as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        '<h1>Hello</h1><p>Some content.</p>'
      );

      const result = await processMarkdown(rawContent);

      expect(result.metadata.title).toBe('Test Title');
      expect(result.metadata.readingTime).toBe(1);
      expect(result.metadata.wordCount).toBe(4); // 修正: '#' も単語としてカウント
      expect(result.content).toBe('<h1>Hello</h1><p>Some content.</p>');
      expect(result.tableOfContents.length).toBe(1);
      expect(result.excerpt).toBe('Custom Excerpt'); // metadata.excerptが使われる
      expect(result.readingTime).toBe(1);
      expect(result.wordCount).toBe(4); // 修正: '#' も単語としてカウント
    });

    it('should generate excerpt if not in metadata', async () => {
      const longContent = Array(50).fill('word').join(' ');
      const rawContent = `---
title: Test Title
---
# Hello
${longContent}`;
      (marked.parse as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
        `<h1>Hello</h1><p>${longContent}</p>`
      );

      const result = await processMarkdown(rawContent);
      expect(result.excerpt).toContain('...');
    });
  });

  describe('addMarkdownExtensions', () => {
    it('should configure marked with a custom heading renderer', () => {
      addMarkdownExtensions();
      expect(marked.use).toHaveBeenCalled();
      const rendererInstance = (marked.use as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]
        .renderer;
      const headingHtml = rendererInstance.heading('Test Heading', 1);
      expect(headingHtml).toBe('<h1 id="test-heading">Test Heading</h1>');
    });
  });

  describe('extractFrontmatter', () => {
    it('should extract frontmatter correctly', () => {
      const content = `---
title: Test
tags: [one, two]
---
Markdown content`;
      const { metadata, content: restContent } = extractFrontmatter(content);
      expect(metadata).toEqual({ title: 'Test', tags: '[one, two]' });
      expect(restContent).toBe('Markdown content');
    });

    it('should handle content without frontmatter', () => {
      const content = 'Just content';
      const { metadata, content: restContent } = extractFrontmatter(content);
      expect(metadata).toEqual({});
      expect(restContent).toBe('Just content');
    });

    it('should handle keys with no value', () => {
      const content = `---
title:
---
Content`;
      const { metadata } = extractFrontmatter(content);
      expect(metadata).toEqual({ title: '' });
    });
  });

  describe('generateTableOfContents', () => {
    it('should generate a ToC from headings', () => {
      const content = '# H1\n## H2\n### H3';
      const toc = generateTableOfContents(content);
      expect(toc).toEqual([
        { id: 'h1', title: 'H1', level: 1, children: [] },
        { id: 'h2', title: 'H2', level: 2, children: [] },
        { id: 'h3', title: 'H3', level: 3, children: [] },
      ]);
    });

    it('should return an empty array for content without headings', () => {
      const toc = generateTableOfContents('No headings here.');
      expect(toc).toEqual([]);
    });
  });

  describe('countWords', () => {
    it('should count words in a simple string', () => {
      expect(countWords('one two three')).toBe(3);
    });

    it('should handle html tags', () => {
      expect(countWords('<p>one <strong>two</strong></p> three')).toBe(3);
    });

    it('should return 0 for empty content', () => {
      expect(countWords('')).toBe(0);
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time correctly', () => {
      const longText = Array(500).fill('word').join(' ');
      expect(calculateReadingTime(longText)).toBe(3); // ceil(500/200)
    });

    it('should return 0 for empty content', () => {
      expect(calculateReadingTime('')).toBe(0);
    });
  });

  describe('generateExcerpt', () => {
    it('should truncate long content', () => {
      const longText = 'This is a very long text that should be truncated.';
      expect(generateExcerpt(longText, 20)).toBe('This is a very long ...');
    });

    it('should return full content if shorter than maxLength', () => {
      const content = 'Short content.';
      expect(generateExcerpt(content, 100)).toBe(content);
    });
  });

  describe('sanitizeHtml', () => {
    it('should call DOMPurify.sanitize', () => {
      const dirtyHtml = '<script>alert("xss")</script><p>clean</p>';
      sanitizeHtml(dirtyHtml);
      expect(DOMPurify.sanitize).toHaveBeenCalledWith(dirtyHtml);
    });
  });

  describe('validateMarkdownMetadata', () => {
    it('should return valid for correct metadata', () => {
      const { valid, errors } = validateMarkdownMetadata({ title: 't', description: 'd' });
      expect(valid).toBe(true);
      expect(errors).toEqual([]);
    });

    it('should return errors for invalid metadata', () => {
      const { valid, errors } = validateMarkdownMetadata({ title: '', description: '' });
      expect(valid).toBe(false);
      expect(errors).toContain('Title is required');
      expect(errors).toContain('Description is required');
    });
  });
});
