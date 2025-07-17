import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getContentByType } from '@/lib/utils/content-loader';
import { getTopStats } from '@/lib/stats';
import PortfolioStats from '../components/PortfolioStats';

export const metadata: Metadata = {
  title: 'Portfolio Statistics | samuido',
  description: 'View statistics for portfolio items',
};

export default async function PortfolioStatsPage() {
  // Get top viewed portfolio items
  const topViews = await getTopStats('view', 20);

  // Get all portfolio items to match IDs with titles
  const portfolioItems = await getContentByType('portfolio', {
    status: 'all',
  });

  // Map stats to portfolio items
  const portfolioStats = topViews.map(([id, views]) => {
    const item = portfolioItems.find(item => item.id === id);
    return {
      id,
      title: item?.title || id,
      category: item?.category || 'unknown',
      views,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/02_portfolio"
          className="text-foreground/70 hover:text-primary inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Portfolio
        </Link>
      </div>

      <div className="mb-8 text-center">
        <h1 className="neue-haas-grotesk-display text-foreground mb-2 text-3xl font-bold">
          Portfolio Statistics
        </h1>
        <p className="noto-sans-jp text-foreground/70">ポートフォリオ統計</p>
      </div>

      <PortfolioStats portfolioStats={portfolioStats} />
    </div>
  );
}
