import { Metadata } from 'next';
import Link from 'next/link';
import { ContentItem } from '@/types/content';

export const metadata: Metadata = {
  title: 'Blog - samuido | 技術ブログ',
  description: '技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。',
  keywords: '技術ブログ, 開発記事, 制作過程, チュートリアル, Markdown',
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
        alt: 'Blog - samuido',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - samuido | 技術ブログ',
    description: '技術記事、制作過程、チュートリアルなどを掲載。Markdown対応で埋め込みコンテンツも表示。',
    images: ['https://yusuke-kim.com/workshop/blog-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

async function getBlogPosts() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/content/blog`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }

    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Failed to fetch blog posts:', error);
    return [];
  }
}

async function getBlogCategories(posts: ContentItem[]) {
  const categories = new Set<string>();
  posts.forEach(post => {
    if (post.category) categories.add(post.category);
    post.tags?.forEach(tag => categories.add(tag));
  });
  return Array.from(categories);
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const categories = await getBlogCategories(posts);

  const featuredPosts = posts.filter((post: ContentItem) => post.priority && post.priority > 70);
  const recentPosts = posts.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <section className="py-16 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/workshop" className="text-blue-500 hover:text-blue-400 transition-colors noto-sans-jp-light mb-4 inline-block">
            ← Workshop
          </Link>
          <h1 className="text-4xl font-bold mb-4 neue-haas-grotesk-display" style={{ color: '#0000ff' }}>
            Blog
          </h1>
          <p className="text-xl mb-6 noto-sans-jp-light">
            技術記事・制作過程・チュートリアル
          </p>
          <p className="text-lg max-w-2xl mx-auto noto-sans-jp-light text-gray-400">
            開発手法、技術解説、制作過程など、クリエイティブワークに関する記事を掲載しています。
            Markdown対応で埋め込みコンテンツも表示できます。
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-lg">
              <input
                type="text"
                placeholder="記事を検索..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-none focus:outline-none focus:border-blue-500 noto-sans-jp-light"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 bg-blue-500 text-white noto-sans-jp-light hover:bg-blue-600 transition-colors">
                全て
              </button>
              {categories.slice(0, 5).map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 text-white noto-sans-jp-light hover:bg-gray-600 transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
              注目の記事
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post: ContentItem) => (
                <article key={post.id} className="border border-gray-700 hover:border-blue-500 transition-colors group">
                  {post.thumbnail && (
                    <div className="aspect-video bg-gray-800 overflow-hidden">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-500 text-white noto-sans-jp-light">
                        {post.category}
                      </span>
                      {post.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors noto-sans-jp-light">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 mb-4 noto-sans-jp-light line-clamp-3">
                      {post.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span className="noto-sans-jp-light">
                        {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                      <span className="noto-sans-jp-light">
                        {post.stats?.views || 0} views
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent Posts */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            最新記事
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post: ContentItem) => (
              <article key={post.id} className="border border-gray-700 hover:border-blue-500 transition-colors group">
                {post.thumbnail && (
                  <div className="aspect-video bg-gray-800 overflow-hidden">
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-blue-500 text-white noto-sans-jp-light">
                      {post.category}
                    </span>
                    {post.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors noto-sans-jp-light">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 mb-4 noto-sans-jp-light line-clamp-3">
                    {post.description}
                  </p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="noto-sans-jp-light">
                      {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                    <span className="noto-sans-jp-light">
                      {post.stats?.views || 0} views
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            全ての記事
          </h2>
          <div className="space-y-4">
            {posts.map((post: ContentItem) => (
              <article key={post.id} className="border border-gray-700 hover:border-blue-500 transition-colors group p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {post.thumbnail && (
                    <div className="w-full md:w-48 aspect-video bg-gray-900 overflow-hidden">
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs px-2 py-1 bg-blue-500 text-white noto-sans-jp-light">
                        {post.category}
                      </span>
                      {post.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 noto-sans-jp-light">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-blue-500 transition-colors noto-sans-jp-light">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 mb-4 noto-sans-jp-light">
                      {post.description}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span className="noto-sans-jp-light">
                        {new Date(post.createdAt).toLocaleDateString('ja-JP')}
                      </span>
                      <div className="flex gap-4">
                        <span className="noto-sans-jp-light">
                          {post.stats?.views || 0} views
                        </span>
                        {post.content && (
                          <span className="noto-sans-jp-light">
                            {Math.ceil(post.content.length / 400)} min read
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
            カテゴリー
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category}
                className="p-4 border border-gray-700 hover:border-blue-500 transition-colors text-center noto-sans-jp-light"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "samuido Blog",
            "description": "技術記事、制作過程、チュートリアルなどを掲載",
            "url": "https://yusuke-kim.com/workshop/blog",
            "author": {
              "@type": "Person",
              "name": "木村友亮",
              "alternateName": "samuido"
            },
            "publisher": {
              "@type": "Organization",
              "name": "samuido",
              "url": "https://yusuke-kim.com/"
            }
          })
        }}
      />
    </div>
  );
}