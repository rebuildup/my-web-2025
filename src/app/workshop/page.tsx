import { Metadata } from 'next';
import Link from 'next/link';
import { ContentItem } from '@/types/content';

export const metadata: Metadata = {
  title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
  description: 'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
  keywords: 'AfterEffects, プラグイン, 技術記事, 素材配布, チュートリアル, ブログ',
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
        alt: 'Workshop - samuido',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
    description: 'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
    images: ['https://yusuke-kim.com/workshop-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

async function getWorkshopStats() {
  try {
    const [blogRes, pluginRes, downloadRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/content/blog`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/content/plugin`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/content/download`, { cache: 'no-store' }),
    ]);

    const [blogData, pluginData, downloadData] = await Promise.all([
      blogRes.json(),
      pluginRes.json(),
      downloadRes.json(),
    ]);

    return {
      blogCount: blogData.success ? blogData.data.length : 0,
      pluginCount: pluginData.success ? pluginData.data.length : 0,
      downloadCount: downloadData.success ? downloadData.data.length : 0,
    };
  } catch (error) {
    console.error('Failed to fetch workshop stats:', error);
    return { blogCount: 0, pluginCount: 0, downloadCount: 0 };
  }
}

async function getLatestContent() {
  try {
    const [blogRes, pluginRes, downloadRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/content/blog?limit=3`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/content/plugin?limit=3`, { cache: 'no-store' }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/content/download?limit=3`, { cache: 'no-store' }),
    ]);

    const [blogData, pluginData, downloadData] = await Promise.all([
      blogRes.json(),
      pluginRes.json(),
      downloadRes.json(),
    ]);

    return {
      blogs: blogData.success ? blogData.data : [],
      plugins: pluginData.success ? pluginData.data : [],
      downloads: downloadData.success ? downloadData.data : [],
    };
  } catch (error) {
    console.error('Failed to fetch latest content:', error);
    return { blogs: [], plugins: [], downloads: [] };
  }
}

export default async function WorkshopPage() {
  const stats = await getWorkshopStats();
  const latestContent = await getLatestContent();

  const categoryCards = [
    {
      title: 'ブログ',
      description: '技術記事、チュートリアル、制作過程の解説',
      href: '/workshop/blog',
      count: stats.blogCount,
      color: 'bg-blue-500',
      icon: '📝',
    },
    {
      title: 'プラグイン',
      description: 'AfterEffects、Premiere Pro用のプラグイン配布',
      href: '/workshop/plugins',
      count: stats.pluginCount,
      color: 'bg-blue-600',
      icon: '🔧',
    },
    {
      title: 'ダウンロード',
      description: '素材、テンプレート、ツールの無償配布',
      href: '/workshop/downloads',
      count: stats.downloadCount,
      color: 'bg-blue-700',
      icon: '📦',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 neue-haas-grotesk-display" style={{ color: '#0000ff' }}>
            Workshop
          </h1>
          <p className="text-xl mb-8 noto-sans-jp-light">
            クリエイティブなコンテンツのハブページ
          </p>
          <p className="text-lg mb-12 max-w-2xl mx-auto noto-sans-jp-light">
            プラグイン配布、素材ダウンロード、技術記事を通じて、
            クリエイティブワークをサポートするプラットフォーム
          </p>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categoryCards.map((card, index) => (
              <Link
                key={index}
                href={card.href}
                className="group block p-8 border border-gray-700 hover:border-blue-500 transition-colors duration-300"
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{card.icon}</div>
                  <h3 className="text-2xl font-bold mb-3 neue-haas-grotesk-display group-hover:text-blue-500">
                    {card.title}
                  </h3>
                  <p className="text-gray-400 mb-4 noto-sans-jp-light">
                    {card.description}
                  </p>
                  <div className="text-sm text-gray-500 noto-sans-jp-light">
                    {card.count} 件のコンテンツ
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Content Highlights */}
      <section className="py-16 px-4 bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center neue-haas-grotesk-display">
            最新コンテンツ
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Latest Blog Posts */}
            <div>
              <h3 className="text-xl font-bold mb-6 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
                最新記事
              </h3>
              <div className="space-y-4">
                {latestContent.blogs.slice(0, 3).map((blog: ContentItem) => (
                  <div key={blog.id} className="border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                    <h4 className="font-bold mb-2 noto-sans-jp-light">{blog.title}</h4>
                    <p className="text-sm text-gray-400 noto-sans-jp-light">{blog.description}</p>
                    <div className="text-xs text-gray-500 mt-2 noto-sans-jp-light">
                      {new Date(blog.createdAt).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                href="/workshop/blog"
                className="inline-block mt-4 text-blue-500 hover:text-blue-400 transition-colors noto-sans-jp-light"
              >
                記事一覧を見る →
              </Link>
            </div>

            {/* Latest Plugins */}
            <div>
              <h3 className="text-xl font-bold mb-6 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
                最新プラグイン
              </h3>
              <div className="space-y-4">
                {latestContent.plugins.slice(0, 3).map((plugin: ContentItem) => (
                  <div key={plugin.id} className="border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                    <h4 className="font-bold mb-2 noto-sans-jp-light">{plugin.title}</h4>
                    <p className="text-sm text-gray-400 noto-sans-jp-light">{plugin.description}</p>
                    <div className="text-xs text-gray-500 mt-2 noto-sans-jp-light">
                      ダウンロード数: {plugin.downloadInfo?.downloadCount || 0}
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                href="/workshop/plugins"
                className="inline-block mt-4 text-blue-500 hover:text-blue-400 transition-colors noto-sans-jp-light"
              >
                プラグイン一覧を見る →
              </Link>
            </div>

            {/* Latest Downloads */}
            <div>
              <h3 className="text-xl font-bold mb-6 zen-kaku-gothic-new" style={{ color: '#0000ff' }}>
                最新ダウンロード
              </h3>
              <div className="space-y-4">
                {latestContent.downloads.slice(0, 3).map((download: ContentItem) => (
                  <div key={download.id} className="border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                    <h4 className="font-bold mb-2 noto-sans-jp-light">{download.title}</h4>
                    <p className="text-sm text-gray-400 noto-sans-jp-light">{download.description}</p>
                    <div className="text-xs text-gray-500 mt-2 noto-sans-jp-light">
                      ファイルサイズ: {download.downloadInfo?.fileSize ? `${(download.downloadInfo.fileSize / 1024 / 1024).toFixed(1)}MB` : '不明'}
                    </div>
                  </div>
                ))}
              </div>
              <Link 
                href="/workshop/downloads"
                className="inline-block mt-4 text-blue-500 hover:text-blue-400 transition-colors noto-sans-jp-light"
              >
                ダウンロード一覧を見る →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12 neue-haas-grotesk-display">
            統計情報
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-gray-700">
              <div className="text-3xl font-bold mb-2 neue-haas-grotesk-display" style={{ color: '#0000ff' }}>
                {stats.blogCount}
              </div>
              <div className="text-gray-400 noto-sans-jp-light">技術記事</div>
            </div>
            <div className="p-6 border border-gray-700">
              <div className="text-3xl font-bold mb-2 neue-haas-grotesk-display" style={{ color: '#0000ff' }}>
                {stats.pluginCount}
              </div>
              <div className="text-gray-400 noto-sans-jp-light">プラグイン</div>
            </div>
            <div className="p-6 border border-gray-700">
              <div className="text-3xl font-bold mb-2 neue-haas-grotesk-display" style={{ color: '#0000ff' }}>
                {stats.downloadCount}
              </div>
              <div className="text-gray-400 noto-sans-jp-light">ダウンロード</div>
            </div>
          </div>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "samuido Workshop",
            "description": "AfterEffectsプラグイン、技術記事、素材の配布サイト",
            "url": "https://yusuke-kim.com/workshop",
            "author": {
              "@type": "Person",
              "name": "木村友亮",
              "alternateName": "samuido"
            },
            "mainEntity": {
              "@type": "ItemList",
              "name": "プラグイン・記事・素材一覧",
              "description": "AfterEffectsプラグイン、技術記事、素材のコレクション"
            }
          })
        }}
      />
    </div>
  );
}