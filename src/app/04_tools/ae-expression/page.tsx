import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AE Expression Tool - samuido | AfterEffects エクスプレッション',
  description:
    'AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。',
  keywords: 'AfterEffects, エクスプレッション, アニメーション, エフェクト, Scratch, ブロックUI',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/04_tools/ae-expression',
  },
  openGraph: {
    title: 'AE Expression Tool - samuido | AfterEffects エクスプレッション',
    description:
      'AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。',
    type: 'website',
    url: 'https://yusuke-kim.com/04_tools/ae-expression',
    images: [
      {
        url: 'https://yusuke-kim.com/tools/ae-expression-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AE Expression Tool - samuido | AfterEffects エクスプレッション',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AE Expression Tool - samuido | AfterEffects エクスプレッション',
    description:
      'AfterEffectsのエクスプレッションをScratch風ブロックUIで簡単に設定。アニメーション、エフェクト、変形などのエクスプレッションを一覧表示。',
    images: ['https://yusuke-kim.com/tools/ae-expression-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AE Expression Tool',
  description: 'AfterEffectsのエクスプレッションをScratch風ブロックUIで設定',
  url: 'https://yusuke-kim.com/04_tools/ae-expression',
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

// サンプルエクスプレッションデータ
const expressions = [
  {
    id: 'wiggle',
    name: 'wiggle',
    description: 'ランダムな動きを生成',
    category: 'アニメーション',
    difficulty: '初級',
    usage: '高',
    code: 'wiggle(freq, amp)',
    parameters: [
      { name: 'freq', type: 'number', description: '周波数', default: 2 },
      { name: 'amp', type: 'number', description: '振幅', default: 50 },
    ],
    example: 'wiggle(2, 50)',
  },
  {
    id: 'loopOut',
    name: 'loopOut',
    description: 'アニメーションをループ',
    category: 'アニメーション',
    difficulty: '初級',
    usage: '高',
    code: 'loopOut(type, numKeyframes)',
    parameters: [
      {
        name: 'type',
        type: 'string',
        description: 'ループタイプ',
        default: 'cycle',
        options: ['cycle', 'pingpong', 'continue', 'offset'],
      },
      { name: 'numKeyframes', type: 'number', description: 'キーフレーム数', default: 0 },
    ],
    example: 'loopOut("cycle")',
  },
  {
    id: 'time',
    name: 'time',
    description: '時間に基づくアニメーション',
    category: 'アニメーション',
    difficulty: '初級',
    usage: '高',
    code: 'time * speed',
    parameters: [{ name: 'speed', type: 'number', description: '速度', default: 1 }],
    example: 'time * 100',
  },
  {
    id: 'random',
    name: 'random',
    description: 'ランダムな値を生成',
    category: 'アニメーション',
    difficulty: '中級',
    usage: '中',
    code: 'random(min, max)',
    parameters: [
      { name: 'min', type: 'number', description: '最小値', default: 0 },
      { name: 'max', type: 'number', description: '最大値', default: 100 },
    ],
    example: 'random(0, 100)',
  },
  {
    id: 'blur',
    name: 'blur',
    description: 'ぼかし効果',
    category: 'エフェクト',
    difficulty: '初級',
    usage: '中',
    code: 'blur.amount',
    parameters: [{ name: 'amount', type: 'number', description: 'ぼかし強度', default: 10 }],
    example: 'blur.amount = 10',
  },
  {
    id: 'glow',
    name: 'glow',
    description: 'グロー効果',
    category: 'エフェクト',
    difficulty: '中級',
    usage: '中',
    code: 'glow.intensity',
    parameters: [{ name: 'intensity', type: 'number', description: 'グロー強度', default: 5 }],
    example: 'glow.intensity = 5',
  },
  {
    id: 'scale',
    name: 'scale',
    description: 'スケール変更',
    category: '変形',
    difficulty: '初級',
    usage: '高',
    code: 'scale * factor',
    parameters: [{ name: 'factor', type: 'number', description: 'スケール係数', default: 1 }],
    example: 'scale * 1.5',
  },
  {
    id: 'rotation',
    name: 'rotation',
    description: '回転',
    category: '変形',
    difficulty: '初級',
    usage: '高',
    code: 'rotation + angle',
    parameters: [{ name: 'angle', type: 'number', description: '回転角度', default: 0 }],
    example: 'rotation + 90',
  },
];

const categories = ['すべて', 'アニメーション', 'エフェクト', '変形'];
const difficulties = ['すべて', '初級', '中級', '上級'];

export default function AEExpressionPage() {
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
            AE Expression Tool
          </h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            AfterEffects エクスプレッション
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            Scratch風ブロックUIで簡単に設定
            <br />
            アニメーション、エフェクト、変形などのエクスプレッションを一覧表示
          </p>
        </section>

        {/* フィルター */}
        <section className="py-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* 検索 */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="エクスプレッションを検索..."
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

          {/* 難易度フィルター */}
          <div className="mb-8">
            <h3 className="noto-sans-jp-regular mb-4 text-sm text-gray-300">難易度で絞り込み:</h3>
            <div className="flex flex-wrap gap-2">
              {difficulties.map(difficulty => (
                <button
                  key={difficulty}
                  className="rounded-lg bg-gray-800 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-gray-700"
                >
                  {difficulty}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* エクスプレッション一覧 */}
        <section className="py-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="neue-haas-grotesk-display text-2xl text-white">
              エクスプレッション一覧
            </h2>
            <div className="text-sm text-gray-400">{expressions.length} エクスプレッション</div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {expressions.map(expression => (
              <article key={expression.id} className="card group">
                {/* メタ情報 */}
                <div className="mb-3 flex items-center gap-4 text-xs text-gray-400">
                  <span className="bg-blue-600 px-2 py-1 text-white">{expression.category}</span>
                  <span className="bg-gray-600 px-2 py-1 text-white">{expression.difficulty}</span>
                  <span className="bg-green-600 px-2 py-1 text-white">{expression.usage}</span>
                </div>

                {/* タイトル */}
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white group-hover:text-blue-400">
                  {expression.name}
                </h3>

                {/* 説明 */}
                <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">
                  {expression.description}
                </p>

                {/* コード例 */}
                <div className="mb-4">
                  <div className="noto-sans-jp-regular mb-2 text-xs text-gray-300">コード例:</div>
                  <code className="block rounded bg-gray-800 px-3 py-2 text-sm text-green-400">
                    {expression.example}
                  </code>
                </div>

                {/* パラメータ */}
                <div className="mb-4">
                  <div className="noto-sans-jp-regular mb-2 text-xs text-gray-300">パラメータ:</div>
                  <div className="space-y-2">
                    {expression.parameters.map(param => (
                      <div key={param.name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">{param.name}:</span>
                        <span className="text-white">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <button className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-700">
                    ブロックUIで編集
                  </button>
                  <button className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600">
                    コピー
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ブロックUIエディター */}
        <section className="py-12">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white md:text-3xl">
            Scratch風ブロックUIエディター
          </h2>
          <div className="card">
            <div className="mb-6">
              <h3 className="neue-haas-grotesk-display mb-4 text-lg text-white">
                エクスプレッション構築
              </h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* ブロックパレット */}
                <div>
                  <h4 className="noto-sans-jp-regular mb-3 text-sm text-gray-300">
                    ブロックパレット
                  </h4>
                  <div className="space-y-2">
                    <div className="rounded bg-blue-600 p-3 text-sm text-white">
                      wiggle(freq, amp)
                    </div>
                    <div className="rounded bg-green-600 p-3 text-sm text-white">loopOut(type)</div>
                    <div className="rounded bg-yellow-600 p-3 text-sm text-white">time * speed</div>
                    <div className="rounded bg-red-600 p-3 text-sm text-white">
                      random(min, max)
                    </div>
                  </div>
                </div>

                {/* ワークスペース */}
                <div>
                  <h4 className="noto-sans-jp-regular mb-3 text-sm text-gray-300">
                    ワークスペース
                  </h4>
                  <div className="min-h-[200px] rounded border-2 border-dashed border-gray-600 bg-gray-800 p-4">
                    <p className="text-center text-sm text-gray-400">
                      ブロックをドラッグ&ドロップしてください
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* プレビュー */}
            <div className="mb-6">
              <h4 className="noto-sans-jp-regular mb-3 text-sm text-gray-300">生成されたコード</h4>
              <div className="rounded bg-gray-800 p-4">
                <code className="text-sm text-green-400">wiggle(2, 50)</code>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex gap-2">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                コードをコピー
              </button>
              <button className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600">
                リセット
              </button>
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
                href="/04_tools/color-palette"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Color Palette →
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
