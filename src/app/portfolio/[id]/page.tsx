import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ArrowLeft, Calendar, Eye, Heart, Share2, ExternalLink, Github, Clock, Tag, User, Video, Image } from 'lucide-react';
import { ContentItem } from '@/types/content';
import portfolioData from '@/data/portfolio.json';

interface PortfolioDetailPageProps {
  params: {
    id: string;
  };
}

const portfolioItems = portfolioData as ContentItem[];

function getPortfolioItem(id: string): ContentItem | null {
  return portfolioItems.find(item => item.id === id) || null;
}

export async function generateMetadata({ params }: PortfolioDetailPageProps): Promise<Metadata> {
  const item = getPortfolioItem(params.id);
  
  if (!item) {
    return {
      title: 'Portfolio Not Found - samuido',
      description: 'The requested portfolio item was not found.',
    };
  }

  return {
    title: `${item.title} - samuido Portfolio`,
    description: item.description,
    keywords: item.tags,
    robots: 'index, follow',
    openGraph: {
      title: item.title,
      description: item.description,
      type: 'article',
      url: `/portfolio/${item.id}`,
      images: item.images && item.images.length > 0 ? [
        {
          url: item.images[0],
          width: 1200,
          height: 630,
          alt: item.title,
        },
      ] : [],
      publishedTime: item.publishedAt,
      modifiedTime: item.updatedAt,
      tags: item.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      description: item.description,
      images: item.images && item.images.length > 0 ? [item.images[0]] : [],
      creator: '@361do_sleep',
    },
  };
}

export async function generateStaticParams() {
  return portfolioItems.map((item) => ({
    id: item.id,
  }));
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getCategoryColor(category: string): string {
  const colorMap: Record<string, string> = {
    develop: 'bg-blue-500/20 text-blue-700',
    video: 'bg-purple-500/20 text-purple-700',
    'video&design': 'bg-yellow-500/20 text-yellow-700',
  };
  return colorMap[category] || 'bg-gray-500/20 text-gray-700';
}

function getCategoryIcon(category: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    develop: '⚡',
    video: '🎬',
    'video&design': '🎨',
  };
  return iconMap[category] || '📄';
}

export default function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const item = getPortfolioItem(params.id);

  if (!item) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': item.category === 'develop' ? 'SoftwareApplication' : 'CreativeWork',
    name: item.title,
    description: item.description,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido',
    },
    keywords: item.tags.join(', '),
    ...(item.images && item.images[0] && {
      image: item.images[0],
    }),
    ...(item.videos && item.videos[0] && {
      video: {
        '@type': 'VideoObject',
        name: item.videos[0].title,
        description: item.videos[0].description,
        embedUrl: item.videos[0].url,
        duration: `PT${item.videos[0].duration}S`,
        thumbnailUrl: item.videos[0].thumbnail,
      },
    }),
    ...(item.externalLinks && {
      sameAs: item.externalLinks.map(link => link.url),
    }),
  };

  const relatedItems = portfolioItems
    .filter(relatedItem => 
      relatedItem.id !== item.id && 
      relatedItem.category === item.category
    )
    .slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-gray min-h-screen">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <Link
              href="/portfolio"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 flex items-center space-x-2 text-lg"
            >
              <ArrowLeft size={20} />
              <span>Portfolio</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link
                href={`/portfolio/gallery/${item.category}`}
                className="text-foreground/70 hover:text-primary text-sm transition-colors"
              >
                {item.category === 'develop' ? 'Development' : 
                 item.category === 'video' ? 'Video' : 
                 item.category === 'video&design' ? 'Video & Design' : item.category}
              </Link>
              <span className="text-foreground/40">•</span>
              <span className="text-foreground/70 text-sm">{item.title}</span>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="border-foreground/20 border-b px-4 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`rounded-full px-4 py-2 text-sm font-medium ${getCategoryColor(item.category)}`}>
                      {getCategoryIcon(item.category)} {item.category === 'video&design' ? 'Video & Design' : item.category}
                    </span>
                    <div className="flex items-center space-x-2 text-foreground/60 text-sm">
                      <Calendar size={16} />
                      <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                    </div>
                  </div>
                  
                  <h1 className="neue-haas-grotesk-display text-primary mb-4 text-3xl md:text-5xl font-bold leading-tight">
                    {item.title}
                  </h1>
                  
                  <p className="noto-sans-jp text-foreground/80 text-lg leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-primary/20 text-primary rounded-full px-3 py-1 text-sm flex items-center space-x-1"
                      >
                        <Tag size={12} />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* External Links */}
                {item.externalLinks && item.externalLinks.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-8">
                    {item.externalLinks.map(link => (
                      <a
                        key={link.url}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary text-white hover:bg-primary/90 inline-flex items-center space-x-2 rounded-lg px-6 py-3 transition-colors"
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
                )}
              </div>

              {/* Sidebar Info */}
              <div className="lg:col-span-1">
                <div className="bg-gray/50 border border-foreground/20 rounded-lg p-6 sticky top-4">
                  <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg">
                    Project Details
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Category */}
                    <div className="flex justify-between">
                      <span className="text-foreground/70 text-sm">Category:</span>
                      <span className="text-foreground text-sm font-medium">
                        {item.category === 'video&design' ? 'Video & Design' : item.category}
                      </span>
                    </div>
                    
                    {/* Created Date */}
                    <div className="flex justify-between">
                      <span className="text-foreground/70 text-sm">Created:</span>
                      <span className="text-foreground text-sm font-medium">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    
                    {/* Status */}
                    <div className="flex justify-between">
                      <span className="text-foreground/70 text-sm">Status:</span>
                      <span className="text-green-600 text-sm font-medium">
                        {item.status}
                      </span>
                    </div>
                    
                    {/* Priority */}
                    <div className="flex justify-between">
                      <span className="text-foreground/70 text-sm">Priority:</span>
                      <span className="text-foreground text-sm font-medium">
                        {item.priority}/100
                      </span>
                    </div>
                    
                    {/* Views */}
                    {item.stats && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-foreground/70 text-sm">Views:</span>
                          <span className="text-foreground text-sm font-medium">
                            {item.stats.views?.toLocaleString() || 0}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-foreground/70 text-sm">Likes:</span>
                          <span className="text-foreground text-sm font-medium">
                            {item.stats.likes || 0}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-foreground/70 text-sm">Shares:</span>
                          <span className="text-foreground text-sm font-medium">
                            {item.stats.shares || 0}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-2">
                    <button className="bg-primary text-white hover:bg-primary/90 w-full flex items-center justify-center space-x-2 rounded-lg py-3 transition-colors">
                      <Heart size={16} />
                      <span>Like Project</span>
                    </button>
                    
                    <button className="border-primary text-primary hover:bg-primary hover:text-white w-full flex items-center justify-center space-x-2 rounded-lg border py-3 transition-colors">
                      <Share2 size={16} />
                      <span>Share Project</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Media Gallery */}
        {(item.images || item.videos) && (
          <section className="border-foreground/20 border-b px-4 py-12">
            <div className="mx-auto max-w-7xl">
              <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-2xl">
                Project Media
              </h2>
              
              <div className="space-y-8">
                {/* Videos */}
                {item.videos && item.videos.length > 0 && (
                  <div>
                    <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg flex items-center space-x-2">
                      <Video size={20} />
                      <span>Videos ({item.videos.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {item.videos.map((video, index) => (
                        <div
                          key={index}
                          className="bg-gray/50 border border-foreground/20 rounded-lg overflow-hidden"
                        >
                          <div className="aspect-video">
                            <iframe
                              src={video.url}
                              title={video.title}
                              className="w-full h-full"
                              allowFullScreen
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="neue-haas-grotesk-display text-foreground mb-2 text-base font-medium">
                              {video.title}
                            </h4>
                            {video.description && (
                              <p className="noto-sans-jp text-foreground/70 text-sm mb-2">
                                {video.description}
                              </p>
                            )}
                            {video.duration && (
                              <div className="flex items-center space-x-1 text-foreground/60 text-xs">
                                <Clock size={12} />
                                <span>{formatDuration(video.duration)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Images */}
                {item.images && item.images.length > 0 && (
                  <div>
                    <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-lg flex items-center space-x-2">
                      <Image size={20} />
                      <span>Images ({item.images.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {item.images.map((image, index) => (
                        <div
                          key={index}
                          className="bg-gray/50 border border-foreground/20 rounded-lg overflow-hidden group"
                        >
                          <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10">
                            <img
                              src={image}
                              alt={`${item.title} - Image ${index + 1}`}
                              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Project Content */}
        {item.content && (
          <section className="border-foreground/20 border-b px-4 py-12">
            <div className="mx-auto max-w-4xl">
              <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-2xl">
                Project Details
              </h2>
              <div className="noto-sans-jp text-foreground/80 prose prose-lg max-w-none leading-relaxed">
                <div className="whitespace-pre-wrap">{item.content}</div>
              </div>
            </div>
          </section>
        )}

        {/* Related Projects */}
        {relatedItems.length > 0 && (
          <section className="px-4 py-12">
            <div className="mx-auto max-w-7xl">
              <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-2xl">
                Related Projects
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedItems.map(relatedItem => (
                  <Link
                    key={relatedItem.id}
                    href={`/portfolio/${relatedItem.id}`}
                    className="group border-foreground/20 bg-gray/50 hover:bg-gray overflow-hidden rounded-lg border transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/10 relative overflow-hidden">
                      {relatedItem.thumbnail ? (
                        <img
                          src={relatedItem.thumbnail}
                          alt={relatedItem.title}
                          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-primary/60 text-3xl">
                            {getCategoryIcon(relatedItem.category)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg transition-colors line-clamp-2">
                        {relatedItem.title}
                      </h3>
                      <p className="noto-sans-jp text-foreground/70 text-sm line-clamp-2">
                        {relatedItem.description}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className={`rounded px-2 py-1 text-xs ${getCategoryColor(relatedItem.category)}`}>
                          {relatedItem.category}
                        </span>
                        <div className="flex items-center space-x-2 text-xs text-foreground/60">
                          <Eye size={12} />
                          <span>{relatedItem.stats?.views || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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