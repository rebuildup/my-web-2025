'use client';

import { Metadata } from 'next';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

// Sample blog data based on the existing blog.json structure
const sampleBlogData = [
  {
    id: 'blog-1',
    type: 'blog',
    title: 'Next.js 15とReact 19を使った最新Web開発',
    description: '最新バージョンのNext.jsとReactを使った効率的な開発手法を解説します。新機能の活用方法から実践的なテクニックまで包括的にカバー。',
    category: 'programming',
    tags: ['Next.js', 'React', 'Web Development', 'Tutorial'],
    status: 'published',
    priority: 95,
    createdAt: '2024-12-10T09:00:00.000Z',
    publishedAt: '2024-12-10T09:00:00.000Z',
    thumbnail: '/images/blog/nextjs-15-thumb.jpg',
    stats: { views: 1243, likes: 89, shares: 34 },
    readTime: '8分'
  },
  {
    id: 'blog-2',
    type: 'blog',
    title: 'After Effectsでのモーショングラフィックス制作テクニック',
    description: 'Adobe After Effectsを使った魅力的なモーショングラフィックスとアニメーションの作成テクニックとコツを紹介。',
    category: 'video',
    tags: ['After Effects', 'Motion Graphics', 'Animation', 'Video Production'],
    status: 'published',
    priority: 88,
    createdAt: '2024-11-25T14:00:00.000Z',
    publishedAt: '2024-11-25T14:00:00.000Z',
    thumbnail: '/images/blog/motion-graphics-thumb.jpg',
    stats: { views: 756, likes: 52, shares: 18 },
    readTime: '12分'
  },
  {
    id: 'blog-3',
    type: 'blog',
    title: 'デジタルデザインにおけるカラー理論の実践',
    description: 'カラー理論を理解し、デジタルデザインプロジェクトで効果的に活用する方法を詳しく解説します。',
    category: 'design',
    tags: ['Color Theory', 'Design', 'UI/UX', 'Visual Design'],
    status: 'published',
    priority: 82,
    createdAt: '2024-11-05T10:30:00.000Z',
    publishedAt: '2024-11-05T10:30:00.000Z',
    thumbnail: '/images/blog/color-theory-thumb.jpg',
    stats: { views: 432, likes: 31, shares: 12 },
    readTime: '6分'
  },
  {
    id: 'blog-4',
    type: 'blog',
    title: 'TypeScriptによる型安全なReact開発',
    description: 'TypeScriptとReactを組み合わせた型安全な開発手法。実践的なパターンとベストプラクティスを紹介。',
    category: 'programming',
    tags: ['TypeScript', 'React', 'JavaScript', 'Type Safety'],
    status: 'published',
    priority: 90,
    createdAt: '2024-10-20T16:00:00.000Z',
    publishedAt: '2024-10-20T16:00:00.000Z',
    thumbnail: '/images/blog/typescript-react-thumb.jpg',
    stats: { views: 987, likes: 76, shares: 23 },
    readTime: '10分'
  },
  {
    id: 'blog-5',
    type: 'blog',
    title: 'Figmaを使った効率的なUIデザインワークフロー',
    description: 'Figmaの高度な機能を活用したUIデザインの効率化テクニック。コンポーネント設計からプロトタイピングまで。',
    category: 'design',
    tags: ['Figma', 'UI Design', 'Design System', 'Workflow'],
    status: 'published',
    priority: 85,
    createdAt: '2024-10-05T11:30:00.000Z',
    publishedAt: '2024-10-05T11:30:00.000Z',
    thumbnail: '/images/blog/figma-workflow-thumb.jpg',
    stats: { views: 654, likes: 43, shares: 15 },
    readTime: '7分'
  },
  {
    id: 'blog-6',
    type: 'blog',
    title: 'Webパフォーマンス最適化の実践ガイド',
    description: 'Core Web Vitalsの改善からバンドルサイズの最適化まで、実際のプロジェクトで使えるパフォーマンス向上テクニック。',
    category: 'programming',
    tags: ['Performance', 'Web Optimization', 'Core Web Vitals', 'JavaScript'],
    status: 'published',
    priority: 87,
    createdAt: '2024-09-18T13:45:00.000Z',
    publishedAt: '2024-09-18T13:45:00.000Z',
    thumbnail: '/images/blog/web-performance-thumb.jpg',
    stats: { views: 823, likes: 67, shares: 29 },
    readTime: '15分'
  }
];

// Categories and their colors
const categories = {
  programming: { label: 'プログラミング', color: 'bg-blue-100 text-blue-800', count: 3 },
  video: { label: '映像制作', color: 'bg-purple-100 text-purple-800', count: 1 },
  design: { label: 'デザイン', color: 'bg-green-100 text-green-800', count: 2 }
};

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'oldest'>('newest');

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    sampleBlogData.forEach(article => {
      article.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, []);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    let filtered = sampleBlogData.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesTag = selectedTag === 'all' || article.tags.includes(selectedTag);
      
      return matchesSearch && matchesCategory && matchesTag;
    });

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'popular':
          return b.stats.views - a.stats.views;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, selectedTag, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              📝 ブログ
            </h1>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
              技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。
            </p>
            <Link
              href="/workshop"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              ← Workshopへ戻る
            </Link>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-white mb-2">
                  記事を検索
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    placeholder="タイトル、内容、タグから検索..."
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
                  <option value="oldest">古い順</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tag Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">タグでフィルター</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedTag === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-8 text-center">
          <p className="text-gray-600">
            {filteredArticles.length}件の記事が見つかりました
            {searchQuery && (
              <span className="font-semibold">「{searchQuery}」の検索結果</span>
            )}
          </p>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <BlogCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              記事が見つかりませんでした
            </h3>
            <p className="text-gray-600 mb-6">
              検索条件を変更するか、フィルターをリセットしてください。
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedTag('all');
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              フィルターをリセット
            </button>
          </div>
        )}

        {/* Featured Categories */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            カテゴリ別記事
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(categories).map(([key, category]) => (
              <div
                key={key}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedCategory(key)}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4 ${category.color}`}>
                  {category.label}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.label}の記事
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {category.count}件の記事があります
                </p>
                <div className="text-indigo-600 font-semibold text-sm">
                  記事を見る →
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Blog Card Component
interface BlogCardProps {
  article: typeof sampleBlogData[0];
}

function BlogCard({ article }: BlogCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categoryInfo = categories[article.category as keyof typeof categories];

  return (
    <Link href={`/workshop/blog/${article.id}`} className="group block">
      <article className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
        {/* Thumbnail */}
        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
          <span className="text-4xl">📝</span>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>

        <div className="p-6">
          {/* Category and Date */}
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryInfo.color}`}>
              {categoryInfo.label}
            </span>
            <div className="flex items-center text-xs text-gray-500">
              <span>📅</span>
              <span className="ml-1">{formatDate(article.publishedAt)}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {article.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {article.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{article.tags.length - 3}
              </span>
            )}
          </div>

          {/* Stats and Read Time */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                👁️ {article.stats.views.toLocaleString()}
              </span>
              <span className="flex items-center">
                ❤️ {article.stats.likes}
              </span>
              <span className="flex items-center">
                📤 {article.stats.shares}
              </span>
            </div>
            <span className="flex items-center">
              ⏱️ {article.readTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// This would be used for static generation in a real implementation
export const metadata: Metadata = {
  title: 'Blog - samuido | 技術ブログ',
  description: '技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。',
  keywords: ['技術ブログ', '開発記事', '制作過程', 'チュートリアル', 'Markdown'],
  robots: 'index, follow',
  openGraph: {
    title: 'Blog - samuido | 技術ブログ',
    description: '技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。',
    type: 'website',
    url: 'https://yusuke-kim.com/workshop/blog',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop/blog-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog - samuido'
      }
    ],
    siteName: 'samuido',
    locale: 'ja_JP'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - samuido | 技術ブログ',
    description: '技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。',
    images: ['https://yusuke-kim.com/workshop/blog-twitter-image.jpg'],
    creator: '@361do_sleep'
  },
  alternates: {
    canonical: 'https://yusuke-kim.com/workshop/blog'
  }
};