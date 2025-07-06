import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  Package, 
  Download, 
  Star, 
  Calendar, 
  Eye, 
  Shield, 
  CheckCircle,
  Code,
  Zap,
  Heart,
  Share2,
  ExternalLink,
  Filter,
  Search,
  Grid,
  List,
  Bookmark,
  Tag,
  Award,
  TrendingUp
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'プラグイン配布 - samuido Workshop | After Effects・Premiere Pro',
  description: 'After Effects、Premiere Pro用の自作プラグイン・スクリプトを無料・有料で配布。ワークフロー自動化で作業効率をアップ。',
  keywords: ['プラグイン', 'After Effects', 'Premiere Pro', 'スクリプト', '自動化', 'ワークフロー'],
  openGraph: {
    title: 'プラグイン配布 - samuido Workshop | After Effects・Premiere Pro',
    description: 'After Effects、Premiere Pro用の自作プラグイン・スクリプトを無料・有料で配布。ワークフロー自動化で作業効率をアップ。',
    type: 'website',
    url: '/workshop/plugins',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'プラグイン配布 - samuido Workshop | After Effects・Premiere Pro',
    description: 'After Effects、Premiere Pro用の自作プラグイン・スクリプトを無料・有料で配布。ワークフロー自動化で作業効率をアップ。',
    creator: '@361do_design',
  },
};

const plugins = [
  {
    id: 'ae-batch-renderer',
    name: 'AE Batch Renderer',
    description: 'After Effects のコンポジションを一括レンダリング。複数のコンポジションや出力設定を効率的に処理。',
    category: 'After Effects',
    version: 'v2.1.0',
    price: 'Free',
    downloads: 2847,
    rating: 4.8,
    reviews: 124,
    lastUpdated: '2024-12-28',
    features: [
      'コンポジション一括選択',
      'カスタム出力設定',
      'プログレス表示',
      'エラーハンドリング',
    ],
    requirements: ['After Effects CC 2019以降', 'Windows・Mac対応'],
    tags: ['レンダリング', '自動化', 'バッチ処理'],
    featured: true,
    status: 'stable',
  },
  {
    id: 'color-palette-extractor',
    name: 'Color Palette Extractor',
    description: '画像やビデオからカラーパレットを自動抽出。デザインワークフローを効率化。',
    category: 'After Effects',
    version: 'v1.3.2',
    price: '¥1,980',
    downloads: 1563,
    rating: 4.6,
    reviews: 89,
    lastUpdated: '2024-11-15',
    features: [
      '自動カラー抽出',
      'パレット保存・読み込み',
      'Photoshopカラー書き出し',
      'リアルタイムプレビュー',
    ],
    requirements: ['After Effects CC 2020以降'],
    tags: ['カラー', 'デザイン', 'ワークフロー'],
    featured: true,
    status: 'stable',
  },
  {
    id: 'keyframe-velocity-controller',
    name: 'Keyframe Velocity Controller',
    description: 'キーフレームの速度カーブを直感的に調整。アニメーションのクオリティを向上。',
    category: 'After Effects',
    version: 'v1.0.5',
    price: 'Free',
    downloads: 982,
    rating: 4.4,
    reviews: 67,
    lastUpdated: '2024-10-20',
    features: [
      'グラフィカルな速度調整',
      'プリセット保存',
      'イージング最適化',
      'ホットキー対応',
    ],
    requirements: ['After Effects CC 2018以降'],
    tags: ['アニメーション', 'キーフレーム', 'イージング'],
    featured: false,
    status: 'stable',
  },
  {
    id: 'expression-library',
    name: 'Expression Library Manager',
    description: 'よく使うエクスプレッションをライブラリ化して管理。コード補完機能付き。',
    category: 'After Effects',
    version: 'v2.0.0-beta',
    price: '¥980',
    downloads: 543,
    rating: 4.2,
    reviews: 32,
    lastUpdated: '2024-09-10',
    features: [
      'エクスプレッション管理',
      'コード補完',
      'スニペット保存',
      'チーム共有機能',
    ],
    requirements: ['After Effects CC 2021以降'],
    tags: ['エクスプレッション', 'コード', '効率化'],
    featured: false,
    status: 'beta',
  },
  {
    id: 'pr-multicam-sync',
    name: 'Multi-Camera Auto Sync',
    description: 'Premiere Pro で複数カメラの映像を自動同期。音声波形解析による高精度同期。',
    category: 'Premiere Pro',
    version: 'v1.2.1',
    price: '¥2,980',
    downloads: 756,
    rating: 4.7,
    reviews: 45,
    lastUpdated: '2024-08-25',
    features: [
      '音声波形解析',
      '自動同期処理',
      'タイムコード調整',
      'プレビュー機能',
    ],
    requirements: ['Premiere Pro CC 2019以降'],
    tags: ['マルチカメラ', '同期', '編集'],
    featured: false,
    status: 'stable',
  },
  {
    id: 'motion-blur-enhancer',
    name: 'Motion Blur Enhancer',
    description: 'リアルタイムモーションブラー生成。GPUアクセラレーション対応で高速処理。',
    category: 'After Effects',
    version: 'v1.1.0',
    price: 'Free',
    downloads: 1234,
    rating: 4.5,
    reviews: 78,
    lastUpdated: '2024-07-12',
    features: [
      'リアルタイム処理',
      'GPU最適化',
      '品質調整オプション',
      'プレビューモード',
    ],
    requirements: ['After Effects CC 2022以降', 'GPU必須'],
    tags: ['モーションブラー', 'GPU', 'リアルタイム'],
    featured: true,
    status: 'stable',
  },
];

const categories = [
  { name: 'すべて', slug: 'all', count: plugins.length },
  { name: 'After Effects', slug: 'ae', count: plugins.filter(p => p.category === 'After Effects').length },
  { name: 'Premiere Pro', slug: 'pr', count: plugins.filter(p => p.category === 'Premiere Pro').length },
];

const featuredPlugins = plugins.filter(plugin => plugin.featured);
const popularTags = ['自動化', 'レンダリング', 'カラー', 'アニメーション', 'ワークフロー', 'GPU', 'バッチ処理'];

const stats = {
  totalPlugins: plugins.length,
  totalDownloads: plugins.reduce((sum, plugin) => sum + plugin.downloads, 0),
  averageRating: (plugins.reduce((sum, plugin) => sum + plugin.rating, 0) / plugins.length).toFixed(1),
  freePlugins: plugins.filter(plugin => plugin.price === 'Free').length,
};

export default function PluginsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'samuido Workshop Plugins',
    description: 'After Effects、Premiere Pro用プラグイン・スクリプト配布',
    url: 'https://yusuke-kim.com/workshop/plugins',
    author: {
      '@type': 'Person',
      name: 'samuido',
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: plugins.map((plugin, index) => ({
        '@type': 'SoftwareApplication',
        position: index + 1,
        name: plugin.name,
        description: plugin.description,
        applicationCategory: plugin.category,
        operatingSystem: 'Windows, macOS',
        offers: {
          '@type': 'Offer',
          price: plugin.price === 'Free' ? '0' : plugin.price.replace('¥', ''),
          priceCurrency: 'JPY',
        },
      })),
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
              href="/workshop"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 text-2xl"
            >
              ← Workshop
            </Link>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="px-4 py-12 text-center">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center">
            <Package size={40} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
            Plugins
          </h1>
          <p className="noto-sans-jp text-foreground/80 text-lg md:text-xl">
            After Effects・Premiere Pro プラグイン配布
          </p>
          <div className="bg-gradient-to-r from-green-600 to-teal-600 mx-auto mt-6 h-1 w-24"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 pb-16">
          {/* Stats */}
          <section className="mb-12">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="text-primary text-3xl font-bold">{stats.totalPlugins}</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">プラグイン数</div>
              </div>

              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="text-primary text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">総ダウンロード数</div>
              </div>

              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="text-primary text-3xl font-bold">{stats.averageRating}</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">平均評価</div>
              </div>

              <div className="text-center p-6 bg-gray/50 border border-foreground/20 rounded-lg">
                <div className="text-primary text-3xl font-bold">{stats.freePlugins}</div>
                <div className="noto-sans-jp text-foreground/70 text-sm">無料プラグイン</div>
              </div>
            </div>
          </section>

          {/* Search and Controls */}
          <section className="mb-12">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              {/* Search */}
              <div className="relative max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                <input
                  type="text"
                  placeholder="プラグインを検索..."
                  className="border-foreground/20 bg-gray/50 text-foreground w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
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
            </div>
          </section>

          {/* Categories */}
          <section className="mb-12">
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  className="border-foreground/20 text-foreground hover:border-primary hover:text-primary border px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-60">({category.count})</span>
                </button>
              ))}
            </div>
          </section>

          {/* Featured Plugins */}
          {featuredPlugins.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center space-x-2 mb-8">
                <Award size={24} className="text-primary" />
                <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                  おすすめプラグイン
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {featuredPlugins.slice(0, 2).map((plugin) => (
                  <div
                    key={plugin.id}
                    className="border-foreground/20 bg-gray/50 border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="neue-haas-grotesk-display text-xl font-bold">
                          {plugin.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <Star size={16} className="text-yellow-300" />
                          <span className="text-sm">{plugin.rating}</span>
                        </div>
                      </div>
                      <p className="text-white/90 text-sm">{plugin.category}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <p className="noto-sans-jp text-foreground/80 mb-4 leading-relaxed">
                        {plugin.description}
                      </p>

                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="neue-haas-grotesk-display text-foreground mb-2 text-sm">
                          主な機能:
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {plugin.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <CheckCircle size={14} className="text-primary" />
                              <span className="noto-sans-jp text-foreground/80 text-xs">
                                {feature}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-2 bg-gray/30 rounded">
                          <div className="text-primary text-sm font-bold">{plugin.downloads.toLocaleString()}</div>
                          <div className="text-foreground/60 text-xs">Downloads</div>
                        </div>
                        <div className="text-center p-2 bg-gray/30 rounded">
                          <div className="text-primary text-sm font-bold">{plugin.version}</div>
                          <div className="text-foreground/60 text-xs">Version</div>
                        </div>
                        <div className="text-center p-2 bg-gray/30 rounded">
                          <div className="text-primary text-sm font-bold">{plugin.price}</div>
                          <div className="text-foreground/60 text-xs">Price</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button className="bg-primary hover:bg-primary/90 text-white flex-1 px-4 py-3 rounded flex items-center justify-center space-x-2 transition-colors">
                          <Download size={16} />
                          <span>ダウンロード</span>
                        </button>
                        <button className="border-foreground/20 text-foreground hover:border-primary border px-4 py-3 rounded flex items-center justify-center">
                          <ExternalLink size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* All Plugins */}
          <section className="mb-16">
            <div className="flex items-center space-x-2 mb-8">
              <TrendingUp size={24} className="text-primary" />
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                すべてのプラグイン
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plugins.map((plugin) => (
                <div
                  key={plugin.id}
                  className="border-foreground/20 bg-gray/50 hover:bg-gray/70 border rounded-lg p-6 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Package size={20} className="text-primary" />
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        plugin.category === 'After Effects' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {plugin.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star size={14} className="text-yellow-500" />
                      <span className="text-foreground/80 text-sm">{plugin.rating}</span>
                    </div>
                  </div>

                  <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                    {plugin.name}
                  </h3>
                  <p className="noto-sans-jp text-foreground/80 mb-3 text-sm leading-relaxed line-clamp-2">
                    {plugin.description}
                  </p>

                  {/* Status */}
                  {plugin.status === 'beta' && (
                    <div className="mb-3">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        Beta版
                      </span>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {plugin.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-primary bg-primary/10 px-2 py-1 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between mb-4 text-foreground/60 text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Download size={10} />
                        <span>{plugin.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={10} />
                        <span>{plugin.lastUpdated}</span>
                      </div>
                    </div>
                    <div className="text-primary font-medium">
                      {plugin.price}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded text-sm transition-colors">
                      ダウンロード
                    </button>

                    <div className="flex items-center space-x-2">
                      <button className="text-foreground/60 hover:text-red-500 p-2 rounded">
                        <Heart size={16} />
                      </button>
                      <button className="text-foreground/60 hover:text-primary p-2 rounded">
                        <Bookmark size={16} />
                      </button>
                      <button className="text-foreground/60 hover:text-primary p-2 rounded">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Popular Tags */}
          <section className="mb-16">
            <div className="flex items-center space-x-2 mb-6">
              <Tag size={24} className="text-primary" />
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                人気のタグ
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  className="border-foreground/20 text-foreground hover:border-primary hover:text-primary border px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </section>

          {/* Support */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-green-100 to-teal-100 border border-green-200 rounded-lg p-8">
              <Shield size={48} className="text-green-600 mx-auto mb-4" />
              <h2 className="neue-haas-grotesk-display text-green-800 mb-4 text-2xl">
                サポート・フィードバック
              </h2>
              <p className="noto-sans-jp text-green-700 mb-6 leading-relaxed">
                プラグインに関するご質問、不具合報告、機能リクエストなど
                <br />
                お気軽にお問い合わせください。
              </p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <a
                  href="mailto:361do.sleep@gmail.com"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Code size={20} />
                  <span>サポートに連絡</span>
                </a>

                <Link
                  href="/contact"
                  className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-6 py-3 rounded-lg inline-flex items-center justify-center space-x-2 transition-colors"
                >
                  <Zap size={20} />
                  <span>フィードバック</span>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido Workshop Plugins. Boost your workflow! ⚡
          </p>
        </footer>
      </div>
    </>
  );
}