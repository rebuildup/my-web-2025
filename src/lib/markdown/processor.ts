import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

export interface MarkdownMetadata {
  title?: string;
  description?: string;
  author?: string;
  date?: string;
  tags?: string[];
  category?: string;
  draft?: boolean;
  featured?: boolean;
  excerpt?: string;
  readingTime?: number;
  wordCount?: number;
}

export interface ProcessedMarkdown {
  content: string;
  metadata: MarkdownMetadata;
  tableOfContents: TableOfContentsItem[];
  excerpt: string;
  readingTime: number;
  wordCount: number;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
  children: TableOfContentsItem[];
}

// Configure marked with custom options
marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
  // sanitize: false, // We'll use DOMPurify for sanitization (option removed)
});

// Custom renderer for enhanced functionality
const renderer = new marked.Renderer();

// Enhanced heading renderer with auto-generated IDs
renderer.heading = function (token) {
  const text = token.text || '';
  const level = token.depth || 1;
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `<h${level} id="${escapedText}">${text}</h${level}>`;
};

// Enhanced code block renderer with syntax highlighting classes
renderer.code = function (token) {
  const text = token.text || '';
  const lang = token.lang;
  const validLanguage = lang && /^[a-zA-Z0-9_+-]*$/.test(lang);
  const className = validLanguage ? `language-${lang}` : '';
  return `<pre><code class="hljs ${className}">${text}</code></pre>`;
};

// Enhanced link renderer with security attributes
renderer.link = function (token) {
  const href = token.href;
  const title = token.title;
  const text = token.text;
  const isExternal = href.startsWith('http') && !href.includes(window?.location?.hostname || '');
  const titleAttr = title ? ` title="${title}"` : '';
  const targetAttr = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
};

// Enhanced image renderer with responsive attributes
renderer.image = function (token) {
  const href = token.href;
  const title = token.title;
  const text = token.text;
  const titleAttr = title ? ` title="${title}"` : '';
  return `<img src="${href}" alt="${text}"${titleAttr} loading="lazy" class="responsive-image" />`;
};

// Enhanced table renderer with responsive wrapper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
renderer.table = function (token: any) {
  const header = token.header || '';
  const body = token.body || '';
  return `<div class="table-wrapper"><table class="markdown-table">${header}${body}</table></div>`;
};

// Enhanced blockquote renderer
renderer.blockquote = function (token) {
  const text = token.text || '';
  return `<blockquote class="markdown-blockquote">${text}</blockquote>`;
};

marked.use({ renderer });

/**
 * Extract frontmatter from markdown content
 */
export function extractFrontmatter(content: string): {
  metadata: MarkdownMetadata;
  content: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {}, content };
  }

  const [, frontmatterString, markdownContent] = match;
  const metadata: MarkdownMetadata = {};

  // Parse YAML-like frontmatter
  const lines = frontmatterString.split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      const cleanKey = key.trim() as keyof MarkdownMetadata;

      switch (cleanKey) {
        case 'tags':
          metadata[cleanKey] = value.split(',').map(tag => tag.trim());
          break;
        case 'draft':
        case 'featured':
          metadata[cleanKey] = value.toLowerCase() === 'true';
          break;
        default:
          (metadata as Record<string, unknown>)[cleanKey] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  return { metadata, content: markdownContent };
}

/**
 * Generate table of contents from markdown content
 */
export function generateTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TableOfContentsItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const title = match[2].trim();
    const id = title.toLowerCase().replace(/[^\w]+/g, '-');

    headings.push({
      id,
      title,
      level,
      children: [],
    });
  }

  // Build hierarchical structure
  const toc: TableOfContentsItem[] = [];
  const stack: TableOfContentsItem[] = [];

  for (const heading of headings) {
    // Remove items from stack that are at same or deeper level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      toc.push(heading);
    } else {
      stack[stack.length - 1].children.push(heading);
    }

    stack.push(heading);
  }

  return toc;
}

/**
 * Calculate reading time based on word count
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = countWords(content);
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Count words in text content
 */
export function countWords(content: string): number {
  const text = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // Remove images
    .replace(/\[[^\]]*\]\([^)]*\)/g, '') // Remove links
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  return text ? text.split(' ').length : 0;
}

/**
 * Generate excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 200): string {
  const text = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // Remove images
    .replace(/\[[^\]]*\]\([^)]*\)/g, '') // Remove links
    .replace(/[#*_~`]/g, '') // Remove markdown formatting
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'strong',
      'em',
      'u',
      's',
      'code',
      'pre',
      'a',
      'img',
      'figure',
      'figcaption',
      'ul',
      'ol',
      'li',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'blockquote',
      'hr',
      'div',
      'span',
      'details',
      'summary',
    ],
    ALLOWED_ATTR: [
      'href',
      'target',
      'rel',
      'title',
      'src',
      'alt',
      'width',
      'height',
      'loading',
      'id',
      'class',
      'colspan',
      'rowspan',
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
  });
}

/**
 * Add custom markdown extensions
 */
export function addMarkdownExtensions() {
  // Add custom tokens for enhanced functionality

  // Callout/Alert boxes
  marked.use({
    extensions: [
      {
        name: 'callout',
        level: 'block',
        start(src: string) {
          return src.match(/^:::/)?.index;
        },
        tokenizer(src: string) {
          const rule = /^:::(info|warning|error|success)\s*\n([\s\S]*?)\n:::/;
          const match = rule.exec(src);
          if (match) {
            return {
              type: 'callout',
              raw: match[0],
              calloutType: match[1],
              content: match[2].trim(),
            };
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderer(token: any) {
          const type = token.calloutType;
          const icons = {
            info: 'ℹ️',
            warning: '⚠️',
            error: '❌',
            success: '✅',
          };

          return `<div class="callout callout-${type}">
          <div class="callout-header">
            <span class="callout-icon">${icons[type as keyof typeof icons] || 'ℹ️'}</span>
            <span class="callout-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
          </div>
          <div class="callout-content">${marked.parse(token.content)}</div>
        </div>`;
        },
      },
    ],
  });

  // Keyboard shortcuts
  marked.use({
    extensions: [
      {
        name: 'kbd',
        level: 'inline',
        start(src: string) {
          return src.match(/\[\[/)?.index;
        },
        tokenizer(src: string) {
          const rule = /^\[\[([^\]]+)\]\]/;
          const match = rule.exec(src);
          if (match) {
            return {
              type: 'kbd',
              raw: match[0],
              key: match[1],
            };
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderer(token: any) {
          return `<kbd class="keyboard-key">${token.key}</kbd>`;
        },
      },
    ],
  });
}

/**
 * Main markdown processing function
 */
export async function processMarkdown(rawContent: string): Promise<ProcessedMarkdown> {
  // Extract frontmatter
  const { metadata, content } = extractFrontmatter(rawContent);

  // Add markdown extensions
  addMarkdownExtensions();

  // Process markdown to HTML
  const htmlContent = await marked.parse(content);

  // Sanitize HTML
  const sanitizedContent = sanitizeHtml(htmlContent);

  // Generate additional metadata
  const wordCount = countWords(content);
  const readingTime = calculateReadingTime(content);
  const tableOfContents = generateTableOfContents(content);
  const excerpt = metadata.excerpt || generateExcerpt(content);

  // Merge metadata with calculated values
  const finalMetadata: MarkdownMetadata = {
    ...metadata,
    wordCount,
    readingTime,
  };

  return {
    content: sanitizedContent,
    metadata: finalMetadata,
    tableOfContents,
    excerpt,
    readingTime,
    wordCount,
  };
}

/**
 * Process multiple markdown files
 */
export async function processMarkdownFiles(
  files: { path: string; content: string }[]
): Promise<{ [path: string]: ProcessedMarkdown }> {
  const results: { [path: string]: ProcessedMarkdown } = {};

  for (const file of files) {
    try {
      results[file.path] = await processMarkdown(file.content);
    } catch (error) {
      console.error(`Error processing markdown file ${file.path}:`, error);
    }
  }

  return results;
}

/**
 * Validate markdown metadata
 */
export function validateMarkdownMetadata(metadata: MarkdownMetadata): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!metadata.title || metadata.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!metadata.description || metadata.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (metadata.date && isNaN(Date.parse(metadata.date))) {
    errors.push('Invalid date format');
  }

  if (metadata.tags && (!Array.isArray(metadata.tags) || metadata.tags.length === 0)) {
    errors.push('Tags should be a non-empty array');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Search through processed markdown content
 */
export function searchMarkdownContent(
  content: ProcessedMarkdown[],
  query: string,
  filters?: {
    tags?: string[];
    category?: string;
    author?: string;
    dateRange?: { start: Date; end: Date };
  }
): ProcessedMarkdown[] {
  const normalizedQuery = query.toLowerCase().trim();

  return content.filter(item => {
    // Text search
    const titleMatch = item.metadata.title?.toLowerCase().includes(normalizedQuery);
    const descriptionMatch = item.metadata.description?.toLowerCase().includes(normalizedQuery);
    const contentMatch = item.content.toLowerCase().includes(normalizedQuery);
    const tagsMatch = item.metadata.tags?.some(tag => tag.toLowerCase().includes(normalizedQuery));

    const textMatch = titleMatch || descriptionMatch || contentMatch || tagsMatch;

    if (!textMatch) return false;

    // Apply filters
    if (filters) {
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(filterTag =>
          item.metadata.tags?.includes(filterTag)
        );
        if (!hasMatchingTag) return false;
      }

      if (filters.category && item.metadata.category !== filters.category) {
        return false;
      }

      if (filters.author && item.metadata.author !== filters.author) {
        return false;
      }

      if (filters.dateRange && item.metadata.date) {
        const itemDate = new Date(item.metadata.date);
        if (itemDate < filters.dateRange.start || itemDate > filters.dateRange.end) {
          return false;
        }
      }
    }

    return true;
  });
}
