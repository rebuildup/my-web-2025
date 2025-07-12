import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Plugins - samuido | プラグイン一覧',
  description: '作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。',
  keywords: 'プラグイン, AfterEffects, Premiere Pro, エクスプレッション, エフェクト, ダウンロード',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/03_workshop/plugins',
  },
  openGraph: {
    title: 'Plugins - samuido | プラグイン一覧',
    description: '作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。',
    type: 'website',
    url: 'https://yusuke-kim.com/03_workshop/plugins',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop/plugins-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Plugins - samuido | プラグイン一覧',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plugins - samuido | プラグイン一覧',
    description: '作成したプラグインの一覧。AfterEffects、Premiere Pro、Web用プラグインを提供。',
    images: ['https://yusuke-kim.com/workshop/plugins-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'samuido Plugins',
  description: '作成したプラグインの一覧',
  url: 'https://yusuke-kim.com/03_workshop/plugins',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Plugin List',
    description: 'プラグインの一覧',
  },
};

// サンプルプラグインデータ
const plugins = [
  {
    id: 'ae-expression-generator',
    name: 'AE Expression Generator',
    description:
      'AfterEffects用のエクスプレッション自動生成プラグイン。複雑なアニメーションを簡単に作成。',
    category: 'AfterEffects',
    subcategory: 'エクスプレッション',
    version: '2.1.0',
    lastUpdated: '2024-12-10',
    downloads: 1250,
    rating: 4.8,
    compatibleSoftware: ['AfterEffects 2020+'],
    compatibleOS: ['Windows', 'macOS'],
    fileSize: '2.5MB',
    license: 'MIT',
    githubUrl: 'https://github.com/samuido/ae-expression-generator',
    downloadUrl: '/plugins/ae-expression-generator.zip',
    image: '/plugins/ae-expression-generator.jpg',
    tags: ['AfterEffects', 'エクスプレッション', 'アニメーション'],
  },
  {
    id: 'motion-graphics-toolkit',
    name: 'Motion Graphics Toolkit',
    description:
      'モーショングラフィックス制作に特化したツールキット。エフェクトとエクスプレッションのセット。',
    category: 'AfterEffects',
    subcategory: 'エフェクト',
    version: '1.5.2',
    lastUpdated: '2024-11-28',
    downloads: 890,
    rating: 4.9,
    compatibleSoftware: ['AfterEffects 2019+'],
    compatibleOS: ['Windows', 'macOS'],
    fileSize: '8.2MB',
    license: 'MIT',
    githubUrl: 'https://github.com/samuido/motion-graphics-toolkit',
    downloadUrl: '/plugins/motion-graphics-toolkit.zip',
    image: '/plugins/motion-graphics-toolkit.jpg',
    tags: ['AfterEffects', 'Motion Graphics', 'エフェクト'],
  },
  {
    id: 'premiere-transitions',
    name: 'Premiere Transitions Pack',
    description:
      'Premiere Pro用のカスタムトランジション集。プロフェッショナルな映像編集をサポート。',
    category: 'Premiere Pro',
    subcategory: 'トランジション',
    version: '1.2.0',
    lastUpdated: '2024-11-15',
    downloads: 650,
    rating: 4.7,
    compatibleSoftware: ['Premiere Pro 2021+'],
    compatibleOS: ['Windows', 'macOS'],
    fileSize: '15.8MB',
    license: 'MIT',
    githubUrl: 'https://github.com/samuido/premiere-transitions',
    downloadUrl: '/plugins/premiere-transitions.zip',
    image: '/plugins/premiere-transitions.jpg',
    tags: ['Premiere Pro', 'トランジション', '映像編集'],
  },
  {
    id: 'webgl-particles',
    name: 'WebGL Particles',
    description: 'WebGLを使ったパーティクルシステム。WebサイトやWebアプリケーションで使用可能。',
    category: 'Web',
    subcategory: 'WebGL',
    version: '3.0.1',
    lastUpdated: '2024-12-05',
    downloads: 420,
    rating: 4.6,
    compatibleSoftware: ['Chrome 90+', 'Firefox 88+', 'Safari 14+'],
    compatibleOS: ['Windows', 'macOS', 'Linux'],
    fileSize: '1.2MB',
    license: 'MIT',
    githubUrl: 'https://github.com/samuido/webgl-particles',
    downloadUrl: '/plugins/webgl-particles.zip',
    image: '/plugins/webgl-particles.jpg',
    tags: ['WebGL', 'パーティクル', 'JavaScript'],
  },
  {
    id: 'threejs-utilities',
    name: 'Three.js Utilities',
    description:
      'Three.js開発を効率化するユーティリティライブラリ。よく使う機能をまとめたコレクション。',
    category: 'Web',
    subcategory: 'Three.js',
    version: '2.3.0',
    lastUpdated: '2024-11-20',
    downloads: 380,
    rating: 4.5,
    compatibleSoftware: ['Three.js 0.150+'],
    compatibleOS: ['Windows', 'macOS', 'Linux'],
    fileSize: '850KB',
    license: 'MIT',
    githubUrl: 'https://github.com/samuido/threejs-utilities',
    downloadUrl: '/plugins/threejs-utilities.zip',
    image: '/plugins/threejs-utilities.jpg',
    tags: ['Three.js', '3D', 'JavaScript'],
  },
  {
    id: 'react-animation-hooks',
    name: 'React Animation Hooks',
    description: 'React用のアニメーションフック集。スムーズなアニメーションを簡単に実装。',
    category: 'Web',
    subcategory: 'React',
    version: '1.8.0',
    lastUpdated: '2024-12-01',
    downloads: 720,
    rating: 4.8,
    compatibleSoftware: ['React 18+'],
    compatibleOS: ['Windows', 'macOS', 'Linux'],
    fileSize: '450KB',
    license: 'MIT',
    githubUrl: 'https://github.com/samuido/react-animation-hooks',
    downloadUrl: '/plugins/react-animation-hooks.zip',
    image: '/plugins/react-animation-hooks.jpg',
    tags: ['React', 'アニメーション', 'JavaScript'],
  },
];

const categories = ['すべて', 'AfterEffects', 'Premiere Pro', 'Web'];
const subcategories = [
  'すべて',
  'エクスプレッション',
  'エフェクト',
  'トランジション',
  'WebGL',
  'Three.js',
  'React',
];

export default function PluginsPage() {
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
            Plugins
          </h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            AfterEffects・Premiere Pro・Web用プラグイン
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            作成したプラグインの一覧
            <br />
            ダウンロード統計、バージョン管理、使用方法説明付き
          </p>
        </section>

        {/* 統計情報 */}
        <section className="py-8">
          <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                {plugins.length}
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">プラグイン</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                {plugins.reduce((sum, plugin) => sum + plugin.downloads, 0).toLocaleString()}
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">総ダウンロード数</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                4.7
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">平均評価</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                3
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">対応ソフト</div>
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
                placeholder="プラグインを検索..."
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

        {/* プラグイン一覧 */}
        <section className="py-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="neue-haas-grotesk-display text-2xl text-white">プラグイン一覧</h2>
            <div className="text-sm text-gray-400">{plugins.length} プラグイン</div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {plugins.map(plugin => (
              <article key={plugin.id} className="card group">
                {/* サムネイル */}
                <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gray-700">
                  <div className="h-full w-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                </div>

                {/* メタ情報 */}
                <div className="mb-3 flex items-center gap-4 text-xs text-gray-400">
                  <span className="bg-blue-600 px-2 py-1 text-white">{plugin.category}</span>
                  <span className="bg-gray-600 px-2 py-1 text-white">{plugin.subcategory}</span>
                  <span>v{plugin.version}</span>
                </div>

                {/* タイトル */}
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white group-hover:text-blue-400">
                  {plugin.name}
                </h3>

                {/* 説明 */}
                <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">
                  {plugin.description}
                </p>

                {/* 統計情報 */}
                <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
                  <span>{plugin.downloads} downloads</span>
                  <span>★ {plugin.rating}</span>
                  <span>{plugin.fileSize}</span>
                </div>

                {/* 対応情報 */}
                <div className="mb-4">
                  <div className="noto-sans-jp-regular mb-2 text-xs text-gray-300">対応ソフト:</div>
                  <div className="flex flex-wrap gap-1">
                    {plugin.compatibleSoftware.map(software => (
                      <span key={software} className="bg-gray-600 px-2 py-1 text-xs text-white">
                        {software}
                      </span>
                    ))}
                  </div>
                </div>

                {/* タグ */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {plugin.tags.map(tag => (
                    <span key={tag} className="bg-gray-600 px-2 py-1 text-xs text-white">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <a
                    href={plugin.downloadUrl}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-700"
                  >
                    ダウンロード
                  </a>
                  <a
                    href={plugin.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
                  >
                    GitHub
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ページネーション */}
        <section className="py-8">
          <div className="flex items-center justify-center gap-2">
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
              前のページ
            </button>
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">1</button>
            <button className="rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">
              次のページ
            </button>
          </div>
        </section>

        {/* ナビゲーション */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/03_workshop"
              className="neue-haas-grotesk-display text-lg text-blue-400 hover:text-blue-300"
            >
              ← Workshop
            </Link>
            <div className="flex gap-4">
              <Link href="/03_workshop/blog" className="text-sm text-blue-400 hover:text-blue-300">
                Blog →
              </Link>
              <Link
                href="/03_workshop/downloads"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Downloads →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
