'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { useState, useMemo } from 'react';

// Sample plugin data based on the existing plugin.json structure
const samplePluginData = [
  {
    id: 'plugin-1',
    type: 'plugin',
    title: 'Sequential PNG Preview Tool',
    description: 'After Effects用のPNGシーケンスプレビューツール。コンポジションパネルで直接シーケンスをプレビューできます。',
    category: 'after-effects',
    tags: ['After Effects', 'PNG', 'Preview', 'Animation', 'Plugin'],
    status: 'published',
    priority: 90,
    createdAt: '2024-11-30T12:00:00.000Z',
    updatedAt: '2024-12-05T16:30:00.000Z',
    publishedAt: '2024-11-30T12:00:00.000Z',
    thumbnail: '/images/plugins/sequential-png-thumb.jpg',
    downloadInfo: {
      fileName: 'sequential-png-preview-v1.2.zip',
      fileSize: 2456789,
      fileType: 'application/zip',
      version: '1.2.0',
      downloadCount: 324
    },
    stats: { views: 1124, downloads: 324, likes: 67 },
    compatibility: {
      software: 'After Effects CC 2019+',
      os: 'Windows 10, macOS 10.14+',
      requirements: '4GB RAM, 2GB ストレージ'
    },
    license: 'MIT',
    pricing: 'free'
  },
  {
    id: 'plugin-2',
    type: 'plugin',
    title: 'Advanced Expression Helper',
    description: 'After Effects用の高度なエクスプレッションライブラリ。アニメーションとモーショングラフィックス制作を効率化。',
    category: 'after-effects',
    tags: ['After Effects', 'Expressions', 'Animation', 'Motion Graphics'],
    status: 'published',
    priority: 85,
    createdAt: '2024-10-15T09:30:00.000Z',
    updatedAt: '2024-11-20T14:15:00.000Z',
    publishedAt: '2024-10-15T09:30:00.000Z',
    thumbnail: '/images/plugins/expression-helper-thumb.jpg',
    downloadInfo: {
      fileName: 'expression-helper-v2.1.zip',
      fileSize: 1847632,
      fileType: 'application/zip',
      version: '2.1.0',
      downloadCount: 567
    },
    stats: { views: 892, downloads: 567, likes: 98 },
    compatibility: {
      software: 'After Effects CC 2018+',
      os: 'Windows 10, macOS 10.13+',
      requirements: '2GB RAM, 1GB ストレージ'
    },
    license: 'GPL v3',
    pricing: 'free'
  },
  {
    id: 'plugin-3',
    type: 'plugin',
    title: 'Color Palette Generator',
    description: '高度なカラー理論アルゴリズムを使用したパレット生成ツール。デザインプロジェクトに最適な色彩を提供。',
    category: 'design-tools',
    tags: ['Color', 'Palette', 'Design', 'Generator', 'Tool'],
    status: 'published',
    priority: 80,
    createdAt: '2024-09-20T11:00:00.000Z',
    updatedAt: '2024-10-10T13:45:00.000Z',
    publishedAt: '2024-09-20T11:00:00.000Z',
    thumbnail: '/images/plugins/color-palette-thumb.jpg',
    downloadInfo: {
      fileName: 'color-palette-generator-v1.5.zip',
      fileSize: 3245890,
      fileType: 'application/zip',
      version: '1.5.0',
      downloadCount: 1203
    },
    stats: { views: 2156, downloads: 1203, likes: 134 },
    compatibility: {
      software: 'Web Browser',
      os: 'Cross Platform',
      requirements: 'Modern Browser'
    },
    license: 'MIT',
    pricing: 'free'
  },
  {
    id: 'plugin-4',
    type: 'plugin',
    title: 'Video Transition Pack',
    description: 'Premiere Pro用のカスタムトランジション集。映画的なトランジション効果を簡単に追加できます。',
    category: 'premiere-pro',
    tags: ['Premiere Pro', 'Transitions', 'Video', 'Effects'],
    status: 'published',
    priority: 88,
    createdAt: '2024-08-15T14:00:00.000Z',
    updatedAt: '2024-09-10T11:30:00.000Z',
    publishedAt: '2024-08-15T14:00:00.000Z',
    thumbnail: '/images/plugins/video-transitions-thumb.jpg',
    downloadInfo: {
      fileName: 'video-transition-pack-v1.0.zip',
      fileSize: 15678901,
      fileType: 'application/zip',
      version: '1.0.0',
      downloadCount: 789
    },
    stats: { views: 1567, downloads: 789, likes: 112 },
    compatibility: {
      software: 'Premiere Pro 2022+',
      os: 'Windows 10, macOS 10.15+',
      requirements: '8GB RAM, 5GB ストレージ'
    },
    license: 'Commercial',
    pricing: 'paid'
  },
  {
    id: 'plugin-5',
    type: 'plugin',
    title: 'Web Animation Toolkit',
    description: 'Web開発者向けのアニメーションツールキット。CSS、JavaScript、SVGアニメーションを効率的に作成。',
    category: 'web-development',
    tags: ['Web', 'Animation', 'CSS', 'JavaScript', 'SVG'],
    status: 'published',
    priority: 83,
    createdAt: '2024-07-20T10:15:00.000Z',
    updatedAt: '2024-08-25T16:45:00.000Z',
    publishedAt: '2024-07-20T10:15:00.000Z',
    thumbnail: '/images/plugins/web-animation-thumb.jpg',
    downloadInfo: {
      fileName: 'web-animation-toolkit-v2.3.zip',
      fileSize: 4567890,
      fileType: 'application/zip',
      version: '2.3.0',
      downloadCount: 456
    },
    stats: { views: 923, downloads: 456, likes: 78 },
    compatibility: {
      software: 'Any Code Editor',
      os: 'Cross Platform',
      requirements: 'Node.js 16+'
    },
    license: 'MIT',
    pricing: 'free'
  },
  {
    id: 'plugin-6',
    type: 'plugin',
    title: 'Smart Audio Sync',
    description: 'After Effects用の音声同期プラグイン。オーディオ波形を自動解析してアニメーションを同期させます。',
    category: 'after-effects',
    tags: ['After Effects', 'Audio', 'Sync', 'Animation', 'Automation'],
    status: 'published',
    priority: 87,
    createdAt: '2024-06-10T13:20:00.000Z',
    updatedAt: '2024-07-15T09:10:00.000Z',
    publishedAt: '2024-06-10T13:20:00.000Z',
    thumbnail: '/images/plugins/audio-sync-thumb.jpg',
    downloadInfo: {
      fileName: 'smart-audio-sync-v1.4.zip',
      fileSize: 3456789,
      fileType: 'application/zip',
      version: '1.4.0',
      downloadCount: 234
    },
    stats: { views: 567, downloads: 234, likes: 45 },
    compatibility: {
      software: 'After Effects CC 2020+',
      os: 'Windows 10, macOS 10.15+',
      requirements: '6GB RAM, 3GB ストレージ'
    },
    license: 'Commercial',
    pricing: 'paid'
  }
];

// Categories and their colors
const categories = {
  'after-effects': { 
    label: 'After Effects', 
    color: 'bg-purple-100 text-purple-800', 
    icon: '🎬',
    count: 3 
  },
  'premiere-pro': { 
    label: 'Premiere Pro', 
    color: 'bg-pink-100 text-pink-800', 
    icon: '🎞️',
    count: 1 
  },
  'design-tools': { 
    label: 'Design Tools', 
    color: 'bg-green-100 text-green-800', 
    icon: '🎨',
    count: 1 
  },
  'web-development': { 
    label: 'Web Development', 
    color: 'bg-blue-100 text-blue-800', 
    icon: '💻',
    count: 1 
  }
};

export default function PluginsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pricingFilter, setPricingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'downloads'>('newest');

  // Filter and sort plugins
  const filteredPlugins = useMemo(() => {
    let filtered = samplePluginData.filter(plugin => {
      const matchesSearch = plugin.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory;
      const matchesPricing = pricingFilter === 'all' || plugin.pricing === pricingFilter;
      
      return matchesSearch && matchesCategory && matchesPricing;
    });

    // Sort plugins
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'popular':
          return b.stats.views - a.stats.views;
        case 'downloads':
          return b.stats.downloads - a.stats.downloads;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, pricingFilter, sortBy]);

  // Calculate stats
  const totalDownloads = samplePluginData.reduce((sum, plugin) => sum + plugin.stats.downloads, 0);
  const totalViews = samplePluginData.reduce((sum, plugin) => sum + plugin.stats.views, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              🔌 プラグイン
            </h1>
            <p className="text-xl text-purple-100 mb-6 max-w-2xl mx-auto">
              After Effects、Premiere Pro、Web用プラグインを提供。開発したツールを無料・有料で配布しています。
            </p>
            <Link
              href="/workshop"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-purple-600 transition-all duration-200"
            >
              ← Workshopへ戻る
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{samplePluginData.length}</div>
              <div className="text-purple-100 text-sm">プラグイン数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalDownloads.toLocaleString()}</div>
              <div className="text-purple-100 text-sm">総ダウンロード</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</div>
              <div className="text-purple-100 text-sm">総閲覧数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-purple-100 text-sm">カテゴリ</div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-white mb-2">
                  プラグインを検索
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="プラグイン名、説明、タグから検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
                  カテゴリ
                </label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
                >
                  <option value="all">すべて</option>
                  {Object.entries(categories).map(([key, cat]) => (
                    <option key={key} value={key}>
                      {cat.label} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-white mb-2">
                  並び順
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
                >
                  <option value="newest">新しい順</option>
                  <option value="popular">人気順</option>
                  <option value="downloads">ダウンロード順</option>
                </select>
              </div>
            </div>

            {/* Additional Filters */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div>
                <label htmlFor="pricing" className="block text-sm font-medium text-white mb-2">
                  価格
                </label>
                <select
                  id="pricing"
                  value={pricingFilter}
                  onChange={(e) => setPricingFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none"
                >
                  <option value="all">すべて</option>
                  <option value="free">無料</option>
                  <option value="paid">有料</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Results Summary */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            {filteredPlugins.length}件のプラグインが見つかりました
            {searchQuery && (
              <span className="font-semibold">「{searchQuery}」の検索結果</span>
            )}
          </p>
        </div>

        {/* Plugins Grid */}
        {filteredPlugins.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredPlugins.map((plugin) => (
              <PluginCard key={plugin.id} plugin={plugin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              プラグインが見つかりませんでした
            </h3>
            <p className="text-gray-600 mb-6">
              検索条件を変更するか、フィルターをリセットしてください。
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPricingFilter('all');
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              フィルターをリセット
            </button>
          </div>
        )}

        {/* Featured Categories */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            カテゴリ別プラグイン
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(categories).map(([key, category]) => (
              <div
                key={key}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(key)}
              >
                <div className="text-4xl mb-4 text-center">{category.icon}</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${category.color}`}>
                  {category.label}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.label}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {category.count}件のプラグイン
                </p>
                <div className="text-purple-600 font-semibold text-sm">
                  プラグインを見る →
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Plugin Card Component
interface PluginCardProps {
  plugin: typeof samplePluginData[0];
}

function PluginCard({ plugin }: PluginCardProps) {
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categoryInfo = categories[plugin.category as keyof typeof categories];

  const handleDownload = async () => {
    // In a real implementation, this would track the download and serve the file
    console.log('Downloading:', plugin.downloadInfo.fileName);
    
    // Track download stats
    try {
      await fetch('/api/stats/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plugin.id })
      });
    } catch (error) {
      console.log('Stats tracking failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header with pricing badge */}
      <div className="relative">
        {plugin.pricing === 'paid' && (
          <div className="absolute top-4 right-4 z-10">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              💰 有料
            </span>
          </div>
        )}
        
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
          <span className="text-4xl">{categoryInfo.icon}</span>
        </div>
      </div>

      <div className="p-6">
        {/* Category and Version */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryInfo.color}`}>
            {categoryInfo.label}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            v{plugin.downloadInfo.version}
          </span>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {plugin.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {plugin.description}
        </p>

        {/* Compatibility Info */}
        <div className="mb-4 text-xs text-gray-500">
          <div className="flex items-center mb-1">
            <span className="mr-2">💻</span>
            <span>{plugin.compatibility.software}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-2">🖥️</span>
            <span>{plugin.compatibility.os}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {plugin.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              #{tag}
            </span>
          ))}
          {plugin.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{plugin.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              👁️ {plugin.stats.views.toLocaleString()}
            </span>
            <span className="flex items-center">
              ⬇️ {plugin.stats.downloads.toLocaleString()}
            </span>
            <span className="flex items-center">
              ❤️ {plugin.stats.likes}
            </span>
          </div>
        </div>

        {/* Download Info */}
        <div className="border-t pt-4 text-xs text-gray-500 mb-4">
          <div className="flex justify-between">
            <span>ファイルサイズ:</span>
            <span>{formatFileSize(plugin.downloadInfo.fileSize)}</span>
          </div>
          <div className="flex justify-between">
            <span>更新日:</span>
            <span>{formatDate(plugin.updatedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>ライセンス:</span>
            <span>{plugin.license}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
          >
            ⬇️ ダウンロード
          </button>
          <Link
            href={`/workshop/plugins/${plugin.id}`}
            className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-semibold"
          >
            詳細
          </Link>
        </div>
      </div>
    </div>
  );
}

// This would be used for static generation in a real implementation
export const metadata: Metadata = {
  title: 'Plugins - samuido | プラグイン一覧',
  description: '作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。',
  keywords: ['プラグイン', 'AfterEffects', 'Premiere Pro', 'エクスプレッション', 'エフェクト', 'ダウンロード'],
  robots: 'index, follow',
  openGraph: {
    title: 'Plugins - samuido | プラグイン一覧',
    description: '作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。',
    type: 'website',
    url: 'https://yusuke-kim.com/workshop/plugins',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop/plugins-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Plugins - samuido'
      }
    ],
    siteName: 'samuido',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plugins - samuido | プラグイン一覧',
    description: '作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。',
    images: ['https://yusuke-kim.com/workshop/plugins-twitter-image.jpg'],
    creator: '@361do_sleep'
  },
  alternates: {
    canonical: 'https://yusuke-kim.com/workshop/plugins'
  }
};