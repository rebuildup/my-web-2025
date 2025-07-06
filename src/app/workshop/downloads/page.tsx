'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { useState, useMemo } from 'react';

// Sample download data based on the download.json structure
const sampleDownloadData = [
  {
    id: 'download-1',
    type: 'download',
    title: 'Motion Graphics Template Pack',
    description: 'プロフェッショナルなAfter Effects用モーショングラフィックステンプレート。タイトル、トランジション、ローワーサードを含む包括的なパック。',
    category: 'templates',
    tags: ['Motion Graphics', 'Templates', 'After Effects', 'Titles', 'Transitions'],
    status: 'published',
    priority: 95,
    createdAt: '2024-12-01T10:00:00.000Z',
    updatedAt: '2024-12-10T15:30:00.000Z',
    publishedAt: '2024-12-01T10:00:00.000Z',
    thumbnail: '/images/downloads/motion-graphics-pack-thumb.jpg',
    downloadInfo: {
      fileName: 'motion-graphics-template-pack-v2.0.zip',
      fileSize: 45678901,
      fileType: 'application/zip',
      version: '2.0.0',
      downloadCount: 892
    },
    stats: { views: 2341, downloads: 892, likes: 156 },
    license: 'Commercial Use Allowed',
    pricing: 'free'
  },
  {
    id: 'download-2',
    type: 'download',
    title: 'UI Design Kit for Figma',
    description: 'モダンなWebとモバイルアプリケーション用の完全なUIデザインシステム。コンポーネント、アイコン、デザイントークンを含む。',
    category: 'design-kits',
    tags: ['UI Design', 'Figma', 'Design System', 'Components', 'Icons'],
    status: 'published',
    priority: 88,
    createdAt: '2024-11-15T09:00:00.000Z',
    updatedAt: '2024-12-05T14:20:00.000Z',
    publishedAt: '2024-11-15T09:00:00.000Z',
    thumbnail: '/images/downloads/ui-design-kit-thumb.jpg',
    downloadInfo: {
      fileName: 'ui-design-kit-figma-v1.3.zip',
      fileSize: 23456789,
      fileType: 'application/zip',
      version: '1.3.0',
      downloadCount: 567
    },
    stats: { views: 1456, downloads: 567, likes: 89 },
    license: 'Commercial Use',
    pricing: 'free'
  },
  {
    id: 'download-3',
    type: 'download',
    title: 'Color Palette Collection',
    description: 'デザイナー、開発者、デジタルアーティスト向けの厳選された100+のカラーパレットコレクション。トレンドと時代を超越した組み合わせを含む。',
    category: 'color-palettes',
    tags: ['Color Palettes', 'Design', 'Colors', 'Inspiration', 'Swatches'],
    status: 'published',
    priority: 82,
    createdAt: '2024-10-20T13:30:00.000Z',
    updatedAt: '2024-11-25T10:45:00.000Z',
    publishedAt: '2024-10-20T13:30:00.000Z',
    thumbnail: '/images/downloads/color-palette-collection-thumb.jpg',
    downloadInfo: {
      fileName: 'color-palette-collection-v1.0.zip',
      fileSize: 12345678,
      fileType: 'application/zip',
      version: '1.0.0',
      downloadCount: 234
    },
    stats: { views: 678, downloads: 234, likes: 45 },
    license: 'Unlimited commercial projects',
    pricing: 'free'
  },
  {
    id: 'download-4',
    type: 'download',
    title: 'Web Development Starter Kit',
    description: 'モダンなWeb開発用のスターターキット。React、TypeScript、Tailwind CSSのプロジェクトテンプレートとユーティリティ。',
    category: 'templates',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Web Development', 'Starter Kit'],
    status: 'published',
    priority: 90,
    createdAt: '2024-09-15T11:00:00.000Z',
    updatedAt: '2024-11-10T16:20:00.000Z',
    publishedAt: '2024-09-15T11:00:00.000Z',
    thumbnail: '/images/downloads/web-starter-kit-thumb.jpg',
    downloadInfo: {
      fileName: 'web-development-starter-kit-v3.1.zip',
      fileSize: 18765432,
      fileType: 'application/zip',
      version: '3.1.0',
      downloadCount: 1123
    },
    stats: { views: 1789, downloads: 1123, likes: 203 },
    license: 'MIT License',
    pricing: 'free'
  },
  {
    id: 'download-5',
    type: 'download',
    title: 'Icon Pack Collection',
    description: '1000+のベクターアイコンパック。複数のスタイルとフォーマットで、Webとモバイルデザインに最適。',
    category: 'design-kits',
    tags: ['Icons', 'Vector', 'UI', 'Design', 'SVG'],
    status: 'published',
    priority: 85,
    createdAt: '2024-08-20T14:30:00.000Z',
    updatedAt: '2024-10-15T12:45:00.000Z',
    publishedAt: '2024-08-20T14:30:00.000Z',
    thumbnail: '/images/downloads/icon-pack-thumb.jpg',
    downloadInfo: {
      fileName: 'icon-pack-collection-v2.5.zip',
      fileSize: 34567890,
      fileType: 'application/zip',
      version: '2.5.0',
      downloadCount: 678
    },
    stats: { views: 1234, downloads: 678, likes: 124 },
    license: 'Attribution required',
    pricing: 'free'
  },
  {
    id: 'download-6',
    type: 'download',
    title: 'Photography Lightroom Presets',
    description: 'プロフェッショナルなLightroomプリセットコレクション。ポートレート、風景、ストリートフォトグラフィー用。',
    category: 'photography',
    tags: ['Lightroom', 'Presets', 'Photography', 'Editing', 'Filters'],
    status: 'published',
    priority: 87,
    createdAt: '2024-07-10T09:15:00.000Z',
    updatedAt: '2024-09-25T11:30:00.000Z',
    publishedAt: '2024-07-10T09:15:00.000Z',
    thumbnail: '/images/downloads/lightroom-presets-thumb.jpg',
    downloadInfo: {
      fileName: 'lightroom-presets-collection-v1.8.zip',
      fileSize: 56789012,
      fileType: 'application/zip',
      version: '1.8.0',
      downloadCount: 445
    },
    stats: { views: 987, downloads: 445, likes: 87 },
    license: 'Personal and Commercial Use',
    pricing: 'free'
  }
];

// Categories and their colors
const categories = {
  'templates': { 
    label: 'テンプレート', 
    color: 'bg-purple-100 text-purple-800', 
    icon: '📋',
    count: 2 
  },
  'design-kits': { 
    label: 'デザインキット', 
    color: 'bg-blue-100 text-blue-800', 
    icon: '🎨',
    count: 2 
  },
  'color-palettes': { 
    label: 'カラーパレット', 
    color: 'bg-green-100 text-green-800', 
    icon: '🌈',
    count: 1 
  },
  'photography': { 
    label: 'フォトグラフィー', 
    color: 'bg-pink-100 text-pink-800', 
    icon: '📸',
    count: 1 
  }
};

export default function DownloadsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'downloads'>('newest');

  // Filter and sort downloads
  const filteredDownloads = useMemo(() => {
    let filtered = sampleDownloadData.filter(download => {
      const matchesSearch = download.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           download.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           download.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || download.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort downloads
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
  }, [searchQuery, selectedCategory, sortBy]);

  // Calculate stats
  const totalDownloads = sampleDownloadData.reduce((sum, download) => sum + download.stats.downloads, 0);
  const totalViews = sampleDownloadData.reduce((sum, download) => sum + download.stats.views, 0);
  const totalFiles = sampleDownloadData.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              📦 ダウンロード
            </h1>
            <p className="text-xl text-green-100 mb-6 max-w-2xl mx-auto">
              無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供しています。
            </p>
            <Link
              href="/workshop"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-green-600 transition-all duration-200"
            >
              ← Workshopへ戻る
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalFiles}</div>
              <div className="text-green-100 text-sm">ファイル数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalDownloads.toLocaleString()}</div>
              <div className="text-green-100 text-sm">総ダウンロード</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalViews.toLocaleString()}</div>
              <div className="text-green-100 text-sm">総閲覧数</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-green-100 text-sm">カテゴリ</div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <label htmlFor="search" className="block text-sm font-medium text-white mb-2">
                  ファイルを検索
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="ファイル名、説明、タグから検索..."
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
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Results Summary */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            {filteredDownloads.length}件のファイルが見つかりました
            {searchQuery && (
              <span className="font-semibold">「{searchQuery}」の検索結果</span>
            )}
          </p>
        </div>

        {/* Downloads Grid */}
        {filteredDownloads.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredDownloads.map((download) => (
              <DownloadCard key={download.id} download={download} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              ファイルが見つかりませんでした
            </h3>
            <p className="text-gray-600 mb-6">
              検索条件を変更するか、フィルターをリセットしてください。
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              フィルターをリセット
            </button>
          </div>
        )}

        {/* Featured Categories */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            カテゴリ別ダウンロード
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
                  {category.count}件のファイル
                </p>
                <div className="text-green-600 font-semibold text-sm">
                  ファイルを見る →
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Download Card Component
interface DownloadCardProps {
  download: typeof sampleDownloadData[0];
}

function DownloadCard({ download }: DownloadCardProps) {
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

  const categoryInfo = categories[download.category as keyof typeof categories];

  const handleDownload = async () => {
    // In a real implementation, this would track the download and serve the file
    console.log('Downloading:', download.downloadInfo.fileName);
    
    // Track download stats
    try {
      await fetch('/api/stats/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: download.id })
      });
    } catch (error) {
      console.log('Stats tracking failed:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
        <span className="text-4xl">{categoryInfo.icon}</span>
        <div className="absolute top-4 right-4">
          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            FREE
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Category and Version */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryInfo.color}`}>
            {categoryInfo.label}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            v{download.downloadInfo.version}
          </span>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
          {download.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {download.description}
        </p>

        {/* File Info */}
        <div className="mb-4 text-xs text-gray-500">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center">
              <span className="mr-2">📄</span>
              <span>{download.downloadInfo.fileType.split('/')[1].toUpperCase()}</span>
            </span>
            <span>{formatFileSize(download.downloadInfo.fileSize)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <span className="mr-2">📅</span>
              <span>{formatDate(download.updatedAt)}</span>
            </span>
            <span className="flex items-center">
              <span className="mr-2">⚖️</span>
              <span>Free</span>
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {download.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              #{tag}
            </span>
          ))}
          {download.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              +{download.tags.length - 3}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              👁️ {download.stats.views.toLocaleString()}
            </span>
            <span className="flex items-center">
              ⬇️ {download.stats.downloads.toLocaleString()}
            </span>
            <span className="flex items-center">
              ❤️ {download.stats.likes}
            </span>
          </div>
        </div>

        {/* License Info */}
        <div className="border-t pt-4 mb-4">
          <div className="text-xs text-gray-500 mb-2">ライセンス:</div>
          <div className="text-xs text-gray-700 font-medium">{download.license}</div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
          >
            ⬇️ ダウンロード
          </button>
          <Link
            href={`/workshop/downloads/${download.id}`}
            className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-semibold"
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
  title: 'Downloads - samuido | ファイルダウンロード',
  description: '無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供。',
  keywords: ['ダウンロード', '素材', 'ツール', 'テンプレート', '無償配布', 'ファイル'],
  robots: 'index, follow',
  openGraph: {
    title: 'Downloads - samuido | ファイルダウンロード',
    description: '無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供。',
    type: 'website',
    url: 'https://yusuke-kim.com/workshop/downloads',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop/downloads-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Downloads - samuido'
      }
    ],
    siteName: 'samuido',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downloads - samuido | ファイルダウンロード',
    description: '無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供。',
    images: ['https://yusuke-kim.com/workshop/downloads-twitter-image.jpg'],
    creator: '@361do_sleep'
  },
  alternates: {
    canonical: 'https://yusuke-kim.com/workshop/downloads'
  }
};