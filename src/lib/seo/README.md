# Comprehensive SEO Utilities

This directory contains a complete set of SEO utilities for the samuido website, implementing comprehensive SEO optimization including structured data, metadata generation, sitemap management, canonical URLs, and validation.

## Features

### ✅ Completed SEO Optimizations

1. **Structured Data Markup** - Complete JSON-LD structured data for all content types
2. **XML Sitemaps** - Dynamic sitemap generation with proper priorities and frequencies
3. **Open Graph & Twitter Cards** - Complete social media meta tags
4. **Canonical URLs** - Proper canonical URL structure and validation
5. **Robots.txt** - Enhanced robots.txt with AI crawler support
6. **SEO Validation** - Comprehensive validation and scoring system

## File Structure

```
src/lib/seo/
├── index.ts                    # Main exports and configurations
├── structured-data.ts          # JSON-LD structured data generation
├── metadata.ts                 # Next.js Metadata generation
├── sitemap-generator.ts        # Enhanced sitemap generation
├── canonical.ts                # Canonical URL management
├── validation.ts               # SEO validation utilities
├── README.md                   # This documentation
└── __tests__/                  # Comprehensive test suite
    ├── structured-data.test.ts
    ├── metadata.test.ts
    └── validation.test.ts
```

## Usage Examples

### 1. Basic Page Metadata

```typescript
import { generateBaseMetadata } from "@/lib/seo";

export const metadata = generateBaseMetadata({
  title: "Page Title",
  description: "Page description",
  keywords: ["keyword1", "keyword2"],
  path: "/page-path",
});
```

### 2. Portfolio Item Metadata

```typescript
import { generatePortfolioMetadata } from "@/lib/seo";

export const metadata = generatePortfolioMetadata(portfolioItem);
```

### 3. Tool Page with Structured Data

```typescript
import {
  generateToolMetadata,
  generateWebApplicationStructuredData,
} from "@/lib/seo";

export const metadata = generateToolMetadata({
  name: "Tool Name",
  description: "Tool description",
  keywords: ["tool", "utility"],
  path: "/tools/tool-name",
});

const structuredData = generateWebApplicationStructuredData({
  name: "Tool Name",
  description: "Tool description",
  url: "https://yusuke-kim.com/tools/tool-name",
  category: "utility",
  features: ["Feature 1", "Feature 2"],
});
```

### 4. SEO Validation

```typescript
import { validateMetadata, generateSEOReport } from "@/lib/seo";

const validation = validateMetadata(metadata);
const report = generateSEOReport(metadata, structuredData);

console.log(`SEO Score: ${report.overall.score}/100`);
```

## Structured Data Types

### Supported Schema.org Types

- **WebSite** - Main site information
- **Person** - Profile pages
- **CreativeWork** - Portfolio items
- **SoftwareApplication** - Development projects and plugins
- **VideoObject** - Video content
- **Article** - Blog posts
- **WebApplication** - Tools and utilities
- **BreadcrumbList** - Navigation breadcrumbs
- **CollectionPage** - Gallery pages
- **FAQPage** - Help and FAQ content
- **ContactPage** - Contact information
- **SearchResultsPage** - Search results

### Example Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Color Palette Generator",
  "description": "Generate random color palettes with HSV range settings",
  "url": "https://yusuke-kim.com/tools/color-palette",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "isAccessibleForFree": true,
  "author": {
    "@type": "Person",
    "name": "木村友亮",
    "url": "https://yusuke-kim.com/about"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  }
}
```

## Sitemap Configuration

### Priority Guidelines

- **1.0** - Home page
- **0.9** - Main section pages (About, Portfolio, Workshop, Tools)
- **0.8** - High-traffic pages (galleries, popular tools, contact)
- **0.7** - Content detail pages (portfolio items, blog posts)
- **0.6** - Secondary pages (playground, less popular tools)
- **0.5** - Utility pages (search, analytics)
- **0.3** - Legal pages (privacy policy)

### Change Frequency Guidelines

- **weekly** - Home page, main galleries, blog section
- **monthly** - Most content pages, tools, about sections
- **yearly** - Legal pages, rarely updated content

## Canonical URL Management

### URL Structure Rules

- Always HTTPS
- No trailing slashes (except root)
- No query parameters or fragments
- Consistent domain (yusuke-kim.com)

### Examples

```typescript
import { generateCanonicalUrl, generateContentCanonicalUrl } from "@/lib/seo";

// Basic page
const canonical = generateCanonicalUrl("/about");
// Result: "https://yusuke-kim.com/about"

// Content item
const portfolioCanonical = generateContentCanonicalUrl("portfolio", "item-id");
// Result: "https://yusuke-kim.com/portfolio/item-id"
```

## SEO Validation

### Validation Criteria

#### Title Validation

- Required field
- Maximum 60 characters (warning if exceeded)
- Minimum 10 characters (warning if less)
- No duplicate words (warning)

#### Description Validation

- Required field
- Maximum 160 characters (warning if exceeded)
- Minimum 120 characters (warning if less)
- Should include action words (warning if missing)

#### Keywords Validation

- Maximum 10 keywords (warning if exceeded)
- No duplicates (warning)
- Maximum 30 characters per keyword (warning if exceeded)

#### Open Graph Validation

- Required properties: title, description, type, url, images
- Image aspect ratio should be 1.91:1 (1200x630 recommended)
- Images should be absolute URLs

#### Twitter Card Validation

- Required properties: card, title, description, images
- Valid card types: summary, summary_large_image, app, player

### Scoring System

- **100** - Perfect score
- **-10 points** per error
- **-2 points** per warning
- **Minimum 0** points

## Configuration

### Default Configurations

```typescript
export const SEO_CONSTANTS = {
  SITE_NAME: "samuido",
  BASE_URL: "https://yusuke-kim.com",
  DEFAULT_TITLE: "samuidoのサイトルート",
  DEFAULT_DESCRIPTION: "フロントエンドエンジニアsamuidoの個人サイト...",
  AUTHOR: {
    name: "samuido",
    realName: "木村友亮",
    twitter: "@361do_sleep",
    email: "rebuild.up.up@gmail.com",
  },
  IMAGES: {
    ogImage: "/images/og-image.jpg",
    twitterImage: "/images/twitter-image.jpg",
    favicon: "/favicon.ico",
  },
};
```

## Testing

### Running Tests

```bash
npm test -- src/lib/seo/__tests__/
```

### Test Coverage

- **Structured Data Generation** - All schema types and configurations
- **Metadata Generation** - All page types and edge cases
- **SEO Validation** - All validation rules and scoring
- **Error Handling** - Invalid inputs and edge cases

## Integration with Existing Pages

### Before (Manual Implementation)

```typescript
export const metadata = {
  title: "Page Title",
  description: "Page description",
  // ... manual Open Graph setup
  // ... manual Twitter Card setup
};

// Manual structured data
const structuredData = {
  "@context": "https://schema.org",
  // ... manual schema setup
};
```

### After (Using SEO Utilities)

```typescript
import {
  generateToolMetadata,
  generateWebApplicationStructuredData,
} from "@/lib/seo";

export const metadata = generateToolMetadata({
  name: "Tool Name",
  description: "Tool description",
  keywords: ["tool"],
  path: "/tools/tool-name",
});

const structuredData = generateWebApplicationStructuredData({
  name: "Tool Name",
  description: "Tool description",
  url: "https://yusuke-kim.com/tools/tool-name",
  category: "utility",
  features: ["Feature 1", "Feature 2"],
});
```

## Benefits

1. **Consistency** - Uniform SEO implementation across all pages
2. **Maintainability** - Centralized SEO logic, easy to update
3. **Type Safety** - Full TypeScript support with proper types
4. **Validation** - Built-in SEO validation and scoring
5. **Performance** - Optimized metadata and structured data generation
6. **Standards Compliance** - Follows Schema.org and OpenGraph standards
7. **Search Engine Optimization** - Comprehensive SEO coverage
8. **Social Media Optimization** - Proper Open Graph and Twitter Cards
9. **Testing** - Comprehensive test coverage for reliability
10. **Documentation** - Well-documented with examples

## Future Enhancements

- **Internationalization** - Multi-language SEO support
- **Rich Snippets** - Additional schema types (FAQ, HowTo, etc.)
- **Performance Monitoring** - SEO performance tracking
- **A/B Testing** - SEO metadata testing capabilities
- **Automated Optimization** - AI-powered SEO suggestions

## Compliance

- **Schema.org** - Latest structured data standards
- **Open Graph Protocol** - Complete social media optimization
- **Twitter Cards** - Proper Twitter integration
- **Google Guidelines** - Follows Google SEO best practices
- **Accessibility** - WCAG 2.1 AA compliant metadata
- **Performance** - Core Web Vitals optimized
