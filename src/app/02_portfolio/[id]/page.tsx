import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getContentByType } from '@/lib/utils/content-loader';
import { trackStat } from '@/lib/stats';
import PortfolioDetail from '../components/PortfolioDetail';

interface PortfolioDetailPageProps {
  params: { id: string };
}

// Dynamic metadata
export async function generateMetadata({ params }: PortfolioDetailPageProps): Promise<Metadata> {
  const { id } = params;

  // Get portfolio item
  const items = await getContentByType('portfolio');
  const item = items.find(item => item.id === id);

  if (!item) {
    return {
      title: 'Portfolio Item Not Found | samuido',
      description: 'The requested portfolio item could not be found.',
    };
  }

  return {
    title: `${item.title} | Portfolio | samuido`,
    description: item.description,
    openGraph: item.seo?.ogImage
      ? {
          images: [{ url: item.seo.ogImage }],
        }
      : undefined,
  };
}

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const { id } = params;

  // Get portfolio item
  const items = await getContentByType('portfolio');
  const item = items.find(item => item.id === id);

  // If item not found, return 404
  if (!item) {
    notFound();
  }

  // Track view (server-side)
  try {
    await trackStat('view', id);
  } catch (error) {
    console.error('Failed to track view:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PortfolioDetail item={item} />
    </div>
  );
}
