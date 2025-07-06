import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Palette, Video, Image, Eye, Heart, Award } from 'lucide-react';
import { ContentItem } from '@/types/content';
import portfolioData from '@/data/portfolio.json';

export const metadata: Metadata = {
  title: 'Video & Design Portfolio - samuido | 映像・デザインギャラリー',
  description:
    'Webデザイナー・開発者木村友亮の映像・デザイン作品。ブランドアイデンティティ、モーショングラフィックス、ビジュアルデザインの制作実績。',
  keywords: [
    '映像デザイン',
    'ビジュアルデザイン',
    'ブランドデザイン',
    'モーショングラフィックス',
    'グラフィックデザイン',
    'クリエイティブ',
    'ビジュアルアイデンティティ',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Video & Design Portfolio - samuido | 映像・デザインギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の映像・デザイン作品。ブランドアイデンティティ、モーショングラフィックス、ビジュアルデザインの制作実績。',
    type: 'website',
    url: '/portfolio/gallery/video&design',
    images: [
      {
        url: '/portfolio-videodesign-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Video & Design Portfolio - samuido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video & Design Portfolio - samuido | 映像・デザインギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の映像・デザイン作品。ブランドアイデンティティ、モーショングラフィックス、ビジュアルデザインの制作実績。',
    images: ['/portfolio-videodesign-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const videoDesignPortfolioItems = (portfolioData as ContentItem[]).filter(
  item => item.category === 'video&design'
);

const designTypes = [
  { id: 'all', label: 'All Projects', count: videoDesignPortfolioItems.length },
  { id: 'brand-identity', label: 'Brand Identity', count: 1 },
  { id: 'motion-graphics', label: 'Motion Graphics', count: 1 },
  { id: 'visual-design', label: 'Visual Design', count: 0 },
  { id: 'ui-design', label: 'UI Design', count: 0 },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  });
}

function getDesignTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    'Brand Identity': 'bg-yellow-500/20 text-yellow-700',
    'Motion Graphics': 'bg-purple-500/20 text-purple-700',
    'Logo Design': 'bg-blue-500/20 text-blue-700',
    'Typography': 'bg-green-500/20 text-green-700',
    'Brand Guidelines': 'bg-indigo-500/20 text-indigo-700',
    'Animation': 'bg-pink-500/20 text-pink-700',
    'Visual Effects': 'bg-red-500/20 text-red-700',
    'Cinema 4D': 'bg-orange-500/20 text-orange-700',
  };
  return colorMap[type] || 'bg-gray-500/20 text-gray-700';
}

// Masonry-style layout helper
function getMasonryItemClass(index: number): string {
  const patterns = [
    'row-span-2', // tall
    'row-span-1', // normal
    'row-span-3', // extra tall
    'row-span-1', // normal
    'row-span-2', // tall
    'row-span-1', // normal
  ];
  return patterns[index % patterns.length];
}

export default function VideoDesignPortfolioPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Video & Design Portfolio - samuido',
    description: 'Webデザイナー・開発者木村友亮の映像・デザイン作品ギャラリー',
    url: 'https://yusuke-kim.com/portfolio/gallery/video&design',
    mainEntity: {
      '@type': 'ItemList',
      name: '映像・デザイン作品一覧',
      description: 'ブランドアイデンティティ、モーショングラフィックス、ビジュアルデザイン',
      numberOfItems: videoDesignPortfolioItems.length,
      itemListElement: videoDesignPortfolioItems.map((item, index) => ({
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
          ...(item.images && item.images[0] && {
            image: item.images[0],
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
        <header className="border-foreground/20 border-b bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-red-500/10 px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-primary/20 p-3 rounded-lg">
                <Palette size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="neue-haas-grotesk-display text-primary mb-2 text-4xl md:text-6xl">
                  Video & Design
                </h1>
                <p className="zen-kaku-gothic-new text-primary/80 text-xl">
                  映像・デザインギャラリー
                </p>
              </div>
            </div>
            
            <p className="noto-sans-jp text-foreground/80 mb-8 text-lg leading-relaxed max-w-3xl">
              映像に加えて画像デザイン、Webデザインなど、デザインスキルを強調した
              クリエイティブギャラリー。縦3列表示、動的サイズ、ホバー表示で
              デザインコンセプトと制作意図を重視した表示を行います。
            </p>

            {/* Design Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {videoDesignPortfolioItems.length}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Design Projects</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {new Set(videoDesignPortfolioItems.flatMap(item => item.tags)).size}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Design Skills</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {videoDesignPortfolioItems.reduce((sum, item) => sum + (item.stats?.views || 0), 0)}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Total Views</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {videoDesignPortfolioItems.reduce((sum, item) => sum + (item.images?.length || 0), 0)}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Design Assets</div>
              </div>
            </div>
          </div>
        </header>

        {/* Design Type Filter */}
        <section className="border-foreground/20 border-b bg-gray/50 px-4 py-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
              Design Categories
            </h2>
            <div className="flex flex-wrap gap-2">
              {designTypes.map(type => (
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

        {/* Creative Portfolio Grid - Masonry/Pinterest Style */}
        <main className="mx-auto max-w-7xl px-4 py-12">
          {/* Featured Projects */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
              Featured Design Projects
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto gap-6">
              {videoDesignPortfolioItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`group ${getMasonryItemClass(index)}`}
                >
                  <Link href={`/portfolio/${item.id}`}>
                    <div className="bg-gray/50 border border-foreground/20 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
                      {/* Main Image */}
                      <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Palette size={48} className="text-primary/60" />
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between text-white">
                              <div className="flex items-center space-x-2">
                                <Eye size={16} />
                                <span className="text-sm">{item.stats?.views || 0}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Heart size={16} />
                                <span className="text-sm">{item.stats?.likes || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-yellow-500/90 text-black rounded-full px-3 py-1 text-xs font-medium">
                            {item.category === 'video&design' ? 'Design' : item.category}
                          </span>
                        </div>

                        {/* Video Indicator */}
                        {item.videos && item.videos.length > 0 && (
                          <div className="absolute top-3 right-3">
                            <div className="bg-black/60 text-white rounded-full p-2">
                              <Video size={16} />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Project Info */}
                      <div className="p-6">
                        <div className="mb-3">
                          <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg font-semibold transition-colors line-clamp-2">
                            {item.title}
                          </h3>
                          <p className="noto-sans-jp text-foreground/70 text-sm leading-relaxed line-clamp-3">
                            {item.description}
                          </p>
                        </div>

                        {/* Design Tags */}
                        <div className="mb-4 flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className={`rounded px-2 py-1 text-xs ${getDesignTypeColor(tag)}`}
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-foreground/60 text-xs self-center">
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-foreground/60">
                          <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                          <div className="flex items-center space-x-3">
                            {item.images && item.images.length > 1 && (
                              <div className="flex items-center space-x-1">
                                <Image size={12} />
                                <span>{item.images.length}</span>
                              </div>
                            )}
                            {item.videos && item.videos.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Video size={12} />
                                <span>{item.videos.length}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Design Process Showcase */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
              Design Process & Approach
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="bg-yellow-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Award size={32} className="text-yellow-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Concept Development
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Creative ideation and strategic thinking
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="bg-purple-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Palette size={32} className="text-purple-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Visual Design
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Color theory and aesthetic execution
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="bg-blue-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Video size={32} className="text-blue-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Motion Graphics
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Dynamic animation and visual effects
                </p>
              </div>
              
              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="bg-green-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Image size={32} className="text-green-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Brand Systems
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Cohesive identity and guidelines
                </p>
              </div>
            </div>
          </section>

          {/* Skills & Tools */}
          <section className="border-t border-foreground/20 pt-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
              Design Tools & Expertise
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                  Visual Design
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Adobe Illustrator', 'Adobe Photoshop', 'Figma', 'Sketch'].map(tool => (
                    <span
                      key={tool}
                      className="bg-gray-500/20 text-gray-700 rounded px-3 py-1 text-sm"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                  Motion Graphics
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {['After Effects', 'Cinema 4D', 'Premiere Pro'].map(tool => (
                    <span
                      key={tool}
                      className="bg-gray-500/20 text-gray-700 rounded px-3 py-1 text-sm"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                  Brand Design
                </h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Brand Strategy', 'Logo Design', 'Typography', 'Color Theory'].map(skill => (
                    <span
                      key={skill}
                      className="bg-gray-500/20 text-gray-700 rounded px-3 py-1 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
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