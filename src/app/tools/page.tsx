'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
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
  Search
} from "lucide-react";
import { ContentItem } from "@/types/content";

interface ToolCard extends ContentItem {
  category: 'design' | 'utility' | 'productivity' | 'game' | 'development' | 'writing' | 'communication';
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
        const transformedTools: ToolCard[] = data.map((tool: ContentItem, index: number) => ({
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
    const matchesSearch = searchQuery === '' || 
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
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "samuido Tools",
    "description": "実用的なWebツールのコレクション",
    "url": "https://yusuke-kim.com/tools",
    "author": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "Webツール一覧",
      "description": "カラーパレット、QRコード、タイマーなどの実用ツール"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gray">
        {/* Navigation */}
        <nav className="border-b border-foreground/20 p-4">
          <div className="max-w-7xl mx-auto">
            <Link 
              href="/" 
              className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80"
            >
              ← Home
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-16 px-4">
          <h1 className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-6">
            Tools
          </h1>
          <div className="max-w-4xl mx-auto">
            <p className="noto-sans-jp text-xl md:text-2xl text-foreground/80 leading-relaxed mb-8">
              実用的なWebツールのコレクション<br />
              すべて無償でご利用いただけます
            </p>
          </div>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {/* Statistics */}
          <section className="mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {tools.length}
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  総ツール数
                </div>
              </div>
              
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {tools.reduce((acc, tool) => acc + (tool.usage || 0), 0).toLocaleString()}
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  総利用回数
                </div>
              </div>
              
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {toolCategories.length - 1}
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  カテゴリ数
                </div>
              </div>
              
              <div className="text-center p-4 border border-foreground/20 bg-gray/50">
                <div className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  100%
                </div>
                <div className="noto-sans-jp text-sm text-foreground/70">
                  無償利用
                </div>
              </div>
            </div>
          </section>

          {/* Popular Tools */}
          <section className="mb-12">
            <h2 className="neue-haas-grotesk-display text-3xl text-foreground text-center mb-8">
              人気ツール
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularTools.map((tool, index) => (
                <Link
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  className="group border border-primary/30 bg-gray/50 p-6 hover:shadow-lg transition-all duration-300 hover:border-primary"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Star size={16} className="text-yellow-500 fill-current" />
                      <span className="text-sm text-foreground/60">#{index + 1} 人気</span>
                    </div>
                    <TrendingUp size={16} className="text-primary" />
                  </div>
                  
                  <h3 className="neue-haas-grotesk-display text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  
                  <p className="noto-sans-jp text-sm text-foreground/70 mb-3 line-clamp-2">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-primary/20 text-primary text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-foreground/50">
                      {tool.usage?.toLocaleString()} 回利用
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Search and Filter */}
          <section className="mb-8">
            <div className="max-w-4xl mx-auto">
              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md mx-auto">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                  <input
                    type="text"
                    placeholder="ツールを検索..."
                    className="w-full pl-10 pr-4 py-3 border border-foreground/20 bg-gray text-foreground rounded-none focus:border-primary focus:outline-none noto-sans-jp"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2">
                {toolCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 border transition-colors ${
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="neue-haas-grotesk-display text-2xl text-foreground">
                {selectedCategory === 'all' ? '全ツール' : 
                 toolCategories.find(cat => cat.id === selectedCategory)?.name + 'ツール'}
              </h2>
              <div className="text-sm text-foreground/60">
                {filteredTools.length} 件
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="loading mx-auto"></div>
                <p className="mt-4 text-foreground/60">ツールを読み込み中...</p>
              </div>
            ) : filteredTools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-foreground/60 noto-sans-jp">
                  {searchQuery ? '検索結果が見つかりませんでした' : 'このカテゴリにはツールがありません'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTools.map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="group border border-foreground/20 bg-gray/50 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary"
                  >
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      {getToolIcon(tool.title)}
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="neue-haas-grotesk-display text-lg text-foreground group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                        <div className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                          {tool.category}
                        </div>
                      </div>
                      
                      <p className="noto-sans-jp text-sm text-foreground/70 mb-4 line-clamp-3">
                        {tool.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {tool.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-foreground/10 text-foreground/70 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-foreground/50">
                          {tool.usage?.toLocaleString()} 回利用
                        </div>
                        <div className="text-primary text-xs font-medium group-hover:underline">
                          使用する →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-foreground/20 py-8 text-center">
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

function getToolIcon(title: string) {
  const iconMap: Record<string, React.ReactNode> = {
    'Color Palette Generator': <Palette size={48} className="text-primary/60" />,
    'QR Code Generator': <QrCode size={48} className="text-primary/60" />,
    'Text Counter & Analyzer': <Type size={48} className="text-primary/60" />,
    'Pomodoro Timer': <Timer size={48} className="text-primary/60" />,
    'Business Mail Block': <Mail size={48} className="text-primary/60" />,
    'AE Expression': <Code2 size={48} className="text-primary/60" />,
    'ProtoType': <Gamepad2 size={48} className="text-primary/60" />,
    'Sequential PNG Preview': <ImageIcon size={48} className="text-primary/60" />,
    'SVG2TSX': <FileCode size={48} className="text-primary/60" />,
    'Price Calculator': <Calculator size={48} className="text-primary/60" />,
    'Pi Game': <Gamepad2 size={48} className="text-primary/60" />,
  };
  
  return iconMap[title] || <Code2 size={48} className="text-primary/60" />;
}