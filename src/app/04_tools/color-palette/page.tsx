import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Color Palette Generator - samuido | カラーパレット生成',
  description:
    '色域を指定してランダムに色を生成。デザイナーや開発者向けのカラーパレット作成ツール。',
  keywords: 'カラーパレット, 色生成, デザイン, ランダム, 色域',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/04_tools/color-palette',
  },
  openGraph: {
    title: 'Color Palette Generator - samuido | カラーパレット生成',
    description:
      '色域を指定してランダムに色を生成。デザイナーや開発者向けのカラーパレット作成ツール。',
    type: 'website',
    url: 'https://yusuke-kim.com/04_tools/color-palette',
    images: [
      {
        url: 'https://yusuke-kim.com/tools/color-palette-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Color Palette Generator - samuido | カラーパレット生成',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Color Palette Generator - samuido | カラーパレット生成',
    description:
      '色域を指定してランダムに色を生成。デザイナーや開発者向けのカラーパレット作成ツール。',
    images: ['https://yusuke-kim.com/tools/color-palette-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Color Palette Generator',
  description: '色域を指定してランダムに色を生成',
  url: 'https://yusuke-kim.com/04_tools/color-palette',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Web Browser',
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
  },
};

// サンプルパレットデータ
const samplePalettes = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    colors: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'],
    tags: ['ブルー', 'モダン', 'プロフェッショナル'],
  },
  {
    id: 'warm-orange',
    name: 'Warm Orange',
    colors: ['#7c2d12', '#ea580c', '#fb923c', '#fed7aa', '#ffedd5'],
    tags: ['オレンジ', '暖かい', 'エネルギッシュ'],
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    colors: ['#14532d', '#16a34a', '#22c55e', '#4ade80', '#bbf7d0'],
    tags: ['グリーン', '自然', 'リラックス'],
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    colors: ['#581c87', '#7c3aed', '#a855f7', '#c084fc', '#e9d5ff'],
    tags: ['パープル', 'エレガント', 'クリエイティブ'],
  },
];

const colorSpaces = ['RGB', 'HSL', 'HSV', 'CMYK'];
const paletteSizes = [3, 4, 5, 6, 8, 10];

export default function ColorPalettePage() {
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
            Color Palette Generator
          </h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            カラーパレット生成
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            色域を指定してランダムに色を生成
            <br />
            デザイナーや開発者向けのカラーパレット作成ツール
          </p>
        </section>

        {/* カラーパレットジェネレーター */}
        <section className="py-8">
          <div className="card">
            <h2 className="neue-haas-grotesk-display mb-6 text-2xl text-white">
              パレットジェネレーター
            </h2>

            {/* 設定パネル */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 基本設定 */}
              <div>
                <h3 className="noto-sans-jp-regular mb-4 text-sm text-gray-300">基本設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-xs text-gray-300">
                      パレットサイズ
                    </label>
                    <select className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white">
                      {paletteSizes.map(size => (
                        <option key={size} value={size}>
                          {size}色
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-xs text-gray-300">
                      色空間
                    </label>
                    <select className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white">
                      {colorSpaces.map(space => (
                        <option key={space} value={space}>
                          {space}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 色域設定 */}
              <div>
                <h3 className="noto-sans-jp-regular mb-4 text-sm text-gray-300">色域設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-xs text-gray-300">
                      色相範囲
                    </label>
                    <div className="flex gap-2">
                      <input type="range" min="0" max="360" defaultValue="0" className="flex-1" />
                      <span className="text-xs text-white">0° - 360°</span>
                    </div>
                  </div>
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-xs text-gray-300">
                      彩度範囲
                    </label>
                    <div className="flex gap-2">
                      <input type="range" min="0" max="100" defaultValue="50" className="flex-1" />
                      <span className="text-xs text-white">0% - 100%</span>
                    </div>
                  </div>
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-xs text-gray-300">
                      明度範囲
                    </label>
                    <div className="flex gap-2">
                      <input type="range" min="0" max="100" defaultValue="50" className="flex-1" />
                      <span className="text-xs text-white">0% - 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 生成ボタン */}
            <div className="mb-8 text-center">
              <button className="rounded-lg bg-blue-600 px-8 py-3 text-white transition-colors hover:bg-blue-700">
                パレットを生成
              </button>
            </div>

            {/* 生成されたパレット */}
            <div className="mb-8">
              <h3 className="noto-sans-jp-regular mb-4 text-sm text-gray-300">
                生成されたパレット
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe'].map((color, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg border border-gray-600"
                    style={{ backgroundColor: color }}
                  >
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs text-white drop-shadow-lg">{color}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-2">
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white transition-colors hover:bg-green-700">
                パレットを保存
              </button>
              <button className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600">
                CSSをコピー
              </button>
              <button className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600">
                リセット
              </button>
            </div>
          </div>
        </section>

        {/* サンプルパレット */}
        <section className="py-8">
          <h2 className="neue-haas-grotesk-display mb-8 text-2xl text-white">サンプルパレット</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {samplePalettes.map(palette => (
              <div key={palette.id} className="card">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="neue-haas-grotesk-display text-lg text-white">{palette.name}</h3>
                  <button className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">
                    使用
                  </button>
                </div>

                {/* カラーパレット */}
                <div className="mb-4 grid grid-cols-5 gap-2">
                  {palette.colors.map((color, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded border border-gray-600"
                      style={{ backgroundColor: color }}
                    >
                      <div className="flex h-full items-center justify-center">
                        <span className="text-xs text-white drop-shadow-lg">{color}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* タグ */}
                <div className="flex flex-wrap gap-2">
                  {palette.tags.map(tag => (
                    <span key={tag} className="bg-gray-600 px-2 py-1 text-xs text-white">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 保存されたパレット */}
        <section className="py-8">
          <h2 className="neue-haas-grotesk-display mb-8 text-2xl text-white">保存されたパレット</h2>
          <div className="card">
            <div className="text-center text-gray-400">
              <p className="noto-sans-jp-regular">保存されたパレットはありません</p>
              <p className="noto-sans-jp-light text-sm">パレットを生成して保存してください</p>
            </div>
          </div>
        </section>

        {/* カラーピッカー */}
        <section className="py-8">
          <h2 className="neue-haas-grotesk-display mb-8 text-2xl text-white">カラーピッカー</h2>
          <div className="card">
            <div className="mb-6">
              <h3 className="noto-sans-jp-regular mb-4 text-sm text-gray-300">単色選択</h3>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  defaultValue="#3b82f6"
                  className="h-12 w-12 rounded border border-gray-600"
                />
                <input
                  type="text"
                  defaultValue="#3b82f6"
                  className="flex-1 rounded-lg bg-gray-800 px-3 py-2 text-white"
                />
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                  コピー
                </button>
              </div>
            </div>

            {/* 色情報 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <h4 className="noto-sans-jp-regular mb-2 text-xs text-gray-300">RGB</h4>
                <div className="rounded bg-gray-800 px-3 py-2 text-sm text-white">59, 130, 246</div>
              </div>
              <div>
                <h4 className="noto-sans-jp-regular mb-2 text-xs text-gray-300">HSL</h4>
                <div className="rounded bg-gray-800 px-3 py-2 text-sm text-white">
                  217°, 91%, 60%
                </div>
              </div>
              <div>
                <h4 className="noto-sans-jp-regular mb-2 text-xs text-gray-300">HSV</h4>
                <div className="rounded bg-gray-800 px-3 py-2 text-sm text-white">
                  217°, 76%, 96%
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ナビゲーション */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/04_tools"
              className="neue-haas-grotesk-display text-lg text-blue-400 hover:text-blue-300"
            >
              ← Tools
            </Link>
            <div className="flex gap-4">
              <Link
                href="/04_tools/ae-expression"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                AE Expression →
              </Link>
              <Link href="/04_tools/pomodoro" className="text-sm text-blue-400 hover:text-blue-300">
                Pomodoro →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
