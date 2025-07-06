import Link from 'next/link';
import type { Metadata } from 'next';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Bookmark,
  TrendingUp,
  Star,
  MessageCircle,
  ArrowRight,
  Tag,
  Grid,
  List,
  Rss
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'ブログ - samuido Workshop | 技術記事・チュートリアル',
  description: 'Web開発、デザイン、映像制作に関する技術記事とチュートリアル。React、Next.js、After Effectsなど。',
  keywords: ['ブログ', '技術記事', 'React', 'Next.js', 'After Effects', 'チュートリアル', 'Web開発'],
  openGraph: {
    title: 'ブログ - samuido Workshop | 技術記事・チュートリアル',
    description: 'Web開発、デザイン、映像制作に関する技術記事とチュートリアル。React、Next.js、After Effectsなど。',
    type: 'website',
    url: '/workshop/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ブログ - samuido Workshop | 技術記事・チュートリアル',
    description: 'Web開発、デザイン、映像制作に関する技術記事とチュートリアル。React、Next.js、After Effectsなど。',
    creator: '@361do_sleep',
  },
};

const blogPosts = [
  {
    id: 'next15-react19-guide',
    title: 'Next.js 15 & React 19 完全ガイド',
    excerpt: '最新バージョンの主要な変更点、新機能、移行のポイントを実例とともに詳しく解説します。',
    content: 'Next.js 15とReact 19がリリースされ、多くの新機能と改善が追加されました...',
    category: 'Web開発',
    tags: ['Next.js', 'React', 'TypeScript', '2025'],
    date: '2025-01-05',
    readTime: 12,
    views: 1247,
    likes: 89,
    featured: true,
    author: 'samuido',
    thumbnail: '/images/blog/next15-react19.jpg',
  },
  {
    id: 'typescript-functional-programming',
    title: 'TypeScript で学ぶ関数型プログラミング',
    excerpt: '実用的な関数型プログラミングのテクニックをTypeScriptで実装。純粋関数から高階関数まで。',
    content: '関数型プログラミングは、TypeScriptとの相性が非常に良く...',
    category: 'プログラミング',
    tags: ['TypeScript', '関数型', 'プログラミング'],
    date: '2024-12-15',
    readTime: 8,
    views: 932,
    likes: 67,
    featured: false,
    author: 'samuido',
    thumbnail: '/images/blog/typescript-fp.jpg',
  },
  {
    id: 'after-effects-automation',
    title: 'After Effects ワークフロー自動化術',
    excerpt: 'スクリプトとエクスプレッションを使って、After Effectsでの作業を劇的に効率化する方法。',
    content: 'After Effectsでの繰り返し作業を自動化することで...',
    category: '映像制作',
    tags: ['After Effects', '自動化', 'スクリプト'],
    date: '2024-12-01',
    readTime: 15,
    views: 1543,
    likes: 112,
    featured: true,
    author: 'samuido',
    thumbnail: '/images/blog/ae-automation.jpg',
  },
  {
    id: 'tailwind-css-advanced',
    title: 'Tailwind CSS 高度なテクニック集',
    excerpt: 'カスタムコンポーネント、プラグイン作成、パフォーマンス最適化まで。Tailwindを使いこなす。',
    content: 'Tailwind CSSの基本を超えて、より高度なテクニックを...',
    category: 'デザイン',
    tags: ['Tailwind CSS', 'CSS', 'デザインシステム'],
    date: '2024-11-20',
    readTime: 10,
    views: 856,
    likes: 54,
    featured: false,
    author: 'samuido',
    thumbnail: '/images/blog/tailwind-advanced.jpg',
  },
  {
    id: 'react-performance-optimization',
    title: 'React パフォーマンス最適化ガイド',
    excerpt: 'メモ化、コード分割、レンダリング最適化など、Reactアプリを高速化するテクニック。',
    content: 'Reactアプリケーションのパフォーマンスを向上させるには...',
    category: 'Web開発',
    tags: ['React', 'パフォーマンス', '最適化'],
    date: '2024-11-05',
    readTime: 14,
    views: 1189,
    likes: 78,
    featured: false,
    author: 'samuido',
    thumbnail: '/images/blog/react-performance.jpg',
  },
  {
    id: 'figma-plugin-development',
    title: 'Figma プラグイン開発入門',
    excerpt: 'TypeScriptとFigma APIを使って、デザインワークフローを改善するプラグインを作成。',
    content: 'Figmaプラグインを開発することで、デザインプロセスを...',
    category: 'デザイン',
    tags: ['Figma', 'プラグイン', 'API'],
    date: '2024-10-28',
    readTime: 11,
    views: 743,
    likes: 45,
    featured: false,
    author: 'samuido',
    thumbnail: '/images/blog/figma-plugin.jpg',
  },
];

const categories = [
  { name: 'すべて', slug: 'all', count: blogPosts.length },
  { name: 'Web開発', slug: 'web', count: blogPosts.filter(p => p.category === 'Web開発').length },
  { name: '映像制作', slug: 'video', count: blogPosts.filter(p => p.category === '映像制作').length },
  { name: 'デザイン', slug: 'design', count: blogPosts.filter(p => p.category === 'デザイン').length },
  { name: 'プログラミング', slug: 'programming', count: blogPosts.filter(p => p.category === 'プログラミング').length },
];

const popularTags = [
  'React', 'Next.js', 'TypeScript', 'After Effects', 'Tailwind CSS', 'パフォーマンス', '自動化', 'プラグイン'
];

const featuredPosts = blogPosts.filter(post => post.featured);
const recentPosts = blogPosts.slice(0, 4);

export default function BlogPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'samuido Workshop Blog',
    description: 'Web開発、デザイン、映像制作に関する技術記事とチュートリアル',
    url: 'https://yusuke-kim.com/workshop/blog',
    author: {
      '@type': 'Person',
      name: 'samuido',
      url: 'https://yusuke-kim.com/about',
    },
    blogPost: blogPosts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      author: {
        '@type': 'Person',
        name: post.author,
      },
      url: `https://yusuke-kim.com/workshop/blog/${post.id}`,
    })),
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mb-6 h-20 w-20 rounded-full flex items-center justify-center">
            <BookOpen size={40} className="text-white" />
          </div>
          <h1 className="neue-haas-grotesk-display text-primary mb-4 text-4xl md:text-6xl">
            Blog
          </h1>
          <p className="noto-sans-jp text-foreground/80 text-lg md:text-xl">
            技術記事・チュートリアル・解説
          </p>
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-6 h-1 w-24"></div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 pb-16">
          {/* Search and Controls */}
          <section className="mb-12">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              {/* Search */}
              <div className="relative max-w-md">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/50" />
                <input
                  type="text"
                  placeholder="記事を検索..."
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
                <button className="text-foreground/60 hover:text-primary p-2 rounded">
                  <Rss size={20} />
                </button>
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

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center space-x-2 mb-8">
                <Star size={24} className="text-primary" />
                <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                  注目の記事
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {featuredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="border-foreground/20 bg-gray/50 hover:bg-gray/70 border rounded-lg overflow-hidden transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-48 flex items-center justify-center">
                      <BookOpen size={48} className="text-white/70" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-primary bg-primary/10 px-3 py-1 rounded text-sm font-medium">
                          {post.category}
                        </span>
                        <div className="flex items-center space-x-1 text-foreground/60 text-sm">
                          <Star size={16} className="text-yellow-500" />
                          <span>注目</span>
                        </div>
                      </div>

                      <h3 className="neue-haas-grotesk-display text-foreground mb-3 text-xl">
                        {post.title}
                      </h3>
                      <p className="noto-sans-jp text-foreground/80 mb-4 text-sm leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between mb-4 text-foreground/60 text-xs">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{post.readTime}分</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye size={12} />
                            <span>{post.views.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-primary bg-primary/10 px-2 py-1 rounded text-xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/workshop/blog/${post.id}`}
                          className="text-primary hover:text-primary/80 inline-flex items-center space-x-2 font-medium"
                        >
                          <span>続きを読む</span>
                          <ArrowRight size={16} />
                        </Link>

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
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Recent Posts */}
          <section className="mb-16">
            <div className="flex items-center space-x-2 mb-8">
              <TrendingUp size={24} className="text-primary" />
              <h2 className="neue-haas-grotesk-display text-foreground text-2xl">
                最新の記事
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recentPosts.map((post) => (
                <article
                  key={post.id}
                  className="border-foreground/20 bg-gray/50 hover:bg-gray/70 border rounded-lg overflow-hidden transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="bg-gradient-to-r from-gray-400 to-gray-600 h-32 flex items-center justify-center">
                    <BookOpen size={32} className="text-white/70" />
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-primary bg-primary/10 px-2 py-1 rounded text-xs font-medium">
                        {post.category}
                      </span>
                      <div className="flex items-center space-x-1 text-foreground/60 text-xs">
                        <Heart size={12} />
                        <span>{post.likes}</span>
                      </div>
                    </div>

                    <h3 className="neue-haas-grotesk-display text-foreground mb-2 text-lg">
                      {post.title}
                    </h3>
                    <p className="noto-sans-jp text-foreground/80 mb-3 text-sm leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between mb-3 text-foreground/60 text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Calendar size={10} />
                          <span>{post.date}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={10} />
                          <span>{post.readTime}分</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/workshop/blog/${post.id}`}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        続きを読む →
                      </Link>

                      <div className="flex items-center space-x-1">
                        <button className="text-foreground/60 hover:text-red-500 p-1 rounded">
                          <Heart size={14} />
                        </button>
                        <button className="text-foreground/60 hover:text-primary p-1 rounded">
                          <Share2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-8">
              <button className="border-primary text-primary hover:bg-primary hover:text-white border px-6 py-3 rounded-lg transition-colors">
                もっと見る
              </button>
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

          {/* Newsletter */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-lg p-8">
              <MessageCircle size={48} className="text-blue-600 mx-auto mb-4" />
              <h2 className="neue-haas-grotesk-display text-blue-800 mb-4 text-2xl">
                新着記事をお知らせ
              </h2>
              <p className="noto-sans-jp text-blue-700 mb-6 leading-relaxed">
                新しい技術記事やチュートリアルの更新をメールでお知らせします。
              </p>

              <div className="mx-auto max-w-md">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="flex-1 border-blue-300 border px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                    購読
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-foreground/20 border-t py-8 text-center">
          <p className="noto-sans-jp text-foreground/60 text-sm">
            © 2025 samuido Workshop Blog. Happy reading! 📖
          </p>
        </footer>
      </div>
    </>
  );
}