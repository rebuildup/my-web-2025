import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Downloads - samuido | ファイルダウンロード',
  description: '無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供。',
  keywords: 'ダウンロード, 素材, ツール, テンプレート, 無償配布, ファイル',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/03_workshop/downloads',
  },
  openGraph: {
    title: 'Downloads - samuido | ファイルダウンロード',
    description: '無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供。',
    type: 'website',
    url: 'https://yusuke-kim.com/03_workshop/downloads',
    images: [
      {
        url: 'https://yusuke-kim.com/workshop/downloads-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Downloads - samuido | ファイルダウンロード',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downloads - samuido | ファイルダウンロード',
    description: '無償配布するファイルのダウンロード。素材、ツール、テンプレートなどを提供。',
    images: ['https://yusuke-kim.com/workshop/downloads-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'samuido Downloads',
  description: '無償配布するファイルのダウンロード',
  url: 'https://yusuke-kim.com/03_workshop/downloads',
  mainEntity: {
    '@type': 'ItemList',
    name: 'Download List',
    description: 'ダウンロードファイルの一覧',
  },
};

// サンプルファイルデータ
const files = [
  {
    id: 'ui-kit-template',
    name: 'UI Kit Template',
    description:
      'Figma用のUIキットテンプレート。モダンなデザインシステムとコンポーネントライブラリ。',
    category: 'テンプレート',
    subcategory: 'デザインテンプレート',
    version: '1.2.0',
    lastUpdated: '2024-12-15',
    downloads: 850,
    rating: 4.7,
    fileSize: '25.8MB',
    fileFormat: 'Figma',
    license: 'MIT',
    downloadUrl: '/downloads/ui-kit-template.zip',
    image: '/downloads/ui-kit-template.jpg',
    tags: ['Figma', 'UI/UX', 'デザインシステム'],
    systemRequirements: ['Figma 2023+'],
  },
  {
    id: 'motion-graphics-pack',
    name: 'Motion Graphics Pack',
    description:
      'AfterEffects用のモーショングラフィックス素材集。エフェクト、エクスプレッション、テンプレート。',
    category: '素材ファイル',
    subcategory: '動画素材',
    version: '2.0.1',
    lastUpdated: '2024-12-10',
    downloads: 1200,
    rating: 4.9,
    fileSize: '156.2MB',
    fileFormat: 'AfterEffects',
    license: 'MIT',
    downloadUrl: '/downloads/motion-graphics-pack.zip',
    image: '/downloads/motion-graphics-pack.jpg',
    tags: ['AfterEffects', 'Motion Graphics', 'エフェクト'],
    systemRequirements: ['AfterEffects 2020+'],
  },
  {
    id: 'react-component-library',
    name: 'React Component Library',
    description: 'React用のコンポーネントライブラリ。TypeScript対応でStorybookドキュメント付き。',
    category: 'ツール',
    subcategory: 'ライブラリ',
    version: '3.1.0',
    lastUpdated: '2024-12-05',
    downloads: 650,
    rating: 4.8,
    fileSize: '2.1MB',
    fileFormat: 'NPM Package',
    license: 'MIT',
    downloadUrl: '/downloads/react-component-library.zip',
    image: '/downloads/react-component-library.jpg',
    tags: ['React', 'TypeScript', 'コンポーネント'],
    systemRequirements: ['Node.js 16+', 'React 18+'],
  },
  {
    id: 'icon-set-modern',
    name: 'Modern Icon Set',
    description: 'モダンなデザインのアイコンセット。SVG形式で高解像度対応。',
    category: '素材ファイル',
    subcategory: '画像素材',
    version: '1.5.0',
    lastUpdated: '2024-11-28',
    downloads: 980,
    rating: 4.6,
    fileSize: '8.5MB',
    fileFormat: 'SVG',
    license: 'MIT',
    downloadUrl: '/downloads/icon-set-modern.zip',
    image: '/downloads/icon-set-modern.jpg',
    tags: ['アイコン', 'SVG', 'デザイン'],
    systemRequirements: ['SVG対応ブラウザ'],
  },
  {
    id: 'threejs-examples',
    name: 'Three.js Examples',
    description:
      'Three.jsを使った3Dグラフィックスのサンプルコード集。基本的な実装から高度なテクニックまで。',
    category: 'ツール',
    subcategory: 'サンプル',
    version: '2.2.0',
    lastUpdated: '2024-11-20',
    downloads: 420,
    rating: 4.5,
    fileSize: '15.2MB',
    fileFormat: 'JavaScript',
    license: 'MIT',
    downloadUrl: '/downloads/threejs-examples.zip',
    image: '/downloads/threejs-examples.jpg',
    tags: ['Three.js', '3D', 'JavaScript'],
    systemRequirements: ['Three.js 0.150+'],
  },
  {
    id: 'webgl-shaders',
    name: 'WebGL Shaders Collection',
    description:
      'WebGLシェーダーのコレクション。フラグメントシェーダーとバーテックスシェーダーのサンプル。',
    category: '素材ファイル',
    subcategory: '3D素材',
    version: '1.8.0',
    lastUpdated: '2024-11-15',
    downloads: 320,
    rating: 4.4,
    fileSize: '3.8MB',
    fileFormat: 'GLSL',
    license: 'MIT',
    downloadUrl: '/downloads/webgl-shaders.zip',
    image: '/downloads/webgl-shaders.jpg',
    tags: ['WebGL', 'シェーダー', 'GLSL'],
    systemRequirements: ['WebGL対応ブラウザ'],
  },
];

const categories = ['すべて', '素材ファイル', 'ツール', 'テンプレート', 'その他'];
const subcategories = [
  'すべて',
  '画像素材',
  '動画素材',
  '3D素材',
  'スクリプト',
  'ライブラリ',
  'デザインテンプレート',
  'コードテンプレート',
  'サンプル',
];

export default function DownloadsPage() {
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
            Downloads
          </h1>
          <p className="noto-sans-jp-light mb-8 text-xl text-gray-300 md:text-2xl">
            素材・ツール・テンプレート配布
          </p>
          <p className="noto-sans-jp-regular mx-auto max-w-3xl text-base md:text-lg">
            無償配布するファイルのダウンロード
            <br />
            素材、ツール、テンプレートなどを提供
          </p>
        </section>

        {/* 統計情報 */}
        <section className="py-8">
          <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                {files.length}
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">ファイル</div>
            </div>
            <div className="card text-center">
              <div className="neue-haas-grotesk-display mb-2 text-2xl text-blue-400 md:text-3xl">
                {files.reduce((sum, file) => sum + file.downloads, 0).toLocaleString()}
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
                6
              </div>
              <div className="noto-sans-jp-regular text-sm text-gray-300">ファイル形式</div>
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
                placeholder="ファイルを検索..."
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

        {/* ファイル一覧 */}
        <section className="py-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="neue-haas-grotesk-display text-2xl text-white">ファイル一覧</h2>
            <div className="text-sm text-gray-400">{files.length} ファイル</div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {files.map(file => (
              <article key={file.id} className="card group">
                {/* サムネイル */}
                <div className="mb-4 aspect-video overflow-hidden rounded-lg bg-gray-700">
                  <div className="h-full w-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                </div>

                {/* メタ情報 */}
                <div className="mb-3 flex items-center gap-4 text-xs text-gray-400">
                  <span className="bg-blue-600 px-2 py-1 text-white">{file.category}</span>
                  <span className="bg-gray-600 px-2 py-1 text-white">{file.subcategory}</span>
                  <span>v{file.version}</span>
                </div>

                {/* タイトル */}
                <h3 className="neue-haas-grotesk-display mb-3 text-lg text-white group-hover:text-blue-400">
                  {file.name}
                </h3>

                {/* 説明 */}
                <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">{file.description}</p>

                {/* 統計情報 */}
                <div className="mb-4 flex items-center justify-between text-xs text-gray-400">
                  <span>{file.downloads} downloads</span>
                  <span>★ {file.rating}</span>
                  <span>{file.fileSize}</span>
                </div>

                {/* ファイル情報 */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">形式:</span>
                    <span className="text-white">{file.fileFormat}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">ライセンス:</span>
                    <span className="text-white">{file.license}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300">更新日:</span>
                    <span className="text-white">{file.lastUpdated}</span>
                  </div>
                </div>

                {/* システム要件 */}
                {file.systemRequirements && (
                  <div className="mb-4">
                    <div className="noto-sans-jp-regular mb-2 text-xs text-gray-300">
                      システム要件:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {file.systemRequirements.map(requirement => (
                        <span
                          key={requirement}
                          className="bg-gray-600 px-2 py-1 text-xs text-white"
                        >
                          {requirement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* タグ */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {file.tags.map(tag => (
                    <span key={tag} className="bg-gray-600 px-2 py-1 text-xs text-white">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <a
                    href={file.downloadUrl}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-center text-sm text-white transition-colors hover:bg-blue-700"
                  >
                    ダウンロード
                  </a>
                  <button className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600">
                    詳細
                  </button>
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
                href="/03_workshop/plugins"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Plugins →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
