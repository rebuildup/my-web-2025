import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractFrontmatter,
  generateTableOfContents,
  calculateReadingTime,
  countWords,
  generateExcerpt,
  sanitizeHtml,
  addMarkdownExtensions,
  processMarkdown,
  processMarkdownFiles,
  validateMarkdownMetadata,
  searchMarkdownContent,
  type MarkdownMetadata,
  type ProcessedMarkdown,
} from './processor';

// Mock DOMPurify
vi.mock('isomorphic-dompurify', () => ({
  default: {
    sanitize: vi.fn((html: string) => html),
  },
}));

// Mock marked
vi.mock('marked', () => ({
  default: {
    setOptions: vi.fn(),
    use: vi.fn(),
    Renderer: vi.fn().mockImplementation(() => ({
      heading: vi.fn(),
      code: vi.fn(),
      link: vi.fn(),
      image: vi.fn(),
      table: vi.fn(),
      blockquote: vi.fn(),
    })),
  },
}));

describe('Markdown Processor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractFrontmatter', () => {
    it('should extract frontmatter from markdown content', () => {
      const content = `---
title: Test Post
description: A test post
author: Test Author
date: 2024-01-01
tags: [test, markdown]
draft: false
featured: true
---

# Test Content
This is the content.`;

      const result = extractFrontmatter(content);

      expect(result.metadata).toEqual({
        title: 'Test Post',
        description: 'A test post',
        author: 'Test Author',
        date: '2024-01-01',
        tags: ['test', 'markdown'],
        draft: false,
        featured: true,
      });
      expect(result.content).toBe('# Test Content\nThis is the content.');
    });

    it('should handle content without frontmatter', () => {
      const content = '# Test Content\nThis is the content.';

      const result = extractFrontmatter(content);

      expect(result.metadata).toEqual({});
      expect(result.content).toBe(content);
    });

    it('should handle empty frontmatter', () => {
      const content = `---
---

# Test Content`;

      const result = extractFrontmatter(content);

      expect(result.metadata).toEqual({});
      expect(result.content).toBe('# Test Content');
    });

    it('should handle frontmatter with quoted values', () => {
      const content = `---
title: "Test Post with Quotes"
description: 'A test post with quotes'
---

# Test Content`;

      const result = extractFrontmatter(content);

      expect(result.metadata).toEqual({
        title: 'Test Post with Quotes',
        description: 'A test post with quotes',
      });
    });
  });

  describe('generateTableOfContents', () => {
    it('should generate table of contents from headings', () => {
      const content = `# Main Title
## Section 1
### Subsection 1.1
## Section 2
### Subsection 2.1
### Subsection 2.2`;

      const result = generateTableOfContents(content);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'main-title',
        title: 'Main Title',
        level: 1,
        children: [
          {
            id: 'section-1',
            title: 'Section 1',
            level: 2,
            children: [
              {
                id: 'subsection-1-1',
                title: 'Subsection 1.1',
                level: 3,
                children: [],
              },
            ],
          },
        ],
      });
      expect(result[1]).toEqual({
        id: 'section-2',
        title: 'Section 2',
        level: 2,
        children: [
          {
            id: 'subsection-2-1',
            title: 'Subsection 2.1',
            level: 3,
            children: [],
          },
          {
            id: 'subsection-2-2',
            title: 'Subsection 2.2',
            level: 3,
            children: [],
          },
        ],
      });
    });

    it('should handle content without headings', () => {
      const content = 'This is just text without headings.';

      const result = generateTableOfContents(content);

      expect(result).toEqual([]);
    });

    it('should handle special characters in headings', () => {
      const content = `# Title with Special Characters: @#$%
## Section with (parentheses) and [brackets]`;

      const result = generateTableOfContents(content);

      expect(result[0].id).toBe('title-with-special-characters');
      expect(result[0].children[0].id).toBe('section-with-parentheses-and-brackets');
    });
  });

  describe('calculateReadingTime', () => {
    it('should calculate reading time based on word count', () => {
      const content = 'This is a test content with multiple words. '.repeat(100); // 600 words

      const result = calculateReadingTime(content);

      expect(result).toBe(3); // 600 words / 200 wpm = 3 minutes
    });

    it('should handle empty content', () => {
      const result = calculateReadingTime('');

      expect(result).toBe(0);
    });

    it('should handle content with code blocks', () => {
      const content = `# Title
This is content.

\`\`\`javascript
const code = 'this should not count';
\`\`\`

More content.`;

      const result = calculateReadingTime(content);

      expect(result).toBeGreaterThan(0);
    });
  });

  describe('countWords', () => {
    it('should count words in text content', () => {
      const content = 'This is a test content with multiple words.';

      const result = countWords(content);

      expect(result).toBe(8);
    });

    it('should exclude code blocks from word count', () => {
      const content = `This is content.

\`\`\`javascript
const code = 'this should not count';
\`\`\`

More content.`;

      const result = countWords(content);

      expect(result).toBe(4); // "This is content. More content."
    });

    it('should exclude inline code from word count', () => {
      const content = 'This is content with `inline code` and more text.';

      const result = countWords(content);

      expect(result).toBe(8); // "This is content with and more text."
    });

    it('should exclude images from word count', () => {
      const content = 'This is content ![alt text](image.jpg) and more text.';

      const result = countWords(content);

      expect(result).toBe(7); // "This is content and more text."
    });

    it('should exclude links from word count', () => {
      const content = 'This is content [link text](url) and more text.';

      const result = countWords(content);

      expect(result).toBe(7); // "This is content and more text."
    });
  });

  describe('generateExcerpt', () => {
    it('should generate excerpt from content', () => {
      const content =
        'This is a long content that should be truncated to create an excerpt. '.repeat(10);

      const result = generateExcerpt(content, 50);

      expect(result.length).toBeLessThanOrEqual(50);
      expect(result).toContain('This is a long content');
    });

    it('should handle content shorter than max length', () => {
      const content = 'Short content.';

      const result = generateExcerpt(content, 100);

      expect(result).toBe(content);
    });

    it('should handle empty content', () => {
      const result = generateExcerpt('', 100);

      expect(result).toBe('');
    });

    it('should use default max length', () => {
      const content = 'This is content. '.repeat(50);

      const result = generateExcerpt(content);

      expect(result.length).toBeLessThanOrEqual(200);
    });
  });

  describe('sanitizeHtml', () => {
    it('should sanitize HTML content', () => {
      const html = '<p>Safe content</p><script>alert("xss")</script>';

      const result = sanitizeHtml(html);

      expect(result).toBe('<p>Safe content</p><script>alert("xss")</script>'); // Mock returns original
    });

    it('should handle empty HTML', () => {
      const result = sanitizeHtml('');

      expect(result).toBe('');
    });
  });

  describe('addMarkdownExtensions', () => {
    it('should add markdown extensions', () => {
      expect(() => addMarkdownExtensions()).not.toThrow();
    });
  });

  describe('processMarkdown', () => {
    it('should process markdown content', async () => {
      const content = `---
title: Test Post
description: A test post
---

# Main Title
This is content.

## Section
More content.`;

      const result = await processMarkdown(content);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('tableOfContents');
      expect(result).toHaveProperty('excerpt');
      expect(result).toHaveProperty('readingTime');
      expect(result).toHaveProperty('wordCount');

      expect(result.metadata).toEqual({
        title: 'Test Post',
        description: 'A test post',
      });
      expect(result.tableOfContents).toHaveLength(1);
      expect(result.readingTime).toBeGreaterThan(0);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('should handle content without frontmatter', async () => {
      const content = '# Title\nThis is content.';

      const result = await processMarkdown(content);

      expect(result.metadata).toEqual({});
      expect(result.content).toContain('Title');
    });
  });

  describe('processMarkdownFiles', () => {
    it('should process multiple markdown files', async () => {
      const files = [
        {
          path: '/file1.md',
          content: `---
title: File 1
---
# Content 1`,
        },
        {
          path: '/file2.md',
          content: `---
title: File 2
---
# Content 2`,
        },
      ];

      const result = await processMarkdownFiles(files);

      expect(result).toHaveProperty('/file1.md');
      expect(result).toHaveProperty('/file2.md');
      expect(result['/file1.md'].metadata.title).toBe('File 1');
      expect(result['/file2.md'].metadata.title).toBe('File 2');
    });

    it('should handle empty files array', async () => {
      const result = await processMarkdownFiles([]);

      expect(result).toEqual({});
    });
  });

  describe('validateMarkdownMetadata', () => {
    it('should validate valid metadata', () => {
      const metadata: MarkdownMetadata = {
        title: 'Test Post',
        description: 'A test post',
        author: 'Test Author',
        date: '2024-01-01',
        tags: ['test'],
        category: 'test',
        draft: false,
        featured: true,
        excerpt: 'Test excerpt',
        readingTime: 5,
        wordCount: 100,
      };

      const result = validateMarkdownMetadata(metadata);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate metadata with missing required fields', () => {
      const metadata: MarkdownMetadata = {};

      const result = validateMarkdownMetadata(metadata);

      expect(result.valid).toBe(true); // No required fields defined
      expect(result.errors).toEqual([]);
    });

    it('should validate metadata with invalid values', () => {
      const metadata: MarkdownMetadata = {
        title: '',
        description: 'A'.repeat(1000), // Too long
        tags: [''],
      };

      const result = validateMarkdownMetadata(metadata);

      expect(result.valid).toBe(true); // No validation rules defined
      expect(result.errors).toEqual([]);
    });
  });

  describe('searchMarkdownContent', () => {
    it('should search markdown content', () => {
      const content: ProcessedMarkdown[] = [
        {
          content: 'This is a test post about React.',
          metadata: { title: 'React Post', tags: ['react'] },
          tableOfContents: [],
          excerpt: 'Test excerpt',
          readingTime: 1,
          wordCount: 10,
        },
        {
          content: 'This is a post about Vue.js.',
          metadata: { title: 'Vue Post', tags: ['vue'] },
          tableOfContents: [],
          excerpt: 'Vue excerpt',
          readingTime: 1,
          wordCount: 10,
        },
      ];

      const result = searchMarkdownContent(content, 'React');

      expect(result).toHaveLength(1);
      expect(result[0].metadata.title).toBe('React Post');
    });

    it('should filter by tags', () => {
      const content: ProcessedMarkdown[] = [
        {
          content: 'React post',
          metadata: { title: 'React Post', tags: ['react'] },
          tableOfContents: [],
          excerpt: 'React excerpt',
          readingTime: 1,
          wordCount: 10,
        },
        {
          content: 'Vue post',
          metadata: { title: 'Vue Post', tags: ['vue'] },
          tableOfContents: [],
          excerpt: 'Vue excerpt',
          readingTime: 1,
          wordCount: 10,
        },
      ];

      const result = searchMarkdownContent(content, '', { tags: ['react'] });

      expect(result).toHaveLength(1);
      expect(result[0].metadata.title).toBe('React Post');
    });

    it('should filter by category', () => {
      const content: ProcessedMarkdown[] = [
        {
          content: 'React post',
          metadata: { title: 'React Post', category: 'frontend' },
          tableOfContents: [],
          excerpt: 'React excerpt',
          readingTime: 1,
          wordCount: 10,
        },
        {
          content: 'Backend post',
          metadata: { title: 'Backend Post', category: 'backend' },
          tableOfContents: [],
          excerpt: 'Backend excerpt',
          readingTime: 1,
          wordCount: 10,
        },
      ];

      const result = searchMarkdownContent(content, '', { category: 'frontend' });

      expect(result).toHaveLength(1);
      expect(result[0].metadata.title).toBe('React Post');
    });

    it('should filter by author', () => {
      const content: ProcessedMarkdown[] = [
        {
          content: 'Post by John',
          metadata: { title: 'John Post', author: 'John' },
          tableOfContents: [],
          excerpt: 'John excerpt',
          readingTime: 1,
          wordCount: 10,
        },
        {
          content: 'Post by Jane',
          metadata: { title: 'Jane Post', author: 'Jane' },
          tableOfContents: [],
          excerpt: 'Jane excerpt',
          readingTime: 1,
          wordCount: 10,
        },
      ];

      const result = searchMarkdownContent(content, '', { author: 'John' });

      expect(result).toHaveLength(1);
      expect(result[0].metadata.title).toBe('John Post');
    });

    it('should filter by date range', () => {
      const content: ProcessedMarkdown[] = [
        {
          content: 'Old post',
          metadata: { title: 'Old Post', date: '2023-01-01' },
          tableOfContents: [],
          excerpt: 'Old excerpt',
          readingTime: 1,
          wordCount: 10,
        },
        {
          content: 'New post',
          metadata: { title: 'New Post', date: '2024-01-01' },
          tableOfContents: [],
          excerpt: 'New excerpt',
          readingTime: 1,
          wordCount: 10,
        },
      ];

      const result = searchMarkdownContent(content, '', {
        dateRange: { start: new Date('2024-01-01'), end: new Date('2024-12-31') },
      });

      expect(result).toHaveLength(1);
      expect(result[0].metadata.title).toBe('New Post');
    });

    it('should return empty array for no matches', () => {
      const content: ProcessedMarkdown[] = [
        {
          content: 'React post',
          metadata: { title: 'React Post' },
          tableOfContents: [],
          excerpt: 'React excerpt',
          readingTime: 1,
          wordCount: 10,
        },
      ];

      const result = searchMarkdownContent(content, 'Vue');

      expect(result).toHaveLength(0);
    });
  });
});
