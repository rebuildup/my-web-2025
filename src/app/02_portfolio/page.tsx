import React from 'react';
import { Metadata } from 'next';
import { getContentByType } from '@/lib/utils/content-loader';
import PortfolioGallery from './components/PortfolioGallery';

interface PortfolioPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export const metadata: Metadata = {
  title: 'Portfolio | samuido',
  description: 'Explore my portfolio of development, design, and video projects',
};

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  // Get category from query params
  const category = typeof searchParams.category === 'string' ? searchParams.category : 'all';

  // Pre-load portfolio items on the server
  const portfolioItems = await getContentByType('portfolio', {
    status: 'published',
    sortBy: 'priority',
    sortOrder: 'desc',
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="neue-haas-grotesk-display text-foreground mb-2 text-3xl font-bold">
          Portfolio
        </h1>
        <p className="noto-sans-jp text-foreground/70">ポートフォリオ</p>
      </div>

      <PortfolioGallery initialItems={portfolioItems} initialCategory={category} />
    </div>
  );
}
