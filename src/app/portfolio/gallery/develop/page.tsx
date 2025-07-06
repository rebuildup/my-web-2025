import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, Code, Github, ExternalLink, Star, GitBranch, Users } from 'lucide-react';
import { ContentItem } from '@/types/content';
import portfolioData from '@/data/portfolio.json';

export const metadata: Metadata = {
  title: 'Development Portfolio - samuido | 開発系作品ギャラリー',
  description:
    'Webデザイナー・開発者木村友亮の開発系作品。React、Next.js、TypeScriptを使用したWebアプリケーション、ツール開発の実績をご紹介。',
  keywords: [
    '開発',
    'プログラミング',
    'React',
    'Next.js',
    'TypeScript',
    'Webアプリケーション',
    'ツール開発',
    'フロントエンド',
  ],
  robots: 'index, follow',
  openGraph: {
    title: 'Development Portfolio - samuido | 開発系作品ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の開発系作品。React、Next.js、TypeScriptを使用したWebアプリケーション、ツール開発の実績をご紹介。',
    type: 'website',
    url: '/portfolio/gallery/develop',
    images: [
      {
        url: '/portfolio-develop-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Development Portfolio - samuido',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Development Portfolio - samuido | 開発系作品ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の開発系作品。React、Next.js、TypeScriptを使用したWebアプリケーション、ツール開発の実績をご紹介。',
    images: ['/portfolio-develop-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const developPortfolioItems = (portfolioData as ContentItem[]).filter(
  item => item.category === 'develop'
);

const techTags = Array.from(
  new Set(developPortfolioItems.flatMap(item => item.tags))
).sort();

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  });
}

function getTechStackColor(tech: string): string {
  const colorMap: Record<string, string> = {
    React: 'bg-blue-500/20 text-blue-700',
    'Next.js': 'bg-black/20 text-gray-700',
    TypeScript: 'bg-blue-600/20 text-blue-800',
    'D3.js': 'bg-orange-500/20 text-orange-700',
    TailwindCSS: 'bg-cyan-500/20 text-cyan-700',
    'Responsive Design': 'bg-green-500/20 text-green-700',
    Animation: 'bg-purple-500/20 text-purple-700',
    Dashboard: 'bg-indigo-500/20 text-indigo-700',
    'Real-time': 'bg-red-500/20 text-red-700',
  };
  return colorMap[tech] || 'bg-gray-500/20 text-gray-700';
}

export default function DevelopPortfolioPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Development Portfolio - samuido',
    description: 'Webデザイナー・開発者木村友亮の開発系作品ギャラリー',
    url: 'https://yusuke-kim.com/portfolio/gallery/develop',
    mainEntity: {
      '@type': 'ItemList',
      name: '開発系作品一覧',
      description: 'React、Next.js、TypeScriptを使用したWebアプリケーション、ツール開発',
      numberOfItems: developPortfolioItems.length,
      itemListElement: developPortfolioItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: item.title,
          description: item.description,
          datePublished: item.publishedAt,
          author: {
            '@type': 'Person',
            name: '木村友亮',
            alternateName: 'samuido',
          },
          programmingLanguage: item.tags.filter(tag => 
            ['React', 'Next.js', 'TypeScript', 'JavaScript', 'D3.js'].includes(tag)
          ),
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
        <header className="border-foreground/20 border-b bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-green-500/10 px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="bg-primary/20 p-3 rounded-lg">
                <Code size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="neue-haas-grotesk-display text-primary mb-2 text-4xl md:text-6xl">
                  Development Portfolio
                </h1>
                <p className="zen-kaku-gothic-new text-primary/80 text-xl">
                  開発系作品ギャラリー
                </p>
              </div>
            </div>
            
            <p className="noto-sans-jp text-foreground/80 mb-8 text-lg leading-relaxed max-w-3xl">
              React、Next.js、TypeScriptを中心とした現代的なWeb技術を使用して構築したアプリケーション、
              ツール、ライブラリの開発実績をご紹介します。技術詳細と実装方法を重視した表示で、
              コードの品質と革新性を重視しています。
            </p>

            {/* Development Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {developPortfolioItems.length}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Projects</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {techTags.length}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Technologies</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {developPortfolioItems.reduce((sum, item) => sum + (item.stats?.views || 0), 0)}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Total Views</div>
              </div>
              
              <div className="bg-gray/50 border border-foreground/20 p-4 rounded-lg text-center">
                <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                  {developPortfolioItems.filter(item => item.externalLinks?.some(link => link.type === 'github')).length}
                </div>
                <div className="noto-sans-jp text-foreground/70 text-sm">Open Source</div>
              </div>
            </div>
          </div>
        </header>

        {/* Tech Stack Filter */}
        <section className="border-foreground/20 border-b bg-gray/50 px-4 py-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
              Technology Filter
            </h2>
            <div className="flex flex-wrap gap-2">
              <button className="bg-primary text-white rounded-full px-4 py-2 text-sm">
                All Technologies
              </button>
              {techTags.slice(0, 8).map(tech => (
                <button
                  key={tech}
                  className={`rounded-full px-4 py-2 text-sm transition-colors ${getTechStackColor(tech)}`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid - 2 Column Alternating Layout */}
        <main className="mx-auto max-w-7xl px-4 py-12">
          <div className="space-y-16">
            {developPortfolioItems.map((item, index) => (
              <div
                key={item.id}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-center ${
                  index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Project Image */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-2' : ''}`}>
                  <Link href={`/portfolio/${item.id}`} className="group block">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg overflow-hidden relative">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Code size={64} className="text-primary/60" />
                        </div>
                      )}
                      
                      {/* Video Overlay if available */}
                      {item.videos && item.videos.length > 0 && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-white/90 text-gray-800 rounded-full p-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M8 5.14v14.72c0 .4.45.64.81.42l11.13-6.36c.35-.2.35-.64 0-.84L8.81 4.72c-.36-.22-.81.02-.81.42z"/>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Project Details */}
                <div className={`${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-500/20 text-blue-700 rounded-full px-3 py-1 text-sm font-medium">
                        Development
                      </span>
                      <span className="text-foreground/60 text-sm">
                        {formatDate(item.publishedAt || item.createdAt)}
                      </span>
                    </div>
                    
                    <Link href={`/portfolio/${item.id}`}>
                      <h3 className="neue-haas-grotesk-display text-foreground hover:text-primary mb-3 text-2xl md:text-3xl font-bold transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                  </div>

                  <p className="noto-sans-jp text-foreground/80 mb-6 text-base leading-relaxed">
                    {item.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="mb-6">
                    <h4 className="neue-haas-grotesk-display text-foreground mb-2 text-sm font-medium">
                      Tech Stack:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                        <span
                          key={tag}
                          className={`rounded px-3 py-1 text-sm ${getTechStackColor(tag)}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Links and Stats */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      {item.externalLinks?.map(link => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 flex items-center space-x-2 text-sm transition-colors"
                        >
                          {link.type === 'github' ? (
                            <Github size={16} />
                          ) : (
                            <ExternalLink size={16} />
                          )}
                          <span>{link.title}</span>
                        </a>
                      ))}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-foreground/60">
                      <div className="flex items-center space-x-1">
                        <Star size={14} />
                        <span>{item.stats?.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{item.stats?.views || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="mt-6">
                    <Link
                      href={`/portfolio/${item.id}`}
                      className="bg-primary text-white hover:bg-primary/90 inline-flex items-center space-x-2 rounded-lg px-6 py-3 transition-colors"
                    >
                      <span>View Project Details</span>
                      <ArrowLeft size={16} className="rotate-180" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Skills Overview */}
          <section className="mt-20 border-t border-foreground/20 pt-12">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
              Technical Expertise
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Code size={32} className="text-blue-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Frontend Development
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  React, Next.js, TypeScript, TailwindCSS
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-500/20 p-4 rounded-lg mb-4 inline-block">
                  <GitBranch size={32} className="text-green-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  Data Visualization
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  D3.js, Interactive Charts, Real-time Analytics
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-500/20 p-4 rounded-lg mb-4 inline-block">
                  <Users size={32} className="text-purple-600" />
                </div>
                <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                  User Experience
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  Responsive Design, Accessibility, Performance
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