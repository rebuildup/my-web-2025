'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Star, TrendingUp, Clock, Users } from 'lucide-react';
import { ContentItem } from '@/types/content';

// Tool Components
import ColorPalette from '../components/ColorPalette';
import QrGenerator from '../components/QrGenerator';
import TextCounter from '../components/TextCounter';
import PomodoroTimer from '../components/PomodoroTimer';
import BusinessMailBlock from '../components/BusinessMailBlock';
import AeExpression from '../components/AeExpression';
import PiGame from '../components/PiGame';
import ProtoType from '../components/ProtoType';
import SequentialPngPreview from '../components/SequentialPngPreview';
import Svg2tsx from '../components/Svg2tsx';
import PriceCalculator from '../components/PriceCalculator';

interface ToolData extends ContentItem {
  category: string;
  usage?: number;
  rating?: number;
}

const toolComponents: Record<string, React.ComponentType> = {
  'tool-1': ColorPalette,
  'tool-2': QrGenerator,
  'tool-3': TextCounter,
  'tool-4': PomodoroTimer,
  'tool-5': BusinessMailBlock,
  'tool-6': AeExpression,
  'tool-7': PiGame,
  'tool-8': ProtoType,
  'tool-9': SequentialPngPreview,
  'tool-10': Svg2tsx,
  'tool-11': PriceCalculator,
};

export default function ToolPage() {
  const params = useParams();
  const toolId = params.id as string;
  const [tool, setTool] = useState<ToolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTool = async () => {
      try {
        const response = await fetch('/data/content/tool.json');
        if (!response.ok) {
          throw new Error('Failed to load tool data');
        }
        const data = await response.json();
        const toolData = data.find((t: ToolData) => t.id === toolId);
        
        if (!toolData) {
          throw new Error('Tool not found');
        }

        // Add mock usage/rating data
        const enrichedTool = {
          ...toolData,
          usage: Math.floor(Math.random() * 10000) + 500,
          rating: 4.2 + Math.random() * 0.8,
        };

        setTool(enrichedTool);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadTool();
  }, [toolId]);

  const ToolComponent = toolComponents[toolId];

  if (isLoading) {
    return (
      <div className="bg-gray min-h-screen">
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <div className="loading mx-auto mb-4"></div>
            <p className="text-foreground/60 noto-sans-jp">ツールを読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="bg-gray min-h-screen">
        <nav className="border-foreground/20 border-b p-4">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/tools"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 flex items-center space-x-2 text-xl"
            >
              <ArrowLeft size={20} />
              <span>← Tools</span>
            </Link>
          </div>
        </nav>
        
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <h1 className="neue-haas-grotesk-display text-foreground mb-4 text-3xl">
              ツールが見つかりません
            </h1>
            <p className="text-foreground/60 noto-sans-jp mb-6">
              指定されたツールは存在しないか、現在利用できません。
            </p>
            <Link
              href="/tools"
              className="bg-primary hover:bg-primary/80 text-white px-6 py-3 transition-colors"
            >
              ツール一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.title,
    description: tool.description,
    url: `https://yusuke-kim.com/tools/${toolId}`,
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido',
    },
    applicationCategory: 'WebApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tool.rating?.toFixed(1),
      reviewCount: tool.usage,
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
              href="/tools"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 flex items-center space-x-2 text-xl"
            >
              <ArrowLeft size={20} />
              <span>← Tools</span>
            </Link>
          </div>
        </nav>

        {/* Tool Header */}
        <header className="border-foreground/20 border-b px-4 py-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="bg-primary/20 text-primary rounded px-2 py-1 text-sm">
                {tool.category}
              </span>
              {tool.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-foreground/10 text-foreground/70 rounded px-2 py-1 text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
              {tool.title}
            </h1>

            <p className="noto-sans-jp text-foreground/80 mb-6 max-w-3xl text-lg leading-relaxed">
              {tool.description}
            </p>

            {/* Tool Stats */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Users size={16} className="text-primary" />
                  <span className="neue-haas-grotesk-display text-foreground text-lg">
                    {tool.usage?.toLocaleString()}
                  </span>
                </div>
                <div className="noto-sans-jp text-foreground/70 text-xs">利用回数</div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star size={16} className="text-primary" />
                  <span className="neue-haas-grotesk-display text-foreground text-lg">
                    {tool.rating?.toFixed(1)}
                  </span>
                </div>
                <div className="noto-sans-jp text-foreground/70 text-xs">評価</div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Clock size={16} className="text-primary" />
                  <span className="neue-haas-grotesk-display text-foreground text-lg">
                    {tool.customFields?.toolConfig?.estimatedTime || '5分'}
                  </span>
                </div>
                <div className="noto-sans-jp text-foreground/70 text-xs">利用時間</div>
              </div>

              <div className="border-foreground/20 bg-gray/50 border p-3 text-center">
                <div className="flex items-center justify-center space-x-1">
                  <TrendingUp size={16} className="text-primary" />
                  <span className="neue-haas-grotesk-display text-foreground text-lg">
                    {tool.customFields?.difficulty || 'beginner'}
                  </span>
                </div>
                <div className="noto-sans-jp text-foreground/70 text-xs">難易度</div>
              </div>
            </div>
          </div>
        </header>

        {/* Tool Content */}
        <main className="mx-auto max-w-7xl px-4 py-8">
          {ToolComponent ? (
            <ToolComponent />
          ) : (
            <div className="border-foreground/20 border p-8 text-center">
              <h2 className="neue-haas-grotesk-display text-foreground mb-4 text-2xl">
                ツールを開発中です
              </h2>
              <p className="noto-sans-jp text-foreground/70 mb-6">
                このツールは現在開発中です。完成までしばらくお待ちください。
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/tools"
                  className="bg-primary hover:bg-primary/80 text-white px-6 py-3 transition-colors"
                >
                  他のツールを見る
                </Link>
                <Link
                  href="/contact"
                  className="border-primary text-primary hover:bg-primary/10 border px-6 py-3 transition-colors"
                >
                  開発状況を問い合わせる
                </Link>
              </div>
            </div>
          )}

          {/* Tool Information */}
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Features */}
            <div className="border-foreground/20 border p-6">
              <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
                機能一覧
              </h3>
              <ul className="noto-sans-jp text-foreground/80 space-y-2">
                {tool.customFields?.toolConfig?.features?.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies */}
            <div className="border-foreground/20 border p-6">
              <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
                使用技術
              </h3>
              <div className="flex flex-wrap gap-2">
                {tool.customFields?.toolConfig?.technologies?.map((tech: string, index: number) => (
                  <span
                    key={index}
                    className="bg-foreground/10 text-foreground/70 rounded px-3 py-1 text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="border-foreground/20 mt-12 border p-6">
            <h3 className="neue-haas-grotesk-display text-foreground mb-4 text-xl">
              使い方・詳細情報
            </h3>
            <div 
              className="noto-sans-jp text-foreground/80 prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: tool.content.replace(/\n/g, '<br/>') }}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 mb-4 text-sm">
            このツールは無償でご利用いただけます
          </p>
          <div className="flex justify-center space-x-6">
            <Link href="/contact" className="text-foreground/60 hover:text-primary text-sm">
              お問い合わせ
            </Link>
            <Link href="/about" className="text-foreground/60 hover:text-primary text-sm">
              About
            </Link>
            <Link href="/tools" className="text-foreground/60 hover:text-primary text-sm">
              他のツール
            </Link>
          </div>
        </footer>
      </div>
    </>
  );
}