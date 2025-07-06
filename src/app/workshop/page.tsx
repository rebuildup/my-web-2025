import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

// Workshop Dashboard Content
export default function WorkshopPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Header */}
      <section className="relative py-24 px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Workshop
          </h1>
          <p className="text-xl md:text-2xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            プラグイン配布、技術記事、素材ダウンロードのクリエイティブハブ
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/workshop/blog"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-all duration-200 transform hover:scale-105"
            >
              ブログを読む
            </Link>
            <Link
              href="/workshop/plugins"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all duration-200 transform hover:scale-105"
            >
              プラグインを見る
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Statistics Overview */}
        <Suspense fallback={<StatsLoading />}>
          <WorkshopStats />
        </Suspense>

        {/* Category Navigation Cards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            コンテンツカテゴリ
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <CategoryCard
              title="ブログ記事"
              description="技術記事、チュートリアル、解説記事の配信"
              href="/workshop/blog"
              icon="📝"
              features={[
                "技術解説記事",
                "制作チュートリアル",
                "開発プロセス共有",
                "ツール紹介"
              ]}
              gradient="from-blue-500 to-cyan-500"
            />
            <CategoryCard
              title="プラグイン配布"
              description="After Effects、Premiere Proなどのプラグイン"
              href="/workshop/plugins"
              icon="🔌"
              features={[
                "After Effectsプラグイン",
                "Premiere Proエクステンション",
                "無料＆有料プラグイン",
                "バージョン管理"
              ]}
              gradient="from-purple-500 to-pink-500"
            />
            <CategoryCard
              title="素材ダウンロード"
              description="テンプレート、素材集、サンプルファイル"
              href="/workshop/downloads"
              icon="📦"
              features={[
                "Motion Graphicsテンプレート",
                "UI/UXデザインキット",
                "カラーパレット集",
                "アイコン・素材集"
              ]}
              gradient="from-green-500 to-teal-500"
            />
          </div>
        </section>

        {/* Latest Content Highlights */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            最新コンテンツ
          </h2>
          <Suspense fallback={<ContentLoading />}>
            <LatestContent />
          </Suspense>
        </section>

        {/* Popular Content */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            人気コンテンツ
          </h2>
          <Suspense fallback={<ContentLoading />}>
            <PopularContent />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

// Category Card Component
interface CategoryCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  features: string[];
  gradient: string;
}

function CategoryCard({ title, description, href, icon, features, gradient }: CategoryCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
        <div className={`h-32 bg-gradient-to-r ${gradient} flex items-center justify-center`}>
          <span className="text-5xl">{icon}</span>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 mb-4 text-sm leading-relaxed">
            {description}
          </p>
          <ul className="space-y-2 mb-4">
            {features.map((feature, index) => (
              <li key={index} className="text-sm text-gray-500 flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2"></span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="text-indigo-600 font-semibold text-sm group-hover:text-indigo-700 transition-colors">
            詳細を見る →
          </div>
        </div>
      </div>
    </Link>
  );
}

// Workshop Statistics Component
async function WorkshopStats() {
  // In a real implementation, this would fetch actual stats
  const stats = {
    totalArticles: 24,
    totalPlugins: 8,
    totalDownloads: 156,
    totalViews: 8934,
    totalDownloadCount: 2463
  };

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Workshop統計
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <StatCard
          label="記事数"
          value={stats.totalArticles}
          icon="📄"
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="プラグイン数"
          value={stats.totalPlugins}
          icon="🔌"
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          label="素材数"
          value={stats.totalDownloads}
          icon="📦"
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          label="総閲覧数"
          value={stats.totalViews.toLocaleString()}
          icon="👁️"
          color="text-orange-600"
          bgColor="bg-orange-50"
        />
        <StatCard
          label="総ダウンロード数"
          value={stats.totalDownloadCount.toLocaleString()}
          icon="⬇️"
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />
      </div>
    </section>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-6 text-center hover:shadow-lg transition-shadow`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

// Latest Content Component
async function LatestContent() {
  // Mock data - in real implementation, this would fetch from API
  const latestItems = [
    {
      id: 'blog-1',
      type: 'blog',
      title: 'Next.js 15とReact 19を使った最新Web開発',
      description: '最新バージョンのNext.jsとReactを使った効率的な開発手法を解説',
      thumbnail: '/images/blog/nextjs-15-thumb.jpg',
      href: '/workshop/blog/nextjs-15-react-19',
      category: 'プログラミング',
      stats: { views: 1243, publishedAt: '2024-12-10' }
    },
    {
      id: 'plugin-1',
      type: 'plugin',
      title: 'Sequential PNG Preview Tool',
      description: 'After EffectsでPNGシーケンスを効率的にプレビューできるプラグイン',
      thumbnail: '/images/plugins/sequential-png-thumb.jpg',
      href: '/workshop/plugins/sequential-png-preview',
      category: 'プラグイン',
      stats: { downloads: 324, publishedAt: '2024-11-30' }
    },
    {
      id: 'download-1',
      type: 'download',
      title: 'Motion Graphics Template Pack',
      description: 'プロフェッショナルなモーショングラフィックステンプレート集',
      thumbnail: '/images/downloads/motion-graphics-pack-thumb.jpg',
      href: '/workshop/downloads/motion-graphics-template-pack',
      category: 'テンプレート',
      stats: { downloads: 892, publishedAt: '2024-12-01' }
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {latestItems.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
}

// Popular Content Component
async function PopularContent() {
  // Mock data - in real implementation, this would fetch from API based on stats
  const popularItems = [
    {
      id: 'download-1',
      type: 'download',
      title: 'Motion Graphics Template Pack',
      description: 'プロフェッショナルなモーショングラフィックステンプレート集',
      thumbnail: '/images/downloads/motion-graphics-pack-thumb.jpg',
      href: '/workshop/downloads/motion-graphics-template-pack',
      category: 'テンプレート',
      stats: { downloads: 892, views: 2341 }
    },
    {
      id: 'blog-1',
      type: 'blog',
      title: 'Next.js 15とReact 19を使った最新Web開発',
      description: '最新バージョンのNext.jsとReactを使った効率的な開発手法を解説',
      thumbnail: '/images/blog/nextjs-15-thumb.jpg',
      href: '/workshop/blog/nextjs-15-react-19',
      category: 'プログラミング',
      stats: { views: 1243, likes: 89 }
    },
    {
      id: 'plugin-3',
      type: 'plugin',
      title: 'Color Palette Generator',
      description: '高度なカラー理論アルゴリズムを使ったパレット生成ツール',
      thumbnail: '/images/plugins/color-palette-thumb.jpg',
      href: '/workshop/plugins/color-palette-generator',
      category: 'デザインツール',
      stats: { downloads: 1203, views: 2156 }
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {popularItems.map((item) => (
        <ContentCard key={item.id} item={item} isPopular />
      ))}
    </div>
  );
}

// Content Card Component
interface ContentCardProps {
  item: {
    id: string;
    type: string;
    title: string;
    description: string;
    thumbnail: string;
    href: string;
    category: string;
    stats: Record<string, any>;
  };
  isPopular?: boolean;
}

function ContentCard({ item, isPopular = false }: ContentCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return '📝';
      case 'plugin': return '🔌';
      case 'download': return '📦';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blog': return 'bg-blue-100 text-blue-800';
      case 'plugin': return 'bg-purple-100 text-purple-800';
      case 'download': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={item.href} className="group block">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {isPopular && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-center py-2 text-sm font-semibold">
            🔥 人気コンテンツ
          </div>
        )}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-4xl">{getTypeIcon(item.type)}</span>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(item.type)}`}>
              {item.category}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {item.description}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {item.stats.views && (
                <span className="flex items-center">
                  👁️ {item.stats.views.toLocaleString()}
                </span>
              )}
              {item.stats.downloads && (
                <span className="flex items-center">
                  ⬇️ {item.stats.downloads.toLocaleString()}
                </span>
              )}
              {item.stats.likes && (
                <span className="flex items-center">
                  ❤️ {item.stats.likes}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Loading Components
function StatsLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
          <div className="w-8 h-8 bg-gray-200 rounded mb-2"></div>
          <div className="w-12 h-6 bg-gray-200 rounded mb-1"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

function ContentLoading() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
          <div className="aspect-video bg-gray-200"></div>
          <div className="p-6">
            <div className="w-20 h-6 bg-gray-200 rounded mb-3"></div>
            <div className="w-full h-6 bg-gray-200 rounded mb-2"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between">
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// SEO Metadata
export const metadata: Metadata = {
  title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
  description: 'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
  keywords: ['AfterEffects', 'プラグイン', '技術記事', '素材配布', 'チュートリアル', 'ブログ'],
  robots: 'index, follow',
  openGraph: {
    title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
    description: 'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
    type: 'website',
    url: 'https://yusuke-kim.com/workshop',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Workshop - samuido'
      }
    ],
    siteName: 'samuido',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
    description: 'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
    images: ['https://yusuke-kim.com/workshop-twitter-image.jpg'],
    creator: '@361do_sleep'
  },
  alternates: {
    canonical: 'https://yusuke-kim.com/workshop'
  }
};