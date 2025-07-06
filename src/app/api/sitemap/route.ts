import { NextRequest, NextResponse } from 'next/server';
import { generateSitemap } from '@/lib/seo/structured-data';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Load dynamic content for sitemap generation
 */
function loadDynamicContent(): {
  portfolio: any[];
  blog: any[];
  tools: any[];
  plugins: any[];
} {
  const dataDir = join(process.cwd(), 'public', 'data', 'content');
  
  try {
    const portfolio = JSON.parse(readFileSync(join(dataDir, 'portfolio.json'), 'utf-8'));
    const blog = JSON.parse(readFileSync(join(dataDir, 'blog.json'), 'utf-8'));
    const tools = JSON.parse(readFileSync(join(dataDir, 'tool.json'), 'utf-8'));
    const plugins = JSON.parse(readFileSync(join(dataDir, 'plugin.json'), 'utf-8'));

    return { portfolio, blog, tools, plugins };
  } catch (error) {
    console.warn('Failed to load dynamic content for sitemap:', error);
    return { portfolio: [], blog: [], tools: [], plugins: [] };
  }
}

/**
 * Generate comprehensive sitemap entries
 */
function generateSitemapEntries(): SitemapEntry[] {
  const { portfolio, blog, tools, plugins } = loadDynamicContent();
  
  const staticPages: SitemapEntry[] = [
    // Main pages
    { url: '/', lastmod: '2025-01-01', changefreq: 'weekly', priority: 1.0 },
    { url: '/about', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.9 },
    { url: '/portfolio', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.9 },
    { url: '/tools', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.9 },
    { url: '/workshop', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.9 },
    { url: '/contact', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.8 },
    { url: '/search', lastmod: '2025-01-01', changefreq: 'yearly', priority: 0.6 },
    { url: '/privacy-policy', lastmod: '2025-01-01', changefreq: 'yearly', priority: 0.3 },

    // About subpages
    { url: '/about/profile/real', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.7 },
    { url: '/about/profile/handle', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.7 },
    { url: '/about/profile/AI', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.7 },
    { url: '/about/card/real', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.6 },
    { url: '/about/card/handle', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.6 },
    { url: '/about/commission/develop', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.7 },
    { url: '/about/commission/video', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.7 },
    { url: '/about/commission/estimate', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.6 },
    { url: '/about/links', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.6 },

    // Portfolio subpages
    { url: '/portfolio/gallery/all', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.8 },
    { url: '/portfolio/gallery/develop', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.8 },
    { url: '/portfolio/gallery/video', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.8 },
    { url: '/portfolio/gallery/video&design', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.8 },
    { url: '/portfolio/playground/design', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.6 },
    { url: '/portfolio/playground/WebGL', lastmod: '2025-01-01', changefreq: 'monthly', priority: 0.6 },

    // Workshop subpages
    { url: '/workshop/blog', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.8 },
    { url: '/workshop/plugins', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.8 },
    { url: '/workshop/downloads', lastmod: '2025-01-01', changefreq: 'weekly', priority: 0.8 },

    // Admin (only in development)
    ...(process.env.NODE_ENV === 'development' ? [
      { url: '/admin', lastmod: '2025-01-01', changefreq: 'never', priority: 0.1 },
      { url: '/admin/data-manager', lastmod: '2025-01-01', changefreq: 'never', priority: 0.1 },
    ] : []),
  ];

  // Dynamic portfolio pages
  const portfolioPages: SitemapEntry[] = portfolio.map(item => ({
    url: `/portfolio/${item.id}`,
    lastmod: item.updatedAt || item.createdAt || '2025-01-01',
    changefreq: 'monthly' as const,
    priority: 0.7,
  }));

  // Dynamic blog pages
  const blogPages: SitemapEntry[] = blog.map(item => ({
    url: `/workshop/blog/${item.id}`,
    lastmod: item.updatedAt || item.publishedAt || '2025-01-01',
    changefreq: 'weekly' as const,
    priority: 0.7,
  }));

  // Dynamic tool pages
  const toolPages: SitemapEntry[] = tools.map(item => ({
    url: `/tools/${item.id}`,
    lastmod: item.updatedAt || '2025-01-01',
    changefreq: 'monthly' as const,
    priority: 0.8,
  }));

  // Dynamic plugin pages
  const pluginPages: SitemapEntry[] = plugins.map(item => ({
    url: `/workshop/plugins/${item.id}`,
    lastmod: item.updatedAt || item.createdAt || '2025-01-01',
    changefreq: 'monthly' as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...portfolioPages,
    ...blogPages,
    ...toolPages,
    ...pluginPages,
  ];
}

/**
 * GET /api/sitemap
 * Generate and return sitemap.xml
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xml';

    const entries = generateSitemapEntries();

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: {
          entries,
          total: entries.length,
          lastGenerated: new Date().toISOString(),
        },
      });
    }

    // Generate XML sitemap
    const sitemapXml = generateSitemap(entries);

    return new NextResponse(sitemapXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate sitemap' },
      { status: 500 }
    );
  }
}

/**
 * Generate sitemap index for large sites (if needed)
 */
export function generateSitemapIndex(sitemaps: string[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://my-web-2025.com';
  
  const sitemapEntries = sitemaps.map(sitemap => `
    <sitemap>
      <loc>${baseUrl}${sitemap}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </sitemap>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
</sitemapindex>`;
}

/**
 * POST /api/sitemap
 * Manually trigger sitemap regeneration (for admin use)
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify admin access in production
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const entries = generateSitemapEntries();
    const sitemapXml = generateSitemap(entries);

    // You could save the sitemap to a file here if needed
    // writeFileSync(join(process.cwd(), 'public', 'sitemap.xml'), sitemapXml);

    return NextResponse.json({
      success: true,
      message: 'Sitemap regenerated successfully',
      data: {
        entries: entries.length,
        lastGenerated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Sitemap regeneration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate sitemap' },
      { status: 500 }
    );
  }
}