import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
  description:
    'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
  keywords: 'AfterEffects, プラグイン, 技術記事, 素材配布, チュートリアル, ブログ',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/workshop',
  },
  openGraph: {
    title: 'Workshop - samuido | プラグイン・ブログ・素材配布',
    description:
      'AfterEffectsプラグイン、技術記事、素材の配布サイト。フロントエンドエンジニアsamuidoのクリエイティブハブ。',
    type: 'website',
    url: 'https://yusuke-kim.com/workshop',
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
  url: 'https://yusuke-kim.com/workshop',
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
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base text-gray-400 md:text-lg">
            AfterEffectsプラグイン、技術記事、素材の配布
            <br />
            クリエイティブなコンテンツのハブページ
          </p>
        </section>

        {/* 統計情報 */}
        <section className="py-12">
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                18
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">技術記事</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                6
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">プラグイン</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                12
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">素材・テンプレート</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                2.1K
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">総ダウンロード</div>
            </div>
          </div>
        </section>

        {/* カテゴリ選択カード */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Workshop Categories
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* ブログ */}
            <Link
              href="/workshop/blog"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Blog</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                技術記事、チュートリアル、解説記事の配信
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• 技術記事・チュートリアル</li>
                <li>• 制作過程・解説記事</li>
                <li>• Markdown + 埋め込みコンテンツ</li>
                <li>• タグフィルター・検索機能</li>
              </ul>
              <div className="text-xs text-blue-400">18記事 →</div>
            </Link>

            {/* プラグイン */}
            <Link
              href="/workshop/plugins"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Plugins</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                AfterEffects、Premiere Proなどのプラグイン配布
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• AfterEffects・Premiere Pro対応</li>
                <li>• ダウンロード統計・バージョン管理</li>
                <li>• 使用方法・インストール手順</li>
                <li>• 無料配布・オープンソース</li>
              </ul>
              <div className="text-xs text-blue-400">6プラグイン →</div>
            </Link>

            {/* ダウンロード */}
            <Link
              href="/workshop/downloads"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Downloads</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                テンプレート、素材集などの配布
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• テンプレート・素材集</li>
                <li>• サンプルファイル・その他</li>
                <li>• ライセンス情報・利用規約</li>
                <li>• ZIP形式での一括ダウンロード</li>
              </ul>
              <div className="text-xs text-blue-400">12素材 →</div>
            </Link>
          </div>
        </section>

        {/* 最新コンテンツのハイライト */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Latest Content
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* 最新ブログ記事 */}
            <div className="card">
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Blog</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                Next.js 15 + React 19の新機能解説
              </h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                Next.js 15とReact 19の新機能について詳しく解説。Server Actions、Concurrent
                Features、パフォーマンス改善について。
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Next.js</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">React</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">技術記事</span>
              </div>
              <div className="text-xs text-gray-500">2025/01/20</div>
            </div>

            {/* 最新プラグイン */}
            <div className="card">
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Plugin</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                AE Auto Keyframe v2.1
              </h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                After
                Effectsでキーフレームを自動生成するプラグイン。v2.1ではパフォーマンス改善とUIの刷新を実施。
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">After Effects</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">CEP</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">JavaScript</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-gray-500">v2.1</span>
                <span className="text-gray-500">847 downloads</span>
              </div>
            </div>

            {/* 最新素材 */}
            <div className="card">
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Download</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                Motion Graphics Templates Pack
              </h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                After
                Effects用のモーショングラフィックステンプレート集。ローワーサード、トランジション、エフェクトを収録。
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Template</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Motion Graphics</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Free</span>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="text-gray-500">12 files</span>
                <span className="text-gray-500">156 downloads</span>
              </div>
            </div>
          </div>
        </section>

        {/* 人気ランキング */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Popular Content
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 人気プラグイン */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">人気プラグイン</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">
                      AE Expression Helper
                    </div>
                    <div className="text-xs text-gray-500">1,247 downloads</div>
                  </div>
                  <div className="text-sm text-blue-400">#1</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">
                      Auto Keyframe v2.1
                    </div>
                    <div className="text-xs text-gray-500">847 downloads</div>
                  </div>
                  <div className="text-sm text-blue-400">#2</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">
                      Layer Manager Pro
                    </div>
                    <div className="text-xs text-gray-500">634 downloads</div>
                  </div>
                  <div className="text-sm text-blue-400">#3</div>
                </div>
              </div>
            </div>

            {/* 人気記事 */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">人気記事</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">
                      React Hooks完全ガイド
                    </div>
                    <div className="text-xs text-gray-500">3,421 views</div>
                  </div>
                  <div className="text-sm text-blue-400">#1</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">
                      AE Expression入門
                    </div>
                    <div className="text-xs text-gray-500">2,156 views</div>
                  </div>
                  <div className="text-sm text-blue-400">#2</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">
                      Tailwind CSS v4 新機能
                    </div>
                    <div className="text-xs text-gray-500">1,893 views</div>
                  </div>
                  <div className="text-sm text-blue-400">#3</div>
                </div>
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
              <Link href="/about" className="text-sm text-blue-400 hover:text-blue-300">
                About →
              </Link>
              <Link href="/portfolio" className="text-sm text-blue-400 hover:text-blue-300">
                Portfolio →
              </Link>
              <Link href="/tools" className="text-sm text-blue-400 hover:text-blue-300">
                Tools →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
