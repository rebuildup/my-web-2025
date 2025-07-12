import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
  description:
    'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
  keywords: 'AfterEffects, プラグイン, 技術記事, 素材配布, チュートリアル, ブログ',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/03_workshop',
  },
  openGraph: {
    title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
    description:
      'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
    type: 'website',
    url: 'https://yusuke-kim.com/03_workshop',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Workshop - samuido | プラグイン・ブログ・素材配布',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
    description:
      'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
    images: ['https://yusuke-kim.com/workshop-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'samuido Workshop',
  description: 'AfterEffectsプラグイン、技術記事、素材の配布サイト',
  url: 'https://yusuke-kim.com/03_workshop',
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'プラグイン・記事・素材一覧',
    description: 'AfterEffectsプラグイン、技術記事、素材のコレクション',
  },
};

export default function WorkshopPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-grid">
        {/* ヒーローヘッダー */}
        <section className="py-16 text-center">
          <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">
            Workshop
          </h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            プラグイン・ブログ・素材配布
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            AfterEffectsプラグイン、技術記事、素材の配布サイト
            <br />
            フロントエンドエンジニアsamuidoのクリエイティブハブ
          </p>
        </section>

        {/* 統計情報 */}
        <section className="py-12">
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                15
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">技術記事</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                8
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">プラグイン</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                12
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">素材ファイル</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                1,250
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">総ダウンロード数</div>
            </div>
          </div>
        </section>

        {/* カテゴリ選択カード */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Workshop Categories
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Blog */}
            <Link
              href="/03_workshop/blog"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Blog</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                技術記事、チュートリアル、解説記事の配信
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• Markdown対応</li>
                <li>• 埋め込みコンテンツ</li>
                <li>• タグフィルター</li>
                <li>• 検索機能</li>
              </ul>
              <div className="text-xs text-blue-400">15 記事 →</div>
            </Link>

            {/* Plugins */}
            <Link
              href="/03_workshop/plugins"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Plugins</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                AfterEffects、Premiere Proなどのプラグイン配布
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• ダウンロード統計</li>
                <li>• バージョン管理</li>
                <li>• 使用方法説明</li>
                <li>• GitHubリンク</li>
              </ul>
              <div className="text-xs text-blue-400">8 プラグイン →</div>
            </Link>

            {/* Downloads */}
            <Link
              href="/03_workshop/downloads"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Downloads</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                テンプレート、素材集などの配布
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• 素材ファイル</li>
                <li>• テンプレート</li>
                <li>• ライセンス情報</li>
                <li>• ダウンロード統計</li>
              </ul>
              <div className="text-xs text-blue-400">12 ファイル →</div>
            </Link>
          </div>
        </section>

        {/* 最新コンテンツハイライト */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Latest Content
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* 最新記事 */}
            <div className="card">
              <div className="mb-4 aspect-video bg-gray-700"></div>
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Blog</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                React 19の新機能解説
              </h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                React 19で追加された新機能について詳しく解説します。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">React</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">JavaScript</span>
              </div>
            </div>

            {/* 最新プラグイン */}
            <div className="card">
              <div className="mb-4 aspect-video bg-gray-700"></div>
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Plugin</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                AE Expression Generator
              </h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                AfterEffects用のエクスプレッション自動生成プラグイン。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">AfterEffects</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">JavaScript</span>
              </div>
            </div>

            {/* 最新素材 */}
            <div className="card">
              <div className="mb-4 aspect-video bg-gray-700"></div>
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Download</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">UI Kit Template</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                Figma用のUIキットテンプレート。モダンなデザインシステム。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Figma</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">UI/UX</span>
              </div>
            </div>
          </div>
        </section>

        {/* 人気コンテンツ */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Popular Content
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 人気記事 */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="neue-haas-grotesk-display text-lg text-white">Next.js 15の新機能</h3>
                <span className="bg-green-600 px-2 py-1 text-xs text-white">2.5k views</span>
              </div>
              <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">
                Next.js 15で追加された新機能について詳しく解説。App Router、Server
                Components、Turbopackなど。
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-600 px-2 py-1 text-xs text-white">Next.js</span>
                  <span className="bg-gray-600 px-2 py-1 text-xs text-white">React</span>
                </div>
                <Link
                  href="/03_workshop/blog"
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  記事を見る →
                </Link>
              </div>
            </div>

            {/* 人気プラグイン */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="neue-haas-grotesk-display text-lg text-white">
                  Motion Graphics Toolkit
                </h3>
                <span className="bg-green-600 px-2 py-1 text-xs text-white">850 downloads</span>
              </div>
              <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">
                AfterEffects用のモーショングラフィックスツールキット。エクスプレッションとエフェクトのセット。
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-600 px-2 py-1 text-xs text-white">AfterEffects</span>
                  <span className="bg-gray-600 px-2 py-1 text-xs text-white">Motion Graphics</span>
                </div>
                <Link
                  href="/03_workshop/plugins"
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  プラグインを見る →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ナビゲーション */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="neue-haas-grotesk-display text-lg text-blue-400 hover:text-blue-300"
            >
              ← Home
            </Link>
            <div className="flex gap-4">
              <Link href="/01_about" className="text-sm text-blue-400 hover:text-blue-300">
                About →
              </Link>
              <Link href="/02_portfolio" className="text-sm text-blue-400 hover:text-blue-300">
                Portfolio →
              </Link>
              <Link href="/04_tools" className="text-sm text-blue-400 hover:text-blue-300">
                Tools →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
