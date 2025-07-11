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
    canonical: 'https://yusuke-kim.com/portfolio',
  },
  openGraph: {
    title: 'Portfolio - samuido | 作品ギャラリー',
    description:
      'Webデザイナー・開発者木村友亮の作品ポートフォリオ。Webサイト、アプリケーション、デザイン作品をカテゴリ別にご紹介。',
    type: 'website',
    url: 'https://yusuke-kim.com/portfolio',
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
  url: 'https://yusuke-kim.com/portfolio',
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
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base text-gray-400 md:text-lg">
            4つのカテゴリ別ギャラリーで作品の全体像を把握
            <br />
            開発・映像・デザインの幅広い制作実績をご覧ください
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
                10
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">映像作品</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                6
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
            {/* All Gallery */}
            <Link
              href="/portfolio/gallery/all"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">All</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                バラエティを重視した全作品の一覧
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• サムネイル表示でカード一覧</li>
                <li>• クリック時の詳細パネル表示</li>
                <li>• 時系列・カテゴリ・タグフィルター</li>
                <li>• タイトル・タグ・説明文からの検索</li>
              </ul>
              <div className="text-xs text-blue-400">24作品 →</div>
            </Link>

            {/* Develop Gallery */}
            <Link
              href="/portfolio/gallery/develop"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Develop</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                プログラミング関連の制作作品
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• プラグイン開発・ゲーム制作</li>
                <li>• Webアプリケーション</li>
                <li>• 2列交互表示レイアウト</li>
                <li>• 技術スタック・リポジトリリンク</li>
              </ul>
              <div className="text-xs text-blue-400">8作品 →</div>
            </Link>

            {/* Video Gallery */}
            <Link
              href="/portfolio/gallery/video"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Video</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">映像制作のみの作品一覧</p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• 依頼映像・個人制作映像</li>
                <li>• foriioライクな表示スタイル</li>
                <li>• YouTube/Vimeo埋め込み対応</li>
                <li>• MV・モーション・プロモ等</li>
              </ul>
              <div className="text-xs text-blue-400">10作品 →</div>
            </Link>

            {/* Video & Design Gallery */}
            <Link
              href="/portfolio/gallery/video-design"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Video & Design</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                映像・デザイン・Webデザイン作品
              </p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• デザインスキルを強調</li>
                <li>• 縦3列のグリッド表示</li>
                <li>• 動的サイズ・アスペクト比対応</li>
                <li>• ホバー時詳細・リンク表示</li>
              </ul>
              <div className="text-xs text-blue-400">6作品 →</div>
            </Link>
          </div>
        </section>

        {/* 最新作品のハイライト */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Featured Works
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* Featured Work 1 - Develop */}
            <div className="card">
              <div className="mb-4 flex aspect-video items-center justify-center bg-gray-700">
                <div className="text-sm text-gray-500">作品サムネイル</div>
              </div>
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Develop</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                React Portfolio Website
              </h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                Next.js 15 + React 19 + Tailwind CSS
                で構築したモダンなポートフォリオサイト。384px基準のレスポンシブデザイン。
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">React</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Next.js</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">TypeScript</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Tailwind</span>
              </div>
              <div className="flex gap-2 text-xs">
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  GitHub →
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Demo →
                </a>
              </div>
            </div>

            {/* Featured Work 2 - Video */}
            <div className="card">
              <div className="mb-4 flex aspect-video items-center justify-center bg-gray-700">
                <div className="text-sm text-gray-500">映像サムネイル</div>
              </div>
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Video</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                Motion Graphics Reel
              </h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                After
                Effectsを使用したモーショングラフィックス作品集。2Dアニメーションとタイポグラフィを中心とした構成。
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">After Effects</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Motion Graphics</span>
              </div>
              <div className="flex gap-2 text-xs">
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  YouTube →
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  詳細 →
                </a>
              </div>
            </div>

            {/* Featured Work 3 - Design */}
            <div className="card">
              <div className="mb-4 flex aspect-video items-center justify-center bg-gray-700">
                <div className="text-sm text-gray-500">デザインサムネイル</div>
              </div>
              <div className="noto-sans-jp-regular mb-2 text-xs text-blue-400">Design</div>
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                UI/UX Design System
              </h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                モダンなWebアプリケーション向けのデザインシステム。コンポーネント設計とカラーパレットの統一。
              </p>
              <div className="mb-3 flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Figma</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">UI/UX</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Design System</span>
              </div>
              <div className="flex gap-2 text-xs">
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  Figma →
                </a>
                <a href="#" className="text-blue-400 hover:text-blue-300">
                  詳細 →
                </a>
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
              href="/portfolio/playground/design"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">
                Design Playground
              </h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                デザインの実験・アイデアスケッチ
              </p>
              <ul className="noto-sans-jp-light space-y-1 text-sm text-gray-400">
                <li>• UI/UXのアイデア検証</li>
                <li>• カラーパレット実験</li>
                <li>• レイアウト・タイポグラフィ</li>
              </ul>
            </Link>

            {/* WebGL Playground */}
            <Link
              href="/portfolio/playground/webgl"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">
                WebGL Playground
              </h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                Three.js・p5.jsを使った実験的作品
              </p>
              <ul className="noto-sans-jp-light space-y-1 text-sm text-gray-400">
                <li>• インタラクティブアート</li>
                <li>• ジェネラティブデザイン</li>
                <li>• WebGL・シェーダー実験</li>
              </ul>
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
              <Link href="/about" className="text-sm text-blue-400 hover:text-blue-300">
                About →
              </Link>
              <Link href="/tools" className="text-sm text-blue-400 hover:text-blue-300">
                Tools →
              </Link>
              <Link href="/workshop" className="text-sm text-blue-400 hover:text-blue-300">
                Workshop →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
