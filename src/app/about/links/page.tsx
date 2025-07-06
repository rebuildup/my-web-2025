"use client";

import Link from "next/link";
import type { Metadata } from "next";
import { useState } from "react";
import { ArrowLeft, Search, ExternalLink, Twitter, Github, Youtube, Instagram, MapPin, Users, Calendar, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Links - samuido | リンクマップ",
  description: "木村友亮が管理するSNS、開発関連、クリエイティブ関連の外部リンク集。各種サービスへの導線を提供。",
  keywords: ["リンクマップ", "SNS", "開発", "クリエイティブ", "外部リンク", "ソーシャルメディア"],
  robots: "index, follow",
  openGraph: {
    title: "Links - samuido | リンクマップ",
    description: "木村友亮が管理するSNS、開発関連、クリエイティブ関連の外部リンク集。各種サービスへの導線を提供。",
    type: "website",
    url: "/about/links",
    images: [
      {
        url: "/about/links-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Links samuido",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Links - samuido | リンクマップ",
    description: "木村友亮が管理するSNS、開発関連、クリエイティブ関連の外部リンク集。各種サービスへの導線を提供。",
    images: ["/about/links-twitter-image.jpg"],
    creator: "@361do_sleep",
  },
};

interface LinkItem {
  name: string;
  description: string;
  url: string;
  category: 'sns' | 'development' | 'creative' | 'other';
  icon: React.ReactNode;
  stats?: {
    followers?: number;
    posts?: number;
    lastUpdate?: string;
  };
  isActive: boolean;
}

const linkItems: LinkItem[] = [
  // SNS
  {
    name: "X (開発関連)",
    description: "プログラミング、技術、After Effectsプラグイン開発について投稿",
    url: "https://twitter.com/361do_sleep",
    category: "sns",
    icon: <Twitter size={24} />,
    stats: {
      followers: 42,
      posts: 156,
      lastUpdate: "2025-07-05"
    },
    isActive: true
  },
  {
    name: "X (映像・デザイン)",
    description: "映像制作、デザイン、クリエイティブな作品について投稿",
    url: "https://twitter.com/361do_design",
    category: "sns",
    icon: <Twitter size={24} />,
    stats: {
      followers: 28,
      posts: 89,
      lastUpdate: "2025-07-04"
    },
    isActive: true
  },
  {
    name: "YouTube",
    description: "チュートリアル、制作過程、技術解説動画を公開",
    url: "https://youtube.com/@samuido",
    category: "sns",
    icon: <Youtube size={24} />,
    stats: {
      followers: 67,
      posts: 12,
      lastUpdate: "2025-06-28"
    },
    isActive: true
  },
  {
    name: "Instagram",
    description: "デザイン作品、制作過程、日常の投稿",
    url: "https://instagram.com/samuido_design",
    category: "sns",
    icon: <Instagram size={24} />,
    stats: {
      followers: 34,
      posts: 45,
      lastUpdate: "2025-07-03"
    },
    isActive: true
  },

  // Development
  {
    name: "GitHub",
    description: "オープンソースプロジェクト、After Effectsプラグイン、Webサイトのソースコード",
    url: "https://github.com/rebuildup",
    category: "development",
    icon: <Github size={24} />,
    stats: {
      followers: 23,
      posts: 15,
      lastUpdate: "2025-07-06"
    },
    isActive: true
  },
  {
    name: "Qiita",
    description: "技術記事、チュートリアル、開発ノウハウの共有",
    url: "https://qiita.com/samuido",
    category: "development",
    icon: <ExternalLink size={24} />,
    stats: {
      followers: 8,
      posts: 6,
      lastUpdate: "2025-06-15"
    },
    isActive: false
  },
  {
    name: "Zenn",
    description: "技術ブログ、深掘り記事、実装解説",
    url: "https://zenn.dev/samuido",
    category: "development",
    icon: <ExternalLink size={24} />,
    stats: {
      followers: 12,
      posts: 9,
      lastUpdate: "2025-06-20"
    },
    isActive: true
  },
  {
    name: "個人ブログ",
    description: "技術共有、プロジェクト紹介、開発日記",
    url: "https://blog.yusuke-kim.com",
    category: "development",
    icon: <ExternalLink size={24} />,
    stats: {
      posts: 23,
      lastUpdate: "2025-06-30"
    },
    isActive: false
  },

  // Creative
  {
    name: "Behance",
    description: "デザイン作品、ポートフォリオ、クリエイティブプロジェクト",
    url: "https://behance.net/samuido",
    category: "creative",
    icon: <ExternalLink size={24} />,
    stats: {
      followers: 15,
      posts: 8,
      lastUpdate: "2025-06-25"
    },
    isActive: false
  },
  {
    name: "Dribbble",
    description: "UI/UXデザイン、インターフェースデザイン、デザインスケッチ",
    url: "https://dribbble.com/samuido",
    category: "creative",
    icon: <ExternalLink size={24} />,
    stats: {
      followers: 19,
      posts: 12,
      lastUpdate: "2025-06-18"
    },
    isActive: false
  },
  {
    name: "ArtStation",
    description: "アート作品、3D作品、イラストレーション",
    url: "https://artstation.com/samuido",
    category: "creative",
    icon: <ExternalLink size={24} />,
    stats: {
      followers: 7,
      posts: 4,
      lastUpdate: "2025-05-30"
    },
    isActive: false
  },

  // Other
  {
    name: "ポートフォリオサイト",
    description: "作品集、プロフィール、連絡先情報",
    url: "https://yusuke-kim.com",
    category: "other",
    icon: <ExternalLink size={24} />,
    stats: {
      lastUpdate: "2025-07-06"
    },
    isActive: true
  },
  {
    name: "Booth",
    description: "After Effectsプラグイン、素材、ツールの販売",
    url: "https://samuido.booth.pm",
    category: "other",
    icon: <ExternalLink size={24} />,
    stats: {
      posts: 3,
      lastUpdate: "2025-06-12"
    },
    isActive: true
  },
];

export default function LinksPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'followers' | 'recent'>('followers');

  const filteredLinks = linkItems
    .filter(link => {
      const matchesCategory = selectedCategory === 'all' || link.category === selectedCategory;
      const matchesSearch = link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           link.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'followers') {
        return (b.stats?.followers || 0) - (a.stats?.followers || 0);
      }
      if (sortBy === 'recent') {
        const dateA = new Date(a.stats?.lastUpdate || '2000-01-01');
        const dateB = new Date(b.stats?.lastUpdate || '2000-01-01');
        return dateB.getTime() - dateA.getTime();
      }
      return a.name.localeCompare(b.name);
    });

  const totalFollowers = linkItems.reduce((sum, link) => sum + (link.stats?.followers || 0), 0);
  const totalPosts = linkItems.reduce((sum, link) => sum + (link.stats?.posts || 0), 0);
  const activeLinks = linkItems.filter(link => link.isActive).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "samuido Links",
    "description": "木村友亮の外部リンク集",
    "url": "https://yusuke-kim.com/about/links",
    "author": {
      "@type": "Person",
      "name": "木村友亮",
      "alternateName": "samuido"
    },
    "mainEntity": {
      "@type": "ItemList",
      "name": "外部リンク一覧",
      "description": "SNS、開発、クリエイティブ関連の外部リンク"
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
              href="/about" 
              className="neue-haas-grotesk-display text-2xl text-primary hover:text-primary/80 flex items-center gap-2"
            >
              <ArrowLeft size={24} />
              About
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="text-center py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-4 border-2 border-primary rounded-full">
                <MapPin size={48} className="text-primary" />
              </div>
            </div>
            <h1 className="neue-haas-grotesk-display text-6xl md:text-8xl text-primary mb-4">
              Links
            </h1>
            <h2 className="zen-kaku-gothic-new text-2xl md:text-3xl text-foreground mb-6">
              リンクマップ
            </h2>
            <p className="noto-sans-jp text-xl text-foreground/80 leading-relaxed max-w-2xl mx-auto">
              SNS、開発、クリエイティブ関連の外部リンク集。<br />
              各種サービスへの導線を提供します。
            </p>
          </div>
          <div className="mt-8 h-1 w-32 bg-primary mx-auto"></div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 pb-16">
          {/* Statistics */}
          <section className="mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center p-6 border border-foreground/20 bg-gray/50">
                <div className="flex justify-center mb-2">
                  <Users size={32} className="text-primary" />
                </div>
                <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {totalFollowers}
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  総フォロワー数
                </p>
              </div>
              
              <div className="text-center p-6 border border-foreground/20 bg-gray/50">
                <div className="flex justify-center mb-2">
                  <TrendingUp size={32} className="text-primary" />
                </div>
                <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {totalPosts}
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  総投稿数
                </p>
              </div>
              
              <div className="text-center p-6 border border-foreground/20 bg-gray/50">
                <div className="flex justify-center mb-2">
                  <ExternalLink size={32} className="text-primary" />
                </div>
                <h3 className="neue-haas-grotesk-display text-2xl text-primary mb-1">
                  {activeLinks}
                </h3>
                <p className="noto-sans-jp text-foreground/70 text-sm">
                  アクティブリンク
                </p>
              </div>
            </div>
          </section>

          {/* Filters and Search */}
          <section className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {['all', 'sns', 'development', 'creative', 'other'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'text-foreground/70 hover:text-foreground border border-foreground/20 bg-gray/50'
                    }`}
                  >
                    {category === 'all' ? 'すべて' : 
                     category === 'sns' ? 'SNS' :
                     category === 'development' ? '開発' :
                     category === 'creative' ? 'クリエイティブ' : 'その他'}
                  </button>
                ))}
              </div>

              {/* Search and Sort */}
              <div className="flex gap-4 items-center">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                  <input
                    type="text"
                    placeholder="リンクを検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-foreground/20 bg-gray/50 text-foreground placeholder-foreground/50 focus:outline-none focus:border-primary"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'followers' | 'recent')}
                  className="px-4 py-2 border border-foreground/20 bg-gray/50 text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="followers">フォロワー順</option>
                  <option value="recent">更新順</option>
                  <option value="name">名前順</option>
                </select>
              </div>
            </div>
          </section>

          {/* Links Grid */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-6 border border-foreground/20 bg-gray/50 hover:bg-gray transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-primary group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="neue-haas-grotesk-display text-lg text-foreground">
                          {link.name}
                        </h3>
                        {link.isActive && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <p className="noto-sans-jp text-sm text-foreground/70 leading-relaxed mb-3">
                        {link.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  {link.stats && (
                    <div className="flex flex-wrap gap-4 text-xs text-foreground/60">
                      {link.stats.followers && (
                        <div className="flex items-center gap-1">
                          <Users size={12} />
                          <span>{link.stats.followers}</span>
                        </div>
                      )}
                      {link.stats.posts && (
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          <span>{link.stats.posts}</span>
                        </div>
                      )}
                      {link.stats.lastUpdate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(link.stats.lastUpdate).toLocaleDateString('ja-JP')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 text-primary text-sm font-medium group-hover:underline">
                    サイトを開く →
                  </div>
                </Link>
              ))}
            </div>

            {filteredLinks.length === 0 && (
              <div className="text-center py-12">
                <p className="noto-sans-jp text-foreground/60">
                  該当するリンクが見つかりませんでした。
                </p>
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-foreground/20 py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
}