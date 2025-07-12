import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - samuido | 技術ブログ',
  description:
    '技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。',
  keywords: '技術ブログ, 開発記事, 制作過程, チュートリアル, Markdown',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/03_workshop/blog',
  },
  openGraph: {
    title: 'Blog - samuido | 技術ブログ',
    description:
      '技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。',
    type: 'website',
    url: 'https://yusuke-kim.com/03_workshop/blog',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop/blog-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Blog - samuido | 技術ブログ',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - samuido | 技術ブログ',
    description:
      '技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。',
    images: ['https://yusuke-kim.com/workshop/blog-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'samuido Blog',
  description: '技術記事、制作過程、チュートリアルなどを掲載',
  url: 'https://yusuke-kim.com/03_workshop/blog',
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
  publisher: {
    '@type': 'Organization',
    name: 'samuido',
    url: 'https://yusuke-kim.com/',
  },
};

// サンプル記事データ
const articles = [
  {
    id: 'react-19-features',
    title: 'React 19の新機能解説',
    excerpt:
      'React 19で追加された新機能について詳しく解説します。Server Components、Concurrent Features、新しいHooksなど。',
    category: '技術記事',
    tags: ['React', 'JavaScript', 'フロントエンド'],
    publishDate: '2024-12-15',
    readTime: '8分',
    views: 1250,
    image: '/blog/react-19.jpg',
  },
  {
    id: 'nextjs-15-tutorial',
    title: 'Next.js 15の新機能',
    excerpt:
      'Next.js 15で追加された新機能について詳しく解説。App Router、Server Components、Turbopackなど。',
    category: 'チュートリアル',
    tags: ['Next.js', 'React', 'TypeScript'],
    publishDate: '2024-12-10',
    readTime: '12分',
    views: 2100,
    image: '/blog/nextjs-15.jpg',
  },
  {
    id: 'motion-graphics-workflow',
    title: 'モーショングラフィックスの制作ワークフロー',
    excerpt:
      'AfterEffectsを使ったモーショングラフィックスの制作ワークフローを紹介。効率的な制作手法とTips。',
    category: '制作過程',
    tags: ['AfterEffects', 'Motion Graphics', 'デザイン'],
    publishDate: '2024-12-05',
    readTime: '15分',
    views: 890,
    image: '/blog/motion-graphics.jpg',
  },
  {
    id: 'typescript-best-practices',
    title: 'TypeScriptのベストプラクティス',
    excerpt:
      'TypeScriptを使った開発でのベストプラクティスを紹介。型定義、エラーハンドリング、パフォーマンス最適化。',
    category: '技術記事',
    tags: ['TypeScript', 'JavaScript', '開発手法'],
    publishDate: '2024-11-28',
    readTime: '10分',
    views: 1560,
    image: '/blog/typescript.jpg',
  },
  {
    id: 'webgl-threejs-tutorial',
    title: 'WebGLとThree.jsで3Dグラフィックス',
    excerpt:
      'WebGLとThree.jsを使った3Dグラフィックスの実装方法を解説。基本的な3Dオブジェクトの作成からアニメーションまで。',
    category: 'チュートリアル',
    tags: ['WebGL', 'Three.js', '3D', 'JavaScript'],
    publishDate: '2024-11-20',
    readTime: '20分',
    views: 720,
    image: '/blog/webgl-threejs.jpg',
  },
  {
    id: 'design-system-implementation',
    title: 'デザインシステムの実装方法',
    excerpt:
      'ReactとStorybookを使ったデザインシステムの実装方法を紹介。コンポーネント設計からドキュメント化まで。',
    category: '技術記事',
    tags: ['React', 'Storybook', 'デザインシステム', 'UI/UX'],
    publishDate: '2024-11-15',
    readTime: '18分',
    views: 980,
    image: '/blog/design-system.jpg',
  },
];

const categories = ['すべて', '技術記事', 'チュートリアル', '制作過程', '解説記事'];
const allTags = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'AfterEffects',
  'Motion Graphics',
  'WebGL',
  'Three.js',
  'デザイン',
  'UI/UX',
];

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-grid">
        {/* ヒーローヘッダー */}
        <section className="py-16 text-center">
          <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">Blog</h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            技術記事・チュートリアル・制作過程
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            Markdown対応で埋め込みコンテンツも表示
            <br />
            技術記事、制作過程、チュートリアルなどを掲載
          </p>
        </section>

        {/* 検索・フィルター */}
        <section className="py-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* 検索 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="記事を検索..."
                className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            {/* カテゴリフィルター */}
            <div className="flex gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                    category === 'すべて'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* タグフィルター */}
          <div className="mb-8">
            <h3 className="noto-sans-jp-regular mb-4 text-sm text-gray-300">タグで絞り込み:</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag}
                  className="rounded-lg bg-gray-800 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 記事一覧 */}
        <section className="py-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="neue-haas-grotesk-display text-2xl text-white">記事一覧</h2>
            <div className="text-sm text-gray-400">{articles.length} 記事</div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {articles.map(article => (
              <article key={article.id} className="card group">
                {/* サムネイル */}
                <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gray-700">
                  <div className="h-full w-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                </div>

                {/* メタ情報 */}
                <div className="mb-3 flex items-center gap-4 text-xs text-gray-400">
                  <span className="bg-blue-600 px-2 py-1 text-white">{article.category}</span>
                  <span>{article.publishDate}</span>
                  <span>{article.readTime}</span>
                  <span>{article.views} views</span>
                </div>

                {/* タイトル */}
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white group-hover:text-blue-400">
                  {article.title}
                </h3>

                {/* 概要 */}
                <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">{article.excerpt}</p>

                {/* タグ */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {article.tags.map(tag => (
                    <span key={tag} className="bg-gray-600 px-2 py-1 text-xs text-white">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* リンク */}
                <Link
                  href={`/03_workshop/blog/${article.id}`}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  記事を読む →
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* ページネーション */}
        <section className="py-8">
          <div className="flex items-center justify-center gap-2">
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
              前のページ
            </button>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">1</button>
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
              2
            </button>
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
              3
            </button>
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
              次のページ
            </button>
          </div>
        </section>

        {/* ナビゲーション */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/03_workshop"
              className="neue-haas-grotesk-display text-lg text-blue-400 hover:text-blue-300"
            >
              ← Workshop
            </Link>
            <div className="flex gap-4">
              <Link
                href="/03_workshop/plugins"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Plugins →
              </Link>
              <Link
                href="/03_workshop/downloads"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Downloads →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
