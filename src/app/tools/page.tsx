import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tools - samuido | 便利なWebツール集',
  description:
    '実用的なWebツールのコレクション。カラーパレット生成、QRコード作成、料金計算機など、作業効率向上を支援するツール群。',
  keywords: 'Webツール, カラーパレット, QRコード, 料金計算, テキストカウンタ, ツール集',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/tools',
  },
  openGraph: {
    title: 'Tools - samuido | 便利なWebツール集',
    description:
      '実用的なWebツールのコレクション。カラーパレット生成、QRコード作成、料金計算機など、作業効率向上を支援するツール群。',
    type: 'website',
    url: 'https://yusuke-kim.com/tools',
    images: [
      {
        url: 'https://yusuke-kim.com/tools-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tools - samuido | 便利なWebツール集',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tools - samuido | 便利なWebツール集',
    description:
      '実用的なWebツールのコレクション。カラーパレット生成、QRコード作成、料金計算機など、作業効率向上を支援するツール群。',
    images: ['https://yusuke-kim.com/tools-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'samuido Tools',
  description: '実用的なWebツールのコレクション',
  url: 'https://yusuke-kim.com/tools',
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'Webツール一覧',
    description: '作業効率向上を支援するWebツールのコレクション',
  },
};

export default function ToolsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container-grid">
        {/* ヒーローヘッダー */}
        <section className="py-16 text-center">
          <h1 className="neue-haas-grotesk-display mb-4 text-4xl text-white md:text-6xl">Tools</h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            便利なWebツール集
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base text-gray-400 md:text-lg">
            実用的なWebツールのコレクション
            <br />
            ユーザーの作業効率向上を支援します
          </p>
        </section>

        {/* 統計情報 */}
        <section className="py-12">
          <div className="mb-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                12
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">総ツール数</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                4.7K
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">月間利用数</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                98%
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">稼働率</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                24/7
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">利用可能</div>
            </div>
          </div>
        </section>

        {/* 人気ツール */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Popular Tools
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* カラーパレット */}
            <Link
              href="/tools/color-palette"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">Color Palette</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">カラーパレット生成ツール</p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• ランダムカラー生成</li>
                <li>• ハーモニーカラー計算</li>
                <li>• HEX・RGB・HSL対応</li>
                <li>• ワンクリックコピー</li>
              </ul>
              <div className="text-xs text-blue-400">1,247 利用 →</div>
            </Link>

            {/* QRコード生成器 */}
            <Link
              href="/tools/qr-generator"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">QR Generator</h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">QRコード生成ツール</p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• テキスト・URL対応</li>
                <li>• サイズ・エラー訂正レベル設定</li>
                <li>• PNG・SVG出力</li>
                <li>• 即座にダウンロード</li>
              </ul>
              <div className="text-xs text-blue-400">934 利用 →</div>
            </Link>

            {/* 料金計算機 */}
            <Link
              href="/tools/price-calculator"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-3 text-xl text-white">
                Price Calculator
              </h3>
              <p className="noto-sans-jp-regular mb-4 text-gray-300">制作依頼料金計算機</p>
              <ul className="noto-sans-jp-light mb-4 space-y-1 text-sm text-gray-400">
                <li>• 開発・映像制作対応</li>
                <li>• 期間・オプション計算</li>
                <li>• 詳細な内訳表示</li>
                <li>• 見積書PDF出力</li>
              </ul>
              <div className="text-xs text-blue-400">687 利用 →</div>
            </Link>
          </div>
        </section>

        {/* ツール一覧カード */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            All Tools
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* AE Expression */}
            <Link
              href="/tools/ae-expression"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">AE Expression</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                After
                Effectsエクスプレッション生成・編集ツール。Scratch風ブロックUIでパラメータ編集。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">After Effects</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Expression</span>
              </div>
            </Link>

            {/* Business Mail Block */}
            <Link
              href="/tools/business-mail-block"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">
                Business Mail Block
              </h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                ビジネスメールテンプレート生成ツール。依頼、問い合わせ、謝罪、納品連絡などのテンプレート。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Business</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Email</span>
              </div>
            </Link>

            {/* テキストカウンタ */}
            <Link
              href="/tools/text-counter"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">Text Counter</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                テキストの文字数・単語数・行数をリアルタイムカウント。制限文字数の確認に便利。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Text</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Counter</span>
              </div>
            </Link>

            {/* PNG Preview */}
            <Link
              href="/tools/sequential-png-preview"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">PNG Preview</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                連番PNG画像のプレビューツール。After Effectsレンダリング結果の確認に最適。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">PNG</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Preview</span>
              </div>
            </Link>

            {/* SVG to TSX */}
            <Link
              href="/tools/svg2tsx"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">SVG to TSX</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                SVGファイルをReact TSXコンポーネントに変換。props対応、TypeScript型定義生成。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">SVG</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">React</span>
              </div>
            </Link>

            {/* Pi Game */}
            <Link
              href="/tools/pi-game"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">Pi Game</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                円周率記憶ゲーム。どこまで円周率を覚えているかチャレンジ。記録保存・ランキング機能。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Game</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Memory</span>
              </div>
            </Link>

            {/* Pomodoro Timer */}
            <Link
              href="/tools/pomodoro"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">Pomodoro Timer</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                ポモドーロテクニック用タイマー。25分作業・5分休憩のサイクル管理。音声通知対応。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Timer</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Productivity</span>
              </div>
            </Link>

            {/* ProtoType */}
            <Link
              href="/tools/prototype"
              className="card block transition-colors hover:border-blue-500"
            >
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white">ProtoType</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-400">
                プロトタイピング・アイデア検証ツール。UI/UXのアイデアを素早く形にして検証。
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Prototype</span>
                <span className="bg-blue-600 px-2 py-1 text-xs text-white">Design</span>
              </div>
            </Link>

            {/* その他のツール */}
            <div className="card border-dashed border-gray-600">
              <h3 className="neue-haas-grotesk-display mb-2 text-lg text-gray-500">More Tools</h3>
              <p className="noto-sans-jp-light mb-3 text-sm text-gray-500">
                新しいツールを随時追加予定。リクエストがあればお気軽にお声かけください。
              </p>
              <div className="text-xs text-gray-600">Coming Soon...</div>
            </div>
          </div>
        </section>

        {/* 利用統計 */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Usage Statistics
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 人気ツールランキング */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">
                人気ツールランキング
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">Color Palette</div>
                    <div className="text-xs text-gray-500">1,247 利用</div>
                  </div>
                  <div className="text-sm text-blue-400">#1</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">QR Generator</div>
                    <div className="text-xs text-gray-500">934 利用</div>
                  </div>
                  <div className="text-sm text-blue-400">#2</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">
                      Price Calculator
                    </div>
                    <div className="text-xs text-gray-500">687 利用</div>
                  </div>
                  <div className="text-sm text-blue-400">#3</div>
                </div>
              </div>
            </div>

            {/* 新着ツール */}
            <div className="card">
              <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">新着ツール</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">SVG to TSX</div>
                    <div className="text-xs text-gray-500">2025/01/15 追加</div>
                  </div>
                  <div className="text-xs text-green-400">NEW</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">PNG Preview</div>
                    <div className="text-xs text-gray-500">2025/01/10 追加</div>
                  </div>
                  <div className="text-xs text-green-400">NEW</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="noto-sans-jp-regular text-sm text-gray-300">ProtoType</div>
                    <div className="text-xs text-gray-500">2025/01/05 追加</div>
                  </div>
                  <div className="text-xs text-blue-400">BETA</div>
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
