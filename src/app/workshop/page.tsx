import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  BookOpen, 
  Download, 
  Package, 
  Star, 
  TrendingUp, 
  Users, 
  Calendar,
  Eye,
  ArrowRight,
  Zap,
  Heart,
  MessageCircle,
  Share,
  Search,
  Filter,
  Grid,
  List
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Workshop - samuido | ブログ・プラグイン・素材配布',
  description: 'samuidoのワークショップ。技術ブログ、After Effectsプラグイン、デザイン素材の配布を行っています。',
  keywords: ['ワークショップ', 'ブログ', 'プラグイン', '素材', 'After Effects', 'チュートリアル'],
  openGraph: {
    title: 'Workshop - samuido | ブログ・プラグイン・素材配布',
    description: 'samuidoのワークショップ。技術ブログ、After Effectsプラグイン、デザイン素材の配布を行っています。',
    type: 'website',
    url: '/workshop',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Workshop - samuido | ブログ・プラグイン・素材配布',
    description: 'samuidoのワークショップ。技術ブログ、After Effectsプラグイン、デザイン素材の配布を行っています。',
    creator: '@361do_sleep',
  },
};

const sections = [
  {
    id: 'blog',
    title: 'Blog',
    subtitle: '技術ブログ',
    description: 'Web開発、デザイン、映像制作に関する記事やチュートリアル',
    icon: <BookOpen size={48} />,
    gradient: 'from-blue-500 to-purple-600',
    stats: {
      posts: 15,
      views: '12.5k',
      subscribers: 328,
    },
    features: [
      'Web開発・React/Next.js',
      'After Effects テクニック',
      'デザインワークフロー',
      'ツール・プラグイン解説',
    ],
    ctaText: 'ブログを読む',
    href: '/workshop/blog',
  },
  {
    id: 'plugins',
    title: 'Plugins',
    subtitle: 'プラグイン配布',
    description: 'After Effects、Premiere Pro向けの自作プラグイン・スクリプト',
    icon: <Package size={48} />,
    gradient: 'from-green-500 to-teal-600',
    stats: {
      plugins: 8,
      downloads: '3.2k',
      rating: 4.8,
    },
    features: [
      'After Effects プラグイン',
      'Premiere Pro エクステンション',
      'ワークフロー自動化',
      '無料・有料プラグイン',
    ],
    ctaText: 'プラグインを見る',
    href: '/workshop/plugins',
  },
  {
    id: 'downloads',
    title: 'Downloads',
    subtitle: '素材ダウンロード',
    description: 'テンプレート、プリセット、デザイン素材の無料・有料配布',
    icon: <Download size={48} />,
    gradient: 'from-red-500 to-pink-600',
    stats: {
      materials: 25,
      downloads: '8.7k',
      licenses: 'MIT/CC',
    },
    features: [
      'After Effects テンプレート',
      'Figma デザインキット',
      'アイコン・素材集',
      'カラーパレット',
    ],
    ctaText: '素材をダウンロード',
    href: '/workshop/downloads',
  },
];

const recentUpdates = [
  {
    type: 'blog',
    title: 'Next.js 15 & React 19 の新機能解説',
    description: '最新バージョンの主要な変更点と実装のポイント',
    date: '2025-01-05',
    views: 1247,
    category: 'Web開発',
    author: 'samuido',
  },
  {
    type: 'plugin',
    title: 'AE Batch Renderer v2.1',
    description: 'After Effects用バッチレンダリングプラグインのアップデート',
    date: '2024-12-28',
    downloads: 342,
    category: 'After Effects',
    version: 'v2.1',
  },
  {
    type: 'download',
    title: 'モダンUI デザインキット',
    description: 'Figma用の包括的なUIコンポーネントセット',
    date: '2024-12-20',
    downloads: 856,
    category: 'デザイン素材',
    license: 'MIT',
  },
  {
    type: 'blog',
    title: 'TypeScript で学ぶ関数型プログラミング',
    description: '実用的な関数型プログラミングのテクニック集',
    date: '2024-12-15',
    views: 932,
    category: 'プログラミング',
    author: 'samuido',
  },
];

const popularTags = [
  { name: 'React', count: 12 },
  { name: 'After Effects', count: 18 },
  { name: 'TypeScript', count: 8 },
  { name: 'Next.js', count: 10 },
  { name: 'デザイン', count: 15 },
  { name: 'プラグイン', count: 7 },
  { name: 'チュートリアル', count: 22 },
  { name: 'Figma', count: 6 },
];

const highlights = [
  {
    icon: <Star size={24} />,
    title: '高品質なコンテンツ',
    description: '実務で使える技術・ツールを厳選して紹介',
  },
  {
    icon: <Zap size={24} />,
    title: '定期更新',
    description: '最新技術やトレンドを継続的にキャッチアップ',
  },
  {
    icon: <Users size={24} />,
    title: 'コミュニティ',
    description: '読者・ユーザーとの交流を大切にしています',
  },
  {
    icon: <Heart size={24} />,
    title: '無料・オープン',
    description: '多くのコンテンツを無料で提供',
  },
];

export default function WorkshopPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'samuido Workshop',
    description: '技術ブログ、プラグイン配布、素材ダウンロード',
    url: 'https://yusuke-kim.com/workshop',
    author: {
      '@type': 'Person',
      name: 'samuido',
      url: 'https://yusuke-kim.com/about',
    },
    publisher: {
      '@type': 'Person',
      name: 'samuido',
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
              href="/"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Home
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="px-4 py-16 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mb-6 h-24 w-24 rounded-full flex items-center justify-center">
            <BookOpen size={48} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-6xl md:text-8xl">
            Workshop
          </h1>
          <div className="mx-auto max-w-3xl">
            <p className="noto-sans-jp text-foreground/80 text-xl leading-relaxed md:text-2xl">
              技術ブログ、プラグイン、素材を通じて
              <br />
              知識とツールを共有します
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mt-8 h-1 w-32"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 pb-16">
          {/* Workshop Sections */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-3xl">
              ワークショップセクション
            </h2>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className="border-foreground/20 bg-gray/50 border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className={`bg-gradient-to-r ${section.gradient} text-white p-6`}>
                    <div className="text-center mb-4">
                      {section.icon}
                    </div>
                    <h3 className="neue-haas-grotesk-display text-center text-2xl font-bold mb-2">
                      {section.title}
                    </h3>
                    <p className="text-center opacity-90">{section.subtitle}</p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="noto-sans-jp text-foreground/80 mb-4 leading-relaxed">
                      {section.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {Object.entries(section.stats).map(([key, value]) => (
                        <div key={key} className="text-center p-2 bg-gray/30 rounded">
                          <div className="text-primary text-lg font-bold">{value}</div>
                          <div className="text-foreground/60 text-xs capitalize">{key}</div>
                        </div>
                      ))}
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {section.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="bg-primary w-2 h-2 rounded-full"></div>
                          <span className="noto-sans-jp text-foreground/80 text-sm">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link
                      href={section.href}
                      className={`bg-gradient-to-r ${section.gradient} hover:opacity-90 text-white w-full px-4 py-3 rounded flex items-center justify-center space-x-2 transition-opacity`}
                    >
                      <span>{section.ctaText}</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Updates */}
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                最新の更新
              </h2>
              <div className="flex items-center space-x-4">
                <button className="text-foreground/60 hover:text-primary p-2 rounded">
                  <Grid size={20} />
                </button>
                <button className="text-foreground/60 hover:text-primary p-2 rounded">
                  <List size={20} />
                </button>
                <button className="text-foreground/60 hover:text-primary p-2 rounded">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {recentUpdates.map((update, index) => (
                <div
                  key={index}
                  className="border-foreground/20 bg-gray/50 hover:bg-gray/70 border rounded-lg p-6 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                      update.type === 'blog' ? 'bg-blue-100 text-blue-800' :
                      update.type === 'plugin' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {update.category}
                    </span>
                    <div className="flex items-center space-x-2 text-foreground/60 text-xs">
                      <Calendar size={14} />
                      <span>{update.date}</span>
                    </div>
                  </div>

                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                    {update.title}
                  </h3>
                  <p className="noto-sans-jp text-foreground/80 mb-4 text-sm leading-relaxed">
                    {update.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-foreground/60 text-xs">
                      {update.views && (
                        <div className="flex items-center space-x-1">
                          <Eye size={12} />
                          <span>{update.views.toLocaleString()} views</span>
                        </div>
                      )}
                      {update.downloads && (
                        <div className="flex items-center space-x-1">
                          <Download size={12} />
                          <span>{update.downloads} downloads</span>
                        </div>
                      )}
                      {update.version && (
                        <span className="text-primary bg-primary/10 px-2 py-1 rounded">
                          {update.version}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="text-foreground/60 hover:text-primary">
                        <Heart size={16} />
                      </button>
                      <button className="text-foreground/60 hover:text-primary">
                        <Share size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/workshop/blog"
                className="text-primary hover:text-primary/80 inline-flex items-center space-x-2 font-medium"
              >
                <span>すべての更新を見る</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>

          {/* Popular Tags */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-6 text-2xl text-center">
              人気のタグ
            </h2>

            <div className="flex flex-wrap justify-center gap-3">
              {popularTags.map((tag, index) => (
                <button
                  key={index}
                  className="border-foreground/20 text-foreground hover:border-primary hover:text-primary border px-4 py-2 rounded-full text-sm transition-colors"
                >
                  #{tag.name}
                  <span className="ml-2 text-xs opacity-60">({tag.count})</span>
                </button>
              ))}
            </div>

            <div className="text-center mt-6">
              <button className="text-foreground/60 hover:text-primary inline-flex items-center space-x-2">
                <Search size={16} />
                <span>タグで検索</span>
              </button>
            </div>
          </section>

          {/* Highlights */}
          <section className="mb-16">
            <h2 className="neue-haas-grotesk-display text-foreground mb-8 text-center text-2xl">
              ワークショップの特徴
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {highlights.map((highlight, index) => (
                <div
                  key={index}
                  className="border-foreground/20 bg-gray/50 border p-6 rounded-lg text-center"
                >
                  <div className="text-primary mx-auto mb-4">{highlight.icon}</div>
                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                    {highlight.title}
                  </h3>
                  <p className="noto-sans-jp text-foreground/70 text-sm leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-200 rounded-lg p-8">
              <MessageCircle size={48} className="text-purple-600 mx-auto mb-4" />
              <h2 className="neue-haas-grotesk-display text-purple-800 mb-4 text-2xl">
                最新情報をお届け
              </h2>
              <p className="noto-sans-jp text-purple-700 mb-6 leading-relaxed">
                新しいブログ記事、プラグインリリース、素材追加の通知を受け取りませんか？
              </p>

              <div className="mx-auto max-w-md">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 border-purple-300 border px-4 py-3 rounded-lg focus:outline-none focus:border-purple-500"
                  />
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors">
                    購読
                  </button>
                </div>
                <p className="noto-sans-jp text-purple-600 text-xs mt-2">
                  ※ 配信は月1-2回程度です
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido Workshop. Keep learning, keep creating! 📚
          </p>
        </footer>
      </div>
    </>
  );
}