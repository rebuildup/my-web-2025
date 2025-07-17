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

export function addMarkdownExtensions() {
  const renderer = new marked.Renderer();
  // @ts-expect-error - marked.js types are not compatible with our usage
  renderer.heading = function (text, level) {
    const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<h${level} id="${escapedText}">${text}</h${level}>`;
  };
  marked.use({ renderer });
  marked.setOptions({ gfm: true });
}

export function extractFrontmatter(content: string): {
  metadata: MarkdownMetadata;
  content: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { metadata: {} as Record<string, unknown>, content };
  }

  const [, frontmatterString, markdownContent] = match;
  const metadata: MarkdownMetadata = {};
  const lines = frontmatterString.split('\n');
  for (const line of lines) {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      (metadata as Record<string, unknown>)[key.trim()] = value.replace(/^["']|["']$/g, '');
    }
  }
  return { metadata, content: markdownContent };
}

export function generateTableOfContents(content: string): TableOfContentsItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TableOfContentsItem[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      id: match[2].toLowerCase().replace(/[^\w]+/g, '-'),
      title: match[2].trim(),
      level: match[1].length,
      children: [],
    });
  }
  return headings;
}

export function countWords(content: string): number {
  if (!content) return 0;
  return content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ').length;
}

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = countWords(content);
  return Math.ceil(wordCount / wordsPerMinute);
}

export function generateExcerpt(content: string, maxLength: number = 200): string {
  const text = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}

export async function processMarkdown(rawContent: string): Promise<ProcessedMarkdown> {
  addMarkdownExtensions();
  const { metadata, content } = extractFrontmatter(rawContent);
  const htmlContent = await marked.parse(content);
  const sanitizedContent = sanitizeHtml(htmlContent as string);
  const wordCount = countWords(content);
  const readingTime = calculateReadingTime(content);
  const tableOfContents = generateTableOfContents(content);
  const excerpt = metadata.excerpt || generateExcerpt(content);
  const finalMetadata: MarkdownMetadata = { ...metadata, wordCount, readingTime };
  return {
    content: sanitizedContent,
    metadata: finalMetadata,
    tableOfContents,
    excerpt,
    readingTime,
    wordCount,
  };
}

export function validateMarkdownMetadata(metadata: MarkdownMetadata): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!metadata.title) errors.push('Title is required');
  if (!metadata.description) errors.push('Description is required');
  return { valid: errors.length === 0, errors };
}
