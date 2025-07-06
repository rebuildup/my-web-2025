import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateStructuredData,
  generateBreadcrumbs,
  generateArticle,
  generatePortfolioItem,
  generateTool,
  injectStructuredData,
  generateSitemap,
  generateRSSFeed,
  generateRobotsTxt,
  validateStructuredData,
  DEFAULT_STRUCTURED_DATA,
} from './structured-data';

beforeEach(() => {
  vi.clearAllMocks();
  
  // Mock environment variables
  process.env.NEXT_PUBLIC_BASE_URL = 'https://test.com';
  
  // Mock document
  Object.defineProperty(global, 'document', {
    value: {
      querySelector: vi.fn(),
      createElement: vi.fn().mockReturnValue({
        type: '',
        setAttribute: vi.fn(),
        textContent: '',
        remove: vi.fn(),
      }),
      head: {
        appendChild: vi.fn(),
      },
    },
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.NEXT_PUBLIC_BASE_URL;
});

describe('Structured Data', () => {
  describe('DEFAULT_STRUCTURED_DATA', () => {
    it('should have valid organization data', () => {
      expect(DEFAULT_STRUCTURED_DATA.organization).toEqual({
        '@type': 'Organization',
        name: 'My Web 2025',
        url: 'https://my-web-2025.com',
        logo: 'https://my-web-2025.com/logo.png',
        sameAs: expect.arrayContaining([
          'https://twitter.com/samuido',
          'https://github.com/samuido',
          'https://linkedin.com/in/samuido',
        ]),
        contactPoint: expect.objectContaining({
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'contact@my-web-2025.com',
        }),
        founder: expect.objectContaining({
          '@type': 'Person',
          name: 'samuido',
        }),
      });
    });

    it('should have valid website data', () => {
      expect(DEFAULT_STRUCTURED_DATA.website).toEqual({
        '@type': 'WebSite',
        name: 'My Web 2025',
        url: 'https://my-web-2025.com',
        description: expect.any(String),
        inLanguage: 'ja-JP',
        author: expect.objectContaining({
          '@type': 'Person',
          name: 'samuido',
        }),
        potentialAction: expect.objectContaining({
          '@type': 'SearchAction',
          target: 'https://my-web-2025.com/search?q={search_term_string}',
        }),
      });
    });
  });

  describe('generateStructuredData', () => {
    it('should generate valid JSON-LD structure', () => {
      const result = generateStructuredData();
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        '@context': 'https://schema.org',
        '@graph': expect.arrayContaining([
          expect.objectContaining({ '@type': 'Organization' }),
          expect.objectContaining({ '@type': 'WebSite' }),
        ]),
      });
    });

    it('should merge custom configuration', () => {
      const customConfig = {
        organization: {
          name: 'Custom Organization',
        },
        breadcrumbs: {
          '@type': 'BreadcrumbList' as const,
          itemListElement: [
            {
              '@type': 'ListItem' as const,
              position: 1,
              name: 'Home',
              item: '/',
            },
          ],
        },
      };

      const result = generateStructuredData(customConfig);
      const parsed = JSON.parse(result);

      expect(parsed['@graph']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            '@type': 'Organization',
            name: 'Custom Organization',
          }),
          expect.objectContaining({
            '@type': 'BreadcrumbList',
          }),
        ])
      );
    });

    it('should include all provided entities', () => {
      const config = {
        article: {
          '@type': 'Article' as const,
          headline: 'Test Article',
          description: 'Test Description',
          image: 'test.jpg',
          author: DEFAULT_STRUCTURED_DATA.organization.founder,
          publisher: DEFAULT_STRUCTURED_DATA.organization,
          datePublished: '2025-01-01',
          dateModified: '2025-01-01',
          mainEntityOfPage: '/test',
          articleSection: 'Technology',
          keywords: ['test'],
          wordCount: 100,
        },
        portfolio: [
          {
            '@type': 'CreativeWork' as const,
            name: 'Test Portfolio',
            description: 'Test Description',
            image: 'test.jpg',
            author: DEFAULT_STRUCTURED_DATA.organization.founder,
            dateCreated: '2025-01-01',
            genre: 'Web Development',
            keywords: ['test'],
            license: 'MIT',
          },
        ],
      };

      const result = generateStructuredData(config);
      const parsed = JSON.parse(result);

      expect(parsed['@graph']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ '@type': 'Article' }),
          expect.objectContaining({ '@type': 'CreativeWork' }),
        ])
      );
    });
  });

  describe('generateBreadcrumbs', () => {
    it('should generate valid breadcrumb structure', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Portfolio', url: '/portfolio' },
        { name: 'Projects', url: '/portfolio/projects' },
      ];

      const result = generateBreadcrumbs(items);

      expect(result).toEqual({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: '/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Portfolio',
            item: '/portfolio',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Projects',
            item: '/portfolio/projects',
          },
        ],
      });
    });

    it('should handle empty items array', () => {
      const result = generateBreadcrumbs([]);

      expect(result).toEqual({
        '@type': 'BreadcrumbList',
        itemListElement: [],
      });
    });
  });

  describe('generateArticle', () => {
    it('should generate valid article structure', () => {
      const data = {
        title: 'Test Article',
        description: 'Test Description',
        image: 'test.jpg',
        publishDate: '2025-01-01',
        modifyDate: '2025-01-02',
        url: '/test-article',
        category: 'Technology',
        keywords: ['tech', 'test'],
        wordCount: 500,
      };

      const result = generateArticle(data);

      expect(result).toEqual({
        '@type': 'Article',
        headline: 'Test Article',
        description: 'Test Description',
        image: 'test.jpg',
        author: DEFAULT_STRUCTURED_DATA.organization.founder,
        publisher: DEFAULT_STRUCTURED_DATA.organization,
        datePublished: '2025-01-01',
        dateModified: '2025-01-02',
        mainEntityOfPage: '/test-article',
        articleSection: 'Technology',
        keywords: ['tech', 'test'],
        wordCount: 500,
      });
    });
  });

  describe('generatePortfolioItem', () => {
    it('should generate valid creative work structure', () => {
      const data = {
        name: 'Test Portfolio Item',
        description: 'Test Description',
        image: 'test.jpg',
        dateCreated: '2025-01-01',
        genre: 'Web Development',
        keywords: ['react', 'typescript'],
        license: 'MIT',
        programmingLanguage: 'TypeScript',
        runtimePlatform: 'Node.js',
      };

      const result = generatePortfolioItem(data);

      expect(result).toEqual({
        '@type': 'CreativeWork',
        name: 'Test Portfolio Item',
        description: 'Test Description',
        image: 'test.jpg',
        author: DEFAULT_STRUCTURED_DATA.organization.founder,
        dateCreated: '2025-01-01',
        genre: 'Web Development',
        keywords: ['react', 'typescript'],
        license: 'MIT',
        programmingLanguage: 'TypeScript',
        runtimePlatform: 'Node.js',
      });
    });

    it('should handle optional fields', () => {
      const data = {
        name: 'Test Portfolio Item',
        description: 'Test Description',
        image: 'test.jpg',
        dateCreated: '2025-01-01',
        genre: 'Web Development',
        keywords: ['react'],
        license: 'MIT',
      };

      const result = generatePortfolioItem(data);

      expect(result.programmingLanguage).toBeUndefined();
      expect(result.runtimePlatform).toBeUndefined();
    });
  });

  describe('generateTool', () => {
    it('should generate valid software application structure', () => {
      const data = {
        name: 'Test Tool',
        description: 'Test Description',
        category: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        rating: {
          value: 4.5,
          count: 100,
          best: 5,
          worst: 1,
        },
        screenshots: ['screenshot1.jpg', 'screenshot2.jpg'],
      };

      const result = generateTool(data);

      expect(result).toEqual({
        '@type': 'SoftwareApplication',
        name: 'Test Tool',
        description: 'Test Description',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        author: DEFAULT_STRUCTURED_DATA.organization.founder,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: 4.5,
          reviewCount: 100,
          bestRating: 5,
          worstRating: 1,
        },
        screenshot: ['screenshot1.jpg', 'screenshot2.jpg'],
      });
    });

    it('should handle optional rating and screenshots', () => {
      const data = {
        name: 'Test Tool',
        description: 'Test Description',
        category: 'DeveloperApplication',
        operatingSystem: 'Windows',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      };

      const result = generateTool(data);

      expect(result.aggregateRating).toBeUndefined();
      expect(result.screenshot).toBeUndefined();
    });
  });

  describe('injectStructuredData', () => {
    it('should inject structured data script into head', () => {
      const mockScript = {
        type: '',
        setAttribute: vi.fn(),
        textContent: '',
        remove: vi.fn(),
      };
      const mockDocument = global.document as any;
      mockDocument.querySelector.mockReturnValue(null);
      mockDocument.createElement.mockReturnValue(mockScript);

      const structuredData = '{"@context": "https://schema.org"}';
      injectStructuredData(structuredData);

      expect(mockDocument.createElement).toHaveBeenCalledWith('script');
      expect(mockScript.type).toBe('application/ld+json');
      expect(mockScript.setAttribute).toHaveBeenCalledWith('data-structured-data', 'true');
      expect(mockScript.textContent).toBe(structuredData);
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(mockScript);
    });

    it('should remove existing structured data before injecting new', () => {
      const mockExistingScript = { remove: vi.fn() };
      const mockNewScript = {
        type: '',
        setAttribute: vi.fn(),
        textContent: '',
        remove: vi.fn(),
      };
      const mockDocument = global.document as any;
      mockDocument.querySelector.mockReturnValue(mockExistingScript);
      mockDocument.createElement.mockReturnValue(mockNewScript);

      const structuredData = '{"@context": "https://schema.org"}';
      injectStructuredData(structuredData);

      expect(mockExistingScript.remove).toHaveBeenCalled();
      expect(mockDocument.head.appendChild).toHaveBeenCalledWith(mockNewScript);
    });

    it('should handle server-side environment', () => {
      Object.defineProperty(global, 'document', {
        value: undefined,
        writable: true,
      });

      expect(() => injectStructuredData('test')).not.toThrow();
    });
  });

  describe('generateSitemap', () => {
    it('should generate valid sitemap XML', () => {
      const urls = [
        { url: '/', lastmod: '2025-01-01', changefreq: 'daily' as const, priority: 1.0 },
        { url: '/about', changefreq: 'monthly' as const, priority: 0.8 },
        { url: '/portfolio' },
      ];

      const result = generateSitemap(urls);

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(result).toContain('<loc>https://test.com/</loc>');
      expect(result).toContain('<lastmod>2025-01-01</lastmod>');
      expect(result).toContain('<changefreq>daily</changefreq>');
      expect(result).toContain('<priority>1.0</priority>');
      expect(result).toContain('<loc>https://test.com/about</loc>');
      expect(result).toContain('<loc>https://test.com/portfolio</loc>');
    });

    it('should handle optional fields gracefully', () => {
      const urls = [{ url: '/minimal' }];
      const result = generateSitemap(urls);

      expect(result).toContain('<loc>https://test.com/minimal</loc>');
      expect(result).not.toContain('<lastmod>');
      expect(result).not.toContain('<changefreq>');
      expect(result).not.toContain('<priority>');
    });
  });

  describe('generateRSSFeed', () => {
    it('should generate valid RSS XML', () => {
      const items = [
        {
          title: 'Test Article',
          description: 'Test Description',
          link: '/test-article',
          pubDate: '2025-01-01',
          category: 'Technology',
          author: 'Test Author',
        },
      ];

      const result = generateRSSFeed(items);

      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(result).toContain('<rss version="2.0"');
      expect(result).toContain('<title>My Web 2025 - Portfolio & Tools</title>');
      expect(result).toContain('<title><![CDATA[Test Article]]></title>');
      expect(result).toContain('<link>https://test.com/test-article</link>');
      expect(result).toContain('<category><![CDATA[Technology]]></category>');
      expect(result).toContain('<author><![CDATA[Test Author]]></author>');
    });

    it('should handle multiple items', () => {
      const items = [
        {
          title: 'Article 1',
          description: 'Description 1',
          link: '/article-1',
          pubDate: '2025-01-01',
          category: 'Tech',
          author: 'Author 1',
        },
        {
          title: 'Article 2',
          description: 'Description 2',
          link: '/article-2',
          pubDate: '2025-01-02',
          category: 'Design',
          author: 'Author 2',
        },
      ];

      const result = generateRSSFeed(items);

      expect(result).toContain('Article 1');
      expect(result).toContain('Article 2');
    });
  });

  describe('generateRobotsTxt', () => {
    it('should generate valid robots.txt content', () => {
      const result = generateRobotsTxt();

      expect(result).toContain('User-agent: *');
      expect(result).toContain('Allow: /');
      expect(result).toContain('Disallow: /admin/');
      expect(result).toContain('Sitemap: https://test.com/sitemap.xml');
      expect(result).toContain('Crawl-delay: 1');
    });

    it('should handle missing base URL', () => {
      delete process.env.NEXT_PUBLIC_BASE_URL;
      const result = generateRobotsTxt();

      expect(result).toContain('Sitemap: https://my-web-2025.com/sitemap.xml');
    });
  });

  describe('validateStructuredData', () => {
    it('should validate correct structured data', () => {
      const validData = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
        url: 'https://test.com',
      });

      const result = validateStructuredData(validData);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing @context', () => {
      const invalidData = JSON.stringify({
        '@type': 'Organization',
        name: 'Test',
      });

      const result = validateStructuredData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing @context');
    });

    it('should detect missing @type and @graph', () => {
      const invalidData = JSON.stringify({
        '@context': 'https://schema.org',
        name: 'Test',
      });

      const result = validateStructuredData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing @graph or @type');
    });

    it('should detect invalid URLs', () => {
      const invalidData = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Test',
        url: 'invalid-url',
      });

      const result = validateStructuredData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid URL')])
      );
    });

    it('should detect invalid JSON', () => {
      const invalidData = '{ invalid json }';

      const result = validateStructuredData(invalidData);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid JSON')])
      );
    });

    it('should validate nested objects', () => {
      const dataWithNestedUrls = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        founder: {
          '@type': 'Person',
          url: 'invalid-url',
        },
      });

      const result = validateStructuredData(dataWithNestedUrls);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('Invalid URL')])
      );
    });
  });
});