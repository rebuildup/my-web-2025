import { NextRequest, NextResponse } from 'next/server';
import { generateRSSFeed } from '@/lib/seo/structured-data';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  category: string;
  author: string;
  guid?: string;
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
}

/**
 * Load content for RSS feed generation
 */
function loadRSSContent(): {
  blog: any[];
  portfolio: any[];
  plugins: any[];
} {
  const dataDir = join(process.cwd(), 'public', 'data', 'content');
  
  try {
    const blog = JSON.parse(readFileSync(join(dataDir, 'blog.json'), 'utf-8'));
    const portfolio = JSON.parse(readFileSync(join(dataDir, 'portfolio.json'), 'utf-8'));
    const plugins = JSON.parse(readFileSync(join(dataDir, 'plugin.json'), 'utf-8'));

    return { blog, portfolio, plugins };
  } catch (error) {
    console.warn('Failed to load content for RSS feed:', error);
    return { blog: [], portfolio: [], plugins: [] };
  }
}

/**
 * Generate RSS feed items from content
 */
function generateRSSItems(type?: string): RSSItem[] {
  const { blog, portfolio, plugins } = loadRSSContent();
  const items: RSSItem[] = [];

  // Blog posts
  if (!type || type === 'blog') {
    blog.forEach(post => {
      items.push({
        title: post.title,
        description: post.excerpt || post.description || '',
        link: `/workshop/blog/${post.id}`,
        pubDate: post.publishedAt || post.createdAt || '2025-01-01',
        category: post.category || 'ブログ',
        author: post.author || 'samuido',
        guid: `blog-${post.id}`,
      });
    });
  }

  // Portfolio items
  if (!type || type === 'portfolio') {
    portfolio.forEach(item => {
      items.push({
        title: item.title,
        description: item.description || '',
        link: `/portfolio/${item.id}`,
        pubDate: item.createdAt || '2025-01-01',
        category: item.category || 'ポートフォリオ',
        author: 'samuido',
        guid: `portfolio-${item.id}`,
        ...(item.image && {
          enclosure: {
            url: item.image,
            type: 'image/jpeg',
            length: 0, // Unknown length
          },
        }),
      });
    });
  }

  // Plugin releases
  if (!type || type === 'plugins') {
    plugins.forEach(plugin => {
      items.push({
        title: `${plugin.name} v${plugin.version}`,
        description: plugin.description || '',
        link: `/workshop/plugins/${plugin.id}`,
        pubDate: plugin.updatedAt || plugin.createdAt || '2025-01-01',
        category: 'プラグイン',
        author: 'samuido',
        guid: `plugin-${plugin.id}-${plugin.version}`,
      });
    });
  }

  // Sort by publication date (newest first)
  return items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

/**
 * GET /api/rss
 * Generate and return RSS feed
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // blog, portfolio, plugins, or null for all
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const format = searchParams.get('format') || 'xml';

    const allItems = generateRSSItems(type || undefined);
    const items = allItems.slice(0, limit);

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: {
          items,
          total: allItems.length,
          type: type || 'all',
          lastGenerated: new Date().toISOString(),
        },
      });
    }

    // Generate RSS XML
    const rssXml = generateRSSFeed(items);

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // Cache for 30 minutes
      },
    });
  } catch (error) {
    console.error('RSS feed generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate RSS feed' },
      { status: 500 }
    );
  }
}

/**
 * Generate specialized RSS feeds
 */
export function generateSpecializedFeed(type: 'blog' | 'portfolio' | 'plugins'): string {
  const items = generateRSSItems(type);
  
  const feedConfig = {
    blog: {
      title: 'My Web 2025 - ブログ',
      description: 'プログラミング、動画制作、クリエイティブ開発に関する記事',
    },
    portfolio: {
      title: 'My Web 2025 - ポートフォリオ',
      description: '最新の制作物と作品集',
    },
    plugins: {
      title: 'My Web 2025 - プラグイン',
      description: '最新のプラグインリリースとアップデート',
    },
  };

  const config = feedConfig[type];
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
      ${item.enclosure ? `
      <enclosure url="${item.enclosure.url}" type="${item.enclosure.type}" length="${item.enclosure.length}"/>
      ` : ''}
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.title}</title>
    <description>${config.description}</description>
    <link>${baseUrl}</link>
    <language>ja-jp</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss?type=${type}" rel="self" type="application/rss+xml"/>
    <generator>My Web 2025</generator>
    <webMaster>contact@my-web-2025.com (samuido)</webMaster>
    <managingEditor>contact@my-web-2025.com (samuido)</managingEditor>
    <copyright>© 2025 My Web 2025. All rights reserved.</copyright>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>${config.title}</title>
      <link>${baseUrl}</link>
      <width>144</width>
      <height>144</height>
    </image>
    ${itemEntries}
  </channel>
</rss>`;
}

/**
 * POST /api/rss
 * Manually trigger RSS feed regeneration (for admin use)
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

    const body = await request.json();
    const type = body.type as 'blog' | 'portfolio' | 'plugins' | undefined;

    const items = generateRSSItems(type);

    // You could save specialized feeds to files here if needed
    // const blogFeed = generateSpecializedFeed('blog');
    // writeFileSync(join(process.cwd(), 'public', 'blog.xml'), blogFeed);

    return NextResponse.json({
      success: true,
      message: 'RSS feed regenerated successfully',
      data: {
        items: items.length,
        type: type || 'all',
        lastGenerated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('RSS feed regeneration error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate RSS feed' },
      { status: 500 }
    );
  }
}

/**
 * Generate Atom feed (alternative format)
 */
export function generateAtomFeed(items: RSSItem[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://my-web-2025.com';
  
  const itemEntries = items.map(item => `
    <entry>
      <title type="html"><![CDATA[${item.title}]]></title>
      <link href="${baseUrl}${item.link}" rel="alternate" type="text/html"/>
      <id>${baseUrl}${item.link}</id>
      <published>${new Date(item.pubDate).toISOString()}</published>
      <updated>${new Date(item.pubDate).toISOString()}</updated>
      <summary type="html"><![CDATA[${item.description}]]></summary>
      <author>
        <name>${item.author}</name>
        <email>contact@my-web-2025.com</email>
      </author>
      <category term="${item.category}"/>
      ${item.enclosure ? `
      <link href="${item.enclosure.url}" rel="enclosure" type="${item.enclosure.type}" length="${item.enclosure.length}"/>
      ` : ''}
    </entry>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>My Web 2025 - Portfolio & Tools</title>
  <subtitle>Professional portfolio, creative tools, and workshop content</subtitle>
  <link href="${baseUrl}" rel="alternate" type="text/html"/>
  <link href="${baseUrl}/api/rss?format=atom" rel="self" type="application/atom+xml"/>
  <id>${baseUrl}/</id>
  <updated>${new Date().toISOString()}</updated>
  <author>
    <name>samuido</name>
    <email>contact@my-web-2025.com</email>
    <uri>${baseUrl}/about</uri>
  </author>
  <generator uri="${baseUrl}" version="1.0">My Web 2025</generator>
  <rights>© 2025 My Web 2025. All rights reserved.</rights>
  <logo>${baseUrl}/logo.png</logo>
  <icon>${baseUrl}/favicon.ico</icon>
  ${itemEntries}
</feed>`;
}