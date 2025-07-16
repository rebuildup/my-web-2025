import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tools - samuido | 実用的なWebツール集',
  description:
    'カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。',
  keywords: 'Webツール, カラーパレット, QRコード, ポモドーロ, タイピングゲーム, 実用ツール',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/04_tools',
  },
  openGraph: {
    title: 'Tools - samuido | 実用的なWebツール集',
    description:
      'カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。',
    type: 'website',
    url: 'https://yusuke-kim.com/04_tools',
    images: [
      {
        url: 'https://yusuke-kim.com/tools-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tools - samuido | 実用的なWebツール集',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tools - samuido | 実用的なWebツール集',
    description:
      'カラーパレット生成、QRコード作成、ポモドーロタイマーなど実用的なWebツールを無償提供。',
    images: ['https://yusuke-kim.com/tools-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'samuido Tools',
  description: '実用的なWebツールのコレクション',
  url: 'https://yusuke-kim.com/04_tools',
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
  mainEntity: {
    '@type': 'ItemList',
    name: 'Webツール一覧',
    description: 'カラーパレット、QRコード、タイマーなどの実用ツール',
  },
};

// サンプルツールデータ
const tools = [
  {
    id: 'ae-expression',
    name: 'AE Expression Tool',
    description:
      'AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。',
    category: 'デザイン',
    subcategory: 'AfterEffects',
    usageCount: 1250,
    rating: 4.8,
    image: '/tools/ae-expression.jpg',
    tags: ['AfterEffects', 'エクスプレッション', 'アニメーション', 'エフェクト'],
    url: '/04_tools/ae-expression',
  },
  {
    id: 'business-mail-block',
    name: 'Business Mail Block',
    description:
      'ビジネスメールのテンプレートをScratch風ブロックUIで組み合わせ。依頼メール、問い合わせ、謝罪メールなど。',
    category: 'ビジネス',
    subcategory: 'メール',
    usageCount: 890,
    rating: 4.7,
    image: '/tools/business-mail-block.jpg',
    tags: ['ビジネス', 'メール', 'テンプレート', 'コミュニケーション'],
    url: '/04_tools/business-mail-block',
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description:
      '色域を指定してランダムに色を生成。デザイナーや開発者向けのカラーパレット作成ツール。',
    category: 'デザイン',
    subcategory: 'カラー',
    usageCount: 2100,
    rating: 4.9,
    image: '/tools/color-palette.jpg',
    tags: ['カラーパレット', 'デザイン', '色生成', 'ランダム'],
    url: '/04_tools/color-palette',
  },
  {
    id: 'pi-game',
    name: 'Pi Game',
    description:
      '円周率を順番に押し続けるゲーム。テンキー表示で円周率の順番に押下、間違えたらリセット。',
    category: 'ゲーム',
    subcategory: '教育',
    usageCount: 650,
    rating: 4.5,
    image: '/tools/pi-game.jpg',
    tags: ['ゲーム', '円周率', '教育', 'タイピング'],
    url: '/04_tools/pi-game',
  },
  {
    id: 'pomodoro',
    name: 'Pomodoro Timer',
    description:
      'シンプルなポモドーロタイマー。25分作業 / 5分休憩のサイクルで効率的な作業をサポート。',
    category: '生産性',
    subcategory: 'タイマー',
    usageCount: 1800,
    rating: 4.8,
    image: '/tools/pomodoro.jpg',
    tags: ['ポモドーロ', 'タイマー', '生産性', '作業効率'],
    url: '/04_tools/pomodoro',
  },
  {
    id: 'ProtoType',
    name: 'ProtoType',
    description: 'PIXIjsを使ったタイピングゲーム。GitHubリポジトリを使用したゲーム体験。',
    category: 'ゲーム',
    subcategory: 'タイピング',
    usageCount: 420,
    rating: 4.6,
    image: '/tools/prototype.jpg',
    tags: ['ゲーム', 'タイピング', 'PIXIjs', 'JavaScript'],
    url: '/04_tools/ProtoType',
  },
  {
    id: 'qr-generator',
    name: 'QR Code Generator',
    description: 'URLからQRコードを生成。ダウンロード機能付きで簡単にQRコードを作成。',
    category: 'ユーティリティ',
    subcategory: 'QRコード',
    usageCount: 1500,
    rating: 4.7,
    image: '/tools/qr-generator.jpg',
    tags: ['QRコード', 'URL', '生成', 'ダウンロード'],
    url: '/04_tools/qr-generator',
  },
  {
    id: 'sequential-png-preview',
    name: 'Sequential PNG Preview',
    description:
      '連番PNGをプレビュー。複数ファイル、フォルダ、ZIPからプレビュー可能。ローカル処理で安全。',
    category: 'デザイン',
    subcategory: 'プレビュー',
    usageCount: 320,
    rating: 4.4,
    image: '/tools/sequential-png-preview.jpg',
    tags: ['PNG', 'プレビュー', 'アニメーション', 'ローカル処理'],
    url: '/04_tools/sequential-png-preview',
  },
  {
    id: 'svg2tsx',
    name: 'SVG to TSX Converter',
    description:
      'SVG画像をReactコンポーネントに変換。TSX形式でダウンロード可能。ローカル処理で安全。',
    category: '開発',
    subcategory: 'コンバーター',
    usageCount: 780,
    rating: 4.6,
    image: '/tools/svg2tsx.jpg',
    tags: ['SVG', 'React', 'TSX', 'コンバーター'],
    url: '/04_tools/svg2tsx',
  },
  {
    id: 'text-counter',
    name: 'Text Counter',
    description: 'テキストの文字数をカウント。単純な文字数、改行数、行数カウント機能。',
    category: 'ユーティリティ',
    subcategory: 'テキスト',
    usageCount: 950,
    rating: 4.5,
    image: '/tools/text-counter.jpg',
    tags: ['テキスト', '文字数', 'カウント', 'ユーティリティ'],
    url: '/04_tools/text-counter',
  },
];

const categories = ['すべて', 'デザイン', 'ビジネス', 'ゲーム', '生産性', 'ユーティリティ', '開発'];
const subcategories = [
  'すべて',
  'AfterEffects',
  'メール',
  'カラー',
  '教育',
  'タイピング',
  'タイマー',
  'QRコード',
  'プレビュー',
  'コンバーター',
  'テキスト',
];

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
            実用的なWebツール集
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            カラーパレット生成、QRコード作成、ポモドーロタイマーなど
            <br />
            実用的なWebツールを無償提供
          </p>
        </section>

        {/* 統計情報 */}
        <section className="py-8">
          <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                {tools.length}
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">ツール</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                {tools.reduce((sum, tool) => sum + tool.usageCount, 0).toLocaleString()}
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">総利用回数</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                4.7
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">平均評価</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                6
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">カテゴリ</div>
            </div>
          </div>
        </section>

        {/* フィルター */}
        <section className="py-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* 検索 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="ツールを検索..."
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

          {/* サブカテゴリフィルター */}
          <div className="mb-8">
            <h3 className="noto-sans-jp-regular mb-4 text-sm text-gray-300">
              サブカテゴリで絞り込み:
            </h3>
            <div className="flex flex-wrap gap-2">
              {subcategories.map(subcategory => (
                <button
                  key={subcategory}
                  className="rounded-lg bg-gray-800 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700"
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ツール一覧 */}
        <section className="py-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="neue-haas-grotesk-display text-2xl text-white">ツール一覧</h2>
            <div className="text-sm text-gray-400">{tools.length} ツール</div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {tools.map(tool => (
              <article key={tool.id} className="card group" data-testid={`tool-card-${tool.id}`}>
                {/* ... */}
                <Link
                  href={tool.url}
                  className="block rounded-lg bg-blue-600 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-700"
                  data-testid={`tool-link-${tool.id}`}
                >
                  ツールを使用 →
                </Link>
              </article>
            ))}
          </div>
        </section>

        {/* 人気ツール */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Popular Tools
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* 人気ツール1 */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="neue-haas-grotesk-display text-lg text-white">
                  Color Palette Generator
                </h3>
                <span className="bg-green-600 px-2 py-1 text-xs text-white">2.1k uses</span>
              </div>
              <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">
                色域を指定してランダムに色を生成。デザイナーや開発者向けのカラーパレット作成ツール。
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-600 px-2 py-1 text-xs text-white">カラーパレット</span>
                  <span className="bg-gray-600 px-2 py-1 text-xs text-white">デザイン</span>
                </div>
                <Link
                  href="/04_tools/color-palette"
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  ツールを使用 →
                </Link>
              </div>
            </div>

            {/* 人気ツール2 */}
            <div className="card">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="neue-haas-grotesk-display text-lg text-white">Pomodoro Timer</h3>
                <span className="bg-green-600 px-2 py-1 text-xs text-white">1.8k uses</span>
              </div>
              <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">
                シンプルなポモドーロタイマー。25分作業 / 5分休憩のサイクルで効率的な作業をサポート。
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-600 px-2 py-1 text-xs text-white">ポモドーロ</span>
                  <span className="bg-gray-600 px-2 py-1 text-xs text-white">タイマー</span>
                </div>
                <Link
                  href="/04_tools/pomodoro"
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  ツールを使用 →
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
              <Link href="/03_workshop" className="text-sm text-blue-400 hover:text-blue-300">
                Workshop →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
