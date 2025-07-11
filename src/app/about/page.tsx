import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About - samuido | 木村友亮について',
  description:
    'Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。',
  keywords: '木村友亮, プロフィール, 経歴, スキル, Webデザイナー, フロントエンド開発者',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/about',
  },
  openGraph: {
    title: 'About - samuido | 木村友亮について',
    description:
      'Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。',
    type: 'profile',
    url: 'https://yusuke-kim.com/about',
    images: [
      {
        url: 'https://yusuke-kim.com/about-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'About - samuido | 木村友亮について',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About - samuido | 木村友亮について',
    description:
      'Webデザイナー・開発者の木村友亮のプロフィール。経歴、スキル、作品、連絡先情報をご紹介。',
    images: ['https://yusuke-kim.com/about-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: '木村友亮',
  alternateName: 'samuido',
  jobTitle: 'Webデザイナー・開発者',
  description: 'グラフィックデザイン、映像制作、個人開発など幅広く活動',
  url: 'https://yusuke-kim.com/about',
  sameAs: ['https://twitter.com/361do_sleep', 'https://twitter.com/361do_design'],
  knowsAbout: ['Web Design', 'Frontend Development', 'Video Production', 'Graphic Design'],
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-grid">
        {/* ヒーローヘッダー */}
        <section className="py-16 text-center">
          <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">About</h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            木村友亮 / samuido
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            グラフィックデザイン、映像制作、個人開発など幅広く活動
            <br />
            やる気になれば何でもできるのが強み
          </p>
        </section>

        {/* プロフィール選択カード */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Profile Selection
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 本名プロフィール */}
            <Link
              href="/about/profile/real"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">
                本名プロフィール
              </h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">
                採用担当者や企業向けの正式な自己紹介
              </p>
              <ul className="noto-sans-jp-light space-y-1 text-sm text-gray-400">
                <li>• 学歴・経歴の詳細</li>
                <li>• 受賞歴・実績</li>
                <li>• 正式なスキル一覧</li>
                <li>• 連絡先情報</li>
              </ul>
            </Link>

            {/* ハンドルネームプロフィール */}
            <Link
              href="/about/profile/handle"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">
                ハンドルネームプロフィール
              </h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">ラフな自己紹介、同業者向け</p>
              <ul className="noto-sans-jp-light space-y-1 text-sm text-gray-400">
                <li>• カジュアルな自己紹介</li>
                <li>• 趣味・興味関心</li>
                <li>• 制作への想い</li>
                <li>• SNSリンク</li>
              </ul>
            </Link>
          </div>
        </section>

        {/* 基本情報 */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Basic Information
          </h2>
          <div className="card">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">基本情報</h3>
                <ul className="noto-sans-jp-regular space-y-2 text-gray-300">
                  <li>
                    <span className="text-blue-400">生年月日:</span> 平成19年10月生
                  </li>
                  <li>
                    <span className="text-blue-400">所属:</span> 現役高専生（2025年7月現在）
                  </li>
                  <li>
                    <span className="text-blue-400">職種:</span> Webデザイナー・開発者
                  </li>
                  <li>
                    <span className="text-blue-400">専門:</span> フロントエンド開発・映像制作
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">連絡先</h3>
                <ul className="noto-sans-jp-regular space-y-2 text-gray-300">
                  <li>
                    <span className="text-blue-400">開発関連:</span> rebuild.up.up@gmail.com
                  </li>
                  <li>
                    <span className="text-blue-400">映像・デザイン:</span> 361do.sleep@gmail.com
                  </li>
                  <li>
                    <span className="text-blue-400">Twitter:</span> @361do_sleep
                  </li>
                  <li>
                    <span className="text-blue-400">Design Twitter:</span> @361do_design
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* スキル */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Skills
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {/* デザイン */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">デザイン</h3>
              <ul className="noto-sans-jp-regular space-y-2 text-sm text-gray-300">
                <li>• Photoshop</li>
                <li>• Illustrator</li>
                <li>• Adobe XD</li>
                <li>• Figma</li>
              </ul>
            </div>

            {/* プログラミング */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">プログラミング</h3>
              <ul className="noto-sans-jp-regular space-y-2 text-sm text-gray-300">
                <li>• C / C++ / C#</li>
                <li>• HTML / CSS</li>
                <li>• JavaScript</li>
                <li>• TypeScript</li>
              </ul>
            </div>

            {/* 技術スタック */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">技術スタック</h3>
              <ul className="noto-sans-jp-regular space-y-2 text-sm text-gray-300">
                <li>• React / Next.js</li>
                <li>• Tailwind CSS</li>
                <li>• p5.js / PIXI.js</li>
                <li>• GSAP</li>
              </ul>
            </div>

            {/* 映像・その他 */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">映像・その他</h3>
              <ul className="noto-sans-jp-regular space-y-2 text-sm text-gray-300">
                <li>• After Effects</li>
                <li>• Premiere Pro</li>
                <li>• Blender / Unity</li>
                <li>• Cubase</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ナビゲーションカード */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Navigation
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* デジタル名刺 */}
            <Link
              href="/about/card"
              className="card block text-center transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">Digital Card</h3>
              <p className="noto-sans-jp-regular text-sm text-gray-300">デジタル名刺</p>
            </Link>

            {/* リンクマップ */}
            <Link
              href="/about/links"
              className="card block text-center transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">Link Map</h3>
              <p className="noto-sans-jp-regular text-sm text-gray-300">各種リンク集</p>
            </Link>

            {/* 依頼ページ */}
            <Link
              href="/about/commission"
              className="card block text-center transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">Commission</h3>
              <p className="noto-sans-jp-regular text-sm text-gray-300">制作依頼について</p>
            </Link>
          </div>
        </section>

        {/* 最新のポートフォリオ・ツールハイライト */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Featured Works & Tools
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* ポートフォリオハイライト */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">
                最新ポートフォリオ
              </h3>
              <p className="noto-sans-jp-regular mb-4 text-sm text-gray-300">
                最新の制作作品をご紹介。開発・映像・デザインの最新事例をご覧いただけます。
              </p>
              <Link
                href="/portfolio"
                className="inline-block text-sm text-blue-400 hover:text-blue-300"
              >
                ポートフォリオを見る →
              </Link>
            </div>

            {/* ツールハイライト */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white">便利ツール</h3>
              <p className="noto-sans-jp-regular mb-4 text-sm text-gray-300">
                制作に役立つWebツールを無料で提供しています。カラーパレット生成、QRコード作成など。
              </p>
              <Link
                href="/tools"
                className="inline-block text-sm text-blue-400 hover:text-blue-300"
              >
                ツール一覧を見る →
              </Link>
            </div>
          </div>
        </section>

        {/* ホームに戻る */}
        <section className="py-12 text-center">
          <Link
            href="/"
            className="neue-haas-grotesk-display inline-block text-lg text-blue-400 hover:text-blue-300"
          >
            ← Home
          </Link>
        </section>
      </div>
    </>
  );
}
