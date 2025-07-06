import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Search, Filter, Grid, List, Calendar, Eye, Heart, Share2 } from 'lucide-react';
import { ContentItem } from '@/types/content';
import portfolioData from '@/data/portfolio.json';

export const metadata: Metadata = {
  title: 'All Portfolio Works - samuido | 全作品ギャラリー',
  description:
    'Webデザイナー・開発者木村友亮の全作品を時系列で表示。フィルタリング、検索機能を備えた包括的なポートフォリオギャラリー。',
  keywords: [
    'ポートフォリオ',
    '全作品',
    'ギャラリー',
    'フィルタリング',
    '検索',
    'Webデザイン',
    '開発',
    '映像制作',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'All Portfolio Works - samuido | 全作品ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の全作品を時系列で表示。フィルタリング、検索機能を備えた包括的なポートフォリオギャラリー。',
    type: 'website',
    url: '/portfolio/gallery/all',
    images: [
      {
        url: '/portfolio-all-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'All Portfolio Works - samuido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Portfolio Works - samuido | 全作品ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の全作品を時系列で表示。フィルタリング、検索機能を備えた包括的なポートフォリオギャラリー。',
    images: ['/portfolio-all-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

interface FilterOptions {
  category: string;
  tags: string[];
  sortBy: 'newest' | 'oldest' | 'popular' | 'title';
  viewMode: 'grid' | 'list';
}

const portfolioItems = portfolioData as ContentItem[];

const categories = [
  { id: 'all', label: 'All Categories', count: portfolioItems.length },
  { id: 'develop', label: 'Development', count: portfolioItems.filter(item => item.category === 'develop').length },
  { id: 'video', label: 'Video', count: portfolioItems.filter(item => item.category === 'video').length },
  { id: 'video&design', label: 'Video & Design', count: portfolioItems.filter(item => item.category === 'video&design').length },
];

const allTags = Array.from(new Set(portfolioItems.flatMap(item => item.tags))).sort();

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatStats(stats: ContentItem['stats']): string {
  if (!stats) return '';
  return `${stats.views} views • ${stats.likes || 0} likes • ${stats.shares || 0} shares`;
}

export default function AllPortfolioPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Portfolio Works - samuido',
    description: 'Webデザイナー・開発者木村友亮の全作品ギャラリー',
    url: 'https://yusuke-kim.com/portfolio/gallery/all',
    mainEntity: {
      '@type': 'ItemList',
      name: '全作品一覧',
      description: 'Webサイト、アプリケーション、映像、デザイン作品のコレクション',
      numberOfItems: portfolioItems.length,
      itemListElement: portfolioItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: item.title,
          description: item.description,
          datePublished: item.publishedAt,
          author: {
            '@type': 'Person',
            name: '木村友亮',
            alternateName: 'samuido',
          },
          keywords: item.tags.join(', '),
        },
      })),
    },
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-gray min-h-screen">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/portfolio"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 flex items-center space-x-2 text-lg"
            >
              <ArrowLeft size={20} />
              <span>Portfolio</span>
            </Link>
          </div>
        </nav>

        {/* Header */}
        <header className="border-foreground/20 border-b px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
              All Portfolio Works
            </h1>
            <p className="noto-sans-jp text-foreground/80 mb-6 text-lg leading-relaxed">
              全作品を時系列で表示。フィルタリング、検索機能を使って作品を探索できます。
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Grid size={16} className="text-primary" />
                <span className="text-foreground/70">{portfolioItems.length} works</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-primary" />
                <span className="text-foreground/70">2024-2025</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye size={16} className="text-primary" />
                <span className="text-foreground/70">
                  {portfolioItems.reduce((sum, item) => sum + (item.stats?.views || 0), 0)} total views
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Filters and Controls */}
        <section className="border-foreground/20 border-b bg-gray/50 px-4 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-72">
                <Search size={20} className="text-foreground/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="作品を検索..."
                  className="border-foreground/20 bg-gray focus:border-primary w-full rounded border pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                {/* Category Filter */}
                <select className="border-foreground/20 bg-gray border rounded px-3 py-2 text-sm">
                  <option value="all">All Categories</option>
                  <option value="develop">Development</option>
                  <option value="video">Video</option>
                  <option value="video&design">Video & Design</option>
                </select>

                {/* Sort Options */}
                <select className="border-foreground/20 bg-gray border rounded px-3 py-2 text-sm">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="title">Title A-Z</option>
                </select>

                {/* View Mode */}
                <div className="border-foreground/20 flex rounded border">
                  <button className="bg-primary text-white px-3 py-2">
                    <Grid size={16} />
                  </button>
                  <button className="text-foreground/60 hover:text-foreground px-3 py-2">
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    category.id === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-foreground/10 text-foreground/70 hover:bg-foreground/20'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <main className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {portfolioItems.map(item => (
              <Link
                key={item.id}
                href={`/portfolio/${item.id}`}
                className="group border-foreground/20 bg-gray/50 hover:bg-gray overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-lg"
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-primary/60 text-4xl">
                        {item.category === 'develop' ? '⚡' : item.category === 'video' ? '🎬' : '🎨'}
                      </div>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary/90 text-white rounded-full px-2 py-1 text-xs font-medium">
                      {item.category}
                    </span>
                  </div>

                  {/* Stats Overlay */}
                  <div className="absolute bottom-2 right-2 flex space-x-2">
                    <div className="bg-black/60 text-white rounded px-2 py-1 text-xs flex items-center space-x-1">
                      <Eye size={12} />
                      <span>{item.stats?.views || 0}</span>
                    </div>
                    <div className="bg-black/60 text-white rounded px-2 py-1 text-xs flex items-center space-x-1">
                      <Heart size={12} />
                      <span>{item.stats?.likes || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg font-semibold transition-colors">
                      {item.title}
                    </h3>
                    <div className="text-foreground/60 text-xs">
                      {formatDate(item.publishedAt || item.createdAt)}
                    </div>
                  </div>

                  <p className="noto-sans-jp text-foreground/70 mb-4 text-sm leading-relaxed line-clamp-3">
                    {item.description}
                  </p>

                  {/* Tags */}
                  <div className="mb-4 flex flex-wrap gap-1">
                    {item.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="bg-primary/20 text-primary rounded px-2 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-foreground/60 text-xs">
                        +{item.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="text-foreground/60 text-xs">
                      {formatStats(item.stats)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.externalLinks && item.externalLinks.length > 0 && (
                        <div className="text-primary text-xs">
                          {item.externalLinks.length} link{item.externalLinks.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-12 text-center">
            <button className="border-primary text-primary hover:bg-primary hover:text-white rounded-lg border px-8 py-3 transition-colors">
              Load More Works
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido (木村友亮). All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
              Contact
            </Link>
            <Link href="/about" className="text-foreground/60 hover:text-primary text-sm">
              About
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}