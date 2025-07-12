import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Portfolio - samuido | 作品ギャラリー',
  description:
    'Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。',
  keywords:
    'ポートフォリオ, 作品ギャラリー, Webデザイン, アプリケーション, フロントエンド, UI/UX, 映像制作',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/02_portfolio',
  },
  openGraph: {
    title: 'Portfolio - samuido | 作品ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。',
    type: 'website',
    url: 'https://yusuke-kim.com/02_portfolio',
    images: [
      {
        url: 'https://yusuke-kim.com/portfolio-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfolio - samuido | 作品ギャラリー',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio - samuido | 作品ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。',
    images: ['https://yusuke-kim.com/portfolio-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Portfolio - samuido',
  description: 'Webデザイナー・開発者木村友亮の作品ポートフォリオ',
  url: 'https://yusuke-kim.com/02_portfolio',
  mainEntity: {
    '@type': 'ItemList',
    name: '作品一覧',
    description: 'Webサイト、アプリケーション、デザイン作品のコレクション',
  },
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
};

export default function PortfolioPage() {
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
            Portfolio
          </h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            作品ギャラリー
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            Webデザイナー・開発者木村友亮の作品ポートフォリオ
            <br />
            Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介
          </p>
        </section>

        {/* 統計情報 */}
        <section className="py-12">
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                24
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">総作品数</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                8
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">開発作品</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                12
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">映像作品</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                4
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">デザイン作品</div>
            </div>
          </div>
        </section>

        {/* カテゴリ選択カード */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Gallery Categories
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* All Works */}
            <Link
              href="/02_portfolio/gallery/all"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">All Works</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                バラエティを重視した全作品の一覧
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• サムネイルカード表示</li>
                <li>• 詳細パネル機能</li>
                <li>• フィルター・ソート機能</li>
                <li>• 検索機能</li>
              </ul>
              <div className="text-xs text-blue-400">24 作品 →</div>
            </Link>

            {/* Development Works */}
            <Link
              href="/02_portfolio/gallery/develop"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Development</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                プログラミング関連の制作作品
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• 2列交互配置レイアウト</li>
                <li>• プレビュー動画埋め込み</li>
                <li>• リポジトリリンク</li>
                <li>• 技術スタック表示</li>
              </ul>
              <div className="text-xs text-blue-400">8 作品 →</div>
            </Link>

            {/* Video Works */}
            <Link
              href="/02_portfolio/gallery/video"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Video</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                foriioライクな映像作品ギャラリー
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• foriioライク表示</li>
                <li>• 動画埋め込み</li>
                <li>• スクリーンショット</li>
                <li>• 軽量プレビュー機能</li>
              </ul>
              <div className="text-xs text-blue-400">12 作品 →</div>
            </Link>

            {/* Video & Design Works */}
            <Link
              href="/02_portfolio/gallery/video-design"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Video & Design</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                映像とデザインを組み合わせた作品
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• 縦3列グリッドレイアウト</li>
                <li>• コンテンツ応答型サイズ</li>
                <li>• ホバー表示機能</li>
                <li>• 独特な一覧表示</li>
              </ul>
              <div className="text-xs text-blue-400">4 作品 →</div>
            </Link>
          </div>
        </section>

        {/* 最新作品ハイライト */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Latest Works
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* 最新作品1 */}
            <div className="card">
              <div className="mb-4 aspect-video bg-gray-700"></div>
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Development</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">最新Webアプリ</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                React + TypeScriptで制作した最新のWebアプリケーション。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">React</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">TypeScript</span>
              </div>
            </div>

            {/* 最新作品2 */}
            <div className="card">
              <div className="mb-4 aspect-video bg-gray-700"></div>
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Video</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">最新MV制作</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                After Effectsを使用した最新のミュージックビデオ。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">After Effects</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Motion Graphics</span>
              </div>
            </div>

            {/* 最新作品3 */}
            <div className="card">
              <div className="mb-4 aspect-video bg-gray-700"></div>
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Design</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">最新デザイン</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                Figmaで制作した最新のUI/UXデザイン。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Figma</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">UI/UX</span>
              </div>
            </div>
          </div>
        </section>

        {/* プレイグラウンド */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Playground
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Design Playground */}
            <Link
              href="/02_portfolio/playground/design"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">
                Design Playground
              </h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                デザインの実験や試作品を自由に展示
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• インタラクティブ要素</li>
                <li>• CSS・JavaScript実験</li>
                <li>• アニメーション</li>
                <li>• 技術実験</li>
              </ul>
              <div className="text-xs text-blue-400">実験作品 →</div>
            </Link>

            {/* WebGL Playground */}
            <Link
              href="/02_portfolio/playground/webgl"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">
                WebGL Playground
              </h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                WebGLを使った3Dグラフィックス実験
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• 3Dグラフィックス</li>
                <li>• シェーダー実験</li>
                <li>• パーティクルシステム</li>
                <li>• ポストプロセス効果</li>
              </ul>
              <div className="text-xs text-blue-400">WebGL実験 →</div>
            </Link>
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
              <Link href="/03_workshop" className="text-sm text-blue-400 hover:text-blue-300">
                Workshop →
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
