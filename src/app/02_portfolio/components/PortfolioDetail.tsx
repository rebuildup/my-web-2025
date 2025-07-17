'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Tag, Eye, ExternalLink } from 'lucide-react';
import { ContentItem, MediaEmbed } from '@/types/content';

interface PortfolioDetailProps {
  item: ContentItem;
}

export default function PortfolioDetail({ item }: PortfolioDetailProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    item.thumbnail || (item.images && item.images.length > 0 ? item.images[0] : null)
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Get external link icon
  const getExternalLinkIcon = (type: string) => {
    switch (type) {
      case 'github':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        );
      case 'demo':
        return <ExternalLink className="h-4 w-4" />;
      case 'booth':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.6 0H2.4C1.08 0 0 1.08 0 2.4v19.2C0 22.92 1.08 24 2.4 24h19.2c1.32 0 2.4-1.08 2.4-2.4V2.4C24 1.08 22.92 0 21.6 0zM7.2 18H4.8v-7.2h2.4V18zm6 0h-2.4V6h2.4v12zm6 0h-2.4v-4.8h2.4V18z" />
          </svg>
        );
      default:
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  // Render video embed
  const renderVideoEmbed = (video: MediaEmbed) => {
    switch (video.type) {
      case 'youtube':
        // Extract YouTube video ID
        const youtubeId = video.url.match(
          /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
        )?.[1];
        if (!youtubeId) return null;

        return (
          <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={video.title || 'YouTube Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        );

      case 'vimeo':
        // Extract Vimeo video ID
        const vimeoId = video.url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/)?.[1];
        if (!vimeoId) return null;

        return (
          <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              title={video.title || 'Vimeo Video'}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Back link */}
      <div>
        <Link
          href="/02_portfolio"
          className="text-foreground/70 hover:text-primary inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Portfolio
        </Link>
      </div>

      {/* Header */}
      <div className="border-foreground/10 border-b pb-6">
        <h1 className="neue-haas-grotesk-display text-foreground text-3xl font-bold">
          {item.title}
        </h1>

        <div className="text-foreground/70 mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {/* Category */}
          <div className="flex items-center">
            <Tag className="mr-1 h-4 w-4" />
            <span>{item.category}</span>
          </div>

          {/* Date */}
          {item.publishedAt && (
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              <span>{formatDate(item.publishedAt)}</span>
            </div>
          )}

          {/* Views */}
          {item.stats?.views !== undefined && (
            <div className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              <span>{item.stats.views.toLocaleString()} views</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Main image or video */}
          <div className="border-foreground/10 mb-6 overflow-hidden border">
            {item.videos && item.videos.length > 0 ? (
              // Show first video
              renderVideoEmbed(item.videos[0])
            ) : selectedImage ? (
              // Show selected image
              <div className="aspect-w-16 aspect-h-9 relative">
                <Image
                  src={selectedImage}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-contain"
                />
              </div>
            ) : null}
          </div>

          {/* Image gallery */}
          {item.images && item.images.length > 1 && (
            <div className="mb-6">
              <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg font-medium">
                Gallery
              </h3>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {item.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`relative aspect-square overflow-hidden border ${
                      selectedImage === image
                        ? 'border-primary'
                        : 'border-foreground/10 hover:border-foreground/30'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${item.title} - Image ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 10vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="prose prose-sm text-foreground/90 max-w-none">
            <p>{item.description}</p>

            {/* Content (if available) */}
            {item.content && (
              <div className="mt-4" dangerouslySetInnerHTML={{ __html: item.content }} />
            )}
          </div>

          {/* Additional videos */}
          {item.videos && item.videos.length > 1 && (
            <div className="mt-8">
              <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg font-medium">
                Videos
              </h3>
              <div className="space-y-4">
                {item.videos.slice(1).map((video, index) => (
                  <div key={index} className="border-foreground/10 border">
                    {renderVideoEmbed(video)}
                    {video.title && (
                      <div className="p-3">
                        <h4 className="text-foreground text-sm font-medium">{video.title}</h4>
                        {video.description && (
                          <p className="text-foreground/70 mt-1 text-xs">{video.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg font-medium">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <span key={tag} className="bg-gray/50 text-foreground/70 px-2 py-1 text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External links */}
          {item.externalLinks && item.externalLinks.length > 0 && (
            <div className="mb-6">
              <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-lg font-medium">
                Links
              </h3>
              <div className="space-y-2">
                {item.externalLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-foreground/10 text-foreground/80 hover:border-primary/50 hover:text-primary flex items-center rounded-none border px-3 py-2 text-sm"
                  >
                    <span className="mr-2">{getExternalLinkIcon(link.type)}</span>
                    <span>{link.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
