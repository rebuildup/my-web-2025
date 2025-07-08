'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  Palette,
  QrCode,
  Timer,
  Gamepad2,
  FileCode,
  Image as ImageIcon,
  Type,
  Calculator,
  Mail,
  Code2,
  Star,
  TrendingUp,
  Search,
} from 'lucide-react';
import { ContentItem } from '@/types/content';
import { GridLayout, GridContainer, GridContent } from '@/components/GridSystem';

interface ToolCard extends ContentItem {
  category:
    | 'design'
    | 'utility'
    | 'productivity'
    | 'game'
    | 'development'
    | 'writing'
    | 'communication';
  usage?: number;
  rating?: number;
}

const toolCategories = [
  { id: 'all', name: '全て', icon: <Code2 size={20} /> },
  { id: 'design', name: 'デザイン', icon: <Palette size={20} /> },
  { id: 'utility', name: 'ユーティリティ', icon: <QrCode size={20} /> },
  { id: 'productivity', name: '生産性', icon: <Timer size={20} /> },
  { id: 'game', name: 'ゲーム', icon: <Gamepad2 size={20} /> },
  { id: 'development', name: '開発', icon: <FileCode size={20} /> },
  { id: 'writing', name: 'ライティング', icon: <Type size={20} /> },
  { id: 'communication', name: 'コミュニケーション', icon: <Mail size={20} /> },
];

export default function ToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tools, setTools] = useState<ToolCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load tools data
    const loadTools = async () => {
      try {
        const response = await fetch('/data/content/tool.json');
        const data = await response.json();

        // Transform data and add mock usage/rating data
        const transformedTools: ToolCard[] = data.map((tool: ContentItem) => ({
          ...tool,
          usage: Math.floor(Math.random() * 10000) + 500,
          rating: 4.2 + Math.random() * 0.8,
        }));

        setTools(transformedTools);
      } catch (error) {
        console.error('Failed to load tools:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTools();
  }, []);

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const popularTools = tools
    .filter(tool => tool.usage)
    .sort((a, b) => (b.usage || 0) - (a.usage || 0))
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'samuido Tools',
    description: '実用的なWebツールのコレクション',
    url: 'https://yusuke-kim.com/tools',
    author: {
      '@type': 'Person',
      name: '木村友亮',
      alternateName: 'samuido',
    },
    mainEntity: {
      '@type': 'ItemList',
      name: 'Webツール一覧',
      description: 'カラーパレット、QRコード、タイマーなどの実用ツール',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <GridLayout background={false} className="bg-gray">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <GridContainer>
            <Link
              href="/"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Home
            </Link>
          </GridContainer>
        </nav>

        {/* Hero Header */}
        <header className="px-4 py-16 text-center">
          <h1 className="neue-haas-grotesk-display text-primary mb-6 text-6xl md:text-8xl">
            Tools
          </h1>
          <GridContainer>
            <p className="noto-sans-jp text-foreground/80 mb-8 text-xl leading-relaxed md:text-2xl">
              実用的なWebツールのコレクション
              <br />
              すべて無償でご利用いただけます
            </p>
          </GridContainer>
          <div className="bg-primary mx-auto mt-8 h-1 w-32"></div>
        </header>

        {/* Main Content */}
        <main className="pb-16">
          <GridContainer>
            {/* Statistics */}
            <section className="mb-12">
              <GridContent cols={{ xs: 2, md: 4, xl: 4, '2xl': 4 }} className="mx-auto max-w-2xl">
                <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                  <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                    {tools.length}
                  </div>
                  <div className="noto-sans-jp text-foreground/70 text-sm">総ツール数</div>
                </div>

                <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                  <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                    {tools.reduce((acc, tool) => acc + (tool.usage || 0), 0).toLocaleString()}
                  </div>
                  <div className="noto-sans-jp text-foreground/70 text-sm">総利用回数</div>
                </div>

                <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                  <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">
                    {toolCategories.length - 1}
                  </div>
                  <div className="noto-sans-jp text-foreground/70 text-sm">カテゴリ数</div>
                </div>

                <div className="border-foreground/20 bg-gray/50 border p-4 text-center">
                  <div className="neue-haas-grotesk-display text-primary mb-1 text-2xl">100%</div>
                  <div className="noto-sans-jp text-foreground/70 text-sm">無償利用</div>
                </div>
              </GridContent>
            </section>

            {/* Popular Tools */}
            <section className="mb-12">
              <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
                人気ツール
              </h2>

              <GridContent cols={{ xs: 1, md: 3, xl: 3, '2xl': 3 }}>
                {popularTools.map((tool, index) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="group border-primary/30 bg-gray/50 hover:border-primary border p-6 transition-all duration-300 hover:shadow-lg"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star size={16} className="fill-current text-yellow-500" />
                        <span className="text-foreground/60 text-sm">#{index + 1} 人気</span>
                      </div>
                      <TrendingUp size={16} className="text-primary" />
                    </div>

                    <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary mb-2 text-lg transition-colors">
                      {tool.title}
                    </h3>

                    <p className="noto-sans-jp text-foreground/70 mb-3 line-clamp-2 text-sm">
                      {tool.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {tool.tags.slice(0, 2).map(tag => (
                          <span
                            key={tag}
                            className="bg-primary/20 text-primary rounded px-2 py-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-foreground/50 text-xs">
                        {tool.usage?.toLocaleString()} 回利用
                      </div>
                    </div>
                  </Link>
                ))}
              </GridContent>
            </section>

            {/* Search and Filter */}
            <section className="mb-8">
              <div className="mx-auto max-w-4xl">
                {/* Search */}
                <div className="mb-6">
                  <div className="relative mx-auto max-w-md">
                    <Search
                      size={20}
                      className="text-foreground/50 absolute top-1/2 left-3 -translate-y-1/2 transform"
                    />
                    <input
                      type="text"
                      placeholder="ツールを検索..."
                      className="border-foreground/20 bg-gray text-foreground focus:border-primary noto-sans-jp w-full rounded-none border py-3 pr-4 pl-10 focus:outline-none"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2">
                  {toolCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 border px-4 py-2 transition-colors ${
                        selectedCategory === category.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-foreground/20 text-foreground/70 hover:border-primary/50'
                      }`}
                    >
                      {category.icon}
                      <span className="noto-sans-jp text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Tools Grid */}
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                  {selectedCategory === 'all'
                    ? '全ツール'
                    : toolCategories.find(cat => cat.id === selectedCategory)?.name + 'ツール'}
                </h2>
                <div className="text-foreground/60 text-sm">{filteredTools.length} 件</div>
              </div>

              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="loading mx-auto"></div>
                  <p className="text-foreground/60 mt-4">ツールを読み込み中...</p>
                </div>
              ) : filteredTools.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-foreground/60 noto-sans-jp">
                    {searchQuery
                      ? '検索結果が見つかりませんでした'
                      : 'このカテゴリにはツールがありません'}
                  </p>
                </div>
              ) : (
                <GridContent cols={{ xs: 1, md: 2, xl: 3, '2xl': 3 }}>
                  {filteredTools.map(tool => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      className="group border-foreground/20 bg-gray/50 hover:border-primary overflow-hidden border transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="from-primary/10 to-primary/5 flex aspect-video items-center justify-center bg-gradient-to-br">
                        {getToolIcon(tool.title)}
                      </div>

                      <div className="p-6">
                        <div className="mb-2 flex items-start justify-between">
                          <h3 className="neue-haas-grotesk-display text-foreground group-hover:text-primary text-lg transition-colors">
                            {tool.title}
                          </h3>
                          <div className="text-primary bg-primary/10 rounded px-2 py-1 text-xs">
                            {tool.category}
                          </div>
                        </div>

                        <p className="noto-sans-jp text-foreground/70 mb-4 line-clamp-3 text-sm">
                          {tool.description}
                        </p>

                        <div className="mb-4 flex flex-wrap gap-1">
                          {tool.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="bg-foreground/10 text-foreground/70 rounded px-2 py-1 text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-foreground/50 text-xs">
                            {tool.usage?.toLocaleString()} 回利用
                          </div>
                          <div className="text-primary text-xs font-medium group-hover:underline">
                            使用する →
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </GridContent>
              )}
            </section>
          </GridContainer>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <GridContainer>
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
          </GridContainer>
        </footer>
      </GridLayout>
    </>
  );
}

function getToolIcon(title: string) {
  const iconMap: Record<string, React.ReactNode> = {
    'Color Palette Generator': <Palette size={48} className="text-primary/60" />,
    'QR Code Generator': <QrCode size={48} className="text-primary/60" />,
    'Text Counter & Analyzer': <Type size={48} className="text-primary/60" />,
    'Pomodoro Timer': <Timer size={48} className="text-primary/60" />,
    'Business Mail Block': <Mail size={48} className="text-primary/60" />,
    'AE Expression': <Code2 size={48} className="text-primary/60" />,
    ProtoType: <Gamepad2 size={48} className="text-primary/60" />,
    'Sequential PNG Preview': <ImageIcon size={48} className="text-primary/60" />,
    SVG2TSX: <FileCode size={48} className="text-primary/60" />,
    'Price Calculator': <Calculator size={48} className="text-primary/60" />,
    'Pi Game': <Gamepad2 size={48} className="text-primary/60" />,
  };

  return iconMap[title] || <Code2 size={48} className="text-primary/60" />;
}
