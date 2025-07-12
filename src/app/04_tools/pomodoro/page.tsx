import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pomodoro Timer - samuido | ポモドーロタイマー',
  description:
    'シンプルなポモドーロタイマー。25分作業 / 5分休憩のサイクルで効率的な作業をサポート。',
  keywords: 'ポモドーロ, タイマー, 生産性, 作業効率, 時間管理',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/04_tools/pomodoro',
  },
  openGraph: {
    title: 'Pomodoro Timer - samuido | ポモドーロタイマー',
    description:
      'シンプルなポモドーロタイマー。25分作業 / 5分休憩のサイクルで効率的な作業をサポート。',
    type: 'website',
    url: 'https://yusuke-kim.com/04_tools/pomodoro',
    images: [
      {
        url: 'https://yusuke-kim.com/tools/pomodoro-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pomodoro Timer - samuido | ポモドーロタイマー',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomodoro Timer - samuido | ポモドーロタイマー',
    description:
      'シンプルなポモドーロタイマー。25分作業 / 5分休憩のサイクルで効率的な作業をサポート。',
    images: ['https://yusuke-kim.com/tools/pomodoro-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Pomodoro Timer',
  description: 'シンプルなポモドーロタイマー',
  url: 'https://yusuke-kim.com/04_tools/pomodoro',
  applicationCategory: 'ProductivityApplication',
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

export default function PomodoroPage() {
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
            Pomodoro Timer
          </h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            ポモドーロタイマー
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-gray-400 md:text-lg">
            シンプルなポモドーロタイマー
            <br />
            25分作業 / 5分休憩のサイクルで効率的な作業をサポート
          </p>
        </section>

        {/* メインタイマー */}
        <section className="py-8">
          <div className="card text-center">
            {/* タイマー表示 */}
            <div className="mb-8">
              <div className="neue-haas-grotesk-display mb-4 text-6xl text-white md:text-8xl">
                25:00
              </div>
              <div className="noto-sans-jp-regular text-lg text-gray-300">作業時間</div>
            </div>

            {/* プログレスバー */}
            <div className="mb-8">
              <div className="mb-2 flex items-center justify-between text-sm text-gray-400">
                <span>進捗</span>
                <span>0%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-700">
                <div className="h-full w-0 rounded-full bg-blue-600 transition-all duration-1000"></div>
              </div>
            </div>

            {/* コントロールボタン */}
            <div className="mb-8 flex items-center justify-center gap-4">
              <button className="rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700">
                開始
              </button>
              <button className="rounded-lg bg-gray-700 px-6 py-3 text-white transition-colors hover:bg-gray-600">
                一時停止
              </button>
              <button className="rounded-lg bg-red-600 px-6 py-3 text-white transition-colors hover:bg-red-700">
                リセット
              </button>
            </div>

            {/* モード選択 */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">
                  作業 (25分)
                </button>
                <button className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600">
                  休憩 (5分)
                </button>
                <button className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white hover:bg-gray-600">
                  長休憩 (15分)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 統計情報 */}
        <section className="py-8">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white">
            今日の統計
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-3xl text-blue-400">4</div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">完了セッション</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-3xl text-green-400">100</div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">作業時間 (分)</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-3xl text-yellow-400">20</div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">休憩時間 (分)</div>
            </div>
          </div>
        </section>

        {/* 設定 */}
        <section className="py-8">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white">設定</h2>
          <div className="card">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* 時間設定 */}
              <div>
                <h3 className="noto-sans-jp-regular mb-4 text-sm text-gray-300">時間設定</h3>
                <div className="space-y-4">
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-xs text-gray-300">
                      作業時間 (分)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      defaultValue="25"
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-xs text-gray-300">
                      休憩時間 (分)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      defaultValue="5"
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="noto-sans-jp-regular mb-2 block text-xs text-gray-300">
                      長休憩時間 (分)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      defaultValue="15"
                      className="w-full rounded-lg bg-gray-800 px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* 通知設定 */}
              <div>
                <h3 className="noto-sans-jp-regular mb-4 text-sm text-gray-300">通知設定</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">ブラウザ通知</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">サウンド通知</span>
                    <input type="checkbox" className="rounded" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">自動開始</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">自動休憩</span>
                    <input type="checkbox" className="rounded" />
                  </div>
                </div>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="mt-6 text-center">
              <button className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700">
                設定を保存
              </button>
            </div>
          </div>
        </section>

        {/* 履歴 */}
        <section className="py-8">
          <h2 className="neue-haas-grotesk-display mb-8 text-center text-2xl text-white">履歴</h2>
          <div className="card">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded bg-gray-800 p-4">
                <div>
                  <div className="noto-sans-jp-regular text-sm text-white">作業セッション #4</div>
                  <div className="noto-sans-jp-light text-xs text-gray-400">今日 14:30 - 14:55</div>
                </div>
                <div className="text-right">
                  <div className="noto-sans-jp-regular text-sm text-green-400">25分</div>
                  <div className="noto-sans-jp-light text-xs text-gray-400">完了</div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded bg-gray-800 p-4">
                <div>
                  <div className="noto-sans-jp-regular text-sm text-white">休憩セッション #4</div>
                  <div className="noto-sans-jp-light text-xs text-gray-400">今日 14:25 - 14:30</div>
                </div>
                <div className="text-right">
                  <div className="noto-sans-jp-regular text-sm text-yellow-400">5分</div>
                  <div className="noto-sans-jp-light text-xs text-gray-400">完了</div>
                </div>
              </div>
              <div className="flex items-center justify-between rounded bg-gray-800 p-4">
                <div>
                  <div className="noto-sans-jp-regular text-sm text-white">作業セッション #3</div>
                  <div className="noto-sans-jp-light text-xs text-gray-400">今日 13:55 - 14:20</div>
                </div>
                <div className="text-right">
                  <div className="noto-sans-jp-regular text-sm text-green-400">25分</div>
                  <div className="noto-sans-jp-light text-xs text-gray-400">完了</div>
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
              <Link
                href="/04_tools/color-palette"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Color Palette →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
