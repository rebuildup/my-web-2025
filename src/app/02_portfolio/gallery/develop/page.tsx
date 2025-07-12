import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Grid, List, Play, Github, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Development Works - samuido | 開発作品ギャラリー',
  description:
    'samuidoの開発作品ギャラリー。Webアプリ、ゲーム、ツール、プラグインなどの開発作品を一覧でご覧いただけます。',
  keywords: '開発作品, Webアプリ, ゲーム開発, ツール, プラグイン, React, NextJS',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://yusuke-kim.com/02_portfolio/gallery/develop',
  },
  openGraph: {
    title: 'Development Works - samuido | 開発作品ギャラリー',
    description:
      'samuidoの開発作品ギャラリー。Webアプリ、ゲーム、ツール、プラグインなどの開発作品を一覧でご覧いただけます。',
    type: 'website',
    url: 'https://yusuke-kim.com/02_portfolio/gallery/develop',
    images: [
      {
        url: 'https://yusuke-kim.com/portfolio/gallery-develop-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Development Works - samuido | 開発作品ギャラリー',
      },
    ],
    siteName: 'samuido',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Development Works - samuido | 開発作品ギャラリー',
    description:
      'samuidoの開発作品ギャラリー。Webアプリ、ゲーム、ツール、プラグインなどの開発作品を一覧でご覧いただけます。',
    images: ['https://yusuke-kim.com/portfolio/gallery-develop-twitter-image.jpg'],
    creator: '@361do_sleep',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'samuido Development Works Gallery',
  description: '開発作品ギャラリー',
  url: 'https://yusuke-kim.com/02_portfolio/gallery/develop',
  mainEntity: {
    '@type': 'ItemList',
    name: '開発作品一覧',
    description: 'Webアプリ、ゲーム、ツール、プラグインなどの開発作品',
  },
  author: {
    '@type': 'Person',
    name: '木村友亮',
    alternateName: 'samuido',
  },
};

// サンプル開発作品データ
const sampleDevWorks = [
  {
    id: 1,
    title: 'React Portfolio Website',
    description:
      'Next.js 15 + React 19 + Tailwind CSSで構築したモダンなポートフォリオサイト。384px基準のレスポンシブデザイン。',
    thumbnail: '/api/placeholder/400/300',
    technology: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    category: 'Web App',
    year: 2025,
    repository: 'https://github.com/samuido/portfolio',
    demo: 'https://yusuke-kim.com',
    previewVideo: 'https://youtube.com/watch?v=example',
  },
  {
    id: 2,
    title: 'WebGL Particle System',
    description:
      'Three.jsを使用したインタラクティブなパーティクルシステム。マウス操作でパーティクルを制御できます。',
    thumbnail: '/api/placeholder/400/300',
    technology: ['Three.js', 'WebGL', 'JavaScript', 'GLSL'],
    category: 'WebGL',
    year: 2024,
    repository: 'https://github.com/samuido/particle-system',
    demo: 'https://particle-demo.samuido.com',
    previewVideo: 'https://youtube.com/watch?v=example2',
  },
  {
    id: 3,
    title: 'After Effects Plugin',
    description:
      'After Effects用のカスタムプラグイン。エクスプレッション生成とアニメーション制御機能。',
    thumbnail: '/api/placeholder/400/300',
    technology: ['JavaScript', 'After Effects', 'ExtendScript'],
    category: 'Plugin',
    year: 2024,
    repository: 'https://github.com/samuido/ae-plugin',
    demo: null,
    previewVideo: 'https://youtube.com/watch?v=example3',
  },
  {
    id: 4,
    title: 'Unity Game Project',
    description: 'Unityで制作した2Dアクションゲーム。物理演算とパーティクルエフェクトを活用。',
    thumbnail: '/api/placeholder/400/300',
    technology: ['Unity', 'C#', '2D Graphics', 'Physics'],
    category: 'Game',
    year: 2023,
    repository: 'https://github.com/samuido/unity-game',
    demo: 'https://game-demo.samuido.com',
    previewVideo: 'https://youtube.com/watch?v=example4',
  },
  {
    id: 5,
    title: 'Node.js API Server',
    description: 'Express.js + MongoDBで構築したRESTful APIサーバー。認証とデータベース管理機能。',
    thumbnail: '/api/placeholder/400/300',
    technology: ['Node.js', 'Express', 'MongoDB', 'JWT'],
    category: 'Backend',
    year: 2023,
    repository: 'https://github.com/samuido/api-server',
    demo: 'https://api-demo.samuido.com',
    previewVideo: null,
  },
  {
    id: 6,
    title: 'React Native App',
    description: 'React Nativeで制作したモバイルアプリ。クロスプラットフォーム対応。',
    thumbnail: '/api/placeholder/400/300',
    technology: ['React Native', 'JavaScript', 'Mobile', 'iOS', 'Android'],
    category: 'Mobile',
    year: 2023,
    repository: 'https://github.com/samuido/react-native-app',
    demo: null,
    previewVideo: 'https://youtube.com/watch?v=example6',
  },
];

export default function DevelopmentWorksGalleryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-grid">
        {/* Navigation */}
        <nav className="border-foreground/20 border-b p-4">
          <div className="container mx-auto">
            <Link
              href="/02_portfolio"
              className="neue-haas-grotesk-display text-primary hover:text-primary/80 flex items-center space-x-2 text-xl"
            >
              <ArrowLeft size={20} />
              <span>← Portfolio</span>
            </Link>
          </div>
        </nav>

        {/* Header */}
        <header className="border-foreground/20 border-b">
          <div className="container mx-auto py-8">
            <h1 className="neue-haas-grotesk-display mb-4 text-3xl text-white md:text-4xl">
              Development Works
            </h1>
            <p className="noto-sans-jp-regular text-lg text-gray-300">
              プログラミング関連の制作作品を2列交互配置で表示
            </p>
          </div>
        </header>

        {/* Filter and Search */}
        <section className="py-8">
          <div className="card">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search size={20} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="作品を検索..."
                    className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-gray-400" />
                  <select className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="">全カテゴリ</option>
                    <option value="web-app">Web App</option>
                    <option value="webgl">WebGL</option>
                    <option value="plugin">Plugin</option>
                    <option value="game">Game</option>
                    <option value="backend">Backend</option>
                    <option value="mobile">Mobile</option>
                  </select>
                  <select className="noto-sans-jp-regular border border-gray-600 bg-gray-700 px-4 py-2 text-white focus:border-blue-500 focus:outline-none">
                    <option value="">全技術</option>
                    <option value="react">React</option>
                    <option value="nextjs">Next.js</option>
                    <option value="threejs">Three.js</option>
                    <option value="unity">Unity</option>
                    <option value="nodejs">Node.js</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded border border-gray-600 p-2 text-gray-400 hover:border-blue-500 hover:text-blue-400">
                  <Grid size={20} />
                </button>
                <button className="rounded border border-gray-600 p-2 text-gray-400 hover:border-blue-500 hover:text-blue-400">
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Works Grid - 2列交互配置 */}
        <section className="py-8">
          <div className="space-y-12">
            {sampleDevWorks.map((work, index) => (
              <div
                key={work.id}
                className={`flex flex-col gap-8 md:flex-row ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* サムネイル */}
                <div className="flex-1">
                  <div className="card group cursor-pointer transition-all hover:border-blue-500">
                    <div className="mb-4 aspect-video overflow-hidden rounded bg-gray-700">
                      <div className="h-full w-full bg-gradient-to-br from-gray-600 to-gray-800"></div>
                    </div>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="bg-blue-600 px-2 py-1 text-xs text-white">
                        {work.category}
                      </span>
                      <span className="text-xs text-gray-500">{work.year}</span>
                    </div>
                    <h3 className="neue-haas-grotesk-display mb-2 text-lg text-white group-hover:text-blue-400">
                      {work.title}
                    </h3>
                    <p className="noto-sans-jp-light mb-4 text-sm text-gray-400">
                      {work.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {work.technology.slice(0, 4).map(tech => (
                        <span key={tech} className="bg-gray-600 px-2 py-1 text-xs text-white">
                          {tech}
                        </span>
                      ))}
                      {work.technology.length > 4 && (
                        <span className="bg-gray-600 px-2 py-1 text-xs text-white">
                          +{work.technology.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 詳細情報 */}
                <div className="flex-1">
                  <div className="card">
                    <h3 className="neue-haas-grotesk-display mb-4 text-xl text-white">
                      {work.title}
                    </h3>
                    <p className="noto-sans-jp-regular mb-6 text-gray-300">{work.description}</p>

                    {/* 技術スタック */}
                    <div className="mb-6">
                      <h4 className="neue-haas-grotesk-display mb-3 text-sm text-white">
                        技術スタック
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {work.technology.map(tech => (
                          <span key={tech} className="bg-blue-600 px-3 py-1 text-xs text-white">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* リンク */}
                    <div className="flex flex-wrap gap-3">
                      {work.repository && (
                        <a
                          href={work.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600"
                        >
                          <Github size={16} />
                          GitHub
                        </a>
                      )}
                      {work.demo && (
                        <a
                          href={work.demo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
                        >
                          <ExternalLink size={16} />
                          Demo
                        </a>
                      )}
                      {work.previewVideo && (
                        <a
                          href={work.previewVideo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
                        >
                          <Play size={16} />
                          Preview
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Load More */}
        <section className="py-8 text-center">
          <button className="bg-blue-600 px-8 py-3 text-white transition-colors hover:bg-blue-700">
            さらに読み込む
          </button>
        </section>

        {/* Navigation */}
        <section className="py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/02_portfolio"
              className="neue-haas-grotesk-display text-lg text-blue-400 hover:text-blue-300"
            >
              ← Portfolio
            </Link>
            <div className="flex gap-4">
              <Link
                href="/02_portfolio/gallery/all"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                All Works →
              </Link>
              <Link
                href="/02_portfolio/gallery/video"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Video →
              </Link>
              <Link
                href="/02_portfolio/gallery/video-design"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Video & Design →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
