/**
 * Advanced SEO and structured data system
 * Implements comprehensive JSON-LD schemas for enhanced search visibility
 */

export interface StructuredDataConfig {
  organization: Organization;
  website: Website;
  breadcrumbs?: BreadcrumbList;
  person?: Person;
  article?: Article;
  portfolio?: CreativeWork[];
  tool?: SoftwareApplication[];
}

export interface Organization {
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
  contactPoint: ContactPoint;
  founder: Person;
}

export interface Website {
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  inLanguage: string;
  author: Person;
  potentialAction: SearchAction;
}

export interface Person {
  '@type': 'Person';
  name: string;
  url: string;
  image: string;
  jobTitle: string;
  worksFor: Organization;
  sameAs: string[];
  knowsAbout: string[];
  alumniOf?: EducationalOrganization[];
}

export interface Article {
  '@type': 'Article';
  headline: string;
  description: string;
  image: string;
  author: Person;
  publisher: Organization;
  datePublished: string;
  dateModified: string;
  mainEntityOfPage: string;
  articleSection: string;
  keywords: string[];
  wordCount: number;
}

export interface CreativeWork {
  '@type': 'CreativeWork';
  name: string;
  description: string;
  image: string;
  author: Person;
  dateCreated: string;
  genre: string;
  keywords: string[];
  license: string;
  programmingLanguage?: string;
  runtimePlatform?: string;
}

export interface SoftwareApplication {
  '@type': 'SoftwareApplication';
  name: string;
  description: string;
  applicationCategory: string;
  operatingSystem: string;
  author: Person;
  offers: Offer;
  aggregateRating?: AggregateRating;
  screenshot?: string[];
}

export interface BreadcrumbList {
  '@type': 'BreadcrumbList';
  itemListElement: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  '@type': 'ListItem';
  position: number;
  name: string;
  item: string;
}

export interface ContactPoint {
  '@type': 'ContactPoint';
  contactType: string;
  email: string;
  url: string;
}

export interface SearchAction {
  '@type': 'SearchAction';
  target: string;
  'query-input': string;
}

export interface EducationalOrganization {
  '@type': 'EducationalOrganization';
  name: string;
  url: string;
}

export interface Offer {
  '@type': 'Offer';
  price: string;
  priceCurrency: string;
  availability: string;
}

export interface AggregateRating {
  '@type': 'AggregateRating';
  ratingValue: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
}

/**
 * Default structured data configuration
 */
export const DEFAULT_STRUCTURED_DATA: StructuredDataConfig = {
  organization: {
    '@type': 'Organization',
    name: 'My Web 2025',
    url: 'https://my-web-2025.com',
    logo: 'https://my-web-2025.com/logo.png',
    sameAs: [
      'https://twitter.com/samuido',
      'https://github.com/samuido',
      'https://linkedin.com/in/samuido',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'contact@my-web-2025.com',
      url: 'https://my-web-2025.com/contact',
    },
    founder: {
      '@type': 'Person',
      name: 'samuido',
      url: 'https://my-web-2025.com/about',
      image: 'https://my-web-2025.com/profile.jpg',
      jobTitle: 'Full Stack Developer & Video Creator',
      worksFor: {
        '@type': 'Organization',
        name: 'My Web 2025',
        url: 'https://my-web-2025.com',
        logo: 'https://my-web-2025.com/logo.png',
        sameAs: [],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          email: 'contact@my-web-2025.com',
          url: 'https://my-web-2025.com/contact',
        },
        founder: {} as Person, // Circular reference handled in implementation
      },
      sameAs: [
        'https://twitter.com/samuido',
        'https://github.com/samuido',
        'https://linkedin.com/in/samuido',
      ],
      knowsAbout: [
        'Web Development',
        'React',
        'Next.js',
        'TypeScript',
        'Video Production',
        'After Effects',
        'Creative Development',
      ],
    },
  },
  website: {
    '@type': 'WebSite',
    name: 'My Web 2025',
    url: 'https://my-web-2025.com',
    description: 'Professional portfolio, creative tools, and workshop content featuring video production, web development, and interactive tools.',
    inLanguage: 'ja-JP',
    author: {
      '@type': 'Person',
      name: 'samuido',
      url: 'https://my-web-2025.com/about',
      image: 'https://my-web-2025.com/profile.jpg',
      jobTitle: 'Full Stack Developer & Video Creator',
      worksFor: {} as Organization, // Filled in implementation
      sameAs: [
        'https://twitter.com/samuido',
        'https://github.com/samuido',
        'https://linkedin.com/in/samuido',
      ],
      knowsAbout: [
        'Web Development',
        'React',
        'Next.js',
        'TypeScript',
        'Video Production',
        'After Effects',
        'Creative Development',
      ],
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://my-web-2025.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },
};

/**
 * Generate structured data for a page
 */
export function generateStructuredData(config: Partial<StructuredDataConfig> = {}): string {
  const finalConfig = mergeConfig(DEFAULT_STRUCTURED_DATA, config);
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      finalConfig.organization,
      finalConfig.website,
      ...(finalConfig.breadcrumbs ? [finalConfig.breadcrumbs] : []),
      ...(finalConfig.person ? [finalConfig.person] : []),
      ...(finalConfig.article ? [finalConfig.article] : []),
      ...(finalConfig.portfolio || []),
      ...(finalConfig.tool || []),
    ],
  };

  return JSON.stringify(structuredData, null, 2);
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbs(items: Array<{ name: string; url: string }>): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate article structured data
 */
export function generateArticle(data: {
  title: string;
  description: string;
  image: string;
  publishDate: string;
  modifyDate: string;
  url: string;
  category: string;
  keywords: string[];
  wordCount: number;
}): Article {
  return {
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    image: data.image,
    author: DEFAULT_STRUCTURED_DATA.organization.founder,
    publisher: DEFAULT_STRUCTURED_DATA.organization,
    datePublished: data.publishDate,
    dateModified: data.modifyDate,
    mainEntityOfPage: data.url,
    articleSection: data.category,
    keywords: data.keywords,
    wordCount: data.wordCount,
  };
}

/**
 * Generate portfolio item structured data
 */
export function generatePortfolioItem(data: {
  name: string;
  description: string;
  image: string;
  dateCreated: string;
  genre: string;
  keywords: string[];
  license: string;
  programmingLanguage?: string;
  runtimePlatform?: string;
}): CreativeWork {
  return {
    '@type': 'CreativeWork',
    name: data.name,
    description: data.description,
    image: data.image,
    author: DEFAULT_STRUCTURED_DATA.organization.founder,
    dateCreated: data.dateCreated,
    genre: data.genre,
    keywords: data.keywords,
    license: data.license,
    programmingLanguage: data.programmingLanguage,
    runtimePlatform: data.runtimePlatform,
  };
}

/**
 * Generate tool structured data
 */
export function generateTool(data: {
  name: string;
  description: string;
  category: string;
  operatingSystem: string;
  price: string;
  priceCurrency: string;
  availability: string;
  rating?: {
    value: number;
    count: number;
    best: number;
    worst: number;
  };
  screenshots?: string[];
}): SoftwareApplication {
  const tool: SoftwareApplication = {
    '@type': 'SoftwareApplication',
    name: data.name,
    description: data.description,
    applicationCategory: data.category,
    operatingSystem: data.operatingSystem,
    author: DEFAULT_STRUCTURED_DATA.organization.founder,
    offers: {
      '@type': 'Offer',
      price: data.price,
      priceCurrency: data.priceCurrency,
      availability: data.availability,
    },
  };

  if (data.rating) {
    tool.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.rating.value,
      reviewCount: data.rating.count,
      bestRating: data.rating.best,
      worstRating: data.rating.worst,
    };
  }

  if (data.screenshots) {
    tool.screenshot = data.screenshots;
  }

  return tool;
}

/**
 * Merge structured data configurations
 */
function mergeConfig(
  base: StructuredDataConfig,
  override: Partial<StructuredDataConfig>
): StructuredDataConfig {
  return {
    ...base,
    ...override,
    organization: { ...base.organization, ...override.organization },
    website: { ...base.website, ...override.website },
    person: override.person || base.person,
    article: override.article || base.article,
    breadcrumbs: override.breadcrumbs || base.breadcrumbs,
    portfolio: override.portfolio || base.portfolio,
    tool: override.tool || base.tool,
  };
}

/**
 * Inject structured data into page head
 */
export function injectStructuredData(structuredData: string): void {
  if (typeof document === 'undefined') return;

  // Remove existing structured data
  const existingScript = document.querySelector('script[data-structured-data]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create new structured data script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-structured-data', 'true');
  script.textContent = structuredData;

  document.head.appendChild(script);
}

/**
 * Generate sitemap.xml content
 */
export function generateSitemap(urls: Array<{
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}>): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://my-web-2025.com';
  
  const urlEntries = urls.map(entry => `
    <url>
      <loc>${baseUrl}${entry.url}</loc>
      ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
      ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
      ${entry.priority ? `<priority>${entry.priority}</priority>` : ''}
    </url>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlEntries}
</urlset>`;
}

/**
 * Generate RSS feed content
 */
export function generateRSSFeed(items: Array<{
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category: string;
  author: string;
}>): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://my-web-2025.com';
  
  const itemEntries = items.map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.description}]]></description>
      <link>${baseUrl}${item.link}</link>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <category><![CDATA[${item.category}]]></category>
      <author><![CDATA[${item.author}]]></author>
      <guid isPermaLink="true">${baseUrl}${item.link}</guid>
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>My Web 2025 - Portfolio & Tools</title>
    <description>Professional portfolio, creative tools, and workshop content</description>
    <link>${baseUrl}</link>
    <language>ja-jp</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${itemEntries}
  </channel>
</rss>`;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://my-web-2025.com';
  
  return `User-agent: *
Allow: /

# Disallow admin pages in production
User-agent: *
Disallow: /admin/

# Allow Google and Bing bots for admin (for testing)
User-agent: Googlebot
Allow: /admin/

User-agent: Bingbot
Allow: /admin/

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1`;
}

/**
 * Validate structured data
 */
export function validateStructuredData(data: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const parsed = JSON.parse(data);
    
    // Check for required fields
    if (!parsed['@context']) {
      errors.push('Missing @context');
    }
    
    if (!parsed['@graph'] && !parsed['@type']) {
      errors.push('Missing @graph or @type');
    }
    
    // Validate URLs
    const urlRegex = /^https?:\/\/.+/;
    const checkUrls = (obj: any) => {
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'url' && typeof value === 'string' && !urlRegex.test(value)) {
          errors.push(`Invalid URL: ${value}`);
        }
        if (typeof value === 'object' && value !== null) {
          checkUrls(value);
        }
      }
    };
    
    checkUrls(parsed);
    
  } catch (error) {
    errors.push(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}