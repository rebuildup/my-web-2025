import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Play, Clock, Film, Award, Eye } from 'lucide-react';
import { ContentItem } from '@/types/content';
import portfolioData from '@/data/portfolio.json';

export const metadata: Metadata = {
  title: 'Video Production Portfolio - samuido | 映像制作ギャラリー',
  description:
    'Webデザイナー・開発者木村友亮の映像制作作品。ミュージックビデオ、企業研修動画、プロモーション映像の制作実績をご紹介。',
  keywords: [
    '映像制作',
    'ビデオプロダクション',
    'ミュージックビデオ',
    '企業研修',
    'プロモーション映像',
    'After Effects',
    'Premiere Pro',
    'Motion Graphics',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Video Production Portfolio - samuido | 映像制作ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の映像制作作品。ミュージックビデオ、企業研修動画、プロモーション映像の制作実績をご紹介。',
    type: 'website',
    url: '/portfolio/gallery/video',
    images: [
      {
        url: '/portfolio-video-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Video Production Portfolio - samuido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Production Portfolio - samuido | 映像制作ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の映像制作作品。ミュージックビデオ、企業研修動画、プロモーション映像の制作実績をご紹介。',
    images: ['/portfolio-video-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const videoPortfolioItems = (portfolioData as ContentItem[]).filter(
  item => item.category === 'video'
);

const videoTypes = [
  { id: 'all', label: 'All Videos', count: videoPortfolioItems.length },
  { id: 'music-video', label: 'Music Videos', count: 1 },
  { id: 'corporate', label: 'Corporate', count: 1 },
  { id: 'training', label: 'Training', count: 1 },
  { id: 'promotional', label: 'Promotional', count: 0 },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getVideoTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'Music Video': 'bg-purple-500/20 text-purple-700',
    'Corporate Training': 'bg-blue-500/20 text-blue-700',
    'Educational Video': 'bg-green-500/20 text-green-700',
    'Motion Graphics': 'bg-orange-500/20 text-orange-700',
    'Visual Effects': 'bg-red-500/20 text-red-700',
    'Cinematography': 'bg-indigo-500/20 text-indigo-700',
  };
  return colorMap[type] || 'bg-gray-500/20 text-gray-700';
}

export default function VideoPortfolioPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Video Production Portfolio - samuido',
    description: 'Webデザイナー・開発者木村友亮の映像制作作品ギャラリー',
    url: 'https://yusuke-kim.com/portfolio/gallery/video',
    mainEntity: {
      '@type': 'ItemList',
      name: '映像制作作品一覧',
      description: 'ミュージックビデオ、企業研修動画、プロモーション映像',
      numberOfItems: videoPortfolioItems.length,
      itemListElement: videoPortfolioItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'VideoObject',
          name: item.title,
          description: item.description,
          datePublished: item.publishedAt,
          author: {
            '@type': 'Person',
            name: '木村友亮',
            alternateName: 'samuido',
          },
          keywords: item.tags.join(', '),
          ...(item.videos && item.videos[0] && {
            embedUrl: item.videos[0].url,
            duration: `PT${item.videos[0].duration}S`,
            thumbnailUrl: item.videos[0].thumbnail,
          }),
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
        <header className="border-foreground/20 border-b bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-primary/20 p-3 rounded-lg">
                <Film size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="neue-haas-grotesk-display text-primary mb-2 text-4xl md:text-6xl">
                  Video Production
                </h1>
                <p className="zen-kaku-gothic-new text-primary/80 text-xl">
                  映像制作ギャラリー
                </p>
              </div>
            </div>
            
            <p className="noto-sans-jp text-foreground/80 mb-8 text-lg leading-relaxed max-w-3xl">
              依頼映像と個人制作映像をforiioライクなギャラリー表示でご紹介。
              ミュージックビデオ、企業研修動画、プロモーション映像など、
              制作過程と技術的詳細を重視した表示で映像制作のスキルをアピールします。
            </p>

            {/* Video Production Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {videoPortfolioItems.length}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Video Projects</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {videoPortfolioItems.reduce((sum, item) => 
                    sum + (item.videos?.reduce((videoSum, video) => videoSum + (video.duration || 0), 0) || 0), 0
                  )}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Total Minutes</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {videoPortfolioItems.reduce((sum, item) => sum + (item.stats?.views || 0), 0)}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Total Views</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {new Set(videoPortfolioItems.flatMap(item => item.tags)).size}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Techniques</div>
              </div>
            </div>
          </div>
        </header>

        {/* Video Type Filter */}
        <section className="border-foreground/20 border-b bg-gray/50 px-4 py-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
              Video Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {videoTypes.map(type => (
                <button
                  key={type.id}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${
                    type.id === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-foreground/10 text-foreground/70 hover:bg-foreground/20'
                  }`}
                >
                  {type.label} ({type.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Video Gallery - foriio-like Layout */}
        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="space-y-20">
            {videoPortfolioItems.map((item, index) => (
              <article
                key={item.id}
                className="group"
              >
                {/* Video Preview Section */}
                <div className="mb-8">
                  <Link href={`/portfolio/${item.id}`}>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                      {/* Video Thumbnail */}
                      <div className="absolute inset-0">
                        {item.videos && item.videos[0]?.thumbnail ? (
                          <img
                            src={item.videos[0].thumbnail}
                            alt={item.title}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-primary/20 to-primary/10 w-full h-full flex items-center justify-center">
                            <Film size={64} className="text-primary/60" />
                          </div>
                        )}
                      </div>

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/90 text-gray-800 rounded-full p-4 transform scale-100 group-hover:scale-110 transition-transform duration-300">
                          <Play size={32} fill="currentColor" />
                        </div>
                      </div>

                      {/* Video Info Overlay */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div className="flex items-center space-x-3">
                          {item.videos && item.videos[0]?.duration && (
                            <div className="bg-black/60 text-white rounded px-2 py-1 text-sm flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{formatDuration(item.videos[0].duration)}</span>
                            </div>
                          )}
                          <div className="bg-black/60 text-white rounded px-2 py-1 text-sm flex items-center space-x-1">
                            <Eye size={14} />
                            <span>{item.stats?.views || 0}</span>
                          </div>
                        </div>
                        
                        <div className="bg-black/60 text-white rounded px-2 py-1 text-sm">
                          {item.category === 'video' ? 'Video Production' : item.category}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Project Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Info */}
                  <div className="lg:col-span-2">
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-purple-500/20 text-purple-700 rounded-full px-3 py-1 text-sm font-medium">
                          Video Production
                        </span>
                        <span className="text-foreground/60 text-sm">
                          {formatDate(item.publishedAt || item.createdAt)}
                        </span>
                      </div>
                      
                      <Link href={`/portfolio/${item.id}`}>
                        <h2 className="neue-haas-grotesk-display text-foreground hover:text-primary mb-3 text-2xl md:text-3xl font-bold transition-colors">
                          {item.title}
                        </h2>
                      </Link>
                    </div>

                    <p className="noto-sans-jp text-foreground/80 mb-6 text-base leading-relaxed">
                      {item.description}
                    </p>

                    {/* Production Techniques */}
                    <div className="mb-6">
                      <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-sm font-medium">
                        Production Techniques:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map(tag => (
                          <span
                            key={tag}
                            className={`rounded px-3 py-1 text-sm ${getVideoTypeColor(tag)}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* External Links */}
                    {item.externalLinks && item.externalLinks.length > 0 && (
                      <div className="flex flex-wrap gap-4">
                        {item.externalLinks.map(link => (
                          <a
                            key={link.url}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 flex items-center space-x-2 text-sm transition-colors"
                          >
                            <Play size={16} />
                            <span>{link.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Production Details Sidebar */}
                  <div className="bg-gray/50 border border-foreground/20 rounded-lg p-6">
                    <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                      Production Details
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Duration */}
                      {item.videos && item.videos[0]?.duration && (
                        <div className="flex justify-between">
                          <span className="text-foreground/70 text-sm">Duration:</span>
                          <span className="text-foreground text-sm font-medium">
                            {formatDuration(item.videos[0].duration)}
                          </span>
                        </div>
                      )}
                      
                      {/* Views */}
                      <div className="flex justify-between">
                        <span className="text-foreground/70 text-sm">Views:</span>
                        <span className="text-foreground text-sm font-medium">
                          {item.stats?.views?.toLocaleString() || 0}
                        </span>
                      </div>
                      
                      {/* Engagement */}
                      <div className="flex justify-between">
                        <span className="text-foreground/70 text-sm">Likes:</span>
                        <span className="text-foreground text-sm font-medium">
                          {item.stats?.likes || 0}
                        </span>
                      </div>
                      
                      {/* Category */}
                      <div className="flex justify-between">
                        <span className="text-foreground/70 text-sm">Type:</span>
                        <span className="text-foreground text-sm font-medium">
                          Video Production
                        </span>
                      </div>
                      
                      {/* Status */}
                      <div className="flex justify-between">
                        <span className="text-foreground/70 text-sm">Status:</span>
                        <span className="text-green-600 text-sm font-medium">
                          Published
                        </span>
                      </div>
                    </div>

                    {/* Watch Button */}
                    <div className="mt-6">
                      <Link
                        href={`/portfolio/${item.id}`}
                        className="bg-primary text-white hover:bg-primary/90 w-full flex items-center justify-center space-x-2 rounded-lg py-3 transition-colors"
                      >
                        <Play size={16} fill="currentColor" />
                        <span>Watch Project</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Video Production Services */}
          <section className="mt-20 border-t border-foreground/20 pt-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
              Video Production Services
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-purple-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Film size={32} className="text-purple-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Music Videos
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Creative concept development and visual storytelling
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Award size={32} className="text-blue-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Corporate Training
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Educational content with interactive elements
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Play size={32} className="text-orange-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Motion Graphics
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Advanced animation and visual effects
                </p>
              </div>
            </div>
          </section>
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