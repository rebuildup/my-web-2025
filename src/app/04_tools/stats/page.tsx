import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getContentByType } from '@/lib/utils/content-loader';
import { getTopStats } from '@/lib/stats';
import ToolStatsDisplay from '../components/ToolStatsDisplay';

export const metadata: Metadata = {
  title: 'Tool Usage Statistics | samuido',
  description: 'View usage statistics for tools',
};

export default async function ToolStatsPage() {
  // Get top viewed tools
  const topViews = await getTopStats('view', 20);

  // Get all tools to match IDs with titles
  const contentTools = await getContentByType('tool', {
    status: 'all',
  });

  // Built-in tools
  const builtInTools = [
    {
      id: 'text-counter',
      title: 'Text Counter',
      category: 'text',
    },
  ];

  // Combine all tools
  const allTools = [
    ...builtInTools,
    ...contentTools.map(tool => ({
      id: tool.id,
      title: tool.title,
      category: tool.category,
    })),
  ];

  // Map stats to tool info
  const toolStats = topViews.map(([id, views]) => {
    const tool = allTools.find(t => t.id === id);
    return {
      id,
      title: tool?.title || id,
      category: tool?.category || 'unknown',
      views,
    };
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/04_tools"
          className="text-foreground/70 hover:text-primary inline-flex items-center"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Tools
        </Link>
      </div>

      <div className="mb-8 text-center">
        <h1 className="neue-haas-grotesk-display text-foreground mb-2 text-3xl font-bold">
          Tool Usage Statistics
        </h1>
        <p className="noto-sans-jp text-foreground/70">ツール使用統計</p>
      </div>

      <ToolStatsDisplay toolStats={toolStats} />
    </div>
  );
}
